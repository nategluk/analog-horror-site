# AGENT STATUS

Короткий снимок для старта. Постоянные правила — в `AGENTS.md`.
Исторические записи не подтверждают текущее состояние runtime или публикации.

## Сейчас

| Поле | Значение |
|---|---|
| Обновлено | 2026-09-20 |
| Ветка / HEAD | `main` / `bbb92ed` |
| Дерево | dirty: пять новых hidden-TV MP4, квадратный fallback-постер, `staff/tv.html`, broadcast docs и asset manifest; commit / push / deploy не выполнялись |
| Активная линия | `SOURCE 006 // НЕУЧТЁННЫЕ КАДРЫ`: пул из пяти 6-секундных found-footage роликов в служебном телевизоре |
| Последний этап | Все клипы `544×544`, H.264, `6.041667 s`; desktop `1280×900` и mobile `390×844`, overflow 0, console 0/0; build 654, verifier 655; diff check прошёл |
| Следующий gate | Пользовательский просмотр; commit / push / deploy только по прямой просьбе |
| Публикация | текущая правка не публиковалась; live-статус не проверялся |

## Write-замок

```text
FREE
```

Перед первой правкой заменить `FREE` на `WRITER / SCOPE / STARTED`.
Перед остановкой обновить короткий снимок и вернуть `FREE`. Одновременно
пишет один агент.

## Текущая работа и сохранность

- 2026-09-20: пять присланных square MP4 сохранены как
  `assets/staff/cctv/found-footage-01/02/03/04/05.mp4`; исходные H.264/AAC
  файлы не перекодировались. Из первого кадра создан
  `found-footage-poster.webp` (`544×544`) как still-fallback. Все шесть
  файлов добавлены в public allowlist через `SOURCE 006` в `staff/tv.html`;
  ролики одноразовые и после `video.ended` возвращают CCTV к шуму. Проверены
  production build `654`, verifier `655`, source/public parity, HTTP `200`,
  desktop `1280×900`, mobile `390×844`, overflow `0`, console `0/0`,
  `node --check js/app.js` и `git diff --check`. Commit / push / deploy не
  выполнялись.

- 2026-09-17: на главной `Соблюдай правила` заменено на `Соблюдайте правила`.
  Проверены целевой текст и `git diff --check`; browser QA не требовался.
  Остальные dirty-изменения сохранены; commit / push / deploy не выполнялись.

- 2026-09-17: по одобрению пользователя `index-atrium-bg-v1.webp` подключён
  к guest `.home-discovery--entry`; центрированное кадрирование, затемнение
  0.22 → 0.62, PNG оставлен резервом. Проверены mobile `390×844`, фактический
  background URL, визуальная читаемость, overflow `0`, console `0/0`;
  build `648`, verifier `649`, `git diff --check` прошли. Desktop отдельно
  не проверялся; commit / push / deploy не выполнялись.

- 2026-09-17: built-in ImageGen создал отдельный вариант фона гостевой главной
  `assets/guest/index-atrium-bg-v1.png` (1672×941): пустой пастельный атриум.
  Изображение просмотрено; runtime-подключение, build и browser QA не выполнялись.
  Commit / push / deploy не выполнялись.

- 2026-09-17: built-in ImageGen создал единый набор шести location hero
  (`1672×941`, 16:9): зоопарк, бассейн, парк «Солнышко», кинотеатр, ТЦ и
  «Красная Комната». PNG сохранены как локальный source reserve, WebP подключены
  в `css/style.css`; шесть location HTML получили `guest-location-page`,
  прозрачную overlay-шапку и мобильное меню. Постеры и игровые ассеты не менялись.
  Проверены все шесть маршрутов на desktop `1280x900` и mobile `390x844`,
  computed background URLs, hero ratios `16:9`/`4:5`, mobile menu, тройной клик
  в STAFF, overflow `0` и console `0/0`; build `647`, verifier `648`.
  Использован built-in ImageGen, CLI fallback не применялся. Commit/push/deploy
  не выполнялись.

- 2026-09-17: по одобрению пользователя гостевые карточки маршрутов и отзывов
  получили `rgba(255, 241, 228, 0.76)` в текстовой области. Превью остаются
  непрозрачными, focus/hover-геометрия сохранена. Проверены computed background,
  фактический WebP wayfinding plate, desktop `1280x900`, mobile `390x844`,
  overflow `0` и console `0/0`; build `641`, verifier `642`. Commit/push/deploy
  не выполнялись.

