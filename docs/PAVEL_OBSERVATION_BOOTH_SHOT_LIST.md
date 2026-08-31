# Кабинка Павла: shot-лист видео (текущий граф)

**Статус:** `WAVE 3 INTEGRATED / V14 GENERATED — REJECT / REPAIR DECISION REQUIRED`  
**Дата:** 2026-08-29  
**Профиль:** image-to-video, **только first frame**, камера lock-off, `audio OFF`,
без Multi-shot, без читаемого текста в кадре. Реплики остаются HTML.

PixVerse: **C1**, **540p**, **16:9**, звук **OFF**, Multi-shot **OFF**.
Cursor PixVerse не вызывает. Сняли ролик → класть в `tmp/` → KEEP → вшить.
Старый pilot `M01/M03/M09` не повторять. Волну 1 (V01–V03) не переснимать.

---

## V01 — кассета в ящике

| | |
|---|---|
| Узел | `bedroom-cassette` |
| Длительность | **5 с** |
| First frame | `/Users/nateglukhov/.cursor/projects/Users-nateglukhov-analog-horror-site/assets/grok-image-573f02fb-3246-4250-abb8-f9b5f6f84051-6bf011df-dd9d-4358-a7e2-5a4082fa722d.jpg` |
| Last / held цель | `/Users/nateglukhov/analog-horror-site/assets/guest/locations/pavel/nightstand-cassette.webp` |

**Prompt (English, paste):**

Fixed CCTV close-up. Exact first frame: closed olive-green metal nightstand, bed edge and radiator on the right, no camera move, no zoom, no pan. The top drawer slides open a short distance by itself. Inside, one old grey VHS cassette becomes visible on the drawer floor. No hand. No person. No readable brand text. Hold the open drawer with the cassette at the end.

**Reject:** смена плана; рука; кассета уже снаружи; наезд на этикетку; новая мебель.

---

## V02 — ОТМЕНЁН: Павел входит в горку

**Не играть.** Павел не в кабинке и не ползёт в тоннель. Прощание у горки —
still `storage-slide.webp`. Принятый финальный ролик относится к Проводнице
и POV игрока после команды `ВОЙТИ В ГОРКУ`, а не к побегу Павла.
Оригинал `storage-pavel-escape.mp4` оставить в дереве, в runtime не
подключать.

## V15 — ФИНАЛ ПОВОДЫРЯ / ВХОД В ГОРКУ

| | |
|---|---|
| Узел | `slide-guest-light` после `senior-guide-route` |
| Runtime | `assets/guest/locations/pavel/senior-guide-slide-exit.mp4` |
| Длительность | **10.04 с** |
| Звук | AAC stereo; только при добровольно включённом звуке игры |
| First / poster | `assets/guest/locations/pavel/senior-guide-at-slide.webp` |
| Reduced motion / failure | `assets/guest/locations/pavel/storage-slide-light.webp` + кнопка `ВЫЙТИ` |
| Завершение | `video.ended` → guest mode → главная; ролик без loop |

Проводница указывает на горку, внутри загорается свет, POV входит в трубу,
после глитча игра возвращает гостевую главную. Покадровая творческая QA не
требовалась: пользователь принял ручной ролик целиком как финальный.

---

## V02 (архив) — Павел входит в горку

| | |
|---|---|
| Узел | `hatch-escape` |
| Длительность | **6 с** |
| First frame | `/Users/nateglukhov/analog-horror-site/assets/guest/locations/pavel/storage-pavel-escape.webp` |
| Last / held цель | пустой тоннель, тот же ракурс; ориентир `/Users/nateglukhov/analog-horror-site/assets/guest/locations/pavel/storage-slide.webp` (свет может погаснуть) |

**Prompt (English, paste):**

Fixed CCTV down a narrow storage aisle. Exact first frame: worn grey Cat costume body crawling into the circular water-slide opening, face not visible, tail in frame. Camera locked. The figure crawls forward into the hole and disappears. Interior glow fades. End on the empty circular opening and the same shelves. No new room. No mascot head turning to camera. No running. No door. No text.

**Reject:** лицо крупно; голова Кота; камера едет; хвост в оконце двери; второй человек.

---

## V03 — голодный слив (после хлорки)

| | |
|---|---|
| Узел | `drain-pour` |
| Длительность | **4 с** |
| First frame | `/Users/nateglukhov/analog-horror-site/assets/guest/locations/pavel/drain-hungry.webp` |
| Last / held | тот же кадр, язык чуть влажнее / неподвижный hold |

