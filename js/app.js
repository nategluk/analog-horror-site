(() => {
  const MODE_KEY = "tyndex_mode";
  const STAFF_SESSION_KEY = "tyndex_staff_session";
  const MUSIC_PLAYING_KEY = "tyndex_music_playing";
  const CINEMA_TICKET_KEY = "tyndex_cinema_ticket_issued";
  const STAFF_INTRUSION_KEY = "tyndex_staff_intrusion_v1";
  const DOSSIER_CLAIM_OFFER_KEY = "tyndex_dossier_claim_offer_v1";
  const DOSSIER_AUTH_SESSION_KEY = "tyndex_auth_session_v1";
  const ABOUT_ASSET_RECORD_KEY = "tyndex_about_asset_record_v1";
  const ARCHIVE_SECTION_KEY = "tyndex_archive_section_v1";
  const STAFF_HOME_NOTICE_KEY = "tyndex_staff_home_notice_seen_v1";
  const STAFF_DISPLAY_NAME_MAX = 20;
  const LORA_CURATOR_ID = "0391-L";
  const LORA_SAVE_KEY = "tyndex_lora_red_room_v1";
  const LORA_ASSIGN_KEY = "tyndex_lora_channel_v1";
  const LORA_RECEIPT_ID = "lora-night-receipt";
  const LORA_TOY_ID = "lora-nevalyashka";
  const LORA_PAGE_ID = "lora-quiet-sleep-page";
  const CCTV_HAUNT_DELAY = 60000;
  const DOSSIER_CLAIM_ENDPOINT =
    "https://edoqmjtqkqnksxjsjqcg.supabase.co/functions/v1/begin-dossier-claim";
  const DOSSIER_ACCESS_ENDPOINT =
    "https://edoqmjtqkqnksxjsjqcg.supabase.co/functions/v1/begin-dossier-access";
  const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_zIWow9PlLu6B63FKWLiBrA_jllbCKhI";
  const LOGO_KNOCK_WINDOW = 1500;
  const dossierStore = window.TyndexDossierStore;
  if (!dossierStore) {
    throw new Error("Tyndex dossier store is not loaded");
  }
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
  const cctvTeletextPages = [
    ["P101", "СЕГОДНЯ ДЯДЯ УЛЫБАРЫЧ НАУЧИТ ТЕБЯ СМЕЯТЬСЯ"],
    ["P112", "ЖИР ТВ. ТОЛЬКО ХОРОШИЕ НОВОСТИ"],
    ["P121", "ВИДЕОДРОМ ВСТРЕЧАЕТ ДЕТСКИЙ ЖИР"],
    ["P134", "НЕ ПЕРЕКЛЮЧАЙТЕСЬ. МЫ УЖЕ НАЧАЛИ"],
    ["P147", "ПОГОДА В КОМПЛЕКСЕ: ТЕПЛО. ВЫХОДА НЕТ"],
    ["P156", "СЕГОДНЯ В КАФЕ: МОЛОЧНЫЙ КОКТЕЙЛЬ «ВЕРНИСЬ ДОМОЙ»"],
    ["P163", "КАЖДОМУ РЕБЁНКУ — ПО МЯГКОМУ МЕСТУ"],
    ["P178", "ПАРК «СОЛНЫШКО». ТЕПЕРЬ ОТКРЫТ И ПОСЛЕ ЗАКРЫТИЯ"],
    ["P184", "ЕСЛИ РЕБЁНОК МОЛЧИТ — ПРОГРАММА ЗАГРУЖАЕТСЯ"],
    ["P196", "УВАЖАЕМЫЕ ГОСТИ! НЕ КОРМИТЕ ТЕХ, КТО ЗНАЕТ ВАШЕ ИМЯ"],
    ["P207", "МАМА СКОРО ВЕРНЁТСЯ. РЕКЛАМА ПРОДОЛЖАЕТСЯ"],
    ["P219", "ЗООПАРК СООБЩАЕТ: ВСЕ КЛЕТКИ ПО-ПРЕЖНЕМУ ПУСТЫ"],
    ["P228", "БАССЕЙН «ДЕЛЬФИН»: ВОДА ПРОШЛА ПРОВЕРКУ. ПРОВЕРЯЮЩИЙ — НЕТ"],
    ["P241", "СЕАНС В «ИЛЛЮЗИОНЕ» УЖЕ ИДЁТ. ВАШЕ МЕСТО ЗАНЯТО ВАМИ"],
    ["P253", "УВИДЕЛИ СОТРУДНИКА БЕЗ УЛЫБКИ? ПОМОГИТЕ ЕМУ"],
    ["P267", "СТРАНИЦА 404: РОДИТЕЛЬ НЕ НАЙДЕН"],
    ["P278", "СОБЛЮДАЙТЕ ПРАВИЛА. ОНИ ПОМНЯТ ВАС"],
    ["P289", "ИРИНА, НЕ ЧИТАЙ ЭТУ СТРОКУ"],
    ["P300", "ЭТО НЕ СТРАНИЦА ТЕЛЕТЕКСТА"],
    ["P312", "СПАСИБО, ЧТО ОСТАЛИСЬ С НАМИ"],
  ];
  const cctvSoundLibrary = {
    click: {
      src: "assets/audio/staff/cctv/remote-button-click.mp3",
      volume: 0.22,
    },
    static: {
      src: "assets/audio/staff/cctv/tv-static-loop.mp3",
      volume: 0.055,
      loop: true,
    },
    channel: {
      src: "assets/audio/staff/cctv/channel-static.mp3",
      volume: 0.1,
    },
    teletext: {
      src: "assets/audio/staff/cctv/teletext-tone.mp3",
      volume: 0.11,
    },
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
  const pageScriptPromises = new Map();

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

  const getCctvPool = (source) => (source.dataset.videoPool || "")
    .split("|")
    .map((src) => src.trim())
    .filter(Boolean);

  const pickCctvSource = (pool, currentSource = "") => {
    const alternatives = pool.filter((src) => src !== currentSource);
    const candidates = alternatives.length ? alternatives : pool;
    return candidates[Math.floor(Math.random() * candidates.length)] || "";
  };

  const resetCctvVideo = (video) => {
    video.pause();
    video.removeAttribute("src");
    video.load();
  };

  const playCctvVideo = (video) => {
    const pool = getCctvPool(video);
    if (!pool.length) return;

    if (!video.dataset.cctvSelected) {
      video.dataset.cctvSelected = pickCctvSource(pool);
    }

    if (!video.src) {
      video.src = video.dataset.cctvSelected;
    }

    video.play().catch(() => {});
  };

  const clearCctvHauntTimer = (consoleElement) => {
    if (!consoleElement._cctvHauntTimer) return;

    window.clearTimeout(consoleElement._cctvHauntTimer);
    consoleElement._cctvHauntTimer = null;
    delete consoleElement.dataset.cctvHauntNextAt;
  };

  const shuffleCctvTeletextPages = (lastPage = "") => {
    const pages = [...cctvTeletextPages];

    for (let index = pages.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(Math.random() * (index + 1));
      [pages[index], pages[swapIndex]] = [pages[swapIndex], pages[index]];
    }

    if (pages.length > 1 && pages[0][0] === lastPage) {
      [pages[0], pages[1]] = [pages[1], pages[0]];
    }

    return pages;
  };

  const setCctvPowerButtons = (consoleElement, isPowered) => {
    const powerOnButton = consoleElement.querySelector("[data-cctv-power-on]");
    const powerOffButton = consoleElement.querySelector("[data-cctv-power-off]");

    if (powerOnButton) powerOnButton.setAttribute("aria-pressed", String(isPowered));
    if (powerOffButton) powerOffButton.setAttribute("aria-pressed", String(!isPowered));
  };

  const createCctvSoundRack = () => Object.fromEntries(
    Object.entries(cctvSoundLibrary).map(([name, sound]) => {
      const soundElement = new Audio(audioAsset(sound.src));
      soundElement.preload = "none";
      soundElement.volume = sound.volume;
      soundElement.loop = sound.loop === true;
      return [name, soundElement];
    })
  );

  const playCctvSound = (consoleElement, name) => {
    const sound = consoleElement._cctvState?.sounds?.[name];
    if (!sound) return;

    sound.currentTime = 0;
    sound.play().catch(() => {});
  };

  const startCctvStaticSound = (consoleElement) => {
    if (!body.classList.contains("staff-mode")) return;

    const state = consoleElement._cctvState;
    if (state?.audioMuted) return;

    const staticSound = state?.sounds?.static;
    if (!staticSound || !staticSound.paused) return;
    staticSound.play().catch(() => {});
  };

  const stopCctvStaticSound = (consoleElement) => {
    const staticSound = consoleElement._cctvState?.sounds?.static;
    if (!staticSound) return;

    staticSound.pause();
    staticSound.currentTime = 0;
  };

  const stopAllCctvSounds = (consoleElement) => {
    const sounds = consoleElement._cctvState?.sounds;
    if (!sounds) return;

    Object.values(sounds).forEach((sound) => {
      sound.pause();
      sound.currentTime = 0;
    });
  };

  const setCctvMuted = (consoleElement, isMuted) => {
    const state = consoleElement._cctvState;
    const video = consoleElement.querySelector("[data-cctv-video]");
    const muteButton = consoleElement.querySelector("[data-cctv-mute]");
    const muteIndicator = consoleElement.querySelector("[data-cctv-mute-indicator]");
    if (!state || !video || !muteButton || !muteIndicator) return;

    state.audioMuted = isMuted;
    video.muted = isMuted;
    muteButton.setAttribute("aria-pressed", String(isMuted));
    muteButton.setAttribute(
      "aria-label",
      isMuted ? "Включить звук эфира" : "Выключить звук эфира"
    );
    muteIndicator.hidden = !isMuted;

    if (isMuted) {
      stopCctvStaticSound(consoleElement);
    } else if (state.hauntActive && consoleElement.dataset.cctvHauntPhase === "noise") {
      startCctvStaticSound(consoleElement);
    }
  };

  const closeCctvTeletext = (consoleElement) => {
    const teletext = consoleElement.querySelector("[data-cctv-teletext]");
    const teletextButton = consoleElement.querySelector("[data-cctv-teletext-button]");

    if (teletext) teletext.hidden = true;
    consoleElement.classList.remove("is-teletext");
    if (teletextButton) {
      teletextButton.setAttribute("aria-pressed", "false");
      teletextButton.setAttribute("aria-label", "Открыть телетекст");
    }
  };

  const closeCctvSourceScreen = (consoleElement, { restoreDisplay = false } = {}) => {
    const sourceScreen = consoleElement.querySelector("[data-cctv-source-screen]");
    const sourceButton = consoleElement.querySelector("[data-cctv-source-button]");
    const remoteStatus = consoleElement.querySelector("[data-cctv-remote-state]");
    const label = consoleElement.querySelector("[data-cctv-channel-label]");
    const state = consoleElement._cctvState;

    if (sourceScreen) sourceScreen.hidden = true;
    consoleElement.classList.remove("is-source");
    if (sourceButton) {
      sourceButton.setAttribute("aria-pressed", "false");
      sourceButton.setAttribute("aria-label", "Открыть внешний источник");
    }

    if (!restoreDisplay || !state?.sources.length) return;

    const source = state.sources[state.sourceIndex];
    const channelCode = source.dataset.channelCode || "CH --";
    const channelName = source.dataset.channelName || "ИСТОЧНИК НЕ ОПРЕДЕЛЁН";
    if (remoteStatus) remoteStatus.textContent = channelCode;
    if (label) label.textContent = `${channelCode} // ${channelName}`;
  };

  const toggleCctvSourceScreen = (consoleElement) => {
    const sourceScreen = consoleElement.querySelector("[data-cctv-source-screen]");
    const sourceButton = consoleElement.querySelector("[data-cctv-source-button]");
    const remoteStatus = consoleElement.querySelector("[data-cctv-remote-state]");
    const label = consoleElement.querySelector("[data-cctv-channel-label]");
    if (!sourceScreen || !sourceButton) return;

    if (consoleElement.dataset.cctvPowered !== "true") {
      if (remoteStatus) remoteStatus.textContent = "SRC // TV OFF";
      return;
    }

    if (consoleElement.classList.contains("is-source")) {
      closeCctvSourceScreen(consoleElement, { restoreDisplay: true });
      return;
    }

    closeCctvTeletext(consoleElement);
    sourceScreen.hidden = false;
    consoleElement.classList.add("is-source");
    sourceButton.setAttribute("aria-pressed", "true");
    sourceButton.setAttribute("aria-label", "Вернуться к телевизионному эфиру");
    if (remoteStatus) remoteStatus.textContent = "SOURCE";
    if (label) label.textContent = "SRC // ВНЕШНИЙ ВХОД";
  };

  const showNextCctvTeletextPage = (consoleElement) => {
    const teletext = consoleElement.querySelector("[data-cctv-teletext]");
    const pageNumber = consoleElement.querySelector("[data-cctv-teletext-page]");
    const message = consoleElement.querySelector("[data-cctv-teletext-message]");
    const teletextButton = consoleElement.querySelector("[data-cctv-teletext-button]");
    const remoteStatus = consoleElement.querySelector("[data-cctv-remote-state]");
    const label = consoleElement.querySelector("[data-cctv-channel-label]");
    const status = consoleElement.querySelector("[data-cctv-channel-status]");
    const state = consoleElement._cctvState;
    if (!teletext || !pageNumber || !message || !state) return;

    if (consoleElement.dataset.cctvPowered !== "true") {
      if (remoteStatus) remoteStatus.textContent = "TXT // НЕТ НЕСУЩЕЙ";
      return;
    }

    closeCctvSourceScreen(consoleElement);

    if (!state.teletextDeck.length) {
      state.teletextDeck = shuffleCctvTeletextPages(state.lastTeletextPage);
    }

    const [page, copy] = state.teletextDeck.shift();
    state.lastTeletextPage = page;
    pageNumber.textContent = page;
    message.textContent = copy;
    teletext.hidden = false;
    consoleElement.classList.add("is-teletext");
    if (teletextButton) {
      teletextButton.setAttribute("aria-pressed", "true");
      teletextButton.setAttribute("aria-label", "Следующая страница телетекста");
    }
    if (remoteStatus) remoteStatus.textContent = page;
    if (label) label.textContent = `${page} // ЖИР-ТЕКСТ`;
    if (status) status.textContent = "Информационная служба внутреннего вещания.";
  };

  const applyCctvChannel = (
    consoleElement,
    source,
    { autoplay = false, haunted = false } = {}
  ) => {
    const video = consoleElement.querySelector("[data-cctv-video]");
    const label = consoleElement.querySelector("[data-cctv-channel-label]");
    const status = consoleElement.querySelector("[data-cctv-channel-status]");
    const nextButton = consoleElement.querySelector("[data-cctv-next]");
    const remoteStatus = consoleElement.querySelector("[data-cctv-remote-state]");
    if (!video || !source) return;

    video.muted = consoleElement._cctvState?.audioMuted === true;
    const pool = getCctvPool(source);
    const nextSource = pickCctvSource(pool, video.dataset.cctvSelected);
    const channelCode = source.dataset.channelCode || "CH --";
    const channelName = source.dataset.channelName || "ИСТОЧНИК НЕ ОПРЕДЕЛЁН";

    stopCctvStaticSound(consoleElement);
    video.pause();
    video.removeAttribute("src");
    video.dataset.videoPool = source.dataset.videoPool || "";
    video.dataset.cctvSelected = nextSource;
    video.poster = source.dataset.poster || "";
    video.loop = source.dataset.loop !== "false";
    video.setAttribute("aria-label", `${channelCode} ${channelName}`);
    video.load();

    closeCctvTeletext(consoleElement);
    closeCctvSourceScreen(consoleElement);
    if (label) label.textContent = `${channelCode} // ${channelName}`;
    if (status) status.textContent = source.dataset.status || "Статус: сигнал принят.";
    consoleElement.classList.remove("is-powered-off");
    if (remoteStatus) remoteStatus.textContent = channelCode;

    if (haunted) {
      consoleElement.dataset.cctvPowered = "false";
      consoleElement.dataset.cctvHauntPhase = "video";
      consoleElement.classList.add("is-haunting", "is-haunt-playing", "is-intercepted");
      setCctvPowerButtons(consoleElement, false);
      if (nextButton) nextButton.disabled = true;
    } else {
      consoleElement.dataset.cctvPowered = "true";
      consoleElement.dataset.cctvHauntPhase = "idle";
      consoleElement.classList.remove("is-haunting", "is-haunt-playing", "is-intercepted");
      setCctvPowerButtons(consoleElement, true);
      if (nextButton) nextButton.disabled = false;
    }

    if (autoplay && body.classList.contains("staff-mode")) {
      playCctvVideo(video);
    }
  };

  const stopCctvConsole = (consoleElement, { playStatic = false } = {}) => {
    const video = consoleElement.querySelector("[data-cctv-video]");
    const label = consoleElement.querySelector("[data-cctv-channel-label]");
    const status = consoleElement.querySelector("[data-cctv-channel-status]");
    const nextButton = consoleElement.querySelector("[data-cctv-next]");
    const remoteStatus = consoleElement.querySelector("[data-cctv-remote-state]");
    if (!video) return;

    clearCctvHauntTimer(consoleElement);
    if (consoleElement._cctvState) {
      consoleElement._cctvState.hauntActive = false;
    }
    resetCctvVideo(video);
    closeCctvTeletext(consoleElement);
    closeCctvSourceScreen(consoleElement);
    consoleElement.dataset.cctvPowered = "false";
    consoleElement.dataset.cctvHauntPhase = "idle";
    consoleElement.classList.add("is-powered-off");
    consoleElement.classList.remove("is-haunting", "is-haunt-playing", "is-intercepted");
    if (label) label.textContent = "CH -- // НЕТ СИГНАЛА";
    if (status) status.textContent = "Питание отключено.";
    setCctvPowerButtons(consoleElement, false);
    if (nextButton) nextButton.disabled = true;
    if (remoteStatus) remoteStatus.textContent = "TV OFF";

    if (playStatic && body.classList.contains("staff-mode")) {
      startCctvStaticSound(consoleElement);
    } else {
      stopAllCctvSounds(consoleElement);
    }
  };

  const startCctvNormal = (consoleElement) => {
    const state = consoleElement._cctvState;
    if (!state?.sources.length) return;

    clearCctvHauntTimer(consoleElement);
    state.hauntActive = false;
    applyCctvChannel(consoleElement, state.sources[state.sourceIndex], { autoplay: true });
  };

  const advanceCctvChannel = (consoleElement) => {
    const state = consoleElement._cctvState;
    if (!state?.sources.length || consoleElement.dataset.cctvPowered !== "true") {
      return;
    }

    state.sourceIndex = (state.sourceIndex + 1) % state.sources.length;
    applyCctvChannel(consoleElement, state.sources[state.sourceIndex], { autoplay: true });
    playCctvSound(consoleElement, "channel");
  };

  const scheduleCctvHauntVideo = (consoleElement) => {
    const state = consoleElement._cctvState;
    if (!state?.hauntActive || !state.hauntedSources.length) return;

    clearCctvHauntTimer(consoleElement);
    consoleElement.dataset.cctvHauntNextAt = String(Date.now() + CCTV_HAUNT_DELAY);
    consoleElement._cctvHauntTimer = window.setTimeout(() => {
      if (!consoleElement.isConnected || !state.hauntActive) return;

      const alternatives = state.hauntedSources.filter(
        (source) => source !== state.lastHauntedSource
      );
      const candidates = alternatives.length ? alternatives : state.hauntedSources;
      const source = candidates[Math.floor(Math.random() * candidates.length)];
      state.lastHauntedSource = source;
      applyCctvChannel(consoleElement, source, { autoplay: true, haunted: true });
    }, CCTV_HAUNT_DELAY);
  };

  const showCctvHauntNoise = (consoleElement) => {
    const state = consoleElement._cctvState;
    const video = consoleElement.querySelector("[data-cctv-video]");
    const label = consoleElement.querySelector("[data-cctv-channel-label]");
    const status = consoleElement.querySelector("[data-cctv-channel-status]");
    const nextButton = consoleElement.querySelector("[data-cctv-next]");
    const remoteStatus = consoleElement.querySelector("[data-cctv-remote-state]");
    if (!state || !video) return;

    clearCctvHauntTimer(consoleElement);
    resetCctvVideo(video);
    closeCctvTeletext(consoleElement);
    closeCctvSourceScreen(consoleElement);
    state.hauntActive = true;
    consoleElement.dataset.cctvPowered = "false";
    consoleElement.dataset.cctvHauntPhase = "noise";
    consoleElement.classList.add("is-powered-off", "is-haunting");
    consoleElement.classList.remove("is-haunt-playing", "is-intercepted");
    if (label) label.textContent = "CH -- // НЕТ СИГНАЛА";
    if (status) status.textContent = "Питание отключено.";
    setCctvPowerButtons(consoleElement, false);
    if (nextButton) nextButton.disabled = true;
    if (remoteStatus) remoteStatus.textContent = "TV OFF";

    startCctvStaticSound(consoleElement);
    scheduleCctvHauntVideo(consoleElement);
  };

  const initCctvConsole = (consoleElement) => {
    if (consoleElement.dataset.cctvConsoleReady === "true") return;

    const video = consoleElement.querySelector("[data-cctv-video]");
    const sources = [...consoleElement.querySelectorAll("[data-cctv-source]")];
    const hauntedSources = [
      ...consoleElement.querySelectorAll("[data-cctv-haunted-source]"),
    ];
    const powerOnButton = consoleElement.querySelector("[data-cctv-power-on]");
    const powerOffButton = consoleElement.querySelector("[data-cctv-power-off]");
    const nextButton = consoleElement.querySelector("[data-cctv-next]");
    const teletextButton = consoleElement.querySelector("[data-cctv-teletext-button]");
    const muteButton = consoleElement.querySelector("[data-cctv-mute]");
    const sourceButton = consoleElement.querySelector("[data-cctv-source-button]");
    const sourceScreen = consoleElement.querySelector("[data-cctv-source-screen]");
    if (
      !video ||
      !sources.length ||
      !powerOnButton ||
      !powerOffButton ||
      !nextButton ||
      !teletextButton ||
      !muteButton ||
      !sourceButton ||
      !sourceScreen
    ) return;

    consoleElement.dataset.cctvConsoleReady = "true";
    consoleElement._cctvState = {
      sources,
      hauntedSources,
      sourceIndex: 0,
      hauntActive: false,
      lastHauntedSource: null,
      teletextDeck: [],
      lastTeletextPage: "",
      audioMuted: false,
      sounds: createCctvSoundRack(),
    };
    setCctvMuted(consoleElement, false);

    powerOnButton.addEventListener("click", () => {
      playCctvSound(consoleElement, "click");
      startCctvNormal(consoleElement);
    });

    powerOffButton.addEventListener("click", () => {
      playCctvSound(consoleElement, "click");
      if (consoleElement.dataset.cctvPowered !== "true") {
        startCctvStaticSound(consoleElement);
        return;
      }
      showCctvHauntNoise(consoleElement);
    });

    nextButton.addEventListener("click", () => {
      if (consoleElement.dataset.cctvPowered !== "true") return;

      playCctvSound(consoleElement, "click");
      advanceCctvChannel(consoleElement);
    });

    teletextButton.addEventListener("click", () => {
      playCctvSound(consoleElement, "click");
      if (consoleElement.dataset.cctvPowered !== "true") {
        startCctvStaticSound(consoleElement);
      } else {
        playCctvSound(consoleElement, "teletext");
      }
      showNextCctvTeletextPage(consoleElement);
    });

    sourceButton.addEventListener("click", () => {
      playCctvSound(consoleElement, "click");
      if (consoleElement.dataset.cctvPowered === "true") {
        playCctvSound(consoleElement, "teletext");
      }
      toggleCctvSourceScreen(consoleElement);
    });

    muteButton.addEventListener("click", () => {
      playCctvSound(consoleElement, "click");
      setCctvMuted(consoleElement, !consoleElement._cctvState.audioMuted);
    });

    video.addEventListener("ended", () => {
      const state = consoleElement._cctvState;
      if (state?.hauntActive && consoleElement.classList.contains("is-haunt-playing")) {
        showCctvHauntNoise(consoleElement);
        return;
      }

      advanceCctvChannel(consoleElement);
    });

    stopCctvConsole(consoleElement, {
      playStatic: body.classList.contains("staff-mode"),
    });
  };

  const updateCctvVideos = (isStaff) => {
    document.querySelectorAll("[data-cctv-console]").forEach((consoleElement) => {
      initCctvConsole(consoleElement);
      if (!isStaff) {
        stopCctvConsole(consoleElement);
      }
    });

    document.querySelectorAll("[data-cctv-video]").forEach((video) => {
      if (video.tagName !== "VIDEO") return;

      if (!isStaff) {
        const consoleElement = video.closest("[data-cctv-console]");
        if (!consoleElement) {
          resetCctvVideo(video);
        }
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

  const initHiringThreshold = () => {
    const wrapper = document.querySelector(".broadcast-shell-page");
    if (!wrapper) return;

    let dialog = document.querySelector("[data-hiring-threshold]");
    if (!dialog) {
      dialog = document.createElement("dialog");
      dialog.className = "hiring-threshold";
      dialog.dataset.hiringThreshold = "true";
      dialog.setAttribute("aria-labelledby", "hiring-threshold-title");
      dialog.setAttribute("aria-describedby", "hiring-threshold-copy");
      dialog.innerHTML = `
        <div class="hiring-threshold__panel">
          <p class="hiring-threshold__kicker">ЖИР ТВ // ВЫХОД ИЗ ЭФИРА</p>
          <h2 id="hiring-threshold-title">Ты уверен?</h2>
          <p id="hiring-threshold-copy">
            Следующий канал не относится к телевизионной сети. Возврат к обычному сигналу
            не гарантируется.
          </p>
          <div class="hiring-threshold__actions">
            <button type="button" data-hiring-threshold-cancel>НЕТ, ОСТАТЬСЯ</button>
            <button type="button" data-hiring-threshold-confirm>ДА</button>
          </div>
        </div>
      `;
      body.append(dialog);
    }

    const cancelButton = dialog.querySelector("[data-hiring-threshold-cancel]");
    const confirmButton = dialog.querySelector("[data-hiring-threshold-confirm]");
    if (dialog.dataset.hiringThresholdReady !== "true") {
      dialog.dataset.hiringThresholdReady = "true";

      const closeDialog = () => {
        if (dialog.open) dialog.close();
        dialog._hiringSourceLink?.focus();
      };

      cancelButton?.addEventListener("click", closeDialog);
      dialog.addEventListener("cancel", (event) => {
        event.preventDefault();
        closeDialog();
      });

      confirmButton?.addEventListener("click", () => {
        if (!dialog._hiringTargetUrl || switching || isNavigating) return;

        confirmButton.disabled = true;
        dialog.close();
        playModeSwitchSound();
        body.classList.add("glitching");

        window.setTimeout(async () => {
          const url = dialog._hiringTargetUrl;
          dialog._hiringTargetUrl = null;
          const success = await fetchAndReplace(url);
          if (success) {
            window.history.pushState({}, "", url);
            window.scrollTo({ top: 0, behavior: "auto" });
          }
          body.classList.remove("glitching");
          confirmButton.disabled = false;
        }, 1050);
      });
    }

    wrapper.querySelectorAll('.site-nav a[href="hiring"], .site-nav a[href="hiring.html"]').forEach((link) => {
      if (link.dataset.hiringThresholdReady === "true") return;
      link.dataset.hiringThresholdReady = "true";

      link.addEventListener("click", (event) => {
        if (!body.classList.contains("staff-mode")) return;

        event.preventDefault();
        event.stopPropagation();
        dialog._hiringSourceLink = link;
        dialog._hiringTargetUrl = new URL("hiring.html", window.location.href).href;
        dialog.showModal();
        window.requestAnimationFrame(() => confirmButton?.focus());
      });
    });
  };

  const initStaffHomeNotice = () => {
    const existingNotice = document.querySelector("[data-staff-home-notice]");
    const isStaffHome =
      body.classList.contains("staff-mode") &&
      Boolean(document.querySelector('[data-home-hero="wonder"]'));

    if (!isStaffHome) {
      existingNotice?.remove();
      return;
    }

    if (
      existingNotice ||
      localStorage.getItem(STAFF_HOME_NOTICE_KEY) === "true"
    ) {
      return;
    }

    localStorage.setItem(STAFF_HOME_NOTICE_KEY, "true");

    const notice = document.createElement("aside");
    notice.className = "staff-access-notice";
    notice.dataset.staffHomeNotice = "true";
    notice.setAttribute("role", "status");
    notice.setAttribute("aria-live", "polite");
    notice.innerHTML = `
      <span aria-hidden="true">!</span>
      <p><strong>СЛУЖЕБНОЕ ПРЕДУПРЕЖДЕНИЕ</strong>Несанкционированный доступ в закрытый контур.</p>
      <button type="button" aria-label="Закрыть служебное предупреждение">&times;</button>
    `;

    let removalTimer;
    const dismiss = () => {
      window.clearTimeout(removalTimer);
      notice.classList.remove("is-visible");
      window.setTimeout(() => notice.remove(), 220);
    };

    notice.querySelector("button")?.addEventListener("click", dismiss);
    body.append(notice);
    window.requestAnimationFrame(() => notice.classList.add("is-visible"));
    removalTimer = window.setTimeout(dismiss, 6500);
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

  const loadPageScript = (src) => {
    if (pageScriptPromises.has(src)) {
      return pageScriptPromises.get(src);
    }

    const existingScript = [...document.scripts].find((script) => script.src === src);
    if (existingScript) {
      const ready = Promise.resolve();
      pageScriptPromises.set(src, ready);
      return ready;
    }

    const script = document.createElement("script");
    script.src = src;
    script.async = false;

    const promise = new Promise((resolve, reject) => {
      script.addEventListener("load", resolve, { once: true });
      script.addEventListener(
        "error",
        () => reject(new Error(`Failed to load page script: ${src}`)),
        { once: true }
      );
    });

    pageScriptPromises.set(src, promise);
    body.append(script);
    return promise;
  };

  const initEpisodeCatalogPage = async (baseUrl) => {
    if (!document.querySelector("[data-episode-catalog]")) return;

    const dataScript = new URL("content/archive/episode-catalog.js", baseUrl).href;
    const runtimeScript = new URL("js/archive-catalog.js", baseUrl).href;

    if (!Array.isArray(window.DZ_EPISODE_CATALOG)) {
      await loadPageScript(dataScript);
    }

    if (typeof window.DZInitEpisodeCatalog !== "function") {
      await loadPageScript(runtimeScript);
    }

    window.DZInitEpisodeCatalog?.();
  };

  const initRedRoomEspresso = async () => {
    const root = document.querySelector("[data-red-room-espresso]");
    if (!root) return;

    if (typeof window.TyndexRedRoomEspresso?.init !== "function") {
      const appScript = [...document.scripts].find((script) =>
        /(?:^|\/)app\.js(?:\?|$)/.test(script.src)
      );
      const src = new URL("red-room-espresso.js", appScript?.src || window.location.href).href;
      await loadPageScript(src);
    }

    window.TyndexRedRoomEspresso?.init(root);
  };

  const ensureLoraRoomStyles = () => {
    if (document.querySelector("link[data-lora-room-css]")) return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = new URL("../css/lora-red-room.css", scriptUrl).href;
    link.dataset.loraRoomCss = "true";
    document.head.append(link);
  };

  const initLoraRedRoom = async () => {
    const root = document.querySelector("[data-lora-room]");
    if (!root) {
      document.body.classList.remove("lora-room-open");
      return;
    }

    ensureLoraRoomStyles();
    const appScript = [...document.scripts].find((script) =>
      /(?:^|\/)app\.js(?:\?|$)/.test(script.src)
    );
    const base = appScript?.src || window.location.href;
    if (!window.TyndexLoraRedRoomContent) {
      await loadPageScript(new URL("../content/lora/red-room-content.js", base).href);
    }
    if (typeof window.TyndexLoraRedRoom?.init !== "function") {
      await loadPageScript(new URL("lora-red-room.js", base).href);
    }
    window.TyndexLoraRedRoom?.init(root);
  };

  const launchLoraShift = () => {
    ensureLoraRoomStyles();
    window.sessionStorage.setItem(
      LORA_ASSIGN_KEY,
      JSON.stringify({ assigned: true, at: Date.now() })
    );
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const veil = document.createElement("div");
    veil.className = "lora-room-assign";
    veil.setAttribute("role", "status");
    veil.innerHTML =
      "<div><p>КАНАЛ НАЗНАЧЕН</p><p>МЕСТО НАЗНАЧЕНИЯ: КРАСНАЯ КОМНАТА</p></div>";
    document.body.append(veil);
    document.body.classList.add("lora-room-open");
    const target = new URL("../locations/red-room-shift.html", scriptUrl).href;
    window.setTimeout(() => {
      veil.innerHTML =
        "<div><p>КУРАТОР НЕДОСТУПЕН</p><p>Лора П. использует один накопленный выходной.</p><p>Включено автоматическое замещение смены.</p></div>";
    }, reducedMotion ? 0 : 650);
    window.setTimeout(() => {
      window.location.assign(target);
    }, reducedMotion ? 280 : 1700);
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

  const setStaffSession = (active) => {
    try {
      if (active) {
        window.sessionStorage.setItem(STAFF_SESSION_KEY, "1");
      } else {
        window.sessionStorage.removeItem(STAFF_SESSION_KEY);
      }
    } catch (error) {
      /* session gate is best-effort */
    }
  };

  const hasStaffSession = () => {
    try {
      return window.sessionStorage.getItem(STAFF_SESSION_KEY) === "1";
    } catch (error) {
      return false;
    }
  };

  const resolveStaffMode = () =>
    localStorage.getItem(MODE_KEY) === "staff" && hasStaffSession();

  const syncModeLabel = (isStaff) => {
    const statusLabel = document.querySelector("[data-mode-label]");
    if (!statusLabel) return;
    statusLabel.textContent = isStaff
      ? "Режим: Терминал персонала"
      : "Режим: Гостевая версия";
    statusLabel.classList.toggle("status-pill--exit", isStaff);
    statusLabel.title = isStaff
      ? "Вернуться в гостевую версию"
      : "";
    statusLabel.setAttribute(
      "role",
      isStaff ? "button" : "status"
    );
    if (isStaff) {
      statusLabel.setAttribute("tabindex", "0");
      statusLabel.setAttribute("aria-label", "Вернуться в гостевую версию");
    } else {
      statusLabel.removeAttribute("tabindex");
      statusLabel.removeAttribute("aria-label");
    }
  };

  const applyMode = (isStaff) => {
    body.classList.toggle("staff-mode", isStaff);
    syncModeLabel(isStaff);
    setMusicMode(isStaff);
    updateCctvVideos(isStaff);
    localStorage.setItem(MODE_KEY, isStaff ? "staff" : "guest");
    setStaffSession(isStaff);
    initStaffHomeNotice();
  };

  const MODE_SWITCH_GLITCH_MS = 1600;

  const runModeGlitch = ({ sound, onDone } = {}) => {
    if (switching) return false;
    switching = true;
    document.querySelector(".logo")?.classList.remove("logo-knock-one", "logo-knock-two");
    if (sound) playModeSwitchSound();
    body.classList.add("glitching");
    const delay = window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ? 0
      : MODE_SWITCH_GLITCH_MS;
    window.setTimeout(() => {
      try {
        onDone?.();
      } finally {
        body.classList.remove("glitching");
        switching = false;
      }
    }, delay);
    return true;
  };

  const exitStaffToGuest = () => {
    if (!body.classList.contains("staff-mode")) return;
    runModeGlitch({
      sound: false,
      onDone: () => applyMode(false),
    });
  };

  const enterStaffWithGlitch = (href) => {
    const started = runModeGlitch({
      sound: true,
      onDone: () => {
        applyMode(true);
        if (href) window.location.assign(href);
      },
    });
    if (started || !href) return;
    applyMode(true);
    window.location.assign(href);
  };

  window.TyndexSiteFx = {
    enterStaff: enterStaffWithGlitch,
    exitStaff: () => applyMode(false),
    staffSessionKey: STAFF_SESSION_KEY,
  };

  const runGlitchAndToggle = () => {
    const nextIsStaff = !body.classList.contains("staff-mode");
    const staffEntry = document
      .querySelector("[data-staff-entry]")
      ?.getAttribute("data-staff-entry");
    runModeGlitch({
      sound: nextIsStaff,
      onDone: () => {
        applyMode(nextIsStaff);
        if (nextIsStaff && staffEntry) {
          window.location.assign(new URL(staffEntry, window.location.href).href);
        }
      },
    });
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

  const irinaCallContent = window.TyndexIrinaCallContent;
  if (!irinaCallContent?.nodes) {
    throw new Error("Irina call content is not loaded");
  }

  const resolveContentAsset = (value) =>
    typeof value === "string" && value ? audioAsset(value) : value;

  const hydrateRecordAssets = (record = {}) => {
    const hydrated = { ...record };
    if (typeof hydrated.src === "string") {
      hydrated.src = resolveContentAsset(hydrated.src);
    }
    if (typeof hydrated.avatar === "string") {
      hydrated.avatar = resolveContentAsset(hydrated.avatar);
    }
    if (typeof hydrated.image === "string") {
      hydrated.image = resolveContentAsset(hydrated.image);
    }
    if (typeof hydrated.headerImage === "string") {
      hydrated.headerImage = resolveContentAsset(hydrated.headerImage);
    }
    return hydrated;
  };

  const hydrateCatalog = (catalog = {}) =>
    Object.fromEntries(
      Object.entries(catalog).map(([id, record]) => [
        id,
        hydrateRecordAssets(record),
      ])
    );

  // Content source of truth: content/irina/call-content.js
  const curatorRewardCopy = irinaCallContent.rewardCopy || {};

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

  const curatorFiles = hydrateCatalog(irinaCallContent.files || {});
  const curatorMediaAsset = (filename) =>
    audioAsset(
      `${irinaCallContent.mediaBase || "assets/staff/curators/irina/"}${filename}`
    );
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
      role: "ВРЕМЕННЫЙ КУРАТОР ТРАНЗИТНОЙ СМЕНЫ",
      status: "АКТИВНА",
      note: "Укрывает Аниматоров в подсобном помещении.",
      image: audioAsset("assets/staff/staff/lora_sad.jpg"),
      headerImage: audioAsset("assets/staff/personnel/laura-record.webp"),
      dossier: "documents/dossier-laura.html",
      curatorId: LORA_CURATOR_ID,
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

  const staffAvatarIds = [
    "avatar-01",
    "avatar-02",
    "avatar-03",
    "avatar-04",
  ];
  const staffAvatarSources = {
    "avatar-01": audioAsset("assets/staff/player-avatars/avatar-01.webp"),
    "avatar-02": audioAsset("assets/staff/player-avatars/avatar-02.webp"),
    "avatar-03": audioAsset("assets/staff/player-avatars/avatar-03-fox.webp"),
    "avatar-04": audioAsset("assets/staff/player-avatars/avatar-04-dog.webp"),
  };
  const legacyStaffAvatarMap = {
    overexposed: "avatar-02",
    drawing: "avatar-04",
    mask: "avatar-01",
    "empty-chair": "avatar-03",
  };
  const getStaffAvatarId = (avatarId) =>
    staffAvatarIds.includes(avatarId)
      ? avatarId
      : legacyStaffAvatarMap[avatarId] || null;


  const staffMessages = hydrateCatalog(irinaCallContent.staffMessages || {});
  const loraContent = () => window.TyndexLoraRedRoomContent || null;

  const buildLoraReceiptCopy = (snapshot = {}) => {
    const parts =
      loraContent()?.buildReceiptCopy?.(snapshot) || {
        route:
          {
            left: "ГОСТЬ ОСТАВЛЕН ДО ВОЗВРАЩЕНИЯ КУРАТОРА",
            given: "ПЕРЕДАН УПОЛНОМОЧЕННОМУ ВОЛОНТЁРУ",
            sea: "НАПРАВЛЕН НА МАРШРУТ: МОРЕ / 07",
            unassigned: "МАРШРУТ НЕ НАЗНАЧЕН",
            guarded: "НАБЛЮДЕНИЕ ПРОДОЛЖЕНО. ВЫХОД НЕ ИСПОЛЬЗОВАН",
            replacement: "СМЕНА ПЕРЕДАНА АНИМАТОРУ В ЗАЛЕ",
          }[snapshot.receiptVariant] || "—",
        reaction: "",
        loraLine: "",
        stamp: "КАССА КК-312 // НОЧНАЯ СМЕНА",
      };
    const lines = [
      "Объект: Красная Комната",
      "Сотрудник: не установлен",
      "Посетителей принято: 3",
      `Маршрутов назначено: ${parts.route}`,
      "Ответственность: принята",
    ];
    if (parts.reaction) lines.push(parts.reaction);
    if (parts.loraLine) {
      lines.push("На обороте рукой Лоры:", parts.loraLine);
    }
    return {
      title: "КВИТАНЦИЯ ВРЕМЕННОГО ЗАМЕЩЕНИЯ",
      lines,
      stamp: parts.stamp,
    };
  };

  const buildQuietSleepCopy = (snapshot = {}) => {
    const page = loraContent()?.quietSleepPageFor?.(snapshot);
    if (!page) return null;
    return {
      title: page.title || "СТРАНИЦА",
      lines: page.lines,
      stamp: page.stamp || "",
    };
  };

  const getOperatorUsefulness = (profile, progress, lora) => {
    if (!profile) return { id: "undefined", label: "НЕ ОПРЕДЕЛЕНА" };
    if (profile.status === "screening" && !progress?.flags?.ageVerified) {
      return { id: "undefined", label: "НЕ ОПРЕДЕЛЕНА" };
    }
    const loraFlags = lora?.playerFlags || {};
    const pig = lora?.pigOutcome || null;
    const fox = lora?.foxOutcome || null;
    const dog = lora?.dogOutcome || null;
    const completedShift = Boolean(lora?.completed);
    const mixedShift =
      (pig === "hidden" && fox === "cooperated") ||
      (pig === "waiting" && fox === "cooperated") ||
      (pig === "traded" && dog === "given") ||
      Boolean(loraFlags.foxLied && loraFlags.foxCooperated);
    if (
      dog === "sea" ||
      pig === "reported" ||
      (completedShift && loraFlags.calledFoxEarly && dog === "given")
    ) {
      return { id: "watch", label: "ТРЕБУЕТ НАБЛЮДЕНИЯ" };
    }
    if (
      profile.reclassificationActive ||
      mixedShift ||
      fox === "lied" ||
      pig === "traded" ||
      pig === "denied"
    ) {
      return { id: "unstable", label: "НЕСТАБИЛЬНАЯ" };
    }
    if (profile.status === "completed" && (completedShift || progress?.status === "completed")) {
      return { id: "working", label: "РАБОЧАЯ" };
    }
    return { id: "forming", label: "ФОРМИРУЕТСЯ" };
  };

  const staffArtifacts = hydrateCatalog({
    ...(irinaCallContent.staffArtifacts || {}),
    [LORA_RECEIPT_ID]: {
      code: "RR-0391-01",
      title: "Квитанция ночной смены Красной Комнаты",
      type: "КАССОВЫЙ ДОКУМЕНТ",
      source: "КАФЕ «КРАСНАЯ КОМНАТА» // ВРЕМЕННОЕ ЗАМЕЩЕНИЕ",
      description:
        "Чек временного замещения стойки. Оборот заполнен от руки.",
    },
    [LORA_TOY_ID]: {
      code: "AVD-312-C",
      title: "Неваляшка с цепи",
      type: "ИЗЪЯТЫЙ ПРЕДМЕТ",
      source: "КАФЕ «КРАСНАЯ КОМНАТА» // НОЧНАЯ СМЕНА",
      description:
        "Тяжёлая металлическая неваляшка на ржавой цепи. Внутри пахнет жжёным сахаром и хлоркой. В протоколе адептов числится как кадило. Гость в костюме Свиньи отдал её за стойкой.",
      src: "assets/staff/documents/adepts-nevalyashka.jpg",
      alt: "Ржавая неваляшка на цепи в архивном кабинете",
      downloadName: "AVD-312-C-NEVALYASHKA.jpg",
    },
    [LORA_PAGE_ID]: {
      code: "RR-0391-02",
      title: "Страница Тихого сна",
      type: "БУМАЖНЫЙ АРТЕФАКТ",
      source: "КАФЕ «КРАСНАЯ КОМНАТА» // НОЧНАЯ СМЕНА",
      description:
        "Отдельная бумажная страница, оставленная после смены. Текст назначается по результату замещения.",
    },
  });
  const curatorNodeArtifacts = {
    ...(irinaCallContent.nodeArtifacts || {}),
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
    routeMarks: [],
    sessionId: `0091-A-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    sessionNumber: Math.max(1, (readStaffProfile()?.sessions?.length || 0) + 1),
    updatedAt: Date.now(),
  });

  const getCuratorProgress = () => {
    try {
      const saved = dossierStore.readCurrentSession();
      if (!saved || saved.version !== 4 || saved.curatorId !== "0091-A") {
        return null;
      }

      saved.flags ||= {};
      saved.files = Array.isArray(saved.files) ? saved.files : [];
      saved.artifacts = Array.isArray(saved.artifacts) ? saved.artifacts : [];
      saved.routeMarks = Array.isArray(saved.routeMarks) ? saved.routeMarks : [];
      saved.sessionId ||= `0091-A-legacy-${saved.completedAt || saved.updatedAt || Date.now()}`;
      saved.sessionNumber ||= Math.max(
        1,
        (readStaffProfile()?.sessions?.length || 0) + (saved.status === "completed" ? 0 : 1)
      );
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
    displayName: "",
    nameHistory: [],
    avatarId: null,
    artifacts: [],
    sessions: [],
    messages: [],
    deletedItems: [],
    removedArtifactIds: [],
    removedMessageIds: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  });

  const normalizeStaffProfile = (profile) => {
    profile.displayName =
      typeof profile.displayName === "string"
        ? profile.displayName.slice(0, STAFF_DISPLAY_NAME_MAX)
        : "";
    profile.nameHistory = Array.isArray(profile.nameHistory)
      ? profile.nameHistory.filter((name) => typeof name === "string").slice(-8)
      : [];
    profile.avatarId = getStaffAvatarId(profile.avatarId);
    profile.artifacts = Array.isArray(profile.artifacts) ? profile.artifacts : [];
    profile.sessions = Array.isArray(profile.sessions) ? profile.sessions : [];
    profile.messages = Array.isArray(profile.messages) ? profile.messages : [];
    profile.deletedItems = Array.isArray(profile.deletedItems)
      ? profile.deletedItems
      : [];
    profile.removedArtifactIds = Array.isArray(profile.removedArtifactIds)
      ? profile.removedArtifactIds
      : [];
    profile.removedMessageIds = Array.isArray(profile.removedMessageIds)
      ? profile.removedMessageIds
      : [];
    const removedArtifacts = new Set(profile.removedArtifactIds);
    const removedMessages = new Set(profile.removedMessageIds);
    profile.artifacts = profile.artifacts.filter(
      (artifact) => !removedArtifacts.has(artifact.id)
    );
    profile.messages = profile.messages.filter(
      (message) => !removedMessages.has(message.id)
    );
    return profile;
  };

  const seedStaffMessages = (profile) => {
    normalizeStaffProfile(profile);
    const known = new Set(profile.messages.map((message) => message.id));
    const removed = new Set(profile.removedMessageIds);
    const artifactIds = new Set(profile.artifacts.map((artifact) => artifact.id));
    const requested = ["system-profile-created"];
    if (profile.status === "completed") requested.push("lora-red-room");
    if (artifactIds.has("ulybarych-broadcast")) {
      requested.push("ulybarych-after-broadcast");
    }
    const lora = readLoraSave();
    if (lora?.completed === true) {
      requested.push("fox-after-shift", "lora-after-shift");
    }

    requested.forEach((messageId, index) => {
      if (!staffMessages[messageId] || known.has(messageId) || removed.has(messageId)) {
        return;
      }
      profile.messages.push({
        id: messageId,
        deliveredAt: Date.now() + index,
        readAt: null,
      });
    });
    return profile;
  };

  const readLoraSave = () => {
    try {
      const saved = JSON.parse(window.localStorage.getItem(LORA_SAVE_KEY));
      if (!saved || saved.version !== 1) return null;
      return saved;
    } catch {
      return null;
    }
  };

  const claimLoraShiftArtifacts = (profile) => {
    if (!profile) return profile;
    const lora = readLoraSave();
    if (!lora) return profile;
    profile.artifacts = Array.isArray(profile.artifacts) ? profile.artifacts : [];
    profile.removedArtifactIds = Array.isArray(profile.removedArtifactIds)
      ? profile.removedArtifactIds
      : [];
    let dirty = false;
    const claim = (artifactId, extra = {}) => {
      if (!staffArtifacts[artifactId]) return;
      if (profile.removedArtifactIds.includes(artifactId)) return;
      const known = profile.artifacts.find((item) => item.id === artifactId);
      if (known) return;
      profile.artifacts.push({
        id: artifactId,
        sessionNumber: lora.playerFlags?.replayShift ? 2 : 1,
        obtainedAt: lora.updatedAt || Date.now(),
        replay: Boolean(lora.playerFlags?.replayShift),
        ...extra,
      });
      dirty = true;
    };
    if (lora.receiptVariant) {
      const snapshot =
        loraContent()?.buildReceiptCopy?.({
          receiptVariant: lora.receiptVariant,
          pigOutcome: lora.pigOutcome,
          foxOutcome: lora.foxOutcome,
          dogOutcome: lora.dogOutcome,
          replay: Boolean(lora.playerFlags?.replayShift),
        }) || {};
      claim(LORA_RECEIPT_ID, {
        variant: lora.receiptVariant,
        copyVariant: snapshot.copyVariant || null,
        pigOutcome: lora.pigOutcome || null,
        foxOutcome: lora.foxOutcome || null,
        dogOutcome: lora.dogOutcome || null,
        replay: Boolean(lora.playerFlags?.replayShift),
      });
    }
    if (lora.playerFlags?.pigToyTaken) {
      claim(LORA_TOY_ID, {
        replay: Boolean(lora.playerFlags?.replayShift),
      });
    }
    const giftPage = loraContent()?.quietSleepPageFor?.({
      receiptVariant: lora.receiptVariant,
      pigOutcome: lora.pigOutcome,
      foxOutcome: lora.foxOutcome,
      dogOutcome: lora.dogOutcome,
      replay: Boolean(lora.playerFlags?.replayShift),
    });
    if (giftPage) {
      claim(LORA_PAGE_ID, {
        giftVariant: giftPage.variant,
        copyVariant: giftPage.variant,
        replay: Boolean(lora.playerFlags?.replayShift),
      });
    }
    if (dirty) {
      profile.updatedAt = Date.now();
      dossierStore.saveDossier(profile);
    }
    return profile;
  };

  const readStaffProfile = () => {
    try {
      const profile = dossierStore.readDossier();
      if (!profile || profile.version !== 1 || profile.curatorId !== "0091-A") {
        return null;
      }

      return claimLoraShiftArtifacts(seedStaffMessages(profile));
    } catch {
      return null;
    }
  };

  const saveStaffProfile = (profile) => {
    profile.updatedAt = Date.now();
    dossierStore.saveDossier(profile);
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

    if ((progress?.routeMarks?.length || 0) >= 3) {
      artifactIds.add("damaged-child-file");
    }

    if ((progress?.routeMarks?.length || 0) >= 6) {
      artifactIds.add("lost-child-route-ticket");
    }

    if ((progress?.routeMarks?.length || 0) >= 9) {
      artifactIds.add("preserved-child-file");
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
      if ((progress?.routeMarks?.length || 0) >= 3) {
        artifactIds.add("damaged-child-file");
      }
      if ((progress?.routeMarks?.length || 0) >= 6) {
        artifactIds.add("lost-child-route-ticket");
      }
      if ((progress?.routeMarks?.length || 0) >= 9) {
        artifactIds.add("preserved-child-file");
      }
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
      profile.lastCompletedAt = progress.completedAt || Date.now();
      delete profile.reclassificationActive;

      const sessionRecord = {
        id: progress.sessionId,
        number: progress.sessionNumber || profile.sessions.length + 1,
        role: profile.role,
        routeMarks: progress.routeMarks?.length || 0,
        completedAt: progress.completedAt || Date.now(),
      };
      const sessionIndex = profile.sessions.findIndex(
        (session) => session.id === sessionRecord.id
      );
      if (sessionIndex >= 0) {
        profile.sessions[sessionIndex] = sessionRecord;
      } else {
        profile.sessions.push(sessionRecord);
      }
    } else if (!wasCompleted) {
      profile.status = progress.flags?.ageVerified ? "in_progress" : "screening";
    } else {
      profile.reclassificationActive = true;
    }

    const knownArtifacts = new Map(
      profile.artifacts.map((artifact) => [artifact.id, artifact])
    );
    const removedArtifactIds = new Set(profile.removedArtifactIds || []);
    getProgressArtifactIds(progress).forEach((artifactId) => {
      if (!knownArtifacts.has(artifactId) && !removedArtifactIds.has(artifactId)) {
        knownArtifacts.set(artifactId, {
          id: artifactId,
          sessionNumber: progress.sessionNumber || 1,
          obtainedAt: Date.now(),
        });
      }
    });
    profile.artifacts = [...knownArtifacts.values()];

    return saveStaffProfile(claimLoraShiftArtifacts(seedStaffMessages(profile)));
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
      dossierStore.removeDossier();
    } else if (profile.reclassificationActive) {
      delete profile.reclassificationActive;
      saveStaffProfile(profile);
    }
  };

  const readDossierAuthSession = () => {
    try {
      const session = JSON.parse(
        window.localStorage.getItem(DOSSIER_AUTH_SESSION_KEY)
      );
      if (
        !session ||
        session.version !== 1 ||
        typeof session.accessToken !== "string" ||
        !session.accessToken ||
        !Number.isFinite(session.expiresAt)
      ) {
        return null;
      }
      return session;
    } catch {
      return null;
    }
  };

  const hasActiveDossierAuthSession = () => {
    const session = readDossierAuthSession();
    return Boolean(session && session.expiresAt > Date.now() + 30_000);
  };

  const markDossierClaimOfferShown = (sessionId) => {
    window.localStorage.setItem(
      DOSSIER_CLAIM_OFFER_KEY,
      JSON.stringify({
        version: 1,
        sessionId,
        shownAt: Date.now(),
      })
    );
  };

  const wasDossierClaimOfferShown = (sessionId) => {
    try {
      const state = JSON.parse(
        window.localStorage.getItem(DOSSIER_CLAIM_OFFER_KEY)
      );
      return Boolean(state?.version === 1 && state.sessionId === sessionId);
    } catch {
      return false;
    }
  };

  let dossierClaimDialog;
  let dossierClaimPreviousFocus;
  let dossierAccessDialog;
  let dossierAccessPreviousFocus;

  const getDossierClaimDialog = () => {
    if (dossierClaimDialog?.isConnected) return dossierClaimDialog;

    dossierClaimDialog = document.createElement("dialog");
    dossierClaimDialog.className = "dossier-claim";
    dossierClaimDialog.setAttribute("aria-labelledby", "dossier-claim-title");
    dossierClaimDialog.innerHTML = `
      <div class="dossier-claim__panel">
        <header>
          <div>
            <p>TYNDEX HR // СИСТЕМА</p>
            <h2 id="dossier-claim-title">ЛИЧНОЕ ДЕЛО СФОРМИРОВАНО</h2>
          </div>
          <button type="button" data-claim-close aria-label="Закрыть">ЗАКРЫТЬ</button>
        </header>
        <section class="dossier-claim__intro" data-claim-intro>
          <p>
            Назначение и полученные материалы сохранены на этом устройстве.
            Локальная копия может быть утрачена.
          </p>
          <strong>ЗАКРЕПИТЬ ДЕЛО ЗА АДРЕСОМ ВОССТАНОВЛЕНИЯ?</strong>
          <div class="dossier-claim__actions">
            <button type="button" data-claim-start>ЗАКРЕПИТЬ ЛИЧНОЕ ДЕЛО</button>
            <button type="button" data-claim-local>ОСТАВИТЬ НА ЭТОМ УСТРОЙСТВЕ</button>
          </div>
        </section>
        <form class="dossier-claim__form" data-claim-form hidden>
          <label>
            АДРЕС ВОССТАНОВЛЕНИЯ
            <input
              type="email"
              name="email"
              inputmode="email"
              autocomplete="email"
              maxlength="254"
              required
              placeholder="operator@example.com"
            />
          </label>
          <p>
            Пароль не требуется. На этот адрес придёт одноразовая ссылка
            доступа. Ирина не увидит введённый адрес.
          </p>
          <div class="dossier-claim__actions">
            <button type="submit" data-claim-submit>ОТПРАВИТЬ ССЫЛКУ ДОСТУПА</button>
            <button type="button" data-claim-back>НАЗАД</button>
          </div>
        </form>
        <section class="dossier-claim__sent" data-claim-sent hidden>
          <strong>ССЫЛКА ДОСТУПА ОТПРАВЛЕНА</strong>
          <p>
            Откройте письмо на любом устройстве. Пока адрес не подтверждён,
            локальная копия продолжает работать без изменений.
          </p>
          <button type="button" data-claim-done>ПОНЯТНО</button>
        </section>
        <p
          class="dossier-claim__status"
          data-claim-status
          role="status"
          aria-live="polite"
        ></p>
      </div>
    `;
    body.append(dossierClaimDialog);

    const intro = dossierClaimDialog.querySelector("[data-claim-intro]");
    const form = dossierClaimDialog.querySelector("[data-claim-form]");
    const sent = dossierClaimDialog.querySelector("[data-claim-sent]");
    const emailInput = form.querySelector('input[name="email"]');
    const status = dossierClaimDialog.querySelector("[data-claim-status]");
    const submitButton = form.querySelector("[data-claim-submit]");
    const startButton = dossierClaimDialog.querySelector("[data-claim-start]");

    const showIntro = () => {
      intro.hidden = false;
      form.hidden = true;
      sent.hidden = true;
      status.textContent = "";
      startButton.focus();
    };

    const closeDialog = () => {
      if (dossierClaimDialog.open) dossierClaimDialog.close();
    };

    dossierClaimDialog
      .querySelector("[data-claim-close]")
      .addEventListener("click", closeDialog);
    dossierClaimDialog
      .querySelector("[data-claim-local]")
      .addEventListener("click", closeDialog);
    dossierClaimDialog
      .querySelector("[data-claim-done]")
      .addEventListener("click", closeDialog);
    dossierClaimDialog
      .querySelector("[data-claim-back]")
      .addEventListener("click", showIntro);
    startButton.addEventListener("click", () => {
      intro.hidden = true;
      form.hidden = false;
      sent.hidden = true;
      status.textContent = "";
      emailInput.focus();
    });

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (!form.reportValidity()) return;

      const dossier = readStaffProfile();
      const currentSession = getCuratorProgress();
      if (!dossier || dossier.status !== "completed") {
        status.textContent =
          "ЛИЧНОЕ ДЕЛО ЕЩЁ НЕ СФОРМИРОВАНО. ЗАВЕРШИТЕ НАЗНАЧЕНИЕ.";
        return;
      }

      submitButton.disabled = true;
      emailInput.disabled = true;
      status.textContent = "ФОРМИРОВАНИЕ ОДНОРАЗОВОЙ ССЫЛКИ…";

      try {
        const response = await window.fetch(DOSSIER_CLAIM_ENDPOINT, {
          method: "POST",
          headers: {
            apikey: SUPABASE_PUBLISHABLE_KEY,
            Authorization: `Bearer ${SUPABASE_PUBLISHABLE_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: emailInput.value.trim(),
            dossier,
            currentSession,
          }),
        });
        const result = await response.json().catch(() => ({}));

        if (response.ok && result.ok) {
          form.hidden = true;
          sent.hidden = false;
          status.textContent = "";
          emailInput.value = "";
          dossierClaimDialog
            .querySelector("[data-claim-done]")
            .focus();
          return;
        }

        status.textContent =
          response.status === 429
            ? "СЛИШКОМ МНОГО ЗАПРОСОВ. ПОВТОРИТЕ ПОЗЖЕ."
            : "ССЫЛКА НЕ СОЗДАНА. ПРОВЕРЬТЕ АДРЕС И ПОВТОРИТЕ.";
      } catch {
        status.textContent =
          "КАНАЛ НЕДОСТУПЕН. ЛОКАЛЬНАЯ КОПИЯ НЕ ИЗМЕНЕНА.";
      } finally {
        submitButton.disabled = false;
        emailInput.disabled = false;
      }
    });

    dossierClaimDialog.addEventListener("close", () => {
      form.reset();
      status.textContent = "";
      dossierClaimPreviousFocus?.focus?.();
    });

    return dossierClaimDialog;
  };

  const openDossierClaim = ({ automatic = false } = {}) => {
    const dossier = readStaffProfile();
    const currentSession = getCuratorProgress();
    if (!dossier || dossier.status !== "completed") return false;
    if (automatic && hasActiveDossierAuthSession()) return false;

    const sessionId =
      currentSession?.sessionId ||
      dossier.sessions?.at(-1)?.id ||
      "completed-dossier";
    if (automatic && wasDossierClaimOfferShown(sessionId)) return false;
    if (automatic) markDossierClaimOfferShown(sessionId);

    const dialog = getDossierClaimDialog();
    const intro = dialog.querySelector("[data-claim-intro]");
    const form = dialog.querySelector("[data-claim-form]");
    const sent = dialog.querySelector("[data-claim-sent]");
    const status = dialog.querySelector("[data-claim-status]");
    intro.hidden = false;
    form.hidden = true;
    sent.hidden = true;
    status.textContent = hasActiveDossierAuthSession()
      ? "АДРЕС ВОССТАНОВЛЕНИЯ УЖЕ ПОДТВЕРЖДЁН НА ЭТОМ УСТРОЙСТВЕ."
      : "";
    dossierClaimPreviousFocus = document.activeElement;
    dialog.showModal();
    dialog.querySelector("[data-claim-start]").focus();
    return true;
  };

  const getDossierAccessDialog = () => {
    if (dossierAccessDialog?.isConnected) return dossierAccessDialog;

    dossierAccessDialog = document.createElement("dialog");
    dossierAccessDialog.className = "dossier-claim";
    dossierAccessDialog.setAttribute("aria-labelledby", "dossier-access-title");
    dossierAccessDialog.innerHTML = `
      <div class="dossier-claim__panel">
        <header>
          <div>
            <p>TYNDEX HR // КАНАЛ ВОССТАНОВЛЕНИЯ</p>
            <h2 id="dossier-access-title">ВОССТАНОВЛЕНИЕ ЛИЧНОГО ДЕЛА</h2>
          </div>
          <button type="button" data-access-close aria-label="Закрыть">ЗАКРЫТЬ</button>
        </header>
        <form class="dossier-claim__form" data-access-form>
          <p>
            Повторное прохождение не требуется. Система отправит новую
            одноразовую ссылку для этого устройства.
          </p>
          <label>
            АДРЕС ВОССТАНОВЛЕНИЯ
            <input
              type="email"
              name="email"
              inputmode="email"
              autocomplete="email"
              maxlength="254"
              required
              placeholder="operator@example.com"
            />
          </label>
          <div class="dossier-claim__actions">
            <button type="submit" data-access-submit>ОТПРАВИТЬ ССЫЛКУ ДОСТУПА</button>
            <button type="button" data-access-cancel>ОТМЕНА</button>
          </div>
        </form>
        <section class="dossier-claim__sent" data-access-sent hidden>
          <strong>ССЫЛКА ДОСТУПА ОТПРАВЛЕНА</strong>
          <p>
            Откройте новое письмо на этом устройстве. Роль и материалы будут
            загружены из серверной кадровой базы.
          </p>
          <button type="button" data-access-done>ПОНЯТНО</button>
        </section>
        <p
          class="dossier-claim__status"
          data-access-status
          role="status"
          aria-live="polite"
        ></p>
      </div>
    `;
    body.append(dossierAccessDialog);

    const form = dossierAccessDialog.querySelector("[data-access-form]");
    const sent = dossierAccessDialog.querySelector("[data-access-sent]");
    const emailInput = form.querySelector('input[name="email"]');
    const status = dossierAccessDialog.querySelector("[data-access-status]");
    const submitButton = form.querySelector("[data-access-submit]");
    const closeDialog = () => {
      if (dossierAccessDialog.open) dossierAccessDialog.close();
    };

    dossierAccessDialog
      .querySelector("[data-access-close]")
      .addEventListener("click", closeDialog);
    dossierAccessDialog
      .querySelector("[data-access-cancel]")
      .addEventListener("click", closeDialog);
    dossierAccessDialog
      .querySelector("[data-access-done]")
      .addEventListener("click", closeDialog);

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (!form.reportValidity()) return;

      submitButton.disabled = true;
      emailInput.disabled = true;
      status.textContent = "ФОРМИРОВАНИЕ ОДНОРАЗОВОЙ ССЫЛКИ…";

      try {
        const response = await window.fetch(DOSSIER_ACCESS_ENDPOINT, {
          method: "POST",
          headers: {
            apikey: SUPABASE_PUBLISHABLE_KEY,
            Authorization: `Bearer ${SUPABASE_PUBLISHABLE_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: emailInput.value.trim(),
          }),
        });
        const result = await response.json().catch(() => ({}));

        if (response.ok && result.ok) {
          form.hidden = true;
          sent.hidden = false;
          status.textContent = "";
          emailInput.value = "";
          dossierAccessDialog
            .querySelector("[data-access-done]")
            .focus();
          return;
        }

        status.textContent =
          response.status === 429
            ? "СЛИШКОМ МНОГО ЗАПРОСОВ. ПОВТОРИТЕ ПОЗЖЕ."
            : "ССЫЛКА НЕ СОЗДАНА. ПРОВЕРЬТЕ АДРЕС И ПОВТОРИТЕ.";
      } catch {
        status.textContent =
          "КАНАЛ НЕДОСТУПЕН. ЛОКАЛЬНЫЕ ДАННЫЕ НЕ ИЗМЕНЕНЫ.";
      } finally {
        submitButton.disabled = false;
        emailInput.disabled = false;
      }
    });

    dossierAccessDialog.addEventListener("close", () => {
      form.reset();
      form.hidden = false;
      sent.hidden = true;
      status.textContent = "";
      dossierAccessPreviousFocus?.focus?.();
    });

    return dossierAccessDialog;
  };

  const openDossierAccess = () => {
    const dialog = getDossierAccessDialog();
    const form = dialog.querySelector("[data-access-form]");
    const sent = dialog.querySelector("[data-access-sent]");
    const status = dialog.querySelector("[data-access-status]");
    form.hidden = false;
    sent.hidden = true;
    status.textContent = "";
    dossierAccessPreviousFocus = document.activeElement;
    dialog.showModal();
    form.querySelector('input[name="email"]').focus();
  };

  const initDossierAccess = () => {
    const panel = document.querySelector("[data-dossier-access-panel]");
    const button = panel?.querySelector("[data-dossier-access]");
    if (!panel || !button || button.dataset.accessReady === "true") return;

    button.dataset.accessReady = "true";
    panel.hidden =
      Boolean(readStaffProfile()) || hasActiveDossierAuthSession();
    button.addEventListener("click", openDossierAccess);
  };

  const unlockCuratorArtifact = (progress, artifactId) => {
    if (!staffArtifacts[artifactId]) return;
    progress.artifacts ||= [];
    if (!progress.artifacts.includes(artifactId)) {
      progress.artifacts.push(artifactId);
    }
  };

  const getClassificationSignals = (progress) => {
    const flags = progress.flags || {};
    const decisions = [
      ["waiting", flags.waitedForParents || flags.calledAdult, flags.searchedForParents],
      ["route-image", flags.choseMascotFeed, flags.choseOpenDoorFeed],
      ["wristband", flags.reportedTomorrowBand, flags.followedTomorrowBand || flags.woreTomorrowBand],
      ["damaged-file", flags.entrustedDamagedFile, flags.tracedDamagedFile],
      ["ticket", flags.followedTerminalTicket || flags.gaveTicketToIrina, flags.comparedTerminalTicket || flags.inspectedTicketDestination],
      ["route-photo", flags.waitedAtPlayArea, flags.checkedEmptyPool],
      ["elena-one", flags.reportedElenaBroadcast || flags.calledIrinaDuringQuiz, flags.coveredElenaLens || flags.investigatedElenaBroadcast],
      ["elena-two", flags.answeredElena, flags.refusedElenaFormat || flags.closedElenaFeed],
      ["preservation", flags.leftFileInChannel, flags.requestedPaperPreservation],
      ["costume", flags.reportedCostume || flags.continuedRoute, flags.openedCostume],
      ["noise", flags.obeyedNoise, flags.askedAboutGuide || flags.lookedBehindIrina],
      ["empty-room", flags.silentForBear, flags.answeredBear],
    ];

    return decisions.reduce(
      (totals, [, animatorSignal, volunteerSignal]) => {
        if (animatorSignal && !volunteerSignal) totals.animator += 1;
        if (volunteerSignal && !animatorSignal) totals.volunteer += 1;
        return totals;
      },
      { animator: 0, volunteer: 0 }
    );
  };

  const isCloseClassification = (progress) => {
    const signals = getClassificationSignals(progress);
    return Math.abs(signals.animator - signals.volunteer) <= 1;
  };

  const getCuratorAssignment = (progress) => {
    if (["animator", "volunteer"].includes(progress.flags?.finalRoleChoice)) {
      return progress.flags.finalRoleChoice;
    }

    const signals = getClassificationSignals(progress);
    if (signals.animator === signals.volunteer) {
      if (progress.scores.curiosity !== progress.scores.obedience) {
        return progress.scores.curiosity > progress.scores.obedience
          ? "volunteer"
          : "animator";
      }
      if (progress.flags.choseAnimator || progress.flags.delegatedRole) {
        return "animator";
      }
      return "volunteer";
    }

    return signals.animator > signals.volunteer ? "animator" : "volunteer";
  };

  // Content module (call-content.js) resolves these through window.TyndexIrinaRuntime.
  window.TyndexIrinaRuntime = {
    readStaffProfile,
    getCuratorAssignment,
    getAssignmentCallbacks: null, // filled below
    isCloseClassification,
  };
  window.TyndexSiteFx = {
    enterStaff: enterStaffWithGlitch,
    exitStaff: () => applyMode(false),
    staffSessionKey: STAFF_SESSION_KEY,
  };

  const getAssignmentCallbacks = (progress, role) => {
    const animatorCallbacks = [
      [progress.flags.choseAnimator, "Ты сам назвал себя Аниматором."],
      [progress.flags.waitedForParents, "Ты решил ждать там, где тебя оставили."],
      [progress.flags.choseMascotFeed, "Ты выбрал коридор с Аниматорами."],
      [progress.flags.reportedTomorrowBand, "Завтрашний браслет ты отдал куратору."],
      [progress.flags.entrustedDamagedFile, "Повреждённое дело ты доверил куратору."],
      [progress.flags.followedTerminalTicket, "Ты согласился следовать напечатанному билету."],
      [progress.flags.gaveTicketToIrina, "Маршрутный билет ты передал мне."],
      [progress.flags.reportedElenaBroadcast, "Нарушение эфира ты решил оформить по правилам."],
      [progress.flags.answeredElena, "Ты ответил ведущей, когда формат потребовал ответа."],
      [progress.flags.leftFileInChannel, "Ты оставил дело там, куда его поместила система."],
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
      [progress.flags.tracedDamagedFile, "Ты решил восстановить маршрут отсутствующего ребёнка."],
      [progress.flags.comparedTerminalTicket, "Ты сверил билет с картой вместо того, чтобы следовать ему."],
      [progress.flags.inspectedTicketDestination, "Ты проверил скрытый номер назначения."],
      [progress.flags.coveredElenaLens, "Ты закрыл объектив архивной ведущей."],
      [progress.flags.investigatedElenaBroadcast, "Ты исследовал источник заражённого эфира."],
      [progress.flags.requestedPaperPreservation, "Ты попросил сохранить дело вне системы."],
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


  window.TyndexIrinaRuntime.getAssignmentCallbacks = getAssignmentCallbacks;
  const curatorNodes = irinaCallContent.nodes;
  const applyCuratorEffect = (progress, effect = {}) => {
    let routeMarkAwarded = false;
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

    if (effect.routeMark) {
      progress.routeMarks ||= [];
      if (!progress.routeMarks.includes(effect.routeMark)) {
        progress.routeMarks.push(effect.routeMark);
        routeMarkAwarded = true;
      }
    }

    if (progress.routeMarks.length >= 3) {
      unlockCuratorArtifact(progress, "damaged-child-file");
    }
    if (progress.routeMarks.length >= 6) {
      unlockCuratorArtifact(progress, "lost-child-route-ticket");
    }
    if (progress.routeMarks.length >= 9) {
      unlockCuratorArtifact(progress, "preserved-child-file");
    }

    return { routeMarkAwarded };
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
    const terminal = modal.querySelector("[data-curator-terminal]");
    const flash = modal.querySelector("[data-curator-flash]");
    const routeStamp = modal.querySelector("[data-curator-route-stamp]");
    const feed = modal.querySelector("[data-curator-feed]");
    const connecting = modal.querySelector("[data-curator-connecting]");
    const feedState = modal.querySelector("[data-curator-feed-state]");
    const speaker = modal.querySelector("[data-curator-speaker]");
    const transcript = modal.querySelector("[data-curator-text]");
    const transcriptPanel = transcript.closest(".curator-call__transcript");
    const choices = modal.querySelector("[data-curator-choices]");
    const step = modal.querySelector("[data-curator-step]");
    const marks = modal.querySelector("[data-curator-marks]");
    const saveState = modal.querySelector("[data-curator-save]");
    const signal = modal.querySelector("[data-curator-signal]");
    const sessionLabel = modal.querySelector("[data-curator-session]");
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
      "baby-cry-costume": {
        src: "assets/audio/curator/sfx/baby-cry-costume.mp3",
        volume: 0.82,
      },
      "disco-room-music": {
        src: "assets/audio/curator/sfx/disco-room-music.mp3",
        volume: 0.9,
      },
      "muffled-help": {
        src: "assets/audio/curator/sfx/muffled-help.mp3",
        volume: 0.88,
      },
      "plague-doctor-string-sting": {
        src: "assets/audio/curator/sfx/plague-doctor-string-sting.mp3",
        volume: 0.92,
      },
      "unknown-female-voice": {
        src: "assets/audio/curator/sfx/unknown-female-voice.mp3",
        volume: 0.92,
      },
      "elena-tick-loop": {
        src: `assets/audio/curator/sfx/elena-tick-loop.${ambientExtension}`,
        volume: 0.58,
      },
      "elena-breach-transition": {
        src: `assets/audio/curator/sfx/elena-breach-transition.${ambientExtension}`,
        volume: 0.68,
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
      sceneSound.loop = false;
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
      sceneSound.loop = Boolean(node.soundLoop);
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
      dossierStore.saveCurrentSession(progress);
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

    const updateRouteMarks = (nodeId = activeNodeId) => {
      const count = Math.min(9, progress.routeMarks?.length || 0);
      marks.hidden = count === 0 && nodeId !== "damaged-file-arrival";
      marks.textContent = `МЕТКИ МАРШРУТА ${count}/9`;
    };

    const triggerRouteMark = () => {
      const count = Math.min(9, progress.routeMarks?.length || 0);
      const thresholdLabels = {
        3: "МЕТКА 03 // ДЕЛО ДОБАВЛЕНО",
        6: "МЕТКА 06 // БИЛЕТ ДОБАВЛЕН",
        9: "МЕТКА 09 // ДЕЛО СОХРАНЕНО",
      };
      routeStamp.textContent =
        thresholdLabels[count] || `МЕТКА МАРШРУТА // ${String(count).padStart(2, "0")}`;
      routeStamp.hidden = false;
      routeStamp.classList.remove("is-active");
      void routeStamp.offsetWidth;
      routeStamp.classList.add("is-active");
      playCallTone(880, 0.075);
      window.setTimeout(() => playCallTone(660, 0.055), 90);
      window.setTimeout(() => {
        routeStamp.classList.remove("is-active");
        routeStamp.hidden = true;
      }, reducedMotion ? 80 : 780);
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
        resumeButton.textContent = "ЗАПРОСИТЬ ПОВТОРНУЮ КЛАССИФИКАЦИЮ";
        result.textContent = `СЕАНС ${String(saved.sessionNumber || 1).padStart(
          2,
          "0"
        )} ЗАВЕРШЁН // НАЗНАЧЕНИЕ: ${roleLabel}`;
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
      dossierStore.removeCurrentSession();
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
      window.setTimeout(
        () => openDossierClaim({ automatic: true }),
        reducedMotion ? 0 : 180
      );
    };

    const applyMedia = (node, onEnd) => {
      video.pause();
      video.onended = null;
      room.hidden = true;
      still.hidden = true;
      terminal.hidden = true;
      video.hidden = false;
      feed.classList.remove("is-document", "is-archive", "is-cctv");
      if (node.feedMode) {
        feed.classList.add(`is-${node.feedMode}`);
      }
      feed.classList.toggle("is-glitching", Boolean(node.glitchIn));

      window.setTimeout(() => {
        feed.classList.remove("is-glitching");
      }, 520);

      if (node.terminal) {
        video.hidden = true;
        terminal.hidden = false;
        onEnd?.();
        return;
      }

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
      if (node.input?.kind === "displayName") {
        choices.classList.remove("has-images");
        const form = document.createElement("form");
        const label = document.createElement("label");
        const labelText = document.createElement("span");
        const input = document.createElement("input");
        const submit = document.createElement("button");
        const status = document.createElement("p");
        const currentName = readStaffProfile()?.displayName || "";
        form.className = "curator-call__name-form";
        labelText.textContent = node.input.label;
        input.type = "text";
        input.name = "displayName";
        input.maxLength = STAFF_DISPLAY_NAME_MAX;
        input.autocomplete = "nickname";
        input.placeholder = node.input.placeholder;
        input.required = true;
        input.value = currentName;
        submit.type = "submit";
        submit.textContent = node.input.submitLabel;
        status.className = "curator-call__name-status";
        status.setAttribute("role", "status");
        status.setAttribute("aria-live", "polite");
        label.append(labelText, input);
        form.append(label, submit, status);
        form.addEventListener("submit", (event) => {
          event.preventDefault();
          const displayName = input.value
            .replace(/[\u0000-\u001f\u007f]/g, "")
            .trim()
            .replace(/\s+/g, " ")
            .slice(0, STAFF_DISPLAY_NAME_MAX);
          if (!displayName) {
            status.textContent = "ИМЯ НЕ ПРИНЯТО. ЗАПОЛНИТЕ СТРОКУ.";
            input.focus();
            return;
          }

          const profile = readStaffProfile() || createStaffProfile();
          if (
            profile.displayName &&
            profile.displayName.toLocaleLowerCase("ru-RU") !==
              displayName.toLocaleLowerCase("ru-RU")
          ) {
            profile.nameHistory.push(profile.displayName);
            profile.nameHistory = profile.nameHistory.slice(-8);
          }
          profile.displayName = displayName;
          saveStaffProfile(profile);
          progress.flags.nameProvided = true;
          saveProgress();
          input.disabled = true;
          submit.disabled = true;
          status.textContent = "ИМЯ ПРИНЯТО К ИСПОЛЬЗОВАНИЮ.";
          playCallTone();
          window.setTimeout(
            () => renderNode(node.input.next),
            reducedMotion ? 0 : 240
          );
        });
        choices.append(form);
        input.focus();
        input.select();
        return;
      }

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
            stopSceneSound();
            playCallTone();

            if (choice.reject) {
              rejectCall(choice.reject);
              return;
            }

            const effectResult = applyCuratorEffect(progress, choice.effect);
            if (effectResult.routeMarkAwarded) {
              updateRouteMarks();
              saveProgress();
              triggerRouteMark();
            }
            if (choice.downloadFile) {
              saveProgress();
              openFileViewer(choice.downloadFile, choice.next);
              return;
            }

            if (choice.complete) {
              completeCall();
              return;
            }

            window.setTimeout(
              () => renderNode(choice.next),
              effectResult.routeMarkAwarded && !reducedMotion ? 820 : 140
            );
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
      soundButton.classList.toggle(
        "is-tutorial-cue",
        nodeId === "sound-prompt" && !soundEnabled
      );
      if (curatorNodeArtifacts[nodeId]) {
        unlockCuratorArtifact(progress, curatorNodeArtifacts[nodeId]);
      }
      if (nodeId === "assignment") {
        progress.role = getCuratorAssignment(progress);
      }
      saveProgress();
      updateRouteMarks(nodeId);
      sessionLabel.innerHTML = `<i aria-hidden="true"></i> СЕАНС ${String(
        progress.sessionNumber || 1
      ).padStart(2, "0")}`;

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

    const openCall = ({ restart = false, reclassification = false } = {}) => {
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
      if (reclassification) {
        progress.node = "reclassification-entry";
        progress.flags.reclassification = true;
        progress.flags.ageVerified = true;
      }
      if (["sound-on-response", "sound-silent-response"].includes(progress.node)) {
        progress.node = "age-check";
      }
      if (["intro", "sound-prompt"].includes(progress.node)) {
        delete progress.flags.enabledSoundAtIntro;
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
      terminal.hidden = true;
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
        const isCompleted = getCuratorProgress()?.status === "completed";
        openCall({ restart: isCompleted, reclassification: isCompleted });
        return;
      }

      if (curatorId === LORA_CURATOR_ID) {
        result.style.whiteSpace = "pre-line";
        result.textContent = "КАНАЛ НАЗНАЧЕН\nМЕСТО НАЗНАЧЕНИЯ: КРАСНАЯ КОМНАТА";
        launchLoraShift();
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
      const isCompleted = getCuratorProgress()?.status === "completed";
      openCall({ restart: isCompleted, reclassification: isCompleted });
    });

    soundButton.addEventListener("click", () => {
      soundEnabled = !soundEnabled;
      soundButton.setAttribute("aria-pressed", String(soundEnabled));
      soundButton.textContent = soundEnabled ? "ЗВУК: ВКЛ" : "ЗВУК: ВЫКЛ";
      const isIntroSoundMoment = ["intro", "sound-prompt"].includes(progress.node);
      if (isIntroSoundMoment) {
        progress.flags.enabledSoundAtIntro = soundEnabled;
        if (soundEnabled) {
          delete progress.flags.keptIntroSilent;
        }
        saveProgress();
      }
      soundButton.classList.toggle(
        "is-tutorial-cue",
        progress.node === "sound-prompt" && !soundEnabled
      );
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
      if (progress.node === "sound-prompt") {
        window.setTimeout(
          () => renderNode(soundEnabled ? "sound-on-response" : "sound-prompt"),
          140
        );
      }
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

    const reclassificationRequest = new URLSearchParams(window.location.search).get(
      "reclassify"
    );
    if (
      reclassificationRequest === "0091-A" &&
      getCuratorProgress()?.status === "completed"
    ) {
      const cleanUrl = new URL(window.location.href);
      cleanUrl.searchParams.delete("reclassify");
      window.history.replaceState({}, "", cleanUrl);
      window.setTimeout(
        () => openCall({ restart: true, reclassification: true }),
        0
      );
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
    const playerCardName = grid.querySelector("[data-player-card-name]");
    const playerCardStatus = grid.querySelector("[data-player-card-status]");
    const playerCardAvatar = grid.querySelector("[data-player-card-avatar]");
    const dossierName = dossier.querySelector("[data-personnel-name]");
    const dossierRole = dossier.querySelector("[data-personnel-role]");
    const dossierStatus = dossier.querySelector("[data-personnel-status]");
    const dossierNote = dossier.querySelector("[data-personnel-note]");
    const dossierIdentity = dossier.querySelector(".personnel-dossier__identity");
    const dossierPlayerName = dossier.querySelector("[data-player-dossier-name]");
    const dossierNameOpen = dossier.querySelector("[data-player-name-open]");
    const dossierMetadata = dossier.querySelector("[data-player-dossier-metadata]");
    const dossierVisual = dossier.querySelector("[data-player-dossier-visual]");
    const dossierSignal = dossier.querySelector("[data-player-dossier-signal]");
    const dossierAvatar = dossier.querySelector("[data-player-dossier-avatar]");
    const dossierReviewBadge = dossier.querySelector("[data-player-review-badge]");
    const dossierUsefulnessBadge = dossier.querySelector("[data-player-usefulness-badge]");
    const dossierUsefulness = dossier.querySelector("[data-player-usefulness]");
    const dossierCuratorId = dossier.querySelector("[data-player-curator-id]");
    const dossierClearance = dossier.querySelector("[data-player-clearance]");
    const dossierLastRecord = dossier.querySelector("[data-player-last-record]");
    const dossierIntegrity = dossier.querySelector("[data-player-integrity]");
    const dossierIntegrityState = dossier.querySelector("[data-player-integrity-state]");
    const dossierChannelState = dossier.querySelector("[data-player-channel-state]");
    const summaryTabs = dossier.querySelector("[data-player-summary-tabs]");
    const dossierHeaderImage = dossier.querySelector("[data-personnel-header-image]");
    const employeeActions = dossier.querySelector("[data-personnel-employee-actions]");
    const profilePanel = dossier.querySelector("[data-personnel-profile]");
    const settingsToggle = dossier.querySelector("[data-player-settings-toggle]");
    const settingsPanel = dossier.querySelector("[data-player-settings-panel]");
    const profileMain = dossier.querySelector("[data-player-profile-main]");
    const documentLink = dossier.querySelector("[data-personnel-document]");
    const documentUnavailable = dossier.querySelector("[data-personnel-document-unavailable]");
    const requestIdButton = dossier.querySelector("[data-personnel-request-id]");
    const idResponse = dossier.querySelector("[data-personnel-id-response]");
    const useIdLink = dossier.querySelector("[data-personnel-use-id]");
    const resumeLink = dossier.querySelector("[data-player-resume]");
    const reclassifyLink = dossier.querySelector("[data-player-reclassify]");
    const claimButton = dossier.querySelector("[data-player-claim]");
    const nameForm = dossier.querySelector("[data-player-name-form]");
    const nameInput = nameForm?.elements.displayName;
    const nameState = dossier.querySelector("[data-player-name-state]");
    const nameResponse = dossier.querySelector("[data-player-name-response]");
    const profileTabs = [...dossier.querySelectorAll("[data-player-tab]")];
    const profileViews = [...dossier.querySelectorAll("[data-player-view]")];
    const unreadCount = dossier.querySelector("[data-player-unread-count]");
    const trashCount = dossier.querySelector("[data-player-trash-count]");
    const inbox = dossier.querySelector("[data-player-inbox]");
    const inboxEmpty = dossier.querySelector("[data-player-inbox-empty]");
    const messageDetail = dossier.querySelector("[data-player-message-detail]");
    const messageAvatar = dossier.querySelector("[data-player-message-avatar]");
    const messageSender = dossier.querySelector("[data-player-message-sender]");
    const messageSubject = dossier.querySelector("[data-player-message-subject]");
    const messageBody = dossier.querySelector("[data-player-message-body]");
    const messageClose = dossier.querySelector("[data-player-message-close]");
    const messageAttachment = dossier.querySelector("[data-player-message-attachment]");
    const messageDelete = dossier.querySelector("[data-player-message-delete]");
    const materials = dossier.querySelector("[data-player-materials]");
    const materialsEmpty = dossier.querySelector("[data-player-materials-empty]");
    const identification = dossier.querySelector("[data-player-identification]");
    const identificationCopy = dossier.querySelector("[data-player-identification-copy]");
    const avatarResponse = dossier.querySelector("[data-player-avatar-response]");
    const trash = dossier.querySelector("[data-player-trash]");
    const trashEmptyCopy = dossier.querySelector("[data-player-trash-empty-copy]");
    const trashEmptyButton = dossier.querySelector("[data-player-trash-empty]");
    const intrusion = dossier.querySelector("[data-personnel-intrusion]");
    const closeButton = dossier.querySelector("[data-personnel-close]");
    const intrusionClose = dossier.querySelector("[data-personnel-intrusion-close]");
    const artifactClose = artifactDialog.querySelector("[data-artifact-close]");
    const artifactCopy = artifactDialog.querySelector("[data-artifact-copy]");
    const artifactDownload = artifactDialog.querySelector("[data-artifact-download]");
    const avatarClasses = [
      "personnel-avatar--pending",
      ...staffAvatarIds.map((avatarId) => `personnel-avatar--${avatarId}`),
    ];
    let activePersonnelKey = null;
    let activeTrigger = null;
    let activeProfileTab = "inbox";
    let activeMessageId = null;
    let settingsOpen = false;

    const personnelIconMarkup = {
      settings:
        '<circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H2.8v-4H3a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-1.6v-.2h4V3a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v4H21a1.7 1.7 0 0 0-1.6 1Z"></path>',
      back: '<path d="M19 12H5M11 18l-6-6 6-6"></path>',
      restore:
        '<path d="M3 12a9 9 0 1 0 3-6.7"></path><path d="M3 4v6h6"></path>',
      trash:
        '<path d="M4 7h16M9 7V4h6v3M7 7l1 13h8l1-13M10 11v5M14 11v5"></path>',
    };

    const setPersonnelIconButton = (button, icon, label) => {
      if (!button || !personnelIconMarkup[icon]) return;
      button.classList.add("personnel-icon-button");
      button.setAttribute("aria-label", label);
      button.title = label;
      button.innerHTML = `<svg class="personnel-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${personnelIconMarkup[icon]}</svg>`;
    };

    const setSummaryChannel = () => {
      if (!dossierChannelState) return;
      dossierChannelState.textContent = settingsOpen
        ? "СЛУЖЕБНЫЕ НАСТРОЙКИ"
        : {
            inbox: "ВХОДЯЩИЕ",
            materials: "АРХИВ МАТЕРИАЛОВ",
            trash: "УДАЛЁННЫЕ ЗАПИСИ",
          }[activeProfileTab] || "ВХОДЯЩИЕ";
    };

    const setSettingsOpen = (open) => {
      settingsOpen = Boolean(open && activePersonnelKey === "player");
      settingsPanel.hidden = !settingsOpen;
      profileMain.hidden = settingsOpen;
      summaryTabs.hidden = settingsOpen || activePersonnelKey !== "player";
      dossierNote.hidden = !settingsOpen && activePersonnelKey === "player";
      settingsToggle.setAttribute("aria-expanded", String(settingsOpen));
      setSummaryChannel();
      setPersonnelIconButton(
        settingsToggle,
        settingsOpen ? "back" : "settings",
        settingsOpen ? "Назад к личному делу" : "Настройки личного дела"
      );
    };

    const setAvatarAppearance = (element, avatarId) => {
      if (!element) return;
      const resolvedAvatarId = getStaffAvatarId(avatarId);
      element.classList.remove(...avatarClasses);
      element.classList.add(
        `personnel-avatar--${resolvedAvatarId || "pending"}`
      );
      if (element instanceof HTMLImageElement) {
        if (resolvedAvatarId) {
          element.src = staffAvatarSources[resolvedAvatarId];
        } else {
          element.removeAttribute("src");
        }
      }
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

    const getProfilePrimaryStatus = (profile) => {
      if (profile.status === "completed") return "ДОПУЩЕН";
      return profile.status === "in_progress"
        ? "КУРАТОРСКАЯ ПРОВЕРКА"
        : "ПРОВЕРКА ДОПУСКА";
    };

    const getProfileRole = (profile) => {
      if (profile.role === "volunteer") return "ВОЛОНТЁР";
      if (profile.role === "animator") return "АНИМАТОР";
      return "НЕ НАЗНАЧЕНА";
    };

    const getProfileName = (profile) =>
      profile.displayName?.trim()
        ? profile.displayName.trim().toLocaleUpperCase("ru-RU")
        : "ИМЯ НЕ УСТАНОВЛЕНО";

    const formatDossierTimestamp = (value) => {
      const timestamp = new Date(value);
      if (!Number.isFinite(timestamp.getTime())) return "—";
      return new Intl.DateTimeFormat("ru-RU", {
        day: "2-digit",
        month: "2-digit",
        year: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      })
        .format(timestamp)
        .replace(",", "");
    };

    const isDeleted = (profile, kind, id) =>
      profile.deletedItems.some(
        (item) => item.kind === kind && item.id === id
      );

    const renderPlayerCard = () => {
      const profile = getStaffProfile();
      if (!profile) {
        playerCard.hidden = true;
        return null;
      }

      playerCard.hidden = false;
      playerCardName.textContent = getProfileName(profile);
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
        .filter((storedArtifact) => !isDeleted(profile, "artifact", storedArtifact.id))
        .map((storedArtifact) => ({
          stored: storedArtifact,
          definition: staffArtifacts[storedArtifact.id],
        }))
        .filter(({ definition }) => definition);

      materialsEmpty.hidden = registered.length > 0;
      registered.forEach(({ stored, definition }) => {
        const entry = document.createElement("article");
        const button = document.createElement("button");
        const remove = document.createElement("button");
        const image = document.createElement("img");
        const code = document.createElement("span");
        const title = document.createElement("strong");
        const type = document.createElement("small");
        entry.className = "personnel-material-entry";
        button.type = "button";
        button.className = "personnel-material";
        button.dataset.artifactOpen = stored.id;
        image.src =
          definition.src || audioAsset("assets/staff/logo.png");
        image.alt = "";
        code.textContent = `ФАЙЛ: ${definition.code}`;
        title.textContent = definition.title;
        type.textContent = definition.type;
        remove.type = "button";
        remove.className =
          "personnel-material-entry__delete personnel-icon-button personnel-icon-button--danger";
        remove.dataset.artifactDelete = stored.id;
        setPersonnelIconButton(
          remove,
          "trash",
          `Переместить материал «${definition.title}» в корзину`
        );
        button.append(image, code, title, type);
        entry.append(button, remove);
        materials.append(entry);
      });
    };

    const renderInbox = (profile) => {
      inbox.innerHTML = "";
      const visibleMessages = profile.messages
        .filter((message) => !isDeleted(profile, "message", message.id))
        .filter((message) => staffMessages[message.id])
        .sort((left, right) => right.deliveredAt - left.deliveredAt);
      const unread = visibleMessages.filter((message) => !message.readAt).length;
      inboxEmpty.hidden = visibleMessages.length > 0;
      unreadCount.textContent = unread ? `●${unread}` : "";

      visibleMessages.forEach((message) => {
        const definition = staffMessages[message.id];
        const button = document.createElement("button");
        const avatar = document.createElement("img");
        const copy = document.createElement("span");
        const sender = document.createElement("strong");
        const subject = document.createElement("span");
        const preview = document.createElement("small");
        const mark = document.createElement("span");
        button.type = "button";
        button.className = "personnel-inbox-item";
        button.dataset.messageOpen = message.id;
        button.dataset.unread = String(!message.readAt);
        button.setAttribute("aria-expanded", "false");
        avatar.src = definition.avatar;
        avatar.alt = "";
        copy.className = "personnel-inbox-item__copy";
        sender.textContent = definition.sender;
        subject.textContent = definition.subject;
        preview.textContent = definition.preview;
        mark.className = "personnel-inbox-item__mark";
        mark.textContent = message.readAt ? "" : "●";
        copy.append(sender, subject, preview);
        button.append(avatar, copy, mark);
        inbox.append(button);
      });
    };

    const closeMessage = () => {
      activeMessageId = null;
      messageDetail.hidden = true;
      messageAttachment.hidden = true;
      delete messageAttachment.dataset.artifactOpen;
      inbox.querySelectorAll("[data-message-open]").forEach((button) => {
        button.setAttribute("aria-expanded", "false");
      });
    };

    const renderMessage = (profile, messageId) => {
      const message = profile.messages.find((item) => item.id === messageId);
      const definition = staffMessages[messageId];
      if (!message || !definition || isDeleted(profile, "message", messageId)) {
        closeMessage();
        return;
      }

      activeMessageId = messageId;
      messageAvatar.src = definition.avatar;
      messageAvatar.alt = `Аватар отправителя ${definition.sender}`;
      messageSender.textContent = definition.sender;
      messageSubject.textContent = definition.subject;
      messageBody.textContent =
        typeof definition.body === "function"
          ? definition.body(profile, {
              lora: readLoraSave() || {},
              artifact: profile.artifacts.find((item) => item.id === LORA_RECEIPT_ID) || null,
            })
          : definition.body;
      messageAttachment.hidden = !definition.attachmentArtifactId;
      if (definition.attachmentArtifactId) {
        messageAttachment.dataset.artifactOpen =
          definition.attachmentArtifactId;
      } else {
        delete messageAttachment.dataset.artifactOpen;
      }
      inbox.querySelectorAll("[data-message-open]").forEach((button) => {
        button.setAttribute(
          "aria-expanded",
          String(button.dataset.messageOpen === messageId)
        );
      });
      const activeMessageButton = [...inbox.querySelectorAll("[data-message-open]")]
        .find((button) => button.dataset.messageOpen === messageId);
      activeMessageButton?.after(messageDetail);
      messageDetail.hidden = false;
    };

    const renderTrash = (profile) => {
      trash.innerHTML = "";
      trashEmptyCopy.hidden = profile.deletedItems.length > 0;
      trashEmptyButton.hidden = profile.deletedItems.length === 0;
      trashCount.textContent = profile.deletedItems.length
        ? `●${profile.deletedItems.length}`
        : "";

      profile.deletedItems
        .slice()
        .sort((left, right) => right.deletedAt - left.deletedAt)
        .forEach((item) => {
          const definition =
            item.kind === "message"
              ? staffMessages[item.id]
              : staffArtifacts[item.id];
          if (!definition) return;
          const row = document.createElement("article");
          const image = document.createElement("img");
          const copy = document.createElement("div");
          const title = document.createElement("strong");
          const kind = document.createElement("span");
          const actions = document.createElement("div");
          const restore = document.createElement("button");
          const remove = document.createElement("button");
          row.className = "personnel-trash-item";
          image.src =
            item.kind === "message"
              ? definition.avatar
              : definition.src || audioAsset("assets/staff/logo.png");
          image.alt = "";
          copy.className = "personnel-trash-item__copy";
          title.textContent =
            item.kind === "message" ? definition.subject : definition.title;
          kind.textContent =
            item.kind === "message" ? "СООБЩЕНИЕ" : "МАТЕРИАЛ";
          actions.className = "personnel-trash-item__actions";
          restore.type = "button";
          restore.className = "personnel-icon-button";
          restore.dataset.trashRestore = `${item.kind}:${item.id}`;
          setPersonnelIconButton(restore, "restore", `Восстановить «${title.textContent}»`);
          remove.type = "button";
          remove.className =
            "personnel-icon-button personnel-icon-button--danger";
          remove.dataset.trashRemove = `${item.kind}:${item.id}`;
          remove.dataset.iconLabel = `Удалить «${title.textContent}» навсегда`;
          setPersonnelIconButton(remove, "trash", remove.dataset.iconLabel);
          copy.append(title, kind);
          actions.append(restore, remove);
          row.append(image, copy, actions);
          trash.append(row);
        });
    };

    const setActiveProfileTab = (tab, profile) => {
      const availableTab = profileTabs.some(
        (button) => button.dataset.playerTab === tab
      )
        ? tab
        : "inbox";
      activeProfileTab = availableTab;
      profileTabs.forEach((button) => {
        button.setAttribute(
          "aria-pressed",
          String(button.dataset.playerTab === availableTab)
        );
      });
      profileViews.forEach((view) => {
        view.hidden = view.dataset.playerView !== availableTab;
      });
      setSummaryChannel();
    };

    const renderProfileCollections = (profile) => {
      renderInbox(profile);
      renderMaterials(profile);
      renderTrash(profile);
      setActiveProfileTab(activeProfileTab, profile);
      if (activeMessageId) renderMessage(profile, activeMessageId);
    };

    const renderPlayerDossier = (profile) => {
      const profileName = getProfileName(profile);
      const primaryStatus = getProfilePrimaryStatus(profile);
      const fileComplete = Boolean(
        profile.status === "completed" &&
        profile.displayName?.trim() &&
        profile.avatarId
      );
      const integrityState = fileComplete
        ? "stable"
        : profile.status === "completed"
          ? "incomplete"
          : "forming";
      const integrityLabel =
        integrityState === "stable"
          ? "СТАБИЛЬНА"
          : integrityState === "incomplete"
            ? "НЕПОЛНАЯ"
            : "ФОРМИРУЕТСЯ";

      dossier.classList.add("personnel-dossier--player");
      dossierName.textContent = profileName;
      dossierPlayerName.textContent = profileName;
      dossierRole.textContent = getProfileRole(profile);
      dossierStatus.textContent = primaryStatus;
      const usefulness = getOperatorUsefulness(profile, getCuratorProgress(), readLoraSave());
      if (dossierUsefulnessBadge) dossierUsefulnessBadge.hidden = false;
      if (dossierUsefulness) dossierUsefulness.textContent = usefulness.label;
      dossierNameOpen.hidden = false;
      dossierMetadata.hidden = false;
      dossierVisual.hidden = false;
      dossierReviewBadge.hidden = !profile.reclassificationActive;
      dossierCuratorId.textContent = profile.curatorId || "0091-A";
      dossierClearance.textContent = primaryStatus;
      dossierLastRecord.textContent = formatDossierTimestamp(profile.updatedAt);
      dossierIntegrity.dataset.state = integrityState;
      dossierIntegrityState.textContent = integrityLabel;
      dossierIntegrity.setAttribute(
        "aria-label",
        `Целостность файла: ${integrityLabel.toLocaleLowerCase("ru-RU")}`
      );
      dossierNote.textContent =
        profile.status === "completed"
          ? "Личное дело сформировано. Назначение и полученные материалы сохранены кадровой системой."
          : profile.status === "in_progress"
            ? "Собеседование не завершено. Последний подтверждённый этап доступен для возобновления."
            : "Личное дело создано автоматически при установке связи с назначенным куратором.";
      dossierHeaderImage.hidden = true;
      dossierHeaderImage.removeAttribute("src");
      dossierHeaderImage.alt = "";
      dossierIdentity.classList.add("personnel-dossier__identity--player");
      dossierSignal.hidden = false;
      setAvatarAppearance(dossierAvatar, profile.avatarId);
      employeeActions.hidden = true;
      profilePanel.hidden = false;
      settingsToggle.hidden = false;
      setSettingsOpen(settingsOpen);
      const progress = getCuratorProgress();
      resumeLink.hidden = progress?.status !== "in_progress";
      reclassifyLink.hidden =
        profile.status !== "completed" || progress?.status === "in_progress";
      if (claimButton) {
        claimButton.hidden =
          profile.status !== "completed" || hasActiveDossierAuthSession();
      }
      nameInput.value = profile.displayName || "";
      nameState.textContent = profile.displayName
        ? "ЗАРЕГИСТРИРОВАНО"
        : "НЕ УСТАНОВЛЕНО";
      nameResponse.textContent = "";

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
      renderProfileCollections(profile);
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
      settingsOpen = false;
      intrusion.hidden = true;
      useIdLink.hidden = true;
      idResponse.textContent = "";

      if (profile) {
        renderPlayerDossier(profile);
      } else {
        dossier.classList.remove("personnel-dossier--player");
        dossierIdentity.classList.remove("personnel-dossier__identity--player");
        dossierNameOpen.hidden = true;
        dossierMetadata.hidden = true;
        dossierVisual.hidden = true;
        dossierSignal.hidden = true;
        dossierReviewBadge.hidden = true;
        if (dossierUsefulnessBadge) dossierUsefulnessBadge.hidden = true;
        summaryTabs.hidden = true;
        settingsToggle.hidden = true;
        settingsPanel.hidden = true;
        profileMain.hidden = false;
        dossierNote.hidden = false;
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

      const storedReceipt = readStaffProfile()?.artifacts?.find(
        (item) => item.id === artifactId
      );
      const lora = readLoraSave();
      const snapshot = {
        receiptVariant:
          storedReceipt?.variant || storedReceipt?.receiptVariant || lora?.receiptVariant,
        pigOutcome: storedReceipt?.pigOutcome || lora?.pigOutcome,
        foxOutcome: storedReceipt?.foxOutcome || lora?.foxOutcome,
        dogOutcome: storedReceipt?.dogOutcome || lora?.dogOutcome,
        replay: Boolean(storedReceipt?.replay || lora?.playerFlags?.replayShift),
        giftVariant: storedReceipt?.giftVariant,
      };
      const receiptCopy =
        artifactId === LORA_RECEIPT_ID
          ? buildLoraReceiptCopy(snapshot)
          : artifactId === LORA_PAGE_ID
            ? buildQuietSleepCopy({
                ...snapshot,
                receiptVariant: snapshot.giftVariant || snapshot.receiptVariant,
              })
            : definition.copy;
      renderArtifactCopy(artifactCopy, receiptCopy);
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

    const moveProfileItemToTrash = (kind, id) => {
      const profile = readStaffProfile();
      if (!profile || isDeleted(profile, kind, id)) return;
      const exists =
        kind === "message"
          ? profile.messages.some((message) => message.id === id)
          : profile.artifacts.some((artifact) => artifact.id === id);
      if (!exists) return;
      profile.deletedItems.push({
        kind,
        id,
        deletedAt: Date.now(),
      });
      saveStaffProfile(profile);
      if (kind === "message" && activeMessageId === id) closeMessage();
      renderPlayerCard();
      renderPlayerDossier(profile);
    };

    const restoreProfileItem = (kind, id) => {
      const profile = readStaffProfile();
      if (!profile) return;
      profile.deletedItems = profile.deletedItems.filter(
        (item) => !(item.kind === kind && item.id === id)
      );
      saveStaffProfile(profile);
      renderPlayerCard();
      renderPlayerDossier(profile);
    };

    const removeProfileItemPermanently = (kind, id) => {
      const profile = readStaffProfile();
      if (!profile) return;
      profile.deletedItems = profile.deletedItems.filter(
        (item) => !(item.kind === kind && item.id === id)
      );
      if (kind === "message") {
        profile.messages = profile.messages.filter((message) => message.id !== id);
        if (!profile.removedMessageIds.includes(id)) {
          profile.removedMessageIds.push(id);
        }
      } else {
        profile.artifacts = profile.artifacts.filter(
          (artifact) => artifact.id !== id
        );
        if (!profile.removedArtifactIds.includes(id)) {
          profile.removedArtifactIds.push(id);
        }
      }
      saveStaffProfile(profile);
      renderPlayerCard();
      renderPlayerDossier(profile);
    };

    grid.querySelectorAll("[data-personnel-open]").forEach((button) => {
      button.addEventListener("click", () => {
        openPersonnelDossier(button.dataset.personnelOpen, button);
      });
    });

    closeButton.addEventListener("click", () => dossier.close());
    settingsToggle.addEventListener("click", () => {
      setSettingsOpen(!settingsOpen);
      if (settingsOpen) {
        nameInput.focus();
      } else {
        profileTabs.find((button) =>
          button.dataset.playerTab === activeProfileTab
        )?.focus();
      }
    });
    dossierNameOpen.addEventListener("click", () => {
      setSettingsOpen(true);
      nameInput.focus();
    });
    dossier.addEventListener("close", () => {
      intrusion.hidden = true;
      activeTrigger?.focus?.();
    });

    requestIdButton.addEventListener("click", async () => {
      const record = staffDirectory[activePersonnelKey];
      if (!record || requestIdButton.disabled) return;

      if (record.curatorId) {
        try {
          await copyText(record.curatorId);
          idResponse.textContent =
            `СЛУЖЕБНЫЙ ID: ${record.curatorId} // СКОПИРОВАН В БУФЕР`;
        } catch {
          idResponse.textContent =
            `СЛУЖЕБНЫЙ ID: ${record.curatorId} // КОПИРОВАНИЕ НЕДОСТУПНО`;
        }
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
      const remove = event.target.closest("[data-artifact-delete]");
      if (remove) {
        moveProfileItemToTrash("artifact", remove.dataset.artifactDelete);
        return;
      }
      const button = event.target.closest("[data-artifact-open]");
      if (button) openArtifact(button.dataset.artifactOpen);
    });

    profileTabs.forEach((button) => {
      button.addEventListener("click", () => {
        const profile = readStaffProfile();
        if (!profile) return;
        setActiveProfileTab(button.dataset.playerTab, profile);
      });
    });

    inbox.addEventListener("click", (event) => {
      const button = event.target.closest("[data-message-open]");
      if (!button) return;
      const profile = readStaffProfile();
      const message = profile?.messages.find(
        (item) => item.id === button.dataset.messageOpen
      );
      if (!profile || !message) return;
      if (!message.readAt) {
        message.readAt = Date.now();
        saveStaffProfile(profile);
      }
      renderInbox(profile);
      renderMessage(profile, message.id);
    });

    messageClose.addEventListener("click", closeMessage);
    messageDelete.addEventListener("click", () => {
      if (activeMessageId) {
        moveProfileItemToTrash("message", activeMessageId);
      }
    });
    messageAttachment.addEventListener("click", () => {
      const artifactId = messageAttachment.dataset.artifactOpen;
      if (artifactId) openArtifact(artifactId);
    });

    trash.addEventListener("click", (event) => {
      const restore = event.target.closest("[data-trash-restore]");
      const remove = event.target.closest("[data-trash-remove]");
      const token = restore?.dataset.trashRestore || remove?.dataset.trashRemove;
      if (!token) return;
      const separator = token.indexOf(":");
      const kind = token.slice(0, separator);
      const id = token.slice(separator + 1);
      if (restore) {
        restoreProfileItem(kind, id);
      } else {
        if (remove.dataset.confirming !== "true") {
          remove.dataset.confirming = "true";
          remove.textContent = "ПОДТВЕРДИТЬ";
          remove.setAttribute("aria-label", "Подтвердить окончательное удаление");
          window.setTimeout(() => {
            if (!remove.isConnected) return;
            remove.dataset.confirming = "false";
            setPersonnelIconButton(
              remove,
              "trash",
              remove.dataset.iconLabel || "Удалить навсегда"
            );
          }, 8000);
          return;
        }
        removeProfileItemPermanently(kind, id);
      }
    });

    trashEmptyButton.addEventListener("click", () => {
      if (trashEmptyButton.dataset.confirming !== "true") {
        trashEmptyButton.dataset.confirming = "true";
        trashEmptyButton.textContent = "ПОДТВЕРДИТЬ ОЧИСТКУ";
        window.setTimeout(() => {
          if (!trashEmptyButton.isConnected) return;
          trashEmptyButton.dataset.confirming = "false";
          trashEmptyButton.textContent = "ОЧИСТИТЬ";
        }, 8000);
        return;
      }
      const profile = readStaffProfile();
      if (!profile) return;
      profile.deletedItems.slice().forEach((item) => {
        if (item.kind === "message") {
          profile.messages = profile.messages.filter(
            (message) => message.id !== item.id
          );
          if (!profile.removedMessageIds.includes(item.id)) {
            profile.removedMessageIds.push(item.id);
          }
        } else {
          profile.artifacts = profile.artifacts.filter(
            (artifact) => artifact.id !== item.id
          );
          if (!profile.removedArtifactIds.includes(item.id)) {
            profile.removedArtifactIds.push(item.id);
          }
        }
      });
      profile.deletedItems = [];
      trashEmptyButton.dataset.confirming = "false";
      trashEmptyButton.textContent = "ОЧИСТИТЬ";
      saveStaffProfile(profile);
      renderPlayerCard();
      renderPlayerDossier(profile);
    });

    artifactClose.addEventListener("click", () => artifactDialog.close());

    claimButton?.addEventListener("click", () => {
      openDossierClaim();
    });

    nameForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const profile = readStaffProfile();
      const displayName = nameInput.value
        .replace(/[\u0000-\u001f\u007f]/g, "")
        .trim()
        .replace(/\s+/g, " ")
        .slice(0, STAFF_DISPLAY_NAME_MAX);
      if (!profile || !displayName) {
        nameResponse.textContent = "УКАЖИТЕ ИМЯ ДЛЯ СЛУЖЕБНОЙ ЗАПИСИ.";
        return;
      }
      if (
        profile.displayName &&
        profile.displayName.toLocaleLowerCase("ru-RU") !==
          displayName.toLocaleLowerCase("ru-RU")
      ) {
        profile.nameHistory.push(profile.displayName);
        profile.nameHistory = profile.nameHistory.slice(-8);
      }
      profile.displayName = displayName;
      saveStaffProfile(profile);
      renderPlayerCard();
      renderPlayerDossier(profile);
      nameResponse.textContent = "ИМЯ ПРИНЯТО К ИСПОЛЬЗОВАНИЮ.";
    });

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

  const initAssetClassifier = () => {
    const classifier = document.querySelector("[data-asset-classifier]");
    if (!classifier || classifier.dataset.assetClassifierReady === "true") return;

    const recordsContainer = classifier.querySelector("[data-asset-records]");
    const records = [...classifier.querySelectorAll("[data-asset-record]")];
    const status = classifier.querySelector("[data-asset-status]");
    const position = classifier.querySelector("[data-asset-position]");
    const toolbar = classifier.querySelector("[data-asset-toolbar]");
    const progress = classifier.querySelector("[data-asset-progress]");
    const catalog = classifier.querySelector("[data-asset-catalog]");
    const catalogToggle = classifier.querySelector("[data-asset-catalog-toggle]");
    const actions = classifier.querySelector("[data-asset-actions]");
    const previousButton = classifier.querySelector("[data-asset-previous]");
    const nextButton = classifier.querySelector("[data-asset-next]");
    const announcer = classifier.querySelector("[data-asset-announcer]");

    if (
      !recordsContainer ||
      records.length === 0 ||
      !status ||
      !position ||
      !toolbar ||
      !progress ||
      !catalog ||
      !catalogToggle ||
      !actions ||
      !previousButton ||
      !nextButton
    ) {
      return;
    }

    classifier.dataset.assetClassifierReady = "true";
    recordsContainer.classList.add("is-enhanced");
    recordsContainer.tabIndex = 0;
    recordsContainer.setAttribute("aria-label", "Просмотр глав ориентационной кассеты");
    status.hidden = false;
    toolbar.hidden = false;
    actions.hidden = false;
    progress.max = String(records.length);

    const savedRecord = Number.parseInt(localStorage.getItem(ABOUT_ASSET_RECORD_KEY) || "1", 10);
    let currentIndex = Number.isFinite(savedRecord)
      ? Math.min(records.length - 1, Math.max(0, savedRecord - 1))
      : 0;
    let touchStart = null;

    const recordDisclosures = records.map((record, index) => {
      const image = record.querySelector(":scope > img");
      const heading = record.querySelector(":scope > h3");
      const description = record.querySelector(":scope > p");
      if (!image || !heading || !description) return null;

      const title = heading.textContent?.replace(/\s+/g, " ").trim() || `Запись ${index + 1}`;
      const detailsId = `asset-record-details-${index + 1}`;
      const mediaButton = document.createElement("button");
      const meta = document.createElement("span");
      const visibleTitle = document.createElement("span");
      const cue = document.createElement("span");
      const details = document.createElement("div");

      mediaButton.className = "asset-record__media";
      mediaButton.type = "button";
      mediaButton.setAttribute("aria-expanded", "false");
      mediaButton.setAttribute("aria-controls", detailsId);
      mediaButton.setAttribute("aria-label", `Открыть карточку: ${title}`);

      meta.className = "asset-record__meta";
      meta.textContent = `ГЛАВА ${String(index + 1).padStart(2, "0")} // ДОПУСК ЗЕЛЁНЫЙ`;
      visibleTitle.className = "asset-record__visible-title";
      visibleTitle.textContent = title;
      cue.className = "asset-record__cue";
      cue.textContent = "[ ПОКАЗАТЬ ТИТРЫ ]";

      image.replaceWith(mediaButton);
      mediaButton.append(image, meta, visibleTitle, cue);

      details.className = "asset-record__details";
      details.id = detailsId;
      details.hidden = true;
      heading.classList.add("visually-hidden");
      details.append(heading, description);
      mediaButton.after(details);

      const setOpen = (isOpen) => {
        details.hidden = !isOpen;
        record.classList.toggle("is-details-open", isOpen);
        mediaButton.setAttribute("aria-expanded", String(isOpen));
        mediaButton.setAttribute(
          "aria-label",
          `${isOpen ? "Скрыть" : "Открыть"} карточку: ${title}`
        );
        cue.textContent = isOpen ? "[ СКРЫТЬ ТИТРЫ ]" : "[ ПОКАЗАТЬ ТИТРЫ ]";
      };

      mediaButton.addEventListener("click", () => {
        setOpen(mediaButton.getAttribute("aria-expanded") !== "true");
      });

      return { setOpen };
    });

    const closeCatalog = () => {
      catalog.hidden = true;
      catalogToggle.setAttribute("aria-expanded", "false");
      catalogToggle.textContent = "[ СОДЕРЖАНИЕ ]";
    };

    const catalogButtons = records.map((record, index) => {
      const heading = record.querySelector("h3");
      const label = heading?.textContent?.replace(/\s+/g, " ").trim() || `Запись ${index + 1}`;
      const recordId = `asset-record-${index + 1}`;
      const button = document.createElement("button");

      record.id = recordId;
      button.type = "button";
      button.textContent = `${String(index + 1).padStart(2, "0")} // ${label}`;
      button.setAttribute("aria-controls", recordId);
      button.addEventListener("click", () => {
        renderRecord(index);
        closeCatalog();
        catalogToggle.focus();
      });
      catalog.append(button);
      return button;
    });

    const renderRecord = (nextIndex, announce = true) => {
      currentIndex = Math.min(records.length - 1, Math.max(0, nextIndex));
      const activeRecord = records[currentIndex];
      const activeHeading =
        activeRecord.querySelector("h3")?.textContent?.replace(/\s+/g, " ").trim() ||
        `Запись ${currentIndex + 1}`;
      const positionLabel = `${String(currentIndex + 1).padStart(2, "0")} / ${String(
        records.length
      ).padStart(2, "0")}`;

      recordDisclosures.forEach((disclosure) => disclosure?.setOpen(false));
      records.forEach((record, index) => {
        record.hidden = index !== currentIndex;
      });
      catalogButtons.forEach((button, index) => {
        if (index === currentIndex) {
          button.setAttribute("aria-current", "true");
        } else {
          button.removeAttribute("aria-current");
        }
      });

      position.textContent = positionLabel;
      progress.value = String(currentIndex + 1);
      progress.setAttribute("aria-valuetext", `${positionLabel}: ${activeHeading}`);
      previousButton.disabled = currentIndex === 0;
      nextButton.disabled = currentIndex === records.length - 1;
      localStorage.setItem(ABOUT_ASSET_RECORD_KEY, String(currentIndex + 1));

      if (announce && announcer) {
        announcer.textContent = `Глава ${currentIndex + 1} из ${records.length}: ${activeHeading}`;
      }
    };

    catalogToggle.addEventListener("click", () => {
      const shouldOpen = catalog.hidden;
      catalog.hidden = !shouldOpen;
      catalogToggle.setAttribute("aria-expanded", String(shouldOpen));
      catalogToggle.textContent = shouldOpen ? "[ ЗАКРЫТЬ СОДЕРЖАНИЕ ]" : "[ СОДЕРЖАНИЕ ]";
      if (shouldOpen) {
        catalogButtons[currentIndex]?.scrollIntoView({ block: "nearest" });
      }
    });

    previousButton.addEventListener("click", () => renderRecord(currentIndex - 1));
    nextButton.addEventListener("click", () => renderRecord(currentIndex + 1));
    progress.addEventListener("input", () => renderRecord(Number(progress.value) - 1));

    recordsContainer.addEventListener(
      "touchstart",
      (event) => {
        if (event.touches.length !== 1) return;
        touchStart = {
          x: event.touches[0].clientX,
          y: event.touches[0].clientY,
        };
      },
      { passive: true }
    );

    recordsContainer.addEventListener(
      "touchend",
      (event) => {
        if (!touchStart || event.changedTouches.length !== 1) return;
        const deltaX = event.changedTouches[0].clientX - touchStart.x;
        const deltaY = event.changedTouches[0].clientY - touchStart.y;
        touchStart = null;

        if (Math.abs(deltaX) < 48 || Math.abs(deltaX) < Math.abs(deltaY) * 1.2) return;
        renderRecord(currentIndex + (deltaX < 0 ? 1 : -1));
      },
      { passive: true }
    );

    classifier.addEventListener("keydown", (event) => {
      if (event.target === progress) return;
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        renderRecord(currentIndex - 1);
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        renderRecord(currentIndex + 1);
      }
    });

    renderRecord(currentIndex, false);
  };

  const initStaffProtocolWarning = () => {
    const warning = document.querySelector("[data-staff-protocol-warning]");
    if (!warning || warning.dataset.staffProtocolWarningReady === "true") return;

    const toggle = warning.querySelector("[data-staff-protocol-warning-toggle]");
    const body = warning.querySelector("[data-staff-protocol-warning-body]");
    if (!toggle || !body) return;

    warning.dataset.staffProtocolWarningReady = "true";
    toggle.hidden = false;
    body.hidden = true;

    toggle.addEventListener("click", () => {
      const isOpen = toggle.getAttribute("aria-expanded") !== "true";
      toggle.setAttribute("aria-expanded", String(isOpen));
      toggle.textContent = isOpen ? "[ СКРЫТЬ ПРОТОКОЛ ]" : "[ ЧИТАТЬ ПОЛНОСТЬЮ ]";
      body.hidden = !isOpen;
      warning.classList.toggle("is-open", isOpen);
    });
  };

  const initArchiveCatalog = () => {
    const catalog = document.querySelector("[data-archive-catalog]");
    if (!catalog || catalog.dataset.archiveCatalogReady === "true") return;

    const tabs = [...catalog.querySelectorAll("[data-archive-tab]")];
    const panels = [...catalog.querySelectorAll("[data-archive-panel]")];
    const announcer = catalog.querySelector("[data-archive-announcer]");
    const validSections = tabs.map((tab) => tab.dataset.archiveTab);
    if (tabs.length === 0 || panels.length === 0) return;

    catalog.dataset.archiveCatalogReady = "true";

    const requestedSection = window.location.hash.replace(/^#/, "");
    const savedSection = localStorage.getItem(ARCHIVE_SECTION_KEY);
    let currentSection = validSections.includes(requestedSection)
      ? requestedSection
      : validSections.includes(savedSection)
        ? savedSection
        : validSections[0];

    const renderSection = (section, options = {}) => {
      if (!validSections.includes(section)) return;
      currentSection = section;

      tabs.forEach((tab) => {
        const isActive = tab.dataset.archiveTab === currentSection;
        tab.setAttribute("aria-selected", String(isActive));
        tab.tabIndex = isActive ? 0 : -1;
      });

      panels.forEach((panel) => {
        panel.hidden = panel.dataset.archivePanel !== currentSection;
      });

      localStorage.setItem(ARCHIVE_SECTION_KEY, currentSection);
      if (options.updateHash !== false) {
        window.history.replaceState(
          window.history.state,
          "",
          `${window.location.pathname}${window.location.search}#${currentSection}`
        );
      }

      if (options.announce !== false && announcer) {
        const activeTab = tabs.find((tab) => tab.dataset.archiveTab === currentSection);
        const label = activeTab?.querySelector("strong")?.textContent?.trim() || currentSection;
        announcer.textContent = `Открыта папка архива: ${label}`;
      }
    };

    tabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        renderSection(tab.dataset.archiveTab);
      });

      tab.addEventListener("keydown", (event) => {
        const currentIndex = tabs.indexOf(tab);
        let nextIndex = null;

        if (event.key === "ArrowLeft") nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
        if (event.key === "ArrowRight") nextIndex = (currentIndex + 1) % tabs.length;
        if (event.key === "Home") nextIndex = 0;
        if (event.key === "End") nextIndex = tabs.length - 1;
        if (nextIndex === null) return;

        event.preventDefault();
        const nextTab = tabs[nextIndex];
        renderSection(nextTab.dataset.archiveTab);
        nextTab.focus();
      });
    });

    renderSection(currentSection, { announce: false, updateHash: false });
  };

  const initMobileNavigation = () => {
    const nav = document.querySelector(".site-nav");
    if (!nav || nav.dataset.mobileNavReady === "true") return;

    nav.dataset.mobileNavReady = "true";
    const currentLink = nav.querySelector('[aria-current="page"]');

    const updateScrollCues = () => {
      const maxScroll = Math.max(0, nav.scrollWidth - nav.clientWidth);
      nav.classList.toggle("is-scroll-start", nav.scrollLeft <= 2);
      nav.classList.toggle("is-scroll-end", nav.scrollLeft >= maxScroll - 2);
    };

    nav.addEventListener("scroll", updateScrollCues, { passive: true });
    window.requestAnimationFrame(() => {
      if (window.matchMedia("(max-width: 640px)").matches && currentLink) {
        const targetLeft =
          currentLink.offsetLeft - Math.max(0, (nav.clientWidth - currentLink.offsetWidth) / 2);
        nav.scrollLeft = Math.max(0, targetLeft);
      }
      updateScrollCues();
    });
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
    initDossierAccess();
    initAssetClassifier();
    initStaffProtocolWarning();
    initArchiveCatalog();
    initMobileNavigation();
    initHiringThreshold();
    initStaffHomeNotice();
    initLoraRedRoom();
    updateCctvVideos(body.classList.contains("staff-mode"));
    syncModeLabel(body.classList.contains("staff-mode"));

    if (statusLabel && statusLabel.dataset.modeExitReady !== "true") {
      statusLabel.dataset.modeExitReady = "true";
      statusLabel.addEventListener("click", () => {
        exitStaffToGuest();
      });
      statusLabel.addEventListener("keydown", (event) => {
        if (event.key !== "Enter" && event.key !== " ") return;
        event.preventDefault();
        exitStaffToGuest();
      });
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

        document.querySelectorAll("[data-cctv-console]").forEach((consoleElement) => {
          stopCctvConsole(consoleElement);
        });

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

        await initEpisodeCatalogPage(response.url || url);
        await initRedRoomEspresso();
        await initLoraRedRoom();
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
    applyMode(resolveStaffMode());
    initDOMListeners();
  };

  init();
})();
