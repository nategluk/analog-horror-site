#!/usr/bin/env node

/**
 * Validates content/irina/call-content.js graph integrity.
 * Exit 0 on success, 1 on errors.
 */

"use strict";

const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const projectRoot = path.resolve(__dirname, "..");
const contentPath = path.join(projectRoot, "content", "irina", "call-content.js");

const source = fs.readFileSync(contentPath, "utf8");
const sandbox = { window: {}, console };
vm.runInNewContext(source, sandbox, { filename: contentPath, timeout: 3000 });

const content = sandbox.window.TyndexIrinaCallContent;
if (!content) {
  console.error("TyndexIrinaCallContent missing");
  process.exit(1);
}

const nodes = content.nodes || {};
const artifacts = content.staffArtifacts || {};
const files = content.files || {};
const nodeArtifacts = content.nodeArtifacts || {};
const messages = content.staffMessages || {};

const errors = [];
const warnings = [];

const nodeIds = new Set(Object.keys(nodes));
const entryNodes = ["intro", "reclassification-entry"];

entryNodes.forEach((id) => {
  if (!nodeIds.has(id)) errors.push(`Missing required entry node: ${id}`);
});

const collectChoiceTargets = (choices, context) => {
  if (typeof choices === "function") {
    warnings.push(`${context}: choices is a function — targets not statically validated`);
    return [];
  }
  if (!Array.isArray(choices)) return [];
  return choices.flatMap((choice, index) => {
    const label = choice?.label || `#${index}`;
    // reject is a reason code for rejectCall(), not a graph edge.
    if (choice?.reject) return [];
    if (choice?.complete) return [];
    if (!choice?.next) return [];
    return [{ from: `${context} / ${label}`, to: choice.next }];
  });
};

const referenced = new Set();
const reachable = new Set();

Object.entries(nodes).forEach(([id, node]) => {
  if (!node || typeof node !== "object") {
    errors.push(`Node ${id} is not an object`);
    return;
  }
  if (!node.step) warnings.push(`Node ${id}: missing step`);
  if (node.text === undefined || node.text === null) {
    errors.push(`Node ${id}: missing text`);
  }

  if (node.autoNext) {
    referenced.add(node.autoNext);
    if (!nodeIds.has(node.autoNext)) {
      errors.push(`Node ${id}: autoNext → missing node "${node.autoNext}"`);
    }
  }

  if (node.input?.next) {
    referenced.add(node.input.next);
    if (!nodeIds.has(node.input.next)) {
      errors.push(`Node ${id}: input.next → missing node "${node.input.next}"`);
    }
  }

  collectChoiceTargets(node.choices, `Node ${id}`).forEach(({ from, to }) => {
    referenced.add(to);
    if (!nodeIds.has(to)) {
      errors.push(`${from}: next → missing node "${to}"`);
    }
  });

  if (typeof node.choices === "function") {
    // already warned
  } else if (!Array.isArray(node.choices) || node.choices.length === 0) {
    if (!node.autoNext && !node.input) {
      warnings.push(`Node ${id}: no choices, autoNext, or input`);
    }
  }

  if (node.still && typeof node.still === "string" && !node.still.startsWith("assets/")) {
    warnings.push(`Node ${id}: still path may be wrong: ${node.still}`);
  }
});

// These two visual decisions rely on image cards. The admin editor preserves
// unknown choice fields, but keep this project-specific assertion so a future
// serializer regression cannot silently turn them into text-only choices.
["image-test", "route-photo-choice"].forEach((nodeId) => {
  const choices = nodes[nodeId]?.choices;
  if (!Array.isArray(choices) || choices.length !== 2) {
    errors.push(`${nodeId}: expected exactly 2 visual choices`);
    return;
  }
  choices.forEach((choice, index) => {
    if (!choice?.image) {
      errors.push(`${nodeId}.choices[${index}]: missing required image`);
    }
    if (!choice?.imageAlt) {
      errors.push(`${nodeId}.choices[${index}]: missing required imageAlt`);
    }
  });
});

