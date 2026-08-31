import "jsr:@supabase/functions-js/edge-runtime.d.ts";

type JsonRecord = Record<string, unknown>;
type TokenClaims = { v: number; sid: string; wid: string; exp: number; nonce: string };
type SessionRow = {
  id: string;
  winner_id: string;
  expires_at: string;
  used: boolean;
  ip_hash: string | null;
  user_agent_hash: string | null;
  account_email: string | null;
  muniverse_nickname: string | null;
  token_version: number | null;
  token_hash: string;
};
type WinnerRow = { id: string; submitted: boolean };

const PROD_ORIGIN = "https://muniverse-official.github.io";
const LOCAL_ORIGINS = new Set(["http://localhost:5173", "http://127.0.0.1:5173"]);
const RECORDING_DATE = "2026-09-14";
const CONSENT_VERSION = "fans-pick-attendee-2026-08-v4-split";
const RATE_WINDOW_MS = 10 * 60 * 1000;
const BURST_WINDOW_MS = 60 * 1000;
const SUBMIT_LIMIT = 5;
const SESSION_SUBMIT_LIMIT = 5;
const GLOBAL_SUBMIT_LIMIT = 60;
const MAX_BODY_BYTES = 16_384;
const TOKEN_VERSION = 2;
const CONTROL_PATTERN = /[\u0000-\u001f\u007f]/u;
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const BASE64URL_PATTERN = /^[A-Za-z0-9_-]+$/;

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
    "Cross-Origin-Resource-Policy": "cross-origin",
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

async function sha256Hex(value: string) {
  const digest = new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value)));
  return [...digest].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function base64UrlDecode(value: string) {
  if (!value || !BASE64URL_PATTERN.test(value)) throw new Error("TOKEN_ENCODING_INVALID");
  const padded = value.replace(/-/g, "+").replace(/_/g, "/") + "=".repeat((4 - value.length % 4) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index++) bytes[index] = binary.charCodeAt(index);
  return bytes;
}

function service() {
  const base = Deno.env.get("SUPABASE_URL");
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!base || !key) throw new Error("SUPABASE_ENV_MISSING");
  return { base, key };
}

function registrationSecret() {
  const explicit = Deno.env.get("FANS_PICK_REGISTRATION_SECRET");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const secret = explicit || serviceKey;
  if (!secret) throw new Error("REGISTRATION_SECRET_MISSING");
  return `fans-pick-registration-v${TOKEN_VERSION}:${secret}`;
}

async function verifyRegistrationToken(token: string): Promise<TokenClaims | null> {
  try {
    if (token.length < 80 || token.length > 512) return null;
    const parts = token.split(".");
    if (parts.length !== 2) return null;
    const [encodedPayload, encodedSignature] = parts;
    const signature = base64UrlDecode(encodedSignature);
    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(registrationSecret()),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );
    const valid = await crypto.subtle.verify(
      "HMAC",
      key,
      signature,
      new TextEncoder().encode(encodedPayload)
    );
    if (!valid) return null;

    const payloadText = new TextDecoder().decode(base64UrlDecode(encodedPayload));
    const parsed = JSON.parse(payloadText);
    if (!isRecord(parsed)) return null;
    const claims = parsed as unknown as TokenClaims;
    if (
      claims.v !== TOKEN_VERSION ||
      !UUID_PATTERN.test(claims.sid) ||
      !UUID_PATTERN.test(claims.wid) ||
      !Number.isInteger(claims.exp) ||
      claims.exp <= Math.floor(Date.now() / 1000) ||
      typeof claims.nonce !== "string" ||
      claims.nonce.length < 16 ||
      claims.nonce.length > 64 ||
      !BASE64URL_PATTERN.test(claims.nonce)
    ) return null;
    return claims;
  } catch {
    return null;
  }
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
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

