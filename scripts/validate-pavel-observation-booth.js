#!/usr/bin/env node

/**
 * Validates content/pavel/observation-booth-content.js graph integrity.
 * Exit 0 on success, 1 on errors. Does not write files.
 */

"use strict";

const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const projectRoot = path.resolve(__dirname, "..");
const contentPath = path.join(
  projectRoot,
  "content",
  "pavel",
  "observation-booth-content.js"
);

const source = fs.readFileSync(contentPath, "utf8");
const errors = [];

const hasInterpolatedTemplateLiteral = (text) => {
  let index = 0;
  while (index < text.length) {
    const char = text[index];
    const next = text[index + 1];

    if (char === "/" && next === "/") {
      index += 2;
      while (index < text.length && text[index] !== "\n") index += 1;
      continue;
    }
    if (char === "/" && next === "*") {
      index += 2;
      while (index < text.length && !(text[index] === "*" && text[index + 1] === "/")) {
        index += 1;
      }
      index += 2;
      continue;
    }
    if (char === '"' || char === "'") {
      const quote = char;
      index += 1;
      while (index < text.length) {
        if (text[index] === "\\") {
          index += 2;
          continue;
        }
        if (text[index] === quote) {
          index += 1;
          break;
        }
        index += 1;
      }
      continue;
    }
    if (char === "`") {
      index += 1;
      while (index < text.length) {
        if (text[index] === "\\") {
          index += 2;
          continue;
        }
        if (text[index] === "$" && text[index + 1] === "{") return true;
        if (text[index] === "`") {
          index += 1;
          break;
        }
        index += 1;
      }
      continue;
    }
    index += 1;
  }
  return false;
};

if (hasInterpolatedTemplateLiteral(source)) {
  errors.push("content source contains interpolated template literals");
}

const sandbox = { window: {}, console };
try {
  vm.runInNewContext(source, sandbox, { filename: contentPath, timeout: 3000 });
} catch (error) {
  errors.push(`content failed to evaluate: ${error.message}`);
}

const content = sandbox.window.TyndexPavelObservationBoothContent;

if (!content) {
  errors.push("TyndexPavelObservationBoothContent missing");
}

if (content) {
  if (content.version !== 1) {
    errors.push(`version must be 1, got ${JSON.stringify(content.version)}`);
  }
  if (typeof content.startNode !== "string" || !content.startNode) {
    errors.push("startNode must be a non-empty string");
  }
  if (!content.nodes || typeof content.nodes !== "object" || Array.isArray(content.nodes)) {
    errors.push("nodes must be an object");
  }
  ["rooms", "sounds", "visuals", "artifacts"].forEach((name) => {
    if (!content[name] || typeof content[name] !== "object" || Array.isArray(content[name])) {
      errors.push(`${name} catalog must be an object`);
    }
  });
}

if (errors.length && !content?.nodes) {
  console.error(`Errors (${errors.length}):`);
  errors.forEach((item) => console.error(`  - ${item}`));
  process.exit(1);
}

const nodes = content.nodes || {};
const nodeIds = new Set(Object.keys(nodes));
const rooms = new Set(Object.keys(content.rooms || {}));
const sounds = new Set(Object.keys(content.sounds || {}));
const visuals = new Set(Object.keys(content.visuals || {}));
const artifacts = new Set(Object.keys(content.artifacts || {}));

if (content.startNode && !nodeIds.has(content.startNode)) {
  errors.push(`startNode "${content.startNode}" is not in nodes`);
}

const isNonEmptyString = (value) => typeof value === "string" && value.length > 0;

const collectStringRefs = (value, pathLabel, collector) => {
  if (typeof value === "string") {
    collector.push({ path: pathLabel, value });
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((item, index) => {
      collectStringRefs(item, `${pathLabel}[${index}]`, collector);
    });
    return;
  }
  if (value && typeof value === "object") {
    Object.entries(value).forEach(([key, child]) => {
      collectStringRefs(child, `${pathLabel}.${key}`, collector);
    });
  }
};

