import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const PROD_ORIGIN = "https://muniverse-official.github.io";
const LOCAL_ORIGINS = new Set(["http://localhost:5173", "http://127.0.0.1:5173"]);
const ACTIVE_ORIGIN = "https://kkaoerbblpuszptiibvo.supabase.co";

function allowLocalDev() {
  return Deno.env.get("ALLOW_LOCAL_DEV") === "true";
}

function allowedOrigin(origin: string) {
  return origin === PROD_ORIGIN || (allowLocalDev() && LOCAL_ORIGINS.has(origin));
}

function headers(req: Request, extra: Record<string, string> = {}) {
  const origin = req.headers.get("origin") || "";
  const base: Record<string, string> = {
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "content-type, x-cover-pick-request, x-request-id",
    "Access-Control-Max-Age": "86400",
    "Cache-Control": "no-store, max-age=0",
    "Content-Type": "application/json; charset=utf-8",
    "Referrer-Policy": "no-referrer",
    "X-Content-Type-Options": "nosniff",
    "Vary": "Origin"
  };
  if (allowedOrigin(origin)) base["Access-Control-Allow-Origin"] = origin;
  return { ...base, ...extra };
}

Deno.serve((req: Request) => {
  const origin = req.headers.get("origin") || "";
  if (!allowedOrigin(origin)) {
    return new Response(JSON.stringify({ ok: false, code: "ORIGIN_DENIED" }), {
      status: 403,
      headers: headers(req)
    });
  }

  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: headers(req) });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ ok: false, code: "METHOD_NOT_ALLOWED" }), {
      status: 405,
      headers: headers(req)
    });
  }

  const action = new URL(req.url).searchParams.get("action");
  const target = action === "verify"
    ? `${ACTIVE_ORIGIN}/functions/v1/cover-pick-verify`
    : action === "submit"
      ? `${ACTIVE_ORIGIN}/functions/v1/cover-pick-register`
      : "";

  if (!target) {
    return new Response(JSON.stringify({ ok: false, code: "ENDPOINT_MIGRATED" }), {
      status: 410,
      headers: headers(req)
    });
  }

  return new Response(null, {
    status: 307,
    headers: headers(req, { Location: target })
  });
});
