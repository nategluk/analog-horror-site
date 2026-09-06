#!/usr/bin/env node
"use strict";

const fs = require("node:fs");
const {
  CATALOG_FILE,
  loadCatalog,
  serializeCatalog,
  listEpisodes,
  saveEpisode,
  deleteEpisode,
  nextRegularSlot,
  archiveCountPhrase,
} = require("./lib/episode-catalog");

const archivePage = require("node:path").join(__dirname, "..", "archive.html");
const episodesPage = require("node:path").join(__dirname, "..", "episodes.html");

const catalogBefore = fs.readFileSync(CATALOG_FILE, "utf8");
const archiveBefore = fs.readFileSync(archivePage, "utf8");
const episodesBefore = fs.readFileSync(episodesPage, "utf8");

try {
  const listed = listEpisodes();
  if (listed.count < 50) throw new Error("episode catalog looks empty");
  if (listed.episodes.length !== listed.count) throw new Error("count mismatch");
  if (!listed.platforms.includes("tiktok")) throw new Error("platforms missing");
  if (!listed.themes.some((theme) => theme.id === "broadcast")) {
    throw new Error("themes missing");
  }

  const loaded = loadCatalog();
  const serialized = serializeCatalog(loaded);
  const sandbox = { window: {} };
  require("node:vm").runInNewContext(serialized, sandbox, { timeout: 4000 });
  if (JSON.stringify(sandbox.window.DZ_EPISODE_CATALOG) !== JSON.stringify(loaded)) {
    throw new Error("serialize did not roundtrip catalog data");
  }

  const slot = nextRegularSlot(loaded);
  if (!/^EP-\d{3}$/.test(slot.id)) throw new Error(`bad next id ${slot.id}`);
  if (loaded.some((item) => item.id === slot.id)) throw new Error("next id already taken");

  const created = saveEpisode({
    id: "SMOKE-EP",
    sortOrder: 99.9,
    title: "Детский Жир — smoke",
    description: "Проверка стола выпусков.",
    theme: "broadcast",
    tag: "ЭФИР",
    sources: { youtube: "https://www.youtube.com/shorts/smoke-test" },
  });
  if (created.episode.id !== "SMOKE-EP") throw new Error("create did not return episode");
  if (created.count !== listed.count + 1) throw new Error("count did not increase");

  const archiveAfterCreate = fs.readFileSync(archivePage, "utf8");
  if (!archiveAfterCreate.includes(archiveCountPhrase(created.count))) {
    throw new Error("archive.html count was not updated");
  }
  const episodesAfterCreate = fs.readFileSync(episodesPage, "utf8");
  if (!episodesAfterCreate.includes(`${created.count} `)) {
    throw new Error("episodes.html counter was not updated");
  }

  const updated = saveEpisode(
    {
      ...created.episode,
      id: "SMOKE-EP-2",
      title: "Детский Жир — smoke renamed",
      sources: created.episode.sources,
    },
    { previousId: "SMOKE-EP" }
  );
  if (updated.episode.id !== "SMOKE-EP-2") throw new Error("rename failed");
  if (updated.episodes.some((item) => item.id === "SMOKE-EP")) {
    throw new Error("old id remained after rename");
  }

  const afterDelete = deleteEpisode("SMOKE-EP-2");
  if (afterDelete.episodes.some((item) => item.id.startsWith("SMOKE-EP"))) {
    throw new Error("smoke episode remained");
  }
  if (afterDelete.count !== listed.count) throw new Error("count did not restore");
} finally {
  fs.writeFileSync(CATALOG_FILE, catalogBefore, "utf8");
  fs.writeFileSync(archivePage, archiveBefore, "utf8");
  fs.writeFileSync(episodesPage, episodesBefore, "utf8");
}

if (fs.readFileSync(CATALOG_FILE, "utf8") !== catalogBefore) {
  throw new Error("catalog file did not restore");
}
if (fs.readFileSync(archivePage, "utf8") !== archiveBefore) {
  throw new Error("archive.html did not restore");
}

let failed = false;
try {
  saveEpisode({
    id: "SMOKE-BAD",
    sortOrder: 1,
    title: "x",
    description: "y",
    theme: "broadcast",
    sources: { youtube: "javascript:alert(1)" },
  });
  failed = true;
} catch (error) {
  if (!String(error.message).includes("http")) throw error;
} finally {
  fs.writeFileSync(CATALOG_FILE, catalogBefore, "utf8");
  fs.writeFileSync(archivePage, archiveBefore, "utf8");
  fs.writeFileSync(episodesPage, episodesBefore, "utf8");
}
if (failed) throw new Error("javascript: URL should be rejected");

console.log("OK smoke-episode-catalog");
