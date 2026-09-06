#!/usr/bin/env node
/**
 * Verify public/ contains the runtime site and not kitchen files.
 *
 * Usage (repo root):
 *   node scripts/verify-public-build.js
 */
"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const OUT = path.join(ROOT, "public");

const REQUIRED_PAGES = [
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
  "documents/book-sweet-dream.html",
  "locations/red-room-cafe.html",
  "locations/red-room-shift.html",
  "locations/pavel-observation-booth.html",
  "locations/solnyshko-after-hours.html",
  "css/style.css",
  "css/curator-call.css",
  "css/red-room-espresso.css",
  "css/lora-red-room.css",
  "css/auth.css",
  "js/dossier-store.js",
  "js/app.js",
  "js/lora-red-room.js",
  "js/red-room-espresso.js",
  "js/auth-confirm.js",
  "js/archive-catalog.js",
  "js/sweet-dream-book.js",
  "content/irina/call-content.js",
  "content/irina/solnyshko-park-content.js",
  "content/lora/red-room-content.js",
  "content/pavel/observation-booth-content.js",
  "css/solnyshko-park.css",
  "css/pavel-observation-booth.css",
  "css/game-ui.css",
  "css/game-ui-themes.css",
  "js/solnyshko-park.js",
  "js/solnyshko-cotton.js",
  "js/pavel-observation-booth.js",
  "js/game-ui-kit.js",
  "js/game-ui-audio-library.js",
  "content/archive/episode-catalog.js",
  "content/book/sweet-dream-book.js",
  "favicon.ico",
  "robots.txt",
  "sitemap.xml",
  "_headers",
  "_redirects",
  "404.html",
  "assets/guest/logo.svg",
  "assets/staff/logo.png",
  "assets/og-image.png",
  "assets/audio/guest/theme.MP3",
  "assets/audio/curator/call-room-tone.ogg",
  "assets/audio/curator/call-room-tone.mp3",
  "assets/audio/curator/sfx/elena-tick-loop.ogg",
  "assets/audio/curator/sfx/elena-tick-loop.mp3",
  "assets/guest/red-room/lora/scenes/v01-empty-counter-v1.webp",
  "assets/guest/red-room/lora/scenes/dog-suit-wander-v2.mp4",
  "assets/guest/red-room/lora/scenes/dog-suit-sleep-start-v2.webp",
  "assets/staff/curators/irina/state-neutral.mp4",
  "assets/staff/curators/irina/state-neutral-poster.webp",
  "assets/staff/curators/irina/room-empty.webp",
  "assets/guest/locations/solnyshko/gate-closed-loop.mp4",
  "assets/guest/locations/solnyshko/park-wide-15s.mp4",
  "assets/guest/locations/solnyshko/irina-cotton-offer.mp4",
  "assets/guest/locations/solnyshko/irina-cotton-lookaway.mp4",
  "assets/guest/solnyshko/game/cotton-machine-idle.webp",
  "assets/guest/solnyshko/game/cotton-machine-sugar.webp",
  "assets/guest/solnyshko/game/cotton-machine-ready.webp",
  "assets/guest/solnyshko/game/cotton-machine-spin.mp4",
  "assets/guest/locations/pavel/storage-slide-loop.mp4",
  "assets/guest/locations/pavel/storage-slide-loop.webp",
  "assets/guest/locations/pavel/storage-slide-light.webp",
  "assets/guest/locations/pavel/senior-guide-waiting.mp4",
  "assets/guest/locations/pavel/senior-guide-waiting.webp",
  "assets/guest/locations/pavel/senior-guide-slide-exit.mp4",
  "assets/guest/locations/pavel/bedroom-base.webp",
  "assets/guest/locations/pavel/drain-hungry.webp",
  "assets/guest/locations/pavel/drain-hair-long.mp4",
  "assets/guest/locations/pavel/drain-hair-long.webp",
  "assets/guest/locations/pavel/nightstand-cassette.webp",
  "assets/guest/locations/pavel/storage-base.webp",
  "assets/guest/locations/pavel/storage-provisions.webp",
  "assets/guest/locations/pavel/storage-cleaner-bottle.webp",
  "assets/guest/locations/pavel/control-pavel-right.mp4",
  "assets/guest/locations/pavel/control-pavel-right-start.webp",
  "assets/guest/locations/pavel/control-pavel-right-hold.webp",
  "assets/guest/locations/pavel/control-right-disabled.webp",
  "assets/guest/locations/pavel/control-intro-mask-off.mp4",
  "assets/guest/locations/pavel/control-intro-mask-off-start.webp",
  "assets/guest/locations/pavel/control-intro-mask-off-hold.webp",
  "assets/guest/locations/pavel/control-listening.mp4",
  "assets/guest/locations/pavel/control-listening-start.webp",
  "assets/guest/locations/pavel/control-listening-hold.webp",
  "assets/guest/locations/pavel/control-look-back.mp4",
  "assets/guest/locations/pavel/control-look-back-start.webp",
  "assets/guest/locations/pavel/control-look-back-hold.webp",
  "assets/guest/locations/pavel/control-smile.mp4",
  "assets/guest/locations/pavel/control-smile-start.webp",
  "assets/guest/locations/pavel/control-smile-hold.webp",
  "assets/guest/locations/pavel/control-yawn.mp4",
  "assets/guest/locations/pavel/control-yawn-start.webp",
  "assets/guest/locations/pavel/control-yawn-hold.webp",
  "assets/guest/locations/pavel/control-screens-glitch.mp4",
  "assets/guest/locations/pavel/control-screens-glitch-start.webp",
  "assets/guest/locations/pavel/control-screens-glitch-hold.webp",
  "assets/guest/locations/pavel/control-channel-switch.mp4",
  "assets/guest/locations/pavel/control-channel-switch-start.webp",
  "assets/guest/locations/pavel/control-channel-switch-hold.webp",
  "assets/guest/locations/pavel/nightstand-cassette.mp4",
  "assets/guest/locations/pavel/nightstand-cassette-start.webp",
  "assets/guest/locations/pavel/drain-hungry.mp4",
  "assets/guest/locations/pavel/drain-vague.mp4",
  "assets/guest/locations/pavel/drain-vague.webp",
  "assets/guest/locations/pavel/drain-beckon.mp4",
  "assets/guest/locations/pavel/drain-beckon.webp",
  "assets/guest/locations/pavel/drain-cough.mp4",
  "assets/guest/locations/pavel/drain-cough-start.webp",
  "assets/guest/locations/pavel/drain-cough.webp",
  "assets/guest/locations/pavel/control-empty.mp4",
  "assets/guest/locations/pavel/control-empty.webp",
  "assets/guest/locations/pavel/hatch-tray.mp4",
  "assets/guest/locations/pavel/hatch-tray-start.webp",
  "assets/guest/locations/pavel/hatch-tray.webp",
  "assets/guest/locations/pavel/hatch-gasmask.mp4",
  "assets/guest/locations/pavel/hatch-gasmask-start.webp",
  "assets/guest/locations/pavel/hatch-gasmask-hold.webp",
  "assets/guest/locations/pavel/hatch-dessert.mp4",
  "assets/guest/locations/pavel/hatch-dessert-start.webp",
  "assets/guest/locations/pavel/hatch-dessert-hold.webp",
  "assets/guest/locations/pavel/tour-control.mp4",
  "assets/guest/locations/pavel/tour-control-start.webp",
  "assets/guest/locations/pavel/tour-control-hold.webp",
  "assets/guest/locations/pavel/tour-bedroom.mp4",
  "assets/guest/locations/pavel/tour-bedroom.webp",
  "assets/guest/locations/pavel/tour-bathroom.mp4",
  "assets/guest/locations/pavel/tour-bathroom-start.webp",
  "assets/guest/locations/pavel/tour-bathroom-hold.webp",
  "assets/guest/locations/pavel/tour-storage.mp4",
  "assets/guest/locations/pavel/tour-storage-start.webp",
  "assets/guest/locations/pavel/tour-storage-hold.webp",
  "assets/guest/locations/pavel/tour-hatch.mp4",
  "assets/guest/locations/pavel/tour-hatch-start.webp",
  "assets/guest/locations/pavel/tour-hatch-hold.webp",
];

