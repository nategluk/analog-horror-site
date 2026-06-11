(() => {
  const MODE_KEY = "tyndex_mode";
  const MUSIC_PLAYING_KEY = "tyndex_music_playing";
  const CINEMA_TICKET_KEY = "tyndex_cinema_ticket_issued";
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
  let progressRange;
  let modeSwitchAudio;
  let currentMusicMode = "guest";
  let currentTrackIndex = 0;
  let clicks = [];
  let switching = false;
  let isNavigating = false;
  let adminProtocolRunning = false;
  let navigationAnnouncer;

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

    progressRange = document.createElement("input");
    progressRange.className = "music-player__progress";
    progressRange.type = "range";
    progressRange.min = "0";
    progressRange.max = "1000";
    progressRange.step = "1";
    progressRange.value = "0";
    progressRange.disabled = true;
    progressRange.setAttribute("aria-label", "Перемотка трека");

    player.append(playButton, trackLabel, nextButton, progressRange);
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

  const tripleClickHandler = () => {
    const now = Date.now();
    clicks.push(now);
    clicks = clicks.filter((time) => now - time < 900);

    if (clicks.length >= 3) {
      clicks = [];
      runGlitchAndToggle();
    }
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

  const initDOMListeners = () => {
    const logo = document.querySelector(".logo");
    const hiddenTrigger = document.querySelector(".footer-trigger");
    const hiringForms = document.querySelectorAll("[data-hiring-form]");
    const homeHeroes = [...document.querySelectorAll("[data-home-hero]")];
    const statusLabel = document.querySelector("[data-mode-label]");

    initImageFallbacks();
    initCopyButtons();
    initCinemaTicket();

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
      form.addEventListener("submit", (event) => {
        event.preventDefault();
        const mode = form.dataset.hiringForm;
        const result = document.querySelector(`[data-hiring-result="${mode}"]`);

        if (!result) return;

        if (mode === "staff") {
          result.textContent = "Удачи, будущий аниматор. Она тебе понадобится!";
          return;
        }

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
    if (!href || href.startsWith("#") || href.startsWith("http") || link.getAttribute("target") === "_blank") {
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
