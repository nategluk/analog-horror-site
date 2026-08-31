# GROK BUILD — первая ночь «Солнышко»: видеолупы по визуальной библиотеке

**Дата:** 28 августа 2026  
**Статус:** **архив.** Grok Build снят со смены (лимиты). Волна 1 KEEP уже
лежит в `park/10_gameplay/clips/`. Не вставлять §0 в новый чат Grok.
Доделка игры: Cursor / Codex + ручной футаж по просьбе.

**Статус этапа:** только `docs/AGENT_STATUS.md`  
**Назначение:** сгенерировать футаж первой after-hours ночи, опираясь на
уже снятую клетку парка, а не на новый парк.

Не делать commit / push / публикацию. Не класть исходники библиотеки в git.
Клипы писать **вне** репозитория, пока пользователь не попросит перенос в
`assets/guest/locations/solnyshko/`.

---

## 0. Вставь это первым сообщением в чат Grok Build

```text
Новый чат. Работай с двумя локальными папками. GitHub не нужен.

Игра и сценарий:
/Users/nateglukhov/analog-horror-site

Визуальная библиотека парка (источник кадра, не выдумывать другой парк):
/Users/nateglukhov/Pictures/references/locations/park

Листы персонажей:
/Users/nateglukhov/Pictures/references/characters/irina/unmasked/irina.png
/Users/nateglukhov/Pictures/references/characters/irina/masked/bear.png
/Users/nateglukhov/Pictures/references/characters/veiled/veiled_turnaround_studio_01.png

Прочитай по порядку:
1. /Users/nateglukhov/analog-horror-site/docs/AGENT_STATUS.md
2. /Users/nateglukhov/analog-horror-site/docs/prompts/GROK_BUILD_SOLNYSHKO_NIGHT_FOOTAGE.md
   (этот файл целиком)
3. /Users/nateglukhov/analog-horror-site/docs/SOLNYSHKO_NIGHT_STORY_AND_FOOTAGE.md
4. /Users/nateglukhov/Pictures/references/locations/park/_bible/README.md
5. /Users/nateglukhov/Pictures/references/locations/park/_bible/MANIFEST.md

Задача: волна 1 футаджа первой ночи after-hours. 16:9. Новые клипы —
**480p (854×480)**, потолок 576p, не 720, не 1080. Старт-кадр и identity
только из библиотеки park + указанные sheets.

Не генерировать: Павла, кабинку, Медведя в полный рост в этой ночи, детей на
карусели, тир изнутри, зеркала, разговорную озвучку, второй чужой парк,
горы/пустыню с aerial draft.

Сначала верни таблицу: клип → start image → character refs → длительность.
Потом генерируй по одному клипу, начиная с gate-closed-loop. После каждого —
короткий reject/keep. Клипы складывай в
/Users/nateglukhov/Pictures/references/locations/park/10_gameplay/clips/
Commit в analog-horror-site не делать.
```

---

## 1. Что строится в игре

Браузерная after-hours сцена: `locations/solnyshko-after-hours.html`.
Рекламный день остаётся на `locations/solnyshko-park.html`.

Парк — ключевая возвратная локация, не трейлер кабинки Павла.

Первая ночь (акты):

1. Порог у ворот (страж / The Veiled). Отказы. Вход по дате или как волонтёр.
2. Разовый вау: ворота открываются, POV входит, камера замирает на панораме.
3. Хаб: луп территории. Можно подойти к пустой карусели или к Ирине.
4. Карусель: мысли, след парка (сахар/браслет), не Павел.
5. Ирина у стойки: заметила → вата/жест → одно предложение про Пашу.
6. Системный анонс ID (без номера в кадре) → STAFF. Локация остаётся.

Целевой ритм с лупами: 2–4 минуты. Ирина без головы Медведя. Павла в кадре нет.

Текст игры и кнопки — в
`content/irina/solnyshko-park-content.js`. Футаж не обязан совпадать с текущими
`media.src` один в один, но ID файлов ниже — контракт волны 1.

---

## 2. Визуальный канон библиотеки (не ломать)

Источник: `park/_bible/README.md`.

Замки identity:

