#!/usr/bin/env node
"use strict";

const fs = require("node:fs");
const path = require("node:path");
const { indexGame, patchLine, deleteInboxMessage } = require("./lib/copydesk-core");

const irina = indexGame("irina");
const lora = indexGame("lora");

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
if (!irina.messages.some((item) => item.id === "fox-after-shift" && item.sender === "ЛИСА")) {
  throw new Error("fox cabinet message not indexed");
}
if (!irina.characters.some((hero) => hero.name === "ЛИСА" && !hero.locked)) {
  throw new Error("inbox senders should appear in character roster");
}
if (!irina.lines.some((line) => line.id === "inbox:fox-after-shift:subject")) {
  throw new Error("inbox subject line not indexed");
}

const intro = irina.lines.find((line) => line.id === "node:intro:text");
const file = path.join(__dirname, "..", "content", "irina", "call-content.js");
const before = fs.readFileSync(file, "utf8");
try {
  patchLine("irina", intro.id, intro.text, `${intro.text} `);
  patchLine("irina", intro.id, `${intro.text} `, intro.text);

  const sender = irina.lines.find((line) => line.id === "inbox:fox-after-shift:sender");
  patchLine("irina", sender.id, sender.text, "ЛИСА-ТЕСТ");
  const renamed = indexGame("irina");
  if (!renamed.messages.some((item) => item.id === "fox-after-shift" && item.sender === "ЛИСА-ТЕСТ")) {
    throw new Error("inbox sender patch failed");
  }
  patchLine("irina", sender.id, "ЛИСА-ТЕСТ", sender.text);

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

console.log("OK smoke-copydesk");