Object.entries(nodes).forEach(([id, node]) => {
  if (!node || typeof node !== "object" || Array.isArray(node)) {
    errors.push(`Node ${id} is not an object`);
    return;
  }
  if (typeof node.text === "function" || typeof node.choices === "function") {
    errors.push(`Node ${id}: function-valued text/choices are not allowed`);
  }
  if (!isNonEmptyString(node.text)) {
    errors.push(`Node ${id}: text must be a non-empty string`);
  } else if (node.text.length > 180) {
    errors.push(`Node ${id}: text is too long for a single beat (${node.text.length})`);
  }
  if (!isNonEmptyString(node.speaker)) {
    errors.push(`Node ${id}: speaker must be a non-empty string`);
  }
  if (node.action != null && !isNonEmptyString(node.action)) {
    errors.push(`Node ${id}: action must be a non-empty string when present`);
  }
  if (node.transcript != null && !isNonEmptyString(node.transcript)) {
    errors.push(`Node ${id}: transcript must be a non-empty string when present`);
  }
  if (node.refusalText != null && !isNonEmptyString(node.refusalText)) {
    errors.push(`Node ${id}: refusalText must be a non-empty string when present`);
  }
  if (node.actionCaption != null && typeof node.actionCaption !== "boolean") {
    errors.push(`Node ${id}: actionCaption must be a boolean when present`);
  }
  if (node.step != null && !isNonEmptyString(node.step)) {
    errors.push(`Node ${id}: step must be a non-empty string when present`);
  }
  if (!isNonEmptyString(node.room)) {
    errors.push(`Node ${id}: room must be a non-empty string`);
  } else if (!rooms.has(node.room)) {
    errors.push(`Node ${id}: invalid room "${node.room}"`);
  }
  if (node.sound != null) {
    if (!isNonEmptyString(node.sound)) {
      errors.push(`Node ${id}: sound must be a string when present`);
    } else if (!sounds.has(node.sound)) {
      errors.push(`Node ${id}: unknown sound "${node.sound}"`);
    }
  }
  if (node.visual != null) {
    if (!isNonEmptyString(node.visual)) {
      errors.push(`Node ${id}: visual must be a string when present`);
    } else if (!visuals.has(node.visual)) {
      errors.push(`Node ${id}: unknown visual "${node.visual}"`);
    }
  }
  if (node.artifact != null) {
    if (!isNonEmptyString(node.artifact)) {
      errors.push(`Node ${id}: artifact must be a string when present`);
    } else if (!artifacts.has(node.artifact)) {
      errors.push(`Node ${id}: unknown artifact "${node.artifact}"`);
    }
  }

  if (node.choices == null) return;
  if (!Array.isArray(node.choices)) {
    errors.push(`Node ${id}: choices must be an array`);
    return;
  }
  node.choices.forEach((choice, index) => {
    const label = `Node ${id}.choices[${index}]`;
    if (!choice || typeof choice !== "object" || Array.isArray(choice)) {
      errors.push(`${label} is not an object`);
      return;
    }
    if (!isNonEmptyString(choice.label)) {
      errors.push(`${label}: label must be a non-empty string`);
    }
    if (!isNonEmptyString(choice.next)) {
      errors.push(`${label}: next must be a non-empty string`);
    } else if (!nodeIds.has(choice.next)) {
      errors.push(`${label}: next → missing node "${choice.next}"`);
    }
    if (choice.sound != null) {
      if (!isNonEmptyString(choice.sound) || !sounds.has(choice.sound)) {
        errors.push(`${label}: unknown sound "${choice.sound}"`);
      }
    }
    if (choice.visual != null) {
      if (!isNonEmptyString(choice.visual) || !visuals.has(choice.visual)) {
        errors.push(`${label}: unknown visual "${choice.visual}"`);
      }
    }
    if (choice.artifact != null) {
      if (!isNonEmptyString(choice.artifact) || !artifacts.has(choice.artifact)) {
        errors.push(`${label}: unknown artifact "${choice.artifact}"`);
      }
    }
    ["set", "require", "requireAny", "hideIf"].forEach((key) => {
      if (choice[key] != null && !Array.isArray(choice[key])) {
        errors.push(`${label}: ${key} must be an array when present`);
      }
    });
  });
});

