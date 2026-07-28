#!/usr/bin/env node

/**
 * One-time / re-sync extractor: pulls Irina call content out of js/app.js
 * into content/irina/call-content.js.
 *
 * After Stage 0, edit content/irina/call-content.js (not app.js) and re-run
 * export/validate scripts. Only re-run this extractor if content was edited
 * back into app.js by mistake.
 */

"use strict";

const fs = require("node:fs");
const path = require("node:path");

const projectRoot = path.resolve(__dirname, "..");
const sourcePath = path.join(projectRoot, "js", "app.js");
const outputPath = path.join(projectRoot, "content", "irina", "call-content.js");

const source = fs.readFileSync(sourcePath, "utf8");

if (!source.includes("  const curatorNodes = {")) {
  console.error(
    "extract-irina-call-content.js: curatorNodes больше не в js/app.js.\n" +
      "Источник правды: content/irina/call-content.js\n" +
      "Этот скрипт — только для одноразовой миграции Stage 0."
  );
  process.exit(1);
}

const extractBetween = (startMarker, endMarker) => {
  const start = source.indexOf(startMarker);
  if (start === -1) {
    throw new Error(`Не найден маркер: ${startMarker.trim()}`);
  }
  const end = source.indexOf(endMarker, start + startMarker.length);
  if (end === -1) {
    throw new Error(`Не найден конец после: ${startMarker.trim()}`);
  }
  return source.slice(start + startMarker.length, end).trim().replace(/;$/, "");
};

const rewardCopySource = extractBetween(
  "  const curatorRewardCopy = ",
  "\n  const renderArtifactCopy = "
);

let filesSource = extractBetween(
  "  const curatorFiles = ",
  "\n  const staffDirectory = "
);

const staffMessagesSource = extractBetween(
  "  const staffMessages = ",
  "\n  const staffArtifacts = "
);

let staffArtifactsSource = extractBetween(
  "  const staffArtifacts = ",
  "\n  const curatorNodeArtifacts = "
);

const nodeArtifactsSource = extractBetween(
  "  const curatorNodeArtifacts = ",
  "\n  const createCuratorProgress = "
);

const nodesSource = extractBetween(
  "  const curatorNodes = ",
  "\n  const applyCuratorEffect = "
);

// Store site-root relative paths; app.js resolves them via audioAsset().
const rewriteMedia = (value) =>
  value
    .replace(
      /curatorMediaAsset\((["'`])([^"'`]+)\1\)/g,
      (_match, _q, file) => `"assets/staff/curators/irina/${file}"`
    )
    .replace(/\bcuratorRewardCopy\b/g, "rewardCopy");

filesSource = rewriteMedia(filesSource);
staffArtifactsSource = rewriteMedia(staffArtifactsSource);

// staffMessages uses audioAsset(...) for avatars — convert to plain paths.
const staffMessagesResolved = staffMessagesSource.replace(
  /audioAsset\((["'`])([^"'`]+)\1\)/g,
  (_match, _q, file) => `"${file}"`
);

const banner = `/**
 * Irina curator call — content module (Stage 0).
 *
 * SOURCE OF TRUTH for dialogue nodes, reward copy, call files,
 * staff message templates, artifact catalog, and node→artifact map.
 *
 * Do not edit these trees inside js/app.js.
 * Runtime loads this file before app.js and hydrates asset URLs.
 *
 * Format note: still a JS module (not pure JSON) because some text/choices
 * are functions of progress. Stage 1 admin can gradually make those declarative.
 *
 * Generated/updated by: node scripts/extract-irina-call-content.js
 * Validate: node scripts/validate-irina-call-content.js
 * Export dialogues md: node scripts/export-irina-dialogues.js
 */
`;

const output = `${banner}(() => {
  "use strict";

  const rewardCopy = ${rewardCopySource};

  const files = ${filesSource};

  const staffMessages = ${staffMessagesResolved};

  const staffArtifacts = ${staffArtifactsSource};

  const nodeArtifacts = ${nodeArtifactsSource};

  const nodes = ${nodesSource};

  window.TyndexIrinaCallContent = Object.freeze({
    version: 1,
    curatorId: "0091-A",
    mediaBase: "assets/staff/curators/irina/",
    rewardCopy,
    files,
    staffMessages,
    staffArtifacts,
    nodeArtifacts,
    nodes,
  });
})();
`;

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, output, "utf8");

// Sanity: evaluate the generated module
const vm = require("node:vm");
const sandbox = { window: {}, console };
vm.runInNewContext(output, sandbox, { filename: outputPath, timeout: 3000 });
const content = sandbox.window.TyndexIrinaCallContent;
if (!content?.nodes || !content?.staffArtifacts) {
  throw new Error("Сгенерированный модуль не экспортировал TyndexIrinaCallContent.");
}

const nodeCount = Object.keys(content.nodes).length;
const artifactCount = Object.keys(content.staffArtifacts).length;
console.log(`Wrote ${path.relative(projectRoot, outputPath)}`);
console.log(
  `nodes: ${nodeCount}, artifacts: ${artifactCount}, files: ${Object.keys(content.files).length}`
);
