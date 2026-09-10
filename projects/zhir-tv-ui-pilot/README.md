# ЖИР ТВ — предметный UI-пилот

Статус: **staging-only**. Production HTML/CSS/JS, `public/`, allowlist, save keys
и media runtime не изменялись.

Figma-файл: [Детский Жир — ЖИР ТВ / предметный UI пилот](https://www.figma.com/design/4fd7H5QBf288UkhDUb7SdJ)

## Что собрано

- направление A — графитовый служебный CRT, принятое за основу;
- направление B — пожелтевший пластик, оставлен как сравнение;
- компонент монитора `ЖИР ТВ / Monitor` — Figma node `3:23`;
- компонент пульта `ЖИР ТВ / Remote` — Figma node `3:14`;
- набор состояний клавиши `ЖИР ТВ / Key` — Figma node `3:13`;
- компонент VHS `ЖИР ТВ / VHS` — Figma node `3:30`;
- desktop-макет — Figma node `5:2`;
- mobile-макет — Figma node `5:30`.

В Figma экран монитора, подписи, канал и состояния управления лежат отдельными
слоями. Кадр Улыбарыча — существующий poster сайта, вставленный в экран с
режимом `FIT`; он не заменяет runtime-видео.

## Локальные материалы

| Файл | Назначение | Состояние |
|---|---|---|
| `assets/tv-a-graphite.png` | выбранный корпус CRT | принятое направление |
| `assets/tv-b-ivory.png` | альтернативное направление | reference only |
| `assets/remote-cutout.png` | очищенный корпус пульта с alpha | загружен в Figma component `3:15` |
| `assets/remote.png` | исходный ImageGen PNG с checkerboard | raw source, не интегрировать напрямую |
| `assets/vhs.png` | VHS с пустой бумажной этикеткой | принято для пилота |
| `assets/broadcast-reference.png` | локальная PNG-копия существующего poster | reference only |
| `prompts.json` | промпты ImageGen для воспроизводимости | сохранён |

## Финальная проверка

После ручного апгрейда Figma до Professional Full MCP-доступ восстановился.
Исправлен mobile node `5:30`: SOURCE получил жёлтый override с читаемой тёмной
подписью. В компонент `ЖИР ТВ / Remote` загружен `remote-cutout.png`; слой
подогнан к portrait-пропорциям `260×390`, checkerboard из raw-источника больше
не используется.

Проверены screenshots компонентов и макетов: desktop `1280×960`, mobile
`390×844`, отдельный монитор и пульт. Production HTML/CSS/JS, `public/`,
allowlist, save keys и media runtime не менялись. Перенос выбранных изображений
в production остаётся отдельным решением.