**Prompt (English, paste):**

Fixed close-up of a circular floor drain, exact first frame. Camera does not move. The pink tongue on the grate shifts slightly as if tasting. The two pale fingers stay hooked on the metal. No more of the creature. No pouring jug. No bottle. No green liquid stream. No zoom. No mouth opening into a full face. Wet analog grain only.

**Reject:** канистра в кадре; полный рот/лицо; третья рука; наезд; химический фонтан.

Не использовать этот промпт для `DRAIN_VAGUE` / `DRAIN_BECKON`.

---

## Волна 2 — пять шотов (текущий граф)

Закрывают узлы, которые сейчас падают на постер Ирины (слив до хлорки, пост, дверь).
Снимать **по одному**. Не начинать тур / противогаз / порцию / Павла лицом в камеру.

---

## V04 — пустой слив (тьма)

| | |
|---|---|
| Узел | `dev-drain-fragment` |
| Visual | `DRAIN_VAGUE` |
| Длительность | **4 с** |
| First frame | `/Users/nateglukhov/.codex/generated_images/01a04ac7-8651-7801-ac55-bae19f1d079a/exec-e772b976-81b2-40f7-936f-86e8e43f348c.png` |
| Last / held | тот же ракурс; влажный блик чуть живее, **без** пальца и глаза |

**Prompt (English, paste):**

Fixed overhead CCTV close-up of a circular floor drain, exact first frame. Camera locked, no zoom, no pan. Dark wet concrete, square-grid metal grate. A faint sickly gleam shifts once deep under the grate, in the wrong place for a reflection. No finger. No eye. No face. No tongue. No steam. No pouring liquid. No creature body. Hold the empty grate.

**Reject:** палец; глаз; наезд; канистра; полный рот.

---

## V05 — палец и глаз

| | |
|---|---|
| Узел | `drain-beckon` |
| Visual | `DRAIN_BECKON` |
| Длительность | **5 с** |
| First frame | `/Users/nateglukhov/.codex/generated_images/01a04ac7-8651-7801-ac55-bae19f1d079a/exec-ec8e0944-76ce-4444-818c-8e17915e5e0b.png` |
| Last / held | тот же кадр: один палец + частичный глаз |

**Prompt (English, paste):**

Fixed overhead close-up, exact first frame. Camera does not move. One pale dirty finger is already through the grate. It curls toward the camera twice, slowly, then holds still. One partial human eye stays in the dark under the bars, no second eye. No extra fingers. No full face. No mouth. No tongue. No bottle. No zoom. Wet analog grain only.

**Reject:** два и больше пальцев (как pilot M03); целое лицо; наезд; существо целиком.

Reuse hold на `drain-password` (палец ещё в кадре). Не путать с V03 `drain-pour`.

---

## V06 — розовый пар

| | |
|---|---|
| Узел | `drain-cough` |
| Visual | `DRAIN_COUGH` |
| Длительность | **5 с** |
| First frame | тот же, что V05: `/Users/nateglukhov/.codex/generated_images/01a04ac7-8651-7801-ac55-bae19f1d079a/exec-ec8e0944-76ce-4444-818c-8e17915e5e0b.png` |
| Last / held ориентир | `/Users/nateglukhov/.codex/generated_images/01a04ac7-8651-7801-ac55-bae19f1d079a/exec-ddc423de-f5e9-4509-b034-c9e81924b92a.png` (пар + глаз; палец может уйти) |

**Prompt (English, paste):**

Fixed overhead close-up, exact first frame: one pale finger and one partial eye under a circular floor drain. Camera locked, no zoom. Dirty pink-grey steam rises through the grate. Brief wet black hair strands appear in the steam then fade. The single finger stays until the end. No second finger. No full face. No mascot. No pouring jug. No readable text.

**Reject:** белый «чистый» пар вместо грязно-розового; полный рот; третья рука; наезд; Волосяной комок как целое тело.

---

## V07 — пустой пост (два CRT)

| | |
|---|---|
| Узлы | `dev-operator-hold`, `operator-last-check` (hold); не intro |
| Visual | `CONTROL_BASE` после ухода Павла |
| Длительность | **6 с** |
| First frame | `/Users/nateglukhov/.codex/generated_images/01a04ac7-8651-7801-ac55-bae19f1d079a/exec-75eb6e67-4460-4f99-b4d4-254e48fca610.png` |
| Last / held | тот же ракурс; левый CRT живой |

