(() => {
  "use strict";

  const SAVE_KEY = "tyndex_lora_red_room_v1";
  const ASSIGN_KEY = "tyndex_lora_channel_v1";
  const ASSIGN_TTL_MS = 120000;
  const SHIFT_EXIT_SEEN = "shiftExitSeen";
  const ARTIFACT_ID = "lora-night-receipt";
  const TOY_ARTIFACT_ID = "lora-nevalyashka";
  const QUIET_SLEEP_ARTIFACT_ID = "lora-quiet-sleep-page";
  const MODE_KEY = "tyndex_mode";
  const STAFF_SESSION_KEY = "tyndex_staff_session";
  const HIRING_HREF = "../hiring.html";
  const GUEST_HREF = "../locations/red-room-cafe.html";
  const DOG_WAIT_VIDEO = "../assets/guest/red-room/lora/scenes/dog-suit-sleep-idle-v1.mp4";
  const LORA_REWARD_VIDEO = "../assets/guest/red-room/lora/scenes/lora-wait-reward-v1.mp4";
  const DOG_WAIT_MS = 15000;
  const VISUAL_ASSETS = {
    V01_EMPTY_COUNTER: {
      image: "../assets/guest/red-room/lora/scenes/v01-empty-counter-v1.webp",
      video: "../assets/guest/red-room/lora/scenes/v01-empty-idle.mp4",
      playback: "loop",
    },
    V02_PIG_MASKED: {
      image: "../assets/guest/red-room/lora/scenes/v02-pig-masked.webp",
      video: "../assets/guest/red-room/lora/scenes/v02-pig-masked-idle.mp4",
      playback: "loop",
    },
    V03_PIG_REVEAL: {
      image: "../assets/guest/red-room/lora/scenes/v03-pig-reveal-poster.webp",
      openWith: "../assets/guest/red-room/lora/scenes/v02-pig-masked.webp",
      video: "../assets/guest/red-room/lora/scenes/v03-pig-reveal.mp4",
      playback: "reveal",
    },
    V04_PIG_UNMASKED: {
      image: "../assets/guest/red-room/lora/scenes/v04-pig-unmasked.webp",
    },
    V05_FOX_GAZE: {
      image: "../assets/guest/red-room/lora/scenes/v05-fox-gaze.webp",
      video: "../assets/guest/red-room/lora/scenes/v05-fox-gaze-idle.mp4",
      playback: "loop",
    },
    V06_FOX_ACTION: {
      image: "../assets/guest/red-room/lora/scenes/v06-fox-action.webp",
      video: "../assets/guest/red-room/lora/scenes/v06-fox-action-idle.mp4",
      playback: "loop",
    },
    V07_DOG_BLANK: {
      image: "../assets/guest/red-room/lora/scenes/v07-dog-blank.webp",
    },
    V08_DOG_SETTLED: {
      image: "../assets/guest/red-room/lora/scenes/v08-dog-settled.webp",
    },
    V09_DOG_CURTAIN: {
      image: "../assets/guest/red-room/lora/scenes/v09-dog-curtain.webp",
    },
    V10_FOX_DOG: {
      image: "../assets/guest/red-room/lora/scenes/v10-fox-dog.webp",
    },
    V11_DOG_SLEEP: {
      image: "../assets/guest/red-room/lora/scenes/v11-dog-sleep.webp",
      openWith: "../assets/guest/red-room/lora/scenes/dog-suit-sleep-start-v2.webp",
      video: "../assets/guest/red-room/lora/scenes/dog-suit-sleep-v2.mp4",
      playback: "transition",
    },
    V12_EMPTY_CURTAIN: {
      image: "../assets/guest/red-room/lora/scenes/v12-empty-curtain.webp",
    },
    V13_RECEIPT: {
      image: "../assets/guest/red-room/lora/scenes/v01-empty-counter-v1.webp",
    },
    V14_BLUE_KEY_CABINET: {
      image: "../assets/guest/red-room/lora/scenes/v18-blue-key-cabinet.png",
    },
    V15_PIG_TAG: {
      image: "../assets/guest/red-room/lora/scenes/v19-pig-tag.png",
    },
    V16_BACK_ROOM: {
      image: "../assets/guest/red-room/lora/scenes/v20-back-room.png",
    },
    V17_FOX_ALBUM: {
      image: "../assets/guest/red-room/lora/scenes/v23-fox-album-start.png",
    },
  };

  const MOTION_DIR = "../assets/guest/red-room/lora/scenes/";
  const PIG_LEAVE_FRAMES = ["v02-pig-arrive-mid.webp", "v02-pig-arrive-far.webp"];
  const FOX_CIGARETTE = {
    mode: "burst",
    video: "v16-fox-cigarette.mp4",
    frames: ["v05-fox-gaze.webp"],
    requireVisual: "V05_FOX_GAZE",
    delayMs: 900,
    holdMs: 1800,
  };
  const NODE_MOTIONS = {
    pig_arrive: {
      mode: "transition",
      video: "v02-pig-arrive.mp4",
      openWith: "v01-empty-counter-v1.webp",
      frames: ["v01-empty-counter-v1.webp"],
      holdMs: 900,
      restore: false,
    },
    pig_bargain: {
      mode: "transition",
      video: "v17-pig-toy-offer.mp4",
      requireVisual: "V02_PIG_MASKED",
      frames: ["v02-pig-masked.webp"],
      holdMs: 800,
    },
    pig_key_cabinet: {
      mode: "transition",
      video: "v18-blue-key-cabinet.mp4",
      openWith: "v18-blue-key-cabinet.png",
      frames: ["v18-blue-key-cabinet.png"],
      holdMs: 900,
      restore: false,
    },
    shift_storage_live: {
      mode: "transition",
      video: "v20-back-room-live.mp4",
      openWith: "v20-back-room.png",
      frames: ["v20-back-room.png"],
      holdMs: 900,
      restore: false,
    },
    end_sea_go: {
      mode: "transition",
      video: "v21-dog-sea-slide.mp4",
      openWith: "v20-back-room.png",
      frames: ["v20-back-room.png"],
      holdMs: 900,
      restore: false,
    },
    end_none_stay: {
      mode: "transition",
      video: "v22-dog-curtain-wait.mp4",
      openWith: "v09-dog-curtain.webp",
      frames: ["v09-dog-curtain.webp", "v12-empty-curtain.webp"],
      holdMs: 900,
      restore: false,
    },
    end_give_album: {
      mode: "transition",
      video: "v23-fox-album-dog.mp4",
      openWith: "v23-fox-album-start.png",
      frames: ["v23-fox-album-start.png"],
      holdMs: 900,
      restore: false,
    },
    pig_escapes: {
      mode: "transition",
      video: "v02-pig-wander.mp4",
      frames: ["v02-pig-wander.webp"],
      holdMs: 1100,
    },
    pig_talk: {
      mode: "burst",
      video: "v02-pig-wander.mp4",
      requireVisual: "V02_PIG_MASKED",
      delayMs: 1600,
      frames: ["v02-pig-wander.webp"],
      holdMs: 1800,
    },
    pig_hide_tag: {
      mode: "transition",
      video: "v02-pig-leave.mp4",
      requireVisual: "V02_PIG_MASKED",
      frames: PIG_LEAVE_FRAMES,
      holdMs: 800,
      restore: false,
    },
    pig_tech_run: {
      mode: "transition",
      video: "v02-pig-leave.mp4",
      openWith: "v02-pig-masked.webp",
      frames: PIG_LEAVE_FRAMES,
      holdMs: 700,
      restore: false,
    },
    pig_tomorrow: {
      mode: "transition",
      video: "v02-pig-leave.mp4",
      requireVisual: "V02_PIG_MASKED",
      frames: PIG_LEAVE_FRAMES,
      holdMs: 800,
      restore: false,
    },
    pig_deny_leave: {
      mode: "transition",
      video: "v02-pig-leave.mp4",
      requireVisual: "V02_PIG_MASKED",
      frames: PIG_LEAVE_FRAMES,
      holdMs: 800,
      restore: false,
    },
    fox_camera: { ...FOX_CIGARETTE },
    fox_lights_up: { ...FOX_CIGARETTE },
    fox_why: {
      mode: "burst",
      video: "v14-fox-gum-pop-v1.mp4",
      frames: ["v06-fox-action.webp"],
      requireVisual: "V06_FOX_ACTION",
      delayMs: 900,
      holdMs: 1800,
    },
    fox_monopoly: {
      mode: "burst",
      video: "v15-fox-candy-offer-v1.mp4",
      frames: ["v06-fox-action.webp"],
      requireVisual: "V06_FOX_ACTION",
      delayMs: 900,
      holdMs: 1800,
    },
    dog_coffee: {
      mode: "transition",
      video: "dog-suit-coffee-v2.mp4",
      openWith: "dog-suit-coffee-start-v2.webp",
      frames: ["v08-dog-settled.webp"],
      holdMs: 900,
    },
    dog_dreams: {
      mode: "burst",
      video: "dog-suit-wander-v2.mp4",
      requireVisual: "V08_DOG_SETTLED",
      frames: ["v08-dog-stand.webp", "v08-dog-aisle.webp"],
      delayMs: 900,
      holdMs: 900,
    },
  };

  const SHIFT_AUDIO = "../assets/audio/guest/red-room/shift/";
  const BED_VOLUME = 0.18;
  const BED_FADE_MS = 1400;
  const SCENE_SOUNDS = {
    cup: { file: "sfx-cup.mp3", volume: 0.55 },
    door: { file: "sfx-door.mp3", volume: 0.62 },
    phone: { file: "sfx-phone.mp3", volume: 0.58 },
    buzz: { file: "sfx-phone-buzz.mp3", volume: 0.52 },
    print: { file: "sfx-print.mp3", volume: 0.5 },
    paperUnfold: { file: "sfx-paper-unfold.mp3", volume: 0.52 },
    paperFold: { file: "sfx-paper-fold.mp3", volume: 0.5 },
    paperCrumple: { file: "sfx-paper-crumple.mp3", volume: 0.5 },
    keyRing: { file: "sfx-key-ring.mp3", volume: 0.56 },
    keyCabinet: { file: "sfx-key-cabinet.mp3", volume: 0.58 },
  };
  const PRESENCE_SITS = {
    pig: { file: "sfx-sit-pig.mp3", volume: 0.46, delayMs: 520 },
    fox: {
      file: "sfx-sit-fox.mp3",
      volume: 0.44,
      delayMs: 480,
      follow: { file: "sfx-phone-shutter.mp3", volume: 0.4, delayMs: 780 },
    },
    dog: { file: "sfx-sit-dog.mp3", volume: 0.5, delayMs: 280 },
  };
  const PRESENCE_SIGHS = {
    pig: { file: "sfx-sigh-pig.mp3", volume: 0.26 },
    fox: { file: "sfx-sigh-fox.mp3", volume: 0.24 },
    dog: { file: "sfx-sigh-dog.mp3", volume: 0.28 },
  };
  const SEA_CHAIN = [
    { file: "sfx-sea-waves.mp3", volume: 0.4 },
    { file: "sfx-sea-gulls.mp3", volume: 0.38 },
    { file: "sfx-sea-plastic.mp3", volume: 0.5 },
    { file: "sfx-sea-thud.mp3", volume: 0.58 },
  ];
  const BED_FILES = {
    empty: "bed-empty.mp3",
    pig: "bed-pig.mp3",
    fox: "bed-fox.mp3",
    dog: "bed-dog.mp3",
  };

  let activeRoot = null;
  let save = null;
  let revealTimer = 0;
  let autoTimer = 0;
  let ambientTimer = 0;
  let stillTimer = 0;
  let soundEnabled = true;
  let audioUnlockBound = false;
  let audioBlocked = false;
  let activeSceneVideo = null;
  let bedAudio = null;
  let bedName = "";
  let cueAudio = null;
  let presenceAudio = null;
  let overlayAudios = [];
  let sitTimer = 0;
  let sitFollowTimer = 0;
  let presenceTimer = 0;
  let presencePrimed = false;
  let lastSitGuest = "";
  let seaIndex = -1;
  let fadeRaf = 0;
  let bedFades = [];

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

  const motionFor = (nodeId, node) => {
    const motion = NODE_MOTIONS[nodeId];
    if (!motion) return null;
    if (motion.requireVisual && resolveVisual(node) !== motion.requireVisual) {
      return null;
    }
    return motion;
  };

  const motionUrl = (file) => assetUrl(MOTION_DIR + file);

  const openingStillSrc = (asset, motion) => {
    if (motion?.openWith) return motionUrl(motion.openWith);
    if (asset?.openWith) return assetUrl(asset.openWith);
    return asset?.image ? assetUrl(asset.image) : "";
  };

  const settledStillSrc = (asset) =>
    asset?.image ? assetUrl(asset.image) : "";

  const holdOpeningStill = (asset, motion) => {
    if (motion?.openWith) return true;
    if (prefersReducedMotion()) return false;
    if (asset?.playback === "reveal" && !hasFlag("pigRevealPlayed")) return true;
    if (asset?.playback === "transition" && !hasFlag("dogSleepPlayed")) {
      return true;
    }
    return false;
  };

  const hiringUrl = () => {
    try {
      return new URL(HIRING_HREF, document.baseURI).href;
    } catch {
      return "/hiring.html";
    }
  };

  const guestUrl = () => {
    try {
      return new URL(GUEST_HREF, document.baseURI).href;
    } catch {
      return "/locations/red-room-cafe.html";
    }
  };

  const clearAssignment = () => {
    window.sessionStorage.removeItem(ASSIGN_KEY);
  };

  const exitToGuest = () => {
    if (typeof window.TyndexSiteFx?.exitStaff === "function") {
      window.TyndexSiteFx.exitStaff();
    } else {
      window.localStorage.setItem(MODE_KEY, "guest");
      try {
        window.sessionStorage.removeItem(STAFF_SESSION_KEY);
      } catch (error) {
        /* session gate is best-effort */
      }
    }
    clearAssignment();
    stopShiftAudio();
    window.location.assign(guestUrl());
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
    window.TyndexDossierStore?.queueSync?.();
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

  const isAutoCloseNode = (node) => Boolean(node?.guestExit || node?.rewardVideo);

  const CLOSED_SHIFT_CHOICES = Object.freeze([
    { id: "replay", text: "Начать новую смену", next: "assign_notice", restart: true },
    { id: "leave_shift", text: "Вернуться в технический раздел", next: "leave", leave: true },
  ]);

  const markShiftExitSeen = () => {
    if (hasFlag(SHIFT_EXIT_SEEN)) return;
    applyFlags([SHIFT_EXIT_SEEN]);
    writeSave(save);
  };

  const prepareClosedShiftResume = () => {
    const node = nodeById(save?.currentNode);
    if (!save?.completed || !isAutoCloseNode(node)) return;
    markShiftExitSeen();
  };

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
      if (save.pigOutcome === "traded") return node.lineTraded || node.line;
      return node.lineDefault || node.line;
    }
    const when = (node.lineWhen || []).find((entry) =>
      (entry.require || []).every(hasFlag)
    );
    if (when?.line) return when.line;
    if (hasFlag("pigRevealed") && node.lineRevealed) return node.lineRevealed;
    if (hasFlag("replayShift") && node.lineReplay) return node.lineReplay;
    let line = node.line || "";
    if (node.complete || save.currentNode === "receipt_print") {
      const variants = content()?.receiptVariants || {};
      const variantText = variants[save.receiptVariant] || "—";
      line = line.replace("[вариант]", variantText);
    }
    return line;
  };

  const attachDossierItem = (profile, artifactId, extra = {}) => {
    if (!artifactId) return false;
    profile.artifacts = Array.isArray(profile.artifacts) ? profile.artifacts : [];
    profile.removedArtifactIds = Array.isArray(profile.removedArtifactIds)
      ? profile.removedArtifactIds
      : [];
    if (profile.removedArtifactIds.includes(artifactId)) return false;
    const known = profile.artifacts.find((item) => item.id === artifactId);
    if (known) {
      known.obtainedAt = known.obtainedAt || Date.now();
      return true;
    }
    profile.artifacts.push({
      id: artifactId,
      sessionNumber: hasFlag("replayShift") ? 2 : 1,
      obtainedAt: Date.now(),
      replay: Boolean(hasFlag("replayShift")),
      ...extra,
    });
    return true;
  };

  const receiptSnapshot = () => {
    const parts =
      content()?.buildReceiptCopy?.({
        receiptVariant: save?.receiptVariant,
        pigOutcome: save?.pigOutcome,
        foxOutcome: save?.foxOutcome,
        dogOutcome: save?.dogOutcome,
        replay: Boolean(hasFlag("replayShift")),
      }) || {};
    return {
      variant: save?.receiptVariant || null,
      copyVariant: parts.copyVariant || null,
      pigOutcome: save?.pigOutcome || null,
      foxOutcome: save?.foxOutcome || null,
      dogOutcome: save?.dogOutcome || null,
      replay: Boolean(hasFlag("replayShift")),
    };
  };

  const attachReceipt = () => {
    if (!save?.receiptVariant && !hasFlag("pigToyTaken")) return;
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
    if (save.receiptVariant) {
      attachDossierItem(profile, definitionId, receiptSnapshot());
    }
    if (hasFlag("pigToyTaken")) {
      attachDossierItem(profile, TOY_ARTIFACT_ID, {
        replay: Boolean(hasFlag("replayShift")),
      });
    }
    const giftPage = content()?.quietSleepPageFor?.(receiptSnapshot());
    if (giftPage) {
      attachDossierItem(profile, content()?.quietSleepArtifactId || QUIET_SLEEP_ARTIFACT_ID, {
        giftVariant: giftPage.variant,
        copyVariant: giftPage.variant,
        replay: Boolean(hasFlag("replayShift")),
      });
    }
    profile.updatedAt = Date.now();
    store.saveDossier(profile);
    save.receiptPending = false;
    writeSave(save);
  };

  const shiftAudioUrl = (file) => assetUrl(`${SHIFT_AUDIO}${file}`);

  const tryPlayAudio = (audio) => {
    if (!audio) return;
    const play = audio.play();
    if (play && typeof play.catch === "function") {
      play.catch(() => {
        audioBlocked = true;
      });
    }
  };

  const restartShiftAudio = () => {
    if (!soundEnabled) return;
    const node = nodeById(save?.currentNode);
    syncShiftAudio(node);
    if (node?.sound) playSceneSound(node.sound);
    syncPresence(node);
  };

  const bindAudioUnlock = () => {
    if (audioUnlockBound) return;
    audioUnlockBound = true;
    const unlock = () => {
      if (!soundEnabled || !audioBlocked) return;
      audioBlocked = false;
      restartShiftAudio();
    };
    document.addEventListener("pointerdown", unlock, true);
    document.addEventListener("keydown", unlock, true);
  };

  const stopElement = (audio) => {
    if (!audio) return;
    audio.onended = null;
    audio.pause();
    audio.src = "";
  };

  const stopCues = () => {
    seaIndex = -1;
    stopElement(cueAudio);
    cueAudio = null;
  };

  const stopOverlays = () => {
    window.clearTimeout(sitTimer);
    window.clearTimeout(sitFollowTimer);
    window.clearTimeout(presenceTimer);
    sitTimer = 0;
    sitFollowTimer = 0;
    presenceTimer = 0;
    stopElement(presenceAudio);
    presenceAudio = null;
    overlayAudios.forEach((audio) => stopElement(audio));
    overlayAudios = [];
  };

  const tickBedFades = (now) => {
    bedFades = bedFades.filter((fade) => {
      if (!fade.audio) return false;
      const t = Math.min(1, (now - fade.start) / fade.ms);
      fade.audio.volume = Math.max(0, Math.min(1, fade.from + (fade.to - fade.from) * t));
      if (t < 1) return true;
      fade.onDone?.();
      return false;
    });
    fadeRaf = bedFades.length ? window.requestAnimationFrame(tickBedFades) : 0;
  };

  const fadeBedTo = (audio, target, onDone) => {
    if (!audio) {
      onDone?.();
      return;
    }
    bedFades = bedFades.filter((fade) => fade.audio !== audio);
    bedFades.push({
      audio,
      from: audio.volume,
      to: target,
      start: performance.now(),
      ms: BED_FADE_MS,
      onDone,
    });
    if (!fadeRaf) fadeRaf = window.requestAnimationFrame(tickBedFades);
  };

  const stopBeds = () => {
    window.cancelAnimationFrame(fadeRaf);
    fadeRaf = 0;
    bedFades = [];
    stopElement(bedAudio);
    bedAudio = null;
    bedName = "";
  };

  const stopShiftAudio = () => {
    stopCues();
    stopOverlays();
    stopBeds();
  };

  const playOverlayFile = (file, volume, retain) => {
    const audio = new Audio(shiftAudioUrl(file));
    audio.preload = "auto";
    audio.volume = volume;
    if (retain) {
      stopElement(presenceAudio);
      presenceAudio = audio;
      audio.onended = () => {
        if (presenceAudio === audio) presenceAudio = null;
      };
    } else {
      overlayAudios = overlayAudios.filter((item) => item && !item.ended);
      overlayAudios.push(audio);
      audio.onended = () => {
        overlayAudios = overlayAudios.filter((item) => item !== audio);
      };
    }
    tryPlayAudio(audio);
  };

  const presenceGuest = (node) => {
    const guest = node?.guest || "none";
    if (guest === "pig") return "pig";
    if (guest === "fox") return "fox";
    if (guest === "dog") return "dog";
    return "none";
  };

  const shouldPlaySit = (node) => {
    const guest = presenceGuest(node);
    if (!guest || guest === "none" || guest === lastSitGuest) return false;
    if (guest === "dog") return resolveVisual(node) === "V08_DOG_SETTLED";
    return true;
  };

  const schedulePresenceSigh = (guest) => {
    window.clearTimeout(presenceTimer);
    presenceTimer = 0;
    if (!soundEnabled || !PRESENCE_SIGHS[guest]) return;
    presenceTimer = window.setTimeout(() => {
      presenceTimer = 0;
      if (!soundEnabled) return;
      const node = nodeById(save?.currentNode);
      if (presenceGuest(node) !== guest) return;
      const sigh = PRESENCE_SIGHS[guest];
      playOverlayFile(sigh.file, sigh.volume, false);
      schedulePresenceSigh(guest);
    }, 8000 + Math.round(Math.random() * 11000));
  };

  const playSit = (guest) => {
    const sit = PRESENCE_SITS[guest];
    if (!sit) return;
    window.clearTimeout(sitTimer);
    sitTimer = window.setTimeout(() => {
      sitTimer = 0;
      if (!soundEnabled) return;
      const node = nodeById(save?.currentNode);
      if (presenceGuest(node) !== guest) return;
      playOverlayFile(sit.file, sit.volume, true);
      if (sit.follow) {
        window.clearTimeout(sitFollowTimer);
        sitFollowTimer = window.setTimeout(() => {
          sitFollowTimer = 0;
          if (!soundEnabled) return;
          const current = nodeById(save?.currentNode);
          if (presenceGuest(current) !== guest) return;
          playOverlayFile(sit.follow.file, sit.follow.volume, false);
        }, sit.follow.delayMs || 0);
      }
    }, sit.delayMs || 0);
  };

  const syncPresence = (node) => {
    if (!soundEnabled || !node) return;
    const guest = presenceGuest(node);
    if (!presencePrimed) {
      presencePrimed = true;
      lastSitGuest =
        guest === "dog" && resolveVisual(node) !== "V08_DOG_SETTLED" ? "" : guest;
      schedulePresenceSigh(lastSitGuest === "none" ? "" : lastSitGuest);
      return;
    }
    if (guest === "none") {
      lastSitGuest = "";
      window.clearTimeout(sitTimer);
      window.clearTimeout(sitFollowTimer);
      sitTimer = 0;
      sitFollowTimer = 0;
      window.clearTimeout(presenceTimer);
      presenceTimer = 0;
      return;
    }
    if (shouldPlaySit(node)) {
      lastSitGuest = guest;
      playSit(guest);
    }
    schedulePresenceSigh(guest);
  };

  const playCueFile = (file, volume, onEnded) => {
    stopElement(cueAudio);
    const audio = new Audio(shiftAudioUrl(file));
    audio.preload = "auto";
    audio.volume = volume;
    cueAudio = audio;
    audio.onended = () => {
      if (cueAudio === audio) cueAudio = null;
      onEnded?.();
    };
    tryPlayAudio(audio);
  };

  const playSeaChain = (index) => {
    if (!soundEnabled || index >= SEA_CHAIN.length) {
      seaIndex = -1;
      return;
    }
    seaIndex = index;
    const step = SEA_CHAIN[index];
    playCueFile(step.file, step.volume, () => {
      if (seaIndex === index) playSeaChain(index + 1);
    });
  };

  const OBJECT_SOUNDS = new Set([
    "paperUnfold",
    "paperFold",
    "paperCrumple",
    "keyRing",
    "keyCabinet",
  ]);

  const playSceneSound = (name) => {
    if (!name || !soundEnabled) return;
    if (name === "sea") {
      stopCues();
      playSeaChain(0);
      return;
    }
    const cue = SCENE_SOUNDS[name];
    if (!cue) return;
    if (OBJECT_SOUNDS.has(name)) {
      playOverlayFile(cue.file, cue.volume, false);
      return;
    }
    stopCues();
    playCueFile(cue.file, cue.volume);
  };

  const bedForNode = (node) => {
    const guest = node?.guest || "none";
    if (guest === "pig") return "pig";
    if (guest === "fox" || guest === "fox-phone") return "fox";
    if (guest === "dog") return "dog";
    return "empty";
  };

  const setBed = (name) => {
    if (!soundEnabled) return;
    const file = BED_FILES[name] || BED_FILES.empty;
    if (bedName === name && bedAudio && !bedAudio.paused) return;
    const previous = bedAudio;
    const next = new Audio(shiftAudioUrl(file));
    next.loop = true;
    next.preload = "auto";
    next.volume = 0;
    bedAudio = next;
    bedName = name;
    tryPlayAudio(next);
    fadeBedTo(next, BED_VOLUME);
    if (previous && previous !== next) {
      const outgoing = previous;
      fadeBedTo(outgoing, 0, () => {
        if (bedAudio !== outgoing) stopElement(outgoing);
      });
    }
  };

  const syncShiftAudio = (node) => {
    if (!soundEnabled || !node) return;
    setBed(bedForNode(node));
  };

  const updateSoundButton = (root) => {
    const button = root?.querySelector("[data-lora-sound]");
    if (!button) return;
    button.setAttribute("aria-pressed", String(soundEnabled));
    const label = soundEnabled
      ? "Отключить звуки смены"
      : "Включить звуки смены";
    button.setAttribute("aria-label", label);
    button.title = label;
  };

  const setSoundEnabled = (root, enabled) => {
    soundEnabled = Boolean(enabled);
    updateSoundButton(root);
    if (!soundEnabled) {
      stopShiftAudio();
      return;
    }
    bindAudioUnlock();
    restartShiftAudio();
  };

  const readingHoldMs = (text, node) => {
    const chars = String(text || "")
      .replace(/\s+/g, " ")
      .trim().length;
    const fromLength = Math.min(8000, Math.max(900, chars * 55));
    const authored = Number(node?.delay) || 0;
    return Math.max(authored, fromLength);
  };

  const clearAdvanceWait = (root) => {
    const panel = root?.querySelector(".lora-room__panel");
    const lineEl = root?.querySelector("[data-lora-line]");
    const actionEl = root?.querySelector("[data-lora-action]");
    if (panel) {
      delete panel.dataset.waitingAdvance;
      delete panel.dataset.choiceHold;
      if (panel._loraAdvance) {
        panel.removeEventListener("click", panel._loraAdvance);
        panel._loraAdvance = null;
      }
    }
    if (lineEl) {
      lineEl.onclick = null;
      lineEl.onkeydown = null;
      lineEl.removeAttribute("aria-description");
    }
    if (actionEl) actionEl.onclick = null;
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
    if ((node.props || []).includes("page") && content()?.quietSleepPageFor?.(receiptSnapshot())) {
      props.add("page");
    } else {
      props.delete("page");
    }
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
    const visualId = resolveVisual(node);
    const asset = VISUAL_ASSETS[visualId] || null;
    if (stage) {
      stage.dataset.scene = node.scene || "counter";
      stage.dataset.guest = node.guest || "none";
      stage.dataset.visual = visualId || "";
      stage.dataset.hasVisual = String(Boolean(asset?.image));
      stage.dataset.cameraOff = String(hasFlag("cameraDisabled"));
      stage.dataset.videoState = asset?.video ? "poster" : "none";
      stage.dataset.motion = "idle";
      stage.dataset.inspect = node.inspect || "";
    }
    if (image) {
      image.onload = null;
      image.onerror = null;
      image.classList.remove("is-crossfading");
      if (asset?.image) {
        image.onerror = () => {
          image.hidden = true;
          image.removeAttribute("src");
          if (stage) stage.dataset.hasVisual = "false";
        };
        const motion = motionFor(save?.currentNode, node);
        image.src = holdOpeningStill(asset, motion)
          ? openingStillSrc(asset, motion)
          : settledStillSrc(asset);
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
      video.playsInline = true;
      video.setAttribute("playsinline", "");
      video.setAttribute("muted", "");
      if (asset?.video) {
        const motion = motionFor(save?.currentNode, node);
        video.src = assetUrl(asset.video);
        video.poster = holdOpeningStill(asset, motion)
          ? openingStillSrc(asset, motion)
          : settledStillSrc(asset);
      } else {
        video.removeAttribute("src");
        video.removeAttribute("poster");
        video.load();
      }
    }
    root.querySelectorAll("[data-lora-prop]").forEach((el) => {
      const name = el.dataset.loraProp;
      el.hidden = node.hideHtmlProps ? true : !visibleProps(node).has(name);
    });
    bindInspectedPhoto(root, node);
    bindInspectedToy(root, node);
    bindInspectedPage(root, node);
    root.querySelectorAll("[data-lora-guest]").forEach((el) => {
      el.hidden = (node.guest || "none") !== el.dataset.loraGuest;
    });
  };

  const bindInspectedPhoto = (root, node) => {
    const photo = root.querySelector('[data-lora-prop="photo"]');
    if (!photo) return;
    const inspecting =
      node.inspect === "photo" && visibleProps(node).has("photo") && !photo.hidden;
    photo.classList.toggle("is-inspect", inspecting);
    const dismiss = () => {
      const choice = (node.choices || []).find(choiceVisible);
      if (choice) handleChoice(root, choice);
    };
    photo.onclick = inspecting
      ? (event) => {
          event.preventDefault();
          dismiss();
        }
      : null;
    photo.onkeydown = inspecting
      ? (event) => {
          if (!["Enter", " "].includes(event.key)) return;
          event.preventDefault();
          dismiss();
        }
      : null;
    if (inspecting) {
      photo.setAttribute("role", "button");
      photo.tabIndex = 0;
      photo.setAttribute("aria-label", "Убрать фото");
    } else {
      photo.removeAttribute("role");
      photo.removeAttribute("tabindex");
      photo.removeAttribute("aria-label");
    }
  };

  const bindInspectedToy = (root, node) => {
    const toy = root.querySelector('[data-lora-prop="toy"]');
    const stage = root.querySelector("[data-lora-stage]");
    if (!toy) return;
    const inspecting =
      node.inspect === "toy" && visibleProps(node).has("toy") && !toy.hidden;
    if (stage) stage.dataset.inspect = inspecting ? "toy" : "";
    toy.classList.toggle("is-inspect", inspecting);
    const dismiss = () => {
      if (node.autoNext) {
        goTo(root, node.autoNext);
        return;
      }
      const choice = (node.choices || []).find(choiceVisible);
      if (choice) handleChoice(root, choice);
    };
    toy.onclick = inspecting
      ? (event) => {
          event.preventDefault();
          dismiss();
        }
      : null;
    toy.onkeydown = inspecting
      ? (event) => {
          if (!["Enter", " "].includes(event.key)) return;
          event.preventDefault();
          dismiss();
        }
      : null;
    if (stage) {
      stage.onclick = inspecting
        ? (event) => {
            if (event.target.closest('[data-lora-prop="toy"]')) return;
            event.preventDefault();
            dismiss();
          }
        : null;
    }
    if (inspecting) {
      toy.setAttribute("role", "button");
      toy.tabIndex = 0;
      toy.setAttribute("aria-label", "Убрать неваляшку");
    } else {
      toy.removeAttribute("role");
      toy.removeAttribute("tabindex");
      toy.removeAttribute("aria-label");
    }
  };

  const closePageViewer = (root) => {
    const viewer = root?.querySelector("[data-lora-page-viewer]");
    if (!viewer?.open) return;
    playSceneSound("paperCrumple");
    viewer.close();
  };

  const openPageViewer = (root) => {
    const viewer = root.querySelector("[data-lora-page-viewer]");
    const copyBox = root.querySelector("[data-lora-page-copy]");
    const page = content()?.quietSleepPageFor?.(receiptSnapshot());
    if (!viewer || !copyBox || !page) return;
    copyBox.replaceChildren();
    if (page.title) {
      const heading = document.createElement("h3");
      heading.textContent = page.title;
      copyBox.append(heading);
    }
    page.lines.forEach((line) => {
      const paragraph = document.createElement("p");
      paragraph.textContent = line;
      copyBox.append(paragraph);
    });
    if (page.stamp) {
      const stamp = document.createElement("footer");
      stamp.textContent = page.stamp;
      copyBox.append(stamp);
    }
    if (!viewer.open) {
      playSceneSound("paperUnfold");
      viewer.showModal();
    }
  };

  const bindInspectedPage = (root, node) => {
    const pageEl = root.querySelector('[data-lora-prop="page"]');
    if (!pageEl) return;
    const visible = visibleProps(node).has("page") && !pageEl.hidden;
    const open = (event) => {
      event.preventDefault();
      event.stopPropagation();
      openPageViewer(root);
    };
    pageEl.onclick = visible ? open : null;
    pageEl.onkeydown = visible
      ? (event) => {
          if (!["Enter", " "].includes(event.key)) return;
          open(event);
        }
      : null;
    if (visible) {
      pageEl.setAttribute("role", "button");
      pageEl.tabIndex = 0;
      pageEl.setAttribute("aria-label", "Открыть страницу");
    } else {
      pageEl.removeAttribute("role");
      pageEl.removeAttribute("tabindex");
      pageEl.removeAttribute("aria-label");
      closePageViewer(root);
    }
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

    video.poster = openingStillSrc(asset, null);
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
      if (image) {
        image.src = settledStillSrc(asset);
        image.hidden = false;
      }
      if (stage) stage.dataset.videoState = "poster";
      activeSceneVideo = null;
      applyFlags(["pigRevealPlayed"]);
      writeSave(save);
      presentChoices(root, node);
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

  const playLoopSceneVideo = (root, node) => {
    const asset = visualAsset(node);
    if (
      asset?.playback !== "loop" ||
      !asset.video ||
      prefersReducedMotion() ||
      document.visibilityState !== "visible"
    ) {
      return false;
    }
    const stage = root.querySelector("[data-lora-stage]");
    const image = root.querySelector("[data-lora-scene-image]");
    const video = root.querySelector("[data-lora-scene-video]");
    if (!video) return false;

    activeSceneVideo = video;
    video.loop = true;
    video.currentTime = 0;
    video.hidden = false;
    if (image) image.hidden = true;
    if (stage) stage.dataset.videoState = "playing";
    const playback = video.play();
    playback?.catch(() => {
      if (activeSceneVideo !== video) return;
      video.hidden = true;
      if (image) image.hidden = false;
      if (stage) stage.dataset.videoState = "poster";
      activeSceneVideo = null;
    });
    return true;
  };

  const playNodeMotionVideo = (
    root,
    node,
    motion,
    onComplete,
    onFallback
  ) => {
    if (!motion?.video || prefersReducedMotion()) return false;
    const stage = root.querySelector("[data-lora-stage]");
    const image = root.querySelector("[data-lora-scene-image]");
    const video = root.querySelector("[data-lora-scene-video]");
    const asset = visualAsset(node);
    if (!video) return false;

    activeSceneVideo = video;
    video.loop = false;
    video.muted = true;
    video.playsInline = true;
    video.setAttribute("playsinline", "");
    video.setAttribute("muted", "");
    video.src = motionUrl(motion.video);
    video.poster = openingStillSrc(asset, motion);
    video.currentTime = 0;
    video.hidden = false;
    if (image) image.hidden = true;
    if (stage) {
      stage.dataset.videoState = "playing";
      stage.dataset.motion = "playing";
      stage.dataset.inspect = "";
    }
    const toy = root.querySelector('[data-lora-prop="toy"]');
    if (toy) {
      toy.classList.remove("is-inspect");
      toy.hidden = true;
    }

    let settled = false;
    const finishMotion = (failed = false) => {
      if (settled || activeSceneVideo !== video) return;
      settled = true;
      video.pause();
      video.onended = null;
      video.onerror = null;
      activeSceneVideo = null;
      if (stage) stage.dataset.motion = "idle";
      if (failed) {
        video.hidden = true;
        if (image) image.hidden = false;
        if (stage) stage.dataset.videoState = "poster";
        onFallback?.();
        return;
      }
      if (motion.restore !== false) {
        video.hidden = true;
        if (image) {
          if (asset?.image) image.src = assetUrl(asset.image);
          image.hidden = false;
        }
        if (stage) stage.dataset.videoState = "poster";
      } else if (stage) {
        stage.dataset.videoState = "settled";
      }
      onComplete?.();
    };

    video.onended = () => finishMotion(false);
    video.onerror = () => finishMotion(true);
    const playback = video.play();
    playback?.catch(() => finishMotion(true));
    return true;
  };

  const playStillSequence = (root, node, motion, onComplete) => {
    const image = root.querySelector("[data-lora-scene-image]");
    const stage = root.querySelector("[data-lora-stage]");
    const asset = visualAsset(node);
    if (!image || !motion?.frames?.length || prefersReducedMotion()) {
      onComplete?.();
      return false;
    }
    const scheduledNode = save.currentNode;
    const holdMs = Number(motion.holdMs) || 1000;
    const closing =
      motion.restore === false || !asset?.image ? [] : [assetUrl(asset.image)];
    const queue = motion.frames.map(motionUrl).concat(closing);
    let index = 0;
    if (stage) {
      stage.dataset.motion = "playing";
      stage.dataset.inspect = "";
    }
    const toy = root.querySelector('[data-lora-prop="toy"]');
    if (toy) {
      toy.classList.remove("is-inspect");
      toy.hidden = true;
    }

    const showNext = () => {
      if (activeRoot !== root || save.currentNode !== scheduledNode) {
        if (stage) stage.dataset.motion = "idle";
        return;
      }
      if (index >= queue.length) {
        if (stage) stage.dataset.motion = "idle";
        onComplete?.();
        return;
      }
      const nextSrc = queue[index];
      index += 1;
      if (image.getAttribute("src") === nextSrc || image.src.endsWith(motion.frames[index - 1] || "")) {
        stillTimer = window.setTimeout(showNext, holdMs);
        return;
      }
      image.classList.add("is-crossfading");
      stillTimer = window.setTimeout(() => {
        if (activeRoot !== root || save.currentNode !== scheduledNode) return;
        image.onload = () => {
          image.classList.remove("is-crossfading");
          stillTimer = window.setTimeout(showNext, holdMs);
        };
        image.src = nextSrc;
      }, 280);
    };

    showNext();
    return true;
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

    video.poster = openingStillSrc(asset, null);
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

  const clearTimers = (root) => {
    window.clearTimeout(stillTimer);
    stillTimer = 0;
    window.clearTimeout(revealTimer);
    window.clearTimeout(autoTimer);
    window.clearTimeout(ambientTimer);
    revealTimer = 0;
    autoTimer = 0;
    ambientTimer = 0;
    if (root) clearAdvanceWait(root);
  };

  const setLine = (root, text, live, kind = "") => {
    const line = root.querySelector("[data-lora-line]");
    if (line) line.textContent = text;
    if (live) {
      live.textContent = kind === "thought" && text ? `Мысль. ${text}` : text;
    }
  };

  const SYSTEM_SPEAKERS = new Set(["СИСТЕМА", "КАССА", "ЗАПИСКА", "СМЕНА"]);

  const kindForSpeaker = (speaker) => {
    const name = speaker || "Я";
    if (name === "Я") return "thought";
    if (SYSTEM_SPEAKERS.has(name)) return "system";
    return "dialogue";
  };

  const applyPanelKind = (root, kind, speakerName = "") => {
    const panel = root.querySelector(".lora-room__panel");
    const speaker = root.querySelector("[data-lora-speaker]");
    const bubble = root.querySelector("[data-lora-bubble]");
    if (panel) panel.dataset.textKind = kind;
    if (bubble) {
      if (kind === "thought") {
        bubble.setAttribute("aria-label", "Мысль");
      } else if (speakerName) {
        bubble.setAttribute("aria-label", speakerName);
      } else {
        bubble.removeAttribute("aria-label");
      }
    }
    if (!speaker) return;
    if (kind === "thought") {
      speaker.hidden = true;
      speaker.textContent = "";
    } else {
      speaker.hidden = false;
      speaker.textContent = speakerName;
    }
  };

  const hideActionSlot = (root) => {
    const actionEl = root.querySelector("[data-lora-action]");
    if (!actionEl) return;
    actionEl.textContent = "";
    actionEl.hidden = true;
  };

  const presentActionBeat = (root, node) => {
    const raw = String(node.action || "").trim();
    if (!raw) return null;
    hideActionSlot(root);
    const system = /^СИСТЕМА\s*:/u.test(raw);
    const kind = system || SYSTEM_SPEAKERS.has(node.speaker) ? "system" : "thought";
    const speakerName = system ? "СИСТЕМА" : kind === "system" ? node.speaker : "";
    const text = system ? raw.replace(/^СИСТЕМА\s*:\s*/u, "") : raw;
    applyPanelKind(root, kind, speakerName);
    setLine(root, text, root.querySelector("[data-lora-live]"), kind);
    return { kind, text };
  };

  const appendChoiceButton = (box, root, choice) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "lora-room__choice";
    button.textContent = choice.text;
    button.dataset.choiceId = choice.id;
    button.addEventListener("click", () => {
      handleChoice(root, choice);
    });
    box.append(button);
  };

  const renderChoices = (root, node, selectedGroup = null) => {
    const box = root.querySelector("[data-lora-choices]");
    if (!box) return;
    box.replaceChildren();
    const choices = (node.choices || []).filter(choiceVisible);
    const grouped = new Map();
    const ungrouped = [];
    choices.forEach((choice) => {
      if (!choice.group) {
        ungrouped.push(choice);
        return;
      }
      const items = grouped.get(choice.group) || [];
      items.push(choice);
      grouped.set(choice.group, items);
    });
    if (grouped.size && !selectedGroup) {
      grouped.forEach((items, group) => {
        if (items.length === 1) {
          appendChoiceButton(box, root, items[0]);
          return;
        }
        const button = document.createElement("button");
        button.type = "button";
        button.className = "lora-room__choice lora-room__choice--group";
        button.textContent = group;
        button.dataset.choiceGroup = group;
        button.setAttribute("aria-haspopup", "true");
        button.setAttribute("aria-expanded", "false");
        button.setAttribute("aria-label", `${group}. Открыть варианты`);
        button.addEventListener("click", () => renderChoices(root, node, group));
        box.append(button);
      });
      ungrouped.forEach((choice) => appendChoiceButton(box, root, choice));
      box.querySelector("button")?.focus();
      return;
    }
    const visibleChoices = selectedGroup
      ? choices.filter((choice) => choice.group === selectedGroup)
      : choices;
    visibleChoices.forEach((choice) => appendChoiceButton(box, root, choice));
    if (selectedGroup) {
      const back = document.createElement("button");
      back.type = "button";
      back.className = "lora-room__choice lora-room__choice--back";
      back.textContent = "← Назад";
      back.dataset.choiceBack = "true";
      back.setAttribute("aria-label", `Назад к списку действий`);
      back.addEventListener("click", () => renderChoices(root, node));
      box.append(back);
    }
    const first = box.querySelector("button");
    first?.focus();
  };

  const armChoiceReveal = (root, node) => {
    const panel = root.querySelector(".lora-room__panel");
    const lineEl = root.querySelector("[data-lora-line]");
    const actionEl = root.querySelector("[data-lora-action]");
    let revealed = false;
    const reveal = (event) => {
      if (revealed) return;
      if (event?.target?.closest?.("[data-lora-choices]")) return;
      if (event?.type === "keydown" && !["Enter", " "].includes(event.key)) return;
      event?.preventDefault?.();
      revealed = true;
      clearAdvanceWait(root);
      if (actionEl) actionEl.hidden = true;
      renderChoices(root, node);
    };
    if (panel) {
      panel.dataset.waitingAdvance = "true";
      panel.dataset.choiceHold = "true";
      panel._loraAdvance = (event) => reveal(event);
      panel.addEventListener("click", panel._loraAdvance);
    }
    if (lineEl) {
      lineEl.tabIndex = 0;
      lineEl.setAttribute("aria-description", "Нажмите, чтобы ответить");
    }
    bindLineSkip(lineEl, reveal);
    if (actionEl) {
      actionEl.onclick = (event) => {
        event.stopPropagation();
        reveal(event);
      };
    }
  };

  const presentChoices = (root, node) => {
    hideActionSlot(root);
    const hasChoices = (node.choices || []).some(choiceVisible);
    if (hasChoices) renderChoices(root, node);
  };

  const presentClosedShiftChoices = (root, node) => {
    hideActionSlot(root);
    const hasReplay = (node.choices || []).some(
      (choice) => choice.restart && choiceVisible(choice)
    );
    if (hasReplay) {
      renderChoices(root, node);
      return;
    }
    renderChoices(root, { ...node, choices: CLOSED_SHIFT_CHOICES });
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
    if (choice.sound) playSceneSound(choice.sound);
    goTo(root, choice.next, choice);
  };

  const openRewardDialog = (dialog) => {
    if (!dialog) return;
    if (typeof dialog.showModal === "function") {
      if (!dialog.open) dialog.showModal();
      return;
    }
    dialog.setAttribute("open", "");
  };

  const closeRewardDialog = (dialog) => {
    if (!dialog) return;
    if (typeof dialog.close === "function" && dialog.open) dialog.close();
    dialog.removeAttribute("open");
  };

  const showWakePrompt = (root, node) => {
    const dialog = root.querySelector("[data-lora-wake-dialog]");
    const ok = root.querySelector("[data-lora-wake-ok]");
    if (!dialog || !ok || save.currentNode !== "end_leave_guard") return;
    ok.onclick = () => {
      closeRewardDialog(dialog);
      goTo(root, node.rewardNext);
    };
    openRewardDialog(dialog);
    ok.focus();
  };

  const playGuardWait = (root, node) => {
    const stage = root.querySelector("[data-lora-stage]");
    const image = root.querySelector("[data-lora-scene-image]");
    const video = root.querySelector("[data-lora-scene-video]");
    const waitMs = prefersReducedMotion() ? 1200 : DOG_WAIT_MS;

    const restoreStill = () => {
      if (video) {
        video.pause();
        video.onerror = null;
        video.hidden = true;
      }
      if (image) image.hidden = false;
      if (stage) stage.dataset.videoState = "poster";
      if (activeSceneVideo === video) activeSceneVideo = null;
    };

    if (video && !prefersReducedMotion()) {
      activeSceneVideo = video;
      video.src = assetUrl(DOG_WAIT_VIDEO);
      video.poster = assetUrl(VISUAL_ASSETS.V11_DOG_SLEEP.image);
      video.loop = true;
      video.muted = true;
      video.playsInline = true;
      video.currentTime = 0;
      video.hidden = false;
      video.onerror = restoreStill;
      if (image) image.hidden = true;
      if (stage) stage.dataset.videoState = "playing";
      video.play()?.catch(restoreStill);
    }

    autoTimer = window.setTimeout(() => {
      if (save.currentNode !== "end_leave_guard") return;
      restoreStill();
      showWakePrompt(root, node);
    }, waitMs);
  };

  const openCoffeeReward = (root, node) => {
    const dialog = root.querySelector("[data-lora-coffee-dialog]");
    const machine = root.querySelector("[data-lora-espresso]");
    if (!dialog || !machine || !window.TyndexRedRoomEspresso?.init) return;
    window.TyndexRedRoomEspresso.init(machine, {
      mode: "shift",
      forceFresh: true,
      persist: false,
      onServe: () => {
        closeRewardDialog(dialog);
        goTo(root, node.rewardNext);
      },
    });
    openRewardDialog(dialog);
    machine.querySelector("[data-rr-act]")?.focus();
  };

  const playLoraReward = (root) => {
    const stage = root.querySelector("[data-lora-stage]");
    const image = root.querySelector("[data-lora-scene-image]");
    const video = root.querySelector("[data-lora-scene-video]");
    const thanks = root.querySelector("[data-lora-thanks]");
    let settled = false;

    const finishReward = (failed = false) => {
      if (settled || save.currentNode !== "end_leave_lora") return;
      settled = true;
      if (video) {
        video.onended = null;
        video.onerror = null;
        if (failed) {
          video.hidden = true;
          if (image) image.hidden = false;
          if (stage) stage.dataset.videoState = "poster";
        }
      }
      activeSceneVideo = null;
      if (thanks) thanks.hidden = false;
      autoTimer = window.setTimeout(exitToGuest, 2400);
    };

    if (!video || prefersReducedMotion()) {
      finishReward(true);
      return;
    }

    activeSceneVideo = video;
    video.src = assetUrl(LORA_REWARD_VIDEO);
    video.poster = assetUrl(VISUAL_ASSETS.V11_DOG_SLEEP.image);
    video.loop = false;
    video.muted = true;
    video.playsInline = true;
    video.currentTime = 0;
    video.hidden = false;
    video.onended = () => finishReward(false);
    video.onerror = () => finishReward(true);
    if (image) image.hidden = true;
    if (stage) stage.dataset.videoState = "playing";
    video.play()?.catch(() => finishReward(true));
  };

  const renderDenied = (root) => {
    root.dataset.state = "denied";
    const speaker = root.querySelector("[data-lora-speaker]");
    const line = root.querySelector("[data-lora-line]");
    const action = root.querySelector("[data-lora-action]");
    const live = root.querySelector("[data-lora-live]");
    const choices = root.querySelector("[data-lora-choices]");
    if (speaker) speaker.textContent = "СИСТЕМА";
    applyPanelKind(root, "system", "СИСТЕМА");
    if (line) line.textContent = "КАНАЛ НЕ НАЗНАЧЕН";
    if (action) {
      action.textContent = "";
      action.hidden = true;
    }
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

  const bindLineSkip = (lineEl, skip) => {
    if (!lineEl) return;
    lineEl.tabIndex = 0;
    lineEl.onkeydown = (event) => {
      if (["Enter", " "].includes(event.key)) {
        event.preventDefault();
        skip();
      }
    };
    lineEl.onclick = (event) => {
      event.stopPropagation();
      skip();
    };
  };

  const armHold = (root, holdMs, onAdvance) => {
    const panel = root.querySelector(".lora-room__panel");
    const lineEl = root.querySelector("[data-lora-line]");
    let advanced = false;
    const advance = (event) => {
      if (advanced) return;
      if (event?.target?.closest?.("[data-lora-choices]")) return;
      if (event?.type === "keydown" && !["Enter", " "].includes(event.key)) return;
      event?.preventDefault?.();
      advanced = true;
      window.clearTimeout(autoTimer);
      autoTimer = 0;
      clearAdvanceWait(root);
      onAdvance();
    };
    if (panel) {
      panel.dataset.waitingAdvance = "true";
      panel._loraAdvance = (event) => advance(event);
      panel.addEventListener("click", panel._loraAdvance);
    }
    if (lineEl) {
      lineEl.tabIndex = 0;
      lineEl.setAttribute("aria-description", "Нажмите, чтобы продолжить");
      lineEl.onclick = (event) => {
        event.stopPropagation();
        advance(event);
      };
      lineEl.onkeydown = (event) => {
        if (["Enter", " "].includes(event.key)) {
          event.preventDefault();
          advance(event);
        }
      };
    }
    autoTimer = window.setTimeout(() => {
      advance();
    }, holdMs);
  };

  const armAutoAdvance = (root, node, fullText) => {
    armHold(root, readingHoldMs(fullText, node), () => goTo(root, node.autoNext));
  };

  const renderNode = (root, nodeId) => {
    const node = nodeById(nodeId);
    if (!node) return;
    const thanks = root.querySelector("[data-lora-thanks]");
    if (thanks) thanks.hidden = true;
    stopSceneVideo();
    clearTimers(root);
    stopCues();
    syncShiftAudio(node);
    if (node.sound) playSceneSound(node.sound);
    syncPresence(node);
    root.dataset.state = "play";
    root.dataset.node = nodeId;
    renderScene(root, { ...node, id: nodeId });
    const lineEl = root.querySelector("[data-lora-line]");
    const live = root.querySelector("[data-lora-live]");
    const choices = root.querySelector("[data-lora-choices]");
    const kind = kindForSpeaker(node.speaker);
    applyPanelKind(root, kind, node.speaker || "Я");
    hideActionSlot(root);
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
      if (node.action && !(isAutoCloseNode(node) && hasFlag(SHIFT_EXIT_SEEN))) {
        armHold(root, readingHoldMs(fullText, node), () => {
          const follow = presentActionBeat(root, node);
          finishNode(root, node, follow?.text || fullText);
        });
        return;
      }
      finishNode(root, node, fullText);
    };
    if (instant || fullText.length < 4) {
      setLine(root, fullText, live, kind);
      finish();
      return;
    }
    let index = 0;
    setLine(root, "", live, kind);
    const tick = () => {
      index += 1;
      const slice = fullText.slice(0, index);
      if (lineEl) lineEl.textContent = slice;
      if (index >= fullText.length) {
        setLine(root, fullText, live, kind);
        finish();
        return;
      }
      revealTimer = window.setTimeout(tick, 16);
    };
    const skip = () => {
      window.clearTimeout(revealTimer);
      revealTimer = 0;
      setLine(root, fullText, live, kind);
      finish();
    };
    bindLineSkip(lineEl, skip);
    tick();
  };

  const finishNode = (root, node, fullText) => {
    if (node.complete) {
      save.completed = true;
      writeSave(save);
      attachReceipt();
    }
    if (isAutoCloseNode(node)) {
      if (hasFlag(SHIFT_EXIT_SEEN)) {
        presentClosedShiftChoices(root, node);
        if (!playLoopSceneVideo(root, node)) {
          scheduleAmbientSceneVideo(root, node);
        }
        return;
      }
      markShiftExitSeen();
      if (node.guestExit) {
        autoTimer = window.setTimeout(exitToGuest, node.delay || 1800);
        return;
      }
      if (node.rewardVideo) {
        playLoraReward(root);
        return;
      }
    }
    if (node.waitReward) {
      playGuardWait(root, node);
      return;
    }
    if (node.coffeeReward) {
      openCoffeeReward(root, node);
      return;
    }
    const asset = visualAsset(node);
    const motion = motionFor(save.currentNode, node);
    if (node.autoNext) {
      if (motion?.mode === "transition") {
        const fallback = () =>
          playStillSequence(root, node, motion, () =>
            goTo(root, node.autoNext)
          );
        if (
          playNodeMotionVideo(
            root,
            node,
            motion,
            () => goTo(root, node.autoNext),
            fallback
          )
        ) {
          return;
        }
        fallback();
        return;
      }
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
      if (motion?.mode === "burst") {
        playLoopSceneVideo(root, node);
        stillTimer = window.setTimeout(() => {
          if (save.currentNode !== root.dataset.node) return;
          const go = () => {
            if (save.currentNode === root.dataset.node) goTo(root, node.autoNext);
          };
          const fallback = () => playStillSequence(root, node, motion, go);
          if (!playNodeMotionVideo(root, node, motion, go, fallback)) {
            fallback();
          }
        }, Number(motion.delayMs) || 1600);
        return;
      }
      playLoopSceneVideo(root, node);
      armAutoAdvance(root, node, fullText);
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
    presentChoices(root, node);
    if (motion?.mode === "burst") {
      stillTimer = window.setTimeout(() => {
        if (save.currentNode === root.dataset.node) {
          const fallback = () => playStillSequence(root, node, motion);
          if (!playNodeMotionVideo(root, node, motion, null, fallback)) {
            fallback();
          }
        }
      }, Number(motion.delayMs) || 1600);
    }
    if (!playLoopSceneVideo(root, node)) {
      scheduleAmbientSceneVideo(root, node);
    }
  };

  const dockMusic = (root) => {
    const slot = root.querySelector("[data-lora-music-slot]");
    const player = document.querySelector(".music-player");
    if (!slot || !player || player.parentNode === slot) return;
    slot.dataset.home = "docked";
    const toggle = slot.querySelector("[data-lora-music-toggle]");
    if (toggle) slot.insertBefore(player, toggle);
    else slot.append(player);
  };

  const bindChrome = (root) => {
    document.body.classList.add("lora-room-open");
    dockMusic(root);
    const musicToggle = root.querySelector("[data-lora-music-toggle]");
    if (musicToggle && musicToggle.dataset.ready !== "true") {
      musicToggle.dataset.ready = "true";
      musicToggle.addEventListener("click", () => {
        const slot = root.querySelector("[data-lora-music-slot]");
        if (!slot) return;
        const expanded = slot.classList.toggle("is-expanded");
        musicToggle.setAttribute("aria-expanded", String(expanded));
        musicToggle.setAttribute(
          "aria-label",
          expanded ? "Свернуть эфир" : "Развернуть эфир"
        );
      });
    }
    const leave = root.querySelector("[data-lora-leave]");
    if (leave && leave.dataset.ready !== "true") {
      leave.dataset.ready = "true";
      leave.addEventListener("click", () => {
        if (save) writeSave(save);
        stopShiftAudio();
        window.location.assign(hiringUrl());
      });
    }
    const note = root.querySelector('[data-lora-prop="note"]');
    if (note && note.dataset.ready !== "true") {
      note.dataset.ready = "true";
      note.addEventListener("click", () => {
        if (save?.currentNode === "shift_counter") {
          goTo(root, "note_read");
          return;
        }
        if (save?.currentNode === "note_read" || note.hidden) return;
        playSceneSound("paperCrumple");
      });
    }
    const pageClose = root.querySelector("[data-lora-page-close]");
    if (pageClose && pageClose.dataset.ready !== "true") {
      pageClose.dataset.ready = "true";
      pageClose.addEventListener("click", () => closePageViewer(root));
    }
    const soundButton = root.querySelector("[data-lora-sound]");
    if (soundButton && soundButton.dataset.ready !== "true") {
      soundButton.dataset.ready = "true";
      soundButton.addEventListener("click", () => {
        setSoundEnabled(root, !soundEnabled);
      });
    }
    updateSoundButton(root);
    bindAudioUnlock();
  };

  const init = (root) => {
    if (!root) return;
    if (activeRoot === root) return;
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
    prepareClosedShiftResume();
    writeSave(save);
    bindAudioUnlock();
    renderNode(root, save.currentNode);
  };

  const destroy = () => {
    closePageViewer(activeRoot);
    stopSceneVideo();
    stopShiftAudio();
    clearTimers(activeRoot);
    presencePrimed = false;
    lastSitGuest = "";
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
