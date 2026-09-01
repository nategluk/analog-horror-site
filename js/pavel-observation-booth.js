(() => {
  "use strict";

  const SAVE_KEY = "tyndex_pavel_observation_booth_v1";
  const CASSETTE_ID = "pavel-lora-cassette";
  const MODE_KEY = "tyndex_mode";
  const STAFF_SESSION_KEY = "tyndex_staff_session";
  const FALLBACK_STILL = "../assets/guest/locations/pavel/control-empty.webp";
  const VISUAL_FILES = {
    CONTROL_PAVEL_PRESENT: "../assets/guest/locations/pavel/tour-control-start.webp",
    CONTROL_EMPTY: "../assets/guest/locations/pavel/control-empty.webp",
    CONTROL_PAVEL_RIGHT: "../assets/guest/locations/pavel/control-pavel-right-start.webp",
    CONTROL_RIGHT_DISABLED: "../assets/guest/locations/pavel/control-right-disabled.webp",
    BEDROOM_BASE: "../assets/guest/locations/pavel/bedroom-base.webp",
    DRAIN_BASE: "../assets/guest/locations/pavel/drain-vague.webp",
    DRAIN_VAGUE: "../assets/guest/locations/pavel/drain-vague.webp",
    DRAIN_BECKON: "../assets/guest/locations/pavel/drain-beckon.webp",
    DRAIN_COUGH: "../assets/guest/locations/pavel/drain-cough.webp",
    DRAIN_HAIR_LONG: "../assets/guest/locations/pavel/drain-hair-long.webp",
    DRAIN_HUNGRY: "../assets/guest/locations/pavel/drain-hungry.webp",
    NIGHTSTAND_CASSETTE: "../assets/guest/locations/pavel/nightstand-cassette.webp",
    STORAGE_BASE: "../assets/guest/locations/pavel/storage-base.webp",
    STORAGE_PROVISIONS: "../assets/guest/locations/pavel/storage-provisions.webp",
    STORAGE_CLEANER: "../assets/guest/locations/pavel/storage-cleaner-bottle.webp",
    STORAGE_SLIDE: "../assets/guest/locations/pavel/storage-slide-loop.webp",
    STORAGE_ESCAPE: "../assets/guest/locations/pavel/storage-pavel-escape.webp",
    SENIOR_GUIDE_SLIDE: "../assets/guest/locations/pavel/senior-guide-waiting.webp",
    SLIDE_ESCAPE: "../assets/guest/locations/pavel/storage-slide-light.webp",
    HATCH_BASE: "../assets/guest/locations/pavel/hatch-tray.webp",
    HATCH_CLOSED: "../assets/guest/locations/pavel/hatch-dessert-start.webp",
    HATCH_GASMASK: "../assets/guest/locations/pavel/hatch-gasmask-start.webp",
    HATCH_DESSERT: "../assets/guest/locations/pavel/hatch-dessert-start.webp",
    HATCH_TOUR: "../assets/guest/locations/pavel/hatch-tray-start.webp",
  };
  const VISUAL_CLIPS = {
    CONTROL_PAVEL_RIGHT: Object.freeze({
      src: "../assets/guest/locations/pavel/control-pavel-right.mp4",
      startStill: "../assets/guest/locations/pavel/control-pavel-right-start.webp",
      holdStill: "../assets/guest/locations/pavel/control-pavel-right-hold.webp",
      playedFlag: "clipControlPavelRight",
    }),
    NIGHTSTAND_CASSETTE: Object.freeze({
      src: "../assets/guest/locations/pavel/nightstand-cassette.mp4",
      startStill: "../assets/guest/locations/pavel/nightstand-cassette-start.webp",
      holdStill: "../assets/guest/locations/pavel/nightstand-cassette.webp",
      playedFlag: "clipNightstandCassette",
    }),
    DRAIN_HUNGRY: Object.freeze({
      src: "../assets/guest/locations/pavel/drain-hungry.mp4",
      startStill: "../assets/guest/locations/pavel/drain-hungry.webp",
      holdStill: "../assets/guest/locations/pavel/drain-hungry.webp",
      playback: "loop",
    }),
    DRAIN_VAGUE: Object.freeze({
      src: "../assets/guest/locations/pavel/drain-vague.mp4",
      startStill: "../assets/guest/locations/pavel/drain-vague.webp",
      holdStill: "../assets/guest/locations/pavel/drain-vague.webp",
      playback: "loop",
    }),
    DRAIN_BECKON: Object.freeze({
      src: "../assets/guest/locations/pavel/drain-beckon.mp4",
      startStill: "../assets/guest/locations/pavel/drain-beckon.webp",
      holdStill: "../assets/guest/locations/pavel/drain-beckon.webp",
      playback: "loop",
    }),
    DRAIN_COUGH: Object.freeze({
      src: "../assets/guest/locations/pavel/drain-cough.mp4",
      startStill: "../assets/guest/locations/pavel/drain-cough-start.webp",
      holdStill: "../assets/guest/locations/pavel/drain-cough.webp",
      playback: "loop",
    }),
    DRAIN_HAIR_LONG: Object.freeze({
      src: "../assets/guest/locations/pavel/drain-hair-long.mp4",
      startStill: "../assets/guest/locations/pavel/drain-hair-long.webp",
      holdStill: "../assets/guest/locations/pavel/drain-hair-long.webp",
      playback: "loop",
    }),
    STORAGE_SLIDE: Object.freeze({
      src: "../assets/guest/locations/pavel/storage-slide-loop.mp4",
      startStill: "../assets/guest/locations/pavel/storage-slide-loop.webp",
      holdStill: "../assets/guest/locations/pavel/storage-slide-loop.webp",
      playback: "loop",
    }),
    SENIOR_GUIDE_SLIDE: Object.freeze({
      src: "../assets/guest/locations/pavel/senior-guide-waiting.mp4",
      startStill: "../assets/guest/locations/pavel/senior-guide-waiting.webp",
      holdStill: "../assets/guest/locations/pavel/senior-guide-waiting.webp",
      playback: "loop",
    }),
    HATCH_BASE: Object.freeze({
      src: "../assets/guest/locations/pavel/hatch-tray.mp4",
      startStill: "../assets/guest/locations/pavel/hatch-tray-start.webp",
      holdStill: "../assets/guest/locations/pavel/hatch-tray.webp",
      playedFlag: "clipHatchTray",
    }),
    HATCH_GASMASK: Object.freeze({
      src: "../assets/guest/locations/pavel/hatch-gasmask.mp4",
      startStill: "../assets/guest/locations/pavel/hatch-gasmask-start.webp",
      holdStill: "../assets/guest/locations/pavel/hatch-gasmask-hold.webp",
      playedFlag: "clipHatchGasmask",
    }),
    HATCH_DESSERT: Object.freeze({
      src: "../assets/guest/locations/pavel/hatch-dessert.mp4",
      startStill: "../assets/guest/locations/pavel/hatch-dessert-start.webp",
      holdStill: "../assets/guest/locations/pavel/hatch-dessert-hold.webp",
      playedFlag: "clipHatchDessert",
    }),
    SLIDE_ESCAPE: Object.freeze({
      src: "../assets/guest/locations/pavel/senior-guide-slide-exit.mp4",
      startStill: "../assets/guest/locations/pavel/senior-guide-waiting.webp",
      holdStill: "../assets/guest/locations/pavel/storage-slide-light.webp",
      playedFlag: "clipSeniorGuideExit",
      audio: true,
    }),
  };
  const CONTROL_EMPTY_CLIP = Object.freeze({
    src: "../assets/guest/locations/pavel/control-empty.mp4",
    startStill: "../assets/guest/locations/pavel/control-empty.webp",
    holdStill: "../assets/guest/locations/pavel/control-empty.webp",
    playback: "loop",
  });
  const CONTROL_REAL_PAVEL_CLIP = Object.freeze({
    src: "../assets/guest/locations/pavel/control-pavel-remote-loop.mp4",
    startStill: "../assets/guest/locations/pavel/control-pavel-remote.webp",
    holdStill: "../assets/guest/locations/pavel/control-pavel-remote.webp",
    playback: "loop",
  });
  const CONTROL_PSEUDO_PAVEL_CLIP = Object.freeze({
    src: "../assets/guest/locations/pavel/control-pseudo-pavel-loop.mp4",
    startStill: "../assets/guest/locations/pavel/control-pseudo-pavel.webp",
    holdStill: "../assets/guest/locations/pavel/control-pseudo-pavel.webp",
    playback: "loop",
  });
  const PAVEL_STORAGE_ESCAPE_CLIP = Object.freeze({
    src: "../assets/guest/locations/pavel/storage-pavel-escape.mp4",
    startStill: "../assets/guest/locations/pavel/storage-pavel-escape.webp",
    holdStill: "../assets/guest/locations/pavel/storage-slide-loop.webp",
    playedFlag: "clipPavelStorageEscape",
    setFlagOnStart: true,
  });
  const CONTROL_MOTION_CLIPS = Object.freeze({
    introMaskOff: Object.freeze({
      src: "../assets/guest/locations/pavel/control-intro-mask-off.mp4",
      startStill: "../assets/guest/locations/pavel/control-intro-mask-off-start.webp",
      holdStill: "../assets/guest/locations/pavel/control-intro-mask-off-hold.webp",
      playedFlag: "clipControlIntroMaskOff",
    }),
    listening: Object.freeze({
      src: "../assets/guest/locations/pavel/control-listening.mp4",
      startStill: "../assets/guest/locations/pavel/control-listening-start.webp",
      holdStill: "../assets/guest/locations/pavel/control-listening-hold.webp",
      playedFlag: "clipControlListening",
    }),
    lookBack: Object.freeze({
      src: "../assets/guest/locations/pavel/control-look-back.mp4",
      startStill: "../assets/guest/locations/pavel/control-look-back-start.webp",
      holdStill: "../assets/guest/locations/pavel/control-look-back-hold.webp",
      playedFlag: "clipControlLookBack",
    }),
    smile: Object.freeze({
      src: "../assets/guest/locations/pavel/control-smile.mp4",
      startStill: "../assets/guest/locations/pavel/control-smile-start.webp",
      holdStill: "../assets/guest/locations/pavel/control-smile-hold.webp",
      playedFlag: "clipControlSmile",
    }),
    yawn: Object.freeze({
      src: "../assets/guest/locations/pavel/control-yawn.mp4",
      startStill: "../assets/guest/locations/pavel/control-yawn-start.webp",
      holdStill: "../assets/guest/locations/pavel/control-yawn-hold.webp",
      playedFlag: "clipControlYawn",
    }),
    screensGlitch: Object.freeze({
      src: "../assets/guest/locations/pavel/control-screens-glitch.mp4",
      startStill: "../assets/guest/locations/pavel/control-screens-glitch-start.webp",
      holdStill: "../assets/guest/locations/pavel/control-screens-glitch-hold.webp",
      playedFlag: "clipControlScreensGlitch",
    }),
    channelSwitch: Object.freeze({
      src: "../assets/guest/locations/pavel/control-channel-switch.mp4",
      startStill: "../assets/guest/locations/pavel/control-channel-switch-start.webp",
      holdStill: "../assets/guest/locations/pavel/control-channel-switch-hold.webp",
      playedFlag: "clipControlChannelSwitch",
    }),
  });
  const TOUR_CLIPS = Object.freeze({
    control: Object.freeze({
      src: "../assets/guest/locations/pavel/tour-control.mp4",
      startStill: "../assets/guest/locations/pavel/tour-control-start.webp",
      holdStill: "../assets/guest/locations/pavel/tour-control-hold.webp",
      playedFlag: "clipTourControl",
    }),
    bedroom: Object.freeze({
      src: "../assets/guest/locations/pavel/tour-bedroom.mp4",
      startStill: "../assets/guest/locations/pavel/tour-bedroom.webp",
      holdStill: "../assets/guest/locations/pavel/tour-bedroom.webp",
      playback: "loop",
    }),
    bathroom: Object.freeze({
      src: "../assets/guest/locations/pavel/tour-bathroom.mp4",
      startStill: "../assets/guest/locations/pavel/tour-bathroom-start.webp",
      holdStill: "../assets/guest/locations/pavel/tour-bathroom-hold.webp",
      playedFlag: "clipTourBathroom",
    }),
    storage: Object.freeze({
      src: "../assets/guest/locations/pavel/tour-storage.mp4",
      startStill: "../assets/guest/locations/pavel/tour-storage-start.webp",
      holdStill: "../assets/guest/locations/pavel/tour-storage-hold.webp",
      playedFlag: "clipTourStorage",
    }),
    hatch: Object.freeze({
      src: "../assets/guest/locations/pavel/tour-hatch.mp4",
      startStill: "../assets/guest/locations/pavel/tour-hatch-start.webp",
      holdStill: "../assets/guest/locations/pavel/tour-hatch-hold.webp",
      playedFlag: "clipTourHatch",
    }),
  });
  const NODE_CLIPS = {
    "booth-intro": CONTROL_MOTION_CLIPS.introMaskOff,
    "booth-intro-irina": CONTROL_MOTION_CLIPS.listening,
    "booth-intro-know-you": CONTROL_MOTION_CLIPS.lookBack,
    "booth-intro-red-room-look": CONTROL_MOTION_CLIPS.smile,
    "booth-intro-post": CONTROL_MOTION_CLIPS.yawn,
    "tour-control": TOUR_CLIPS.control,
    "tour-bedroom": TOUR_CLIPS.bedroom,
    "tour-bedroom-sit": TOUR_CLIPS.bedroom,
    "tour-illusion-yes": TOUR_CLIPS.bedroom,
    "tour-illusion-no": TOUR_CLIPS.bedroom,
    "tour-illusion-cinema": TOUR_CLIPS.bedroom,
    "tour-illusion-film": TOUR_CLIPS.bedroom,
    "tour-bathroom": TOUR_CLIPS.bathroom,
    "tour-storage": TOUR_CLIPS.storage,
    "tour-storage-cans": TOUR_CLIPS.storage,
    "tour-storage-home": TOUR_CLIPS.storage,
    "tour-hatch": TOUR_CLIPS.hatch,
    "control-screens-glitch": CONTROL_MOTION_CLIPS.screensGlitch,
    "control-camera-press": CONTROL_MOTION_CLIPS.channelSwitch,
    "slide-farewell-left": PAVEL_STORAGE_ESCAPE_CLIP,
    "control-laugh": CONTROL_EMPTY_CLIP,
    "control-after-drain": CONTROL_REAL_PAVEL_CLIP,
    "control-after-drain-warn": CONTROL_REAL_PAVEL_CLIP,
    "control-drain-cue-2": CONTROL_EMPTY_CLIP,
    "control-drain-cue-3": CONTROL_EMPTY_CLIP,
    "control-phone": CONTROL_EMPTY_CLIP,
    "control-after-hatch": CONTROL_REAL_PAVEL_CLIP,
    "control-after-hatch-laugh": CONTROL_REAL_PAVEL_CLIP,
    "control-camera": CONTROL_PSEUDO_PAVEL_CLIP,
    "control-camera-ask": CONTROL_PSEUDO_PAVEL_CLIP,
    "dev-operator-hold": CONTROL_EMPTY_CLIP,
    "hold-accepted": CONTROL_EMPTY_CLIP,
    "operator-last-check": CONTROL_EMPTY_CLIP,
    "operator-left-channel": CONTROL_EMPTY_CLIP,
  };
  const SYSTEM_SPEAKERS = new Set(["СИСТЕМА", "ЗАПИСКА"]);
  const ROOM_LABELS = {
    control: "МОНИТОРНАЯ",
    bedroom: "СПАЛЬНЯ",
    bathroom: "САНУЗЕЛ",
    storage: "СКЛАД",
    hatch: "ДВЕРЬ / ОКНО",
  };
  const SOUND_FILES = {
    "test-channel-static": "../assets/audio/staff/cctv/channel-static.mp3",
    "test-distant-laugh": "../assets/audio/curator/sfx/child-laugh-distant.mp3",
    "test-drain-hum": "../assets/audio/guest/pavel/sfx-drain-wet-gurgle.mp3",
    "test-door": "../assets/audio/guest/red-room/shift/sfx-door.mp3",
    "test-paper": "../assets/audio/guest/red-room/shift/sfx-paper-unfold.mp3",
    "test-phone": "../assets/audio/guest/red-room/shift/sfx-phone-buzz.mp3",
    "test-click": "../assets/audio/staff/cctv/remote-button-click.mp3",
    "hatch-knock-3": "../assets/audio/guest/pavel/sfx-three-knocks-service-door.mp3",
    "hatch-dessert-voice": "../assets/audio/guest/pavel/sfx-hatch-dessert-voice.mp3",
    "pavel-hm-question": "../assets/audio/guest/pavel/sfx-pavel-hm-question.mp3",
    "pavel-mm": "../assets/audio/guest/pavel/sfx-pavel-mm.mp3",
    "pavel-tired-exhale": "../assets/audio/guest/pavel/sfx-pavel-tired-exhale.mp3",
    "pavel-hmm": "../assets/audio/guest/pavel/sfx-pavel-hmm.mp3",
    "drain-pour": "../assets/audio/guest/pavel/sfx-cleaner-pour-drain.mp3",
    "water-slide": "../assets/audio/guest/pavel/sfx-water-slide-enclosed.mp3",
    "drain-voice-damp": "../assets/audio/guest/pavel/sfx-drain-voice-damp.mp3",
    "drain-voice-neighbors": "../assets/audio/guest/pavel/sfx-drain-voice-neighbors.mp3",
    "drain-voice-hair": "../assets/audio/guest/pavel/sfx-drain-voice-hair.mp3",
    "drain-voice-hairy-friend": "../assets/audio/guest/pavel/sfx-drain-voice-hairy-friend.mp3",
    "drain-voice-lucky": "../assets/audio/guest/pavel/sfx-drain-voice-lucky.mp3",
    "drain-voice-shift": "../assets/audio/guest/pavel/sfx-drain-voice-shift.mp3",
    "drain-voice-slide": "../assets/audio/guest/pavel/sfx-drain-voice-slide.mp3",
    "drain-voice-thirst": "../assets/audio/guest/pavel/sfx-drain-voice-thirst.mp3",
    "drain-voice-cleaner-request": "../assets/audio/guest/pavel/sfx-drain-voice-cleaner-request.mp3",
    "drain-voice-cleaner-delight": "../assets/audio/guest/pavel/sfx-drain-voice-cleaner-delight.mp3",
    "drain-voice-thanks-zone": "../assets/audio/guest/pavel/sfx-drain-voice-thanks-zone.mp3",
    "drain-voice-aromatization": "../assets/audio/guest/pavel/sfx-drain-voice-aromatization.mp3",
  };
  const BED_FILES = {
    empty: "../assets/audio/guest/red-room/shift/bed-empty.mp3",
    tour: "../assets/audio/guest/pavel/music-tour-calm-loop.mp3",
    anxiety: "../assets/audio/guest/pavel/music-drain-anxiety-loop.mp3",
  };
  const BED_VOLUME = 0.18;
  const BED_FADE_MS = 1400;
  const CUE_VOLUME = 0.62;
  const LINE_TICK_MS = 16;
  const LINE_MIN_MS = 900;
  const CUE_DURATION_MS = Object.freeze({
    "test-channel-static": 1358,
    "test-distant-laugh": 4224,
    "test-drain-hum": 3030,
    "test-door": 2038,
    "test-paper": 1228,
    "test-phone": 1646,
    "hatch-knock-3": 2638,
    "hatch-dessert-voice": 3291,
    "pavel-hm-question": 392,
    "pavel-mm": 679,
    "pavel-tired-exhale": 679,
    "pavel-hmm": 522,
    "drain-pour": 4049,
    "water-slide": 5042,
    "drain-voice-damp": 888,
    "drain-voice-neighbors": 2142,
    "drain-voice-hair": 2116,
    "drain-voice-hairy-friend": 2299,
    "drain-voice-lucky": 575,
    "drain-voice-shift": 2377,
    "drain-voice-slide": 2429,
    "drain-voice-thirst": 2247,
    "drain-voice-cleaner-request": 1411,
    "drain-voice-cleaner-delight": 1620,
    "drain-voice-thanks-zone": 3161,
    "drain-voice-aromatization": 2717,
  });

  const content = () => window.TyndexPavelObservationBoothContent || null;
  let root = null;
  let save = null;
  let cueAudio = null;
  let bedAudio = null;
  let bedName = "";
  let bedFades = [];
  let fadeRaf = 0;
  let audioUnlockBound = false;
  let audioBlocked = false;
  let lastSoundNode = null;
  let lastRenderedNode = "";
  let lineToken = 0;
  let lineTickTimer = 0;
  let lineHoldTimer = 0;
  let lineReadyNode = "";
  let lineTyping = false;
  let exitTimer = null;
  let mediaToken = 0;
  let lastMediaKey = "";
  let choicesUnlockedNode = "";
  let choiceRevealAnimationPending = false;
  let choiceRevealTimer = null;
  let pendingRewardIds = [];
  let rewardTimer = null;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  const assetUrl = (rel) => new URL(rel, window.location.href).href;

  const readJson = (key) => {
    try {
      return JSON.parse(window.localStorage.getItem(key));
    } catch {
      return null;
    }
  };

  const createSave = () => ({
    version: 1,
    status: "in_progress",
    nodeId: content()?.startNode || "booth-intro",
    room: "control",
    flags: { textFallback: true },
    cassetteIds: [],
    cassetteFound: false,
    cassetteRewardedIds: [],
    operatorHeld: false,
    updatedAt: Date.now(),
  });

  const readSave = () => {
    const parsed = readJson(SAVE_KEY);
    const graph = content();
    if (!parsed || parsed.version !== 1) return null;
    parsed.flags = parsed.flags && typeof parsed.flags === "object" ? parsed.flags : {};
    parsed.flags.textFallback = true;
    parsed.cassetteIds = Array.isArray(parsed.cassetteIds)
      ? [...new Set(parsed.cassetteIds.filter((id) => typeof id === "string" && id))]
      : [];
    if (parsed.cassetteFound && !parsed.cassetteIds.includes(CASSETTE_ID)) {
      parsed.cassetteIds.unshift(CASSETTE_ID);
    }
    parsed.cassetteFound = parsed.cassetteIds.includes(CASSETTE_ID);
    parsed.cassetteRewardedIds = Array.isArray(parsed.cassetteRewardedIds)
      ? [...new Set(parsed.cassetteRewardedIds.filter((id) => typeof id === "string" && id))]
      : [];
    if (
      parsed.cassetteRewardSeen &&
      parsed.cassetteFound &&
      !parsed.cassetteRewardedIds.includes(CASSETTE_ID)
    ) {
      parsed.cassetteRewardedIds.push(CASSETTE_ID);
    }
    parsed.operatorHeld = Boolean(parsed.operatorHeld);
    if (parsed.nodeId === "hatch-escape-crawl") parsed.nodeId = "hatch-escape";
    if (parsed.nodeId === "booth-remain") parsed.nodeId = "senior-guide-route";
    if (parsed.nodeId === "slide-farewell-accepted") parsed.nodeId = "slide-farewell-cat";
    if (parsed.nodeId === "drain-cough-steam") parsed.nodeId = "drain-cough";
    if (
      parsed.nodeId === "drain-ask-leave" ||
      parsed.nodeId === "drain-shift-you" ||
      parsed.nodeId === "drain-shift-admin" ||
      parsed.nodeId === "drain-slide-worse" ||
      parsed.nodeId === "drain-slide-routes" ||
      parsed.nodeId === "drain-guide-hint"
    ) {
      parsed.nodeId = "drain-hair-long";
    }
    if (
      parsed.flags?.cameraBlind &&
      typeof parsed.nodeId === "string" &&
      parsed.nodeId.startsWith("slide-farewell-")
    ) {
      parsed.nodeId = "hatch-escape";
    }
    if (parsed.nodeId === "control-camera-press" && parsed.flags?.clipControlChannelSwitch) {
      parsed.nodeId = "hatch-escape";
    }
    if (parsed.nodeId === "slide-guest-light" && parsed.flags?.clipSeniorGuideExit) {
      parsed.nodeId = "slide-guest-exit";
    }
    if (!graph?.nodes?.[parsed.nodeId]) return null;
    return parsed;
  };

  const writeSave = (next) => {
    next.updatedAt = Date.now();
    window.localStorage.setItem(SAVE_KEY, JSON.stringify(next));
    window.TyndexDossierStore?.queueSync?.();
    return next;
  };

  const hasFlag = (flag) => Boolean(save?.flags?.[flag]);

  const recordFoundArtifact = (artifactId) => {
    if (!save || typeof artifactId !== "string" || !artifactId) return false;
    save.cassetteIds = Array.isArray(save.cassetteIds) ? save.cassetteIds : [];
    const alreadyKnown = save.cassetteIds.includes(artifactId);
    if (!alreadyKnown) save.cassetteIds.push(artifactId);
    if (artifactId === CASSETTE_ID) save.cassetteFound = true;
    return !alreadyKnown;
  };

  const shiftLocked = () =>
    Boolean(
      save?.operatorHeld ||
        hasFlag("tourCompleted") ||
        hasFlag("slideFarewellSeen") ||
        content()?.nodes?.[save?.nodeId]?.complete
    );

  const hudLeaveLocked = () => {
    const node = content()?.nodes?.[save?.nodeId];
    return Boolean(shiftLocked() || node?.guestExit || node?.autoNext);
  };

  const applyFlags = (flags = []) => {
    const foundArtifactIds = [];
    flags.forEach((flag) => {
      if (flag === "cassetteFound" && recordFoundArtifact(CASSETTE_ID)) {
        foundArtifactIds.push(CASSETTE_ID);
      }
      if (flag === "cameraBlind") save.flags.cameraBlind = true;
      save.flags[flag] = true;
    });
    return foundArtifactIds;
  };

  const stopElement = (audio) => {
    if (!audio) return;
    audio.onended = null;
    audio.pause();
    audio.src = "";
  };

  const tryPlayAudio = (audio) => {
    if (!audio) return;
    const play = audio.play();
    if (play && typeof play.catch === "function") {
      play.catch(() => {
        audioBlocked = true;
      });
    }
  };

  const stopCues = () => {
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

  const stopAudio = () => {
    stopCues();
    stopBeds();
  };

  const bedForNode = (node, nodeId) => {
    if (!node) return "";
    if (typeof nodeId === "string" && nodeId.startsWith("slide-farewell")) return "";
    if (node.room === "control") return "empty";
    if (
      node.speaker === "ГОЛОС ИЗ СЛИВА" ||
      (typeof nodeId === "string" && nodeId.startsWith("drain-")) ||
      node.visual === "DRAIN_VAGUE" ||
      node.visual === "DRAIN_BECKON" ||
      node.visual === "DRAIN_COUGH" ||
      node.visual === "DRAIN_HAIR_LONG" ||
      node.visual === "DRAIN_HUNGRY"
    ) {
      return "anxiety";
    }
    const touring =
      !hasFlag("tourCompleted") && !hasFlag("slideFarewellSeen");
    if (touring && (node.room === "bedroom" || node.room === "storage" || node.room === "bathroom")) {
      return "tour";
    }
    return "empty";
  };

  const setBed = (name) => {
    if (!hasFlag("soundEnabled") || !name) {
      if (bedAudio) {
        const outgoing = bedAudio;
        bedAudio = null;
        bedName = "";
        fadeBedTo(outgoing, 0, () => stopElement(outgoing));
      }
      return;
    }
    const src = BED_FILES[name];
    if (!src) return;
    if (bedName === name && bedAudio && !bedAudio.paused) return;
    const previous = bedAudio;
    const next = new Audio(assetUrl(src));
    next.loop = true;
    next.preload = "auto";
    next.volume = 0;
    bedAudio = next;
    bedName = name;
    tryPlayAudio(next);
    fadeBedTo(next, BED_VOLUME);
    if (previous && previous !== next) {
      fadeBedTo(previous, 0, () => {
        if (bedAudio !== previous) stopElement(previous);
      });
    }
  };

  const playSound = (soundId) => {
    stopCues();
    if (!hasFlag("soundEnabled") || !soundId) return;
    const src = SOUND_FILES[soundId];
    if (!src) return;
    const audio = new Audio(assetUrl(src));
    audio.preload = "auto";
    audio.volume = CUE_VOLUME;
    cueAudio = audio;
    audio.onended = () => {
      if (cueAudio === audio) cueAudio = null;
    };
    tryPlayAudio(audio);
  };

  const syncBoothAudio = (node, nodeId) => {
    if (!hasFlag("soundEnabled") || !node) {
      stopAudio();
      return;
    }
    setBed(bedForNode(node, nodeId));
  };

  const bindAudioUnlock = () => {
    if (audioUnlockBound || !root) return;
    audioUnlockBound = true;
    let primed = false;
    const unlock = () => {
      if (!hasFlag("soundEnabled")) return;
      if (!primed) {
        primed = true;
        const silent = new Audio(assetUrl(SOUND_FILES["test-click"]));
        silent.volume = 0;
        silent.play().catch(() => {});
      }
      if (!audioBlocked) return;
      audioBlocked = false;
      const node = content()?.nodes?.[save?.nodeId];
      syncBoothAudio(node, save?.nodeId);
      if (node?.sound) playSound(node.sound);
    };
    root.addEventListener("pointerdown", unlock);
  };

  const cassetteIdsForSave = () => [
    ...new Set([
      ...(Array.isArray(save?.cassetteIds) ? save.cassetteIds : []),
      ...(save?.cassetteFound ? [CASSETTE_ID] : []),
    ]),
  ];

  const attachCassette = () => {
    const cassetteIds = [...new Set(cassetteIdsForSave())];
    if (!cassetteIds.length) return [];

    if (typeof window.TyndexVhs?.claim === "function") {
      return cassetteIds.filter((artifactId) =>
        window.TyndexVhs.claim(artifactId, { obtainedAt: save.updatedAt })
      );
    }

    const store = window.TyndexDossierStore;
    if (!store?.readDossier || !store.saveDossier) return [];
    const profile = store.readDossier();
    if (!profile || profile.version !== 1) return [];
    profile.artifacts = Array.isArray(profile.artifacts) ? profile.artifacts : [];
    profile.removedArtifactIds = Array.isArray(profile.removedArtifactIds)
      ? profile.removedArtifactIds
      : [];
    const known = new Set(profile.artifacts.map((artifact) => artifact.id));
    const claimed = cassetteIds.filter((artifactId) => {
      if (profile.removedArtifactIds.includes(artifactId) || known.has(artifactId)) {
        return false;
      }
      profile.artifacts.push({
        id: artifactId,
        obtainedAt: save.updatedAt || Date.now(),
      });
      known.add(artifactId);
      return true;
    });
    if (!claimed.length) return [];
    profile.updatedAt = Date.now();
    store.saveDossier(profile);
    return claimed;
  };

  const showArtifactReward = (artifactIds) => {
    const reward = root?.querySelector("[data-booth-reward]");
    if (!reward || !artifactIds.length) return false;

    const cassetteCount = artifactIds.length;
    reward.hidden = false;
    reward.textContent =
      `АРТЕФАКТ СОХРАНЁН // ВИДЕОКАССЕТ${cassetteCount === 1 ? "А" : "Ы"}\n` +
      `${cassetteCount === 1 ? "Запись" : "Записи"} добавлен${cassetteCount === 1 ? "а" : "ы"} в материалы STAFF. ` +
      "На главной откройте VCR и выберите запись вручную.";

    const live = root.querySelector("[data-booth-live]");
    if (live) live.textContent = reward.textContent;
    window.clearTimeout(rewardTimer);
    rewardTimer = window.setTimeout(() => {
      reward.hidden = true;
    }, 10000);
    return true;
  };

  const exitToGuest = () => {
    if (!save) return;
    save.flags.seniorGuideExit = true;
    save.status = "completed";
    writeSave(save);
    stopAudio();
    if (typeof window.TyndexSiteFx?.exitStaff === "function") {
      window.TyndexSiteFx.exitStaff();
    } else {
      window.localStorage.setItem(MODE_KEY, "guest");
      try {
        window.sessionStorage.removeItem(STAFF_SESSION_KEY);
      } catch {
        /* session gate is best-effort */
      }
    }
    window.location.assign("../index.html");
  };

  const CLOSED_SHIFT_CHOICES = Object.freeze([
    { id: "replay", label: "Начать новую смену", restart: true },
    { id: "leave_shift", label: "Вернуться в технический раздел", leave: true },
  ]);

  const finaleReached = () => Boolean(hasFlag("seniorGuideExit"));

  const restartBooth = () => {
    const soundOn = hasFlag("soundEnabled");
    stopAudio();
    stopVideo();
    if (exitTimer) window.clearTimeout(exitTimer);
    exitTimer = null;
    clearChoiceRevealTimer();
    mediaToken += 1;
    lastMediaKey = "";
    choicesUnlockedNode = "";
    choiceRevealAnimationPending = false;
    lastSoundNode = "";
    lastRenderedNode = "";
    lineReadyNode = "";
    clearLineTimers();
    document.body.classList.remove("glitching");
    save = createSave();
    if (soundOn) save.flags.soundEnabled = true;
    writeSave(save);
    render();
  };

  const leaveClosedShift = () => {
    stopAudio();
    stopVideo();
    window.location.assign("../staff.html?personnel=pavel");
  };

  const scheduleGuestExit = (node) => {
    if (!node?.guestExit || exitTimer || finaleReached()) return;
    document.body.classList.add("glitching");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    exitTimer = window.setTimeout(exitToGuest, reduced ? 0 : Number(node.delay) || 1400);
  };

  const stopVideo = () => {
    const video = root?.querySelector("[data-booth-video]");
    if (!video) return;
    video.pause();
    video.removeAttribute("src");
    video.loop = false;
    video.load();
    video.hidden = true;
  };

  const clearChoiceRevealTimer = () => {
    if (!choiceRevealTimer) return;
    window.clearTimeout(choiceRevealTimer);
    choiceRevealTimer = null;
  };

  const clearLineTimers = () => {
    if (lineTickTimer) window.clearTimeout(lineTickTimer);
    if (lineHoldTimer) window.clearTimeout(lineHoldTimer);
    lineTickTimer = 0;
    lineHoldTimer = 0;
    lineTyping = false;
    lineToken += 1;
    const textEl = root?.querySelector("[data-booth-text]");
    if (textEl) {
      textEl.classList.remove("pavel-booth__text--typing");
      textEl.onclick = null;
      textEl.onkeydown = null;
      textEl.removeAttribute("aria-description");
    }
  };

  const lineHoldMs = (text, soundId) => {
    const typeMs = String(text || "").length * LINE_TICK_MS;
    const cueMs = hasFlag("soundEnabled") ? Number(CUE_DURATION_MS[soundId] || 0) : 0;
    return Math.max(typeMs, cueMs, LINE_MIN_MS);
  };

  const setBoothLine = (shown, full, kind) => {
    const textEl = root?.querySelector("[data-booth-text]");
    const liveEl = root?.querySelector("[data-booth-live]");
    if (textEl) textEl.textContent = shown;
    if (liveEl) {
      liveEl.textContent = kind === "thought" && full ? `Мысль. ${full}` : full;
    }
  };

  const finishLineHold = (nodeId, token) => {
    if (token !== lineToken || save?.nodeId !== nodeId) return;
    clearLineTimers();
    lineReadyNode = nodeId;
    choiceRevealAnimationPending = true;
    render();
  };

  const bindLineSkip = (textEl, skip) => {
    if (!textEl) return;
    textEl.tabIndex = 0;
    textEl.onkeydown = (event) => {
      if (!["Enter", " "].includes(event.key)) return;
      event.preventDefault();
      skip();
    };
    textEl.onclick = (event) => {
      event.stopPropagation();
      skip();
    };
  };

  const startLineHold = (node, nodeId, fullText, kind) => {
    clearLineTimers();
    const token = lineToken;
    const textEl = root?.querySelector("[data-booth-text]");
    let index = 0;
    let typed = false;
    lineTyping = true;
    if (textEl) {
      textEl.classList.add("pavel-booth__text--typing");
      textEl.setAttribute("aria-description", "Нажмите, чтобы показать фразу");
    }
    setBoothLine("", fullText, kind);

    const completeType = () => {
      if (typed) return;
      typed = true;
      if (lineTickTimer) window.clearTimeout(lineTickTimer);
      lineTickTimer = 0;
      setBoothLine(fullText, fullText, kind);
      if (textEl) {
        textEl.classList.remove("pavel-booth__text--typing");
        textEl.setAttribute("aria-description", "Нажмите, чтобы ответить");
      }
    };

    const tick = () => {
      if (token !== lineToken || save?.nodeId !== nodeId) return;
      index += 1;
      setBoothLine(fullText.slice(0, index), fullText, kind);
      if (index >= fullText.length) {
        completeType();
        return;
      }
      lineTickTimer = window.setTimeout(tick, LINE_TICK_MS);
    };

    const skip = () => {
      if (token !== lineToken || save?.nodeId !== nodeId) return;
      if (!typed) {
        completeType();
        return;
      }
      finishLineHold(nodeId, token);
    };

    bindLineSkip(textEl, skip);
    lineHoldTimer = window.setTimeout(() => {
      completeType();
      finishLineHold(nodeId, token);
    }, lineHoldMs(fullText, node.sound));
    if (fullText.length < 4) completeType();
    else tick();
  };

  const goToNode = (nextId) => {
    const nextNode = content()?.nodes?.[nextId];
    if (!save || !nextNode) return;
    save.nodeId = nextId;
    if (nextNode.complete) {
      save.status = "completed";
      save.operatorHeld = true;
    }
    writeSave(save);
    lastSoundNode = "";
    render();
  };

  const revealChoicesForNode = (nodeId, token) => {
    if (token !== mediaToken || save?.nodeId !== nodeId) return;
    clearChoiceRevealTimer();
    choicesUnlockedNode = nodeId;
    choiceRevealAnimationPending = true;
    render();
  };

  const settleAfterClip = (node, nodeId, token) => {
    if (token !== mediaToken || save?.nodeId !== nodeId) return;
    clearChoiceRevealTimer();
    if (node.autoNext) {
      goToNode(node.autoNext);
      return;
    }
    if (node.choicesAfterClip) revealChoicesForNode(nodeId, token);
  };

  const applyVisual = (node) => {
    const still = root.querySelector("[data-booth-still]");
    const video = root.querySelector("[data-booth-video]");
    const stage = root.querySelector("[data-booth-stage]");
    const clip = NODE_CLIPS[save.nodeId] || VISUAL_CLIPS[node.visual];
    const played = Boolean(clip?.playedFlag && hasFlag(clip.playedFlag));
    const stillHint = clip
      ? (played || (reduceMotion.matches && [
          "NIGHTSTAND_CASSETTE",
          "HATCH_BASE",
          "HATCH_GASMASK",
          "HATCH_DESSERT",
          "STORAGE_ESCAPE",
          "SLIDE_ESCAPE",
        ].includes(node.visual))
        ? clip.holdStill
        : clip.startStill)
      : (VISUAL_FILES[node.visual] || FALLBACK_STILL);
    const mediaKey = `${clip?.src || stillHint}|${played}|${reduceMotion.matches}`;
    if (mediaKey === lastMediaKey) return;
    lastMediaKey = mediaKey;

    const token = ++mediaToken;
    const nodeId = save.nodeId;
    stopVideo();
    clearChoiceRevealTimer();
    if (stage) stage.dataset.visual = node.visual || "";

    if (still) {
      still.src = assetUrl(stillHint);
      still.alt = node.imageAlt || node.text || "Служебный ракурс кабинки обозрения";
      still.hidden = false;
    }

    const skipMotion = !clip || !video || reduceMotion.matches || played;
    if (skipMotion) {
      if (node.autoNext) {
        if (clip?.playedFlag && save) {
          save.flags[clip.playedFlag] = true;
          writeSave(save);
        }
        window.setTimeout(() => settleAfterClip(node, nodeId, token), 0);
      }
      return;
    }

    video.muted = !clip.audio || !hasFlag("soundEnabled");
    video.loop = clip.playback === "loop";
    video.playsInline = true;
    video.setAttribute("playsinline", "");
    video.poster = assetUrl(clip.startStill);
    video.src = assetUrl(clip.src);
    video.hidden = false;

    if (clip.setFlagOnStart && clip.playedFlag) {
      save.flags[clip.playedFlag] = true;
      writeSave(save);
    }

    const fail = () => {
      if (token !== mediaToken) return;
      video.hidden = true;
      if (node.autoNext && clip?.playedFlag && save) {
        save.flags[clip.playedFlag] = true;
        writeSave(save);
      }
      settleAfterClip(node, nodeId, token);
    };
    let playbackRequested = false;
    const play = () => {
      if (token !== mediaToken || playbackRequested) return;
      playbackRequested = true;
      const attempt = video.play();
      if (attempt && typeof attempt.catch === "function") {
        attempt.catch(() => {
          if (token !== mediaToken) return;
          if (!video.muted) {
            video.muted = true;
            const mutedAttempt = video.play();
            if (mutedAttempt && typeof mutedAttempt.catch === "function") {
              mutedAttempt.catch(fail);
            }
            return;
          }
          fail();
        });
      }
    };
    video.addEventListener("loadedmetadata", play, { once: true });
    video.addEventListener("error", fail, { once: true });
    video.load();
    if (video.readyState >= 1) play();
    if (node.choicesAfterClip || node.autoNext) {
      choiceRevealTimer = window.setTimeout(() => {
        if (node.autoNext && clip?.playedFlag && save) {
          save.flags[clip.playedFlag] = true;
          writeSave(save);
        }
        settleAfterClip(node, nodeId, token);
      }, 15000);
    }
    video.addEventListener("ended", () => {
      if (token !== mediaToken || !save || !clip) return;
      if (clip.playedFlag) {
        save.flags[clip.playedFlag] = true;
        writeSave(save);
      }
      lastMediaKey = `${clip.src}|true|${reduceMotion.matches}`;
      if (still) {
        still.src = assetUrl(clip.holdStill);
        still.hidden = false;
      }
      stopVideo();
      settleAfterClip(node, nodeId, token);
      if (clip.guestExit && !finaleReached()) exitToGuest();
    }, { once: true });
  };

  const kindForNode = (node) => {
    if (node?.presentation === "document") return "document";
    const name = node?.speaker || "Я";
    if (name === "Я") return "thought";
    if (SYSTEM_SPEAKERS.has(name)) return "system";
    return "dialogue";
  };

  const applyPanelKind = (kind, speakerName = "") => {
    const panel = root.querySelector(".pavel-booth__panel");
    const speaker = root.querySelector("[data-booth-speaker]");
    const bubble = root.querySelector("[data-booth-bubble]");
    if (panel) panel.dataset.textKind = kind;
    if (bubble) {
      if (kind === "thought") bubble.setAttribute("aria-label", "Мысль");
      else if (kind === "document") bubble.setAttribute("aria-label", "Текст записки");
      else if (speakerName) bubble.setAttribute("aria-label", speakerName);
      else bubble.removeAttribute("aria-label");
    }
    if (!speaker) return;
    if (kind === "thought") {
      speaker.hidden = true;
      speaker.textContent = "";
      return;
    }
    speaker.hidden = false;
    speaker.textContent = kind === "document" ? "БУМАЖНАЯ ЗАПИСКА" : speakerName;
  };

  const choiceAllowed = (choice) => {
    const required = Array.isArray(choice.require) ? choice.require : [];
    const any = Array.isArray(choice.requireAny) ? choice.requireAny : [];
    if (required.length && required.some((flag) => !hasFlag(flag))) return false;
    if (any.length && any.every((flag) => !hasFlag(flag))) return false;
    const hideIf = Array.isArray(choice.hideIf) ? choice.hideIf : [];
    if (hideIf.length && hideIf.some((flag) => hasFlag(flag))) return false;
    return true;
  };

  const choicesReady = (node) => {
    if (node.sound && lineReadyNode !== save.nodeId && !reduceMotion.matches) {
      return false;
    }
    if (!node.choicesAfterClip) return true;
    const clip = NODE_CLIPS[save.nodeId] || VISUAL_CLIPS[node.visual];
    return Boolean(
      reduceMotion.matches ||
      !clip ||
      (clip.playedFlag && hasFlag(clip.playedFlag)) ||
      choicesUnlockedNode === save.nodeId
    );
  };

  const render = () => {
    if (!root || !save) return;
    const graph = content();
    const node = graph?.nodes?.[save.nodeId];
    if (!node) return;

    if (lastRenderedNode && lastRenderedNode !== save.nodeId) {
      clearLineTimers();
      lineReadyNode = "";
    }

    save.room = node.room || save.room;
    if (node.complete) {
      save.status = "completed";
      save.operatorHeld = true;
    }
    const nodeArtifactId = node.artifactId ||
      (node.artifact === "test-cassette-slot" ? CASSETTE_ID : null);
    if (nodeArtifactId && recordFoundArtifact(nodeArtifactId)) {
      pendingRewardIds.push(nodeArtifactId);
    }
    writeSave(save);
    attachCassette();
    const unrewardedIds = cassetteIdsForSave().filter(
      (artifactId) => !save.cassetteRewardedIds.includes(artifactId)
    );
    if (unrewardedIds.length && showArtifactReward(unrewardedIds)) {
      save.cassetteRewardedIds = [
        ...new Set([...save.cassetteRewardedIds, ...unrewardedIds]),
      ];
      writeSave(save);
    }
    pendingRewardIds = [];

    const roomEl = root.querySelector("[data-booth-room]");
    const choicesEl = root.querySelector("[data-booth-choices]");
    const soundButton = root.querySelector("[data-booth-sound]");
    const leaveButton = root.querySelector("[data-booth-leave]");
    const kind = kindForNode(node);
    const visibleText = hasFlag("cameraRefused") && node.refusalText
      ? node.refusalText
      : node.text || "";

    if (roomEl) roomEl.textContent = ROOM_LABELS[node.room] || node.room || "";
    applyPanelKind(kind, node.speaker || "");
    const holdLine = Boolean(node.sound) && !reduceMotion.matches;
    if (!holdLine) {
      clearLineTimers();
      setBoothLine(visibleText, visibleText, kind);
    } else if (lineReadyNode === save.nodeId) {
      setBoothLine(visibleText, visibleText, kind);
    } else if (!lineTyping) {
      startLineHold(node, save.nodeId, visibleText, kind);
    }
    applyVisual(node);
    if (soundButton) {
      const on = hasFlag("soundEnabled");
      soundButton.setAttribute("aria-pressed", String(on));
      soundButton.setAttribute("aria-label", on ? "Выключить звук смены" : "Включить звук смены");
    }
    if (leaveButton) {
      const held = hudLeaveLocked();
      leaveButton.disabled = held;
      leaveButton.setAttribute("aria-disabled", String(held));
      leaveButton.setAttribute(
        "aria-label",
        held ? "Выход закрыт" : "Покинуть кабинку"
      );
      leaveButton.title = held ? "Выход закрыт" : "Покинуть кабинку";
    }

    choicesEl.innerHTML = "";
    const visibleChoices = finaleReached()
      ? CLOSED_SHIFT_CHOICES
      : choicesReady(node)
        ? (node.choices || []).filter(choiceAllowed)
        : [];
    const animateChoiceReveal = node.choicesAfterClip && choiceRevealAnimationPending;
    visibleChoices.forEach((choice) => {
      const button = document.createElement("button");
      button.type = "button";
      const choiceKind = ["speech", "action", "item"].includes(choice.kind)
        ? choice.kind
        : "action";
      button.className = `pavel-booth__choice pavel-booth__choice--${choiceKind}`;
      if (animateChoiceReveal) button.classList.add("pavel-booth__choice--revealed");
      button.textContent = choice.label;
      button.addEventListener("click", () => {
        if (choice.restart) {
          restartBooth();
          return;
        }
        if (choice.leave) {
          leaveClosedShift();
          return;
        }
        const foundArtifactIds = applyFlags(choice.set || []);
        const choiceArtifactId = choice.artifactId ||
          (choice.artifact === "test-cassette-slot" ? CASSETTE_ID : null);
        if (choiceArtifactId && recordFoundArtifact(choiceArtifactId)) {
          foundArtifactIds.push(choiceArtifactId);
        }
        pendingRewardIds = [
          ...new Set([...pendingRewardIds, ...foundArtifactIds]),
        ];
        if (choice.sound) playSound(choice.sound);
        if (choice.next === save.nodeId) {
          lastRenderedNode = "";
          lineReadyNode = "";
          lastSoundNode = "";
        }
        goToNode(choice.next);
      });
      choicesEl.append(button);
    });
    choiceRevealAnimationPending = false;

    syncBoothAudio(node, save.nodeId);
    if (lastSoundNode !== save.nodeId) {
      lastSoundNode = save.nodeId;
      if (node.sound) playSound(node.sound);
    }
    scheduleGuestExit(node);
    lastRenderedNode = save.nodeId;
  };

  const startOrResume = () => {
    const resumedSave = readSave();
    save = resumedSave || createSave();
    lineReadyNode = resumedSave ? save.nodeId : "";
    lastRenderedNode = "";
    writeSave(save);
    render();
    if (resumedSave && window.matchMedia("(max-width: 520px)").matches) {
      const restoreBoothFocus = () => root?.scrollIntoView({ block: "start" });
      const queueBoothFocus = () => window.setTimeout(restoreBoothFocus, 0);
      if (document.readyState === "complete") queueBoothFocus();
      else window.addEventListener("load", queueBoothFocus, { once: true });
    }
  };

  const init = (target) => {
    const graph = content();
    root = target || document.querySelector("[data-pavel-booth]");
    if (!graph || !root || root.dataset.boothReady === "true") return;
    root.dataset.boothReady = "true";
    document.body.classList.add("pavel-booth-open");
    bindAudioUnlock();

    const still = root.querySelector("[data-booth-still]");
    if (still) {
      still.addEventListener("error", () => {
        still.hidden = true;
      });
    }

    root.querySelector("[data-booth-sound]")?.addEventListener("click", () => {
      save = save || readSave() || createSave();
      save.flags.soundEnabled = !hasFlag("soundEnabled");
      save.flags.textFallback = true;
      writeSave(save);
      if (!save.flags.soundEnabled) stopAudio();
      const currentNode = graph.nodes[save.nodeId];
      const currentClip = NODE_CLIPS[save.nodeId] || VISUAL_CLIPS[currentNode?.visual];
      const currentVideo = root.querySelector("[data-booth-video]");
      if (currentVideo) {
        currentVideo.muted = !currentClip?.audio || !hasFlag("soundEnabled");
      }
      lastSoundNode = "";
      render();
    });

    root.querySelector("[data-booth-leave]")?.addEventListener("click", () => {
      save = save || readSave() || createSave();
      const liveEl = root.querySelector("[data-booth-live]");
      if (hudLeaveLocked()) {
        if (liveEl) {
          liveEl.textContent =
            "Выход закрыт. Ты замена. Жди, пока маршрут станет безопасным.";
        }
        return;
      }
      stopAudio();
      window.location.assign("../staff.html?personnel=pavel");
    });

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        stopAudio();
        return;
      }
      if (!hasFlag("soundEnabled") || !save) return;
      const liveNode = content()?.nodes?.[save.nodeId];
      syncBoothAudio(liveNode, save.nodeId);
    });
    window.addEventListener("pagehide", stopAudio);

    startOrResume();
  };

  const destroy = () => {
    stopAudio();
    stopVideo();
    clearChoiceRevealTimer();
    clearLineTimers();
    mediaToken += 1;
    lastMediaKey = "";
    choicesUnlockedNode = "";
    choiceRevealAnimationPending = false;
    if (exitTimer) window.clearTimeout(exitTimer);
    exitTimer = null;
    document.body.classList.remove("glitching", "pavel-booth-open");
    if (root) delete root.dataset.boothReady;
    root = null;
    save = null;
    lastSoundNode = "";
    lastRenderedNode = "";
    lineReadyNode = "";
    audioUnlockBound = false;
  };

  window.TyndexPavelObservationBooth = {
    init,
    destroy,
    restart: restartBooth,
    keys: { save: SAVE_KEY, cassette: CASSETTE_ID },
  };

  const boot = () => {
    const target = document.querySelector("[data-pavel-booth]");
    if (target) init(target);
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  } else {
    boot();
  }
})();
