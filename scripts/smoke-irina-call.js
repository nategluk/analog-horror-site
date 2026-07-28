#!/usr/bin/env node

/**
 * Lightweight smoke checklist after content changes.
 * Full browser walk: use Playwright against admin-server or python http.server.
 *
 *   node scripts/smoke-irina-call.js
 */

"use strict";

const { spawnSync } = require("node:child_process");
const path = require("node:path");
const fs = require("node:fs");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");

const run = (script) => {
  const result = spawnSync(process.execPath, [path.join(root, "scripts", script)], {
    encoding: "utf8",
    cwd: root,
  });
  process.stdout.write(result.stdout || "");
  process.stderr.write(result.stderr || "");
  if (result.status !== 0) {
    process.exit(result.status || 1);
  }
};

console.log("== validate ==");
run("validate-irina-call-content.js");

console.log("\n== load + bridge sample ==");
const source = fs.readFileSync(
  path.join(root, "content", "irina", "call-content.js"),
  "utf8"
);
const sandbox = {
  window: {
    TyndexIrinaRuntime: {
      readStaffProfile: () => ({ displayName: "Smoke" }),
      getCuratorAssignment: () => "animator",
      getAssignmentCallbacks: () => "Ты ждал.",
      isCloseClassification: () => false,
    },
  },
  console,
};
vm.runInNewContext(source, sandbox, { timeout: 3000 });
const nodes = sandbox.window.TyndexIrinaCallContent.nodes;
const nameAck =
  typeof nodes["name-ack"].text === "function"
    ? nodes["name-ack"].text()
    : nodes["name-ack"].text;
if (!String(nameAck).includes("Smoke")) {
  console.error("name-ack bridge failed:", nameAck);
  process.exit(1);
}
const progress = {
  flags: {},
  profiles: { animator: 2, volunteer: 0 },
  scores: { obedience: 1, curiosity: 0, fear: 0, delegation: 0 },
};
const assignmentText = nodes.assignment.text(progress);
if (!assignmentText) {
  console.error("assignment text empty");
  process.exit(1);
}
console.log("name-ack:", nameAck);
console.log("assignment:", assignmentText);
console.log("\nOK smoke-irina-call");
