(() => {
  "use strict";

  const statusEl = document.getElementById("status");
  const listEl = document.getElementById("node-list");
  const countEl = document.getElementById("node-count");
  const searchEl = document.getElementById("search");
  const editorEl = document.getElementById("editor");
  const edgeListEl = document.getElementById("edge-list");
  const inboundListEl = document.getElementById("inbound-list");
  const newIdEl = document.getElementById("new-id");

  let meta = null;
  let graph = null;
  let selectedId = null;
  let currentNode = null;

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
    if (!response.ok) {
      throw new Error(data.error || `HTTP ${response.status}`);
    }
    return data;
  };

  const isFn = (value) =>
    value && typeof value === "object" && typeof value.__fn === "string";

  const renderList = () => {
    if (!meta) return;
    const query = searchEl.value.trim().toLowerCase();
    const nodes = meta.nodes.filter((node) => {
      if (!query) return true;
      return (
        node.id.includes(query) ||
        (node.step || "").toLowerCase().includes(query) ||
        (node.speaker || "").toLowerCase().includes(query)
      );
    });
    countEl.textContent = `(${nodes.length}/${meta.nodeCount})`;
    listEl.innerHTML = "";
    nodes.forEach((node) => {
      const li = document.createElement("li");
      const button = document.createElement("button");
      button.type = "button";
      button.className = node.id === selectedId ? "active" : "";
      button.innerHTML = `<span class="id">${node.id}</span><span class="meta">${
        node.step || "—"
      } · ${node.textKind === "function" ? "fn text" : "text"}${
        node.choicesKind === "function" ? " · fn choices" : ""
      }</span>`;
      button.addEventListener("click", () => selectNode(node.id));
      li.append(button);
      listEl.append(li);
    });
  };

  const field = (label, control, full = false) => {
    const wrap = document.createElement("div");
    wrap.className = full ? "field full" : "field";
    const lab = document.createElement("label");
    lab.textContent = label;
    wrap.append(lab, control);
    return wrap;
  };

  const textInput = (value = "") => {
    const input = document.createElement("input");
    input.type = "text";
    input.value = value || "";
    return input;
  };

  const textArea = (value = "", code = false) => {
    const area = document.createElement("textarea");
    if (code) area.classList.add("code");
    area.value = value || "";
    return area;
  };

  const renderEdges = (id) => {
    edgeListEl.innerHTML = "";
    inboundListEl.innerHTML = "";
    if (!graph) return;

    graph.edges
      .filter((edge) => edge.from === id && edge.to !== id)
      .forEach((edge) => {
        const li = document.createElement("li");
        li.innerHTML = `→ <a href="#">${edge.to}</a> <span class="tag">${
          edge.label || ""
        }</span>`;
        li.querySelector("a").addEventListener("click", (event) => {
          event.preventDefault();
          selectNode(edge.to);
        });
        edgeListEl.append(li);
      });

    graph.edges
      .filter((edge) => edge.to === id && edge.from !== id)
      .forEach((edge) => {
        const li = document.createElement("li");
        li.innerHTML = `← <a href="#">${edge.from}</a> <span class="tag">${
          edge.label || ""
        }</span>`;
        li.querySelector("a").addEventListener("click", (event) => {
          event.preventDefault();
          selectNode(edge.from);
        });
        inboundListEl.append(li);
      });

    if (!edgeListEl.children.length) {
      edgeListEl.innerHTML = "<li>—</li>";
    }
    if (!inboundListEl.children.length) {
      inboundListEl.innerHTML = "<li>—</li>";
    }
  };

  const renderChoiceEditor = (choices, container) => {
    container.innerHTML = "";
    if (isFn(choices)) {
      const area = textArea(choices.__fn, true);
      area.dataset.role = "choices-fn";
      container.append(
        field("choices (function source)", area, true)
      );
      return;
    }

    const list = Array.isArray(choices) ? choices : [];
    const cards = document.createElement("div");
    cards.className = "choices";
    cards.dataset.role = "choices-list";

    list.forEach((choice, index) => {
      const card = document.createElement("div");
      card.className = "choice-card";
      card.dataset.index = String(index);
      // Keep fields the MVP form does not edit (for example image/imageAlt).
      // Saving an unrelated field must not silently strip them from the choice.
      card._choiceSource = choice;
      card.innerHTML = `<header><span>Choice ${index + 1}</span></header>`;
      const label = textInput(choice.label || "");
      label.dataset.field = "label";
      const next = textInput(choice.next || "");
      next.dataset.field = "next";
      const effect = textArea(
        choice.effect ? JSON.stringify(choice.effect, null, 2) : "",
        true
      );
      effect.dataset.field = "effect";
      effect.rows = 4;
      const flags = document.createElement("div");
      flags.className = "effect-row";
      const complete = document.createElement("label");
      complete.innerHTML = `<input type="checkbox" data-field="complete" ${
        choice.complete ? "checked" : ""
      }/> complete`;
      const reject = textInput(choice.reject || "");
      reject.dataset.field = "reject";
      reject.placeholder = "reject reason (optional)";
      const download = textInput(choice.downloadFile || "");
      download.dataset.field = "downloadFile";
      download.placeholder = "downloadFile id";
      flags.append(complete, reject, download);

      const remove = document.createElement("button");
      remove.type = "button";
      remove.textContent = "Remove";
      remove.className = "danger";
      remove.addEventListener("click", () => {
        card.remove();
      });
      card.querySelector("header").append(remove);

      card.append(
        field("label", label),
        field("next", next),
        field("effect JSON", effect, true),
        field("flags", flags, true)
      );
      cards.append(card);
    });

    const add = document.createElement("button");
    add.type = "button";
    add.textContent = "Add choice";
    add.addEventListener("click", () => {
      const nextChoices = collectChoices(container);
      if (isFn(nextChoices)) return;
      nextChoices.push({ label: "ПРОДОЛЖИТЬ", next: "" });
      renderChoiceEditor(nextChoices, container);
    });

    container.append(cards, add);
  };

  const collectChoices = (container) => {
    const fn = container.querySelector('[data-role="choices-fn"]');
    if (fn) return { __fn: fn.value };

    const cards = [...container.querySelectorAll(".choice-card")];
    return cards.map((card) => {
      const get = (name) => card.querySelector(`[data-field="${name}"]`);
      const choice = { ...(card._choiceSource || {}) };

      // Rebuild only the fields exposed by this form. Unknown fields remain
      // intact so the editor is forward-compatible with richer choice data.
      [
        "label",
        "next",
        "reject",
        "downloadFile",
        "complete",
        "effect",
      ].forEach((key) => delete choice[key]);

      choice.label = get("label")?.value || "";
      const next = get("next")?.value?.trim();
      if (next) choice.next = next;
      const reject = get("reject")?.value?.trim();
      if (reject) choice.reject = reject;
      const downloadFile = get("downloadFile")?.value?.trim();
      if (downloadFile) choice.downloadFile = downloadFile;
      if (get("complete")?.checked) choice.complete = true;
      const effectRaw = get("effect")?.value?.trim();
      if (effectRaw) {
        choice.effect = JSON.parse(effectRaw);
      }
      return choice;
    });
  };

  const renderEditor = (node) => {
    editorEl.innerHTML = "";
    const head = document.createElement("div");
    head.className = "editor-head";
    head.innerHTML = `<div><h2>${node.id}</h2><p class="meta-line" style="color:var(--muted);margin:0.3rem 0 0;font-size:0.85rem">Function fields keep full JS source. Static choices edit as forms.</p></div>`;
    const actions = document.createElement("div");
    actions.style.display = "flex";
    actions.style.gap = "0.45rem";
    const saveBtn = document.createElement("button");
    saveBtn.type = "button";
    saveBtn.className = "primary";
    saveBtn.textContent = "Save node";
    const deleteBtn = document.createElement("button");
    deleteBtn.type = "button";
    deleteBtn.className = "danger";
    deleteBtn.textContent = "Delete";
    actions.append(saveBtn, deleteBtn);
    head.append(actions);
    editorEl.append(head);

    const grid = document.createElement("div");
    grid.className = "grid";

    const step = textInput(node.step || "");
    const speaker = textInput(node.speaker || "");
    const media = textInput(node.media || "");
    const feedState = textInput(node.feedState || "");
    const signal = textInput(
      node.signal === undefined || node.signal === null ? "" : String(node.signal)
    );
    const autoNext = textInput(node.autoNext || "");
    const still = textInput(node.still || "");
    const stillAlt = textInput(node.stillAlt || "");
    const feedMode = textInput(node.feedMode || "");

    grid.append(
      field("step", step),
      field("speaker", speaker),
      field("media", media),
      field("feedState", feedState),
      field("signal", signal),
      field("autoNext", autoNext),
      field("still", still),
      field("stillAlt", stillAlt),
      field("feedMode", feedMode)
    );
    editorEl.append(grid);

    const textBlock = document.createElement("div");
    if (isFn(node.text)) {
      const area = textArea(node.text.__fn, true);
      area.dataset.role = "text-fn";
      textBlock.append(field("text (function source)", area, true));
    } else {
      const area = textArea(node.text || "");
      area.dataset.role = "text";
      textBlock.append(field("text", area, true));
    }
    editorEl.append(textBlock);

    if (node.interruptedText) {
      const area = isFn(node.interruptedText)
        ? textArea(node.interruptedText.__fn, true)
        : textArea(node.interruptedText);
      area.dataset.role = isFn(node.interruptedText)
        ? "interrupted-fn"
        : "interrupted";
      editorEl.append(field("interruptedText", area, true));
    }

    if (node.input) {
      const inputBox = document.createElement("div");
      inputBox.className = "choice-card";
      const kind = textInput(node.input.kind || "");
      kind.dataset.role = "input-kind";
      const label = textInput(node.input.label || "");
      label.dataset.role = "input-label";
      const placeholder = textInput(node.input.placeholder || "");
      placeholder.dataset.role = "input-placeholder";
      const submitLabel = textInput(node.input.submitLabel || "");
      submitLabel.dataset.role = "input-submit";
      const next = textInput(node.input.next || "");
      next.dataset.role = "input-next";
      inputBox.append(
        field("input.kind", kind),
        field("input.label", label),
        field("input.placeholder", placeholder),
        field("input.submitLabel", submitLabel),
        field("input.next", next)
      );
      editorEl.append(field("input", inputBox, true));
    }

    const choicesWrap = document.createElement("div");
    choicesWrap.dataset.role = "choices-wrap";
    renderChoiceEditor(node.choices, choicesWrap);
    editorEl.append(field("choices", choicesWrap, true));

    saveBtn.addEventListener("click", async () => {
      try {
        const payload = {
          step: step.value.trim(),
          speaker: speaker.value.trim(),
          media: media.value.trim() || undefined,
          feedState: feedState.value.trim() || undefined,
          autoNext: autoNext.value.trim() || undefined,
          still: still.value.trim() || undefined,
          stillAlt: stillAlt.value.trim() || undefined,
          feedMode: feedMode.value.trim() || undefined,
        };
        if (signal.value.trim() !== "") {
          const num = Number(signal.value);
          payload.signal = Number.isFinite(num) ? num : signal.value.trim();
        }

        const textFn = editorEl.querySelector('[data-role="text-fn"]');
        const textPlain = editorEl.querySelector('[data-role="text"]');
        payload.text = textFn
          ? { __fn: textFn.value }
          : textPlain?.value || "";

        const interruptedFn = editorEl.querySelector('[data-role="interrupted-fn"]');
        const interruptedPlain = editorEl.querySelector('[data-role="interrupted"]');
        if (interruptedFn) payload.interruptedText = { __fn: interruptedFn.value };
        if (interruptedPlain) payload.interruptedText = interruptedPlain.value;

        if (node.input) {
          payload.input = {
            kind: editorEl.querySelector('[data-role="input-kind"]').value.trim(),
            label: editorEl.querySelector('[data-role="input-label"]').value,
            placeholder: editorEl.querySelector('[data-role="input-placeholder"]').value,
            submitLabel: editorEl.querySelector('[data-role="input-submit"]').value,
            next: editorEl.querySelector('[data-role="input-next"]').value.trim(),
          };
        }

        payload.choices = collectChoices(choicesWrap);

        // preserve terminal / delay flags if present
        if (node.terminal) payload.terminal = node.terminal;
        if (node.delayChoicesUntilEnd) {
          payload.delayChoicesUntilEnd = node.delayChoicesUntilEnd;
        }
        if (node.glitchIn) payload.glitchIn = node.glitchIn;
        if (node.flashOnEnd) payload.flashOnEnd = node.flashOnEnd;

        setStatus(`Saving ${node.id}…`);
        saveBtn.disabled = true;
        const result = await api(`/api/nodes/${encodeURIComponent(node.id)}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
        currentNode = result.node;
        setStatus(`Saved ${node.id}`, "ok");
        await refreshMeta();
        renderEdges(node.id);
      } catch (error) {
        setStatus(`Save failed: ${error.message}`, "err");
      } finally {
        saveBtn.disabled = false;
      }
    });

    deleteBtn.addEventListener("click", async () => {
      if (!confirm(`Delete node "${node.id}"?`)) return;
      try {
        await api(`/api/nodes/${encodeURIComponent(node.id)}`, {
          method: "DELETE",
        });
        selectedId = null;
        currentNode = null;
        editorEl.innerHTML = '<p class="empty">Узел удалён. Выберите другой.</p>';
        setStatus(`Deleted ${node.id}`, "ok");
        await refreshMeta();
        renderEdges("");
      } catch (error) {
        setStatus(`Delete failed: ${error.message}`, "err");
      }
    });
  };

  const selectNode = async (id) => {
    selectedId = id;
    renderList();
    setStatus(`Loading ${id}…`);
    try {
      currentNode = await api(`/api/nodes/${encodeURIComponent(id)}`);
      renderEditor(currentNode);
      renderEdges(id);
      setStatus(`Editing ${id}`);
      history.replaceState(null, "", `#${encodeURIComponent(id)}`);
    } catch (error) {
      setStatus(error.message, "err");
    }
  };

  const refreshMeta = async () => {
    meta = await api("/api/meta");
    graph = await api("/api/graph");
    renderList();
  };

  document.getElementById("btn-validate").addEventListener("click", async () => {
    setStatus("Validating…");
    try {
      const result = await api("/api/validate", { method: "POST", body: "{}" });
      setStatus(
        (result.stdout || result.stderr || "done").trim(),
        result.ok ? "ok" : "err"
      );
    } catch (error) {
      setStatus(error.message, "err");
    }
  });

  document.getElementById("btn-export").addEventListener("click", async () => {
    setStatus("Exporting IRINA_DIALOGUES.md…");
    try {
      const result = await api("/api/export", { method: "POST", body: "{}" });
      setStatus(
        (result.stdout || result.stderr || "done").trim(),
        result.ok ? "ok" : "err"
      );
    } catch (error) {
      setStatus(error.message, "err");
    }
  });

  document.getElementById("btn-create").addEventListener("click", async () => {
    const id = newIdEl.value.trim();
    if (!id) return;
    try {
      await api("/api/nodes", {
        method: "POST",
        body: JSON.stringify({ id }),
      });
      newIdEl.value = "";
      setStatus(`Created ${id}`, "ok");
      await refreshMeta();
      selectNode(id);
    } catch (error) {
      setStatus(error.message, "err");
    }
  });

  searchEl.addEventListener("input", renderList);

  refreshMeta()
    .then(() => {
      setStatus(
        `Loaded ${meta.nodeCount} nodes · artifacts ${meta.artifactCount} · files ${meta.fileCount}`,
        "ok"
      );
      const hash = decodeURIComponent(location.hash.replace(/^#/, ""));
      if (hash) selectNode(hash);
    })
    .catch((error) => setStatus(error.message, "err"));
})();
