# AGENT STATUS

Живой журнал оркестрации. Не канон и не production plan.

**Перед любой работой** прочитать этот файл и выполнить `git status --short`.
**Перед записью в код** занять замок ниже. **Перед остановкой** обновить этот
файл. Не начинать второй write-поток, пока замок занят другим сервисом.

Стоящие правила — `AGENTS.md`. Контракт игры Павла —
`docs/prompts/GROK_BUILD_PAVEL_OBSERVATION_BOOTH_PRODUCTION_PLAN.md`.
Заметка Codex по шелле/нарезке/туру (2026-08-29):
`docs/prompts/CODEX_PAVEL_SHELL_TOUR_NOTE.md`.
Первое сообщение нового чата — `docs/prompts/NEW_CHAT_TEMPLATES.md`.
Этот файл отвечает только на вопрос: *где мы сейчас и кто имеет право писать*.

---

## Снимок

| Поле | Значение |
|---|---|
| Обновлено | 2026-08-30 01:08 CDT |
| Кто писал снимок | Codex — context diet |
| Ветка | `main` |
| HEAD | `14bba88` — `Update app.js` |
| Дерево | грязное; граф кабинки вшит из подтверждённого черновика |
| Активная линия | Досье Павла + кабинка Павла + мост «Солнышко» |
| Текущий этап | Этап 5 + CRT не поверх кабинки |
| Следующий разрешённый gate | commit по просьбе пользователя; затем отдельное разрешение на push / публикацию |
| Пишущий агент | `FREE` |
| Следующий ожидаемый исполнитель | пользователь |
| Commit / push / публикация | запрещены, пока пользователь не попросит отдельно |
| Транспорт между агентами | одна локальная папка `/Users/nateglukhov/analog-horror-site` |

Cursor и Codex работают с **этой папкой**, включая незакоммиченный diff.
GitHub не нужен для синхронизации агентов. **Grok Build не вызывать.**

---

## Замок записи

```text
WRITER: Codex
SCOPE: agent-instruction context diet only
STARTED: 2026-08-30
```

Правила:

1. Одновременно пишет только один сервис: Cursor или Codex.
2. Занять замок — первая правка этого файла в write-сессии. Указать сервис и
   узкий scope.
3. Снять замок (`FREE`) — последняя правка этого файла перед остановкой,
   вместе с обновлённым снимком и записью в журнале.
4. Если замок чужой и свежее нескольких часов — не редактировать те же файлы.
   Сообщить пользователю фактическое состояние.
5. Read-only аудит замок не занимает.

---

## Этапы линии Павла

| Этап | Статус | Где правда |
|---|---|---|
| 0. Read-only аудит / оркестрация | `DONE` | `docs/prompts/CODEX_ORCHESTRATION_ZERO_PILOT_REPORT.md` |
| 1. Content contract + Copy Desk | `DONE` в рабочем дереве, не в HEAD | `content/pavel/observation-booth-content.js`, `docs/PAVEL_OBSERVATION_BOOTH_CONTENT.md`, `GAMES.pavel` в `scripts/lib/copydesk-core.js` |
| 2. Мост «Солнышко» | `DONE` в рабочем дереве, не в HEAD | реклама `locations/solnyshko-park.html`; игра `locations/solnyshko-after-hours.html`; `content/irina/solnyshko-park-content.js`, `js/solnyshko-park.js` |
| 3. Playable MVP кабинки | `IN TREE / QA VERIFIED` | страница, runtime, CSS, test graph; Codex evidence packet закрыт |
| 4. Полный сценарий и медиа | `PARTIAL / STAGE 4A + WAVE 3 + GROK CRT + F14 DELIVERIES QA VERIFIED` | V09–V13 integrated; CRT replacement integrated; dessert/gas-mask F14 clips integrated; paid V14 retained as rejected evidence |
| 5. Release QA | `IN TREE / QA VERIFIED` | полный прогон кабинки + claim кассеты на главной |

ID Павла: **`0274-P`**. На карточке и в найме; квест «Солнышко» только анонсирует
и ведёт на `staff.html?personnel=pavel`, номер не выдаёт.

Литературные реплики Павла: production-сценарий Stage 4. Реплики парка ещё
остаются test copy.

---

## Открытые блокеры

- Служебный ID Павла утверждён как `0274-P` (карточка + найм). Квест парка его
  не выдаёт.
- Production plan в шапке больше не источник статуса; статус только здесь.
- Незакоммиченный diff большой: общий `js/app.js`, `staff.html`, Copy Desk,
  public-build. Второй агент не должен переписывать эти файлы «с нуля».
- Не открывать Grok Build: лимиты исчерпаны; волна 1 уже снята вручную в Pictures.

---

## Запрещено без отдельной фразы пользователя

- commit, push, deploy, публикация;
- выдумывать ID, канон глаз Пса, новый backend;
- откатывать или переформатировать чужой грязный diff;
- очищать весь пользовательский `localStorage`.

Подтверждённые фразы:

```text
ПОДТВЕРЖДАЮ ЭТАП 3 — PAVEL MVP
ПОДТВЕРЖДАЮ CURSOR IMPLEMENTATION — PAVEL MVP
ПОДТВЕРЖДАЮ ЭТАП 4 — FULL SCRIPT AND MEDIA
```

Первая уже была дана ранее (файлы этапа 3 появились). Вторая — допуск на
доработку существующего MVP в Cursor, не на вторую игру. Третья дана
2026-08-29; она открывает этап 4, но не заменяет обязательный PixVerse quote
перед каждым платным generation batch.

---

## Ключи и точки входа (не менять без миграции)

| Что | Значение |
|---|---|
| Звонок Ирины | `tyndex_curator_call_v4` |
| Профиль STAFF | `tyndex_staff_profile_v1` |
| Режим сайта | `tyndex_mode` |
| Парк «Солнышко» | `tyndex_irina_solnyshko_v1` |
| Кабинка Павла | `tyndex_pavel_observation_booth_v1` |
| Copy Desk | `irina`, `lora`, `pavel`, `solnyshko` |
| Страница парка | `locations/solnyshko-park.html` |
| После закрытия | `locations/solnyshko-after-hours.html` |
| Страница кабинки | `locations/pavel-observation-booth.html` |
| Вход в кабинку | `staff.html?personnel=pavel` → «ВОЙТИ В КАБИНКУ ОБОЗРЕНИЯ» |
| Канон Павла | `~/md_lore/pavel.md` (вне репо) |

---

## Как обновлять этот файл

Менять только этот файл как журнал. Не размазывать статус по чатам.

Шаблон записи (новые сверху):

```md
### YYYY-MM-DD — сервис — этап N — DONE | PAUSED | BLOCKED | IN TREE / UNVERIFIED
- scope:
- файлы:
- проверки:
- следующий агент должен:
- не делать:
```

После write-этапа обязательны: `git diff --check`, `node --check` для
изменённого JS, целевой validator/smoke, и для UI — desktop + `390×844`.

---

## Журнал

### 2026-08-30 — Codex — Pavel tour face-regeneration replacements — IN TREE / VERIFIED
- scope: заменены только два runtime MP4: storage из пользовательского `v12.mp4`, bedroom из пользовательского `v6.mp4`.
- files: `assets/guest/locations/pavel/tour-storage.mp4`, `assets/guest/locations/pavel/tour-bedroom.mp4`.
- checks: SHA-256 каждой runtime-копии совпадает с соответствующим Desktop-исходником; `git diff --check` clean.
- next: commit только по просьбе.

### 2026-08-30 — Cursor — staff CRT off during games — IN TREE / QA VERIFIED
- scope: сканлайны, виньетка, `crt-flicker`, rolling scanline и `vhs-noise` выключаются при `pavel-booth-open` / `lora-room-open`. На hiring/STAFF оболочке CRT остаётся.
- files: `css/style.css`.
- checks: `git diff --check`.
- browser: staff + booth — `::before/::after` display none, animation none, noise none; overflow 0; console 0.
- next: commit только по просьбе.

### 2026-08-30 — Cursor — Pavel media filters off — IN TREE / QA VERIFIED
- scope: сняты все CSS-фильтры со still/video кабинки (saturate/grayscale/brightness и per-visual overrides). Кадр идёт как сгенерирован.
- files: `css/pavel-observation-booth.css`.
- checks: `git diff --check`.
- browser: computed `filter: none` desktop + 390×844; overflow 0; console 0.
- next: commit только по просьбе.

