#!/usr/bin/env node
"use strict";

const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { indexGame, patchLine, deleteInboxMessage } = require("./lib/copydesk-core");

const irina = indexGame("irina");
const lora = indexGame("lora");
const pavel = indexGame("pavel");
const solnyshko = indexGame("solnyshko");

if (irina.nodes.length < 100) throw new Error("irina nodes missing");
if (lora.nodes.length < 80) throw new Error("lora nodes missing");
if (!irina.lines.some((line) => line.id === "node:intro:text")) {
  throw new Error("intro text not indexed");
}
if (!lora.lines.some((line) => line.kind === "thought")) {
  throw new Error("lora thoughts not indexed");
}
if (!irina.characters.some((hero) => hero.name === "ИРИНА В.")) {
  throw new Error("irina character roster missing");
}
if (!lora.characters.some((hero) => hero.name === "ХРЮША" && !hero.locked)) {
  throw new Error("hryusha should be renameable");
}
if (!lora.characters.some((hero) => hero.name === "Я" && hero.locked)) {
  throw new Error("player thought role should be locked");
}
if ((irina.messages || []).length < 5) {
  throw new Error("irina inbox messages missing");
}
if (lora.messages && lora.messages.length) {
  throw new Error("lora should not expose cabinet inbox templates");
}
if (!irina.messages.some((item) => item.id === "fox-after-shift" && item.sender === "АЛИСА")) {
  throw new Error("fox cabinet message not indexed");
}
if (!irina.characters.some((hero) => hero.name === "АЛИСА" && !hero.locked)) {
  throw new Error("inbox senders should appear in character roster");
}
if (!irina.lines.some((line) => line.id === "inbox:fox-after-shift:subject")) {
  throw new Error("inbox subject line not indexed");
}

if (pavel.nodes.length < 12) throw new Error("pavel nodes missing");
if (!pavel.lines.some((line) => line.id === "node:booth-intro:speaker" && line.text === "ПАВЕЛ")) {
  throw new Error("pavel speaker not indexed");
}
if (!pavel.lines.some((line) => line.id === "node:booth-intro:text")) {
  throw new Error("pavel text not indexed");
}
if (!pavel.lines.some((line) => line.kind === "thought")) {
  throw new Error("pavel thoughts not indexed");
}
if (!pavel.lines.some((line) => line.id === "node:hatch-note:speaker" && line.text === "ЗАПИСКА")) {
  throw new Error("pavel note speaker not indexed");
}
if (!pavel.lines.some((line) => line.id === "node:booth-intro:choices[0].label")) {
  throw new Error("pavel choice label not indexed");
}
if (!pavel.lines.some((line) => line.id === "node:bedroom-check:choices[0].imageAlt")) {
  throw new Error("pavel imageAlt should remain editable");
}
if (!pavel.lines.some((line) => line.id === "node:control-camera-ask:refusalText")) {
  throw new Error("pavel refusalText not indexed");
}
const pavelCharacter = pavel.characters.find((character) => character.name === "ПАВЕЛ");
if (!pavelCharacter || pavelCharacter.locked) {
  throw new Error("pavel character roster missing editable ПАВЕЛ");
}
const drainCharacter = pavel.characters.find(
  (character) => character.name === "ГОЛОС ИЗ СЛИВА"
);
if (!drainCharacter || !drainCharacter.locked) {
  throw new Error("pavel character roster missing locked ГОЛОС ИЗ СЛИВА");
}
const guideCharacter = pavel.characters.find(
  (character) => character.name === "ПРОВОДНИЦА"
);
if (!guideCharacter || !guideCharacter.locked) {
  throw new Error("pavel character roster missing locked ПРОВОДНИЦА");
}

