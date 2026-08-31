import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "npm:@supabase/server@^1";

type JsonRecord = Record<string, unknown>;
type DossierRow = {
  schema_version: number;
  curator_id: string;
  status: string;
  role: string | null;
  avatar_id: string | null;
  current_session_id: string | null;
  created_at: string;
  updated_at: string;
};
type SessionRow = {
  id: string;
  number: number;
  status: string;
  role: string | null;
  route_marks: number;
  progress: unknown;
  client_updated_at: number;
  server_updated_at: string;
  completed_at: string | null;
};
type ArtifactRow = {
  artifact_id: string;
  session_id: string | null;
  acquisition: string;
  obtained_at: string;
};

const isRecord = (value: unknown): value is JsonRecord =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);

const toTimestamp = (value: unknown) => {
  if (typeof value !== "string") return 0;
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) ? timestamp : 0;
};

const getAllowedOrigins = () =>
  new Set(
    (Deno.env.get("ALLOWED_SITE_ORIGINS") || "")
      .split(",")
      .map((origin) => origin.trim())
      .filter(Boolean),
  );

export default {
  fetch: withSupabase(
    { auth: "user" },
    async (request, context) => {
      const origin = request.headers.get("origin");
      const allowedOrigins = getAllowedOrigins();

      if (request.method !== "POST") {
        return Response.json({ error: "method_not_allowed" }, {
          status: 405,
        });
      }
      if (!origin || !allowedOrigins.has(origin)) {
        return Response.json({ error: "origin_not_allowed" }, {
          status: 403,
        });
      }

      try {
        const ownerUserId = context.userClaims?.id;
        if (!ownerUserId) {
          return Response.json({ error: "authentication_required" }, {
            status: 401,
          });
        }
        // Database types are generated only after the remote migration is linked.
        // deno-lint-ignore no-explicit-any
        const supabase = context.supabase as any;

        const { data: dossier, error: dossierError } = await context.supabase
          .from("dossiers")
          .select(
            "schema_version,curator_id,status,role,avatar_id,current_session_id,created_at,updated_at",
          )
          .eq("owner_user_id", ownerUserId)
          .maybeSingle();
        if (dossierError) throw dossierError;
        if (!dossier) {
          return Response.json({ error: "dossier_not_found" }, {
            status: 404,
          });
        }

        const [
          { data: sessions, error: sessionsError },
          { data: artifacts, error: artifactsError },
          { data: backup, error: backupError },
        ] = await Promise.all([
          context.supabase
            .from("dossier_sessions")
            .select(
              "id,number,status,role,route_marks,progress,client_updated_at,server_updated_at,completed_at",
            )
            .eq("owner_user_id", ownerUserId)
            .order("number", { ascending: true }),
          context.supabase
            .from("dossier_artifacts")
            .select("artifact_id,session_id,acquisition,obtained_at")
            .eq("owner_user_id", ownerUserId)
            .order("obtained_at", { ascending: true }),
          supabase
            .from("dossier_backups")
            .select("schema_version,payload,updated_at")
            .eq("owner_user_id", ownerUserId)
            .maybeSingle(),
        ]);
        if (sessionsError) throw sessionsError;
        if (artifactsError) throw artifactsError;
        if (backupError) throw backupError;

        const backupPayload = isRecord(backup?.payload) ? backup.payload : null;
        const backupDossier = backupPayload && isRecord(backupPayload.dossier)
          ? backupPayload.dossier
          : null;
        if (backupDossier) {
          return Response.json({
            ok: true,
            backupSchemaVersion: Number(backupPayload?.schemaVersion) || 1,
            dossier: {
              ...backupDossier,
              serverRestoredAt: Date.now(),
            },
            currentSession: isRecord(backupPayload?.currentSession)
              ? backupPayload.currentSession
              : null,
            gameSaves: isRecord(backupPayload?.gameSaves)
              ? backupPayload.gameSaves
              : {},
          });
        }

        const dossierRow = dossier as DossierRow;
        const sessionRows = (sessions || []) as SessionRow[];
        const artifactRows = (artifacts || []) as ArtifactRow[];
        const sessionById = new Map(
          sessionRows.map((session) => [session.id, session]),
        );
        const completedSessions = sessionRows
          .filter((session) =>
            session.status === "completed" &&
            (session.role === "animator" || session.role === "volunteer")
          )
          .map((session) => {
            const progress = isRecord(session.progress)
              ? session.progress
              : {};
            return {
              id: session.id,
              number: session.number,
              role: session.role,
              routeMarks: session.route_marks,
              completedAt:
                typeof progress.completedAt === "number"
                  ? progress.completedAt
                  : toTimestamp(session.completed_at),
            };
          });
        const completionTimestamps = completedSessions
          .map((session) => session.completedAt)
          .filter((timestamp) => timestamp > 0);
        const latestCompletedAt = completionTimestamps.length
          ? Math.max(...completionTimestamps)
          : 0;

        const restoredDossier = {
          version: dossierRow.schema_version,
          status: dossierRow.status,
          curatorId: dossierRow.curator_id,
          role: dossierRow.role,
          avatarId: dossierRow.avatar_id,
          artifacts: artifactRows.map((artifact) => ({
            id: artifact.artifact_id,
            sessionNumber:
              sessionById.get(artifact.session_id || "")?.number || 1,
            obtainedAt: toTimestamp(artifact.obtained_at),
            acquisition: artifact.acquisition,
          })),
          sessions: completedSessions,
          createdAt: toTimestamp(dossierRow.created_at),
          updatedAt: toTimestamp(dossierRow.updated_at),
          completedAt: latestCompletedAt || undefined,
          lastCompletedAt: latestCompletedAt || undefined,
          serverRestoredAt: Date.now(),
        };

        const currentRow =
          sessionById.get(dossierRow.current_session_id || "") ||
          sessionRows
            .slice()
            .sort((left, right) =>
              toTimestamp(right.server_updated_at) -
              toTimestamp(left.server_updated_at)
            )[0];
        const currentProgress =
          currentRow && isRecord(currentRow.progress) &&
            currentRow.progress.summary !== true
            ? {
              ...currentRow.progress,
              serverUpdatedAt: toTimestamp(currentRow.server_updated_at),
            }
            : null;

        return Response.json({
          ok: true,
          dossier: restoredDossier,
          currentSession: currentProgress,
        });
      } catch (error) {
        console.error("restore-dossier failed", error);
        return Response.json({ error: "temporary_failure" }, {
          status: 500,
        });
      }
    },
  ),
};
