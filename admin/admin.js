(() => {
  "use strict";

  const FIELD_LABEL = {
    sender: "Имя персонажа",
    subject: "Тема",
    preview: "Превью в списке",
    body: "Текст письма",
  };

  const KIND_LABEL = {
    dialogue: "Реплика",
    thought: "Мысль",
    choice: "Выбор",
    system: "Система",
    popup: "Всплывающее",
    message: "Письмо",
    meta: "Служебное",
    name: "Имя",
  };

  const BEAT_LIMIT = { target: 80, hard: 160 };
  const CHOICE_LIMIT = { target: 26, hard: 40 };

  const statusEl = document.getElementById("status");
  const tabsEl = document.getElementById("game-tabs");
  const listEl = document.getElementById("node-list");
  const countEl = document.getElementById("node-count");
  const searchEl = document.getElementById("search");
  const scriptEl = document.getElementById("script");
  const sheetEl = document.getElementById("characters");
  const characterListEl = document.getElementById("character-list");
  const composeEl = document.getElementById("compose");
  const composeForm = document.getElementById("compose-form");
  const composeSender = document.getElementById("compose-sender");
  const composeSenders = document.getElementById("compose-senders");
  const composeSubject = document.getElementById("compose-subject");
  const composePreview = document.getElementById("compose-preview");
  const composeBody = document.getElementById("compose-body");
  const composeGreet = document.getElementById("compose-greet");
  const composeBroadcast = document.getElementById("compose-broadcast");

  let games = [];
  let gameId = "irina";
  let inboxGameId = "irina";
  let roster = [];
  let script = null;
  let selectedId = null;
  let selectedKind = "node";
  let saveChain = Promise.resolve();

  const setStatus = (text, kind = "") => {
    statusEl.textContent = text;
    statusEl.className = `status ${kind}`.trim();
  };

  const api = async (path, options = {}) => {
    const response = await fetch(path, {
      headers: { "Content-Type": "application/json", ...(options.headers || {}) },
      ...options,
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || `HTTP ${response.status}`);
    return data;
  };

  const escapeHtml = (value) =>
    String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");

  const lineById = (id) => (script?.lines || []).find((line) => line.id === id);

  const nodeLines = (nodeId, bucket) =>
    (script?.lines || []).filter((line) => {
      if (line.nodeId !== nodeId || line.kind === "name") return false;
      if (bucket) return line.bucket === bucket;
      return line.bucket !== "inbox";
    });

  const inboxLines = (messageId) =>
    nodeLines(messageId, "inbox").filter((line) => {
      if (line.field === "sender") return false;
      if (line.fn && !line.unique && line.text === "Оператор") return false;
      return true;
    });

  const inboxSenderLine = (messageId) =>
    (script?.lines || []).find(
      (line) =>
        line.bucket === "inbox" &&
        line.nodeId === messageId &&
        line.field === "sender"
    );

  const choiceButtonIndex = (field) => {
    const match = String(field).match(/^choices\[(\d+)\]\.(label|text)$/);
    return match ? Number(match[1]) : null;
  };

  const isChoiceButton = (line) => choiceButtonIndex(line.field) !== null;

  const isBeatLine = (line) => {
    if (line.kind === "name" || line.field === "step") return false;
    if (line.field === "action") return true;
    if (line.field === "text" || line.field === "line") return true;
    return /^text\.fn\[\d+\]$/.test(line.field);
  };

  const beatRank = (line) => {
    if (line.field === "text" || line.field === "line") return 0;
    const fn = line.field.match(/^text\.fn\[(\d+)\]$/);
    if (fn) return 1 + Number(fn[1]);
    if (line.field === "action") return 100;
    return 50;
  };

  const beatLabel = (line) => {
    if (line.field === "action") return "Мысль";
    if (/^text\.fn\[\d+\]$/.test(line.field)) return "Вариант";
    if (line.kind === "thought") return "Мысль";
    if (line.kind === "system") return "Система";
    return "Реплика";
  };

  const isSecondary = (line) => {
    if (line.kind === "name" || line.field === "step") return false;
    if (isBeatLine(line) || isChoiceButton(line)) return false;
    return true;
  };

  const fieldLabel = (line, override) => {
    if (override) return override;
    const root = line.field.split(/[.[]/)[0];
    return FIELD_LABEL[line.field] || FIELD_LABEL[root] || KIND_LABEL[line.kind] || line.field;
  };

  const sceneGroupOf = (node) => {
    if (gameId === "solnyshko") return "";
    if (node.sceneGroup) return node.sceneGroup;
    if (gameId === "irina") {
      const step =
        node.step ||
        (script?.lines || []).find((line) => line.nodeId === node.id && line.field === "step")
          ?.text ||
        "";
      const raw = String(step).trim();
      if (!raw) return "Сцена";
      const cut = raw.indexOf(" // ");
      return cut === -1 ? raw : raw.slice(0, cut);
    }
    const match = String(node.id).match(/^[a-z]+/i);
    return match ? match[0] : "сцена";
  };

  const ruCount = (n, one, few, many) => {
    const mod10 = n % 10;
    const mod100 = n % 100;
    if (mod10 === 1 && mod100 !== 11) return `${n} ${one}`;
    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return `${n} ${few}`;
    return `${n} ${many}`;
  };

  const limitsFor = (line) => (isChoiceButton(line) ? CHOICE_LIMIT : BEAT_LIMIT);

  const lengthClass = (text, limits) => {
    const n = [...text].length;
    if (n > limits.hard) return "hard";
    if (n > limits.target) return "warn";
    return "";
  };

  const matchesQuery = (node, query, bucket) => {
    if (!query) return true;
    const lines = nodeLines(node.id, bucket);
    return (
      node.id.toLowerCase().includes(query) ||
      (node.speaker || node.sender || "").toLowerCase().includes(query) ||
      (node.preview || "").toLowerCase().includes(query) ||
      (node.subject || "").toLowerCase().includes(query) ||
      (node.step || "").toLowerCase().includes(query) ||
      sceneGroupOf(node).toLowerCase().includes(query) ||
      lines.some((line) => line.text.toLowerCase().includes(query))
    );
  };

  const applyScript = (data, { refreshSelected = true } = {}) => {
    script = data;
    renderList();
    if (refreshSelected && selectedId) renderSelected();
    renderCharacters();
  };

  const fitArea = (area) => {
    area.style.height = "0px";
    area.style.height = `${Math.max(area.scrollHeight, 36)}px`;
  };

  const syncFieldChrome = (lineId) => {
    const wrap = scriptEl.querySelector(`[data-field="${CSS.escape(lineId)}"]`);
    const line = lineById(lineId);
    if (!wrap || !line) return;
    const control = wrap.querySelector("textarea, input");
    const counter = wrap.querySelector(".len");
    if (counter) {
      const limits = limitsFor(line);
      const n = [...(control?.value || line.text)].length;
      counter.textContent = `${n} / ${limits.target}`;
      counter.className = `len ${lengthClass(control?.value || line.text, limits)}`.trim();
    }
    const note = wrap.querySelector(".field-note");
    if (note && line.fn && !line.unique) {
      note.textContent = "Строка внутри функции не уникальна — правка через Cursor.";
    }
  };

  const markHits = () => {
    const query = searchEl.value.trim().toLowerCase();
    const wraps = [...scriptEl.querySelectorAll("[data-field]")];
    let first = null;
    wraps.forEach((wrap) => {
      const line = lineById(wrap.dataset.field);
      const hit = Boolean(query && line && line.text.toLowerCase().includes(query));
      wrap.classList.toggle("hit", hit);
      if (hit && !first) first = wrap;
    });
    if (first) first.scrollIntoView({ block: "nearest" });
  };

  const persistLine = (lineId, next) => {
    saveChain = saveChain.then(() => persistLineNow(lineId, next));
    return saveChain;
  };

  const persistLineNow = async (lineId, next) => {
    const line = lineById(lineId);
    if (!line || next === line.text) return;
    if (line.fn && !line.unique) return;
    setStatus(`Сохраняю ${line.field}…`);
    try {
      const nextScript = await api(`/api/copydesk/${encodeURIComponent(gameId)}/line`, {
        method: "PUT",
        body: JSON.stringify({ id: line.id, expected: line.text, text: next }),
      });
      script = nextScript;
      renderList();
      renderCharacters();
      syncFieldChrome(lineId);
      setStatus("Сохранено", "ok");
      const control = scriptEl.querySelector(`[data-line-id="${CSS.escape(lineId)}"]`);
      const saved = lineById(lineId);
      if (control && saved && control.value !== saved.text) {
        await persistLineNow(lineId, control.value);
      }
    } catch (error) {
      setStatus(error.message, "err");
    }
  };

  const bindControl = (control, line, { autosize = false } = {}) => {
    control.dataset.lineId = line.id;
    const locked = line.fn && !line.unique;
    control.disabled = locked;
    if (autosize) {
      fitArea(control);
      control.addEventListener("input", () => {
        fitArea(control);
        syncFieldChrome(line.id);
      });
    } else {
      control.addEventListener("input", () => syncFieldChrome(line.id));
    }
    control.addEventListener("blur", () => persistLine(line.id, control.value));
  };

  const renderBeatField = (line) => {
    const wrap = document.createElement("div");
    wrap.className = `beat-field kind-${line.kind}`;
    wrap.dataset.field = line.id;
    const locked = line.fn && !line.unique;
    const limits = limitsFor(line);
    wrap.innerHTML = `<div class="beat-meta"><span class="kind ${line.kind}">${beatLabel(
      line
    )}</span><span class="len"></span></div>`;
    const area = document.createElement("textarea");
    area.rows = 1;
    area.value = line.text;
    bindControl(area, line, { autosize: true });
    wrap.append(area);
    if (locked || line.fn) {
      const note = document.createElement("p");
      note.className = "field-note";
      note.textContent = locked
        ? "Строка внутри функции не уникальна — правка через Cursor."
        : "Уникальная строка внутри функции";
      wrap.append(note);
    }
    const counter = wrap.querySelector(".len");
    counter.textContent = `${[...line.text].length} / ${limits.target}`;
    counter.className = `len ${lengthClass(line.text, limits)}`.trim();
    return wrap;
  };

  const renderCompactField = (line, label) => {
    const wrap = document.createElement("div");
    wrap.className = "extra-field";
    wrap.dataset.field = line.id;
    const locked = line.fn && !line.unique;
    wrap.innerHTML = `<div class="beat-meta"><span class="kind ${line.kind}">${escapeHtml(
      fieldLabel(line, label)
    )}</span><span class="who">${escapeHtml(line.field)}</span></div>`;
    const area = document.createElement("textarea");
    area.rows = 1;
    area.value = line.text;
    bindControl(area, line, { autosize: true });
    wrap.append(area);
    if (locked) {
      const note = document.createElement("p");
      note.className = "field-note";
      note.textContent = "Строка внутри функции не уникальна — правка через Cursor.";
      wrap.append(note);
    }
    return wrap;
  };

  const renderChoiceRow = (node, lines) => {
    const buttons = lines.filter(isChoiceButton).sort((a, b) => {
      return (choiceButtonIndex(a.field) || 0) - (choiceButtonIndex(b.field) || 0);
    });
    if (!buttons.length) return null;
    const row = document.createElement("div");
    row.className = "choice-row";
    buttons.forEach((line) => {
      const index = choiceButtonIndex(line.field);
      const edge = (node?.outbound || []).filter((item) => item.label !== "auto")[index];
      const wrap = document.createElement("div");
      wrap.className = "choice-wrap";
      wrap.dataset.field = line.id;
      const chip = document.createElement("button");
      chip.type = "button";
      chip.className = "choice-chip";
      chip.textContent = line.text || "→";
      const editor = document.createElement("div");
      editor.className = "choice-edit";
      const input = document.createElement("input");
      input.type = "text";
      input.value = line.text;
      bindControl(input, line);
      const counter = document.createElement("span");
      counter.className = `len ${lengthClass(line.text, CHOICE_LIMIT)}`.trim();
      counter.textContent = `${[...line.text].length} / ${CHOICE_LIMIT.target}`;
      const go = document.createElement("button");
      go.type = "button";
      go.className = "choice-go";
      go.textContent = edge ? `→ ${edge.to}` : "→";
      go.disabled = !edge?.to;
      go.addEventListener("click", (event) => {
        event.preventDefault();
        if (edge?.to) selectItem("node", edge.to);
      });
      input.addEventListener("input", () => {
        chip.textContent = input.value || "→";
        const n = [...input.value].length;
        counter.textContent = `${n} / ${CHOICE_LIMIT.target}`;
        counter.className = `len ${lengthClass(input.value, CHOICE_LIMIT)}`.trim();
      });
      chip.addEventListener("click", () => {
        const open = wrap.classList.contains("open");
        row.querySelectorAll(".choice-wrap.open").forEach((item) => {
          if (item !== wrap) item.classList.remove("open");
        });
        wrap.classList.toggle("open", !open);
        if (!open) input.focus();
      });
      editor.append(input, counter, go);
      wrap.append(chip, editor);
      row.append(wrap);
    });
    const autos = (node?.outbound || []).filter((item) => item.label === "auto");
    autos.forEach((edge) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "choice-go auto";
      button.textContent = `auto → ${edge.to}`;
      button.addEventListener("click", () => selectItem("node", edge.to));
      row.append(button);
    });
    return row;
  };

  const renderTabs = () => {
    tabsEl.innerHTML = "";
    games.forEach((game) => {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = game.title;
      button.className = game.id === gameId ? "active" : "";
      button.addEventListener("click", () => loadGame(game.id));
      tabsEl.append(button);
    });
  };

  const appendGroup = (label) => {
    const div = document.createElement("li");
    div.className = "divider";
    div.textContent = label;
    listEl.append(div);
  };

  const appendNodeButton = (node, kind) => {
    const li = document.createElement("li");
    const button = document.createElement("button");
    const active = kind === selectedKind && node.id === selectedId;
    button.type = "button";
    button.className = active ? "active" : "";
    const mark = node.broadcast ? " · рассылка" : "";
    button.innerHTML = `<span class="id">${escapeHtml(node.id)}</span><span class="who">${escapeHtml(
      node.sender || node.speaker || "—"
    )}${mark}</span><span class="preview">${escapeHtml(node.subject || node.preview || "")}</span>`;
    button.addEventListener("click", () => selectItem(kind, node.id));
    li.append(button);
    listEl.append(li);
  };

  const renderList = () => {
    if (!script) return;
    const query = searchEl.value.trim().toLowerCase();
    const sceneNodes = script.nodes.filter((node) => matchesQuery(node, query, "node"));
    const inbox = (script.messages || []).filter((message) =>
      matchesQuery(message, query, "inbox")
    );
    const catalogs = [...new Set(
      script.lines.filter((line) => line.bucket === "catalog").map((line) => line.nodeId)
    )]
      .map((id) => ({
        id,
        speaker: "каталог",
        preview: "Чеки, подарки, штампы",
        catalog: true,
      }))
      .filter((node) => matchesQuery(node, query, "catalog"));

    countEl.textContent = `(${sceneNodes.length})`;
    listEl.innerHTML = "";

    const grouped = sceneNodes.some((node) => sceneGroupOf(node));
    if (grouped) {
      const buckets = new Map();
      sceneNodes.forEach((node) => {
        const group = sceneGroupOf(node);
        if (!buckets.has(group)) buckets.set(group, []);
        buckets.get(group).push(node);
      });
      buckets.forEach((nodes, group) => {
        if (group) appendGroup(group);
        nodes.forEach((node) => appendNodeButton(node, "node"));
      });
    } else {
      sceneNodes.forEach((node) => appendNodeButton(node, "node"));
    }
    if (inbox.length || gameId === inboxGameId) {
      appendGroup("КАБИНЕТ");
      inbox.forEach((message) => appendNodeButton(message, "inbox"));
    }
    if (catalogs.length) {
      appendGroup("КАТАЛОГИ");
      catalogs.forEach((node) => appendNodeButton(node, "catalog"));
    }
  };

  const renderScriptHead = (title, metaText, extra) => {
    const head = document.createElement("div");
    head.className = "script-head";
    const heading = document.createElement("h2");
    heading.textContent = title;
    const meta = document.createElement("p");
    meta.textContent = metaText;
    head.append(heading, meta);
    if (extra) head.append(extra);
    scriptEl.append(head);
  };

  const renderScript = (nodeId) => {
    const node = script.nodes.find((item) => item.id === nodeId);
    const lines = nodeLines(nodeId, selectedKind === "catalog" ? "catalog" : "node");
    scriptEl.innerHTML = "";

    const speaker = document.createElement("p");
    speaker.className = "script-speaker";
    speaker.textContent = node?.speaker || "—";
    const stepLine = (script.lines || []).find(
      (line) => line.nodeId === nodeId && line.field === "step"
    );
    if (stepLine) {
      const badge = document.createElement("span");
      badge.className = "step-badge";
      badge.dataset.field = stepLine.id;
      const input = document.createElement("input");
      input.type = "text";
      input.value = stepLine.text;
      bindControl(input, stepLine);
      badge.append(input);
      speaker.append(badge);
    }

    const head = document.createElement("div");
    head.className = "script-head";
    const heading = document.createElement("h2");
    heading.textContent = nodeId;
    const meta = document.createElement("p");
    const beatCount = lines.filter(isBeatLine).length;
    const choiceCount = lines.filter(isChoiceButton).length;
    meta.textContent = node
      ? `${node.speaker || "—"} · ${ruCount(beatCount, "реплика", "реплики", "реплик")} · ${ruCount(
          choiceCount,
          "кнопка",
          "кнопки",
          "кнопок"
        )}`
      : `${lines.length} строк`;
    head.append(heading, speaker, meta);
    scriptEl.append(head);

    if (selectedKind === "catalog") {
      if (!lines.length) {
        const empty = document.createElement("p");
        empty.className = "empty";
        empty.textContent = "В этом каталоге нет правимого текста.";
        scriptEl.append(empty);
        return;
      }
      const stack = document.createElement("div");
      stack.className = "extra-stack";
      lines.forEach((line) => stack.append(renderCompactField(line)));
      scriptEl.append(stack);
      markHits();
      return;
    }

    const beat = lines.filter(isBeatLine).sort((a, b) => beatRank(a) - beatRank(b));
    const extra = lines.filter(isSecondary);

    if (!beat.length && !lines.filter(isChoiceButton).length && !extra.length) {
      const empty = document.createElement("p");
      empty.className = "empty";
      empty.textContent = "В этой ветке нет правимого текста.";
      scriptEl.append(empty);
      return;
    }

    const beatBlock = document.createElement("section");
    beatBlock.className = "beat-block";
    beat.forEach((line) => beatBlock.append(renderBeatField(line)));
    if (beat.length) scriptEl.append(beatBlock);

    const choices = renderChoiceRow(node, lines);
    if (choices) scriptEl.append(choices);

    if (extra.length) {
      const details = document.createElement("details");
      details.className = "extra";
      const summary = document.createElement("summary");
      summary.textContent = `Ещё (${extra.length})`;
      const stack = document.createElement("div");
      stack.className = "extra-stack";
      extra.forEach((line) => stack.append(renderCompactField(line)));
      details.append(summary, stack);
      scriptEl.append(details);
    }

    markHits();
  };

  const renderInbox = (messageId) => {
    const message = (script.messages || []).find((item) => item.id === messageId);
    const lines = inboxLines(messageId);
    const senderLine = inboxSenderLine(messageId);
    scriptEl.innerHTML = "";

    const actions = document.createElement("div");
    actions.className = "script-actions";
    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "danger";
    remove.textContent = "Удалить сообщение";
    remove.addEventListener("click", async () => {
      if (!confirm(`Удалить шаблон «${messageId}» из личного кабинета?`)) return;
      setStatus(`Удаляю ${messageId}…`);
      try {
        const nextScript = await api(
          `/api/copydesk/${encodeURIComponent(gameId)}/message/${encodeURIComponent(messageId)}`,
          { method: "DELETE" }
        );
        selectedId = null;
        selectedKind = "node";
        applyScript(nextScript);
        setStatus("Сообщение удалено из шаблонов кабинета", "ok");
        scriptEl.innerHTML = "<p class=\"empty\">Сообщение удалено. Выберите другое слева.</p>";
        history.replaceState(null, "", `#${gameId}`);
      } catch (error) {
        setStatus(error.message, "err");
      }
    });
    actions.append(remove);
    const delivery = message?.broadcast
      ? "Рассылка: во входящих у всех, кто ещё не получал это письмо"
      : "Шаблон: само во входящие не кладётся";
    renderScriptHead(messageId, `Письмо в личный кабинет · ${delivery}`, actions);

    const nameCard = document.createElement("div");
    nameCard.className = "extra-field";
    nameCard.innerHTML =
      "<div class=\"beat-meta\"><span class=\"kind message\">Имя персонажа</span><span class=\"who\">sender</span></div>";
    const nameInput = document.createElement("input");
    nameInput.type = "text";
    nameInput.value = message?.sender || senderLine?.text || "";
    nameInput.placeholder = "Как имя видно в кабинете";
    if (senderLine) bindControl(nameInput, senderLine);
    else nameInput.disabled = true;
    nameCard.append(nameInput);
    const nameNote = document.createElement("p");
    nameNote.className = "field-note";
    nameNote.textContent =
      "Меняет отправителя только этого письма. Чтобы переименовать героя везде — кнопка «Герои».";
    nameCard.append(nameNote);
    scriptEl.append(nameCard);

    if (!lines.length) {
      const empty = document.createElement("p");
      empty.className = "empty";
      empty.textContent = "В этом письме нет правимого текста.";
      scriptEl.append(empty);
      return;
    }
    const stack = document.createElement("div");
    stack.className = "extra-stack";
    lines.forEach((line) => {
      const rootField = line.field.split(".")[0];
      stack.append(renderCompactField(line, FIELD_LABEL[rootField]));
    });
    scriptEl.append(stack);
    markHits();
  };

  const renderSelected = () => {
    if (selectedKind === "inbox") renderInbox(selectedId);
    else renderScript(selectedId);
  };

  const renderCharacters = () => {
    characterListEl.innerHTML = "";
    (script?.characters || []).forEach((hero) => {
      const row = document.createElement("div");
      row.className = "character";
      const input = document.createElement("input");
      input.type = "text";
      input.value = hero.name;
      input.disabled = hero.locked;
      const button = document.createElement("button");
      button.type = "button";
      button.className = "primary";
      button.textContent = "Переименовать";
      button.disabled = hero.locked;
      const write = document.createElement("button");
      write.type = "button";
      write.textContent = "Письмо";
      write.disabled = hero.locked && hero.name !== "СИСТЕМА";
      write.addEventListener("click", () => openCompose(hero.name));
      const meta = document.createElement("div");
      meta.className = "meta";
      meta.textContent = hero.locked
        ? `Роль панели · ${hero.nodeCount} подписей · не переименовывается оптом`
        : `${hero.nodeCount} подписей · упоминаний в тексте: ${hero.mentions}`;
      button.addEventListener("click", async () => {
        const next = input.value.trim();
        if (!next || next === hero.name) return;
        if (!confirm(`Переименовать «${hero.name}» → «${next}» во всём сценарии ${gameId}?`)) {
          return;
        }
        setStatus(`Переименовываю ${hero.name}…`);
        try {
          const result = await api(`/api/copydesk/${encodeURIComponent(gameId)}/rename`, {
            method: "POST",
            body: JSON.stringify({ from: hero.name, to: next }),
          });
          applyScript(result);
          const extra = (result.extras || [])
            .map((item) => `${item.file} (${item.count})`)
            .join(", ");
          setStatus(
            `Имя сменено в ${result.contentReplacements} местах` +
              (extra ? `. Ещё: ${extra}` : ""),
            "ok"
          );
        } catch (error) {
          setStatus(error.message, "err");
        }
      });
      row.append(input, button, write, meta);
      characterListEl.append(row);
    });
  };

  const selectItem = (kind, id) => {
    selectedKind = kind;
    selectedId = id;
    renderList();
    renderSelected();
    const hash =
      kind === "inbox"
        ? `#${gameId}/inbox/${encodeURIComponent(id)}`
        : `#${gameId}/${encodeURIComponent(id)}`;
    history.replaceState(null, "", hash);
    listEl.querySelector("button.active")?.scrollIntoView({
      block: "nearest",
      inline: "nearest",
    });
  };

  const loadGame = async (id) => {
    gameId = id;
    selectedId = null;
    selectedKind = "node";
    renderTabs();
    setStatus(`Открываю ${id}…`);
    const data = await api(`/api/copydesk/${encodeURIComponent(id)}/script`);
    applyScript(data, { refreshSelected: false });
    const inboxCount = (data.messages || []).length;
    setStatus(
      `${data.game.title}: ${data.nodes.length} веток, ${data.lines.length} строк` +
        (inboxCount ? `, ${inboxCount} писем кабинета` : ""),
      "ok"
    );
    const hash = decodeURIComponent(location.hash.replace(/^#/, ""));
    const parts = hash.split("/");
    if (parts[0] === id && parts[1] === "inbox" && parts[2]) {
      selectItem("inbox", parts[2]);
    } else if (parts[0] === id && parts[1]) {
      const kind = (data.messages || []).some((item) => item.id === parts[1])
        ? "inbox"
        : data.lines.some((line) => line.bucket === "catalog" && line.nodeId === parts[1])
          ? "catalog"
          : "node";
      selectItem(kind, parts[1]);
    } else if (data.game.startNode) {
      selectItem("node", data.game.startNode);
    }
  };

  const fillRoster = (senders) => {
    roster = senders || [];
    composeSenders.innerHTML = "";
    roster.forEach((hero) => {
      const option = document.createElement("option");
      option.value = hero.name;
      composeSenders.append(option);
    });
  };

  const openCompose = (sender) => {
    if (sheetEl.open) sheetEl.close();
    composeSender.value = sender || composeSender.value || "";
    if (!composeSender.value && script?.characters) {
      const first = script.characters.find((hero) => !hero.locked);
      if (first) composeSender.value = first.name;
    }
    composeEl.showModal();
    (composeSender.value ? composeSubject : composeSender).focus();
  };

  const inboxTarget = () =>
    games.find((game) => game.inbox)?.id || inboxGameId || "irina";

  document.getElementById("btn-compose").addEventListener("click", () => openCompose());
  document.getElementById("btn-characters").addEventListener("click", () => {
    renderCharacters();
    sheetEl.showModal();
  });
  composeForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const sender = composeSender.value.trim();
    const subject = composeSubject.value.trim();
    const body = composeBody.value.trim();
    if (!sender || !subject || !body) return;
    const target = inboxTarget();
    setStatus(`Отправляю письмо от ${sender}…`);
    try {
      const result = await api(`/api/copydesk/${encodeURIComponent(target)}/message`, {
        method: "POST",
        body: JSON.stringify({
          sender,
          subject,
          preview: composePreview.value.trim(),
          body,
          greet: composeGreet.checked,
          broadcast: composeBroadcast.checked,
        }),
      });
      composeEl.close();
      composeSubject.value = "";
      composePreview.value = "";
      composeBody.value = "";
      composeGreet.checked = true;
      composeBroadcast.checked = true;
      if (gameId !== target) {
        await loadGame(target);
      } else {
        applyScript(result);
      }
      selectItem("inbox", result.id);
      setStatus(
        result.messages?.find((item) => item.id === result.id)?.broadcast
          ? `Письмо ${result.id} от ${sender} в кабинете и во входящих`
          : `Шаблон ${result.id} от ${sender} сохранён`,
        "ok"
      );
    } catch (error) {
      setStatus(error.message, "err");
    }
  });
  searchEl.addEventListener("input", () => {
    renderList();
    markHits();
  });
  window.addEventListener("keydown", (event) => {
    if (!(event.metaKey || event.ctrlKey) || event.key.toLowerCase() !== "s") return;
    event.preventDefault();
    const active = document.activeElement;
    const lineId = active?.dataset?.lineId;
    if (lineId) {
      persistLine(lineId, active.value);
      return;
    }
    scriptEl.querySelectorAll("[data-line-id]").forEach((control) => {
      persistLine(control.dataset.lineId, control.value);
    });
  });

  api("/api/copydesk/games")
    .then(async (data) => {
      games = data.games || [];
      inboxGameId = games.find((game) => game.inbox)?.id || "irina";
      const rosterData = await api("/api/copydesk/inbox-roster");
      fillRoster(rosterData.senders);
      if (rosterData.inboxGameId) inboxGameId = rosterData.inboxGameId;
      const hash = decodeURIComponent(location.hash.replace(/^#/, ""));
      const hashGame = hash.split("/")[0];
      renderTabs();
      return loadGame(games.some((game) => game.id === hashGame) ? hashGame : games[0]?.id || "irina");
    })
    .catch((error) => setStatus(error.message, "err"));
})();