### 2026-08-30 — Cursor — Pavel thought bubbles like Red Room — IN TREE / QA VERIFIED
- scope: мыслеблоки кабинки совпадают с Красной комнатой: сиреневый пузырь, ромбовидный хвост, Georgia italic, без таблички «Я».
- files: `css/pavel-observation-booth.css`.
- checks: `git diff --check`.
- browser: desktop + 390×844 на `bedroom-check`; speaker hidden; overflow 0; console 0.
- next: commit только по просьбе.

### 2026-08-30 — Cursor — Pavel stage fill like Red Room — IN TREE / QA VERIFIED
- scope: квадратный `cover` в кабинке снимал бока 16:9. Сцена теперь заполняет `stage-wrap`, как `lora-room__stage` при живом кадре (`inset: 0`, без `min(cqw, cqh)`).
- files: `css/pavel-observation-booth.css`.
- checks: `git diff --check`.
- browser: desktop 1280×900 stage 1280×734 fills wrap, not square; mobile 390×844 stage 390×627 fills wrap; HUD 44×44; overflow 0; console 0.
- next: commit только по просьбе.
- not do: возвращать квадратный кроп; commit/push.

### 2026-08-29 — Cursor — Pavel closed-shift replay — IN TREE / QA VERIFIED
- scope: снята выдуманная кнопка с карточки Павла. После финала кабинка использует те же две кнопки, что закрытая смена Лоры.
- files: `js/pavel-observation-booth.js`, `js/app.js`, `staff.html`, content contract, validator.
- checks: `node --check`; validator 96/96; `git diff --check`.
- browser: desktop replay → intro; leave → `staff.html?personnel=pavel` без сброса сейва; на карточке только «ВОЙТИ»; mobile 390×844 overflow 0; console 0.
- next: commit только по просьбе.
- not do: replay на карточках Ирины/Лоры/Павла; отдельная подпись «НАЧАТЬ ЗАНОВО».

### 2026-08-29 — Cursor — Pavel replay button — IN TREE / QA VERIFIED
- scope: после финала (`seniorGuideExit`) повторный вход не выкидывает на главную; в кабинке и на карточке Павла есть `НАЧАТЬ ЗАНОВО`.
- files: `js/pavel-observation-booth.js`, `js/app.js`, `staff.html`, content contract, validator.
- reset: только `tyndex_pavel_observation_booth_v1`; звук смены в кабинке сохраняется; кассета/Солнышко/профиль не трогаются.
- checks: `node --check`; validator 96/96; `git diff --check`.
- browser: desktop resume финала без redirect, click → `booth-intro`; staff card restart → intro; mobile 390×844 overflow 0; без финала кнопка на карточке скрыта; console 0.
- next: commit только по просьбе.
- not do: commit/push; очищать весь localStorage.

### 2026-08-29 — Codex — final Guide slide exit — IN RUNTIME / QA VERIFIED
- authorization: user explicitly said `СОХРАНИ И ИНТЕГРИРУЙ ФИНАЛ`; accepted manual Grok MP4 preserved unchanged under the Pavel project and prepared as a web runtime copy.
- media: `senior-guide-slide-exit.mp4`, H.264 1024×576, 24 fps, 10.0417s, AAC stereo 48 kHz; attached MJPEG stripped; voluntary audio follows the booth sound toggle.
- fallback: `storage-slide-light.webp` extracted from the previously accepted slide-light delivery; reduced motion and video failure retain a visible exit choice.
- runtime: `ВОЙТИ В ГОРКУ` selects `SLIDE_ESCAPE`; the clip plays once and `video.ended` completes the shift, sets guest mode and opens the main guest page. All other booth clips remain muted.
- checks: node checks; Pavel validator 96/96; Copy Desk smoke; public build 453 / verify 454; `git diff --check`.
- browser: desktop audio-on and muted playback, 1024×576, loop=false, ended redirect and persistence; mobile 390×844 reduced-motion still/exit; overflow 0; console 0.
- next: no commit, push or publication without a separate user request.

### 2026-08-29 — Codex — slide-light KEEP + IMG12 audit — ACCEPTED / CROPPED / NOT IN RUNTIME
- user verdict: `KEEP` for task `421763570300045`; generated 1024×592 master preserved unchanged.
- local post: centered 8px top/bottom crop prepared at `projects/pavel-observation-booth/deliverables/storage-slide-light-1024x576.mp4`; H.264, 1024×576, 24 fps, 5.0417s, silent; targeted QA has no issues.
- runtime unchanged: light clip still waits for explicit integration approval.
- IMG12 audit: V09 control, V11 bathroom and V12 storage boards produced the already-integrated tour MP4s; the tour also includes V10 bedroom and V13 hatch from other locked boards. All five map to `tour-*` nodes and persist one-shot played flags.
- supplied stills: `exec-53f4588e` is spare bedroom held art; `exec-ca7df23f` is rejected wrong bedroom; `exec-cf41e10d` is the empty bathroom plate behind the bathroom board; `exec-de07ae5a` is an alternate stocked-shelf Guide board, superseded by the continuity-safe locked runtime `senior-guide-at-slide.webp`.
- checks: Pavel validator 96/96, `node --check`, exact-crop QA, `git diff --check`.
- next: integrate accepted light clip only after explicit approval; do not replace the Guide still or replay/reset user persistence without direction.

### 2026-08-29 — Codex — storage slide light — GENERATED / QA REVIEWED / AWAITING VERDICT
- authorization: user explicitly confirmed `ПОДТВЕРЖДАЮ СВЕТ В ГОРКЕ`; exactly one queued task submitted, no variants or retries.
- result: task `421763570300045`, success; local preview under project assets.
- billing: 30 credits confirmed by task usage and balance delta; 812 → 782.
- technical QA: H.264, 1024×592, 24 fps, 5.0417s, no audio; only automated issue is C1 `aspect_ratio_mismatch`; free exact-16:9 crop is available after KEEP.
- visual QA: empty storage room and core geometry hold; dark opening becomes amber-lit and ends stable; final light spills more strongly onto the floor and right shelf than requested.
- next: await user KEEP/REJECT; no crop, runtime integration, retry, commit, push, or publication yet.

### 2026-08-29 — Codex — storage slide light — PREFLIGHT READY / NO GENERATION
- scope: один I2V-ролик из exact `storage-slide.webp`; пустая подсобка, слабый грязно-янтарный свет дважды мигает внутри трубы и стабилизируется.
- profile: `pixverse-c1`, 540p, 16:9, 5s, audio OFF, Multi-shot OFF, camera lock-off.
- files: English prompt and `projects/pavel-observation-booth/storage-slide-light-queue.json`.
- preflight: 1 video task; Standard/premium route; balance 812; exact credits before generation unavailable; confirmation required; nothing submitted.
- manual clip: Sun-mask Guide will be produced by the user in Grok Imagine + CREF from the empty storage plate; PixVerse will not generate the character-motion clip.
- next: run this queue once only after a new explicit confirmation; no retry, integration, commit, push, or publication without separate authorization.

### 2026-08-29 — Codex — F14 tray deliveries — IN RUNTIME / QA VERIFIED
- authorization: user said `делай` after KEEP ×2, approving free crop and runtime integration; no paid work or retry.
- media: dessert and gas-mask masters cropped from 1024×592 to exact 1024×576; silent H.264, 24 fps, 5.0417s; start/hold WebP pairs generated.
- runtime: separate `HATCH_DESSERT` and `HATCH_GASMASK` one-shot clips; `HATCH_CLOSED` after take/refuse/wear; reduced motion uses held item still and loads no MP4.
- files: six runtime assets; Pavel content/runtime; Copy Desk smoke guard; public verifier; content, shot-list and first-frame docs; PixVerse QA/project memory.
- checks: runtime QA no issues; node checks; validator 96/96; Copy Desk smoke; public build 451 / verify 452; `git diff --check`.
- browser: desktop gas-mask delivery/end/hold/wear; mobile 390×844 dessert delivery/end/hold/refuse; both 1024×576, muted, loop=false; persistence hold; reduced-motion still-only; overflow 0; console 0.
- cleanup: removed only test key `tyndex_pavel_observation_booth_v1`; source masters and rejected assets preserved.
- next: remaining manual slide light/dark and Sun-mask motion; no commit/push/publication without separate request.