async function audit(event: string, metadata: JsonRecord = {}) {
  try {
    await db("cover_pick_register_audit_log", {
      method: "POST",
      headers: { prefer: "return=minimal" },
      body: JSON.stringify({ event, metadata })
    });
  } catch (_) {}
}

async function recordRate(rateKey: string, action: string, success: boolean) {
  try {
    await db("cover_pick_register_rate_limits", {
      method: "POST",
      headers: { prefer: "return=minimal" },
      body: JSON.stringify({ rate_key: rateKey, action, success })
    });
  } catch (_) {}
}

async function rateExceeded(rateKey: string, action: string, limit: number, windowMs = RATE_WINDOW_MS) {
  const since = new Date(Date.now() - windowMs).toISOString();
  const query = new URLSearchParams({
    select: "id",
    rate_key: `eq.${rateKey}`,
    action: `eq.${action}`,
    created_at: `gte.${since}`,
    limit: String(limit + 1)
  });
  const rows = await dbJson(`cover_pick_register_rate_limits?${query.toString()}`);
  return Array.isArray(rows) && rows.length >= limit;
}

async function globalRateExceeded(action: string, limit: number, windowMs = BURST_WINDOW_MS) {
  const since = new Date(Date.now() - windowMs).toISOString();
  const query = new URLSearchParams({
    select: "id",
    action: `eq.${action}`,
    created_at: `gte.${since}`,
    limit: String(limit + 1)
  });
  const rows = await dbJson(`cover_pick_register_rate_limits?${query.toString()}`);
  return Array.isArray(rows) && rows.length >= limit;
}

async function getSession(sessionId: string, tokenHash: string): Promise<SessionRow | null> {
  const query = new URLSearchParams({
    select: "id,winner_id,expires_at,used,ip_hash,user_agent_hash,account_email,muniverse_nickname,token_version,token_hash",
    id: `eq.${sessionId}`,
    token_hash: `eq.${tokenHash}`,
    limit: "1"
  });
  const rows = await dbJson(`cover_pick_verification_sessions?${query.toString()}`);
  return Array.isArray(rows) && rows.length ? rows[0] as SessionRow : null;
}

async function getWinnerById(winnerId: string): Promise<WinnerRow | null> {
  const query = new URLSearchParams({ select: "id,submitted", id: `eq.${winnerId}`, limit: "1" });
  const rows = await dbJson(`cover_pick_winners?${query.toString()}`);
  return Array.isArray(rows) && rows.length ? rows[0] as WinnerRow : null;
}