- 2026-09-17: guest entry hero сокращён по просьбе пользователя: удалён текст
  `Уютные аллеи, мягкий свет и бесконечная музыка игр.`, длинное предупреждение
  разделено на два `<p>`, финальная строка заменена на `Соблюдай правила`.
  Проверены source/public text parity, mobile `390x844`, hero `375×468.75`,
  overflow `0` и console `0/0`; build `641`, verifier `642`. Commit/push/deploy
  не выполнялись.

- 2026-09-17: ImageGen создал wide background plate `1672×941` для гостевого
  указателя: спокойный центр, детали по краям, без текста, логотипов и персонажей.
  PNG сохранён как локальный резерв, runtime использует WebP
  `assets/guest/complex-wayfinding-bg-v1.webp`; `assets/guest/README.txt`
  обновлён. Проверены source/public dimensions, desktop `1280x900`, mobile
  `390x844`, фактическая загрузка background, crop, overflow `0` и console `0/0`.
  Build `641`, verifier `642`; commit/push/deploy не выполнялись.

- 2026-09-17: гостевая поверхность главной упрощена после overlay-перехода:
  `main.panel` и `site-footer` стали прозрачными без внешней рамки/blur,
  route/review backplates получили плоскую геометрию, guest cards сохранили
  тень, цветовую верхнюю полосу и видимый keyboard focus, thumbnails больше не
  имеют дополнительной рамки. Mobile menu blur оставлен. Build `640`, verifier
  `641`, desktop `1280x900`, mobile `390x844`, menu open/close, overflow `0`
  и console `0/0` прошли. Commit/push/deploy не выполнялись.

- 2026-09-17: с гостевой главной удалены повторяющиеся подписи `00 // ВХОД В
  КОМПЛЕКС`, `01 // МАРШРУТЫ`, `02 // ОТКЛИКИ ГОСТЕЙ` и `03 // Административная
  памятка`; крупные заголовки секций и discovery-атрибуты сохранены, у памятки
  `aria-labelledby` оставлен только на основном заголовке. После build `640` и
  verifier `641` проверены desktop `1280x900`, mobile `390x844`, overflow `0`,
  console `0/0`, desktop 3-click/mobile 3-touch и возврат STAFF → guest.
  Commit/push/deploy не выполнялись.

- 2026-09-17: homepage header/nav обёрнуты в `.home-topbar`; в гостевом режиме
  это прозрачная fixed overlay поверх hero, а на mobile доступно компактное
  hamburger-меню. Существующий `.logo` и контракт трёх кликов/тапов сохранены;
  `applyMode` закрывает меню и оставляет music player только в STAFF. Проверены
  desktop `1280x900`, mobile `390x844`, Escape/focus, STAFF restore/exit,
  horizontal overflow `0`, console `0/0`; production build `640` и
  `verify-public-build` `641` успешны. Commit/push/deploy не выполнялись.

- 2026-09-16: STAFF route cards теперь используют существующий SPA-router, поэтому общий `Audio` сохраняет трек, playing-state и прогресс при переходе на `staff/locations/*.html`. Шесть route pages получили единый scoped visual treatment: route accent/background grid, `route-signal.svg`, dossier header и framed CCTV screen; guest routes и сюжетное содержимое не менялись. `node --check js/app.js`, `git diff --check`, production build (`637` files), `verify-public-build`, desktop/mobile browser QA и console `0/0` прошли. Временные route QA screenshots перемещены в корзину; commit / push / deploy не выполнялись.

- 2026-09-15: все 20 активных изображений «Правильного Пути» конвертированы
  в WebP с сохранением dimensions; runtime source теперь содержит только
  `.webp`. Production allowlist не копирует старые PNG/JPG книги в
  `public/assets/staff/documents/right-path-continuism/`. Фон шапки и STAFF-
  логотип текущей страницы также переведены на WebP; исходные PNG сохранены
  вне runtime как резерв.

- 2026-09-15: после проверки из scroll-версии удалены технические и временные
  подписи `ВНУТРЕННЕЕ ЧТЕНИЕ`, `ЧЕРНОВОЙ РЕЖИМ`, `ТЕКСТОВЫЙ УЗЕЛ` и заметка
  о ручной замене. Рабочие элементы чтения и внутриигровые документальные
  формулировки сохранены. Повторные build/verify и desktop/mobile smoke прошли.