### 2026-08-29 — Codex — F14 tray deliveries — GENERATED / QA REVIEWED / KEEP ×2
- authorization: user explicitly confirmed exactly two F14 videos; two tasks submitted, no variants or retries.
- results: dessert task `421761263244540`; gas-mask task `421761271792334`; both success and downloaded under project assets.
- billing: 30 + 30 = 60 credits confirmed by task usage and balance delta; 872 → 812.
- technical QA: both H.264, 1024×592, 24 fps, 5.0417s, no audio; only automated issue is C1 `aspect_ratio_mismatch`; free exact-16:9 crop remains possible after KEEP.
- visual QA: locked door/camera and delivery action read; each ends on the correct single prop; a human finger briefly appears behind each tray despite the no-hands prompt.
- user verdict: `KEEP KEEP` — both generated masters accepted.
- next: optional free exact-16:9 crop and runtime integration only after separate approval; no retry, commit/push/publication.

### 2026-08-29 — Codex — F14 tray deliveries — PREFLIGHT READY / NO GENERATION
- scope: ровно два I2V-ролика из exact closed-door F14: поднос с одной жёлтой баночкой десерта и поднос с одним противогазом; target images не используются.
- profile: `pixverse-c1`, 540p, 16:9, 5s каждый, audio OFF, Multi-shot OFF, camera lock-off.
- files: два English prompt-файла и `projects/pavel-observation-booth/hatch-deliveries-wave-queue.json`.
- preflight: 2 video tasks; Standard/premium route; balance 872; exact credits до generation недоступны; confirmation required; ничего не запущено.
- next: после нового явного подтверждения пользователя запустить queue один раз, показать оба локальных preview и провести QA.
- not do: retries/variants, target-frame references, integration, commit/push/publication без отдельного разрешения.

### 2026-08-29 — Cursor — Pavel graph sync — IN TREE / QA VERIFIED
- scope: подтверждённый черновик вшит в `observation-booth-content.js`: Ирина/Красная Комната, Иллюзион, три визита к люку, текстовые триггеры, кнопки без «ДАЛЬШЕ».
- files: content, `js/pavel-observation-booth.js` (sound `hatch-knock-3` → door sfx), `scripts/sync-pavel-booth-graph.js`, parse md, re-export draft 96 nodes.
- checks: validator 96/96; smoke-copydesk; `node --check`; `git diff --check`; desktop happy-path intro→гость на главную; mobile 390×844 overflow 0; console 0.
- next: copy polish; отдельный mp3 трёх стуков; commit только по просьбе.
- not do: commit/push; paid footage.


### 2026-08-29 — Cursor — Pavel script MD desk — IN TREE
- scope: черновик стола кабинки: экспорт 75 узлов в md, литературный
  импорт, шаблон сюжетного чата. Правда игры не менялась.
- files: `docs/drafts/pavel-booth-script.md`,
  `scripts/export-pavel-booth-script.js`,
  `scripts/import-pavel-booth-script.js`,
  `scripts/lib/pavel-booth-script-md.js`, шаблон 6 в
  `docs/prompts/NEW_CHAT_TEMPLATES.md`, указатели в AGENTS и content contract.
- checks: `node --check`; export 75; import dry-run 0 литературных правок;
  `git diff --check`.
- next: сюжет править в отдельном чате по шаблону 6; `--apply` только по
  явной просьбе; граф (новые узлы / CUT) — отдельный sync.
- not do: commit; считать md правдой игры.

### 2026-08-29 — Cursor — Stage 5 release QA — IN TREE / QA VERIFIED
- scope: полный happy-path кабинки (тишина, без банок, бутылка, кассета,
  камеры, финал); гостевой глитч; кассета не попадала в досье на главной.
- fix: `claimPavelCassette` на `init()` главной; cache-bust `app.js` на index.
- checks: validator 75/75; Copy Desk; desktop 73 beats → guest index;
  cassette reclaim; loop false; no escape clip; leave lock after Cat exit;
  mobile 390×844 overflow 0; console 0.
- next: ручные ролики; copy polish; commit только по просьбе.
- not do: paid generation; Grok Build.

### 2026-08-29 — Cursor — drain shift rules — IN TREE / QA VERIFIED
- scope: слив отвечает, почему игрок не уходит как Павел; × закрыт после
  принятия смены; Проводница жалеет и выпускает через переложенную горку.
- files: content, runtime leave lock, validator, content contract.
- checks: 75/75; Copy Desk; desktop drain chain + locked ×; mercy line;
  mobile 390×844 overflow 0; console 0.
- next: copy polish; ручные ролики.
- not do: commit; энциклопедия лора сверх этих битов.

### 2026-08-29 — Cursor — beat order (Cat slide → explore → cameras → guest) — IN TREE / QA VERIFIED
- scope: выход Кота через горку сразу после тура; игрок остаётся и исследует
  (слив, руки в окне); камеры только когда Павел на CRT; финал Проводницы
  снова ведёт в горку, свет, глитч, `tyndex_mode=guest`, главная.
- files: content, runtime, validator, Copy Desk smoke, content contract.
- checks: validator 66/66; Copy Desk; desktop tour→slide→laugh, hatch hands,
  camera without crawl clip, guest redirect; mobile 390×844 overflow 0; console 0.
- next: ручные ролики свет/тьма и маска; не commit.
- not do: crawl-escape clip; держать игрока на посту вместо гостевого финала.

### 2026-08-29 — Cursor — slide farewell / player stays — IN TREE / QA VERIFIED
- scope: побег через горку снят. После отключения правого канала — прощание:
  куратор ушёл, свет, тьма, замена принята, Кот свободен, игрок остаётся.
  Проводница оставляет на посту (`booth-remain`), guest-exit через горку нет.
- files: `content/pavel/observation-booth-content.js`, `js/pavel-observation-booth.js`,
  validator, content contract, shot list, first-frame matrix.
- media: `storage-pavel-escape.mp4` больше не играет; still `storage-slide.webp`.
  Маска Солнца и противогаз ждут ручных роликов.
- checks: `node --check`; validator 65/65; Copy Desk smoke; `git diff --check`;
  browser desktop farewell + senior stay; mobile 390×844 overflow 0; loop false;
  mode остаётся staff; console 0.
- next: пользователь полирует реплики; отдельно приносит клипы свет/тьма, маску, противогаз.
- not do: commit/push/publication; paid generation; Grok Build.

### 2026-08-29 — Codex — Manual Grok CRT crop + integration — DONE / QA VERIFIED
- authorization: user explicitly approved the supplied Grok CRT video for crop and runtime integration; no paid generation or retry occurred.
- source protection: Desktop source copied unchanged to `projects/pavel-observation-booth/assets/videos/manual-grok-crt/`; SHA-256 source/master match `b2d581e708d42cd55ac02dbdad6bc52d0f450d1b3c5670f75c0f321f8791cfca`.
- media: `control-pavel-right.mp4` = 1024×576 exact 16:9, H.264, 24 fps, 6.0417 s, no audio; start/hold/disabled WebP = 1024×576. Source AAC was stripped.
- runtime: `control-camera` uses `CONTROL_PAVEL_RIGHT`; refusal updates HTML without restarting the running clip; accept moves to `hatch-escape` with static `CONTROL_RIGHT_DISABLED`; `hatch-escape-crawl` then starts existing `STORAGE_ESCAPE`.
- files: `content/pavel/observation-booth-content.js`, `js/pavel-observation-booth.js`, `scripts/verify-public-build.js`, four runtime assets, three production docs, PixVerse project master/memory/QA.
- checks: JS syntax; validator 60/60; Copy Desk smoke; public build 447 files / verify 448; `git diff --check`; exact media metadata; SHA-256; PixVerse local QA no issues.
- browser: desktop live video 1024×576, muted/loop=false; ended hold; mid-play refusal advanced currentTime without restart; accept black CRT; next click storage escape; saved disabled state survives reload; mobile 390×844 overflow 0; reduced motion loads no MP4; 0 console warnings/errors.
- archive protection: `/Users/nateglukhov/.codex/generated_images` now contains 160 files; nothing was removed, moved, or renamed.
- next: user checks the scene and polishes dialogue in Copy Desk; commit/push/publication remain separate gates.
- not do: new paid media, retry, commit, push or publication without separate approval.

