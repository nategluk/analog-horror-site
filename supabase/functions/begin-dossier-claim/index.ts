import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "npm:@supabase/server@^1";
import {
  ARTIFACT_IDS,
  CURATOR_ID,
  DOSSIER_VERSION,
  FILE_IDS,
  FLAG_IDS,
  NODE_IDS,
  PROGRESS_VERSION,
  ROUTE_MARK_IDS,
} from "../_shared/curator-0091-contract.ts";

const MAX_REQUEST_BYTES = 131072;
const MAX_NORMALIZED_BYTES = 98304;
const MAX_CLAIMS_PER_EMAIL_PER_HOUR = 3;
const CLAIM_TTL_SECONDS = 24 * 60 * 60;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SESSION_ID_PATTERN = /^[A-Za-z0-9_-]{1,128}$/;
const ROLE_IDS = new Set(["animator", "volunteer"]);
const AVATAR_IDS = new Set([
  "overexposed",
  "drawing",
  "mask",
  "empty-chair",
]);
const DOSSIER_STATUSES = new Set(["screening", "in_progress", "completed"]);
const SESSION_STATUSES = new Set(["in_progress", "completed"]);
const encoder = new TextEncoder();

type JsonRecord = Record<string, unknown>;

class RequestError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

const isRecord = (value: unknown): value is JsonRecord =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);

const asInteger = (
  value: unknown,
  fallback: number,
  minimum: number,
  maximum: number,
) => {
  const parsed = Number(value);
  if (!Number.isInteger(parsed)) return fallback;
  return Math.min(maximum, Math.max(minimum, parsed));
};

const asTimestamp = (value: unknown) =>
  asInteger(value, 0, 0, Number.MAX_SAFE_INTEGER);

const asRole = (value: unknown) =>
  typeof value === "string" && ROLE_IDS.has(value) ? value : null;

const asAvatar = (value: unknown) =>
  typeof value === "string" && AVATAR_IDS.has(value) ? value : null;

const normalizeEmail = (value: unknown) => {
  if (typeof value !== "string") throw new RequestError("invalid request");
  const email = value.trim().toLowerCase();
  if (email.length > 254 || !EMAIL_PATTERN.test(email)) {
    throw new RequestError("invalid request");
  }
  return email;
};

const uniqueKnownStrings = (
  value: unknown,
  allowed: Set<string>,
  maximum: number,
) => {
  if (!Array.isArray(value)) return [];
  return [
    ...new Set(
      value.filter((item): item is string =>
        typeof item === "string" && allowed.has(item)
      ),
    ),
  ].slice(0, maximum);
};

const normalizeFlags = (value: unknown) => {
  if (!isRecord(value)) return {};

  return Object.fromEntries(
    Object.entries(value)
      .filter(([key, flagValue]) =>
        FLAG_IDS.has(key) &&
        (
          typeof flagValue === "boolean" ||
          typeof flagValue === "number" && Number.isFinite(flagValue) ||
          typeof flagValue === "string" && flagValue.length <= 64
        )
      )
      .slice(0, FLAG_IDS.size),
  );
};

const normalizeScores = (
  value: unknown,
  allowedKeys: string[],
) => {
  const source = isRecord(value) ? value : {};
  return Object.fromEntries(
    allowedKeys.map((key) => [
      key,
      asInteger(source[key], 0, -1000, 1000),
    ]),
  );
};

const normalizeSessionSummary = (value: unknown) => {
  if (!isRecord(value) || typeof value.id !== "string") return null;
  if (!SESSION_ID_PATTERN.test(value.id)) return null;

  const role = asRole(value.role);
  return {
    id: value.id,
    number: asInteger(value.number, 1, 1, 999),
    role,
    routeMarks: asInteger(value.routeMarks, 0, 0, 9),
    completedAt: asTimestamp(value.completedAt),
  };
};

const normalizeStoredArtifacts = (value: unknown) => {
  if (!Array.isArray(value)) return [];

  const artifacts = new Map<string, JsonRecord>();
  value.slice(0, 64).forEach((entry) => {
    if (!isRecord(entry) || typeof entry.id !== "string") return;
    if (!ARTIFACT_IDS.has(entry.id) || artifacts.has(entry.id)) return;
    artifacts.set(entry.id, {
      id: entry.id,
      sessionNumber: asInteger(entry.sessionNumber, 1, 1, 999),
      obtainedAt: asTimestamp(entry.obtainedAt),
    });
  });

  return [...artifacts.values()];
};

const normalizeDossier = (value: unknown) => {
  if (!isRecord(value)) throw new RequestError("invalid request");
  if (
    value.version !== DOSSIER_VERSION ||
    value.curatorId !== CURATOR_ID ||
    typeof value.status !== "string" ||
    !DOSSIER_STATUSES.has(value.status)
  ) {
    throw new RequestError("invalid request");
  }

  const role = asRole(value.role);
  if (value.status !== "completed" || !role) {
    throw new RequestError("dossier is not completed", 409);
  }

  const sessions = Array.isArray(value.sessions)
    ? value.sessions
      .slice(0, 25)
      .map(normalizeSessionSummary)
      .filter(Boolean)
    : [];

  return {
    version: DOSSIER_VERSION,
    curatorId: CURATOR_ID,
    status: value.status,
    role,
    avatarId: asAvatar(value.avatarId),
    artifacts: normalizeStoredArtifacts(value.artifacts),
    sessions,
    createdAt: asTimestamp(value.createdAt),
    updatedAt: asTimestamp(value.updatedAt),
  };
};

