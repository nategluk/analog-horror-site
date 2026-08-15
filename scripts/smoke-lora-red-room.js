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
    if (node.complete) break;
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
    throw new Error(`${label}: did not reach a completed ending`);
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
  "pig_bargain",
  "pig_talk",
  "pig_hide",
  "pig_hide_tag",
  "pig_tag",
  "pig_toy_take",
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
  "pig_key_given",
].forEach((id) => {
  if (
    nodes[id].visual !== "V02_PIG_MASKED" ||
    (nodes[id].visualWhen && nodes[id].visualWhen.length)
  ) {
    throw new Error(`pig remask: ${id} must use V02_PIG_MASKED without visualWhen`);
  }
});
[
  ["pig_key_cabinet", "V14_BLUE_KEY_CABINET"],
  ["pig_key_given", "V02_PIG_MASKED"],
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
  "fox_laura",
  "fox_smoke",
  "fox_camera",
  "fox_lights_up",
  "fox_heard",
  "fox_notice",
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
  "fox_oleg_photo",
  "fox_oleg_ask",
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

const sleepChoiceIds = (nodes.end_leave_sleep.choices || []).map((choice) => choice.id);
if (
  nodes.end_leave_sleep.line !==
    "Я тут полежу пока.\nС закрытыми глазами.\nПоохраняешь меня?" ||
  !nodes.end_leave_sleep.action?.includes("РАВНОЦЕННОЙ ЗАМЕНОЙ") ||
  sleepChoiceIds.join(",") !== "stay_with_dog,exit_cafe" ||
  !nodes.end_leave_guard.complete ||
  !nodes.end_leave_replacement.complete ||
  !nodes.end_leave_replacement.guestExit
) {
  throw new Error("dog finale: the wait-for-Lora branch must end in the stay/exit dilemma");
}

const menuEntries = (choices, flags) => {
  const visibleChoices = choices.filter((choice) => visible(choice, flags));
  const grouped = new Map();
  const ungrouped = [];
  visibleChoices.forEach((choice) => {
    if (!choice.group) {
      ungrouped.push({ kind: "action", text: choice.text, id: choice.id });
      return;
    }
    const items = grouped.get(choice.group) || [];
    items.push(choice);
    grouped.set(choice.group, items);
  });
  const entries = [];
  grouped.forEach((items, name) => {
    if (items.length === 1) {
      entries.push({ kind: "action", text: items[0].text, id: items[0].id });
      return;
    }
    entries.push({ kind: "group", text: name, count: items.length });
  });
  return entries.concat(ungrouped);
};

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
  const emptyMenu = menuEntries(choices, {});
  if (emptyMenu.length > 4) {
    throw new Error(`choice groups: ${id} shows more than four top-level buttons`);
  }
});

const foxEvidence = menuEntries(nodes.fox_smell.choices, { pigTagCopied: true });
if (foxEvidence.some((entry) => entry.text === "Показать улику")) {
  throw new Error("choice groups: a single-item folder must not look like an action");
}
if (!foxEvidence.some((entry) => entry.kind === "action" && entry.id === "fox_show_tag")) {
  throw new Error("choice groups: Показать бирку must be a direct action when it is the only evidence");
}

const dogWarn = menuEntries(nodes.final_conflict_dog.choices, { pigHidden: true });
if (dogWarn.some((entry) => entry.text === "Сначала проверить")) {
  throw new Error("choice groups: Сначала проверить must flatten to Выслушать Хрюшу");
}
if (!dogWarn.some((entry) => entry.id === "warn_sea")) {
  throw new Error("choice groups: Выслушать Хрюшу must remain reachable from the top-level menu");
}

if (!nodes.end_leave.action || nodes.pig_reveal.speaker !== "Я") {
  throw new Error("text roles: narration and mixed action are not separated");
}
const allowSmoke = (nodes.fox_smoke.choices || []).find((item) => item.id === "fox_let_smoke");
if (allowSmoke?.next !== "fox_lights_up" || nodes.fox_lights_up?.autoNext !== "fox_notice") {
  throw new Error("cigarette: allowing smoke must play fox_lights_up before fox_notice");
}