- 2026-09-15: три присланных PNG сохранены в
  `assets/staff/documents/right-path-continuism/` как
  `right-path-microstory-01/02/03`; в непрерывном маршруте они последовательно
  заменяют corridor, transfer и ideal-state. Старые три файла не удалены и
  остаются неиспользуемыми исходниками для ручного выбора. Build/verify и
  мобильный/desktop render после замены пройдены.

- 2026-09-15: для ручной редакторской доработки собран непрерывный черновик
  `documents/book-right-path-continuism.html`. Источник сохраняет 22 записи и
  все 68 абзацев; маршрут выводит 20 сохранённых иллюстраций, 10 глав и 8
  не-иллюстрационных вставок: схему функции, контрасты, предупреждения,
  чек-лист передачи, редактирование записи и финальный вопрос. Проверены
  `node --check` для reader/content, `git diff --check`, production build и
  `verify-public-build`; Playwright desktop `1200x827` и mobile `390x844`,
  deep-link главы 09, возврат к началу, отсутствие overflow и console `0/0`.

- 2026-09-15: «Правильный Путь» переразбит по новым указаниям пользователя:
  22 листа включая отдельную обложку, 11 активных изображений из готового
  набора, все 68 исходных абзацев сохранены. Глава 1 и её продолжение на одном
  листе; глава 3 — на одном листе; глава 04: развёртка и завершение на одном
  текстовом листе; глава 8: вертикальные медики в начале, завершение только текст;
  глава 9 — два листа, один вертикальный кадр в начале. Горка на предпоследнем
  листе 21, финальный лист 22 — текстовый. Неиспользованные
  исходники остаются в папке книги для дальнейшего отбора.

- 2026-09-15: по просьбе пользователя готовые кадры для «Правильного Пути»
  скопированы в `assets/staff/documents/right-path-continuism/` и подключены
  к 19 explicit-страницам в `content/book/right-path-continuism.js`. Сохранены
  исходные пропорции: широкие кадры остаются cinematic-вставками, вертикальные
  — портретными; страница 24 использует POV-передачу книги Елены от Проводницы,
  страница 26 — готовый кадр пустой горки с тёмно-красным следом. Пользовательские
  dirty-изменения и `.DS_Store` не менялись. Commit/push/deploy не выполнялись.

- 2026-09-14: `content/archive/layout-manifest-protocol-children.json` снят из
  `content/book/children-protocol.js` через `scripts/extract-book-layout-manifest.js`;
  «Правильный Путь» переведён на explicit 26-листовую сборку с теми же ролями,
  char-budget и 19 пустыми image slots. Проверены manifest contract, сверка
  текста с `/Users/nateglukhov/md_lore/book-right-path-continuism.md`,
  `git diff --check`, `node --check`, production build/verify и Playwright
  desktop/mobile. Copy Desk smoke остаётся заблокированным прежней ошибкой
  `irina character roster missing`; unrelated dirty files не менялись.

- 2026-09-14: текст «Книги Сладкого Сна» закреплён отдельным корневым
  источником `/Users/nateglukhov/md_lore/book-sweet-dream.md`. В файл вошли
  предисловие и десять глав из `content/book/sweet-dream-book.js`; добавлены
  только минимальная помета статуса артефакта и ссылка в README. `navigation/`
  пересобрана через `python3 tools/lore_nav.py build`; runtime сайта и его
  сохранения не изменялись. Commit/push/deploy не выполнялись.

- 2026-09-14: по одобрению пользователя player dossier получил desktop-only
  минимальный редизайн. В `staff.html` сводка/вкладки/действия собраны в левую
  колонку, visual media отделён от двух компактных status-ячееек; сохранены
  все `data-player-*`/`data-personnel-*` контракты. `css/style.css` добавляет
  scoped desktop seal, вкладочные SVG и responsive overrides; мобильный порядок
  и новая декорация не изменяются. `js/app.js` подставляет существующий role
  SVG по роли игрока и очищает его для обычных досье. Commit/push/deploy не
  выполнялись.

- 2026-09-13: по подтверждению пользователя удалён `.archive-section__header`
  из `dossiers.html`, `protocols.html` и `books.html`; `aria-labelledby`
  секций переведён на основной заголовок соответствующего каталога. Маршруты,
  карточки и runtime-логика сохранены.
- 2026-09-13: в `dossiers.html`, `protocols.html` и `books.html` удалён
  технический код `P100` из ссылки возврата; новый текст сохраняет стрелку и
  ведёт на тот же `index.html`. Вложенный блок `archive-section__header` не
  удалялся: его судьба оставлена на подтверждение пользователя.
