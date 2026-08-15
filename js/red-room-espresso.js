(() => {
  "use strict";

  const STORAGE_KEY = "tyndex_red_room_espresso_v1";
  const STORAGE_VERSION = 1;
  const PREP_WATER_MS = 520;
  const PREP_BEANS_MS = 420;
  const FLAVOR_LINES = [
    "Вторая чашка предназначена сотруднику.",
    "На поверхности кофе отражается красная штора.",
    "Машина помнит предыдущую смену.",
  ];
  const SOUND_FILES = {
    water: "espresso-water.mp3",
    beans: "espresso-beans.mp3",
    pump: "espresso-pump.mp3",
    pour: "espresso-pour.mp3",
    receipt: "espresso-receipt.mp3",
  };
  const SCRIPT_URL = document.currentScript?.src || window.location.href;

  const prefersReducedMotion = () =>
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const soundUrl = (file) => {
    try {
      return new URL(`../assets/audio/guest/red-room/${file}`, SCRIPT_URL).href;
    } catch (error) {
      return `../assets/audio/guest/red-room/${file}`;
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
    if (view.phase === "brewing") return;
    const settled =
      view.phase === "ready" || view.phase === "reading" || view.phase === "warm";
    view.lamp = settled;
    view.steam = view.phase === "ready";
    view.pressureOn = view.phase === "ready";
    view.pressureText = view.phase === "ready" ? "рабочее" : "0";
  };

  const renderMachine = (root, view) => {
    const settled =
      view.phase === "ready" || view.phase === "reading" || view.phase === "warm";

    root.dataset.phase = view.phase;
    root.classList.toggle("is-water", view.water);
    root.classList.toggle("is-beans", view.beans);
    root.classList.toggle("is-lamp", view.lamp === true);
    root.classList.toggle("is-steam", view.steam === true);
    root.classList.toggle("is-pressure", view.pressureOn === true);
    root.classList.toggle("is-cup", view.cup === "full");
    root.classList.toggle("is-receipt", settled);
    root.classList.toggle("is-warm", view.phase === "warm" || view.phase === "reading");
    root.classList.toggle("is-busy", view.busy === true);
  };

  const pressureLabel = (view) => view.pressureText || "0";

  const renderCopy = (root, view, options = {}) => {
    const title = root.querySelector("[data-rr-title]");
    const sub = root.querySelector("[data-rr-sub]");
    const status = root.querySelector("[data-rr-status]");
    const receipt = root.querySelector("[data-rr-receipt]");
    const flavor = root.querySelector("[data-rr-flavor]");
    const live = root.querySelector("[data-rr-live]");
    const actions = root.querySelector("[data-rr-actions]");

    const warmIdle = view.phase === "warm" || view.phase === "reading";
    if (title) title.textContent = warmIdle ? "Кофемашина ещё тёплая" : "Кофемашина КК-312";
    if (sub) {
      sub.textContent = warmIdle ? "На поддоне лежит служебный чек." : "";
      setHidden(sub, !warmIdle);
    }

    const waterText = view.water ? "норма" : "не проверена";
    const beansText = view.beans ? "загружено" : "нет";
    const pressureText = pressureLabel(view);
    if (status) {
      status.replaceChildren(
        ...[
          `Вода: ${waterText}`,
          `Зерно: ${beansText}`,
          `Давление: ${pressureText}`,
        ].map((line) => {
          const span = document.createElement("span");
          span.textContent = line;
          return span;
        })
      );
    }

    const shiftMode = options.mode === "shift";
    setHidden(receipt, shiftMode || (view.phase !== "ready" && view.phase !== "reading"));
    if (flavor) {
      flavor.textContent = view.flavor || "";
      setHidden(flavor, !view.flavor);
    }

    if (actions) {
      const buttons = [];
      if (view.phase === "idle" && view.busy) {
        buttons.push({ act: "water", label: "Проверяем воду…", disabled: true });
      } else if (view.phase === "idle") {
        buttons.push({ act: "water", label: "Проверить воду" });
      } else if (view.phase === "water" && view.busy) {
        buttons.push({ act: "beans", label: "Засыпаем зерно…", disabled: true });
      } else if (view.phase === "water") {
        buttons.push({ act: "beans", label: "Засыпать зерно" });
      } else if (view.phase === "beans") {
        buttons.push({ act: "brew", label: "Включить кофемашину" });
      } else if (view.phase === "brewing") {
        buttons.push({ act: "brew", label: "Готовится…", disabled: true });
      } else if (view.phase === "ready" && shiftMode) {
        buttons.push({ act: "serve", label: "Поставить кофе перед Псом" });
      } else if (view.phase === "ready") {
        buttons.push({ act: "take", label: "Забрать чек" });
      } else {
        buttons.push({ act: "staff", label: "Пройти в персонал" });
        buttons.push({ act: "read", label: "Прочитать чек" });
        buttons.push({ act: "replay", label: "Приготовить ещё" });
      }

      actions.replaceChildren(
        ...buttons.map((item) => {
          const button = document.createElement("button");
          button.type = "button";
          button.className = "rr-espresso-btn";
          button.dataset.rrAct = item.act;
          button.textContent = item.label;
          if (item.disabled || view.busy) button.disabled = true;
          return button;
        })
      );
    }

    if (live) {
      const parts = [`${title ? title.textContent : "Кофемашина КК-312"}.`];
      if (sub && !sub.hidden) parts.push(sub.textContent);
      parts.push(`Вода: ${waterText}. Зерно: ${beansText}. Давление: ${pressureText}.`);
      if (!shiftMode && receipt && !receipt.hidden) {
        parts.push("Эспрессо готов. Служебный идентификатор куратора разблокирован. Проследуйте в раздел «Персонал».");
      }
      if (view.flavor) parts.push(view.flavor);
      live.textContent = parts.join(" ");
    }
  };

  const createView = (completed) => {
    const view = completed
      ? {
          phase: "warm",
          water: true,
          beans: true,
          cup: "full",
          busy: false,
          flavor: "",
          replaying: false,
          completed: true,
          lamp: false,
          steam: false,
          pressureOn: false,
          pressureText: "0",
        }
      : {
          phase: "idle",
          water: false,
          beans: false,
          cup: "empty",
          busy: false,
          flavor: "",
          replaying: false,
          completed: false,
          lamp: false,
          steam: false,
          pressureOn: false,
          pressureText: "0",
        };
    applySettledFx(view);
    return view;
  };

  const paint = (root, view, options = {}) => {
    renderMachine(root, view);
    renderCopy(root, view, options);
  };

  const init = (root, options = {}) => {
    const target = root || document.querySelector("[data-red-room-espresso]");
    if (!target) return;

    if (target._rrEspressoAbort) target._rrEspressoAbort.abort();
    const abort = new AbortController();
    target._rrEspressoAbort = abort;

    const view = createView(options.forceFresh ? false : readSave().completed);
    let brewToken = 0;
    let currentAudio = null;

    const stopCue = () => {
      if (!currentAudio) return;
      currentAudio.pause();
      currentAudio.src = "";
      currentAudio = null;
    };

    const playCue = (name) => {
      if (prefersReducedMotion()) return;
      const file = SOUND_FILES[name];
      if (!file) return;
      stopCue();
      const audio = new Audio(soundUrl(file));
      audio.preload = "auto";
      audio.volume = 0.58;
      currentAudio = audio;
      const play = audio.play();
      if (play && typeof play.catch === "function") play.catch(() => {});
    };

    abort.signal.addEventListener("abort", () => stopCue(), { once: true });

    const paintView = () => paint(target, view, options);

    paintView();

    const stillCurrent = (token) =>
      token === brewToken && target.isConnected && !abort.signal.aborted;

    const startPrep = (replay) => {
      brewToken += 1;
      stopCue();
      view.phase = "idle";
      view.water = false;
      view.beans = false;
      view.cup = "empty";
      view.busy = false;
      view.flavor = "";
      view.replaying = replay;
      applySettledFx(view);
      paintView();
    };

    const finishBrew = () => {
      view.busy = false;
      view.cup = "full";
      if (view.replaying || view.completed) {
        view.phase = "warm";
        view.flavor = pickFlavor();
        view.completed = true;
        view.replaying = false;
        if (options.persist !== false) writeSave();
      } else {
        view.phase = "ready";
        view.flavor = "";
      }
      applySettledFx(view);
      paintView();
    };

    const playModeGlitchSound = () => {
      const audio = new Audio(
        new URL("../assets/audio/glitch-transition.wav", SCRIPT_URL).href
      );
      audio.preload = "auto";
      audio.volume = 0.42;
      const play = audio.play();
      if (play && typeof play.catch === "function") play.catch(() => {});
    };

    const enterStaff = () => {
      stopCue();
      view.busy = true;
      paintView();
      const href = new URL(
        target.getAttribute("data-staff-entry") || "../staff.html",
        window.location.href
      ).href;
      if (typeof window.TyndexSiteFx?.enterStaff === "function") {
        window.TyndexSiteFx.enterStaff(href);
        return;
      }
      try {
        window.localStorage.setItem("tyndex_mode", "staff");
      } catch (error) {
        /* mode persistence is optional */
      }
      playModeGlitchSound();
      document.body.classList.add("glitching");
      const delay = prefersReducedMotion() ? 0 : 1600;
      window.setTimeout(() => {
        window.location.assign(href);
      }, delay);
    };

    const runBrew = async (token) => {
      const firstCup = !view.replaying && !view.completed;
      view.phase = "brewing";
      view.busy = true;
      view.flavor = "";
      view.cup = "empty";
      view.lamp = true;
      view.steam = false;
      view.pressureOn = false;
      view.pressureText = "нагрев";
      paintView();
      playCue("pump");

      await wait(firstCup ? 400 : 280, abort.signal);
      if (!stillCurrent(token)) return;
      view.pressureOn = true;
      view.pressureText = "набор";
      paintView();

      await wait(firstCup ? 400 : 220, abort.signal);
      if (!stillCurrent(token)) return;
      view.steam = true;
      paintView();

      await wait(firstCup ? 1000 : 500, abort.signal);
      if (!stillCurrent(token)) return;
      view.cup = "full";
      view.pressureText = "рабочее";
      paintView();
      playCue("pour");

      await wait(firstCup ? 1800 : 1200, abort.signal);
      if (!stillCurrent(token)) return;
      if (firstCup) playCue("receipt");

      await wait(firstCup ? 700 : 200, abort.signal);
      if (!stillCurrent(token)) return;
      finishBrew();
    };

    target.addEventListener(
      "click",
      async (event) => {
        const button = event.target.closest("[data-rr-act]");
        if (!button || !target.contains(button) || view.busy) return;

        const act = button.dataset.rrAct;
        if (act === "water" && view.phase === "idle") {
          const token = ++brewToken;
          view.busy = true;
          view.water = true;
          paintView();
          playCue("water");
          await wait(PREP_WATER_MS, abort.signal);
          if (!stillCurrent(token)) return;
          view.phase = "water";
          view.busy = false;
          paintView();
          return;
        }

        if (act === "beans" && view.phase === "water") {
          const token = ++brewToken;
          view.busy = true;
          view.beans = true;
          paintView();
          playCue("beans");
          await wait(PREP_BEANS_MS, abort.signal);
          if (!stillCurrent(token)) return;
          view.phase = "beans";
          view.busy = false;
          paintView();
          return;
        }

        if (act === "brew" && view.phase === "beans") {
          await runBrew(++brewToken);
          return;
        }

        if (act === "serve" && view.phase === "ready" && options.mode === "shift") {
          view.completed = true;
          view.busy = true;
          paintView();
          options.onServe?.();
          return;
        }

        if (act === "take" && view.phase === "ready") {
          view.completed = true;
          if (options.persist !== false) writeSave();
          enterStaff();
          return;
        }

        if (act === "staff" && (view.phase === "warm" || view.phase === "reading")) {
          if (options.persist !== false) writeSave();
          enterStaff();
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

  window.TyndexRedRoomEspresso = { init };

  if (document.querySelector("[data-red-room-espresso]")) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => init(), { once: true });
    } else {
      init();
    }
  }
})();
