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

## Copy Desk (v1)

Писательский стол, не визуальный редактор сцены.

- Игры: куратор Ирина, Красная комната
- Правка статичного текста и **уникальных** строк внутри функций
- Отдельный блок **КАБИНЕТ**: письма личного дела (тема, превью, текст, имя отправителя, удаление шаблона)
- Поиск по фразе
- Герои: массовое переименование подписи говорящего и отправителя писем
- Роли панели (`Я`, `СИСТЕМА`, записка/касса) не переименовываются оптом
- Сохранение — одна строка в исходнике, без пересборки файла

Не в v1: граф-canvas, play-from-node, создание узлов, JSON эффектов,
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
