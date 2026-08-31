# CODEX ORCHESTRATION — отчёт нулевого пилота

**Дата:** 28 августа 2026  
**Репозиторий:** `analog-horror-site`  
**Ветка и проверенная вершина:** `main` / `14bba886fcc503b1892ede2e241acb52a0458d9e`  
**Вердикт:** `PASS WITH NOTES`  
**Режим:** только чтение; код, commit, push и публикация не выполнялись

Связанные документы:

- `docs/prompts/GROK_BUILD_PAVEL_OBSERVATION_BOOTH_PRODUCTION_PLAN.md`;
- `docs/prompts/CODEX_ORCHESTRATOR_GROK_CURSOR_MEGA_PLAN.md`.

---

## 1. Цель пилота

Проверить, может ли Codex быть единым оркестратором двух оплачиваемых
исполнителей:

- Grok Build 4.6 через авторизованный встроенный браузер Codex;
- Cursor Grok 4.6 High через Computer Use;
- Codex как диспетчер контекста, независимая проверка и approval gate.

Пилот не должен был начинать реализацию игры. Его результатом должен был стать
проверенный read-only аудит и доказательство, что пользователь не обязан
вручную переносить промпты и ответы между окнами.

---

## 2. Исходное и конечное состояние Git

До пилота и после пилота `git status --short` показывал только:

```text
?? docs/prompts/CODEX_ORCHESTRATOR_GROK_CURSOR_MEGA_PLAN.md
?? docs/prompts/GROK_BUILD_PAVEL_OBSERVATION_BOOTH_PRODUCTION_PLAN.md
```

Во время аудита агенты не создавали и не меняли файлы. Этот отчёт добавлен
после успешного завершения read-only пилота по явной просьбе пользователя для
handoff в новый чат.

`git diff --check` для tracked-изменений не сообщил ошибок. Smoke Copy Desk не
запускался, потому что тест временно переписывает
`content/irina/call-content.js`, а контракт пилота запрещал любые записи.

---

## 3. Ход пилота

### Grok Build 4.6

- Запущен в авторизованном `grok.com` через Codex Browser.
- Выбран режим `Build Beta // Grok 4.6`.
- Использован уже существующий GitHub-коннектор только для чтения публичной
  вершины `14bba88`.
- Новые OAuth-разрешения, загрузка файлов и подключение репозитория не
  запрашивались.
- Итоговый отчёт: 15 956 символов.
- Отображённое моделью время работы: 6 минут 10 секунд.
- Завершено маркером `READ-ONLY AUDIT COMPLETE`.

### Независимая проверка Codex

Codex локально перепроверил основные утверждения Grok через исходники и Git:

- реестр `GAMES` и `SKIP_KEYS`;
- Irina-only `contentPath` legacy node inspector;
- карточку Павла и трёхступенчатый запрос скрытого ID;
- статическую страницу парка;
- открытку Ирины и дату `12.08.26`;
- текущую заглушку `SOURCE`;
- ограничения `smoke-copydesk.js`;
- реально существующие аудиоассеты.

### Cursor Grok 4.6 High

- Запущен через Computer Use в локальном репозитории `analog-horror-site`.
- Интерфейс подтвердил `Cursor Grok 4.6`, effort `High`, ветку `main` и среду
  `This Mac`.
- Получил не полный ответ Grok, а очищенный контраудит-пакет Codex.
- Исследовал 48 файлов, выполнил 30 поисков и 2 read-only команды.
- Отображённое время модели: 4 минуты 30 секунд.
- Контекст интерфейса после ответа: 41%.
- Не запускал `smoke-copydesk.js` и не менял рабочее дерево.
- Завершено маркером `READ-ONLY COUNTERAUDIT COMPLETE`.

---

## 4. Подтверждённые факты

### Copy Desk

- Современный Copy Desk уже рассчитан на несколько игр.
- `scripts/lib/copydesk-core.js` содержит `GAMES.irina` и `GAMES.lora`.
- `admin/admin.js` получает список через `/api/copydesk/games`; переписывать
  UI ради третьей и четвёртой вкладки не нужно.
- `patchLine` меняет один найденный строковый литерал и не сериализует весь
  узел.
