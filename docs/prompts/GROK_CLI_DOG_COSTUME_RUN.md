# Grok CLI execution instruction: Red Room practical dog costume

Paste the instruction below into the authorized `grok` CLI session running in
`/Users/nateglukhov/analog-horror-site`.

```text
Работай как execution agent в репозитории
/Users/nateglukhov/analog-horror-site. Не возвращай только план или новые
промпты: реально вызови доступный в этой CLI интерфейс Grok Imagine, создай
видео и сохрани локальные MP4.

Сначала прочитай:

- /Users/nateglukhov/analog-horror-site/AGENTS.md
- /Users/nateglukhov/analog-horror-site/docs/LORA_VISUAL_STATE_MATRIX.md
- /Users/nateglukhov/analog-horror-site/docs/prompts/GROK_LORA_MOTION.md
- /Users/nateglukhov/analog-horror-site/docs/prompts/GROK_IMAGINE_DOG_COSTUME.md

Важно: правильное направление — реальный взрослый исполнитель в физическом
мохнатом костюме собаки и практической маске. Нужно избежать полностью CGI-
животного и чистого digital look. Старые V07–V11 — continuity references.
Папку `assets/guest/red-room/lora/scenes/concepts/cgi/` и документ
`GROK_IMAGINE_DOG_CGI.md` не использовать: это отвергнутый пакет.

PixVerse не использовать. Не подменять генерацию текстовым ответом, симуляцией
успеха или одним только prompt output. Если в этой CLI нет реального callable
Imagine-generation path, остановись и сообщи точный блокер.

Создай три клипа в отдельной staging-папке:

`/Users/nateglukhov/analog-horror-site/assets/guest/red-room/lora/scenes/staging/grok-dog-costume-v2/`

Не перезаписывай V07–V11, не меняй runtime/content/matrix, не удаляй старые
файлы, не делай commit или push.

## 1. Dog wander

- Output: `dog-suit-wander-v2.mp4`
- Target: 16:9, 1280×720 if supported, 24 fps, silent, final duration 8.0 s.
- First frame: `/Users/nateglukhov/analog-horror-site/assets/guest/red-room/lora/scenes/v08-dog-settled.webp`
- Use the wander card from `GROK_IMAGINE_DOG_COSTUME.md`.
- The human performer rises behind the counter, walks a few restrained steps
  down the aisle toward the closed curtain, and remains visibly a person in a
  practical costume. No CGI animal, no digital fur, no camera movement, no
  curtain reveal, no text, no watermark.

## 2. Dog warms hands on coffee

- Output: `dog-suit-coffee-v2.mp4`
- Target: 16:9, 1280×720 if supported, 24 fps, silent, final duration 6.0 s.
- First frame: `/Users/nateglukhov/analog-horror-site/assets/guest/red-room/lora/scenes/concepts/costume/dog-suit-coffee-start-v2.png`
- Use the coffee card from `GROK_IMAGINE_DOG_COSTUME.md`.
- The same human performer slowly wraps both costumed hands around one grounded
  coffee cup, warms them, does not lift or drink from it, then relaxes. Keep
  one microphone and one cup.

## 3. Dog falls asleep

- Output: `dog-suit-sleep-v2.mp4`
- Target: 16:9, 1280×720 if supported, 24 fps, silent, final duration 4.0 s.
- First frame: `/Users/nateglukhov/analog-horror-site/assets/guest/red-room/lora/scenes/concepts/costume/dog-suit-sleep-start-v2.png`
- Use the sleep card from `GROK_IMAGINE_DOG_COSTUME.md`.
- The same human performer remains seated, lowers the masked head, and falls
  asleep with the head resting on crossed costumed forearms. Keep the physical
  costume and human weight. Do not turn it into a CGI dog.

If Imagine exposes only 6/10/15-second durations, choose the nearest supported
duration, record that fact, and locally trim to the requested final duration
with ffmpeg only after checking the generated clip. Do not silently claim that
the untrimmed duration is correct. If resolution or fps differs, record the
actual values.

After each generation:

1. Save the original downloaded/generated file in the staging directory.
2. Use `ffprobe` to record duration, width, height, fps, codec and audio.
3. Extract representative first/middle/final frames and check human-in-costume
   continuity, action readability, watermarks, duplicate objects and curtain
   behavior.
4. If audio exists, make a separate silent delivery copy; do not destroy the
   original.

At the end, return a compact execution report containing:

- which three generations actually completed;
- exact local paths;
- requested versus actual duration/resolution/fps/codec/audio;
- whether any local trim or silent copy was made;
- first-frame and final-frame observations;
- failed attempts and whether they consumed any generation credit, if exposed;
- Grok CLI token/usage before and after, if the CLI exposes it;
- any Grok Imagine video credit/cost shown by the provider;
- a clear distinction between model context tokens, provider generation usage,
  and local ffmpeg work.
```