- Вход: **sun-gate** — белое солнце/шут, красные лучи, ржавые прутья.
- Двор: **карусель + колесо**.
- Свет по умолчанию: **розовые сумерки / туман** + лампы аттракционов.
- `park_aerial_fairground_dusk_01.png` — черновик карты. Не копировать горы,
  сараи, пустынный ландшафт в новые кадры.

Позвоночник пространства:

```text
sun-gate → inner court → carousel → ferris wheel
                ↘ overgrown alleys
                ↘ prize stalls
                ↘ service / medical corridor
```

Новый кадр обязан узнаваться как этот парк: sun-gate, карусель, колесо,
полоски призового ларька или ржавые барьеры.

Мастера библиотеки сейчас в основном 9:16. Игре нужен **16:9**. Якорь широкого
канона:

`01_establishing/park_establishing_spine_twilight_wide_01.png`

Генерация видео: 16:9. Не растягивать 9:16 в широкий кадр без композиции
позвоночника.

---

## 3. Кто в кадре (игра × библиотека)

| Роль в сценарии | Кто на самом деле | Лист / пластина | Запрет |
|---|---|---|---|
| Страж у ворот | **The Veiled** | `characters/veiled/veiled_turnaround_studio_01.png` | Охранник ТЦ, солдат, «злодейское» лицо |
| Ирина | человек, onesie, лицо открыто | `characters/irina/unmasked/irina.png` | `masked/bear.png` в волне 1; пиджак куратора |
| Халаты | медпроцессия парка | `08_presence/park_medical_gurney-procession_fog_01.png` | Именованные врачи, кровь, взгляд в камеру |
| Фон карусели ночью | культ — только даль / волна 2 | `08_presence/park_ritual_hooded-cult_twilight_01.png` | Культ как NPC диалога |
| Клоуны | фейк-персонал аллей | `08_presence/park_group_clown-procession_dusk_01.png` | Не ставить на порог вместо Veiled |
| Стенд ваты | prize stall парка | `06_interiors/…` + `05_paths/park_path_prize-stall_exterior_night_01.png` | Чистый фудкорт, другой парк |

Studio sheets Ирины и Veiled **не копировать** в `park/` как дубликаты.
Нужны in-situ кадры/клипы, где они стоят в sun-gate / stall.

---

## 4. Старт-кадры волны 1 (обязательные файлы)

Все пути от
`/Users/nateglukhov/Pictures/references/locations/park/`.

| ID клипа | Длит. | Тип | Start / identity | Character ref | Действие |
|---|---|---|---|---|---|
| `gate-closed-loop` | 8–12 с | луп | `02_entrance/park_entrance_sun-gate_sunset_01.png` | Veiled | Veiled за закрытой решёткой. Парк светится **за** аркой. Живой, почти не двигается. |
| `gate-refuse` | 4–6 с | разово | тот же gate | Veiled | Отказ: жест к замку/прутьям. Створки **не** открываются. |
| `gate-open-enter` | 10–12 с | разово | gate front → `02_entrance/park_entrance_sun-gate_inside_sunset_01.png` → freeze на `01_establishing/park_establishing_spine_twilight_wide_01.png` | без людей или Veiled остаётся сбоку | POV: створки, шаг внутрь, камера **замирает** на позвоночнике (ворота+карусель+колесо). Главный вау. Не лупить. |
| `park-wide-15s` | 15 с | луп | `park_establishing_spine_twilight_wide_01.png` | халаты с medical plate | Карусель/лампы живые, дымка. 1–3 фигуры в халатах и масках пересекают кадр, не в камеру. Культ не в центре. |
| `carousel-empty-10s` | 10 с | луп | `04_rides/park_ride_carousel-horse_detail_twilight_01.png` и/или `01_establishing/park_establishing_carousel_twilight_01.png` | никого | Пустые лошадки, ритм. Один след: сахар или браслет на седле. |
| `irina-cotton-wait` | 8–12 с | луп | `05_paths/park_path_prize-stall_exterior_night_01.png` или `06_interiors/park_interior_prize-stall_empty_night_01.png` | Irina unmasked | Ирина у призового/сладкого ларька, две палочки ваты (или сахарный реквизит, совместимый со stall). Смотрит на дорожку, не в камеру. |
| `irina-cotton-offer` | 10–15 с | разово | тот же stall | Irina unmasked | Замечает POV, протягивает лишнюю вату двумя руками. Без речи на дорожке. |