const pavelLiterary = new Set(pavel.lines.map((line) => line.text));
const pavelFields = pavel.lines.map((line) => line.field);
const hiddenPavelTokens = [
  "control",
  "bedroom",
  "bathroom",
  "storage",
  "hatch",
  "test-channel-static",
  "test-distant-laugh",
  "test-drain-hum",
  "test-door",
  "test-paper",
  "test-phone",
  "test-click",
  "CONTROL_PAVEL_PRESENT",
  "CONTROL_EMPTY",
  "BEDROOM_BASE",
  "DRAIN_BASE",
  "DRAIN_VAGUE",
  "DRAIN_BECKON",
  "DRAIN_COUGH",
  "DRAIN_HAIR_LONG",
  "STORAGE_BASE",
  "STORAGE_ESCAPE",
  "HATCH_BASE",
  "HATCH_CLOSED",
  "HATCH_GASMASK",
  "HATCH_DESSERT",
  "test-cassette-slot",
  "test-tray-note",
  "booth-sound-ack",
  "control-laugh",
  "bedroom-check",
  "dev-drain-fragment",
  "dev-operator-hold",
  "heardBedroomLaugh",
  "soundEnabled",
  "textFallback",
  "markBedroomCheck",
  "cassetteFound",
  "cameraBlind",
  "dev-mechanical-image-id",
];
hiddenPavelTokens.forEach((token) => {
  if (pavelLiterary.has(token)) {
    throw new Error(`pavel mechanical token indexed as literature: ${token}`);
  }
});
["room", "sound", "visual", "next", "set", "require", "requireAny", "effect"].forEach((key) => {
  if (pavelFields.some((field) => field === key || field.endsWith(`.${key}`))) {
    throw new Error(`pavel mechanical field indexed: ${key}`);
  }
});
if (pavel.lines.some((line) => String(line.text).includes("_stage1Keep"))) {
  throw new Error("unknown pavel choice field leaked into literature");
}

if (solnyshko.nodes.length !== 13) throw new Error("solnyshko nodes missing");
if (!solnyshko.lines.some((line) => line.id === "node:gate-night:text")) {
  throw new Error("solnyshko gate text not indexed");
}
if (!solnyshko.lines.some((line) => line.id === "node:birthday-check:input.prompt")) {
  throw new Error("solnyshko birthday prompt not indexed");
}
if (!solnyshko.lines.some((line) => line.id === "node:birthday-recorded:text")) {
  throw new Error("solnyshko impostor registration beat not indexed");
}
if (!solnyshko.lines.some((line) => line.id === "node:park-grounds:mediaFallback")) {
  throw new Error("solnyshko visible media fallback not indexed");
}
if (!solnyshko.lines.some((line) => line.id === "node:irina-thanks:text")) {
  throw new Error("solnyshko irina thanks not indexed");
}
if (solnyshko.lines.some((line) => ["next", "set", "poster", "id", "showFor", "hideFor", "inspect", "href", "src", "restart"].some((field) =>
  line.field === field || line.field.endsWith(`.${field}`)
))) {
  throw new Error("solnyshko mechanical field indexed as literature");
}

const loadPavelContent = (filePath) => {
  const source = fs.readFileSync(filePath, "utf8");
  const sandbox = { window: {}, console };
  vm.runInNewContext(source, sandbox, { filename: filePath, timeout: 4000 });
  const content = sandbox.window.TyndexPavelObservationBoothContent;
  if (!content?.nodes) throw new Error("pavel content failed to load");
  return content;
};

const snapshotPavelMechanics = (content) => {
  const out = {};
  Object.entries(content.nodes).forEach(([id, node]) => {
    out[id] = {
      room: node.room,
      sound: node.sound,
      visual: node.visual,
      effect: node.effect,
      complete: node.complete,
      artifact: node.artifact,
      choices: (node.choices || []).map((choice) => {
        const copy = { ...choice };
        delete copy.label;
        delete copy.imageAlt;
        return copy;
      }),
    };
  });
  return out;
};

