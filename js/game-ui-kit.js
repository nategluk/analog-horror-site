(() => {
  "use strict";

  const reduceMotionQuery = () => window.matchMedia("(prefers-reduced-motion: reduce)");

  const createSaveAdapter = ({ key, version = 1, normalize } = {}) => {
    const read = () => {
      try {
        const raw = JSON.parse(localStorage.getItem(key));
        if (!raw || raw.version !== version) return null;
        return typeof normalize === "function" ? normalize(raw) : raw;
      } catch {
        return null;
      }
    };
    const write = (save) => {
      save.version = version;
      save.updatedAt = Date.now();
      localStorage.setItem(key, JSON.stringify(save));
      return save;
    };
    const reset = () => {
      localStorage.removeItem(key);
    };
    return { key, version, read, write, reset };
  };

  const createLineRenderer = (root) => {
    const panel = root.querySelector("[data-game-ui-panel]");
    const speakerEl = root.querySelector("[data-game-ui-speaker]");
    const lineEl = root.querySelector("[data-game-ui-line]");
    const actionEl = root.querySelector("[data-game-ui-action]");
    const liveEl = root.querySelector("[data-game-ui-live]");
    let timer = 0;
    let onAdvance = null;

    const clear = () => {
      window.clearInterval(timer);
      timer = 0;
      lineEl?.classList.remove("is-typing");
      lineEl?.removeEventListener("click", advance);
      lineEl?.removeEventListener("keydown", onKey);
    };

    const advance = (event) => {
      event?.stopPropagation?.();
      if (!onAdvance) return;
      onAdvance();
    };

    const onKey = (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        advance();
      }
    };

    const render = ({ kind = "dialogue", speaker = "", line = "", action = "", live, typewriter = false } = {}) => {
      clear();
      if (panel) panel.dataset.textKind = kind;
      if (speakerEl) speakerEl.textContent = speaker;
      if (actionEl) actionEl.textContent = action || "";
      if (liveEl && live !== undefined) liveEl.textContent = live || "";
      if (!lineEl) return;
      const full = String(line || "");
      if (!typewriter || reduceMotionQuery().matches) {
        lineEl.textContent = full;
        return;
      }
      lineEl.textContent = "";
      lineEl.classList.add("is-typing");
      let index = 0;
      timer = window.setInterval(() => {
        index += 1;
        lineEl.textContent = full.slice(0, index);
        if (index >= full.length) {
          clear();
        }
      }, 16);
    };

    const setAdvance = (handler) => {
      onAdvance = handler;
      if (!lineEl) return;
      if (handler) {
        lineEl.tabIndex = 0;
        lineEl.addEventListener("click", advance);
        lineEl.addEventListener("keydown", onKey);
      }
    };

    return { render, setAdvance, clear };
  };

  const createChoiceRenderer = (root, { onPick, maxVisible = 4 } = {}) => {
    const host = root.querySelector("[data-game-ui-choices]");
    let group = "";

    const visibleSet = (choices) => {
      const list = (choices || []).filter((choice) => choice && choice.hidden !== true);
      if (group) {
        const nested = list.filter((choice) => choice.group === group && choice.variant !== "group");
        const back = list.find((choice) => choice.variant === "back") || { label: "НАЗАД", variant: "back" };
        return [...nested, back].slice(0, maxVisible);
      }
      const top = [];
      const seenGroups = new Set();
      list.forEach((choice) => {
        if (choice.variant === "back") return;
        if (choice.group && choice.variant !== "group") return;
        if (choice.variant === "group") {
          if (seenGroups.has(choice.group || choice.label)) return;
          seenGroups.add(choice.group || choice.label);
        }
        top.push(choice);
      });
      return top.slice(0, maxVisible);
    };

    const render = (choices, { reveal = false } = {}) => {
      if (!host) return [];
      host.replaceChildren();
      const visible = visibleSet(choices);
      visible.forEach((choice) => {
        const button = document.createElement("button");
        button.type = "button";
        button.dataset.variant = choice.variant || "action";
        button.textContent = choice.label || "";
        button.disabled = Boolean(choice.disabled || choice.loading);
        if (reveal) button.classList.add("is-revealed");
        button.addEventListener("click", (event) => {
          event.stopPropagation();
          if (choice.variant === "group") {
            group = choice.group || "";
            render(choices, { reveal: false });
            focusFirst(root);
            return;
          }
          if (choice.variant === "back") {
            group = "";
            render(choices, { reveal: false });
            focusFirst(root);
            return;
          }
          onPick?.(choice);
        });
        host.append(button);
      });
      return visible;
    };

    const resetGroup = () => {
      group = "";
    };

    return { render, resetGroup, visibleSet };
  };

  const stillFrom = (clip = {}, fallbackStill) =>
    clip.holdStill || clip.still || clip.startStill || fallbackStill || "";

  const createMediaController = (root, { onTransitionEnd, onError, watchdogMs = 15000 } = {}) => {
    const still = root.querySelector("[data-game-ui-still]");
    const video = root.querySelector("[data-game-ui-video]");
    const stage = root.querySelector("[data-game-ui-stage]");
    let token = 0;
    let watchdog = 0;

    let muted = true;

    const hideVideoFrame = () => {
      if (!video) return;
      video.classList.remove("is-playing");
    };

    const armInline = () => {
      if (!video) return;
      video.playsInline = true;
      video.setAttribute("playsinline", "");
      video.setAttribute("webkit-playsinline", "");
      video.preload = "auto";
      video.muted = muted;
      video.defaultMuted = muted;
      if (muted) video.setAttribute("muted", "");
      else video.removeAttribute("muted");
    };

    const showStill = (src, alt) => {
      hideVideoFrame();
      if (still && src) {
        still.src = src;
        still.alt = alt || "";
        still.hidden = false;
      }
    };

    const stopVideo = () => {
      window.clearTimeout(watchdog);
      if (!video) return;
      hideVideoFrame();
      video.pause();
      video.removeAttribute("src");
      video.load();
    };

    const fail = (src, context) => {
      showStill(src);
      onError?.(context);
    };

    const apply = (descriptor = {}, { flags = {}, role = "neutral", reduceMotion, muted: mutedOpt } = {}) => {
      if (mutedOpt !== undefined) muted = Boolean(mutedOpt);
      const motionOff = reduceMotion ?? reduceMotionQuery().matches;
      const fallbackStill = descriptor.fallback?.still || stillFrom(descriptor.neutral);
      const alt = descriptor.alt || "";
      if (stage && descriptor.id) stage.dataset.visual = descriptor.id;
      token += 1;
      const run = token;
      stopVideo();

      const played = (clip) => clip?.playedFlag && flags[clip.playedFlag];
      let clip = descriptor[role] || descriptor.neutral || descriptor.fallback || {};
      if ((role === "transition" || role === "burst") && played(clip)) {
        clip = descriptor.active || descriptor.neutral || { still: clip.holdStill };
        role = clip === descriptor.active ? "active" : "neutral";
      }
      if (motionOff || !clip.src) {
        showStill(stillFrom(clip, fallbackStill), alt);
        if (role === "transition") onTransitionEnd?.({ skipped: true, flags });
        return { role, token: run };
      }

      const plate = clip.startStill || clip.still || fallbackStill;
      showStill(plate, alt);
      armInline();
      video.loop = role === "neutral" || role === "active";
      if (plate) video.poster = plate;
      else video.removeAttribute("poster");
      video.hidden = false;
      video.src = clip.src;

      const settleError = () => {
        if (run !== token) return;
        window.clearTimeout(watchdog);
        fail(stillFrom(clip, fallbackStill), { clip, role, flags, token: run });
      };
      const reveal = () => {
        if (run !== token) return;
        video.classList.add("is-playing");
      };
      video.addEventListener("error", settleError, { once: true });
      video.addEventListener("playing", reveal, { once: true });
      const play = () => {
        if (run !== token) return;
        const attempt = video.play();
        if (!attempt || typeof attempt.catch !== "function") return;
        attempt.catch(() => {
          if (run !== token) return;
          if (!video.muted) {
            video.muted = true;
            video.defaultMuted = true;
            video.setAttribute("muted", "");
            video.play().catch(settleError);
            return;
          }
          settleError();
        });
      };
      play();
      if (video.readyState < 2) {
        video.addEventListener("loadeddata", play, { once: true });
        video.addEventListener("canplay", play, { once: true });
      }

      if (role === "transition" || role === "burst" || clip.playback === "one-shot") {
        video.loop = false;
        video.addEventListener("ended", () => {
          if (run !== token) return;
          window.clearTimeout(watchdog);
          if (clip.holdStill) showStill(clip.holdStill, alt);
          else if (role === "burst") apply(descriptor, { flags, role: "active" });
          onTransitionEnd?.({ clip, flags });
        }, { once: true });
        watchdog = window.setTimeout(settleError, watchdogMs);
      }
      return { role, token: run };
    };

    const setMuted = (next) => {
      muted = Boolean(next);
      if (!video) return;
      video.muted = muted;
      video.defaultMuted = muted;
      if (muted) video.setAttribute("muted", "");
      else video.removeAttribute("muted");
    };

    return { apply, stop: stopVideo, showStill, setMuted };
  };

  const fadeTo = (audio, volume, done) => {
    if (!audio) {
      done?.();
      return;
    }
    const start = audio.volume;
    const t0 = performance.now();
    const tick = (now) => {
      const t = Math.min(1, (now - t0) / 400);
      audio.volume = start + (volume - start) * t;
      if (t < 1) {
        requestAnimationFrame(tick);
        return;
      }
      done?.();
    };
    requestAnimationFrame(tick);
  };

  const createAudioRack = ({ beds = {}, cues = {}, resolve } = {}) => {
    let unlocked = false;
    let bedEl = null;
    let bedName = "";
    let cueEl = null;
    const library = resolve || window.TyndexGameUiAudioLibrary?.resolve;

    const href = (id) => library?.(id)?.href || beds[id]?.src || cues[id]?.src || "";

    const stopElement = (el) => {
      if (!el) return;
      el.pause();
      el.removeAttribute("src");
      el.load();
    };

    const unlock = () => {
      unlocked = true;
    };

    const setBed = (id) => {
      if (!unlocked || !id) {
        if (bedEl) {
          const outgoing = bedEl;
          bedEl = null;
          bedName = "";
          fadeTo(outgoing, 0, () => stopElement(outgoing));
        }
        return;
      }
      if (bedName === id && bedEl && !bedEl.paused) return;
      const src = href(beds[id]?.id || id);
      if (!src) return;
      const previous = bedEl;
      const next = new Audio(src);
      next.loop = true;
      next.volume = 0;
      bedEl = next;
      bedName = id;
      next.play().catch(() => {});
      fadeTo(next, beds[id]?.volume ?? 0.18);
      if (previous) fadeTo(previous, 0, () => stopElement(previous));
    };

    const playCue = (id) => {
      stopElement(cueEl);
      cueEl = null;
      if (!unlocked || !id) return;
      const spec = cues[id] || {};
      const src = href(spec.id || id);
      if (!src) return;
      const audio = new Audio(src);
      audio.volume = spec.volume ?? 0.6;
      cueEl = audio;
      audio.play().catch(() => {});
    };

    const stop = () => {
      setBed("");
      stopElement(cueEl);
      cueEl = null;
    };

    const onHide = () => stop();
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) onHide();
    });
    window.addEventListener("pagehide", onHide);

    return { unlock, setBed, playCue, stop, get unlocked() { return unlocked; } };
  };

  const focusFirst = (root) => {
    const target =
      root.querySelector("[data-game-ui-choices] button:not([disabled])") ||
      root.querySelector("[data-game-ui-line]");
    target?.focus();
  };

  const bindShell = (root, options = {}) => {
    if (!root) return null;
    document.body.classList.add("game-ui-open");
    return {
      root,
      line: createLineRenderer(root),
      choices: createChoiceRenderer(root, options.choices),
      media: createMediaController(root, options.media),
      focusFirst: () => focusFirst(root),
    };
  };

  window.TyndexGameUi = {
    bindShell,
    createSaveAdapter,
    createLineRenderer,
    createChoiceRenderer,
    createMediaController,
    createAudioRack,
    focusFirst,
  };
})();
