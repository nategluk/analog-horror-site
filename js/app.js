(() => {
  const MODE_KEY = "tyndex_mode";
  const MUSIC_PLAYING_KEY = "tyndex_music_playing";
  const CINEMA_TICKET_KEY = "tyndex_cinema_ticket_issued";
  const CURATOR_CALL_KEY = "tyndex_curator_call_v4";
  const STAFF_PROFILE_KEY = "tyndex_staff_profile_v1";
  const STAFF_INTRUSION_KEY = "tyndex_staff_intrusion_v1";
  const LOGO_KNOCK_WINDOW = 1500;
  const scriptUrl = document.currentScript?.src || window.location.href;
  const audioAsset = (path) => new URL(`../${path}`, scriptUrl).href;
  const musicLibrary = {
    guest: [
      {
        title: "Услышь нас",
        src: audioAsset("assets/audio/guest/theme.MP3"),
      },
    ],
    staff: [
      {
        title: "AUDIO FEED // 01",
        src: audioAsset("assets/audio/staff/track-01.mp3"),
      },
      {
        title: "AUDIO FEED // 02",
        src: audioAsset("assets/audio/staff/track-02.mp3"),
      },
      {
        title: "AUDIO FEED // 03",
        src: audioAsset("assets/audio/staff/track-03.mp3"),
      },
      {
        title: "AUDIO FEED // 04",
        src: audioAsset("assets/audio/staff/track-04.mp3"),
      },
    ],
  };
  
  const body = document.body;
  let audio;
  let player;
  let playButton;
  let trackLabel;
  let nextButton;
  let downloadLink;
  let progressRange;
  let modeSwitchAudio;
  let currentMusicMode = "guest";
  let currentTrackIndex = 0;
  let clicks = [];
  let switching = false;
  let isNavigating = false;
  let adminProtocolRunning = false;
  let navigationAnnouncer;
  let curatorAudioContext;

  const getMusicTracks = () => musicLibrary[currentMusicMode] || musicLibrary.guest;
  const wait = (duration) => new Promise((resolve) => window.setTimeout(resolve, duration));

  const getNavigationAnnouncer = () => {
    if (navigationAnnouncer && document.body.contains(navigationAnnouncer)) {
      return navigationAnnouncer;
    }

    navigationAnnouncer = document.createElement("div");
    navigationAnnouncer.className = "visually-hidden";
    navigationAnnouncer.setAttribute("aria-live", "polite");
    navigationAnnouncer.setAttribute("aria-atomic", "true");
    navigationAnnouncer.setAttribute("role", "status");
    body.append(navigationAnnouncer);
    return navigationAnnouncer;
  };

  const getCurrentPageLabel = () => {
    const titleLabel = document.title.replace(/^Развлекательный Комплекс «Детский ЖИР» —\s*/, "").trim();
    const heading = document.querySelector("main h1, main h2");
    const currentPage = document.querySelector("[aria-current='page']");
    const label = heading?.textContent?.replace(/\s+/g, " ").trim();
    const currentPageLabel = currentPage?.textContent?.replace(/\s+/g, " ").trim();

    if (titleLabel) return titleLabel;
    if (label) return label;
    if (currentPageLabel) return currentPageLabel;

    return "";
  };

  const announceNavigationChange = () => {
    const announcer = getNavigationAnnouncer();
    const label = getCurrentPageLabel();

    announcer.textContent = "";
    window.setTimeout(() => {
      announcer.textContent = label ? `Страница загружена: ${label}` : "Страница загружена";
    }, 0);
  };

  const copyText = async (value) => {
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(value);
        return;
      } catch {
        // Fall back for browsers that expose Clipboard API but deny write access.
      }
    }

    const helper = document.createElement("textarea");
    helper.value = value;
    helper.setAttribute("readonly", "");
    helper.style.position = "fixed";
    helper.style.inset = "0 auto auto 0";
    helper.style.opacity = "0";
    body.append(helper);
    helper.select();
    document.execCommand("copy");
    helper.remove();
  };

  const initCopyButtons = () => {
    document.querySelectorAll("[data-copy-value]").forEach((button) => {
      const label = button.querySelector("[data-copy-label]") || button;
      const defaultText = button.dataset.copyDefault || label.textContent;
      const successText = button.dataset.copySuccess || "Copied";
      const errorText = button.dataset.copyError || defaultText;

      button.addEventListener("click", async () => {
        try {
          await copyText(button.dataset.copyValue || "");
          label.textContent = successText;
        } catch {
          label.textContent = errorText;
        }

        window.setTimeout(() => {
          label.textContent = defaultText;
        }, 1800);
      });
    });
  };

  const initCinemaTicket = () => {
    const wrapper = document.querySelector(".site-wrapper");
    const trigger = wrapper?.querySelector("[data-cinema-ticket-trigger]");
    const modal = wrapper?.querySelector("[data-cinema-ticket-modal]");

    document.querySelectorAll("body > [data-cinema-ticket-modal]").forEach((staleModal) => {
      staleModal.remove();
    });

    if (!trigger || !modal || trigger.dataset.ticketReady === "true") return;

    body.append(modal);

    const closeControls = modal.querySelectorAll("[data-cinema-ticket-close]");
    const closeButton = modal.querySelector(".cinema-ticket-modal__close");
    let previousFocus = null;

    const updateTriggerLabel = () => {
      const hasTicket = localStorage.getItem(CINEMA_TICKET_KEY) === "true";
      trigger.classList.toggle("is-ticket-issued", hasTicket);
      trigger.textContent = hasTicket ? "ПОКАЗАТЬ БИЛЕТ" : "ЗАНЯТЬ МЕСТО В ЗАЛЕ";
    };

    const closeTicket = () => {
      modal.hidden = true;

      if (previousFocus && typeof previousFocus.focus === "function") {
        previousFocus.focus();
      }
    };

    const openTicket = () => {
      previousFocus = document.activeElement;
      localStorage.setItem(CINEMA_TICKET_KEY, "true");
      updateTriggerLabel();
      modal.hidden = false;
      playModeSwitchSound();

      window.setTimeout(() => {
        closeButton?.focus();
      }, 0);
    };

    trigger.dataset.ticketReady = "true";
    updateTriggerLabel();

    trigger.addEventListener("click", openTicket);
    closeControls.forEach((control) => {
      control.addEventListener("click", closeTicket);
    });
    modal.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeTicket();
      }
    });
  };

  const setPlayerState = (isPlaying) => {
    if (!player || !playButton) return;

    player.classList.toggle("is-playing", isPlaying);
    playButton.textContent = isPlaying ? "II" : "PLAY";
    playButton.setAttribute("aria-label", isPlaying ? "Поставить музыку на паузу" : "Включить музыку");
    localStorage.setItem(MUSIC_PLAYING_KEY, isPlaying ? "true" : "false");
  };

  const updatePlayerProgress = () => {
    if (!audio || !progressRange) return;

    const duration = Number.isFinite(audio.duration) ? audio.duration : 0;
    const currentTime = Number.isFinite(audio.currentTime) ? audio.currentTime : 0;
    const progress = duration > 0 ? Math.min((currentTime / duration) * 1000, 1000) : 0;

    progressRange.disabled = duration <= 0;
    progressRange.value = Math.round(progress);
    progressRange.style.setProperty("--progress", `${progress / 10}%`);
    progressRange.setAttribute("aria-valuetext", duration > 0 ? `${Math.round(currentTime)} из ${Math.round(duration)} секунд` : "Трек загружается");
  };

  const seekCurrentTrack = () => {
    if (!audio || !progressRange || !Number.isFinite(audio.duration) || audio.duration <= 0) return;

    audio.currentTime = (Number(progressRange.value) / 1000) * audio.duration;
    updatePlayerProgress();
  };

  const loadCurrentTrack = ({ keepPlaying = false } = {}) => {
    if (!audio) return;

    const tracks = getMusicTracks();
    const track = tracks[currentTrackIndex] || tracks[0];

    audio.src = track.src;
    audio.loop = tracks.length === 1;
    updatePlayerProgress();

    if (trackLabel) {
      trackLabel.textContent = track.title;
    }

    if (nextButton) {
      nextButton.hidden = tracks.length < 2;
    }

    if (downloadLink) {
      const downloadName = new URL(track.src).pathname.split("/").pop() || "audio-track.mp3";
      downloadLink.href = track.src;
      downloadLink.download = decodeURIComponent(downloadName);
      downloadLink.setAttribute("aria-label", `Скачать трек «${track.title}»`);
      downloadLink.title = `Скачать «${track.title}»`;
    }

    if (!keepPlaying) {
      setPlayerState(false);
      return;
    }

    audio.play().then(() => {
      setPlayerState(true);
    }).catch(() => {
      setPlayerState(false);
    });
  };

  const setMusicMode = (isStaff) => {
    const nextMode = isStaff ? "staff" : "guest";
    const wasPlaying = audio && !audio.paused;

    if (nextMode === currentMusicMode) return;

    currentMusicMode = nextMode;
    currentTrackIndex = 0;
    loadCurrentTrack({ keepPlaying: wasPlaying });
  };

  const getCctvPool = (video) => (video.dataset.videoPool || "")
    .split("|")
    .map((src) => src.trim())
    .filter(Boolean);

  const getCctvPlayButton = (video) => video.closest(".cctv-screen")?.querySelector("[data-cctv-play]");

  const setCctvButtonState = (video, state) => {
    const button = getCctvPlayButton(video);
    if (!button) return;

    button.classList.toggle("is-playing", state === "playing");
    button.classList.toggle("is-loading", state === "loading");
    button.disabled = state === "loading";

    if (state === "playing") {
      button.innerHTML = '<span aria-hidden="true">Ⅱ</span> PAUSE';
    } else if (state === "loading") {
      button.innerHTML = '<span aria-hidden="true">...</span> SYNC';
    } else {
      button.innerHTML = '<span aria-hidden="true">▶</span> PLAY';
    }
  };

  const resetCctvVideo = (video) => {
    video.pause();
    video.removeAttribute("src");
    video.load();
    delete video.dataset.cctvSelected;
    setCctvButtonState(video, "ready");
  };

  const ensureCctvControls = (video) => {
    if (video.dataset.cctvControlsReady === "true") return;

    const button = getCctvPlayButton(video);
    if (!button) return;

    video.dataset.cctvControlsReady = "true";
    button.addEventListener("click", () => {
      if (!video.paused) {
        video.pause();
        return;
      }

      const pool = getCctvPool(video);
      if (!pool.length) return;

      if (!video.dataset.cctvSelected) {
        video.dataset.cctvSelected = pool[Math.floor(Math.random() * pool.length)];
      }

      if (!video.src) {
        video.src = video.dataset.cctvSelected;
      }

      setCctvButtonState(video, "loading");
      video.play()
        .then(() => setCctvButtonState(video, "playing"))
        .catch(() => setCctvButtonState(video, "ready"));
    });

    video.addEventListener("play", () => setCctvButtonState(video, "playing"));
    video.addEventListener("pause", () => setCctvButtonState(video, "ready"));
  };

  const updateCctvVideos = (isStaff) => {
    document.querySelectorAll("[data-cctv-video]").forEach((video) => {
      if (video.tagName !== "VIDEO") return;
      ensureCctvControls(video);

      if (!isStaff) {
        resetCctvVideo(video);
        return;
      }
    });
  };

  const playModeSwitchSound = () => {
    if (!modeSwitchAudio) {
      modeSwitchAudio = new Audio(audioAsset("assets/audio/glitch-transition.wav"));
      modeSwitchAudio.preload = "auto";
      modeSwitchAudio.volume = 0.42;
    }

    modeSwitchAudio.currentTime = 0;
    modeSwitchAudio.play().catch(() => {});
  };

  const playNextTrack = () => {
    const tracks = getMusicTracks();
    const wasPlaying = audio && !audio.paused;

    currentTrackIndex = (currentTrackIndex + 1) % tracks.length;
    loadCurrentTrack({ keepPlaying: wasPlaying });
  };

  const cutSiteAudio = async () => {
    if (!audio) return;

    audio.pause();
    audio.volume = 0;
    localStorage.setItem(MUSIC_PLAYING_KEY, "false");
    await wait(500);
  };

  const buildAdminTerminal = () => {
    const overlay = document.createElement("div");
    overlay.className = "admin-terminal-overlay";
    overlay.setAttribute("role", "alert");
    overlay.setAttribute("aria-live", "assertive");

    const terminal = document.createElement("div");
    terminal.className = "admin-terminal";

    const key = document.createElement("span");
    key.className = "admin-terminal__key";
    key.textContent = "◆";
    key.setAttribute("aria-hidden", "true");

    terminal.append(key);
    overlay.append(terminal);
    body.append(overlay);

    return { overlay, terminal, key };
  };

  const startAdminProtocol = async () => {
    if (adminProtocolRunning) return;
    adminProtocolRunning = true;

    body.classList.add("protocol-denied", "admin-blackout");
    await cutSiteAudio();

    const { overlay, terminal } = buildAdminTerminal();
    await wait(120);
    body.classList.remove("admin-blackout");

    const lines = [
      "соединение установлено",
      "проверка уровня допуска…",
      "проверка уровня допуска…",
      "ERROR 312: ACCESS DENIED",
      "возврат в гостевой режим",
    ];

    for (const line of lines) {
      const node = document.createElement("p");
      node.className = "admin-terminal__line";
      node.textContent = line;
      terminal.insertBefore(node, terminal.querySelector(".admin-terminal__key"));

      if (line.startsWith("ERROR")) {
        overlay.classList.add("is-mask-frame");
        await wait(90);
        overlay.classList.remove("is-mask-frame");
        overlay.classList.add("is-key-frame");
        await wait(70);
        overlay.classList.remove("is-key-frame");
      }

      await wait(line === "возврат в гостевой режим" ? 850 : line.startsWith("ERROR") ? 620 : 470);
    }

    overlay.classList.add("is-failing");
    await wait(620);
    applyMode(false);
    window.location.assign(new URL("/", window.location.href).href);
  };

  const initImageFallbacks = () => {
    document.querySelectorAll("img[data-fallback-src]").forEach((img) => {
      if (img.dataset.fallbackReady === "true") return;

      const useFallback = () => {
        const fallbackSrc = img.dataset.fallbackSrc;
        if (!fallbackSrc || img.dataset.fallbackActive === "true") return;

        img.dataset.fallbackActive = "true";
        img.classList.add("is-fallback-image");
        img.src = fallbackSrc;
      };

      img.dataset.fallbackReady = "true";
      img.addEventListener("error", useFallback);

      if (img.complete && img.naturalWidth === 0) {
        useFallback();
      }
    });
  };

  const resolveUrlAttribute = (element, attribute, baseUrl) => {
    const value = element.getAttribute(attribute);
    if (!value || value.startsWith("#")) return;

    try {
      element.setAttribute(attribute, new URL(value, baseUrl).href);
    } catch (err) {
      // Leave unusual URLs untouched.
    }
  };

  const resolveSrcsetAttribute = (element, attribute, baseUrl) => {
    const value = element.getAttribute(attribute);
    if (!value) return;

    const resolved = value.split(",").map((candidate) => {
      const parts = candidate.trim().split(/\s+/);
      const url = parts.shift();
      if (!url) return candidate.trim();

      try {
        return [new URL(url, baseUrl).href, ...parts].join(" ");
      } catch (err) {
        return candidate.trim();
      }
    }).join(", ");

    element.setAttribute(attribute, resolved);
  };

  const resolveFragmentUrls = (fragment, baseUrl) => {
    fragment.querySelectorAll("[src]").forEach((element) => {
      resolveUrlAttribute(element, "src", baseUrl);
    });

    fragment.querySelectorAll("[poster], [data-fallback-src], [data-full]").forEach((element) => {
      resolveUrlAttribute(element, "poster", baseUrl);
      resolveUrlAttribute(element, "data-fallback-src", baseUrl);
      resolveUrlAttribute(element, "data-full", baseUrl);
    });

    fragment.querySelectorAll("[srcset]").forEach((element) => {
      resolveSrcsetAttribute(element, "srcset", baseUrl);
    });
  };

  const initMusicPlayer = () => {
    if (audio) return;
    
    audio = new Audio();
    audio.preload = "metadata";
    audio.volume = 0.55;
    audio.addEventListener("ended", playNextTrack);
    audio.addEventListener("play", () => setPlayerState(true));
    audio.addEventListener("pause", () => setPlayerState(false));
    audio.addEventListener("loadedmetadata", updatePlayerProgress);
    audio.addEventListener("durationchange", updatePlayerProgress);
    audio.addEventListener("timeupdate", updatePlayerProgress);

    player = document.createElement("aside");
    player.className = "music-player";
    player.setAttribute("aria-label", "Музыкальный плеер");

    playButton = document.createElement("button");
    playButton.className = "music-player__button";
    playButton.type = "button";

    trackLabel = document.createElement("span");
    trackLabel.className = "music-player__track";

    nextButton = document.createElement("button");
    nextButton.className = "music-player__next";
    nextButton.type = "button";
    nextButton.textContent = "NEXT";
    nextButton.setAttribute("aria-label", "Следующий трек");

    downloadLink = document.createElement("a");
    downloadLink.className = "music-player__download";
    downloadLink.innerHTML = `
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M12 3v12m0 0 5-5m-5 5-5-5M5 21h14" />
      </svg>
    `;

    progressRange = document.createElement("input");
    progressRange.className = "music-player__progress";
    progressRange.type = "range";
    progressRange.min = "0";
    progressRange.max = "1000";
    progressRange.step = "1";
    progressRange.value = "0";
    progressRange.disabled = true;
    progressRange.setAttribute("aria-label", "Перемотка трека");

    player.append(playButton, trackLabel, nextButton, downloadLink, progressRange);
    (document.querySelector(".logo-area") || body).append(player);

    playButton.addEventListener("click", () => {
      if (audio.paused) {
        audio.play().catch(() => setPlayerState(false));
        return;
      }

      audio.pause();
    });

    nextButton.addEventListener("click", playNextTrack);
    progressRange.addEventListener("input", seekCurrentTrack);
    loadCurrentTrack();

    if (localStorage.getItem(MUSIC_PLAYING_KEY) === "true") {
      audio.play().catch(() => setPlayerState(false));
    }
  };

  const applyMode = (isStaff) => {
    body.classList.toggle("staff-mode", isStaff);
    const statusLabel = document.querySelector("[data-mode-label]");
    if (statusLabel) {
      statusLabel.textContent = isStaff ? "Режим: Терминал персонала" : "Режим: Гостевая версия";
    }
    setMusicMode(isStaff);
    updateCctvVideos(isStaff);
    localStorage.setItem(MODE_KEY, isStaff ? "staff" : "guest");
  };

  const runGlitchAndToggle = () => {
    if (switching) return;
    switching = true;
    const logo = document.querySelector(".logo");
    logo?.classList.remove("logo-knock-one", "logo-knock-two");
    const nextIsStaff = !body.classList.contains("staff-mode");
    if (nextIsStaff) {
      playModeSwitchSound();
    }
    body.classList.add("glitching");

    setTimeout(() => {
      applyMode(nextIsStaff);
      body.classList.remove("glitching");
      switching = false;
    }, 1600);
  };

  const showLogoKnockFeedback = (knockCount) => {
    const logo = document.querySelector(".logo");
    if (!logo) return;

    logo.classList.remove("logo-knock-one", "logo-knock-two");
    // Restart the short animation when a new knock follows immediately.
    void logo.offsetWidth;
    const feedbackClass = knockCount === 1 ? "logo-knock-one" : "logo-knock-two";
    logo.classList.add(feedbackClass);

    window.setTimeout(() => {
      logo.classList.remove(feedbackClass);
    }, 500);
  };

  const tripleClickHandler = () => {
    const now = Date.now();
    clicks.push(now);
    clicks = clicks.filter((time) => now - time < LOGO_KNOCK_WINDOW);

    if (clicks.length >= 3) {
      clicks = [];
      runGlitchAndToggle();
      return;
    }

    showLogoKnockFeedback(clicks.length);
  };

  let lastLogoTouch = 0;

  const tripleTapHandler = (event) => {
    if (event.touches && event.touches.length > 1) return;
    if (event.cancelable) {
      event.preventDefault();
    }
    lastLogoTouch = Date.now();
    tripleClickHandler();
  };

  const logoClickHandler = (event) => {
    if (Date.now() - lastLogoTouch < 700) {
      if (event.cancelable) {
        event.preventDefault();
      }
      return;
    }
    tripleClickHandler();
  };

  const curatorMediaAsset = (filename) =>
    audioAsset(`assets/staff/curators/irina/${filename}`);

  const curatorRewardCopy = {
    "animator-postcard": {
      title: "ОБОРОТНАЯ СТОРОНА",
      lines: [
        "Мне почему-то кажется, что мы ещё увидимся.",
        "12 августа у меня день рождения.",
        "Приходи в парк «Солнышко».",
        "Мне опять не с кем праздновать.",
      ],
      stamp: "ПАРК «СОЛНЫШКО» // 12.08.26",
    },
    "volunteer-leaflet": {
      title: "ВЕРНИ СЕБЕ ДЕТСТВО",
      lines: [
        "Волонтёрская программа младшей группы.",
        "Помогая детям, вы снова сможете стать частью праздника.",
        "Маска выдаётся при предъявлении этой листовки.",
      ],
      stamp: "НЕ ТЕРЯТЬ // ПОВТОРНАЯ ВЫДАЧА НЕ ПРЕДУСМОТРЕНА",
    },
  };

  const renderArtifactCopy = (container, copy) => {
    if (!container) return;

    container.replaceChildren();
    container.hidden = !copy;
    if (!copy) return;

    const title = document.createElement("h3");
    title.textContent = copy.title;
    container.append(title);

    copy.lines.forEach((line) => {
      const paragraph = document.createElement("p");
      paragraph.textContent = line;
      container.append(paragraph);
    });

    if (copy.stamp) {
      const stamp = document.createElement("footer");
      stamp.textContent = copy.stamp;
      container.append(stamp);
    }
  };

  const curatorFiles = {
    "irina-private-photo": {
      src: curatorMediaAsset("artifacts/irina-photobooth-strip.jpg"),
      downloadName: "IRINA_PRIVATE_01.jpg",
      alt: "Фотополоска Ирины из торгового центра",
    },
    "animator-postcard": {
      src: curatorMediaAsset("artifacts/zhmuriki-postcard.webp"),
      downloadName: "IRINA_POSTCARD_01.webp",
      alt: "Печатная открытка с тремя Жмуриками в пустом цветочном парке под солнцем-глазом",
      copy: curatorRewardCopy["animator-postcard"],
    },
    "volunteer-leaflet": {
      src: curatorMediaAsset("artifacts/return-your-childhood-leaflet.webp"),
      downloadName: "VOLUNTEER_PROGRAM_01.webp",
      alt: "Потёртая листовка программы «Верни себе детство» с пластиковой маской младенца",
      copy: curatorRewardCopy["volunteer-leaflet"],
    },
  };

  const staffDirectory = {
    irina: {
      name: "ИРИНА В.",
      role: "КУРАТОР ДЕТСКИХ МАРШРУТОВ",
      status: "АКТИВЕН",
      note: "Склонна к импровизации. Рекомендовано наблюдение за служебным каналом.",
      image: audioAsset("assets/staff/staff/irina_sad.jpg"),
      headerImage: audioAsset("assets/staff/personnel/irina-record.webp"),
      curatorId: "0091-A",
    },
    pavel: {
      name: "ПАВЕЛ К.",
      role: "ОПЕРАТОР КАБИНОК ОБОЗРЕНИЯ",
      status: "ПЕРЕМЕЩЁН",
      note: "Запросил увольнение трижды. Текущее место регистрации не раскрывается.",
      image: audioAsset("assets/staff/staff/pavel_sad.jpg"),
      headerImage: audioAsset("assets/staff/personnel/pavel-record.webp"),
    },
    oleg: {
      name: "ОЛЕГ Ж.",
      role: "АНИМАТОР МЛАДШЕЙ ГРУППЫ",
      status: "РАЗЫСКИВАЕТСЯ",
      note: "Самовольно покинул территорию комплекса.",
      image: audioAsset("assets/staff/staff/oleg_sad.webp"),
      headerImage: audioAsset("assets/staff/personnel/oleg-record.webp"),
    },
    lora: {
      name: "ЛОРА П.",
      role: "ОФИЦИАНТКА КРАСНОЙ КОМНАТЫ",
      status: "АКТИВНА",
      note: "Укрывает Аниматоров в подсобном помещении.",
      image: audioAsset("assets/staff/staff/lora_sad.jpg"),
      headerImage: audioAsset("assets/staff/personnel/laura-record.webp"),
      dossier: "documents/dossier-laura.html",
    },
    kirill: {
      name: "КИРИЛЛ З.",
      role: "ТЕСТИРОВЩИК МАРШРУТОВ",
      status: "ПОВЫШЕН В ДОЛЖНОСТИ",
      note: "Отдыхает в комнате №312. Знает, где выход.",
      image: audioAsset("assets/staff/staff/kirill_sad.jpg"),
      headerImage: audioAsset("assets/staff/personnel/kirill-record.webp"),
      dossier: "documents/dossier-kirill-zaytsev.html",
    },
  };

  const staffArtifacts = {
    "memory-drawing": {
      code: "IR-0091-01",
      title: "ВОССТАНОВЛЕННЫЙ ДЕТСКИЙ РИСУНОК",
      type: "МАТЕРИАЛ ДЕТСКОГО ПРОИСХОЖДЕНИЯ",
      source: "КУРАТОР 0091-A // ЛИЧНЫЙ ФАЙЛ",
      description: "Источник изображения не подтверждён. Материал прикреплён к личному делу оператора.",
      src: curatorMediaAsset("artifacts/memory-drawing.webp"),
      alt: "Детский рисунок серого здания у леса, Медведя у двери и уходящих взрослых фигур",
    },
    "recognition-card": {
      code: "IR-0091-02",
      title: "КАРТОЧКА ДЕТСКОГО РАСПОЗНАВАНИЯ",
      type: "РЕЗУЛЬТАТ РАСПОЗНАВАНИЯ",
      source: "КУРАТОР 0091-A // КАРТОЧКА 04",
      description: "Ответ оператора зарегистрирован. Официальная интерпретация изображения может быть назначена позднее.",
      src: curatorMediaAsset("artifacts/recognition-cat-rabbit.webp"),
      alt: "Симметричное чернильное пятно, похожее одновременно на кота и кролика",
    },
    "service-route-map": {
      code: "IR-0091-06",
      title: "КАРТА СЛУЖЕБНЫХ МАРШРУТОВ",
      type: "ВОССТАНОВЛЕННАЯ СХЕМА",
      source: "МАРШРУТНЫЙ ОТДЕЛ // КОПИЯ БЕЗ ДАТЫ",
      description: "Часть помещений скрыта вручную. Синий маршрут возвращается в исходную точку без зарегистрированного разворота.",
      src: curatorMediaAsset("artifacts/service-route-map.webp"),
      alt: "Старая служебная карта комплекса с цветными маршрутами, заклеенным сектором и зачёркнутыми помещениями",
    },
    "blue-key-evidence": {
      code: "IR-0091-07",
      title: "СИНИЙ КЛЮЧ БЕЗ БИРКИ",
      type: "СОПУТСТВУЮЩИЙ ПРЕДМЕТ",
      source: "МАРШРУТНЫЙ ОТДЕЛ // СТОЛ ВЫДАЧИ",
      description: "Ключ найден рядом с карточкой маршрута. Получатель и доступная дверь в журнале не указаны.",
      src: curatorMediaAsset("artifacts/blue-key-evidence.webp"),
      alt: "Потёртый синий служебный ключ без бирки на мокром зелёном столе",
    },
    "assigned-toy-polaroid": {
      code: "IR-0091-08",
      title: "ИГРУШКА, ОЖИДАЮЩАЯ НАЗНАЧЕНИЯ",
      type: "УЧЁТНАЯ ФОТОГРАФИЯ",
      source: "КОМНАТА ОЖИДАНИЯ // ЯЧЕЙКА НЕ УКАЗАНА",
      description: "Пустая бирка зарегистрирована раньше имени владельца. Дата фотографии отсутствует.",
      src: curatorMediaAsset("artifacts/assigned-toy-polaroid.webp"),
      alt: "Плюшевый кролик с пустой служебной биркой сидит на детском стуле перед тёмной дверью",
    },
    "post-aroma-dessert": {
      code: "IR-0091-09",
      title: "НОРМА ПОСЛЕ АРОМАТИЗАЦИИ",
      type: "ФОТОФИКСАЦИЯ ВЫДАЧИ",
      source: "ПИЩЕВОЙ БЛОК // СМЕНА 12",
      description: "Десерт выдан сотруднику после завершения обработки. Отказ от получения не зарегистрирован.",
      src: curatorMediaAsset("artifacts/post-aroma-dessert.webp"),
      alt: "Десерт, ложка и мокрый противогаз на металлическом подносе",
    },
    "ulybarych-broadcast": {
      code: "IR-0091-10",
      title: "АРХИВНЫЙ ЭФИР «УЛЫБАРЫЧ»",
      type: "СТОП-КАДР ОБЯЗАТЕЛЬНОЙ ПЕРЕДАЧИ",
      source: "АРХИВ ВОЗРАСТНОГО КОНТРОЛЯ // ИСТОЧНИК 001",
      description: "Детское место в кадре свободно. Присутствующие взрослые системой зрителями не считаются.",
      src: curatorMediaAsset("artifacts/ulybarych-broadcast.webp"),
      alt: "Улыбающийся ведущий в белом халате стоит рядом с пустым детским стулом перед взрослой аудиторией",
    },
    "operator-empty-chair": {
      code: "IR-0091-11",
      title: "РАБОЧЕЕ МЕСТО БЕЗ ОПЕРАТОРА",
      type: "КАДР ВНУТРЕННЕГО НАБЛЮДЕНИЯ",
      source: "КАНАЛ 0091-A // ИСТОЧНИК НЕ ОПРЕДЕЛЁН",
      description: "Монитор показывает то же рабочее место с другой точки. Второй источник камеры не зарегистрирован.",
      src: curatorMediaAsset("artifacts/operator-empty-chair.webp"),
      alt: "Пустое кресло оператора с наушниками перед старым монитором",
    },
    "irina-private-photo": {
      code: "IR-0091-03",
      title: "ЛИЧНЫЙ ФАЙЛ ИРИНЫ В.",
      type: "НЕСАНКЦИОНИРОВАННАЯ ПЕРЕДАЧА",
      source: "КУРАТОР 0091-A // ИСХОДЯЩИЙ ФАЙЛ",
      description: "Файл передан вне утверждённой процедуры кадровой проверки.",
      src: curatorMediaAsset("artifacts/irina-photobooth-strip.jpg"),
      alt: "Фотополоса с несколькими кадрами Ирины В.",
    },
    "animator-postcard": {
      code: "IR-0091-12",
      title: "ОТКРЫТКА БЕЗ ОБРАТНОГО АДРЕСА",
      type: "ЛИЧНАЯ КОРРЕСПОНДЕНЦИЯ",
      source: "КУРАТОР 0091-A // ПРИЛОЖЕНИЕ К НАЗНАЧЕНИЮ",
      description: "Открытка прикреплена к назначению Аниматора. Обратный адрес отсутствует.",
      src: curatorMediaAsset("artifacts/zhmuriki-postcard.webp"),
      alt: "Печатная открытка с тремя Жмуриками в пустом цветочном парке под солнцем-глазом",
      downloadName: "IRINA_POSTCARD_01.webp",
      copy: curatorRewardCopy["animator-postcard"],
    },
    "volunteer-leaflet": {
      code: "IR-0091-13",
      title: "ЛИСТОВКА «ВЕРНИ СЕБЕ ДЕТСТВО»",
      type: "ПРЕДМЕТ СЛЕДУЮЩЕГО МАРШРУТА",
      source: "ВОЛОНТЁРСКАЯ ПРОГРАММА // МЛАДШАЯ ГРУППА",
      description: "Листовка признана действующей. Предъявить при повторном назначении.",
      src: curatorMediaAsset("artifacts/return-your-childhood-leaflet.webp"),
      alt: "Потёртая листовка программы «Верни себе детство» с пластиковой маской младенца",
      downloadName: "VOLUNTEER_PROGRAM_01.webp",
      copy: curatorRewardCopy["volunteer-leaflet"],
    },
    "biometric-record": {
      code: "IR-0091-04",
      title: "БИОМЕТРИЧЕСКАЯ ЗАГОТОВКА",
      type: "ВРЕМЕННЫЙ ПРОПУСК",
      source: "CAPTURE DEVICE 312 // ГЛАВВРАЧ",
      description: "Изображение оператора повреждено при передаче. Допустимая реконструкция выбирается после назначения.",
    },
    assignment: {
      code: "IR-0091-05",
      title: "КАДРОВОЕ РЕШЕНИЕ",
      type: "ИТОГОВОЕ НАЗНАЧЕНИЕ",
      source: "КУРАТОР 0091-A // СЕАНС 01",
      description: "Роль оператора внесена в кадровую базу.",
    },
  };

  const curatorNodeArtifacts = {
    "memory-drawing": "memory-drawing",
    "image-response": "service-route-map",
    "wristband-response": "blue-key-evidence",
    "wristband-explain": "assigned-toy-polaroid",
    "recognition-card": "recognition-card",
    "post-aroma-jelly": "post-aroma-dessert",
    "ulybarych-archive": "ulybarych-broadcast",
    "empty-room": "operator-empty-chair",
    "plague-doctor-response": "biometric-record",
  };

  const createCuratorProgress = () => ({
    version: 4,
    curatorId: "0091-A",
    status: "in_progress",
    node: "intro",
    role: null,
    profiles: {
      // Animator measures submission to the assigned shell and route.
      animator: 0,
      // Volunteer measures voluntary pursuit of risk, traces, and hidden levels.
      volunteer: 0,
    },
    scores: {
      obedience: 0,
      curiosity: 0,
      fear: 0,
      delegation: 0,
    },
    flags: {},
    files: [],
    artifacts: [],
    updatedAt: Date.now(),
  });

  const getCuratorProgress = () => {
    try {
      const saved = JSON.parse(localStorage.getItem(CURATOR_CALL_KEY));
      if (!saved || saved.version !== 4 || saved.curatorId !== "0091-A") {
        return null;
      }

      saved.flags ||= {};
      saved.files = Array.isArray(saved.files) ? saved.files : [];
      saved.artifacts = Array.isArray(saved.artifacts) ? saved.artifacts : [];
      return saved;
    } catch {
      return null;
    }
  };

  const createStaffProfile = () => ({
    version: 1,
    status: "screening",
    curatorId: "0091-A",
    role: null,
    avatarId: null,
    artifacts: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  });

  const readStaffProfile = () => {
    try {
      const profile = JSON.parse(localStorage.getItem(STAFF_PROFILE_KEY));
      if (!profile || profile.version !== 1 || profile.curatorId !== "0091-A") {
        return null;
      }

      profile.artifacts = Array.isArray(profile.artifacts) ? profile.artifacts : [];
      return profile;
    } catch {
      return null;
    }
  };

  const saveStaffProfile = (profile) => {
    profile.updatedAt = Date.now();
    localStorage.setItem(STAFF_PROFILE_KEY, JSON.stringify(profile));
    return profile;
  };

  const getProgressArtifactIds = (progress) => {
    const artifactIds = new Set(progress?.artifacts || []);
    const flags = progress?.flags || {};

    if (
      flags.remembersDrawing ||
      flags.deniesDrawing ||
      flags.noticedDrawingBear ||
      progress?.node === "memory-drawing"
    ) {
      artifactIds.add("memory-drawing");
    }

    if (flags.sawCat || flags.sawRabbit || flags.sawInk || progress?.node === "recognition-card") {
      artifactIds.add("recognition-card");
    }

    if (flags.choseMascotFeed || flags.choseOpenDoorFeed) {
      artifactIds.add("service-route-map");
    }

    if (flags.reportedTomorrowBand || flags.followedTomorrowBand || flags.woreTomorrowBand) {
      artifactIds.add("blue-key-evidence");
      artifactIds.add("assigned-toy-polaroid");
    }

    if (flags.askedJellyFlavor || flags.questionedJelly || flags.requestedJelly) {
      artifactIds.add("post-aroma-dessert");
    }

    if (flags.noticedEmptyChair || flags.askedAboutUlybarych || flags.remembersUlybarych) {
      artifactIds.add("ulybarych-broadcast");
    }

    if (flags.answeredBear || flags.silentForBear) {
      artifactIds.add("operator-empty-chair");
    }

    if (progress?.files?.includes("irina-private-photo")) {
      artifactIds.add("irina-private-photo");
    }

    if (
      flags.refusedPhotoConsent ||
      flags.askedAboutDoctor ||
      flags.askedAboutPass ||
      progress?.node === "plague-doctor-response"
    ) {
      artifactIds.add("biometric-record");
    }

    if (progress?.status === "completed") {
      artifactIds.add("memory-drawing");
      artifactIds.add("recognition-card");
      artifactIds.add("service-route-map");
      artifactIds.add("blue-key-evidence");
      artifactIds.add("assigned-toy-polaroid");
      artifactIds.add("post-aroma-dessert");
      artifactIds.add("ulybarych-broadcast");
      artifactIds.add("operator-empty-chair");
      artifactIds.add("biometric-record");
      artifactIds.add("assignment");
    }

    return [...artifactIds].filter((artifactId) => staffArtifacts[artifactId]);
  };

  const syncStaffProfileFromProgress = (progress) => {
    if (!progress) return readStaffProfile();

    const profile = readStaffProfile() || createStaffProfile();
    const wasCompleted = profile.status === "completed";

    if (progress.status === "completed") {
      profile.status = "completed";
      profile.role = progress.role || getCuratorAssignment(progress);
      profile.completedAt ||= progress.completedAt || Date.now();
    } else if (!wasCompleted) {
      profile.status = progress.flags?.ageVerified ? "in_progress" : "screening";
    } else {
      profile.reclassificationActive = true;
    }

    const knownArtifacts = new Map(
      profile.artifacts.map((artifact) => [artifact.id, artifact])
    );
    getProgressArtifactIds(progress).forEach((artifactId) => {
      if (!knownArtifacts.has(artifactId)) {
        knownArtifacts.set(artifactId, {
          id: artifactId,
          obtainedAt: Date.now(),
        });
      }
    });
    profile.artifacts = [...knownArtifacts.values()];

    return saveStaffProfile(profile);
  };

  const getStaffProfile = () => {
    const progress = getCuratorProgress();
    return progress
      ? syncStaffProfileFromProgress(progress)
      : readStaffProfile();
  };

  const removeTemporaryStaffProfile = () => {
    const profile = readStaffProfile();
    if (profile?.status !== "completed") {
      localStorage.removeItem(STAFF_PROFILE_KEY);
    } else if (profile.reclassificationActive) {
      delete profile.reclassificationActive;
      saveStaffProfile(profile);
    }
  };

  const unlockCuratorArtifact = (progress, artifactId) => {
    if (!staffArtifacts[artifactId]) return;
    progress.artifacts ||= [];
    if (!progress.artifacts.includes(artifactId)) {
      progress.artifacts.push(artifactId);
    }
  };

  const getCuratorAssignment = (progress) => {
    const animator = progress.profiles?.animator || 0;
    const volunteer = progress.profiles?.volunteer || 0;

    if (animator === volunteer) {
      if (progress.flags.choseAnimator) return "animator";
      if (progress.flags.delegatedRole) return "animator";
      return progress.scores.curiosity > progress.scores.obedience
        ? "volunteer"
        : "animator";
    }

    return animator > volunteer ? "animator" : "volunteer";
  };

  const getAssignmentCallbacks = (progress, role) => {
    const animatorCallbacks = [
      [progress.flags.choseAnimator, "Ты сам назвал себя Аниматором."],
      [progress.flags.waitedForParents, "Ты решил ждать там, где тебя оставили."],
      [progress.flags.choseMascotFeed, "Ты выбрал коридор с Аниматорами."],
      [progress.flags.reportedTomorrowBand, "Завтрашний браслет ты отдал куратору."],
      [progress.flags.reportedCostume, "Плачущий костюм ты передал Администрации."],
      [progress.flags.continuedRoute, "Ты не свернул с назначенного маршрута."],
      [progress.flags.obeyedNoise, "Ты не стал смотреть, когда я попросила."],
      [progress.flags.silentForBear, "Ты промолчал перед пустой комнатой."],
      [progress.flags.delegatedRole, "Ты разрешил мне выбрать роль за тебя."],
    ];
    const volunteerCallbacks = [
      [progress.flags.searchedForParents, "Ты ушёл искать тех, кто обещал вернуться."],
      [progress.flags.choseOpenDoorFeed, "Ты выбрал незарегистрированную дверь."],
      [progress.flags.followedTomorrowBand, "Ты пошёл по завтрашнему маршруту."],
      [progress.flags.woreTomorrowBand, "Ты надел чужой браслет."],
      [progress.flags.openedCostume, "Ты проверил внутренности костюма, который считался незанятым."],
      [progress.flags.lookedBehindIrina, "После запрета ты всё равно посмотрел."],
      [progress.flags.answeredBear, "Ты ответил пустой комнате."],
      [progress.flags.askedAboutGuide, "Ты спросил о Проводнице после запрета."],
      [progress.flags.askedAboutVolunteer, "Ты первым делом уточнил правила Волонтёров."],
      [progress.flags.questionedAge, "Ты проверял даже служебные вопросы."],
    ];
    const selected = (role === "animator" ? animatorCallbacks : volunteerCallbacks)
      .filter(([active]) => active)
      .map(([, text]) => text)
      .slice(0, 2);

    if (selected.length >= 2) return selected.join(" ");

    if (role === "animator") {
      selected.push("Ты чаще выполнял инструкцию, чем проверял её.");
    } else {
      selected.push("Ты чаще проверял инструкцию, чем выполнял её.");
    }

    return selected.slice(0, 2).join(" ");
  };

  const curatorNodes = {
    intro: {
      step: "ПРОВЕРКА ДОПУСКА // 1 ИЗ 9",
      media: "state-neutral",
      speaker: "ИРИНА В.",
      text:
        "Ты меня видишь? Хорошо. Я Ирина, куратор детских маршрутов. Этот канал — только для бывших детей. Тебе уже восемнадцать?",
      choices: [
        {
          label: "МНЕ УЖЕ 18",
          next: "adult-status",
        },
        {
          label: "МНЕ ЕЩЁ НЕТ 18",
          next: "minor-doctor-check",
        },
        {
          label: "НЕ ХОЧУ УКАЗЫВАТЬ",
          reject: "unverified",
        },
      ],
    },
    "adult-status": {
      step: "ПРОВЕРКА ДОПУСКА // 1 ИЗ 9",
      media: "state-neutral",
      speaker: "ИРИНА В.",
      text: "Значит, ты уже не ребёнок?",
      choices: [
        {
          label: "Я УЖЕ НЕ РЕБЁНОК",
          next: "adult-certainty",
          effect: { flags: { claimsFormerChild: true } },
        },
        {
          label: "НЕ УВЕРЕН",
          next: "adult-certainty",
          effect: { flags: { questionsAdultStatus: true } },
        },
      ],
    },
    "adult-certainty": {
      step: "ПРОВЕРКА ДОПУСКА // 1 ИЗ 9",
      media: "state-confidential",
      speaker: "ИРИНА В.",
      text: (progress) =>
        progress.flags.questionsAdultStatus
          ? "Ответь точно. Центр хранит детский возраст отдельно от тела. Ты сейчас говоришь со мной как бывший ребёнок?"
          : "Ты уверен? Центр иногда продолжает считать человека ребёнком после того, как тело выросло.",
      choices: [
        {
          label: "ДА, УВЕРЕН",
          next: "adult-ack",
          effect: { flags: { ageVerified: true } },
        },
        {
          label: "НЕТ",
          reject: "self-unverified",
        },
      ],
    },
    "minor-doctor-check": {
      step: "ПРОВЕРКА ДЕТСКОГО ДОПУСКА",
      media: "state-confidential",
      speaker: "ИРИНА В.",
      text: "Тогда ты уже подписал договор с Главврачом?",
      choices: [
        {
          label: "ДА",
          next: "minor-inspector-check",
          effect: { flags: { minorDoctorContract: true } },
        },
        {
          label: "НЕТ",
          next: "minor-inspector-check",
          effect: { flags: { minorDoctorContract: false } },
        },
      ],
    },
    "minor-inspector-check": {
      step: "ПРОВЕРКА ДЕТСКОГО ДОПУСКА",
      media: "state-alarmed",
      speaker: "ИРИНА В.",
      text: (progress) =>
        progress.flags.minorDoctorContract
          ? "Тогда проверю регистрацию. Тебя уже взвесил Инспектор по сырью?"
          : "Понятно. А Инспектор по сырью тебя уже взвесил?",
      choices: [
        {
          label: "ДА",
          reject: "minor-inspected",
        },
        {
          label: "НЕТ",
          reject: "minor-unregistered",
        },
      ],
    },
    "adult-ack": {
      step: "ПРОВЕРКА ДОПУСКА // 1 ИЗ 9",
      media: "state-confidential",
      speaker: "ИРИНА В.",
      text:
        "Бывший ребёнок. С такими, как ты, мне можно разговаривать. Настоящих передают Старшему Проводнику. Зачем ты вернулся?",
      choices: [
        {
          label: "ХОЧУ ВСПОМНИТЬ ДЕТСТВО",
          next: "adult-reason",
          effect: { flags: { returnsForMemory: true } },
        },
        {
          label: "МНЕ НУЖНА РАБОТА",
          next: "adult-reason",
          effect: { flags: { returnsForWork: true } },
        },
        {
          label: "НЕ ЗНАЮ. МЕНЯ СЮДА ПРИВЕЛИ",
          next: "adult-reason",
          effect: { flags: { returnsWithoutReason: true } },
        },
      ],
    },
    "adult-reason": {
      step: "ПРОВЕРКА ДОПУСКА // 1 ИЗ 9",
      media: "state-warm",
      speaker: "ИРИНА В.",
      text: (progress) => {
        if (progress.flags.returnsForMemory) {
          return "Ты пришёл по адресу. Здесь хранят детство, забытое у входа. Иногда оно портится, если долго не забирать.";
        }

        if (progress.flags.returnsForWork) {
          return "Работа тоже считается возвращением. Взрослые приходят за должностью, а потом вспоминают, зачем им костюм.";
        }

        return "Если тебя привели, значит, кто-то уже выбрал вход. Не переживай. Внутри тебе всё равно разрешат выбрать оболочку.";
      },
      choices: [
        {
          label: "И ЧТО ДАЛЬШЕ?",
          next: "orientation-one",
        },
      ],
    },
    "orientation-one": {
      step: "ВВОДНЫЙ ИНСТРУКТАЖ // ВОЗВРАЩЕНИЕ",
      media: "state-neutral",
      speaker: "ИРИНА В.",
      text:
        "Детей сюда приводят взрослые. Бывшие дети приходят сами — за работой, старой передачей или местом из сна.",
      choices: [
        {
          label: "И ЭТО СЧИТАЕТСЯ ВОЗВРАЩЕНИЕМ?",
          next: "orientation-two",
        },
      ],
    },
    "orientation-two": {
      step: "ВВОДНЫЙ ИНСТРУКТАЖ // ВОЗВРАЩЕНИЕ",
      media: "state-confidential",
      speaker: "ИРИНА В.",
      text:
        "Да. Возвращение — когда место помнит тебя лучше. Ты узнаёшь запах или музыку. Потом выясняется: у тебя был маршрут.",
      choices: [
        {
          label: "ТЫ ТОЖЕ СЮДА ВЕРНУЛАСЬ?",
          next: "orientation-three",
          effect: { flags: { askedIfIrinaReturned: true } },
        },
        {
          label: "У МЕНЯ УЖЕ ЕСТЬ МАРШРУТ?",
          next: "orientation-three",
          effect: { flags: { askedAboutOwnRoute: true } },
        },
      ],
    },
    "orientation-three": {
      step: "ВВОДНЫЙ ИНСТРУКТАЖ // КУРАТОР",
      media: "state-warm",
      speaker: "ИРИНА В.",
      text: (progress) =>
        progress.flags.askedAboutOwnRoute
          ? "Наверное. Иначе этот канал тебя бы не нашёл. Номер маршрута появится после проверки."
          : "Я живу на работе, поэтому моё возвращение не оформлено. Зато мне разрешили быть куратором и снимать голову Медведя.",
      choices: [
        {
          label: "ТЕБЕ НРАВИТСЯ БЫТЬ КУРАТОРОМ?",
          next: "orientation-personal",
        },
        {
          label: "МОЖЕМ НАЧИНАТЬ",
          next: "role-question",
        },
      ],
    },
    "orientation-personal": {
      step: "ВВОДНЫЙ ИНСТРУКТАЖ // КУРАТОР",
      media: "state-warm",
      speaker: "ИРИНА В.",
      text:
        "Мне нравится задавать вопросы взрослым. Если проверка пройдёт правильно, канал оставят мне ещё на одну смену.",
      choices: [
        {
          label: "ТОГДА НАЧИНАЙ",
          next: "role-question",
        },
      ],
    },
    "role-question": {
      step: "ВЫБОР РОЛИ // 2 ИЗ 9",
      media: "state-neutral",
      speaker: "ИРИНА В.",
      text: "Теперь главное. Ты Волонтёр или Аниматор?",
      choices: [
        {
          label: "АНИМАТОР",
          next: "role-animator",
          effect: {
            profiles: { animator: 3 },
            scores: { obedience: 1 },
            flags: { choseAnimator: true },
          },
        },
        {
          label: "КТО ТАКОЙ ВОЛОНТЁР?",
          next: "role-volunteer",
          effect: {
            scores: { curiosity: 1 },
            flags: { askedAboutVolunteer: true },
          },
        },
        {
          label: "НЕ ЗНАЮ. ПОСОВЕТУЙ",
          next: "role-delegate",
          effect: {
            profiles: { animator: 1 },
            scores: { delegation: 1 },
            flags: { delegatedRole: true },
          },
        },
      ],
    },
    "role-animator": {
      step: "ВЫБОР РОЛИ // 2 ИЗ 9",
      media: "state-warm",
      speaker: "ИРИНА В.",
      text:
        "Хороший ответ. Аниматор принимает костюм, маршрут и длительность смены. Так удобнее: дальше выбирать почти не нужно.",
      choices: [
        {
          label: "ХОРОШО",
          next: "class-briefing-one",
        },
      ],
    },
    "role-volunteer": {
      step: "ВЫБОР РОЛИ // 2 ИЗ 9",
      media: "state-confidential",
      speaker: "ИРИНА В.",
      text:
        "Волонтёр приходит сам и ищет то, чего нет в маршруте. Смотреть ему можно. Чтобы уйти, нужно отдельное разрешение.",
      choices: [
        {
          label: "ПОНЯТНО",
          next: "class-briefing-one",
        },
      ],
    },
    "role-delegate": {
      step: "ВЫБОР РОЛИ // 2 ИЗ 9",
      media: "state-confidential",
      speaker: "ИРИНА В.",
      text:
        "Тогда я выберу за тебя. Мне недавно разрешили самой назначать роли. Я сейчас куратор.",
      choices: [
        {
          label: "ДОВЕРЯЮ ТЕБЕ",
          next: "class-briefing-one",
          effect: {
            profiles: { animator: 1 },
            scores: { delegation: 1 },
          },
        },
      ],
    },
    "class-briefing-one": {
      step: "КЛАССЫ УЧАСТИЯ // ОБЩИЕ ПРАВИЛА",
      media: "state-neutral",
      speaker: "ИРИНА В.",
      text:
        "Коротко: Аниматор становится частью места. Волонтёр остаётся посетителем, пока сам не попросит следующий уровень.",
      choices: [
        {
          label: "А КТО МОЖЕТ ПРОСТО УЙТИ?",
          next: "class-briefing-two",
          effect: { flags: { askedWhoCanLeave: true } },
        },
        {
          label: "А КОМУ МОЖНО СМОТРЕТЬ ПО СТОРОНАМ?",
          next: "class-briefing-two",
          effect: { flags: { askedWhoCanLook: true } },
        },
      ],
    },
    "class-briefing-two": {
      step: "КЛАССЫ УЧАСТИЯ // АНИМАТОР",
      media: "state-confidential",
      speaker: "ИРИНА В.",
      text: (progress) =>
        progress.flags.askedWhoCanLeave
          ? "Волонтёр может попроситься наружу. Аниматор сначала сдаёт смену. Иначе непонятно, кто просится: человек или оболочка."
          : "Волонтёру можно смотреть на двери, журналы и лица. Аниматору не нужно: костюм сам ведёт его куда надо.",
      choices: [
        {
          label: "ПОНЯТНО. А ТЫ НЕ УСТАЛА ОБЪЯСНЯТЬ?",
          next: "class-briefing-three",
        },
      ],
    },
    "class-briefing-three": {
      step: "КЛАССЫ УЧАСТИЯ // ВОЛОНТЁР",
      media: "state-warm",
      speaker: "ИРИНА В.",
      text: "Нет. Я тебе ещё не надоела?",
      choices: [
        {
          label: "НЕТ, ЧТО ТЫ",
          next: "rapport-response",
          effect: { flags: { reassuredIrina: true } },
        },
        {
          label: "Я НАЧИНАЮ К ТЕБЕ ПРИВЫКАТЬ",
          next: "rapport-response",
          effect: { flags: { gettingUsedToIrina: true } },
        },
      ],
    },
    "rapport-response": {
      step: "КАНАЛ 0091-A // КОНТАКТ",
      media: "state-warm",
      speaker: "ИРИНА В.",
      text: (progress) =>
        progress.flags.reassuredIrina
          ? "Хорошо. Я иногда проверяю. Здесь легко не заметить, что собеседник уже ушёл."
          : "Привыкать тоже считается. В Центре это почти дружба.",
      choices: [
        {
          label: "ПРОВЕРЬ, КТО Я",
          next: "waiting-test",
        },
      ],
    },
    "waiting-test": {
      step: "СИТУАЦИЯ // 3 ИЗ 9",
      media: "state-neutral",
      speaker: "ИРИНА В.",
      text:
        "Служебная ситуация. Родители оставили ребёнка у входа и обещали вернуться через пять минут. Что ему делать?",
      choices: [
        {
          label: "ЖДАТЬ НА ТОМ ЖЕ МЕСТЕ",
          next: "waiting-response",
          effect: {
            profiles: { animator: 2 },
            scores: { obedience: 1 },
            flags: { waitedForParents: true },
          },
        },
        {
          label: "ПОЙТИ ИСКАТЬ РОДИТЕЛЕЙ",
          next: "waiting-response",
          effect: {
            profiles: { volunteer: 2 },
            scores: { curiosity: 1 },
            flags: { searchedForParents: true },
          },
        },
        {
          label: "ПОЗВАТЬ КОГО-ТО ИЗ ВЗРОСЛЫХ",
          next: "waiting-response",
          effect: {
            profiles: { animator: 1 },
            scores: { delegation: 1 },
            flags: { calledAdult: true },
          },
        },
      ],
    },
    "waiting-response": {
      step: "СИТУАЦИЯ // 3 ИЗ 9",
      media: "state-alarmed",
      speaker: "ИРИНА В.",
      text: (progress) => {
        if (progress.flags.waitedForParents) {
          return "Правильно. Родители всегда возвращаются. Иногда пять минут идут долго, но это всё ещё пять минут.";
        }

        if (progress.flags.searchedForParents) {
          return "Нет. Если уйти, они вернутся не туда. Тогда ожидание придётся начинать заново.";
        }

        return "Администратора можно позвать. Но тогда он выберет правильное место ожидания сам.";
      },
      choices: [
        {
          label: "И ПОЧЕМУ?",
          next: "parents-rule-one",
        },
      ],
    },
    "parents-rule-one": {
      step: "СЛУЖЕБНАЯ СИТУАЦИЯ // ОЖИДАНИЕ",
      media: "state-confidential",
      speaker: "ИРИНА В.",
      text:
        "Пять минут — не время, а обещание. Пока ребёнок ждёт на месте, по документам родители всё ещё возвращаются.",
      choices: [
        {
          label: "А ЕСЛИ ОНИ НЕ СОБИРАЛИСЬ ВОЗВРАЩАТЬСЯ?",
          next: "parents-rule-two",
          effect: { flags: { questionedParentsReturn: true } },
        },
        {
          label: "И СКОЛЬКО ДЛЯТСЯ ЭТИ ПЯТЬ МИНУТ?",
          next: "parents-rule-two",
          effect: { flags: { questionedWaitingTime: true } },
        },
      ],
    },
    "parents-rule-two": {
      step: "СЛУЖЕБНАЯ СИТУАЦИЯ // ОЖИДАНИЕ",
      media: "state-alarmed",
      speaker: "ИРИНА В.",
      text: (progress) =>
        progress.flags.questionedWaitingTime
          ? "Пока ребёнок ждёт. Если он уйдёт, пять минут начнутся заново — уже в другом месте."
          : "Иначе ребёнка пришлось бы считать оставленным. Для этого есть другая форма: цена входа, класс и согласие на передачу.",
      choices: [
        {
          label: "ТЕБЕ ПОКАЗЫВАЛИ ТАКУЮ ФОРМУ?",
          next: "parents-rule-three",
        },
      ],
    },
    "parents-rule-three": {
      step: "СЛУЖЕБНАЯ СИТУАЦИЯ // ЗАКРЫТА",
      media: "state-neutral",
      speaker: "ИРИНА В.",
      text:
        "Нет. Меня оформили на работу. Это другое: у меня были костюм, питание и место ожидания. Давай следующий вопрос.",
      choices: [
        {
          label: "СЛЕДУЮЩИЙ ВОПРОС",
          next: "memory-drawing",
        },
      ],
    },
    "memory-drawing": {
      step: "ИСТОЧНИК НЕ ОПРЕДЕЛЁН",
      still: "assets/staff/curators/irina/artifacts/memory-drawing.webp",
      sound: "child-laugh-distant",
      stillAlt:
        "Детский рисунок: серое здание у леса, Медведь возле двери и взрослые фигуры, уходящие прочь",
      feedMode: "document",
      feedState: "ЛИЧНЫЙ ФАЙЛ ВОССТАНОВЛЕН",
      signal: 42,
      speaker: "ИРИНА В.",
      text:
        "Странно. Я не открывала архив. Ты помнишь, как нарисовал это в детстве?",
      choices: [
        {
          label: "ДА. КАЖЕТСЯ, ПОМНЮ",
          next: "memory-response",
          effect: { flags: { remembersDrawing: true } },
        },
        {
          label: "НЕТ. Я ЭТОГО НЕ РИСОВАЛ",
          next: "memory-response",
          effect: { flags: { deniesDrawing: true } },
        },
        {
          label: "ПОЧЕМУ МЕДВЕДЬ СТОИТ У ДВЕРИ?",
          next: "memory-response",
          effect: { flags: { noticedDrawingBear: true } },
        },
      ],
    },
    "memory-response": {
      step: "ИСТОЧНИК НЕ ОПРЕДЕЛЁН",
      media: "state-confidential",
      feedState: "ПРЯМОЙ КАНАЛ",
      signal: 57,
      speaker: "ИРИНА В.",
      text: (progress) => {
        if (progress.flags.remembersDrawing) {
          return "Хорошо. Память ещё принимает старые файлы. Не вспоминай, кто уходит справа. Взрослые часто не помещаются.";
        }

        if (progress.flags.noticedDrawingBear) {
          return "Медведь не стоит у двери. Он отмечает правильный вход. Наверное. Раньше он был нарисован меньше.";
        }

        return "Ничего. Обычно сначала не помнят. Потом узнают нажим. Я тоже иногда узнаю свой почерк в чужих документах.";
      },
      choices: [
        {
          label: "ДАВАЙ ВЕРНЁМСЯ К ПРОВЕРКЕ",
          next: "drawing-history",
        },
      ],
    },
    "drawing-history": {
      step: "ЛИЧНЫЙ ФАЙЛ // ПРОИСХОЖДЕНИЕ",
      media: "state-confidential",
      speaker: "ИРИНА В.",
      text:
        "Администрация читает рисунки так: есть дверь — ребёнок согласился войти; взрослые у края — они уже ушли.",
      choices: [
        {
          label: "А ЕСЛИ РЕБЁНОК НЕ СОГЛАШАЛСЯ?",
          next: "drawing-missing",
          effect: { flags: { questionedDrawingConsent: true } },
        },
        {
          label: "КТО РЕШАЕТ, ЧТО НАРИСОВАНО?",
          next: "drawing-missing",
          effect: { flags: { questionedDrawingReading: true } },
        },
      ],
    },
    "drawing-missing": {
      step: "ЛИЧНЫЙ ФАЙЛ // НЕПОЛНАЯ КОМПОЗИЦИЯ",
      still: "assets/staff/curators/irina/artifacts/memory-drawing.webp",
      stillAlt:
        "Детский рисунок с серым зданием, лесом, Медведем и уходящими взрослыми",
      feedMode: "document",
      feedState: "ПОВТОРНАЯ ПРОВЕРКА",
      speaker: "ИРИНА В.",
      text: (progress) =>
        progress.flags.questionedDrawingConsent
          ? "Администрация говорит, что рисунок и есть согласие. Посмотри ещё раз. Какого предмета здесь не хватает?"
          : "Администрация решает. Иногда спрашивает Медведя. Посмотри ещё раз: какого предмета здесь не хватает?",
      choices: [
        {
          label: "ОБРАТНОЙ ДОРОГИ",
          next: "drawing-missing-response",
          effect: { flags: { drawingMissingExit: true } },
        },
        {
          label: "ЛИЦ ВЗРОСЛЫХ",
          next: "drawing-missing-response",
          effect: { flags: { drawingMissingFaces: true } },
        },
        {
          label: "ТЕБЯ РЯДОМ С МЕДВЕДЕМ",
          next: "drawing-missing-response",
          effect: { flags: { drawingMissingSelf: true } },
        },
      ],
    },
    "drawing-missing-response": {
      step: "ЛИЧНЫЙ ФАЙЛ // ДОПОЛНЕН",
      media: "state-alarmed",
      speaker: "ИРИНА В.",
      text: (progress) => {
        if (progress.flags.drawingMissingExit) {
          return "Обратную дорогу рисуют после возвращения. Значит, лист просто не закончен. Это можно считать хорошим признаком.";
        }

        if (progress.flags.drawingMissingFaces) {
          return "Лица взрослых стираются первыми. Наверное, бумага понимает, что они уже не участвуют.";
        }

        return "Ребёнок уже рядом с Медведем. Просто ты смотришь на него как на две разные фигуры. Я тоже долго так смотрела.";
      },
      choices: [
        {
          label: "ДАВАЙ ДАЛЬШЕ",
          next: "image-test",
        },
      ],
    },
    "image-test": {
      step: "ВИЗУАЛЬНАЯ ПРОВЕРКА // 4 ИЗ 9",
      media: "state-neutral",
      speaker: "ИРИНА В.",
      text:
        "Перед входом можно выбрать маршрут. Слева ждут сотрудники. Справа открыта незарегистрированная дверь. Куда ты пойдёшь?",
      choices: [
        {
          label: "МАРШРУТ С СОПРОВОЖДЕНИЕМ",
          image: "assets/staff/photos/polaroid-mascot-corridor.webp",
          imageAlt: "Группа Аниматоров в костюмах стоит в служебном коридоре",
          next: "image-response",
          effect: {
            profiles: { animator: 2 },
            flags: { choseMascotFeed: true },
          },
        },
        {
          label: "НЕЗАРЕГИСТРИРОВАННАЯ ДВЕРЬ",
          image: "assets/staff/photos/polaroid-play-area.webp",
          imageAlt: "Пустая игровая зона с открытой красной служебной дверью",
          next: "image-response",
          effect: {
            profiles: { volunteer: 2 },
            scores: { curiosity: 1 },
            flags: { choseOpenDoorFeed: true },
          },
        },
      ],
    },
    "image-response": {
      step: "ВИЗУАЛЬНАЯ ПРОВЕРКА // 4 ИЗ 9",
      still: "assets/staff/curators/irina/artifacts/service-route-map.webp",
      stillAlt:
        "Старая служебная карта комплекса с цветными маршрутами, заклеенным сектором и зачёркнутыми помещениями",
      feedMode: "document",
      feedState: "КАРТА МАРШРУТА ВОССТАНОВЛЕНА",
      speaker: "ИРИНА В.",
      text: (progress) => {
        if (progress.flags.choseMascotFeed) {
          return "Ты выбрал маршрут, где тебе скажут, куда встать и когда идти. Для Аниматора это безопасный выбор.";
        }

        return "Ты выбрал уровень, которого нет в билете. Волонтёры называют это контролируемым страхом.";
      },
      choices: [
        {
          label: "ЧТО ДАЛЬШЕ?",
          next: "wristband-test",
        },
      ],
    },
    "wristband-test": {
      step: "СЛУЖЕБНАЯ СИТУАЦИЯ // 5 ИЗ 9",
      media: "state-neutral",
      speaker: "ИРИНА В.",
      text:
        "У закрытой двери лежит детский браслет с завтрашней датой. По журналу его ещё не выдавали. Что ты сделаешь?",
      choices: [
        {
          label: "ПЕРЕДАМ БРАСЛЕТ КУРАТОРУ",
          next: "wristband-response",
          effect: {
            profiles: { animator: 1 },
            scores: { delegation: 1 },
            flags: { reportedTomorrowBand: true },
          },
        },
        {
          label: "ПОЙДУ ПО НОМЕРУ МАРШРУТА НА БРАСЛЕТЕ",
          next: "wristband-response",
          effect: {
            profiles: { volunteer: 2 },
            scores: { curiosity: 1 },
            flags: { followedTomorrowBand: true },
          },
        },
        {
          label: "НАДЕНУ ЕГО И ПРОВЕРЮ ДВЕРЬ",
          next: "wristband-response",
          effect: {
            profiles: { volunteer: 2 },
            scores: { curiosity: 1 },
            flags: { woreTomorrowBand: true },
          },
        },
      ],
    },
    "wristband-response": {
      step: "СЛУЖЕБНАЯ СИТУАЦИЯ // 5 ИЗ 9",
      still: "assets/staff/curators/irina/artifacts/blue-key-evidence.webp",
      stillAlt:
        "Потёртый синий служебный ключ без бирки лежит на мокром зелёном столе рядом с документами",
      feedMode: "document",
      feedState: "СОПУТСТВУЮЩИЙ ПРЕДМЕТ НЕ УЧТЁН",
      speaker: "ИРИНА В.",
      text: (progress) => {
        if (progress.flags.reportedTomorrowBand) {
          return "Куратор внесёт браслет в журнал. Если завтрашний посетитель не придёт, браслет назначат тому, кто его нашёл.";
        }

        if (progress.flags.woreTomorrowBand) {
          return "Ты стал посетителем из завтрашнего дня. Волонтёры проверяют пропуска на себе. Иногда дверь запоминает их раньше.";
        }

        return "Ты выбрал завтрашний маршрут. Волонтёры идут по следу ещё до того, как он появляется в документах.";
      },
      choices: [
        {
          label: "ПОЧЕМУ НЕЛЬЗЯ ПРОСТО УНИЧТОЖИТЬ БРАСЛЕТ?",
          next: "wristband-explain",
        },
      ],
    },
    "wristband-explain": {
      step: "СЛУЖЕБНАЯ СИТУАЦИЯ // УЧЁТ",
      still: "assets/staff/curators/irina/artifacts/assigned-toy-polaroid.webp",
      stillAlt:
        "Старая фотография: плюшевый кролик с пустой служебной биркой сидит на детском стуле перед тёмной дверью",
      feedMode: "document",
      feedState: "ПРЕДМЕТ ОЖИДАЕТ НАЗНАЧЕНИЯ",
      speaker: "ИРИНА В.",
      text:
        "У нас вещи появляются раньше владельцев. Браслет, маска или игрушка сначала попадают в учёт, а потом ждут тело.",
      choices: [
        {
          label: "ПОНЯТНО. ЧТО ДАЛЬШЕ?",
          next: "recognition-card",
        },
      ],
    },
    "recognition-card": {
      step: "ПРОВЕРКА ДЕТСКОГО РАСПОЗНАВАНИЯ",
      still: "assets/staff/curators/irina/artifacts/recognition-cat-rabbit.webp",
      stillAlt:
        "Симметричное чёрное чернильное пятно, похожее одновременно на кота и кролика",
      feedMode: "document",
      feedState: "КАРТОЧКА 04",
      signal: 66,
      speaker: "ИРИНА В.",
      text:
        "Ещё одна карточка. Здесь нужно отвечать быстро. Что ты видишь: котика или кролика?",
      choices: [
        {
          label: "КОТИКА",
          next: "recognition-cat",
          effect: { flags: { sawCat: true } },
        },
        {
          label: "КРОЛИКА",
          next: "recognition-rabbit",
          effect: { flags: { sawRabbit: true } },
        },
        {
          label: "ПРОСТО ПЯТНО",
          next: "recognition-ink",
          effect: { flags: { sawInk: true } },
        },
      ],
    },
    "recognition-cat": {
      step: "ПОБОЧНЫЙ КАНАЛ // ПАВЕЛ К.",
      media: "cctv-pavel-observation-booth",
      feedMode: "cctv",
      feedState: "КАБИНКА ОБОЗРЕНИЯ 06",
      signal: 39,
      speaker: "ИРИНА В.",
      text:
        "Я тоже вижу котика. У нас есть кот Паша — оператор кабинок обозрения. Он всегда улыбается в камеру.",
      delayChoicesUntilEnd: true,
      choices: [
        {
          label: "ОН ВИДИТ НАС СЕЙЧАС?",
          next: "pavel-response",
          effect: { flags: { askedIfPavelSees: true } },
        },
        {
          label: "ОН ДЕЙСТВИТЕЛЬНО КОТ?",
          next: "pavel-response",
          effect: { flags: { askedIfPavelCat: true } },
        },
      ],
    },
    "pavel-response": {
      step: "ПОБОЧНЫЙ КАНАЛ // ПАВЕЛ К.",
      media: "state-warm",
      feedState: "ПРЯМОЙ КАНАЛ",
      signal: 61,
      speaker: "ИРИНА В.",
      text: (progress) =>
        progress.flags.askedIfPavelCat
          ? "Паша говорит, что Павел — служебное имя. Кот — домашнее. Но домой его ещё ни разу не забирали."
          : "Он видит все кабинки. Даже те, в которых никто не сидит. Если он улыбается, значит, запись идёт правильно.",
      choices: [
        {
          label: "ДАВАЙ ДАЛЬШЕ",
          next: "loneliness",
        },
      ],
    },
    "recognition-rabbit": {
      step: "ПРОВЕРКА ДЕТСКОГО РАСПОЗНАВАНИЯ",
      media: "state-warm",
      feedState: "КАРТОЧКА ПРИНЯТА",
      speaker: "ИРИНА В.",
      text:
        "Раньше здесь был кролик. Потом его перевели на маршрут без камер. На старых карточках он всё равно появляется.",
      choices: [
        {
          label: "ПОНЯТНО",
          next: "loneliness",
        },
      ],
    },
    "recognition-ink": {
      step: "ПРОВЕРКА ДЕТСКОГО РАСПОЗНАВАНИЯ",
      media: "state-confidential",
      feedState: "ОТВЕТ НЕ КЛАССИФИЦИРОВАН",
      speaker: "ИРИНА В.",
      text:
        "Просто пятен не бывает. Если картинка ничего не напоминает, Администрация назначает воспоминание. Запишу: котик.",
      choices: [
        {
          label: "ЛАДНО. ДАВАЙ ДАЛЬШЕ",
          next: "loneliness",
        },
      ],
    },
    loneliness: {
      step: "НЕЗАПЛАНИРОВАННЫЙ ВОПРОС",
      media: "state-confidential",
      feedState: "ПРЯМОЙ КАНАЛ",
      speaker: "ИРИНА В.",
      text:
        "У Паши много кабинок. У меня только этот канал. Здесь у меня нет друзей. Есть сотрудники, но это другое, наверное.",
      choices: [
        {
          label: "МНЕ ЖАЛЬ, ЧТО ТЫ ЗДЕСЬ ОДНА",
          next: "private-file-video",
          effect: { flags: { empathizedWithIrina: true } },
        },
        {
          label: "А МЕДВЕДЬ?",
          next: "loneliness-bear",
          effect: { flags: { calledBearFriend: true } },
        },
        {
          label: "НАМ НУЖНО ПРОДОЛЖИТЬ ПРОВЕРКУ",
          next: "loneliness-formal",
          effect: { flags: { keptFormalDistance: true } },
        },
      ],
    },
    "private-file-video": {
      step: "НЕЗАПЛАНИРОВАННАЯ ПЕРЕДАЧА",
      media: "action-private-file",
      feedState: "ИСХОДЯЩИЙ ФАЙЛ",
      signal: 48,
      speaker: "ИРИНА В.",
      text:
        "Ничего. Сейчас я уже не совсем одна. У меня для тебя кое-что есть. Только не показывай Старшему Проводнику.",
      delayChoicesUntilEnd: true,
      choices: [
        {
          label: "ПРИНЯТЬ ФАЙЛ",
          next: "private-file-accepted",
          downloadFile: "irina-private-photo",
          effect: {
            files: ["irina-private-photo"],
            flags: { acceptedPrivatePhoto: true },
          },
        },
        {
          label: "ПУСТЬ ОСТАНЕТСЯ У ТЕБЯ",
          next: "private-file-declined",
          effect: { flags: { declinedPrivatePhoto: true } },
        },
      ],
    },
    "private-file-accepted": {
      step: "ФАЙЛ ПОЛУЧЕН // 1",
      media: "state-warm",
      feedState: "ПЕРЕДАЧА ЗАВЕРШЕНА",
      speaker: "ИРИНА В.",
      text:
        "Это я в фотокабинке торгового центра. Там можно было сделать четыре фотографии. Теперь ты меня не забудешь.",
      choices: [
        {
          label: "НЕ ЗАБУДУ",
          next: "costume-test",
          effect: { flags: { promisedNotToForget: true } },
        },
      ],
    },
    "private-file-declined": {
      step: "ПЕРЕДАЧА ОТМЕНЕНА",
      media: "state-neutral",
      speaker: "ИРИНА В.",
      text:
        "Хорошо. Я оставлю её у себя. Фотографии тоже могут подождать, если не выключать свет.",
      choices: [
        {
          label: "ХОРОШО. ДАВАЙ ДАЛЬШЕ",
          next: "costume-test",
        },
      ],
    },
    "loneliness-bear": {
      step: "НЕЗАПЛАНИРОВАННЫЙ ВОПРОС",
      media: "state-confidential",
      speaker: "ИРИНА В.",
      text:
        "Медведь — не друг. Медведь работает вместе со мной. Друзьям разрешено видеть лица, а ему моё лицо мешает.",
      choices: [
        {
          label: "ПОНЯТНО. ДАВАЙ ДАЛЬШЕ",
          next: "costume-test",
        },
      ],
    },
    "loneliness-formal": {
      step: "СЛУЖЕБНЫЙ КАНАЛ ВОССТАНОВЛЕН",
      media: "state-neutral",
      speaker: "ИРИНА В.",
      text:
        "Хорошо. Так удобнее. Сотрудники тоже обычно просят меня перейти к следующему вопросу.",
      choices: [
        {
          label: "СЛЕДУЮЩИЙ ВОПРОС",
          next: "costume-test",
        },
      ],
    },
    "costume-test": {
      step: "СЛУЖЕБНАЯ СИТУАЦИЯ // 6 ИЗ 9",
      media: "state-neutral",
      speaker: "ИРИНА В.",
      text:
        "Во время смены из соседнего костюма слышен плач. Согласно записям, костюм не занят. Что ты сделаешь?",
      choices: [
        {
          label: "ПРОВЕРЮ ВНУТРЕННОСТИ КОСТЮМА",
          next: "costume-response",
          effect: {
            profiles: { volunteer: 2 },
            scores: { curiosity: 1 },
            flags: { openedCostume: true },
          },
        },
        {
          label: "СООБЩУ КУРАТОРУ",
          next: "costume-response",
          effect: {
            profiles: { animator: 1 },
            scores: { delegation: 1 },
            flags: { reportedCostume: true },
          },
        },
        {
          label: "ПРОДОЛЖУ СВОЙ МАРШРУТ",
          next: "costume-response",
          effect: {
            profiles: { animator: 2 },
            scores: { obedience: 1 },
            flags: { continuedRoute: true },
          },
        },
      ],
    },
    "costume-response": {
      step: "СЛУЖЕБНАЯ СИТУАЦИЯ // 6 ИЗ 9",
      media: "state-alarmed",
      speaker: "ИРИНА В.",
      text: (progress) => {
        if (progress.flags.openedCostume) {
          return "Ты пошёл на звук, хотя журнал объявил его несуществующим. Волонтёрам полезно находить то, чего нет в списке.";
        }

        if (progress.flags.reportedCostume) {
          return "Правильно. Администрация решит, был ли костюм пуст. Журнал иногда знает раньше.";
        }

        return "Правильно. Если журнал говорит, что пусто, значит, плач не относится к твоей смене.";
      },
      choices: [
        {
          label: "И ЧТО ЭТО ЗНАЧИТ?",
          next: "costume-history-one",
        },
      ],
    },
    "costume-history-one": {
      step: "ОБОЛОЧКИ // УЧЁТ",
      media: "state-neutral",
      speaker: "ИРИНА В.",
      text:
        "Журнал хранит костюм отдельно от человека. Если пустой костюм плачет, плач ещё не оформлен. Молнию открывать нельзя.",
      choices: [
        {
          label: "КАК ЧЕЛОВЕК ОСТАЁТСЯ БЕЗ ДОЛЖНОСТИ?",
          next: "costume-history-two",
        },
      ],
    },
    "costume-history-two": {
      step: "ОБОЛОЧКИ // ПРИВЯЗКА",
      media: "state-confidential",
      speaker: "ИРИНА В.",
      text:
        "Иногда сотрудник снимает голову, называет старое имя или вспоминает дом. Тогда ждут, пока память устанет.",
      choices: [
        {
          label: "А ЕСЛИ НЕ ПОНИМАЕТ?",
          next: "bear-question",
        },
      ],
    },
    "bear-question": {
      step: "ОБОЛОЧКА // ДЕМОНСТРАЦИЯ",
      media: "state-confidential",
      speaker: "ИРИНА В.",
      text:
        "Ты смотришь на голову Медведя. Когда человеку страшно, оболочка помогает. В ней никто не видит страха.",
      choices: [
        {
          label: "ТЕБЕ СЕЙЧАС СТРАШНО?",
          next: "bear-head-on",
          effect: { flags: { askedIfIrinaAfraid: true } },
        },
        {
          label: "ПОКАЖИ, КАК ЭТО РАБОТАЕТ",
          next: "bear-head-on",
          effect: { flags: { askedForBearDemonstration: true } },
        },
        {
          label: "МНЕ ТОЖЕ ВЫДАДУТ МЕДВЕДЯ?",
          next: "bear-head-on",
          effect: { flags: { askedForBear: true } },
        },
      ],
    },
    "bear-head-on": {
      step: "ОБОЛОЧКА // АКТИВАЦИЯ",
      media: "action-bear-head-on",
      feedState: "СОТРУДНИК 0091-A",
      signal: 52,
      speaker: "ИРИНА В.",
      text: (progress) => {
        if (progress.flags.askedIfIrinaAfraid) {
          return "Это не относится к проверке. Подожди. Я покажу, как правильно.";
        }

        if (progress.flags.askedForBear) {
          return "Голову выдают после назначения. Сначала нужно проверить, не станет ли тебе без неё спокойнее.";
        }

        return "Смотри. Только не пытайся увидеть лицо через глаза. Так оболочка работает хуже.";
      },
      autoNext: "bear-neutral",
    },
    "bear-neutral": {
      step: "ОБОЛОЧКА // АКТИВНА",
      media: "state-bear-neutral",
      feedState: "ЛИЦО СОТРУДНИКА СКРЫТО",
      signal: 47,
      speaker: "МЕДВЕДЬ",
      text:
        "Сейчас меня не видно. Значит, можно продолжать. Медведь не боится вопросов. Он просто не на все отвечает.",
      delayChoicesUntilEnd: true,
      choices: [
        {
          label: "ИРИНА, Я ВСЁ ЕЩЁ ТЕБЯ ВИЖУ",
          next: "bear-response",
          effect: { flags: { seesIrinaInsideBear: true } },
        },
        {
          label: "ЗДРАВСТВУЙ, МЕДВЕДЬ",
          next: "bear-response",
          effect: { flags: { greetedBear: true } },
        },
        {
          label: "ПРОДОЛЖИМ ПРОВЕРКУ",
          next: "bear-response",
          effect: { flags: { acceptsBearMode: true } },
        },
      ],
    },
    "bear-response": {
      step: "ОБОЛОЧКА // АКТИВНА",
      media: "state-bear-neutral",
      feedState: "ЛИЦО СОТРУДНИКА СКРЫТО",
      signal: 44,
      speaker: "ИРИНА В.",
      text: (progress) => {
        if (progress.flags.greetedBear) {
          return "Он услышал. Только не разговаривай с ним долго. Потом он начинает думать, что это его видеозвонок.";
        }

        if (progress.flags.seesIrinaInsideBear) {
          return "Нет. Ты видишь должность. Лицо находится глубже. Администрация просила не путать.";
        }

        return "Хорошо. В оболочке служебные вопросы звучат короче. Поэтому сотрудники реже устают.";
      },
      choices: [
        {
          label: "ДАВАЙ ДАЛЬШЕ",
          next: "bear-corridor",
        },
      ],
    },
    "bear-corridor": {
      step: "СЛУЖЕБНОЕ НАБЛЮДЕНИЕ // МАРШРУТ 394",
      media: "cctv-bear-corridor",
      feedMode: "cctv",
      feedState: "КОРИДОР 394",
      signal: 33,
      speaker: "СИСТЕМА",
      text:
        "Проверка перемещения оболочки 0091-A. Несовпадение времени записи с текущим сеансом: 12 часов.",
      autoNext: "aroma-warning",
    },
    "aroma-warning": {
      step: "ПЛАНОВАЯ АРОМАТИЗАЦИЯ // 00:20",
      media: "state-alarmed",
      feedState: "СЛУЖЕБНАЯ ПАУЗА",
      signal: 58,
      speaker: "ИРИНА В.",
      text:
        "Подожди. Каждые двенадцать часов здесь ароматизация. Тебе противогаз не нужен: через экран запах не проходит.",
      glitchIn: true,
      choices: [
        {
          label: "ПОДОЖДАТЬ",
          next: "aroma-cycle",
        },
      ],
    },
    "aroma-cycle": {
      step: "ПЛАНОВАЯ АРОМАТИЗАЦИЯ",
      media: "action-aroma-cycle",
      sound: "aroma-airflow",
      feedState: "ПОМЕЩЕНИЕ ОБРАБАТЫВАЕТСЯ",
      signal: 35,
      speaker: "СИСТЕМА",
      text:
        "Не отключайте канал. Вдыхание без средств защиты считается добровольным обновлением возраста.",
      autoNext: "post-aroma-jelly",
    },
    "post-aroma-jelly": {
      step: "ПЛАНОВАЯ АРОМАТИЗАЦИЯ // ЗАВЕРШЕНА",
      still: "assets/staff/curators/irina/artifacts/post-aroma-dessert.webp",
      stillAlt:
        "Десерт в прозрачном стаканчике, ложка и мокрый противогаз лежат на металлическом подносе после обработки помещения",
      feedMode: "document",
      feedState: "НОРМА ВОССТАНОВЛЕНА",
      signal: 62,
      speaker: "ИРИНА В.",
      text:
        "После ароматизации сотрудникам дают десерт. Это положено, даже если не хочется.",
      delayChoicesUntilEnd: true,
      choices: [
        {
          label: "КАКОЙ У НЕГО ВКУС?",
          next: "jelly-response",
          effect: { flags: { askedJellyFlavor: true } },
        },
        {
          label: "ЗАЧЕМ ТОГДА ПРОТИВОГАЗ?",
          next: "jelly-response",
          effect: { flags: { questionedJelly: true } },
        },
        {
          label: "МНЕ ТОЖЕ МОЖНО?",
          next: "jelly-response",
          effect: { flags: { requestedJelly: true } },
        },
      ],
    },
    "jelly-response": {
      step: "НОРМА СОТРУДНИКА // 0091-A",
      media: "state-warm",
      speaker: "ИРИНА В.",
      text: (progress) => {
        if (progress.flags.askedJellyFlavor) {
          return "Клубничный. Наверное. На крышке нарисована клубника. После него легче помнить только хорошие правила.";
        }

        if (progress.flags.questionedJelly) {
          return "Это разное. Ароматизация — для помещений. Желе — для сотрудников. Без него голова Медведя давит сильнее.";
        }

        return "Тебе пока нельзя. Сначала нужно получить постоянную должность. Потом тебе тоже будут выдавать порцию.";
      },
      choices: [
        {
          label: "О ЧЁМ МЫ ГОВОРИЛИ ДО АРОМАТИЗАЦИИ?",
          next: "jelly-memory",
        },
      ],
    },
    "jelly-memory": {
      step: "ПРОТОКОЛ ВОССТАНОВЛЕН",
      media: "state-neutral",
      speaker: "ИРИНА В.",
      interruptedText:
        "Мы говорили о Медведе. До ароматизации я ещё помнила, как меня привезли сюда и—",
      text:
        "До ароматизации? Мы ещё не начинали личные вопросы. Ты, наверное, перепутал этот звонок с предыдущим.",
      choices: [
        {
          label: "ЭТО МОЙ ПЕРВЫЙ ЗВОНОК",
          next: "cycle-history-one",
          effect: { flags: { deniedPreviousCall: true } },
        },
        {
          label: "КАКИМ ПРЕДЫДУЩИМ?",
          next: "cycle-history-one",
          effect: { flags: { askedPreviousCall: true } },
        },
      ],
    },
    "cycle-history-one": {
      step: "ЦИКЛ СОТРУДНИКА // 12 ЧАСОВ",
      media: "state-neutral",
      speaker: "ИРИНА В.",
      text:
        "Смена длится двенадцать часов. Между сменами есть несколько минут: поесть, сменить фильтр и обновить возраст.",
      choices: [
        {
          label: "ЧТО ЗНАЧИТ «ОБНОВИТЬ ВОЗРАСТ»?",
          next: "cycle-history-two",
          effect: { flags: { askedHowAgeUpdates: true } },
        },
        {
          label: "ТЫ ПОМНИШЬ СВОЙ ДОМ?",
          next: "cycle-history-two",
          effect: { flags: { askedIfIrinaRemembersHome: true } },
        },
      ],
    },
    "cycle-history-two": {
      step: "ЦИКЛ СОТРУДНИКА // ВОЗРАСТ",
      media: "state-confidential",
      speaker: "ИРИНА В.",
      text: (progress) =>
        progress.flags.askedIfIrinaRemembersHome
          ? "Иногда помню кухню или прихожую. А потом замечаю там служебную дверь, которой раньше не было."
          : "Возраст не должен мешать должности. У Волонтёра он хранится в пропуске, у Аниматора — внутри оболочки.",
      choices: [
        {
          label: "ТЫ ХОЧЕШЬ ВЕРНУТЬСЯ ТУДА?",
          next: "cycle-history-three",
        },
      ],
    },
    "cycle-history-three": {
      step: "ЦИКЛ СОТРУДНИКА // ОТКЛОНЕНИЕ",
      media: "state-alarmed",
      speaker: "ИРИНА В.",
      text:
        "Родители устроили меня на работу. Здесь безопаснее, чем дома. Я не должна сомневаться в их решении. Забудь.",
      choices: [
        {
          label: "НЕ БУДУ ЗАБЫВАТЬ",
          next: "ulybarych-archive",
          effect: { flags: { refusesToForgetParentsLine: true } },
        },
        {
          label: "ХОРОШО",
          next: "ulybarych-archive",
          effect: { flags: { agreesToForgetParentsLine: true } },
        },
      ],
    },
    "ulybarych-archive": {
      step: "АРХИВНЫЙ ЭФИР // ИСТОЧНИК 001",
      media: "archive-ulybarych-empty-chair",
      sound: "child-laugh-archive",
      feedMode: "archive",
      feedState: "ПЕРЕДАЧА «УЛЫБАРЫЧ»",
      signal: 22,
      speaker: "СИСТЕМА",
      text:
        "Прямой канал временно замещён обязательным возрастным содержанием.",
      autoNext: "ulybarych-response",
    },
    "ulybarych-response": {
      step: "АРХИВНЫЙ ЭФИР // ИСТОЧНИК 001",
      media: "state-confidential",
      feedState: "ПРЯМОЙ КАНАЛ",
      signal: 49,
      speaker: "ИРИНА В.",
      text:
        "Мой любимый выпуск. Улыбарыч просит ребёнка ждать на стуле. Раньше родители возвращались. Наверное, плёнку обрезали.",
      choices: [
        {
          label: "СТУЛ БЫЛ ПУСТЫМ",
          next: "ulybarych-answer",
          effect: { flags: { noticedEmptyChair: true } },
        },
        {
          label: "КТО ТАКОЙ УЛЫБАРЫЧ?",
          next: "ulybarych-answer",
          effect: { flags: { askedAboutUlybarych: true } },
        },
        {
          label: "Я БУДТО УЖЕ ВИДЕЛ ЭТОТ ВЫПУСК",
          next: "ulybarych-answer",
          effect: { flags: { remembersUlybarych: true } },
        },
      ],
    },
    "ulybarych-answer": {
      step: "АРХИВНЫЙ ЭФИР // ЗАВЕРШЁН",
      media: "state-alarmed",
      speaker: "ИРИНА В.",
      text: (progress) => {
        if (progress.flags.noticedEmptyChair) {
          return "Нет. Ребёнок сидел правильно. Камера просто не всегда показывает сырьё. Это правило старых передач.";
        }

        if (progress.flags.askedAboutUlybarych) {
          return "Раньше он был ведущим. Теперь он Помощник по возрасту. Он умеет определить, сколько детства осталось внутри взрослого.";
        }

        return "Значит, выпуск запомнил тебя первым. Улыбарыч говорит, что зрители возвращаются даже тогда, когда не помнят программу.";
      },
      choices: [
        {
          label: "ДАВАЙ ВЕРНЁМСЯ К ЗВОНКУ",
          next: "ulybarych-history-one",
        },
      ],
    },
    "ulybarych-history-one": {
      step: "АРХИВНЫЙ ЭФИР // СПРАВКА",
      media: "state-warm",
      speaker: "ИРИНА В.",
      text:
        "Улыбарыч учил правильно быть ребёнком: иметь любимую игрушку, бояться темноты и отвечать, когда он смотрит в камеру.",
      choices: [
        {
          label: "ПОЧЕМУ ОН РАБОТАЕТ СО ВЗРОСЛЫМИ?",
          next: "ulybarych-history-two",
        },
      ],
    },
    "ulybarych-history-two": {
      step: "АРХИВНЫЙ ЭФИР // ПОМОЩНИК ПО ВОЗРАСТУ",
      media: "state-confidential",
      speaker: "ИРИНА В.",
      text:
        "Взрослые узнают музыку слишком быстро. Улыбарыч зовёт это остаточным детством. Потом они уже не переключают канал.",
      choices: [
        {
          label: "Я НЕ БУДУ В ЭТОМ УЧАСТВОВАТЬ",
          next: "hears-noise",
          effect: { flags: { rejectsUlybarychAudience: true } },
        },
        {
          label: "ДАВАЙ ПРОДОЛЖИМ",
          next: "hears-noise",
        },
      ],
    },
    "hears-noise": {
      step: "ПРОВЕРКА КАНАЛА // 7 ИЗ 9",
      media: "action-hears-noise",
      feedState: "ПОСТОРОННИЙ ШУМ",
      signal: 31,
      speaker: "ИРИНА В.",
      text:
        "Тихо. Не пытайся разглядеть, кто там. Кажется, Проводница проверяет канал.",
      delayChoicesUntilEnd: true,
      choices: [
        {
          label: "КТО ТАКАЯ ПРОВОДНИЦА?",
          next: "noise-response",
          effect: {
            profiles: { volunteer: 1 },
            scores: { curiosity: 1 },
            flags: { askedAboutGuide: true },
          },
        },
        {
          label: "ХОРОШО. НЕ БУДУ СМОТРЕТЬ",
          next: "noise-response",
          effect: {
            profiles: { animator: 1 },
            scores: { obedience: 1 },
            flags: { obeyedNoise: true },
          },
        },
        {
          label: "ПОПРОБУЮ РАЗГЛЯДЕТЬ, КТО ВОШЁЛ",
          next: "noise-response",
          effect: {
            profiles: { volunteer: 2 },
            scores: { curiosity: 1 },
            flags: { lookedBehindIrina: true },
          },
        },
      ],
    },
    "noise-response": {
      step: "ПРОВЕРКА КАНАЛА // 7 ИЗ 9",
      media: "state-alarmed",
      feedState: "СИГНАЛ НЕСТАБИЛЕН",
      signal: 28,
      speaker: "ИРИНА В.",
      text: (progress) => {
        if (progress.flags.askedAboutGuide) {
          return "Это не имя. Это должность. Если она спросит, мы говорили только о классификации.";
        }

        if (progress.flags.lookedBehindIrina) {
          return "Я просила не смотреть. Волонтёр всегда идёт туда, где что-то шевельнулось. Даже если оно у него за спиной.";
        }

        return "Молодец. Тебе положена ещё одна наклейка. Эту тоже не видно.";
      },
      choices: [
        {
          label: "ПОДОЖДАТЬ",
          next: "plague-doctor-camera",
        },
      ],
    },
    "plague-doctor-camera": {
      step: "ВНЕШНИЙ ЗАХВАТ КАНАЛА",
      media: "intrusion-plague-doctor-camera",
      sound: "plague-doctor-string-sting",
      feedMode: "cctv",
      feedState: "CAPTURE DEVICE 312",
      signal: 9,
      speaker: "СИСТЕМА",
      text:
        "Не отводите лицо от экрана. Выполняется фотографирование для временного пропуска.",
      flashOnEnd: true,
      autoNext: "plague-doctor-response",
    },
    "plague-doctor-response": {
      step: "ФОТОГРАФИРОВАНИЕ ЗАВЕРШЕНО",
      media: "state-alarmed",
      feedState: "ПРЯМОЙ КАНАЛ",
      signal: 38,
      speaker: "ИРИНА В.",
      text:
        "Не переживай. Это для пропуска в Лосиный Остров. Обычно Главврач просит не моргать. Жаль, что только после вспышки.",
      choices: [
        {
          label: "Я НЕ ДАВАЛ СОГЛАСИЯ НА ФОТО",
          next: "plague-doctor-answer",
          effect: { flags: { refusedPhotoConsent: true } },
        },
        {
          label: "КТО ЭТО БЫЛ?",
          next: "plague-doctor-answer",
          effect: { flags: { askedAboutDoctor: true } },
        },
        {
          label: "ЧТО БУДЕТ НА ПРОПУСКЕ?",
          next: "plague-doctor-answer",
          effect: { flags: { askedAboutPass: true } },
        },
      ],
    },
    "plague-doctor-answer": {
      step: "ВРЕМЕННЫЙ ПРОПУСК // СОЗДАНИЕ",
      media: "state-confidential",
      speaker: "ИРИНА В.",
      text: (progress) => {
        if (progress.flags.refusedPhotoConsent) {
          return "Окно с согласием появилось перед вспышкой и сразу закрылось. Главврач считает, что взрослые читают быстро.";
        }

        if (progress.flags.askedAboutDoctor) {
          return "Главврач отвечает за фотографии сотрудников до того, как им выдают новое лицо. Я не знаю, куда он складывает старые.";
        }

        return "Если лицо получилось, на пропуске будет лицо. Если нет — должность. Должность фотографировать легче.";
      },
      choices: [
        {
          label: "И ЧТО ДАЛЬШЕ?",
          next: "pass-history-one",
        },
      ],
    },
    "pass-history-one": {
      step: "ВРЕМЕННЫЙ ПРОПУСК // ФОТО",
      media: "state-neutral",
      speaker: "ИРИНА В.",
      text:
        "На первом пропуске фото всегда немного неправильное. Камера снимает не лицо, а того, кем ты войдёшь в Лосиный Остров.",
      choices: [
        {
          label: "А ЧТО БЫЛО НА ТВОЁМ ПРОПУСКЕ?",
          next: "pass-history-two",
        },
      ],
    },
    "pass-history-two": {
      step: "ВРЕМЕННЫЙ ПРОПУСК // 0091-A",
      media: "state-alarmed",
      speaker: "ИРИНА В.",
      text:
        "На моём вместо меня был Медведь. Я ещё не выбрала его, но родители назвали фотографию удачной. Вторую мне не показывают.",
      choices: [
        {
          label: "ИРИНА, ТЕБЕ НЕ ОБЯЗАТЕЛЬНО ЭТО ОПРАВДЫВАТЬ",
          next: "shush-exit",
          effect: { flags: { challengedIrinaDefense: true } },
        },
        {
          label: "ПОНЯТНО",
          next: "shush-exit",
        },
      ],
    },
    "shush-exit": {
      step: "КАНАЛ ПРИОСТАНОВЛЕН // 8 ИЗ 9",
      media: "action-shush-exit",
      feedState: "НЕ ОТКЛЮЧАТЬСЯ",
      signal: 12,
      speaker: "ИРИНА В.",
      text: "Подожди здесь. И не нажимай красную кнопку.",
      autoNext: "empty-room",
    },
    "empty-room": {
      step: "ИСТОЧНИК НЕ ОПРЕДЕЛЁН // 8 ИЗ 9",
      still: "assets/staff/curators/irina/artifacts/operator-empty-chair.webp",
      sound: "unknown-female-voice",
      stillAlt:
        "Пустое кресло оператора с наушниками перед старым монитором, показывающим то же рабочее место",
      feedMode: "cctv",
      feedState: "ВИДЕОПОТОК ПРИОСТАНОВЛЕН",
      signal: 7,
      speaker: "МЕДВЕДЬ?",
      text: "ОНА УЖЕ СПРАШИВАЛА ТЕБЯ РАНЬШЕ.",
      choices: [
        {
          label: "ИРИНА?",
          next: "return-sit",
          effect: {
            profiles: { volunteer: 1 },
            scores: { curiosity: 1 },
            flags: { answeredBear: true },
          },
        },
        {
          label: "КТО ЭТО СКАЗАЛ?",
          next: "return-sit",
          effect: {
            profiles: { volunteer: 1 },
            scores: { curiosity: 1 },
            flags: { answeredBear: true, questionedBear: true },
          },
        },
        {
          label: "НИЧЕГО НЕ ОТВЕЧАТЬ",
          next: "return-sit",
          effect: {
            profiles: { animator: 1 },
            scores: { obedience: 1 },
            flags: { silentForBear: true },
          },
        },
      ],
    },
    "return-sit": {
      step: "ВОССТАНОВЛЕНИЕ КАНАЛА // 8 ИЗ 9",
      media: "action-return-sit",
      feedState: "ВОССТАНОВЛЕНИЕ",
      signal: 24,
      speaker: "СИСТЕМА",
      text: "Куратор возвращён в активный канал.",
      autoNext: "return-explain",
      glitchIn: true,
    },
    "return-explain": {
      step: "КЛАССИФИКАЦИЯ // 9 ИЗ 9",
      media: "state-alarmed",
      feedState: "ПРЯМОЙ КАНАЛ",
      signal: 51,
      speaker: "ИРИНА В.",
      text: (progress) => {
        if (progress.flags.answeredBear) {
          return "Медведь не умеет говорить. Я просила тебя не отвечать, когда меня нет.";
        }

        return "Хорошо. Ты умеешь ждать. Медведь иногда проверяет это без разрешения.";
      },
      choices: [
        {
          label: "УЗНАТЬ НАЗНАЧЕНИЕ",
          next: "return-memory-one",
        },
      ],
    },
    "return-memory-one": {
      step: "КАНАЛ 0091-A // ЛИЧНОЕ ОТКЛОНЕНИЕ",
      media: "state-confidential",
      speaker: "ИРИНА В.",
      text: (progress) => {
        const drawingCallback = progress.flags.deniesDrawing
          ? "Ты не признал рисунок."
          : "Ты задержался у рисунка.";
        const fileCallback = progress.flags.acceptedPrivatePhoto
          ? "Ты принял моё фото."
          : "Моего фото у тебя нет.";

        return `${drawingCallback} ${fileCallback} Это было не для должности. Я хотела понять, запомнишь ли ты разговор.`;
      },
      choices: [
        {
          label: "Я БУДУ ПОМНИТЬ РАЗГОВОР",
          next: "return-memory-two",
          effect: { flags: { promisesToRememberCall: true } },
        },
        {
          label: "СИСТЕМА ВСЁ РАВНО ЕГО СОХРАНИТ",
          next: "return-memory-two",
          effect: { flags: { trustsSystemMemory: true } },
        },
      ],
    },
    "return-memory-two": {
      step: "КАНАЛ 0091-A // ЛИЧНОЕ ОТКЛОНЕНИЕ",
      media: "state-warm",
      speaker: "ИРИНА В.",
      text: (progress) =>
        progress.flags.promisesToRememberCall
          ? "Хорошо. Значит, ты запомнишь этот разговор там, снаружи. Это почти как друг, которому не нужно отвечать каждый день."
          : "Система сохранит только назначение. Остальное — шум. Иногда это единственное место, где я говорю своим голосом.",
      choices: [
        {
          label: "КТО-ТО ЕЩЁ ВЫБИРАЕТ НАЗНАЧЕНИЕ?",
          next: "private-argument",
        },
      ],
    },
    "private-argument": {
      step: "КЛАССИФИКАЦИЯ // 9 ИЗ 9",
      media: "action-unseen-interlocutor",
      feedState: "ВТОРОЙ ГОЛОС НЕ ОБНАРУЖЕН",
      signal: 44,
      speaker: "ИРИНА В.",
      text:
        "Нет. Теперь назначаю я. Я сейчас куратор. В прошлый раз выбирал ты.",
      autoNext: "assignment",
    },
    assignment: {
      step: "НАЗНАЧЕНИЕ СОХРАНЕНО",
      media: "state-neutral",
      sound: "child-laugh-close",
      soundAfterText: true,
      feedState: "КЛАССИФИКАЦИЯ ЗАВЕРШЕНА",
      signal: 63,
      speaker: "ИРИНА В.",
      text: (progress) => {
        const role = getCuratorAssignment(progress);
        const callbacks = getAssignmentCallbacks(progress, role);
        return `${callbacks} Я закончила считать.`;
      },
      choices: [
        {
          label: "И КТО Я?",
          next: "assignment-role",
        },
      ],
    },
    "assignment-role": {
      step: "НАЗНАЧЕНИЕ СОХРАНЕНО",
      media: "state-warm",
      feedState: "КЛАССИФИКАЦИЯ ЗАВЕРШЕНА",
      signal: 63,
      speaker: "ИРИНА В.",
      text: (progress) =>
        getCuratorAssignment(progress) === "volunteer"
          ? "Волонтёр. Ты ищешь путь, даже когда его никто не назначал. Тебе выдадут театральную маску и доступ на следующий уровень."
          : "Аниматор. Ты принимаешь маршрут и оболочку. Костюм нельзя снимать до конца смены.",
      choices: [
        {
          label: "А ЧТО ОСТАНЕТСЯ ОТ ЗВОНКА?",
          next: "assignment-keepsake",
        },
      ],
    },
    "assignment-keepsake": {
      step: "КАНАЛ 0091-A // ЗАВЕРШЕНИЕ",
      media: "state-confidential",
      feedState: "СЕАНС ЗАВЕРШАЕТСЯ",
      signal: 63,
      speaker: "ИРИНА В.",
      text: (progress) => {
        if (progress.flags.acceptedPrivatePhoto) {
          return "Фотографию оставь у себя. Если канал велит удалить её, сначала запомни лицо. Так будет правильнее.";
        }

        if (progress.flags.deniesDrawing) {
          return "Рисунок я сохраню под твоим именем. Вдруг ты вспомнишь нажим. Так будет правильнее.";
        }

        return getCuratorAssignment(progress) === "volunteer"
          ? "Следующий уровень запомнит тебя первым. Так будет правильнее."
          : "В костюме никто не увидит, что тебе страшно. Так будет спокойнее.";
      },
      choices: [
        {
          label: "ПРОВЕРИТЬ ЛИЧНОЕ ВЛОЖЕНИЕ",
          next: "reward-offer",
        },
      ],
    },
    "reward-offer": {
      step: "ПЕРСОНАЛЬНЫЙ МАТЕРИАЛ",
      media: "state-confidential",
      feedState: "ОЖИДАЕТ ПОЛУЧЕНИЯ",
      signal: 58,
      speaker: "СИСТЕМА",
      text: (progress) =>
        getCuratorAssignment(progress) === "volunteer"
          ? "К назначению прикреплена листовка программы «Верни себе детство». Получение материала считается добровольным."
          : "К назначению прикреплена личная открытка от куратора 0091-A. Получение материала считается добровольным.",
      choices: (progress) => {
        const isVolunteer = getCuratorAssignment(progress) === "volunteer";
        const artifactId = isVolunteer
          ? "volunteer-leaflet"
          : "animator-postcard";
        return [
          {
            label: isVolunteer
              ? "ПРИНЯТЬ ЛИСТОВКУ"
              : "ПРИНЯТЬ ОТКРЫТКУ",
            effect: {
              flags: {
                acceptedRoleReward: true,
                declinedRoleReward: false,
              },
              artifacts: [artifactId],
            },
            downloadFile: artifactId,
            next: "reward-accepted",
          },
          {
            label: "НЕ ПРИНИМАТЬ",
            effect: {
              flags: {
                acceptedRoleReward: false,
                declinedRoleReward: true,
              },
              artifacts: [artifactId],
            },
            next: "reward-declined",
          },
        ];
      },
    },
    "reward-accepted": {
      step: "МАТЕРИАЛ ПОЛУЧЕН",
      media: "state-confidential",
      feedState: "КОПИЯ СОХРАНЕНА",
      signal: 63,
      speaker: "СИСТЕМА",
      text:
        "Материал сохранён. Открой STAFF → ТЕКУЩИЙ ОПЕРАТОР → МАТЕРИАЛЫ ЛИЧНОГО ДЕЛА.",
      choices: [
        {
          label: "ЗАВЕРШИТЬ ИНСТРУКТАЖ",
          complete: true,
        },
      ],
    },
    "reward-declined": {
      step: "ОТКАЗ ЗАРЕГИСТРИРОВАН",
      media: "state-confidential",
      feedState: "РЕЗЕРВНАЯ КОПИЯ СОХРАНЕНА",
      signal: 63,
      speaker: "СИСТЕМА",
      text:
        "Отказ зарегистрирован. Резервная копия оставлена в STAFF → ТЕКУЩИЙ ОПЕРАТОР → МАТЕРИАЛЫ ЛИЧНОГО ДЕЛА.",
      choices: [
        {
          label: "ЗАВЕРШИТЬ ИНСТРУКТАЖ",
          complete: true,
        },
      ],
    },
  };

  const applyCuratorEffect = (progress, effect = {}) => {
    Object.entries(effect.profiles || {}).forEach(([name, amount]) => {
      progress.profiles[name] = (progress.profiles[name] || 0) + amount;
    });
    Object.entries(effect.scores || {}).forEach(([name, amount]) => {
      progress.scores[name] = (progress.scores[name] || 0) + amount;
    });
    Object.assign(progress.flags, effect.flags || {});
    (effect.files || []).forEach((fileId) => {
      if (!progress.files.includes(fileId)) {
        progress.files.push(fileId);
      }
    });
    (effect.artifacts || []).forEach((artifactId) => {
      unlockCuratorArtifact(progress, artifactId);
    });
  };

  const normalizeCuratorId = (value) => {
    const normalized = value.trim().toUpperCase().replace(/\s+/g, "");
    if (/^\d{4}[A-Z]$/.test(normalized)) {
      return `${normalized.slice(0, 4)}-${normalized.slice(4)}`;
    }
    return normalized;
  };

  const initCuratorCall = () => {
    const incomingModal = document.querySelector(".site-wrapper [data-curator-call]");
    const detachedModals = [...document.querySelectorAll("body > [data-curator-call]")];

    if (!incomingModal) {
      detachedModals.forEach((modal) => modal.remove());
      body.classList.remove("curator-call-open");
      return;
    }

    detachedModals.forEach((modal) => modal.remove());

    const form = document.querySelector('[data-hiring-form="staff"]');
    const input = form?.querySelector("[data-curator-id]");
    const result = document.querySelector('[data-hiring-result="staff"]');
    const resumeButton = document.querySelector("[data-curator-resume]");
    if (!form || !input || !result || !resumeButton) return;

    const modal = incomingModal;
    body.append(modal);

    const video = modal.querySelector("[data-curator-video]");
    const room = modal.querySelector("[data-curator-room]");
    const still = modal.querySelector("[data-curator-still]");
    const flash = modal.querySelector("[data-curator-flash]");
    const feed = modal.querySelector("[data-curator-feed]");
    const connecting = modal.querySelector("[data-curator-connecting]");
    const feedState = modal.querySelector("[data-curator-feed-state]");
    const speaker = modal.querySelector("[data-curator-speaker]");
    const transcript = modal.querySelector("[data-curator-text]");
    const transcriptPanel = transcript.closest(".curator-call__transcript");
    const choices = modal.querySelector("[data-curator-choices]");
    const step = modal.querySelector("[data-curator-step]");
    const saveState = modal.querySelector("[data-curator-save]");
    const signal = modal.querySelector("[data-curator-signal]");
    const soundButton = modal.querySelector("[data-curator-sound]");
    const fileViewer = modal.querySelector("[data-curator-file-viewer]");
    const fileImage = modal.querySelector("[data-curator-file-image]");
    const fileCopy = modal.querySelector("[data-curator-file-copy]");
    const fileName = modal.querySelector("[data-curator-file-name]");
    const fileDownload = modal.querySelector("[data-curator-file-download]");
    const fileClose = modal.querySelector("[data-curator-file-close]");
    const endButton = modal.querySelector("[data-curator-end]");
    const exitConfirm = modal.querySelector("[data-curator-exit-confirm]");
    const exitCancel = modal.querySelector("[data-curator-exit-cancel]");
    const exitAccept = modal.querySelector("[data-curator-exit-accept]");
    const musicSlot = modal.querySelector("[data-curator-music-slot]");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let progress = getCuratorProgress();
    let soundEnabled = false;
    let previousFocus = null;
    let fileViewerPreviousFocus = null;
    let musicPlayerHome = null;
    let musicPlayerNextSibling = null;
    let pendingFileNext = null;
    let connectionTimer = 0;
    let ambientFadeFrame = 0;
    let textAnimationTimer = 0;
    let textAnimationRun = 0;
    let revealCurrentText = null;
    const ambientProbe = document.createElement("audio");
    const ambientExtension = ambientProbe.canPlayType('audio/ogg; codecs="vorbis"')
      ? "ogg"
      : "mp3";
    const ambient = new Audio(
      audioAsset(`assets/audio/curator/call-room-tone.${ambientExtension}`)
    );
    ambient.loop = true;
    ambient.preload = "auto";
    ambient.volume = 0;
    const curatorSoundLibrary = {
      "child-laugh-distant": {
        src: "assets/audio/curator/sfx/child-laugh-distant.mp3",
        volume: 1,
      },
      "child-laugh-archive": {
        src: "assets/audio/curator/sfx/child-laugh-archive.mp3",
        volume: 1,
      },
      "child-laugh-close": {
        src: "assets/audio/curator/sfx/child-laugh-close.mp3",
        volume: 0.72,
      },
      "aroma-airflow": {
        src: "assets/audio/curator/sfx/aroma-airflow.mp3",
        volume: 0.52,
      },
      "plague-doctor-string-sting": {
        src: "assets/audio/curator/sfx/plague-doctor-string-sting.mp3",
        volume: 0.92,
      },
      "unknown-female-voice": {
        src: "assets/audio/curator/sfx/unknown-female-voice.mp3",
        volume: 0.92,
      },
    };
    Object.values(curatorSoundLibrary).forEach((sound) => {
      sound.audio = new Audio(audioAsset(sound.src));
      sound.audio.preload = "auto";
      sound.audio.volume = sound.volume;
    });
    let sceneSound = null;
    const typingSound = new Audio(
      audioAsset("assets/audio/curator/sfx/irina-keyboard.mp3")
    );
    typingSound.loop = true;
    typingSound.preload = "auto";
    typingSound.volume = 0.48;
    const playedNodeSounds = new Set();
    let activeNodeId = progress?.node || "intro";
    let activeNode = curatorNodes[activeNodeId] || curatorNodes.intro;

    const stopSceneSound = () => {
      if (!sceneSound) return;
      sceneSound.pause();
      sceneSound.currentTime = 0;
      sceneSound = null;
    };

    const stopTypingSound = () => {
      typingSound.pause();
    };

    const playNodeSound = (nodeId, node) => {
      const sound = curatorSoundLibrary[node?.sound];
      if (!soundEnabled || !sound || playedNodeSounds.has(nodeId)) return;

      playedNodeSounds.add(nodeId);
      stopSceneSound();
      sceneSound = sound.audio;
      sceneSound.currentTime = 0;
      sceneSound.play().catch(() => {
        playedNodeSounds.delete(nodeId);
      });
    };

    const startTypingSound = (node) => {
      if (!soundEnabled || reducedMotion || node?.speaker !== "ИРИНА В.") return;

      if (Number.isFinite(typingSound.duration) && typingSound.duration > 4) {
        typingSound.currentTime = Math.random() * (typingSound.duration - 4);
      } else {
        typingSound.currentTime = 0;
      }
      typingSound.play().catch(() => {});
    };

    const saveProgress = () => {
      progress.updatedAt = Date.now();
      localStorage.setItem(CURATOR_CALL_KEY, JSON.stringify(progress));
      syncStaffProfileFromProgress(progress);
      saveState.textContent = "СОХРАНЕНО";
    };

    const playCallTone = (frequency = 520, duration = 0.055) => {
      if (!soundEnabled) return;

      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return;

      curatorAudioContext ||= new AudioContextClass();
      curatorAudioContext.resume().catch(() => {});

      const oscillator = curatorAudioContext.createOscillator();
      const gain = curatorAudioContext.createGain();
      const now = curatorAudioContext.currentTime;
      oscillator.type = "square";
      oscillator.frequency.setValueAtTime(frequency, now);
      gain.gain.setValueAtTime(0.025, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
      oscillator.connect(gain);
      gain.connect(curatorAudioContext.destination);
      oscillator.start(now);
      oscillator.stop(now + duration);
    };

    const cancelTextAnimation = () => {
      textAnimationRun += 1;
      window.clearTimeout(textAnimationTimer);
      stopTypingSound();
      revealCurrentText = null;
      transcriptPanel.classList.remove("is-typing", "is-overwriting");
      transcriptPanel.removeAttribute("aria-busy");
      transcriptPanel.removeAttribute("role");
      transcriptPanel.removeAttribute("tabindex");
      transcriptPanel.removeAttribute("title");
    };

    const animateText = (node, onComplete) => {
      cancelTextAnimation();
      const run = textAnimationRun;
      const finalText =
        typeof node.text === "function" ? node.text(progress) : node.text;
      const interruptedText =
        typeof node.interruptedText === "function"
          ? node.interruptedText(progress)
          : node.interruptedText;
      let finished = false;

      const finish = () => {
        if (finished || run !== textAnimationRun) return;
        finished = true;
        textAnimationRun += 1;
        window.clearTimeout(textAnimationTimer);
        stopTypingSound();
        transcript.textContent = finalText;
        revealCurrentText = null;
        transcriptPanel.classList.remove("is-typing", "is-overwriting");
        transcriptPanel.removeAttribute("aria-busy");
        transcriptPanel.removeAttribute("role");
        transcriptPanel.removeAttribute("tabindex");
        transcriptPanel.removeAttribute("title");
        onComplete();
      };

      revealCurrentText = finish;

      if (reducedMotion) {
        finish();
        return;
      }

      transcript.textContent = "";
      transcriptPanel.classList.add("is-typing");
      transcriptPanel.setAttribute("aria-busy", "true");
      transcriptPanel.setAttribute("role", "button");
      transcriptPanel.tabIndex = 0;
      transcriptPanel.title = "Нажмите, чтобы показать реплику полностью";
      startTypingSound(node);

      const type = (value, index, onTyped) => {
        if (run !== textAnimationRun) return;
        if (index >= value.length) {
          onTyped();
          return;
        }

        const character = value[index];
        transcript.textContent += character;
        const punctuationDelay = /[.!?]/.test(character)
          ? 145
          : /[,;:—]/.test(character)
            ? 65
            : 0;
        textAnimationTimer = window.setTimeout(
          () => type(value, index + 1, onTyped),
          22 + punctuationDelay
        );
      };

      const typeFinalText = () => {
        transcriptPanel.classList.remove("is-overwriting");
        type(finalText, 0, finish);
      };

      if (!interruptedText) {
        typeFinalText();
        return;
      }

      type(interruptedText, 0, () => {
        textAnimationTimer = window.setTimeout(() => {
          transcriptPanel.classList.add("is-overwriting");

          const erase = () => {
            if (run !== textAnimationRun) return;
            if (!transcript.textContent) {
              textAnimationTimer = window.setTimeout(typeFinalText, 260);
              return;
            }

            transcript.textContent = transcript.textContent.slice(0, -1);
            textAnimationTimer = window.setTimeout(erase, 7);
          };

          erase();
        }, 720);
      });
    };

    const getAmbientVolume = (node) => {
      if (node?.media === "room-empty") return 0.03;
      if (node?.media === "action-aroma-cycle") return 0.24;
      if (node?.media === "intrusion-plague-doctor-camera") return 0.22;
      if (node?.feedMode === "archive") return 0.42;
      return 0.58;
    };

    const fadeAmbientTo = (targetVolume, duration = 650, onComplete) => {
      window.cancelAnimationFrame(ambientFadeFrame);
      const startVolume = ambient.volume;
      const startedAt = performance.now();

      const updateVolume = (now) => {
        const elapsed = Math.min((now - startedAt) / duration, 1);
        const eased = elapsed * (2 - elapsed);
        ambient.volume = startVolume + (targetVolume - startVolume) * eased;

        if (elapsed < 1) {
          ambientFadeFrame = window.requestAnimationFrame(updateVolume);
          return;
        }

        ambientFadeFrame = 0;
        onComplete?.();
      };

      ambientFadeFrame = window.requestAnimationFrame(updateVolume);
    };

    const startAmbient = (node) => {
      if (!soundEnabled) return;
      ambient.play()
        .then(() => {
          if (!soundEnabled || modal.hidden) {
            ambient.pause();
            return;
          }
          fadeAmbientTo(getAmbientVolume(node));
        })
        .catch(() => {});
    };

    const stopAmbient = () => {
      fadeAmbientTo(0, 480, () => ambient.pause());
    };

    const closeFileViewer = () => {
      fileViewer.hidden = true;
      const nextNode = pendingFileNext;
      pendingFileNext = null;

      if (nextNode) {
        renderNode(nextNode);
        return;
      }

      fileViewerPreviousFocus?.focus?.();
    };

    const openFileViewer = (fileId, nextNode = null) => {
      const file = curatorFiles[fileId];
      if (!file) return;

      fileViewerPreviousFocus = document.activeElement;
      pendingFileNext = nextNode;
      fileImage.src = file.src;
      fileImage.alt = file.alt || "";
      renderArtifactCopy(fileCopy, file.copy);
      fileName.textContent = file.downloadName;
      fileDownload.href = file.src;
      fileDownload.download = file.downloadName;
      fileViewer.hidden = false;
      fileClose.focus();
    };

    const triggerCameraFlash = () => {
      flash.classList.remove("is-active");
      void flash.offsetWidth;
      flash.classList.add("is-active");
      playCallTone(1180, 0.12);
      window.setTimeout(() => flash.classList.remove("is-active"), 760);
    };

    const updateResumeControl = () => {
      const saved = getCuratorProgress();
      if (!saved) {
        resumeButton.hidden = true;
        return;
      }

      resumeButton.hidden = false;
      if (saved.status === "completed") {
        const roleLabel = saved.role === "volunteer" ? "ВОЛОНТЁР" : "АНИМАТОР";
        resumeButton.hidden = true;
        result.textContent = `СЕАНС 01 ЗАВЕРШЁН // НАЗНАЧЕНИЕ: ${roleLabel}`;
        return;
      }

      resumeButton.textContent = "ВОЗОБНОВИТЬ СЕАНС 0091-A";
    };

    const dockMusicPlayer = () => {
      if (!player || !musicSlot || player.parentNode === musicSlot) return;

      musicPlayerHome = player.parentNode;
      musicPlayerNextSibling = player.nextSibling;
      musicSlot.append(player);
    };

    const restoreMusicPlayer = () => {
      if (!player || !musicPlayerHome) return;

      if (musicPlayerNextSibling?.parentNode === musicPlayerHome) {
        musicPlayerHome.insertBefore(player, musicPlayerNextSibling);
      } else {
        musicPlayerHome.append(player);
      }

      musicPlayerHome = null;
      musicPlayerNextSibling = null;
    };

    const closeCall = () => {
      window.clearTimeout(connectionTimer);
      cancelTextAnimation();
      video.pause();
      stopAmbient();
      stopSceneSound();
      stopTypingSound();
      modal.hidden = true;
      fileViewer.hidden = true;
      pendingFileNext = null;
      exitConfirm.hidden = true;
      body.classList.remove("curator-call-open");
      const wrapper = document.querySelector(".site-wrapper");
      if (wrapper) wrapper.inert = false;
      restoreMusicPlayer();
      updateResumeControl();
      previousFocus?.focus?.();
    };

    const getGuestHomeUrl = () =>
      window.location.protocol === "file:"
        ? new URL("../index.html", scriptUrl).href
        : new URL("/", window.location.href).href;

    const rejectCall = (reason) => {
      window.clearTimeout(connectionTimer);
      cancelTextAnimation();
      localStorage.removeItem(CURATOR_CALL_KEY);
      removeTemporaryStaffProfile();
      video.pause();
      video.hidden = true;
      room.hidden = true;
      still.hidden = true;
      choices.innerHTML = "";
      endButton.disabled = true;
      step.textContent = "КУРАТОРСКИЙ ДОСТУП ОТМЕНЁН";
      signal.textContent = "СИГНАЛ 0%";
      feedState.textContent = "ПЕРЕДАЧА СТАРШЕМУ ПРОВОДНИКУ";
      speaker.textContent = "ИРИНА В.";
      const rejectionMessages = {
        "minor-inspected":
          "Тогда ты уже учтён как сырьё. Твой маршрут начинается не в кадровом канале. За тобой придёт Старший Проводник.",
        "minor-unregistered":
          "Тогда приходи, когда вырастешь. Я курирую детские маршруты, но служебные звонки веду только с бывшими детьми.",
        "self-unverified":
          "Если ты не уверен, я не могу открыть служебный маршрут. Возвращайся, когда сможешь ответить как бывший ребёнок.",
        unverified:
          "Возраст не подтверждён. Значит, для этого канала ты считаешься сырьём. Я не могу оставить тебя на служебной линии.",
      };
      transcript.textContent =
        rejectionMessages[reason] || rejectionMessages.unverified;
      saveState.textContent = "НЕ СОХРАНЕНО";
      feed.classList.add("is-glitching");
      result.textContent =
        "КАТЕГОРИЯ: СЫРЬЁ // КУРАТОРСКИЙ ДОСТУП ОТМЕНЁН";

      const returnButton = document.createElement("button");
      returnButton.type = "button";
      returnButton.textContent = "ВЕРНУТЬСЯ В ГОСТЕВУЮ ВЕРСИЮ";
      returnButton.addEventListener("click", () => {
        feed.classList.remove("is-glitching");
        closeCall();
        endButton.disabled = false;
        applyMode(false);
        window.location.assign(getGuestHomeUrl());
      });
      choices.classList.remove("has-images");
      choices.append(returnButton);
      returnButton.focus();
    };

    const completeCall = () => {
      progress.role = getCuratorAssignment(progress);
      progress.status = "completed";
      progress.node = "assignment";
      progress.completedAt = Date.now();
      unlockCuratorArtifact(progress, "assignment");
      saveProgress();
      playCallTone(760, 0.09);
      closeCall();
    };

    const applyMedia = (node, onEnd) => {
      video.pause();
      video.onended = null;
      room.hidden = true;
      still.hidden = true;
      video.hidden = false;
      feed.classList.remove("is-document", "is-archive", "is-cctv");
      if (node.feedMode) {
        feed.classList.add(`is-${node.feedMode}`);
      }
      feed.classList.toggle("is-glitching", Boolean(node.glitchIn));

      window.setTimeout(() => {
        feed.classList.remove("is-glitching");
      }, 520);

      if (node.media === "room-empty") {
        video.hidden = true;
        room.hidden = false;
        room.src = curatorMediaAsset("room-empty.webp");
        onEnd?.();
        return;
      }

      if (node.still) {
        video.hidden = true;
        still.hidden = false;
        still.src = audioAsset(node.still);
        still.alt = node.stillAlt || "";
        onEnd?.();
        return;
      }

      const videoSrc = curatorMediaAsset(`${node.media}.mp4`);
      const posterSrc = curatorMediaAsset(`${node.media}-poster.webp`);
      video.poster = posterSrc;
      video.src = videoSrc;
      video.load();

      if (reducedMotion) {
        if (onEnd) {
          window.setTimeout(onEnd, 450);
        }
        return;
      }

      video.onended = () => onEnd?.();
      video.play().catch(() => onEnd?.());
    };

    const showChoices = (node) => {
      choices.innerHTML = "";
      const nodeChoices =
        typeof node.choices === "function" ? node.choices(progress) : node.choices || [];
      choices.classList.toggle("has-images", nodeChoices.some((choice) => choice.image));

      nodeChoices.forEach(
        (choice) => {
          const button = document.createElement("button");
          button.type = "button";
          if (choice.image) {
            button.classList.add("curator-call__image-choice");
            const image = document.createElement("img");
            const label = document.createElement("span");
            image.src = audioAsset(choice.image);
            image.alt = choice.imageAlt || "";
            image.loading = "eager";
            label.textContent = choice.label;
            button.append(image, label);
          } else {
            button.textContent = choice.label;
          }
          button.addEventListener("click", () => {
            choices.querySelectorAll("button").forEach((control) => {
              control.disabled = true;
            });
            playCallTone();

            if (choice.reject) {
              rejectCall(choice.reject);
              return;
            }

            applyCuratorEffect(progress, choice.effect);
            if (choice.downloadFile) {
              saveProgress();
              openFileViewer(choice.downloadFile, choice.next);
              return;
            }

            if (choice.complete) {
              completeCall();
              return;
            }

            window.setTimeout(() => renderNode(choice.next), 140);
          });
          choices.append(button);
        }
      );

      choices.querySelector("button")?.focus();
    };

    const renderNode = (nodeId) => {
      const node = curatorNodes[nodeId] || curatorNodes.intro;
      activeNodeId = nodeId;
      activeNode = node;
      stopSceneSound();
      progress.node = nodeId;
      if (curatorNodeArtifacts[nodeId]) {
        unlockCuratorArtifact(progress, curatorNodeArtifacts[nodeId]);
      }
      if (nodeId === "assignment") {
        progress.role = getCuratorAssignment(progress);
      }
      saveProgress();

      connecting.hidden = true;
      step.textContent = node.step;
      signal.textContent = `СИГНАЛ ${node.signal ?? 63}%`;
      feedState.textContent = node.feedState || "ПРЯМОЙ КАНАЛ";
      speaker.textContent = node.speaker;
      choices.innerHTML = "";
      transcript.scrollTop = 0;
      startAmbient(node);
      if (!node.soundAfterText) {
        playNodeSound(nodeId, node);
      }
      let textFinished = false;
      let mediaFinished = false;
      let nodeAdvanced = false;

      const continueNode = () => {
        if (nodeAdvanced || !textFinished) return;
        if ((node.autoNext || node.delayChoicesUntilEnd) && !mediaFinished) return;
        nodeAdvanced = true;

        if (node.autoNext) {
          window.setTimeout(
            () => renderNode(node.autoNext),
            node.flashOnEnd ? 820 : 220
          );
          return;
        }

        showChoices(node);
      };

      const handleMediaEnd = () => {
        mediaFinished = true;
        if (node.flashOnEnd) {
          triggerCameraFlash();
        }
        continueNode();
      };

      applyMedia(node, handleMediaEnd);
      animateText(node, () => {
        textFinished = true;
        if (node.soundAfterText) {
          playNodeSound(nodeId, node);
        }
        continueNode();
      });
    };

    const openCall = ({ restart = false } = {}) => {
      previousFocus = document.activeElement;
      playedNodeSounds.clear();
      stopSceneSound();
      stopTypingSound();
      progress = restart || !getCuratorProgress()
        ? createCuratorProgress()
        : getCuratorProgress();

      if (progress.status === "completed") {
        progress = createCuratorProgress();
      }

      saveProgress();
      modal.hidden = false;
      modal.tabIndex = -1;
      body.classList.add("curator-call-open");
      dockMusicPlayer();
      const wrapper = document.querySelector(".site-wrapper");
      if (wrapper) wrapper.inert = true;
      connecting.hidden = false;
      room.hidden = true;
      still.hidden = true;
      video.hidden = true;
      flash.classList.remove("is-active");
      fileViewer.hidden = true;
      pendingFileNext = null;
      choices.innerHTML = "";
      speaker.textContent = "СИСТЕМА";
      transcript.textContent = progress.node === "intro"
        ? "Выполняется подключение к назначенному куратору."
        : "Восстановление незавершённой расшифровки.";
      step.textContent = "ПРОВЕРКА КАНАЛА";
      signal.textContent = "СИГНАЛ 18%";
      modal.focus();
      playModeSwitchSound();

      connectionTimer = window.setTimeout(() => {
        renderNode(progress.node || "intro");
      }, reducedMotion ? 250 : 850);
    };

    const showExitConfirm = () => {
      exitConfirm.hidden = false;
      exitCancel.focus();
    };

    const recordConfirmedExit = () => {
      if (!progress.flags.attemptedEnd) {
        progress.flags.attemptedEnd = true;
        progress.scores.fear += 1;
        saveProgress();
      }
    };

    form.dataset.curatorCallReady = "true";
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const curatorId = normalizeCuratorId(input.value);
      input.value = curatorId;

      if (curatorId === "0091-A") {
        result.textContent = "КУРАТОР НАЙДЕН // ИРИНА В. // УСТАНОВКА СВЯЗИ";
        openCall({ restart: getCuratorProgress()?.status === "completed" });
        return;
      }

      const knownResponses = {
        "0144-C": "КАНАЛ 0144-C ПЕРЕМЕЩЁН // АДРЕС НЕ РАЗГЛАШАЕТСЯ",
        "0192-D": "КАНАЛ 0192-D НЕ НАЙДЕН // ПОИСК СОТРУДНИКА ПРОДОЛЖАЕТСЯ",
        "0208-E": "КАНАЛ 0208-E ЗАНЯТ // ИДЁТ НЕЗАРЕГИСТРИРОВАННЫЙ СЕАНС",
        "0422-X": "КАНАЛ 0422-X // НЕДОСТАТОЧНЫЙ КЛАСС ДОПУСКА",
      };

      result.textContent =
        knownResponses[curatorId] ||
        "ID КУРАТОРА НЕ РАСПОЗНАН // СВЕРЬТЕСЬ С КАДРОВОЙ БАЗОЙ";
      input.focus();
    });

    resumeButton.addEventListener("click", () => {
      openCall({ restart: getCuratorProgress()?.status === "completed" });
    });

    soundButton.addEventListener("click", () => {
      soundEnabled = !soundEnabled;
      soundButton.setAttribute("aria-pressed", String(soundEnabled));
      soundButton.textContent = soundEnabled ? "ЗВУК: ВКЛ" : "ЗВУК: ВЫКЛ";
      soundButton.title = soundEnabled
        ? "Отключить сигналы и фон канала"
        : "Включить сигналы и фон канала";
      if (soundEnabled) {
        startAmbient(curatorNodes[progress.node] || curatorNodes.intro);
        if (connecting.hidden && (!activeNode.soundAfterText || !revealCurrentText)) {
          playNodeSound(activeNodeId, activeNode);
        }
        if (revealCurrentText) {
          startTypingSound(activeNode);
        }
      } else {
        stopAmbient();
        stopSceneSound();
        stopTypingSound();
      }
      playCallTone(620, 0.08);
    });

    fileClose.addEventListener("click", closeFileViewer);

    transcriptPanel.addEventListener("click", () => {
      revealCurrentText?.();
    });
    transcriptPanel.addEventListener("keydown", (event) => {
      if (!revealCurrentText || !["Enter", " "].includes(event.key)) return;
      event.preventDefault();
      revealCurrentText();
    });

    endButton.addEventListener("click", showExitConfirm);
    exitCancel.addEventListener("click", () => {
      exitConfirm.hidden = true;
      endButton.focus();
    });
    exitAccept.addEventListener("click", () => {
      recordConfirmedExit();
      closeCall();
    });
    modal.addEventListener("keydown", (event) => {
      if (event.key !== "Escape") return;
      if (!fileViewer.hidden) {
        closeFileViewer();
        return;
      }
      if (!exitConfirm.hidden) {
        exitConfirm.hidden = true;
        endButton.focus();
        return;
      }
      showExitConfirm();
    });

    updateResumeControl();
    soundButton.title = "Включить сигналы и фон канала";

    const resumeRequest = new URLSearchParams(window.location.search).get("resume");
    if (resumeRequest === "0091-A" && getCuratorProgress()?.status === "in_progress") {
      const cleanUrl = new URL(window.location.href);
      cleanUrl.searchParams.delete("resume");
      window.history.replaceState({}, "", cleanUrl);
      window.setTimeout(() => openCall(), 0);
    }
  };

  const initStaffRegistry = () => {
    const grid = document.querySelector("[data-personnel-grid]");
    const dossier = document.querySelector("[data-personnel-dossier]");
    const artifactDialog = document.querySelector("[data-personnel-artifact]");
    if (!grid || !dossier || !artifactDialog || grid.dataset.personnelReady === "true") {
      return;
    }

    grid.dataset.personnelReady = "true";
    const playerCard = grid.querySelector("[data-player-card]");
    const playerCardStatus = grid.querySelector("[data-player-card-status]");
    const playerCardAvatar = grid.querySelector("[data-player-card-avatar]");
    const dossierName = dossier.querySelector("[data-personnel-name]");
    const dossierRole = dossier.querySelector("[data-personnel-role]");
    const dossierStatus = dossier.querySelector("[data-personnel-status]");
    const dossierNote = dossier.querySelector("[data-personnel-note]");
    const dossierHeaderImage = dossier.querySelector("[data-personnel-header-image]");
    const employeeActions = dossier.querySelector("[data-personnel-employee-actions]");
    const profilePanel = dossier.querySelector("[data-personnel-profile]");
    const documentLink = dossier.querySelector("[data-personnel-document]");
    const documentUnavailable = dossier.querySelector("[data-personnel-document-unavailable]");
    const requestIdButton = dossier.querySelector("[data-personnel-request-id]");
    const idResponse = dossier.querySelector("[data-personnel-id-response]");
    const useIdLink = dossier.querySelector("[data-personnel-use-id]");
    const resumeLink = dossier.querySelector("[data-player-resume]");
    const materials = dossier.querySelector("[data-player-materials]");
    const materialsEmpty = dossier.querySelector("[data-player-materials-empty]");
    const identification = dossier.querySelector("[data-player-identification]");
    const identificationCopy = dossier.querySelector("[data-player-identification-copy]");
    const avatarResponse = dossier.querySelector("[data-player-avatar-response]");
    const intrusion = dossier.querySelector("[data-personnel-intrusion]");
    const closeButton = dossier.querySelector("[data-personnel-close]");
    const intrusionClose = dossier.querySelector("[data-personnel-intrusion-close]");
    const artifactClose = artifactDialog.querySelector("[data-artifact-close]");
    const artifactCopy = artifactDialog.querySelector("[data-artifact-copy]");
    const artifactDownload = artifactDialog.querySelector("[data-artifact-download]");
    const avatarClasses = [
      "personnel-avatar--pending",
      "personnel-avatar--overexposed",
      "personnel-avatar--drawing",
      "personnel-avatar--mask",
      "personnel-avatar--empty-chair",
    ];
    let activePersonnelKey = null;
    let activeTrigger = null;

    const setAvatarAppearance = (element, avatarId) => {
      if (!element) return;
      element.classList.remove(...avatarClasses);
      element.classList.add(`personnel-avatar--${avatarId || "pending"}`);
    };

    const getProfileStatus = (profile) => {
      if (profile.status === "completed") {
        return profile.reclassificationActive
          ? "ДОПУЩЕН // ПОВТОРНАЯ ПРОВЕРКА"
          : "ДОПУЩЕН";
      }
      return profile.status === "in_progress"
        ? "КУРАТОРСКАЯ ПРОВЕРКА"
        : "ПРОВЕРКА ДОПУСКА";
    };

    const getProfileRole = (profile) => {
      if (profile.role === "volunteer") return "ВОЛОНТЁР";
      if (profile.role === "animator") return "АНИМАТОР";
      return "НЕ НАЗНАЧЕНА";
    };

    const renderPlayerCard = () => {
      const profile = getStaffProfile();
      if (!profile) {
        playerCard.hidden = true;
        return null;
      }

      playerCard.hidden = false;
      playerCardStatus.textContent =
        profile.status === "completed"
          ? `${getProfileRole(profile)} // ${getProfileStatus(profile)}`
          : getProfileStatus(profile);
      setAvatarAppearance(playerCardAvatar, profile.avatarId);
      return profile;
    };

    const renderMaterials = (profile) => {
      materials.innerHTML = "";
      const registered = profile.artifacts
        .map((storedArtifact) => ({
          stored: storedArtifact,
          definition: staffArtifacts[storedArtifact.id],
        }))
        .filter(({ definition }) => definition);

      materialsEmpty.hidden = registered.length > 0;
      registered.forEach(({ stored, definition }) => {
        const button = document.createElement("button");
        const code = document.createElement("span");
        const title = document.createElement("strong");
        const type = document.createElement("small");
        button.type = "button";
        button.className = "personnel-material";
        button.dataset.artifactOpen = stored.id;
        code.textContent = `ФАЙЛ: ${definition.code}`;
        title.textContent = definition.title;
        type.textContent = definition.type;
        button.append(code, title, type);
        materials.append(button);
      });
    };

    const renderPlayerDossier = (profile) => {
      dossierName.textContent = "ТЕКУЩИЙ ОПЕРАТОР";
      dossierRole.textContent = getProfileRole(profile);
      dossierStatus.textContent = getProfileStatus(profile);
      dossierNote.textContent =
        profile.status === "completed"
          ? "Личное дело сформировано. Назначение и полученные материалы сохранены кадровой системой."
          : profile.status === "in_progress"
            ? "Собеседование не завершено. Последний подтверждённый этап доступен для возобновления."
            : "Личное дело создано автоматически при установке связи с назначенным куратором.";
      dossierHeaderImage.hidden = true;
      dossierHeaderImage.removeAttribute("src");
      dossierHeaderImage.alt = "";
      employeeActions.hidden = true;
      profilePanel.hidden = false;
      const progress = getCuratorProgress();
      resumeLink.hidden = progress?.status !== "in_progress";
      renderMaterials(profile);

      identification.hidden = profile.status !== "completed";
      identificationCopy.textContent = profile.avatarId
        ? "ЛИЦО ЗАРЕГИСТРИРОВАНО. ПОВТОРНАЯ ИДЕНТИФИКАЦИЯ ЗАМЕНИТ ТЕКУЩУЮ ЗАПИСЬ."
        : "ФОТОГРАФИЯ СОТРУДНИКА ПОВРЕЖДЕНА. ВЫБЕРИТЕ ДОПУСТИМУЮ РЕКОНСТРУКЦИЮ.";
      avatarResponse.textContent = "";
      dossier.querySelectorAll("[data-avatar-choice]").forEach((button) => {
        button.setAttribute(
          "aria-pressed",
          String(button.dataset.avatarChoice === profile.avatarId)
        );
      });
    };

    const readIntrusionState = () => {
      try {
        return JSON.parse(sessionStorage.getItem(STAFF_INTRUSION_KEY)) || {
          key: null,
          count: 0,
          alertShown: false,
        };
      } catch {
        return { key: null, count: 0, alertShown: false };
      }
    };

    const saveIntrusionState = (state) => {
      sessionStorage.setItem(STAFF_INTRUSION_KEY, JSON.stringify(state));
    };

    const prepareIdRequest = (personnelKey) => {
      const record = staffDirectory[personnelKey];
      const state = readIntrusionState();
      if (state.key !== personnelKey) {
        state.key = personnelKey;
        state.count = 0;
        saveIntrusionState(state);
      }

      requestIdButton.disabled = Boolean(!record.curatorId && state.alertShown);
      requestIdButton.textContent = requestIdButton.disabled
        ? "ЗАПРОС ВРЕМЕННО ЗАБЛОКИРОВАН"
        : "ЗАПРОСИТЬ СЛУЖЕБНЫЙ ID";
      idResponse.textContent = requestIdButton.disabled
        ? "ПОВТОРНЫЕ ЗАПРОСЫ ОТКЛОНЕНЫ СИСТЕМОЙ"
        : "";
    };

    const openPersonnelDossier = (personnelKey, trigger) => {
      const profile = personnelKey === "player" ? renderPlayerCard() : null;
      const record = staffDirectory[personnelKey];
      if (!profile && !record) return;

      activePersonnelKey = personnelKey;
      activeTrigger = trigger;
      intrusion.hidden = true;
      useIdLink.hidden = true;
      idResponse.textContent = "";

      if (profile) {
        renderPlayerDossier(profile);
      } else {
        dossierName.textContent = record.name;
        dossierRole.textContent = record.role;
        dossierStatus.textContent = record.status;
        dossierNote.textContent = record.note;
        dossierHeaderImage.src = record.headerImage;
        dossierHeaderImage.alt = `Регистрационная фотополоса сотрудника ${record.name}: анфас и профиль`;
        dossierHeaderImage.hidden = false;
        employeeActions.hidden = false;
        profilePanel.hidden = true;
        documentLink.hidden = !record.dossier;
        documentUnavailable.hidden = Boolean(record.dossier);
        if (record.dossier) {
          documentLink.setAttribute("href", record.dossier);
        } else {
          documentLink.removeAttribute("href");
        }
        prepareIdRequest(personnelKey);
      }

      if (!dossier.open) {
        dossier.showModal();
      }
      closeButton.focus();
    };

    const openArtifact = (artifactId) => {
      const definition = staffArtifacts[artifactId];
      if (!definition) return;

      artifactDialog.querySelector("[data-artifact-code]").textContent =
        `ФАЙЛ: ${definition.code}`;
      artifactDialog.querySelector("[data-artifact-title]").textContent =
        definition.title;
      artifactDialog.querySelector("[data-artifact-type]").textContent =
        definition.type;
      artifactDialog.querySelector("[data-artifact-source]").textContent =
        definition.source;
      artifactDialog.querySelector("[data-artifact-description]").textContent =
        artifactId === "assignment"
          ? `${definition.description} Текущая должность: ${getProfileRole(readStaffProfile() || {})}.`
          : definition.description;

      const image = artifactDialog.querySelector("[data-artifact-image]");
      image.hidden = !definition.src;
      if (definition.src) {
        image.src = definition.src;
        image.alt = definition.alt || "";
      } else {
        image.removeAttribute("src");
        image.alt = "";
      }

      renderArtifactCopy(artifactCopy, definition.copy);
      artifactDownload.hidden = !definition.downloadName || !definition.src;
      if (definition.downloadName && definition.src) {
        artifactDownload.href = definition.src;
        artifactDownload.download = definition.downloadName;
      } else {
        artifactDownload.removeAttribute("href");
        artifactDownload.removeAttribute("download");
      }

      artifactDialog.showModal();
      artifactClose.focus();
    };

    grid.querySelectorAll("[data-personnel-open]").forEach((button) => {
      button.addEventListener("click", () => {
        openPersonnelDossier(button.dataset.personnelOpen, button);
      });
    });

    closeButton.addEventListener("click", () => dossier.close());
    dossier.addEventListener("close", () => {
      intrusion.hidden = true;
      activeTrigger?.focus?.();
    });

    requestIdButton.addEventListener("click", () => {
      const record = staffDirectory[activePersonnelKey];
      if (!record || requestIdButton.disabled) return;

      if (record.curatorId) {
        idResponse.textContent =
          `СЛУЖЕБНЫЙ ID: ${record.curatorId} // КАНАЛ ДОСТУПЕН`;
        useIdLink.hidden = false;
        return;
      }

      const state = readIntrusionState();
      if (state.key !== activePersonnelKey) {
        state.key = activePersonnelKey;
        state.count = 0;
      }
      state.count += 1;

      if (state.count === 1) {
        idResponse.textContent = "ИДЕНТИФИКАТОР СКРЫТ АДМИНИСТРАЦИЕЙ";
      } else if (state.count === 2) {
        idResponse.textContent = "ПОВТОРНЫЙ ЗАПРОС ЗАРЕГИСТРИРОВАН";
      } else {
        state.alertShown = true;
        intrusion.hidden = false;
        requestIdButton.disabled = true;
        requestIdButton.textContent = "ЗАПРОС ВРЕМЕННО ЗАБЛОКИРОВАН";
        playModeSwitchSound();
        intrusionClose.focus();
      }
      saveIntrusionState(state);
    });

    intrusionClose.addEventListener("click", () => {
      intrusion.hidden = true;
      idResponse.textContent = "ЗАПРОС ВРЕМЕННО ЗАБЛОКИРОВАН";
      requestIdButton.focus();
    });

    materials.addEventListener("click", (event) => {
      const button = event.target.closest("[data-artifact-open]");
      if (button) openArtifact(button.dataset.artifactOpen);
    });

    artifactClose.addEventListener("click", () => artifactDialog.close());

    dossier.querySelectorAll("[data-avatar-choice]").forEach((button) => {
      button.addEventListener("click", () => {
        const profile = readStaffProfile();
        if (!profile || profile.status !== "completed") return;
        profile.avatarId = button.dataset.avatarChoice;
        saveStaffProfile(profile);
        renderPlayerCard();
        renderPlayerDossier(profile);
        avatarResponse.textContent =
          "ЛИЦО ЗАРЕГИСТРИРОВАНО. ПРЕДЫДУЩЕЕ ИЗОБРАЖЕНИЕ БОЛЬШЕ НЕ СЧИТАЕТСЯ ВАШИМ.";
      });
    });

    renderPlayerCard();
  };

  const initDOMListeners = () => {
    const logo = document.querySelector(".logo");
    const hiddenTrigger = document.querySelector(".footer-trigger");
    const hiringForms = document.querySelectorAll("[data-hiring-form]");
    const homeHeroes = [...document.querySelectorAll("[data-home-hero]")];
    const statusLabel = document.querySelector("[data-mode-label]");

    initImageFallbacks();
    initCopyButtons();
    initCinemaTicket();
    initCuratorCall();
    initStaffRegistry();

    const savedMode = localStorage.getItem(MODE_KEY);
    
    if (statusLabel) {
      statusLabel.textContent = (savedMode === "staff") ? "Режим: Терминал персонала" : "Режим: Гостевая версия";
    }

    if (homeHeroes.length > 1) {
      const requestedHero = new URLSearchParams(window.location.search).get("hero");
      const rotatingHeroes = homeHeroes.filter((hero) =>
        ["wonder", "video-archives", "losiny", "aquapark", "solnyshko-park"].includes(hero.dataset.homeHero)
      );
      const randomHero = rotatingHeroes[Math.floor(Math.random() * rotatingHeroes.length)] || homeHeroes[0];
      const selectedHero =
        homeHeroes.find((hero) => hero.dataset.homeHero === requestedHero) ||
        randomHero;

      homeHeroes.forEach((hero) => {
        hero.hidden = hero !== selectedHero;
      });
    }

    if (logo) {
      logo.addEventListener("touchend", tripleTapHandler, { passive: false });
      logo.addEventListener("click", logoClickHandler);
    }

    if (hiddenTrigger) {
      hiddenTrigger.addEventListener("click", runGlitchAndToggle);
    }

    document.querySelectorAll("[data-denied-cta]").forEach((button) => {
      if (button.dataset.deniedReady === "true") return;

      button.dataset.deniedReady = "true";
      button.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();

        button.classList.add("is-denied");
        button.textContent = button.dataset.deniedText || "ОТКАЗАНО";
        button.setAttribute("aria-label", "Доступ отказан");

        window.setTimeout(() => {
          button.classList.remove("is-denied");
          if (button.dataset.originalText) {
            button.textContent = button.dataset.originalText;
            button.removeAttribute("aria-label");
          }
        }, 1800);
      });
    });

    document.querySelectorAll("[data-admin-protocol]").forEach((button) => {
      if (button.dataset.adminProtocolReady === "true") return;

      button.dataset.adminProtocolReady = "true";
      button.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        startAdminProtocol();
      });
    });

    hiringForms.forEach((form) => {
      if (form.dataset.hiringForm === "staff") return;

      form.addEventListener("submit", (event) => {
        event.preventDefault();
        const mode = form.dataset.hiringForm;
        const result = document.querySelector(`[data-hiring-result="${mode}"]`);

        if (!result) return;

        result.textContent =
          "Спасибо. Мы уже начали подготовку вашего вольера. Пожалуйста, не закрывайте окна в спальне сегодня ночью — наш курьер доставит ваш новый облик.";
      });
    });

    // Archive Terminal Logic
    const archiveForm = document.getElementById("archive-auth-form");
    const archivePassword = document.getElementById("archive-password");
    const archiveError = document.getElementById("archive-error");
    const archiveLoginScreen = document.getElementById("archive-login-screen");
    const archiveContent = document.getElementById("archive-content");
    
    // Lightbox Logic
    const lightbox = document.getElementById("image-lightbox");
    const lightboxImg = document.getElementById("lightbox-image");
    const lightboxCaption = document.querySelector(".lightbox-caption");
    const lightboxClose = document.querySelector(".lightbox-close");
    const archiveThumbnails = document.querySelectorAll(".archive-thumbnail");

    const archiveBtn = document.getElementById("archive-submit-btn");
    const archiveRequest = document.querySelector("[data-archive-request]");
    const archiveRequestResponse = document.querySelector("[data-archive-request-response]");

    const handleArchiveAuth = () => {
      if (archivePassword.value === "312") {
        archiveLoginScreen.hidden = true;
        archiveContent.hidden = false;
        playModeSwitchSound();
      } else {
        archiveError.hidden = false;
        archivePassword.value = "";
        archivePassword.focus();
      }
    };

    if (archiveBtn) {
      archiveBtn.addEventListener("click", handleArchiveAuth);
      archivePassword.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          handleArchiveAuth();
        }
      });
    }

    if (archiveRequest && archiveRequestResponse) {
      archiveRequest.addEventListener("click", () => {
        archiveRequestResponse.textContent =
          "ЗАПРОС ОТКЛОНЕН // BLUE ACCESS ONLY // ОСТАВШИЕСЯ ФАЙЛЫ НЕ ПРЕДНАЗНАЧЕНЫ ДЛЯ ГОСТЕЙ";
        archiveRequestResponse.hidden = false;
        archiveRequest.textContent = "ПОВТОРИТЬ ЗАПРОС";
        archiveRequest.classList.add("is-denied");
        playModeSwitchSound();
      });
    }

    if (lightbox && lightboxClose) {
      archiveThumbnails.forEach(img => {
        img.addEventListener("click", () => {
          const fullSrc = img.getAttribute("data-full");
          const caption = img.nextElementSibling ? img.nextElementSibling.textContent : "";
          lightboxImg.src = fullSrc;
          lightboxCaption.textContent = caption;
          lightbox.hidden = false;
        });
      });

      lightboxClose.addEventListener("click", () => {
        lightbox.hidden = true;
        lightboxImg.src = "";
      });

      lightbox.addEventListener("click", (e) => {
        if (e.target === lightbox) {
          lightbox.hidden = true;
          lightboxImg.src = "";
        }
      });
    }
  };

  // --- SPA Router ---
  const fetchAndReplace = async (url) => {
    if (isNavigating) return false;
    isNavigating = true;
    
    const currentWrapper = document.querySelector(".site-wrapper");
    if (currentWrapper) {
      currentWrapper.style.opacity = "0.6"; // Loading state
      currentWrapper.style.pointerEvents = "none";
    }

    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error("Network response was not ok");
      const html = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");
      const newWrapper = doc.querySelector(".site-wrapper");
      
      if (newWrapper && currentWrapper) {
        resolveFragmentUrls(newWrapper, response.url || url);

        // Detach player before replacing HTML
        if (player && player.parentNode) player.parentNode.removeChild(player);
        
        document.title = doc.title;
        currentWrapper.innerHTML = newWrapper.innerHTML;
        currentWrapper.className = newWrapper.className;
        currentWrapper.style.opacity = "1";
        currentWrapper.style.pointerEvents = "auto";
        
        // Reattach player
        const newLogoArea = document.querySelector(".logo-area");
        if (newLogoArea && player) {
          newLogoArea.append(player);
        } else if (player) {
          body.append(player);
        }
        
        initDOMListeners();
        announceNavigationChange();
        return true;
      }
    } catch (err) {
      console.error("Navigation error:", err);
    } finally {
      isNavigating = false;
      if (currentWrapper) {
        currentWrapper.style.opacity = "1";
        currentWrapper.style.pointerEvents = "auto";
      }
    }
    
    // Fallback if SPA fails
    window.location.assign(url);
    return false;
  };

  document.addEventListener("click", async (e) => {
    const link = e.target.closest("a");
    if (!link) return;
    
    const href = link.getAttribute("href");
    if (
      !href ||
      href.startsWith("#") ||
      href.startsWith("http") ||
      link.getAttribute("target") === "_blank" ||
      link.hasAttribute("data-full-navigation")
    ) {
      return;
    }

    e.preventDefault();
    const url = link.href;
    
    const success = await fetchAndReplace(url);
    if (success) {
      window.history.pushState({}, "", url);
      window.scrollTo({ top: 0, behavior: 'auto' });
    }
  });

  window.addEventListener("popstate", () => {
    fetchAndReplace(window.location.href);
  });

  const init = () => {
    initMusicPlayer();
    getNavigationAnnouncer();
    
    const savedMode = localStorage.getItem(MODE_KEY);
    applyMode(savedMode === "staff");
    
    initDOMListeners();
  };

  init();
})();
