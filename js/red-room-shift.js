(() => {
  "use strict";

  const STORAGE_KEY = "tyndex_red_room_shift_v1";
  const STORAGE_VERSION = 1;
  const FIRST_ORDER = ["tired", "coffee", "door", "returned"];
  const RETURNED_FIRST_ORDER = ["returned", "tired", "coffee", "door"];
  const GUEST_ASSET_ROOT = "../assets/guest/red-room/game";

  const GUESTS = {
    tired: {
      id: "tired",
      label: "Без сил",
      sprite: `${GUEST_ASSET_ROOT}/guest-tired.webp`,
      arrive: "Можно сесть?\nКоридоры не кончаются.",
      table: "Лампа загорелась.",
      counter: "Медвежья маска повёрнута к пустому столу.",
      curtain: "Ткань закрылась за гостем.",
    },
    coffee: {
      id: "coffee",
      label: "Просит кофе",
      sprite: `${GUEST_ASSET_ROOT}/guest-coffee.webp`,
      arrive: "Мне счёт.\nИ кофе. Я ещё сплю.",
      table: "Чашка на столе. Часы пошли.",
      counter: "Чашка пустеет. Лисья улыбка не меняется.",
      curtain: "Гость ушёл. Счёт остался на стойке.",
    },
    door: {
      id: "door",
      label: "Ищет дверь",
      sprite: `${GUEST_ASSET_ROOT}/guest-door.webp`,
      arrive: "Где здесь обычная дверь?",
      table: "Стул смотрит на вход.",
      counter: "Спрашивает дорогу. Не пьёт.",
      curtain: "Вы показали выход.",
    },
    returned: {
      id: "returned",
      label: "Уже здесь",
      sprite: `${GUEST_ASSET_ROOT}/guest-returned.webp`,
      arrive: "Я помню этот столик.",
      table: "Лампа стала теплее.\nМаска узнаёт это место.",
      counter: "Знакомая маска смотрит на ваш стул.",
      curtain: "Гость ушёл. Зал снова всё забыл.",
    },
  };

  const prefersReducedMotion = () =>
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const wait = (duration) =>
    new Promise((resolve) => {
      window.setTimeout(resolve, prefersReducedMotion() ? 0 : duration);
    });

  const clone = (value) => JSON.parse(JSON.stringify(value));

  const emptyTraces = () => ({
    tableChairOut: false,
    tableFacingDoor: false,
    tableWarm: false,
    tableHis: false,
    clock: false,
    wetCup: false,
    unpaidBill: false,
    counterChairOut: false,
    recognitionDim: false,
    corridor: [],
  });

  const createLiveState = (replay) => ({
    phase: replay === "standing" ? "play" : "sit",
    replay,
    playerSeated: false,
    playerSeat: replay === "standing" ? "reserved" : "empty",
    table: null,
    counter: null,
    curtainUsed: false,
    curtainLooked: false,
    order: replay === "returned-first" ? [...RETURNED_FIRST_ORDER] : [...FIRST_ORDER],
    index: 0,
    currentGuest: null,
    traces: emptyTraces(),
    busy: false,
    ending: null,
  });

  const readRecord = () => {
    try {
      const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "null");
      if (!parsed || parsed.version !== STORAGE_VERSION) return null;
      return parsed;
    } catch {
      return null;
    }
  };

  const writeRecord = (record) => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(record));
  };

  const snapshotFinale = (state) => ({
    table: state.table,
    counter: state.counter,
    playerSeat: state.playerSeat,
    curtainUsed: state.curtainUsed,
    traces: clone(state.traces),
  });

  const bothSeatsFull = (state) => Boolean(state.table && state.counter);

  const hasPlayerChair = (state) =>
    state.playerSeat === "reserved" || state.playerSeat === "player";

  const giveAwayReservedChair = (state) => {
    if (state.playerSeat !== "reserved") return false;
    state.playerSeat = "standing";
    state.playerSeated = false;
    return true;
  };

  const guestName = (id) => (id && GUESTS[id] ? GUESTS[id].label : "");

  const PLACEMENT_PROMPT = "Выберите: стол, стойка или штора.";

  const setLine = (root, text) => {
    const line = root.querySelector("[data-rr-line]");
    if (line) line.textContent = text || "";
  };

  const updatePageCopy = (ending, closed) => {
    const hero = document.querySelector("[data-red-room-hero]");
    const warning = document.querySelector("[data-red-room-warning]");
    const footer = document.querySelector("[data-red-room-footer]");
    if (!closed) {
      if (hero) hero.textContent = "Ты уже был здесь. Просто забыл.";
      if (warning) warning.textContent = "Выход есть. И он прячется за тяжелой бархатной шторой.";
      if (footer) footer.textContent = "Ты уже был здесь. Просто забыл.";
      return;
    }
    if (ending === "hall") {
      if (hero) hero.textContent = "Свободных столиков нет.";
      if (warning) warning.textContent = "Зал ещё открыт. Выход уже использовали.";
      if (footer) footer.textContent = "Ваш столик занят сменой.";
    }
    if (ending === "curtain") {
      if (hero) hero.textContent = "Ты уже был здесь. Просто забыл.";
      if (warning) warning.textContent = "Выход есть. Его только что использовали.";
      if (footer) footer.textContent = "Столик снова пуст.";
    }
  };

  const renderPerson = (id, extraClass = "") => {
    if (!id) return "";
    const guest = GUESTS[id];
    const sprite = guest
      ? `<img class="rr-person__sprite" src="${guest.sprite}" alt="" width="512" height="768" draggable="false" />`
      : "";
    return `<span class="rr-person rr-person--${id} ${extraClass}" data-guest="${id}" aria-hidden="true">${sprite}<i></i><b></b></span>`;
  };

  const renderZoneBody = (state, zone) => {
    const occupant = zone === "table" ? state.table : state.counter;
    const traces = state.traces;
    const bits = [];
    if (occupant) bits.push(renderPerson(occupant));
    if (zone === "table") {
      if (state.playerSeat === "reserved" && !occupant) {
        bits.push('<span class="rr-prop rr-prop--cup rr-prop--reserved" aria-hidden="true"></span>');
      }
      if (traces.clock) bits.push('<span class="rr-prop rr-prop--clock" aria-hidden="true">III</span>');
      if (traces.tableChairOut && !occupant) bits.push('<span class="rr-prop rr-prop--chair" aria-hidden="true"></span>');
    }
    if (zone === "counter") {
      if (traces.unpaidBill) bits.push('<span class="rr-prop rr-prop--bill">СЧЁТ</span>');
      if (traces.wetCup) bits.push('<span class="rr-prop rr-prop--cup rr-prop--cup-wet" aria-hidden="true"></span>');
      if (occupant === "coffee") bits.push('<span class="rr-prop rr-prop--cup is-drinking" aria-hidden="true"></span>');
      if (traces.counterChairOut && !occupant && !traces.wetCup) {
        bits.push('<span class="rr-prop rr-prop--chair" aria-hidden="true"></span>');
      }
    }
    return bits.join("");
  };

  const highlightFor = (state, zone) => {
    if (state.phase !== "play" || state.busy || !state.currentGuest) return "";
    if (zone === "curtain") return state.curtainUsed ? "" : "is-open";
    const occupied = zone === "table" ? state.table : state.counter;
    if (!occupied) return "is-open";
    if (bothSeatsFull(state)) return "is-evict";
    return "";
  };

  const zoneLabel = (state, zone) => {
    if (zone === "curtain") {
      if (state.curtainLooked) return "Штора смотрит на вас";
      if (state.curtainUsed) return "Штора уже открывалась";
      return "Штора / выход";
    }
    if (zone === "table") {
      if (state.playerSeat === "reserved" && !state.table) return "Последний стул";
      if (state.traces.tableHis && state.table === "returned") return "Знакомый столик";
      return "Стол";
    }
    return "Стойка";
  };

  const playerCaption = (state) => {
    if (state.playerSeat === "returned") return "Ваш стул занят";
    if (state.playerSeat === "reserved" || state.playerSeat === "standing") {
      return "Вы стоите";
    }
    if (state.playerSeat === "empty") return "Пустой стул";
    return "Вы";
  };

  const buildHall = (root, state) => {
    const hall = root.querySelector("[data-rr-hall]");
    if (!hall) return;
    const tableHi = highlightFor(state, "table");
    const counterHi = highlightFor(state, "counter");
    const curtainHi = highlightFor(state, "curtain");
    const tableFacing = state.traces.tableFacingDoor ? " is-facing-door" : "";
    const tableWarm = state.traces.tableWarm ? " is-warm" : "";
    const tableHis = state.traces.tableHis ? " is-his" : "";
    const recognition = state.traces.recognitionDim ? " is-dim" : "";
    const lastChair =
      state.playerSeat === "reserved" && !state.table ? " is-last-chair" : "";
    const corridor = (state.traces.corridor || [])
      .map((id) => renderPerson(id, "is-gone"))
      .join("");

    hall.innerHTML = `
      <button type="button" class="rr-curtain ${curtainHi}${state.curtainLooked ? " is-looking" : ""}${state.curtainUsed ? " is-used" : ""}" data-rr-zone="curtain" ${curtainHi ? "" : "disabled"}>
        <span class="rr-curtain__fabric" aria-hidden="true"></span>
        <span class="rr-zone-label">${zoneLabel(state, "curtain")}</span>
      </button>
      <div class="rr-room${recognition}">
        <button type="button" class="rr-zone rr-zone--table${tableHi ? ` ${tableHi}` : ""}${tableFacing}${tableWarm}${tableHis}${lastChair}" data-rr-zone="table" ${tableHi ? "" : "disabled"}>
          <span class="rr-lamp" aria-hidden="true"></span>
          <span class="rr-zone-label">${zoneLabel(state, "table")}</span>
          <span class="rr-zone-body">${renderZoneBody(state, "table")}</span>
        </button>
        <button type="button" class="rr-zone rr-zone--counter${counterHi ? ` ${counterHi}` : ""}" data-rr-zone="counter" ${counterHi ? "" : "disabled"}>
          <span class="rr-zone-label">${zoneLabel(state, "counter")}</span>
          <span class="rr-zone-body">${renderZoneBody(state, "counter")}</span>
        </button>
        <div class="rr-player rr-player--${state.playerSeat}${state.playerSeated ? " is-seated" : " is-standing"}" data-rr-player data-player-seat="${state.playerSeat}">
          <span class="rr-zone-label">${playerCaption(state)}</span>
          <span class="rr-zone-body">
            ${state.playerSeat === "returned" ? renderPerson("returned") : ""}
            ${state.playerSeat === "player" ? '<span class="rr-person rr-person--player" aria-hidden="true"><i></i><b></b></span>' : ""}
            ${state.playerSeat === "reserved" || state.playerSeat === "standing" ? '<span class="rr-person rr-person--player is-standing-aside" aria-hidden="true"><i></i><b></b></span>' : ""}
            ${state.playerSeat === "empty" ? '<span class="rr-prop rr-prop--chair" aria-hidden="true"></span>' : ""}
          </span>
        </div>
        <div class="rr-entrance" data-rr-entrance aria-label="Обычный вход в коридор">
          <span class="rr-zone-label">Коридор</span>
          <span class="rr-zone-body rr-entrance__body">${corridor}</span>
        </div>
      </div>
    `;
  };

  const buildDock = (root, state) => {
    const dock = root.querySelector("[data-rr-dock]");
    if (!dock) return;
    const guest = state.currentGuest ? GUESTS[state.currentGuest] : null;
    let action = "";
    if (state.phase === "sit") {
      action = `<button type="button" class="rr-action" data-rr-sit>СЯДЬ</button>`;
    } else if (state.phase === "finale" && state.ending === "hall") {
      action = `<button type="button" class="rr-action" data-rr-close>ЗАКРЫТЬ СМЕНУ</button>`;
    } else if (state.phase === "finale" && state.ending === "curtain") {
      action = `<button type="button" class="rr-action" data-rr-leave>ВСТАТЬ ИЗ-ЗА СТОЛА</button>`;
    } else if (state.phase === "closed") {
      action = `<button type="button" class="rr-action" data-rr-again>НОВАЯ СМЕНА</button>`;
    }

    const guestCard = guest
      ? `<div class="rr-guest" data-rr-guest="${guest.id}">
           ${renderPerson(guest.id)}
           <p>${guest.arrive.replace("\n", "<br />")}</p>
         </div>`
      : state.phase === "sit"
        ? `<div class="rr-guest rr-guest--empty"><p>Столик на одного.<br />Сядь. Выдохни.</p></div>`
        : state.phase === "finale" && state.ending === "hall"
          ? `<div class="rr-guest rr-guest--empty"><p>Зал остаётся таким,<br />каким вы его собрали.</p></div>`
        : state.phase === "finale" && state.ending === "curtain"
          ? `<div class="rr-guest rr-guest--empty"><p>Штора смотрит на вас.<br />Можно встать.</p></div>`
        : `<div class="rr-guest rr-guest--empty"><p>Смена закрыта.</p></div>`;

    dock.innerHTML = `${guestCard}${action}`;
  };

  const render = (root, state) => {
    root.dataset.phase = state.phase;
    root.dataset.replay = state.replay;
    if (state.currentGuest) root.dataset.guest = state.currentGuest;
    else delete root.dataset.guest;
    root.classList.toggle("is-busy", state.busy);
    root.classList.toggle("is-staff-hidden", false);
    buildHall(root, state);
    buildDock(root, state);
    const kicker = root.querySelector("[data-rr-kicker]");
    if (kicker) {
      kicker.textContent =
        state.phase === "closed"
          ? state.ending === "hall"
            ? "Смена закрыта // зал"
            : "Смена закрыта // штора"
          : state.replay === "standing"
            ? "Смена // вы стоите"
            : state.replay === "returned-first"
              ? "Смена // знакомая маска первая"
              : "Свободный столик";
    }
  };

  const applyPlacementEffects = (state, guestId, zone) => {
    if (zone === "table") {
      state.table = guestId;
      giveAwayReservedChair(state);
      if (guestId === "tired") state.traces.tableWarm = true;
      if (guestId === "coffee") state.traces.clock = true;
      if (guestId === "door") state.traces.tableFacingDoor = true;
      if (guestId === "returned") {
        state.traces.tableWarm = true;
        state.traces.tableHis = true;
      }
    }
    if (zone === "counter") {
      state.counter = guestId;
      if (guestId === "coffee") state.traces.wetCup = false;
    }
    if (zone === "curtain") {
      state.curtainUsed = true;
      if (guestId === "coffee") state.traces.unpaidBill = true;
      if (guestId === "returned") state.traces.recognitionDim = true;
    }
  };

  const evictToCorridor = async (root, state, zone) => {
    const guestId = zone === "table" ? state.table : state.counter;
    if (!guestId) return;
    const zoneEl = root.querySelector(`[data-rr-zone="${zone}"]`);
    const entrance = root.querySelector("[data-rr-entrance]");
    const person = zoneEl?.querySelector(".rr-person");
    if (person && entrance && !prefersReducedMotion()) {
      const from = person.getBoundingClientRect();
      const to = entrance.getBoundingClientRect();
      const walker = person.cloneNode(true);
      walker.classList.add("is-walking");
      walker.style.left = `${from.left}px`;
      walker.style.top = `${from.top}px`;
      document.body.append(walker);
      person.style.opacity = "0";
      await wait(20);
      walker.style.transform = `translate(${to.left - from.left}px, ${to.top - from.top}px)`;
      await wait(720);
      walker.remove();
    }
    if (zone === "table") {
      state.table = null;
      state.traces.tableChairOut = true;
    } else {
      state.counter = null;
      state.traces.counterChairOut = true;
    }
    state.traces.corridor = [...state.traces.corridor, guestId];
    setLine(root, `${guestName(guestId)} — теперь в коридоре.`);
  };

  const maybeTiredMoves = async (root, state) => {
    if (state.counter !== "tired" || state.table) return false;
    const tookReserved = state.playerSeat === "reserved";
    setLine(
      root,
      tookReserved
        ? "Последний стул занят. Вам стоять."
        : "Уставший гость занял пустой стол."
    );
    await wait(700);
    state.counter = null;
    applyPlacementEffects(state, "tired", "table");
    render(root, state);
    return true;
  };

  const maybeCoffeeLeaves = async (root, state) => {
    if (state.counter !== "coffee") return false;
    setLine(root, "Чашка опустела. Гость ушёл во вход.");
    const zoneEl = root.querySelector('[data-rr-zone="counter"]');
    const entrance = root.querySelector("[data-rr-entrance]");
    const person = zoneEl?.querySelector(".rr-person");
    if (person && entrance && !prefersReducedMotion()) {
      const from = person.getBoundingClientRect();
      const to = entrance.getBoundingClientRect();
      const walker = person.cloneNode(true);
      walker.classList.add("is-walking");
      walker.style.left = `${from.left}px`;
      walker.style.top = `${from.top}px`;
      document.body.append(walker);
      person.style.opacity = "0";
      await wait(20);
      walker.style.transform = `translate(${to.left - from.left}px, ${to.top - from.top}px)`;
      await wait(720);
      walker.remove();
    } else {
      await wait(500);
    }
    state.counter = null;
    state.traces.wetCup = true;
    state.traces.corridor = [...state.traces.corridor, "coffee"];
    render(root, state);
    return true;
  };

  const advanceAfterPlacement = async (root, state) => {
    const placedIndex = state.index;
    state.index += 1;
    state.currentGuest = null;
    render(root, state);

    if (placedIndex === 1) {
      await maybeTiredMoves(root, state);
    }
    if (placedIndex === 2) {
      await maybeCoffeeLeaves(root, state);
    }

    if (state.index >= state.order.length) {
      state.ending = state.curtainUsed ? "hall" : "curtain";
      state.phase = "finale";
      if (state.ending === "curtain") state.curtainLooked = true;
      setLine(
        root,
        state.ending === "hall"
          ? "Зал остаётся. Штора уже была открыта."
          : "Штора смотрит на вас."
      );
      render(root, state);
      return;
    }

    state.currentGuest = state.order[state.index];
    setLine(root, PLACEMENT_PROMPT);
    render(root, state);
  };

  const placeGuest = async (root, state, zone) => {
    const guestId = state.currentGuest;
    if (!guestId || state.busy || state.phase !== "play") return;
    const occupied = zone === "table" ? state.table : zone === "counter" ? state.counter : null;
    const canEvict = zone !== "curtain" && occupied && bothSeatsFull(state);
    if (zone === "curtain" && state.curtainUsed) return;
    if (zone !== "curtain" && occupied && !canEvict) return;

    state.busy = true;
    render(root, state);

    if (canEvict) {
      await evictToCorridor(root, state, zone);
      render(root, state);
    }

    const reservedBefore = state.playerSeat === "reserved";
    applyPlacementEffects(state, guestId, zone);
    if (zone === "table" && reservedBefore) {
      setLine(root, "Последний стул отдан. Вам стоять.");
    } else {
      setLine(root, GUESTS[guestId][zone].replace("\n", " "));
    }
    render(root, state);
    await wait(720);
    await advanceAfterPlacement(root, state);
    state.busy = false;
    render(root, state);
  };

  const sitDown = (root, state) => {
    if (state.phase !== "sit" || state.busy) return;
    state.phase = "play";
    state.playerSeated = true;
    state.playerSeat = "player";
    state.currentGuest = state.order[0];
    setLine(root, PLACEMENT_PROMPT);
    render(root, state);
  };

  const startStandingShift = (root, state) => {
    state.phase = "play";
    state.playerSeated = false;
    state.playerSeat = "reserved";
    state.currentGuest = state.order[0];
    setLine(root, "Вы стоите. Последний стул ещё ваш, пока его не отдали.");
    render(root, state);
  };

  const persistClosed = (state, previous) => {
    const shiftsCompleted = (previous?.shiftsCompleted || 0) + 1;
    const record = {
      version: STORAGE_VERSION,
      status: "closed",
      ending: state.ending,
      shiftsCompleted,
      finale: snapshotFinale(state),
      updatedAt: Date.now(),
    };
    writeRecord(record);
    return record;
  };

  const closeHall = async (root, state, previousRef) => {
    if (state.phase !== "finale" || state.ending !== "hall" || state.busy) return;
    state.busy = true;
    if (state.counter === "returned" && hasPlayerChair(state)) {
      setLine(root, "Знакомая маска занимает ваш стул.");
      render(root, state);
      await wait(700);
      state.counter = null;
      state.playerSeat = "returned";
      state.playerSeated = false;
    }
    const record = persistClosed(state, previousRef.current);
    previousRef.current = record;
    state.phase = "closed";
    state.currentGuest = null;
    state.busy = false;
    setLine(root, "Смена закрыта.");
    render(root, state);
    updatePageCopy("hall", true);
  };

  const leaveThroughCurtain = async (root, state, previousRef) => {
    if (state.phase !== "finale" || state.ending !== "curtain" || state.busy) return;
    state.busy = true;
    state.curtainUsed = true;
    state.curtainLooked = false;
    state.playerSeated = false;
    state.playerSeat = "empty";
    setLine(root, "Вы встаёте и проходите за штору.");
    render(root, state);
    await wait(800);
    const record = persistClosed(state, previousRef.current);
    previousRef.current = record;
    state.phase = "closed";
    state.currentGuest = null;
    state.busy = false;
    render(root, state);
    updatePageCopy("curtain", true);
  };

  const restoreClosed = (record) => {
    const finale = record.finale || {};
    return {
      phase: "closed",
      replay: "none",
      playerSeated: finale.playerSeat === "player",
      playerSeat: finale.playerSeat || "empty",
      table: finale.table || null,
      counter: finale.counter || null,
      curtainUsed: Boolean(finale.curtainUsed),
      curtainLooked: false,
      order: [],
      index: 4,
      currentGuest: null,
      traces: { ...emptyTraces(), ...(finale.traces || {}) },
      busy: false,
      ending: record.ending,
    };
  };

  const bind = (root, getState, setState, previousRef) => {
    root.addEventListener("click", (event) => {
      const state = getState();
      if (event.target.closest("[data-rr-sit]")) {
        sitDown(root, state);
        return;
      }
      if (event.target.closest("[data-rr-close]")) {
        closeHall(root, state, previousRef);
        return;
      }
      if (event.target.closest("[data-rr-leave]")) {
        leaveThroughCurtain(root, state, previousRef);
        return;
      }
      if (event.target.closest("[data-rr-again]")) {
        const replay = state.ending === "hall" ? "standing" : "returned-first";
        const next = createLiveState(replay);
        setState(next);
        updatePageCopy(null, false);
        if (replay === "standing") startStandingShift(root, next);
        else {
          setLine(root, "Столик снова свободен.");
          render(root, next);
        }
        return;
      }
      const zoneButton = event.target.closest("[data-rr-zone]");
      if (!zoneButton || zoneButton.disabled) return;
      placeGuest(root, state, zoneButton.dataset.rrZone);
    });
  };

  const mount = (root) => {
    if (!root || root.dataset.rrReady === "true") {
      if (root?.dataset.rrReady === "true") return;
    }
    root.dataset.rrReady = "true";
    root.hidden = false;
    root.innerHTML = `
      <header class="rr-head">
        <p class="rr-kicker" data-rr-kicker>Свободный столик</p>
        <p class="rr-line" data-rr-line aria-live="polite"></p>
      </header>
      <div class="rr-hall" data-rr-hall></div>
      <div class="rr-dock" data-rr-dock></div>
    `;

    const previousRef = { current: readRecord() };
    let state;
    if (previousRef.current?.status === "closed" && previousRef.current.finale) {
      state = restoreClosed(previousRef.current);
      updatePageCopy(previousRef.current.ending, true);
      setLine(root, "Смена закрыта. Можно начать новую.");
    } else {
      state = createLiveState("none");
      setLine(root, "В зале есть свободный столик.");
    }

    const getState = () => state;
    const setState = (next) => {
      state = next;
    };
    bind(root, getState, setState, previousRef);
    render(root, state);
  };

  const init = (root) => {
    const target = root || document.querySelector("[data-red-room-shift]");
    if (!target) return;
    if (target.dataset.rrReady === "true") {
      return;
    }
    mount(target);
  };

  window.TyndexRedRoomShift = {
    init,
    key: STORAGE_KEY,
  };

  if (document.querySelector("[data-red-room-shift]")) {
    init();
  }
})();
