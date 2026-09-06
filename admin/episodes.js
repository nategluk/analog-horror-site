(() => {
  "use strict";

  const statusEl = document.getElementById("status");
  const listEl = document.getElementById("episode-list");
  const countEl = document.getElementById("episode-count");
  const searchEl = document.getElementById("search");
  const editorEl = document.getElementById("editor");
  const newBtn = document.getElementById("btn-new");

  let catalog = { episodes: [], themes: [], platforms: [], tags: [], next: null };
  let selectedId = null;
  let draft = false;
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

  const applyCatalog = (data) => {
    catalog = data;
    renderList();
  };

  const selectedEpisode = () =>
    (catalog.episodes || []).find((item) => item.id === selectedId) || null;

  const sourceCount = (episode) =>
    Object.values(episode.sources || {}).filter(Boolean).length;

  const displayTitle = (title) =>
    String(title || "").replace(/^Детский Жир №\d{3}\s+[—-]\s+/, "") || title;

  const matchesQuery = (episode, query) => {
    if (!query) return true;
    const hay = [
      episode.id,
      episode.title,
      episode.description,
      episode.tag,
      episode.theme,
      ...Object.values(episode.sources || {}),
    ]
      .join(" ")
      .toLocaleLowerCase("ru");
    return hay.includes(query);
  };

  const renderList = () => {
    const query = searchEl.value.trim().toLocaleLowerCase("ru");
    const episodes = [...(catalog.episodes || [])]
      .filter((episode) => matchesQuery(episode, query))
      .sort((a, b) => Number(a.sortOrder) - Number(b.sortOrder));

    countEl.textContent = `(${catalog.count ?? catalog.episodes.length})`;
    listEl.innerHTML = "";

    if (draft) {
      const li = document.createElement("li");
      const button = document.createElement("button");
      button.type = "button";
      button.className = selectedId === "__draft__" ? "active" : "";
      button.innerHTML =
        '<span class="id">черновик</span><span class="who">ещё не сохранён</span><span class="preview">Новый выпуск</span>';
      button.addEventListener("click", () => selectDraft());
      li.append(button);
      listEl.prepend(li);
    }

    episodes.forEach((episode) => {
      const li = document.createElement("li");
      const button = document.createElement("button");
      const n = sourceCount(episode);
      button.type = "button";
      button.className = !draft && episode.id === selectedId ? "active" : "";
      button.innerHTML = `<span class="id">${escapeHtml(episode.id)}</span><span class="who">${escapeHtml(
        episode.tag || episode.theme || ""
      )} · ${n} площад${n === 1 ? "ка" : n >= 2 && n <= 4 ? "ки" : "ок"}</span><span class="preview">${escapeHtml(
        displayTitle(episode.title)
      )}</span>`;
      button.addEventListener("click", () => selectEpisode(episode.id));
      li.append(button);
      listEl.append(li);
    });
  };

  const field = (labelText, control, hint) => {
    const wrap = document.createElement("label");
    wrap.append(labelText, control);
    if (hint) {
      const note = document.createElement("span");
      note.className = "field-note";
      note.textContent = hint;
      wrap.append(note);
    }
    return wrap;
  };

  const input = (name, value, attrs = {}) => {
    const el = document.createElement(attrs.tag || "input");
    if (!attrs.tag) el.type = attrs.type || "text";
    el.name = name;
    el.value = value ?? "";
    if (attrs.placeholder) el.placeholder = attrs.placeholder;
    if (attrs.list) el.setAttribute("list", attrs.list);
    if (attrs.rows) el.rows = attrs.rows;
    if (attrs.step) el.step = attrs.step;
    return el;
  };

  const collectForm = (form) => {
    const data = new FormData(form);
    const sources = {};
    (catalog.platforms || []).forEach((platform) => {
      sources[platform] = String(data.get(`source-${platform}`) || "").trim();
    });
    return {
      id: String(data.get("id") || "").trim(),
      sortOrder: data.get("sortOrder"),
      title: String(data.get("title") || "").trim(),
      description: String(data.get("description") || "").trim(),
      theme: String(data.get("theme") || "").trim(),
      tag: String(data.get("tag") || "").trim(),
      sources,
    };
  };

  const renderEditor = (episode, { isDraft = false } = {}) => {
    editorEl.innerHTML = "";
    const form = document.createElement("form");
    form.className = "episode-form";
    form.id = "episode-form";

    const head = document.createElement("div");
    head.className = "script-head";
    const heading = document.createElement("h2");
    heading.textContent = isDraft ? "Новый выпуск" : episode.id;
    const meta = document.createElement("p");
    meta.textContent = isDraft
      ? "Сохранится в content/archive/episode-catalog.js и обновит счётчик на странице архива."
      : `${sourceCount(episode)} площадок · порядок ${episode.sortOrder}`;
    head.append(heading, meta);
    form.append(head);

    const idInput = input("id", episode.id, { placeholder: "EP-057" });
    const sortInput = input("sortOrder", episode.sortOrder, {
      type: "number",
      step: "0.1",
    });
    const titleInput = input("title", episode.title, {
      placeholder: "Детский Жир №057 — Название",
    });
    const descriptionInput = input("description", episode.description, {
      tag: "textarea",
      rows: 5,
    });

    const themeSelect = document.createElement("select");
    themeSelect.name = "theme";
    (catalog.themes || []).forEach((theme) => {
      const option = document.createElement("option");
      option.value = theme.id;
      option.textContent = `${theme.label} · ${theme.tag}`;
      if (theme.id === episode.theme) option.selected = true;
      themeSelect.append(option);
    });

    const tagInput = input("tag", episode.tag, { list: "episode-tags" });
    const tagList = document.createElement("datalist");
    tagList.id = "episode-tags";
    (catalog.tags || []).forEach((tag) => {
      const option = document.createElement("option");
      option.value = tag;
      tagList.append(option);
    });

    themeSelect.addEventListener("change", () => {
      const theme = (catalog.themes || []).find((item) => item.id === themeSelect.value);
      const known = new Set((catalog.themes || []).map((item) => item.tag));
      if (theme && (!tagInput.value.trim() || known.has(tagInput.value.trim()))) {
        tagInput.value = theme.tag;
      }
    });

    form.append(
      field("id", idInput),
      field("Порядок в списке", sortInput, "Обычные выпуски — целые числа. Спецвыпуски можно вставить как 30.1."),
      field("Заголовок", titleInput),
      field("Описание", descriptionInput),
      field("Тема / иконка", themeSelect),
      field("Бирка на карточке", tagInput)
    );
    form.append(tagList);

    const sourcesHead = document.createElement("h3");
    sourcesHead.className = "episode-sources-head";
    sourcesHead.textContent = "Площадки";
    form.append(sourcesHead);

    const platformLabel = {
      boosty: "Boosty",
      instagram: "Instagram",
      facebook: "Facebook",
      youtube: "YouTube",
      tiktok: "TikTok",
    };
    (catalog.platforms || []).forEach((platform) => {
      const label = platformLabel[platform] || platform;
      form.append(
        field(
          label,
          input(`source-${platform}`, episode.sources?.[platform] || "", {
            type: "url",
            placeholder: "https://",
          })
        )
      );
    });

    const actions = document.createElement("div");
    actions.className = "episode-actions";
    const save = document.createElement("button");
    save.type = "submit";
    save.className = "primary";
    save.textContent = isDraft ? "Добавить в архив" : "Сохранить";
    actions.append(save);

    if (!isDraft) {
      const remove = document.createElement("button");
      remove.type = "button";
      remove.className = "danger";
      remove.textContent = "Удалить";
      remove.addEventListener("click", () => removeEpisode(episode.id));
      actions.append(remove);
    }

    form.append(actions);
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      persistEpisode(collectForm(form), isDraft ? null : episode.id);
    });

    editorEl.append(form);
    idInput.focus();
  };

  const persistEpisode = (payload, previousId) => {
    saveChain = saveChain.then(async () => {
      setStatus(`Сохраняю ${payload.id}…`);
      try {
        const path = previousId
          ? `/api/copydesk/episodes/${encodeURIComponent(previousId)}`
          : "/api/copydesk/episodes";
        const data = await api(path, {
          method: previousId ? "PUT" : "POST",
          body: JSON.stringify(payload),
        });
        draft = false;
        selectedId = data.episode.id;
        applyCatalog(data);
        renderEditor(data.episode);
        history.replaceState(null, "", `#${encodeURIComponent(data.episode.id)}`);
        setStatus(
          `${data.episode.id} записан. В архиве ${data.archivePhrase}.`,
          "ok"
        );
      } catch (error) {
        setStatus(error.message, "err");
      }
    });
    return saveChain;
  };

  const removeEpisode = async (id) => {
    if (!confirm(`Удалить «${id}» из архива выпусков?`)) return;
    setStatus(`Удаляю ${id}…`);
    try {
      const data = await api(`/api/copydesk/episodes/${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      selectedId = null;
      draft = false;
      applyCatalog(data);
      editorEl.innerHTML = '<p class="empty">Выпуск удалён. Выберите другой слева.</p>';
      history.replaceState(null, "", "#");
      setStatus(`Удалено. В архиве ${data.archivePhrase}.`, "ok");
    } catch (error) {
      setStatus(error.message, "err");
    }
  };

  const selectEpisode = (id) => {
    draft = false;
    selectedId = id;
    const episode = selectedEpisode();
    renderList();
    if (!episode) {
      editorEl.innerHTML = '<p class="empty">Выпуск не найден.</p>';
      return;
    }
    renderEditor(episode);
    history.replaceState(null, "", `#${encodeURIComponent(id)}`);
  };

  const selectDraft = () => {
    const next = catalog.next || { id: "EP-000", sortOrder: 0, title: "Детский Жир №000 — " };
    draft = true;
    selectedId = "__draft__";
    renderList();
    renderEditor(
      {
        id: next.id,
        sortOrder: next.sortOrder,
        title: next.title,
        description: "",
        theme: "broadcast",
        tag: "ЭФИР",
        sources: {},
      },
      { isDraft: true }
    );
    history.replaceState(null, "", "#new");
  };

  searchEl.addEventListener("input", renderList);
  newBtn.addEventListener("click", selectDraft);

  window.addEventListener("keydown", (event) => {
    if (!(event.metaKey || event.ctrlKey) || event.key.toLowerCase() !== "s") return;
    const form = document.getElementById("episode-form");
    if (!form) return;
    event.preventDefault();
    form.requestSubmit();
  });

  api("/api/copydesk/episodes")
    .then((data) => {
      applyCatalog(data);
      setStatus(`Архив: ${data.archivePhrase}. Следующий слот ${data.next.id}.`, "ok");
      const hash = decodeURIComponent(location.hash.replace(/^#/, ""));
      if (hash === "new") selectDraft();
      else if (hash && data.episodes.some((item) => item.id === hash)) selectEpisode(hash);
    })
    .catch((error) => setStatus(error.message, "err"));
})();
