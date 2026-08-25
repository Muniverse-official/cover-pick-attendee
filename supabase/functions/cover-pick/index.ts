import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const ALLOWED_ORIGINS = new Set([
  "https://muniverse-official.github.io",
  "http://localhost:5173",
  "http://127.0.0.1:5173"
]);
const RECORDING_DATE = "2026-09-14";
const CONSENT_VERSION = "fans-pick-attendee-2026-08-v2";
const SESSION_TTL_MS = 15 * 60 * 1000;
const VERIFY_LIMIT = 8;
const SUBMIT_LIMIT = 5;
const BURST_LIMIT = 30;
const RATE_WINDOW_MS = 10 * 60 * 1000;
const BURST_WINDOW_MS = 60 * 1000;
const MAX_BODY_BYTES = 16_384;
const DEFAULT_APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbx6OzyBhI0OdrTYoRz7b71SsBVpAO1x3hlcMLshIXg__PcpaEDaTL5OSGuKOiBxfnYB/exec";

function headers(req: Request, extra: Record<string, string> = {}) {
  const origin = req.headers.get("origin") || "";
  const base: Record<string, string> = {
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "content-type, x-cover-pick-request, x-request-id",
    "Access-Control-Max-Age": "86400",
    "Cache-Control": "no-store, max-age=0",
    "Content-Type": "application/json; charset=utf-8",
    "Cross-Origin-Resource-Policy": "same-site",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
    "Referrer-Policy": "no-referrer",
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Vary": "Origin"
  };
  if (ALLOWED_ORIGINS.has(origin)) base["Access-Control-Allow-Origin"] = origin;
  return { ...base, ...extra };
}

function json(req: Request, body: unknown, status = 200, extra: Record<string, string> = {}) {
  return new Response(JSON.stringify(body), { status, headers: headers(req, extra) });
}

function clean(value: unknown, max = 300) {
  return String(value ?? "").trim().slice(0, max);
}
function normalizeEmail(value: unknown) {
  return clean(value, 254).normalize("NFKC").toLowerCase();
}
function normalizeNickname(value: unknown) {
  return clean(value, 80).normalize("NFKC").replace(/\s+/g, " ").toLowerCase();
}
function validEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}
function validNationality(value: string) {
  return value === "KR" || (/^[A-Z]{2}$/.test(value) && value !== "KR");
}
function validPhone(value: string) {
  return /^010-\d{4}-\d{4}$/.test(value) || /^\+\d{8,15}$/.test(value);
}
function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function sha256Hex(value: string) {
  const digest = new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value)));
  return [...digest].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}
