import "jsr:@supabase/functions-js/edge-runtime.d.ts";

type JsonRecord = Record<string, unknown>;
type WinnerRow = { id: string; submitted: boolean };

const PROD_ORIGIN = "https://muniverse-official.github.io";
const LOCAL_ORIGINS = new Set(["http://localhost:5173", "http://127.0.0.1:5173"]);
const RECORDING_DATE = "2026-09-14";
const SESSION_TTL_MS = 15 * 60 * 1000;
const RATE_WINDOW_MS = 10 * 60 * 1000;
const BURST_WINDOW_MS = 60 * 1000;
const VERIFY_LIMIT = 8;
const VERIFY_EMAIL_LIMIT = 12;
const VERIFY_IDENTITY_LIMIT = 4;
const BURST_LIMIT = 30;
const GLOBAL_VERIFY_LIMIT = 180;
const MAX_BODY_BYTES = 16_384;
const TOKEN_VERSION = 2;
const CONTROL_PATTERN = /[\u0000-\u001f\u007f]/u;
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

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

function normalizeNicknameDisplay(value: string) {
  return value.normalize("NFKC").trim().replace(/\s+/gu, " ");
}

function normalizeNickname(value: string) {
  return normalizeNicknameDisplay(value).toLowerCase();
}

function validEmail(value: string) {
  return value.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
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

function base64UrlEncode(input: Uint8Array | string) {
  const bytes = typeof input === "string" ? new TextEncoder().encode(input) : input;
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function randomBase64Url(size = 18) {
  const bytes = new Uint8Array(size);
  crypto.getRandomValues(bytes);
  return base64UrlEncode(bytes);
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

async function hmacSign(payload: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(registrationSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = new Uint8Array(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload)));
  return base64UrlEncode(signature);
}

async function createRegistrationToken(sessionId: string, winnerId: string, expiresAt: string) {
  if (!UUID_PATTERN.test(sessionId) || !UUID_PATTERN.test(winnerId)) throw new Error("INVALID_TOKEN_CLAIMS");
  const payload = {
    v: TOKEN_VERSION,
    sid: sessionId,
    wid: winnerId,
    exp: Math.floor(new Date(expiresAt).getTime() / 1000),
    nonce: randomBase64Url(18)
  };
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  return `${encodedPayload}.${await hmacSign(encodedPayload)}`;
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
    await db("cover_pick_verify_audit_log", {
      method: "POST",
      headers: { prefer: "return=minimal" },
      body: JSON.stringify({ event, metadata })
    });
  } catch (_) {}
}

async function recordRate(rateKey: string, action: string, success: boolean) {
  try {
    await db("cover_pick_verify_rate_limits", {
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
  const rows = await dbJson(`cover_pick_verify_rate_limits?${query.toString()}`);
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
  const rows = await dbJson(`cover_pick_verify_rate_limits?${query.toString()}`);
  return Array.isArray(rows) && rows.length >= limit;
}

async function getWinner(email: string, nickname: string): Promise<WinnerRow | null> {
  const identityHash = await sha256Hex(`${email}\n${nickname}`);
  const query = new URLSearchParams({
    select: "id,submitted",
    identity_hash: `eq.${identityHash}`,
    limit: "1"
  });
  const rows = await dbJson(`cover_pick_winners?${query.toString()}`);
  return Array.isArray(rows) && rows.length ? rows[0] as WinnerRow : null;
}

async function invalidateOpenSessions(winnerId: string) {
  await dbJson(`cover_pick_verification_sessions?winner_id=eq.${winnerId}&used=eq.false`, {
    method: "PATCH",
    headers: { prefer: "return=minimal" },
    body: JSON.stringify({ used: true })
  });
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

  try {
    if (await rateExceeded(ipHash, "burst", BURST_LIMIT, BURST_WINDOW_MS)) {
      return json(req, { ok: false, code: "RATE_LIMITED" }, 429, { "Retry-After": "60" });
    }
    await recordRate(ipHash, "burst", false);

    if (website) {
      await audit("honeypot_triggered", { request_id: rid });
      await delay(450);
      return json(req, { ok: false, code: "IDENTITY_MISMATCH" }, 404);
    }

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
    const nicknameDisplay = normalizeNicknameDisplay(nicknameRaw);
    const nickname = normalizeNickname(nicknameRaw);
    if (!validEmail(email)) {
      await recordRate(ipHash, "verify", false);
      return json(req, { ok: false, code: "MISSING_FIELDS" }, 400);
    }

    const identityKey = await sha256Hex(`${rateSalt}:verify-identity:${email}\n${nickname}`);
    const emailKey = await sha256Hex(`${rateSalt}:verify-email:${email}`);
    if (
      await rateExceeded(identityKey, "verify_identity", VERIFY_IDENTITY_LIMIT) ||
      await rateExceeded(emailKey, "verify_email", VERIFY_EMAIL_LIMIT)
    ) {
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

    if (winner.submitted === true) {
      await equalizeIdentityResponse(startedAt);
      return json(req, { ok: false, code: "ALREADY_SUBMITTED" }, 409);
    }

    await invalidateOpenSessions(winner.id);
    const sessionId = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + SESSION_TTL_MS).toISOString();
    const token = await createRegistrationToken(sessionId, winner.id, expiresAt);
    const tokenHash = await sha256Hex(token);

    await dbJson("cover_pick_verification_sessions", {
      method: "POST",
      headers: { prefer: "return=minimal" },
      body: JSON.stringify({
        id: sessionId,
        winner_id: winner.id,
        stage: "identity_verified",
        token_hash: tokenHash,
        token_version: TOKEN_VERSION,
        expires_at: expiresAt,
        used: false,
        ip_hash: ipHash,
        user_agent_hash: uaHash,
        account_email: email,
        muniverse_nickname: nicknameDisplay
      })
    });

    await audit("winner_verify_success", { request_id: rid, session_ttl_minutes: 15, token_version: TOKEN_VERSION });
    await equalizeIdentityResponse(startedAt);
    return json(req, {
      ok: true,
      verificationToken: token,
      token,
      eventDate: RECORDING_DATE,
      expiresAt
    });
  } catch (error) {
    await audit("verify_server_error", { request_id: rid, message: String(error).slice(0, 500) });
    return json(req, { ok: false, code: "SERVER_ERROR" }, 500);
  }
});
