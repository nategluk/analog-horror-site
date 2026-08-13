#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const contentPath = path.join(
  __dirname,
  "..",
  "content",
  "lora",
  "red-room-content.js"
);
const source = fs.readFileSync(contentPath, "utf8");
const sandbox = { window: {}, console };
vm.createContext(sandbox);
vm.runInContext(source, sandbox);

const content = sandbox.window.TyndexLoraRedRoomContent;
if (!content?.nodes || !content.startNode) {
  console.error("Lora content module is missing nodes.");
  process.exit(1);
}

const nodes = content.nodes;
const ids = Object.keys(nodes);
const missing = [];
const unused = new Set(ids);
const visit = (id) => {
  if (!id || id === "leave") return;
  if (!nodes[id]) {
    missing.push(id);
    return;
  }
  unused.delete(id);
};

visit(content.startNode);

ids.forEach((id) => {
  const node = nodes[id];
  if (node.autoNext) visit(node.autoNext);
  (node.choices || []).forEach((choice) => {
    if (!choice.leave) visit(choice.next);
  });
});

const required = [
  "pig_enter",
  "pig_camera_check",
  "pig_reveal",
  "fox_enter",
  "dog_where",
  "end_leave",
  "end_give",
  "end_sea",
  "end_none",
  "receipt_print",
  "shift_done",
];
const absentRequired = required.filter((id) => !nodes[id]);
const allowedVisuals = new Set([
  "V02_PIG_MASKED",
  "V03_PIG_REVEAL",
  "V04_PIG_UNMASKED",
  "V05_FOX_GAZE",
  "V06_FOX_ACTION",
  "V11_DOG_SLEEP",
]);
const unknownVisuals = [];
ids.forEach((id) => {
  const node = nodes[id];
  [node.visual, ...(node.visualWhen || []).map((entry) => entry.visual)]
    .filter(Boolean)
    .forEach((visual) => {
      if (!allowedVisuals.has(visual)) unknownVisuals.push(`${id}:${visual}`);
    });
});
const requiredAssets = [
  "assets/guest/red-room/lora/scenes/v03-pig-reveal.mp4",
  "assets/guest/red-room/lora/scenes/v03-pig-reveal-poster.webp",
  "assets/guest/red-room/lora/scenes/v05-fox-gaze-idle.mp4",
  "assets/guest/red-room/lora/scenes/v05-fox-gaze.webp",
  "assets/guest/red-room/lora/scenes/v06-fox-action-idle.mp4",
  "assets/guest/red-room/lora/scenes/v06-fox-action.webp",
  "assets/guest/red-room/lora/scenes/v11-dog-sleep-idle.mp4",
  "assets/guest/red-room/lora/scenes/v11-dog-sleep.webp",
];
const missingAssets = requiredAssets.filter(
  (asset) => !fs.existsSync(path.join(__dirname, "..", asset))
);
const emptyChoices = ids.filter((id) => {
  const node = nodes[id];
  return !node.autoNext && !(node.choices && node.choices.length);
});

if (
  missing.length ||
  absentRequired.length ||
  unknownVisuals.length ||
  missingAssets.length ||
  emptyChoices.length
) {
  if (missing.length) {
    console.error("Missing next targets:", missing.join(", "));
  }
  if (absentRequired.length) {
    console.error("Required nodes missing:", absentRequired.join(", "));
  }
  if (unknownVisuals.length) {
    console.error("Unknown visual ids:", unknownVisuals.join(", "));
  }
  if (missingAssets.length) {
    console.error("Required visual assets missing:", missingAssets.join(", "));
  }
  if (emptyChoices.length) {
    console.error("Nodes without exit:", emptyChoices.join(", "));
  }
  process.exit(1);
}

console.log(
  `Lora red room content OK: ${ids.length} nodes, start=${content.startNode}, unused=${
    [...unused].length
  }`
);
if (unused.size) {
  console.log("Unreferenced nodes:", [...unused].join(", "));
}
