# Irina call: content pipeline & agent handoff

**Актуально: 28 июля 2026.**  
Документ для следующего агента/разработчика: что сделано, где правда, как
править, чего не ломать.

Связанные файлы:

| Документ | Роль |
|----------|------|
| `docs/IRINA_CALL_GAME.md` | Механика звонка, классы, прогресс, карта эпизода |
| `docs/IRINA_DIALOGUES.md` | Производный дамп всех реплик (не редактировать) |
| `content/irina/README.md` | Короткий workflow правки сценария |
| `docs/IRINA_CONTENT_PIPELINE.md` | **Этот файл** — pipeline, Stage 0/1, admin, handoff |
| `../../md_lore/irina.md` | Канон характера (не код) |

---

## Зачем это появилось (контекст сессии 28.07.2026)

Проблема: диалоги Ирины жили огромным объектом `curatorNodes` внутри
`js/app.js` (~7k строк). Редактировать ветки в Articy / разрозненных
форматах было тяжело.

Решение в два этапа:

1. **Stage 0 — data split:** сценарий вынесен в
   `content/irina/call-content.js`, runtime остаётся в `js/app.js`.
2. **Stage 1 MVP — local admin:** `scripts/admin-server.js` + `admin/`
   для CRUD узлов с **surgical save** (не пересобирает весь файл).

Не сделано (следующие этапы, не путать с готовым):

- visual graph canvas;
- play-from-node в admin;
- декларативные conditions вместо JS-функций;
- live messages игрокам от персонажей (нужен server sync / claimed dossiers);
- auth / публичный deploy admin.

---

## Источник правды (критично)

```text
ПРАВДА СЦЕНАРИЯ     content/irina/call-content.js
ПРАВДА ДВИЖКА       js/app.js  (UI, effects, classification, storage)
ПРАВДА ЛОРА         md_lore/irina.md  (вне репо-сайта: ~/md_lore/irina.md)
ПРОИЗВОДНОЕ         docs/IRINA_DIALOGUES.md  (export only)
```

### Что лежит в content-модуле

`window.TyndexIrinaCallContent` (загружается **до** `js/app.js` на всех
HTML-страницах, где есть app):

| Поле | Было в app.js | Назначение |
|------|---------------|------------|
| `nodes` | `curatorNodes` | Граф звонка (~116 узлов) |
| `files` | `curatorFiles` | Скачиваемые вложения звонка |
| `rewardCopy` | `curatorRewardCopy` | Текст на обороте открытки/листовки |
| `staffMessages` | `staffMessages` | Шаблоны входящих в личном деле |
| `staffArtifacts` | `staffArtifacts` | Каталог материалов STAFF |
| `nodeArtifacts` | `curatorNodeArtifacts` | nodeId → artifactId при входе в узел |
| `mediaBase` | — | `assets/staff/curators/irina/` |
| `curatorId` | — | `0091-A` |

### Что остаётся в `js/app.js`

- `getClassificationSignals`, `getCuratorAssignment`, `getAssignmentCallbacks`
- `applyCuratorEffect`, progress/profile, localStorage keys
- UI модалки звонка, typing, video/still/terminal, sound
- гидрация URL ассетов через `audioAsset()`
- staff directory, avatars, dossier claim UI

**Не переносить classification logic в content** без явного решения:
content-функции вызывают её через runtime bridge.

---

## Runtime bridge (обязательный контракт)

После Stage 0 content-модуль **не** замыкается на `app.js`. Функции в
`text` / `choices` (например `name-ack`, `assignment`) обращаются к:

```js
// content/irina/call-content.js
const runtime = () => window.TyndexIrinaRuntime || {};
const readStaffProfile = (...args) => runtime().readStaffProfile?.(...args);
const getCuratorAssignment = (...args) => runtime().getCuratorAssignment?.(...args);
// ...
```

`js/app.js` **обязан** выставить до первого `renderNode`:

```js
window.TyndexIrinaRuntime = {
  readStaffProfile,
  getCuratorAssignment,
  getAssignmentCallbacks,
  isCloseClassification,
};
```

Если bridge отсутствует, звонок падает на `name-ack` /
`assignment` с `ReferenceError` (поймано smoke-тестом 28.07).

Порядок скриптов на страницах:

```html
<script src="…/js/dossier-store.js"></script>
<script src="…/content/irina/call-content.js"></script>
<script src="…/js/app.js"></script>
```

Пути: `content/…`, `../content/…`, `../../content/…` в зависимости от
глубины HTML. Не подключать `app.js` без content на страницах, где app
используется.

---

## Как править диалоги

### Рекомендуемый путь (admin)

```sh
cd /path/to/analog-horror-site
node scripts/admin-server.js
# http://127.0.0.1:8787/admin/
# превью: http://127.0.0.1:8787/hiring.html
```

| Действие | API / UI |
|----------|----------|
| Список/поиск узлов | `/api/meta`, sidebar |
| Открыть узел | `/api/nodes/:id` |
| Сохранить | PUT `/api/nodes/:id` |
| Создать | POST `/api/nodes` `{ id: "kebab-case" }` |
| Удалить | DELETE `/api/nodes/:id` (не entry: `intro`, `reclassification-entry`) |
| Validate | POST `/api/validate` |
| Export MD | POST `/api/export` |
| Graph edges | GET `/api/graph` |

**Bind только `127.0.0.1`.** Не деплоить `/admin` на прод без auth.
Корневой `_config.yml` исключает `admin/` и `scripts/` из сборки GitHub
Pages: инструменты остаются в Git, но не становятся маршрутами сайта.

### Surgical save (важно для агента)

`scripts/admin-server.js` **не** пересобирает весь `call-content.js` при
save (раньше `buildContentFile` ломал formatting всего файла).

