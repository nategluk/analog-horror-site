# Еженедельная проверка перегрузки кода — 2026-09-03

Статус: read-only аудит. Правок runtime/CSS/контента не было.
Дерево на момент сбора: `main` / `4d86c85`, рабочая копия чистая.
Следующий шаг: пользователь выбирает срез недели 1; commit не выполнялся.

Этот файл — вход для другого агента. Не читать архивы статуса, mega-plans и
старые handoff без конкретной необходимости. Канон персонажей в `~/md_lore/`.
Производные экспорты и `docs/drafts/` не считать runtime-правдой.

Смежные документы (открывать только по узкому scope):

- `docs/GAME_STANDARD.md` — UX/runtime-контракт новых игр
- `docs/GAME_UI_KIT_AUDIT.md` — контракт кита (2026-08-31)
- `docs/AGENT_STATUS.md` — живой снимок; перед правкой занять write-замок

## Границы аудита

- Цель: найти потенциальную оптимизацию после работы нескольких агентов.
- Не цель: переписать лор, сжать тексты, менять ключи сейвов, публиковать.
- «Только чтение» не разрешает правки. Этот markdown — единственный артефакт.
- Grok Build не использовать. PixVerse не использовать для сцен с лицами.

Источники правды runtime:

| Область | Файлы | Ключ |
|---|---|---|
| Сайт / Ирина | `js/app.js`, `content/irina/call-content.js` | `tyndex_curator_call_v4` |
| Досье | `js/dossier-store.js` | `tyndex_staff_profile_v1`, `tyndex_mode` |
| Лора | `js/lora-red-room.js`, `content/lora/red-room-content.js` | `tyndex_lora_red_room_v1` |
| Павел | `js/pavel-observation-booth.js`, `content/pavel/observation-booth-content.js` | `tyndex_pavel_observation_booth_v1` |
| Ночное «Солнышко» | `js/solnyshko-park.js`, `content/irina/solnyshko-park-content.js`, `js/game-ui-kit.js` | `tyndex_irina_solnyshko_v1` |

## Вердикт

Перегрузка есть, но это не кладбище неиспользуемых файлов. Это **четыре
независимых игровых runtime** плюс сайт-оболочка, которая на почти каждой
публичной странице грузит полный граф звонка Ирины и весь `css/style.css`.

Новые игры уже должны идти только через Game UI Kit. Миграция Лоры или Павла
на кит одним проходом — высокий риск, не работа этой недели.

## Цифры payload

На типичной публичной странице сразу грузятся:

| Файл | Байты | Строки | Роль |
|---|---|---|---|
| `css/style.css` | 293 КБ (диск ~286 КБ) | 12 576 | весь сайт, включая HUD Ирины, эспрессо, вату |
| `js/app.js` | 208 КБ | 5 660 | SPA, CCTV, досье **и** игра Ирины |
| `content/irina/call-content.js` | 125 КБ | 3 210 | граф звонка + каталог артефактов/сообщений/файлов |

Суммарно ~630 КБ исходников до картинок и видео.

`call-content.js` и `js/app.js` подключены почти на всех HTML (около 35 страниц),
включая FAQ, локации и документы. Игра Ирины нужна на `hiring.html`; каталог
артефактов нужен шире, но полный граф узлов на зоопарк не нужен.

Прочие крупные JS (для сравнения, не грузятся глобально):

| Файл | Строки | Диск |
|---|---|---|
| `js/lora-red-room.js` | 2 221 | 68 КБ |
| `content/lora/red-room-content.js` | 1 709 | — |
| `content/pavel/observation-booth-content.js` | 1 430 | — |
| `js/pavel-observation-booth.js` | 1 325 | 48 КБ |
| `js/solnyshko-park.js` | 609 | 20 КБ |
| `js/game-ui-kit.js` | 420 | 13 КБ |

CSS игр: `css/lora-red-room.css` 979 строк / 21 КБ; `css/pavel-observation-booth.css`
435 / 9.3 КБ; `css/game-ui.css` 427 / 9.2 КБ.

## Четыре игровых runtime

### A. Ирина, curator call — внутри `app.js`

- Runtime: `initCuratorCall` примерно `js/app.js` 3115–4131 (~1016 строк).
- Хост: hiring/staff modal `[data-curator-call]`.
- Media: `applyMedia` ~3660. still / terminal / room / mp4, `video.onended`,
  reduced-motion timeout 450 ms. **Нет 15s watchdog и play-token.**