function randomToken() {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}
function clientIp(req: Request) {
  const forwarded = req.headers.get("x-forwarded-for") || "";
  return (forwarded ? forwarded.split(",")[0] : req.headers.get("cf-connecting-ip") || req.headers.get("x-real-ip") || "unknown").trim().slice(0, 120);
}
async function fingerprints(req: Request) {
  const salt = Deno.env.get("RATE_LIMIT_SALT") || Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "fans-pick";
  const ip = clientIp(req);
  const ua = clean(req.headers.get("user-agent") || "unknown", 500);
  return {
    ipHash: await sha256Hex(`${salt}:ip:${ip}`),
    uaHash: await sha256Hex(`${salt}:ua:${ua}`)
  };
}
function service() {
  const base = Deno.env.get("SUPABASE_URL");
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!base || !key) throw new Error("SUPABASE_ENV_MISSING");
  return { base, key };
}
async function db(path: string, init: RequestInit = {}) {
  const { base, key } = service();
  const requestHeaders = new Headers(init.headers || {});
  requestHeaders.set("apikey", key);
  requestHeaders.set("authorization", `Bearer ${key}`);
  if (init.body && !requestHeaders.has("content-type")) requestHeaders.set("content-type", "application/json");
  return await fetch(`${base}/rest/v1/${path}`, { ...init, headers: requestHeaders });
}
async function dbJson(path: string, init: RequestInit = {}) {
  const response = await db(path, init);
  const text = await response.text();
  if (!response.ok) throw new Error(`DB_${response.status}:${text.slice(0, 400)}`);
  if (!text) return null;
  try { return JSON.parse(text); } catch { return text; }
}
async function audit(event: string, metadata: Record<string, unknown> = {}) {
  try {
    await db("cover_pick_audit_log", {
      method: "POST",
      headers: { prefer: "return=minimal" },
      body: JSON.stringify({ event, metadata })
    });
  } catch (_) {}
}
async function recordRate(ipHash: string, action: string, success: boolean) {
  try {
    await db("cover_pick_rate_limits", {
      method: "POST",
      headers: { prefer: "return=minimal" },
      body: JSON.stringify({ ip_hash: ipHash, action, success })
    });
  } catch (_) {}
}
async function rateExceeded(ipHash: string, action: string, limit: number, windowMs = RATE_WINDOW_MS) {
  const since = new Date(Date.now() - windowMs).toISOString();
  const query = new URLSearchParams({ select: "id", ip_hash: `eq.${ipHash}`, action: `eq.${action}`, created_at: `gte.${since}`, limit: String(limit + 1) });
  const rows = await dbJson(`cover_pick_rate_limits?${query.toString()}`);
  return Array.isArray(rows) && rows.length >= limit;
}
async function burstExceeded(ipHash: string) {
  const since = new Date(Date.now() - BURST_WINDOW_MS).toISOString();
  const query = new URLSearchParams({ select: "id", ip_hash: `eq.${ipHash}`, created_at: `gte.${since}`, limit: String(BURST_LIMIT + 1) });
  const rows = await dbJson(`cover_pick_rate_limits?${query.toString()}`);
  return Array.isArray(rows) && rows.length >= BURST_LIMIT;
}
function ageOnRecordingDate(birth: string) {
  const b = birth.split("-").map(Number);
  const e = RECORDING_DATE.split("-").map(Number);
  if (b.length !== 3 || [...b, ...e].some((value) => !Number.isFinite(value))) return NaN;
  let age = e[0] - b[0];
  if (e[1] < b[1] || (e[1] === b[1] && e[2] < b[2])) age--;
  return age;
}
async function getWinner(email: string, nickname: string) {
  const identityHash = await sha256Hex(`${email}\n${nickname}`);
  const query = new URLSearchParams({ select: "id,submitted", identity_hash: `eq.${identityHash}`, limit: "1" });
  const rows = await dbJson(`cover_pick_winners?${query.toString()}`);
  return Array.isArray(rows) && rows.length ? rows[0] : null;
}
async function getSession(tokenHash: string) {
  const query = new URLSearchParams({ select: "id,winner_id,expires_at,used,ip_hash,user_agent_hash", token_hash: `eq.${tokenHash}`, limit: "1" });
  const rows = await dbJson(`cover_pick_verification_sessions?${query.toString()}`);
  return Array.isArray(rows) && rows.length ? rows[0] : null;
}
async function hasAttendee(winnerId: string) {
  const query = new URLSearchParams({ select: "id", winner_id: `eq.${winnerId}`, limit: "1" });
  const rows = await dbJson(`cover_pick_attendees?${query.toString()}`);
  return Array.isArray(rows) && rows.length > 0;
}
async function callAppsScript(payload: Record<string, unknown>) {
  const token = Deno.env.get("FANS_PICK_WEBHOOK_TOKEN") || Deno.env.get("COVER_PICK_WEBHOOK_TOKEN");
  if (!token) return { ok: false, skipped: true, sheetUpdated: false, emailSent: false };
  const url = Deno.env.get("ATTENDEE_APPS_SCRIPT_URL") || DEFAULT_APPS_SCRIPT_URL;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ version: 5, ts: String(Date.now()), nonce: crypto.randomUUID(), token, kind: "cover_pick", payload }),
    redirect: "follow"
  });
  const text = await response.text();
  let data: Record<string, unknown> = {};
  try { data = JSON.parse(text); } catch {}
  return {
    ok: response.ok && data.ok === true,
    skipped: false,
    sheetUpdated: data.sheetUpdated === true,
    emailSent: data.emailSent === true,
    status: response.status,
    responseText: text.slice(0, 500)
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: headers(req) });
  if (req.method !== "POST") return json(req, { ok: false, code: "METHOD_NOT_ALLOWED" }, 405);

  const origin = req.headers.get("origin") || "";
  if (origin && !ALLOWED_ORIGINS.has(origin)) return json(req, { ok: false, code: "ORIGIN_DENIED" }, 403);
  if (req.headers.get("x-cover-pick-request") !== "1") return json(req, { ok: false, code: "BAD_REQUEST" }, 403);

  let body: Record<string, unknown>;
  try {
    const raw = await req.text();
    if (new TextEncoder().encode(raw).byteLength > MAX_BODY_BYTES) return json(req, { ok: false, code: "PAYLOAD_TOO_LARGE" }, 413);
    body = JSON.parse(raw);
  } catch {
    return json(req, { ok: false, code: "INVALID_JSON" }, 400);
  }

  const { ipHash, uaHash } = await fingerprints(req);
  const requestId = clean(req.headers.get("x-request-id") || crypto.randomUUID(), 80);
  const action = new URL(req.url).searchParams.get("action") || "";

  try {
    if (await burstExceeded(ipHash)) {
      await audit("burst_rate_limited", { request_id: requestId, action });
      return json(req, { ok: false, code: "RATE_LIMITED" }, 429, { "Retry-After": "60" });
    }
    if (clean(body.website, 200)) {
      await recordRate(ipHash, action || "trap", false);
      await audit("honeypot_triggered", { request_id: requestId, action });
      await delay(450);
      return json(req, { ok: false, code: "IDENTITY_MISMATCH" }, 404);
    }

    if (action === "verify") {
      if (await rateExceeded(ipHash, "verify", VERIFY_LIMIT)) {
        await audit("verify_rate_limited", { request_id: requestId });
        return json(req, { ok: false, code: "RATE_LIMITED" }, 429, { "Retry-After": "600" });
      }
      const email = normalizeEmail(body.email);
      const nickname = normalizeNickname(body.nickname);
      if (body.privacy_consent !== true) {
        await recordRate(ipHash, "verify", false);
        return json(req, { ok: false, code: "CONSENT_REQUIRED" }, 400);
      }
      if (!email || !nickname || !validEmail(email)) {
        await recordRate(ipHash, "verify", false);
        return json(req, { ok: false, code: "MISSING_FIELDS" }, 400);
      }

      const winner = await getWinner(email, nickname);
      if (!winner) {
        await recordRate(ipHash, "verify", false);
        await audit("winner_verify_failed", { request_id: requestId, reason: "identity_mismatch" });
        await delay(250 + Math.floor(Math.random() * 250));
        return json(req, { ok: false, code: "IDENTITY_MISMATCH" }, 404);
      }
      if (winner.submitted === true || await hasAttendee(winner.id)) {
        await recordRate(ipHash, "verify", true);
        return json(req, { ok: false, code: "ALREADY_SUBMITTED" }, 409);
      }

      const token = randomToken();
      const tokenHash = await sha256Hex(token);
      const expiresAt = new Date(Date.now() + SESSION_TTL_MS).toISOString();
      await dbJson("cover_pick_verification_sessions", {
        method: "POST",
        headers: { prefer: "return=minimal" },
        body: JSON.stringify({ winner_id: winner.id, stage: "identity_verified", token_hash: tokenHash, expires_at: expiresAt, used: false, ip_hash: ipHash, user_agent_hash: uaHash })
      });
      await recordRate(ipHash, "verify", true);
      await audit("winner_verify_success", { request_id: requestId, session_ttl_minutes: 15 });
      return json(req, { ok: true, verificationToken: token, token, eventDate: RECORDING_DATE, expiresAt });
    }

    if (action === "submit") {
      if (await rateExceeded(ipHash, "submit", SUBMIT_LIMIT)) {
        await audit("submit_rate_limited", { request_id: requestId });
        return json(req, { ok: false, code: "RATE_LIMITED" }, 429, { "Retry-After": "600" });
      }
      if (body.privacy_consent !== true) {
        await recordRate(ipHash, "submit", false);
        return json(req, { ok: false, code: "CONSENT_REQUIRED" }, 400);
      }
      const token = clean(body.verification_token || body.token, 200);
      const payload = {
        account_email: normalizeEmail(body.account_email),
        muniverse_nickname: clean(body.muniverse_nickname, 80),
        name: clean(body.name, 100),
        nationality: clean(body.nationality, 2).toUpperCase(),
        birth_date: clean(body.birth_date, 10),
        phone: clean(body.phone, 40),
        contact_email: normalizeEmail(body.contact_email)
      };
      if (!token || Object.values(payload).some((value) => !value)) {
        await recordRate(ipHash, "submit", false);
        return json(req, { ok: false, code: "MISSING_FIELDS" }, 400);
      }
      if (!validEmail(payload.account_email) || !validEmail(payload.contact_email) || !validNationality(payload.nationality) || !validPhone(payload.phone)) {
        await recordRate(ipHash, "submit", false);
        return json(req, { ok: false, code: "INVALID_FIELDS" }, 400);
      }
      const age = ageOnRecordingDate(payload.birth_date);
      if (!Number.isFinite(age) || age < 15) {
        await recordRate(ipHash, "submit", false);
        return json(req, { ok: false, code: "UNDER_15" }, 400);
      }

      const session = await getSession(await sha256Hex(token));
      if (!session || session.used === true || new Date(session.expires_at).getTime() <= Date.now() || session.ip_hash !== ipHash || session.user_agent_hash !== uaHash) {
        await recordRate(ipHash, "submit", false);
        return json(req, { ok: false, code: "SESSION_INVALID" }, 401);
      }
      const winner = await getWinner(normalizeEmail(payload.account_email), normalizeNickname(payload.muniverse_nickname));
      if (!winner || winner.id !== session.winner_id) {
        await recordRate(ipHash, "submit", false);
        return json(req, { ok: false, code: "SESSION_INVALID" }, 401);
      }
      if (winner.submitted === true || await hasAttendee(winner.id)) {
        await recordRate(ipHash, "submit", true);
        return json(req, { ok: false, code: "ALREADY_SUBMITTED" }, 409);
      }

      const now = new Date().toISOString();
      const attendeeResponse = await db("cover_pick_attendees", {
        method: "POST",
        headers: { prefer: "return=minimal" },
        body: JSON.stringify({
          winner_id: winner.id,
          ...payload,
          consent_version: CONSENT_VERSION,
          consented_at: now
        })
      });
      if (attendeeResponse.status === 409) return json(req, { ok: false, code: "ALREADY_SUBMITTED" }, 409);
      if (!attendeeResponse.ok) throw new Error(`ATTENDEE_INSERT_FAILED:${(await attendeeResponse.text()).slice(0, 300)}`);

      await dbJson(`cover_pick_winners?id=eq.${winner.id}`, { method: "PATCH", headers: { prefer: "return=minimal" }, body: JSON.stringify({ submitted: true, submitted_at: now }) });
      await dbJson(`cover_pick_verification_sessions?id=eq.${session.id}`, { method: "PATCH", headers: { prefer: "return=minimal" }, body: JSON.stringify({ used: true }) });

      let hook: Record<string, unknown> = { ok: false, skipped: true, sheetUpdated: false, emailSent: false };
      try {
        hook = await callAppsScript({ ...payload, age, event_date: RECORDING_DATE, idempotency_key: `fans_pick:${winner.id}` });
      } catch (error) {
        await audit("apps_script_unreachable", { request_id: requestId, message: String(error).slice(0, 300) });
      }

      await recordRate(ipHash, "submit", true);
      await audit("attendee_registration_success", {
        request_id: requestId,
        consent_version: CONSENT_VERSION,
        sheet_updated: hook.sheetUpdated === true,
        email_sent: hook.emailSent === true,
        hook_skipped: hook.skipped === true
      });
      return json(req, { ok: true, registered: true, eventDate: RECORDING_DATE, sheetUpdated: hook.sheetUpdated === true, emailSent: hook.emailSent === true });
    }

    return json(req, { ok: false, code: "NOT_FOUND" }, 404);
  } catch (error) {
    await audit("server_error", { request_id: requestId, action, message: String(error).slice(0, 500) });
    return json(req, { ok: false, code: "SERVER_ERROR" }, 500);
  }
});
