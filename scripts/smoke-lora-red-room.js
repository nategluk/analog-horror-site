#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const vm = require("vm");

require("./validate-lora-red-room.js");

const source = fs.readFileSync(
  path.join(__dirname, "..", "content", "lora", "red-room-content.js"),
  "utf8"
);
const sandbox = { window: {}, console };
vm.createContext(sandbox);
vm.runInContext(source, sandbox);
const { nodes, startNode } = sandbox.window.TyndexLoraRedRoomContent;

const visible = (choice, flags) => {
  if ((choice.require || []).some((flag) => !flags[flag])) return false;
  if ((choice.requireAny || []).length && !(choice.requireAny || []).some((flag) => flags[flag])) {
    return false;
  }
  if ((choice.hideIf || []).some((flag) => flags[flag])) return false;
  return true;
};

const walk = (picks, label) => {
  let id = startNode;
  const flags = {};
  const seen = [];
  const state = {
    pigOutcome: null,
    foxOutcome: null,
    dogOutcome: null,
    receiptVariant: null,
    completed: false,
  };
  let guard = 0;
  while (id && id !== "leave" && guard < 120) {
    const node = nodes[id];
    if (!node) throw new Error(`${label}: missing ${id}`);
    seen.push(id);
    guard += 1;
    (node.set || []).forEach((flag) => {
      flags[flag] = true;
    });
    if (node.foxOutcome) state.foxOutcome = node.foxOutcome;
    if (node.complete) state.completed = true;
    if (node.autoNext) {
      id = node.autoNext;
      continue;
    }
    const choices = (node.choices || []).filter((choice) => visible(choice, flags));
    if (!choices.length) throw new Error(`${label}: no choices at ${id}`);
    const pickId = picks[id];
    const choice = choices.find((item) => item.id === pickId) || choices[0];
    (choice.set || []).forEach((flag) => {
      flags[flag] = true;
    });
    if (choice.pigOutcome) state.pigOutcome = choice.pigOutcome;
    if (choice.foxOutcome) state.foxOutcome = choice.foxOutcome;
    if (choice.dogOutcome) state.dogOutcome = choice.dogOutcome;
    if (choice.receiptVariant) state.receiptVariant = choice.receiptVariant;
    if (choice.leave) break;
    if (choice.restart) break;
    id = choice.next;
  }
  if (!state.completed && !seen.includes("receipt_print")) {
    throw new Error(`${label}: did not reach receipt`);
  }
  console.log(
    `${label}: ${seen.length} nodes, pig=${state.pigOutcome}, fox=${state.foxOutcome}, dog=${state.dogOutcome}, receipt=${state.receiptVariant}`
  );
  return { flags, seen, state };
};

if (nodes.pig_escapes.autoNext !== "pig_camera_check") {
  throw new Error("pig reveal: escape story must lead to camera check");
}
const disableCamera = nodes.pig_camera_check.choices.find(
  (choice) => choice.id === "disable_camera"
);
const leaveCamera = nodes.pig_camera_check.choices.find(
  (choice) => choice.id === "leave_camera"
);
if (
  disableCamera?.next !== "pig_reveal" ||
  !(disableCamera.set || []).includes("cameraDisabled") ||
  leaveCamera?.next !== "pig_suit" ||
  nodes.pig_reveal.visual !== "V03_PIG_REVEAL" ||
  !(nodes.pig_reveal.set || []).includes("pigRevealed")
) {
  throw new Error("pig reveal: camera branch contract is incomplete");
}
[
  "pig_suit",
  "pig_center",
  "pig_test",
  "pig_talk",
  "pig_hide",
  "pig_tag",
].forEach((id) => {
  const revealedVisual = (nodes[id].visualWhen || []).find((entry) =>
    (entry.require || []).includes("pigRevealed")
  );
  if (
    nodes[id].visual !== "V02_PIG_MASKED" ||
    revealedVisual?.visual !== "V04_PIG_UNMASKED"
  ) {
    throw new Error(`pig reveal: V02/V04 continuation is incomplete at ${id}`);
  }
});
[
  "pig_wait",
  "pig_tech",
  "pig_tomorrow",
  "pig_deny_leave",
].forEach((id) => {
  if (
    nodes[id].visual !== "V02_PIG_MASKED" ||
    (nodes[id].visualWhen && nodes[id].visualWhen.length)
  ) {
    throw new Error(`pig remask: ${id} must use V02_PIG_MASKED without visualWhen`);
  }
});
[
  ["dog_arrive", "V07_DOG_BLANK"],
  ["dog_settled", "V08_DOG_SETTLED"],
  ["dog_ask_name", "V07_DOG_BLANK"],
  ["dog_exit_hint", "V09_DOG_CURTAIN"],
  ["dog_call_fox", "V08_DOG_SETTLED"],
  ["pig_warns", "V09_DOG_CURTAIN"],
  ["end_give", "V10_FOX_DOG"],
  ["end_give_leave", "V01_EMPTY_COUNTER"],
  ["end_sea", "V09_DOG_CURTAIN"],
  ["end_sea_sound", "V12_EMPTY_CURTAIN"],
  ["end_none", "V09_DOG_CURTAIN"],
  ["end_none_morning", "V01_EMPTY_COUNTER"],
  ["aftermath", "V01_EMPTY_COUNTER"],
  ["receipt_print", "V13_RECEIPT"],
  ["shift_done", "V13_RECEIPT"],
].forEach(([id, visual]) => {
  if (nodes[id].visual !== visual) {
    throw new Error(`visual matrix: ${id} must use ${visual}`);
  }
});

