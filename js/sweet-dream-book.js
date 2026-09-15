(() => {
  let active = null;

  const getBookEntries = (root) => {
    const bookId = root?.dataset.bookContent;
    const catalog = window.DZ_BOOK_CONTENT?.[bookId];
    if (Array.isArray(catalog) && catalog.length) return catalog;
    return Array.isArray(window.DZ_SWEET_DREAM_BOOK) ? window.DZ_SWEET_DREAM_BOOK : [];
  };

  const mountContinuousBook = (root, entries) => {
    const reader = root.querySelector("[data-book-scroll-reader]");
    const content = root.querySelector("[data-book-scroll-content]");
    const currentLabel = root.querySelector("[data-book-scroll-current]");
    const progress = root.querySelector("[data-book-scroll-progress]");
    const toc = root.querySelector("[data-book-scroll-toc]");
    const scrollTop = root.querySelector("[data-book-scroll-top]");

    if (!reader || !content || !currentLabel || !progress || !Array.isArray(entries) || !entries.length) {
      return null;
    }

    const abortController = new AbortController();
    const { signal } = abortController;
    const resolveAsset = (value) => {
      const source = String(value || "");
      if (/^(?:\.\.\/|\/|https?:)/.test(source)) return source;
      return `../${source}`;
    };
    const normalizeParagraphs = (paragraphs) =>
      (Array.isArray(paragraphs) ? paragraphs : [])
        .map((paragraph) => String(paragraph || "").trim())
        .filter(Boolean);
    const escapeRegExp = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const renderParagraph = (paragraph, terms) => {
      const element = document.createElement("p");
      const uniqueTerms = Array.from(
        new Set((Array.isArray(terms) ? terms : []).map((term) => String(term || "").trim()).filter(Boolean))
      ).sort((left, right) => right.length - left.length);
      if (!uniqueTerms.length) {
        element.textContent = paragraph;
        return element;
      }

      const matcher = new RegExp(uniqueTerms.map(escapeRegExp).join("|"), "giu");
      let cursor = 0;
      for (const match of paragraph.matchAll(matcher)) {
        const start = match.index ?? 0;
        if (start > cursor) element.append(document.createTextNode(paragraph.slice(cursor, start)));
        const term = document.createElement("strong");
        term.className = "sweet-dream-book__term";
        term.textContent = match[0];
        element.append(term);
        cursor = start + match[0].length;
      }
      if (cursor < paragraph.length) element.append(document.createTextNode(paragraph.slice(cursor)));
      return element;
    };
    const getPlan = (entry) => {
      if (root.dataset.bookContent !== "right-path-continuism") return {};
      return window.DZ_RIGHT_PATH_SCROLL_PLAN?.[String(entry.page)] || {};
    };
    const getMedia = (entry, plan) => {
      const media = [];
      if (entry.image) {
        media.push({
          image: entry.image,
          alt: entry.alt,
          width: entry.width,
          height: entry.height,
          caption: entry.caption
        });
      }
      if (Array.isArray(plan.media)) media.push(...plan.media);
      return media;
    };
    const getChapter = (entry) => {
      const match = String(entry.kicker || "").match(/ГЛАВА\s+(\d{1,2})/u);
      return match ? String(Number(match[1])).padStart(2, "0") : "";
    };
    const makeSectionId = (entry, index) => {
      if (entry.kind === "cover") return "right-path-cover";
      const chapter = getChapter(entry);
      const isChapterLead = /^ГЛАВА\s+\d{1,2}/u.test(String(entry.kicker || ""));
      if (chapter && isChapterLead) return `right-path-chapter-${chapter}`;
      return `right-path-entry-${String(index + 1).padStart(2, "0")}`;
    };
    const appendText = (copy, entry) => {
      const text = document.createElement("div");
      text.className = "sweet-dream-book__scroll-text";
      normalizeParagraphs(entry.paragraphs).forEach((paragraph) => {
        text.append(renderParagraph(paragraph, entry.emphasisTerms));
      });
      if (entry.warning) {
        const warning = document.createElement("p");
        warning.className = "sweet-dream-book__warning";
        warning.textContent = entry.warning;
        text.append(warning);
      }
      if (text.childElementCount) copy.append(text);
    };
    const renderMedia = (media, section, isCover) => {
      if (!media.length) return null;
      const wrapper = document.createElement("div");
      wrapper.className = "sweet-dream-book__scroll-media";
      if (media.length > 1) wrapper.classList.add("has-multiple");

      media.forEach((item, index) => {
        const figure = document.createElement("figure");
        const width = Number(item.width) || 1024;
        const height = Number(item.height) || 1536;
        const isWide = width > height;
        figure.className = "sweet-dream-book__scroll-media-item";
        if (isWide) figure.classList.add("is-wide");
        if (isCover && index === 0) figure.classList.add("is-cover");

        const frame = document.createElement("div");
        frame.className = "sweet-dream-book__scroll-media-frame";
        const image = document.createElement("img");
        image.alt = item.alt || "";
        image.width = width;
        image.height = height;
        image.decoding = "async";
        image.loading = isCover && index === 0 ? "eager" : "lazy";
        if (isCover && index === 0) image.fetchPriority = "high";
        image.src = resolveAsset(item.image);
        frame.append(image);
        figure.append(frame);
        if (item.caption) {
          const caption = document.createElement("figcaption");
          caption.textContent = item.caption;
          figure.append(caption);
        }
        wrapper.append(figure);
      });
      return wrapper;
    };
    const renderArtifact = (artifact) => {
      const kind = String(artifact.kind || "note").replace(/[^a-z0-9_-]/giu, "-");
      const aside = document.createElement("aside");
      aside.className = `sweet-dream-book__scroll-artifact is-${kind}`;
      aside.setAttribute("aria-label", artifact.label || "Документальная вставка");

      if (artifact.label) {
        const label = document.createElement("p");
        label.className = "sweet-dream-book__scroll-artifact-label";
        label.textContent = artifact.label;
        aside.append(label);
      }
      if (artifact.title) {
        const title = document.createElement("h4");
        title.textContent = artifact.title;
        aside.append(title);
      }

      if (kind === "redaction") {
        const comparison = document.createElement("div");
        comparison.className = "sweet-dream-book__scroll-redaction";
        [
          ["ИСХОДНАЯ ЗАПИСЬ", artifact.before],
          ["ПОСЛЕ КОРРЕКТОРА", artifact.after]
        ].forEach(([labelText, value]) => {
          const cell = document.createElement("div");
          cell.className = "sweet-dream-book__scroll-redaction-cell";
          const label = document.createElement("span");
          label.textContent = labelText;
          const text = document.createElement("p");
          text.textContent = value || "";
          cell.append(label, text);
          comparison.append(cell);
        });
        aside.append(comparison);
      } else if (kind === "question") {
        const prompt = document.createElement("p");
        prompt.className = "sweet-dream-book__scroll-question-prompt";
        prompt.textContent = artifact.prompt || "";
        aside.append(prompt);
        const lines = document.createElement("div");
        lines.className = "sweet-dream-book__scroll-question-lines";
        const lineCount = Math.max(1, Math.min(8, Number(artifact.lines) || 4));
        for (let index = 0; index < lineCount; index += 1) {
          const line = document.createElement("span");
          line.setAttribute("aria-hidden", "true");
          lines.append(line);
        }
        aside.append(lines);
      } else if (Array.isArray(artifact.items) && artifact.items.length) {
        const items = document.createElement("div");
        items.className = "sweet-dream-book__scroll-artifact-items";
        artifact.items.forEach((item, index) => {
          const itemNode = document.createElement("div");
          itemNode.className = "sweet-dream-book__scroll-artifact-item";
          const itemLabel = document.createElement("span");
          itemLabel.textContent = item.label || `ЭЛЕМЕНТ ${index + 1}`;
          const itemText = document.createElement("p");
          itemText.textContent = item.text || "";
          itemNode.append(itemLabel, itemText);
          items.append(itemNode);
          if (kind === "flow" && index < artifact.items.length - 1) {
            const arrow = document.createElement("span");
            arrow.className = "sweet-dream-book__scroll-artifact-arrow";
            arrow.setAttribute("aria-hidden", "true");
            arrow.textContent = "→";
            items.append(arrow);
          }
        });
        aside.append(items);
      }

      if (artifact.note) {
        const note = document.createElement("p");
        note.className = "sweet-dream-book__scroll-artifact-note";
        note.textContent = artifact.note;
        aside.append(note);
      }
      return aside;
    };
    const renderEntry = (entry, index) => {
      const plan = getPlan(entry);
      const media = getMedia(entry, plan);
      const chapter = getChapter(entry);
      const section = document.createElement("section");
      const sectionId = makeSectionId(entry, index);
      const isCover = entry.kind === "cover";
      const hasPrimaryImage = Boolean(entry.image);
      const label = isCover ? "ОБЛОЖКА" : entry.kicker || entry.title || "ПРОДОЛЖЕНИЕ";
      section.className = "sweet-dream-book__scroll-section";
      section.id = sectionId;
      section.dataset.bookScrollEntry = "true";
      section.dataset.bookScrollPage = String(entry.page || index + 1);
      section.dataset.bookScrollLabel = label;
      if (chapter) section.dataset.bookScrollChapter = chapter;
      if (chapter && /^ГЛАВА\s+\d{1,2}/u.test(String(entry.kicker || ""))) {
        section.dataset.bookScrollChapterAnchor = sectionId;
      }
      if (isCover) section.classList.add("is-cover");
      if (media.length) section.classList.add("has-media");
      if (Array.isArray(plan.artifacts) && plan.artifacts.length) section.classList.add("has-artifact");

      const body = document.createElement("div");
      body.className = "sweet-dream-book__scroll-section-body";
      const copy = document.createElement("div");
      copy.className = "sweet-dream-book__scroll-copy";
      if (entry.kicker && !isCover) {
        const kicker = document.createElement("p");
        kicker.className = "sweet-dream-book__copy-kicker";
        kicker.textContent = entry.kicker;
        copy.append(kicker);
      }
      if (entry.title) {
        const title = document.createElement("h3");
        title.textContent = entry.title;
        copy.append(title);
      }
      appendText(copy, entry);

      const mediaNode = renderMedia(media, section, isCover);
      if (hasPrimaryImage || isCover) {
        if (mediaNode) body.append(mediaNode);
        body.append(copy);
      } else {
        body.append(copy);
        if (mediaNode) body.append(mediaNode);
      }
      section.append(body);

      if (Array.isArray(plan.artifacts)) {
        plan.artifacts.forEach((artifact) => section.append(renderArtifact(artifact)));
      }
      return section;
    };

    const sections = entries.map(renderEntry);
    content.replaceChildren(...sections);
    const chapterSections = sections.filter((section) => section.dataset.bookScrollChapterAnchor);
    const tocLinks = [];
    if (toc) {
      toc.replaceChildren();
      chapterSections.forEach((section) => {
        const item = document.createElement("li");
        const link = document.createElement("a");
        link.href = `#${section.id}`;
        const number = document.createElement("span");
        number.className = "sweet-dream-book__scroll-toc-number";
        number.textContent = section.dataset.bookScrollChapter || "";
        const title = document.createElement("span");
        title.textContent = entries.find((entry) => String(entry.page) === section.dataset.bookScrollPage)?.title || "Глава";
        link.append(number, title);
        item.append(link);
        toc.append(item);
        tocLinks.push({ link, section });
      });
    }

    let updateFrame = 0;
    let activeSection = null;
    const updateScrollState = () => {
      updateFrame = 0;
      const maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
      const ratio = maxScroll ? Math.min(1, Math.max(0, window.scrollY / maxScroll)) : 0;
      progress.value = String(Math.round(ratio * 100));
      progress.setAttribute("aria-valuenow", String(Math.round(ratio * 100)));
      progress.setAttribute("aria-valuetext", `Положение в книге: ${Math.round(ratio * 100)} процентов`);

      const marker = Math.min(280, Math.max(120, window.innerHeight * 0.32));
      let nextSection = sections[0];
      sections.forEach((section) => {
        if (section.getBoundingClientRect().top <= marker) nextSection = section;
      });
      if (!nextSection || nextSection === activeSection) return;
      activeSection = nextSection;
      currentLabel.textContent = activeSection.dataset.bookScrollLabel || "ОБЛОЖКА";
      let currentChapterSection = chapterSections[0] || null;
      chapterSections.forEach((section) => {
        if (section.getBoundingClientRect().top <= marker) currentChapterSection = section;
      });
      tocLinks.forEach(({ link, section }) => {
        const isCurrent = section === currentChapterSection;
        link.classList.toggle("is-current", isCurrent);
        if (isCurrent) link.setAttribute("aria-current", "location");
        else link.removeAttribute("aria-current");
      });
      const chapterAnchor = activeSection.dataset.bookScrollChapterAnchor;
      if (chapterAnchor && window.location.hash !== `#${chapterAnchor}`) {
        window.history.replaceState(window.history.state, "", `${window.location.pathname}${window.location.search}#${chapterAnchor}`);
      }
    };
    const scheduleScrollState = () => {
      if (updateFrame) return;
      updateFrame = window.requestAnimationFrame(updateScrollState);
    };
    const findHashTarget = () => {
      const hash = window.location.hash.replace(/^#/, "");
      if (!hash) return null;
      const legacyMatch = hash.match(/^leaf-(\d{1,2})$/u);
      if (legacyMatch) {
        return sections.find((section) => section.dataset.bookScrollPage === String(Number(legacyMatch[1]))) || null;
      }
      return document.getElementById(hash);
    };
    const jumpToHash = () => {
      const target = findHashTarget();
      if (!target) return;
      target.scrollIntoView({ behavior: "auto", block: "start" });
      scheduleScrollState();
    };
    const initialHash = window.location.hash;

    window.addEventListener("scroll", scheduleScrollState, { passive: true, signal });
    window.addEventListener("resize", scheduleScrollState, { signal });
    window.addEventListener("hashchange", jumpToHash, { signal });
    scrollTop?.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "auto" });
      window.history.replaceState(
        window.history.state,
        "",
        `${window.location.pathname}${window.location.search}`
      );
      scheduleScrollState();
    }, { signal });
    window.requestAnimationFrame(() => {
      jumpToHash();
      scheduleScrollState();
    });
    if (initialHash) {
      window.setTimeout(() => {
        if (window.location.hash === initialHash) jumpToHash();
      }, 160);
    }

    root.dataset.bookScrollMounted = "true";
    root.dataset.bookReady = "true";
    return () => {
      if (updateFrame) window.cancelAnimationFrame(updateFrame);
      abortController.abort();
      content.replaceChildren();
      delete root.dataset.bookScrollMounted;
      delete root.dataset.bookReady;
    };
  };

  const destroySweetDreamBook = () => {
    if (!active) return;
    active.cleanup();
    active = null;
  };

  const mountSweetDreamBook = (root, entries) => {
  if (root.dataset.bookLayout === "scroll") {
    const cleanup = mountContinuousBook(root, entries);
    if (cleanup) active = { root, cleanup };
    return;
  }
  const image = root.querySelector("[data-book-image]");
  const visual = root.querySelector(".sweet-dream-book__visual");
  const copy = root.querySelector(".sweet-dream-book__copy");
  const kicker = root.querySelector("[data-book-kicker]");
  const title = root.querySelector("[data-book-title]");
  const text = root.querySelector("[data-book-text]");
  const pageLabel = root.querySelector("[data-book-page-label]");
  const progress = root.querySelector("[data-book-progress]");
  const announcer = root.querySelector("[data-book-announcer]");
  const leaf = root.querySelector("[data-book-leaf]");
  const previous = root.querySelector("[data-book-previous]");
  const next = root.querySelector("[data-book-next]");
  const swipeGuide = root.querySelector("[data-book-swipe-guide]");

  if (!image || !visual || !copy || !kicker || !title || !text || !pageLabel || !progress || !leaf) {
    return;
  }

  const normalizeParagraphs = (paragraphs) =>
    (Array.isArray(paragraphs) ? paragraphs : [])
      .map((paragraph) => String(paragraph || "").trim())
      .filter(Boolean);

  const escapeRegExp = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  const renderParagraph = (paragraph, terms) => {
    const element = document.createElement("p");
    const uniqueTerms = Array.from(
      new Set((Array.isArray(terms) ? terms : []).map((term) => String(term || "").trim()).filter(Boolean))
    ).sort((left, right) => right.length - left.length);
    if (!uniqueTerms.length) {
      element.textContent = paragraph;
      return element;
    }

    const matcher = new RegExp(uniqueTerms.map(escapeRegExp).join("|"), "giu");
    let cursor = 0;
    for (const match of paragraph.matchAll(matcher)) {
      const start = match.index ?? 0;
      if (start > cursor) element.append(document.createTextNode(paragraph.slice(cursor, start)));
      const term = document.createElement("strong");
      term.className = "sweet-dream-book__term";
      term.textContent = match[0];
      element.append(term);
      cursor = start + match[0].length;
    }
    if (cursor < paragraph.length) element.append(document.createTextNode(paragraph.slice(cursor)));
    return element;
  };

  const tokenizeParagraphs = (paragraphs) => {
    const tokens = [];
    const segmenter =
      typeof Intl?.Segmenter === "function"
        ? new Intl.Segmenter("ru", { granularity: "sentence" })
        : null;
    normalizeParagraphs(paragraphs).forEach((paragraph, paragraphIndex) => {
      const sentences = segmenter
        ? Array.from(segmenter.segment(paragraph), ({ segment }) => segment.trim()).filter(Boolean)
        : paragraph.split(/(?<=[.!?…])\s+/u);
      sentences.forEach((sentence) => {
        tokens.push({ paragraphIndex, sentence: sentence.trim() });
      });
    });
    return tokens;
  };

  const tokensToParagraphs = (tokens, start, end) => {
    const paragraphs = [];
    let currentParagraph = -1;
    for (let index = start; index < end; index += 1) {
      const token = tokens[index];
      if (token.paragraphIndex !== currentParagraph) {
        paragraphs.push(token.sentence);
        currentParagraph = token.paragraphIndex;
      } else {
        paragraphs[paragraphs.length - 1] += ` ${token.sentence}`;
      }
    }
    return paragraphs;
  };

  let pages = [];
  let pageCount = 0;
  let currentIndex = 0;
  let pointerStart = null;
  const paperTurnSource =
    window.TyndexGameUiAudioLibrary?.resolve("shared.paper.unfold")?.href ||
    "../assets/audio/guest/red-room/shift/sfx-paper-unfold.mp3";
  const paperTurnSound = typeof Audio === "function" ? new Audio(paperTurnSource) : null;

  if (paperTurnSound) {
    paperTurnSound.preload = "auto";
    paperTurnSound.volume = 0.36;
  }

  const formatPage = (index) => String(index + 1).padStart(2, "0");

  const resolveAsset = (value) => {
    const source = String(value || "");
    if (/^(?:\.\.\/|\/|https?:)/.test(source)) return source;
    return `../${source}`;
  };

  const applyEntry = (entry) => {
    const kind = entry.kind || "preface";
    const isCover = kind === "cover";
    const isPlate = kind === "plate";
    const isPage = kind === "page";
    const isChapterLead = kind === "chapter-lead";
    const isChapterText = kind === "chapter-text";
    const isChapter = isChapterLead || isChapterText;
    const isVisual = Boolean(entry.image) && (isCover || isChapterLead || isPlate || isPage);
    const chapter = Number(entry.chapter);
    const chapterLabel = Number.isInteger(chapter) ? String(chapter).padStart(2, "0") : "";

    root.dataset.bookKind = kind;
    if (isPlate) root.dataset.bookPlateScale = entry.scale || "full";
    else delete root.dataset.bookPlateScale;
    root.classList.toggle("is-plate", isPlate);
    if (chapterLabel) root.dataset.bookChapter = chapterLabel;
    else delete root.dataset.bookChapter;
    root.classList.toggle("is-cover", isCover);
    root.classList.toggle("is-preface", kind === "preface");
    root.classList.toggle("is-page", isPage);
    root.classList.toggle("is-text-only", !isVisual && (isCover || isChapter || isPage));
    root.classList.toggle("is-chapter", isChapter);
    root.classList.toggle("is-chapter-lead", isChapterLead);
    root.classList.toggle("is-chapter-text", isChapterText);
    root.classList.toggle("is-visual", isVisual);
    root.classList.toggle("is-wide-visual", isVisual && Number(entry.width) > Number(entry.height));
    root.classList.toggle(
      "is-copy",
      kind === "preface" || isChapterText || isPage || (isCover && !isVisual) || (isChapterLead && !isVisual)
    );
    visual.hidden = !isVisual;
    copy.hidden = isPlate || (isCover && isVisual);

    if (isVisual) {
      image.src = resolveAsset(entry.image);
      image.alt = entry.alt || "";
      image.width = Number(entry.width) || 1024;
      image.height = Number(entry.height) || 1536;
      image.loading = isCover ? "eager" : "lazy";
    }

    if (isPlate) {
      kicker.textContent = "";
      title.hidden = true;
      title.textContent = entry.title || "";
      text.replaceChildren();
    } else {
      kicker.textContent =
        entry.kicker ||
        (isCover
          ? "ОБЛОЖКА"
          : kind === "preface"
          ? "ПРЕДИСЛОВИЕ РЕДАКЦИИ"
          : isChapterLead && chapterLabel
            ? `ГЛАВА ${chapterLabel}`
            : "");
      title.hidden = isChapterText || !entry.title || (isCover && isVisual);
      title.textContent = title.hidden ? "" : entry.title;
      const nodes = normalizeParagraphs(entry.paragraphs).map((paragraph) =>
        renderParagraph(paragraph, entry.emphasisTerms)
      );
      if (entry.warning) {
        const warning = document.createElement("p");
        warning.className = "sweet-dream-book__warning";
        warning.textContent = entry.warning;
        nodes.push(warning);
      }
      text.replaceChildren(...nodes);
    }

    return { kind, isChapter, chapterLabel };
  };

  const makeChapterPage = (entry, kind, paragraphs, sentenceStart, sentenceEnd) => ({
    kind,
    chapter: Number(entry.chapter),
    title: entry.title,
    image: kind === "chapter-lead" ? entry.image : undefined,
    alt: kind === "chapter-lead" ? entry.alt : undefined,
    width: kind === "chapter-lead" ? entry.width : undefined,
    height: kind === "chapter-lead" ? entry.height : undefined,
    paragraphs,
    sentenceStart,
    sentenceEnd
  });

  const entryFits = (entry) => {
    applyEntry(entry);
    if (leaf.clientHeight <= 0 || copy.clientHeight <= 0) return false;
    return leaf.scrollHeight <= leaf.clientHeight + 1 && copy.scrollHeight <= copy.clientHeight + 1;
  };

  const findPageEnd = (entry, kind, tokens, start) => {
    let low = start + 1;
    let high = tokens.length;
    let best = start;

    while (low <= high) {
      const end = Math.floor((low + high) / 2);
      const candidate = makeChapterPage(
        entry,
        kind,
        tokensToParagraphs(tokens, start, end),
        start,
        end
      );
      if (entryFits(candidate)) {
        best = end;
        low = end + 1;
      } else {
        high = end - 1;
      }
    }

    return best > start ? best : Math.min(tokens.length, start + 1);
  };

  const paginateChapterSegment = (entry) => {
    const tokens = tokenizeParagraphs(entry.paragraphs);
    const firstKind = entry.continuation ? "chapter-text" : "chapter-lead";
    if (tokens.length === 0) {
      return [makeChapterPage(entry, "chapter-lead", [], 0, 0)];
    }

    if (root.dataset.bookLayout === "balanced") {
      // Illustrated chapters reserve their opening visual. Text-only chapters
      // must balance the whole chapter, or a greedy lead leaves a tiny tail.
      const hasVisualLead = Boolean(entry.image);
      const leadLimit = hasVisualLead ? findPageEnd(entry, firstKind, tokens, 0) : 0;
      const isBoundary = (end) => end === tokens.length ||
        tokens[end - 1].paragraphIndex !== tokens[end].paragraphIndex;
      let leadEnd = leadLimit;
      if (hasVisualLead) {
        while (leadEnd > 1 && !isBoundary(leadEnd)) leadEnd -= 1;
        if (!isBoundary(leadEnd)) leadEnd = leadLimit;
      }
      const result = hasVisualLead
        ? [makeChapterPage(entry, firstKind,
          tokensToParagraphs(tokens, 0, leadEnd), 0, leadEnd)]
        : [];
      const best = new Map([[tokens.length, { count: 0, cost: 0, pages: [] }]]);
      for (let start = tokens.length - 1; start >= leadEnd; start -= 1) {
        const kind = !hasVisualLead && start === 0 ? firstKind : "chapter-text";
        const limit = findPageEnd(entry, kind, tokens, start);
        let choice = null;
        for (let end = start + 1; end <= limit; end += 1) {
          const tail = best.get(end);
          const paragraphs = tokensToParagraphs(tokens, start, end);
          const length = paragraphs.join(" ").length;
          const count = tail.count + 1;
          const cost = tail.cost + length * length + (isBoundary(end) ? 0 : 1000000);
          if (!choice || count < choice.count || (count === choice.count && cost < choice.cost)) {
            choice = { count, cost, pages: [
              makeChapterPage(entry, kind, paragraphs, start, end), ...tail.pages
            ] };
          }
        }
        best.set(start, choice);
      }
      return [...result, ...best.get(leadEnd).pages];
    }

    const chapterPages = [];
    let start = 0;
    let kind = firstKind;
    while (start < tokens.length) {
      const end = findPageEnd(entry, kind, tokens, start);
      chapterPages.push(
        makeChapterPage(entry, kind, tokensToParagraphs(tokens, start, end), start, end)
      );
      start = end;
      kind = "chapter-text";
    }

    return chapterPages;
  };

  const paginateChapter = (entry) => {
    if (!entry.inserts?.length) return paginateChapterSegment(entry);
    const result = [];
    let paragraphStart = 0;
    let sentenceOffset = 0;
    const appendText = (end) => {
      const paragraphs = entry.paragraphs.slice(paragraphStart, end);
      if (!paragraphs.length) return;
      const segment = { ...entry, paragraphs, continuation: paragraphStart > 0 };
      result.push(...paginateChapterSegment(segment).map((page) => ({
        ...page,
        sentenceStart: page.sentenceStart + sentenceOffset,
        sentenceEnd: page.sentenceEnd + sentenceOffset
      })));
      sentenceOffset += tokenizeParagraphs(paragraphs).length;
      paragraphStart = end;
    };
    entry.inserts.forEach((insert) => {
      appendText(insert.afterParagraph);
      result.push({ ...insert, kind: "plate", chapter: Number(entry.chapter), title: entry.title });
    });
    appendText(entry.paragraphs.length);
    return result;
  };

  const paginateBook = () => {
    root.dataset.bookPaginating = "true";
    const nextPages = [];
    if (root.dataset.bookLayout === "explicit") {
      nextPages.push(...entries.map((entry) => ({ ...entry })));
      return nextPages;
    }
    entries.forEach((entry) => {
      if (entry.kind === "cover" || entry.kind === "preface") {
        nextPages.push({ ...entry });
      } else {
        nextPages.push(...paginateChapter(entry));
      }
    });
    return nextPages;
  };

  const getHashIndex = () => {
    const match = window.location.hash.match(/^#leaf-(\d{1,2})$/);
    if (!match) return 0;
    const index = Number(match[1]) - 1;
    return Number.isInteger(index) && index >= 0 && index < pageCount ? index : 0;
  };

  const updateHash = (index) => {
    const hash = `#leaf-${formatPage(index)}`;
    if (window.location.hash === hash) return;
    window.history.replaceState(
      window.history.state,
      "",
      `${window.location.pathname}${window.location.search}${hash}`
    );
  };

  const prefetch = (index) => {
    if (index < 0 || index >= pageCount) return;
    const plate = pages[index];
    if (!plate?.image) return;
    const preload = new Image();
    preload.decoding = "async";
    preload.src = resolveAsset(plate.image);
  };

  const playPaperTurn = () => {
    if (!paperTurnSound) return;
    paperTurnSound.currentTime = 0;
    paperTurnSound.play().catch(() => {});
  };

  const updateSwipeGuide = () => {
    if (!swipeGuide) return;
    const visible = currentIndex === 0 && root.dataset.bookSwipeGuideSeen !== "true";
    swipeGuide.hidden = !visible;
  };

  const render = (index, { announce = true, focus = false, syncHash = true, sound = false } = {}) => {
    if (pageCount === 0) return;
    const safeIndex = Math.min(pageCount - 1, Math.max(0, index));
    const entry = pages[safeIndex];
    currentIndex = safeIndex;
    if (currentIndex !== 0) root.dataset.bookSwipeGuideSeen = "true";
    updateSwipeGuide();

    if (sound) playPaperTurn();

    const { kind, chapterLabel } = applyEntry(entry);
    root.dataset.bookPage = formatPage(currentIndex);
    const isRightPathCover = root.dataset.bookContent === "right-path-continuism" && kind === "cover";
    pageLabel.textContent = isRightPathCover
      ? "ОБЛОЖКА"
      : `СТР. ${formatPage(currentIndex)} / ${String(pageCount).padStart(2, "0")}`;
    progress.max = String(pageCount);
    progress.value = String(currentIndex + 1);
    progress.setAttribute("aria-valuenow", String(currentIndex + 1));
    progress.setAttribute("aria-valuemax", String(pageCount));
    progress.setAttribute(
      "aria-valuetext",
      isRightPathCover
        ? "Обложка книги"
        : chapterLabel
        ? `Страница ${formatPage(currentIndex)} из ${pageCount}, глава ${chapterLabel}`
        : `Страница ${formatPage(currentIndex)} из ${pageCount}`
    );

    if (previous) {
      previous.disabled = currentIndex === 0;
      previous.setAttribute("aria-label", currentIndex === 0 ? "Первая страница" : "Назад");
    }
    if (next) {
      next.disabled = currentIndex === pageCount - 1;
      next.setAttribute("aria-label", currentIndex === pageCount - 1 ? "Последняя страница" : "Далее");
    }

    if (syncHash) updateHash(currentIndex);
    prefetch(currentIndex - 1);
    prefetch(currentIndex + 1);

    if (announce && announcer) {
      const place =
        kind === "plate"
          ? `иллюстрация: ${entry.alt || entry.title}`
          : kind === "cover"
          ? "обложка"
          : kind === "preface"
            ? "предисловие редакции"
            : kind === "page"
              ? entry.image
                ? `иллюстрация: ${entry.alt || entry.title || entry.kicker || "без описания"}`
                : `текстовая страница: ${entry.title || entry.kicker || "без заголовка"}`
        : `глава ${chapterLabel}: ${entry.title}`;
      announcer.textContent = `Открыта страница ${formatPage(currentIndex)}: ${place}`;
    }
    if (focus) {
      const reader = root.querySelector(".sweet-dream-book__reader");
      reader?.scrollIntoView({ block: "start", behavior: "auto" });
      leaf.focus({ preventScroll: true });
    }
  };

  const move = (delta) => {
    const nextIndex = currentIndex + delta;
    if (nextIndex < 0 || nextIndex >= pageCount) return;
    root.dataset.bookSwipeGuideSeen = "true";
    render(nextIndex, { focus: true, sound: true });
  };

  let initialized = false;
  let resizeTimer = 0;

  const rebuildPages = ({ preservePosition = false } = {}) => {
    const previousEntry = preservePosition ? pages[currentIndex] : null;
    pages = paginateBook();
    pageCount = pages.length;

    let targetIndex = getHashIndex();
    if (previousEntry) {
      if (previousEntry.kind === "plate") {
        const matchingIndex = pages.findIndex((page) => page.kind === "plate" && page.image === previousEntry.image);
        targetIndex = matchingIndex >= 0 ? matchingIndex : targetIndex;
      } else if (previousEntry.chapter) {
        const previousSentence = Number(previousEntry.sentenceStart) || 0;
        const matchingIndex = pages.findIndex(
          (page) =>
            page.chapter === previousEntry.chapter &&
            page.sentenceStart <= previousSentence &&
            previousSentence < page.sentenceEnd
        );
        targetIndex = matchingIndex >= 0 ? matchingIndex : targetIndex;
      } else if (previousEntry.page) {
        const matchingIndex = pages.findIndex(
          (page) => page.kind === "page" && page.page === previousEntry.page
        );
        targetIndex = matchingIndex >= 0 ? matchingIndex : targetIndex;
      } else {
        const matchingIndex = pages.findIndex((page) => page.kind === previousEntry.kind);
        targetIndex = matchingIndex >= 0 ? matchingIndex : targetIndex;
      }
    }

    root.dataset.bookReady = "true";
    render(targetIndex, { announce: false, syncHash: preservePosition });
    delete root.dataset.bookPaginating;
  };

  const initialize = () => {
    if (initialized || !document.body.classList.contains("staff-mode")) return false;
    initialized = true;
    rebuildPages();
    return true;
  };

  const abortController = new AbortController();
  const { signal } = abortController;
  let modeObserver = null;

  const cleanup = () => {
    modeObserver?.disconnect();
    abortController.abort();
    window.clearTimeout(resizeTimer);
    if (paperTurnSound) {
      paperTurnSound.pause();
    }
    delete root.dataset.bookReady;
  };

  window.requestAnimationFrame(() => {
    if (initialize()) return;
    modeObserver = new MutationObserver(() => {
      if (!initialize()) return;
      modeObserver.disconnect();
    });
    modeObserver.observe(document.body, { attributes: true, attributeFilter: ["class"] });
  });

  window.addEventListener("resize", () => {
    if (!initialized) return;
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => rebuildPages({ preservePosition: true }), 140);
  }, { signal });

  previous?.addEventListener("click", () => move(-1), { signal });
  next?.addEventListener("click", () => move(1), { signal });

  leaf.addEventListener("pointerdown", (event) => {
    if (event.pointerType === "mouse") return;
    pointerStart = { id: event.pointerId, x: event.clientX, y: event.clientY };
    try {
      leaf.setPointerCapture?.(event.pointerId);
    } catch (error) {
      // Synthetic or already-released pointers may not be capturable.
    }
  }, { signal });

  leaf.addEventListener("pointerup", (event) => {
    if (!pointerStart || pointerStart.id !== event.pointerId) return;
    const deltaX = event.clientX - pointerStart.x;
    const deltaY = event.clientY - pointerStart.y;
    pointerStart = null;
    if (Math.abs(deltaX) < 56 || Math.abs(deltaX) < Math.abs(deltaY) * 1.25) return;
    event.preventDefault();
    move(deltaX < 0 ? 1 : -1);
  }, { signal });

  leaf.addEventListener("pointercancel", () => {
    pointerStart = null;
  }, { signal });

  window.addEventListener("hashchange", () => {
    if (!pageCount) return;
    const requested = getHashIndex();
    if (requested !== currentIndex) render(requested, { announce: true, syncHash: false });
  }, { signal });

  document.addEventListener("keydown", (event) => {
    if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) return;
    const target = event.target;
    if (target instanceof HTMLElement && ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)) return;
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      move(-1);
    }
    if (event.key === "ArrowRight") {
      event.preventDefault();
      move(1);
    }
  }, { signal });

  active = { root, cleanup };
  };

  const initSweetDreamBook = () => {
    const root = document.querySelector("[data-sweet-dream-book]");
    if (!root) {
      destroySweetDreamBook();
      return;
    }
    const entries = getBookEntries(root);
    if (!entries.length) return;
    if (active?.root === root) return;
    destroySweetDreamBook();
    mountSweetDreamBook(root, entries);
  };

  window.DZInitSweetDreamBook = initSweetDreamBook;
  initSweetDreamBook();
})();
