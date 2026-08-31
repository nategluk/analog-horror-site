# Кабинка Павла: first-frame matrix

**Статус:** `WAVE 3 IN RUNTIME / STAGE 4B CRT PLATES V1 KEEP`  
**Дата:** 2026-08-29  
**Сменяет как производственную основу:** `docs/PAVEL_OBSERVATION_BOOTH_MEDIA_MAP.md`
(пилот `M01 + M03 + M09` = `0 KEEP / 3 REJECT`; карту не использовать для нового batch).

Драматургия живых состояний:
`/Users/nateglukhov/.codex/worktrees/8010/analog-horror-site/docs/PAVEL_OBSERVATION_BOOTH_MEDIA_DRAMATURGY.md`.

Этот файл отвечает только на вопрос: *какой абсолютный кадр уходит в C1
как first frame, и откуда берётся held last frame*. Он не очередь генерации,
не quote и не разрешение копировать JPEG в `assets/`.

## 1. Контракт поставки

- Cursor **не** вызывает PixVerse (нет MCP). Видео и правки stills делает
  пользователь вручную в Grok Imagine / PixVerse в браузере.
- Imagine / ImageGen stills в финальную игру **не копируются**, пока нет
  принятого ролика; held = last frame того ролика.
- В видеогенератор загружается **только first frame**.
- Когда все сцены KEEP, пользователь отдельно запрашивает shot-лист:
  путь к first frame, хронометраж, промпт. До этой просьбы промпты не писать.
- Камера зафиксирована; сюжетный текст остаётся HTML.
- Принятый **last frame ролика** = poster + held visual после `video.ended`.
- Reference mode не считать точным image-to-video.
- Подушка / вмятина / кассета под наволочкой **вычеркнуты**.
- Череп на бутылке для слива **утверждён пользователем**: это абсурд (просить
  средство для труб → «вкусно»), а не запрещённая этикетка-инструкция.
  В видимом тексте по-прежнему нет состава, бренда и способа смешивания.
- Побег Павла: скрытая горка в подсобке, не хвост в окне двери (`M09` не
  переносить).

Статусы first frame:

| Статус | Значение |
|---|---|
| `LOCKED RUNTIME` | уже в `assets/`, игра держит still |
| `BOARD LOCK` | first frame утверждён в этом чате; в `assets/` не класть |
| `BOARD CANDIDATE` | файл есть; нужен KEEP/REJECT пользователя |
| `TARGET ONLY` | last-frame ориентир для промпта/QA, не upload |
| `REJECT` | не использовать |
| `USER EDIT` | first frame задан; пользователь правит вручную (канистра и т.п.) |

## 2. Корни файлов

```text
OG14   /Users/nateglukhov/.codex/generated_images/01a04ac7-8651-7801-ac55-bae19f1d079a
IMG12  /Users/nateglukhov/.codex/generated_images/01a04e61-b1f3-77f3-b42e-5882ebc41a66
IMAG   /Users/nateglukhov/.cursor/projects/Users-nateglukhov-analog-horror-site/assets
GAME   /Users/nateglukhov/analog-horror-site/assets/guest/locations/pavel
CRTREF /Users/nateglukhov/.codex/generated_images/01a04bf3-2e7d-7e61-8fe7-380bf27b5200
```

## 3. Не использовать

| ID | Файл | Почему |
|---|---|---|
| PixVerse `M01` | `projects/pavel-observation-booth/assets/videos/421669023608410/` | смена плана / лицо |
| PixVerse `M03` | `…/421669025076447/` | несколько пальцев, слишком полное лицо |
| PixVerse `M09` | `…/421669036274919/` | побег через дверь + наезд камеры; сюжет заменён |
| `BEDROOM_WRONG` | `IMG12/exec-ca7df23f-8927-4685-8146-a6f90e1c925e.png` | другая комната (кровать слева, коридор) |
| `PILLOW_VHS` | `OG14/exec-ae13f31f-e940-456a-b0ed-13d3f2629bce.png` | beat наволочки отменён; объект кассеты можно держать как object ref |
| `MASKED_BOOTH` | `OG14/exec-9df91148-0175-413a-bed1-63ebfb19e0f0.png` | голова Кота на; тур и пост — без mascot head |
| `MASKED_BACK` | `OG14/exec-a36fc3dd-b083-443d-8ff3-d9591a24e923.png` | то же |