Поведение:

1. **Scalar-only patch** (`text`, `step`, `speaker`, `media`, `signal`…):
   меняется только литерал свойства; `choices` и соседи byte-identical.
2. **Complex change** (`choices`, function bodies, add/remove keys):
   переписывается **только** entry этого node id внутри `const nodes = {…}`.
3. **Create / delete:** вставка/удаление одной записи; catalogs не трогаются.
4. Поля choice, которых ещё нет в MVP-форме (`image`, `imageAlt` и будущие
   расширения), сохраняются при редактировании остальных полей.

Проверено 28.07: text roundtrip exact; create+delete exact; validate OK.

При правках surgical-логики смотреть:

- `tryPatchNodeProperties` — in-place scalars + deepEqual для complex
- `upsertNodeInSource` / `deleteNodeInSource` — границы entry
- `entryStart` включает indent строки ключа (иначе остаётся мусор-отступ)
- `formatNodeEntry` — reindent: **не** схлопывать все `}` на keyIndent
  (баг с вложенными choices уже фиксили)

### Ручной путь

1. Править `content/irina/call-content.js`
2. `node scripts/validate-irina-call-content.js`
3. `node scripts/export-irina-dialogues.js`
4. `node scripts/smoke-irina-call.js`
5. Браузер: staff mode + ID `0091-A` на `hiring.html`

### Запрещено без необходимости

- Править диалоги в `js/app.js` (там их больше нет).
- `node scripts/extract-irina-call-content.js` — **one-time migration**;
  сейчас падает, потому что `curatorNodes = {` нет в app.js. Не «чинить»
  extract, а править content.
- Редактировать `docs/IRINA_DIALOGUES.md` вручную.

---

## Скрипты

| Скрипт | Назначение |
|--------|------------|
| `scripts/admin-server.js` | Local site + admin API на `:8787` |
| `scripts/validate-irina-call-content.js` | Граф, missing next, catalogs |
| `scripts/export-irina-dialogues.js` | → `docs/IRINA_DIALOGUES.md` |
| `scripts/smoke-irina-call.js` | Validate + bridge sample (`name-ack`, `assignment`) |
| `scripts/extract-irina-call-content.js` | **Устаревшая миграция Stage 0 only** |

---

## Admin UI layout

```text
admin/
  index.html   # shell
  admin.css
  admin.js     # client; говорит с /api/*
scripts/admin-server.js  # static site root + API + surgical writer
```

Function-поля в API сериализуются как `{ "__fn": "() => …" }` и
восстанавливаются через `new Function`. Редактор показывает function
source в textarea.

---

## Smoke / QA checklist для агента после правок

Минимум:

```sh
node scripts/validate-irina-call-content.js
node scripts/smoke-irina-call.js
```

Полный браузерный путь (Playwright или вручную):

1. `tyndex_mode=staff` (localStorage) или triple-click logo.
2. `hiring.html` → ID `0091-A`.
3. intro → sound (тишина ок) → 18+ → имя → orientation.
4. Убедиться: нет `pageerror`, progress в `tyndex_curator_call_v4`,
   имя в `tyndex_staff_profile_v1`.
5. Content module: `window.TyndexIrinaCallContent.nodes` ≈ 116 keys.
6. Runtime: `window.TyndexIrinaRuntime.getCuratorAssignment` is function.

Ключи storage (не менять без миграции version):

- `tyndex_curator_call_v4` — сеанс звонка
- `tyndex_staff_profile_v1` — личное дело
- `tyndex_mode` — guest/staff

---

## Почему не JSON

~38 `text` и часть `choices` — функции от `progress` (и иногда profile
через runtime). Полный JSON потребует declarative condition language
(Stage 1.5+). Сейчас content = **JS data module**, admin умеет править
строки/choices и function source.

---

## Карта ответственности при багах

| Симптом | Куда смотреть |
|---------|----------------|
| Звонок не открывается / нет nodes | script order, `call-content.js` load |
| `readStaffProfile is not defined` | runtime bridge в content + app.js |
| Битый next / сирота | `validate-irina-call-content.js` |
| Save переписал весь файл | regression в admin-server surgical path |
| После save сломан choices indent | `formatNodeEntry` / nested `}` |
| После save пропали карточки выбора | `admin.js` / сохранение неизвестных полей choice |
| Classification «не та роль» | `getCuratorAssignment` в **app.js**, не content |
| Character voice wrong | `md_lore/irina.md` + text in content |
| Docs реплик устарели | `export-irina-dialogues.js` |

---

## Объём на момент handoff

Ориентиры (перепроверять validate/export):

- узлов: **116**
- choice labels ≈ **177**
- entry nodes: `intro`, `reclassification-entry`
- curator ID: `0091-A`
- admin port default: **8787**

`docs/IRINA_CALL_GAME.md` «Коротко» может ещё содержать старые 114/175 —
при расхождении верить content + validate, и обновить CALL_GAME.

---

## Suggested next work (не начато)

1. Play-from-node / jump-to-node в admin.
2. Declarative conditions → меньше raw functions.
3. Character mail (Stage 2) поверх claimed dossiers + Supabase.
4. Graph visualization (edges API уже есть: `/api/graph`).
5. Не коммитить admin на публичный origin без access control.

---

## Быстрый старт для нового агента

```text
1. Прочитать этот файл.
2. Прочитать docs/IRINA_CALL_GAME.md (механика) и content/irina/README.md.
3. Не трогать docs/IRINA_DIALOGUES.md руками.
4. Диалоги → content/irina/call-content.js (или admin :8787).
5. Движок/классы → js/app.js.
6. После правок: validate → export → smoke → hiring 0091-A.
```