### 2026-08-29 — Codex — V14 right CRT footage — GENERATED / QA REJECT
- authorization: user explicitly confirmed exactly one V14 C1 video; one task was submitted, no variants or retries.
- result: task `421721729979719`, success, local MP4 under `projects/pavel-observation-booth/assets/videos/421721729979719/`; 8.0417 s, H.264, 1024×592, 24 fps, no audio.
- billing: 48 credits confirmed by task-matched usage and balance delta; balance 860 → 812.
- visual QA: the gesture reads, but the second half violates the locked shot with a push-in from the booth into the right CRT; the worn hollow-eyed Cat mask drifts into a cute glossy-eyed character. Production status `REJECT`.
- technical QA: only `aspect_ratio_mismatch`; same 1024×592 C1 behavior as earlier tour clips. No crop performed because visual content is rejected.
- evidence: local MP4, four timeline frames, target QA JSON, latest-run QA, manifest, rejection and repair decision in project memory; handoff stage `preview`.
- recommended next: animate only the full-frame remote CCTV source, then locally perspective-composite it into the accepted static booth plate; prepare V15 only after user asks for a fresh preflight.
- not do: paid retry/variant, crop/integration, commit/push/publication without separate gates.

### 2026-08-29 — Codex — V14 right CRT footage — PREFLIGHT READY / NO GENERATION
- approval applied: `ПОДТВЕРЖДАЮ CRT PLATES V1`; обе CRT-пластины переведены в KEEP, это не было разрешением на paid video.
- task: ровно один `V14 Pavel on right CRT, 8s`; `pixverse-c1`, `540p`, `16:9`, image-to-video, `audio OFF`, `Multi-shot OFF`.
- motion: кабинка и левый CRT lock-off; движение только внутри правого CRT — Павел в голове Кота делает полшага, указывает на удалённую камеру и держит взгляд.
- files: `projects/pavel-observation-booth/prompts/v14-right-crt-request.txt`, `projects/pavel-observation-booth/v14-right-crt-queue.json`; first frame `projects/pavel-observation-booth/assets/images/control-pavel-on-right-v1.png`.
- quote: signed in, Standard/premium route, balance 860 credits, exact pre-generation cost unavailable, confirmation required; nothing started.
- checks: queue inspected as one task; no V14 manifest entry; `git diff --check`; ImageGen archive remains 159 files; PixVerse handoff stage `v14-preflight` recorded.
- next: wait for a new explicit approval covering exactly this one V14 video; then `queue run --confirmed`, preview, QA and billing ledger.
- not do: paid retries/variants, runtime integration, commit/push/publication without separate gates.

### 2026-08-29 — Codex — Stage 4B CRT ImageGen plates — DONE / AWAITING KEEP
- scope: built-in ImageGen создал ровно две согласованные 16:9 пластины; PixVerse, runtime и код игры не тронуты.
- `CONTROL_PAVEL_ON_RIGHT`: Павел в полной голове Кота встроен только в правый CRT; камера с красным индикатором, пустая кабинка и рабочий левый канал сохранены.
- `CONTROL_RIGHT_DISABLED`: тот же ракурс; правый CRT погашен, левый канал остаётся рабочим.
- project copies: `projects/pavel-observation-booth/assets/images/control-pavel-on-right-v1.png` и `control-right-disabled-v1.png`, обе 1672×941 PNG; prompts сохранены в `projects/pavel-observation-booth/prompts/v14-control-*-imagegen.txt`.
- source protection: исходный `exec-881266b1-ef09-40d0-8157-1124f9755e70.png` на месте; `/Users/nateglukhov/.codex/generated_images` теперь 159 файлов, ничего не удалялось и не перемещалось.
- проверки: визуальная инспекция обеих пластин; размеры; SHA-256; `git diff --check`.
- следующий: пользователь даёт KEEP/REJECT пластинам; только после KEEP — V14 prompt, PixVerse preflight/quote и отдельное подтверждение.
- не делать: PixVerse, runtime-интеграцию, commit/push/publication без следующего gate.

### 2026-08-29 — Codex — Stage 4B right CRT dramaturgy — DONE / PLANNING LOCK
- scope: зафиксирована принятая сцена после кассеты: Павел физически ушёл, появляется на правом CRT в полной голове Кота и просит отключить снимающую его камеру; игрок осознанно помогает побегу.
- plates: `CONTROL_PAVEL_ON_RIGHT` и pixel-matched `CONTROL_RIGHT_DISABLED`; основа — пустой двухмониторный пост, удалённый сигнал встроен только в правый CRT.
- source: `/Users/nateglukhov/.codex/generated_images/01a04bf3-2e7d-7e61-8fe7-380bf27b5200/exec-881266b1-ef09-40d0-8157-1124f9755e70.png`; исходник существует, архив остаётся 157 файлов, ничего не перемещалось и не удалялось.
- файлы: `docs/PAVEL_OBSERVATION_BOOTH_CONTENT.md`, `docs/PAVEL_OBSERVATION_BOOTH_FIRST_FRAME_MATRIX.md`, `docs/PAVEL_OBSERVATION_BOOTH_SHOT_LIST.md`.
- проверки: `git diff --check`; наличие exact source path; targeted doc search.
- следующий: по отдельной просьбе создать/выбрать две ImageGen-пластины; после KEEP подготовить V14 prompt и новый PixVerse preflight/quote.
- не делать: ImageGen, PixVerse, runtime-интеграцию, commit/push/publication без следующего gate.

### 2026-08-29 — Codex — Wave 3 crop + runtime integration — DONE / QA VERIFIED
- scope: по отдельному одобрению созданы exact 16:9 runtime derivatives V09–V13 и подключены только к узлам тура; paid generation/retries не запускались.
- media: `assets/guest/locations/pavel/tour-{control,bedroom,bathroom,storage,hatch}.mp4` и соответствующие `-start.webp` / `-hold.webp`; пять MP4 = H.264, 1024×576, 24 fps, 8/10/7/8/5 секунд, без audio stream.
- crop: V09/V11/V12/V13 — 8 px сверху + 8 px снизу; V10 remux без video re-encode. Оригиналы под `projects/pavel-observation-booth/assets/videos/<task-id>/` не изменялись.
- runtime: `NODE_CLIPS` связывает V09–V13 с `tour-control`, bedroom pair, bathroom, storage/cans/home trio и `tour-hatch`; shared clips не перезапускаются между соседними репликами; `video.ended` ставит `clipTour*` flag и hold still; reduced motion не загружает MP4.
- код/доки: `js/pavel-observation-booth.js`, `scripts/verify-public-build.js`, `docs/PAVEL_OBSERVATION_BOOTH_SHOT_LIST.md`; PixVerse project memory/QA/final handoff обновлены.
- проверки: `node --check`; validator 60/60; Copy Desk smoke; public build 443 files / verify 444; `git diff --check`; PixVerse QA inspect 5/5 no issues with timeline samples; desktop full tour + cans; mobile 390×844 direct tour; reduced motion still-only; loop false; muted true; early future drain/hatch clips not played; overflow 0; console 0.
- source protection: `/Users/nateglukhov/.codex/generated_images` остаётся 157 файлов; ничего не перемещалось, не переименовывалось и не удалялось.
- следующий: пользователь проверяет тур и делает copy polish в админке; следующий paid footage batch — только новый preflight/quote/approval.
- не делать: commit/push/publication или новый paid batch без отдельной просьбы.

### 2026-08-29 — Codex — Wave 3 tour footage — DONE / QA REVIEWED
- scope: после явного подтверждения запущены ровно V09–V13; `pixverse-c1`, `540p`, `audio OFF`, `Multi-shot OFF`, 8/10/7/8/5 секунд; retries не запускались.
- результат: 5/5 success, task ids `421717143618293`, `421717150187541`, `421717161428130`, `421717277685221`, `421717327582197`; локальные MP4 сохранены под `projects/pavel-observation-booth/assets/videos/`.
- billing: 48 + 60 + 42 + 48 + 30 = 228 credits; balance 1088 → 860; расходы подтверждены task-matched usage.
- QA: все длительности в допуске, все пять без audio stream, visual timeline review = KEEP; V10 exact 1024×576, V09/V11/V12/V13 = 1024×592 и требуют бесплатного локального crop до exact 16:9 перед интеграцией.
- source protection: `/Users/nateglukhov/.codex/generated_images` по-прежнему 157 файлов; ничего не перемещалось, не переименовывалось и не удалялось.
- проверки: PixVerse latest-run QA/ledger/render handoff; ручные 5-frame contact sheets; `git diff --check`.
- следующий: пользователь просматривает пять роликов; отдельно разрешает crop/integration или просит новый quote. Старые M01/M03/M09 остаются rejected.
- не делать: paid retries/variants, runtime integration, commit/push/publication без отдельной просьбы.

