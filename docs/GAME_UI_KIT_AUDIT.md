# Game UI Kit — технический аудит и контракт

Статус: начальный технический этап, 2026-08-31.

Этот документ описывает общий технический слой для будущих сюжетных мини-игр.
Он не является шаблоном сюжета, не задаёт драматургию и не заменяет
`docs/GAME_STANDARD.md`.

## Границы

В kit входят только повторяемые UI/runtime-примитивы:

- cinematic stage и адаптивная компоновка;
- варианты репличных панелей и диалоговых окон;
- choice-кнопки, группы, возврат и состояния фокуса;
- media lifecycle: still, loop, burst, transition, hold и fallback;
- optional ambient, event cues и общий каталог готовых звуков;
- versioned save/resume/replay для одной игры;
- reduced motion, media failure, visibility и mobile safe-area поведение;
- типографические и цветовые токены, эффекты и доступность.

В kit не входят граф узлов, тексты, персонажи, артефакты, dossier-правила,
staff-gates, assignment-логика и game-specific props.

## Что уже есть в референсах

| Область | «Красная комната» | «Кабинка обозрения» | Решение для kit |
| --- | --- | --- | --- |
| Stage | fixed `100dvh`, image/video, scene data-атрибуты | fixed `100dvh`, still/video, visual data-атрибут | общий stage shell и media slots |
| Реплика | dialogue/thought/system, action beat, advance hold | dialogue/thought/document, typewriter hold | общий `text-kind`, line renderer и advance controller |
| Choices | кнопки, группировка, back, link | `speech/action/item`, reveal после media | общий renderer с variant/group/reveal hooks |
| Media | loop/reveal/transition, burst и still sequence | one-shot/loop, start/hold still, error watchdog | единый descriptor для media-state и playback policy |
| Audio | bed crossfade, presence overlays, scene cues, global music dock | bed crossfade, cue, unlock, visibility stop | отдельный reusable audio rack; глобальный music player не смешивать с SFX |
| Окна | `dialog` для страницы, награды и кофемашины | пока один panel без modal-слотов | нейтральный modal/document primitive, game-specific body остаётся снаружи |
| Save | flags, outcomes, artifacts, replay | node/flags, irreversible clips, completion | scoped versioned store с game callbacks |
| Mobile | panel/choices max-four, safe stage crop | `44px` targets, `390x844` focus restore | базовые layout/accessibility правила |

Текущая реализация дублирует значительную часть shell/panel/choice/media/audio
кода в `js/lora-red-room.js`, `js/pavel-observation-booth.js`,
`css/lora-red-room.css` и `css/pavel-observation-booth.css`. Это основание для
извлечения primitives, но не повод немедленно переписывать готовые игры.

## Предлагаемая структура

Первый вариант остаётся без production-зависимостей и без ES-модулей, чтобы
подходить текущему статическому сайту:

```text
css/game-ui.css                 # нейтральный layout, controls, text kinds
css/game-ui-themes.css          # опциональные theme tokens/presets
js/game-ui-kit.js               # маленькие stateless/shared controllers
js/game-ui-audio-library.js     # stable audio IDs -> canonical asset paths
scripts/validate-game-ui.js     # контракт DOM/content/media/audio
```

`game-ui-kit.js` не знает о конкретном персонаже и не владеет графом. Игра
создаёт собственный controller, передавая root, save adapter и content
callbacks. Общий слой может быть загружен рядом с существующим runtime, но
первые миграции не требуют менять Павла или Красную комнату.

## Технические контракты

### DOM и layout

Нейтральный shell использует `data-game-ui` и следующие опциональные слоты:

```text
data-game-ui
  data-game-ui-top
  data-game-ui-stage-wrap
    data-game-ui-hud
    data-game-ui-stage
      data-game-ui-still
      data-game-ui-video
  data-game-ui-panel
    data-game-ui-bubble
      data-game-ui-speaker
      data-game-ui-line
    data-game-ui-action
    data-game-ui-choices
    data-game-ui-live
```