Identity lock (не first frame комнаты):  
`OG14/exec-66b2cc13-31e0-439a-9c82-5ce5010fb41e.png`.

## 4. Текущий граф (23 узла)

Визуальные слоты в `content/pavel/observation-booth-content.js` ещё старые.
Колонка «после правки сценария» — куда слот должен переехать. Текст узлов
в этом документе не переписывается.

| Узел | Сейчас `visual` | First frame | Held / last | Статус |
|---|---|---|---|---|
| `booth-intro` | `CONTROL_BASE` | `IMG12/exec-c438cae0-…png` (Павел у CRT) | last тура / hold Павла | `BOARD CANDIDATE` |
| `booth-sound-ack` | `CONTROL_BASE` | тот же, что intro, **без рестарта клипа** | hold | зависит от intro |
| `control-laugh` | `CONTROL_BASE` | `OG14/exec-75eb6e67-…png` пустой пост; motion только на левом CRT | last hold того же ракурса | `BOARD LOCK` (пустой пост) |
| `bedroom-check` | `BEDROOM_BASE` | `OG14/exec-cb783abf-…png` широкая пустая спальня | still или micro-hold | `BOARD LOCK` |
| `dev-drain-fragment` | `DRAIN_VAGUE` | `OG14/exec-e772b976-…png` | hold тьмы | `BOARD CANDIDATE` |
| `drain-beckon` | `DRAIN_BECKON` | тот же close-up слива, что vague | last: палец+частичный глаз (`OG14/exec-ec8e0944-…png` = `TARGET ONLY`) | `BOARD CANDIDATE` |
| `drain-cough` | `DRAIN_COUGH` | last beckon / vague | last: пар/кашель (`OG14/exec-ddc423de-…png` = `TARGET ONLY`) | `BOARD CANDIDATE` |
| `drain-password` | `DRAIN_BECKON` | hold beckon, без нового шота | hold | reuse |
| `drain-silent` | `DRAIN_VAGUE` | first = last cough или vague | hold пустой решётки | reuse |
| `control-after-drain` | `CONTROL_BASE` | `IMG12/exec-c438cae0-…png` если Павел ещё на посту, иначе `exec-75eb6e67` | hold, без рестарта | `BOARD CANDIDATE` |
| `storage-check` | `STORAGE_BASE` | `IMG12/exec-912247d0-…png` провизия, горка скрыта; OG `exec-1ead29d1` — запасной edit target | hold | `BOARD CANDIDATE` |
| `hatch-tray` | `HATCH_BASE` | `OG14/exec-fd24e519-…png` | текущий граф: записка/поднос; production meal/маска — §6 | `BOARD CANDIDATE` |
| `control-after-hatch` | `CONTROL_BASE` | `IMG12/exec-c438cae0-…png` | hold | `BOARD CANDIDATE` |
| `bedroom-cassette` | `BEDROOM_BASE` | cutaway `IMAG/grok-image-573f02fb-…jpg` **CLOSED ящик** | last `NIGHTSTAND_REVEAL` | `BOARD LOCK` |
| `control-camera` | `CONTROL_PAVEL_RIGHT` | `GAME/control-pavel-right-start.webp`; master plate `projects/pavel-observation-booth/assets/images/control-pavel-on-right-v1.png` | `GAME/control-pavel-right-hold.webp`; отказ без рестарта | `LOCKED RUNTIME` |
| accept `control-camera` → `hatch-escape` | `CONTROL_RIGHT_DISABLED` | `GAME/control-right-disabled.webp`; master plate `projects/pavel-observation-booth/assets/images/control-right-disabled-v1.png` | static hold до клика | `LOCKED RUNTIME` |
| `slide-farewell-*` | `STORAGE_SLIDE` | `GAME/storage-slide.webp`; свет/тьма — будущий ручной ролик | still | `IN TREE / AWAITING MANUAL CLIP` |
| `dev-operator-hold` | `CONTROL_BASE` | `OG14/exec-75eb6e67-…png` пустое кресло | hold | `BOARD LOCK` |
| `operator-last-check` | `CONTROL_BASE` | `OG14/exec-75eb6e67-…png` | hold / micro на CRT | `BOARD LOCK` |
| `storage-slide-empty` | `STORAGE_SLIDE` | `GAME/storage-slide.webp` | still | `LOCKED RUNTIME` |
| `senior-guide-arrives` | `SENIOR_GUIDE_SLIDE` | `GAME/senior-guide-at-slide.webp` | still через весь диалог | `LOCKED RUNTIME` |
| `senior-guide-verdict` | `SENIOR_GUIDE_SLIDE` | тот же | hold, без нового шота | `LOCKED RUNTIME` |
| `senior-guide-route` | `SENIOR_GUIDE_SLIDE` | тот же | hold | `LOCKED RUNTIME` |
| `slide-guest-light` | `SLIDE_ESCAPE` | `GAME/senior-guide-at-slide.webp` → `GAME/senior-guide-slide-exit.mp4` | `GAME/storage-slide-light.webp`; `video.ended` → guest redirect | `LOCKED RUNTIME` |
| `slide-guest-exit` | `STORAGE_SLIDE` | fallback only | manual `ВЫЙТИ` / reduced-motion redirect | `IN TREE` |

