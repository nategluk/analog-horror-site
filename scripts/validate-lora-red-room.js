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
  "V00_SYSTEM_VOID",
  "V01_EMPTY_COUNTER",
  "V02_PIG_MASKED",
  "V03_PIG_REVEAL",
  "V04_PIG_UNMASKED",
  "V05_FOX_GAZE",
  "V06_FOX_ACTION",
  "V07_DOG_BLANK",
  "V08_DOG_SETTLED",
  "V09_DOG_CURTAIN",
  "V10_FOX_DOG",
  "V11_DOG_SLEEP",
  "V12_EMPTY_CURTAIN",
  "V13_RECEIPT",
]);
const expectedVisual = {
  assign_notice: "V00_SYSTEM_VOID",
  shift_counter: "V01_EMPTY_COUNTER",
  note_read: "V01_EMPTY_COUNTER",
  pig_arrive: "V02_PIG_MASKED",
  pig_enter: "V02_PIG_MASKED",
  pig_today: "V02_PIG_MASKED",
  pig_blue_key: "V02_PIG_MASKED",
  pig_source: "V02_PIG_MASKED",
  pig_deny: "V02_PIG_MASKED",
  pig_follow_note: "V02_PIG_MASKED",
  pig_escapes: "V02_PIG_MASKED",
  pig_camera_check: "V02_PIG_MASKED",
  pig_reveal: "V03_PIG_REVEAL",
  pig_suit: "V02_PIG_MASKED",
  pig_center: "V02_PIG_MASKED",
  pig_test: "V02_PIG_MASKED",
  pig_talk: "V02_PIG_MASKED",
  pig_tag: "V02_PIG_MASKED",
  pig_hide: "V02_PIG_MASKED",
  pig_wait: "V02_PIG_MASKED",
  pig_tech: "V02_PIG_MASKED",
  pig_tomorrow: "V02_PIG_MASKED",
  pig_deny_leave: "V02_PIG_MASKED",
  pig_tech_run: "V01_EMPTY_COUNTER",
  pig_gone: "V01_EMPTY_COUNTER",
  fox_arrive: "V05_FOX_GAZE",
  fox_enter: "V05_FOX_GAZE",
  fox_camera: "V05_FOX_GAZE",
  fox_smell: "V05_FOX_GAZE",
  fox_tag_hidden: "V05_FOX_GAZE",
  fox_tag_shown: "V05_FOX_GAZE",
  fox_lie: "V05_FOX_GAZE",
  fox_gave_pig: "V05_FOX_GAZE",
  fox_partial: "V05_FOX_GAZE",
  fox_gave_wait: "V05_FOX_GAZE",
  fox_oleg: "V06_FOX_ACTION",
  fox_oleg_photo: "V06_FOX_ACTION",
  fox_oleg_ask: "V06_FOX_ACTION",
  fox_deny_oleg: "V06_FOX_ACTION",
  fox_why: "V06_FOX_ACTION",
  fox_curtain: "V06_FOX_ACTION",
  fox_level: "V06_FOX_ACTION",
  fox_monopoly: "V06_FOX_ACTION",
  fox_leave: "V06_FOX_ACTION",
  dog_arrive: "V07_DOG_BLANK",
  dog_where: "V07_DOG_BLANK",
  dog_hospital: "V07_DOG_BLANK",
  dog_costume: "V07_DOG_BLANK",
  dog_water: "V08_DOG_SETTLED",
  dog_coffee: "V08_DOG_SETTLED",
  dog_player_name: "V08_DOG_SETTLED",
  dog_ask_name: "V07_DOG_BLANK",
  dog_settled: "V08_DOG_SETTLED",
  dog_name_again: "V07_DOG_BLANK",
  dog_after_name: "V07_DOG_BLANK",
  dog_dreams: "V08_DOG_SETTLED",
  dog_exception: "V08_DOG_SETTLED",
  dog_dream_cafe: "V08_DOG_SETTLED",
  dog_dream_forget: "V08_DOG_SETTLED",
  dog_dream_raw: "V08_DOG_SETTLED",
  dog_dream_reverse: "V08_DOG_SETTLED",
  dog_call_fox: "V08_DOG_SETTLED",
  dog_exit_hint: "V09_DOG_CURTAIN",
  dog_phone: "V09_DOG_CURTAIN",
  final_conflict: "V09_DOG_CURTAIN",
  final_conflict_dog: "V09_DOG_CURTAIN",
  pig_warns: "V09_DOG_CURTAIN",
  end_leave: "V11_DOG_SLEEP",
  end_leave_sleep: "V11_DOG_SLEEP",
  end_give: "V10_FOX_DOG",
  end_give_meet: "V10_FOX_DOG",
  end_give_answer: "V10_FOX_DOG",
  end_give_leave: "V01_EMPTY_COUNTER",
  end_sea: "V09_DOG_CURTAIN",
  end_sea_go: "V09_DOG_CURTAIN",
  end_sea_sound: "V12_EMPTY_CURTAIN",
  end_none: "V09_DOG_CURTAIN",
  end_none_stay: "V09_DOG_CURTAIN",
  end_none_morning: "V01_EMPTY_COUNTER",
  aftermath: "V01_EMPTY_COUNTER",
  aftermath_pig: "V01_EMPTY_COUNTER",
  receipt_print: "V13_RECEIPT",
  receipt_back: "V13_RECEIPT",
  shift_done: "V13_RECEIPT",
};
const pigRevealedNodes = [
  "pig_suit",
  "pig_center",
  "pig_test",
  "pig_talk",
  "pig_hide",
  "pig_tag",
];
const pigRemaskNodes = [
  "pig_wait",
  "pig_tech",
  "pig_tomorrow",
  "pig_deny_leave",
];
const unknownVisuals = [];
const mismatchedVisuals = [];
ids.forEach((id) => {
  const node = nodes[id];
  [node.visual, ...(node.visualWhen || []).map((entry) => entry.visual)]
    .filter(Boolean)
    .forEach((visual) => {
      if (!allowedVisuals.has(visual)) unknownVisuals.push(`${id}:${visual}`);
    });
  if (expectedVisual[id] && node.visual !== expectedVisual[id]) {
    mismatchedVisuals.push(`${id}:${node.visual || "none"}`);
  }
  if (!node.visual) mismatchedVisuals.push(`${id}:missing`);
});
const remaskErrors = pigRemaskNodes.filter((id) => {
  const node = nodes[id];
  return (
    node.visual !== "V02_PIG_MASKED" ||
    (node.visualWhen && node.visualWhen.length)
  );
});
const revealWhenErrors = pigRevealedNodes.filter((id) => {
  const revealedVisual = (nodes[id].visualWhen || []).find((entry) =>
    (entry.require || []).includes("pigRevealed")
  );
  return (
    nodes[id].visual !== "V02_PIG_MASKED" ||
    revealedVisual?.visual !== "V04_PIG_UNMASKED"
  );
});
const requiredAssets = [
  "assets/staff/personnel/oleg-record.webp",
  "assets/guest/red-room/lora/scenes/v01-empty-counter-v1.webp",
  "assets/guest/red-room/lora/scenes/v01-empty-idle.mp4",
  "assets/guest/red-room/lora/scenes/v02-pig-masked.webp",
  "assets/guest/red-room/lora/scenes/v02-pig-masked-idle.mp4",
  "assets/guest/red-room/lora/scenes/v02-pig-wander.mp4",
  "assets/guest/red-room/lora/scenes/v02-pig-arrive.mp4",
  "assets/guest/red-room/lora/scenes/v02-pig-leave.mp4",
  "assets/guest/red-room/lora/scenes/v02-pig-wander.webp",
  "assets/guest/red-room/lora/scenes/v02-pig-arrive-far.webp",
  "assets/guest/red-room/lora/scenes/v02-pig-arrive-mid.webp",
  "assets/guest/red-room/lora/scenes/v03-pig-reveal.mp4",
  "assets/guest/red-room/lora/scenes/v03-pig-reveal-poster.webp",
  "assets/guest/red-room/lora/scenes/v04-pig-unmasked.webp",
  "assets/guest/red-room/lora/scenes/v05-fox-gaze-idle.mp4",
  "assets/guest/red-room/lora/scenes/v05-fox-gaze.webp",
  "assets/guest/red-room/lora/scenes/v06-fox-action-idle.mp4",
  "assets/guest/red-room/lora/scenes/v06-fox-action.webp",
  "assets/guest/red-room/lora/scenes/v14-fox-gum-bubble.png",
  "assets/guest/red-room/lora/scenes/v14-fox-gum-pop-v1.mp4",
  "assets/guest/red-room/lora/scenes/v15-fox-candy-offer.png",
  "assets/guest/red-room/lora/scenes/v15-fox-candy-offer-v1.mp4",
  "assets/guest/red-room/lora/scenes/v07-dog-blank.webp",
  "assets/guest/red-room/lora/scenes/v08-dog-settled.webp",
  "assets/guest/red-room/lora/scenes/v08-dog-stand.webp",
  "assets/guest/red-room/lora/scenes/v08-dog-aisle.webp",
  "assets/guest/red-room/lora/scenes/v08-dog-wander.mp4",
  "assets/guest/red-room/lora/scenes/v09-dog-curtain.webp",
  "assets/guest/red-room/lora/scenes/v10-fox-dog.webp",
  "assets/guest/red-room/lora/scenes/v11-dog-sleep-idle.mp4",
  "assets/guest/red-room/lora/scenes/v11-dog-sleep.webp",
  "assets/guest/red-room/lora/scenes/v12-empty-curtain.webp",
  "assets/audio/guest/red-room/shift/bed-empty.mp3",
  "assets/audio/guest/red-room/shift/bed-pig.mp3",
  "assets/audio/guest/red-room/shift/bed-fox.mp3",
  "assets/audio/guest/red-room/shift/bed-dog.mp3",
  "assets/audio/guest/red-room/shift/sfx-door.mp3",
  "assets/audio/guest/red-room/shift/sfx-cup.mp3",
  "assets/audio/guest/red-room/shift/sfx-phone.mp3",
  "assets/audio/guest/red-room/shift/sfx-phone-buzz.mp3",
  "assets/audio/guest/red-room/shift/sfx-phone-shutter.mp3",
  "assets/audio/guest/red-room/shift/sfx-sit-pig.mp3",
  "assets/audio/guest/red-room/shift/sfx-sit-fox.mp3",
  "assets/audio/guest/red-room/shift/sfx-sit-dog.mp3",
  "assets/audio/guest/red-room/shift/sfx-sigh-pig.mp3",
  "assets/audio/guest/red-room/shift/sfx-sigh-fox.mp3",
  "assets/audio/guest/red-room/shift/sfx-sigh-dog.mp3",
  "assets/audio/guest/red-room/shift/sfx-print.mp3",
  "assets/audio/guest/red-room/shift/sfx-sea-waves.mp3",
  "assets/audio/guest/red-room/shift/sfx-sea-gulls.mp3",
  "assets/audio/guest/red-room/shift/sfx-sea-plastic.mp3",
  "assets/audio/guest/red-room/shift/sfx-sea-thud.mp3",
];
const missingAssets = requiredAssets.filter(
  (asset) => !fs.existsSync(path.join(__dirname, "..", asset))
);
const emptyChoices = ids.filter((id) => {
  const node = nodes[id];
  return !node.autoNext && !(node.choices && node.choices.length);
});
const unmappedNodes = ids.filter((id) => !expectedVisual[id]);
const textFor = (node) =>
  [
    node.line,
    node.lineReplay,
    node.lineDefault,
    node.lineHidden,
    node.lineWaiting,
    node.lineReported,
  ]
    .filter((line) => typeof line === "string")
    .join("\n");
