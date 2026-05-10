(() => {
  const MODE_KEY = "tyndex_mode";
  const MUSIC_PLAYING_KEY = "tyndex_music_playing";
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
  let modeSwitchAudio;
  let currentMusicMode = "guest";
  let currentTrackIndex = 0;
  let clicks = [];
  let switching = false;
  let isNavigating = false;

  const getMusicTracks = () => musicLibrary[currentMusicMode] || musicLibrary.guest;

  const setPlayerState = (isPlaying) => {
    if (!player || !playButton) return;

    player.classList.toggle("is-playing", isPlaying);
    playButton.textContent = isPlaying ? "II" : "PLAY";
    playButton.setAttribute("aria-label", isPlaying ? "Поставить музыку на паузу" : "Включить музыку");
    localStorage.setItem(MUSIC_PLAYING_KEY, isPlaying ? "true" : "false");
  };

  const loadCurrentTrack = ({ keepPlaying = false } = {}) => {
    if (!audio) return;

    const tracks = getMusicTracks();
    const track = tracks[currentTrackIndex] || tracks[0];

    audio.src = track.src;
    audio.loop = tracks.length === 1;

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

  const initMusicPlayer = () => {
    if (audio) return;
    
    audio = new Audio();
    audio.preload = "metadata";
    audio.volume = 0.55;
    audio.addEventListener("ended", playNextTrack);
    audio.addEventListener("play", () => setPlayerState(true));
    audio.addEventListener("pause", () => setPlayerState(false));

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

    player.append(playButton, trackLabel, nextButton);
    (document.querySelector(".logo-area") || body).append(player);

    playButton.addEventListener("click", () => {
      if (audio.paused) {
        audio.play().catch(() => setPlayerState(false));
        return;
      }

      audio.pause();
    });

    nextButton.addEventListener("click", playNextTrack);
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

  const initDOMListeners = () => {
    const logo = document.querySelector(".logo");
    const hiddenTrigger = document.querySelector(".footer-trigger");
    const hiringForms = document.querySelectorAll("[data-hiring-form]");
    const homeHeroes = [...document.querySelectorAll("[data-home-hero]")];
    const statusLabel = document.querySelector("[data-mode-label]");

    initImageFallbacks();

    const savedMode = localStorage.getItem(MODE_KEY);
    
    if (statusLabel) {
      statusLabel.textContent = (savedMode === "staff") ? "Режим: Терминал персонала" : "Режим: Гостевая версия";
    }

    if (homeHeroes.length > 1) {
      const requestedHero = new URLSearchParams(window.location.search).get("hero");
      const selectedHero =
        homeHeroes.find((hero) => hero.dataset.homeHero === requestedHero) ||
        homeHeroes[0];

      homeHeroes.forEach((hero) => {
        hero.hidden = hero !== selectedHero;
      });
    }

    if (logo) {
      logo.addEventListener("click", tripleClickHandler);
    }

    if (hiddenTrigger) {
      hiddenTrigger.addEventListener("click", runGlitchAndToggle);
    }

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
    
    const savedMode = localStorage.getItem(MODE_KEY);
    applyMode(savedMode === "staff");
    
    initDOMListeners();
  };

  init();
})();