Кандидаты замены locked stills (не трогать runtime, пока нет KEEP):  
`IMG12/exec-5dc9ea93-…png` (горка + провизия), `IMG12/exec-de07ae5a-…png` (Проводница в той же подсобке).

### 4.1. Принятая постановка правого канала

- После кассеты игрок возвращается к посту: кресло пустое, Павел физически ушёл.
- Левый CRT остаётся нормальным рабочим каналом. На правом CRT появляется
  удалённая CCTV-картинка `CRTREF/exec-881266b1-ef09-40d0-8157-1124f9755e70.png`:
  Павел смотрит в снимающую его камеру уже в полной голове Кота.
- Исходник с Павлом не показывать fullscreen. Это вторичный видеосигнал внутри
  правого CRT: подогнать перспективу, кривизну, свечение и scanlines монитора.
- Голова Кота здесь намеренна: из кабинки Павел ушёл без неё, а на удалённой
  камере появился полностью замаскированным. Это признак подготовленного побега,
  а не ошибка continuity.
- Сгенерированы две согласованные ImageGen-пластины V1:
  `CONTROL_PAVEL_ON_RIGHT` и `CONTROL_RIGHT_DISABLED`. Во второй меняется
  правый CRT: он чёрный; левый канал стабилен, композиция совпадает.
- При отказе правый канал остаётся живым, Павел продолжает давить через HTML-текст,
  а footage не перезапускается. При согласии правый канал гаснет; дальше
  прощание у горки на `STORAGE_SLIDE`, без `STORAGE_ESCAPE`.
- Смысл выбора: игрок осознанно убирает видеосвидетельство. Реплики остаются HTML;
  читаемый текст внутри CRT не генерировать.
- V1 получили пользовательский KEEP 2026-08-29. После отдельного одобрения
  manual Grok clip прошёл silent exact-16:9 crop и подключён в runtime:
  `GAME/control-pavel-right.mp4`. Узел `hatch-escape` держит погашенный
  правый CRT; затем `slide-farewell-*`.

## 5. Пролог-экскурсия (нет в текущем графе)

Один CCTV-ракурс на комнату. Павел без головы Кота. Близкий «рядом с POV»
в спальне запрещён фильтрами: first = указывает на кровать, last = сидит.

| Шот | First frame | Last / held | Статус |
|---|---|---|---|
| `TOUR_CONTROL` | `IMG12/exec-c438cae0-…png` | micro-motion у CRT, hold | `BOARD CANDIDATE` |
| `TOUR_BATHROOM` | `IMG12/exec-cc676738-…png` на пластине с унитазом `IMG12/exec-cf41e10d-…png` | указывает на слив | `BOARD CANDIDATE` |
| `TOUR_STORAGE` | `IMG12/exec-a8284281-…png` | бытовая провизия, горка не раскрыта | `BOARD CANDIDATE` |
| `TOUR_BEDROOM` | `IMAG/grok-image-7b03dc20-4b55-4e03-91f5-ae199443803e-785b16e6-c806-48ca-8017-78e65b4f64c7.jpg` | `IMAG/grok-image-91165a64-3887-4cf9-b540-841a986b39cb-db17273a-df30-494b-947b-9b03d0603c4d.jpg` (`TARGET ONLY` / last) | `BOARD LOCK` |
| `TOUR_HATCH` | `OG14/exec-fd24e519-…png` | короткий показ люка, без побега; Павла при необходимости дорисовать вручную | `BOARD LOCK` (геометрия двери) |
| Empty bedroom master | `OG14/exec-cb783abf-…png` | still между визитами | `BOARD LOCK` |
| Empty bathroom + toilet | `IMG12/exec-cf41e10d-…png` | still; OG `exec-6bbd01eb` — edit target без унитаза | `BOARD CANDIDATE` |