const catalogStringRefs = [];
["rooms", "sounds", "visuals", "artifacts"].forEach((name) => {
  collectStringRefs(content[name], name, catalogStringRefs);
});
catalogStringRefs.forEach(({ path: refPath, value }) => {
  const catalogName = refPath.split(/[.[]/, 1)[0];
  const allowed =
    catalogName === "rooms"
      ? rooms
      : catalogName === "sounds"
        ? sounds
        : catalogName === "visuals"
          ? visuals
          : artifacts;
  if (!allowed.has(value)) {
    errors.push(`catalog ${refPath}: unknown id "${value}"`);
  }
});

const reachable = new Set();
const queue = content.startNode && nodeIds.has(content.startNode) ? [content.startNode] : [];
while (queue.length) {
  const id = queue.pop();
  if (reachable.has(id)) continue;
  reachable.add(id);
  const node = nodes[id];
  if (!node || !Array.isArray(node.choices)) continue;
  node.choices.forEach((choice) => {
    if (choice?.next && nodeIds.has(choice.next) && !reachable.has(choice.next)) {
      queue.push(choice.next);
    }
  });
}

const unreachable = [...nodeIds].filter((id) => !reachable.has(id));
unreachable.forEach((id) => {
  errors.push(`unreachable node "${id}"`);
});

const tourSpine = [
  "tour-control",
  "tour-bedroom",
  "tour-bedroom-sit",
  "tour-bathroom",
  "tour-storage",
  "tour-hatch",
  "tour-return",
];
tourSpine.forEach((id) => {
  if (!nodeIds.has(id)) errors.push(`tour spine missing node "${id}"`);
});
if (nodes["drain-damp"]?.choices?.[0]?.next !== "drain-silent") {
  errors.push("drain visit 1 must end after the first spoken line");
}
if (nodes["control-after-hatch"]?.choices?.[0]?.next !== "control-drain-cue-2") {
  errors.push("after the first tray the drain joke visit must come before the mask");
}
if (nodes["drain-password-gone"]?.choices?.[0]?.next !== "control-knock-cue-2") {
  errors.push("drain visit 2 must return to the second hatch knock");
}
if (nodes["hatch-mask-on"]?.choices?.[0]?.next !== "control-drain-cue-3") {
  errors.push("gas mask must send the player back to the drain before dessert");
}
if (nodes["drain-thirst-ask"]?.choices?.[0]?.next !== "storage-cleaner") {
  errors.push("drain visit 3 must send the player to the cleaner bottle");
}
if (nodes["drain-pour-cat"]?.choices?.[0]?.next !== "control-knock-cue-3") {
  errors.push("drain pour must return to the third hatch knock");
}
if (nodes["senior-guide-verdict"]?.choices?.[0]?.next !== "senior-guide-mercy") {
  errors.push("sun mask must pity the player after the drain warning");
}
if (nodes["booth-sound-rule"]?.choices?.[0]?.next !== "tour-control") {
  errors.push("tour must begin after booth-sound-rule");
}
if (nodes["tour-return"]?.choices?.[0]?.next !== "slide-farewell-left") {
  errors.push("after the tour the Cat must leave through the slide");
}
if (nodes["tour-storage"]?.visual === "STORAGE_SLIDE") {
  errors.push("tour storage must not reveal the slide");
}
if (nodes["tour-hatch"]?.visual === "HATCH_BASE") {
  errors.push("tour hatch must not trigger the later tray clip");
}
const farewellSpine = [
  "slide-farewell-left",
  "slide-farewell-light",
  "slide-farewell-dark",
  "slide-farewell-cat",
  "slide-farewell-stay",
];
farewellSpine.forEach((id) => {
  if (!nodeIds.has(id)) errors.push(`slide farewell missing node "${id}"`);
});
if (nodeIds.has("hatch-escape-crawl")) {
  errors.push("cancelled crawl escape node must be removed");
}
if (nodes["slide-farewell-stay"]?.choices?.[0]?.next !== "control-laugh") {
  errors.push("after the Cat leaves the player must stay and explore");
}
if (nodes["hatch-escape"]?.choices?.[0]?.next !== "dev-operator-hold") {
  errors.push("camera-off must not send the player into the slide");
}
if (nodes["bedroom-cassette"]?.choices?.some((choice) => choice.next === "control-screens-glitch") !== true) {
  errors.push("camera glitch must come after the cassette");
}
if (nodes["control-screens-glitch"]?.choices?.[0]?.next !== "control-camera") {
  errors.push("camera help must follow the one-shot screen glitch");
}
if (nodes["control-camera-ask"]?.choices?.[0]?.next !== "control-camera-press") {
  errors.push("accepting Pavel's request must show the operator press the channel control");
}
if (nodes["control-camera-press"]?.choices?.[0]?.next !== "hatch-escape") {
  errors.push("the channel-switch beat must lead to the disabled right channel");
}
if (nodes["senior-guide-route"]?.choices?.[0]?.next !== "slide-guest-light") {
  errors.push("senior guide must send the player through the lit slide");
}
if (nodes["slide-guest-light"]?.visual !== "SLIDE_ESCAPE") {
  errors.push("accepted guide exit clip must own slide-guest-light");
}
if (!nodes["slide-guest-exit"]?.guestExit) {
  errors.push("player slide exit must glitch to guest");
}
const cansChoice = nodes["tour-storage"]?.choices?.find(
  (choice) => choice.next === "tour-storage-cans"
);
if (!cansChoice?.hideIf?.includes("tourAskedCans")) {
  errors.push("tour cans memory must remain optional and one-shot");
}

[
  "assets/guest/locations/pavel/nightstand-cassette.mp4",
  "assets/guest/locations/pavel/nightstand-cassette-start.webp",
  "assets/guest/locations/pavel/nightstand-cassette.webp",
  "assets/guest/locations/pavel/drain-hungry.mp4",
  "assets/guest/locations/pavel/drain-vague.mp4",
  "assets/guest/locations/pavel/drain-vague.webp",
  "assets/guest/locations/pavel/drain-beckon.mp4",
  "assets/guest/locations/pavel/drain-beckon.webp",
  "assets/guest/locations/pavel/drain-cough.mp4",
  "assets/guest/locations/pavel/drain-cough-start.webp",
  "assets/guest/locations/pavel/drain-cough.webp",
  "assets/guest/locations/pavel/control-empty.mp4",
  "assets/guest/locations/pavel/control-empty.webp",
  "assets/guest/locations/pavel/storage-pavel-escape.mp4",
  "assets/guest/locations/pavel/storage-pavel-escape.webp",
  "assets/guest/locations/pavel/hatch-tray.mp4",
  "assets/guest/locations/pavel/hatch-tray-start.webp",
  "assets/guest/locations/pavel/hatch-tray.webp",
  "assets/guest/locations/pavel/storage-slide-loop.mp4",
  "assets/guest/locations/pavel/storage-slide-loop.webp",
  "assets/guest/locations/pavel/drain-hair-long.mp4",
  "assets/guest/locations/pavel/drain-hair-long.webp",
  "assets/guest/locations/pavel/senior-guide-waiting.mp4",
  "assets/guest/locations/pavel/senior-guide-waiting.webp",
  "assets/guest/locations/pavel/tour-bedroom.mp4",
  "assets/guest/locations/pavel/tour-bedroom.webp",
  "assets/guest/locations/pavel/storage-slide-light.webp",
  "assets/guest/locations/pavel/senior-guide-slide-exit.mp4",
].forEach((rel) => {
  if (!fs.existsSync(path.join(projectRoot, rel))) {
    errors.push(`missing media ${rel}`);
  }
});

const runtimePath = path.join(projectRoot, "js", "pavel-observation-booth.js");
const runtimeSource = fs.readFileSync(runtimePath, "utf8");
if (!runtimeSource.includes("nightstand-cassette.mp4")) {
  errors.push("runtime missing nightstand-cassette.mp4");
}
if (!runtimeSource.includes("storage-pavel-escape.mp4")) {
  errors.push("runtime missing approved Pavel storage escape clip");
}
if (!runtimeSource.includes("senior-guide-slide-exit.mp4")) {
  errors.push("runtime missing accepted senior-guide-slide-exit.mp4");
}
if (!runtimeSource.includes("drain-hungry.mp4")) {
  errors.push("runtime missing drain-hungry.mp4");
}
if (!runtimeSource.includes("drain-vague.mp4")) {
  errors.push("runtime missing drain-vague.mp4");
}
if (!runtimeSource.includes("drain-beckon.mp4")) {
  errors.push("runtime missing drain-beckon.mp4");
}
if (!runtimeSource.includes("drain-cough.mp4")) {
  errors.push("runtime missing drain-cough.mp4");
}
if (!runtimeSource.includes("control-empty.mp4")) {
  errors.push("runtime missing control-empty.mp4");
}
if (!runtimeSource.includes("hatch-tray.mp4")) {
  errors.push("runtime missing hatch-tray.mp4");
}
if (!runtimeSource.includes("Начать новую смену")) {
  errors.push("runtime missing Lora-template closed-shift replay");
}
if (!runtimeSource.includes("Вернуться в технический раздел")) {
  errors.push("runtime missing Lora-template closed-shift leave");
}
if (runtimeSource.includes("НАЧАТЬ ЗАНОВО")) {
  errors.push("runtime must not invent a unique replay label");
}
if (!runtimeSource.includes("seniorGuideExit")) {
  errors.push("runtime missing seniorGuideExit finale flag");
}
if (!runtimeSource.includes("video.loop = false")) {
  errors.push("runtime must keep one-shot clips off loop");
}

console.log(`content: ${path.relative(projectRoot, contentPath)}`);
console.log(`nodes: ${nodeIds.size}`);
console.log(`start: ${content.startNode || "missing"}`);
console.log(`rooms: ${rooms.size}; sounds: ${sounds.size}; visuals: ${visuals.size}; artifacts: ${artifacts.size}`);
console.log(`statically reachable: ${reachable.size}/${nodeIds.size}`);

if (errors.length) {
  console.error(`\nErrors (${errors.length}):`);
  errors.forEach((item) => console.error(`  - ${item}`));
  process.exit(1);
}

console.log("\nOK: Pavel observation booth content is valid.");
