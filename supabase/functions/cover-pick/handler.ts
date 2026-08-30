import "jsr:@supabase/functions-js/edge-runtime.d.ts";

type JsonRecord = Record<string, unknown>;

const PROD_ORIGIN = "https://muniverse-official.github.io";
const LOCAL_ORIGINS = new Set(["http://localhost:5173", "http://127.0.0.1:5173"]);
const RECORDING_DATE = "2026-09-14";
const CONSENT_VERSION = "fans-pick-attendee-2026-08-v3";
const SESSION_TTL_MS = 15 * 60 * 1000;
const RATE_WINDOW_MS = 10 * 60 * 1000;
const BURST_WINDOW_MS = 60 * 1000;
const VERIFY_LIMIT = 8;
const VERIFY_EMAIL_LIMIT = 12;
const VERIFY_IDENTITY_LIMIT = 4;
const SUBMIT_LIMIT = 5;
const BURST_LIMIT = 30;
const GLOBAL_VERIFY_LIMIT = 180;
const GLOBAL_SUBMIT_LIMIT = 60;
const MAX_BODY_BYTES = 16_384;
const TOKEN_PATTERN = /^[A-Za-z0-9_-]{43}$/;
const CONTROL_PATTERN = /[\u0000-\u001f\u007f]/u;

function allowLocalDev() {
  return Deno.env.get("ALLOW_LOCAL_DEV") === "true";
}
function allowedOrigin(origin: string) {
  return origin === PROD_ORIGIN || (allowLocalDev() && LOCAL_ORIGINS.has(origin));
}
function responseHeaders(req: Request, extra: Record<string, string> = {}) {
  const origin = req.headers.get("origin") || "";
  const headers: Record<string, string> = {
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "content-type, x-cover-pick-request, x-request-id",
    "Access-Control-Max-Age": "86400",
    "Cache-Control": "no-store, max-age=0",
    "Content-Type": "application/json; charset=utf-8",
    "Cross-Origin-Resource-Policy": "same-site",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
    "Referrer-Policy": "no-referrer",
    "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Vary": "Origin"
  };
  if (allowedOrigin(origin)) headers["Access-Control-Allow-Origin"] = origin;
  return { ...headers, ...extra };
}
function json(req: Request, body: unknown, status = 200, extra: Record<string, string> = {}) {
  return new Response(JSON.stringify(body), { status, headers: responseHeaders(req, extra) });
}
function isRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
function rawString(body: JsonRecord, key: string, max: number, required = true) {
  const value = body[key];
  if (value === undefined && !required) return "";
  if (typeof value !== "string") return null;
  const normalized = value.normalize("NFKC").trim();
  if ((required && !normalized) || normalized.length > max || CONTROL_PATTERN.test(normalized)) return null;
  return normalized;
}
function normalizeEmail(value: string) {
  return value.normalize("NFKC").trim().toLowerCase();
}
function normalizeNicknameDisplay(value: string) {
  return value.normalize("NFKC").trim().replace(/\s+/gu, " ");
}
function normalizeNickname(value: string) {
  return normalizeNicknameDisplay(value).toLowerCase();
}
function validEmail(value: string) {
  return value.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}