Сидячий Codex `IMG12/exec-53f4588e-…png` и empty remake `IMG12/exec-5d5f91bb-…png` — запасные, если Imagine last frame не пройдёт QA костюма. Не вторая геометрия.

## 6. Тумбочка / кассета

Ящик сверху, не нижняя дверца. Не класть эти JPEG в `assets/`.

| Шот | First (upload) | Last (из ролика) | Статус |
|---|---|---|---|
| `NIGHTSTAND_REVEAL` | `IMAG/grok-image-573f02fb-3246-4250-abb8-f9b5f6f84051-6bf011df-dd9d-4358-a7e2-5a4082fa722d.jpg` | открытый ящик + VHS; ориентир `IMAG/grok-image-43133779-…jpg` | `BOARD LOCK` + `TARGET ONLY` |
| `NIGHTSTAND_EMPTY` | last reveal **или** пустой ящик как first, если take = отдельный шот | пустой ящик; ориентир `IMAG/grok-image-bc9e0d04-…jpg` | `TARGET ONLY` |

После `ОСТАВИТЬ КАССЕТУ` hold = last reveal. После `ВЗЯТЬ` hold = last empty.

## 7. Утверждённая драматургия и delivery-биты

Сначала first frame, потом узлы. Не генерировать без отдельного approval.

| Beat | First frame | Target / last | Статус |
|---|---|---|---|
| Стук «пусти меня» | `OG14/exec-fd24e519-…png` | два удара, цепь, никого за стеклом, камера lock-off | `BOARD CANDIDATE` |
| Противогаз через люк | exact `OG14/exec-fd24e519-…png`, без target reference | `GAME/hatch-gasmask.mp4` → `hatch-gasmask-hold.webp` | `KEEP / IN RUNTIME` |
| Порция `DELIVERY` | exact `OG14/exec-fd24e519-…png`, без target reference | `GAME/hatch-dessert.mp4` → `hatch-dessert-hold.webp` | `KEEP / IN RUNTIME` |
| Порция после выбора | delivery hold | закрытая дверь `hatch-dessert-start.webp`; уход подноса остаётся в HTML-тексте | `STATIC FALLBACK / IN RUNTIME` |
| `DRAIN-DRINK-01` канистра | широкий склад с белой бутылкой: `IMAG/grok-image-3946ae30-…jpg`; CU бутылки: `IMAG/grok-image-0789f125-…jpg` | череп на этикетке **утверждён**: существо просит «почистить трубы», потом «вкусно». Без состава и инструкции в тексте | `BOARD LOCK` |
| `STORAGE_PROVISIONS` | `IMAG/grok-image-2611a2c8-…jpg` | кнопка `ПРОВЕРИТЬ ПРИПАСЫ`, мысль про хлопья/корм, не пробовать. Не fetch слива | `BOARD LOCK` |
| `DRAIN-DRINK-02` литьё | **не снимать POV с канистрой** | held: `assets/guest/locations/pavel/drain-hungry.webp` (язык + пальцы). Только узел `drain-pour` | `BOARD LOCK` |
| Розовая дымка | `OG14/exec-e772b976-…png` | грязно-розовый пар, без полного тела | `BOARD LOCK` (слив) |
| Пустой слив после маски | `OG14/exec-e772b976-…png` | нет глаза/пальца | reuse |
| Правый CRT гаснет | `OG14/exec-75eb6e67-…png` | только правый монитор тухнет | `BOARD LOCK` (пустой пост) |
| Павел в горку | `IMG12/exec-5dc9ea93-…png` | фигура входит в тоннель | `BOARD CANDIDATE` |

## 8. Список first frames закрыт

`MISSING` больше нет: у каждого слота есть файл на upload или явный
`USER EDIT` с того же файла. Cursor не генерирует видео.