### 2026-08-29 — Codex — Wave 3 tour footage — PREFLIGHT READY / NO GENERATION
- scope: пять независимых I2V-шотов V09–V13; `pixverse-c1`, `540p`, `16:9`, `audio OFF`, `Multi-shot OFF`, 8/10/7/8/5 секунд.
- файлы: `docs/PAVEL_OBSERVATION_BOOTH_SHOT_LIST.md`; пять English prompt-файлов; `projects/pavel-observation-booth/tour-wave-3-queue.json`; project memory/handoff.
- preflight: 5 video tasks; signed in; Standard/premium route; balance 1088; confirmation required; exact credits до generation недоступны; ничего не запущено.
- source protection: first frames читаются по абсолютным путям; `/Users/nateglukhov/.codex/generated_images` не изменялась, 157 файлов сохранены.
- следующий: пользователь отдельно подтверждает именно очередь V09–V13; затем `queue run --confirmed`, previews, QA и ledger.
- не делать: retries/variants, интеграция runtime, commit/push/publication без отдельных просьб.

### 2026-08-29 — Codex — Stage 4A tour — IN TREE / QA VERIFIED
- scope: обязательный тур `пост → спальня → санузел → склад → люк → пост` добавлен перед `control-laugh`; опциональная одноразовая ветка банок; видимая DEV-заглушка кассеты заменена production metadata.
- файлы: `content/pavel/observation-booth-content.js`, `js/pavel-observation-booth.js`, `js/app.js`, content contract, validator, public-build verifier.
- проверки: `node --check`; validator 60/60; Copy Desk smoke; public build/verify; `git diff --check`; browser desktop 1280×900 полный тур + банки; mobile 390×844 прямой тур; early drain/hatch video не запускается; overflow 0; console 0.
- generated images: `/Users/nateglukhov/.codex/generated_images` только прочитан; 157 файлов в 25 папках, ничего не перемещалось/не переименовывалось/не удалялось.
- следующий: 10с shot-лист тура или литературный полиш — только по отдельной просьбе; не делать оба gate автоматически.
- не делать: PixVerse/генерация/копирование source plates, commit/push/publication без просьбы.

### 2026-08-29 — Cursor — Codex note — IN TREE
- scope: handoff для Codex: шелл, 51 узел, тур утверждён не в графе, IMG12, запреты.
- файл: `docs/prompts/CODEX_PAVEL_SHELL_TOUR_NOTE.md`; указатель в шапке этого статуса.
- не делать: считать заметку разрешением писать узлы/shot-лист.

### 2026-08-29 — Cursor — tour layer — APPROVED / NOT IN GRAPH
- scope: тур до линии сигналов; ~10с lock-off; редкий узел родителей у банок; слив опровергает Павла. Код и промпты не писались.
- файлы: `docs/PAVEL_OBSERVATION_BOOTH_CONTENT.md` § «Тур»; этот журнал.
- не делать: shot-лист/PixVerse; вшивать узлы без новой просьбы; открывать горку на туре; читать `pavel.md` вслух.

### 2026-08-29 — Cursor — booth shell + short beats — IN TREE / QA VERIFIED
- scope: кабинку перевели на шелл красной комнаты (fullscreen, квадратный cover, HUD 44×44) и нарезку узлов в ритме Ирины/Лоры; ключ `tyndex_pavel_observation_booth_v1` не менялся.
- файлы: `locations/pavel-observation-booth.html`, `css/pavel-observation-booth.css`, `js/pavel-observation-booth.js`, `content/pavel/observation-booth-content.js`, validator, Copy Desk smoke, `js/app.js` (класс open), content contract.
- проверки: `node --check`; validator 51/51; smoke-copydesk; `git diff --check`; browser desktop 1280×900 square 725; mobile 390×844 square 390, HUD 44×44, overflow 0, console 0; мысль `Я` без таблички; `ЗАПИСКА` отдельным битом.
- не делать: commit без просьбы; менять save key; shot-лист без просьбы.

### 2026-08-29 — Cursor — V08 hatch-tray — IN TREE / QA VERIFIED
- scope: `PixVerse_…Fixed_CCT (1) copy.mp4` → `hatch-tray.mp4`; one-shot, hold на открытом люке с тарелкой и запиской.
- файлы: mp4 + start/hold webp; `HATCH_BASE` clip; validator; public verify.
- проверки: validator 27/27; public build; browser играет `hatch-tray.mp4`, `loop=false`; ended → hold; mobile reload без повтора; overflow 0; console 0.
- не делать: commit без просьбы; хвост в оконце.


### 2026-08-29 — Cursor — V04–V07 mp4 — IN TREE / QA VERIFIED
- scope: 4 KEEP из `tmp/` вшиты; V08 люк в tmp не было. Пустой пост только на hold/last-check, не на intro.
- файлы: `drain-vague`, `drain-beckon`, `drain-cough`, `control-empty` mp4+webp; runtime NODE_CLIPS; validator; public verify.
- проверки: validator 27/27; public build; browser: vague играет; beckon/cough ended→hold; intro без empty clip; hold играет `control-empty.mp4`; mobile reload без повтора; overflow 0; console 0.
- следующий: V08 по shot-листу, если нужен люк.
- не делать: commit без просьбы; Павел лицом у CRT.


### 2026-08-29 — Cursor — shot list V04–V08 — READY FOR MANUAL PIXVERSE
- scope: пять шотов текущего графа: vague / beckon / cough / пустой пост / люк. API не вызывался.
- файл: `docs/PAVEL_OBSERVATION_BOOTH_SHOT_LIST.md`
- следующий: пользователь KEEP в `tmp/`, затем интеграция.
- не делать: Павел лицом в камеру; retry M01/M03/M09; тур/противогаз/порция; commit без просьбы.

### 2026-08-29 — Cursor — V01–V03 mp4 — IN TREE / QA VERIFIED
- scope: KEEP из `tmp/` вшиты как one-shot; `loop=false`; `video.ended` → hold still; повтор запрещён флагом.
- файлы: `nightstand-cassette.mp4` + start webp; `storage-pavel-escape.mp4`; `drain-hungry.mp4`; runtime/HTML/CSS; validator; public verify; shot-лист.
- проверки: `node --check`; validator 27/27; Copy Desk smoke; public build/verify; `git diff --check`; browser desktop кассета играет → hold `nightstand-cassette.webp`; слив/побег hold after ended; reload не повторяет; mobile `390×844` overflow 0; console 0.
- следующий: волна 2 (пост/дверь/тур) только по просьбе.
- не делать: PixVerse из Cursor; commit без просьбы; очищать весь `localStorage`.

### 2026-08-29 — Cursor — shot list V01–V03 — READY FOR MANUAL PIXVERSE
- scope: путь, 5/6/4 с, English prompts; кассета, горка, голодный слив. API не вызывался.
- файл: `docs/PAVEL_OBSERVATION_BOOTH_SHOT_LIST.md`
- следующий: пользователь KEEP трёх роликов, затем интеграция mp4.
- не делать: волна 2 (пост/дверь/тур); retry M01–M09; commit без просьбы.

### 2026-08-29 — Cursor — drain hungry still — IN TREE / QA VERIFIED
- scope: POV с канистрой больше не планируется; `drain-pour` держит `drain-hungry.webp`; «обожаю хлорку» + правда про Кота в transcript. Кадр не для vague/beckon.
- проверки: validator 27/27; smoke; public verify; browser still 1024, console без warning в этом заходе.
- не делать: повторять POV канистры; commit без просьбы.

### 2026-08-29 — Cursor — slide escape still — IN TREE / QA VERIFIED
- scope: `hatch-escape` больше не хвост в двери; комната склад, still `storage-pavel-escape.webp`.
- проверки: validator 27/27; smoke; public verify; browser still 1024×577, хвоста/окна в тексте нет, console 0.
- не делать: PixVerse из Cursor; commit без просьбы.

### 2026-08-29 — Cursor — supplies + drain bottle + nightstand — IN TREE / QA VERIFIED
- scope: `ПРОВЕРИТЬ ПРИПАСЫ`; fetch бутылки с черепом и «вкусно»; кассета в ящике тумбы. hideIf на одноразовые кнопки.
- файлы: `content/pavel/observation-booth-content.js`, `js/pavel-observation-booth.js`, validator, verify-public-build, 5 WebP в `assets/guest/locations/pavel/`, content contract.
- проверки: validator 27/27; Copy Desk smoke; public build/verify; `node --check`; `git diff --check`; browser: спальня still 1672×941; припасы/бутылка 1024×576; тумбочка; console 0.
- не делать: PixVerse из Cursor; commit без просьбы.

