# Шаблоны нового чата

Вставь один блок **первым сообщением**. Папка одна:
`/Users/nateglukhov/analog-horror-site`.

«Сохранить изменения» здесь значит: обновить `docs/AGENT_STATUS.md` и снять
write-замок. Commit / push / публикация — только если пользователь отдельно
попросил в этом чате.

---

## 1. Универсальный (переполнение контекста или любой новый чат)

```text
Новый чат. Предыдущее окно закрыто или переполнено. Не опирайся на память
прошлого диалога.

Рабочая папка: /Users/nateglukhov/analog-horror-site
Cursor и Codex работают с этой локальной папкой. GitHub для синхронизации
не нужен. Grok Build не использовать — лимиты исчерпаны.

Сначала только чтение:
1. docs/AGENT_STATUS.md — этап, замок, блокеры, журнал.
2. AGENTS.md
3. git status --short
4. Если активна линия Павла: docs/prompts/GROK_BUILD_PAVEL_OBSERVATION_BOOTH_PRODUCTION_PLAN.md,
   docs/prompts/CODEX_PAVEL_SHELL_TOUR_NOTE.md и актуальный handoff из статуса.

Кратко верни: текущий этап, кто пишет, что уже в дереве, что нельзя делать.
Код не правь, пока я не дам задачу.

После любой write-сессии, до остановки или если контекст снова кончается:
- обнови docs/AGENT_STATUS.md (снимок, журнал, замок FREE);
- не оставляй статус старше фактов в git status;
- commit/push не делай без отдельной просьбы.
```

---

## 2. Продолжить ту же работу (после обрыва)

Подставь одну строку задачи вместо скобок.

```text
Продолжаем ту же работу в новом чате. Контекст старого окна считать потерянным.

Рабочая папка: /Users/nateglukhov/analog-horror-site

Прочитай docs/AGENT_STATUS.md, AGENTS.md и git status --short.
Если замок FREE — займи его под этот чат и узкий scope.
Не создавай второй runtime и не откатывай чужой грязный diff.

Задача этого окна: [одна фраза: что доделать]

После сессии обязательно сохрани смену в docs/AGENT_STATUS.md и сними замок.
Commit/push/публикацию не делать, пока я не попрошу.
```

---

## 3. Только аудит

```text
Только чтение. Ничего не редактируй, замок не занимай.

Рабочая папка: /Users/nateglukhov/analog-horror-site

Прочитай docs/AGENT_STATUS.md, AGENTS.md и git status --short.
Верни сверку статуса с деревом: что DONE, что IN TREE / UNVERIFIED, блокеры.
```

---

## 4. Закрытие сессии (вклеить в конце чата)

```text
Сессия заканчивается. Сохрани смену: обнови docs/AGENT_STATUS.md
(снимок, журнал, writer: FREE). Не делай commit/push, если я не просил.
Кратко напиши, что успел и что должен прочитать следующий чат.
```

---

## 5. Короткая строка, если лень вставлять длинное

```text
Новый чат: прочитай docs/AGENT_STATUS.md + AGENTS.md + git status.
Дальше по статусу. В конце сессии обнови AGENT_STATUS.md и сними замок.
Без commit/push.
```

---

## 6. Сюжет кабинки Павла (один markdown, без runtime)

Черновик: `docs/drafts/pavel-booth-script.md`.
Правда игры: `content/pavel/observation-booth-content.js`.
Обновить черновик из JS: `node scripts/export-pavel-booth-script.js`.
Вернуть только реплики в JS: `node scripts/import-pavel-booth-script.js --apply`.

```text
Новый чат только для сюжета кабинки Павла. Контекст прошлого окна не использовать.

Рабочая папка: /Users/nateglukhov/analog-horror-site

Читай в этом чате только:
1. docs/drafts/pavel-booth-script.md
2. этот абзац правил

Не открывай AGENTS.md, docs/AGENT_STATUS.md, production plan, shot-листы,
js/pavel-observation-booth.js и валидатор, пока я явно не скажу
«синхронизировать» или «вшить в игру».

Правила:
- Правь черновик как стол Copy Desk: speaker, Текст, Отказ, подписи кнопок.
- Новый сюжетный блок помечай <!-- DRAFT-NEW -->. Неприжившийся блок можно
  просто вырезать из md.
- Не меняй room / visual / next / set, пока нет просьбы синхронизировать граф.
- Не запускай import --apply и не трогай content JS без отдельной фразы.
- commit / push / публикация запрещены, пока я не попрошу отдельно.

Задача: [полиш / новый блок / вырезать ветку]
```
