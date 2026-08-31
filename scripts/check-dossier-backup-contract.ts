import {
  GAME_SAVE_KEYS,
  normalizeBackupPayload,
} from "../supabase/functions/_shared/dossier-backup-contract.ts";

const now = Date.now();
const payload = normalizeBackupPayload({
  dossier: {
    version: 1,
    status: "completed",
    curatorId: "0091-A",
    role: "animator",
    displayName: "ОПЕРАТОР",
    nameHistory: [],
    avatarId: null,
    artifacts: [
      {
        id: "lora-night-receipt",
        sessionNumber: 1,
        obtainedAt: now,
        variant: "quiet",
        copyVariant: "quiet:hidden:kept:sleep:first",
        pigOutcome: "hidden",
        foxOutcome: "kept",
        dogOutcome: "sleep",
        replay: false,
      },
      {
        id: "lora-nevalyashka",
        sessionNumber: 1,
        obtainedAt: now,
      },
      {
        id: "lora-quiet-sleep-page",
        sessionNumber: 1,
        obtainedAt: now,
        giftVariant: "sugar-lamb",
      },
      {
        id: "pavel-lora-cassette",
        sessionNumber: 1,
        obtainedAt: now,
      },
    ],
    sessions: [],
    messages: [],
    deletedItems: [],
    removedArtifactIds: [],
    removedMessageIds: [],
    createdAt: now,
    updatedAt: now,
  },
  currentSession: null,
  gameSaves: Object.fromEntries(
    GAME_SAVE_KEYS.map((key, index) => [
      key,
      { version: 1, updatedAt: now + index, marker: key },
    ]),
  ),
});

if (payload.schemaVersion !== 2) throw new Error("backup schema mismatch");
if (Object.keys(payload.gameSaves).length !== GAME_SAVE_KEYS.length) {
  throw new Error("game saves were filtered from backup");
}
const receipt = payload.dossier.artifacts.find(
  (artifact) => artifact.id === "lora-night-receipt",
);
if (
  receipt?.copyVariant !== "quiet:hidden:kept:sleep:first" ||
  receipt?.dogOutcome !== "sleep"
) {
  throw new Error("Red Room artifact metadata was not preserved");
}
if (
  !payload.dossier.artifacts.some((artifact) =>
    artifact.id === "pavel-lora-cassette"
  )
) {
  throw new Error("Pavel cassette was filtered from backup");
}

console.log(
  `dossier backup contract: ok (${payload.dossier.artifacts.length} artifacts, ` +
    `${Object.keys(payload.gameSaves).length} game saves)`,
);