### 2026-08-29 — Cursor — drain bottle skull KEEP / provisions gag
- scope: череп на белой бутылке остаётся fetch-предметом слива (абсурд «вкусно»); отдельно `ПРОВЕРИТЬ ПРИПАСЫ` и мысль про хлопья/корм. Код узлов не писался.
- файлы: пути в `docs/PAVEL_OBSERVATION_BOOTH_FIRST_FRAME_MATRIX.md` §7 и §10.
- не делать: состав/инструкцию в тексте; путать припасы с fetch слива; commit.

### 2026-08-29 — Cursor — first-frame list CLOSED / MANUAL PIPELINE
- scope: у каждого слота есть upload-файл; Cursor не ходит в PixVerse; канистра = ручной edit пустой подсобки `exec-912247d0`.
- следующий агент должен: ждать KEEP сцен; shot-лист (путь, хронометраж, промпт) писать только по отдельной просьбе; затем интеграция mp4 и первый прогон.
- не делать: PixVerse MCP/плагин, quote, копирование boards, commit без просьбы.

### 2026-08-29 — Cursor — first-frame matrix — IN TREE / NO GENERATION
- scope: производственная основа сменена с отклонённого media map на абсолютные first frames; Imagine JPEG не копировались в `assets/`; PixVerse не запускался.
- файлы: `docs/PAVEL_OBSERVATION_BOOTH_FIRST_FRAME_MATRIX.md`; указатели в `docs/PAVEL_OBSERVATION_BOOTH_CONTENT.md` (тумбочка вместо наволочки; matrix вместо старой карты).
- locks: широкая спальня `exec-cb783abf`; тур спальни point→sit; кассета first = закрытый ящик; runtime stills только горка/Проводница.
- следующий агент должен: закрыть список `MISSING` в §8 matrix; KEEP/REJECT по `BOARD CANDIDATE`; не quote до этого.
- не делать: копировать boards в public assets; retry `M01/M03/M09`; commit/push/publication без просьбы.

### 2026-08-29 — Codex — PixVerse pilot M01 + M03 + M09 — GENERATED / 0 KEEP + 3 REJECT
- scope: по точной фразе подтверждения запущена только утверждённая очередь из трёх задач; retries/variants, main batch, audio и runtime integration не запускались.
- tasks: M01 `421669023608410`, M03 `421669025076447`, M09 `421669036274919`; queue `3/3 ready`, failures 0, unresolved 0; локальные MP4 сохранены под `projects/pavel-observation-booth/assets/videos/`.
- invoice: M01 48 + M03 42 + M09 30 = `120 credits`; баланс `1568 → 1448`, per-task usage совпадает с observed delta.
- technical QA: все H.264, 1024×576, 24 fps, без аудио; длительности 8.042 / 7.042 / 5.042s.
- creative QA: M01 REJECT — смена плана/движение камеры до крупного лица; M03 REJECT — несколько пальцев и слишком полный показ лица; M09 REJECT — tail-only сохранён, но камера приближается к окну.
- файлы/учёт: обновлён `docs/PAVEL_OBSERVATION_BOOTH_MEDIA_MAP.md`; PixVerse manifest/ledger и generated previews сохранены внутри project workspace.
- следующий агент должен: остановиться на просмотре с пользователем; для любого retry сначала скорректировать prompt, затем выполнить новый live quote и получить отдельное подтверждение.
- не делать: копировать rejected MP4 в public assets; интегрировать; запускать retry/main batch/audio; commit/push/publication без новой просьбы.

### 2026-08-29 — Codex — PixVerse pilot preflight — QUOTED / WAITING FOR APPROVAL
- scope: созданы три submit-ready English prompts и `projects/pavel-observation-booth/pilot-queue.json`; выполнены live preflight и JSON quote, `queue run` не вызывался.
- quote: authenticated `Standard`, effective `premium`, entitlement compatible, issues 0, balance snapshot 1568 credits; 3 video tasks / 20s / `pixverse-c1` / `540p` / `16:9` / audio off.
- cost boundary: PixVerse вернул `pre_generation_credits: not_available` для всех трёх задач; точный charge можно зафиксировать только после рендера по account usage.
- operational note: installed `scripts/pvx` не имеет executable bit; wrapper корректно вызывался через `/bin/bash`, без изменения plugin cache.
- следующий агент должен: ждать новое явное подтверждение и затем запустить ровно эту queue с `--confirmed`; после трёх previews остановиться на визуальный QA.
- не делать: добавлять retries/variants, main batch, ElevenLabs, integration, commit/push/publication без новой просьбы.

### 2026-08-29 — Codex — production media map — READY FOR QUOTE / NO SPEND
- scope: составлена полная node-to-media карта 23 узлов, visual/character/creature locks, аудио-reuse, reject conditions, порядок integration и два quote batches.
- файлы: новый `docs/PAVEL_OBSERVATION_BOOTH_MEDIA_MAP.md`; ссылка из `docs/PAVEL_OBSERVATION_BOOTH_CONTENT.md`; только этот статус-журнал.
- queue envelope: 10 независимых C1-шотов / 64s unique motion; pilot `M01 + M03 + M09` = 3 items / 20s; main = 7 items / 44s; `audio OFF`, `Multi-shot OFF`, `540p`.
- reuse: финальные `storage-slide.webp` и `senior-guide-at-slide.webp` остаются locked stills; новая генерация Проводницы не нужна.
- аудит: визуально сверены 5 reference/still assets; технически сверены 9 текущих/candidate SFX; `git diff --check`.
- следующий агент должен: не писать generation prompts до просьбы; перед расходом выполнить live preflight/quote и показать его пользователю.
- не делать: paid queue, generation, runtime integration, commit/push/publication без отдельной просьбы.

### 2026-08-29 — Codex — script polish — IN TREE / QA VERIFIED
- scope: принятый TOP 5 литературный полиш без новых узлов; голос слива сделан бытовым, убраны авторские пояснения, склад укорочен, длинные action не дублируются в `КАДР`.
- interaction: первый `ОСТАВИТЬ ОБА КАНАЛА` сохраняет `cameraRefused` и даёт живую реакцию Павла в том же узле; mobile resume возвращает viewport к кабинке.
- файлы: `content/pavel/observation-booth-content.js`, `js/pavel-observation-booth.js`, validator, Copy Desk smoke, content contract.
- проверки: `node --check`; validator `23/23`; Copy Desk smoke; public build/verify; `git diff --check`; Playwright desktop + `390×844`; refusal + reload persistence; refusal → camera off → escape; mobile resume кнопка `616–660 / 844`; overflow 0; console 0.
- следующий агент должен: считать этот текст production copy и по просьбе составить media map без повторного переписывания узлов.
- не делать: билет/маску на кресле; новый граф; paid PixVerse без quote; commit/push/publication без отдельной просьбы.

### 2026-08-29 — Codex → Cursor Grok 4.6 High — script polish — QUEUED / READ-ONLY
- scope: подготовлен handoff на полное прохождение игры без видео, численные engagement/rhythm/suspense metrics, аудит AI-like copy, юмористический полиш голоса из слива и максимум три optional story moves.
- handoff: `docs/prompts/CURSOR_PAVEL_SCRIPT_POLISH_READONLY.md`.
- граница: Cursor ничего не редактирует, не занимает write-замок, не создаёт media map и не запускает генерацию; результат только в чате.
- следующий шаг: пользователь отбирает рекомендации; Codex применяет только явно выбранные пункты и после этого строит media map.

### 2026-08-29 — Codex — PixVerse C1 production profile — LOCKED / NO SPEND
- scope: зафиксированы пользовательские ограничения будущей очереди: `C1`, звук `OFF`, `Multi-shot OFF`, `540p`, кастомная длительность каждого непрерывного шота `1–15s`.
- файлы: `docs/PAVEL_OBSERVATION_BOOTH_CONTENT.md`, `docs/AGENT_STATUS.md`.
- следующий агент должен: строить media map и quote только с этим профилем; один generation item равен одному непрерывному шоту.
- не делать: использовать V6/Seedance, native audio или автоматический Multi-shot; запускать paid queue без отдельного quote и подтверждения.

