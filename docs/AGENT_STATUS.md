# AGENT STATUS

Короткий живой снимок. История до 2026-08-30 сохранена в
`docs/archive/AGENT_STATUS_HISTORY_2026-08-30.md` и по умолчанию не читается.

## Сейчас

| Поле | Значение |
|---|---|
| Обновлено | 2026-09-04 CDT |
| Ветка / HEAD | `main` / `40a924e` |
| Дерево | dirty: завершена carrier-разметка служебных локаций |
| Активная линия | шесть локаций различают `horror-cinematic` и `staff-protocol`; still-файлы временные |
| Последний этап | public build/verify и desktop/mobile STAFF/guest smoke-проверки пройдены |
| Commit / push / deploy | только по прямой просьбе пользователя |
| Следующий gate | commit/push/deploy отдельно; media replacement — отдельный этап |

## Write-замок

```text
FREE
```

Перед правкой заменить `FREE` на `WRITER / SCOPE / STARTED`. Перед остановкой
вернуть `FREE` и обновить этот снимок. Одновременно пишет один агент.

## Продуктовые решения пользователя

- Ночное «Солнышко» доступно всем через распространяемый игроками пароль
  `12.08.26`. Все видят четыре причины входа; Аниматор с сохранённой открыткой
  может прочитать пароль внутри игры, а волонтёрский доступ требует сохранённую
  листовку. Восстановленный по email профиль возвращает эти ролевые материалы.
  Игрок, вошедший по дате без завершённого назначения, получает класс
  `impostor` («САМОЗВАНЕЦ») со статусом `ДОПУСК НЕ ПОДТВЕРЖДЁН`, без стартовых
  квестовых материалов; запись можно закрепить по email.
- Красная комната — референс UX/runtime для новых игр: mobile/web, replay,
  короткие реплики, групповые кнопки, neutral loops и active bursts.
- Павел после тура уходит через горку; затем игрок не видит его в комнате,
  только при необходимости на экранах. Готовый escape MP4 сейчас не подключён.
- Старый случайный intro/fallback-постер не утверждён и должен быть исключён на
  визуальном этапе. Диалоги, особенно слив, требуют постоянной динамики.
- Слив — микровизиты, не один монолог: присутствие → шутка/волос → правила и
  КРОТ → короткая выдача. Угроза растёт визуально. PixVerse только без лица.
- PixVerse не использовать для сцен с лицами. Часть роликов пользователь уже
  заменил вручную.
- Позже нужен единый audio audit: reuse существующих файлов и список генерации
  ElevenLabs (стуки, слив, металл, горка, влажные звуки и музыка/ambient).
- Первый ответ `booth-intro` отсутствует до `video.ended`, затем плавно
  появляется; resume и reduced motion показывают его сразу.
- Browser QA не запускать после каждого изменения; полный прогон оставить для
  release candidate.

## Текущее техническое состояние Павла

- Источник сценария: `content/pavel/observation-booth-content.js`.
- Runtime: `js/pavel-observation-booth.js`.
- Save key: `tyndex_pavel_observation_booth_v1`; STAFF ID: `0274-P`.
- До ухода узлы мониторной используют `CONTROL_PAVEL_PRESENT`; утверждённого
  neutral-loop нет. `booth-intro` снимает голову Кота, а реакции на Ирину,
  узнавание, улыбку и усталость работают как отдельные one-shot clips с hold.
- После кассеты маршрут `control-screens-glitch → control-camera →
  control-camera-ask → control-camera-press → hatch-escape`: сбой не повторяется
  после reload. Нажатие F6 — one-shot `control-channel-switch.mp4` без кнопки
  ожидания; по `ended`/ошибке/15s watchdog/`prefers-reduced-motion` узел
  `autoNext` на `hatch-escape`. Reload с `clipControlChannelSwitch` сразу туда.
- Финал: `slide-guest-light` смотрит `senior-guide-slide-exit.mp4` без choices;
  `autoNext` на `slide-guest-exit` (glitch → guest). HUD × `disabled`, пока
  узел `autoNext`/`guestExit` или смена закрыта; staff-CSS не перекрашивает
  locked-выход в живой коралл.
- Исчерпанный диалог: self-loop «КАКУЮ КНОПКУ?» после первого отказа
  `hideIf: cameraRefused`; повторный клик больше не no-op. Склад/тур уже
  прятали one-shot через `hideIf`.
