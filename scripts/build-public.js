#!/usr/bin/env node
/**
 * Production allowlist build.
 *
 * Copies only runtime-required site files into public/.
 * Does not delete or move source media. Does not deploy.
 *
 * Usage (repo root):
 *   node scripts/build-public.js
 *
 * Then serve the output, not the repo root:
 *   node scripts/serve-public.js
 */
"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const OUT = path.join(ROOT, "public");

const SITE_PAGES = [
  "index.html",
  "about.html",
  "archive.html",
  "donate.html",
  "episodes.html",
  "faq.html",
  "hiring.html",
  "locations.html",
  "staff.html",
  "auth/confirm.html",
  "documents/dossier-kirill-zaytsev.html",
  "documents/dossier-laura.html",
  "documents/dossier-irina.html",
  "documents/dossier-pavel.html",
  "documents/dossier-sz-312.html",
  "documents/protocol-312-r.html",
  "documents/protocol-312-t.html",
  "documents/protocol-avd-312-17.html",
  "documents/protocol-media-integration.html",
  "documents/protocol-playground.html",
  "documents/book-sweet-dream.html",
  "locations/detskiy-zhir-mall.html",
  "locations/dolphin-pool.html",
  "locations/illusion-cinema.html",
  "locations/losiny-ostrov-zoo.html",
  "locations/red-room-cafe.html",
  "locations/red-room-shift.html",
  "locations/solnyshko-park.html",
  "locations/solnyshko-after-hours.html",
  "locations/pavel-observation-booth.html",
  "staff/locations/detskiy-zhir-mall.html",
  "staff/locations/dolphin-pool.html",
  "staff/locations/illusion-cinema.html",
  "staff/locations/losiny-ostrov-zoo.html",
  "staff/locations/red-room-cafe.html",
  "staff/locations/solnyshko-park.html",
];

const ROOT_EXTRAS = ["favicon.ico", "robots.txt", "sitemap.xml", "_headers", "_redirects"];

// Runtimes loaded from app.js via basename URLs, so the generic reference
// scanner cannot resolve them from the quoted strings alone. Queueing them
// also lets the scanner collect their current media references.
const DYNAMIC_CODE = ["js/lora-red-room.js", "js/pavel-observation-booth.js"];

const MEDIA_EXT = new Set([
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".webp",
  ".svg",
  ".mp4",
  ".webm",
  ".mp3",
  ".MP3",
  ".wav",
  ".ogg",
  ".m4a",
  ".ico",
]);

const CODE_EXT = new Set([".html", ".css", ".js"]);

const ROOT_PREFIX = /^(?:assets|js|css|content)\//;
const LOCAL_REF =
  /(?:(?:\.\.\/)+)?(?:assets|js|css|content)\/[A-Za-z0-9_./-]+\.(?:html|css|js|png|jpe?g|gif|webp|svg|mp4|webm|mp3|MP3|wav|ogg|m4a|ico)/g;
const CSS_URL = /url\(\s*['"]([^'"]+)['"]\s*\)/gi;
const ATTR_REF =
  /(?:src|href|poster|data-fallback-src|data-poster|data-video-pool)\s*=\s*["']([^"']+)["']/gi;