**Prompt (English, paste):**

Fixed CCTV of an empty observation booth, exact first frame. Camera locked, no zoom. Empty worn chair in the foreground. Left CRT shows a grainy night path under a lamp; the image drifts slowly downward. Right CRT stays dark. Mixing desk and joystick do not move. No person. No cat mascot. No face. No new room. Analog grain only. Hold the empty chair.

**Reject:** Павел в кадре; смена плана на лицо (pilot M01); оба монитора гаснут; камера едет.

Не использовать этот клип на `booth-intro`, пока Павел ещё на смене.

---

## V08 — люк с запиской

| | |
|---|---|
| Узел | `hatch-tray` |
| Visual | `HATCH_BASE` |
| Длительность | **5 с** |
| First frame | `/Users/nateglukhov/.codex/generated_images/01a04ac7-8651-7801-ac55-bae19f1d079a/exec-fd24e519-1d9a-4894-b64d-be02c6ca6d14.png` |
| Last / held | люк приоткрыт на ширину подноса; пустая тарелка и сложенная записка; за стеклом никого |

**Prompt (English, paste):**

Fixed CCTV of an olive-green institutional door, exact first frame. Camera locked, no zoom, no pan. The lower meal hatch opens a short way by itself, only tray-width. An empty plate and a folded paper note sit on the inner shelf. Wire-mesh window stays dark; nobody behind the glass. Chain and bolt do not come off. No person crawling. No tail in the window. No cat costume. No readable writing on the note. Hold the open hatch.

**Reject:** побег в горку; хвост в оконце (pilot M09); наезд на стекло; человек за дверью; открытая створка настежь.

---

## Волна 3 — тур Stage 4A

Пять независимых image-to-video шотов. Профиль каждого: `pixverse-c1`,
`540p`, `16:9`, `audio OFF`, `Multi-shot OFF`, один непрерывный lock-off.

### V09 — мониторная / начало тура

| | |
|---|---|
| Узлы | `tour-control` |
| Длительность | **8 с** |
| First frame | `/Users/nateglukhov/.codex/generated_images/01a04e61-b1f3-77f3-b42e-5882ebc41a66/exec-c438cae0-1de5-453b-a17f-46426691e8e0.png` |
| Last / held | Павел отходит к левой двери; тот же широкий ракурс |

**Prompt:** `projects/pavel-observation-booth/prompts/v09-tour-control.txt`

### V10 — спальня / «посидим на дорожку»

| | |
|---|---|
| Узлы | `tour-bedroom`, `tour-bedroom-sit` |
| Длительность | **10 с** |
| First frame | `/Users/nateglukhov/.cursor/projects/Users-nateglukhov-analog-horror-site/assets/grok-image-7b03dc20-4b55-4e03-91f5-ae199443803e-785b16e6-c806-48ca-8017-78e65b4f64c7.jpg` |
| Last / held | Павел сидит на краю кровати; ящик закрыт |

**Prompt:** `projects/pavel-observation-booth/prompts/v10-tour-bedroom.txt`

### V11 — санузел / «просто трубы»

| | |
|---|---|
| Узел | `tour-bathroom` |
| Длительность | **7 с** |
| First frame | `/Users/nateglukhov/.codex/generated_images/01a04e61-b1f3-77f3-b42e-5882ebc41a66/exec-cc676738-1bec-49a0-a6e8-0c74b36ecca6.png` |
| Last / held | Павел убирает руку от слива; слив остаётся пустым |

**Prompt:** `projects/pavel-observation-booth/prompts/v11-tour-bathroom.txt`

### V12 — склад / банки

| | |
|---|---|
| Узлы | `tour-storage`, `tour-storage-cans`, `tour-storage-home` |
| Длительность | **8 с** |
| First frame | `/Users/nateglukhov/.codex/generated_images/01a04e61-b1f3-77f3-b42e-5882ebc41a66/exec-a8284281-a2fb-4249-9922-d85bc6d8c968.png` |
| Last / held | одна-две банки поправлены; горка не раскрывается |

**Prompt:** `projects/pavel-observation-booth/prompts/v12-tour-storage.txt`

### V13 — дверь / закрытый люк