const normalizeCurrentSession = (value: unknown) => {
  if (value === null || value === undefined) return null;
  if (!isRecord(value)) throw new RequestError("invalid request");
  if (
    value.version !== PROGRESS_VERSION ||
    value.curatorId !== CURATOR_ID ||
    typeof value.status !== "string" ||
    !SESSION_STATUSES.has(value.status) ||
    typeof value.node !== "string" ||
    !NODE_IDS.has(value.node) ||
    typeof value.sessionId !== "string" ||
    !SESSION_ID_PATTERN.test(value.sessionId)
  ) {
    throw new RequestError("invalid request");
  }

  const role = asRole(value.role);
  if (value.status === "completed" && !role) {
    throw new RequestError("invalid request");
  }

  return {
    version: PROGRESS_VERSION,
    curatorId: CURATOR_ID,
    status: value.status,
    node: value.node,
    role,
    profiles: normalizeScores(value.profiles, ["animator", "volunteer"]),
    scores: normalizeScores(value.scores, [
      "obedience",
      "curiosity",
      "fear",
      "delegation",
    ]),
    flags: normalizeFlags(value.flags),
    files: uniqueKnownStrings(value.files, FILE_IDS, FILE_IDS.size),
    artifacts: uniqueKnownStrings(
      value.artifacts,
      ARTIFACT_IDS,
      ARTIFACT_IDS.size,
    ),
    routeMarks: uniqueKnownStrings(value.routeMarks, ROUTE_MARK_IDS, 9),
    sessionId: value.sessionId,
    sessionNumber: asInteger(value.sessionNumber, 1, 1, 999),
    updatedAt: asTimestamp(value.updatedAt),
    completedAt: asTimestamp(value.completedAt),
  };
};

const sha256 = async (value: string) => {
  const digest = await crypto.subtle.digest("SHA-256", encoder.encode(value));
  return [...new Uint8Array(digest)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
};

const createTransferSecret = () => {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return btoa(String.fromCharCode(...bytes))
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replace(/=+$/, "");
};

const getAllowedOrigins = () =>
  new Set(
    (Deno.env.get("ALLOWED_SITE_ORIGINS") || "")
      .split(",")
      .map((origin) => origin.trim())
      .filter(Boolean),
  );

const getConfirmUrl = (claimId: string, transferSecret: string) => {
  const configuredSiteUrl = Deno.env.get("PUBLIC_SITE_URL");
  if (!configuredSiteUrl) throw new Error("PUBLIC_SITE_URL is not configured");

  const siteUrl = new URL(configuredSiteUrl);
  if (!siteUrl.pathname.endsWith("/")) siteUrl.pathname += "/";
  const confirmUrl = new URL("auth/confirm.html", siteUrl);
  confirmUrl.searchParams.set("claim", claimId);
  confirmUrl.searchParams.set("transfer", transferSecret);
  return confirmUrl.toString();
};

export default {
  fetch: withSupabase(
    { auth: "publishable" },
    async (request, context) => {
      try {
        // Database types will be generated after the remote project is linked.
        // deno-lint-ignore no-explicit-any
        const supabaseAdmin = context.supabaseAdmin as any;

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

        const contentLength = Number(
          request.headers.get("content-length") || 0,
        );
        if (contentLength > MAX_REQUEST_BYTES) {
          throw new RequestError("request too large", 413);
        }

        const body = await request.json();
        if (!isRecord(body)) throw new RequestError("invalid request");

        const email = normalizeEmail(body.email);
        const dossier = normalizeDossier(body.dossier);
        const currentSession = normalizeCurrentSession(body.currentSession);
        const payload = {
          schemaVersion: 1,
          dossier,
          currentSession,
        };
        const normalizedSize =
          encoder.encode(JSON.stringify(payload)).byteLength;
        if (normalizedSize > MAX_NORMALIZED_BYTES) {
          throw new RequestError("request too large", 413);
        }

        const emailHash = await sha256(email);
        const now = new Date();
        const { error: cleanupError } = await supabaseAdmin
          .from("dossier_claims")
          .delete()
          .lt("expires_at", now.toISOString());
        if (cleanupError) {
          console.error("dossier claim cleanup failed", cleanupError);
        }

        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
        const { count, error: countError } = await supabaseAdmin
          .from("dossier_claims")
          .select("id", { count: "exact", head: true })
          .eq("email_hash", emailHash)
          .gte("created_at", oneHourAgo);

        if (countError) throw countError;
        if ((count || 0) >= MAX_CLAIMS_PER_EMAIL_PER_HOUR) {
          throw new RequestError("request limit reached", 429);
        }

        const transferSecret = createTransferSecret();
        const secretHash = await sha256(transferSecret);
        const expiresAt = new Date(
          Date.now() + CLAIM_TTL_SECONDS * 1000,
        ).toISOString();
        const { data: claim, error: insertError } = await supabaseAdmin
          .from("dossier_claims")
          .insert({
            secret_hash: secretHash,
            email_hash: emailHash,
            payload,
            expires_at: expiresAt,
          })
          .select("id")
          .single();

        if (insertError) throw insertError;

        const emailRedirectTo = getConfirmUrl(claim.id, transferSecret);
        const { error: authError } = await context.supabase.auth.signInWithOtp({
          email,
          options: {
            shouldCreateUser: true,
            emailRedirectTo,
          },
        });

        if (authError) {
          await supabaseAdmin
            .from("dossier_claims")
            .delete()
            .eq("id", claim.id);
          throw authError;
        }

        return Response.json({
          ok: true,
          expiresInSeconds: CLAIM_TTL_SECONDS,
        });
      } catch (error) {
        if (error instanceof RequestError) {
          return Response.json(
            {
              error: error.status === 429 ? "rate_limited" : "invalid_request",
            },
            { status: error.status },
          );
        }

        console.error("begin-dossier-claim failed", error);
        return Response.json({ error: "temporary_failure" }, { status: 500 });
      }
    },
  ),
};