- 2026-09-13: `css/style.css` получил scoped STAFF-only tile treatment для
  `.staff-material-catalog`: изображения вынесены в верх плитки, названия и
  описания сделаны заметными, `books` ограничен комфортной шириной на desktop;
  guest locked-state, HTML-маршруты, технические ключи и JS не изменялись.
- 2026-09-13: built-in ImageGen создал `assets/staff/donate/zhir-donate-fundraising-animator-v1.png` (1672×941); `css/style.css` ограничивает его слоями `.donate-page-panel` только при `body.staff-mode`, с усиленным затемнением и отдельной мобильной позицией. Гостевой режим, donate-разметка и runtime-логика не изменялись.
- 2026-09-13: в `js/app.js` TXT/AV доступны в `TV OFF`/no-signal, пробуждают аппарат и возвращают корректную подпись заставки; в `css/style.css` экранные панели скрывают только дублирующий статус и сам слой no-signal на время отображения.
- 2026-09-13: `index.html` больше не выводит количества записей в трёх карточках
  каталогов и не добавляет их в aria-label; при новой ревизии показывается общий
  анонс с `status-unread-messages.svg`. Слот сохраняет место в desktop/mobile
  layout, а просмотр каталога по-прежнему отмечает только его revision.
- 2026-09-12: пять статичных STAFF-карточек в `staff.html` перевёрстаны как
  вертикальные полароиды с именем и должностью в нижнем белом поле; `ОТКРЫТЬ
  ДОСЬЕ` сохранено в доступном имени кнопки. На mobile `390x844` полароид
  сохраняет ratio `4:5` вместо прежнего квадратного crop; существующие dossier
  routes и operator card не изменялись.
- 2026-09-12: player dossier перевёрстан как полноэкранный page-like dialog в
  `css/style.css`; existing `staff.html` markup, save keys, вкладки и действия
  сообщений/материалов сохранены. Browser QA: desktop `1280x900` и mobile
  `390x844`, без горизонтального overflow; временные screenshots перемещены в
  `/Users/nateglukhov/.Trash/player-card-qa-20260912`.
- 2026-09-12: STAFF HOME в `index.html` получил sun-mask logo, иконки audio/exit,
  папку досье, шесть самостоятельных карточек маршрутов и responsive grid;
  `staff/tv.html`, dossier access и прямой STAFF route сохранены. QA: desktop
  `1280x900`, mobile `390x844`, overflow `0`, console `0/0`; build `565` и
  `verify-public-build` `566` пройдены.
- 2026-09-12: STAFF route cards переведены на guest index pattern
  `image → title → short copy`; использованы существующие guest thumbnails с
  отдельным тёмным STAFF treatment, прямые `.html`-маршруты сохранены. QA:
  mobile `390x844` и desktop `1280x900`, guest mode не изменён, route click и
  console `0/0`; build `565` и `verify-public-build` `566` пройдены.
- 2026-09-12: в `js/app.js` промежуточный `data-dossier-copy` скрывается при
  наличии профиля, чтобы не дублировать `data-home-dossier-status`; в пустом
  состоянии остаётся инструкция «Нажмите на папку». QA: mobile `390x844`,
  desktop `1280x900`, overflow `0`, console `0/0`; build `565` и
  `verify-public-build` `566` пройдены.
- 2026-09-12: Figma SVG icons `role-animator.svg`, `role-volunteer.svg`,
  `role-impostor.svg` и `status-unread-messages.svg` подключены к dossier
  card; роль выбирает соответствующий icon, envelope badge показывает число
  непрочитанных сообщений и ведёт в `staff.html?personnel=player`, доступные
  подписи сохранены visually-hidden/ARIA. QA: роли animator, volunteer и
  impostor на mobile `390x844`, desktop `1280x900`, overflow `0`, console
  `0/0`; build `569` и `verify-public-build` `570` пройдены.
- В согласованный scope добавлены операторская STAFF HOME, `staff/tv.html`,
  общий доступ к сохранённому личному делу и production-allowlist новой страницы.