function validNationality(value: string) {
  return /^[A-Z]{2}$/.test(value);
}
function validPhone(value: string) {
  return /^010-\d{4}-\d{4}$/.test(value) || /^\+\d{8,15}$/.test(value);
}
function validCalendarDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const parsed = new Date(Date.UTC(year, month - 1, day));
  return parsed.getUTCFullYear() === year && parsed.getUTCMonth() === month - 1 && parsed.getUTCDate() === day;
}
function ageOnRecordingDate(birth: string) {
  if (!validCalendarDate(birth)) return NaN;
  const [birthYear, birthMonth, birthDay] = birth.split("-").map(Number);
  const [eventYear, eventMonth, eventDay] = RECORDING_DATE.split("-").map(Number);
  let age = eventYear - birthYear;
  if (eventMonth < birthMonth || (eventMonth === birthMonth && eventDay < birthDay)) age--;
  return age;
}
function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
async function equalizeIdentityResponse(startedAt: number) {
  const target = 550 + Math.floor(Math.random() * 250);
  const remaining = target - (Date.now() - startedAt);
  if (remaining > 0) await delay(remaining);
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
  const cloudflare = req.headers.get("cf-connecting-ip")?.trim();
  if (cloudflare) return cloudflare.slice(0, 120);
  const real = req.headers.get("x-real-ip")?.trim();
  if (real) return real.slice(0, 120);
  const forwarded = req.headers.get("x-forwarded-for") || "";
  const proxyAppended = forwarded.split(",").map((part) => part.trim()).filter(Boolean).at(-1);
  return (proxyAppended || "unknown").slice(0, 120);
}
async function fingerprints(req: Request) {
  const salt = Deno.env.get("RATE_LIMIT_SALT") || Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "fans-pick";
  const ip = clientIp(req);
  const userAgent = (req.headers.get("user-agent") || "unknown").slice(0, 500);
  return {
    ipHash: await sha256Hex(`${salt}:ip:${ip}`),
    uaHash: await sha256Hex(`${salt}:ua:${userAgent}`),
    rateSalt: salt
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
  const headers = new Headers(init.headers || {});
  headers.set("apikey", key);
  headers.set("authorization", `Bearer ${key}`);
  if (init.body && !headers.has("content-type")) headers.set("content-type", "application/json");
  return await fetch(`${base}/rest/v1/${path}`, { ...init, headers });
}
async function dbJson(path: string, init: RequestInit = {}) {
  const response = await db(path, init);
  const text = await response.text();
  if (!response.ok) throw new Error(`DB_${response.status}:${text.slice(0, 400)}`);
  if (!text) return null;
  try { return JSON.parse(text); } catch { return text; }
}
async function audit(event: string, metadata: JsonRecord = {}) {
  try {
    await db("cover_pick_audit_log", {
      method: "POST",
      headers: { prefer: "return=minimal" },
      body: JSON.stringify({ event, metadata })
    });
  } catch (_) {}
}
async function recordRate(rateKey: string, action: string, success: boolean) {
  try {
    await db("cover_pick_rate_limits", {
      method: "POST",
      headers: { prefer: "return=minimal" },
      body: JSON.stringify({ ip_hash: rateKey, action, success })
    });
  } catch (_) {}
}
async function rateExceeded(rateKey: string, action: string, limit: number, windowMs = RATE_WINDOW_MS) {
  const since = new Date(Date.now() - windowMs).toISOString();
  const query = new URLSearchParams({
    select: "id",
    ip_hash: `eq.${rateKey}`,
    action: `eq.${action}`,
    created_at: `gte.${since}`,
    limit: String(limit + 1)
  });
  const rows = await dbJson(`cover_pick_rate_limits?${query.toString()}`);
  return Array.isArray(rows) && rows.length >= limit;
}
async function globalRateExceeded(action: string, limit: number, windowMs = BURST_WINDOW_MS) {
  const since = new Date(Date.now() - windowMs).toISOString();
  const query = new URLSearchParams({ select: "id", action: `eq.${action}`, created_at: `gte.${since}`, limit: String(limit + 1) });
  const rows = await dbJson(`cover_pick_rate_limits?${query.toString()}`);
  return Array.isArray(rows) && rows.length >= limit;
}
async function burstExceeded(ipHash: string) {
  const since = new Date(Date.now() - BURST_WINDOW_MS).toISOString();
  const query = new URLSearchParams({ select: "id", ip_hash: `eq.${ipHash}`, created_at: `gte.${since}`, limit: String(BURST_LIMIT + 1) });
  const rows = await dbJson(`cover_pick_rate_limits?${query.toString()}`);
  return Array.isArray(rows) && rows.length >= BURST_LIMIT;
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
async function invalidateOpenSessions(winnerId: string) {
  await dbJson(`cover_pick_verification_sessions?winner_id=eq.${winnerId}&used=eq.false`, {
    method: "PATCH",
    headers: { prefer: "return=minimal" },
    body: JSON.stringify({ used: true })
  });
}
async function runtimeConfig() {
  const rows = await dbJson("cover_pick_runtime_config?select=key,value&key=in.(webhook_token,apps_script_url)");
  const config: Record<string, string> = {};
  if (Array.isArray(rows)) {
    for (const row of rows) {
      if (row && typeof row.key === "string" && typeof row.value === "string") config[row.key] = row.value;
    }
  }
  return config;
}
function safeOutboundText(value: string) {
  const singleLine = value.replace(/[\r\n]+/g, " ");
  return /^[=+\-@]/.test(singleLine) ? `'${singleLine}` : singleLine;
}
async function callAppsScript(payload: Record<string, unknown>) {
  const config = await runtimeConfig();
  const token = Deno.env.get("FANS_PICK_WEBHOOK_TOKEN") || Deno.env.get("COVER_PICK_WEBHOOK_TOKEN") || config.webhook_token;
  const url = Deno.env.get("ATTENDEE_APPS_SCRIPT_URL") || config.apps_script_url;
  if (!token || !url) return { ok: false, skipped: true, sheetUpdated: false, emailSent: false };
  const outbound = {
    ...payload,
    account_email: safeOutboundText(String(payload.account_email || "")),
    muniverse_nickname: safeOutboundText(String(payload.muniverse_nickname || "")),
    name: safeOutboundText(String(payload.name || "")),
    phone: safeOutboundText(String(payload.phone || "")),
    contact_email: safeOutboundText(String(payload.contact_email || ""))
  };
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ version: 3, ts: String(Date.now()), nonce: crypto.randomUUID(), token, payload: outbound }),
    redirect: "follow",
    signal: AbortSignal.timeout(10_000)
  });
  const text = await response.text();
  let data: JsonRecord = {};
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
function requestId(req: Request) {
  const raw = req.headers.get("x-request-id") || crypto.randomUUID();
  return raw.replace(/[^A-Za-z0-9._:-]/g, "").slice(0, 80) || crypto.randomUUID();
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    const origin = req.headers.get("origin") || "";
    if (!allowedOrigin(origin)) return json(req, { ok: false, code: "ORIGIN_DENIED" }, 403);
    return new Response(null, { status: 204, headers: responseHeaders(req) });
  }
  if (req.method !== "POST") return json(req, { ok: false, code: "METHOD_NOT_ALLOWED" }, 405);

  const origin = req.headers.get("origin") || "";
  if (!allowedOrigin(origin)) return json(req, { ok: false, code: "ORIGIN_DENIED" }, 403);
  if (req.headers.get("x-cover-pick-request")?.trim() !== "1") return json(req, { ok: false, code: "BAD_REQUEST" }, 403);
  const contentType = (req.headers.get("content-type") || "").toLowerCase();
  if (!contentType.startsWith("application/json")) return json(req, { ok: false, code: "UNSUPPORTED_MEDIA_TYPE" }, 415);

  let body: JsonRecord;
  try {
    const raw = await req.text();
    if (new TextEncoder().encode(raw).byteLength > MAX_BODY_BYTES) return json(req, { ok: false, code: "PAYLOAD_TOO_LARGE" }, 413);
    const parsed = JSON.parse(raw);
    if (!isRecord(parsed)) return json(req, { ok: false, code: "INVALID_JSON" }, 400);
    body = parsed;
  } catch {
    return json(req, { ok: false, code: "INVALID_JSON" }, 400);
  }

  const website = rawString(body, "website", 200, false);
  if (website === null) return json(req, { ok: false, code: "INVALID_FIELDS" }, 400);

  const { ipHash, uaHash, rateSalt } = await fingerprints(req);
  const rid = requestId(req);
  const action = new URL(req.url).searchParams.get("action") || "";

  try {
    if (await burstExceeded(ipHash)) {
      await audit("burst_rate_limited", { request_id: rid, action });
      return json(req, { ok: false, code: "RATE_LIMITED" }, 429, { "Retry-After": "60" });
    }
    if (website) {
      await recordRate(ipHash, action || "trap", false);
      await audit("honeypot_triggered", { request_id: rid, action });
      await delay(450);
      return json(req, { ok: false, code: "IDENTITY_MISMATCH" }, 404);
    }

    if (action === "verify") {
      if (await globalRateExceeded("verify", GLOBAL_VERIFY_LIMIT) || await rateExceeded(ipHash, "verify", VERIFY_LIMIT)) {
        await audit("verify_rate_limited", { request_id: rid, scope: "ip_or_global" });
        return json(req, { ok: false, code: "RATE_LIMITED" }, 429, { "Retry-After": "600" });
      }
      if (body.privacy_consent !== true) {
        await recordRate(ipHash, "verify", false);
        return json(req, { ok: false, code: "CONSENT_REQUIRED" }, 400);
      }
      const emailRaw = rawString(body, "email", 254);
      const nicknameRaw = rawString(body, "nickname", 80);
      if (emailRaw === null || nicknameRaw === null) {
        await recordRate(ipHash, "verify", false);
        return json(req, { ok: false, code: "MISSING_FIELDS" }, 400);
      }
      const email = normalizeEmail(emailRaw);
      const nickname = normalizeNickname(nicknameRaw);
      if (!validEmail(email)) {
        await recordRate(ipHash, "verify", false);
        return json(req, { ok: false, code: "MISSING_FIELDS" }, 400);
      }

      const identityKey = await sha256Hex(`${rateSalt}:verify-identity:${email}\n${nickname}`);
      const emailKey = await sha256Hex(`${rateSalt}:verify-email:${email}`);
      if (await rateExceeded(identityKey, "verify_identity", VERIFY_IDENTITY_LIMIT) || await rateExceeded(emailKey, "verify_email", VERIFY_EMAIL_LIMIT)) {
        await audit("verify_rate_limited", { request_id: rid, scope: "identity_or_email" });
        return json(req, { ok: false, code: "RATE_LIMITED" }, 429, { "Retry-After": "600" });
      }

      const startedAt = Date.now();
      const winner = await getWinner(email, nickname);
      const success = Boolean(winner);
      await Promise.all([
        recordRate(ipHash, "verify", success),
        recordRate(identityKey, "verify_identity", success),
        recordRate(emailKey, "verify_email", success)
      ]);

      if (!winner) {
        await audit("winner_verify_failed", { request_id: rid, reason: "identity_mismatch" });
        await equalizeIdentityResponse(startedAt);
        return json(req, { ok: false, code: "IDENTITY_MISMATCH" }, 404);
      }
      if (winner.submitted === true || await hasAttendee(winner.id)) {
        await equalizeIdentityResponse(startedAt);
        return json(req, { ok: false, code: "ALREADY_SUBMITTED" }, 409);
      }

      await invalidateOpenSessions(winner.id);
      const token = randomToken();
      const tokenHash = await sha256Hex(token);
      const expiresAt = new Date(Date.now() + SESSION_TTL_MS).toISOString();
      await dbJson("cover_pick_verification_sessions", {
        method: "POST",
        headers: { prefer: "return=minimal" },
        body: JSON.stringify({
          winner_id: winner.id,
          stage: "identity_verified",
          token_hash: tokenHash,
          expires_at: expiresAt,
          used: false,
          ip_hash: ipHash,
          user_agent_hash: uaHash
        })
      });
      await audit("winner_verify_success", { request_id: rid, session_ttl_minutes: 15 });
      await equalizeIdentityResponse(startedAt);
      return json(req, { ok: true, verificationToken: token, token, eventDate: RECORDING_DATE, expiresAt });
    }

    if (action === "submit") {
      if (await globalRateExceeded("submit", GLOBAL_SUBMIT_LIMIT) || await rateExceeded(ipHash, "submit", SUBMIT_LIMIT)) {
        await audit("submit_rate_limited", { request_id: rid });
        return json(req, { ok: false, code: "RATE_LIMITED" }, 429, { "Retry-After": "600" });
      }
      if (body.privacy_consent !== true) {
        await recordRate(ipHash, "submit", false);
        return json(req, { ok: false, code: "CONSENT_REQUIRED" }, 400);
      }

      const tokenRaw = rawString(body, "verification_token", 80) || rawString(body, "token", 80);
      const accountEmailRaw = rawString(body, "account_email", 254);
      const nicknameRaw = rawString(body, "muniverse_nickname", 80);
      const name = rawString(body, "name", 100);
      const nationalityRaw = rawString(body, "nationality", 2);
      const birthDate = rawString(body, "birth_date", 10);
      const phone = rawString(body, "phone", 40);
      const contactEmailRaw = rawString(body, "contact_email", 254);

      if ([tokenRaw, accountEmailRaw, nicknameRaw, name, nationalityRaw, birthDate, phone, contactEmailRaw].some((value) => value === null || value === "")) {
        await recordRate(ipHash, "submit", false);
        return json(req, { ok: false, code: "MISSING_FIELDS" }, 400);
      }

      const token = tokenRaw as string;
      const accountEmail = normalizeEmail(accountEmailRaw as string);
      const nicknameDisplay = normalizeNicknameDisplay(nicknameRaw as string);
      const nickname = normalizeNickname(nicknameRaw as string);
      const nationality = (nationalityRaw as string).toUpperCase();
      const contactEmail = normalizeEmail(contactEmailRaw as string);
      const age = ageOnRecordingDate(birthDate as string);

      if (
        !TOKEN_PATTERN.test(token) ||
        !validEmail(accountEmail) ||
        !validEmail(contactEmail) ||
        !validNationality(nationality) ||
        !validPhone(phone as string) ||
        !validCalendarDate(birthDate as string) ||
        !Number.isFinite(age) ||
        age > 120
      ) {
        await recordRate(ipHash, "submit", false);
        return json(req, { ok: false, code: "INVALID_FIELDS" }, 400);
      }
      if (age < 15) {
        await recordRate(ipHash, "submit", false);
        return json(req, { ok: false, code: "UNDER_15" }, 400);
      }

      const session = await getSession(await sha256Hex(token));
      if (
        !session ||
        session.used === true ||
        new Date(session.expires_at).getTime() <= Date.now() ||
        session.ip_hash !== ipHash ||
        session.user_agent_hash !== uaHash
      ) {
        await recordRate(ipHash, "submit", false);
        return json(req, { ok: false, code: "SESSION_INVALID" }, 401);
      }

      const winner = await getWinner(accountEmail, nickname);
      if (!winner || winner.id !== session.winner_id) {
        await recordRate(ipHash, "submit", false);
        return json(req, { ok: false, code: "SESSION_INVALID" }, 401);
      }
      if (winner.submitted === true || await hasAttendee(winner.id)) {
        await recordRate(ipHash, "submit", true);
        return json(req, { ok: false, code: "ALREADY_SUBMITTED" }, 409);
      }

      const now = new Date().toISOString();
      const payload = {
        account_email: accountEmail,
        muniverse_nickname: nicknameDisplay,
        name: name as string,
        nationality,
        birth_date: birthDate as string,
        phone: phone as string,
        contact_email: contactEmail
      };
      const attendeeResponse = await db("cover_pick_attendees", {
        method: "POST",
        headers: { prefer: "return=minimal" },
        body: JSON.stringify({ winner_id: winner.id, ...payload, consent_version: CONSENT_VERSION, consented_at: now })
      });
      if (attendeeResponse.status === 409) return json(req, { ok: false, code: "ALREADY_SUBMITTED" }, 409);
      if (!attendeeResponse.ok) throw new Error(`ATTENDEE_INSERT_FAILED:${(await attendeeResponse.text()).slice(0, 300)}`);

      await dbJson(`cover_pick_winners?id=eq.${winner.id}`, {
        method: "PATCH",
        headers: { prefer: "return=minimal" },
        body: JSON.stringify({ submitted: true, submitted_at: now })
      });
      await dbJson(`cover_pick_verification_sessions?id=eq.${session.id}`, {
        method: "PATCH",
        headers: { prefer: "return=minimal" },
        body: JSON.stringify({ used: true })
      });

      let hook: JsonRecord = { ok: false, skipped: true, sheetUpdated: false, emailSent: false };
      try {
        hook = await callAppsScript({ ...payload, age, event_date: RECORDING_DATE, idempotency_key: `fans_pick:${winner.id}` });
      } catch (error) {
        await audit("apps_script_unreachable", { request_id: rid, message: String(error).slice(0, 300) });
      }

      await recordRate(ipHash, "submit", true);
      await audit("attendee_registration_success", {
        request_id: rid,
        consent_version: CONSENT_VERSION,
        sheet_updated: hook.sheetUpdated === true,
        email_sent: hook.emailSent === true,
        hook_skipped: hook.skipped === true
      });
      return json(req, {
        ok: true,
        registered: true,
        eventDate: RECORDING_DATE,
        sheetUpdated: hook.sheetUpdated === true,
        emailSent: hook.emailSent === true
      });
    }

    return json(req, { ok: false, code: "NOT_FOUND" }, 404);
  } catch (error) {
    await audit("server_error", { request_id: rid, action, message: String(error).slice(0, 500) });
    return json(req, { ok: false, code: "SERVER_ERROR" }, 500);
  }
});