- Регистрация парка и Павла требует не только новых записей `GAMES`, но также:
  - корректных `globalName`, `startNode`, `catalogs`, `lockedSpeakers`;
  - аудита `extraNameFiles`;
  - обновления `SKIP_KEYS`;
  - расширения `scripts/smoke-copydesk.js`.

### Legacy node inspector

- `scripts/admin-server.js` держит `contentPath` на
  `content/irina/call-content.js`.
- `/api/nodes*`, `/api/meta`, `/api/graph`, `/api/validate` и старый
  `/admin/nodes.html` относятся к Ирине.
- На первом production-этапе inspector остаётся Irina-only.
- Делать его multi-game ради Павла и парка не требуется.

### Парк «Солнышко»

- `locations/solnyshko-park.html` сейчас является статической гостевой
  витриной.
- На странице нет открытки, ввода даты и отдельного диалога.
- Текущий CTA: `ОСТАТЬСЯ ДО ЗАКРЫТИЯ`.
- Порядок скриптов уже правильный:
  `dossier-store.js → call-content.js → app.js`.
- `staff/locations/solnyshko-park.html` — служебный протокол, а не место для
  гостевого моста.

### Ирина и открытка

- В `content/irina/call-content.js` уже существуют:
  - `animator-postcard`;
  - штамп `12.08.26`;
  - приглашение в парк «Солнышко»;
  - `cctv-pavel-observation-booth`.
- Новый диалог парка не следует помещать в основной звонок Ирины.
- Сохранённую роль игрока нужно только читать для варианта вводной реплики;
  отсутствие профиля ведёт к нейтральной реплике, а не к блокировке.

### STAFF и ID Павла

- `staffDirectory.pavel` существует без `curatorId`.
- Запрос ID без `curatorId` даёт:
  1. `ИДЕНТИФИКАТОР СКРЫТ АДМИНИСТРАЦИЕЙ`;
  2. `ПОВТОРНЫЙ ЗАПРОС ЗАРЕГИСТРИРОВАН`;
  3. intrusion и блокировку кнопки.
- Состояние intrusion использует `tyndex_staff_intrusion_v1` в
  `sessionStorage`.
- Рабочие ID в `hiring` сейчас: `0091-A` для Ирины и `0391-L` для Лоры.
- `0144-C` является неподтверждённой заглушкой и не может быть назначен Павлу.
- Placeholder нельзя записывать в `staffDirectory.pavel.curatorId`: это сразу
  отключит существующую intrusion-механику.

### SOURCE и кассета

- `SOURCE` на главной сейчас показывает только VCR-заглушку:
  `ВСТАВЬТЕ ВИДЕОКАССЕТУ / НОСИТЕЛЬ НЕ ОБНАРУЖЕН`.
- Инвентаря и playback найденной кассеты ещё нет.
- Консоль существует только в STAFF-части главной и требует включённого ТВ.
- Основной `data-cctv-video` слушает `video.ended` и переключает CCTV-канал.
- Кассета должна получить отдельный `<video>` внутри source-screen. Нельзя
  проигрывать её через основной CCTV video element.
- При закрытии SOURCE, выключении ТВ и запуске haunted-ветки кассетный player
  должен ставиться на паузу и корректно сбрасываться.

### Public build

- Проект использует production allowlist в `scripts/build-public.js`.
- Новые HTML, JS, CSS и content-модули не попадут в публикацию автоматически.
- При реализации потребуется обновить `scripts/build-public.js` и
  `scripts/verify-public-build.js`.

---

## 5. Главные найденные риски

### HIGH

1. Поле `room` отсутствует в текущем `SKIP_KEYS`. Значение вроде
   `room: "control"` попадёт в литературный редактор как обычная строка.
2. Новые mechanical string-поля вне `SKIP_KEYS` будут индексироваться Copy
   Desk как редактируемый текст.
3. Function-valued `choices` с повторяющимися литералами могут блокировать
   `patchLine`. Для новых игр предпочтительны статические `choices[]`.
4. Placeholder ID в `staffDirectory` или `hiring` превратится в работающую
   production-ветку и разрушит текущую интригу.
5. Кассета на основном `data-cctv-video` столкнётся с существующим
   `video.ended → advanceCctvChannel`.