const povContract = [
  ["pig_suit", "pig_suit_silent", "pig_center"],
  ["fox_leave", "fox_take_number", "dog_arrive"],
  ["dog_arrive", "dog_approach", "dog_where"],
];
povContract.forEach(([id, choiceId, next]) => {
  if (nodes[id].autoNext) {
    throw new Error(`pov: ${id} must wait for a player gesture`);
  }
  const choice = (nodes[id].choices || []).find((item) => item.id === choiceId);
  if (choice?.next !== next) {
    throw new Error(`pov: ${id} is missing ${choiceId} → ${next}`);
  }
});
const foxTruth = (nodes.fox_monopoly.choices || []).map((choice) => choice.next);
if (
  nodes.fox_monopoly.autoNext ||
  foxTruth.length !== 2 ||
  foxTruth.some((next) => next !== "fox_leave")
) {
  throw new Error("pov: fox_monopoly must answer in place, then leave");
}
if (
  !nodes.fox_why.action ||
  !nodes.fox_monopoly.action ||
  nodes.fox_why.autoNext !== "fox_monopoly"
) {
  throw new Error("fox extras: rare action beats are missing or misplaced");
}
if (!(nodes.fox_leave.set || []).includes("foxLeftNumber")) {
  throw new Error("pov: taking the number must still leave foxLeftNumber");
}
const foxSpeech = Object.values(nodes)
  .filter((node) => node.speaker === "ЛИСА")
  .map((node) => [node.line, node.lineReplay].filter(Boolean).join("\n"))
  .join("\n");
const dogSpeech = Object.values(nodes)
  .filter((node) => node.speaker === "ПЁС")
  .map((node) => [node.line, node.lineReplay].filter(Boolean).join("\n"))
  .join("\n");
if (
  nodes.fox_oleg.props?.includes("photo") ||
  !nodes.fox_oleg_photo.props?.includes("photo") ||
  nodes.fox_oleg_photo.inspect !== "photo" ||
  nodes.fox_oleg.line !== "Аниматор самовольно покинул зоопарк «Лосиный Остров»." ||
  /олег|журналист|микрофон/i.test(foxSpeech) ||
  /олег/i.test(dogSpeech)
) {
  throw new Error("fox/dog investigation must remain implicit in dialogue");
}
if (
  nodes.pig_bargain.inspect !== "toy" ||
  !nodes.pig_bargain.props?.includes("toy") ||
  nodes.pig_talk.inspect === "toy" ||
  (nodes.pig_talk.props || []).includes("toy") ||
  Object.entries(nodes).some(
    ([id, node]) =>
      id !== "pig_bargain" &&
      ((node.props || []).includes("toy") || node.inspect === "toy")
  )
) {
  throw new Error("nevalyashka photo must auto-close after pig_bargain");
}
const noteAck = (nodes.note_read.choices || []).find((choice) => choice.id === "note_ack");
const giveKey = (nodes.pig_talk.choices || []).find((choice) => choice.id === "give_key");
if (
  nodes.note_read.sound !== "paperUnfold" ||
  noteAck?.sound !== "paperFold" ||
  giveKey?.sound !== "keyRing" ||
  nodes.pig_key_cabinet.sound !== "keyCabinet" ||
  nodes.receipt_print.sound !== "print"
) {
  throw new Error("generated Foley must stay on note, key, and receipt beats");
}

const revealRun = walk(
  {
    pig_secret: "ask_how",
    pig_camera_check: "disable_camera",
    pig_talk: "hide_pig",
    final_conflict_dog: "end_leave",
    end_leave_sleep: "stay_with_dog",
  },
  "pig-reveal-v03-v04"
);
if (!revealRun.flags.cameraDisabled || !revealRun.flags.pigRevealed) {
  throw new Error("pig reveal: reveal path did not retain its state flags");
}

const maskedRun = walk(
  {
    pig_secret: "ask_how",
    pig_camera_check: "leave_camera",
    pig_talk: "hide_pig",
    final_conflict_dog: "end_leave",
    end_leave_sleep: "stay_with_dog",
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
    fox_oleg_ask: "deny_oleg",
    dog_where: "pour_water",
    dog_settled: "ask_dreams",
    dog_exception: "dream_cafe",
    final_conflict_dog: "end_leave",
    end_leave_sleep: "stay_with_dog",
  },
  "hidden-lie-leave"
);

walk(
  {
    pig_talk: "call_tech",
    fox_smell: "fox_show_tag",
    fox_oleg_ask: "ask_why",
    dog_where: "give_coffee",
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
    fox_oleg_ask: "lie_curtain",
    dog_where: "ask_his_name",
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
    fox_oleg_ask: "ask_level",
    dog_where: "say_name",
    dog_settled: "ask_exit_early",
    final_conflict_dog: "end_none",
  },
  "waiting-unassigned"
);