Волна 2 (не начинать, пока волна 1 не принята):

- `gate-wait-date` — Veiled смотрит на карман POV, не в глаза
- `irina-cotton-lookaway` — взгляд мимо («передавай привет»)
- `park-wide-coats-closer`
- `shooting-gallery-dark` — только намёк с панорамы, без входа в тир

---

## 5. Куда писать файлы

```text
/Users/nateglukhov/Pictures/references/locations/park/10_gameplay/clips/
  gate-closed-loop.mp4
  gate-refuse.mp4
  gate-open-enter.mp4
  park-wide-15s.mp4
  carousel-empty-10s.mp4
  irina-cotton-wait.mp4
  irina-cotton-offer.mp4
```

Рядом можно класть `_poster.webp` 16:9 с того же кадра.

**Поставка KEEP 1–6 (ворота…wait):** 1280×720, H.264, ~24 fps. Не переснимать
ради разрешения.

**С `irina-cotton-offer` и далее (волна 2 тоже):** тир **480p 16:9 = 854×480**.
Если в UI только ступени 480 / 720 / 1080 — брать **480**. Потолок 576p
(1024×576), если 480 нет. Не 720 «на всякий». Браузерная сцена прощает
480p; токены жрут тир и число take, не Mbps файла.

Не просить генератор «низкий битрейт» отдельно от 480p.

Позже, по просьбе пользователя, копия в репозиторий:

```text
analog-horror-site/assets/guest/locations/solnyshko/
```

Имена `media.src` в `solnyshko-park-content.js` сейчас другие
(`park-wide-15s.mp4` уже совпадает). Не переименовывать игру «на глаз»:
сначала клип, потом surgical правка content.

Звук: **не** вшивать финальную речь. Допустим тихий эмбиент в клипе; скрип
ворот лучше отдельным mp3 позже. Сюжет остаётся в тексте страницы.

---

## 6. Промпт-хвост (каждый клип)

```text
Same park as the start image. Sun-gate with white sun/jester face and red rays,
baroque carousel, ferris wheel, pink twilight fog, practical ride bulbs, rust,
mud. 16:9 analog-horror night, no subtitles, no logos, no jumpscare, no readable
Russian signage. Do not invent a second amusement park. Do not copy mountains
or desert from the aerial map draft.
```

Плюс явное: *use start image as locked camera/location; use character
reference for Veiled / Irina / coats as specified.*

---

## 7. Reject

Переснимать, если:

- другой парк, дверь без sun-face, нет карусели/колеса там, где они должны быть;
- Ирина в голове Медведя;
- Павел, кабинка, дети на лошадках;
- Veiled заменён на обычного охранника;
- халаты смотрят в камеру / джампскейр;
- `gate-open-enter` зациклен или камера не замирает на панораме;
- aerial-география (горы, пустыня) просочилась в walk-клип;
- читаемый текст на вывесках.

Не режектить мелкий drift костюма, если identity парка и персонажа держатся.

---

## 8. Чего не делать

- Не чистить и не переименовывать всю библиотеку «для красоты».
- Не генерировать пачку mood board вне таблицы волны 1.
- Не заполнять `staffDirectory` и не трогать `js/app.js`.
- Не утверждать этап 4 медиа в AGENT_STATUS.
- Один клип за проход Imagine/генерации, пока пользователь не скажет батч.

---

## 9. Production log (волна 1)

