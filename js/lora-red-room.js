(() => {
  "use strict";

  const SAVE_KEY = "tyndex_lora_red_room_v1";
  const ASSIGN_KEY = "tyndex_lora_channel_v1";
  const ASSIGN_TTL_MS = 120000;
  const ARTIFACT_ID = "lora-night-receipt";
  const HIRING_HREF = "../hiring.html";
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
      video: "../assets/guest/red-room/lora/scenes/v11-dog-sleep-idle.mp4",
      playback: "transition",
    },
    V12_EMPTY_CURTAIN: {
      image: "../assets/guest/red-room/lora/scenes/v12-empty-curtain.webp",
    },
    V13_RECEIPT: {
      image: "../assets/guest/red-room/lora/scenes/v01-empty-counter-v1.webp",
    },
  };

  const MOTION_DIR = "../assets/guest/red-room/lora/scenes/";
  const PIG_LEAVE_FRAMES = ["v02-pig-arrive-mid.webp", "v02-pig-arrive-far.webp"];
  const NODE_MOTIONS = {
    pig_arrive: {
      mode: "transition",
      video: "v02-pig-arrive.mp4",
      openWith: "v02-pig-arrive-far.webp",
      frames: ["v02-pig-arrive-far.webp", "v02-pig-arrive-mid.webp"],
      holdMs: 900,
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
    pig_hide: {
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
    dog_dreams: {
      mode: "transition",
      video: "v08-dog-wander.mp4",
      frames: ["v08-dog-stand.webp", "v08-dog-aisle.webp"],
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
    print: { file: "sfx-print.mp3", volume: 0.5 },
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
  let soundEnabled = false;
  let activeSceneVideo = null;
  let bedAudio = null;
  let bedName = "";
  let cueAudio = null;
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

  const shiftAudioUrl = (file) => assetUrl(`${SHIFT_AUDIO}${file}`);

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
    stopBeds();
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
    const play = audio.play();
    if (play && typeof play.catch === "function") play.catch(() => {});
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

  const playSceneSound = (name) => {
    if (!name || !soundEnabled) return;
    stopCues();
    if (name === "sea") {
      playSeaChain(0);
      return;
    }
    const cue = SCENE_SOUNDS[name];
    if (!cue) return;
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
    const play = next.play();
    if (play && typeof play.catch === "function") play.catch(() => {});
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
    button.textContent = soundEnabled ? "ЗВУК: ВКЛ" : "ЗВУК: ВЫКЛ";
    button.title = soundEnabled
      ? "Отключить звуки смены"
      : "Включить звуки смены";
  };

  const setSoundEnabled = (root, enabled) => {
    soundEnabled = Boolean(enabled);
    updateSoundButton(root);
    if (!soundEnabled) {
      stopShiftAudio();
      return;
    }
    const node = nodeById(save?.currentNode);
    syncShiftAudio(node);
    if (node?.sound) playSceneSound(node.sound);
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
    if (panel) {
      delete panel.dataset.waitingAdvance;
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
        image.src = assetUrl(
          motion?.openWith ? MOTION_DIR + motion.openWith : asset.image
        );
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
    if (asset?.image) video.poster = assetUrl(asset.image);
    video.currentTime = 0;
    video.hidden = false;
    if (image) image.hidden = true;
    if (stage) {
      stage.dataset.videoState = "playing";
      stage.dataset.motion = "playing";
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
    if (stage) stage.dataset.motion = "playing";

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

  const setLine = (root, text, live) => {
    const line = root.querySelector("[data-lora-line]");
    const speaker = root.querySelector("[data-lora-speaker]");
    if (line) line.textContent = text;
    if (live) live.textContent = text;
  };

  const renderChoices = (root, node, selectedGroup = null) => {
    const box = root.querySelector("[data-lora-choices]");
    if (!box) return;
    box.replaceChildren();
    const choices = (node.choices || []).filter(choiceVisible);
    const groups = [...new Set(choices.map((choice) => choice.group).filter(Boolean))];
    if (groups.length && !selectedGroup) {
      groups.forEach((group) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "lora-room__choice lora-room__choice--group";
        button.textContent = group;
        button.dataset.choiceGroup = group;
        button.addEventListener("click", () => renderChoices(root, node, group));
        box.append(button);
      });
      box.querySelector("button")?.focus();
      return;
    }
    const visibleChoices = selectedGroup
      ? choices.filter((choice) => choice.group === selectedGroup)
      : choices;
    visibleChoices.forEach((choice) => {
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
    if (selectedGroup) {
      const back = document.createElement("button");
      back.type = "button";
      back.className = "lora-room__choice lora-room__choice--back";
      back.textContent = "← Назад";
      back.dataset.choiceBack = "true";
      back.addEventListener("click", () => renderChoices(root, node));
      box.append(back);
    }
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
    const action = root.querySelector("[data-lora-action]");
    const live = root.querySelector("[data-lora-live]");
    const choices = root.querySelector("[data-lora-choices]");
    if (speaker) speaker.textContent = "СИСТЕМА";
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

  const armAutoAdvance = (root, node, fullText) => {
    const panel = root.querySelector(".lora-room__panel");
    const lineEl = root.querySelector("[data-lora-line]");
    let advanced = false;
    const advance = (event) => {
      if (advanced) return;
      if (event?.target?.closest?.("[data-lora-choices]")) return;
      if (event?.type === "keydown" && !["Enter", " "].includes(event.key)) return;
      event?.preventDefault?.();
      advanced = true;
      goTo(root, node.autoNext);
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
    }, readingHoldMs(fullText, node));
  };

  const renderNode = (root, nodeId) => {
    const node = nodeById(nodeId);
    if (!node) return;
    stopSceneVideo();
    clearTimers(root);
    stopCues();
    syncShiftAudio(node);
    if (node.sound) playSceneSound(node.sound);
    root.dataset.state = "play";
    root.dataset.node = nodeId;
    renderScene(root, { ...node, id: nodeId });
    const speaker = root.querySelector("[data-lora-speaker]");
    const lineEl = root.querySelector("[data-lora-line]");
    const actionEl = root.querySelector("[data-lora-action]");
    const panel = root.querySelector(".lora-room__panel");
    const live = root.querySelector("[data-lora-live]");
    const choices = root.querySelector("[data-lora-choices]");
    if (speaker) speaker.textContent = node.speaker || "СМЕНА";
    if (panel) {
      panel.dataset.textKind = node.speaker === "СМЕНА" ? "narration" : "dialogue";
    }
    if (actionEl) {
      actionEl.textContent = node.action || "";
      actionEl.hidden = true;
    }
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
      if (actionEl && node.action) actionEl.hidden = false;
      finishNode(root, node, fullText);
    };
    if (instant || fullText.length < 4) {
      setLine(root, fullText, live);
      if (live) live.textContent = [fullText, node.action].filter(Boolean).join(" ");
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
        if (live) live.textContent = [fullText, node.action].filter(Boolean).join(" ");
        finish();
        return;
      }
      revealTimer = window.setTimeout(tick, 16);
    };
    const skip = () => {
      window.clearTimeout(revealTimer);
      revealTimer = 0;
      setLine(root, fullText, live);
      if (live) live.textContent = [fullText, node.action].filter(Boolean).join(" ");
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
        stillTimer = window.setTimeout(() => {
          if (save.currentNode === root.dataset.node) {
            const fallback = () => playStillSequence(root, node, motion);
            if (!playNodeMotionVideo(root, node, motion, null, fallback)) {
              fallback();
            }
          }
        }, Number(motion.delayMs) || 1600);
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
    renderChoices(root, node);
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
    stopShiftAudio();
    clearTimers(activeRoot);
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