const QUOTED_FILE =
  /["']((?:\.\.\/)*(?:assets|js|css|content)\/[A-Za-z0-9_./-]+\.[A-Za-z0-9]+)["']/g;
const AMBIENT_FILE =
  /["'`]((?:(?:\.\.\/)+)?assets\/[A-Za-z0-9_./-]+)\.\$\{(?:ambientExtension)\}["'`]/g;
const MEDIA_NAME = /["']([A-Za-z0-9_.-]+\.(?:webp|png|jpg|jpeg|mp4|mp3|ogg|wav|MP3))["']/g;

function posix(rel) {
  return rel.split(path.sep).join("/");
}

function stripQuery(filePath) {
  return filePath.split("?")[0].split("#")[0];
}

function isCopyable(rel) {
  if (!rel || rel.includes("${") || rel.includes("%") || rel.includes(",")) return false;
  const ext = path.extname(rel);
  if (rel === "_headers" || rel === "_redirects") return true;
  if (!ext) return false;
  return MEDIA_EXT.has(ext) || CODE_EXT.has(ext) || ext === ".xml" || ext === ".txt";
}

function normalizeFrom(fromRel, raw) {
  const cleaned = stripQuery(String(raw || "").trim());
  if (!cleaned || cleaned.startsWith("http://") || cleaned.startsWith("https://")) {
    return null;
  }
  if (cleaned.startsWith("data:") || cleaned.startsWith("mailto:") || cleaned.startsWith("#")) {
    return null;
  }
  if (cleaned.includes("${")) return null;
  let resolved;
  if (ROOT_PREFIX.test(cleaned) || cleaned === "favicon.ico") {
    resolved = cleaned;
  } else if (cleaned.startsWith("/")) {
    resolved = cleaned.replace(/^\/+/, "");
  } else {
    const fromDir = path.posix.dirname(fromRel);
    resolved = path.posix.normalize(fromDir === "." ? cleaned : path.posix.join(fromDir, cleaned));
  }
  resolved = resolved.replace(/^\.\//, "");
  if (resolved.startsWith("../") || resolved === ".." || path.isAbsolute(resolved)) {
    return null;
  }
  if (!isCopyable(resolved)) return null;
  return resolved;
}

function add(set, rel) {
  if (!rel || !isCopyable(rel)) return;
  const normalized = posix(rel);
  if (path.extname(normalized) === ".html" && !SITE_PAGES.includes(normalized)) return;
  set.add(normalized);
}

function read(rel) {
  return fs.readFileSync(path.join(ROOT, rel), "utf8");
}

function existsExact(rel) {
  const abs = path.join(ROOT, rel);
  if (!fs.existsSync(abs)) return false;
  const parts = posix(rel).split("/");
  let dir = ROOT;
  for (const part of parts) {
    const names = fs.readdirSync(dir);
    if (!names.includes(part)) return false;
    dir = path.join(dir, part);
  }
  return true;
}

function harvestText(fromRel, text, files, queue) {
  const consider = (raw) => {
    if (!raw) return;
    String(raw)
      .split("|")
      .forEach((piece) => {
        const rel = normalizeFrom(fromRel, piece);
        if (!rel) return;
        add(files, rel);
        const ext = path.extname(rel);
        if ((ext === ".css" || ext === ".js") && !queue.seen.has(rel)) {
          queue.seen.add(rel);
          queue.list.push(rel);
        }
      });
  };

  let match;
  ATTR_REF.lastIndex = 0;
  while ((match = ATTR_REF.exec(text))) consider(match[1]);

  CSS_URL.lastIndex = 0;
  while ((match = CSS_URL.exec(text))) consider(match[1]);

  LOCAL_REF.lastIndex = 0;
  while ((match = LOCAL_REF.exec(text))) consider(match[0]);

  QUOTED_FILE.lastIndex = 0;
  while ((match = QUOTED_FILE.exec(text))) consider(match[1]);

  AMBIENT_FILE.lastIndex = 0;
  while ((match = AMBIENT_FILE.exec(text))) {
    consider(`${match[1]}.ogg`);
    consider(`${match[1]}.mp3`);
  }
}

function harvestIrina(files) {
  const rel = "content/irina/call-content.js";
  const text = read(rel);
  const mediaBaseMatch = text.match(/mediaBase:\s*["']([^"']+)["']/);
  const mediaBase = (mediaBaseMatch ? mediaBaseMatch[1] : "assets/staff/curators/irina/").replace(
    /\/?$/,
    "/"
  );
  add(files, rel);
  for (const key of text.matchAll(/media:\s*"([a-z0-9-]+)"/g)) {
    add(files, `${mediaBase}${key[1]}.mp4`);
    add(files, `${mediaBase}${key[1]}-poster.webp`);
  }
  add(files, `${mediaBase}room-empty.webp`);
}

function harvestLora(files) {
  const rel = "js/lora-red-room.js";
  const text = read(rel);
  add(files, rel);
  add(files, "content/lora/red-room-content.js");
  const motionDir = "../assets/guest/red-room/lora/scenes/";
  const shiftDir = "../assets/audio/guest/red-room/shift/";
  MEDIA_NAME.lastIndex = 0;
  let match;
  while ((match = MEDIA_NAME.exec(text))) {
    const name = match[1];
    if (name.startsWith("assets/") || name.includes("/")) continue;
    if (name.startsWith("sfx-") || name.startsWith("bed-")) {
      add(files, normalizeFrom(rel, shiftDir + name));
    } else {
      add(files, normalizeFrom(rel, motionDir + name));
    }
  }
}

function harvestEspresso(files) {
  const rel = "js/red-room-espresso.js";
  const text = read(rel);
  add(files, rel);
  MEDIA_NAME.lastIndex = 0;
  let match;
  while ((match = MEDIA_NAME.exec(text))) {
    const name = match[1];
    if (name.startsWith("assets/")) continue;
    add(files, normalizeFrom(rel, `../assets/audio/guest/red-room/${name}`));
  }
}

function harvestSolnyshkoCotton(files) {
  const rel = "js/solnyshko-cotton.js";
  const text = read(rel);
  add(files, rel);
  MEDIA_NAME.lastIndex = 0;
  let match;
  while ((match = MEDIA_NAME.exec(text))) {
    const name = match[1];
    if (name.startsWith("assets/") || name.includes("/")) continue;
    add(files, normalizeFrom(rel, `../assets/audio/guest/solnyshko/${name}`));
  }
}

function collectAllowlist() {
  const files = new Set();
  const queue = { list: [], seen: new Set() };

  SITE_PAGES.forEach((page) => {
    add(files, page);
    queue.seen.add(page);
    queue.list.push(page);
  });
  ROOT_EXTRAS.forEach((item) => add(files, item));
  DYNAMIC_CODE.forEach((item) => {
    add(files, item);
    queue.seen.add(item);
    queue.list.push(item);
  });

  harvestIrina(files);
  harvestLora(files);
  harvestEspresso(files);
  harvestSolnyshkoCotton(files);

  while (queue.list.length) {
    const rel = queue.list.shift();
    const ext = path.extname(rel);
    if (!CODE_EXT.has(ext)) continue;
    const abs = path.join(ROOT, rel);
    if (!fs.existsSync(abs)) continue;
    harvestText(rel, fs.readFileSync(abs, "utf8"), files, queue);
  }

  return [...files].sort();
}

function assertSafeOutput() {
  const resolved = path.resolve(OUT);
  if (resolved === ROOT) {
    throw new Error("refusing to write public build into repo root");
  }
  if (!resolved.startsWith(ROOT + path.sep)) {
    throw new Error("public output must stay inside the repository");
  }
}

function emptyOutput() {
  assertSafeOutput();
  fs.rmSync(OUT, { recursive: true, force: true });
  fs.mkdirSync(OUT, { recursive: true });
}

function copyAllowlist(allowlist) {
  const missing = [];
  const copied = [];
  for (const rel of allowlist) {
    const src = path.join(ROOT, rel);
    if (!existsExact(rel) || !fs.statSync(src).isFile()) {
      missing.push(rel);
      continue;
    }
    const dest = path.join(OUT, rel);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(src, dest);
    copied.push(rel);
  }
  return { copied, missing };
}

function writeGenerated404() {
  const body = `<!DOCTYPE html>
<html lang="ru">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Материал не найден</title>
  </head>
  <body>
    <p>Материал не найден.</p>
  </body>
</html>
`;
  fs.writeFileSync(path.join(OUT, "404.html"), body);
}

function main() {
  process.chdir(ROOT);
  const allowlist = collectAllowlist();
  emptyOutput();
  const { copied, missing } = copyAllowlist(allowlist);
  writeGenerated404();
  if (missing.length) {
    console.error("Missing allowlist files:");
    missing.forEach((item) => console.error("  " + item));
    process.exit(1);
  }
  console.log(`public build: ${copied.length} files -> ${posix(path.relative(ROOT, OUT))}/`);
}

main();