- `storage-pavel-escape.mp4` подключён к `slide-farewell-left` как one-shot;
  после `ended` остаётся новый `storage-slide-loop.webp`, reload клип не повторяет.
- После ухода узлы мониторной используют `CONTROL_EMPTY`; `control-empty.mp4`
  работает непрерывным loop и сохраняется после reload. Старый постер Ирины
  удалён из HTML/runtime fallback.
- Production audio: batch 1 masters, four accepted Pavel reactions and
  dual-channel runtime are wired. Control uses fluorescent `bed-empty`;
  tour bedroom/storage/bathroom uses calm tour music; drain nodes use the
  anxiety bed; slide farewell has no bed. Cues no longer stop the bed.
  Knock, pour, slide water and wet-gurgle replace the old espresso/door
  placeholders. Drain gibberish 12 cues are cataloged and wired.
- Три принятых 15.024s gibberish-исходника из ElevenLabs web побитово сохранены
  в `projects/pavel-observation-booth/audio/source-elevenlabs/drain-gibberish-web/`.
  12 cues скопированы в `assets/audio/guest/pavel/sfx-drain-voice-*.mp3` и
  подключены к locked node map; review reel в runtime не копировался.
- Новые loop MP4 подключены к спальне тура, длинным волосам в сливе, пустой
  горке и Проводнице у горки. Для каждого fallback — WebP из последнего кадра;
  старые `tour-bedroom-start/hold`, `storage-slide` и `senior-guide-at-slide`
  WebP удалены. Финальный `senior-guide-slide-exit.mp4` не заменялся.
- `tour-bedroom.mp4` непрерывно работает во всех шести узлах разговора Павла
  в спальне; пустая спальня после его ухода остаётся отдельным still-состоянием.
- Настоящий Павел без маски теперь виден в loop на правом CRT во время четырёх
  его реплик после ухода: `control-after-drain`, `control-after-drain-warn`,
  `control-after-hatch`, `control-after-hatch-laugh`. Отдельный pseudo-Pavel в
  похожей маске работает как loop только в `control-camera` и
  `control-camera-ask`; текст прямо не подтверждает подмену.
- `booth-intro` использует `choicesAfterClip`: первый choice не попадает в DOM
  до конца `control-intro-mask-off.mp4`; media-error/15s watchdog снимают замок.
- Слив: визит 1 обрывается после «Тут сыро.»; визит 2 (пар/волос/лысина) между
  первым подносом и маской; визит 3 (длиннее волосы, смена, горка, КРОТ) после
  противогаза; выдача ведёт на третий стук. `DRAIN_VAGUE`, `DRAIN_BECKON`,
  `DRAIN_COUGH`, `DRAIN_HAIR_LONG` и `DRAIN_HUNGRY` работают как loops;
  старые сохранённые `clipDrain*` флаги больше не гасят видео.

- After-hours carnival bed: MCP Music v2 `900` credits (`14032→14932 / 90000`, overage `$0`). Source `30.024s`, master `28.032s`, mean `-28.0` dBFS, peak `-14.3`. Runtime: sound toggle loads `music-carnival-horror-loop.mp3` `200`, console `0`. Validator `12/12`, kit `34` audio ids, `node --check`, `git diff --check`. Cues не вешались.
- After-hours SFX batch 1: five Sound Effects, `169` credits (`14932→15101 / 90000`, overage `$0`). Lock-tap edited to two hits at `0.287s`/`0.559s`; gate-open leading silence trimmed. Desktop gate: sound on, `sfx-lock-finger-taps.mp3` `200` on parents refusal; `sfx-gate-chain.mp3` loads on shooting node with sound retrigger. Console `0`. Validator `12/12`, kit `39` audio ids, `node --check`, `git diff --check`. Paper unfold wired to artifact inspect; distant laugh left unwired.

## Последняя целевая проверка

- Hiring broadcast migration: `hiring.html` получил STAFF-оболочку `ЖИР ТВ`
  (`P210`), Tyndex сохранён как подпись и узел контракта, а переходный диалог
  «ВЫХОД ИЗ ЭФИРА» и его стили удалены. Desktop и mobile `390×844`: overflow
  `0`, форма `0091-A` открывает звонок Ирины, legacy threshold отсутствует,
  console errors/warnings `0`; guest-режим показывает прежнюю анкету. Проверены
  `node --check`, `validate-irina-call-content.js`, `smoke-irina-call.js`,
  public build/verification и `git diff --check`.