async function hasAttendee(winnerId: string) {
  const query = new URLSearchParams({ select: "id", winner_id: `eq.${winnerId}`, limit: "1" });
  const rows = await dbJson(`cover_pick_attendees?${query.toString()}`);
  return Array.isArray(rows) && rows.length > 0;
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
  try {
    data = JSON.parse(text);
  } catch {}
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

  const tokenCandidate = rawString(body, "verification_token", 512, false) || rawString(body, "token", 512, false);
  if (!tokenCandidate) return json(req, { ok: false, code: "SESSION_INVALID" }, 401);

  // Invalid or forged requests are rejected cryptographically before any database access.
  const claims = await verifyRegistrationToken(tokenCandidate);
  if (!claims) return json(req, { ok: false, code: "SESSION_INVALID" }, 401);

  const { ipHash, uaHash, rateSalt } = await fingerprints(req);
  const rid = requestId(req);
  const sessionRateKey = await sha256Hex(`${rateSalt}:register-session:${claims.sid}`);

  try {
    if (
      await globalRateExceeded("submit", GLOBAL_SUBMIT_LIMIT) ||
      await rateExceeded(ipHash, "submit", SUBMIT_LIMIT) ||
      await rateExceeded(sessionRateKey, "submit_session", SESSION_SUBMIT_LIMIT)
    ) {
      await audit("submit_rate_limited", { request_id: rid, session_id: claims.sid });
      return json(req, { ok: false, code: "RATE_LIMITED" }, 429, { "Retry-After": "600" });
    }

    if (body.privacy_consent !== true) {
      await recordRate(ipHash, "submit", false);
      return json(req, { ok: false, code: "CONSENT_REQUIRED" }, 400);
    }

    const name = rawString(body, "name", 100);
    const nationalityRaw = rawString(body, "nationality", 2);
    const birthDate = rawString(body, "birth_date", 10);
    const phone = rawString(body, "phone", 40);
    const contactEmailRaw = rawString(body, "contact_email", 254);
    if ([name, nationalityRaw, birthDate, phone, contactEmailRaw].some((value) => value === null || value === "")) {
      await recordRate(ipHash, "submit", false);
      await recordRate(sessionRateKey, "submit_session", false);
      return json(req, { ok: false, code: "MISSING_FIELDS" }, 400);
    }

    const nationality = (nationalityRaw as string).toUpperCase();
    const contactEmail = normalizeEmail(contactEmailRaw as string);
    const age = ageOnRecordingDate(birthDate as string);
    if (
      !validEmail(contactEmail) ||
      !validNationality(nationality) ||
      !validPhone(phone as string) ||
      !validCalendarDate(birthDate as string) ||
      !Number.isFinite(age) ||
      age > 120
    ) {
      await recordRate(ipHash, "submit", false);
      await recordRate(sessionRateKey, "submit_session", false);
      return json(req, { ok: false, code: "INVALID_FIELDS" }, 400);
    }
    if (age < 15) {
      await recordRate(ipHash, "submit", false);
      await recordRate(sessionRateKey, "submit_session", false);
      return json(req, { ok: false, code: "UNDER_15" }, 400);
    }

    const tokenHash = await sha256Hex(tokenCandidate);
    const session = await getSession(claims.sid, tokenHash);
    if (
      !session ||
      session.winner_id !== claims.wid ||
      session.token_version !== TOKEN_VERSION ||
      session.used === true ||
      new Date(session.expires_at).getTime() <= Date.now() ||
      session.ip_hash !== ipHash ||
      session.user_agent_hash !== uaHash ||
      !session.account_email ||
      !session.muniverse_nickname ||
      !validEmail(session.account_email)
    ) {
      await recordRate(ipHash, "submit", false);
      await recordRate(sessionRateKey, "submit_session", false);
      return json(req, { ok: false, code: "SESSION_INVALID" }, 401);
    }

    const winner = await getWinnerById(session.winner_id);
    if (!winner) {
      await recordRate(ipHash, "submit", false);
      await recordRate(sessionRateKey, "submit_session", false);
      return json(req, { ok: false, code: "SESSION_INVALID" }, 401);
    }
    if (winner.submitted === true || await hasAttendee(winner.id)) {
      await recordRate(ipHash, "submit", true);
      await recordRate(sessionRateKey, "submit_session", true);
      return json(req, { ok: false, code: "ALREADY_SUBMITTED" }, 409);
    }

    const now = new Date().toISOString();
    const payload = {
      account_email: session.account_email,
      muniverse_nickname: session.muniverse_nickname,
      name: name as string,
      nationality,
      birth_date: birthDate as string,
      phone: phone as string,
      contact_email: contactEmail
    };

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
      hook = await callAppsScript({
        ...payload,
        age,
        event_date: RECORDING_DATE,
        idempotency_key: `fans_pick:${winner.id}`
      });
    } catch (error) {
      await audit("apps_script_unreachable", { request_id: rid, message: String(error).slice(0, 300) });
    }

    await recordRate(ipHash, "submit", true);
    await recordRate(sessionRateKey, "submit_session", true);
    await audit("attendee_registration_success", {
      request_id: rid,
      consent_version: CONSENT_VERSION,
      token_version: TOKEN_VERSION,
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
  } catch (error) {
    await audit("register_server_error", { request_id: rid, session_id: claims.sid, message: String(error).slice(0, 500) });
    return json(req, { ok: false, code: "SERVER_ERROR" }, 500);
  }
});
