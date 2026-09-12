# AGENT STATUS

Короткий снимок для старта. Постоянные правила — в `AGENTS.md`.
Исторические записи не подтверждают текущее состояние runtime или публикации.

## Сейчас

| Поле | Значение |
|---|---|
| Обновлено | 2026-09-12 18:24 CDT |
| Ветка / HEAD | `main` / `a579bc3` |
| Дерево | dirty: пользовательские STAFF HOME-изменения сохранены; лиминальный фон, centered horror v2 и CSS-знак `EXIT` подключены к `site-header` |
| Активная линия | centered STAFF header horror cue |
| Последний этап | `site-header-bg-horror-v2.png` заменил v1 в STAFF-шапке; существующая синяя кнопка получила красный `EXIT` через CSS, доступное имя и механика выхода сохранены. `git diff --check`, production build `582`, `verify-public-build` `583`, Playwright desktop/mobile, overflow `0`, console `0/0` и возврат в гостевой режим пройдены. Commit / push / deploy не выполнялись. |
| Следующий gate | commit / push / deploy только по прямой просьбе |
| Публикация | живой сайт оставляем как есть; Codex-пластины не публиковать |

## Write-замок

```text
FREE
```

Перед первой правкой заменить `FREE` на `WRITER / SCOPE / STARTED`.
Перед остановкой обновить короткий снимок и вернуть `FREE`. Одновременно
пишет один агент.

## Текущая работа и сохранность

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
