(() => {
  "use strict";

  const visuals = {
    GATE: {
      id: "GATE",
      alt: "Ночные ворота парка",
      neutral: {
        src: "../assets/guest/locations/solnyshko/gate-closed-loop.mp4",
        still: "../assets/guest/locations/solnyshko/gate-closed-loop_poster.webp",
      },
      fallback: {
        still: "../assets/guest/locations/solnyshko/gate-closed-loop_poster.webp",
      },
    },
    ENTER: {
      id: "ENTER",
      alt: "Вход за ворота",
      transition: {
        src: "../assets/guest/locations/solnyshko/gate-open-enter.mp4",
        startStill: "../assets/guest/locations/solnyshko/gate-closed-loop_poster.webp",
        holdStill: "../assets/guest/locations/solnyshko/park-wide-15s_poster.webp",
        playback: "one-shot",
        playedFlag: "enterPlayed",
      },
      neutral: {
        src: "../assets/guest/locations/solnyshko/park-wide-15s.mp4",
        still: "../assets/guest/locations/solnyshko/park-wide-15s_poster.webp",
      },
      fallback: {
        still: "../assets/guest/locations/solnyshko/park-wide-15s_poster.webp",
      },
    },
    NOTE: {
      id: "NOTE",
      alt: "Служебная записка",
      fallback: {
        still: "../assets/guest/locations/solnyshko/gate-closed-loop_poster.webp",
      },
    },
    BROKEN: {
      id: "BROKEN",
      alt: "Кадр с ошибкой media",
      neutral: {
        src: "../assets/guest/locations/solnyshko/missing-fixture.mp4",
        still: "../assets/guest/locations/solnyshko/gate-closed-loop_poster.webp",
      },
      fallback: {
        still: "../assets/guest/locations/solnyshko/gate-closed-loop_poster.webp",
      },
    },
  };

  window.TyndexGameUiFixtureContent = {
    version: 1,
    startNode: "gate",
    nodes: {
      gate: {
        kind: "dialogue",
        speaker: "СИСТЕМА",
        line: "Это kitchen-fixture, не сюжет. Четыре кнопки, живой кадр.",
        action: "Проверка оболочки. Смысл только в интерфейсе.",
        visual: "GATE",
        mediaRole: "neutral",
        bed: "empty",
        choices: [
          { label: "Это проверка?", variant: "speech", next: "thought" },
          { label: "СПРОСИТЬ", variant: "group", group: "ask" },
          { label: "Где выход?", variant: "speech", group: "ask", next: "note" },
          { label: "Что сломано?", variant: "speech", group: "ask", next: "broken" },
          { label: "ОТКРЫТЬ КАДР", variant: "action", next: "enter" },
          { label: "ЛИСТОВКА", variant: "item", next: "note" },
        ],
      },
      thought: {
        kind: "thought",
        speaker: "Я",
        line: "Это не парк. Это стенд кнопок и кадров.",
        visual: "GATE",
        mediaRole: "neutral",
        choices: [{ label: "ВЕРНУТЬСЯ", variant: "action", next: "gate" }],
      },
      note: {
        kind: "document",
        speaker: "ЗАПИСКА",
        line: "Replay чистит только ключ fixture. Другие игры не трогать.",
        visual: "NOTE",
        cue: "paper",
        choices: [{ label: "ВЕРНУТЬСЯ", variant: "action", next: "gate" }],
      },
      enter: {
        kind: "dialogue",
        speaker: "СИСТЕМА",
        line: "Переход идёт до конца ролика. Кнопки ждут ended.",
        visual: "ENTER",
        mediaRole: "transition",
        choicesAfterClip: true,
        choices: [
          { label: "Дальше система", variant: "action", next: "system" },
        ],
      },
      system: {
        kind: "system",
        speaker: "СИСТЕМА",
        line: "Смена сохранена. Можно начать заново.",
        visual: "ENTER",
        mediaRole: "neutral",
        complete: true,
        choices: [
          { label: "НАЧАТЬ ЗАНОВО", variant: "action", restart: true },
          { label: "К РЕКЛАМЕ", variant: "link", href: "solnyshko-park.html" },
        ],
      },
      broken: {
        kind: "dialogue",
        speaker: "СИСТЕМА",
        line: "Видео нет. Текст и кнопки должны остаться.",
        action: "Ожидаемый сбой media для QA.",
        visual: "BROKEN",
        mediaRole: "neutral",
        choices: [{ label: "ВЕРНУТЬСЯ", variant: "action", next: "gate" }],
      },
    },
    visuals,
  };
})();