- Choices: `showChoices` ~3718. формы, image-кнопки, без групп.
- Typewriter: `animateText` ~3356, 22 ms + пунктуация.
- Звук: session-only, ambient + cue library + WebAudio beeps.
- Replay: `openCall({ restart })`, не wipe game-key.
- Save идёт через `TyndexDossierStore.saveCurrentSession`, не через game-ui adapter.

### B. Лора, красная комната — UX-референс, свой runtime

- Runtime: `js/lora-red-room.js`. Хост: `locations/red-room-shift.html`.
- SPA-вход: `app.js` `initLoraRedRoom` ~1403.
- Пять video-путей: `playRevealSceneVideo`, `playAmbientSceneVideo`,
  `playLoopSceneVideo`, `playNodeMotionVideo`, `playTransitionSceneVideo` +
  `playStillSequence` (~1174–1461). **Нет generic 15s watchdog.**
- Save: `readSave` / `writeSave` / `createSave` ~420–455. Поля `playerFlags`,
  `currentNode`, `completed`. Assignment `tyndex_lora_channel_v1` (session, 120s TTL).
- Choices: `renderChoices` ~1566, группы выводятся из `choice.group`.
- Typewriter 16 ms в `renderNode` ~1927; `bindLineSkip` ~1869.
- Audio: `fadeBedTo` ~668, 1400 ms RAF. Звук по умолчанию **вкл**, не в сейве.
- HUD leave всегда enabled. Espresso — `coffeeReward` / `openCoffeeReward` ~1782.
- Replay: `replayShift`, fox-lie память сохраняется; ключ не `removeItem`.

### C. Павел, кабинка обозрения

- Runtime: `js/pavel-observation-booth.js`. Хост: `locations/pavel-observation-booth.html`.
- Media: `applyVisual` ~916–1032. token, still-first, loop vs one-shot, muted retry,
  **15s watchdog**, `ended` → hold still. Ближе всего к киту.
- Save: `readJson` / `readSave` / `writeSave` ~358–439, **миграции node-id**.
  Поля `flags`, `nodeId`. Звук **персистится** как `flags.soundEnabled`.
- Choices плоские + `hideIf` / `choicesAfterClip` / `autoNext`.
- Typewriter: `startLineHold` ~831. skip раз — дописать строку, второй — choices.
  Hold = max(type 16 ms/char, cue, 900 ms).
- Audio: `fadeBedTo` ~511, тот же 1400 ms, что у Лоры. `SOUND_FILES` ~261
  дублирует ID из `js/game-ui-audio-library.js`, но библиотеку не вызывает.
- HUD leave lock: `hudLeaveLocked` ~460. Replay `restartBooth` ~727 сохраняет звук.

### D. Ночное «Солнышко» — единственная продакшен-игра на ките

- Runtime: `js/solnyshko-park.js` на `js/game-ui-kit.js`.
- Хост: `locations/solnyshko-after-hours.html`.
- Своё: line → thought → choices, birthday form, artifact inspect, impostor,
  channel HUD.
- Media/choices/line/audio делегированы киту. `typewriter: false`.
- Звук session-only, по умолчанию **выкл**. Replay `saveApi.reset()`.

### Соседние, не полные ARG-графы

| Runtime | Ключ | Статус |
|---|---|---|
| `js/red-room-espresso.js` | `tyndex_red_room_espresso_v1` | живой кликер: кафе + coffee reward Лоры |
| `js/solnyshko-cotton.js` | `tyndex_solnyshko_cotton_v1` | живой кликер парка; вход в after-hours |
| `js/game-ui-fixture.js` | `tyndex_game_ui_fixture_v1` | QA кита; **не** копируется в `public/` |
| `js/app.js` CCTV/VHS | отдельные ключи | третий media runtime внутри сайта |
| `js/archive-catalog.js` | — | `episodes.html`; не путать с `initArchiveCatalog` на `archive.html` |

Ни один файл в `js/` не orphan. Cotton и espresso ~95% одна машина (save, `wait`,
`paint`, reduced-motion, replay) — дубль, не мёртвый код. Espresso **не удалять**.

`js/dossier-store.js` бэкапит ключи Лоры / Павла / Солнышка. Сессия Ирины
синхронизируется отдельно как current session, не как пункт `GAME_SAVE_KEYS`.

## Что уже централизует `js/game-ui-kit.js`

Экспорт `window.TyndexGameUi`:

| API | Покрывает | Лора | Павел |
|---|---|---|---|
| `createSaveAdapter` | versioned JSON, `updatedAt`, `reset` | свой save | свой + миграции |
| `createLineRenderer` | kind/speaker/line, 16 ms | свой skip | двухшаговый hold |
| `createChoiceRenderer` | max 4, group/back | inferred groups | нет групп |
| `createMediaController` | roles, playedFlag, watchdog, muted retry | 5 play modes | ближайший к киту |
| `createAudioRack` | unlock, fade **400 ms**, cue | fade **1400 ms** + presence/sea | fade 1400 ms + dual-channel |
| `bindShell` | body class + слоты | `.lora-room__*` | `.pavel-booth__*` |

