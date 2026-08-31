import {
  ARTIFACT_IDS,
  CURATOR_ID,
  DOSSIER_VERSION,
  FILE_IDS,
  FLAG_IDS,
  NODE_IDS,
  PROGRESS_VERSION,
  ROUTE_MARK_IDS,
} from "./curator-0091-contract.ts";

export const BACKUP_SCHEMA_VERSION = 2;
export const MAX_BACKUP_BYTES = 196608;
export const GAME_SAVE_KEYS = Object.freeze([
  "tyndex_lora_red_room_v1",
  "tyndex_pavel_observation_booth_v1",
  "tyndex_irina_solnyshko_v1",
]);

const GAME_SAVE_KEY_SET = new Set(GAME_SAVE_KEYS);
const SESSION_ID_PATTERN = /^[A-Za-z0-9_-]{1,128}$/;
const SAFE_ID_PATTERN = /^[A-Za-z0-9_-]{1,128}$/;
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

export class RequestError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

export const isRecord = (value: unknown): value is JsonRecord =>
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

const boundedString = (value: unknown, maximum: number) =>
  typeof value === "string" ? value.slice(0, maximum) : "";

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

const uniqueSafeStrings = (value: unknown, maximum: number) => {
  if (!Array.isArray(value)) return [];
  return [
    ...new Set(
      value.filter((item): item is string =>
        typeof item === "string" && SAFE_ID_PATTERN.test(item)
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
        (typeof flagValue === "boolean" ||
          typeof flagValue === "number" && Number.isFinite(flagValue) ||
          typeof flagValue === "string" && flagValue.length <= 64)
      )
      .slice(0, FLAG_IDS.size),
  );
};

const normalizeScores = (value: unknown, allowedKeys: string[]) => {
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
  return {
    id: value.id,
    number: asInteger(value.number, 1, 1, 999),
    role: asRole(value.role),
    routeMarks: asInteger(value.routeMarks, 0, 0, 99),
    completedAt: asTimestamp(value.completedAt),
  };
};

const normalizeArtifact = (value: unknown) => {
  if (!isRecord(value) || typeof value.id !== "string") return null;
  if (!ARTIFACT_IDS.has(value.id)) return null;
  const artifact: JsonRecord = {
    id: value.id,
    sessionNumber: asInteger(value.sessionNumber, 1, 1, 999),
    obtainedAt: asTimestamp(value.obtainedAt),
  };
  [
    "variant",
    "copyVariant",
    "giftVariant",
    "pigOutcome",
    "foxOutcome",
    "dogOutcome",
  ]
    .forEach((key) => {
      const normalized = boundedString(value[key], 96);
      if (normalized) artifact[key] = normalized;
    });
  if (typeof value.replay === "boolean") artifact.replay = value.replay;
  if (
    ["accepted", "declined_backup", "unlocked"].includes(
      String(value.acquisition),
    )
  ) {
    artifact.acquisition = value.acquisition;
  }
  return artifact;
};

export const normalizeDossier = (value: unknown) => {
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
  const artifacts = new Map<string, JsonRecord>();
  (Array.isArray(value.artifacts) ? value.artifacts : [])
    .slice(0, 64)
    .forEach((entry) => {
      const artifact = normalizeArtifact(entry);
      if (artifact && !artifacts.has(String(artifact.id))) {
        artifacts.set(String(artifact.id), artifact);
      }
    });
  const sessions = (Array.isArray(value.sessions) ? value.sessions : [])
    .slice(0, 25)
    .map(normalizeSessionSummary)
    .filter(Boolean);
  const messages = (Array.isArray(value.messages) ? value.messages : [])
    .slice(0, 64)
    .flatMap((entry) => {
      if (
        !isRecord(entry) || typeof entry.id !== "string" ||
        !SAFE_ID_PATTERN.test(entry.id)
      ) {
        return [];
      }
      return [{
        id: entry.id,
        deliveredAt: asTimestamp(entry.deliveredAt),
        readAt: entry.readAt === null ? null : asTimestamp(entry.readAt),
      }];
    });
  const deletedItems =
    (Array.isArray(value.deletedItems) ? value.deletedItems : [])
      .slice(0, 128)
      .flatMap((entry) => {
        if (
          !isRecord(entry) || typeof entry.kind !== "string" ||
          typeof entry.id !== "string" || !SAFE_ID_PATTERN.test(entry.id)
        ) return [];
        if (!new Set(["artifact", "message"]).has(entry.kind)) return [];
        return [{
          kind: entry.kind,
          id: entry.id,
          deletedAt: asTimestamp(entry.deletedAt),
        }];
      });
  return {
    version: DOSSIER_VERSION,
    curatorId: CURATOR_ID,
    status: value.status,
    role,
    displayName: boundedString(value.displayName, 20),
    nameHistory: (Array.isArray(value.nameHistory) ? value.nameHistory : [])
      .filter((entry): entry is string => typeof entry === "string")
      .map((entry) => entry.slice(0, 20))
      .slice(-8),
    avatarId: asAvatar(value.avatarId),
    artifacts: [...artifacts.values()],
    sessions,
    messages,
    deletedItems,
    removedArtifactIds: uniqueKnownStrings(
      value.removedArtifactIds,
      ARTIFACT_IDS,
      ARTIFACT_IDS.size,
    ),
    removedMessageIds: uniqueSafeStrings(value.removedMessageIds, 64),
    reclassificationActive: value.reclassificationActive === true,
    createdAt: asTimestamp(value.createdAt),
    updatedAt: asTimestamp(value.updatedAt),
    completedAt: asTimestamp(value.completedAt),
    lastCompletedAt: asTimestamp(value.lastCompletedAt),
  };
};

export const normalizeCurrentSession = (value: unknown) => {
  if (value === null || value === undefined) return null;
  if (!isRecord(value)) throw new RequestError("invalid request");
  if (
    value.version !== PROGRESS_VERSION || value.curatorId !== CURATOR_ID ||
    typeof value.status !== "string" || !SESSION_STATUSES.has(value.status) ||
    typeof value.node !== "string" || !NODE_IDS.has(value.node) ||
    typeof value.sessionId !== "string" ||
    !SESSION_ID_PATTERN.test(value.sessionId)
  ) throw new RequestError("invalid request");
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
    routeMarks: uniqueKnownStrings(
      value.routeMarks,
      ROUTE_MARK_IDS,
      ROUTE_MARK_IDS.size,
    ),
    sessionId: value.sessionId,
    sessionNumber: asInteger(value.sessionNumber, 1, 1, 999),
    updatedAt: asTimestamp(value.updatedAt),
    completedAt: asTimestamp(value.completedAt),
  };
};

export const normalizeGameSaves = (value: unknown) => {
  const source = isRecord(value) ? value : {};
  const saves: JsonRecord = {};
  for (const [key, entry] of Object.entries(source)) {
    if (
      !GAME_SAVE_KEY_SET.has(key) || !isRecord(entry) || entry.version !== 1
    ) continue;
    const serialized = JSON.stringify(entry);
    if (encoder.encode(serialized).byteLength > 65536) {
      throw new RequestError("game save too large", 413);
    }
    saves[key] = JSON.parse(serialized);
  }
  return saves;
};

export const normalizeBackupPayload = (value: unknown) => {
  if (!isRecord(value)) throw new RequestError("invalid request");
  const payload = {
    schemaVersion: BACKUP_SCHEMA_VERSION,
    dossier: normalizeDossier(value.dossier),
    currentSession: normalizeCurrentSession(value.currentSession),
    gameSaves: normalizeGameSaves(value.gameSaves),
  };
  if (encoder.encode(JSON.stringify(payload)).byteLength > MAX_BACKUP_BYTES) {
    throw new RequestError("request too large", 413);
  }
  return payload;
};