const toyTrade = walk(
  {
    pig_secret: "ask_how",
    pig_camera_check: "disable_camera",
    pig_talk: "take_toy",
    fox_smoke: "fox_no_smoke",
    fox_smell: "fox_deny_guest",
    fox_oleg_ask: "deny_oleg",
    final_conflict_dog: "end_leave",
    end_leave_sleep: "exit_cafe",
  },
  "toy-smoke-leave"
);
if (!toyTrade.flags.pigToyTaken || !toyTrade.flags.foxToldNoSmoke) {
  throw new Error("toy/smoke: expected pigToyTaken and foxToldNoSmoke");
}

const keyTrade = walk(
  {
    pig_secret: "ask_how",
    pig_talk: "give_key",
    fox_smell: "fox_deny_guest",
    final_conflict_dog: "end_none",
  },
  "key-trade-unassigned"
);
if (keyTrade.state.pigOutcome !== "traded" || !keyTrade.flags.pigToyTaken) {
  throw new Error("key trade: expected traded pigOutcome and toy taken");
}
if (!keyTrade.seen.includes("pig_key_cabinet") || !keyTrade.seen.includes("pig_key_given")) {
  throw new Error("key trade: expected V14 cabinet one-shot before pig_key_given");
}
if (
  nodes.pig_key_cabinet.visual !== "V14_BLUE_KEY_CABINET" ||
  nodes.pig_key_cabinet.autoNext !== "pig_key_given" ||
  nodes.pig_key_cabinet.hideHtmlProps !== true ||
  (nodes.pig_key_cabinet.choices || []).length
) {
  throw new Error("key trade: pig_key_cabinet must be a choiceless V14 one-shot");
}

const engineSource = fs.readFileSync(
  path.join(__dirname, "..", "js", "lora-red-room.js"),
  "utf8"
);
if (
  !engineSource.includes("pig_key_cabinet") ||
  !engineSource.includes("v18-blue-key-cabinet.mp4")
) {
  throw new Error("key trade: V14 motion clip is not wired in lora-red-room.js");
}
if (
  !engineSource.includes("dog_coffee") ||
  !engineSource.includes("dog-suit-coffee-v2.mp4") ||
  !engineSource.includes("dog-suit-wander-v2.mp4") ||
  !engineSource.includes("dog-suit-sleep-v2.mp4") ||
  !engineSource.includes("dog-suit-sleep-start-v2.webp")
) {
  throw new Error("dog costume: v2 motion clips are not wired in lora-red-room.js");
}
if (engineSource.includes('video: "v08-dog-wander.mp4"')) {
  throw new Error("dog costume: dog_dreams still points at the old wander file");
}
if (engineSource.includes("v11-dog-sleep-idle.mp4")) {
  throw new Error("dog costume: V11 still points at the old sleep idle file");
}

const receiptCopy = sandbox.window.TyndexLoraRedRoomContent.buildReceiptCopy({
  receiptVariant: "guarded",
  pigOutcome: "hidden",
  foxOutcome: "lied",
  dogOutcome: "guarded",
  replay: false,
});
if (
  !receiptCopy.route ||
  typeof receiptCopy.reaction !== "string" ||
  typeof receiptCopy.loraLine !== "string" ||
  !receiptCopy.stamp ||
  !receiptCopy.copyVariant
) {
  throw new Error("receipt copy: builder must return route/reaction/loraLine/stamp/copyVariant");
}
if (sandbox.window.TyndexLoraRedRoomContent.quietSleepArtifactId !== "lora-quiet-sleep-page") {
  throw new Error("gift hook: quiet sleep artifact id is missing");
}
const giftPages = sandbox.window.TyndexLoraRedRoomContent.quietSleepGift?.pages || {};
["left", "given", "sea", "unassigned", "guarded", "replacement"].forEach((variant) => {
  const page = giftPages[variant];
  if (!page?.title || !Array.isArray(page.lines) || page.lines.length !== 4 || !page.stamp) {
    throw new Error(`gift hook: missing Book of Sweet Sleep page for ${variant}`);
  }
});
const hooks = sandbox.window.TyndexLoraRedRoomContent.receiptCopyHooks || {};
if (!hooks.loraVoice?.left || !hooks.reactions?.sea?.traded || !hooks.stamps?.given) {
  throw new Error("receipt copy: Codex receipt hooks are incomplete");
}

console.log("OK smoke-lora-red-room");