- Codex 2026-09-12 01:50: runtime использует
  `assets/staff/tv/zhir-tv-unit-mobile-remote-v1.webp` (512x726, TV, brown stand
  и маленький R16-пульт одной
  ширины); сохранены прозрачные source PNG для монитора и тумбы.
  Mobile `390x844` — юнит full-bleed, экран не искажён, R16 раскрывается до
  211x281 поверх нижней части ТВ/тумбы, но не заходит на экран; закрытие через
  боковую `×`, футер не перекрывается. Desktop также проверен; console без
  ошибок и предупреждений. `git diff --check`,
  `node --check js/app.js`, build и `verify-public-build` пройдены.
- Commit/push/deploy не делались.
- Фон `assets/staff/tv/zhir-tv-kindergarten-carpet-v1.png` подключён к сцене
  через CSS; desktop показывает детсадовскую стену и зелёный ковёр, mobile
  сохраняет full-bleed TV-юнит. Build/verify и console QA пройдены.
- `assets/staff/tv/zhir-tv-standby-led-on.svg` подключён как state-layer на
  запечённой лампе; при `TV OFF` он светится с мягким пульсом, при POWER ON
  скрывается. Desktop/mobile state QA и console QA пройдены.
- `assets/staff/tv/zhir-tv-unit-mobile-remote-v1.webp` собран на том же
  512x726 canvas: маленький R16-пульт встроен по центру нижней полки; `staff/tv.html`
  использует его как idle-state, а shelf-wide handle открывает большой пульт поверх.
  Desktop/mobile before/after QA, build/verify и console QA пройдены.
- Figma сейчас только `40:2` / frame `47:3`: раздельные SOURCE CRT, brown stand,
  R16 remote, VHS. Страницы `47:2` и component set `48:22` в файле нет.
- Референсы `download.png` и screenshot 23:37 показывают нужную коричневую тумбу,
  но тумба висит на шторе без пола. Codex-plates `zhir-tv-*-stage-*` дают пол,
  но другую (тёмную) тумбу и запечённый пульт.
- Геометрическая проверка вариантов была выполнена на отклонённом draft и не
  считается финальной проверкой целевого юнита.
- Новый remote не генерировался: использован `assets/staff/tv/zhir-tv-remote-r16.webp`.
- Неподключённые ассеты Codex сохраняются на диске; использованные для TV-сцены
  не изменялись: `assets/staff/home/`, `assets/staff/tv/zhir-tv-monitor-vhs.webp`.
- Документы процесса и пользовательские dirty-изменения не откатывались.
- Последняя runtime-попытка откатана; временный brown stand и browser screenshots
  перемещены в корзину, commit/push/deploy не выполнялись.
- Резервная копия прежней сессии:
  `/Users/nateglukhov/Desktop/staff-home-session-backup-20260910-224856`.

## Контекст по задаче

- Источники runtime, канона и правила проверки перечислены в `AGENTS.md`.
- Для STAFF/ЖИР ТВ и архивных носителей: `docs/CARRIER_AND_DEVICE_MAP.md`.
- Для сюжетного UX, media lifecycle и сохранений: `docs/GAME_STANDARD.md`.
- Решения по ночному «Солнышку», Павлу, аудио, восстановлению досье и старые
  результаты QA сохранены в `docs/archive/AGENT_STATUS_SNAPSHOT_2026-09-11.md`.
  Читать только нужный раздел при работе над этой темой; сверять технические
  утверждения с текущими исходниками.

## Проверка ревизии

- WebP migration: активный набор уменьшен с `41.77 MiB` до `3.04 MiB`; фон
  шапки — с ~`2 MiB` до `60 KiB`, STAFF-логотип — с `232 KiB` до `32 KiB`.
  Чистый Playwright run страницы сделал только WebP raster requests, все 20
  изображений декодировались успешно, нет PNG/JPG-запросов, desktop/mobile
  overflow отсутствует, console `0 errors / 0 warnings`. Build и
  `verify-public-build` успешны.

- Copy cleanup: старые временные подписи отсутствуют в DOM; Playwright
  подтвердил 22 секции, 20 image nodes, 10 TOC links, 8 artifacts, deep-link
  `#right-path-chapter-09`, desktop `1200x827`, mobile `390x844`, отсутствие
  overflow и console `0 errors / 0 warnings`. Build и `verify-public-build`
  успешны.

- Microstory media swap: source/public asset paths и размеры новых PNG
  проверены; старые `10/16/22` больше не встречаются в runtime source, новые
  три запроса вернули `200`. Playwright подтвердил 22 секции, 20 image nodes,
  8 artifacts, `390x844` без overflow и console `0 errors / 0 warnings`.

