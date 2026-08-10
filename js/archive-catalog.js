(() => {
  const PLATFORM_LABELS = {
    boosty: "Boosty",
    instagram: "Instagram",
    facebook: "Facebook",
    youtube: "YouTube",
    tiktok: "TikTok",
  };

  const ICONS = {
    pool: `
      <svg viewBox="0 0 64 64" aria-hidden="true">
        <path d="M14 42c6 4 12 4 18 0 6 4 12 4 18 0" />
        <path d="M19 37c1-10 8-17 17-17 3 0 6 1 8 3l7 1-6 6c0 8-6 13-15 13-5 0-8-2-11-6Z" />
        <circle cx="39" cy="24" r="1.5" class="is-fill" />
        <path d="M22 18c-1-5 1-9 5-12" />
      </svg>`,
    redroom: `
      <svg viewBox="0 0 64 64" aria-hidden="true">
        <path d="M19 9h28v46H19z" />
        <path d="M25 15h16v34H25z" />
        <circle cx="37" cy="33" r="2" class="is-fill" />
        <path d="M13 55h40" />
      </svg>`,
    robot: `
      <svg viewBox="0 0 64 64" aria-hidden="true">
        <path d="M32 8v8M27 8h10" />
        <rect x="14" y="17" width="36" height="31" rx="5" />
        <circle cx="25" cy="30" r="4" />
        <circle cx="39" cy="30" r="4" />
        <path d="M23 40h18M8 27h6M50 27h6M21 48v8M43 48v8" />
      </svg>`,
    park: `
      <svg viewBox="0 0 64 64" aria-hidden="true">
        <circle cx="32" cy="29" r="13" />
        <path d="M32 7v7M32 44v7M10 29h7M47 29h7M16 13l5 5M43 40l5 5M48 13l-5 5M21 40l-5 5" />
        <path d="M16 56h32" />
      </svg>`,
    transit: `
      <svg viewBox="0 0 64 64" aria-hidden="true">
        <rect x="15" y="9" width="34" height="39" rx="5" />
        <path d="M20 17h24v15H20zM22 48l-5 8M42 48l5 8M20 56h9M35 56h9" />
        <circle cx="23" cy="40" r="2" class="is-fill" />
        <circle cx="41" cy="40" r="2" class="is-fill" />
      </svg>`,
    broadcast: `
      <svg viewBox="0 0 64 64" aria-hidden="true">
        <path d="M24 12l8 8 9-10" />
        <rect x="8" y="20" width="48" height="34" rx="4" />
        <path d="M14 26h30v22H14zM49 29h2M49 36h2M49 43h2" />
      </svg>`,
    dream: `
      <svg viewBox="0 0 64 64" aria-hidden="true">
        <path d="M8 32c7-10 15-15 24-15s17 5 24 15c-7 10-15 15-24 15S15 42 8 32Z" />
        <circle cx="32" cy="32" r="8" />
        <path d="M17 12l3 4M47 12l-3 4M32 7v6" />
      </svg>`,
    commerce: `
      <svg viewBox="0 0 64 64" aria-hidden="true">
        <path d="M14 23h36l-3 33H17z" />
        <path d="M23 25v-6c0-6 4-10 9-10s9 4 9 10v6" />
        <path d="M24 37h16M32 29v16" />
      </svg>`,
    institution: `
      <svg viewBox="0 0 64 64" aria-hidden="true">
        <path d="M10 55h44M15 55V22h34v33M11 22l21-13 21 13" />
        <path d="M24 31h16M32 23v16M22 55V43h20v12" />
      </svg>`,
    mask: `
      <svg viewBox="0 0 64 64" aria-hidden="true">
        <path d="M16 17c6-5 11-7 16-7s10 2 16 7l-3 28c-4 6-8 9-13 9s-9-3-13-9Z" />
        <path d="M21 28c4-3 7-3 10 0M43 28c-4-3-7-3-10 0M27 43c3 2 7 2 10 0" />
        <path d="M16 18l-5-8M48 18l5-8" />
      </svg>`,
    archive: `
      <svg viewBox="0 0 64 64" aria-hidden="true">
        <rect x="8" y="17" width="48" height="32" rx="3" />
        <circle cx="23" cy="33" r="7" />
        <circle cx="41" cy="33" r="7" />
        <path d="M23 33h18M18 49l4-8h20l4 8M15 12h34" />
      </svg>`,
  };

  const getEpisodeData = () =>
    Array.isArray(window.DZ_EPISODE_CATALOG) ? window.DZ_EPISODE_CATALOG : [];

  const getDisplayTitle = (title) =>
    String(title || "").replace(/^Детский Жир №\d{3}\s+[—-]\s+/, "");

  const getCountWord = (count, one, few, many) => {
    const mod100 = count % 100;
    const mod10 = count % 10;
    if (mod100 >= 11 && mod100 <= 14) return many;
    if (mod10 === 1) return one;
    if (mod10 >= 2 && mod10 <= 4) return few;
    return many;
  };

  const isSafeExternalUrl = (value) => {
    try {
      const url = new URL(value);
      return url.protocol === "https:" || url.protocol === "http:";
    } catch (_error) {
      return false;
    }
  };

  const initEpisodeCatalog = () => {
    const catalog = document.querySelector("[data-episode-catalog]");
    if (!catalog || catalog.dataset.episodeCatalogReady === "true") return;

    const episodes = getEpisodeData();
    const list = catalog.querySelector("[data-episode-list]");
    const search = catalog.querySelector("[data-episode-search]");
    const sort = catalog.querySelector("[data-episode-sort]");
    const total = catalog.querySelector("[data-episode-total]");
    const visibleCount = catalog.querySelector("[data-episode-visible-count]");
    const empty = catalog.querySelector("[data-episode-empty]");
    const dialog = document.querySelector("[data-episode-dialog]");
    const dialogId = dialog?.querySelector("[data-episode-dialog-id]");
    const dialogTitle = dialog?.querySelector("[data-episode-dialog-title]");
    const dialogSources = dialog?.querySelector("[data-episode-dialog-sources]");
    const dialogClose = dialog?.querySelector("[data-episode-dialog-close]");
    if (!list || !search || !sort || !total || !visibleCount || !empty || !dialog) return;

    catalog.dataset.episodeCatalogReady = "true";
    let descending = false;
    let lastTrigger = null;

    const getSources = (episode) =>
      Object.entries(episode.sources || {}).filter(
        ([platform, url]) => PLATFORM_LABELS[platform] && isSafeExternalUrl(url)
      );

    const closeDialog = () => {
      if (dialog.open) dialog.close();
    };

    const openDialog = (episode, trigger) => {
      const sources = getSources(episode);
      lastTrigger = trigger;
      dialogId.textContent = `${episode.id} // ${episode.tag}`;
      dialogTitle.textContent = getDisplayTitle(episode.title);
      dialogSources.replaceChildren();

      sources.forEach(([platform, url]) => {
        const link = document.createElement("a");
        const label = document.createElement("span");
        const arrow = document.createElement("span");
        link.className = `episode-source episode-source--${platform}`;
        link.href = url;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        label.textContent = `Смотреть на ${PLATFORM_LABELS[platform]}`;
        arrow.textContent = "↗";
        arrow.setAttribute("aria-hidden", "true");
        link.append(label, arrow);
        dialogSources.append(link);
      });

      if (typeof dialog.showModal === "function") dialog.showModal();
      else dialog.setAttribute("open", "");
    };

    const createEpisode = (episode) => {
      const sources = getSources(episode);
      const card = document.createElement("article");
      const thumbnail = document.createElement("div");
      const icon = document.createElement("span");
      const tag = document.createElement("span");
      const copy = document.createElement("div");
      const metadata = document.createElement("p");
      const title = document.createElement("h3");
      const description = document.createElement("p");
      const platforms = document.createElement("div");
      const button = document.createElement("button");

      card.className = "episode-entry";
      card.dataset.episodeTheme = episode.theme || "archive";
      thumbnail.className = "episode-entry__thumbnail";
      icon.className = "episode-entry__icon";
      icon.innerHTML = ICONS[episode.theme] || ICONS.archive;
      tag.className = "episode-entry__tag";
      tag.textContent = episode.tag || "АРХИВ";
      thumbnail.append(icon, tag);

      copy.className = "episode-entry__copy";
      metadata.className = "episode-entry__metadata";
      metadata.textContent = episode.id;
      title.textContent = getDisplayTitle(episode.title);
      description.className = "episode-entry__description";
      description.textContent = episode.description;
      platforms.className = "episode-entry__platforms";
      platforms.setAttribute("aria-label", "Доступные площадки");

      sources.forEach(([platform]) => {
        const platformLabel = document.createElement("span");
        platformLabel.textContent = PLATFORM_LABELS[platform];
        platforms.append(platformLabel);
      });

      copy.append(metadata, title, description, platforms);

      button.className = "episode-entry__watch";
      button.type = "button";
      button.textContent = sources.length
        ? `Где смотреть · ${sources.length}`
        : "Источники уточняются";
      button.disabled = sources.length === 0;
      button.addEventListener("click", () => openDialog(episode, button));

      card.append(thumbnail, copy, button);
      return card;
    };

    const render = () => {
      const query = search.value.trim().toLocaleLowerCase("ru");
      const filtered = episodes
        .filter((episode) => {
          const searchable = [
            episode.id,
            episode.title,
            episode.description,
            episode.tag,
          ]
            .join(" ")
            .toLocaleLowerCase("ru");
          return searchable.includes(query);
        })
        .sort((a, b) =>
          descending ? b.sortOrder - a.sortOrder : a.sortOrder - b.sortOrder
        );

      list.replaceChildren(...filtered.map(createEpisode));
      empty.hidden = filtered.length !== 0;
      visibleCount.textContent = `Показано: ${filtered.length}`;
    };

    total.textContent = `${episodes.length} ${getCountWord(
      episodes.length,
      "ВЫПУСК",
      "ВЫПУСКА",
      "ВЫПУСКОВ"
    )}`;

    search.addEventListener("input", render);
    sort.addEventListener("click", () => {
      descending = !descending;
      sort.setAttribute("aria-pressed", String(descending));
      sort.textContent = descending ? "↓ Сначала новые" : "↑ Сначала ранние";
      render();
    });

    dialogClose.addEventListener("click", closeDialog);
    dialog.addEventListener("click", (event) => {
      if (event.target === dialog) closeDialog();
    });
    dialog.addEventListener("close", () => {
      if (lastTrigger) lastTrigger.focus();
    });

    render();
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initEpisodeCatalog, { once: true });
  } else {
    initEpisodeCatalog();
  }
})();