- Пользователь подтвердил commit/push archive cells pilot: `HEAD=origin/main`
  `1e12750` (`update`). Следующая правка касается только STAFF-оболочки
  `hiring.html`; guest-форма, звонок Ирины, ID и save keys не меняются.

- Archive cells pilot: STAFF `archive.html` теперь обозначает три металлические
  архивные ячейки вместо кассет; 10 бумажных материалов возвращаются в нужный
  раздел формулировкой «ВЕРНУТЬ ДОКУМЕНТ В АРХИВ». Desktop `1280×800` и mobile
  `390×844`: переключение protocol/dossier/photo и URL-фрагменты работают,
  возврат из досье Павла открывает `#dossiers`, overflow `0`, цели вкладок
  `98×88` на mobile, console errors/warnings `0`. Clean public build: 529
  файлов, verification passed; `node --check`, `git diff --check` прошли.

- Legacy archive indexes: `documents.html` и `photos.html` сохранены в Git, но
  удалены из production allowlist и запрещены verifier-ом в `public/`.
  `_redirects` отправляет clean и `.html` URL в `archive#protocols` /
  `archive#photos`; `_headers` оставляет noindex для рабочих `documents/*`.
  Clean public build: 529 файлов, verification passed; досье Павла сохранено.

- Carrier/device map: добавлен `docs/CARRIER_AND_DEVICE_MAP.md`. Зафиксированы
  отдельные языки гостевого фасада, «ЖИР ТВ», Tyndex-терминала, архивной полки,
  бумаги, фото, VHS, звонка Ирины, физических машин, игровых сцен и личного
  дела. Подтверждены два P1-разрыва: смешение кассеты с бумажным документом и
  параллельные `documents.html` / `photos.html`; первый ещё требует
  канонического выбора. Интерфейс/runtime/media не менялись.

- Archive counts: история добавлений показала, что guest-count обновлялся вместе
  со STAFF-count; при добавлении досье Ирины 1 сентября были пропущены guest и
  summary. Исправлено `0 / 4` → `0 / 5` и `12` → `13`; проверка подтверждает
  `5 + 5 + 3 = 13`. Clean public build/verify и `git diff --check` прошли.

- Production allowlist: динамически загружаемые basename-runtime Лоры/Павла
  явно добавлены в очередь сборщика; это также возвращает текущие media-ссылки
  Лоры после чистой пересборки. `public/` пересобран с нуля: 530 файлов,
  verification passed. Павел desktop `1280×800` и mobile `390×844`: runtime и
  content `200`, `boothReady=true`, intro media `readyState=4`, overflow `0`,
  controls `44×44`, console errors/warnings `0`. После пользовательского push
  live Павел: runtime/content `200`, `boothReady=true`, intro `readyState=4`,
  overflow `0`, console errors/warnings `0`; проверочные сцены Лоры также `200`.

- Code-overload Week 1: мёртвый drawn-cotton CSS удалён; живой PixVerse-путь на месте.
  `css/curator-call.css` только на hiring (+ SPA ensure). `css/red-room-espresso.css`
  на cafe/shift; override `.lora-room__coffee-dialog .rr-espresso { margin-top: 0 }`
  сохранён. Dual-boot Лоры/Павла: статические content/runtime теги сняты с location
  HTML; app.js грузит скрипты один раз. Direct+SPA desktop и `390×844`: overflow 0,
  save keys без изменений, console errors 0. `node --check`, `git diff --check`.
  Commit не делался. `staff.html` по-прежнему статически грузит Lora content для
  досье, не runtime. Espresso/cotton boot-path не трогался.

- about-slides layout: HTML `1024×1024` задавал высоту `1024px` без `height: auto`.
  CSS: `height: auto`, `aspect-ratio 16/9`, `object-fit: cover`,
  `max-height min(42vh, 360px)` / mobile `min(32vh, 220px)`. Staff desktop:
  кадр `1073×360`, brief и каталог в первом экране. `390×844`: `328×184`,
  горизонтальный overflow `0`. `git diff --check`.

- After-hours UI: реплика → мысль без кнопок → клик → только choices/форма.
  Кнопки 2×2 на `390×844` (после актуального CSS). Birthday: подпись, поле,
  «НАЗВАТЬ ДАТУ», затем «ПРОВЕРИТЬ ОТКРЫТКУ» | «ВЕРНУТЬСЯ К ПРИЧИНЕ».
  Финал: «ВЕРНУТЬСЯ К ГЛАВНОМУ ВХОДУ» → `gate-night`. Overflow `0`, цели ≥44.
  Validator `13/13`, game-ui, Copy Desk smoke, `node --check`, `git diff --check`.
  Полный password/artifact route не повторялся.