[
  "fox_arrive",
  "fox_enter",
  "fox_camera",
  "fox_smell",
  "fox_tag_hidden",
  "fox_tag_shown",
  "fox_lie",
  "fox_gave_pig",
  "fox_partial",
  "fox_gave_wait",
].forEach((id) => {
  if (nodes[id].visual !== "V05_FOX_GAZE") {
    throw new Error(`fox ambient: V05 mapping is missing at ${id}`);
  }
});

[
  "fox_oleg",
  "fox_deny_oleg",
  "fox_why",
  "fox_curtain",
  "fox_level",
  "fox_monopoly",
  "fox_leave",
].forEach((id) => {
  if (nodes[id].visual !== "V06_FOX_ACTION") {
    throw new Error(`fox ambient: V06 mapping is missing at ${id}`);
  }
});

["end_leave", "end_leave_sleep"].forEach((id) => {
  if (nodes[id].visual !== "V11_DOG_SLEEP") {
    throw new Error(`dog ambient: V11 mapping is missing at ${id}`);
  }
});

["pig_talk", "fox_smell", "final_conflict_dog"].forEach((id) => {
  const choices = nodes[id].choices || [];
  if (choices.some((choice) => !choice.group)) {
    throw new Error(`choice groups: ${id} contains an ungrouped choice`);
  }
  const groups = new Map();
  choices.forEach((choice) => {
    groups.set(choice.group, (groups.get(choice.group) || 0) + 1);
  });
  if (groups.size > 4 || [...groups.values()].some((count) => count > 3)) {
    throw new Error(`choice groups: ${id} exceeds the four-button mobile budget`);
  }
});

if (!nodes.end_leave.action || nodes.pig_reveal.speaker !== "СМЕНА") {
  throw new Error("text roles: narration and mixed action are not separated");
}

const revealRun = walk(
  {
    pig_blue_key: "ask_how",
    pig_camera_check: "disable_camera",
    pig_talk: "hide_pig",
    final_conflict_dog: "end_leave",
  },
  "pig-reveal-v03-v04"
);
if (!revealRun.flags.cameraDisabled || !revealRun.flags.pigRevealed) {
  throw new Error("pig reveal: reveal path did not retain its state flags");
}

const maskedRun = walk(
  {
    pig_blue_key: "ask_how",
    pig_camera_check: "leave_camera",
    pig_talk: "hide_pig",
    final_conflict_dog: "end_leave",
  },
  "pig-camera-on-v02"
);
if (maskedRun.flags.cameraDisabled || maskedRun.flags.pigRevealed) {
  throw new Error("pig reveal: camera-on path incorrectly revealed the guest");
}

walk(
  {
    pig_talk: "hide_pig",
    fox_smell: "fox_deny_guest",
    fox_oleg: "deny_oleg",
    dog_costume: "pour_water",
    dog_settled: "ask_dreams",
    dog_exception: "dream_cafe",
    final_conflict_dog: "end_leave",
    receipt_back: "keep_receipt",
  },
  "hidden-lie-leave"
);

walk(
  {
    pig_talk: "call_tech",
    fox_smell: "fox_show_tag",
    fox_oleg: "ask_why",
    dog_costume: "give_coffee",
    dog_settled: "ask_dreams",
    dog_exception: "dream_forget",
    final_conflict_dog: "end_give",
  },
  "reported-coop-give"
);

walk(
  {
    pig_talk: "hide_pig",
    fox_smell: "fox_give_hidden",
    fox_oleg: "lie_curtain",
    dog_costume: "ask_his_name",
    dog_settled: "ask_dreams",
    dog_exception: "dream_no_therapy",
    final_conflict_dog: "warn_sea",
    pig_warns: "after_warn_sea",
  },
  "hidden-warn-sea"
);

walk(
  {
    pig_talk: "wait_laura",
    fox_smell: "fox_he_waits",
    fox_oleg: "ask_level",
    dog_costume: "say_name",
    dog_settled: "ask_exit_early",
    final_conflict_dog: "end_none",
  },
  "waiting-unassigned"
);

console.log("OK smoke-lora-red-room");