| | |
|---|---|
| Узел | `tour-hatch` |
| Длительность | **5 с** |
| First frame | `/Users/nateglukhov/.codex/generated_images/01a04ac7-8651-7801-ac55-bae19f1d079a/exec-fd24e519-1d9a-4894-b64d-be02c6ca6d14.png` |
| Last / held | люк и цепь закрыты; Павел остаётся вне кадра |

**Prompt:** `projects/pavel-observation-booth/prompts/v13-tour-hatch.txt`

## Не снимать в этой волне

Припасы, бутылка-череп, пустая спальня, Проводница, пустая горка, кассета, вход в горку, голодный слив — already KEEP / stills.

У CRT не делать наезд на лицо Павла (`exec-c438cae0`, риск M01): только
широкий lock-off и уход к двери. Противогаз, порция и отдельные F14-beats не
входят в волну 3.

---

## Как отдавать в игру

После KEEP класть в `tmp/`, затем сказать Cursor вшить. Имена при интеграции, например:

```text
assets/guest/locations/pavel/drain-vague.mp4
assets/guest/locations/pavel/drain-beckon.mp4
assets/guest/locations/pavel/drain-cough.mp4
assets/guest/locations/pavel/control-empty.mp4
assets/guest/locations/pavel/hatch-tray.mp4
```

Волна 1 уже в runtime:

```text
assets/guest/locations/pavel/nightstand-cassette.mp4
assets/guest/locations/pavel/storage-pavel-escape.mp4
assets/guest/locations/pavel/drain-hungry.mp4
```

Playback: `loop = false`; по `video.ended` — hold still, клип не повторяется. Reduced motion — still без ролика.

### Wave 3 integration — 2026-08-29

- V09–V13: `KEEP`, task ids `421717143618293`, `421717150187541`,
  `421717161428130`, `421717277685221`, `421717327582197`.
- Оригинальные PixVerse MP4 сохранены без изменений под
  `projects/pavel-observation-booth/assets/videos/<task-id>/`.
- Runtime-копии: `tour-control`, `tour-bedroom`, `tour-bathroom`,
  `tour-storage`, `tour-hatch` в `assets/guest/locations/pavel/`, по одному
  MP4 и паре `-start.webp` / `-hold.webp`.
- Все runtime MP4: H.264, 1024×576, 24 fps, без audio stream. V09/V11/V12/V13
  cropped по 8 px сверху и снизу; V10 перенесён без перекодирования.
- Узлы тура используют одноразовые flags `clipTour*`; соседние реплики одной
  комнаты не перезапускают текущий клип. Reduced motion показывает still.

---

## Wave 4 / V14 — просьба с правого CRT

**Статус:** `PLATES V1 KEEP / V14 REJECT / NO RETRY`.

Принятая сцена: после кассеты Павла уже нет в мониторной. Он появляется на
правом CRT в полной голове Кота и просит игрока отключить снимающую его камеру.
Согласие гасит правый CRT и осознанно помогает побегу; затем используется уже
готовый `STORAGE_ESCAPE`.

Для V14 созданы две согласованные ImageGen-пластины V1:

| Plate | Основа | Изменение |
|---|---|---|
| `CONTROL_PAVEL_ON_RIGHT` | `/Users/nateglukhov/.codex/generated_images/01a04ac7-8651-7801-ac55-bae19f1d079a/exec-75eb6e67-4460-4f99-b4d4-254e48fca610.png` | пустое кресло; левый CRT нормален; в правый CRT встроен удалённый сигнал `/Users/nateglukhov/.codex/generated_images/01a04bf3-2e7d-7e61-8fe7-380bf27b5200/exec-881266b1-ef09-40d0-8157-1124f9755e70.png` |
| `CONTROL_RIGHT_DISABLED` | принятая `CONTROL_PAVEL_ON_RIGHT` | комната и левый CRT без изменений; только правый CRT полностью чёрный |

Project copies, 1672×941 PNG:

- `projects/pavel-observation-booth/assets/images/control-pavel-on-right-v1.png`;
- `projects/pavel-observation-booth/assets/images/control-right-disabled-v1.png`.

Воспроизводимые ImageGen prompts:

- `projects/pavel-observation-booth/prompts/v14-control-pavel-on-right-imagegen.txt`;
- `projects/pavel-observation-booth/prompts/v14-control-right-disabled-imagegen.txt`.

Требование к композиту: удалённый сигнал существует только внутри правого CRT,
с совпадающими перспективой, кривизной стекла, свечением и scanlines. Реплика —
HTML, никакого читаемого текста в изображении. Переход отказа не перезапускает
ролик; отключённый экран — отдельный hold.