- Continuous Right Path draft: 22 scroll-секции, 20 image nodes (`1 eager` /
  `19 lazy`), 10 TOC links и 8 document artifacts; прямой переход к главе 09
  и кнопка «К НАЧАЛУ» проверены. Свежий mobile run показал 5 ближайших
  загруженных изображений при открытии и отсутствие горизонтального overflow;
  все image requests завершились `200`, console `0 errors / 0 warnings`.

- Right Path reflow: все 68 абзацев сверены по порядку с прежним источником;
  23 листа/11 изображений и их пути проверены, `node --check` книги и reader,
  `git diff --check`, production build (`626` source files) и
  `verify-public-build` (`627` public files) пройдены. В локальном STAFF-просмотре
  проверены обложка и листы 17–20, 22–23; визуально подтверждены вертикальные
  медики, текстовое завершение главы 8, двухлистовая глава 9 и текстовый финал.
- Right Path image integration: `node --check content/book/right-path-continuism.js`
  и `node --check js/sweet-dream-book.js`, `git diff --check`, проверка всех
  19 source/public image paths и фактических dimensions пройдены; production
  build (`634` source files, `635` public files) и `verify-public-build`
  успешны.
- Guest hero rotation: обычный вход выбирает только `wonder` или
  `video-archives`; явный `?hero=` override сохранён, остальные варианты не
  входят в rotation. `node --check js/app.js`, `git diff --check` и Playwright
  проверка `8` reload/override на локальной guest-главной пройдены; overflow
  отсутствует, console `0/0`.
- Children footage: `node --check content/book/children-protocol.js`, `node --check
  js/sweet-dream-book.js`, `git diff --check`, production build (`612` файлов) и
  `verify-public-build` (`613` файлов) пройдены; Playwright проверил страницы
  7/9/11/13/15/20 в STAFF на desktop и `390x844`: все изображения загрузились,
  горизонтальные источники `1664×936`, вертикальные `1024×1536`, explicit label
  `26` страниц и overflow `0`; финальная замена страницы 20 повторно проверена
  через `file`, production parity и `verify-public-build`.
- Personnel polaroid copy: `git diff --check`, production build (`580` файлов)
  и `verify-public-build` (`581` файлов) пройдены; Playwright проверил STAFF
  на desktop `1280x900` и mobile `390x844`: пять карточек, `КАДРОВАЯ ЗАПИСЬ`
  отсутствует, текст в DOM сохранён для action name, ratio `4:5`, overflow `0`,
  console `0/0`; одна карточка открыла и закрыла dossier.
- Material catalogs / STAFF HOME signal cleanup: `git diff --check`,
  `node --check js/app.js`, production build (`580` files) и
  `verify-public-build` (`581` files) пройдены; Playwright проверил STAFF HOME
  на desktop `1280x900` и mobile `390x844`: icon-only SVG-индикаторы новых
  материалов, отсутствие `ЯЧЕЙКА` / `P400` / `NEW` / `3 КАТАЛОГА`, порядок
  `каталоги → маршруты`, отсутствие program-кнопки в футере и console `0/0`.
- Player dossier: `git diff --check`, `node --check js/app.js`, production
  build (`565` files) и `verify-public-build` (`566` files) пройдены; Playwright
  console `0 errors / 0 warnings`, tabs, message detail, artifact detail,
  close/focus return and ordinary dossier geometry checked.
- Для archive-cell integration выполнены `git diff --check`, production build
  (`578` файлов) и `verify-public-build` (`579` файлов); browser QA STAFF HOME
  на desktop `1280x900` и mobile `390x844`: overflow `0`, console `0/0`, все
  три hash-перехода открыли соответствующие вкладки архива.
- Browser QA пройден для desktop и `390x844`: STAFF HOME, STAFF TV, overflow,
  восстановление досье/инвентарь и POWER/CH1; console без ошибок.
- Figma Phase 0: страницы, nodes, variables, styles и библиотеки проверены read-only.
- Figma Phase 0 cleanup: удалены страницы `0:1`, `2:16`, `2:17` и draft-ноды
  `40:3`, `40:7`, `41:3`, `42:60`; переменные/стили документа сохранены.
- Figma Phase 1: загружены source-ассеты, собран component set `48:22`,
  проверены страницы, старые node IDs и screenshot всех четырёх состояний;
  затем пользователь отклонил unit как не соответствующий референсу.
- Публикация не выполнялась. Живой сайт остаётся прежней рабочей версией.