const FORBIDDEN_PREFIXES = [
  ".git/",
  ".github/",
  "admin/",
  "scripts/",
  "docs/",
  "projects/",
  "supabase/",
  "AGENTS.md",
  ".env",
];

const FORBIDDEN_SUBSTRINGS = [
  "/concepts/",
  "/staging/",
  "/reference-sheets/",
  "/release-candidate/",
  "/raw/",
  "/prompts/",
  "queue.json",
];

const FORBIDDEN_NAMES = new Set([
  "AGENTS.md",
  "documents.html",
  "photos.html",
  "queue.json",
]);

const SECRET_NAMES = new Set([".env", ".env.local", ".env.production"]);

const LOCAL_REF =
  /(?:(?:\.\.\/)+)?(?:assets|js|css|content)\/[A-Za-z0-9_./-]+\.(?:html|css|js|png|jpe?g|gif|webp|svg|mp4|webm|mp3|MP3|wav|ogg|m4a|ico)/g;
const CSS_URL = /url\(\s*['"]([^'"]+)['"]\s*\)/gi;
const ATTR_REF =
  /(?:src|href|poster|data-fallback-src|data-poster|data-video-pool)\s*=\s*["']([^"']+)["']/gi;

const errors = [];
const warnings = [];

function posix(rel) {
  return rel.split(path.sep).join("/");
}

