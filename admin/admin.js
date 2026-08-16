(() => {
  "use strict";

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
    if (selectedId) renderScript(selectedId);
    renderCharacters();
  };

  const nodeLines = (nodeId) =>
    (script?.lines || []).filter(
      (line) => line.nodeId === nodeId && line.kind !== "name"
    );

  const matchesQuery = (node, query) => {
    if (!query) return true;
    const lines = nodeLines(node.id);
    return (
      node.id.toLowerCase().includes(query) ||
      (node.speaker || "").toLowerCase().includes(query) ||
      (node.preview || "").toLowerCase().includes(query) ||
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
    const sceneNodes = script.nodes.filter((node) => matchesQuery(node, query));
    const catalogs = [...new Set(
      script.lines.filter((line) => line.bucket === "catalog").map((line) => line.nodeId)
    )]
      .map((id) => ({
        id,
        speaker: "каталог",
        preview: "Письма, чеки, подарки, штампы",
        catalog: true,
      }))
      .filter((node) => matchesQuery(node, query) || nodeLines(node.id).some((line) => line.text.toLowerCase().includes(query)));

    countEl.textContent = `(${sceneNodes.length})`;
    listEl.innerHTML = "";

    const append = (node) => {
      const li = document.createElement("li");
      const button = document.createElement("button");
      button.type = "button";
      button.className = node.id === selectedId ? "active" : "";
      button.innerHTML = `<span class="id">${node.id}</span><span class="who">${
        node.speaker || "—"
      }</span><span class="preview">${(node.preview || "").replace(/</g, "&lt;")}</span>`;
      button.addEventListener("click", () => selectNode(node.id));
      li.append(button);
      listEl.append(li);
    };

    sceneNodes.forEach(append);
    if (catalogs.length) {
      const div = document.createElement("li");
      div.className = "divider";
      div.textContent = "КАТАЛОГИ";
      listEl.append(div);
      catalogs.forEach(append);
    }
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
        button.addEventListener("click", () => selectNode(edge.to));
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

    lines.forEach((line) => {
      const card = document.createElement("article");
      card.className = `card ${line.kind}`;
      const lockedFn = line.fn && !line.unique;
      card.innerHTML = `<header><span class="kind ${line.kind}">${
        KIND_LABEL[line.kind] || line.kind
      }</span><span class="who">${line.speaker || line.field}</span></header>`;
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
      const persist = async () => {
        const next = area.value;
        if (next === line.text) return;
        save.disabled = true;
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
          save.disabled = lockedFn;
        }
      };
      save.addEventListener("click", persist);
      area.addEventListener("keydown", (event) => {
        if ((event.metaKey || event.ctrlKey) && event.key === "s") {
          event.preventDefault();
          persist();
        }
      });
      footer.append(note, save);
      card.append(area, footer);
      scriptEl.append(card);
    });
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
        ? `Роль панели · ${hero.nodeCount} узлов · не переименовывается оптом`
        : `${hero.nodeCount} узлов · упоминаний в тексте: ${hero.mentions}`;
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

  const selectNode = (id) => {
    selectedId = id;
    renderList();
    renderScript(id);
    history.replaceState(null, "", `#${gameId}/${encodeURIComponent(id)}`);
  };

  const loadGame = async (id) => {
    gameId = id;
    selectedId = null;
    renderTabs();
    setStatus(`Открываю ${id}…`);
    const data = await api(`/api/copydesk/${encodeURIComponent(id)}/script`);
    applyScript(data);
    setStatus(
      `${data.game.title}: ${data.nodes.length} веток, ${data.lines.length} строк`,
      "ok"
    );
    const hash = decodeURIComponent(location.hash.replace(/^#/, ""));
    const [hashGame, hashNode] = hash.split("/");
    if (hashGame === id && hashNode) selectNode(hashNode);
    else if (data.game.startNode) selectNode(data.game.startNode);
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
