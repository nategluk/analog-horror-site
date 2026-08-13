(() => {
  "use strict";

  const SAVE_KEY = "tyndex_lora_red_room_v1";
  const ASSIGN_KEY = "tyndex_lora_channel_v1";
  const ASSIGN_TTL_MS = 120000;
  const ARTIFACT_ID = "lora-night-receipt";
  const HIRING_HREF = "../hiring.html";
  const VISUAL_ASSETS = {
    V02_PIG_MASKED: {
      image: "../assets/guest/red-room/lora/scenes/concepts/grok/v02-pig-masked-pilot.png",
    },
    V03_PIG_REVEAL: {
      image: "../assets/guest/red-room/lora/scenes/v03-pig-reveal-poster.webp",
      video: "../assets/guest/red-room/lora/scenes/v03-pig-reveal.mp4",
      playback: "reveal",
    },
    V04_PIG_UNMASKED: {
      image: "../assets/guest/red-room/lora/scenes/concepts/grok/v04-pig-unmasked-pilot.png",
    },
    V05_FOX_GAZE: {
      image: "../assets/guest/red-room/lora/scenes/v05-fox-gaze.webp",
      video: "../assets/guest/red-room/lora/scenes/v05-fox-gaze-idle.mp4",
      playback: "ambient",
    },
    V06_FOX_ACTION: {
      image: "../assets/guest/red-room/lora/scenes/v06-fox-action.webp",
      video: "../assets/guest/red-room/lora/scenes/v06-fox-action-idle.mp4",
      playback: "ambient",
    },
    V11_DOG_SLEEP: {
      image: "../assets/guest/red-room/lora/scenes/v11-dog-sleep.webp",
      video: "../assets/guest/red-room/lora/scenes/v11-dog-sleep-idle.mp4",
      playback: "transition",
    },
  };

  let activeRoot = null;
  let save = null;
  let revealTimer = 0;
  let autoTimer = 0;
  let ambientTimer = 0;
  let audioCtx = null;
  let soundEnabled = false;
  let activeSceneVideo = null;

  const prefersReducedMotion = () =>
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const content = () => window.TyndexLoraRedRoomContent || null;

  const assetUrl = (path) => {
    try {
      return new URL(path, document.baseURI).href;
    } catch {
      return path;
    }
  };

  const resolveVisual = (node) => {
    const conditional = (node.visualWhen || []).find((entry) =>
      (entry.require || []).every(hasFlag)
    );
    return conditional?.visual || node.visual || null;
  };

  const visualAsset = (node) => VISUAL_ASSETS[resolveVisual(node)] || null;

  const hiringUrl = () => {
    try {
      return new URL(HIRING_HREF, document.baseURI).href;
    } catch {
      return "/hiring.html";
    }
  };

  const clearAssignment = () => {
    window.sessionStorage.removeItem(ASSIGN_KEY);
  };

  const readAssignment = () => {
    try {
      const raw = window.sessionStorage.getItem(ASSIGN_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      const issuedAt = Number(parsed?.at);
      if (!parsed?.assigned || !Number.isFinite(issuedAt)) {
        clearAssignment();
        return null;
      }
      if (Date.now() - issuedAt > ASSIGN_TTL_MS) {
        clearAssignment();
        return null;
      }
      return parsed;
    } catch {
      clearAssignment();
      return null;
    }
  };

  const isAssigned = () => Boolean(readAssignment());

  const touchAssignment = () => {
    if (!readAssignment()) return false;
    window.sessionStorage.setItem(
      ASSIGN_KEY,
      JSON.stringify({ assigned: true, at: Date.now() })
    );
    return true;
  };

  const readSave = () => {
    try {
      const parsed = JSON.parse(window.localStorage.getItem(SAVE_KEY));
      if (!parsed || parsed.version !== 1) return null;
      parsed.seenNodes = Array.isArray(parsed.seenNodes) ? parsed.seenNodes : [];
      parsed.playerFlags =
        parsed.playerFlags && typeof parsed.playerFlags === "object"
          ? parsed.playerFlags
          : {};
      return parsed;
    } catch {
      return null;
    }
  };

  const writeSave = (next) => {
    next.updatedAt = Date.now();
    window.localStorage.setItem(SAVE_KEY, JSON.stringify(next));
    touchAssignment();
    return next;
  };

  const createSave = (overrides = {}) => ({
    version: 1,
    currentNode: content()?.startNode || "assign_notice",
    completed: false,
    seenNodes: [],
    pigOutcome: null,
    foxOutcome: null,
    dogOutcome: null,
    playerFlags: {},
    receiptVariant: null,
    updatedAt: Date.now(),
    ...overrides,
  });

  const hasFlag = (flag) => Boolean(save?.playerFlags?.[flag]);

  const applyFlags = (flags = []) => {
    flags.forEach((flag) => {
      save.playerFlags[flag] = true;
    });
  };

  const choiceVisible = (choice) => {
    const required = choice.require || [];
    if (required.some((flag) => !hasFlag(flag))) return false;
    const any = choice.requireAny || [];
    if (any.length && !any.some((flag) => hasFlag(flag))) return false;
    const hidden = choice.hideIf || [];
    if (hidden.some((flag) => hasFlag(flag))) return false;
    return true;
  };

  const nodeById = (id) => content()?.nodes?.[id] || null;

  const resolveLine = (node) => {
    if (!node) return "";
    if (node.id === "aftermath_pig" || save.currentNode === "aftermath_pig") {
      if (save.pigOutcome === "hidden") return node.lineHidden || node.line;
      if (save.pigOutcome === "waiting") return node.lineWaiting || node.line;
      if (save.pigOutcome === "reported") return node.lineReported || node.line;
      return node.lineDefault || node.line;
    }
    if (hasFlag("replayShift") && node.lineReplay) return node.lineReplay;
    let line = node.line || "";
    if (node.complete || save.currentNode === "receipt_print") {
      const variants = content()?.receiptVariants || {};
      const variantText = variants[save.receiptVariant] || "—";
      line = line.replace("[вариант]", variantText);
    }
    return line;
  };

  const attachReceipt = () => {
    if (!save?.receiptVariant) return;
    const store = window.TyndexDossierStore;
    const definitionId = content()?.artifactId || ARTIFACT_ID;
    if (!store?.readDossier || !store.saveDossier) {
      save.receiptPending = true;
      writeSave(save);
      return;
    }
    const profile = store.readDossier();
    if (!profile || profile.version !== 1) {
      save.receiptPending = true;
      writeSave(save);
      return;
    }
    profile.artifacts = Array.isArray(profile.artifacts) ? profile.artifacts : [];
    profile.removedArtifactIds = Array.isArray(profile.removedArtifactIds)
      ? profile.removedArtifactIds
      : [];
    if (profile.removedArtifactIds.includes(definitionId)) {
      save.receiptPending = false;
      writeSave(save);
      return;
    }
    const known = profile.artifacts.find((item) => item.id === definitionId);
    if (known) {
      known.variant = save.receiptVariant;
      known.replay = Boolean(hasFlag("replayShift"));
      known.obtainedAt = known.obtainedAt || Date.now();
    } else {
      profile.artifacts.push({
        id: definitionId,
        sessionNumber: hasFlag("replayShift") ? 2 : 1,
        obtainedAt: Date.now(),
        variant: save.receiptVariant,
        replay: Boolean(hasFlag("replayShift")),
      });
    }
    profile.updatedAt = Date.now();
    store.saveDossier(profile);
    save.receiptPending = false;
    writeSave(save);
  };

  const ensureAudio = () => {
    if (audioCtx) return audioCtx;
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return null;
    audioCtx = new Ctx();
    return audioCtx;
  };

  const playTone = (freq, duration, type = "sine", gainValue = 0.05) => {
    const ctx = ensureAudio();
    if (!ctx) return;
    if (ctx.state === "suspended") ctx.resume().catch(() => {});
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.type = type;
    oscillator.frequency.value = freq;
    gain.gain.setValueAtTime(gainValue, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    oscillator.connect(gain);
    gain.connect(ctx.destination);
    oscillator.start();
    oscillator.stop(ctx.currentTime + duration);
  };

  const playSceneSound = (name) => {
    if (!name || !soundEnabled) return;
    switch (name) {
      case "cup":
        playTone(880, 0.08, "triangle", 0.04);
        window.setTimeout(() => playTone(620, 0.12, "sine", 0.03), 70);
        break;
      case "register":
        playTone(240, 0.05, "square", 0.03);
        window.setTimeout(() => playTone(180, 0.08, "square", 0.02), 60);
        break;
      case "door":
        playTone(140, 0.18, "sawtooth", 0.03);
        break;
      case "phone":
        playTone(520, 0.12, "square", 0.035);
        window.setTimeout(() => playTone(520, 0.12, "square", 0.03), 220);
        break;
      case "print":
        playTone(190, 0.28, "square", 0.025);
        break;
      case "sea":
        playTone(210, 0.4, "sine", 0.02);
        window.setTimeout(() => playTone(90, 0.2, "triangle", 0.04), prefersReducedMotion() ? 0 : 900);
        break;
      default:
        playTone(400, 0.08, "sine", 0.03);
    }
  };

  const updateSoundButton = (root) => {
    const button = root?.querySelector("[data-lora-sound]");
    if (!button) return;
    button.setAttribute("aria-pressed", String(soundEnabled));
    button.textContent = soundEnabled ? "ЗВУК: ВКЛ" : "ЗВУК: ВЫКЛ";
    button.title = soundEnabled
      ? "Отключить звуки смены"
      : "Включить звуки смены";
  };

  const setSoundEnabled = (root, enabled) => {
    soundEnabled = Boolean(enabled);
    updateSoundButton(root);
    if (!soundEnabled) {
      if (audioCtx && audioCtx.state !== "closed") {
        audioCtx.suspend?.().catch(() => {});
      }
      return;
    }
    const ctx = ensureAudio();
    ctx?.resume?.().catch(() => {});
  };

  const delayFor = (node) => {
    if (prefersReducedMotion()) return 0;
    return Number(node?.delay) || 0;
  };

  const visibleProps = (node) => {
    const props = new Set(node.props || []);
    if (save.pigOutcome === "reported" || hasFlag("pigTagLeft")) {
      if (!hasFlag("foxHidTag") || save.currentNode.startsWith("aftermath") || save.currentNode.startsWith("receipt") || save.currentNode.startsWith("end") || save.currentNode.startsWith("pig")) {
        if (hasFlag("pigTagLeft") && !hasFlag("foxHidTag")) props.add("tag");
      }
    }
    if (save.pigOutcome === "reported" && String(save.currentNode).startsWith("aftermath")) {
      props.add("tag");
    }
    if (hasFlag("foxLeftNumber")) props.add("phone");
    return props;
  };

  const stopSceneVideo = () => {
    if (!activeSceneVideo) return;
    activeSceneVideo.pause();
    activeSceneVideo.onended = null;
    activeSceneVideo.onerror = null;
    activeSceneVideo = null;
  };

  const renderScene = (root, node) => {
    const stage = root.querySelector("[data-lora-stage]");
    const image = root.querySelector("[data-lora-scene-image]");
    const video = root.querySelector("[data-lora-scene-video]");
    const asset = visualAsset(node);
    if (stage) {
      stage.dataset.scene = node.scene || "counter";
      stage.dataset.guest = node.guest || "none";
      stage.dataset.hasVisual = String(Boolean(asset));
      stage.dataset.cameraOff = String(hasFlag("cameraDisabled"));
      stage.dataset.videoState = asset?.video ? "poster" : "none";
    }
    if (image) {
      if (asset?.image) {
        image.src = assetUrl(asset.image);
        image.hidden = false;
      } else {
        image.removeAttribute("src");
        image.hidden = true;
      }
    }
    if (video) {
      video.hidden = true;
      video.loop = false;
      video.muted = true;
      if (asset?.video) {
        video.src = assetUrl(asset.video);
        video.poster = assetUrl(asset.image);
      } else {
        video.removeAttribute("src");
        video.removeAttribute("poster");
        video.load();
      }
    }
    root.querySelectorAll("[data-lora-prop]").forEach((el) => {
      const name = el.dataset.loraProp;
      el.hidden = !visibleProps(node).has(name);
    });
    root.querySelectorAll("[data-lora-guest]").forEach((el) => {
      el.hidden = (node.guest || "none") !== el.dataset.loraGuest;
    });
  };

  const playRevealSceneVideo = (root, node) => {
    const asset = visualAsset(node);
    if (
      asset?.playback !== "reveal" ||
      !asset.video ||
      hasFlag("pigRevealPlayed") ||
      prefersReducedMotion()
    ) {
      return false;
    }
    const stage = root.querySelector("[data-lora-stage]");
    const image = root.querySelector("[data-lora-scene-image]");
    const video = root.querySelector("[data-lora-scene-video]");
    if (!video) return false;

    activeSceneVideo = video;
    video.currentTime = 0;
    video.hidden = false;
    if (image) image.hidden = true;
    if (stage) stage.dataset.videoState = "playing";

    let settled = false;
    const settleOnPoster = () => {
      if (settled || activeSceneVideo !== video) return;
      settled = true;
      video.pause();
      video.onended = null;
      video.onerror = null;
      video.hidden = true;
      if (image) image.hidden = false;
      if (stage) stage.dataset.videoState = "poster";
      activeSceneVideo = null;
      applyFlags(["pigRevealPlayed"]);
      writeSave(save);
      renderChoices(root, node);
    };

    video.onended = settleOnPoster;
    video.onerror = settleOnPoster;
    const playback = video.play();
    playback?.catch(settleOnPoster);
    return true;
  };

  const playAmbientSceneVideo = (root, node) => {
    const asset = visualAsset(node);
    if (
      asset?.playback !== "ambient" ||
      !asset.video ||
      prefersReducedMotion() ||
      document.visibilityState !== "visible"
    ) {
      return;
    }
    const stage = root.querySelector("[data-lora-stage]");
    const image = root.querySelector("[data-lora-scene-image]");
    const video = root.querySelector("[data-lora-scene-video]");
    if (!video) return;

    activeSceneVideo = video;
    video.currentTime = 0;
    video.hidden = false;
    if (image) image.hidden = true;
    if (stage) stage.dataset.videoState = "playing";

    let settled = false;
    const settleOnPoster = () => {
      if (settled || activeSceneVideo !== video) return;
      settled = true;
      video.pause();
      video.onended = null;
      video.onerror = null;
      video.hidden = true;
      if (image) image.hidden = false;
      if (stage) stage.dataset.videoState = "poster";
      activeSceneVideo = null;
    };

    video.onended = settleOnPoster;
    video.onerror = settleOnPoster;
    const playback = video.play();
    playback?.catch(settleOnPoster);
  };

  const playTransitionSceneVideo = (root, node, onComplete) => {
    const asset = visualAsset(node);
    if (
      asset?.playback !== "transition" ||
      !asset.video ||
      hasFlag("dogSleepPlayed") ||
      prefersReducedMotion()
    ) {
      return false;
    }
    const stage = root.querySelector("[data-lora-stage]");
    const image = root.querySelector("[data-lora-scene-image]");
    const video = root.querySelector("[data-lora-scene-video]");
    if (!video) return false;

    activeSceneVideo = video;
    video.currentTime = 0;
    video.hidden = false;
    if (image) image.hidden = true;
    if (stage) stage.dataset.videoState = "playing";

    let settled = false;
    const finishTransition = () => {
      if (settled || activeSceneVideo !== video) return;
      settled = true;
      video.pause();
      video.onended = null;
      video.onerror = null;
      activeSceneVideo = null;
      applyFlags(["dogSleepPlayed"]);
      writeSave(save);
      onComplete();
    };

    video.onended = finishTransition;
    video.onerror = finishTransition;
    const playback = video.play();
    playback?.catch(finishTransition);
    return true;
  };

  const scheduleAmbientSceneVideo = (root, node) => {
    const asset = visualAsset(node);
    if (asset?.playback !== "ambient" || prefersReducedMotion()) return;
    const scheduledNode = save.currentNode;
    const delay = 6000 + Math.round(Math.random() * 8000);
    ambientTimer = window.setTimeout(() => {
      ambientTimer = 0;
      if (
        activeRoot !== root ||
        save.currentNode !== scheduledNode ||
        document.visibilityState !== "visible"
      ) {
        return;
      }
      playAmbientSceneVideo(root, node);
    }, delay);
  };

  const clearTimers = () => {
    window.clearTimeout(revealTimer);
    window.clearTimeout(autoTimer);
    window.clearTimeout(ambientTimer);
    revealTimer = 0;
    autoTimer = 0;
    ambientTimer = 0;
  };

  const setLine = (root, text, live) => {
    const line = root.querySelector("[data-lora-line]");
    const speaker = root.querySelector("[data-lora-speaker]");
    if (line) line.textContent = text;
    if (live) live.textContent = text;
  };

  const renderChoices = (root, node) => {
    const box = root.querySelector("[data-lora-choices]");
    if (!box) return;
    box.replaceChildren();
    const choices = (node.choices || []).filter(choiceVisible);
    choices.forEach((choice) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "lora-room__choice";
      button.textContent = choice.text;
      button.dataset.choiceId = choice.id;
      button.addEventListener("click", () => {
        handleChoice(root, choice);
      });
      box.append(button);
    });
    const first = box.querySelector("button");
    first?.focus();
  };

  const goTo = (root, nextId, extra = {}) => {
    const node = nodeById(nextId);
    if (!node) return;
    save.currentNode = nextId;
    if (!save.seenNodes.includes(nextId)) save.seenNodes.push(nextId);
    if (extra.pigOutcome) save.pigOutcome = extra.pigOutcome;
    if (extra.foxOutcome) save.foxOutcome = extra.foxOutcome;
    if (extra.dogOutcome) save.dogOutcome = extra.dogOutcome;
    if (extra.receiptVariant) save.receiptVariant = extra.receiptVariant;
    if (node.foxOutcome) save.foxOutcome = node.foxOutcome;
    if (node.complete) save.completed = true;
    if (Array.isArray(node.set)) applyFlags(node.set);
    writeSave(save);
    if (node.complete) attachReceipt();
    renderNode(root, nextId);
  };

  const handleChoice = (root, choice) => {
    if (choice.leave) {
      writeSave(save);
      window.location.assign(hiringUrl());
      return;
    }
    if (choice.restart) {
      const previous = save;
      save = createSave({
        playerFlags: {
          replayShift: true,
          foxRememberedLie: Boolean(
            previous?.playerFlags?.foxLied || previous?.foxOutcome === "lied"
          ),
        },
        lastReceiptVariant: previous?.receiptVariant || null,
      });
      writeSave(save);
      renderNode(root, save.currentNode);
      return;
    }
    applyFlags(choice.set || []);
    goTo(root, choice.next, choice);
  };

  const renderDenied = (root) => {
    root.dataset.state = "denied";
    const speaker = root.querySelector("[data-lora-speaker]");
    const line = root.querySelector("[data-lora-line]");
    const live = root.querySelector("[data-lora-live]");
    const choices = root.querySelector("[data-lora-choices]");
    if (speaker) speaker.textContent = "СИСТЕМА";
    if (line) line.textContent = "КАНАЛ НЕ НАЗНАЧЕН";
    if (live) live.textContent = "КАНАЛ НЕ НАЗНАЧЕН";
    if (choices) {
      choices.replaceChildren();
      const link = document.createElement("a");
      link.className = "lora-room__choice lora-room__choice--link";
      link.href = hiringUrl();
      link.textContent = "Вернуться в технический раздел";
      choices.append(link);
      link.focus();
    }
  };

  const renderNode = (root, nodeId) => {
    const node = nodeById(nodeId);
    if (!node) return;
    stopSceneVideo();
    clearTimers();
    root.dataset.state = "play";
    root.dataset.node = nodeId;
    renderScene(root, { ...node, id: nodeId });
    const speaker = root.querySelector("[data-lora-speaker]");
    const lineEl = root.querySelector("[data-lora-line]");
    const live = root.querySelector("[data-lora-live]");
    const choices = root.querySelector("[data-lora-choices]");
    if (speaker) speaker.textContent = node.speaker || "СМЕНА";
    if (choices) choices.replaceChildren();
    const fullText = resolveLine({ ...node, id: nodeId });
    const instant = prefersReducedMotion();
    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      if (lineEl) {
        lineEl.onclick = null;
        lineEl.onkeydown = null;
      }
      finishNode(root, node);
    };
    if (instant || fullText.length < 4) {
      setLine(root, fullText, live);
      finish();
      return;
    }
    let index = 0;
    setLine(root, "", live);
    const tick = () => {
      index += 1;
      const slice = fullText.slice(0, index);
      if (lineEl) lineEl.textContent = slice;
      if (index >= fullText.length) {
        if (live) live.textContent = fullText;
        finish();
        return;
      }
      revealTimer = window.setTimeout(tick, 16);
    };
    const skip = () => {
      clearTimers();
      setLine(root, fullText, live);
      finish();
    };
    if (lineEl) {
      lineEl.tabIndex = 0;
      lineEl.onkeydown = (event) => {
        if (["Enter", " "].includes(event.key)) {
          event.preventDefault();
          skip();
        }
      };
      lineEl.onclick = skip;
    }
    tick();
  };

  const finishNode = (root, node) => {
    if (node.sound) playSceneSound(node.sound);
    if (node.complete) {
      save.completed = true;
      writeSave(save);
      attachReceipt();
    }
    const asset = visualAsset(node);
    if (node.autoNext) {
      if (asset?.playback === "transition") {
        if (prefersReducedMotion() && !hasFlag("dogSleepPlayed")) {
          applyFlags(["dogSleepPlayed"]);
          writeSave(save);
        } else if (
          playTransitionSceneVideo(root, node, () => goTo(root, node.autoNext))
        ) {
          return;
        }
      }
      autoTimer = window.setTimeout(() => {
        goTo(root, node.autoNext);
      }, delayFor(node) + (prefersReducedMotion() ? 0 : 280));
      return;
    }
    if (asset?.playback === "reveal") {
      if (prefersReducedMotion() && !hasFlag("pigRevealPlayed")) {
        applyFlags(["pigRevealPlayed"]);
        writeSave(save);
      } else if (playRevealSceneVideo(root, node)) {
        return;
      }
    }
    renderChoices(root, node);
    scheduleAmbientSceneVideo(root, node);
  };

  const dockMusic = (root) => {
    const slot = root.querySelector("[data-lora-music-slot]");
    const player = document.querySelector(".music-player");
    if (!slot || !player || player.parentNode === slot) return;
    slot.dataset.home = "docked";
    slot.append(player);
  };

  const bindChrome = (root) => {
    document.body.classList.add("lora-room-open");
    dockMusic(root);
    const leave = root.querySelector("[data-lora-leave]");
    if (leave && leave.dataset.ready !== "true") {
      leave.dataset.ready = "true";
      leave.addEventListener("click", () => {
        if (save) writeSave(save);
        window.location.assign(hiringUrl());
      });
    }
    const note = root.querySelector('[data-lora-prop="note"]');
    if (note && note.dataset.ready !== "true") {
      note.dataset.ready = "true";
      note.addEventListener("click", () => {
        if (save?.currentNode === "shift_counter") {
          goTo(root, "note_read");
        }
      });
    }
    const soundButton = root.querySelector("[data-lora-sound]");
    if (soundButton && soundButton.dataset.ready !== "true") {
      soundButton.dataset.ready = "true";
      soundButton.addEventListener("click", () => {
        setSoundEnabled(root, !soundEnabled);
      });
    }
    updateSoundButton(root);
  };

  const init = (root) => {
    if (!root) return;
    if (activeRoot && activeRoot !== root) destroy();
    activeRoot = root;
    bindChrome(root);
    if (!content()?.nodes) {
      renderDenied(root);
      return;
    }
    if (!isAssigned()) {
      renderDenied(root);
      return;
    }
    touchAssignment();
    save = readSave() || createSave();
    if (!nodeById(save.currentNode)) {
      save.currentNode = content().startNode;
    }
    writeSave(save);
    renderNode(root, save.currentNode);
  };

  const destroy = () => {
    stopSceneVideo();
    clearTimers();
    const player = document.querySelector(".music-player");
    const logoArea = document.querySelector(".logo-area");
    if (player && logoArea && player.parentNode !== logoArea) {
      logoArea.append(player);
    }
    document.body.classList.remove("lora-room-open");
    activeRoot = null;
  };

  window.TyndexLoraRedRoom = {
    init,
    destroy,
    keys: { save: SAVE_KEY, assign: ASSIGN_KEY, assignTtlMs: ASSIGN_TTL_MS },
  };

  const boot = () => {
    const root = document.querySelector("[data-lora-room]");
    if (root) init(root);
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  } else {
    boot();
  }
})();