Кит **не** владеет: sound/leave HUD, replay policy, `hideIf` / `choicesAfterClip`
/ `autoNext`, artifact inspect, assignment gate, dossier attach, валидаторами
контента.

Миграция Лоры на `bindShell` без адаптера сломает grouping и `finishNode`
(~1995–2099): autoNext, coffee/wait/reward, reveal vs loop vs ambient,
closed-shift resume.

## Дубли паттернов (имена функций)

### Save / load

Одна форма try/parse/`version === 1`/`updatedAt`/`queueSync`, четыре реализации:

- Кит: `createSaveAdapter` — `js/game-ui-kit.js` 6–26
- Лора: `readSave` / `writeSave` / `createSave` — `js/lora-red-room.js` 420–455
- Павел: `readJson` / `readSave` / `writeSave` — `js/pavel-observation-booth.js` 358–439
- Солнышко: кит + локальный `readJson` профиля — `js/solnyshko-park.js` 43–55, 215–219
- Сайт: `readLoraSave` / `readPavelBoothSave` — `js/app.js` 2166–2251 (дубль для claim)
- Кликеры: espresso 58–79 и cotton 53–74 — почти клоны

Слепой swap адаптера сломает схему: Лора `playerFlags`+`currentNode` vs
Павел/Солнышко `flags`+`nodeId`; у Павла cassette/migration; у Лоры `completed`.

### Video

- Кит `createMediaController` 162–299: token, still first, `playing` → `is-playing`,
  muted retry, 15s watchdog, burst→active, transition `onTransitionEnd`
- Павел `applyVisual` 916–1032: то же, но `loadedmetadata` не `playing`
- Лора: пять play, `onended`/`onerror`/`play().catch`, без watchdog
- Ирина `applyMedia` 3660–3716: без token/watchdog/still-on-error
- Cotton: `ended` на spin MP4 ~283

### Reduced motion

`matchMedia("(prefers-reduced-motion: reduce)")` в ките, Лоре (`prefersReducedMotion`
300), Павле (`reduceMotion` 354 **и** `scheduleGuestExit` 758), Солнышке (31),
Ирине (3166), кликерах и veil в `app.js` (1461, 1480, 1630). Поведение разное:
Павел/кит пропускают one-shot; Лора пропускает motion, но sequences/autoNext
живут; Ирина ждёт 450 ms; Солнышко считает enter сыгранным.

### Choices / typewriter / sound / replay / veil

- Choices: кит явный `variant: "group"`; Лора inferred; Павел flat + `hideIf`;
  Ирина image/form; Солнышко мапит в кит.
- Typewriter: Лора skip = finish+choices; Павел двухшаговый; кит без skip-to-complete;
  Ирина 22 ms. `bindLineSkip` Лора 1869 и Павел 817 — копипаст.
- Sound toggle не в ките. Каждый хост сам: Ирина ~4030, Лора 884–906 / 2154,
  Павел `data-booth-sound` 1243, Солнышко `data-solnyshko-sound` 567, fixture 103.
- Replay политики разные (см. раздел runtime). Не унифицировать без продукта.
- Veil: `launchLoraShift` `app.js` 1455, `launchPavelBooth` 1479,
  cotton `enterHours` `solnyshko-cotton.js` 367.

## Горячие точки `js/app.js`

Файл — OS сайта **и** вся игра Ирины. Грузится вместе с `call-content.js`.

| Строки | Забота |
|---|---|
| 1–140 | ключи, CCTV/VHS, music library |
| 141–360 | a11y, cinema ticket, site music player |
| 361–1029 | CCTV console (третий media runtime) |
| 1041–1250 | hiring threshold, staff notice, admin easter egg |
| 1271–1453 | SPA script loader + espresso/cotton/Lora/Pavel bootstrap |
| 1455–1740 | assignment veils, staff/guest, logo knock |
| 1737–3114 | staff/dossier/Irina domain, claim dialogs |
| 3115–4131 | `initCuratorCall` |
| 4133–5097 | `initStaffRegistry` ~964 строк |
| 5099–5544 | about classifier, archive tabs, `initDOMListeners` |
| 5546–5659 | SPA `fetchAndReplace`, boot |

