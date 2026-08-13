(() => {
  "use strict";

  const STORAGE_KEY = "tyndex_red_room_espresso_v1";
  const STORAGE_VERSION = 1;
  const BREW_DELAY_MS = 900;
  const FLAVOR_LINES = [
    "Вторая чашка предназначена сотруднику.",
    "На поверхности кофе отражается красная штора.",
    "Машина помнит предыдущую смену.",
  ];

  const prefersReducedMotion = () =>
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const wait = (duration) =>
    new Promise((resolve) => {
      window.setTimeout(resolve, prefersReducedMotion() ? 0 : duration);
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

  const renderMachine = (root, view) => {
    const brewing = view.phase === "brewing";
    const settled = view.phase === "ready" || view.phase === "reading" || view.phase === "warm";

    root.dataset.phase = view.phase;
    root.classList.toggle("is-water", view.water);
    root.classList.toggle("is-beans", view.beans);
    root.classList.toggle("is-lamp", brewing || settled);
    root.classList.toggle("is-steam", brewing || view.phase === "ready");
    root.classList.toggle("is-pressure", brewing || view.phase === "ready");
    root.classList.toggle("is-cup", view.cup === "full" || brewing);
    root.classList.toggle("is-receipt", settled);
    root.classList.toggle("is-warm", view.phase === "warm" || view.phase === "reading");
    root.classList.toggle("is-busy", view.busy === true);
  };

  const pressureLabel = (view) =>
    view.phase === "brewing" || view.phase === "ready" ? "рабочее" : "0";

  const renderCopy = (root, view) => {
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

    setHidden(receipt, view.phase !== "ready" && view.phase !== "reading");
    if (flavor) {
      flavor.textContent = view.flavor || "";
      setHidden(flavor, !view.flavor);
    }

    if (actions) {
      const buttons = [];
      if (view.phase === "idle") {
        buttons.push({ act: "water", label: "Проверить воду" });
      } else if (view.phase === "water") {
        buttons.push({ act: "beans", label: "Засыпать зерно" });
      } else if (view.phase === "beans") {
        buttons.push({ act: "brew", label: "Включить кофемашину" });
      } else if (view.phase === "brewing") {
        buttons.push({ act: "brew", label: "Готовится…", disabled: true });
      } else if (view.phase === "ready") {
        buttons.push({ act: "take", label: "Забрать чек" });
      } else {
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
      if (receipt && !receipt.hidden) {
        parts.push("Эспрессо готов. Служебный идентификатор куратора разблокирован. Проследуйте в технический раздел.");
      }
      if (view.flavor) parts.push(view.flavor);
      live.textContent = parts.join(" ");
    }
  };

  const createView = (completed) => {
    if (completed) {
      return {
        phase: "warm",
        water: true,
        beans: true,
        cup: "full",
        busy: false,
        flavor: "",
        replaying: false,
        completed: true,
      };
    }

    return {
      phase: "idle",
      water: false,
      beans: false,
      cup: "empty",
      busy: false,
      flavor: "",
      replaying: false,
      completed: false,
    };
  };

  const paint = (root, view) => {
    renderMachine(root, view);
    renderCopy(root, view);
  };

  const init = (root) => {
    const target = root || document.querySelector("[data-red-room-espresso]");
    if (!target) return;

    if (target._rrEspressoAbort) target._rrEspressoAbort.abort();
    const abort = new AbortController();
    target._rrEspressoAbort = abort;

    const view = createView(readSave().completed);
    let brewToken = 0;
    paint(target, view);

    const startPrep = (replay) => {
      view.phase = "idle";
      view.water = false;
      view.beans = false;
      view.cup = "empty";
      view.busy = false;
      view.flavor = "";
      view.replaying = replay;
      paint(target, view);
    };

    const finishBrew = () => {
      view.busy = false;
      view.cup = "full";
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
      paint(target, view);
    };

    const goWarm = () => {
      view.phase = "warm";
      view.water = true;
      view.beans = true;
      view.cup = "full";
      view.busy = false;
      view.flavor = "";
      view.replaying = false;
      view.completed = true;
      paint(target, view);
    };

    target.addEventListener(
      "click",
      async (event) => {
        const button = event.target.closest("[data-rr-act]");
        if (!button || !target.contains(button) || view.busy) return;

        const act = button.dataset.rrAct;
        if (act === "water" && view.phase === "idle") {
          view.phase = "water";
          view.water = true;
          paint(target, view);
          return;
        }

        if (act === "beans" && view.phase === "water") {
          view.phase = "beans";
          view.beans = true;
          paint(target, view);
          return;
        }

        if (act === "brew" && view.phase === "beans") {
          const token = ++brewToken;
          view.phase = "brewing";
          view.busy = true;
          view.flavor = "";
          paint(target, view);
          await wait(BREW_DELAY_MS);
          if (token !== brewToken || !target.isConnected) return;
          finishBrew();
          return;
        }

        if (act === "take" && view.phase === "ready") {
          view.completed = true;
          writeSave();
          goWarm();
          return;
        }

        if (act === "read" && (view.phase === "warm" || view.phase === "reading")) {
          view.phase = "reading";
          paint(target, view);
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
