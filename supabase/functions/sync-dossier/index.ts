import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "npm:@supabase/server@^1";
import {
  isRecord,
  normalizeBackupPayload,
  RequestError,
} from "../_shared/dossier-backup-contract.ts";

const MAX_REQUEST_BYTES = 262144;

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
      if (request.method !== "POST") {
        return Response.json({ error: "method_not_allowed" }, { status: 405 });
      }
      if (!origin || !getAllowedOrigins().has(origin)) {
        return Response.json({ error: "origin_not_allowed" }, { status: 403 });
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
        const contentLength = Number(
          request.headers.get("content-length") || 0,
        );
        if (contentLength > MAX_REQUEST_BYTES) {
          throw new RequestError("request too large", 413);
        }
        const payload = normalizeBackupPayload(await request.json());
        const { data: existing, error: existingError } = await supabase
          .from("dossiers")
          .select("owner_user_id")
          .eq("owner_user_id", ownerUserId)
          .maybeSingle();
        if (existingError) throw existingError;
        if (!existing) {
          return Response.json({ error: "dossier_not_found" }, { status: 404 });
        }
        const games = isRecord(payload.gameSaves)
          ? Object.values(payload.gameSaves).filter(isRecord)
          : [];
        const clientUpdatedAt = Math.max(
          Number(payload.dossier.updatedAt) || 0,
          ...games.map((game) => Number(game.updatedAt) || 0),
        );
        const { data: existingBackup, error: backupReadError } = await supabase
          .from("dossier_backups")
          .select("payload,client_updated_at")
          .eq("owner_user_id", ownerUserId)
          .maybeSingle();
        if (backupReadError) throw backupReadError;
        if (Number(existingBackup?.client_updated_at || 0) > clientUpdatedAt) {
          return Response.json({
            ok: false,
            error: "server_newer",
            backup: existingBackup.payload,
          });
        }
        const { error: backupError } = await supabase
          .from("dossier_backups")
          .upsert({
            owner_user_id: ownerUserId,
            schema_version: payload.schemaVersion,
            payload,
            client_updated_at: clientUpdatedAt,
          }, { onConflict: "owner_user_id" });
        if (backupError) throw backupError;

        const { error: dossierError } = await supabase
          .from("dossiers")
          .update({
            status: payload.dossier.status,
            role: payload.dossier.role,
            avatar_id: payload.dossier.avatarId,
          })
          .eq("owner_user_id", ownerUserId);
        if (dossierError) throw dossierError;

        const artifacts = payload.dossier.artifacts.map((artifact) => ({
          owner_user_id: ownerUserId,
          artifact_id: String(artifact.id),
          session_id: null,
          acquisition: String(artifact.acquisition || "unlocked"),
        }));
        if (artifacts.length) {
          const { error: artifactError } = await supabase
            .from("dossier_artifacts")
            .upsert(artifacts, {
              onConflict: "owner_user_id,artifact_id",
              ignoreDuplicates: true,
            });
          if (artifactError) throw artifactError;
        }
        return Response.json({ ok: true, syncedAt: Date.now() });
      } catch (error) {
        if (error instanceof RequestError) {
          return Response.json({ error: error.message }, {
            status: error.status,
          });
        }
        console.error("sync-dossier failed", error);
        return Response.json({ error: "temporary_failure" }, { status: 500 });
      }
    },
  ),
};
