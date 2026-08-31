# Cursor handoff — Этап 3: PAVEL MVP

Рабочий каталог: `/Users/nateglukhov/analog-horror-site`.

Пользователь подтвердил только:

```text
ПОДТВЕРЖДАЮ ЭТАП 3 — PAVEL MVP
```

## Режим работы

Начни строго с read-only аудита. Не редактируй файлы, пока пользователь в Cursor отдельно не подтвердит предложенный тобой план и точный список файлов.

Не выполняй commit, push, deploy, публикацию, генерацию медиа, ElevenLabs или подключение новых сервисов/production-зависимостей. Не переходи к этапу 4.

Рабочее дерево уже грязное: изменения этапов 1–2 и другие пользовательские файлы нельзя откатывать, переформатировать или включать в массовую переработку. Сначала выполни `git status --short` и отдели существующие изменения от будущего diff этапа 3.

## Уже завершено

Этап 1:

- `content/pavel/observation-booth-content.js` — минимальный тестовый content contract;
- Pavel зарегистрирован в Copy Desk;
- `scripts/validate-pavel-observation-booth.js`;
- smoke доказывает surgical/byte-identical round-trip и сохранность mechanical fields.

Этап 2:

- открытка и встреча с Ириной на `locations/solnyshko-park.html`;
- content-модуль `content/irina/solnyshko-park-content.js`;
- runtime `js/solnyshko-park.js` и отдельный ключ `tyndex_irina_solnyshko_v1`;
- завершение открывает `staff.html?personnel=pavel`;
- ID Павла не утверждён и остаётся `BLOCKED FOR CONTENT`;
- desktop и `390×844` QA пройдены, console errors/warnings: 0.

## Источники правды

Прочитай до любых предложений:

1. `docs/AGENT_STATUS.md` — этап 3 уже лежит в дереве; не создавать второй runtime.
2. `AGENTS.md` полностью.
3. `docs/prompts/GROK_BUILD_PAVEL_OBSERVATION_BOOTH_PRODUCTION_PLAN.md`, особенно этап 3.
4. `docs/PAVEL_OBSERVATION_BOOTH_CONTENT.md`.
5. `content/pavel/observation-booth-content.js`.
6. `scripts/validate-pavel-observation-booth.js`.
7. `docs/IRINA_SOLNYSHKO_BRIDGE.md` и реализацию этапа 2.
8. `~/md_lore/pavel.md` как постоянный канон персонажа.
9. Текущую реализацию `SOURCE`, навигации, persistence и media fallback в репозитории.

Канонические ограничения:

- кабинка обозрения — центральная служебная комната с экранами security cams, не кинотеатр «Иллюзион»;
- Павел использует доверие игрока: просит отключить нужную камеру, сбегает, а игрок становится оператором и не может уйти до появления сменщика;
- не превращать MVP в FNAF-loop или jumpscare-аттракцион;
- агентность игрока выражается запомненными действиями и итоговыми артефактами;
- литературные реплики этапа 1 являются тестовыми, не финальным сценарием;
- не раскрывать глаза Пса и не менять несвязанный канон.

## Разрешённый scope этапа 3

После отдельного подтверждения плана реализуй только playable MVP:

- отдельная страница игры Павла;
- пять комнат/ракурсов: control, bedroom, bathroom, storage, hatch;
- node runtime поверх существующего content contract;
- сохранение и возобновление в новом версионированном ключе, без миграции старых игр;
- звук только opt-in; сюжетно важный смысл всегда продублирован видимым текстом;
- только уже существующие временные SFX;
- короткая тестовая цепочка `звук → перемещение → проверка → изменение`;
- найденная кассета как предмет/артефакт;
- тестовый финал ловушки сменщика;
- poster/still и `prefers-reduced-motion` fallback.

Не добавляй финальные литературные реплики, окончательные изображения/видео, ElevenLabs, платную генерацию, новые внешние сервисы или этап 4.

## Что сначала вернуть пользователю в Cursor

Сформируй компактный read-only отчёт:

1. фактическое состояние текущего diff;
2. какие существующие компоненты можно переиспользовать;
3. proposed runtime/state schema и новый storage key;
4. точный список файлов для создания/изменения;
5. риски `LOW / MEDIUM / HIGH`;
6. тестовую матрицу desktop + `390×844`, clean/resume, sound off/on, reduced motion, console и media fallback;
7. открытые решения, которые нельзя выдумывать.

После отчёта остановись и жди от пользователя точную фразу:

```text
ПОДТВЕРЖДАЮ CURSOR IMPLEMENTATION — PAVEL MVP
```

После будущей реализации остановись на gate этапа 4:

```text
ПОДТВЕРЖДАЮ ЭТАП 4 — FULL SCRIPT AND MEDIA
```
