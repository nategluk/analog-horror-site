(() => {
  "use strict";

  const nodes = {
    "gate-night": {
      speaker: "СТРАЖ",
      text: "Сегодня пройти не получится, простите. \nМы на ремонте. Зачем вы пришли?",
      action: "Надо, наверное, ответить честно. ",
      media: {
        id: "gate-night",
        loop: true,
        src: "/assets/guest/locations/solnyshko/gate-closed-loop.mp4",
        poster: "/assets/guest/locations/solnyshko/gate-closed-loop_poster.webp",
        alt: "Ночные ворота парка Солнышко, за ними огни аттракционов",
      },
      mediaFallback: "Закрытые створки и цепь. Страж за решёткой. Парк светится за аркой.",
      choices: [
        { label: "Родители ждут внутри", next: "refuse-parents" },
        { label: "Хочу пострелять (в тире)", next: "refuse-shooting" },
        { label: "На вечеринку", next: "birthday-check" },
        {
          label: "Волонтер в парке",
          next: "volunteer-pass",
        },
      ],
    },
    "refuse-parents": {
      speaker: "СТРАЖ",
      text: "Тут никого нет. Уходите, пожалуйста",
      action: "Он постучал пальцем по замку, будто тот мог подтвердить отказ.",
      media: {
        id: "gate-refuse",
        loop: false,
        src: "/assets/guest/locations/solnyshko/gate-refuse.mp4",
        poster: "/assets/guest/locations/solnyshko/gate-refuse_poster.webp",
        playedFlag: "parentsRefusalPlayed",
        alt: "Закрытые ночные ворота парка Солнышко",
      },
      sound: "solnyshko.sfx.lock-finger-taps",
      mediaFallback: "Ладонь на замке. Створки не расходятся.",
      choices: [
        { label: "СПРОСИТЬ ДРУГОЕ", next: "gate-night" },
      ],
    },
    "refuse-shooting": {
      speaker: "СТРАЖ",
      text: "Тир спит. Призы тоже. Уходите!",
      action: "За воротами карусель сделала пол-оборота и притворилась, что её не было.",
      media: {
        id: "gate-refuse",
        loop: false,
        src: "/assets/guest/locations/solnyshko/gate-refuse.mp4",
        poster: "/assets/guest/locations/solnyshko/gate-refuse_poster.webp",
        playedFlag: "shootingRefusalPlayed",
        alt: "Закрытые ночные ворота парка Солнышко",
      },
      sound: "solnyshko.sfx.gate-chain",
      mediaFallback: "Тот же отказ: тир не зажигается, створки закрыты.",
      choices: [
        { label: "СКАЗАТЬ ДРУГОЕ", next: "gate-night" },
      ],
    },
    "birthday-check": {
      speaker: "СТРАЖ",
      text: "На какую дату была зарезервирована вечеринка?",
      action: "Ну да, точно, открытка. ",
      media: {
        id: "gate-wait",
        loop: true,
        src: "/assets/guest/locations/solnyshko/gate-closed-loop.mp4",
        poster: "/assets/guest/locations/solnyshko/gate-closed-loop_poster.webp",
        alt: "Страж у ночных ворот ждёт дату дня рождения",
      },
      mediaFallback: "Тот же порог. Страж ждёт пароль, не взгляд в глаза.",
      input: {
        prompt: "Проверь карманы!",
        placeholder: "",
        submit: "НАЗВАТЬ ДАТУ",
        fail: "БРОНЬ ОТСУТСТВУЕТ",
        next: "birthday-recorded",
      },
      choices: [
        {
          label: "ПРОВЕРИТЬ ОТКРЫТКУ",
          inspect: "artifact",
          artifactId: "animator-postcard",
          missing: "В ЛИЧНОМ ДЕЛЕ НЕТ ОТКРЫТКИ.",
        },
        { label: "ВЕРНУТЬСЯ К ПРИЧИНЕ", next: "gate-night" },
      ],
    },
    "birthday-recorded": {
      speaker: "СИСТЕМА",
      text: "ДАТА ПРИНЯТА.\nЛИЧНОЕ ДЕЛО НЕ НАЙДЕНО.\nВХОД ЗАРЕГИСТРИРОВАН.",
      media: {
        id: "gate-wait",
        loop: true,
        src: "/assets/guest/locations/solnyshko/gate-closed-loop.mp4",
        poster: "/assets/guest/locations/solnyshko/gate-closed-loop_poster.webp",
        alt: "Страж у ночных ворот регистрирует незаявленный вход",
      },
      mediaFallback: "Створки ещё закрыты. Система сохранила незаявленный вход.",
      choices: [
        {
          label: "ВОЙТИ",
          next: "park-grounds",
          set: { enteredAs: "birthday" },
        },
      ],
    },
    "volunteer-pass": {
      speaker: "СТРАЖ",
      text: "Чем докажешь?",
      action: "Страж протягивает ладонь через решётку.",
      media: {
        id: "gate-wait",
        loop: true,
        src: "/assets/guest/locations/solnyshko/gate-closed-loop.mp4",
        poster: "/assets/guest/locations/solnyshko/gate-closed-loop_poster.webp",
        alt: "Страж ждёт волонтёрскую листовку у закрытых ночных ворот",
      },
      mediaFallback: "Створки закрыты. Страж ждёт листовку через решётку.",
      choices: [
        {
          label: "ПРЕДЪЯВИТЬ ЛИСТОВКУ",
          inspect: "artifact",
          artifactId: "volunteer-leaflet",
          nextAfterInspect: "park-grounds",
          setAfterInspect: { enteredAs: "volunteer", leafletPresented: true },
          missing: "В ЛИЧНОМ ДЕЛЕ НЕТ ВОЛОНТЁРСКОЙ ЛИСТОВКИ.",
        },
        { label: "ВЕРНУТЬСЯ К ПРИЧИНЕ", next: "gate-night" },
      ],
    },
    "park-grounds": {
      speaker: "Я",
      text: "Говорят, солнце светит всем. Даже непослушным.",
      action: "Так много врачей! Говорят, они помогают тем, кого укачало.",
      media: {
        id: "park-wide",
        loop: true,
        src: "/assets/guest/locations/solnyshko/park-wide-15s.mp4",
        poster: "/assets/guest/locations/solnyshko/park-wide-15s_poster.webp",
        playEnterThenLoop: "/assets/guest/locations/solnyshko/gate-open-enter.mp4",
        alt: "Общий план ночного парка: карусели, туман и фигуры в белых халатах",
      },
      mediaFallback: "Ни одного ребенка",
      choices: [
        { label: "ПОДОЙТИ К ПУСТОЙ КАРУСЕЛИ", next: "empty-carousel" },
        { label: "ПРОВЕРИТЬ СТЕНД С САХАРНОЙ ВАТОЙ", next: "irina-found" },
      ],
    },
    "empty-carousel": {
      speaker: "Я",
      text: "Похоже на мультики из альманаха \"Тихая карусель\"",
      action: "Куда уходит детство? В какие города?",
      media: {
        id: "carousel-empty",
        loop: true,
        src: "/assets/guest/locations/solnyshko/carousel-empty-10s.mp4",
        poster: "/assets/guest/locations/solnyshko/carousel-empty-10s_poster.webp",
        alt: "Пустая ночная карусель без посетителей",
      },
      sound: "solnyshko.sfx.carousel-mechanism",
      mediaFallback: "Интересно, почему в этом парке совсем нет детей?",
      choices: [
        { label: "ВЕРНУТЬСЯ НА ДОРОЖКУ", next: "park-grounds" },
        { label: "ПРОВЕРИТЬ СТЕНД С САХАРНОЙ ВАТОЙ", next: "irina-found" },
      ],
    },
    "irina-found": {
      speaker: "ИРИНА В.",
      text: "О. Ты.",
      action: "Почему в этом мире все одержимы сахаром?",
      media: {
        id: "irina-cotton-a",
        loop: true,
        src: "/assets/guest/locations/solnyshko/irina-cotton-wait.mp4",
        poster: "/assets/guest/locations/solnyshko/irina-cotton-wait_poster.webp",
        alt: "Ирина у ночного стенда с сахарной ватой",
      },
      sound: "solnyshko.sfx.cotton-spinner",
      mediaFallback: "Ирина у полосатого ларька. \nСмотрит на дорожку.",
      choices: [
        { label: "ПОДОЙТИ", next: "irina-thanks" },
      ],
    },
    "irina-thanks": {
      speaker: "ИРИНА В.",
      text: "Спасибо, что пришёл. Я уже думала, что останусь как всегда одна.",
      action: "Она улыбается коротко, будто боится, что улыбка тоже служебная.",
      media: {
        id: "irina-cotton-b",
        loop: false,
        src: "/assets/guest/locations/solnyshko/irina-cotton-offer.mp4",
        poster: "/assets/guest/locations/solnyshko/irina-cotton-offer_poster.webp",
        playedFlag: "irinaOfferPlayed",
        alt: "Ирина протягивает сахарную вату",
      },
      mediaFallback: "Аниматор Ирина выглядит как обычно. \nПотерянной. ",
      choices: [
        { label: "СЛУШАТЬ ДАЛЬШЕ", next: "irina-tease" },
      ],
    },
    "irina-tease": {
      speaker: "ИРИНА В.",
      text: "Ты уже был в кабинке обозрения?",
      action: "Лора сказала, что на тебя можно положиться. \nТебе нужно освободить кота.",
      media: {
        id: "irina-cotton-c",
        loop: true,
        src: "/assets/guest/locations/solnyshko/irina-cotton-wait.mp4",
        poster: "/assets/guest/locations/solnyshko/irina-cotton-wait_poster.webp",
        alt: "Ирина говорит о Павле у стенда с ватой",
      },
      mediaFallback: "Но есть ли у меня выбор?",
      choices: [
        { label: "ПРИНЯТЬ ЗАДАЧУ", next: "unlock-id" },
      ],
    },
    "unlock-id": {
      speaker: "СИСТЕМА",
      text: "РАЗБЛОКИРОВАН НОВЫЙ ID СОТРУДНИКА",
      action: "Карточка Павла К. доступна в кадровом канале. ",
      popup: "unlock",
      media: {
        id: "irina-cotton-c",
        loop: true,
        src: "/assets/guest/locations/solnyshko/irina-cotton-wait.mp4",
        poster: "/assets/guest/locations/solnyshko/irina-cotton-wait_poster.webp",
        alt: "Системное уведомление поверх кадра с Ириной",
      },
      mediaFallback: "Всплывающее: новый ID анонсирован. Номер на карточке Павла, не здесь.",
      choices: [
        { label: "ОКЕЙ", next: "irina-hello" },
      ],
    },
    "irina-hello": {
      speaker: "ИРИНА В.",
      text: "Передавай Паше привет.",
      action: "Кто сказал, что аниматоры не грустят?",
      complete: true,
      media: {
        id: "irina-cotton-d",
        loop: true,
        src: "/assets/guest/locations/solnyshko/irina-cotton-lookaway.mp4",
        poster: "/assets/guest/locations/solnyshko/irina-cotton-lookaway_poster.webp",
        alt: "Ирина провожает взглядом от стенда с ватой",
      },
      mediaFallback: "Короткий жест на прощание. Дальше — кадровый канал.",
      choices: [
        {
          label: "ОКЕЙ",
          href: "../staff.html?personnel=pavel",
        },
        {
          label: "НАЧАТЬ НОВУЮ СМЕНУ",
          restart: true,
        },
      ],
    },
  };

  window.TyndexIrinaSolnyshkoContent = {
    version: 1,
    startNode: "gate-night",
    acceptedDates: ["12.08.26"],
    unlockNotice: {
      title: "РАЗБЛОКИРОВАН НОВЫЙ ID СОТРУДНИКА",
      body: "ПАВЕЛ К. // ОПЕРАТОР КАБИНОК ОБОЗРЕНИЯ\nНомер смотри в кадровом канале.",
      ok: "ОКЕЙ",
    },
    nodes,
  };
})();
