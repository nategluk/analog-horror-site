# Local Copy Desk (writer UI)

**Not for production.** Binds to `127.0.0.1` only via
`scripts/admin-server.js`.

Full Irina handoff: [`docs/IRINA_CONTENT_PIPELINE.md`](../docs/IRINA_CONTENT_PIPELINE.md).

## Start

```sh
# repo root
node scripts/admin-server.js
```

### Быстрый запуск на macOS

Дважды кликните `Copy Desk.command` в корне проекта. Запускатель сам:

1. проверит, не работает ли Copy Desk уже;
2. запустит локальный сервер при необходимости;
3. дождётся готовности и откроет админку в браузере.

Окно терминала нужно оставить открытым, пока Copy Desk используется. Закройте
его, чтобы остановить локальный сервер. Ручной запуск выше остаётся запасным
вариантом.

| URL | Purpose |
|-----|---------|
| http://127.0.0.1:8787/admin/ | Copy Desk — реплики, мысли, письма, имена |
| http://127.0.0.1:8787/admin/nodes.html | Старый инспектор узлов Ирины |
| http://127.0.0.1:8787/hiring.html | Превью сайта |

Port: `ADMIN_PORT` env or default `8787`.

## Copy Desk

Писательский стол, не визуальный редактор сцены. Узел открывается как кадр:
реплика и мысль связным текстом, кнопки выбора отдельно, служебные поля
(`imageAlt`, `mediaFallback`, варианты `lineWhen`) в блоке «Ещё».

- Игры: куратор Ирина, Красная комната, кабинка Павла, парк «Солнышко»
- Сайдбар группирует ветки: у Ирины по `step`, у Павла и Лоры по префиксу id
- Правка статичного текста и **уникальных** строк внутри функций
- Сохранение по blur и Cmd/Ctrl+S, одна строка в исходнике
- Счётчик длины: цель 80/26, жёсткий предел 160/40 (как в GAME_STANDARD)
- Отдельный блок **КАБИНЕТ**: письма личного дела; кнопка **Письмо** и
  «Письмо» у героя создают шаблон от любого выбранного персонажа.
  Рассылка кладёт письмо во входящие STAFF при следующем открытии кабинета.
- Поиск подсвечивает совпадение в открытом узле
- Герои: массовое переименование; роли панели не переименовываются оптом

Не в этой итерации: граф-canvas, play-from-node, создание узлов, JSON эффектов,
онлайн/auth.

## Node inspector (legacy)

`/admin/nodes.html` по-прежнему умеет CRUD узлов Ирины, function source,
validate и export MD. Surgical save для узлов Ирины остаётся в
`scripts/admin-server.js`.

## Files

| Path | Role |
|------|------|
| `admin/index.html` | Copy Desk |
| `admin/admin.js` / `admin.css` | Writer UI |
| `admin/nodes.html` | Legacy node inspector |
| `scripts/lib/copydesk-core.js` | Index / patch / rename |
| `scripts/admin-server.js` | Localhost static + API |
| `content/irina/call-content.js` | Irina source |
| `content/lora/red-room-content.js` | Red Room source |
| `content/pavel/observation-booth-content.js` | Pavel source |
| `content/irina/solnyshko-park-content.js` | Solnyshko source |
