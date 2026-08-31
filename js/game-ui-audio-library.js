(() => {
  "use strict";

  const catalog = {
    "solnyshko.music.carnival-horror": {
      src: "assets/audio/guest/solnyshko/music-carnival-horror-loop.mp3",
      playback: "loop",
      category: "music",
    },
    "solnyshko.sfx.gate-chain": {
      src: "assets/audio/guest/solnyshko/sfx-gate-chain.mp3",
      playback: "one-shot",
      category: "metal",
    },
    "solnyshko.sfx.gate-open": {
      src: "assets/audio/guest/solnyshko/sfx-gate-open.mp3",
      playback: "one-shot",
      category: "door",
    },
    "solnyshko.sfx.carousel-mechanism": {
      src: "assets/audio/guest/solnyshko/sfx-carousel-mechanism.mp3",
      playback: "one-shot",
      category: "machine",
    },
    "solnyshko.sfx.cotton-spinner": {
      src: "assets/audio/guest/solnyshko/sfx-cotton-spinner.mp3",
      playback: "one-shot",
      category: "machine",
    },
    "solnyshko.sfx.lock-finger-taps": {
      src: "assets/audio/guest/solnyshko/sfx-lock-finger-taps.mp3",
      playback: "one-shot",
      category: "metal",
    },
    "pavel.music.tour-calm": {
      src: "assets/audio/guest/pavel/music-tour-calm-loop.mp3",
      playback: "loop",
      category: "music",
    },
    "pavel.music.drain-anxiety": {
      src: "assets/audio/guest/pavel/music-drain-anxiety-loop.mp3",
      playback: "loop",
      category: "music",
    },
    "shared.pipe.wet-gurgle": {
      src: "assets/audio/guest/pavel/sfx-drain-wet-gurgle.mp3",
      playback: "one-shot",
      category: "pipe",
    },
    "shared.drain.cleaner-pour": {
      src: "assets/audio/guest/pavel/sfx-cleaner-pour-drain.mp3",
      playback: "one-shot",
      category: "drain",
    },
    "shared.water.enclosed-slide": {
      src: "assets/audio/guest/pavel/sfx-water-slide-enclosed.mp3",
      playback: "one-shot",
      category: "water",
    },
    "shared.door.three-knocks": {
      src: "assets/audio/guest/pavel/sfx-three-knocks-service-door.mp3",
      playback: "one-shot",
      category: "door",
    },
    "pavel.voice.hm-question": {
      src: "assets/audio/guest/pavel/sfx-pavel-hm-question.mp3",
      playback: "one-shot",
      category: "voice",
    },
    "pavel.voice.mm": {
      src: "assets/audio/guest/pavel/sfx-pavel-mm.mp3",
      playback: "one-shot",
      category: "voice",
    },
    "pavel.voice.tired-exhale": {
      src: "assets/audio/guest/pavel/sfx-pavel-tired-exhale.mp3",
      playback: "one-shot",
      category: "voice",
    },
    "pavel.voice.hmm": {
      src: "assets/audio/guest/pavel/sfx-pavel-hmm.mp3",
      playback: "one-shot",
      category: "voice",
    },
    "drain.voice.damp": {
      src: "assets/audio/guest/pavel/sfx-drain-voice-damp.mp3",
      playback: "one-shot",
      category: "voice",
    },
    "drain.voice.neighbors": {
      src: "assets/audio/guest/pavel/sfx-drain-voice-neighbors.mp3",
      playback: "one-shot",
      category: "voice",
    },
    "drain.voice.hair": {
      src: "assets/audio/guest/pavel/sfx-drain-voice-hair.mp3",
      playback: "one-shot",
      category: "voice",
    },
    "drain.voice.hairy-friend": {
      src: "assets/audio/guest/pavel/sfx-drain-voice-hairy-friend.mp3",
      playback: "one-shot",
      category: "voice",
    },
    "drain.voice.lucky": {
      src: "assets/audio/guest/pavel/sfx-drain-voice-lucky.mp3",
      playback: "one-shot",
      category: "voice",
    },
    "drain.voice.shift": {
      src: "assets/audio/guest/pavel/sfx-drain-voice-shift.mp3",
      playback: "one-shot",
      category: "voice",
    },
    "drain.voice.slide": {
      src: "assets/audio/guest/pavel/sfx-drain-voice-slide.mp3",
      playback: "one-shot",
      category: "voice",
    },
    "drain.voice.thirst": {
      src: "assets/audio/guest/pavel/sfx-drain-voice-thirst.mp3",
      playback: "one-shot",
      category: "voice",
    },
    "drain.voice.cleaner-request": {
      src: "assets/audio/guest/pavel/sfx-drain-voice-cleaner-request.mp3",
      playback: "one-shot",
      category: "voice",
    },
    "drain.voice.cleaner-delight": {
      src: "assets/audio/guest/pavel/sfx-drain-voice-cleaner-delight.mp3",
      playback: "one-shot",
      category: "voice",
    },
    "drain.voice.thanks-zone": {
      src: "assets/audio/guest/pavel/sfx-drain-voice-thanks-zone.mp3",
      playback: "one-shot",
      category: "voice",
    },
    "drain.voice.aromatization": {
      src: "assets/audio/guest/pavel/sfx-drain-voice-aromatization.mp3",
      playback: "one-shot",
      category: "voice",
    },
    "pavel.voice.conductor-dessert": {
      src: "assets/audio/guest/pavel/sfx-hatch-dessert-voice.mp3",
      playback: "one-shot",
      category: "voice",
    },
    "shared.bed.empty-room": {
      src: "assets/audio/guest/red-room/shift/bed-empty.mp3",
      playback: "loop",
      category: "music",
    },
    "shared.door.movement": {
      src: "assets/audio/guest/red-room/shift/sfx-door.mp3",
      playback: "one-shot",
      category: "door",
    },
    "shared.metal.cabinet-latch": {
      src: "assets/audio/guest/red-room/shift/sfx-key-cabinet.mp3",
      playback: "one-shot",
      category: "metal",
    },
    "shared.metal.key-ring": {
      src: "assets/audio/guest/red-room/shift/sfx-key-ring.mp3",
      playback: "one-shot",
      category: "metal",
    },
    "shared.paper.unfold": {
      src: "assets/audio/guest/red-room/shift/sfx-paper-unfold.mp3",
      playback: "one-shot",
      category: "paper",
    },
    "shared.phone.buzz": {
      src: "assets/audio/guest/red-room/shift/sfx-phone-buzz.mp3",
      playback: "one-shot",
      category: "phone",
    },
    "shared.cctv.static": {
      src: "assets/audio/staff/cctv/channel-static.mp3",
      playback: "one-shot",
      category: "cctv",
    },
    "shared.control.click": {
      src: "assets/audio/staff/cctv/remote-button-click.mp3",
      playback: "one-shot",
      category: "control",
    },
    "curator.child-laugh-distant": {
      src: "assets/audio/curator/sfx/child-laugh-distant.mp3",
      playback: "one-shot",
      category: "voice",
    },
    "curator.child-laugh-close": {
      src: "assets/audio/curator/sfx/child-laugh-close.mp3",
      playback: "one-shot",
      category: "voice",
    },
  };

  const resolve = (id, base = "../") => {
    const entry = catalog[id];
    if (!entry) return null;
    const prefix = String(base || "").replace(/\/?$/, "/");
    return {
      ...entry,
      id,
      href: `${prefix}${entry.src}`,
    };
  };

  window.TyndexGameUiAudioLibrary = {
    version: 1,
    catalog,
    resolve,
  };
})();
