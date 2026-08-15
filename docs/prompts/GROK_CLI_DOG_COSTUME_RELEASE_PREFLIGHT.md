# Grok CLI release preflight: Red Room practical dog costume videos

Paste the instruction below into the authorized Grok CLI session after the
three clips have completed.

```text
Работай как release-preflight agent в
/Users/nateglukhov/analog-horror-site. Сейчас нужен последний технический и
визуальный аудит перед официальным запуском, а не публикация.

Прочитай:

- /Users/nateglukhov/analog-horror-site/AGENTS.md
- /Users/nateglukhov/analog-horror-site/docs/LORA_VISUAL_STATE_MATRIX.md
- /Users/nateglukhov/analog-horror-site/docs/prompts/GROK_LORA_MOTION.md
- /Users/nateglukhov/analog-horror-site/docs/prompts/GROK_IMAGINE_DOG_COSTUME.md
- /Users/nateglukhov/analog-horror-site/docs/prompts/GROK_CLI_DOG_COSTUME_RUN.md

Проверь git status и найди все файлы в:

/Users/nateglukhov/analog-horror-site/assets/guest/red-room/lora/scenes/staging/grok-dog-costume-v2/

Не используй отвергнутую папку
`assets/guest/red-room/lora/scenes/concepts/cgi/` и
`GROK_IMAGINE_DOG_CGI.md`. Не используй PixVerse.

## Сначала собрать release candidate

Создай новую папку, не перезаписывая исходники:

`/Users/nateglukhov/analog-horror-site/assets/guest/red-room/lora/scenes/staging/grok-dog-costume-v2/release-candidate/`

Собери туда только выбранные delivery MP4, а raw MP4 оставь отдельно в
подпапке `raw/`. Добавь:

- применённые first-frame stills;
- `contact-sheet.png` с первым, средним и последним кадром каждого delivery;
- `ffprobe-report.json`;
- `RELEASE_PREFLIGHT.md` с выводами и blockers;
- копию применённого prompt/source manifest.

Не удаляй raw, старые V07–V11 и существующие fallback-файлы.

## Проверить каждый клип

Expected delivery:

1. `dog-suit-wander-v2.mp4` — 8.000 s, 16:9, 24 fps, silent.
2. `dog-suit-coffee-v2.mp4` — 6.000 s, 16:9, 24 fps, silent.
3. `dog-suit-sleep-v2.mp4` — 4.000 s, 16:9, 24 fps, silent.

Для каждого через ffprobe зафиксируй:

- width, height, sample/display aspect ratio;
- duration и frame count;
- fps и codec;
- наличие audio stream;
- raw-versus-delivery relationship;
- bitrate/filesize, если доступны.

Отдельно проверь, что фактические `736×400` не являются точным 16:9.
Не растягивай картинку молча. Если нужна техническая коррекция, создай
отдельные non-destructive candidates с понятным суффиксом и сравни:

- crop-to-16:9;
- pad-to-16:9 без искажения;
- текущий native delivery.

Выбери рекомендацию только по видимой композиции: не обрезай телефон,
лампы, собаку или штору ради формального ratio. Старые файлы не заменяй.

## Визуальная ревизия

Для каждого клипа извлеки первый, средний и последний кадр и проверь:

- это человек в физическом костюме собаки, а не CGI-животное;
- costume/маска/масштаб совпадают с V07–V11 continuity;
- одна чашка и один микрофон без дублей и плавления;
- шторы остаются закрытыми, нет текста, watermark или новых персонажей;
- wander: читается подъём и движение к шторе;
- coffee: обе костюмные руки действительно греются о чашку, чашка не
  поднимается и не исчезает;
- sleep: голова действительно приходит на предплечья в пределах 4 s;
- first frame каждого видео совпадает с указанным still;
- финальный кадр не создаёт ложное впечатление, что clip обязан быть loop.

Отдельно укажи, что 8-секундный wander trim обрезает look-at-curtain, если это
подтверждается кадрами. Сравни с raw 10-секундным вариантом, но не выбирай raw
в runtime автоматически.

## Runtime readiness, без интеграции

Прочитай текущие:

- `/Users/nateglukhov/analog-horror-site/js/lora-red-room.js`
- `/Users/nateglukhov/analog-horror-site/content/lora/red-room-content.js`
- `/Users/nateglukhov/analog-horror-site/scripts/validate-lora-red-room.js`
- `/Users/nateglukhov/analog-horror-site/scripts/smoke-lora-red-room.js`

Составь integration map, но не редактируй эти файлы:

- `dog_dreams` → wander video и reduced-motion frames;
- новый `dog_coffee` motion slot → coffee video и restore в V08;
- `V11_DOG_SLEEP` → sleep video/poster/fallback;
- requiredAssets и expectedVisual checks;
- interaction между node delay и `video.ended`.

Не менять end_leave_sleep copy, не менять visual IDs, не менять save keys,
не делать commit/push и не объявлять официальный запуск завершённым.

## Usage report

В конце дай один компактный отчёт:

- какие файлы вошли в release candidate;
- какие файлы исключены и почему;
- exact technical metadata каждого MP4;
- результат visual QA по каждому клипу;
- решение по `736×400` и tradeoff crop/pad/native;
- решение по 8-second wander versus raw 10-second version;
- все blockers перед integration;
- Grok CLI model-context tokens до/после, если доступны;
- provider video generations/credits/cost, если доступны;
- отдельно local ffmpeg work и его стоимость;
- чёткое заключение: `READY FOR INTEGRATION`, `NEEDS ONE REVISION` или
  `BLOCKED`.
```
