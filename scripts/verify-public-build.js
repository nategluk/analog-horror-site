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
  "documents.html",
  "donate.html",
  "episodes.html",
  "faq.html",
  "hiring.html",
  "locations.html",
  "photos.html",
  "staff.html",
  "auth/confirm.html",
  "locations/red-room-cafe.html",
  "locations/red-room-shift.html",
  "css/style.css",
  "css/lora-red-room.css",
  "css/auth.css",
  "js/dossier-store.js",
  "js/app.js",
  "js/lora-red-room.js",
  "js/red-room-espresso.js",
  "js/auth-confirm.js",
  "js/archive-catalog.js",
  "content/irina/call-content.js",
  "content/lora/red-room-content.js",
  "content/archive/episode-catalog.js",
  "favicon.ico",
  "robots.txt",
  "sitemap.xml",
  "_headers",
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
  const needles = ["pixverse create", "projects/lora-red-room-motion"];
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