### 2026-08-29 — Codex — этап 4, production-сценарий — IN TREE / QA VERIFIED
- scope: все видимые `[DEV TEST]`-заглушки кабинки заменены полным сценарием; граф расширен до утверждённой сцены слива, сохранены опциональная кассета, побег Павла и финал Старшего Проводника.
- драматургия: Павел выдаёт подмену за короткую услугу; сигналы уводят POV от поста; `DRAIN_VAGUE → DRAIN_BECKON → DRAIN_COUGH → DRAIN_VAGUE`, `Я ЛЫСЫЙ.` / `Везёт.`; правый канал у отдельного «Иллюзиона» создаёт слепую зону; Администрация не признаёт побег разрешённым.
- файлы: `content/pavel/observation-booth-content.js`, одна видимая системная строка в `js/pavel-observation-booth.js`, locked speakers/smoke Copy Desk, `docs/PAVEL_OBSERVATION_BOOTH_CONTENT.md`.
- проверки: `node --check`; validator 23/23 reachable; Copy Desk smoke; public build/verify; `git diff --check`; Playwright desktop со звуком/кассетой и `390×844` без звука/без кассеты; resume на `drain-cough`; overflow 0; guest redirect и persistence подтверждены; console 0.
- следующий агент должен: составить media map по production-графу, не переписывая уже утверждённые реплики; перед любой платной PixVerse-очередью показать quote.
- не делать: прямо называть существо в сливе Волосяным комком; превращать «Иллюзион» в часть кабинки; запускать PixVerse, commit/push/publication без отдельной просьбы.

### 2026-08-29 — Codex — этап 4, финал Старшего Проводника — IN TREE / QA VERIFIED
- scope: после удержания игрока новым оператором добавлены последний сигнал, пустой склад с горкой, появление Женщины в маске Солнца, утверждённый диалог и выход через горку в guest-режим; сохранение Павла и кассета остаются.
- файлы: `content/pavel/observation-booth-content.js`, `js/pavel-observation-booth.js`, `css/pavel-observation-booth.css`, два WebP в `assets/guest/locations/pavel/`, документация и public-build allowlist.
- проверки: `node --check`; validator Павла 19/19 reachable; Copy Desk smoke; public build/verify; `git diff --check`; Playwright desktop + `390×844`, изображения 1672×941 загружены, overflow 0, guest redirect и persistence подтверждены, console 0.
- следующий агент должен: считать Женщину-Солнце финальным Старшим Проводником у горки, а не участницей кассеты или обязательного нового видео; до платной генерации показать PixVerse quote.
- не делать: менять утверждённые реплики/порядок сцены; удалять кассету/сохранение при выходе; запускать PixVerse без quote; commit/push/publication без отдельной просьбы.

### 2026-08-29 — Codex — этап 4 gate — AUTHORIZED / PRODUCTION PROFILE LOCKED
- scope: пользователь дал `ПОДТВЕРЖДАЮ ЭТАП 4 — FULL SCRIPT AND MEDIA`.
- текущая граница: новый футаж только PixVerse `C1`, `audio OFF`, `Multi-shot OFF`, `540p`, кастомные шоты `1–15s`; платная генерация не начата.
- следующий шаг: финал Женщины-Солнца согласован отдельно; кассета остаётся линией Ирины и Павла с авторством Лоры. Для очереди видео показать отдельный PixVerse quote и ждать подтверждения запуска.
- не делать: переключать очередь на V6/Seedance, включать native audio или Multi-shot; запускать paid queue без quote; commit/push/publication без отдельной просьбы.

### 2026-08-29 — Codex — канонический кадр аукциона — DONE / QA VERIFIED
- scope: заменён только `pavel-auction-porcelain-mask.webp` на предоставленный кадр из ролика; alt/caption привязаны к `EP-031`.
- файлы: один WebP, `documents/dossier-pavel.html`, узкий `protocol-footage--widescreen` в `css/style.css`.
- проверки: визуальная сверка WebP; public build/verify; Playwright desktop + `390×844`; кадр сохраняет `16:9`, overflow 0, console 0; `git diff --check`.
- не делать: возвращать сгенерированный аукционный кадр без отдельной просьбы; commit/push/publication без отдельной просьбы.

### 2026-08-29 — Codex — досье Павла — DONE / QA VERIFIED
- scope: полное красное досье `0274-P`, четвёртая карточка архива, ссылка из STAFF, 9 ImageGen-кадров по character sheets.
- файлы: `documents/dossier-pavel.html`, `assets/staff/documents/pavel-*.webp`, `archive.html`, одна ссылка в `js/app.js`, allowlist в `scripts/build-public.js`.
- проверки: все 9 кадров визуально просмотрены; `node --check`; public build/verify; Playwright desktop + `390×844`; архив → досье и STAFF → полное досье; 9/9 изображений загружены; overflow 0; console 0; `git diff --check`.
- канон: истинность Сахарного Агнца, судьба родителей и разрешённость побегов оставлены открытыми; аукцион не сексуализирован.
- не делать: commit/push/publication без отдельной просьбы; не считать досье единственным источником Павла вместо `~/md_lore/pavel.md`.

### 2026-08-28 — Codex — этап 3 + мост «Солнышко» — DONE
- scope: реальный browser QA кабинки на desktop и `390×844`; регрессия рекламы, gate, enter→hub, carousel return, volunteer, Ирина → STAFF; sound off, visible text, reduced motion, resume и console.
- файлы: `css/solnyshko-park.css` — surgical-контраст after-hours; `docs/AGENT_STATUS.md` — evidence snapshot и журнал. Остальной грязный diff не тронут.
- проверки: кабинка intro → 5 комнат → cassette take/leave → blind camera → hold; выход до hold работает, после hold закрыт; парк refuse/date `12.08.26` с одноразовым enter, volunteer без birthday, popup без `0274-P`, STAFF-карточка копирует `0274-P`; desktop/mobile console `0 errors, 0 warnings`; validators и `node --check` OK; `git diff --check` OK.
- следующий агент должен: ждать отдельную фразу этапа 4; сохранять текущий MVP и wave 1 без новых клипов.
- не делать: Grok Build, ElevenLabs, этап 4, wave 2, commit/push/deploy и очистку всего `localStorage`.

### 2026-08-28 — Cursor — Солнышко клипы вшиты + QA кабинки — DONE
- scope: 7 mp4 в `assets/guest/locations/solnyshko/`; after-hours `src`; enter→hub; QA кабинки.
- файлы: content, `js/solnyshko-park.js`, validator, verify-public-build, bridge.
- проверки: validate solnyshko/pavel; smoke-copydesk; public verify; browser: closed/refuse/enter/wide/carousel/offer; кабинка intro→спальня @390×844, без console error.
- не делать: commit; волна 2; этап 4.

### 2026-08-28 — Cursor — Grok Build снят — DONE
- scope: оркестрация без Grok; лимиты исчерпаны. Футаж волны 1 остаётся в Pictures.
- файлы: `AGENTS.md`, `docs/AGENT_STATUS.md`, `docs/prompts/NEW_CHAT_TEMPLATES.md`, шапки футажного и павловского планов.
- следующий: Cursor/Codex доделывают игру; новый клип — только ручная генерация пользователя.
- не делать: чаты Grok Build; волна 2 Imagine; commit без просьбы.

### 2026-08-28 — Cursor — Солнышко волна 1 закрыта — DONE
- scope: KEEP `irina-cotton-offer`; лог 7/7; не копировать в git.
- файлы: `docs/prompts/GROK_BUILD_SOLNYSHKO_NIGHT_FOOTAGE.md` §9–10.
- проверки: 6×1280×720 + offer 854×480 в Pictures.
- следующий: по просьбе — copy в `assets/guest/locations/solnyshko/` и `media.src`.
- не делать: волна 2; commit; пересъём 720p; этап 4.

### 2026-08-28 — Cursor — Солнышко KEEP irina-wait + 480p — DONE
- scope: wait take 2 KEEP; новые клипы 854×480, не 720. Бриф offer.
- файлы: `docs/prompts/GROK_BUILD_SOLNYSHKO_NIGHT_FOOTAGE.md` §0, §5, §9–10.
- не делать: пересъём KEEP 720p; 720 «на всякий»; commit.