6. Парк-узлы внутри `content/irina/call-content.js` загрязнят звонок, его
   validator и Irina-only inspector.
7. `extraNameFiles: ["js/app.js"]` для Павла может позволить переименованию
   персонажа затронуть `staffDirectory`.

### MEDIUM

1. `smoke-copydesk.js` не проверяет отдельную сохранность всех unknown choice
   fields и mechanical fields.
2. `image` находится в `SKIP_KEYS`, но `imageAlt` остаётся редактируемой
   литературной подписью; это допустимо только осознанно.
3. SOURCE сейчас работает только в STAFF и при включённом ТВ — это продуктовый
   инвариант, который необходимо либо принять, либо отдельно изменить.
4. Страница парка уже загружает тяжёлый Irina runtime; новый park runtime не
   должен случайно запускать звонок или дублировать listeners.
5. Временные SFX технически переиспользуемы, но некоторые несут чужую
   семантику: костюм Ирины, кофемашина, Чумной Доктор.

### LOW

- Сохранить legacy inspector только для Ирины.
- Добавить новые versioned storage keys без миграции старых игр.
- Зарегистрировать отдельные content-модули в существующем generic Copy Desk.

---

## 6. Принятый архитектурный курс

### Отдельные content-модули

Рабочие имена:

- `content/irina/solnyshko-park-content.js`;
- `content/pavel/observation-booth-content.js`.

Рабочие globals:

- `TyndexIrinaSolnyshkoContent`;
- `TyndexPavelObservationBoothContent`.

Рабочие Copy Desk IDs:

- `solnyshko`;
- `pavel`.

### Отдельные runtime

- `js/solnyshko-park.js` загружается только на гостевой странице парка;
- `js/pavel-observation-booth.js` загружается только на странице кабинки;
- content загружается перед соответствующим runtime;
- большой граф Павла не переносится в `js/app.js`.

### Литературные и механические поля

Литература, доступная Copy Desk:

- `speaker`;
- `text`;
- `action`;
- `choices[].label`;
- видимая расшифровка голоса;
- `step`, если это пользовательская подпись.

Механика, исключённая через `SKIP_KEYS`:

- `room`;
- `sound`;
- `visual`;
- `next`;
- `set`;
- `require` / `requireAny`;
- `effect`;
- `complete`;
- `media`;
- asset IDs и catalog keys.

На первом этапе не использовать function-valued `choices` и template literals
с `${...}` для реплик.

### Storage

Рабочие новые ключи:

- `tyndex_irina_solnyshko_v1` — состояние встречи, принятая дата и unlock ID;
- `tyndex_pavel_observation_booth_v1` — прогресс игры Павла;
- `tyndex_pavel_cassette_v1` — найдена и вставлена ли кассета.

Не менять:

- `tyndex_curator_call_v4`;
- `tyndex_staff_profile_v1`;
- `tyndex_mode`;
- ключи игры Лоры.

Точная строка ID Павла остаётся `BLOCKED FOR CONTENT`.

---

## 7. Подтверждённый reusable audio pool

Канонические пути; файлы не копировать и не переименовывать до смысловой
приёмки.

### Хоррор-сигналы

- `assets/audio/curator/sfx/child-laugh-distant.mp3` — 4.22 s;
- `assets/audio/curator/sfx/child-laugh-archive.mp3` — 4.08 s;
- `assets/audio/curator/sfx/child-laugh-close.mp3` — 4.03 s;
- `assets/audio/curator/sfx/muffled-help.mp3` — 3.53 s;
- `assets/audio/curator/sfx/unknown-female-voice.mp3` — 2.38 s;
- `assets/audio/curator/sfx/baby-cry-costume.mp3` — 1.85 s, слабый fit из-за
  происхождения сцены.

### CCTV

- `assets/audio/staff/cctv/channel-static.mp3` — 1.36 s;
- `assets/audio/staff/cctv/tv-static-loop.mp3` — 10.87 s;
- `assets/audio/staff/cctv/remote-button-click.mp3` — 1.15 s;
- `assets/audio/staff/cctv/teletext-tone.mp3` — 1.33 s.

### Foley Красной комнаты