const foxForbiddenText = ids
  .filter((id) => nodes[id].speaker === "ЛИСА")
  .filter((id) => /олег|журналист|микрофон/i.test(textFor(nodes[id])));
const dogForbiddenText = ids
  .filter((id) => nodes[id].speaker === "ПЁС")
  .filter((id) => /олег/i.test(textFor(nodes[id])));
const foxPhotoContract =
  nodes.fox_oleg?.props?.includes("photo") ||
  nodes.fox_oleg.line !==
    "Аниматор самовольно покинул зоопарк «Лосиный Остров»." ||
  !nodes.fox_oleg_photo?.props?.includes("photo") ||
  nodes.fox_oleg_photo.inspect !== "photo" ||
  !(nodes.fox_oleg.choices || []).some((choice) => choice.id === "look_photo") ||
  (nodes.fox_oleg_ask.choices || []).length !== 4;

if (
  missing.length ||
  absentRequired.length ||
  unknownVisuals.length ||
  mismatchedVisuals.length ||
  remaskErrors.length ||
  revealWhenErrors.length ||
  missingAssets.length ||
  emptyChoices.length ||
  unmappedNodes.length ||
  foxForbiddenText.length ||
  dogForbiddenText.length ||
  foxPhotoContract
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
  if (mismatchedVisuals.length) {
    console.error("Visual mapping mismatches:", mismatchedVisuals.join(", "));
  }
  if (remaskErrors.length) {
    console.error("Pig remask nodes must stay V02 without visualWhen:", remaskErrors.join(", "));
  }
  if (revealWhenErrors.length) {
    console.error("Pig reveal continuation missing V02/V04 visualWhen:", revealWhenErrors.join(", "));
  }
  if (missingAssets.length) {
    console.error("Required visual assets missing:", missingAssets.join(", "));
  }
  if (emptyChoices.length) {
    console.error("Nodes without exit:", emptyChoices.join(", "));
  }
  if (unmappedNodes.length) {
    console.error("Nodes missing from visual matrix:", unmappedNodes.join(", "));
  }
  if (foxForbiddenText.length) {
    console.error("Fox dialogue exposes the investigation directly:", foxForbiddenText.join(", "));
  }
  if (dogForbiddenText.length) {
    console.error("Dog dialogue names Oleg:", dogForbiddenText.join(", "));
  }
  if (foxPhotoContract) {
    console.error("Fox photo contract is incomplete at fox_oleg.");
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