Пустая подсобка без бутылки (запасной ракурс, если широкий KEEP с черепом не сядет):

```text
/Users/nateglukhov/.codex/generated_images/01a04e61-b1f3-77f3-b42e-5882ebc41a66/exec-912247d0-a1e8-4e45-b2bb-6abff2e44a98.png
```

Пустой пост (кресло, два CRT, без Павла):

```text
/Users/nateglukhov/.codex/generated_images/01a04ac7-8651-7801-ac55-bae19f1d079a/exec-75eb6e67-4460-4f99-b4d4-254e48fca610.png
```

Дальше: пользователь вручную собирает stills/видео. Когда все сцены KEEP —
отдельная просьба на документ «путь / хронометраж / промпт». После ручной
генерации — копирование mp4 в игру и первый прогон.

Не делать из Cursor: PixVerse API, браузерный плагин, quote, копирование
boards в `assets/`, commit/push.

## 9. Связь с runtime

Пока в игре визуально закреплены только `STORAGE_SLIDE` и `SENIOR_GUIDE_SLIDE`.
Интеграция остальных роликов — после ручной генерации и отдельной просьбы.

## 10. Полные пути BOARD LOCK

```text
# DRAIN-DRINK wide (bottle on lower left shelf, skull OK)
/Users/nateglukhov/.cursor/projects/Users-nateglukhov-analog-horror-site/assets/grok-image-3946ae30-5a76-438e-9d42-1572709845ef-a1d356c6-cff1-401d-a3d2-9001058cc0b0.jpg

# DRAIN-DRINK bottle CU
/Users/nateglukhov/.cursor/projects/Users-nateglukhov-analog-horror-site/assets/grok-image-0789f125-a64b-4a8d-82d7-4e815af36d5a-527569fd-7906-43a0-9d53-9f0f96d66a9e.jpg

# STORAGE_PROVISIONS CU (check supplies gag)
/Users/nateglukhov/.cursor/projects/Users-nateglukhov-analog-horror-site/assets/grok-image-2611a2c8-2c81-4b91-bcc2-3e53f0884d0e-0af8dce7-c873-4bd7-91fe-006964ceaece.jpg

# empty control (no Pavel)
/Users/nateglukhov/.codex/generated_images/01a04ac7-8651-7801-ac55-bae19f1d079a/exec-75eb6e67-4460-4f99-b4d4-254e48fca610.png

# empty bedroom master
/Users/nateglukhov/.codex/generated_images/01a04ac7-8651-7801-ac55-bae19f1d079a/exec-cb783abf-71c3-4092-b5f3-d75aea0111fa.png

# TOUR_BEDROOM first (points)
/Users/nateglukhov/.cursor/projects/Users-nateglukhov-analog-horror-site/assets/grok-image-7b03dc20-4b55-4e03-91f5-ae199443803e-785b16e6-c806-48ca-8017-78e65b4f64c7.jpg

# TOUR_BEDROOM last target (sits)
/Users/nateglukhov/.cursor/projects/Users-nateglukhov-analog-horror-site/assets/grok-image-91165a64-3887-4cf9-b540-841a986b39cb-db17273a-df30-494b-947b-9b03d0603c4d.jpg

# NIGHTSTAND_REVEAL first (closed)
/Users/nateglukhov/.cursor/projects/Users-nateglukhov-analog-horror-site/assets/grok-image-573f02fb-3246-4250-abb8-f9b5f6f84051-6bf011df-dd9d-4358-a7e2-5a4082fa722d.jpg

# NIGHTSTAND cassette target
/Users/nateglukhov/.cursor/projects/Users-nateglukhov-analog-horror-site/assets/grok-image-43133779-fb98-4079-8f37-dd1511935943-88675bfe-2e3f-4287-802a-793d53d62df8.jpg

# NIGHTSTAND empty target
/Users/nateglukhov/.cursor/projects/Users-nateglukhov-analog-horror-site/assets/grok-image-bc9e0d04-20fe-4abe-ac26-0ac3eb2a2ffb-c3eb2994-44d5-4b40-a0d2-9bf67d08b91d.jpg

# locked runtime
/Users/nateglukhov/analog-horror-site/assets/guest/locations/pavel/storage-slide.webp
/Users/nateglukhov/analog-horror-site/assets/guest/locations/pavel/senior-guide-at-slide.webp
```
