#!/usr/bin/env node

/**
 * Graph sync: drafts/pavel-booth-script.md → observation-booth-content.js
 * Merges literary + mechanical fields from the draft; keeps live extras
 * (effect, artifact, complete, guestExit, delay) when the draft omits them.
 */

"use strict";

const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { parseDocument } = require("./lib/pavel-booth-script-md");

const projectRoot = path.resolve(__dirname, "..");
const draftPath = path.join(projectRoot, "docs", "drafts", "pavel-booth-script.md");
const contentPath = path.join(
  projectRoot,
  "content",
  "pavel",
  "observation-booth-content.js"
);

const SKIP_UNREACHABLE = new Set(["hatch-knock-1"]);

const toFlagList = (value) => {
  if (value == null || value === false || value === "") return null;
  if (Array.isArray(value)) return value;
  return [String(value)];
};

const loadLive = () => {
  const sandbox = { window: {}, console };
  vm.runInNewContext(fs.readFileSync(contentPath, "utf8"), sandbox, {
    filename: contentPath,
    timeout: 3000,
  });
  return sandbox.window.TyndexPavelObservationBoothContent;
};

const buildChoice = (choice, liveChoice) => {
  const next = {
    label: choice.label,
    next: choice.next,
  };
  const imageAlt = choice.imageAlt || liveChoice?.imageAlt;
  if (imageAlt) next.imageAlt = imageAlt;
  const mech = choice.mech || {};
  ["set", "hideIf", "require", "requireAny"].forEach((key) => {
    const list = toFlagList(mech[key]);
    if (list) next[key] = list;
  });
  ["sound", "artifact", "effect", "image"].forEach((key) => {
    if (mech[key] != null && mech[key] !== false) next[key] = mech[key];
  });
  if (mech._stage1Keep === true || liveChoice?._stage1Keep === true) {
    next._stage1Keep = true;
  }
  if (liveChoice?.image && !next.image) next.image = liveChoice.image;
  if (liveChoice?.effect && !next.effect) next.effect = liveChoice.effect;
  return next;
};

const buildNode = (draft, liveNode) => {
  const node = {
    room: draft.room || liveNode?.room,
    speaker: draft.speaker,
    text: draft.text,
    visual: draft.visual || liveNode?.visual,
  };
  const sound = draft.sound || liveNode?.sound;
  if (sound) node.sound = sound;
  const imageAlt = draft.imageAlt || liveNode?.imageAlt;
  if (imageAlt) node.imageAlt = imageAlt;
  if (draft.refusalText) node.refusalText = draft.refusalText;
  else if (liveNode?.refusalText) node.refusalText = liveNode.refusalText;
  const effect = draft.effect || liveNode?.effect;
  if (effect) node.effect = effect;
  const artifact = draft.artifact || liveNode?.artifact;
  if (artifact) node.artifact = artifact;
  if (draft.complete || liveNode?.complete) node.complete = true;
  if (draft.guestExit || liveNode?.guestExit) node.guestExit = true;
  const delay = draft.delay != null && !Number.isNaN(draft.delay) ? draft.delay : liveNode?.delay;
  if (delay != null) node.delay = delay;
  if (liveNode?.transcript) node.transcript = liveNode.transcript;
  if (liveNode?.action) node.action = liveNode.action;

  let choices = draft.choices.map((choice, index) =>
    buildChoice(choice, liveNode?.choices?.[index])
  );

  if (draft.id === "hatch-note" && !choices.some((choice) => choice.next === "hatch-glass")) {
    choices = [
      ...choices,
      {
        label: "Заглянуть за стекло",
        next: "hatch-glass",
      },
    ];
  }

  node.choices = choices;
  return node;
};

const serializeValue = (value, indent) => {
  const pad = " ".repeat(indent);
  const inner = " ".repeat(indent + 2);
  if (value == null) return "null";
  if (typeof value === "boolean" || typeof value === "number") return String(value);
  if (typeof value === "string") return JSON.stringify(value);
  if (Array.isArray(value)) {
    if (value.length === 0) return "[]";
    if (value.every((item) => typeof item !== "object")) {
      return `[${value.map((item) => JSON.stringify(item)).join(", ")}]`;
    }
    const items = value.map((item) => `${inner}${serializeValue(item, indent + 2)}`);
    return `[\n${items.join(",\n")}\n${pad}]`;
  }
  const keys = Object.keys(value);
  if (keys.length === 0) return "{}";
  const lines = keys.map((key) => {
    const keyText = /^[A-Za-z_][\w]*$/.test(key) ? key : JSON.stringify(key);
    return `${inner}${keyText}: ${serializeValue(value[key], indent + 2)}`;
  });
  return `{\n${lines.join(",\n")}\n${pad}}`;
};

const live = loadLive();
const draft = parseDocument(fs.readFileSync(draftPath, "utf8"));
const nodes = {};
const longTexts = [];

draft.nodes.forEach((node) => {
  if (SKIP_UNREACHABLE.has(node.id)) return;
  const built = buildNode(node, live.nodes[node.id]);
  if (built.text && built.text.length > 180) {
    longTexts.push(`${node.id} (${built.text.length})`);
  }
  nodes[node.id] = built;
});

Object.keys(live.nodes).forEach((id) => {
  if (!nodes[id] && !SKIP_UNREACHABLE.has(id)) {
    nodes[id] = live.nodes[id];
  }
});

if (longTexts.length) {
  console.error("Texts over 180 characters:");
  longTexts.forEach((line) => console.error(`  ${line}`));
  process.exit(1);
}

const START_MARKER = "  const startNode = \"booth-intro\";\n\n  const nodes = {";
const END_MARKER = "  window.TyndexPavelObservationBoothContent";

const source = fs.readFileSync(contentPath, "utf8");
const start = source.indexOf(START_MARKER);
const end = source.indexOf(END_MARKER);
if (start === -1 || end === -1) {
  throw new Error("Could not find nodes block (startNode + nodes)");
}

let nextSource = source;
if (!nextSource.includes('"hatch-knock-3": Object.freeze({ id: "hatch-knock-3" })')) {
  nextSource = nextSource.replace(
    '"test-click": Object.freeze({ id: "test-click" }),\n  });',
    '"test-click": Object.freeze({ id: "test-click" }),\n    "hatch-knock-3": Object.freeze({ id: "hatch-knock-3" }),\n  });'
  );
}

const nodesInner = serializeValue(nodes, 2);
if (!nodesInner.startsWith("{")) {
  throw new Error("nodes serialize must be an object");
}
const nodesLiteral = `  const startNode = "booth-intro";\n\n  const nodes = ${nodesInner};\n\n`;
nextSource = `${nextSource.slice(0, start)}${nodesLiteral}${nextSource.slice(end)}`;
fs.writeFileSync(contentPath, nextSource);
console.log(`Wrote ${Object.keys(nodes).length} nodes to ${path.relative(projectRoot, contentPath)}`);