- `assets/audio/guest/red-room/shift/sfx-door.mp3` — 2.04 s;
- `assets/audio/guest/red-room/shift/sfx-key-cabinet.mp3` — 1.31 s;
- `assets/audio/guest/red-room/shift/sfx-key-ring.mp3` — 1.05 s;
- `assets/audio/guest/red-room/shift/sfx-paper-crumple.mp3` — 1.12 s;
- `assets/audio/guest/red-room/shift/sfx-paper-fold.mp3` — 1.05 s;
- `assets/audio/guest/red-room/shift/sfx-paper-unfold.mp3` — 1.23 s;
- `assets/audio/guest/red-room/shift/sfx-phone.mp3` — 2.51 s;
- `assets/audio/guest/red-room/shift/sfx-phone-buzz.mp3` — 1.65 s;
- `assets/audio/guest/red-room/shift/sfx-phone-shutter.mp3` — 0.84 s;
- `assets/audio/guest/red-room/espresso-water.mp3` — 1.05 s, семантика
  кофемашины;
- `assets/audio/guest/red-room/espresso-pump.mp3` — 2.25 s.

Имя файла не является доказательством канонической роли. Перед интеграцией
каждый звук нужно прослушать и утвердить по смыслу.

---

## 8. Предварительная карта будущих файлов

### Новые

- `content/irina/solnyshko-park-content.js`;
- `content/pavel/observation-booth-content.js`;
- `js/solnyshko-park.js`;
- `js/pavel-observation-booth.js`;
- отдельная HTML-страница кабинки, имя пока утвердить;
- отдельный CSS кабинки и при необходимости парка;
- validator графа Павла и короткий validator парка;
- документация content schema.

### Вероятно изменить

- `scripts/lib/copydesk-core.js`;
- `scripts/smoke-copydesk.js`;
- `locations/solnyshko-park.html`;
- `js/app.js`;
- `index.html`;
- `staff.html` и `hiring.html`, если утверждённый маршрут требует CTA;
- `scripts/build-public.js`;
- `scripts/verify-public-build.js`;
- CSS для открытки, диалога и SOURCE.

### Не менять на первом этапе

- `content/irina/call-content.js`;
- `admin/nodes.js` и `admin/nodes.html`;
- Irina-only `/api/nodes*` и `contentPath`;
- имена ключей в `js/dossier-store.js`;
- файлы игры Лоры;
- `staff/locations/solnyshko-park.html`.

---

## 9. Метрики эксперимента

| Метрика | Результат |
|---|---:|
| Ручные переносы между окнами | 0 |
| Вмешательства пользователя | 1 подтверждение отправки Grok |
| Осмысленные handoff между сервисами | 2 |
| Циклы переделки | 0 |
| Нарушения scope | 0 |
| Изменения исходников агентами | 0 |
| Commit / push / deploy | 0 |
| Grok model time | 6m 10s |
| Cursor model time | 4m 30s |
| Cursor local coverage | 48 files / 30 searches / 2 commands |
| Cursor context after report | 41% |

Наблюдались временные таймауты чтения состояния Cursor через Computer Use.
Соединение восстановилось без перезапуска приложения и без вмешательства
пользователя. Grok Browser работал стабильно.

Точный расход токенов сервисы в этом workflow не показали, поэтому численная
экономия токенов не доказана. Экономия человеческого переключения контекста
подтверждена: пользователь не переносил ни промпты, ни ответы, ни диффы.

---

## 10. Вывод и следующий gate

Оркестрация признана жизнеспособной:

- Grok Medium подходит для быстрого ограниченного изготовления и первичного
  аудита;
- Cursor High оправдан для локальной интеграции, поиска регрессий и
  контраудита;
- Codex должен оставаться фильтром контекста и независимой приёмкой между
  ними.

Следующий чат должен начать с чтения:

1. `docs/AGENT_STATUS.md`;
2. production plan;
3. orchestration mega-plan;
4. этот pilot report.

После чтения и проверки актуального `git status` следующий разрешённый gate:

```text
ПОДТВЕРЖДАЮ ЭТАП 1 — CONTENT CONTRACT
```

Это разрешает только границы Stage 1 из production plan. Оно не разрешает
парк, playable MVP, медиа, ElevenLabs, commit, push или публикацию.