Theme CSS меняет только tokens и game-specific additions. Stage остаётся
`16:9`, заполняет доступную область, учитывает `100dvh` и safe-area, а panel
не допускает горизонтального overflow.

### Репличные панели

Поддерживаемые базовые kinds: `dialogue`, `thought`, `system`, `document`.
`action` — отдельный slot/beat, а не новый вид игрового узла. Renderer отвечает
за visible text, live region, keyboard/click advance, typewriter policy и
очистку обработчиков при смене node.

### Choices

Choice descriptor содержит label/text, variant, next или callback и optional
visibility/group metadata. Kit предоставляет:

- `speech`, `action`, `item`, `link`, `group`, `back`;
- максимум четыре верхнеуровневых кнопки;
- минимум `44px` для интерактивной цели;
- focus первого доступного элемента после render;
- reveal-after-media и disabled/loading состояния.

Фильтрация флагов и последствия выбора остаются callback-ответственностью игры.

### Media descriptor

Visual ID ссылается на descriptor, а не на один безымянный файл:

```js
{
  neutral:  { src, still },
  active:   { src, still },
  burst:    { src, startStill, holdStill, playback: "one-shot", playedFlag },
  transition: { src, startStill, holdStill, playback: "one-shot", playedFlag },
  fallback: { still }
}
```

Controller обязан:

- показывать still до загрузки и при ошибке;
- поддерживать loop и one-shot раздельно;
- завершать transition по `video.ended`;
- не повторять burst/transition после сохранённого played flag;
- останавливать старое media при смене node и проверять token текущего запуска;
- сразу использовать fallback при reduced motion;
- оставлять текст и choices доступными при любой ошибке media.

Конкретные start/hold кадры, цепочки still и правила присутствия персонажа
передаются игрой.

### Audio rack

Общий rack разделяет три независимых роли:

```js
const audio = createAudioRack({
  beds: { empty: { id: "...", loop: true, volume: 0.18 } },
  cues: { door: { id: "...", volume: 0.6, category: "door" } },
});
```

Он отвечает за добровольный unlock, `setBed` с crossfade, одноразовые cues,
visibility/pagehide stop и playback failure. Он не автозапускает звук до
действия пользователя и не подменяет сюжетный текст.

`assets/audio/README.md` уже является каталогом принятых мастеров и stable
roles. Следующий runtime-шаг — дать ему программный stable-ID слой; пути и
семантические ограничения не должны копироваться вручную в каждом game JS.
Глобальный музыкальный player из `js/app.js` остаётся отдельным продуктовым
контролом и не смешивается с scene audio rack.

### Save adapter

Каждая игра получает свой versioned key и явный adapter:

```text
read() -> normalized save | null
write(save)
reset() -> очищает только ключ этой игры
```

Kit не знает названия flags и outcomes. Он только помогает сохранить node,
необратимые media transitions, completion и replay-safe состояние.

### Typography и themes

В kit должны быть CSS custom properties для `display`, `body`, `mono`,
`document`, `ink`, `muted`, `line`, `panel`, `accent`, `danger`, размеров
реплики и choice row. По умолчанию используются локальные системные стеки
(`Trebuchet/Segoe`, `Georgia`, `ui-monospace`); внешние web-font запросы не
нужны. Игра может заменить tokens своей темой, не переписывая layout.

## Миграционный порядок

1. Сделать kit и component gallery/fixture, не подключая его к готовым играм.
2. Прогнать на fixture media error, reduced motion, keyboard/focus,
   `390x844`, replay и audio unlock.
3. Перевести на kit «Солнышко», сохранив его ключ
   `tyndex_irina_solnyshko_v1`, role/artifact gate и существующие route IDs.
4. После отдельного browser QA решить, нужны ли точечные миграции новых игр.
   Павел и «Красная комната» остаются рабочими reference implementations.

## Gate этого этапа

На текущем этапе изменены только статус и этот технический audit. Existing
game content/runtime/media не редактировались. Следующий кодовый gate —
согласованный DOM/API kit и fixture; до него не делается массовый перенос CSS
или JS и не меняются игровые save keys.
