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
      plea: "Я не прошу навсегда.\nТолько пока коридор перестанет двигаться.",
      table: "Лампа стала теплее.",
      counter: "Медвежья маска смотрит на пустой стол.",
      curtain: "Ткань закрылась за гостем.",
    },
    coffee: {
      id: "coffee",
      label: "Просит кофе",
      sprite: `${GUEST_ASSET_ROOT}/guest-coffee.webp`,
      plea: "У меня есть деньги.\nЯ закажу ещё, если место останется моим.",
      table: "Чашка на столе. Часы пошли.",
      counter: "Чашка пустеет. Лисья улыбка не меняется.",
      curtain: "Гость ушёл. Счёт остался на стойке.",
    },
    door: {
      id: "door",
      label: "Ищет дверь",
      sprite: `${GUEST_ASSET_ROOT}/guest-door.webp`,
      plea: "Мне не нужен кофе.\nПосадите меня туда, откуда видно дверь.",
      table: "Стул повёрнут к входу.",
      counter: "Заячья маска продолжает искать обычную дверь.",
      curtain: "Вы показали выход.",
    },
    returned: {
      id: "returned",
      label: "Уже здесь",
      sprite: `${GUEST_ASSET_ROOT}/guest-returned.webp`,
      plea: "Я помню этот столик.\nИ чашку. И женщину в красном фартуке.",
      table: "Лампа стала теплее. Маска узнаёт это место.",
      counter: "Знакомая маска смотрит на место Лоры.",
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

  const inSeat = (state, id) => state.table === id || state.counter === id;

  const hallOccupants = (state) => [state.table, state.counter].filter(Boolean);

  const guestContext = (id, state = {}) => {
    if (id === "tired") {
      if (inSeat(state, "coffee")) {
        return "У неё ещё остались силы улыбаться.\nЗначит, постоять сможет.";
      }
      if (hallOccupants(state).length === 0) {
        return "Здесь тихо. Я почти забыл, как это.";
      }
      return "Здесь тише, чем в коридоре.";
    }
    if (id === "coffee") {
      if (state.table === "tired") {
        return "Он спит.\nРазве место принадлежит тому, кто его не замечает?";
      }
      if (state.counter === "tired") {
        return "Он ничего не закажет.\nТолько дождётся, пока вы отвернётесь.";
      }
      return "Я хотя бы могу оплатить свою чашку.";
    }
    if (id === "door") {
      if (inSeat(state, "coffee")) {
        return "Она не ищет выход.\nОна ждёт, когда вы принесёте ещё.";
      }
      if (inSeat(state, "tired")) {
        return "Он уже отдыхает.\nЯ всё ещё пытаюсь выбраться.";
      }
      if (bothSeatsFull(state)) {
        return "Им нужно остаться.\nМне место нужно, чтобы уйти.";
      }
      return "Мне нужно видеть, куда уходить.";
    }
    if (id === "returned") {
      if (state.replay === "returned-first" && hallOccupants(state).length === 0) {
        return "Ты всё-таки вернулась.\nИли фартук нашёл кого-то другого?";
      }
      if (bothSeatsFull(state)) {
        return "Здесь нет свободных мест.\nНо одно из занятых — моё.";
      }
      if (hallOccupants(state).length > 0) {
        return "Они пришли позже.\nТы тоже.";
      }
      return "Я помню, как здесь сидели.";
    }
    return "";
  };

  const guestCoda = (id, state = {}) => {
    if (id === "returned" && state.replay === "none") return "Решай, Лора.";
    return "";
  };

  const formatCopy = (text) =>
    String(text || "")
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .join("<br />");

  const heardCount = (state) => {
    if (state.phase === "play") return state.index + 1;
    if (state.phase === "await-next" || state.phase === "finale" || state.phase === "closed") {
      return Math.min(state.index, 4);
    }
    return 0;
  };

  const hasPlayerChair = (state) =>
    state.playerSeat === "reserved" || state.playerSeat === "player";

  const giveAwayReservedChair = (state) => {
    if (state.playerSeat !== "reserved") return false;
    state.playerSeat = "standing";
    state.playerSeated = false;
    return true;
  };

  const guestName = (id) => (id && GUESTS[id] ? GUESTS[id].label : "");

  const WAIT_LINE = "Зал ждёт.";
  const EVICT_HINT = "Мест нет. Нажмите на занятую зону — гость уйдёт в коридор.";

  const waitingLine = (state) =>
    state.currentGuest && bothSeatsFull(state)
      ? EVICT_HINT
      : WAIT_LINE;

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

  const renderZoneProps = (state, zone) => {
    const occupant = zone === "table" ? state.table : state.counter;
    const traces = state.traces;
    const bits = [];
    if (zone === "table") {
      if (state.playerSeat === "reserved" && !occupant) {
        bits.push('<span class="rr-prop rr-prop--cup rr-prop--reserved" aria-hidden="true"></span>');
      }
      if (traces.clock) bits.push('<span class="rr-prop rr-prop--clock" aria-hidden="true"></span>');
      if (traces.tableChairOut && !occupant) {
        bits.push('<span class="rr-prop rr-prop--chair" aria-hidden="true"></span>');
      }
    }
    if (zone === "counter") {
      if (traces.unpaidBill) bits.push('<span class="rr-prop rr-prop--bill">счёт</span>');
      if (traces.wetCup) {
        bits.push('<span class="rr-prop rr-prop--cup rr-prop--cup-wet" aria-hidden="true"></span>');
      }
      if (occupant === "coffee") {
        bits.push('<span class="rr-prop rr-prop--cup is-drinking" aria-hidden="true"></span>');
      }
    }
    return bits.join("");
  };

  const renderLoraStation = (state) => {
    if (state.playerSeat === "returned") {
      return `<span class="rr-station rr-station--taken">${renderPerson("returned")}</span>`;
    }
    return `
      <span class="rr-station" aria-hidden="true">
        <span class="rr-station__chair"></span>
        <span class="rr-station__apron"></span>
        <span class="rr-station__collar"></span>
        <span class="rr-station__badge">ЛОРА</span>
      </span>
    `;
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
    if (state.playerSeat === "returned") return "Место Лоры занято";
    if (state.playerSeat === "reserved" || state.playerSeat === "standing") {
      return "Лора стоит";
    }
    if (state.playerSeat === "empty") return "Стул Лоры";
    return "Лора";
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
          <span class="rr-zone-label">${zoneLabel(state, "table")}</span>
          <span class="rr-lamp" aria-hidden="true"></span>
          <span class="rr-table-stage">
            ${state.table ? renderPerson(state.table) : ""}
            <span class="rr-tabletop" aria-hidden="true"></span>
            <span class="rr-table-props">${renderZoneProps(state, "table")}</span>
          </span>
        </button>
        <button type="button" class="rr-zone rr-zone--counter${counterHi ? ` ${counterHi}` : ""}" data-rr-zone="counter" ${counterHi ? "" : "disabled"}>
          <span class="rr-zone-label">${zoneLabel(state, "counter")}</span>
          <span class="rr-counter-stage">
            ${state.counter ? renderPerson(state.counter) : ""}
            <span class="rr-counter-edge" aria-hidden="true"></span>
            <span class="rr-counter-props">${renderZoneProps(state, "counter")}</span>
          </span>
        </button>
        <div class="rr-player rr-player--${state.playerSeat}${state.playerSeated ? " is-seated" : " is-standing"}" data-rr-player data-player-seat="${state.playerSeat}">
          <span class="rr-zone-label">${playerCaption(state)}</span>
          ${renderLoraStation(state)}
        </div>
        <div class="rr-entrance" data-rr-entrance aria-label="Обычный вход в коридор">
          <span class="rr-zone-label">Коридор</span>
          <span class="rr-doorway">${corridor}</span>
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
      action = `<button type="button" class="rr-action" data-rr-sit>НАЧАТЬ СМЕНУ</button>`;
    } else if (state.phase === "await-next") {
      action = `<button type="button" class="rr-action" data-rr-next>СЛЕДУЮЩИЙ ГОСТЬ</button>`;
    } else if (state.phase === "finale" && state.ending === "hall") {
      action = `<button type="button" class="rr-action" data-rr-close>ЗАКРЫТЬ СМЕНУ</button>`;
    } else if (state.phase === "finale" && state.ending === "curtain") {
      const leaveLabel =
        state.playerSeat === "player"
          ? "ВСТАТЬ ИЗ-ЗА СТОЛА"
          : "УЙТИ ЗА ШТОРУ";
      action = `<button type="button" class="rr-action" data-rr-leave>${leaveLabel}</button>`;
    } else if (state.phase === "closed") {
      action = `<button type="button" class="rr-action" data-rr-again>НОВАЯ СМЕНА</button>`;
    }

    const context = guest ? guestContext(guest.id, state) : "";
    const coda = guest ? guestCoda(guest.id, state) : "";
    const guestCard = guest
      ? `<div class="rr-guest" data-rr-guest="${guest.id}">
           ${renderPerson(guest.id)}
           <div class="rr-guest__copy">
             <p class="rr-guest__name">${guest.label}</p>
             <p>${formatCopy(guest.plea)}</p>
             ${context ? `<p>${formatCopy(context)}</p>` : ""}
             ${coda ? `<p class="rr-guest__coda">${formatCopy(coda)}</p>` : ""}
           </div>
         </div>`
      : state.phase === "sit"
        ? `<div class="rr-guest rr-guest--empty"><p>На спинке стула висит красный фартук.<br />На бейдже — «ЛОРА».</p></div>`
        : state.phase === "finale" && state.ending === "hall" && !state.busy
          ? `<div class="rr-guest rr-guest--empty"><p>Зал остаётся таким, каким вы его собрали.</p></div>`
        : state.phase === "closed" && state.ending === "curtain"
          ? `<div class="rr-guest rr-guest--empty"><p>Красная Комната осталась без хозяйки.</p></div>`
        : "";

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
    const progress = root.querySelector("[data-rr-progress]");
    if (progress) {
      const heard = heardCount(state);
      if (!heard || state.phase === "sit" || state.phase === "closed") {
        progress.hidden = true;
        progress.textContent = "";
      } else {
        progress.hidden = false;
        const marks = [0, 1, 2, 3]
          .map((slot) => (slot < heard ? "●" : "○"))
          .join(" ");
        progress.textContent = `Гость ${heard} из 4  ${marks}`;
      }
    }
    const kicker = root.querySelector("[data-rr-kicker]");
    if (kicker) {
      kicker.textContent =
        state.phase === "closed"
          ? state.ending === "hall"
            ? "Смена закрыта // зал"
            : "Смена закрыта // штора"
          : state.replay === "standing"
            ? "Смена // Лора стоит"
            : state.replay === "returned-first"
              ? "Смена // знакомая маска первая"
              : state.phase === "sit"
                ? "Свободный столик"
                : "Смена // Лора";
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
    setLine(root, "Маска ушла в коридор.");
  };

  const maybeTiredMoves = async (root, state) => {
    if (state.counter !== "tired" || state.table) return false;
    const tookReserved = state.playerSeat === "reserved";
    setLine(
      root,
      tookReserved ? "Последний стул занят." : "Лампа загорелась."
    );
    await wait(700);
    state.counter = null;
    applyPlacementEffects(state, "tired", "table");
    render(root, state);
    return true;
  };

  const maybeCoffeeLeaves = async (root, state) => {
    if (state.counter !== "coffee") return false;
    setLine(root, "Гость ушёл.");
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

  const persistLive = (state, previous) => {
    const record = {
      version: STORAGE_VERSION,
      status: "in_progress",
      ending: state.ending,
      shiftsCompleted: previous?.shiftsCompleted || 0,
      finale: previous?.finale || null,
      live: {
        phase: state.phase,
        replay: state.replay,
        playerSeated: state.playerSeated,
        playerSeat: state.playerSeat,
        table: state.table,
        counter: state.counter,
        curtainUsed: state.curtainUsed,
        curtainLooked: state.curtainLooked,
        order: state.order,
        index: state.index,
        currentGuest: state.currentGuest,
        traces: clone(state.traces),
        ending: state.ending,
        lastLine: state.lastLine || "",
      },
      updatedAt: Date.now(),
    };
    writeRecord(record);
    return record;
  };

  const captureLine = (root, state, text) => {
    state.lastLine = text || "";
    setLine(root, text);
  };

  const restoreLive = (live) => ({
    phase: live.phase || "play",
    replay: live.replay || "none",
    playerSeated: Boolean(live.playerSeated),
    playerSeat: live.playerSeat || "empty",
    table: live.table || null,
    counter: live.counter || null,
    curtainUsed: Boolean(live.curtainUsed),
    curtainLooked: Boolean(live.curtainLooked),
    order: Array.isArray(live.order) && live.order.length ? live.order : [...FIRST_ORDER],
    index: Number.isFinite(live.index) ? live.index : 0,
    currentGuest: live.currentGuest || null,
    traces: { ...emptyTraces(), ...(live.traces || {}) },
    busy: false,
    ending: live.ending || null,
    lastLine: live.lastLine || "",
  });

  const openFinale = (root, state) => {
    state.ending = state.curtainUsed ? "hall" : "curtain";
    state.phase = "finale";
    if (state.ending === "curtain") state.curtainLooked = true;
    captureLine(root, state, "Смена закончена.");
    render(root, state);
  };

  const advanceAfterPlacement = (root, state, previousRef) => {
    state.index += 1;
    state.currentGuest = null;
    if (state.index >= state.order.length) {
      render(root, state);
      return;
    }
    state.phase = "await-next";
    render(root, state);
    previousRef.current = persistLive(state, previousRef.current);
  };

  const nextGuest = async (root, state, previousRef) => {
    if (state.phase !== "await-next" || state.busy) return;
    state.busy = true;
    render(root, state);
    if (state.index === 2) {
      await maybeTiredMoves(root, state);
    }
    if (state.index === 3) {
      await maybeCoffeeLeaves(root, state);
    }
    state.currentGuest = state.order[state.index];
    state.phase = "play";
    captureLine(root, state, waitingLine(state));
    state.busy = false;
    render(root, state);
    previousRef.current = persistLive(state, previousRef.current);
  };

  const placeGuest = async (root, state, zone, previousRef) => {
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
      await wait(520);
    }

    const reservedBefore = state.playerSeat === "reserved";
    applyPlacementEffects(state, guestId, zone);
    if (zone === "table" && reservedBefore) {
      captureLine(root, state, "Последний стул занят.");
    } else {
      captureLine(root, state, GUESTS[guestId][zone].replace("\n", " "));
    }
    render(root, state);
    await wait(480);
    advanceAfterPlacement(root, state, previousRef);
    if (state.index >= state.order.length) {
      await wait(520);
      openFinale(root, state);
      previousRef.current = persistLive(state, previousRef.current);
    }
    state.busy = false;
    render(root, state);
  };

  const sitDown = (root, state, previousRef) => {
    if (state.phase !== "sit" || state.busy) return;
    state.phase = "play";
    state.playerSeated = true;
    state.playerSeat = "player";
    state.currentGuest = state.order[0];
    captureLine(root, state, waitingLine(state));
    render(root, state);
    previousRef.current = persistLive(state, previousRef.current);
  };

  const startStandingShift = (root, state, previousRef) => {
    state.phase = "play";
    state.playerSeated = false;
    state.playerSeat = "reserved";
    state.currentGuest = state.order[0];
    captureLine(root, state, "Последний стул ещё ваш, пока его не отдали.");
    render(root, state);
    previousRef.current = persistLive(state, previousRef.current);
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
      setLine(root, "Знакомая маска заняла место Лоры.");
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
    setLine(
      root,
      state.playerSeat === "returned"
        ? "Знакомая маска заняла место Лоры."
        : "Смена закрыта."
    );
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
    setLine(root, "Лора покинула смену.");
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
        sitDown(root, state, previousRef);
        return;
      }
      if (event.target.closest("[data-rr-next]")) {
        nextGuest(root, state, previousRef);
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
        if (replay === "standing") startStandingShift(root, next, previousRef);
        else {
          captureLine(root, next, "Столик снова свободен.");
          render(root, next);
        }
        return;
      }
      const zoneButton = event.target.closest("[data-rr-zone]");
      if (!zoneButton || zoneButton.disabled) return;
      placeGuest(root, state, zoneButton.dataset.rrZone, previousRef);
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
        <p class="rr-progress" data-rr-progress hidden></p>
        <p class="rr-line" data-rr-line aria-live="polite"></p>
      </header>
      <div class="rr-hall" data-rr-hall></div>
      <div class="rr-dock" data-rr-dock></div>
    `;

    const previousRef = { current: readRecord() };
    let state;
    if (previousRef.current?.status === "in_progress" && previousRef.current.live) {
      state = restoreLive(previousRef.current.live);
      setLine(root, previousRef.current.live.lastLine || waitingLine(state));
    } else if (previousRef.current?.status === "closed" && previousRef.current.finale) {
      state = restoreClosed(previousRef.current);
      updatePageCopy(previousRef.current.ending, true);
      if (state.ending === "curtain") {
        setLine(root, "Лора покинула смену.");
      } else if (state.playerSeat === "returned") {
        setLine(root, "Знакомая маска заняла место Лоры.");
      } else {
        setLine(root, "Смена закрыта.");
      }
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
    guestContext,
    guestCoda,
  };

  if (document.querySelector("[data-red-room-shift]")) {
    init();
  }
})();
