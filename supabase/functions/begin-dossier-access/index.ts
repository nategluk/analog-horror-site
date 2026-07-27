import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "npm:@supabase/server@^1";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

class RequestError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

const normalizeEmail = (value: unknown) => {
  if (typeof value !== "string") throw new RequestError("invalid request");
  const email = value.trim().toLowerCase();
  if (email.length > 254 || !EMAIL_PATTERN.test(email)) {
    throw new RequestError("invalid request");
  }
  return email;
};

const getAllowedOrigins = () =>
  new Set(
    (Deno.env.get("ALLOWED_SITE_ORIGINS") || "")
      .split(",")
      .map((origin) => origin.trim())
      .filter(Boolean),
  );

const getAccessUrl = () => {
  const configuredSiteUrl = Deno.env.get("PUBLIC_SITE_URL");
  if (!configuredSiteUrl) throw new Error("PUBLIC_SITE_URL is not configured");

  const siteUrl = new URL(configuredSiteUrl);
  if (!siteUrl.pathname.endsWith("/")) siteUrl.pathname += "/";
  const accessUrl = new URL("auth/confirm.html", siteUrl);
  accessUrl.searchParams.set("mode", "access");
  return accessUrl.toString();
};

export default {
  fetch: withSupabase(
    { auth: "publishable" },
    async (request, context) => {
      try {
        if (request.method !== "POST") {
          return Response.json({ error: "method_not_allowed" }, {
            status: 405,
          });
        }

        const origin = request.headers.get("origin");
        const allowedOrigins = getAllowedOrigins();
        if (origin && !allowedOrigins.has(origin)) {
          return Response.json({ error: "origin_not_allowed" }, {
            status: 403,
          });
        }

        const body = await request.json();
        const email = normalizeEmail(body?.email);
        const { error } = await context.supabase.auth.signInWithOtp({
          email,
          options: {
            shouldCreateUser: false,
            emailRedirectTo: getAccessUrl(),
          },
        });

        if (error) {
          console.error("begin-dossier-access failed", error);
          return Response.json({ error: "temporary_failure" }, {
            status: 500,
          });
        }

        return Response.json({ ok: true });
      } catch (error) {
        if (error instanceof RequestError) {
          return Response.json({ error: "invalid_request" }, {
            status: error.status,
          });
        }

        console.error("begin-dossier-access failed", error);
        return Response.json({ error: "temporary_failure" }, {
          status: 500,
        });
      }
    },
  ),
};
