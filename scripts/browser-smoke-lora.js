#!/usr/bin/env node
let puppeteer;
try {
  puppeteer = require("puppeteer-core");
} catch {
  console.log("SKIP browser-smoke-lora: puppeteer-core is not installed");
  process.exit(0);
}

const BASE = process.env.LORA_SMOKE_BASE || "http://127.0.0.1:8765";
const CHROME =
  process.env.CHROME_PATH ||
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const staffInit = () => {
  localStorage.setItem("tyndex_mode", "staff");
};

async function collectErrors(page) {
  const errors = [];
  page.on("pageerror", (error) => errors.push(String(error)));
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text());
  });
  return errors;
}

async function main() {
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: "new",
    args: ["--disable-gpu", "--no-sandbox"],
  });
  const report = [];

  const desktop = await browser.newPage();
  const deskErrors = await collectErrors(desktop);
  await desktop.setViewport({ width: 1280, height: 800 });
  await desktop.goto(`${BASE}/hiring.html`, { waitUntil: "domcontentloaded" });
  await desktop.evaluate(staffInit);
  await desktop.reload({ waitUntil: "domcontentloaded" });

  await desktop.type("[data-curator-id]", "0000-Z");
  await desktop.click('[data-hiring-form="staff"] button[type="submit"]');
  const unknown = await desktop.$eval(
    '[data-hiring-result="staff"]',
    (el) => el.textContent
  );
  report.push(`unknown-id: ${unknown}`);

  await desktop.click("[data-curator-id]", { clickCount: 3 });
  await desktop.keyboard.press("Backspace");
  await desktop.type("[data-curator-id]", "0091-A");
  await desktop.click('[data-hiring-form="staff"] button[type="submit"]');
  await sleep(400);
  const irinaOpen = await desktop.$eval("[data-curator-call]", (el) => !el.hidden);
  report.push(`irina-0091-A-open: ${irinaOpen}`);
  await desktop.evaluate(() => {
    document.querySelector("[data-curator-call]")?.setAttribute("hidden", "");
    document.body.classList.remove("curator-call-open");
  });

  await desktop.goto(`${BASE}/staff.html`, { waitUntil: "domcontentloaded" });
  await desktop.evaluate(staffInit);
  await desktop.reload({ waitUntil: "domcontentloaded" });
  await desktop.click('[data-personnel-open="lora"]');
  await sleep(200);
  await desktop.click("[data-personnel-request-id]");
  const loraId = await desktop.$eval(
    "[data-personnel-id-response]",
    (el) => el.textContent
  );
  report.push(`staff-lora-id: ${loraId}`);

  await desktop.goto(`${BASE}/locations/red-room-shift.html`, {
    waitUntil: "domcontentloaded",
  });
  const denied = await desktop.$eval("[data-lora-line]", (el) => el.textContent.trim());
  report.push(`direct-denied: ${denied}`);

  await desktop.goto(`${BASE}/hiring.html`, { waitUntil: "domcontentloaded" });
  await desktop.evaluate(staffInit);
  await desktop.reload({ waitUntil: "domcontentloaded" });
  await desktop.type("[data-curator-id]", "0391-L");
  await desktop.click('[data-hiring-form="staff"] button[type="submit"]');
  const assigned = await desktop.$eval(
    '[data-hiring-result="staff"]',
    (el) => el.textContent.replace(/\s+/g, " ").trim()
  );
  report.push(`lora-assigned-copy: ${assigned}`);
  await desktop.waitForSelector("[data-lora-room]", { timeout: 8000 });
  report.push(`lora-url: ${desktop.url()}`);
  const assignedState = await desktop.$eval(
    "[data-lora-room]",
    (el) => el.dataset.state
  );
  const firstLine = await desktop.$eval("[data-lora-line]", (el) =>
    el.textContent.replace(/\s+/g, " ").trim()
  );
  report.push(`lora-after-launch: state=${assignedState} line=${firstLine}`);

  await desktop.evaluate(() => {
    localStorage.setItem(
      "tyndex_lora_red_room_v1",
      JSON.stringify({
        version: 1,
        currentNode: "pig_camera_check",
        completed: false,
        seenNodes: ["pig_escapes", "pig_camera_check"],
        pigOutcome: null,
        foxOutcome: null,
        dogOutcome: null,
        playerFlags: { pigHeardEscapes: true },
        receiptVariant: null,
        updatedAt: Date.now(),
      })
    );
  });
  await desktop.reload({ waitUntil: "domcontentloaded" });
  await desktop.click("[data-lora-line]");
  await desktop.waitForSelector('[data-choice-id="disable_camera"]');
  await desktop.click('[data-choice-id="disable_camera"]');
  const revealOpening = await desktop.evaluate(() => ({
    node: document.querySelector("[data-lora-room]")?.dataset.node,
    image: document.querySelector("[data-lora-scene-image]")?.getAttribute("src"),
    videoState: document.querySelector("[data-lora-stage]")?.dataset.videoState,
  }));
  await desktop.click("[data-lora-line]");
  await desktop.waitForSelector("[data-lora-scene-video]:not([hidden])", {
    timeout: 4000,
  });
  const revealPlaying = await desktop.$eval(
    "[data-lora-scene-video]",
    (video) => ({ loop: video.loop, muted: video.muted, state: video.parentElement.dataset.videoState })
  );
  await desktop.waitForFunction(
    () => {
      const choice = document.querySelector('[data-choice-id="hold_reveal"]');
      return (
        document.querySelector("[data-lora-stage]")?.dataset.videoState === "poster" &&
        Boolean(choice) &&
        !choice.hidden
      );
    },
    { timeout: 10000 }
  );
  const revealPoster = await desktop.evaluate(() => ({
    videoHidden: document.querySelector("[data-lora-scene-video]")?.hidden,
    image: document.querySelector("[data-lora-scene-image]")?.getAttribute("src"),
    played: JSON.parse(localStorage.getItem("tyndex_lora_red_room_v1") || "null")
      ?.playerFlags?.pigRevealPlayed,
  }));
  await desktop.click('[data-choice-id="hold_reveal"]');
  const revealContinuation = await desktop.evaluate(() => ({
    node: document.querySelector("[data-lora-room]")?.dataset.node,
    image: document.querySelector("[data-lora-scene-image]")?.getAttribute("src"),
  }));
  report.push(
    `v03-reveal: opening=${revealOpening.image} playing=${revealPlaying.state} loop=${revealPlaying.loop} muted=${revealPlaying.muted} poster=${revealPoster.videoHidden} saved=${revealPoster.played} next=${revealContinuation.node}`
  );

  const mobile = await browser.newPage();
  const mobErrors = await collectErrors(mobile);
  await mobile.setViewport({ width: 390, height: 844, isMobile: true });
  await mobile.goto(`${BASE}/locations/red-room-shift.html`, {
    waitUntil: "domcontentloaded",
  });
  await mobile.evaluate(() => {
    sessionStorage.setItem(
      "tyndex_lora_channel_v1",
      JSON.stringify({ assigned: true, at: Date.now() })
    );
    localStorage.removeItem("tyndex_lora_red_room_v1");
  });
  await mobile.reload({ waitUntil: "domcontentloaded" });
  await mobile.waitForSelector("[data-lora-room]");
  await sleep(400);
  const overflow = await mobile.evaluate(() => ({
    scroll: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
    buttonMin: [...document.querySelectorAll(".lora-room__choice, .lora-room__leave")].every(
      (el) => el.getBoundingClientRect().height >= 44
    ),
  }));
  await mobile.keyboard.press("Enter");
  await sleep(200);
  const afterSkip = await mobile.$eval("[data-lora-choices]", (el) => el.children.length);
  report.push(`mobile-390: overflow=${overflow.scroll} buttons44=${overflow.buttonMin} choicesAfterSkip=${afterSkip}`);

  await mobile.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "reduce" }]);
  await mobile.reload({ waitUntil: "domcontentloaded" });
  await sleep(250);
  const reducedChoices = await mobile.$eval(
    "[data-lora-choices]",
    (el) => el.children.length
  );
  report.push(`reduced-motion-choices: ${reducedChoices}`);

  await mobile.evaluate(() => {
    localStorage.setItem(
      "tyndex_lora_red_room_v1",
      JSON.stringify({
        version: 1,
        currentNode: "pig_reveal",
        completed: false,
        seenNodes: ["pig_camera_check", "pig_reveal"],
        pigOutcome: null,
        foxOutcome: null,
        dogOutcome: null,
        playerFlags: { cameraDisabled: true, pigRevealed: true },
        receiptVariant: null,
        updatedAt: Date.now(),
      })
    );
  });
  await mobile.reload({ waitUntil: "domcontentloaded" });
  const reducedReveal = await mobile.evaluate(() => ({
    videoHidden: document.querySelector("[data-lora-scene-video]")?.hidden,
    videoState: document.querySelector("[data-lora-stage]")?.dataset.videoState,
    choices: document.querySelector("[data-lora-choices]")?.children.length,
    played: JSON.parse(localStorage.getItem("tyndex_lora_red_room_v1") || "null")
      ?.playerFlags?.pigRevealPlayed,
  }));
  report.push(
    `reduced-v03: videoHidden=${reducedReveal.videoHidden} state=${reducedReveal.videoState} choices=${reducedReveal.choices} saved=${reducedReveal.played}`
  );

  await mobile.goto(`${BASE}/hiring.html`, { waitUntil: "domcontentloaded" });
  await mobile.evaluate(staffInit);
  await mobile.reload({ waitUntil: "domcontentloaded" });
  await mobile.click("[data-curator-id]", { clickCount: 3 });
  await mobile.keyboard.press("Backspace");
  await mobile.type("[data-curator-id]", "0144-C");
  await mobile.click('[data-hiring-form="staff"] button[type="submit"]');
  const closedId = await mobile.$eval(
    '[data-hiring-result="staff"]',
    (el) => el.textContent
  );
  report.push(`closed-id-0144-C: ${closedId}`);

  await mobile.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "reduce" }]);
  await mobile.goto(`${BASE}/locations/red-room-shift.html`, {
    waitUntil: "domcontentloaded",
  });
  await mobile.evaluate(() => {
    sessionStorage.setItem(
      "tyndex_lora_channel_v1",
      JSON.stringify({ assigned: true, at: Date.now() })
    );
    localStorage.removeItem("tyndex_lora_red_room_v1");
    localStorage.setItem(
      "tyndex_staff_profile_v1",
      JSON.stringify({
        version: 1,
        status: "completed",
        curatorId: "0091-A",
        role: "animator",
        displayName: "Smoke",
        nameHistory: [],
        avatarId: null,
        artifacts: [],
        sessions: [],
        messages: [],
        deletedItems: [],
        removedArtifactIds: [],
        removedMessageIds: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      })
    );
  });
  await mobile.reload({ waitUntil: "domcontentloaded" });
  const clickChoice = async (text) => {
    await mobile.waitForFunction(
      () => document.querySelector(".lora-room__choice"),
      { timeout: 8000 },
    );
    await mobile.evaluate((label) => {
      const visible = [...document.querySelectorAll(".lora-room__choice")].some(
        (button) => button.textContent.trim() === label
      );
      if (visible) return;
      const nodeId = document.querySelector("[data-lora-room]")?.dataset.node;
      const node = window.TyndexLoraRedRoomContent?.nodes?.[nodeId];
      const group = (node?.choices || []).find((choice) => choice.text === label)?.group;
      if (!group) return;
      [...document.querySelectorAll(".lora-room__choice")]
        .find((button) => button.textContent.trim() === group)
        ?.click();
    }, text);
    await mobile.waitForFunction(
      (label) =>
        [...document.querySelectorAll(".lora-room__choice")].some(
          (button) => button.textContent.trim() === label
        ),
      { timeout: 8000 },
      text
    );
    await mobile.evaluate((label) => {
      const button = [...document.querySelectorAll(".lora-room__choice")].find(
        (el) => el.textContent.trim() === label
      );
      button?.click();
    }, text);
    await sleep(80);
  };
  await clickChoice("Ждать гостя");
  await clickChoice("У Лоры выходной.");
  await clickChoice("Что вам нужно?");
  await clickChoice("Ключей нет.");
  await clickChoice("Есть другие варианты.");
  await clickChoice("Спрятать его");
  await clickChoice("Чем могу помочь?");
  await mobile.waitForFunction(
    () =>
      document.querySelector("[data-lora-room]")?.dataset.node === "fox_smell" &&
      document.querySelector(".lora-room__choice"),
    { timeout: 8000 }
  );
  const foxMenu = await mobile.evaluate(() =>
    [...document.querySelectorAll(".lora-room__choice")].map((button) => ({
      text: button.textContent.trim(),
      group: button.classList.contains("lora-room__choice--group"),
      id: button.dataset.choiceId || "",
    }))
  );
  if (foxMenu.some((item) => item.text === "Показать улику")) {
    throw new Error(`fox_smell still shows a single-item folder: ${JSON.stringify(foxMenu)}`);
  }
  if (!foxMenu.some((item) => item.id === "fox_show_tag" || item.text === "Показать бирку")) {
    throw new Error(`fox_smell did not promote Показать бирку: ${JSON.stringify(foxMenu)}`);
  }
  await clickChoice("Никого не было.");
  await clickChoice("Не знаю такого.");
  await clickChoice("Налить воды");
  await clickChoice("Тебе снятся сны?");
  await clickChoice("Мне иногда снится это кафе.");
  await clickChoice("Выслушать Хрюшу");
  await clickChoice("Предложить дождаться Лору");
  await clickChoice("Остаться с ним");
  await mobile.waitForFunction(
    () => document.querySelector("[data-lora-room]")?.dataset.node === "end_leave_guard",
    { timeout: 8000 }
  );
  const doneLine = await mobile.$eval("[data-lora-line]", (el) => el.textContent);
  const save = await mobile.evaluate(() =>
    JSON.parse(localStorage.getItem("tyndex_lora_red_room_v1") || "null")
  );
  const dossier = await mobile.evaluate(() =>
    JSON.parse(localStorage.getItem("tyndex_staff_profile_v1") || "null")
  );
  report.push(
    `playthrough: node=${save?.currentNode} completed=${save?.completed} pig=${save?.pigOutcome} dog=${save?.dogOutcome} receipt=${save?.receiptVariant}`
  );
  const finalChoiceCount = await mobile.$eval(
    "[data-lora-choices]",
    (el) => el.children.length
  );
  const soundPressed = await mobile.$eval(
    "[data-lora-sound]",
    (el) => el.getAttribute("aria-pressed")
  );
  report.push(
    `artifact: ${JSON.stringify(dossier?.artifacts || [])} finalChoices=${finalChoiceCount} soundArmed=${soundPressed}`
  );

  await mobile.evaluate(() => {
    sessionStorage.setItem(
      "tyndex_lora_channel_v1",
      JSON.stringify({ assigned: true, at: Date.now() })
    );
    localStorage.setItem("tyndex_mode", "staff");
    localStorage.setItem(
      "tyndex_lora_red_room_v1",
      JSON.stringify({
        version: 1,
        currentNode: "end_leave_sleep",
        completed: false,
        seenNodes: ["end_leave", "end_leave_sleep"],
        pigOutcome: "hidden",
        foxOutcome: "lied",
        dogOutcome: "left",
        playerFlags: { pigHidden: true, dogSleepPlayed: true },
        receiptVariant: "left",
        updatedAt: Date.now(),
      })
    );
  });
  await mobile.goto(`${BASE}/locations/red-room-shift.html`, {
    waitUntil: "domcontentloaded",
  });
  await clickChoice("Выйти из кафе");
  await mobile.waitForFunction(
    () => window.location.pathname.endsWith("/locations/red-room-cafe.html"),
    { timeout: 10000 }
  );
  const guestExit = await mobile.evaluate(() => ({
    path: window.location.pathname,
    mode: localStorage.getItem("tyndex_mode"),
    assignment: sessionStorage.getItem("tyndex_lora_channel_v1"),
    save: JSON.parse(localStorage.getItem("tyndex_lora_red_room_v1") || "null"),
  }));
  report.push(
    `guest-exit: path=${guestExit.path} mode=${guestExit.mode} assignment=${guestExit.assignment} node=${guestExit.save?.currentNode} dog=${guestExit.save?.dogOutcome}`
  );

  await mobile.evaluate(() => {
    sessionStorage.setItem(
      "tyndex_lora_channel_v1",
      JSON.stringify({ assigned: true, at: Date.now() - 10 * 60 * 1000 })
    );
  });
  await mobile.reload({ waitUntil: "domcontentloaded" });
  const expired = await mobile.$eval("[data-lora-line]", (el) => el.textContent.trim());
  report.push(`expired-assign: ${expired}`);

  report.push(`desktop-console: ${deskErrors.length ? deskErrors.join(" | ") : "clean"}`);
  report.push(`mobile-console: ${mobErrors.length ? mobErrors.join(" | ") : "clean"}`);

  await browser.close();
  console.log(report.join("\n"));
  const failed =
    !irinaOpen ||
    denied !== "КАНАЛ НЕ НАЗНАЧЕН" ||
    !loraId.includes("0391-L") ||
    save?.completed !== true ||
    !dossier?.artifacts?.some((item) => item.id === "lora-night-receipt") ||
    finalChoiceCount !== 0 ||
    soundPressed !== "true" ||
    expired !== "КАНАЛ НЕ НАЗНАЧЕН" ||
    !doneLine.includes("СМЕНА НЕ ЗАКРЫТА") ||
    guestExit.mode !== "guest" ||
    guestExit.assignment !== null ||
    guestExit.save?.completed !== true ||
    guestExit.save?.dogOutcome !== "replacement" ||
    !guestExit.path.endsWith("/locations/red-room-cafe.html");
  const revealFailed =
    revealPlaying.loop ||
    !revealPlaying.muted ||
    revealPlaying.state !== "playing" ||
    revealOpening.node !== "pig_reveal" ||
    !String(revealOpening.image || "").includes("v02-pig-masked.webp") ||
    String(revealOpening.image || "").includes("v03-pig-reveal-poster.webp") ||
    revealOpening.videoState !== "poster" ||
    !revealPoster.videoHidden ||
    !revealPoster.image?.includes("v03-pig-reveal-poster.webp") ||
    !revealPoster.played ||
    revealContinuation.node !== "pig_suit" ||
    !revealContinuation.image?.includes("v04-pig-unmasked.webp") ||
    !reducedReveal.videoHidden ||
    reducedReveal.videoState !== "poster" ||
    reducedReveal.choices !== 1 ||
    !reducedReveal.played;
  if (failed || revealFailed) {
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