Object.entries(nodeArtifacts).forEach(([nodeId, artifactId]) => {
  if (!nodeIds.has(nodeId)) {
    errors.push(`nodeArtifacts: unknown node "${nodeId}"`);
  }
  if (!artifacts[artifactId]) {
    errors.push(`nodeArtifacts: node "${nodeId}" → unknown artifact "${artifactId}"`);
  }
});

Object.entries(files).forEach(([id, file]) => {
  if (!file?.src) errors.push(`files.${id}: missing src`);
  if (!artifacts[id] && !["irina-private-photo", "animator-postcard", "volunteer-leaflet"].includes(id)) {
    warnings.push(`files.${id}: no matching staffArtifacts entry`);
  }
});

// Static scan of effect.files / effect.artifacts / downloadFile in node source
const effectFileIds = new Set();
const effectArtifactIds = new Set();
const downloadIds = new Set();
const sourceBody = source;

for (const match of sourceBody.matchAll(/downloadFile:\s*["']([^"']+)["']/g)) {
  downloadIds.add(match[1]);
}
for (const match of sourceBody.matchAll(/files:\s*\[\s*["']([^"']+)["']/g)) {
  effectFileIds.add(match[1]);
}
for (const match of sourceBody.matchAll(/artifacts:\s*\[\s*["']([^"']+)["']/g)) {
  effectArtifactIds.add(match[1]);
}

[...downloadIds, ...effectFileIds].forEach((id) => {
  if (!files[id] && !artifacts[id]) {
    errors.push(`Referenced file id not in catalogs: ${id}`);
  }
});
effectArtifactIds.forEach((id) => {
  if (!artifacts[id]) errors.push(`Referenced artifact id missing: ${id}`);
});

// Reachability from entry nodes (static edges only)
const edges = new Map();
Object.entries(nodes).forEach(([id, node]) => {
  const outs = new Set();
  if (node.autoNext) outs.add(node.autoNext);
  if (node.input?.next) outs.add(node.input.next);
  if (Array.isArray(node.choices)) {
    node.choices.forEach((choice) => {
      if (choice?.next) outs.add(choice.next);
    });
  }
  edges.set(id, outs);
});

const queue = entryNodes.filter((id) => nodeIds.has(id));
while (queue.length) {
  const id = queue.pop();
  if (reachable.has(id)) continue;
  reachable.add(id);
  (edges.get(id) || []).forEach((next) => {
    if (!reachable.has(next)) queue.push(next);
  });
}

const orphans = [...nodeIds].filter((id) => !reachable.has(id));
// Function-valued choices hide edges from static analysis; report as info only.
if (orphans.length) {
  warnings.push(
    `${orphans.length} nodes not statically reachable from entry ` +
      `(often due to function choices): ${orphans.slice(0, 8).join(", ")}` +
      (orphans.length > 8 ? ", …" : "")
  );
}

const choiceLabels = (sourceBody.match(/\blabel\s*:/g) || []).length;

console.log(`content: ${path.relative(projectRoot, contentPath)}`);
console.log(`nodes: ${nodeIds.size}`);
console.log(`artifacts: ${Object.keys(artifacts).length}`);
console.log(`files: ${Object.keys(files).length}`);
console.log(`messages: ${Object.keys(messages).length}`);
console.log(`choice labels (approx): ${choiceLabels}`);
console.log(`statically reachable: ${reachable.size}/${nodeIds.size}`);

if (warnings.length) {
  console.log(`\nWarnings (${warnings.length}):`);
  warnings.slice(0, 40).forEach((w) => console.log(`  - ${w}`));
  if (warnings.length > 40) console.log(`  … +${warnings.length - 40} more`);
}

if (errors.length) {
  console.error(`\nErrors (${errors.length}):`);
  errors.forEach((e) => console.error(`  - ${e}`));
  process.exit(1);
}

console.log("\nOK: Irina call content is valid.");
