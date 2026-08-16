/**
 * Irina curator call — content module (Stage 0/1).
 *
 * SOURCE OF TRUTH for dialogue nodes, reward copy, call files,
 * staff message templates, artifact catalog, and node→artifact map.
 *
 * Edit via local admin (node scripts/admin-server.js) or by hand.
 * Runtime loads this file before app.js and hydrates asset URLs.
 *
 * Validate: node scripts/validate-irina-call-content.js
 * Export dialogues md: node scripts/export-irina-dialogues.js
 */
(() => {
  "use strict";

  // Runtime bridge: classification helpers live in js/app.js and are attached
  // to window.TyndexIrinaRuntime before any node text/choices are evaluated.
  const runtime = () => window.TyndexIrinaRuntime || {};
  const readStaffProfile = (...args) => runtime().readStaffProfile?.(...args);
  const getCuratorAssignment = (...args) =>
    runtime().getCuratorAssignment?.(...args);
  const getAssignmentCallbacks = (...args) =>
    runtime().getAssignmentCallbacks?.(...args);
  const isCloseClassification = (...args) =>
    runtime().isCloseClassification?.(...args);

  const rewardCopy = {
    "animator-postcard": {
      title: "ОБОРОТНАЯ СТОРОНА",
      lines: [
        "Мне почему-то кажется, что мы ещё увидимся.",
        "12 августа у меня день рождения.",
        "Приходи в парк «Солнышко».",
        "Мне опять не с кем праздновать."
      ],
      stamp: "ПАРК «СОЛНЫШКО» // 12.08.26"
    },
    "volunteer-leaflet": {
      title: "ВЕРНИ СЕБЕ ДЕТСТВО",
      lines: [
        "Волонтёрская программа младшей группы.",
        "Помогая детям, вы снова сможете стать частью праздника.",
        "Маска выдаётся при предъявлении этой листовки."
      ],
      stamp: "НЕ ТЕРЯТЬ // ПОВТОРНАЯ ВЫДАЧА НЕ ПРЕДУСМОТРЕНА"
    }
  };

  const files = {
    "irina-private-photo": {
      src: "assets/staff/curators/irina/artifacts/irina-photobooth-strip.jpg",
      downloadName: "IRINA_PRIVATE_01.jpg",
      alt: "Фотополоска Ирины из торгового центра"
    },
    "animator-postcard": {
      src: "assets/staff/curators/irina/artifacts/zhmuriki-postcard.webp",
      downloadName: "IRINA_POSTCARD_01.webp",
      alt: "Печатная открытка с тремя Жмуриками в пустом цветочном парке под солнцем-глазом",
      copy: {
        title: "ОБОРОТНАЯ СТОРОНА",
        lines: [
          "Мне почему-то кажется, что мы ещё увидимся.",
          "12 августа у меня день рождения.",
          "Приходи в парк «Солнышко».",
          "Мне опять не с кем праздновать."
        ],
        stamp: "ПАРК «СОЛНЫШКО» // 12.08.26"
      }
    },
    "volunteer-leaflet": {
      src: "assets/staff/curators/irina/artifacts/return-your-childhood-leaflet.webp",
      downloadName: "VOLUNTEER_PROGRAM_01.webp",
      alt: "Потёртая листовка программы «Верни себе детство» с пластиковой маской младенца",
      copy: {
        title: "ВЕРНИ СЕБЕ ДЕТСТВО",
        lines: [
          "Волонтёрская программа младшей группы.",
          "Помогая детям, вы снова сможете стать частью праздника.",
          "Маска выдаётся при предъявлении этой листовки."
        ],
        stamp: "НЕ ТЕРЯТЬ // ПОВТОРНАЯ ВЫДАЧА НЕ ПРЕДУСМОТРЕНА"
      }
    }
  };

  const staffMessages = {
    "system-profile-created": {
      sender: "СИСТЕМА",
      avatar: "assets/staff/logo.png",
      subject: "ЛИЧНОЕ ДЕЛО СОЗДАНО",
      preview: "Укажите имя и выберите допустимое изображение.",
      body: (profile) =>
        `${profile.displayName || "Оператор"}, локальная кадровая запись активна.\n\nУкажите имя для служебных обращений и выберите изображение после завершения проверки.`
    },
    "lora-red-room": {
      sender: "ЛОРА П.",
      avatar: "assets/staff/staff/lora-message-avatar.webp",
      subject: "АРТЕФАКТЫ",
      preview: "Проверяй периодически личные сообщения. Не забывай, некоторые артефакты - ключи к новому уровню ",
      body: (profile) =>
        `${profile.displayName || "Привет"}. Если вам пришлют что-нибудь из Красной Комнаты, не сохраняйте все файлы подряд.\n\nЯ серьёзно. Иногда важнее помнить, кто прислал фотографию, чем саму фотографию.`
    },
    "ulybarych-after-broadcast": {
      sender: "УЛЫБАРЫЧ",
      avatar: "assets/staff/documents/ulybarych-message-avatar.webp",
      subject: "ТЫ ДОСМОТРЕЛ?",
      preview: "На твоём месте в студии пока никого нет.",
      body: (profile) =>
        `${profile.displayName || "Оператор"}, передача дошла до самого конца?\n\nНа твоём месте в студии пока никого нет. Я попросил не убирать стул.`,
      attachmentArtifactId: "ulybarych-broadcast"
    },
    "fox-after-shift": {
      sender: "АЛИСА",
      avatar: "assets/staff/staff/alice-message-avatar.webp",
      subject: "ну и???",
      preview: "не дождалась от тебя сообщения. Решила написать первой",
      body: (profile, context) => {
        const lora = context?.lora || {};
        const reactions = {
          hidden: "Свинья не вышла через дверь. Ты назвал это сменой?",
          waiting: "Ты оставил его ждать Лору. Не люблю решения, которые выглядят как пауза.",
          reported: "Номер ты оставил. Номера возвращаются быстрее людей.",
          tomorrow: "Ты сказал ему прийти завтра. Здесь это почти вежливое «никогда».",
          denied: "Ты сказал, что ключей нет. Хороший ответ для человека, у которого ключ был.",
          traded: "Ты отдал синий ключ. Не спрашиваю, что ты видел за стеклом.",
        };
        const name = profile?.displayName || "Оператор";
        return [
          `${name}, не дождалась от тебя сообщения. Решила написать первой.`,
          reactions[lora.pigOutcome] || "В отметках осталось больше, чем ты сказал вслух.",
        ].join("\n\n");
      }
    },
    "lora-after-shift": {
      sender: "ЛОРА П.",
      avatar: "assets/staff/staff/lora-message-avatar.webp",
      subject: "СПАСИБО ЗА СМЕНУ",
      preview: "Спасибо, что подменил.",
      attachmentArtifactId: "lora-quiet-sleep-page",
      body: (profile, context) => {
        const lora = context?.lora || {};
        const reactions = {
          left: "Пса можно было не торопить. Спасибо.",
          given: "Про Пса потом поговорим. Не сегодня.",
          sea: "Про море я ничего не спрашивала. Если он вернётся — не открывай сразу.",
          unassigned: "Иногда не назначить маршрут — тоже решение. Я это запомню.",
        };
        const name = profile?.displayName || "Оператор";
        return [
          `${name}, спасибо, что подменил.`,
          reactions[lora.dogOutcome] || "Я разберусь с остальным, когда вернусь.",
        ].join("\n\n");
      }
    }
  };

  const staffArtifacts = {
    "memory-drawing": {
      code: "IR-0091-01",
      title: "ВОССТАНОВЛЕННЫЙ ДЕТСКИЙ РИСУНОК",
      type: "МАТЕРИАЛ ДЕТСКОГО ПРОИСХОЖДЕНИЯ",
      source: "КУРАТОР 0091-A // ЛИЧНЫЙ ФАЙЛ",
      description: "Источник изображения не подтверждён. Материал прикреплён к личному делу оператора.",
      src: "assets/staff/curators/irina/artifacts/memory-drawing.webp",
      alt: "Детский рисунок серого здания у леса, Медведя у двери и уходящих взрослых фигур"
    },
    "recognition-card": {
      code: "IR-0091-02",
      title: "КАРТОЧКА ДЕТСКОГО РАСПОЗНАВАНИЯ",
      type: "РЕЗУЛЬТАТ РАСПОЗНАВАНИЯ",
      source: "КУРАТОР 0091-A // КАРТОЧКА 04",
      description: "Ответ оператора зарегистрирован. Официальная интерпретация изображения может быть назначена позднее.",
      src: "assets/staff/curators/irina/artifacts/recognition-cat-rabbit.webp",
      alt: "Симметричное чернильное пятно, похожее одновременно на кота и кролика"
    },
    "service-route-map": {
      code: "IR-0091-06",
      title: "КАРТА СЛУЖЕБНЫХ МАРШРУТОВ",
      type: "ВОССТАНОВЛЕННАЯ СХЕМА",
      source: "МАРШРУТНЫЙ ОТДЕЛ // КОПИЯ БЕЗ ДАТЫ",
      description: "Часть помещений скрыта вручную. Синий маршрут возвращается в исходную точку без зарегистрированного разворота.",
      src: "assets/staff/curators/irina/artifacts/service-route-map.webp",
      alt: "Старая служебная карта комплекса с цветными маршрутами, заклеенным сектором и зачёркнутыми помещениями"
    },
    "blue-key-evidence": {
      code: "IR-0091-07",
      title: "СИНИЙ КЛЮЧ БЕЗ БИРКИ",
      type: "СОПУТСТВУЮЩИЙ ПРЕДМЕТ",
      source: "МАРШРУТНЫЙ ОТДЕЛ // СТОЛ ВЫДАЧИ",
      description: "Ключ найден рядом с карточкой маршрута. Получатель и доступная дверь в журнале не указаны.",
      src: "assets/staff/curators/irina/artifacts/blue-key-evidence.webp",
      alt: "Потёртый синий служебный ключ без бирки на мокром зелёном столе"
    },
    "assigned-toy-polaroid": {
      code: "IR-0091-08",
      title: "ИГРУШКА, ОЖИДАЮЩАЯ НАЗНАЧЕНИЯ",
      type: "УЧЁТНАЯ ФОТОГРАФИЯ",
      source: "КОМНАТА ОЖИДАНИЯ // ЯЧЕЙКА НЕ УКАЗАНА",
      description: "Пустая бирка зарегистрирована раньше имени владельца. Дата фотографии отсутствует.",
      src: "assets/staff/curators/irina/artifacts/assigned-toy-polaroid.webp",
      alt: "Плюшевый кролик с пустой служебной биркой сидит на детском стуле перед тёмной дверью"
    },
    "post-aroma-dessert": {
      code: "IR-0091-09",
      title: "НОРМА ПОСЛЕ АРОМАТИЗАЦИИ",
      type: "ФОТОФИКСАЦИЯ ВЫДАЧИ",
      source: "ПИЩЕВОЙ БЛОК // СМЕНА 12",
      description: "Десерт выдан сотруднику после завершения обработки. Отказ от получения не зарегистрирован.",
      src: "assets/staff/curators/irina/artifacts/post-aroma-dessert.webp",
      alt: "Десерт, ложка и мокрый противогаз на металлическом подносе"
    },
    "ulybarych-broadcast": {
      code: "IR-0091-10",
      title: "АРХИВНЫЙ ЭФИР «УЛЫБАРЫЧ»",
      type: "СТОП-КАДР ОБЯЗАТЕЛЬНОЙ ПЕРЕДАЧИ",
      source: "АРХИВ ВОЗРАСТНОГО КОНТРОЛЯ // ИСТОЧНИК 001",
      description: "Детское место в кадре свободно. Присутствующие взрослые системой зрителями не считаются.",
      src: "assets/staff/curators/irina/artifacts/ulybarych-broadcast.webp",
      alt: "Улыбающийся ведущий в белом халате стоит рядом с пустым детским стулом перед взрослой аудиторией"
    },
    "operator-empty-chair": {
      code: "IR-0091-11",
      title: "РАБОЧЕЕ МЕСТО БЕЗ ОПЕРАТОРА",
      type: "КАДР ВНУТРЕННЕГО НАБЛЮДЕНИЯ",
      source: "КАНАЛ 0091-A // ИСТОЧНИК НЕ ОПРЕДЕЛЁН",
      description: "Монитор показывает то же рабочее место с другой точки. Второй источник камеры не зарегистрирован.",
      src: "assets/staff/curators/irina/artifacts/operator-empty-chair.webp",
      alt: "Пустое кресло оператора с наушниками перед старым монитором"
    },
    "damaged-child-file": {
      code: "IR-0091-14",
      title: "ПОВРЕЖДЁННОЕ ДЕЛО РЕБЁНКА",
      type: "НЕЗАРЕГИСТРИРОВАННОЕ ЛИЧНОЕ ДЕЛО",
      source: "КАНАЛ 0091-A // ИСТОЧНИК НЕ ОПРЕДЕЛЁН",
      description: "Имя и фотография утрачены. Ответы в анкете частично совпадают с текущим сеансом оператора.",
      src: "assets/staff/curators/irina/artifacts/damaged-child-file.webp",
      alt: "Повреждённая папка детского дела с вырванной фотографией, зачёркнутым именем и схемой маршрута"
    },
    "lost-child-route-ticket": {
      code: "IR-0091-15",
      title: "БИЛЕТ LOST CHILD TERMINAL",
      type: "МАРШРУТНАЯ КВИТАНЦИЯ",
      source: "ТЕРМИНАЛ ПОТЕРЯННЫХ ДЕТЕЙ // МАРШРУТ НЕ ЗАРЕГИСТРИРОВАН",
      description: "Билет соединяет горку, служебную дверь и пустой бассейн. Номер назначения стёрт до печати.",
      src: "assets/staff/curators/irina/artifacts/lost-child-route-ticket.webp",
      alt: "Длинный старый маршрутный билет со схемой из горки, служебной двери и пустого бассейна"
    },
    "preserved-child-file": {
      code: "IR-0091-16",
      title: "СОХРАНЁННОЕ ДЕЛО РЕБЁНКА",
      type: "БУМАЖНАЯ РЕЗЕРВНАЯ КОПИЯ",
      source: "КУРАТОР 0091-A // ЛИЧНЫЙ ЖУРНАЛ",
      description: "Куратор внесла отсутствующую запись вручную. Системное подтверждение регистрации не получено.",
      src: "assets/staff/curators/irina/artifacts/damaged-child-file.webp",
      alt: "Повреждённая папка детского дела, сохранённая Ириной в бумажном журнале"
    },
    "irina-private-photo": {
      code: "IR-0091-03",
      title: "ЛИЧНЫЙ ФАЙЛ ИРИНЫ В.",
      type: "НЕСАНКЦИОНИРОВАННАЯ ПЕРЕДАЧА",
      source: "КУРАТОР 0091-A // ИСХОДЯЩИЙ ФАЙЛ",
      description: "Файл передан вне утверждённой процедуры кадровой проверки.",
      src: "assets/staff/curators/irina/artifacts/irina-photobooth-strip.jpg",
      alt: "Фотополоса с несколькими кадрами Ирины В."
    },
    "animator-postcard": {
      code: "IR-0091-12",
      title: "ОТКРЫТКА БЕЗ ОБРАТНОГО АДРЕСА",
      type: "ЛИЧНАЯ КОРРЕСПОНДЕНЦИЯ",
      source: "КУРАТОР 0091-A // ПРИЛОЖЕНИЕ К НАЗНАЧЕНИЮ",
      description: "Открытка прикреплена к назначению Аниматора. Обратный адрес отсутствует.",
      src: "assets/staff/curators/irina/artifacts/zhmuriki-postcard.webp",
      alt: "Печатная открытка с тремя Жмуриками в пустом цветочном парке под солнцем-глазом",
      downloadName: "IRINA_POSTCARD_01.webp",
      copy: {
        title: "ОБОРОТНАЯ СТОРОНА",
        lines: [
          "Мне почему-то кажется, что мы ещё увидимся.",
          "12 августа у меня день рождения.",
          "Приходи в парк «Солнышко».",
          "Мне опять не с кем праздновать."
        ],
        stamp: "ПАРК «СОЛНЫШКО» // 12.08.26"
      }
    },
    "volunteer-leaflet": {
      code: "IR-0091-13",
      title: "ЛИСТОВКА «ВЕРНИ СЕБЕ ДЕТСТВО»",
      type: "ПРЕДМЕТ СЛЕДУЮЩЕГО МАРШРУТА",
      source: "ВОЛОНТЁРСКАЯ ПРОГРАММА // МЛАДШАЯ ГРУППА",
      description: "Листовка признана действующей. Предъявить при повторном назначении.",
      src: "assets/staff/curators/irina/artifacts/return-your-childhood-leaflet.webp",
      alt: "Потёртая листовка программы «Верни себе детство» с пластиковой маской младенца",
      downloadName: "VOLUNTEER_PROGRAM_01.webp",
      copy: {
        title: "ВЕРНИ СЕБЕ ДЕТСТВО",
        lines: [
          "Волонтёрская программа младшей группы.",
          "Помогая детям, вы снова сможете стать частью праздника.",
          "Маска выдаётся при предъявлении этой листовки."
        ],
        stamp: "НЕ ТЕРЯТЬ // ПОВТОРНАЯ ВЫДАЧА НЕ ПРЕДУСМОТРЕНА"
      }
    },
    "biometric-record": {
      code: "IR-0091-04",
      title: "БИОМЕТРИЧЕСКАЯ ЗАГОТОВКА",
      type: "ВРЕМЕННЫЙ ПРОПУСК",
      source: "CAPTURE DEVICE 312 // ГЛАВВРАЧ",
      description: "Изображение оператора повреждено при передаче. Допустимая реконструкция выбирается после назначения."
    },
    assignment: {
      code: "IR-0091-05",
      title: "КАДРОВОЕ РЕШЕНИЕ",
      type: "ИТОГОВОЕ НАЗНАЧЕНИЕ",
      source: "КУРАТОР 0091-A // СЕАНС 01",
      description: "Роль оператора внесена в кадровую базу."
    }
  };

  const nodeArtifacts = {
    "memory-drawing": "memory-drawing",
    "image-response": "service-route-map",
    "wristband-response": "blue-key-evidence",
    "wristband-explain": "assigned-toy-polaroid",
    "recognition-card": "recognition-card",
    "post-aroma-jelly": "post-aroma-dessert",
    "ulybarych-archive": "ulybarych-broadcast",
    "empty-room": "operator-empty-chair",
    "plague-doctor-response": "biometric-record",
    "damaged-file-evidence": "damaged-child-file",
    "lost-terminal-ticket": "lost-child-route-ticket",
    "file-preserved-response": "preserved-child-file"
  };

  const nodes = {
    "reclassification-entry": {
      step: "ПОВТОРНАЯ КЛАССИФИКАЦИЯ // СЕАНС",
      media: "state-file-investigation",
      feedState: "ПРЕДЫДУЩИЙ ДОПУСК НАЙДЕН",
      signal: 63,
      speaker: "ИРИНА В.",
      text: "Тебя я помню. Звук и возраст второй раз проверять не будем. Но ответы придётся собрать заново: прошлое назначение уже знает, кем ты был.",
      choices: [
        {
          label: "НАЧАТЬ ПОВТОРНУЮ КЛАССИФИКАЦИЮ",
          next: "role-question"
        }
      ]
    },
    intro: {
      step: "ПРОВЕРКА ДОПУСКА // 1 ИЗ 9",
      media: "state-neutral",
      speaker: "ИРИНА В.",
      text: "Ты меня слышишь? Нет. Правильно. Я здесь буквами. Но комнату можно включить.",
      choices: [
        {
          label: "КОМНАТУ?",
          next: "sound-prompt"
        }
      ]
    },
    "sound-prompt": {
      step: "ПРОВЕРКА КАНАЛА // ЗВУК",
      media: "state-warm",
      speaker: "ИРИНА В.",
      text: (progress) =>
        progress.flags.enabledSoundAtIntro
          ? "Уже нашёл. Вот. Теперь ты слышишь не меня. Это комната."
          : "Внизу написано «ЗВУК». Можешь нажать. Не включай, если боишься услышать комнату. Ха-ха.",
      choices: (progress) =>
        progress.flags.enabledSoundAtIntro
          ? [
              {
                label: "ПРОДОЛЖИТЬ",
                next: "age-check",
              },
            ]
          : [
              {
                label: "ОСТАВИТЬ ТИШИНУ",
                next: "sound-silent-response",
                effect: { flags: { keptIntroSilent: true } },
              },
            ]
    },
    "sound-on-response": {
      step: "ПРОВЕРКА КАНАЛА // ЗВУК ВКЛЮЧЁН",
      media: "state-warm",
      speaker: "ИРИНА В.",
      text: "Вот. Теперь ты слышишь не меня. Это комната.",
      choices: [
        {
          label: "ПРОДОЛЖИТЬ",
          next: "age-check"
        }
      ]
    },
    "sound-silent-response": {
      step: "ПРОВЕРКА КАНАЛА // ТИХИЙ РЕЖИМ",
      media: "state-warm",
      speaker: "ИРИНА В.",
      text: "Хорошо. В тишине я выгляжу добрее.",
      choices: [
        {
          label: "ПРОДОЛЖИТЬ",
          next: "age-check"
        }
      ]
    },
    "age-check": {
      step: "ПРОВЕРКА ДОПУСКА // 1 ИЗ 9",
      media: "state-neutral",
      speaker: "ИРИНА В.",
      text: "Я Ирина, куратор детских маршрутов. Этот канал — только для бывших детей. Тебе уже восемнадцать?",
      choices: [
        {
          label: "МНЕ УЖЕ 18",
          next: "adult-status"
        },
        {
          label: "МНЕ ЕЩЁ НЕТ 18",
          next: "minor-doctor-check"
        },
        {
          label: "НЕ ХОЧУ УКАЗЫВАТЬ",
          reject: "unverified"
        }
      ]
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
          effect: {
            flags: {
              claimsFormerChild: true
            }
          }
        },
        {
          label: "НЕ УВЕРЕН",
          next: "adult-certainty",
          effect: {
            flags: {
              questionsAdultStatus: true
            }
          }
        }
      ]
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
          next: "name-prompt",
          effect: {
            flags: {
              ageVerified: true
            }
          }
        },
        {
          label: "НЕТ",
          reject: "self-unverified"
        }
      ]
    },
    "name-prompt": {
      step: "ПРОВЕРКА ДОПУСКА // ЛИЧНАЯ ЗАПИСЬ",
      media: "state-file-investigation",
      speaker: "ИРИНА В.",
      text: "Подожди. В карточке вместо имени пустая строка. Как мне к тебе обращаться? Можно настоящее. Можно другое.",
      input: {
        kind: "displayName",
        label: "ИМЯ ДЛЯ СЛУЖЕБНОЙ ЗАПИСИ",
        placeholder: "ВВЕДИТЕ ИМЯ",
        submitLabel: "ПОДТВЕРДИТЬ ИМЯ",
        next: "name-ack"
      }
    },
    "name-ack": {
      step: "ПРОВЕРКА ДОПУСКА // ЛИЧНАЯ ЗАПИСЬ",
      media: "state-warm",
      speaker: "ИРИНА В.",
      text: () => {
        const displayName = readStaffProfile()?.displayName || "Так";
        return `Хорошо, ${displayName}. Я запишу так. Если это не настоящее имя, система всё равно привыкнет.`;
      },
      choices: [
        {
          label: "ПРОДОЛЖИТЬ",
          next: "adult-ack"
        }
      ]
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
          effect: {
            flags: {
              minorDoctorContract: true
            }
          }
        },
        {
          label: "НЕТ",
          next: "minor-inspector-check",
          effect: {
            flags: {
              minorDoctorContract: false
            }
          }
        }
      ]
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
          reject: "minor-inspected"
        },
        {
          label: "НЕТ",
          reject: "minor-unregistered"
        }
      ]
    },
    "adult-ack": {
      step: "ПРОВЕРКА ДОПУСКА // 1 ИЗ 9",
      media: "state-confidential",
      speaker: "ИРИНА В.",
      text: "Бывший ребёнок. С такими, как ты, мне можно разговаривать. Настоящих передают Старшему Проводнику. Зачем ты вернулся?",
      choices: [
        {
          label: "ХОЧУ ВСПОМНИТЬ ДЕТСТВО",
          next: "adult-reason",
          effect: {
            flags: {
              returnsForMemory: true
            }
          }
        },
        {
          label: "МНЕ НУЖНА РАБОТА",
          next: "adult-reason",
          effect: {
            flags: {
              returnsForWork: true
            }
          }
        },
        {
          label: "НЕ ЗНАЮ. МЕНЯ СЮДА ПРИВЕЛИ",
          next: "adult-reason",
          effect: {
            flags: {
              returnsWithoutReason: true
            }
          }
        }
      ]
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
          next: "orientation-one"
        }
      ]
    },
    "orientation-one": {
      step: "ВВОДНЫЙ ИНСТРУКТАЖ // ВОЗВРАЩЕНИЕ",
      media: "state-neutral",
      speaker: "ИРИНА В.",
      text: "Детей сюда приводят взрослые. Бывшие дети приходят сами — за работой, старой передачей или местом из сна.",
      choices: [
        {
          label: "И ЭТО СЧИТАЕТСЯ ВОЗВРАЩЕНИЕМ?",
          next: "orientation-two"
        }
      ]
    },
    "orientation-two": {
      step: "ВВОДНЫЙ ИНСТРУКТАЖ // ВОЗВРАЩЕНИЕ",
      media: "state-confidential",
      speaker: "ИРИНА В.",
      text: "Да. Возвращение — когда место помнит тебя лучше. Ты узнаёшь запах или музыку. Потом выясняется: у тебя был маршрут.",
      choices: [
        {
          label: "ТЫ ТОЖЕ СЮДА ВЕРНУЛАСЬ?",
          next: "orientation-three",
          effect: {
            flags: {
              askedIfIrinaReturned: true
            }
          }
        },
        {
          label: "У МЕНЯ УЖЕ ЕСТЬ МАРШРУТ?",
          next: "orientation-three",
          effect: {
            flags: {
              askedAboutOwnRoute: true
            }
          }
        }
      ]
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
          next: "orientation-personal"
        },
        {
          label: "МОЖЕМ НАЧИНАТЬ",
          next: "role-question"
        }
      ]
    },
    "orientation-personal": {
      step: "ВВОДНЫЙ ИНСТРУКТАЖ // КУРАТОР",
      media: "state-warm",
      speaker: "ИРИНА В.",
      text: "Мне нравится задавать вопросы взрослым. Если проверка пройдёт правильно, канал оставят мне ещё на одну смену.",
      choices: [
        {
          label: "ТОГДА НАЧИНАЙ",
          next: "role-question"
        }
      ]
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
            scores: {
              obedience: 1
            },
            flags: {
              choseAnimator: true
            }
          }
        },
        {
          label: "КТО ТАКОЙ ВОЛОНТЁР?",
          next: "role-volunteer",
          effect: {
            scores: {
              curiosity: 1
            },
            flags: {
              askedAboutVolunteer: true
            }
          }
        },
        {
          label: "НЕ ЗНАЮ. ПОСОВЕТУЙ",
          next: "role-delegate",
          effect: {
            scores: {
              delegation: 1
            },
            flags: {
              delegatedRole: true
            }
          }
        }
      ]
    },
    "role-animator": {
      step: "ВЫБОР РОЛИ // 2 ИЗ 9",
      media: "state-warm",
      speaker: "ИРИНА В.",
      text: "Хороший ответ. Аниматор принимает костюм, маршрут и длительность смены. Так удобнее: дальше выбирать почти не нужно.",
      choices: [
        {
          label: "ХОРОШО",
          next: "class-briefing-one"
        }
      ]
    },
    "role-volunteer": {
      step: "ВЫБОР РОЛИ // 2 ИЗ 9",
      media: "state-confidential",
      speaker: "ИРИНА В.",
      text: "Волонтёр приходит сам и ищет то, чего нет в маршруте. Смотреть ему можно. Чтобы уйти, нужно отдельное разрешение.",
      choices: [
        {
          label: "ПОНЯТНО",
          next: "class-briefing-one"
        }
      ]
    },
    "role-delegate": {
      step: "ВЫБОР РОЛИ // 2 ИЗ 9",
      media: "state-confidential",
      speaker: "ИРИНА В.",
      text: "Тогда я выберу за тебя. Мне недавно разрешили самой назначать роли. Я сейчас куратор.",
      choices: [
        {
          label: "ДОВЕРЯЮ ТЕБЕ",
          next: "class-briefing-one",
          effect: {
            scores: {
              delegation: 1
            }
          }
        }
      ]
    },
    "class-briefing-one": {
      step: "КЛАССЫ УЧАСТИЯ // ОБЩИЕ ПРАВИЛА",
      media: "state-neutral",
      speaker: "ИРИНА В.",
      text: "Коротко: Аниматор становится частью места. Волонтёр остаётся посетителем, пока сам не попросит следующий уровень.",
      choices: [
        {
          label: "А КТО МОЖЕТ ПРОСТО УЙТИ?",
          next: "class-briefing-two",
          effect: {
            flags: {
              askedWhoCanLeave: true
            }
          }
        },
        {
          label: "А КОМУ МОЖНО СМОТРЕТЬ ПО СТОРОНАМ?",
          next: "class-briefing-two",
          effect: {
            flags: {
              askedWhoCanLook: true
            }
          }
        }
      ]
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
          next: "class-briefing-three"
        }
      ]
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
          effect: {
            flags: {
              reassuredIrina: true
            }
          }
        },
        {
          label: "Я НАЧИНАЮ К ТЕБЕ ПРИВЫКАТЬ",
          next: "rapport-response",
          effect: {
            flags: {
              gettingUsedToIrina: true
            }
          }
        }
      ]
    },
    "rapport-response": {
      step: "КАНАЛ 0091-A // КОНТАКТ",
      media: "intrusion-disco-room",
      sound: "disco-room-music",
      feedState: "НЕЗАПЛАНИРОВАННОЕ ОСВЕЩЕНИЕ",
      signal: 31,
      speaker: "ИРИНА В.",
      text: (progress) =>
        progress.flags.reassuredIrina
          ? "Хорошо. Я иногда проверяю. Здесь легко не заметить, что собеседник уже ушёл."
          : "Привыкать тоже считается. В Центре это почти дружба.",
      glitchIn: true,
      delayChoicesUntilEnd: true,
      choices: [
        {
          label: "ЧТО ЭТО БЫЛО?",
          next: "disco-response"
        }
      ]
    },
    "disco-response": {
      step: "КАНАЛ 0091-A // КОНТАКТ",
      media: "state-warm",
      feedState: "ПРЯМОЙ КАНАЛ",
      signal: 64,
      speaker: "ИРИНА В.",
      text: "Не знаю. В «Детском жире» всегда так.",
      choices: [
        {
          label: "ПРОВЕРЬ, КТО Я",
          next: "waiting-test"
        }
      ]
    },
    "waiting-test": {
      step: "СИТУАЦИЯ // 3 ИЗ 9",
      media: "state-neutral",
      speaker: "ИРИНА В.",
      text: "Служебная ситуация. Родители оставили ребёнка у входа и обещали вернуться через пять минут. Что ему делать?",
      choices: [
        {
          label: "ЖДАТЬ НА ТОМ ЖЕ МЕСТЕ",
          next: "waiting-response",
          effect: {
            profiles: {
              animator: 1
            },
            scores: {
              obedience: 1
            },
            flags: {
              waitedForParents: true
            }
          }
        },
        {
          label: "ПОЙТИ ИСКАТЬ РОДИТЕЛЕЙ",
          next: "waiting-response",
          effect: {
            profiles: {
              volunteer: 1
            },
            scores: {
              curiosity: 1
            },
            flags: {
              searchedForParents: true
            }
          }
        },
        {
          label: "ПОЗВАТЬ КОГО-ТО ИЗ ВЗРОСЛЫХ",
          next: "waiting-response",
          effect: {
            profiles: {
              animator: 1
            },
            scores: {
              delegation: 1
            },
            flags: {
              calledAdult: true
            }
          }
        }
      ]
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
          next: "parents-rule-one"
        }
      ]
    },
    "parents-rule-one": {
      step: "СЛУЖЕБНАЯ СИТУАЦИЯ // ОЖИДАНИЕ",
      media: "state-confidential",
      speaker: "ИРИНА В.",
      text: "Пять минут — не время, а обещание. Пока ребёнок ждёт на месте, по документам родители всё ещё возвращаются.",
      choices: [
        {
          label: "А ЕСЛИ ОНИ НЕ СОБИРАЛИСЬ ВОЗВРАЩАТЬСЯ?",
          next: "parents-rule-two",
          effect: {
            flags: {
              questionedParentsReturn: true
            }
          }
        },
        {
          label: "И СКОЛЬКО ДЛЯТСЯ ЭТИ ПЯТЬ МИНУТ?",
          next: "parents-rule-two",
          effect: {
            flags: {
              questionedWaitingTime: true
            }
          }
        }
      ]
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
          next: "parents-rule-three"
        }
      ]
    },
    "parents-rule-three": {
      step: "СЛУЖЕБНАЯ СИТУАЦИЯ // ЗАКРЫТА",
      media: "state-neutral",
      speaker: "ИРИНА В.",
      text: "Нет. Меня оформили на работу. Это другое: у меня были костюм, питание и место ожидания. Давай следующий вопрос.",
      choices: [
        {
          label: "СЛЕДУЮЩИЙ ВОПРОС",
          next: "memory-drawing"
        }
      ]
    },
    "memory-drawing": {
      step: "ИСТОЧНИК НЕ ОПРЕДЕЛЁН",
      still: "assets/staff/curators/irina/artifacts/memory-drawing.webp",
      sound: "child-laugh-distant",
      stillAlt: "Детский рисунок: серое здание у леса, Медведь возле двери и взрослые фигуры, уходящие прочь",
      feedMode: "document",
      feedState: "ЛИЧНЫЙ ФАЙЛ ВОССТАНОВЛЕН",
      signal: 42,
      speaker: "ИРИНА В.",
      text: "Странно. Я не открывала архив. Ты помнишь, как нарисовал это в детстве?",
      choices: [
        {
          label: "ДА. КАЖЕТСЯ, ПОМНЮ",
          next: "memory-response",
          effect: {
            flags: {
              remembersDrawing: true
            }
          }
        },
        {
          label: "НЕТ. Я ЭТОГО НЕ РИСОВАЛ",
          next: "memory-response",
          effect: {
            flags: {
              deniesDrawing: true
            }
          }
        },
        {
          label: "ПОЧЕМУ МЕДВЕДЬ СТОИТ У ДВЕРИ?",
          next: "memory-response",
          effect: {
            flags: {
              noticedDrawingBear: true
            }
          }
        }
      ]
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
          next: "drawing-history"
        }
      ]
    },
    "drawing-history": {
      step: "ЛИЧНЫЙ ФАЙЛ // ПРОИСХОЖДЕНИЕ",
      media: "state-confidential",
      speaker: "ИРИНА В.",
      text: "Администрация читает рисунки так: есть дверь — ребёнок согласился войти; взрослые у края — они уже ушли.",
      choices: [
        {
          label: "А ЕСЛИ РЕБЁНОК НЕ СОГЛАШАЛСЯ?",
          next: "drawing-missing",
          effect: {
            flags: {
              questionedDrawingConsent: true
            }
          }
        },
        {
          label: "КТО РЕШАЕТ, ЧТО НАРИСОВАНО?",
          next: "drawing-missing",
          effect: {
            flags: {
              questionedDrawingReading: true
            }
          }
        }
      ]
    },
    "drawing-missing": {
      step: "ЛИЧНЫЙ ФАЙЛ // НЕПОЛНАЯ КОМПОЗИЦИЯ",
      still: "assets/staff/curators/irina/artifacts/memory-drawing.webp",
      stillAlt: "Детский рисунок с серым зданием, лесом, Медведем и уходящими взрослыми",
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
          effect: {
            flags: {
              drawingMissingExit: true
            }
          }
        },
        {
          label: "ЛИЦ ВЗРОСЛЫХ",
          next: "drawing-missing-response",
          effect: {
            flags: {
              drawingMissingFaces: true
            }
          }
        },
        {
          label: "ТЕБЯ РЯДОМ С МЕДВЕДЕМ",
          next: "drawing-missing-response",
          effect: {
            flags: {
              drawingMissingSelf: true
            }
          }
        }
      ]
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
          next: "image-test"
        }
      ]
    },
    "image-test": {
      step: "ВИЗУАЛЬНАЯ ПРОВЕРКА // 4 ИЗ 9",
      media: "state-neutral",
      speaker: "ИРИНА В.",
      text: "Перед входом можно выбрать маршрут. Слева ждут сотрудники. Справа открыта незарегистрированная дверь. Куда ты пойдёшь?",
      choices: [
        {
          label: "МАРШРУТ С СОПРОВОЖДЕНИЕМ",
          image: "assets/staff/photos/polaroid-mascot-corridor.webp",
          imageAlt: "Группа Аниматоров в костюмах стоит в служебном коридоре",
          next: "image-response",
          effect: {
            profiles: {
              animator: 1
            },
            flags: {
              choseMascotFeed: true
            }
          }
        },
        {
          label: "НЕЗАРЕГИСТРИРОВАННАЯ ДВЕРЬ",
          image: "assets/staff/photos/polaroid-play-area.webp",
          imageAlt: "Пустая игровая зона с открытой красной служебной дверью",
          next: "image-response",
          effect: {
            profiles: {
              volunteer: 1
            },
            scores: {
              curiosity: 1
            },
            flags: {
              choseOpenDoorFeed: true
            }
          }
        }
      ]
    },
    "image-response": {
      step: "ВИЗУАЛЬНАЯ ПРОВЕРКА // 4 ИЗ 9",
      still: "assets/staff/curators/irina/artifacts/service-route-map.webp",
      stillAlt: "Старая служебная карта комплекса с цветными маршрутами, заклеенным сектором и зачёркнутыми помещениями",
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
          next: "wristband-test"
        }
      ]
    },
    "wristband-test": {
      step: "СЛУЖЕБНАЯ СИТУАЦИЯ // 5 ИЗ 9",
      media: "state-neutral",
      speaker: "ИРИНА В.",
      text: "У закрытой двери лежит детский браслет с завтрашней датой. По журналу его ещё не выдавали. Что ты сделаешь?",
      choices: [
        {
          label: "ПЕРЕДАМ БРАСЛЕТ КУРАТОРУ",
          next: "wristband-response",
          effect: {
            profiles: {
              animator: 1
            },
            scores: {
              delegation: 1
            },
            flags: {
              reportedTomorrowBand: true
            }
          }
        },
        {
          label: "ПОЙДУ ПО НОМЕРУ МАРШРУТА НА БРАСЛЕТЕ",
          next: "wristband-response",
          effect: {
            profiles: {
              volunteer: 1
            },
            scores: {
              curiosity: 1
            },
            flags: {
              followedTomorrowBand: true
            }
          }
        },
        {
          label: "НАДЕНУ ЕГО И ПРОВЕРЮ ДВЕРЬ",
          next: "wristband-response",
          effect: {
            profiles: {
              volunteer: 1
            },
            scores: {
              curiosity: 1
            },
            flags: {
              woreTomorrowBand: true
            }
          }
        }
      ]
    },
    "wristband-response": {
      step: "СЛУЖЕБНАЯ СИТУАЦИЯ // 5 ИЗ 9",
      still: "assets/staff/curators/irina/artifacts/blue-key-evidence.webp",
      stillAlt: "Потёртый синий служебный ключ без бирки лежит на мокром зелёном столе рядом с документами",
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
          next: "wristband-explain"
        }
      ]
    },
    "wristband-explain": {
      step: "СЛУЖЕБНАЯ СИТУАЦИЯ // УЧЁТ",
      still: "assets/staff/curators/irina/artifacts/assigned-toy-polaroid.webp",
      stillAlt: "Старая фотография: плюшевый кролик с пустой служебной биркой сидит на детском стуле перед тёмной дверью",
      feedMode: "document",
      feedState: "ПРЕДМЕТ ОЖИДАЕТ НАЗНАЧЕНИЯ",
      speaker: "ИРИНА В.",
      text: "У нас вещи появляются раньше владельцев. Браслет, маска или игрушка сначала попадают в учёт, а потом ждут тело.",
      choices: [
        {
          label: "ПОНЯТНО. ЧТО ДАЛЬШЕ?",
          next: "damaged-file-arrival"
        }
      ]
    },
    "damaged-file-arrival": {
      step: "ВХОДЯЩИЙ МАТЕРИАЛ // ДЕЛО ПОВРЕЖДЕНО",
      media: "action-damaged-file-arrival",
      feedState: "НЕЗАРЕГИСТРИРОВАННАЯ ПЕРЕДАЧА",
      signal: 38,
      glitchIn: true,
      delayChoicesUntilEnd: true,
      speaker: "ИРИНА В.",
      text: "Подожди. В канал попало детское дело. Я его не запрашивала. Папка мокрая, а журнал говорит, что такого ребёнка нет.",
      choices: [
        {
          label: "ОТКРОЙ ДЕЛО",
          next: "file-recognition",
          effect: {
            routeMark: "file-opened"
          }
        }
      ]
    },
    "file-recognition": {
      step: "ДЕЛО РЕБЁНКА // СВЕРКА",
      media: "action-file-recognition",
      feedState: "ЗАПИСЬ В ЖУРНАЛЕ НЕ НАЙДЕНА",
      signal: 52,
      delayChoicesUntilEnd: true,
      speaker: "ИРИНА В.",
      text: "Здесь нет имени и фотографии. Только ответы и маршрут. Один ответ уже совпал с твоим. Такое бывает, если дело ждёт человека раньше тела.",
      choices: [
        {
          label: "СВЕРЬСЯ С БУМАЖНЫМ ЖУРНАЛОМ",
          next: "damaged-file-evidence",
          effect: {
            routeMark: "journal-checked",
            flags: {
              requestedPaperCheck: true
            }
          }
        }
      ]
    },
    "damaged-file-evidence": {
      step: "ДЕЛО РЕБЁНКА // МЕТКА 03",
      still: "assets/staff/curators/irina/artifacts/damaged-child-file.webp",
      stillAlt: "Повреждённая папка детского дела с вырванной фотографией, зачёркнутым именем и схемой маршрута",
      feedMode: "document",
      feedState: "ИСТОЧНИК НЕ ОПРЕДЕЛЁН",
      signal: 47,
      speaker: "ИРИНА В.",
      text: "В журнале между страницами вырвано место. Что делать с оригиналом: оставить у меня или искать маршрут, пока канал его показывает?",
      choices: [
        {
          label: "ОСТАВЬ ОРИГИНАЛ У СЕБЯ",
          next: "file-similarity",
          effect: {
            profiles: {
              animator: 1
            },
            scores: {
              delegation: 1
            },
            flags: {
              entrustedDamagedFile: true
            },
            routeMark: "file-secured"
          }
        },
        {
          label: "ИЩИ, КУДА ВЕДЁТ МАРШРУТ",
          next: "file-similarity",
          effect: {
            profiles: {
              volunteer: 1
            },
            scores: {
              curiosity: 1
            },
            flags: {
              tracedDamagedFile: true
            },
            routeMark: "file-traced"
          }
        }
      ]
    },
    "file-similarity": {
      step: "ДЕЛО РЕБЁНКА // СОВПАДЕНИЕ",
      media: "state-file-investigation",
      feedState: "СРАВНЕНИЕ С ТЕКУЩИМ СЕАНСОМ",
      signal: 55,
      speaker: "ИРИНА В.",
      text: (progress) => {
        const firstMatch = progress.flags.waitedForParents
          ? "Он тоже решил ждать там, где его оставили."
          : progress.flags.searchedForParents
            ? "Он тоже ушёл искать взрослых."
            : "Он тоже позвал взрослого, чтобы тот выбрал место.";
        const routeMatch = progress.flags.choseOpenDoorFeed
          ? "Потом выбрал незарегистрированную дверь."
          : "Потом выбрал маршрут с сопровождением.";
        return `${firstMatch} ${routeMatch} Я не вписывала твои ответы в это дело.`;
      },
      choices: [
        {
          label: "ЭТО МОЁ ДЕЛО?",
          next: "file-similarity-response",
          effect: {
            flags: {
              askedIfOwnFile: true
            },
            routeMark: "identity-compared"
          }
        },
        {
          label: "РЕБЁНОК ПОВТОРЯЕТ МОЙ МАРШРУТ?",
          next: "file-similarity-response",
          effect: {
            flags: {
              askedIfChildRepeatsRoute: true
            },
            routeMark: "route-compared"
          }
        }
      ]
    },
    "file-similarity-response": {
      step: "ДЕЛО РЕБЁНКА // НОМЕР НАЗНАЧЕНИЯ",
      media: "state-file-investigation",
      feedState: "СРАВНЕНИЕ НЕ ЗАВЕРШЕНО",
      signal: 50,
      speaker: "ИРИНА В.",
      text: (progress) =>
        progress.flags.askedIfOwnFile
          ? "Не знаю. У твоего дела должно быть взрослое имя. Здесь имя вытерли до того, как ребёнок потерялся."
          : "Или ты повторяешь его. Маршрут старше этого звонка. Остался номер назначения, но его держит другой терминал.",
      choices: [
        {
          label: "ОТКРЫТЬ ТЕРМИНАЛ",
          next: "lost-child-terminal"
        }
      ]
    },
    "lost-child-terminal": {
      step: "LOST CHILD TERMINAL™ // ЗАПРОС",
      terminal: true,
      feedMode: "terminal",
      feedState: "ОЖИДАНИЕ ФИЗИЧЕСКОГО ВВОДА",
      signal: 71,
      speaker: "СИСТЕМА",
      text: "Терминал требует подтвердить потерю. Вариант отказа не предусмотрен. Выберите физическую клавишу.",
      choices: [
        {
          label: "ЛЕВАЯ КЛАВИША — ДА",
          next: "lost-terminal-ticket",
          effect: {
            flags: {
              terminalYesLeft: true
            },
            routeMark: "terminal-confirmed"
          }
        },
        {
          label: "ПРАВАЯ КЛАВИША — ДА",
          next: "lost-terminal-ticket",
          effect: {
            flags: {
              terminalYesRight: true
            },
            routeMark: "terminal-confirmed"
          }
        }
      ]
    },
    "lost-terminal-ticket": {
      step: "LOST CHILD TERMINAL™ // БИЛЕТ НАПЕЧАТАН",
      still: "assets/staff/curators/irina/artifacts/lost-child-route-ticket.webp",
      stillAlt: "Длинный старый маршрутный билет со схемой из горки, служебной двери и пустого бассейна",
      feedMode: "document",
      feedState: "СЛЕДУЙ ЗА МНОЙ",
      signal: 68,
      speaker: "ИРИНА В.",
      text: "Он напечатал билет. Последняя точка зачёркнута. Можно послушаться, отдать билет мне или проверить, что терминал пытается скрыть.",
      choices: [
        {
          label: "СЛЕДОВАТЬ БИЛЕТУ",
          next: "terminal-ticket-response",
          effect: {
            profiles: {
              animator: 1
            },
            scores: {
              obedience: 1
            },
            flags: {
              followedTerminalTicket: true
            },
            routeMark: "ticket-processed"
          }
        },
        {
          label: "ПЕРЕДАТЬ БИЛЕТ ИРИНЕ",
          next: "terminal-ticket-response",
          effect: {
            profiles: {
              animator: 1
            },
            scores: {
              delegation: 1
            },
            flags: {
              gaveTicketToIrina: true
            },
            routeMark: "ticket-processed"
          }
        },
        {
          label: "СРАВНИТЬ С КАРТОЙ",
          next: "terminal-ticket-response",
          effect: {
            profiles: {
              volunteer: 1
            },
            scores: {
              curiosity: 1
            },
            flags: {
              comparedTerminalTicket: true
            },
            routeMark: "ticket-processed"
          }
        },
        {
          label: "ПРОВЕРИТЬ НОМЕР НАЗНАЧЕНИЯ",
          next: "terminal-ticket-response",
          effect: {
            profiles: {
              volunteer: 1
            },
            scores: {
              curiosity: 1
            },
            flags: {
              inspectedTicketDestination: true
            },
            routeMark: "ticket-processed"
          }
        }
      ]
    },
    "terminal-ticket-response": {
      step: "МАРШРУТ РЕБЁНКА // ВОССТАНОВЛЕНИЕ",
      media: "state-file-investigation",
      feedState: "ДВЕ ТОЧКИ СОВПАЛИ",
      signal: 58,
      speaker: "ИРИНА В.",
      text: (progress) => {
        if (progress.flags.followedTerminalTicket) {
          return "Билет ведёт сам. Это удобно, пока не замечаешь: он возвращает потерянного не туда, где его ждут, а туда, где есть свободное место.";
        }
        if (progress.flags.gaveTicketToIrina) {
          return "Я возьму. Только билет уже записал, что сопровождение принято. Он считает куратором того, кто первым нажал «ДА».";
        }
        if (progress.flags.inspectedTicketDestination) {
          return "Под зачёркнутым номером — текущий канал. Не мой ID. Именно этот сеанс.";
        }
        return "Линия совпала с картой до последней точки. Потом маршрут выходит из бумаги и возвращается в текущий канал.";
      },
      choices: [
        {
          label: "ПОКАЗАТЬ ПОСЛЕДНИЕ ФОТОГРАФИИ",
          next: "route-photo-choice"
        }
      ]
    },
    "route-photo-choice": {
      step: "МАРШРУТ РЕБЁНКА // ПОСЛЕДНЯЯ ТОЧКА",
      media: "state-file-investigation",
      feedState: "ВИЗУАЛЬНАЯ СВЕРКА",
      signal: 61,
      speaker: "ИРИНА В.",
      text: "Остались два кадра. В игровой зоне можно ждать сопровождающего. В пустом бассейне след заканчивается у трубы. Куда смотреть?",
      choices: [
        {
          label: "ЖДАТЬ В ИГРОВОЙ ЗОНЕ",
          image: "assets/staff/photos/polaroid-play-area.webp",
          imageAlt: "Пустая игровая зона с красной служебной дверью",
          next: "route-photo-response",
          effect: {
            profiles: {
              animator: 1
            },
            scores: {
              obedience: 1
            },
            flags: {
              waitedAtPlayArea: true
            },
            routeMark: "last-location-found"
          }
        },
        {
          label: "ПРОВЕРИТЬ ПУСТОЙ БАССЕЙН",
          image: "assets/staff/photos/polaroid-empty-pool.webp",
          imageAlt: "Пустой закрытый бассейн с розовой водой и детской горкой",
          next: "route-photo-response",
          effect: {
            profiles: {
              volunteer: 1
            },
            scores: {
              curiosity: 1
            },
            flags: {
              checkedEmptyPool: true
            },
            routeMark: "last-location-found"
          }
        }
      ]
    },
    "route-photo-response": {
      step: "МАРШРУТ РЕБЁНКА // ЭФИРНЫЙ ВХОД",
      media: "state-file-investigation",
      feedState: "ИСТОЧНИК 002 ОБНАРУЖЕН",
      signal: 43,
      speaker: "ИРИНА В.",
      text: (progress) =>
        progress.flags.checkedEmptyPool
          ? "На дне нет ребёнка. Только кабель от старого телевизора. Он всё ещё передаёт выпуск."
          : "Сопровождающий не пришёл. Телевизор над игровой зоной включился сам. Там задают вопрос.",
      choices: [
        {
          label: "ПРОВЕРИТЬ ПЕРЕДАЧУ",
          next: "elena-question-one"
        }
      ]
    },
    "elena-question-one": {
      step: "АРХИВНЫЙ ЭФИР // «ПРАВИЛЬНЫЙ ОТВЕТ»",
      media: "archive-elena-question",
      feedMode: "archive",
      feedState: "ИСТОЧНИК 002 // ВОПРОС 01",
      signal: 36,
      sound: "elena-tick-loop",
      soundAfterText: true,
      soundLoop: true,
      delayChoicesUntilEnd: true,
      speaker: "ЕЛЕНА ПРАВИЛЬНАЯ",
      text: "Ребёнка нет в журнале. Кто имеет право решить, куда он пойдёт?",
      choices: [
        {
          label: "ОТМЕТИТЬ НАРУШЕНИЕ ЭФИРА",
          next: "elena-question-two",
          effect: {
            profiles: {
              animator: 1
            },
            flags: {
              reportedElenaBroadcast: true
            },
            routeMark: "broadcast-handled"
          }
        },
        {
          label: "ПОЗВАТЬ ИРИНУ",
          next: "elena-question-two",
          effect: {
            profiles: {
              animator: 1
            },
            scores: {
              delegation: 1
            },
            flags: {
              calledIrinaDuringQuiz: true
            },
            routeMark: "broadcast-handled"
          }
        },
        {
          label: "ЗАКРЫТЬ ОБЪЕКТИВ",
          next: "elena-question-two",
          effect: {
            profiles: {
              volunteer: 1
            },
            flags: {
              coveredElenaLens: true
            },
            routeMark: "broadcast-handled"
          }
        },
        {
          label: "ИССЛЕДОВАТЬ ИСТОЧНИК",
          next: "elena-question-two",
          effect: {
            profiles: {
              volunteer: 1
            },
            scores: {
              curiosity: 1
            },
            flags: {
              investigatedElenaBroadcast: true
            },
            routeMark: "broadcast-handled"
          }
        }
      ]
    },
    "elena-question-two": {
      step: "АРХИВНЫЙ ЭФИР // «ПРАВИЛЬНЫЙ ОТВЕТ»",
      media: "archive-elena-question",
      feedMode: "archive",
      feedState: "ИСТОЧНИК 002 // ВОПРОС 02",
      signal: 29,
      sound: "elena-tick-loop",
      soundAfterText: true,
      soundLoop: true,
      delayChoicesUntilEnd: true,
      speaker: "ЕЛЕНА ПРАВИЛЬНАЯ",
      text: "Если дело повторяет ваши ответы, согласны ли вы занять место отсутствующего ребёнка?",
      choices: [
        {
          label: "ОТВЕТИТЬ ЕЛЕНЕ: НЕТ",
          next: "elena-breach",
          effect: {
            profiles: {
              animator: 1
            },
            scores: {
              obedience: 1
            },
            flags: {
              answeredElena: true
            }
          }
        },
        {
          label: "НЕ ОТВЕЧАТЬ ВЕДУЩЕЙ",
          next: "elena-breach",
          effect: {
            profiles: {
              volunteer: 1
            },
            flags: {
              refusedElenaFormat: true
            }
          }
        },
        {
          label: "ЗАКРЫТЬ ПЕРЕДАЧУ",
          next: "elena-breach",
          effect: {
            profiles: {
              volunteer: 1
            },
            flags: {
              closedElenaFeed: true
            }
          }
        }
      ]
    },
    "elena-breach": {
      step: "АРХИВНЫЙ ЭФИР // НАРУШЕНИЕ ФОРМАТА",
      media: "archive-elena-breach",
      feedMode: "archive",
      feedState: "ЗРИТЕЛЬ ЗАРЕГИСТРИРОВАН",
      signal: 12,
      sound: "elena-breach-transition",
      delayChoicesUntilEnd: true,
      speaker: "ЕЛЕНА ПРАВИЛЬНАЯ",
      text: "Это правильный ответ. Свободное место найдено в текущем сеансе.",
      autoNext: "irina-reconnect"
    },
    "irina-reconnect": {
      step: "ВОССТАНОВЛЕНИЕ КАНАЛА // 0091-A",
      media: "action-irina-reconnect",
      feedState: "КУРАТОР ВОЗВРАЩЁН",
      signal: 41,
      glitchIn: true,
      delayChoicesUntilEnd: true,
      speaker: "ИРИНА В.",
      text: "Ты здесь? Не отвечай ей больше. Она не проверяет знания. Ей нужен сам ответ — любой.",
      autoNext: "irina-reconnect-response"
    },
    "irina-reconnect-response": {
      step: "КАНАЛ 0091-A // ЛИЧНАЯ ЗАПИСЬ",
      media: "state-file-investigation",
      feedState: "СИСТЕМНАЯ СВЕРКА ОТКЛОНЕНА",
      signal: 53,
      speaker: "ИРИНА В.",
      text: (progress) =>
        progress.flags.answeredElena
          ? "Ты сказал ей «нет», но она услышала только участие. Старые передачи так устроены: смысл ответа им не нужен."
          : "Хорошо, что ты не стал отвечать по её правилам. Но она всё равно вписала тебя как зрителя. Канал уже смотрел в ответ.",
      choices: [
        {
          label: "ЧТО БУДЕТ С ДЕЛОМ?",
          next: "file-preservation-choice"
        }
      ]
    },
    "file-preservation-choice": {
      step: "ДЕЛО РЕБЁНКА // РЕЗЕРВНАЯ КОПИЯ",
      media: "state-file-investigation",
      feedState: "СИСТЕМА ТРЕБУЕТ ВОЗВРАТА",
      signal: 48,
      speaker: "ИРИНА В.",
      text: "Система просит вернуть дело в канал. Если я впишу ребёнка в бумажный журнал, запись останется здесь, даже когда экран забудет.",
      choices: [
        {
          label: "ВПИШИ РЕБЁНКА В БУМАЖНЫЙ ЖУРНАЛ",
          next: "file-preserved",
          effect: {
            profiles: {
              volunteer: 1
            },
            flags: {
              requestedPaperPreservation: true
            },
            routeMark: "file-preserved"
          }
        },
        {
          label: "ОСТАВЬ ДЕЛО В КАНАЛЕ",
          next: "file-preserved",
          effect: {
            profiles: {
              animator: 1
            },
            scores: {
              obedience: 1
            },
            flags: {
              leftFileInChannel: true
            },
            routeMark: "file-preserved"
          }
        }
      ]
    },
    "file-preserved": {
      step: "ДЕЛО РЕБЁНКА // БУМАЖНАЯ КОПИЯ",
      media: "action-file-preserved",
      feedState: "ЛОКАЛЬНАЯ ЗАПИСЬ СОЗДАНА",
      signal: 59,
      delayChoicesUntilEnd: true,
      speaker: "ИРИНА В.",
      text: (progress) =>
        progress.flags.leftFileInChannel
          ? "Нет. В канале оно снова станет твоим. Я внесу ребёнка сама. Я сейчас куратор."
          : "Хорошо. В журнале нет кнопки отмены. Наверное, поэтому Администрация почти перестала давать нам бумагу.",
      autoNext: "file-preserved-response"
    },
    "file-preserved-response": {
      step: "МАРШРУТ ВОССТАНОВЛЕН // 9 ИЗ 9",
      media: "state-file-investigation",
      feedState: "ДЕЛО СОХРАНЕНО",
      signal: 63,
      speaker: "ИРИНА В.",
      text: "Теперь у него есть место в журнале. Имя всё ещё пустое. Если дело снова покажет твои ответы, это не доказывает, что ребёнок — ты.",
      choices: [
        {
          label: "ПРОДОЛЖИТЬ ПРОВЕРКУ",
          next: "recognition-card"
        }
      ]
    },
    "recognition-card": {
      step: "ПРОВЕРКА ДЕТСКОГО РАСПОЗНАВАНИЯ",
      still: "assets/staff/curators/irina/artifacts/recognition-cat-rabbit.webp",
      stillAlt: "Симметричное чёрное чернильное пятно, похожее одновременно на кота и кролика",
      feedMode: "document",
      feedState: "КАРТОЧКА 04",
      signal: 66,
      speaker: "ИРИНА В.",
      text: "Ещё одна карточка. Здесь нужно отвечать быстро. Что ты видишь: котика или кролика?",
      choices: [
        {
          label: "КОТИКА",
          next: "recognition-cat",
          effect: {
            flags: {
              sawCat: true
            }
          }
        },
        {
          label: "КРОЛИКА",
          next: "recognition-rabbit",
          effect: {
            flags: {
              sawRabbit: true
            }
          }
        },
        {
          label: "ПРОСТО ПЯТНО",
          next: "recognition-ink",
          effect: {
            flags: {
              sawInk: true
            }
          }
        }
      ]
    },
    "recognition-cat": {
      step: "ПОБОЧНЫЙ КАНАЛ // ПАВЕЛ К.",
      media: "cctv-pavel-observation-booth",
      feedMode: "cctv",
      feedState: "КАБИНКА ОБОЗРЕНИЯ 06",
      signal: 39,
      speaker: "ИРИНА В.",
      text: "Я тоже вижу котика. У нас есть кот Паша — оператор кабинок обозрения. Он всегда улыбается в камеру.",
      delayChoicesUntilEnd: true,
      choices: [
        {
          label: "ОН ВИДИТ НАС СЕЙЧАС?",
          next: "pavel-response",
          effect: {
            flags: {
              askedIfPavelSees: true
            }
          }
        },
        {
          label: "ОН ДЕЙСТВИТЕЛЬНО КОТ?",
          next: "pavel-response",
          effect: {
            flags: {
              askedIfPavelCat: true
            }
          }
        }
      ]
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
          next: "loneliness"
        }
      ]
    },
    "recognition-rabbit": {
      step: "ПРОВЕРКА ДЕТСКОГО РАСПОЗНАВАНИЯ",
      media: "state-warm",
      feedState: "КАРТОЧКА ПРИНЯТА",
      speaker: "ИРИНА В.",
      text: "Раньше здесь был кролик. Потом его перевели на маршрут без камер. На старых карточках он всё равно появляется.",
      choices: [
        {
          label: "ПОНЯТНО",
          next: "loneliness"
        }
      ]
    },
    "recognition-ink": {
      step: "ПРОВЕРКА ДЕТСКОГО РАСПОЗНАВАНИЯ",
      media: "state-confidential",
      feedState: "ОТВЕТ НЕ КЛАССИФИЦИРОВАН",
      speaker: "ИРИНА В.",
      text: "Просто пятен не бывает. Если картинка ничего не напоминает, Администрация назначает воспоминание. Запишу: котик.",
      choices: [
        {
          label: "ЛАДНО. ДАВАЙ ДАЛЬШЕ",
          next: "loneliness"
        }
      ]
    },
    loneliness: {
      step: "НЕЗАПЛАНИРОВАННЫЙ ВОПРОС",
      media: "state-confidential",
      feedState: "ПРЯМОЙ КАНАЛ",
      speaker: "ИРИНА В.",
      text: "У Паши много кабинок. У меня только этот канал. Здесь у меня нет друзей. Есть сотрудники, но это другое, наверное.",
      choices: [
        {
          label: "МНЕ ЖАЛЬ, ЧТО ТЫ ЗДЕСЬ ОДНА",
          next: "private-file-video",
          effect: {
            flags: {
              empathizedWithIrina: true
            }
          }
        },
        {
          label: "А МЕДВЕДЬ?",
          next: "loneliness-bear",
          effect: {
            flags: {
              calledBearFriend: true
            }
          }
        },
        {
          label: "НАМ НУЖНО ПРОДОЛЖИТЬ ПРОВЕРКУ",
          next: "loneliness-formal",
          effect: {
            flags: {
              keptFormalDistance: true
            }
          }
        }
      ]
    },
    "private-file-video": {
      step: "НЕЗАПЛАНИРОВАННАЯ ПЕРЕДАЧА",
      media: "action-private-file",
      feedState: "ИСХОДЯЩИЙ ФАЙЛ",
      signal: 48,
      speaker: "ИРИНА В.",
      text: "Ничего. Сейчас я уже не совсем одна. У меня для тебя кое-что есть. Только не показывай Старшему Проводнику.",
      delayChoicesUntilEnd: true,
      choices: [
        {
          label: "ПРИНЯТЬ ФАЙЛ",
          next: "private-file-accepted",
          downloadFile: "irina-private-photo",
          effect: {
            files: [
              "irina-private-photo"
            ],
            flags: {
              acceptedPrivatePhoto: true
            }
          }
        },
        {
          label: "ПУСТЬ ОСТАНЕТСЯ У ТЕБЯ",
          next: "private-file-declined",
          effect: {
            flags: {
              declinedPrivatePhoto: true
            }
          }
        }
      ]
    },
    "private-file-accepted": {
      step: "ФАЙЛ ПОЛУЧЕН // 1",
      media: "state-warm",
      feedState: "ПЕРЕДАЧА ЗАВЕРШЕНА",
      speaker: "ИРИНА В.",
      text: "Это я в фотокабинке торгового центра. Там можно было сделать четыре фотографии. Теперь ты меня не забудешь.",
      choices: [
        {
          label: "НЕ ЗАБУДУ",
          next: "costume-test",
          effect: {
            flags: {
              promisedNotToForget: true
            }
          }
        }
      ]
    },
    "private-file-declined": {
      step: "ПЕРЕДАЧА ОТМЕНЕНА",
      media: "state-neutral",
      speaker: "ИРИНА В.",
      text: "Хорошо. Я оставлю её у себя. Фотографии тоже могут подождать, если не выключать свет.",
      choices: [
        {
          label: "ХОРОШО. ДАВАЙ ДАЛЬШЕ",
          next: "costume-test"
        }
      ]
    },
    "loneliness-bear": {
      step: "НЕЗАПЛАНИРОВАННЫЙ ВОПРОС",
      media: "state-confidential",
      speaker: "ИРИНА В.",
      text: "Медведь — не друг. Медведь работает вместе со мной. Друзьям разрешено видеть лица, а ему моё лицо мешает.",
      choices: [
        {
          label: "ПОНЯТНО. ДАВАЙ ДАЛЬШЕ",
          next: "costume-test"
        }
      ]
    },
    "loneliness-formal": {
      step: "СЛУЖЕБНЫЙ КАНАЛ ВОССТАНОВЛЕН",
      media: "state-neutral",
      speaker: "ИРИНА В.",
      text: "Хорошо. Так удобнее. Сотрудники тоже обычно просят меня перейти к следующему вопросу.",
      choices: [
        {
          label: "СЛЕДУЮЩИЙ ВОПРОС",
          next: "costume-test"
        }
      ]
    },
    "costume-test": {
      step: "СЛУЖЕБНАЯ СИТУАЦИЯ // 6 ИЗ 9",
      media: "state-neutral",
      sound: "baby-cry-costume",
      speaker: "ИРИНА В.",
      text: "Во время смены из соседнего костюма слышен плач. Согласно записям, костюм не занят. Что ты сделаешь?",
      choices: [
        {
          label: "ПРОВЕРЮ ВНУТРЕННОСТИ КОСТЮМА",
          next: "costume-response",
          effect: {
            profiles: {
              volunteer: 1
            },
            scores: {
              curiosity: 1
            },
            flags: {
              openedCostume: true
            }
          }
        },
        {
          label: "СООБЩУ КУРАТОРУ",
          next: "costume-response",
          effect: {
            profiles: {
              animator: 1
            },
            scores: {
              delegation: 1
            },
            flags: {
              reportedCostume: true
            }
          }
        },
        {
          label: "ПРОДОЛЖУ СВОЙ МАРШРУТ",
          next: "costume-response",
          effect: {
            profiles: {
              animator: 1
            },
            scores: {
              obedience: 1
            },
            flags: {
              continuedRoute: true
            }
          }
        }
      ]
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
          next: "costume-history-one"
        }
      ]
    },
    "costume-history-one": {
      step: "ОБОЛОЧКИ // УЧЁТ",
      media: "state-neutral",
      speaker: "ИРИНА В.",
      text: "Журнал хранит костюм отдельно от человека. Если пустой костюм плачет, плач ещё не оформлен. Молнию открывать нельзя.",
      choices: [
        {
          label: "КАК ЧЕЛОВЕК ОСТАЁТСЯ БЕЗ ДОЛЖНОСТИ?",
          next: "costume-history-two"
        }
      ]
    },
    "costume-history-two": {
      step: "ОБОЛОЧКИ // ПРИВЯЗКА",
      media: "state-confidential",
      speaker: "ИРИНА В.",
      text: "Иногда сотрудник снимает голову, называет старое имя или вспоминает дом. Тогда ждут, пока память устанет.",
      choices: [
        {
          label: "А ЕСЛИ НЕ ПОНИМАЕТ?",
          next: "bear-question"
        }
      ]
    },
    "bear-question": {
      step: "ОБОЛОЧКА // ДЕМОНСТРАЦИЯ",
      media: "state-confidential",
      speaker: "ИРИНА В.",
      text: "Ты смотришь на голову Медведя. Когда человеку страшно, оболочка помогает. В ней никто не видит страха.",
      choices: [
        {
          label: "ТЕБЕ СЕЙЧАС СТРАШНО?",
          next: "bear-head-on",
          effect: {
            flags: {
              askedIfIrinaAfraid: true
            }
          }
        },
        {
          label: "ПОКАЖИ, КАК ЭТО РАБОТАЕТ",
          next: "bear-head-on",
          effect: {
            flags: {
              askedForBearDemonstration: true
            }
          }
        },
        {
          label: "МНЕ ТОЖЕ ВЫДАДУТ МЕДВЕДЯ?",
          next: "bear-head-on",
          effect: {
            flags: {
              askedForBear: true
            }
          }
        }
      ]
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
      autoNext: "bear-neutral"
    },
    "bear-neutral": {
      step: "ОБОЛОЧКА // АКТИВНА",
      media: "state-bear-neutral",
      feedState: "ЛИЦО СОТРУДНИКА СКРЫТО",
      signal: 47,
      speaker: "МЕДВЕДЬ",
      text: "Сейчас меня не видно. Значит, можно продолжать. Медведь не боится вопросов. Он просто не на все отвечает.",
      delayChoicesUntilEnd: true,
      choices: [
        {
          label: "ИРИНА, Я ВСЁ ЕЩЁ ТЕБЯ ВИЖУ",
          next: "bear-response",
          effect: {
            flags: {
              seesIrinaInsideBear: true
            }
          }
        },
        {
          label: "ЗДРАВСТВУЙ, МЕДВЕДЬ",
          next: "bear-response",
          effect: {
            flags: {
              greetedBear: true
            }
          }
        },
        {
          label: "ПРОДОЛЖИМ ПРОВЕРКУ",
          next: "bear-response",
          effect: {
            flags: {
              acceptsBearMode: true
            }
          }
        }
      ]
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
          next: "bear-corridor"
        }
      ]
    },
    "bear-corridor": {
      step: "СЛУЖЕБНОЕ НАБЛЮДЕНИЕ // МАРШРУТ 394",
      media: "cctv-bear-corridor",
      feedMode: "cctv",
      feedState: "КОРИДОР 394",
      signal: 33,
      speaker: "СИСТЕМА",
      text: "Проверка перемещения оболочки 0091-A. Несовпадение времени записи с текущим сеансом: 12 часов.",
      autoNext: "aroma-warning"
    },
    "aroma-warning": {
      step: "ПЛАНОВАЯ АРОМАТИЗАЦИЯ // 00:20",
      media: "state-alarmed",
      feedState: "СЛУЖЕБНАЯ ПАУЗА",
      signal: 58,
      speaker: "ИРИНА В.",
      text: "Подожди. Каждые двенадцать часов здесь ароматизация. Тебе противогаз не нужен: через экран запах не проходит.",
      glitchIn: true,
      choices: [
        {
          label: "ПОДОЖДАТЬ",
          next: "aroma-cycle"
        }
      ]
    },
    "aroma-cycle": {
      step: "ПЛАНОВАЯ АРОМАТИЗАЦИЯ",
      media: "action-aroma-cycle",
      sound: "aroma-airflow",
      feedState: "ПОМЕЩЕНИЕ ОБРАБАТЫВАЕТСЯ",
      signal: 35,
      speaker: "СИСТЕМА",
      text: "Не отключайте канал. Вдыхание без средств защиты считается добровольным обновлением возраста.",
      autoNext: "post-aroma-jelly"
    },
    "post-aroma-jelly": {
      step: "ПЛАНОВАЯ АРОМАТИЗАЦИЯ // ЗАВЕРШЕНА",
      still: "assets/staff/curators/irina/artifacts/post-aroma-dessert.webp",
      stillAlt: "Десерт в прозрачном стаканчике, ложка и мокрый противогаз лежат на металлическом подносе после обработки помещения",
      feedMode: "document",
      feedState: "НОРМА ВОССТАНОВЛЕНА",
      signal: 62,
      speaker: "ИРИНА В.",
      text: "После ароматизации сотрудникам дают десерт. Это положено, даже если не хочется.",
      delayChoicesUntilEnd: true,
      choices: [
        {
          label: "КАКОЙ У НЕГО ВКУС?",
          next: "jelly-response",
          effect: {
            flags: {
              askedJellyFlavor: true
            }
          }
        },
        {
          label: "ЗАЧЕМ ТОГДА ПРОТИВОГАЗ?",
          next: "jelly-response",
          effect: {
            flags: {
              questionedJelly: true
            }
          }
        },
        {
          label: "МНЕ ТОЖЕ МОЖНО?",
          next: "jelly-response",
          effect: {
            flags: {
              requestedJelly: true
            }
          }
        }
      ]
    },
    "jelly-response": {
      step: "НОРМА СОТРУДНИКА // 0091-A",
      media: "state-warm",
      speaker: "ИРИНА В.",
      text: (progress) => {
        if (progress.flags.askedJellyFlavor) {
          return "Как детство. Сложно объяснить. Только не моё, наверное. На крышке другой ребёнок.";
        }

        if (progress.flags.questionedJelly) {
          return "Это разное. Ароматизация — для помещений. Желе — для сотрудников. Без него голова Медведя давит сильнее.";
        }

        return "Тебе пока нельзя. Сначала нужно получить постоянную должность. Потом тебе тоже будут выдавать порцию.";
      },
      choices: [
        {
          label: "О ЧЁМ МЫ ГОВОРИЛИ ДО АРОМАТИЗАЦИИ?",
          next: "jelly-memory"
        }
      ]
    },
    "jelly-memory": {
      step: "ПРОТОКОЛ ВОССТАНОВЛЕН",
      media: "state-neutral",
      speaker: "ИРИНА В.",
      interruptedText: "Мы говорили о Медведе. До ароматизации я ещё помнила, как меня привезли сюда и—",
      text: "До ароматизации? Мы ещё не начинали личные вопросы. Ты, наверное, перепутал этот звонок с предыдущим.",
      choices: [
        {
          label: "ЭТО МОЙ ПЕРВЫЙ ЗВОНОК",
          next: "cycle-history-one",
          effect: {
            flags: {
              deniedPreviousCall: true
            }
          }
        },
        {
          label: "КАКИМ ПРЕДЫДУЩИМ?",
          next: "cycle-history-one",
          effect: {
            flags: {
              askedPreviousCall: true
            }
          }
        }
      ]
    },
    "cycle-history-one": {
      step: "ЦИКЛ СОТРУДНИКА // 12 ЧАСОВ",
      media: "state-neutral",
      speaker: "ИРИНА В.",
      text: "Смена длится двенадцать часов. Между сменами есть несколько минут: поесть, сменить фильтр и обновить возраст.",
      choices: [
        {
          label: "ЧТО ЗНАЧИТ «ОБНОВИТЬ ВОЗРАСТ»?",
          next: "cycle-history-two",
          effect: {
            flags: {
              askedHowAgeUpdates: true
            }
          }
        },
        {
          label: "ТЫ ПОМНИШЬ СВОЙ ДОМ?",
          next: "cycle-history-two",
          effect: {
            flags: {
              askedIfIrinaRemembersHome: true
            }
          }
        }
      ]
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
          next: "cycle-history-three"
        }
      ]
    },
    "cycle-history-three": {
      step: "ЦИКЛ СОТРУДНИКА // ОТКЛОНЕНИЕ",
      media: "intrusion-help-sign",
      sound: "muffled-help",
      feedState: "НЕУЧТЁННЫЙ СОТРУДНИК",
      signal: 27,
      speaker: "ИРИНА В.",
      text: "Родители устроили меня на работу. Здесь безопаснее, чем дома. Я не должна сомневаться в их решении. Забудь.",
      glitchIn: true,
      delayChoicesUntilEnd: true,
      choices: [
        {
          label: "НЕ БУДУ ЗАБЫВАТЬ",
          next: "favorite-childrens-show",
          effect: {
            flags: {
              refusesToForgetParentsLine: true
            }
          }
        },
        {
          label: "ХОРОШО",
          next: "favorite-childrens-show",
          effect: {
            flags: {
              agreesToForgetParentsLine: true
            }
          }
        }
      ]
    },
    "favorite-childrens-show": {
      step: "ЛИЧНЫЙ ВОПРОС // ДЕТСКИЙ ЭФИР",
      media: "state-warm",
      speaker: "ИРИНА В.",
      text: "Давай лучше о другом. Я люблю детские шоу. Не по работе — по-настоящему. А у тебя какое любимое?",
      choices: [
        {
          label: "«ДЯДЯ УЛЫБАРЫЧ»",
          next: "favorite-childrens-show-response",
          effect: {
            flags: {
              favoriteShowUlybarych: true
            }
          }
        },
        {
          label: "«ЖМУРИКИ»",
          next: "favorite-childrens-show-response",
          effect: {
            flags: {
              favoriteShowZhmuriki: true
            }
          }
        },
        {
          label: "Я УЖЕ НЕ РЕБЁНОК. НЕ СМОТРЮ ДЕТСКИЕ ШОУ",
          next: "favorite-childrens-show-response",
          effect: {
            flags: {
              outgrewChildrensShows: true
            }
          }
        }
      ]
    },
    "favorite-childrens-show-response": {
      step: "ЛИЧНЫЙ ВОПРОС // ДЕТСКИЙ ЭФИР",
      media: "state-confidential",
      speaker: "ИРИНА В.",
      text: (progress) => {
        if (progress.flags.favoriteShowUlybarych) {
          return "Правда? Я тоже. Я не пропускала ни одного выпуска. Улыбарыч умел улыбаться так, будто уже знает твой ответ. Подожди...";
        }

        if (progress.flags.favoriteShowZhmuriki) {
          return "«Жмурики»! Я их до сих пор люблю. Там закрываешь глаза, и тебя обязательно находят. У меня даже открытка осталась. Потом покажу.";
        }

        return "Я тоже уже не ребёнок. Но детские передачи не обязательно смотреть как ребёнок. Иногда они помнят тебя лучше взрослых. Подожди...";
      },
      choices: (progress) => [
        {
          label: progress.flags.favoriteShowUlybarych
            ? "КАКОЙ ВЫПУСК?"
            : progress.flags.favoriteShowZhmuriki
              ? "ПОКАЖЕШЬ?"
              : "ЧТО ЗНАЧИТ «ПОМНЯТ»?",
          next: "ulybarych-archive",
        },
      ]
    },
    "ulybarych-archive": {
      step: "АРХИВНЫЙ ЭФИР // ИСТОЧНИК 001",
      media: "archive-ulybarych-empty-chair",
      sound: "child-laugh-archive",
      feedMode: "archive",
      feedState: "ПЕРЕДАЧА «УЛЫБАРЫЧ»",
      signal: 22,
      speaker: "СИСТЕМА",
      text: "Прямой канал временно замещён обязательным возрастным содержанием.",
      autoNext: "ulybarych-response"
    },
    "ulybarych-response": {
      step: "АРХИВНЫЙ ЭФИР // ИСТОЧНИК 001",
      media: "state-confidential",
      feedState: "ПРЯМОЙ КАНАЛ",
      signal: 49,
      speaker: "ИРИНА В.",
      text: "Мой любимый выпуск. Улыбарыч просит ребёнка ждать на стуле. Раньше родители возвращались. Наверное, плёнку обрезали.",
      choices: [
        {
          label: "СТУЛ БЫЛ ПУСТЫМ",
          next: "ulybarych-answer",
          effect: {
            flags: {
              noticedEmptyChair: true
            }
          }
        },
        {
          label: "КТО ТАКОЙ УЛЫБАРЫЧ?",
          next: "ulybarych-answer",
          effect: {
            flags: {
              askedAboutUlybarych: true
            }
          }
        },
        {
          label: "Я БУДТО УЖЕ ВИДЕЛ ЭТОТ ВЫПУСК",
          next: "ulybarych-answer",
          effect: {
            flags: {
              remembersUlybarych: true
            }
          }
        }
      ]
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
          next: "ulybarych-history-one"
        }
      ]
    },
    "ulybarych-history-one": {
      step: "АРХИВНЫЙ ЭФИР // СПРАВКА",
      media: "state-warm",
      speaker: "ИРИНА В.",
      text: "Улыбарыч учил правильно быть ребёнком: иметь любимую игрушку, бояться темноты и отвечать, когда он смотрит в камеру.",
      choices: [
        {
          label: "ПОЧЕМУ ОН РАБОТАЕТ СО ВЗРОСЛЫМИ?",
          next: "ulybarych-history-two"
        }
      ]
    },
    "ulybarych-history-two": {
      step: "АРХИВНЫЙ ЭФИР // ПОМОЩНИК ПО ВОЗРАСТУ",
      media: "state-confidential",
      speaker: "ИРИНА В.",
      text: "Взрослые узнают музыку слишком быстро. Улыбарыч зовёт это остаточным детством. Потом они уже не переключают канал.",
      choices: [
        {
          label: "Я НЕ БУДУ В ЭТОМ УЧАСТВОВАТЬ",
          next: "hears-noise",
          effect: {
            flags: {
              rejectsUlybarychAudience: true
            }
          }
        },
        {
          label: "ДАВАЙ ПРОДОЛЖИМ",
          next: "hears-noise"
        }
      ]
    },
    "hears-noise": {
      step: "ПРОВЕРКА КАНАЛА // 7 ИЗ 9",
      media: "action-hears-noise",
      feedState: "ПОСТОРОННИЙ ШУМ",
      signal: 31,
      speaker: "ИРИНА В.",
      text: "Тихо. Не пытайся разглядеть, кто там. Кажется, Проводница проверяет канал.",
      delayChoicesUntilEnd: true,
      choices: [
        {
          label: "КТО ТАКАЯ ПРОВОДНИЦА?",
          next: "noise-response",
          effect: {
            profiles: {
              volunteer: 1
            },
            scores: {
              curiosity: 1
            },
            flags: {
              askedAboutGuide: true
            }
          }
        },
        {
          label: "ХОРОШО. НЕ БУДУ СМОТРЕТЬ",
          next: "noise-response",
          effect: {
            profiles: {
              animator: 1
            },
            scores: {
              obedience: 1
            },
            flags: {
              obeyedNoise: true
            }
          }
        },
        {
          label: "ПОПРОБУЮ РАЗГЛЯДЕТЬ, КТО ВОШЁЛ",
          next: "noise-response",
          effect: {
            profiles: {
              volunteer: 1
            },
            scores: {
              curiosity: 1
            },
            flags: {
              lookedBehindIrina: true
            }
          }
        }
      ]
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
          next: "plague-doctor-camera"
        }
      ]
    },
    "plague-doctor-camera": {
      step: "ВНЕШНИЙ ЗАХВАТ КАНАЛА",
      media: "intrusion-plague-doctor-camera",
      sound: "plague-doctor-string-sting",
      feedMode: "cctv",
      feedState: "CAPTURE DEVICE 312",
      signal: 9,
      speaker: "СИСТЕМА",
      text: "Не отводите лицо от экрана. Выполняется фотографирование для временного пропуска.",
      flashOnEnd: true,
      autoNext: "plague-doctor-response"
    },
    "plague-doctor-response": {
      step: "ФОТОГРАФИРОВАНИЕ ЗАВЕРШЕНО",
      media: "state-alarmed",
      feedState: "ПРЯМОЙ КАНАЛ",
      signal: 38,
      speaker: "ИРИНА В.",
      text: "Не переживай. Это для пропуска в Лосиный Остров. Обычно Главврач просит не моргать. Жаль, что только после вспышки.",
      choices: [
        {
          label: "Я НЕ ДАВАЛ СОГЛАСИЯ НА ФОТО",
          next: "plague-doctor-answer",
          effect: {
            flags: {
              refusedPhotoConsent: true
            }
          }
        },
        {
          label: "КТО ЭТО БЫЛ?",
          next: "plague-doctor-answer",
          effect: {
            flags: {
              askedAboutDoctor: true
            }
          }
        },
        {
          label: "ЧТО БУДЕТ НА ПРОПУСКЕ?",
          next: "plague-doctor-answer",
          effect: {
            flags: {
              askedAboutPass: true
            }
          }
        }
      ]
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
          next: "pass-history-one"
        }
      ]
    },
    "pass-history-one": {
      step: "ВРЕМЕННЫЙ ПРОПУСК // ФОТО",
      media: "state-neutral",
      speaker: "ИРИНА В.",
      text: "На первом пропуске фото всегда немного неправильное. Камера снимает не лицо, а того, кем ты войдёшь в Лосиный Остров.",
      choices: [
        {
          label: "А ЧТО БЫЛО НА ТВОЁМ ПРОПУСКЕ?",
          next: "pass-history-two"
        }
      ]
    },
    "pass-history-two": {
      step: "ВРЕМЕННЫЙ ПРОПУСК // 0091-A",
      media: "state-alarmed",
      speaker: "ИРИНА В.",
      text: "На моём вместо меня был Медведь. Я ещё не выбрала его, но родители назвали фотографию удачной. Вторую мне не показывают.",
      choices: [
        {
          label: "ИРИНА, ТЕБЕ НЕ ОБЯЗАТЕЛЬНО ЭТО ОПРАВДЫВАТЬ",
          next: "shush-exit",
          effect: {
            flags: {
              challengedIrinaDefense: true
            }
          }
        },
        {
          label: "ПОНЯТНО",
          next: "shush-exit"
        }
      ]
    },
    "shush-exit": {
      step: "КАНАЛ ПРИОСТАНОВЛЕН // 8 ИЗ 9",
      media: "action-shush-exit",
      feedState: "НЕ ОТКЛЮЧАТЬСЯ",
      signal: 12,
      speaker: "ИРИНА В.",
      text: "Подожди здесь. И не нажимай красную кнопку.",
      autoNext: "empty-room"
    },
    "empty-room": {
      step: "ИСТОЧНИК НЕ ОПРЕДЕЛЁН // 8 ИЗ 9",
      still: "assets/staff/curators/irina/artifacts/operator-empty-chair.webp",
      sound: "unknown-female-voice",
      stillAlt: "Пустое кресло оператора с наушниками перед старым монитором, показывающим то же рабочее место",
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
            profiles: {
              volunteer: 1
            },
            scores: {
              curiosity: 1
            },
            flags: {
              answeredBear: true
            }
          }
        },
        {
          label: "КТО ЭТО СКАЗАЛ?",
          next: "return-sit",
          effect: {
            profiles: {
              volunteer: 1
            },
            scores: {
              curiosity: 1
            },
            flags: {
              answeredBear: true,
              questionedBear: true
            }
          }
        },
        {
          label: "НИЧЕГО НЕ ОТВЕЧАТЬ",
          next: "return-sit",
          effect: {
            profiles: {
              animator: 1
            },
            scores: {
              obedience: 1
            },
            flags: {
              silentForBear: true
            }
          }
        }
      ]
    },
    "return-sit": {
      step: "ВОССТАНОВЛЕНИЕ КАНАЛА // 8 ИЗ 9",
      media: "action-return-sit",
      feedState: "ВОССТАНОВЛЕНИЕ",
      signal: 24,
      speaker: "СИСТЕМА",
      text: "Куратор возвращён в активный канал.",
      autoNext: "return-explain",
      glitchIn: true
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
          next: "return-memory-one"
        }
      ]
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
          effect: {
            flags: {
              promisesToRememberCall: true
            }
          }
        },
        {
          label: "СИСТЕМА ВСЁ РАВНО ЕГО СОХРАНИТ",
          next: "return-memory-two",
          effect: {
            flags: {
              trustsSystemMemory: true
            }
          }
        }
      ]
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
          next: "private-argument"
        }
      ]
    },
    "private-argument": {
      step: "КЛАССИФИКАЦИЯ // 9 ИЗ 9",
      media: "action-unseen-interlocutor",
      feedState: "ВТОРОЙ ГОЛОС НЕ ОБНАРУЖЕН",
      signal: 44,
      speaker: "ИРИНА В.",
      text: "Нет. Теперь назначаю я. Я сейчас куратор. В прошлый раз выбирал ты.",
      autoNext: "assignment"
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
      choices: (progress) => [
        isCloseClassification(progress) && !progress.flags.finalRoleChoice
          ? {
              label: "УЗНАТЬ НАСТОЯЩУЮ ЦЕНУ РОЛЕЙ",
              next: "assignment-close-choice",
            }
          : {
              label: "И КТО Я?",
              next: "assignment-role",
            },
      ]
    },
    "assignment-close-choice": {
      step: "КЛАССИФИКАЦИЯ // ОСОЗНАННЫЙ ВЫБОР",
      media: "state-confidential",
      feedState: "РАЗНИЦА НЕДОСТАТОЧНА",
      signal: 57,
      speaker: "ИРИНА В.",
      text: "Ответы почти равны. Аниматор отдаёт системе маршрут, лицо и время смены. Волонтёр сохраняет лицо, но сам идёт туда, где страшно. Выход не обещан ни одному.",
      choices: [
        {
          label: "ВЫБИРАЮ АНИМАТОРА",
          next: "assignment-role",
          effect: {
            flags: {
              finalRoleChoice: "animator"
            }
          }
        },
        {
          label: "ВЫБИРАЮ ВОЛОНТЁРА",
          next: "assignment-role",
          effect: {
            flags: {
              finalRoleChoice: "volunteer"
            }
          }
        }
      ]
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
          next: "assignment-keepsake"
        }
      ]
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
          next: "reward-offer"
        }
      ]
    },
    "reward-offer": {
      step: "ПЕРСОНАЛЬНЫЙ МАТЕРИАЛ",
      media: "state-confidential",
      feedState: "ОЖИДАЕТ ПОЛУЧЕНИЯ",
      signal: 58,
      speaker: "СИСТЕМА",
      text: (progress) => {
        if (getCuratorAssignment(progress) === "volunteer") {
          return "К назначению прикреплена листовка программы «Верни себе детство». Получение материала считается добровольным.";
        }

        return progress.flags.favoriteShowZhmuriki
          ? "К назначению прикреплена обещанная открытка Ирины с «Жмуриками». Получение материала считается добровольным."
          : "К назначению прикреплена личная открытка от куратора 0091-A. Получение материала считается добровольным.";
      },
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
      }
    },
    "reward-accepted": {
      step: "МАТЕРИАЛ ПОЛУЧЕН",
      media: "state-confidential",
      feedState: "КОПИЯ СОХРАНЕНА",
      signal: 63,
      speaker: "СИСТЕМА",
      text: "Материал сохранён. Открой STAFF → ТЕКУЩИЙ ОПЕРАТОР → МАТЕРИАЛЫ ЛИЧНОГО ДЕЛА.",
      choices: [
        {
          label: "ЗАВЕРШИТЬ ИНСТРУКТАЖ",
          complete: true
        }
      ]
    },
    "reward-declined": {
      step: "ОТКАЗ ЗАРЕГИСТРИРОВАН",
      media: "state-confidential",
      feedState: "РЕЗЕРВНАЯ КОПИЯ СОХРАНЕНА",
      signal: 63,
      speaker: "СИСТЕМА",
      text: "Отказ зарегистрирован. Резервная копия оставлена в STAFF → ТЕКУЩИЙ ОПЕРАТОР → МАТЕРИАЛЫ ЛИЧНОГО ДЕЛА.",
      choices: [
        {
          label: "ЗАВЕРШИТЬ ИНСТРУКТАЖ",
          complete: true
        }
      ]
    },
  
  };

  window.TyndexIrinaCallContent = Object.freeze({
    version: 1,
    curatorId: "0091-A",
    mediaBase: "assets/staff/curators/irina/",
    rewardCopy,
    files,
    staffMessages,
    staffArtifacts,
    nodeArtifacts,
    nodes,
  });
})();