Пластины получили пользовательский KEEP 2026-08-29. Подготовлен один
непрерывный V14: C1, 540p, 16:9, 8 секунд, `audio OFF`, `Multi-shot OFF`;
камера и кабинка lock-off, движение только в содержимом правого CRT.

- English prompt: `projects/pavel-observation-booth/prompts/v14-right-crt-request.txt`;
- editable queue: `projects/pavel-observation-booth/v14-right-crt-queue.json`;
- first frame: `projects/pavel-observation-booth/assets/images/control-pavel-on-right-v1.png`;
- planned tasks: `1 video`;
- PixVerse membership: `Standard`, effective route `premium`;
- balance at preflight: `860 credits`;
- exact pre-generation cost: provider does not expose it;
- confirmation required: `true`.

### V14 generation result — 2026-08-29

- task id: `421721729979719`;
- local source: `projects/pavel-observation-booth/assets/videos/421721729979719/pixverse_video_421721729979719_1788041234477.mp4`;
- provider result: success; C1, 540p, 8.0417 s, H.264, 1024×592,
  24 fps, no audio stream;
- billing: 48 credits; balance 860 → 812;
- technical issue: provider again returned 1024×592 rather than exact 16:9;
- visual KEEP: gesture toward the camera is readable, the empty booth and two
  channels survive in the opening section;
- visual REJECT: during the second half C1 performs a forbidden push-in from
  the booth into the right CRT; the worn hollow-eyed Cat mask drifts into a
  cute glossy-eyed character. Both violate hard continuity locks.

V14 is retained as audit evidence and is not a runtime candidate. No retry was
started. Recommended repair: generate a new short clip from the full-frame
remote CCTV source itself, keep Pavel distant with minimal motion, then
perspective-composite that video locally into the accepted static booth plate.
This prevents the booth camera from moving. Any V15 generation requires a new
prompt, quote and explicit approval.

### Manual Grok replacement — KEEP / IN RUNTIME — 2026-08-29

- user source: `/Users/nateglukhov/Desktop/grok-video-01aa49ea-08e3-412c-91e2-ab471e59ef90.mp4`;
- protected project master: `projects/pavel-observation-booth/assets/videos/manual-grok-crt/grok-video-01aa49ea-08e3-412c-91e2-ab471e59ef90.mp4`;
- source/master SHA-256 match:
  `b2d581e708d42cd55ac02dbdad6bc52d0f450d1b3c5670f75c0f321f8791cfca`;
- source: 752×416, 6.0417 s, 24 fps, H.264 with quiet AAC stereo;
- local finishing: crop `736×414` at `x=8,y=1`, Lanczos scale to 1024×576,
  H.264 CRF 18, 24 fps, audio stripped;
- runtime video: `assets/guest/locations/pavel/control-pavel-right.mp4`;
- runtime stills: `control-pavel-right-start.webp`,
  `control-pavel-right-hold.webp`, `control-right-disabled.webp`, all 1024×576;
- runtime graph: `control-camera` = live right CRT; refusal does not restart;
  `hatch-escape` = right CRT black; then `slide-farewell-*` stills, no crawl;
- QA: validator 60/60, Copy Desk smoke, public build verification, desktop
  accept/refuse/ended/persistence, mobile 390×844, reduced motion, console clean.

The rejected paid V14 remains audit evidence and is not copied into runtime.

## F14 delivery clips — KEEP / IN RUNTIME — 2026-08-29

- User verdict: `KEEP KEEP` for dessert task `421761263244540` and gas-mask
  task `421761271792334`; no retries or variants.
- Both were generated from the exact closed F14 door only. The earlier target
  images were not supplied to PixVerse.
- Runtime derivatives are silent H.264, 1024×576, 24 fps, 5.0417s, cropped
  locally by 8 px from the top and bottom of the 1024×592 C1 outputs.
- `HATCH_DESSERT` and `HATCH_GASMASK` each play once and hold their own last
  frame. After taking/refusing the item, `HATCH_CLOSED` restores the closed
  door still; reduced motion loads the held item still without loading MP4.
- Runtime files: `hatch-dessert.mp4`, `hatch-dessert-start.webp`,
  `hatch-dessert-hold.webp`, `hatch-gasmask.mp4`,
  `hatch-gasmask-start.webp`, `hatch-gasmask-hold.webp`.
