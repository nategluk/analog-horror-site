/**
 * Pavel observation booth — Stage 4 production script.
 *
 * Short beats: one speaker, one line, then a click. Same rhythm as the
 * curator call and the Red Room shift. Mechanical media IDs stay stable.
 * The observation booth is the central surveillance block, not «Иллюзион».
 *
 * Validate: node scripts/validate-pavel-observation-booth.js
 * Copy Desk id: pavel
 */
(() => {
  "use strict";

  const rooms = Object.freeze({
    control: Object.freeze({ id: "control" }),
    bedroom: Object.freeze({ id: "bedroom" }),
    bathroom: Object.freeze({ id: "bathroom" }),
    storage: Object.freeze({ id: "storage" }),
    hatch: Object.freeze({ id: "hatch" }),
  });

  const sounds = Object.freeze({
    "test-channel-static": Object.freeze({ id: "test-channel-static" }),
    "test-distant-laugh": Object.freeze({ id: "test-distant-laugh" }),
    "test-drain-hum": Object.freeze({ id: "test-drain-hum" }),
    "test-door": Object.freeze({ id: "test-door" }),
    "test-paper": Object.freeze({ id: "test-paper" }),
    "test-phone": Object.freeze({ id: "test-phone" }),
    "test-click": Object.freeze({ id: "test-click" }),
    "hatch-knock-3": Object.freeze({ id: "hatch-knock-3" }),
    "hatch-dessert-voice": Object.freeze({ id: "hatch-dessert-voice" }),
    "pavel-hm-question": Object.freeze({ id: "pavel-hm-question" }),
    "pavel-mm": Object.freeze({ id: "pavel-mm" }),
    "pavel-tired-exhale": Object.freeze({ id: "pavel-tired-exhale" }),
    "pavel-hmm": Object.freeze({ id: "pavel-hmm" }),
    "drain-pour": Object.freeze({ id: "drain-pour" }),
    "water-slide": Object.freeze({ id: "water-slide" }),
    "drain-voice-damp": Object.freeze({ id: "drain-voice-damp" }),
    "drain-voice-neighbors": Object.freeze({ id: "drain-voice-neighbors" }),
    "drain-voice-hair": Object.freeze({ id: "drain-voice-hair" }),
    "drain-voice-hairy-friend": Object.freeze({ id: "drain-voice-hairy-friend" }),
    "drain-voice-lucky": Object.freeze({ id: "drain-voice-lucky" }),
    "drain-voice-shift": Object.freeze({ id: "drain-voice-shift" }),
    "drain-voice-slide": Object.freeze({ id: "drain-voice-slide" }),
    "drain-voice-thirst": Object.freeze({ id: "drain-voice-thirst" }),
    "drain-voice-cleaner-request": Object.freeze({ id: "drain-voice-cleaner-request" }),
    "drain-voice-cleaner-delight": Object.freeze({ id: "drain-voice-cleaner-delight" }),
    "drain-voice-thanks-zone": Object.freeze({ id: "drain-voice-thanks-zone" }),
    "drain-voice-aromatization": Object.freeze({ id: "drain-voice-aromatization" }),
  });

  const visuals = Object.freeze({
    CONTROL_PAVEL_PRESENT: Object.freeze({ id: "CONTROL_PAVEL_PRESENT" }),
    CONTROL_EMPTY: Object.freeze({ id: "CONTROL_EMPTY" }),
    CONTROL_PAVEL_RIGHT: Object.freeze({ id: "CONTROL_PAVEL_RIGHT" }),
    CONTROL_RIGHT_DISABLED: Object.freeze({ id: "CONTROL_RIGHT_DISABLED" }),
    BEDROOM_BASE: Object.freeze({ id: "BEDROOM_BASE" }),
    DRAIN_BASE: Object.freeze({ id: "DRAIN_BASE" }),
    DRAIN_VAGUE: Object.freeze({ id: "DRAIN_VAGUE" }),
    DRAIN_BECKON: Object.freeze({ id: "DRAIN_BECKON" }),
    DRAIN_COUGH: Object.freeze({ id: "DRAIN_COUGH" }),
    DRAIN_HAIR_LONG: Object.freeze({ id: "DRAIN_HAIR_LONG" }),
    DRAIN_HUNGRY: Object.freeze({ id: "DRAIN_HUNGRY" }),
    STORAGE_BASE: Object.freeze({ id: "STORAGE_BASE" }),
    STORAGE_PROVISIONS: Object.freeze({ id: "STORAGE_PROVISIONS" }),
    STORAGE_CLEANER: Object.freeze({ id: "STORAGE_CLEANER" }),
    STORAGE_SLIDE: Object.freeze({ id: "STORAGE_SLIDE" }),
    STORAGE_ESCAPE: Object.freeze({ id: "STORAGE_ESCAPE" }),
    NIGHTSTAND_CASSETTE: Object.freeze({ id: "NIGHTSTAND_CASSETTE" }),
    SENIOR_GUIDE_SLIDE: Object.freeze({ id: "SENIOR_GUIDE_SLIDE" }),
    SLIDE_ESCAPE: Object.freeze({ id: "SLIDE_ESCAPE" }),
    HATCH_BASE: Object.freeze({ id: "HATCH_BASE" }),
    HATCH_CLOSED: Object.freeze({ id: "HATCH_CLOSED" }),
    HATCH_GASMASK: Object.freeze({ id: "HATCH_GASMASK" }),
    HATCH_DESSERT: Object.freeze({ id: "HATCH_DESSERT" }),
    HATCH_TOUR: Object.freeze({ id: "HATCH_TOUR" }),
  });

  const artifacts = Object.freeze({
    "test-cassette-slot": Object.freeze({ id: "test-cassette-slot" }),
    "test-tray-note": Object.freeze({ id: "test-tray-note" }),
  });

  const startNode = "booth-intro";

  const nodes = {
    "booth-intro": {
      room: "control",
      speaker: "ПАВЕЛ",
      text: "Я никого не ждал сегодня. ",
      visual: "CONTROL_PAVEL_PRESENT",
      sound: "test-channel-static",
      choicesAfterClip: true,
      choices: [
        {
          label: "Меня просили передать тебе \"привет\"",
          kind: "speech",
          next: "booth-intro-irina"
        }
      ]
    },
    "booth-intro-irina": {
      room: "control",
      speaker: "ПАВЕЛ",
      text: "Кто просил?",
      visual: "CONTROL_PAVEL_PRESENT",
      sound: "pavel-hm-question",
      choices: [
        {
          label: "Аниматор Ирина в костюме медведя",
          kind: "speech",
          next: "booth-intro-know-you"
        }
      ]
    },
    "booth-intro-know-you": {
      room: "control",
      speaker: "ПАВЕЛ",
      text: "Аниматор? Фу! Я ее не знаю. \nНо, мне кажется, я знаю тебя.",
      visual: "CONTROL_PAVEL_PRESENT",
      choices: [
        {
          label: "Не помню, что мы встречались.",
          kind: "speech",
          next: "booth-intro-red-room"
        },
        {
          label: "Ты выглядишь знакомо.",
          kind: "speech",
          next: "booth-intro-red-room"
        }
      ]
    },
    "booth-intro-red-room": {
      room: "control",
      speaker: "ПАВЕЛ",
      text: "Да! Точно! Я видел тебя в\nкафе «Красная Комната».",
      visual: "CONTROL_PAVEL_PRESENT",
      choices: [
        {
          label: "Когда ты меня видел?",
          kind: "speech",
          next: "booth-intro-red-room-look"
        }
      ]
    },
    "booth-intro-red-room-look": {
      room: "control",
      speaker: "ПАВЕЛ",
      text: "Да, это ты. \nТвое место было у шторы",
      visual: "CONTROL_PAVEL_PRESENT",
      choices: [
        {
          label: "Ты обознался",
          kind: "speech",
          next: "booth-intro-post"
        }
      ]
    },
    "booth-intro-post": {
      room: "control",
      speaker: "ПАВЕЛ",
      text: "Мне наконец подписали выходной. Пост нельзя оставлять пустым.",
      visual: "CONTROL_PAVEL_PRESENT",
      choices: [
        {
          label: "Почему нельзя?",
          kind: "speech",
          next: "booth-sound-ack",
          set: ["soundEnabled"]
        },
        {
          label: "И когда ты вернешься?",
          kind: "speech",
          next: "booth-sound-ack"
        }
      ]
    },
    "booth-sound-ack": {
      room: "control",
      speaker: "ПАВЕЛ",
      text: "Я на пару часов. Мне нужно в \nмедкорпус за лекарством",
      visual: "CONTROL_PAVEL_PRESENT",
      sound: "pavel-tired-exhale",
      choices: [
        {
          label: "Что за лекарство?",
          kind: "speech",
          next: "booth-sound-rule"
        }
      ]
    },
    "booth-sound-rule": {
      room: "control",
      speaker: "ПАВЕЛ",
      text: "Не важно. Ты скоро увидишь меня на экране.\nДважды. В третий раз это буду уже не я.  ",
      visual: "CONTROL_PAVEL_PRESENT",
      choices: [
        {
          label: "НАЧАТЬ ОБХОД",
          next: "tour-control"
        }
      ]
    },
    "tour-control": {
      room: "control",
      speaker: "ПАВЕЛ",
      text: "Быстренько пробежимся по комнатам. \nТут сложно потеряться. ",
      visual: "CONTROL_PAVEL_PRESENT",
      choices: [
        {
          label: "В СПАЛЬНЮ",
          next: "tour-bedroom"
        }
      ]
    },
    "tour-bedroom": {
      room: "bedroom",
      speaker: "ПАВЕЛ",
      text: "Скромненько, но чистенько. Пленку можешь оставить. \nОна мне не нужна больше",
      visual: "BEDROOM_BASE",
      imageAlt: "Служебная спальня с кроватью и закрытой прикроватной тумбочкой",
      choices: [
        {
          label: "Что на пленке?",
          kind: "speech",
          next: "tour-bedroom-sit"
        }
      ]
    },
    "tour-bedroom-sit": {
      room: "bedroom",
      speaker: "ПАВЕЛ",
      text: "Выходные я обычно провожу в Иллюзионе. Ты был там?",
      visual: "BEDROOM_BASE",
      imageAlt: "Служебная спальня с кроватью и закрытой прикроватной тумбочкой",
      choices: [
        {
          label: "БЫЛ",
          kind: "speech",
          next: "tour-illusion-yes"
        },
        {
          label: "НЕ БЫЛ",
          kind: "speech",
          next: "tour-illusion-no"
        }
      ]
    },
    "tour-illusion-yes": {
      room: "bedroom",
      speaker: "ПАВЕЛ",
      text: "Обожаю кино. Мне бы хотелось там жить. Внутри фильма",
      visual: "BEDROOM_BASE",
      imageAlt: "Служебная спальня с кроватью и закрытой прикроватной тумбочкой",
      choices: [
        {
          label: "Всё равно расскажи.",
          kind: "speech",
          next: "tour-illusion-cinema"
        }
      ]
    },
    "tour-illusion-no": {
      room: "bedroom",
      speaker: "ПАВЕЛ",
      text: "Лучшее место на земле. Обожаю!",
      visual: "BEDROOM_BASE",
      imageAlt: "Служебная спальня с кроватью и закрытой прикроватной тумбочкой",
      choices: [
        {
          label: "Это парк?",
          kind: "speech",
          next: "tour-illusion-cinema"
        }
      ]
    },
    "tour-illusion-cinema": {
      room: "bedroom",
      speaker: "ПАВЕЛ",
      text: "Это кинотеатр. Отец водил меня\nтуда часто, когда я был маленький. ",
      visual: "BEDROOM_BASE",
      imageAlt: "Служебная спальня с кроватью и закрытой прикроватной тумбочкой",
      choices: [
        {
          label: "На какой фильм?",
          kind: "speech",
          next: "tour-illusion-film"
        }
      ]
    },
    "tour-illusion-film": {
      room: "bedroom",
      speaker: "ПАВЕЛ",
      text: "Гарри Поттер. Мама тоже считала, что\nя особенный мальчик. Как сахарный агнец. ",
      visual: "BEDROOM_BASE",
      sound: "pavel-hmm",
      imageAlt: "Служебная спальня с кроватью и закрытой прикроватной тумбочкой",
      choices: [
        {
          label: "В САНУЗЕЛ",
          next: "tour-bathroom"
        }
      ]
    },
    "tour-bathroom": {
      room: "bathroom",
      speaker: "ПАВЕЛ",
      text: "Внизу просто трубы. \nЕсли загудят — игнорируй",
      visual: "DRAIN_BASE",
      imageAlt: "Старый круглый слив в полу служебного санузла",
      choices: [
        {
          label: "НА СКЛАД",
          next: "tour-storage"
        }
      ]
    },
    "tour-storage": {
      room: "storage",
      speaker: "ПАВЕЛ",
      text: "Любишь кукурузные хлопья? Я их с детства терпеть не могу",
      visual: "STORAGE_BASE",
      imageAlt: "Узкий служебный склад с банками, водой и сухими припасами на полках",
      choices: [
        {
          label: "СПРОСИТЬ ПОЧЕМУ",
          next: "tour-storage-cans",
          set: ["tourAskedCans"],
          hideIf: ["tourAskedCans"]
        },
        {
          label: "ПОЙТИ К ДВЕРИ",
          next: "tour-hatch"
        }
      ]
    },
    "tour-storage-cans": {
      room: "storage",
      speaker: "ПАВЕЛ",
      text: "Когда я был ребёнком, меня кормили через трубку.  \nС заботой не спорят.",
      visual: "STORAGE_PROVISIONS",
      imageAlt: "Банка с сухими шариками и бутылки воды на металлической полке",
      choices: [
        {
          label: "Это была забота?",
          kind: "speech",
          next: "tour-storage-home"
        }
      ]
    },
    "tour-storage-home": {
      room: "storage",
      speaker: "ПАВЕЛ",
      text: "Я уже не ребёнок. Но ем, что дают. \nПривычка на всю жизнь.  \n",
      visual: "STORAGE_PROVISIONS",
      imageAlt: "Банка с сухими шариками и бутылки воды на металлической полке",
      choices: [
        {
          label: "К ДВЕРИ",
          next: "tour-hatch"
        }
      ]
    },
    "tour-hatch": {
      room: "hatch",
      speaker: "ПАВЕЛ",
      text: "Они принесут тебе всё нужное.\nДаже просить не придётся.",
      visual: "HATCH_TOUR",
      imageAlt: "Закрытая служебная дверь с армированным стеклом, цепью и закрытым люком для подноса",
      choices: [
        {
          label: "К МОНИТОРАМ",
          next: "tour-return"
        }
      ]
    },
    "tour-return": {
      room: "control",
      speaker: "ПАВЕЛ",
      text: "Вот и всё. \nТеперь ты за меня.",
      visual: "CONTROL_PAVEL_PRESENT",
      choices: [
        {
          label: "Я ОСТАНУСЬ",
          kind: "speech",
          next: "slide-farewell-left",
          set: ["tourCompleted"]
        }
      ]
    },
    "control-laugh": {
      room: "control",
      speaker: "СИСТЕМА",
      text: "[ДАЛЁКИЙ ДЕТСКИЙ СМЕХ // СПАЛЬНЯ]",
      visual: "CONTROL_EMPTY",
      sound: "test-distant-laugh",
      choices: [
        {
          label: "ПРОВЕРИТЬ СПАЛЬНЮ",
          next: "bedroom-check"
        }
      ]
    },
    "bedroom-check": {
      room: "bedroom",
      speaker: "Я",
      text: "На кровати никого.",
      visual: "BEDROOM_BASE",
      imageAlt: "Пустая служебная спальня с металлической кроватью и прикроватной тумбой",
      effect: "markBedroomCheck",
      choices: [
        {
          label: "ПОСМОТРЕТЬ ТУМБОЧКУ",
          next: "bedroom-drawer",
          imageAlt: "Пустая служебная спальня. Прикроватная тумбочка закрыта",
          set: ["heardBedroomLaugh"],
          requireAny: ["soundEnabled", "textFallback"],
          effect: "markBedroomCheck",
          image: "dev-mechanical-image-id",
          _stage1Keep: true
        }
      ]
    },
    "bedroom-drawer": {
      room: "bedroom",
      speaker: "Я",
      text: "Я помню про пленку. \nЗаберу ее позже",
      visual: "BEDROOM_BASE",
      imageAlt: "Пустая служебная спальня. Прикроватная тумбочка закрыта",
      choices: [
        {
          label: "Прислушаться",
          next: "bedroom-hum"
        }
      ]
    },
    "bedroom-hum": {
      room: "bedroom",
      speaker: "Я",
      text: "В сливе опять что-то чавкает. Или кто-то. \nПойду проверю.",
      visual: "BEDROOM_BASE",
      imageAlt: "Пустая служебная спальня. Прикроватная тумбочка закрыта",
      choices: [
        {
          label: "ПРОВЕРИТЬ СЛИВ",
          next: "dev-drain-fragment"
        }
      ]
    },
    "dev-drain-fragment": {
      room: "bathroom",
      speaker: "Я",
      text: "Вода не течёт.",
      visual: "DRAIN_VAGUE",
      sound: "test-drain-hum",
      choices: [
        {
          label: "Почему не течёт?",
          kind: "speech",
          next: "drain-unrecognized"
        }
      ]
    },
    "drain-unrecognized": {
      room: "bathroom",
      speaker: "СИСТЕМА",
      text: "[СИГНАЛ НЕ РАСПОЗНАН]",
      visual: "DRAIN_VAGUE",
      choices: [
        {
          label: "НАКЛОНИТЬСЯ",
          next: "drain-beckon"
        }
      ]
    },
    "drain-beckon": {
      room: "bathroom",
      speaker: "Я",
      text: "Надеюсь, это не средний палец...",
      visual: "DRAIN_BECKON",
      choices: [
        {
          label: "Поздороваться",
          next: "drain-beckon-eye"
        }
      ]
    },
    "drain-beckon-eye": {
      room: "bathroom",
      speaker: "Я",
      text: "Что бы это ни было, оно хочет,\nчтобы я подошел поближе",
      visual: "DRAIN_BECKON",
      choices: [
        {
          label: "Подойти ближе",
          next: "drain-damp"
        }
      ]
    },
    "drain-damp": {
      room: "bathroom",
      speaker: "ГОЛОС ИЗ СЛИВА",
      text: "Привет, пуговка",
      visual: "DRAIN_BECKON",
      sound: "drain-voice-damp",
      choices: [
        {
          label: "ОТОЙТИ",
          next: "drain-silent"
        }
      ]
    },
    "drain-silent": {
      room: "bathroom",
      speaker: "Я",
      text: "Никто не отвечает.",
      visual: "DRAIN_VAGUE",
      choices: [
        {
          label: "К МОНИТОРАМ",
          next: "control-after-drain",
          set: ["drainVisit1Done"]
        }
      ]
    },
    "control-drain-cue-2": {
      room: "control",
      speaker: "Я",
      text: "В трубах опять чавкают. На секунду.",
      visual: "CONTROL_EMPTY",
      sound: "test-drain-hum",
      choices: [
        {
          label: "К СЛИВУ",
          next: "drain-cough"
        }
      ]
    },
    "drain-cough": {
      room: "bathroom",
      speaker: "Я",
      text: "Оно все еще тут?",
      visual: "DRAIN_COUGH",
      choices: [
        {
          label: "СЛУШАТЬ",
          next: "drain-cough-neighbors"
        }
      ]
    },
    "drain-cough-neighbors": {
      room: "bathroom",
      speaker: "ГОЛОС ИЗ СЛИВА",
      text: "Соседи смываются.",
      visual: "DRAIN_COUGH",
      sound: "drain-voice-neighbors",
      choices: [
        {
          label: "Кто смывается?",
          kind: "speech",
          next: "drain-cough-hair"
        }
      ]
    },
    "drain-cough-hair": {
      room: "bathroom",
      speaker: "ГОЛОС ИЗ СЛИВА",
      text: "Меня обещали перевести наверх. \nТут только синтетические волосы.",
      visual: "DRAIN_COUGH",
      sound: "drain-voice-hair",
      choices: [
        {
          label: "Какие волосы?",
          kind: "speech",
          next: "drain-cough-bald"
        }
      ]
    },
    "drain-cough-bald": {
      room: "bathroom",
      speaker: "ГОЛОС ИЗ СЛИВА",
      text: "Хочешь быть моим волосатым другом?",
      visual: "DRAIN_COUGH",
      sound: "drain-voice-hairy-friend",
      choices: [
        {
          label: "Я ЛЫСЫЙ.",
          kind: "speech",
          next: "drain-password"
        }
      ]
    },
    "drain-password": {
      room: "bathroom",
      speaker: "ГОЛОС ИЗ СЛИВА",
      text: "Везёт.",
      visual: "DRAIN_COUGH",
      sound: "drain-voice-lucky",
      choices: [
        {
          label: "Что значит «везёт»?",
          kind: "speech",
          next: "drain-password-gone"
        }
      ]
    },
    "drain-password-gone": {
      room: "bathroom",
      speaker: "Я",
      text: "Затих. Наверное, испугался...",
      visual: "DRAIN_COUGH",
      choices: [
        {
          label: "К МОНИТОРАМ",
          next: "control-knock-cue-2",
          set: ["drainVisit2Done"]
        }
      ]
    },
    "control-drain-cue-3": {
      room: "control",
      speaker: "Я",
      text: "Странное существо. Волосяной комок ",
      visual: "CONTROL_EMPTY",
      sound: "test-drain-hum",
      choices: [
        {
          label: "К СЛИВУ",
          next: "drain-hair-long"
        }
      ]
    },
    "drain-hair-long": {
      room: "bathroom",
      speaker: "Я",
      text: "Из щели выползает мокрый локон. \nДлиннее, чем в прошлый раз.",
      visual: "DRAIN_HAIR_LONG",
      imageAlt: "Слив: мокрые волосы длиннее лежат на решётке",
      choices: [
        {
          label: "СЛУШАТЬ",
          next: "drain-shift-wait"
        }
      ]
    },
    "drain-shift-wait": {
      room: "bathroom",
      speaker: "ГОЛОС ИЗ СЛИВА",
      text: "Твоя смена длится до тех пор, \nпока тебе не нашли замену",
      visual: "DRAIN_HAIR_LONG",
      sound: "drain-voice-shift",
      choices: [
        {
          label: "Пока не нашли замену?",
          kind: "speech",
          next: "drain-slide-wait"
        }
      ]
    },
    "drain-slide-wait": {
      room: "bathroom",
      speaker: "ГОЛОС ИЗ СЛИВА",
      text: "Ныряй к нам через горку. Чего ты боишься? \nТы точно лысый?",
      visual: "DRAIN_HAIR_LONG",
      sound: "drain-voice-slide",
      choices: [
        {
          label: "Я не полезу.",
          kind: "speech",
          next: "drain-thirst"
        }
      ]
    },
    "drain-thirst": {
      room: "bathroom",
      speaker: "ГОЛОС ИЗ СЛИВА",
      text: "Че-то так пить хочется. Принесешь КРОТА? \nТвой сменщик меня уже им поил",
      visual: "DRAIN_HAIR_LONG",
      sound: "drain-voice-thirst",
      choices: [
        {
          label: "Какой ещё КРОТ?",
          kind: "speech",
          next: "drain-thirst-ask"
        }
      ]
    },
    "drain-thirst-ask": {
      room: "bathroom",
      speaker: "ГОЛОС ИЗ СЛИВА",
      text: "На складе белая бутылка. Наливай прямо в щель. Быстрее.",
      visual: "DRAIN_HAIR_LONG",
      sound: "drain-voice-cleaner-request",
      choices: [
        {
          label: "НА СКЛАД",
          next: "storage-cleaner",
          set: ["drainAskedCleaner"]
        }
      ]
    },
    "control-after-drain": {
      room: "control",
      speaker: "ПАВЕЛ",
      text: "Привет, сменщик. Надеюсь, у тебя все хорошо там. \nЯ немножко задержусь. Ты там как",
      visual: "CONTROL_EMPTY",
      sound: "pavel-mm",
      imageAlt: "Пустая мониторная: настоящий Павел без маски говорит с правого экрана",
      choices: [
        {
          label: "Рассказать про волосы в сливе",
          kind: "speech",
          next: "control-after-drain-warn"
        }
      ]
    },
    "control-after-drain-warn": {
      room: "control",
      speaker: "ПАВЕЛ",
      text: "Это волосяной комок. Не переживай!\nПросто скажи, что ты лысый... ",
      visual: "CONTROL_EMPTY",
      imageAlt: "Пустая мониторная: настоящий Павел без маски остаётся на правом экране",
      choices: [
        {
          label: "ЛЫСЫЙ?",
          kind: "speech",
          next: "control-phone"
        }
      ]
    },
    "control-phone": {
      room: "control",
      speaker: "Я",
      text: "В кладовке что-то звенит. \nПойду проверю.",
      visual: "CONTROL_EMPTY",
      sound: "test-phone",
      choices: [
        {
          label: "ПРОВЕРИТЬ СКЛАД",
          next: "storage-check"
        }
      ]
    },
    "storage-check": {
      room: "storage",
      speaker: "Я",
      text: "Полчаса назад тут была горка. \nКуда она делась? ",
      visual: "STORAGE_BASE",
      sound: "test-paper",
      imageAlt: "Узкий служебный склад: на нижней полке белая бутылка с чёрным черепом",
      choices: [
        {
          label: "ПРИПАСЫ",
          kind: "item",
          next: "storage-provisions",
          hideIf: ["checkedProvisions"]
        },
        {
          label: "БУТЫЛКА",
          kind: "item",
          next: "storage-cleaner",
          hideIf: ["cleanerTaken"],
          require: ["drainAskedCleaner"]
        },
        {
          label: "У ДВЕРИ СТУЧАТ",
          next: "storage-knock-cue-1",
          hideIf: ["sawTrayNote"]
        },
        {
          label: "ОПЯТЬ СТУЧАТ",
          next: "hatch-knock-2",
          hideIf: ["gasMaskWorn"],
          require: ["sawTrayNote"]
        },
        {
          label: "СНОВА ТРИ СТУКА",
          next: "hatch-knock-3",
          hideIf: ["dessertOffered"],
          require: ["gasMaskWorn", "drainAskedCleaner"]
        }
      ]
    },
    "storage-provisions": {
      room: "storage",
      speaker: "Я",
      text: "Явно не первой свежести",
      visual: "STORAGE_PROVISIONS",
      imageAlt: "Крупный план банки с круглыми коричневыми шариками рядом с бутылками воды",
      choices: [
        {
          label: "К СКЛАДУ",
          next: "storage-check",
          set: ["checkedProvisions"]
        }
      ]
    },
    "storage-cleaner": {
      room: "storage",
      speaker: "Я",
      text: "Белая бутылка. Не вижу тут никакого КРОТа. \nИз ванной опять чавкают.",
      visual: "STORAGE_CLEANER",
      imageAlt: "Крупный план белой бутылки с чёрным черепом на металлической полке",
      choices: [
        {
          label: "ОТНЕСТИ К СЛИВУ",
          next: "drain-pour",
          set: ["cleanerTaken"]
        },
        {
          label: "ОСТАВИТЬ",
          next: "storage-check"
        }
      ]
    },
    "drain-pour": {
      room: "bathroom",
      speaker: "Я",
      text: "Почему это выглядит так знакомо?",
      visual: "DRAIN_HUNGRY",
      sound: "drain-pour",
      imageAlt: "Крупный план слива: язык на решётке и два бледных пальца с ногтями",
      choices: [
        {
          label: "Он пьёт?",
          kind: "speech",
          next: "drain-pour-tongue"
        }
      ]
    },
    "drain-pour-tongue": {
      room: "bathroom",
      speaker: "Я",
      text: "Наверное, проголодался",
      visual: "DRAIN_HUNGRY",
      imageAlt: "Крупный план слива: язык на решётке и два бледных пальца с ногтями",
      choices: [
        {
          label: "СЛУШАТЬ",
          next: "drain-pour-thanks"
        }
      ]
    },
    "drain-pour-thanks": {
      room: "bathroom",
      speaker: "ГОЛОС ИЗ СЛИВА",
      text: "Обожаю хлорку. Вкусная.",
      visual: "DRAIN_HUNGRY",
      sound: "drain-voice-cleaner-delight",
      choices: [
        {
          label: "Спросить куда ведет горка",
          kind: "speech",
          next: "drain-pour-cat"
        }
      ]
    },
    "drain-pour-cat": {
      room: "bathroom",
      speaker: "ГОЛОС ИЗ СЛИВА",
      text: "Маршрут может поменяться. Ты видишь меня, когда Зона Фильтрации подключается к комнате обозрения! ",
      visual: "DRAIN_HUNGRY",
      sound: "drain-voice-thanks-zone",
      choices: [
        {
          label: "К МОНИТОРАМ",
          next: "control-knock-cue-3"
        }
      ]
    },
    "storage-knock-cue-1": {
      room: "storage",
      speaker: "Я",
      text: "У двери три стука. Пойду проверю.",
      visual: "STORAGE_BASE",
      sound: "hatch-knock-3",
      choices: [
        {
          label: "К ДВЕРИ",
          next: "hatch-tray"
        }
      ]
    },
    "hatch-tray": {
      room: "hatch",
      speaker: "Я",
      text: "Люк открылся на ширину подноса. Пустая тарелка. Под ней — бумажка. За дверью никто не ждёт ответа.",
      visual: "HATCH_BASE",
      sound: "test-door",
      artifact: "test-tray-note",
      choices: [
        {
          label: "ПРОЧИТАТЬ ЗАПИСКУ",
          next: "hatch-note"
        }
      ]
    },
    "hatch-note": {
      room: "hatch",
      speaker: "ЗАПИСКА",
      presentation: "document",
      text: "Загляни в каждую колыбель. \nМессия может спать где угодно",
      visual: "HATCH_BASE",
      choices: [
        {
          label: "МОЛЧА ОТОЙТИ",
          next: "control-after-hatch",
          set: ["sawTrayNote"]
        },
        {
          label: "Заглянуть за стекло",
          next: "hatch-glass"
        }
      ]
    },
    "hatch-glass": {
      room: "hatch",
      speaker: "Я",
      text: "За стеклом мелькнули две руки. Лица нет.",
      visual: "HATCH_BASE",
      imageAlt: "Меня будут кормить?",
      choices: [
        {
          label: "К МОНИТОРАМ",
          next: "control-after-hatch",
          set: ["sawTrayNote"]
        }
      ]
    },
    "hatch-knock-2": {
      room: "hatch",
      speaker: "СИСТЕМА",
      text: "[ТРИ СТУКА В ДВЕРЬ]",
      visual: "HATCH_CLOSED",
      sound: "hatch-knock-3",
      choices: [
        {
          label: "К ЛЮКУ",
          next: "hatch-tray-mask"
        }
      ]
    },
    "hatch-tray-mask": {
      room: "hatch",
      speaker: "Я",
      text: "На подносе лежит противогаз. Резина ещё тёплая.",
      visual: "HATCH_GASMASK",
      choices: [
        {
          label: "СЛУШАТЬ ТРУБЫ",
          next: "hatch-mask-aroma"
        }
      ]
    },
    "hatch-mask-aroma": {
      room: "hatch",
      speaker: "ГОЛОС ИЗ СЛИВА",
      text: "Час ароматизации. Не забудь надеть противогаз.",
      visual: "HATCH_GASMASK",
      sound: "drain-voice-aromatization",
      choices: [
        {
          label: "ВЗЯТЬ И НАДЕТЬ",
          next: "hatch-mask-on"
        }
      ]
    },
    "hatch-mask-on": {
      room: "hatch",
      speaker: "Я",
      text: "Ненавижу это ощущение. Когда противогаз цепляет волосок на шее. Фу. ",
      visual: "HATCH_CLOSED",
      choices: [
        {
          label: "К МОНИТОРАМ",
          next: "control-drain-cue-3",
          set: ["gasMaskWorn"]
        }
      ]
    },
    "control-knock-cue-3": {
      room: "control",
      speaker: "Я",
      text: "Снова долбят. Пойду проверю.",
      visual: "CONTROL_EMPTY",
      sound: "hatch-knock-3",
      choices: [
        {
          label: "К ДВЕРИ",
          next: "hatch-tray-dessert"
        }
      ]
    },
    "hatch-knock-3": {
      room: "hatch",
      speaker: "СИСТЕМА",
      text: "[ТРИ СТУКА В ДВЕРЬ]",
      visual: "HATCH_CLOSED",
      sound: "hatch-knock-3",
      choices: [
        {
          label: "К ЛЮКУ",
          next: "hatch-tray-dessert"
        }
      ]
    },
    "hatch-tray-dessert": {
      room: "hatch",
      speaker: "Я",
      text: "Пластиковая баночка. Десерт. Крышка запотела изнутри.",
      visual: "HATCH_DESSERT",
      choices: [
        {
          label: "СЛУШАТЬ ЗА ДВЕРЬЮ",
          next: "hatch-dessert-voice"
        }
      ]
    },
    "hatch-dessert-voice": {
      room: "hatch",
      speaker: "НЕЗНАКОМЕЦ",
      text: "Проводница уже знает, что ты здесь.",
      visual: "HATCH_DESSERT",
      sound: "hatch-dessert-voice",
      choices: [
        {
          label: "ВЗЯТЬ БАНОЧКУ",
          next: "hatch-dessert-take",
          set: ["dessertOffered"]
        },
        {
          label: "ОСТАВИТЬ",
          next: "hatch-dessert-refuse",
          set: ["dessertOffered"]
        }
      ]
    },
    "hatch-dessert-take": {
      room: "hatch",
      speaker: "Я",
      text: "Баночка лёгкая. Слишком лёгкая для еды.",
      visual: "HATCH_CLOSED",
      choices: [
        {
          label: "К МОНИТОРАМ",
          next: "control-after-hatch-laugh",
          set: ["dessertTaken"]
        }
      ]
    },
    "hatch-dessert-refuse": {
      room: "hatch",
      speaker: "Я",
      text: "Поднос уезжает обратно. За дверью больше не ждут.",
      visual: "HATCH_CLOSED",
      choices: [
        {
          label: "К МОНИТОРАМ",
          next: "control-after-hatch-laugh"
        }
      ]
    },
    "control-after-hatch": {
      room: "control",
      speaker: "ПАВЕЛ",
      text: "Ты уже видел проводницу? Она всегда \nвстречается с кандидатами. ",
      visual: "CONTROL_EMPTY",
      imageAlt: "Пустая мониторная: настоящий Павел без маски говорит с правого экрана",
      choices: [
        {
          label: "Нет, кто это? ",
          kind: "speech",
          next: "control-drain-cue-2"
        }
      ]
    },
    "control-knock-cue-2": {
      room: "control",
      speaker: "Я",
      text: "Опять стучат. Служебная дверь.\nПойду проверю.",
      visual: "CONTROL_EMPTY",
      sound: "hatch-knock-3",
      choices: [
        {
          label: "К ДВЕРИ",
          next: "hatch-tray-mask"
        }
      ]
    },
    "control-after-hatch-laugh": {
      room: "control",
      speaker: "ПАВЕЛ",
      text: "В спальне снова смеются. Ближе. Пойду.",
      visual: "CONTROL_EMPTY",
      imageAlt: "Пустая мониторная: настоящий Павел без маски виден на правом экране",
      choices: [
        {
          label: "ПРОВЕРИТЬ ТУМБОЧКУ",
          next: "bedroom-cassette"
        }
      ]
    },
    "bedroom-cassette": {
      room: "bedroom",
      speaker: "Я",
      text: "В ящике старая кассета. Проигрывателя нет.",
      visual: "NIGHTSTAND_CASSETTE",
      imageAlt: "Открытый ящик прикроватной тумбы: внутри одна серая видеокассета",
      choices: [
        {
          label: "ВЗЯТЬ",
          next: "control-screens-glitch",
          set: ["cassetteFound"],
          artifact: "test-cassette-slot",
          artifactId: "pavel-lora-cassette"
        },
        {
          label: "ОСТАВИТЬ ПАВЛУ",
          next: "control-screens-glitch"
        }
      ]
    },
    "control-screens-glitch": {
      room: "control",
      speaker: "Я",
      text: "Я не помню, чтобы подписывал трудовой контракт\nПочему я здесь?",
      visual: "CONTROL_EMPTY",
      imageAlt: "Пустая мониторная: левый экран сам перебирает искажённые камеры, правый сохраняет сигнал",
      choices: [
        {
          label: "НЕ ТРОГАТЬ ПУЛЬТ",
          next: "control-camera"
        }
      ]
    },
    "control-camera": {
      room: "control",
      speaker: "Я",
      text: "Знакомая маска",
      visual: "CONTROL_PAVEL_RIGHT",
      imageAlt: "Пустая мониторная: на правом экране машет фигура в похожей кошачьей маске",
      choices: [
        {
          label: "СЛУШАТЬ",
          next: "control-camera-ask"
        }
      ]
    },
    "control-camera-ask": {
      room: "control",
      speaker: "ПАВЕЛ",
      text: "Эй, сменщик! Мне нужно, чтобы ты отключил\nкамеру в секторе F6. Сможешь?",
      visual: "CONTROL_PAVEL_RIGHT",
      imageAlt: "Пустая мониторная: фигура в похожей кошачьей маске смотрит с правого экрана",
      refusalText: "Просто нажми на кпопку. \nТы знаешь, на какую!",
      choices: [
        {
          label: "ОКЕЙ",
          kind: "speech",
          next: "control-camera-press",
          set: ["cameraBlind"],
          sound: "test-click"
        },
        {
          label: "КАКУЮ КНОПКУ?",
          kind: "speech",
          next: "control-camera-ask",
          set: ["cameraRefused"]
        }
      ]
    },
    "control-camera-press": {
      room: "control",
      speaker: "Я",
      text: "Где находится F6? Зоопарк?",
      visual: "CONTROL_PAVEL_RIGHT",
      imageAlt: "Руки оператора на пульте: после нажатия правый экран переключается на пустой коридор",
      choices: [
        {
          label: "ЖДАТЬ ДЕСЯТЬ СЕКУНД",
          next: "hatch-escape"
        }
      ]
    },
    "hatch-escape": {
      room: "control",
      speaker: "СИСТЕМА",
      text: "КАНАЛ НЕДОСТУПЕН.",
      visual: "CONTROL_RIGHT_DISABLED",
      imageAlt: "Пустая мониторная: левый экран работает, правый экран полностью погашен",
      choices: [
        {
          label: "Где Павел?",
          kind: "speech",
          next: "dev-operator-hold"
        }
      ]
    },
    "slide-farewell-left": {
      room: "storage",
      speaker: "Я",
      text: "После обхода Павел полез в горку.",
      visual: "STORAGE_ESCAPE",
      sound: "water-slide",
      imageAlt: "Павел ногами вперёд исчезает в старой водной горке",
      choices: [
        {
          label: "Смотреть в горку",
          next: "slide-farewell-light"
        }
      ]
    },
    "slide-farewell-light": {
      room: "storage",
      speaker: "Я",
      text: "В горке загорелся свет.",
      visual: "STORAGE_SLIDE",
      imageAlt: "Круглый вход водной горки в служебном складе",
      choices: [
        {
          label: "Подождать",
          next: "slide-farewell-dark"
        }
      ]
    },
    "slide-farewell-dark": {
      room: "storage",
      speaker: "Я",
      text: "Потом потух.",
      visual: "STORAGE_SLIDE",
      imageAlt: "Тёмный вход водной горки в служебном складе",
      choices: [
        {
          label: "Куда он делся?",
          kind: "speech",
          next: "slide-farewell-cat"
        }
      ]
    },
    "slide-farewell-cat": {
      room: "storage",
      speaker: "Я",
      text: "Кот ушёл. Горка больше не принимает тело.",
      visual: "STORAGE_SLIDE",
      imageAlt: "У кота девять жизней. Даже с одной так тяжело ",
      choices: [
        {
          label: "А я?",
          kind: "speech",
          next: "slide-farewell-stay"
        }
      ]
    },
    "slide-farewell-stay": {
      room: "storage",
      speaker: "Я",
      text: "Я остался в комнате обозрения.",
      visual: "STORAGE_SLIDE",
      imageAlt: "Пустой служебный склад с тёмным входом в водную горку",
      choices: [
        {
          label: "К МОНИТОРАМ",
          next: "control-laugh",
          set: ["slideFarewellSeen"]
        }
      ]
    },
    "dev-operator-hold": {
      room: "control",
      speaker: "Я",
      text: "Куратор больше не отвечает.",
      visual: "CONTROL_EMPTY",
      complete: true,
      choices: [
        {
          label: "Позвать Павла",
          next: "hold-accepted",
          set: ["operatorHoldConfirmed"]
        }
      ]
    },
    "hold-accepted": {
      room: "control",
      speaker: "СИСТЕМА",
      text: "ОПЕРАТОР ПРИНЯТ.",
      visual: "CONTROL_EMPTY",
      complete: true,
      choices: [
        {
          label: "ПРОВЕРИТЬ КАНАЛЫ",
          next: "operator-last-check"
        }
      ]
    },
    "operator-last-check": {
      room: "control",
      speaker: "СИСТЕМА",
      text: "ПРАВЫЙ КАНАЛ НЕДОСТУПЕН.",
      visual: "CONTROL_EMPTY",
      choices: [
        {
          label: "А левый?",
          kind: "speech", 
          next: "operator-left-channel"
        }
      ]
    },
    "operator-left-channel": {
      room: "control",
      speaker: "СИСТЕМА",
      text: "ЛЕВЫЙ КАНАЛ ПЕРЕДАН НОВОМУ ОПЕРАТОРУ.",
      visual: "CONTROL_EMPTY",
      choices: [
        {
          label: "ПРОВЕРИТЬ СКЛАД",
          next: "storage-slide-empty"
        }
      ]
    },
    "storage-slide-empty": {
      room: "storage",
      speaker: "Я",
      text: "Горка открыта. Здесь никого нет.",
      visual: "STORAGE_SLIDE",
      imageAlt: "Пустой служебный склад с тёмным входом в старую водную горку",
      choices: [
        {
          label: "ОГЛЯНУТЬСЯ",
          next: "senior-guide-seen",
          set: ["storageSlideFound"]
        }
      ]
    },
    "senior-guide-seen": {
      room: "storage",
      speaker: "Я",
      text: "Давно хотел с ней познакомиться",
      visual: "SENIOR_GUIDE_SLIDE",
      imageAlt: "Видимо, та самая проводница",
      choices: [
        {
          label: "МОЛЧАТЬ",
          next: "senior-guide-arrives",
          set: ["seniorGuideSeen"]
        }
      ]
    },
    "senior-guide-arrives": {
      room: "storage",
      speaker: "ПРОВОДНИЦА",
      text: "Хммм...Тебя не должно здесь быть",
      visual: "SENIOR_GUIDE_SLIDE",
      imageAlt: "Женщина в золотой маске Солнца стоит в складе рядом с входом в водную горку",
      choices: [
        {
          label: "МОЛЧАТЬ",
          next: "senior-guide-verdict"
        }
      ]
    },
    "senior-guide-verdict": {
      room: "storage",
      speaker: "ПРОВОДНИЦА",
      text: "Ступай...Ты ещё не готов.",
      visual: "SENIOR_GUIDE_SLIDE",
      imageAlt: "Старший Проводник неподвижно смотрит из-под золотой маски Солнца",
      choices: [
        {
          label: "МОЛЧАТЬ",
          next: "senior-guide-mercy"
        }
      ]
    },
    "senior-guide-mercy": {
      room: "storage",
      speaker: "ПРОВОДНИЦА",
      text: "Выход через горку, малыш!",
      visual: "SENIOR_GUIDE_SLIDE",
      imageAlt: "Женщина в золотой маске Солнца стоит у входа в водную горку",
      choices: [
        {
          label: "СМОТРЕТЬ НА ГОРКУ",
          next: "senior-guide-route"
        }
      ]
    },
    "senior-guide-route": {
      room: "storage",
      speaker: "ПРОВОДНИЦА",
      text: "Еще увидимся. ",
      visual: "SENIOR_GUIDE_SLIDE",
      imageAlt: "Женщина в маске Солнца открытой ладонью указывает на водную горку",
      choices: [
        {
          label: "ВОЙТИ В ГОРКУ",
          next: "slide-guest-light",
          set: ["acceptedSeniorGuideRoute"]
        }
      ]
    },
    "slide-guest-light": {
      room: "storage",
      speaker: "Я",
      text: "В горке опять загорелся свет.",
      visual: "SLIDE_ESCAPE",
      imageAlt: "Я должен слушаться...",
      choices: [
        {
          label: "ВЫЙТИ",
          next: "slide-guest-exit"
        }
      ]
    },
    "slide-guest-exit": {
      room: "storage",
      speaker: "СИСТЕМА",
      text: "[ШУМ ВОДЫ]",
      visual: "STORAGE_SLIDE",
      imageAlt: "Свет внутри старой водной горки в служебном складе",
      complete: true,
      guestExit: true,
      delay: 1400,
      choices: []
    }
  };

  window.TyndexPavelObservationBoothContent = Object.freeze({
    version: 1,
    startNode,
    nodes,
    rooms,
    sounds,
    visuals,
    artifacts,
  });
})();