Крупные функции: `initCuratorCall` ~1016, `initStaffRegistry` ~964,
`getProgressArtifactIds` 2298–2384, `syncStaffProfileFromProgress` 2386,
`getDossierClaimDialog` ~2557 (HTML-строка).

Живые, но шумные пути:

- `initDOMListeners` зовёт `initLoraRedRoom` + `initPavelObservationBooth` на
  **каждой** странице; no-op без корня.
- SPA `fetchAndReplace` ~5589 снова init espresso/cotton/Lora/Pavel.
- Первый заход кликеров — script tags в HTML; SPA — второй boot path.
- `IRINA_SOLNYSHKO_KEY` в `app.js` только для `hasPavelBridgeAccess` ~1585.
- `call-content.js` парсится даже если `[data-curator-call]` нет: из него
  читают артефакты, сообщения, файлы (`solnyshko-park.js` открывает
  `TyndexIrinaCallContent.files`).

## CSS / HTML

Почти все HTML (около 33 из 41) грузят полный `css/style.css`. Игры добавляют
свои листы, не заменяют его: shell сайта (`vhs-noise`, header, `.panel`, footer)
остаётся под `position: fixed; inset: 0; z-index: 80`.

Исключения: `auth/confirm.html` → `auth.css`; admin → свои CSS.

Секции `style.css` без оглавления:

| Строки | Содержание | Кто использует |
|---|---|---|
| 1–19 | `:root` guest | все |
| 20–437 | `personnel-broadcast-page` | `staff.html` |
| 439–1258 | STAFF tokens, chrome, music player | все dual-mode |
| 1259–~3280 | personnel/dossier base | `staff.html` |
| 5023–5991 | **`.curator-call` ~968 строк** | **`hiring.html`** |
| 7963–10139 | STAFF broadcast shell ~2177 | `.broadcast-shell-page` |
| 11482–12026 | **`.rr-espresso*` ~545** | кафе + смена Лоры |
| 12028–12576 | **`.sp-cotton*` ~548** | `locations/solnyshko-park.html` |

Мёртвый CSS: нарисованная ватная машина. Селекторы только в `style.css`, не в
HTML/JS: `.sp-cotton-hopper`, `__lid`, `__glass`, `.sp-cotton-chassis`,
`.sp-cotton-drum`, `.sp-cotton-cloud`, `.sp-cotton-bowl`, `.sp-cotton-part-label`,
`.sp-cotton-sugar`. PixVerse-блок позже переопределяет `.sp-cotton-machine`.
Ориентир на удаление: примерно **12072–12410**. Живой путь — `.sp-cotton-media` /
`.sp-cotton-art` / `.sp-cotton-video`.

`.comic-grid` есть в шести `staff/locations/*.html` как inline style; правила
класса в CSS нет.

Глобальный STAFF-hammer: `button` в `style.css` 4717–4721 +
`body.staff-mode .site-wrapper :where(button)` 4724. Каждая игра отбивается:

- `.lora-room__choice` / `__hud-btn` и staff-overrides
- `.pavel-booth__choice` / `__hud-btn`, включая locked `×`
- `body.staff-mode .site-wrapper [data-solnyshko-hours] [data-game-ui-leave]`

Один и тот же HUD скопирован три раза (kit / `.lora-room` / `.pavel-booth`):
fixed `100dvh`, top 2.5rem, HUD 44×44, leave `#ff7a6a`, stage cover, choice grid
`--*-choice-row: 2.75rem`, 2 колонки @720px, max 4 ряда. `css/game-ui-themes.css`
уже содержит `velvet` ≈ Лора и `phosphor` ≈ Павел; старые игры файл не грузят.

HTML: гостевые и staff-близнецы шести локаций — одна скелетная рама. Espresso
DOM продублирован в `locations/red-room-cafe.html` и `locations/red-room-shift.html`.
Сайтовый header/nav/footer copy-paste на публичных страницах, включая fullscreen-игры.

## Ранжированные возможности

Предпочитать **извлечение хелперов** и **урезание payload**, не rewrite игр.

### HIGH

1. **Разрезать sitewide payload: `call-content.js` + ленивые фичи `app.js`.**
   Каталог персонала (artifacts/messages/files) отдельно от `irina-nodes`.
   CCTV, curator call, staff registry, about classifier — только при наличии корня.
   Риск: средний (SPA `initDOMListeners` + hydrate досье). Усилие: среднее.
   Ключи сейвов не менять.

2. **Общий media helper из кита, без `bindShell` для Лоры.**
   Token / still-first / muted retry / 15s watchdog / `playedFlag`. Павел вызывает
   с `[data-booth-video]`. Лора пока со своими пятью play.
   Риск: средний для Павла (`choicesAfterClip`, `autoNext`, hold stills).
   **Не менять** имена флагов вроде `clipControlChannelSwitch`.

