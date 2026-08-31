#!/usr/bin/env node

/**
 * Literary sync: draft markdown → observation-booth-content.js
 *
 * Default: dry-run. Writes only with --apply.
 * Does not create/delete nodes or change next / set / require / visual.
 */

"use strict";

const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { parseDocument, DRAFT_NEW, DRAFT_CUT } = require("./lib/pavel-booth-script-md");
const { indexGame, patchLine } = require("./lib/copydesk-core");

const projectRoot = path.resolve(__dirname, "..");
const draftPath = path.join(
  projectRoot,
  "docs",
  "drafts",
  "pavel-booth-script.md"
);
const apply = process.argv.includes("--apply");

const loadLiveNodes = () => {
  const contentPath = path.join(
    projectRoot,
    "content",
    "pavel",
    "observation-booth-content.js"
  );
  const sandbox = { window: {}, console };
  vm.runInNewContext(fs.readFileSync(contentPath, "utf8"), sandbox, {
    filename: contentPath,
    timeout: 3000,
  });
  const content = sandbox.window.TyndexPavelObservationBoothContent;
  if (!content?.nodes) {
    throw new Error("Не удалось загрузить TyndexPavelObservationBoothContent");
  }
  return content.nodes;
};

const lineId = (nodeId, field) => `node:${nodeId}:${field}`;

const findLine = (index, nodeId, field) =>
  index.lines.find((line) => line.id === lineId(nodeId, field));

const queuePatch = (patches, index, nodeId, field, nextText) => {
  const line = findLine(index, nodeId, field);
  const next = String(nextText ?? "");
  if (!line) {
    if (next) {
      return { skip: true, reason: `нет поля ${field} в Copy Desk` };
    }
    return null;
  }
  if (line.text === next) return null;
  patches.push({
    lineId: line.id,
    expected: line.text,
    nextText: next,
    nodeId,
    field,
  });
  return null;
};

const markdown = fs.readFileSync(draftPath, "utf8");
const draft = parseDocument(markdown);
const live = loadLiveNodes();
const notes = [];
const patches = [];
const index = indexGame("pavel");

draft.nodes.forEach((node) => {
  if (node.status === DRAFT_NEW) {
    notes.push(`DRAFT-NEW (не вшивается литературным импортом): ${node.id}`);
    return;
  }
  if (node.status === DRAFT_CUT) {
    notes.push(`DRAFT-CUT (не удаляется литературным импортом): ${node.id}`);
    return;
  }
  if (!live[node.id]) {
    notes.push(`в JS нет узла ${node.id} (пометьте DRAFT-NEW или синхронизируйте граф)`);
    return;
  }

  const liveNode = live[node.id];
  const skipSpeaker = queuePatch(patches, index, node.id, "speaker", node.speaker);
  if (skipSpeaker) notes.push(`${node.id}: ${skipSpeaker.reason}`);
  const skipText = queuePatch(patches, index, node.id, "text", node.text);
  if (skipText) notes.push(`${node.id}: ${skipText.reason}`);
  if (node.refusalText || liveNode.refusalText) {
    const skipRefusal = queuePatch(
      patches,
      index,
      node.id,
      "refusalText",
      node.refusalText
    );
    if (skipRefusal) notes.push(`${node.id}: ${skipRefusal.reason}`);
  }
  if (node.imageAlt || liveNode.imageAlt) {
    const skipAlt = queuePatch(patches, index, node.id, "imageAlt", node.imageAlt);
    if (skipAlt) notes.push(`${node.id}: ${skipAlt.reason}`);
  }

  const liveChoices = Array.isArray(liveNode.choices) ? liveNode.choices : [];
  if (node.choices.length !== liveChoices.length) {
    notes.push(
      `${node.id}: число кнопок в черновике ${node.choices.length}, в JS ${liveChoices.length} — подписи не трогаю`
    );
    return;
  }
  node.choices.forEach((choice, i) => {
    if (choice.next && liveChoices[i].next && choice.next !== liveChoices[i].next) {
      notes.push(
        `${node.id} кнопка ${i + 1}: next в черновике \`${choice.next}\`, в JS \`${liveChoices[i].next}\` — граф не меняю`
      );
    }
    queuePatch(patches, index, node.id, `choices[${i}].label`, choice.label);
    if (choice.imageAlt || liveChoices[i].imageAlt) {
      queuePatch(
        patches,
        index,
        node.id,
        `choices[${i}].imageAlt`,
        choice.imageAlt || ""
      );
    }
  });
});

Object.keys(live).forEach((id) => {
  if (!draft.nodes.some((node) => node.id === id)) {
    notes.push(`узел JS не найден в черновике: ${id}`);
  }
});

if (!apply) {
  console.log(`Черновик: ${path.relative(projectRoot, draftPath)}`);
  console.log(`Литературных правок: ${patches.length}`);
  patches.forEach((patch) => {
    console.log(`  ${patch.nodeId} ${patch.field}`);
  });
  if (notes.length) {
    console.log("Замечания:");
    notes.forEach((note) => console.log(`  - ${note}`));
  }
  console.log("Запись не выполнялась. Для записи: node scripts/import-pavel-booth-script.js --apply");
  process.exit(0);
}

patches.forEach((patch) => {
  patchLine("pavel", patch.lineId, patch.expected, patch.nextText);
});

console.log(`Записано литературных правок: ${patches.length}`);
if (notes.length) {
  console.log("Замечания (граф не менялся):");
  notes.forEach((note) => console.log(`  - ${note}`));
}
