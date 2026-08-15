#!/usr/bin/env node
/**
 * Serve public/ only. Does not read the source tree.
 *
 * Usage (repo root):
 *   node scripts/serve-public.js
 *
 * Default: http://127.0.0.1:4173/
 */
"use strict";

const fs = require("fs");
const http = require("http");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const OUT = path.join(ROOT, "public");
const HOST = "127.0.0.1";
const PORT = Number(process.env.PUBLIC_PORT || 4173);

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".ico": "image/x-icon",
  ".mp4": "video/mp4",
  ".mp3": "audio/mpeg",
  ".MP3": "audio/mpeg",
  ".ogg": "audio/ogg",
  ".wav": "audio/wav",
  ".xml": "application/xml; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
};

function insideOutput(abs) {
  const resolved = path.resolve(abs);
  return resolved === OUT || resolved.startsWith(OUT + path.sep);
}

function existsExact(abs) {
  if (!insideOutput(abs) || !fs.existsSync(abs)) return false;
  const rel = path.relative(OUT, abs);
  const parts = rel.split(path.sep);
  let dir = OUT;
  for (const part of parts) {
    const names = fs.readdirSync(dir);
    if (!names.includes(part)) return false;
    dir = path.join(dir, part);
  }
  return fs.statSync(dir).isFile();
}

function mapUrl(urlPath) {
  const decoded = decodeURIComponent(urlPath.split("?")[0]);
  const rel = decoded.replace(/^\/+/, "");
  if (!rel || rel.endsWith("/")) {
    const index = path.join(OUT, rel, "index.html");
    if (existsExact(index)) return index;
    if (!rel) {
      const rootIndex = path.join(OUT, "index.html");
      if (existsExact(rootIndex)) return rootIndex;
    }
  }
  const direct = path.join(OUT, rel);
  if (existsExact(direct)) return direct;
  if (!path.extname(rel)) {
    const html = path.join(OUT, `${rel}.html`);
    if (existsExact(html)) return html;
  }
  return null;
}

function send(res, status, type, body) {
  res.writeHead(status, {
    "Content-Type": type,
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
  });
  res.end(body);
}

if (!fs.existsSync(OUT)) {
  console.error("public/ is missing; run node scripts/build-public.js");
  process.exit(1);
}

const server = http.createServer((req, res) => {
  const mapped = mapUrl(req.url || "/");
  if (!mapped) {
    const notFound = path.join(OUT, "404.html");
    if (existsExact(notFound)) {
      send(res, 404, "text/html; charset=utf-8", fs.readFileSync(notFound));
      return;
    }
    send(res, 404, "text/plain; charset=utf-8", "Not found\n");
    return;
  }
  const ext = path.extname(mapped);
  const type = TYPES[ext] || "application/octet-stream";
  send(res, 200, type, fs.readFileSync(mapped));
});

server.listen(PORT, HOST, () => {
  console.log(`serving ${path.relative(ROOT, OUT)} at http://${HOST}:${PORT}/`);
});
