(() => {
  let active = null;

  const getBookEntries = (root) => {
    const bookId = root?.dataset.bookContent;
    const catalog = window.DZ_BOOK_CONTENT?.[bookId];
    if (Array.isArray(catalog) && catalog.length) return catalog;
    return Array.isArray(window.DZ_SWEET_DREAM_BOOK) ? window.DZ_SWEET_DREAM_BOOK : [];
  };

  const destroySweetDreamBook = () => {
    if (!active) return;
    active.cleanup();
    active = null;
  };

  const mountSweetDreamBook = (root, entries) => {
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
    const isChapterLead = kind === "chapter-lead";
    const isChapterText = kind === "chapter-text";
    const isChapter = isChapterLead || isChapterText;
    const isVisual = isCover || isChapterLead;
    const chapter = Number(entry.chapter);
    const chapterLabel = Number.isInteger(chapter) ? String(chapter).padStart(2, "0") : "";

    root.dataset.bookKind = kind;
    if (chapterLabel) root.dataset.bookChapter = chapterLabel;
    else delete root.dataset.bookChapter;
    root.classList.toggle("is-cover", isCover);
    root.classList.toggle("is-preface", kind === "preface");
    root.classList.toggle("is-chapter", isChapter);
    root.classList.toggle("is-chapter-lead", isChapterLead);
    root.classList.toggle("is-chapter-text", isChapterText);
    root.classList.toggle("is-visual", isVisual);
    root.classList.toggle("is-copy", kind === "preface" || isChapterText);
    visual.hidden = !isVisual;
    copy.hidden = isCover;

    if (isVisual) {
      image.src = resolveAsset(entry.image);
      image.alt = entry.alt || "";
      image.width = Number(entry.width) || 1024;
      image.height = Number(entry.height) || 1536;
      image.loading = isCover ? "eager" : "lazy";
    }

    if (isCover) {
      kicker.textContent = "";
      title.hidden = true;
      title.textContent = entry.title || "";
      text.replaceChildren();
    } else {
      kicker.textContent =
        kind === "preface"
          ? "ПРЕДИСЛОВИЕ РЕДАКЦИИ"
          : isChapterLead && chapterLabel
            ? `ГЛАВА ${chapterLabel}`
            : "";
      title.hidden = isChapterText;
      title.textContent = isChapterText ? "" : entry.title || "";
      const nodes = normalizeParagraphs(entry.paragraphs).map((paragraph) => {
        const element = document.createElement("p");
        element.textContent = paragraph;
        return element;
      });
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

  const paginateChapter = (entry) => {
    const tokens = tokenizeParagraphs(entry.paragraphs);
    if (tokens.length === 0) {
      return [makeChapterPage(entry, "chapter-lead", [], 0, 0)];
    }

    if (root.dataset.bookLayout === "balanced") {
      // Keep the illustrated opening, then balance whole paragraphs across text leaves.
      const leadLimit = findPageEnd(entry, "chapter-lead", tokens, 0);
      const isBoundary = (end) => end === tokens.length ||
        tokens[end - 1].paragraphIndex !== tokens[end].paragraphIndex;
      let leadEnd = leadLimit;
      while (leadEnd > 1 && !isBoundary(leadEnd)) leadEnd -= 1;
      if (!isBoundary(leadEnd)) leadEnd = leadLimit;
      const result = [makeChapterPage(entry, "chapter-lead",
        tokensToParagraphs(tokens, 0, leadEnd), 0, leadEnd)];
      const best = new Map([[tokens.length, { count: 0, cost: 0, pages: [] }]]);
      for (let start = tokens.length - 1; start >= leadEnd; start -= 1) {
        const limit = findPageEnd(entry, "chapter-text", tokens, start);
        let choice = null;
        for (let end = start + 1; end <= limit; end += 1) {
          const tail = best.get(end);
          const paragraphs = tokensToParagraphs(tokens, start, end);
          const length = paragraphs.join(" ").length;
          const count = tail.count + 1;
          const cost = tail.cost + length * length + (isBoundary(end) ? 0 : 1000000);
          if (!choice || count < choice.count || (count === choice.count && cost < choice.cost)) {
            choice = { count, cost, pages: [
              makeChapterPage(entry, "chapter-text", paragraphs, start, end), ...tail.pages
            ] };
          }
        }
        best.set(start, choice);
      }
      return [...result, ...best.get(leadEnd).pages];
    }

    const chapterPages = [];
    let start = 0;
    let kind = "chapter-lead";
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

  const paginateBook = () => {
    root.dataset.bookPaginating = "true";
    const nextPages = [];
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
    pageLabel.textContent = `СТР. ${formatPage(currentIndex)} / ${String(pageCount).padStart(2, "0")}`;
    progress.max = String(pageCount);
    progress.value = String(currentIndex + 1);
    progress.setAttribute("aria-valuenow", String(currentIndex + 1));
    progress.setAttribute("aria-valuemax", String(pageCount));
    progress.setAttribute(
      "aria-valuetext",
      chapterLabel
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
        kind === "cover"
          ? "обложка"
          : kind === "preface"
            ? "предисловие редакции"
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
      if (previousEntry.chapter) {
        const previousSentence = Number(previousEntry.sentenceStart) || 0;
        const matchingIndex = pages.findIndex(
          (page) =>
            page.chapter === previousEntry.chapter &&
            page.sentenceStart <= previousSentence &&
            previousSentence < page.sentenceEnd
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
