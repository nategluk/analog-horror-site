(() => {
  "use strict";

  const STORAGE_KEY = "tyndex_solnyshko_cotton_v1";
  const STORAGE_VERSION = 1;
  const PREP_SUGAR_MS = 480;
  const FLAVOR_LINES = [
    "Сахар ещё тёплый.",
    "Запах не выветривается.",
    "Браслет помнит этот вечер.",
  ];
  const SOUND_FILES = {
    spin: "sfx-cotton-spinner.mp3",
  };
  const SCRIPT_URL = document.currentScript?.src || window.location.href;

  const prefersReducedMotion = () =>
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const soundUrl = (file) => {
    try {
      return new URL(`../assets/audio/guest/solnyshko/${file}`, SCRIPT_URL).href;
    } catch (error) {
      return `../assets/audio/guest/solnyshko/${file}`;
    }
  };

  const wait = (duration, signal) =>
    new Promise((resolve) => {
      const ms = prefersReducedMotion() ? 0 : duration;
      if (ms <= 0) {
        resolve();
        return;
      }
      const timer = window.setTimeout(() => {
        signal?.removeEventListener("abort", onAbort);
        resolve();
      }, ms);
      const onAbort = () => {
        window.clearTimeout(timer);
        resolve();
      };
      if (signal) {
        if (signal.aborted) {
          window.clearTimeout(timer);
          resolve();
          return;
        }
        signal.addEventListener("abort", onAbort, { once: true });
      }
    });

  const readSave = () => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return { completed: false };
      const parsed = JSON.parse(raw);
      if (!parsed || parsed.v !== STORAGE_VERSION) return { completed: false };
      return { completed: parsed.completed === true };
    } catch (error) {
      return { completed: false };
    }
  };

  const writeSave = () => {
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ v: STORAGE_VERSION, completed: true })
      );
    } catch (error) {
      /* persistence is optional */
    }
  };

  const pickFlavor = () =>
    FLAVOR_LINES[Math.floor(Math.random() * FLAVOR_LINES.length)];

  const setHidden = (node, hidden) => {
    if (!node) return;
    node.hidden = hidden;
  };

  const applySettledFx = (view) => {
    if (view.phase === "spinning") return;
    const settled =
      view.phase === "ready" || view.phase === "warm" || view.phase === "reading";
    view.lamp = settled || view.phase === "sugar";
    view.cotton = settled ? "full" : view.sugar ? "none" : "none";
    if (view.phase === "sugar") view.cotton = "none";
    if (view.phase === "idle") view.cotton = "none";
    view.band = settled;
  };

  const renderMachine = (root, view) => {
    const settled =
      view.phase === "ready" || view.phase === "warm" || view.phase === "reading";

    root.dataset.phase = view.phase;
    root.classList.toggle("is-sugar", view.sugar);
    root.classList.toggle("is-lamp", view.lamp === true);
    root.classList.toggle("is-spinning", view.phase === "spinning");
    root.classList.toggle("is-cotton", view.cotton === "full" || view.cotton === "growing");
    root.classList.toggle("is-cotton-growing", view.cotton === "growing");
    root.classList.toggle("is-band", view.band === true || settled);
    root.classList.toggle("is-warm", view.phase === "warm" || view.phase === "reading");
    root.classList.toggle("is-busy", view.busy === true);
  };

  const renderCopy = (root, view) => {
    const title = root.querySelector("[data-sp-title]");
    const sub = root.querySelector("[data-sp-sub]");
    const status = root.querySelector("[data-sp-status]");
    const receipt = root.querySelector("[data-sp-receipt]");
    const flavor = root.querySelector("[data-sp-flavor]");
    const live = root.querySelector("[data-sp-live]");
    const actions = root.querySelector("[data-sp-actions]");

    const warmIdle = view.phase === "warm" || view.phase === "reading";
    if (title) {
      title.textContent = warmIdle ? "Аппарат ещё тёплый" : "Аппарат ваты СВ-312";
    }
    if (sub) {
      sub.textContent = warmIdle ? "На лотке лежит браслет до закрытия." : "";
      setHidden(sub, !warmIdle);
    }

    const sugarText = view.sugar ? "засыпан" : "нет";
    const drumText =
      view.phase === "spinning" ? "крутится" : view.cotton === "full" ? "готов" : "стоп";
    const cottonText =
      view.cotton === "growing" ? "нарастает" : view.cotton === "full" ? "готова" : "нет";
    if (status) {
      status.replaceChildren(
        ...[
          `Сахар: ${sugarText}`,
          `Барабан: ${drumText}`,
          `Вата: ${cottonText}`,
        ].map((line) => {
          const span = document.createElement("span");
          span.textContent = line;
          return span;
        })
      );
    }

    setHidden(receipt, view.phase !== "ready" && view.phase !== "reading");
    if (flavor) {
      flavor.textContent = view.flavor || "";
      setHidden(flavor, !view.flavor);
    }

    if (actions) {
      const buttons = [];
      if (view.phase === "idle" && view.busy) {
        buttons.push({ act: "sugar", label: "Засыпаем сахар…", disabled: true });
      } else if (view.phase === "idle") {
        buttons.push({ act: "sugar", label: "Засыпать сахар" });
      } else if (view.phase === "sugar" && view.busy) {
        buttons.push({ act: "spin", label: "Запускаем барабан…", disabled: true });
      } else if (view.phase === "sugar") {
        buttons.push({ act: "spin", label: "Включить барабан" });
      } else if (view.phase === "spinning") {
        buttons.push({ act: "spin", label: "Вата нарастает…", disabled: true });
      } else if (view.phase === "ready") {
        buttons.push({ act: "take", label: "Снять вату" });
      } else {
        buttons.push({ act: "enter", label: "Остаться до закрытия" });
        buttons.push({ act: "read", label: "Прочитать браслет" });
        buttons.push({ act: "replay", label: "Приготовить ещё" });
      }

      actions.replaceChildren(
        ...buttons.map((item) => {
          const button = document.createElement("button");
          button.type = "button";
          button.className = "sp-cotton-btn";
          button.dataset.spAct = item.act;
          button.textContent = item.label;
          if (item.disabled || view.busy) button.disabled = true;
          return button;
        })
      );
    }

    if (live) {
      const parts = [`${title ? title.textContent : "Аппарат ваты СВ-312"}.`];
      if (sub && !sub.hidden) parts.push(sub.textContent);
      parts.push(`Сахар: ${sugarText}. Барабан: ${drumText}. Вата: ${cottonText}.`);
      if (receipt && !receipt.hidden) {
        parts.push("Гость до закрытия. Парк не выключает огни. Пройдите к воротам.");
      }
      if (view.flavor) parts.push(view.flavor);
      live.textContent = parts.join(" ");
    }
  };

  const createView = (completed) => {
    const view = completed
      ? {
          phase: "warm",
          sugar: true,
          cotton: "full",
          busy: false,
          flavor: "",
          replaying: false,
          completed: true,
          lamp: false,
          band: true,
        }
      : {
          phase: "idle",
          sugar: false,
          cotton: "none",
          busy: false,
          flavor: "",
          replaying: false,
          completed: false,
          lamp: false,
          band: false,
        };
    applySettledFx(view);
    return view;
  };

  const paint = (root, view) => {
    renderMachine(root, view);
    renderCopy(root, view);
  };

  const init = (root) => {
    const target = root || document.querySelector("[data-solnyshko-cotton]");
    if (!target) return;

    if (target._spCottonAbort) target._spCottonAbort.abort();
    const abort = new AbortController();
    target._spCottonAbort = abort;

    const view = createView(readSave().completed);
    let spinToken = 0;
    let currentAudio = null;
    const motionVideo = target.querySelector("[data-sp-video]");

    const stopCue = () => {
      if (!currentAudio) return;
      currentAudio.pause();
      currentAudio.src = "";
      currentAudio = null;
    };

    const resetMotionMedia = () => {
      target.classList.remove("is-video-ready", "is-media-fallback");
      if (!motionVideo) return;
      motionVideo.pause();
      try {
        motionVideo.currentTime = 0;
      } catch (error) {
        /* the media may not have metadata yet */
      }
    };

    const playMotion = () =>
      new Promise((resolve) => {
        if (!motionVideo || prefersReducedMotion()) {
          target.classList.add("is-media-fallback");
          resolve("fallback");
          return;
        }

        let settled = false;
        let timer = 0;

        const onEnded = () => finish("ended");
        const onError = () => finish("error");
        const onPlaying = () => target.classList.add("is-video-ready");
        const onAbort = () => finish("aborted");
        const cleanup = () => {
          window.clearTimeout(timer);
          motionVideo.removeEventListener("ended", onEnded);
          motionVideo.removeEventListener("error", onError);
          motionVideo.removeEventListener("playing", onPlaying);
          abort.signal.removeEventListener("abort", onAbort);
        };
        const finish = (result) => {
          if (settled) return;
          settled = true;
          cleanup();
          if (result !== "ended") {
            target.classList.add("is-media-fallback");
            target.classList.remove("is-video-ready");
            motionVideo.pause();
          }
          resolve(result);
        };

        target.classList.remove("is-video-ready", "is-media-fallback");
        motionVideo.addEventListener("ended", onEnded);
        motionVideo.addEventListener("error", onError);
        motionVideo.addEventListener("playing", onPlaying);
        abort.signal.addEventListener("abort", onAbort, { once: true });

        try {
          motionVideo.muted = true;
          motionVideo.playsInline = true;
          motionVideo.pause();
          motionVideo.currentTime = 0;
          motionVideo.load();
          const playPromise = motionVideo.play();
          if (playPromise && typeof playPromise.catch === "function") {
            playPromise.catch(() => finish("error"));
          }
        } catch (error) {
          finish("error");
          return;
        }

        timer = window.setTimeout(() => finish("timeout"), 6500);
      });

    const playCue = (name) => {
      if (prefersReducedMotion()) return;
      const file = SOUND_FILES[name];
      if (!file) return;
      stopCue();
      const audio = new Audio(soundUrl(file));
      audio.preload = "auto";
      audio.volume = 0.52;
      currentAudio = audio;
      const play = audio.play();
      if (play && typeof play.catch === "function") play.catch(() => {});
    };

    abort.signal.addEventListener(
      "abort",
      () => {
        stopCue();
        resetMotionMedia();
      },
      { once: true }
    );

    const paintView = () => paint(target, view);

    resetMotionMedia();
    paintView();

    const stillCurrent = (token) =>
      token === spinToken && target.isConnected && !abort.signal.aborted;

    const startPrep = (replay) => {
      spinToken += 1;
      stopCue();
      resetMotionMedia();
      view.phase = "idle";
      view.sugar = false;
      view.cotton = "none";
      view.busy = false;
      view.flavor = "";
      view.replaying = replay;
      view.band = false;
      applySettledFx(view);
      paintView();
    };

    const finishSpin = () => {
      view.busy = false;
      view.cotton = "full";
      view.band = true;
      if (view.replaying || view.completed) {
        view.phase = "warm";
        view.flavor = pickFlavor();
        view.completed = true;
        view.replaying = false;
        writeSave();
      } else {
        view.phase = "ready";
        view.flavor = "";
      }
      applySettledFx(view);
      paintView();
    };

    const enterHours = () => {
      stopCue();
      resetMotionMedia();
      view.busy = true;
      writeSave();
      paintView();
      const href = new URL(
        target.getAttribute("data-hours-entry") || "solnyshko-after-hours.html",
        window.location.href
      ).href;
      const reducedMotion = prefersReducedMotion();
      const veil = document.createElement("div");
      veil.className = "sp-cotton-assign";
      veil.setAttribute("role", "status");
      veil.innerHTML =
        "<div><p>ПАРК НЕ ЗАКРЫВАЕТСЯ</p><p>БРАСЛЕТ: ГОСТЬ ДО ЗАКРЫТИЯ</p></div>";
      document.body.append(veil);
      window.setTimeout(() => {
        veil.innerHTML = "<div><p>ВОРОТА ЖДУТ</p><p>ЗАПАХ ВАТЫ УЖЕ ЗА РЕШЁТКОЙ.</p></div>";
      }, reducedMotion ? 0 : 650);
      window.setTimeout(() => {
        window.location.assign(href);
      }, reducedMotion ? 280 : 1600);
    };

    const runSpin = async (token) => {
      const firstBatch = !view.replaying && !view.completed;
      view.phase = "spinning";
      view.busy = true;
      view.flavor = "";
      view.cotton = "growing";
      view.lamp = true;
      view.band = false;
      resetMotionMedia();
      paintView();
      playCue("spin");

      const motionResult = await playMotion();
      if (!stillCurrent(token)) return;
      if (motionResult !== "ended") {
        await wait(firstBatch ? 1800 : 900, abort.signal);
        if (!stillCurrent(token)) return;
      }
      finishSpin();
    };

    target.addEventListener(
      "click",
      async (event) => {
        const button = event.target.closest("[data-sp-act]");
        if (!button || !target.contains(button) || view.busy) return;

        const act = button.dataset.spAct;
        if (act === "sugar" && view.phase === "idle") {
          const token = ++spinToken;
          view.busy = true;
          view.sugar = true;
          paintView();
          await wait(PREP_SUGAR_MS, abort.signal);
          if (!stillCurrent(token)) return;
          view.phase = "sugar";
          view.busy = false;
          applySettledFx(view);
          paintView();
          return;
        }

        if (act === "spin" && view.phase === "sugar") {
          await runSpin(++spinToken);
          return;
        }

        if (act === "take" && view.phase === "ready") {
          view.completed = true;
          writeSave();
          enterHours();
          return;
        }

        if (act === "enter" && (view.phase === "warm" || view.phase === "reading")) {
          enterHours();
          return;
        }

        if (act === "read" && (view.phase === "warm" || view.phase === "reading")) {
          view.phase = "reading";
          applySettledFx(view);
          paintView();
          return;
        }

        if (act === "replay" && (view.phase === "warm" || view.phase === "reading")) {
          startPrep(true);
        }
      },
      { signal: abort.signal }
    );
  };

  window.TyndexSolnyshkoCotton = { init };

  if (document.querySelector("[data-solnyshko-cotton]")) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => init(), { once: true });
    } else {
      init();
    }
  }
})();