| Клип | Статус | Файлы | Заметки |
|---|---|---|---|
| `gate-closed-loop` | **KEEP** | `10_gameplay/clips/gate-closed-loop.mp4` (1280×720, ~10 с); `_start.jpg`; `_poster.webp` / `_poster.jpg` | Take 1 reject: руки в стороны + вспышка тумана. Take 2: sun-face на месте, створки и цепь закрыты, Veiled (розовая марля), парк за аркой, рук не поднимает. Шов лупа: лампы на лучах зажигаются и к концу не гаснут — терпимо. Сетка лица с дистанции мягкая — identity держится. |
| `gate-refuse` | **KEEP** | `10_gameplay/clips/gate-refuse.mp4` (1280×720, ~6 с, разово); `_poster.webp` = тот же 16:9, что `gate-closed-loop_start.jpg` | Continuity с лупом: sun-face, закрытые створки и цепь весь клип, Veiled в розовой марле, парк за аркой. Одна ладонь на замке, вторая в плаще, без развода рук. Вспышки тумана нет, створки не расходятся. Лёгкий drift камеры и мягкое лицо — identity держится. |
| `gate-open-enter` | **KEEP** (take 3) | `10_gameplay/clips/gate-open-enter.mp4` (1280×720, 10 с, разово); `_poster.webp` = последний кадр = wide spine | Take 1 reject: вторые ворота внутри арки. Take 2 reject: руки в стороны + чужая карусель без sun-gate. Take 3: первый кадр = KEEP-start лупа; цепь падает, створки на ширину человека, Veiled уходит к стене без развода рук; fade порог→двор; камера садится на `park_establishing_spine_twilight_wide_01.png` и замирает. Пустые лошадки. Fade допустим: хаб требует совпадения последнего кадра со spine. |
| `park-wide-15s` | **KEEP** (take 2) | `10_gameplay/clips/park-wide-15s.mp4` (1280×720, **10 с** луп — 15 с без lock не брали); `_poster.webp` | Take 1 reject: наезд, каталка в центре, халаты из арки в камеру. Take 2: первый кадр = пустой spine (= enter.ended). Две фигуры в халатах/масках боком/спиной, без крови. Карусель и лампы живые, лошадки пустые, sun-gate + колесо. Конец: короткий fade в пластину для шва лупа/входа. Drift в середине терпим. Халаты из зоны ворот, не из-за забора карусели. |
| `carousel-empty-10s` | **KEEP** | `10_gameplay/clips/carousel-empty-10s.mp4` (1280×720, 10 с луп); `_poster.webp` / `_start.jpg` | CUT к той же барочной карусели, что на spine. 9:16 не растянут. Пустые лошадки, механизм, розовые лампы, туман, колесо в дымке. След: вата на седле. Никого. Fade в пластину, first/last совпадают. |
| `irina-cotton-wait` | **KEEP** (take 2) | `10_gameplay/clips/irina-cotton-wait.mp4` (1280×720, 10 с луп); `_poster.webp`; `_start.jpg` для offer | Take 1 reject: к середине смотрит в камеру (это жест offer). Take 2: взгляд вниз/на дорожку, лицо открыто, onesie, две палочки, striped stall, колесо в тумане. Без Медведя, без пиджака, без лишних людей. Fade в пластину. 9:16 не растянут. |
| `irina-cotton-offer` | **KEEP** | `10_gameplay/clips/irina-cotton-offer.mp4` (**854×480**, 10 с, разово); `_poster.webp` | Тот же stall/Ирина, что wait take 2. Старт: взгляд на дорожку, затем протягивает вату двумя руками. Без Медведя, речи, пиджака. Imagine отдал 736×400, скейлил в 854×480. Наезд к концу — не locked-off; жест читается. KEEP 720p не трогали. |

Клипы остаются в Pictures. В `solnyshko-park-content.js` `src` ещё не вешать, пока пользователь не попросит перенос.

**Волна 1 закрыта** (7/7 KEEP). Не начинать волну 2, пока пользователь не скажет.

---

## 10. Волна 1 закрыта — не генерировать

Семь клипов лежат в `park/10_gameplay/clips/`. Commit / копирование в
`assets/guest/locations/solnyshko/` — только по просьбе.

Следующий шаг в репо (когда скажут): surgical `media.src` + runtime
`gate-open-enter` play-once → `ended` → `park-wide-15s`. Не плодить второй
runtime кабинки. Волну 2 (`gate-wait-date`, `irina-cotton-lookaway`, …) не
снимать без отдельного брифа.

Архив offer: Imagine native 736×400 → scale 854×480. Наезд в конце KEEP.