const intro = irina.lines.find((line) => line.id === "node:intro:text");
const file = path.join(__dirname, "..", "content", "irina", "call-content.js");
const before = fs.readFileSync(file, "utf8");
try {
  patchLine("irina", intro.id, intro.text, `${intro.text} `);
  patchLine("irina", intro.id, `${intro.text} `, intro.text);

  const sender = irina.lines.find((line) => line.id === "inbox:fox-after-shift:sender");
  patchLine("irina", sender.id, sender.text, "АЛИСА-ТЕСТ");
  const renamed = indexGame("irina");
  if (!renamed.messages.some((item) => item.id === "fox-after-shift" && item.sender === "АЛИСА-ТЕСТ")) {
    throw new Error("inbox sender patch failed");
  }
  patchLine("irina", sender.id, "АЛИСА-ТЕСТ", sender.text);

  deleteInboxMessage("irina", "lora-red-room");
  const afterDelete = indexGame("irina");
  if (afterDelete.messages.some((item) => item.id === "lora-red-room")) {
    throw new Error("inbox delete did not remove template");
  }
  if (!afterDelete.messages.some((item) => item.id === "fox-after-shift")) {
    throw new Error("inbox delete touched a neighboring message");
  }
} finally {
  fs.writeFileSync(file, before, "utf8");
}

const restored = fs.readFileSync(file, "utf8");
if (restored !== before) {
  throw new Error("copydesk patch did not roundtrip");
}

const pavelFile = path.join(__dirname, "..", "content", "pavel", "observation-booth-content.js");
const pavelBefore = fs.readFileSync(pavelFile, "utf8");
const pavelMechanicsBefore = snapshotPavelMechanics(loadPavelContent(pavelFile));
if (pavelMechanicsBefore["bedroom-check"]?.choices?.[0]?._stage1Keep !== true) {
  throw new Error("pavel unknown choice field missing before roundtrip");
}
const pavelLine = pavel.lines.find((line) => line.id === "node:booth-intro:text");
try {
  patchLine("pavel", pavelLine.id, pavelLine.text, `${pavelLine.text} `);
  const patched = indexGame("pavel");
  const patchedLine = patched.lines.find((line) => line.id === pavelLine.id);
  if (!patchedLine || patchedLine.text !== `${pavelLine.text} `) {
    throw new Error("pavel text patch was not re-indexed");
  }
  const pavelMechanicsPatched = snapshotPavelMechanics(loadPavelContent(pavelFile));
  if (JSON.stringify(pavelMechanicsPatched) !== JSON.stringify(pavelMechanicsBefore)) {
    throw new Error("pavel mechanical fields changed during literary patch");
  }
  patchLine("pavel", pavelLine.id, `${pavelLine.text} `, pavelLine.text);
} finally {
  fs.writeFileSync(pavelFile, pavelBefore, "utf8");
}

const pavelRestored = fs.readFileSync(pavelFile, "utf8");
if (pavelRestored !== pavelBefore) {
  throw new Error("pavel copydesk patch did not roundtrip byte-identical");
}
const pavelMechanicsAfter = snapshotPavelMechanics(loadPavelContent(pavelFile));
if (JSON.stringify(pavelMechanicsAfter) !== JSON.stringify(pavelMechanicsBefore)) {
  throw new Error("pavel mechanical fields did not survive roundtrip");
}

const solnyshkoFile = path.join(
  __dirname,
  "..",
  "content",
  "irina",
  "solnyshko-park-content.js"
);
const solnyshkoBefore = fs.readFileSync(solnyshkoFile, "utf8");
const solnyshkoLine = solnyshko.lines.find(
  (line) => line.id === "node:gate-night:text"
);
try {
  patchLine("solnyshko", solnyshkoLine.id, solnyshkoLine.text, `${solnyshkoLine.text} `);
  const patched = indexGame("solnyshko");
  const patchedLine = patched.lines.find((line) => line.id === solnyshkoLine.id);
  if (!patchedLine || patchedLine.text !== `${solnyshkoLine.text} `) {
    throw new Error("solnyshko text patch was not re-indexed");
  }
  patchLine("solnyshko", solnyshkoLine.id, `${solnyshkoLine.text} `, solnyshkoLine.text);
} finally {
  fs.writeFileSync(solnyshkoFile, solnyshkoBefore, "utf8");
}

if (fs.readFileSync(solnyshkoFile, "utf8") !== solnyshkoBefore) {
  throw new Error("solnyshko copydesk patch did not roundtrip byte-identical");
}

console.log("OK smoke-copydesk");
