(() => {
  "use strict";

  const nodes = {
    "gate-night": {
      speaker: "СТРАЖ",
      text: "Парк закрыт. Ворота закрыты. Я тоже, в общем, закрыт. Зачем вы пришли?",
      action: "Ночь. Закрытые ворота. За решёткой ещё крутятся огни, как будто смена не заметила календарь.",
      media: {
        id: "gate-night",
        loop: true,
        src: "/assets/guest/locations/solnyshko/gate-closed-loop.mp4",
        poster: "/assets/guest/locations/solnyshko/gate-closed-loop_poster.webp",
        alt: "Ночные ворота парка Солнышко, за ними огни аттракционов",
      },
      mediaFallback: "Закрытые створки и цепь. Страж за решёткой. Парк светится за аркой.",
      choices: [
        { label: "Ищу своих родителей", next: "refuse-parents" },
        { label: "Хочу пострелять в тире", next: "refuse-shooting" },
        { label: "Я пришёл на день рождения", next: "birthday-check" },
        {
          label: "ВОЛОНТЁРСКИЙ ДОСТУП",
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
      text: "День рождения. Назовите пароль.",
      action: "Он ждёт точную дату с открытки, не объяснение.",
      media: {
        id: "gate-wait",
        loop: true,
        src: "/assets/guest/locations/solnyshko/gate-closed-loop.mp4",
        poster: "/assets/guest/locations/solnyshko/gate-closed-loop_poster.webp",
        alt: "Страж у ночных ворот ждёт дату дня рождения",
      },
      mediaFallback: "Тот же порог. Страж ждёт дату, не взгляд в глаза.",
      input: {
        prompt: "Пароль с открытки",
        placeholder: "ДД.ММ.ГГ",
        submit: "НАЗВАТЬ ПАРОЛЬ",
        fail: "Неверный пароль.",
        next: "park-grounds",
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
    "volunteer-pass": {
      speaker: "СТРАЖ",
      text: "Волонтёрский доступ. Предъявите листовку.",
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
      text: "Парк не закрылся. Он просто перестал притворяться дневным.",
      action: "Подташнивает. Тут всегда так много врачей? Говорят, они помогают тем, кого укачало.",
      media: {
        id: "park-wide",
        loop: true,
        src: "/assets/guest/locations/solnyshko/park-wide-15s.mp4",
        poster: "/assets/guest/locations/solnyshko/park-wide-15s_poster.webp",
        playEnterThenLoop: "/assets/guest/locations/solnyshko/gate-open-enter.mp4",
        alt: "Общий план ночного парка: карусели, туман и фигуры в белых халатах",
      },
      mediaFallback: "Общий план ночного парка: карусели, туман и фигуры в белых халатах.",
      choices: [
        { label: "ПОДОЙТИ К ПУСТОЙ КАРУСЕЛИ", next: "empty-carousel" },
        { label: "ПРОВЕРИТЬ СТЕНД С САХАРНОЙ ВАТОЙ", next: "irina-found" },
      ],
    },
    "empty-carousel": {
      speaker: "Я",
      text: "Похоже на мультики из альманаха \"Тихая карусель\"",
      action: "Десять секунд пустого круга. Куда уходит детство? В какие города?",
      media: {
        id: "carousel-empty",
        loop: true,
        src: "/assets/guest/locations/solnyshko/carousel-empty-10s.mp4",
        poster: "/assets/guest/locations/solnyshko/carousel-empty-10s_poster.webp",
        alt: "Пустая ночная карусель без посетителей",
      },
      sound: "solnyshko.sfx.carousel-mechanism",
      mediaFallback: "Пустая ночная карусель без посетителей.",
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
      mediaFallback: "Ирина замечает тебя и протягивает вату двумя руками.",
      choices: [
        { label: "СЛУШАТЬ ДАЛЬШЕ", next: "irina-tease" },
      ],
    },
    "irina-tease": {
      speaker: "ИРИНА В.",
      text: "Ты уже был в кабинке обозрения?",
      action: "Лора сказала, что на тебя можно положиться. Тебе нужно освободить кота.",
      media: {
        id: "irina-cotton-c",
        loop: true,
        src: "/assets/guest/locations/solnyshko/irina-cotton-wait.mp4",
        poster: "/assets/guest/locations/solnyshko/irina-cotton-wait_poster.webp",
        alt: "Ирина говорит о Павле у стенда с ватой",
      },
      mediaFallback: "Ирина у стенда с ватой ждёт ответа про кабинку.",
      choices: [
        { label: "ПРИНЯТЬ ЗАДАЧУ", next: "unlock-id" },
      ],
    },
    "unlock-id": {
      speaker: "СИСТЕМА",
      text: "РАЗБЛОКИРОВАН НОВЫЙ ID СОТРУДНИКА",
      action: "Карточка Павла К. доступна в кадровом канале. Сам номер там, не здесь.",
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
      action: "Она уже смотрит мимо тебя — туда, где кадровый канал громче карусели.",
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