- Cotton sugar frame: `cotton-machine-sugar.webp` appears after «Засыпать сахар» and remains the pre-play fallback while the accepted spin MP4 loads. Mobile `390×844`: image loaded, overflow `0`; console `0`. Public build/verify, `node --check`, `git diff --check`.

- Birthday password formats: `120826`, `12.8.26`, `12/08/2026`, `12.08.26`
  принимаются; чужие цифры — нет. Placeholder пустой. Live: `120826` →
  «ДАТА ПРИНЯТА». Validator `13/13`, Copy Desk smoke, `node --check`,
  `git diff --check`.

- Birthday password label: `input.prompt` на `birthday-check` — `ПАРОЛЬ`,
  не «ДАТА С ОТКРЫТКИ». Placeholder `ДД.ММ.ГГ` и inspect открытки без изменений.
  Desktop: после клика по реплике поле `ПАРОЛЬ`, «ПРОВЕРИТЬ ОТКРЫТКУ» на месте.
  Validator `13/13`, Copy Desk smoke, `node --check`, `git diff --check`.

- about-slides: исходник был JPEG 1024×1024 / 872KB с расширением `.png`.
  WebP q80 `125KB`, те же 1024×1024 RGB. Привязка только `about.html`
  (`staff-about__screen`). `git diff --check`. Browser QA не запускался
  (media swap без смены логики).

- Pavel exhausted choice: «КАКУЮ КНОПКУ?» один раз меняет реплику на отказ
  и исчезает; остаётся «ОКЕЙ», дальше channel-switch без wait-кнопки.
  Validator ловит self-loop без `hideIf`+`refusalText`. `94/94`, Copy Desk
  smoke, `node --check`, `git diff --check`.


- Pavel finale HUD: `slide-guest-light` без «ВЫЙТИ», клип играет, leave
  `disabled` + `Выход закрыт`. По `ended` → `slide-guest-exit` → guest
  `index.html`, `seniorGuideExit`. Staff-CSS больше не красит locked × как
  живую. Validator `94/94`, Copy Desk smoke, `node --check`, `git diff --check`.
  Пункт 3 (exhausted choices) не трогался.


- Pavel wait-button: «ЖДАТЬ ДЕСЯТЬ СЕКУНД» удалена. Desktop jump на
  `control-camera-ask` → «ОКЕЙ» → мысль «Где находится F6?» без choices →
  клип ~6s → `hatch-escape` «КАНАЛ НЕДОСТУПЕН.» + «Где Павел?». Reload с
  spent clip flag сразу на `hatch-escape`, overflow 0. Validator `94/94`,
  Copy Desk smoke, `node --check`, `git diff --check`. Полный route QA не
  запускался. Пункты 2–3 (inactive HUD / exhausted choices) не трогались.


- Cotton clicker: bracelet notice, «Прочитать браслет» and veil «БРАСЛЕТ» removed. After cotton is ready, «Снять вату» opens `solnyshko-after-hours.html` (`gate-night`). Desktop route confirmed. `node --check`, `git diff --check`.

- Dossier backup v2: новый `dossier_backups`, allowlist 20 материалов и
  authenticated `sync-dossier`. В backup входят профиль, текущий сеанс Ирины и
  три сейва: Лора, Павел, ночное «Солнышко». Клиент обновляет истёкший access
  token, отправляет debounce 900ms, а конфликт с более свежим сервером сначала
  merge-ит по `updatedAt`. Browser mock подтвердил 3/3 keys, outcome-aware чек,
  refresh-token rotation, server-newer/local-newer merge и один sync из runtime
  Красной комнаты. Deno/Node checks, server contract `116/81/20/11`, backup
  contract `4/3`, все три целевых validator/smoke, public build/verify и
  `git diff --check` прошли. Docker отсутствует. Миграция
  `20260831010000_add_dossier_backups.sql` применена в связанном Supabase;
  `begin-dossier-claim`, `consume-dossier-claim`, `restore-dossier` обновлены,
  `sync-dossier` развёрнут. Удалённый lint чист; unauthenticated smoke вернул
  ожидаемые `401`, пустой begin — `400`, CORS preflight — `204`. Публичный
  frontend пока старый: публикация `public/` и live Auth-сценарий не выполнены.

