#!/usr/bin/env node

"use strict";

const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { renderDocument } = require("./lib/pavel-booth-script-md");

const projectRoot = path.resolve(__dirname, "..");
const contentPath = path.join(
  projectRoot,
  "content",
  "pavel",
  "observation-booth-content.js"
);
const outputPath = path.join(
  projectRoot,
  "docs",
  "drafts",
  "pavel-booth-script.md"
);

const contentSource = fs.readFileSync(contentPath, "utf8");
const sandbox = { window: {}, console };
vm.runInNewContext(contentSource, sandbox, {
  filename: contentPath,
  timeout: 3000,
});

const content = sandbox.window.TyndexPavelObservationBoothContent;
if (!content?.nodes) {
  throw new Error("Не удалось загрузить TyndexPavelObservationBoothContent");
}

fs.mkdirSync(path.dirname(outputPath), { recursive: true });

const generatedAt = new Date().toISOString();
const output = renderDocument({
  generatedAt,
  startNode: content.startNode,
  nodeCount: Object.keys(content.nodes).length,
  nodes: content.nodes,
});

fs.writeFileSync(outputPath, output, "utf8");
console.log(
  `Exported ${Object.keys(content.nodes).length} nodes → ${path.relative(projectRoot, outputPath)}`
);
