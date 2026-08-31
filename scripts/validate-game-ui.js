#!/usr/bin/env node
"use strict";

const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { execFileSync } = require("node:child_process");

const root = path.resolve(__dirname, "..");
const errors = [];
const requiredSlots = [
  "data-game-ui",
  "data-game-ui-top",
  "data-game-ui-stage-wrap",
  "data-game-ui-hud",
  "data-game-ui-stage",
  "data-game-ui-still",
  "data-game-ui-video",
  "data-game-ui-panel",
  "data-game-ui-bubble",
  "data-game-ui-speaker",
  "data-game-ui-line",
  "data-game-ui-action",
  "data-game-ui-choices",
  "data-game-ui-live",
];
const tokenNames = [
  "--game-ui-display",
  "--game-ui-body",
  "--game-ui-mono",
  "--game-ui-document",
  "--game-ui-ink",
  "--game-ui-muted",
  "--game-ui-line",
  "--game-ui-panel",
  "--game-ui-accent",
  "--game-ui-danger",
  "--game-ui-line-size",
  "--game-ui-choice-row",
];

const rel = (...parts) => path.join(root, ...parts);
const read = (...parts) => fs.readFileSync(rel(...parts), "utf8");

const loadWindow = (fileRel) => {
  const sandbox = { window: {}, document: {}, localStorage: {}, performance: { now: () => 0 } };
  sandbox.window = sandbox;
  vm.runInNewContext(read(fileRel), sandbox, { filename: fileRel, timeout: 4000 });
  return sandbox.window;
};

["js/game-ui-kit.js", "js/game-ui-audio-library.js", "js/game-ui-fixture.js", "content/game-ui/fixture-content.js"].forEach(
  (file) => {
    try {
      execFileSync(process.execPath, ["--check", rel(file)], { stdio: "pipe" });
    } catch {
      errors.push(`${file}: node --check failed`);
    }
  }
);

const fixtureHtml = read("locations/game-ui-fixture.html");
requiredSlots.forEach((slot) => {
  if (!fixtureHtml.includes(slot)) errors.push(`fixture HTML missing ${slot}`);
});
if (!/noindex/.test(fixtureHtml)) errors.push("fixture must stay noindex");

const css = read("css/game-ui.css");
tokenNames.forEach((token) => {
  if (!css.includes(token)) errors.push(`game-ui.css missing ${token}`);
});

const audioWin = loadWindow("js/game-ui-audio-library.js");
const catalog = audioWin.TyndexGameUiAudioLibrary?.catalog || {};
const readme = read("assets/audio/README.md");
const readmeIds = [...readme.matchAll(/\| `([^`]+)` \| `(assets\/[^`]+)` \|/g)];
readmeIds.forEach(([, id, src]) => {
  if (!catalog[id]) errors.push(`audio library missing README id ${id}`);
  else if (catalog[id].src !== src) errors.push(`${id} src mismatch`);
  if (!fs.existsSync(rel(src))) errors.push(`missing audio file ${src}`);
});
Object.values(catalog).forEach((entry) => {
  if (entry?.src && !fs.existsSync(rel(entry.src))) errors.push(`catalog file missing ${entry.src}`);
});

const kitWin = loadWindow("js/game-ui-kit.js");
["createSaveAdapter", "createLineRenderer", "createChoiceRenderer", "createMediaController", "createAudioRack", "bindShell"].forEach(
  (name) => {
    if (typeof kitWin.TyndexGameUi?.[name] !== "function") errors.push(`kit missing ${name}`);
  }
);

const contentWin = loadWindow("content/game-ui/fixture-content.js");
const content = contentWin.TyndexGameUiFixtureContent;
if (content?.version !== 1) errors.push("fixture content version");
const nodes = content?.nodes || {};
const ids = Object.keys(nodes);
if (!nodes[content?.startNode]) errors.push("fixture startNode missing");

const countChars = (value) => String(value || "").replace(/\s+/g, " ").trim().length;

ids.forEach((id) => {
  const node = nodes[id];
  if (!node.speaker || !node.line) errors.push(`${id}: speaker/line missing`);
  if (!["dialogue", "thought", "system", "document"].includes(node.kind)) {
    errors.push(`${id}: kind`);
  }
  if (countChars(node.line) > 160 && !node.allowLongText) errors.push(`${id}: line too long`);
  const visual = content.visuals[node.visual];
  if (!visual) errors.push(`${id}: visual missing`);
  else if (!visual.fallback?.still) errors.push(`${id}: visual fallback still missing`);
  const top = (node.choices || []).filter(
    (choice) => choice.variant !== "back" && (choice.variant === "group" || !choice.group)
  );
  if (top.length > 4) errors.push(`${id}: more than four top-level choices`);
  (node.choices || []).forEach((choice) => {
    if (countChars(choice.label) > 40 && !choice.allowLongChoice) {
      errors.push(`${id}: choice too long (${choice.label})`);
    }
  });
});

const publicBuild = read("scripts/build-public.js");
if (publicBuild.includes("game-ui-fixture.html")) {
  errors.push("fixture must stay out of public SITE_PAGES");
}

if (errors.length) {
  console.error(`FAIL game-ui: ${errors.length}`);
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log(`OK game-ui: ${ids.length} fixture nodes, ${Object.keys(catalog).length} audio ids`);