- Impostor dossier role: migration `20260831200000_add_impostor_dossier_role.sql`
  применена в связанном Supabase 31 августа 2026 года; remote migration list
  совпадает с локальной, `supabase db lint --linked --level warning` чист.
  Обновлённые frontend и Edge Functions ещё не развёрнуты.

- Park mobile video: `gate-closed-loop.mp4` / `gate-refuse.mp4` без attached MJPEG;
  Game UI Kit не прячет still до `playing`, `play()` не ждёт только `loadeddata`.
  Chromium `390×844`: loop `readyState` 4, `is-playing`, 1280×720; burst
  `gate-refuse.mp4` тоже играет. Настоящий iOS Safari не прогонялся.
  Validator `12/12`, kit `6/39`, `node --check`, `git diff --check`.


- Pavel VHS reward UX: `assets/staff/tv/pavel-cassette.mp4` подключён к каталогу
  `VHS_CATALOG`; сохранение поддерживает `cassetteIds`, а `SOURCE` только открывает
  список и не запускает видео без выбора. Находка показывает видимый reward,
  создаёт материал в личном деле и обновляет кнопку VCR (`VCR // N`). MP4
  `720×720`, H.264 + AAC stereo, `25.166667s`, poster WebP; browser route
  подтвердил ручной playback со звуком, паузу основного эфира, MUTE для обоих
  потоков, возврат к эфиру и мобильный каталог `390×844`. Validator, `node --check`,
  public build, public verification и `git diff --check` прошли.

- Cotton reshoot: `tmp/irina-cotton-{wait,offer,lookaway}.mp4` → silent H.264
  `1280×720`, 24 fps (`10.04s` / `10.04s` / `6.04s`) + WebP posters. Wait/offer
  overwrite; lookaway на `irina-hello`. Validator `12/12`, `node --check`,
  `git diff --check`. Browser QA не запускался (media swap).


- After-hours text beats: на узле сначала видна одна реплика без choices; клик по строке/панели меняет её на мысль `action` и открывает кнопки. Подпись `mediaFallback` больше не лежит поверх кадра, только при ошибке media. Desktop gate-night: 0 choices до клика, после клика 4 причины входа; `refuse-parents` тоже двухтактный. Overflow `0`. Validator `12/12`, Copy Desk smoke, `node --check`, `git diff --check`. Ключ `tyndex_irina_solnyshko_v1` и route IDs без изменений. Полный password/artifact route не повторялся.

- After-hours after Cursor: Game UI host больше не trapped в `.panel` с `backdrop-filter`; desktop `1280×720` и mobile `390×844` покрывают viewport, overflow `0`, targets `44px`. Normal entry ждёт `ended` и затем включает `park-wide`; reload не повторяет entry. Reduced motion сразу открывает хаб. Public fallback при заблокированном entry MP4 сохраняет still, текст и choices; финальный узел предлагает `НАЧАТЬ НОВУЮ СМЕНУ`, replay возвращает `gate-night`. Fresh burst flags не повторяют refusal/offer после reload. Console errors/warnings `0`; `node --check`, validators, Copy Desk smoke, public build verify и `git diff --check` прошли.

- Solnyshko on Game UI Kit: save key `tyndex_irina_solnyshko_v1`. Desktop gate-night —
  4 choices (3 speech + action), overflow 0. Birthday form 44px, item postcard,
  missing-artifact live «В ЛИЧНОМ ДЕЛЕ НЕТ ОТКРЫТКИ.». Resume `park-grounds` +
  `enterPlayed` даёт `thought` и «КАНАЛ: ВНУТРИ». `390×844` overflow 0. Console
  errors/warnings 0 на gate. Validator `12/12`, kit validator, `node --check`,
  `git diff --check`. Полный password/artifact route не повторялся.
- Game UI Kit fixture: validator `6` nodes / `33` audio ids; `node --check` kit/fixture;
  `git diff --check`. Desktop: 4 top-level choices, group+back. Media 404 оставляет
  still, текст и «ВЕРНУТЬСЯ»; live «Кадр недоступен». Sound unlock `aria-pressed`.
  `390×844` overflow 0, targets ≥44. Reduced motion на `enter` ставит `enterPlayed`
  и сразу показывает choice. Replay `НАЧАТЬ ЗАНОВО` возвращает `gate` и пустые flags.
  Павел / Красная комната / after-hours runtime не менялись.
