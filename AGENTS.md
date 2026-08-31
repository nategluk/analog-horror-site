# AGENTS.md

## Проект и границы

- Репозиторий — русскоязычный статический analog-horror ARG «Детский Жир».
- Сохранять атмосферу, мобильную читаемость, неоднозначность и последствия
  выбора. Не превращать игру в энциклопедию лора.
- «Только чтение», аудит или диагностика не разрешают правки. Для новых сцен
  сначала согласовать драматургию. Сохранять пользовательский dirty diff.
- Не добавлять production-зависимости, backend или внешние сервисы без
  согласования. Не делать commit, push, deploy или публикацию без прямой просьбы.

## Старт и write-замок

- Перед работой читать только `docs/AGENT_STATUS.md` и `git status --short`.
  Остальные документы открывать по необходимости для текущего узкого scope;
  архивы и старые handoff/production plans по умолчанию не читать.
- Перед первой правкой занять write-замок в `docs/AGENT_STATUS.md`; одновременно
  пишет один агент. Перед остановкой обновить короткий снимок и снять замок.
- Cursor и Codex работают с одной локальной папкой. GitHub не используется для
  синхронизации. Grok Build не использовать. PixVerse не использовать для сцен
  с повторяющимися лицами или персонажами.

## Источники правды

- Общий runtime/UI/persistence: `js/app.js`; досье: `js/dossier-store.js`.
- Ирина: `content/irina/call-content.js`; ключ `tyndex_curator_call_v4`.
- Лора: `content/lora/red-room-content.js`, `js/lora-red-room.js`;
  ключ `tyndex_lora_red_room_v1`.
- Павел: `content/pavel/observation-booth-content.js`,
  `js/pavel-observation-booth.js`; ключ `tyndex_pavel_observation_booth_v1`.
- Общий UX/runtime-контракт сюжетных игр: `docs/GAME_STANDARD.md`; читать при
  создании игры или изменении её media/persistence, не на каждом unrelated turn.
- STAFF: ключи `tyndex_staff_profile_v1` и `tyndex_mode`.
- Канон персонажей находится в `~/md_lore/`. Производные экспорты и файлы в
  `docs/drafts/` не редактировать и не считать runtime-правдой без запроса.

## Контент и медиа

- Сюжетно важная информация остаётся в видимом тексте; звук добровольный.
- Медиа обязано иметь still-fallback. One-shot завершается по `video.ended`;
  loop и burst не подменяют друг друга. Reduced motion не должен блокировать путь.
- Не очищать весь `localStorage`; удалять только явный тестовый ключ.
- Не включать `.DS_Store`, `.env`, секреты и временные browser-артефакты.

## Проверки по риску

- Всегда: `git diff --check`; для изменённого JS — `node --check`.
- Контент/реплики: целевой validator или smoke; без browser QA.
- Замена media без изменения логики: проверить путь, формат/dimensions или
  `ffprobe`, fallback и целевую привязку; полный браузер не запускать.
- Runtime, CSS, persistence или media lifecycle: один репрезентативный маршрут
  в одном viewport. Desktop + `390x844` — на завершении крупного этапа.
- Полный маршрутный browser QA, replay, persistence, sound, reduced motion,
  console и overflow выполнять только для release candidate или по прямой просьбе.

## Публикация

- Локальный commit не равен публикации. Обычный push пользователь делает через
  GitHub Desktop. После публикации дождаться rebuild и сначала дать read-only
  отчёт о публичной версии.
