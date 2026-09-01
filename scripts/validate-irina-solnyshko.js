#!/usr/bin/env node
"use strict";

const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const file = path.resolve(__dirname, "..", "content", "irina", "solnyshko-park-content.js");
const source = fs.readFileSync(file, "utf8");
const sandbox = { window: {} };
vm.runInNewContext(source, sandbox, { filename: file, timeout: 4000 });
const content = sandbox.window.TyndexIrinaSolnyshkoContent;
const errors = [];

if (content?.version !== 1) errors.push("version must be 1");
if (!content?.nodes || typeof content.nodes !== "object") errors.push("nodes missing");
const nodes = content?.nodes || {};
const ids = Object.keys(nodes);
if (ids.length < 10 || ids.length > 16) errors.push("after-hours must contain 10-16 nodes");
if (content?.startNode !== "gate-night") errors.push("startNode must be gate-night");
if (!nodes[content?.startNode]) errors.push("startNode missing");
if (JSON.stringify(content.acceptedDates) !== JSON.stringify(["12.08.26"])) {
  errors.push("accepted postcard dates changed");
}
if (!nodes["birthday-check"]?.input) errors.push("birthday path must keep a visible date input");
if (!nodes["birthday-check"]?.choices?.some((choice) => choice.inspect === "artifact" && choice.artifactId === "animator-postcard")) {
  errors.push("animator postcard inspect missing");
}
if (nodes["gate-night"]?.choices?.length !== 4) {
  errors.push("gate must expose four entry reasons to every player");
}
if (!nodes["gate-night"]?.choices?.some((choice) => choice.next === "birthday-check")) {
  errors.push("birthday password branch missing");
}
if (!nodes["gate-night"]?.choices?.some((choice) => choice.next === "volunteer-pass")) {
  errors.push("volunteer access branch missing");
}
if (!nodes["volunteer-pass"]?.choices?.some((choice) => choice.inspect === "artifact" && choice.artifactId === "volunteer-leaflet" && choice.nextAfterInspect === "park-grounds")) {
  errors.push("volunteer leaflet handoff missing");
}
if (!nodes["park-grounds"]?.choices?.some((choice) => choice.next === "irina-found")) {
  errors.push("cotton candy stand choice missing from park grounds");
}
if (!nodes["irina-hello"]?.choices?.some((choice) => String(choice.href || "").includes("staff.html?personnel=pavel"))) {
  errors.push("final OK must eject to staff.html?personnel=pavel");
}
if (!nodes["irina-hello"]?.choices?.some((choice) => choice.restart === true)) {
  errors.push("final node must offer a new session");
}
if (!source.includes("РАЗБЛОКИРОВАН НОВЫЙ ID СОТРУДНИКА")) {
  errors.push("unlock notice copy missing");
}

const visited = new Set();
const visit = (id) => {
  if (visited.has(id) || !nodes[id]) return;
  visited.add(id);
  (nodes[id].choices || []).forEach((choice) => {
    if (choice.inspect && !choice.next) return;
    if (choice.restart) return;
    if (choice.href) return;
    if (!choice.next || !nodes[choice.next]) errors.push(`${id}: missing next node ${choice.next}`);
    if (choice.next) visit(choice.next);
  });
  if (nodes[id].input?.next) {
    if (!nodes[nodes[id].input.next]) errors.push(`${id}: missing input next ${nodes[id].input.next}`);
    visit(nodes[id].input.next);
  }
};
visit(content?.startNode);
ids.filter((id) => !visited.has(id)).forEach((id) => errors.push(`unreachable node: ${id}`));

ids.forEach((id) => {
  const node = nodes[id];
  if (!node.speaker || !node.text) errors.push(`${id}: visible speaker/text missing`);
  if (!Array.isArray(node.choices)) errors.push(`${id}: choices must be an array`);
  if (node.media) {
    if (node.media.src && (!node.media.poster || !node.mediaFallback)) {
      errors.push(`${id}: video slot requires poster and visible fallback`);
    }
    if (!node.media.poster || !node.mediaFallback) errors.push(`${id}: media fallback contract incomplete`);
    if (node.media.loop === false && node.media.src && !node.media.playedFlag) {
      errors.push(`${id}: one-shot media requires playedFlag`);
    }
  }
});

const finalNodes = ids.filter((id) => nodes[id].complete);
if (source.includes("0274-P")) errors.push("solnyshko quest must not reveal Pavel ID");

const assetRoot = path.resolve(__dirname, "..");
[
  "assets/guest/locations/solnyshko/gate-closed-loop.mp4",
  "assets/guest/locations/solnyshko/gate-refuse.mp4",
  "assets/guest/locations/solnyshko/gate-open-enter.mp4",
  "assets/guest/locations/solnyshko/park-wide-15s.mp4",
  "assets/guest/locations/solnyshko/carousel-empty-10s.mp4",
  "assets/guest/locations/solnyshko/irina-cotton-wait.mp4",
  "assets/guest/locations/solnyshko/irina-cotton-offer.mp4",
  "assets/guest/locations/solnyshko/irina-cotton-lookaway.mp4",
].forEach((rel) => {
  if (!fs.existsSync(path.join(assetRoot, rel))) errors.push(`missing media ${rel}`);
});
if (!source.includes("РАЗБЛОКИРОВАН НОВЫЙ ID СОТРУДНИКА")) {
  errors.push("unlock announcement copy missing");
}
if (!source.includes('"birthday-recorded"')) {
  errors.push("impostor registration node missing");
}
if (!source.includes("ДАТА ПРИНЯТА.\\nЛИЧНОЕ ДЕЛО НЕ НАЙДЕНО.\\nВХОД ЗАРЕГИСТРИРОВАН.")) {
  errors.push("impostor registration copy missing");
}
if (finalNodes.length !== 1) errors.push("exactly one completion node required");

if (errors.length) {
  errors.forEach((error) => console.error(`ERROR ${error}`));
  process.exit(1);
}
console.log(`OK irina-solnyshko: ${ids.length} nodes, ${visited.size} reachable`);