- Solnyshko after-hours shell: desktop `1280×800` gate-night — fullscreen `100dvh`,
  HUD 44px, speech/action variants, overflow 0. `390×844` birthday-check — form
  44px, item «ПРОВЕРИТЬ ОТКРЫТКУ», missing-postcard notice, sound toggle;
  park-grounds `data-text-kind=thought` и «КАНАЛ: ВНУТРИ». Console errors/warnings
  0. Validator `12/12`, `node --check js/solnyshko-park.js`, `git diff --check`.
  Полный password/artifact route не повторялся.
- Solnyshko shared password: полностью пустой профиль увидел четыре причины,
  получил корректный отказ на отсутствующую открытку, ввёл `12.08.26` и дошёл
  до `park-grounds` после one-shot. Overflow 0, console errors/warnings 0;
  тестовые localStorage-значения восстановлены.
- Solnyshko role artifacts: Animator открыл сохранённую открытку, ввёл
  `12.08.26` и вошёл; Volunteer предъявил сохранённую листовку и вошёл после
  закрытия артефакта.
  Оба входа дошли до `park-grounds` после one-shot, overflow 0, console
  errors/warnings 0. Validator `12/12`, Copy Desk smoke, оба `node --check` и
  `git diff --check` прошли. Тестовые localStorage-значения восстановлены.
- Pavel choice semantics: 36 `speech`, 68 default `action`, 2 `item`;
  `hatch-note` использует отдельный `document` presentation. Проверен маршрут
  до записки на `390×844`: классы и 44px action target корректны, overflow 0,
  console errors/warnings 0. Validator `94/94`, оба `node --check` и
  `git diff --check` прошли.
- `tour-storage-hold.webp` пересобран из последнего (241-го) кадра актуального
  `tour-storage.mp4`: WebP `1504×832`; runtime-привязка подтверждена,
  `node --check js/pavel-observation-booth.js` и `git diff --check` прошли.
- `node --check` обоих изменённых JS, Pavel validator `94/94` и
  `git diff --check` прошли.
- Свежий desktop route: во время intro choices `0`, после `video.ended` choice
  `1`, видео скрыто и показан hold; reload даёт choice сразу без анимации.
  Reduced motion даёт choice сразу без видео. Console errors/warnings `0`.
  Полный route QA не запускался.
- Audio batch 1: шесть MP3 успешно декодируются; длительности `30.024`, `30.024`,
  `3.030`, `3.030`, `4.049`, `5.042` секунды. ElevenLabs account counter вырос
  с `10950` до `12926` (`1976` credits вместе с knock retry), overage `$0`.
  Шесть принятых файлов mastered/cataloged; runtime не изменялся. Точный edited
  knock cue содержит три детектированных удара в `0.398s`, `1.197s`, `2.007s`.
- Drain gibberish: source hashes совпали с Desktop;   12 review MP3 декодируются,
  длительности `0.575–3.161s`, общий review reel `27.951s`; `git diff --check`
  пройден. Смысл остаётся в существующем видимом русском тексте.
- Drain gibberish public: 12 cues in `assets/audio/guest/pavel/sfx-drain-voice-*.mp3`,
  wired to the locked node map. Reel not copied. Jump to `drain-damp` with sound
  on loaded `sfx-drain-voice-damp.mp3` and `music-drain-anxiety-loop.mp3`.
  Visible text unchanged. Validator `94/94`.
- Pavel typewriter: only nodes with `sound`; hold is max(type 16ms/char, cue,
  900ms). Skip once finishes the line, skip again reveals choices. Reload and
  reduced motion show the full line immediately. QA: «Кто просил?» first painted
  as `К` without choices, then full line + choice after hold. `git diff --check`
  passed.
- Real/pseudo CRT loops: оба runtime MP4 — silent H.264, `1024×576`, 24 fps,
  `6.041667s`, с WebP fallback `1024×576`. Целевой desktop route подтвердил
  real Pavel на четырёх удалённых репликах и pseudo-Pavel на `control-camera` /
  `control-camera-ask`, включая повторный отказ; loop/muted/readyState 4,
  console errors/warnings `0`.

## Ограничения дерева

- Не откатывать и не переформатировать большой существующий diff.
- Не читать архив статуса, mega-plans, старые handoff и media-документы без
  конкретной необходимости.
- Grok Build не использовать. Не очищать весь `localStorage`.
