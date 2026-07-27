import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const CLAIM_ID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const TRANSFER_SECRET_PATTERN = /^[A-Za-z0-9_-]{43}$/;
const encoder = new TextEncoder();

type JsonRecord = Record<string, unknown>;

const isRecord = (value: unknown): value is JsonRecord =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);

const sha256 = async (value: string) => {
  const digest = await crypto.subtle.digest("SHA-256", encoder.encode(value));
  return [...new Uint8Array(digest)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
};

const getAllowedOrigins = () =>
  new Set(
    (Deno.env.get("ALLOWED_SITE_ORIGINS") || "")
      .split(",")
      .map((origin) => origin.trim())
      .filter(Boolean),
  );

const responseHeaders = (origin: string | null) => {
  const headers = new Headers({
    "Cache-Control": "no-store",
    "Content-Type": "application/json; charset=utf-8",
    "Vary": "Origin",
    "X-Content-Type-Options": "nosniff",
  });

  if (origin && getAllowedOrigins().has(origin)) {
    headers.set("Access-Control-Allow-Origin", origin);
    headers.set("Access-Control-Allow-Headers", "authorization, content-type");
    headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  }

  return headers;
};

const jsonResponse = (
  body: JsonRecord,
  status: number,
  origin: string | null,
) =>
  new Response(JSON.stringify(body), {
    status,
    headers: responseHeaders(origin),
  });

Deno.serve(async (request) => {
  const origin = request.headers.get("origin");
  const allowedOrigins = getAllowedOrigins();

  if (request.method === "OPTIONS") {
    if (!origin || !allowedOrigins.has(origin)) {
      return jsonResponse({ error: "origin_not_allowed" }, 403, origin);
    }

    return new Response(null, {
      status: 204,
      headers: responseHeaders(origin),
    });
  }

  if (request.method !== "POST") {
    return jsonResponse({ error: "method_not_allowed" }, 405, origin);
  }

  if (!origin || !allowedOrigins.has(origin)) {
    return jsonResponse({ error: "origin_not_allowed" }, 403, origin);
  }

  try {
    const authorization = request.headers.get("authorization") || "";
    const accessToken = authorization.startsWith("Bearer ")
      ? authorization.slice(7).trim()
      : "";
    if (!accessToken) {
      return jsonResponse({ error: "authentication_required" }, 401, origin);
    }

    const body = await request.json();
    if (
      !isRecord(body) ||
      typeof body.claim !== "string" ||
      !CLAIM_ID_PATTERN.test(body.claim) ||
      typeof body.transfer !== "string" ||
      !TRANSFER_SECRET_PATTERN.test(body.transfer)
    ) {
      return jsonResponse({ error: "link_invalid" }, 400, origin);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error("Supabase environment is incomplete");
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
    const { data: userData, error: userError } =
      await supabaseAdmin.auth.getUser(accessToken);
    const user = userData.user;
    if (
      userError ||
      !user ||
      !user.email ||
      !user.email_confirmed_at
    ) {
      return jsonResponse({ error: "authentication_required" }, 401, origin);
    }

    const secretHash = await sha256(body.transfer);
    const emailHash = await sha256(user.email.trim().toLowerCase());
    const { data, error } = await supabaseAdmin.rpc("consume_dossier_claim", {
      p_claim_id: body.claim,
      p_secret_hash: secretHash,
      p_owner_user_id: user.id,
      p_email_hash: emailHash,
    });

    if (error) throw error;
    const result = isRecord(data) ? data : {};

    switch (result.status) {
      case "claimed":
        return jsonResponse({
          ok: true,
          status: "claimed",
          dossier: {
            status: result.dossierStatus,
            role: result.role,
            sessionCount: result.sessionCount,
            artifactCount: result.artifactCount,
          },
        }, 200, origin);
      case "already_claimed":
        return jsonResponse({
          ok: true,
          status: "already_claimed",
        }, 200, origin);
      case "expired":
        return jsonResponse({ error: "link_expired" }, 410, origin);
      case "not_found":
      case "email_mismatch":
      case "invalid":
      default:
        return jsonResponse({ error: "link_invalid" }, 403, origin);
    }
  } catch (error) {
    console.error("consume-dossier-claim failed", error);
    return jsonResponse({ error: "temporary_failure" }, 500, origin);
  }
});