3. **Остановить dual-boot игр (HTML script + SPA `loadPageScript`).**
   Либо статичные теги на location-страницах, либо SPA init только если
   конструктора ещё нет. Риск: низкий–средний. Усилие: малое.

### MEDIUM

4. Павел (потом кровати Лоры) → `TyndexGameUiAudioLibrary`. ID уже есть
   (`pavel.music.tour-calm`, `pavel.voice.*`, `shared.door.three-knocks`).
   Тонкий alias; fade-ms вынести в `createAudioRack` (1400 vs 400).
5. Общий `readJson` / wrap `createSaveAdapter` **без смены схемы**. Normalize
   Павла остаётся в игре.
6. Общий HUD bind: sound + leave. Lock Павла и «всегда можно выйти» Лоры — опции.
7. Общий machine kit для cotton/espresso. Копи/SFX/фазы остаются своими.
8. Typewriter primitive с режимами `instant | type | typeThenHold`.

### LOW

9. Хелперы `prefersReducedMotion` / `bindLineSkip` / assignment veils.
10. **Не** мигрировать Лору на `bindShell` в одном проекте.
11. Fixture оставить локальным.
12. Унификация CSS HUD — после JS-хелперов, иначе снова поедет locked `×`.

### CSS-срезы (дешёвые, отдельно от JS)

| Ранг | Кандидат | Риск |
|---|---|---|
| 1 | Удалить мёртвый cotton-drawn CSS ~12072–12410 | низкий; визуально проверить кликер ваты |
| 2 | Вынести `.comic-grid` из inline в правило | низкий |
| 3 | `.rr-espresso*` → отдельный лист, только кафе+смена | низкий–средний |
| 4 | `.curator-call*` → лист только для `hiring.html` | низкий–средний |
| 5 | Сузить STAFF button hammer, не бить game hosts | средний; проверить hiring/dossier/archive/personnel |
| 6 | Новые игры только kit + theme token | низкий для нового; высокий если мигрировать старое |
| 7 | Broadcast-shell / personnel в отдельные листы | средний–высокий |
| 8 | Guest+staff близнецы в один HTML с `.guest-content` | средний (SEO, noindex, deep links) |
| 9 | Kit для Лоры/Павла (velvet/phosphor) | высокий |
| 10 | Не грузить полный `style.css` на fullscreen-игры | высокий; нужен крошечный `chrome.css` |

Не делать: «guest.css + staff.css» одним проходом; не реформатировать 12k строк.

## Порядок на недели

**Неделя 1 — дешёвый выигрыш**

1. Удалить мёртвый CSS ватной машины.
2. Вынести `.curator-call` и `.rr-espresso` в отдельные листы.
3. Убрать dual-boot игр.

**Неделя 2 — media/audio helper**

Вытащить из кита token / still-first / watchdog / muted retry для Павла.
Подключить Павла к `game-ui-audio-library.js`.

**Позже**

Payload split (каталог Ирины vs граф звонка); CCTV/registry по корню;
Лора кусками, последней.

## Чего не делать

- Не переписывать `content/lora/red-room-content.js` и графы Павла/Ирины «под кит».
- Не менять `tyndex_lora_red_room_v1`, `tyndex_pavel_observation_booth_v1`,
  `tyndex_irina_solnyshko_v1`, `tyndex_curator_call_v4` без плана миграции.
- Не удалять espresso.
- Не делать Солнышко визуальным клоном Лоры. GAME_STANDARD: Лора — референс
  **поведения**, не копия `lora-red-room.js`.
- Не очищать весь `localStorage`. Не добавлять production-зависимости без согласования.
- Browser QA: не полный маршрутный прогон. CSS-хвосты — один визуальный check
  ваты. Dual-boot — репрезентативный SPA-заход на одну игру. Media helper Павла —
  один маршрут в одном viewport; desktop + `390x844` только на крупном этапе.

## Проверки, если агент начнёт правки

Всегда: `git diff --check`; для изменённого JS — `node --check`.
Контент не менять в срезах недели 1–2, валидаторы игр не обязательны, пока
не тронут content/runtime-контракт.
Перед первой правкой занять write-замок в `docs/AGENT_STATUS.md`.
Commit / push / deploy только по прямой просьбе пользователя.
Не откатывать и не переформатировать чужой dirty diff, если он появится.

## Открытый вопрос пользователя (на момент отчёта)

Что брать первым: слой недели 1 (CSS-хвосты + dual-boot) или сразу media helper
для Павла.