function walk(dir, acc = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const abs = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(abs, acc);
    else acc.push(abs);
  }
  return acc;
}

function existsExact(base, rel) {
  const parts = posix(rel).split("/");
  let dir = base;
  for (const part of parts) {
    if (!fs.existsSync(dir)) return false;
    const names = fs.readdirSync(dir);
    if (!names.includes(part)) return false;
    dir = path.join(dir, part);
  }
  return fs.statSync(dir).isFile();
}

function normalizeFrom(fromRel, raw) {
  const cleaned = String(raw || "")
    .split("?")[0]
    .split("#")[0]
    .trim();
  if (!cleaned || /^(https?:|data:|mailto:|#)/i.test(cleaned)) return null;
  if (cleaned.includes("${") || cleaned.includes(",")) return null;
  let resolved;
  if (/^(assets|js|css|content)\//.test(cleaned) || cleaned === "favicon.ico") {
    resolved = cleaned;
  } else if (cleaned.startsWith("/")) {
    resolved = cleaned.replace(/^\/+/, "");
  } else {
    const fromDir = path.posix.dirname(fromRel);
    resolved = path.posix.normalize(fromDir === "." ? cleaned : path.posix.join(fromDir, cleaned));
  }
  resolved = resolved.replace(/^\.\//, "");
  if (resolved.startsWith("../") || resolved === "..") return null;
  if (!path.extname(resolved)) return null;
  return resolved;
}

function checkForbidden(rel) {
  const posixRel = posix(rel);
  for (const prefix of FORBIDDEN_PREFIXES) {
    if (posixRel === prefix.replace(/\/$/, "") || posixRel.startsWith(prefix)) {
      errors.push(`forbidden path present: ${posixRel}`);
    }
  }
  for (const snippet of FORBIDDEN_SUBSTRINGS) {
    if (posixRel.includes(snippet)) errors.push(`forbidden path present: ${posixRel}`);
  }
  if (FORBIDDEN_NAMES.has(path.basename(posixRel))) {
    errors.push(`forbidden file present: ${posixRel}`);
  }
  if (SECRET_NAMES.has(path.basename(posixRel)) || posixRel.includes(".env.")) {
    errors.push(`secret-like file present: ${posixRel}`);
  }
}

function checkCodeRefs(rel, text) {
  const consider = (raw) => {
    String(raw || "")
      .split("|")
      .forEach((piece) => {
        const target = normalizeFrom(rel, piece);
        if (!target) return;
        if (!/^(assets|js|css|content)\//.test(target)) return;
        if (target.endsWith(".html")) return;
        if (!existsExact(OUT, target)) {
          errors.push(`${rel} references missing ${target}`);
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
}

function kitchenStrings(text, rel) {
  const needles = [
    "pixverse create",
    "projects/lora-red-room-motion",
    "OB-0000-DEV",
    "ТЕСТОВЫЙ СЛОТ",
    "Тестовый носитель из наволочки",
  ];
  for (const needle of needles) {
    if (text.includes(needle)) errors.push(`${rel} contains kitchen string: ${needle}`);
  }
}

function main() {
  if (!fs.existsSync(OUT)) {
    console.error("public/ is missing; run node scripts/build-public.js");
    process.exit(1);
  }

  const files = walk(OUT).map((abs) => posix(path.relative(OUT, abs)));
  files.forEach(checkForbidden);

  for (const req of REQUIRED_PAGES) {
    if (!existsExact(OUT, req)) errors.push(`required file missing: ${req}`);
  }

  for (const rel of files) {
    const ext = path.extname(rel);
    if (![".html", ".css", ".js"].includes(ext)) continue;
    const text = fs.readFileSync(path.join(OUT, rel), "utf8");
    checkCodeRefs(rel, text);
    kitchenStrings(text, rel);
  }

  if (files.includes("content/irina/README.md")) {
    errors.push("content/irina/README.md must not be public");
  }
  if (files.includes("assets/staff/curators/irina/manifest.json")) {
    warnings.push("irina manifest.json was copied; not fetched by runtime");
  }

  const bytes = files.reduce((sum, rel) => sum + fs.statSync(path.join(OUT, rel)).size, 0);
  console.log(`public files: ${files.length}`);
  console.log(`public bytes: ${bytes}`);
  warnings.forEach((item) => console.warn("WARN:", item));
  if (errors.length) {
    errors.forEach((item) => console.error("FAIL:", item));
    process.exit(1);
  }
  console.log("OK: public build verification passed");
}

main();
