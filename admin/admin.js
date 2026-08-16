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

  const statusEl = document.getElementById("status");
  const tabsEl = document.getElementById("game-tabs");
  const listEl = document.getElementById("node-list");
  const countEl = document.getElementById("node-count");
  const searchEl = document.getElementById("search");
  const scriptEl = document.getElementById("script");
  const sheetEl = document.getElementById("characters");
  const characterListEl = document.getElementById("character-list");

  let games = [];
  let gameId = "irina";
  let script = null;
  let selectedId = null;
  let selectedKind = "node";

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

  const applyScript = (data) => {
    script = data;
    renderList();
    if (selectedId) renderSelected();
    renderCharacters();
  };

  const nodeLines = (nodeId, bucket) =>
    (script?.lines || []).filter((line) => {
      if (line.nodeId !== nodeId || line.kind === "name") return false;
      if (bucket) return line.bucket === bucket;
      return line.bucket !== "inbox";
    });

  const inboxLines = (messageId) =>
    nodeLines(messageId, "inbox").filter((line) => line.field !== "sender");

  const inboxSenderLine = (messageId) =>
    (script?.lines || []).find(
      (line) =>
        line.bucket === "inbox" &&
        line.nodeId === messageId &&
        line.field === "sender"
    );

  const matchesQuery = (node, query, bucket) => {
    if (!query) return true;
    const lines = nodeLines(node.id, bucket);
    return (
      node.id.toLowerCase().includes(query) ||
      (node.speaker || node.sender || "").toLowerCase().includes(query) ||
      (node.preview || "").toLowerCase().includes(query) ||
      (node.subject || "").toLowerCase().includes(query) ||
      lines.some((line) => line.text.toLowerCase().includes(query))
    );
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

    const append = (node, kind) => {
      const li = document.createElement("li");
      const button = document.createElement("button");
      const active = kind === selectedKind && node.id === selectedId;
      button.type = "button";
      button.className = active ? "active" : "";
      button.innerHTML = `<span class="id">${node.id}</span><span class="who">${
        node.sender || node.speaker || "—"
      }</span><span class="preview">${(node.subject || node.preview || "").replace(/</g, "&lt;")}</span>`;
      button.addEventListener("click", () => selectItem(kind, node.id));
      li.append(button);
      listEl.append(li);
    };

    sceneNodes.forEach((node) => append(node, "node"));
    if (inbox.length) {
      const div = document.createElement("li");
      div.className = "divider";
      div.textContent = "КАБИНЕТ";
      listEl.append(div);
      inbox.forEach((message) => append(message, "inbox"));
    }
    if (catalogs.length) {
      const div = document.createElement("li");
      div.className = "divider";
      div.textContent = "КАТАЛОГИ";
      listEl.append(div);
      catalogs.forEach((node) => append(node, "catalog"));
    }
  };

  const persistLine = async (line, next, saveButton) => {
    if (next === line.text) return;
    if (saveButton) saveButton.disabled = true;
    setStatus(`Сохраняю ${line.field}…`);
    try {
      const nextScript = await api(`/api/copydesk/${encodeURIComponent(gameId)}/line`, {
        method: "PUT",
        body: JSON.stringify({ id: line.id, expected: line.text, text: next }),
      });
      applyScript(nextScript);
      setStatus("Сохранено", "ok");
    } catch (error) {
      setStatus(error.message, "err");
    } finally {
      if (saveButton) saveButton.disabled = line.fn && !line.unique;
    }
  };

  const renderLineCard = (line, label) => {
    const card = document.createElement("article");
    card.className = `card ${line.kind}`;
    const lockedFn = line.fn && !line.unique;
    const fieldLabel = label || FIELD_LABEL[line.field] || KIND_LABEL[line.kind] || line.kind;
    card.innerHTML = `<header><span class="kind ${line.kind}">${fieldLabel}</span><span class="who">${
      line.speaker || line.field
    }</span></header>`;
    const area = document.createElement("textarea");
    area.value = line.text;
    area.disabled = lockedFn;
    const footer = document.createElement("footer");
    const note = document.createElement("span");
    if (lockedFn) {
      note.className = "warn";
      note.textContent = "Строка внутри функции не уникальна — правка через Cursor.";
    } else if (line.fn) {
      note.textContent = "Уникальная строка внутри функции";
    } else if (!line.unique) {
      note.textContent = `Такая же фраза ещё ${line.occurrences - 1} раз — сохранится только здесь`;
    } else {
      note.textContent = line.field;
    }
    const save = document.createElement("button");
    save.type = "button";
    save.className = "primary";
    save.textContent = "Сохранить";
    save.disabled = lockedFn;
    save.addEventListener("click", () => persistLine(line, area.value, save));
    area.addEventListener("keydown", (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "s") {
        event.preventDefault();
        persistLine(line, area.value, save);
      }
    });
    footer.append(note, save);
    card.append(area, footer);
    scriptEl.append(card);
  };

  const renderScript = (nodeId) => {
    const node = script.nodes.find((item) => item.id === nodeId);
    const lines = nodeLines(nodeId);
    scriptEl.innerHTML = "";
    const head = document.createElement("div");
    head.className = "script-head";
    head.innerHTML = `<h2>${nodeId}</h2><p>${
      node ? `${node.speaker || "—"} · ${lines.length} строк` : `${lines.length} строк`
    }</p>`;
    scriptEl.append(head);

    if (node?.outbound?.length) {
      const out = document.createElement("div");
      out.className = "out";
      node.outbound.forEach((edge) => {
        const button = document.createElement("button");
        button.type = "button";
        button.textContent = `${edge.label || "→"} → ${edge.to}`;
        button.addEventListener("click", () => selectItem("node", edge.to));
        out.append(button);
      });
      scriptEl.append(out);
    }

    if (!lines.length) {
      const empty = document.createElement("p");
      empty.className = "empty";
      empty.textContent = "В этой ветке нет правимого текста.";
      scriptEl.append(empty);
      return;
    }

    lines.forEach((line) => renderLineCard(line));
  };

  const renderInbox = (messageId) => {
    const message = (script.messages || []).find((item) => item.id === messageId);
    const lines = inboxLines(messageId);
    const senderLine = inboxSenderLine(messageId);
    scriptEl.innerHTML = "";

    const head = document.createElement("div");
    head.className = "script-head";
    const title = document.createElement("h2");
    title.textContent = messageId;
    const meta = document.createElement("p");
    meta.textContent = "Письмо в личный кабинет";
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
    head.append(title, meta, actions);
    scriptEl.append(head);

    const nameCard = document.createElement("article");
    nameCard.className = "card message";
    nameCard.innerHTML = "<header><span class=\"kind message\">Имя персонажа</span><span class=\"who\">sender</span></header>";
    const nameInput = document.createElement("input");
    nameInput.type = "text";
    nameInput.value = message?.sender || senderLine?.text || "";
    nameInput.placeholder = "Как имя видно в кабинете";
    const nameFooter = document.createElement("footer");
    const nameNote = document.createElement("span");
    nameNote.textContent = "Меняет отправителя только этого письма. Чтобы переименовать героя везде — кнопка «Герои».";
    const nameSave = document.createElement("button");
    nameSave.type = "button";
    nameSave.className = "primary";
    nameSave.textContent = "Сменить имя";
    nameSave.disabled = !senderLine;
    nameSave.addEventListener("click", () => {
      if (!senderLine) return;
      const next = nameInput.value.trim();
      if (!next) return;
      persistLine(senderLine, next, nameSave);
    });
    nameFooter.append(nameNote, nameSave);
    nameCard.append(nameInput, nameFooter);
    scriptEl.append(nameCard);

    if (!lines.length) {
      const empty = document.createElement("p");
      empty.className = "empty";
      empty.textContent = "В этом письме нет правимого текста.";
      scriptEl.append(empty);
      return;
    }
    lines.forEach((line) => {
      const rootField = line.field.split(".")[0];
      renderLineCard(line, FIELD_LABEL[rootField]);
    });
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
      row.append(input, button, meta);
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
    applyScript(data);
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
        : "node";
      selectItem(kind, parts[1]);
    } else if (data.game.startNode) {
      selectItem("node", data.game.startNode);
    }
  };

  document.getElementById("btn-characters").addEventListener("click", () => {
    renderCharacters();
    sheetEl.showModal();
  });
  searchEl.addEventListener("input", renderList);

  api("/api/copydesk/games")
    .then((data) => {
      games = data.games || [];
      const hash = decodeURIComponent(location.hash.replace(/^#/, ""));
      const hashGame = hash.split("/")[0];
      renderTabs();
      return loadGame(games.some((game) => game.id === hashGame) ? hashGame : games[0]?.id || "irina");
    })
    .catch((error) => setStatus(error.message, "err"));
})();