### 2026-08-28 — Cursor — Солнышко KEEP carousel-empty-10s — DONE
- scope: KEEP карусели; бриф `irina-cotton-wait`.
- файлы: `docs/prompts/GROK_BUILD_SOLNYSHKO_NIGHT_FOOTAGE.md` §9–10.
- следующий агент: Ирина unmasked у prize stall, луп 10 с.
- не делать: bear.png; фудкорт; commit.

### 2026-08-28 — Cursor — Солнышко KEEP park-wide-15s — DONE
- scope: take 2 KEEP (lock > 15 с); бриф `carousel-empty-10s`.
- файлы: `docs/prompts/GROK_BUILD_SOLNYSHKO_NIGHT_FOOTAGE.md` §9–10.
- проверки: mp4 1280×720, 10 с; take 1 reject в логе.
- следующий агент: §10, пустая карусель, без халатов.
- не делать: дользи с хаба; растяжка 9:16; commit.

### 2026-08-28 — Cursor — Солнышко 720p lock — DONE
- scope: в брифе зафиксировать 1280×720; не 1080. Токены ≠ битрейт файла.
- файлы: `docs/prompts/GROK_BUILD_SOLNYSHKO_NIGHT_FOOTAGE.md` §0, §5, §10.
- следующий агент: `park-wide-15s` на 720p.
- не делать: просить Imagine «низкий битрейт».

### 2026-08-28 — Cursor — Солнышко KEEP gate-open-enter — DONE
- scope: take 3 KEEP (fade ок); бриф хаба `park-wide-15s` с lock первого кадра.
- файлы: `docs/prompts/GROK_BUILD_SOLNYSHKO_NIGHT_FOOTAGE.md` §9–10.
- проверки: клип в Pictures; take 1/2 в логе как reject.
- следующий агент (Grok Build): §10, луп 15 с на той же spine.
- не делать: новый двор; aerial; commit; перенос в `assets/`.

### 2026-08-28 — Cursor — Солнышко KEEP gate-refuse — DONE
- scope: зафиксировать отказ; бриф `gate-open-enter` (разово, freeze на spine).
- файлы: `docs/prompts/GROK_BUILD_SOLNYSHKO_NIGHT_FOOTAGE.md` §9–10.
- проверки: клип в Pictures, не в git.
- следующий агент (Grok Build): §10, один клип, не луп.
- не делать: перенос в `assets/`; commit; пересъём KEEP.

### 2026-08-28 — Cursor — Солнышко KEEP gate-closed-loop — DONE
- scope: зафиксировать take 2; бриф `gate-refuse` с continuity (без рук в стороны, без вспышки тумана).
- файлы: `docs/prompts/GROK_BUILD_SOLNYSHKO_NIGHT_FOOTAGE.md` §9–10.
- проверки: клип лежит в Pictures, не в git.
- следующий агент (Grok Build): §10, один клип.
- не делать: перенос в `assets/`; commit; пересъём KEEP.

### 2026-08-28 — Cursor — Солнышко футаж — DONE
- scope: handoff Grok Build: сценарий первой ночи + карта на `Pictures/references/locations/park`.
- файлы: `docs/prompts/GROK_BUILD_SOLNYSHKO_NIGHT_FOOTAGE.md`; указатель в каркасе ночи.
- проверки: сверка с `_bible/README.md` и манифестом (sun-gate, Veiled, stall, 16:9 spine).
- следующий агент (Grok Build): вставить блок из §0; клипы в `park/10_gameplay/clips/`; не в git.
- не делать: другой парк; Медведь в волне 1; Павел в кадре; commit.

### 2026-08-28 — Cursor — Солнышко драматургия — PAUSED
- scope: сюжетный каркас первой ночи + план футаджа для Grok Imagine.
- файлы: `docs/SOLNYSHKO_NIGHT_STORY_AND_FOOTAGE.md`.
- проверки: нет кода; согласование с пользователем.
- следующий агент должен: не внедрять граф, пока каркас не утверждён; после листов — промпты shot-by-shot.
- не делать: генерировать медиа; Павел в кадре; озвучка Ирины/стража.

### 2026-08-28 — Cursor — ID Павла — DONE
- scope: `0274-P` на карточке и в найме; квест «Солнышко» анонсирует ID, но не выдаёт номер.
- файлы: `js/app.js`, `content/irina/solnyshko-park-content.js`, validator, `docs/IRINA_SOLNYSHKO_BRIDGE.md`.
- проверки: запрос ID на карточке без квеста → `0274-P`; найм `0274-P` → кабинка; контент парка не содержит номера.
- следующий агент должен: не возвращать `BLOCKED FOR CONTENT` и не показывать `0274-P` в сцене Ирины.
- не делать: commit/push; этап 4 без фразы.

### 2026-08-28 — Cursor — этап 2 — IN TREE / UNVERIFIED
- scope: внутри парка после входа: общий план, пустая карусель, стенд с ватой, Ирина, unlock popup, выброс на STAFF.
- файлы: content/runtime/CSS/HTML after-hours, validator/smoke, `docs/IRINA_SOLNYSHKO_BRIDGE.md`.
- проверки: validators; desktop walk to `staff.html?personnel=pavel` (карточка ПАВЕЛ К., staff-mode); mobile 16:9 overflow 0. Лупы ещё без файлов — постер + fallback.
- следующий агент должен: класть mp4 в `assets/guest/locations/solnyshko/` по путям из content; не выдумывать ID Павла.
- не делать: этап 4 без фразы; commit/push.

### 2026-08-28 — Cursor — этап 2 — IN TREE / UNVERIFIED
- scope: рекламный вид «Солнышко» + отдельная after-hours сцена у ворот.
- файлы: `locations/solnyshko-park.html`, `locations/solnyshko-after-hours.html`, `content/irina/solnyshko-park-content.js`, `js/solnyshko-park.js`, `css/solnyshko-park.css`, Copy Desk/smoke/validator/public-build, `docs/IRINA_SOLNYSHKO_BRIDGE.md`.
- проверки: `node --check`, `validate-irina-solnyshko`, `smoke-copydesk`, `git diff --check`; browser desktop + `390×844`: отказ, день рождения, волонтёр, карман аниматора, 16:9, console 0.
- следующий агент должен: не возвращать открытку на рекламную страницу; новые ролики — только после этапа 4.
- не делать: commit/push; выдумывать ID Павла; второй runtime кабинки.

### 2026-08-28 — Cursor — оркестрация — DONE

- scope: шаблоны нового чата `docs/prompts/NEW_CHAT_TEMPLATES.md`.
- файлы: шаблоны, указатели в `AGENTS.md` и этом статусе.
- проверки: нет.
- следующий агент должен: стартовать с шаблона 1 или 2, в конце — шаблон 4.
- не делать: путать сохранение смены с git commit.

### 2026-08-28 — Cursor — оркестрация — DONE

- scope: уточнён транспорт: Grok Build = локальная папка сайта, не GitHub.
- файлы: `docs/AGENT_STATUS.md`, mega-plan.
- проверки: указание пользователя.
- следующий агент должен: читать локальное дерево и этот файл; не открывать
  GitHub-коннектор «чтобы увидеть этапы 1–3».
- не делать: считать `origin/main` рабочей копией.

### 2026-08-28 — Cursor — оркестрация — DONE

- scope: заведён этот файл; write-замок не занимался.
- файлы: `docs/AGENT_STATUS.md`; указатели в `AGENTS.md`, production plan,
  mega-plan.
- проверки: сверка с `git status`, handoff этапа 3 и существующими
  untracked runtime/content файлами.
- следующий агент должен: читать этот файл первым; для этапа 3 аудировать
  уже лежащий MVP, а не создавать параллельный.
- не делать: объявлять этап 3 принятым; начинать этап 4; commit/push.

### 2026-08-29 — Codex — тон досье Павла — DONE / QA VERIFIED

- scope: заменить два из девяти утверждённых кадров — листовку ТЮЗа на оформление первого контракта, служебное окно на хоррор-стилл синдрома отмены.
- файлы: `documents/dossier-pavel.html`, `assets/staff/documents/pavel-theater-leaflet.webp`, `assets/staff/documents/pavel-return-service-hatch.webp`.
- проверки: WebP 1792×1008; public build + verify; `git diff --check`; Playwright desktop 1440×1000 и mobile 390×844 — оба кадра загружены, 16:9, overflow 0, console 0.
- канон: зависимость обозначена; конкретные симптомы и длительность эпизода оставлены неустановленными.
- не делать: commit/push/deploy без отдельной просьбы.
