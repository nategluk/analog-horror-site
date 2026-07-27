import {
  ARTIFACT_IDS,
  FLAG_IDS,
  NODE_IDS,
  ROUTE_MARK_IDS,
} from "../supabase/functions/_shared/curator-0091-contract.ts";

const appSource = await Deno.readTextFile(
  new URL("../js/app.js", import.meta.url),
);
const artifactMigration = await Deno.readTextFile(
  new URL(
    "../supabase/migrations/20260727054700_create_dossier_artifacts.sql",
    import.meta.url,
  ),
);

const getSection = (start: string, end: string) => {
  const startIndex = appSource.indexOf(start);
  const endIndex = appSource.indexOf(end, startIndex);
  if (startIndex < 0 || endIndex < 0) {
    throw new Error(`Cannot find app.js section: ${start} ... ${end}`);
  }
  return appSource.slice(startIndex, endIndex);
};

const collect = (source: string, pattern: RegExp) => {
  const values = new Set<string>();
  for (const match of source.matchAll(pattern)) {
    const value = match.slice(1).find(Boolean);
    if (value) values.add(value);
  }
  return values;
};

const curatorNodesSource = getSection(
  "const curatorNodes = {",
  "const applyCuratorEffect",
);
const staffArtifactsSource = getSection(
  "const staffArtifacts = {",
  "const curatorNodeArtifacts",
);

const appNodeIds = collect(
  curatorNodesSource,
  /^    (?:"([^"]+)"|([A-Za-z][A-Za-z0-9_-]*)): \{/gm,
);
const appArtifactIds = collect(
  staffArtifactsSource,
  /^    (?:"([^"]+)"|([A-Za-z][A-Za-z0-9_-]*)): \{/gm,
);
const appFlagIds = collect(
  appSource,
  /flags(?:\?)?\.([A-Za-z0-9_]+)/g,
);
const appRouteMarkIds = collect(
  appSource,
  /routeMark:\s*"([^"]+)"/g,
);
const migrationArtifactIds = collect(
  artifactMigration,
  /^\s+\('([a-z0-9-]+)'\)[,;]$/gm,
);

const assertSameSet = (
  label: string,
  expected: Set<string>,
  actual: Set<string>,
) => {
  const missing = [...expected].filter((value) => !actual.has(value));
  const extra = [...actual].filter((value) => !expected.has(value));
  if (missing.length || extra.length) {
    throw new Error(
      `${label} mismatch\nmissing: ${missing.join(", ") || "-"}\n` +
        `extra: ${extra.join(", ") || "-"}`,
    );
  }
};

assertSameSet("curator nodes", appNodeIds, NODE_IDS);
assertSameSet("curator flags", appFlagIds, FLAG_IDS);
assertSameSet("route marks", appRouteMarkIds, ROUTE_MARK_IDS);
assertSameSet("shared artifacts", appArtifactIds, ARTIFACT_IDS);
assertSameSet("migration artifacts", appArtifactIds, migrationArtifactIds);

console.log(
  `server contract: ok (${NODE_IDS.size} nodes, ${FLAG_IDS.size} flags, ` +
    `${ARTIFACT_IDS.size} artifacts, ${ROUTE_MARK_IDS.size} route marks)`,
);
