(() => {
  const root = document.querySelector("[data-sweet-dream-book]");
  const entries = Array.isArray(window.DZ_SWEET_DREAM_BOOK)
    ? window.DZ_SWEET_DREAM_BOOK
    : [];

  if (!root || root.dataset.bookReady === "true" || entries.length === 0) return;

  const image = root.querySelector("[data-book-image]");
  const imageCaption = root.querySelector("[data-book-caption]");
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

  if (!image || !imageCaption || !visual || !copy || !kicker || !title || !text || !pageLabel || !progress || !leaf) {
    return;
  }

  const expandPages = (source) => {
    const pages = [];
    let lastChapter = null;
    source.forEach((entry) => {
      const chapter = Number(entry.chapter);
      if (chapter !== lastChapter) {
        pages.push({
          kind: "plate",
          chapter,
          title: entry.title,
          image: entry.image,
          alt: entry.alt,
          caption: entry.caption
        });
        lastChapter = chapter;
      }
      pages.push({
        kind: "text",
        chapter,
        title: entry.title,
        continuation: entry.continuation === true,
        paragraphs: Array.isArray(entry.paragraphs) ? entry.paragraphs : []
      });
    });
    return pages;
  };

  root.dataset.bookReady = "true";
  const pages = expandPages(entries);
  const pageCount = pages.length;
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

  const render = (index, { announce = true, focus = false, syncHash = true, sound = false } = {}) => {
    const safeIndex = Math.min(pageCount - 1, Math.max(0, index));
    const entry = pages[safeIndex];
    currentIndex = safeIndex;

    if (sound) playPaperTurn();

    const chapter = Number(entry.chapter) || currentIndex + 1;
    const chapterLabel = String(chapter).padStart(2, "0");
    const isPlate = entry.kind === "plate";
    const isContinuation = !isPlate && entry.continuation === true;

    root.dataset.bookPage = formatPage(currentIndex);
    root.dataset.bookChapter = chapterLabel;
    root.dataset.bookKind = isPlate ? "plate" : "text";
    root.classList.toggle("is-plate", isPlate);
    root.classList.toggle("is-text", !isPlate);
    root.classList.toggle("is-continuation", isContinuation);
    visual.hidden = !isPlate;
    copy.hidden = isPlate;

    if (isPlate) {
      image.src = resolveAsset(entry.image);
      image.alt = entry.alt;
      image.width = 1024;
      image.height = 1536;
      image.loading = currentIndex === 0 ? "eager" : "lazy";
      imageCaption.textContent = entry.caption;
      kicker.textContent = `ГЛАВА ${chapterLabel}`;
      title.hidden = false;
      title.textContent = entry.title;
      text.replaceChildren();
    } else {
      kicker.textContent = isContinuation
        ? `ГЛАВА ${chapterLabel} · ПРОДОЛЖЕНИЕ`
        : `ГЛАВА ${chapterLabel}`;
      title.hidden = isContinuation;
      title.textContent = entry.title;
      text.replaceChildren(
        ...(entry.paragraphs || []).map((paragraph) => {
          const element = document.createElement("p");
          element.textContent = paragraph;
          return element;
        })
      );
    }
    pageLabel.textContent = `СТР. ${formatPage(currentIndex)} / ${String(pageCount).padStart(2, "0")}`;
    progress.max = String(pageCount);
    progress.value = String(currentIndex + 1);
    progress.setAttribute("aria-valuenow", String(currentIndex + 1));
    progress.setAttribute("aria-valuemax", String(pageCount));
    progress.setAttribute(
      "aria-valuetext",
      `Страница ${formatPage(currentIndex)} из ${pageCount}, глава ${chapterLabel}`
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
      const place = isPlate
        ? `иллюстрация, ${entry.title}`
        : isContinuation
          ? `${entry.title}, продолжение`
          : entry.title;
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
    render(nextIndex, { focus: true, sound: true });
  };

  render(getHashIndex(), { announce: false, syncHash: false });

  previous?.addEventListener("click", () => move(-1));
  next?.addEventListener("click", () => move(1));

  leaf.addEventListener("pointerdown", (event) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    pointerStart = { id: event.pointerId, x: event.clientX, y: event.clientY };
    try {
      leaf.setPointerCapture?.(event.pointerId);
    } catch (error) {
      // Synthetic or already-released pointers may not be capturable.
    }
  });

  leaf.addEventListener("pointerup", (event) => {
    if (!pointerStart || pointerStart.id !== event.pointerId) return;
    const deltaX = event.clientX - pointerStart.x;
    const deltaY = event.clientY - pointerStart.y;
    pointerStart = null;
    if (Math.abs(deltaX) < 56 || Math.abs(deltaX) < Math.abs(deltaY) * 1.25) return;
    event.preventDefault();
    move(deltaX < 0 ? 1 : -1);
  });

  leaf.addEventListener("pointercancel", () => {
    pointerStart = null;
  });

  window.addEventListener("hashchange", () => {
    const requested = getHashIndex();
    if (requested !== currentIndex) render(requested, { announce: true, syncHash: false });
  });

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
  });
})();
