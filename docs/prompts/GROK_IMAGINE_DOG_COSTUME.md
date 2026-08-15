# Красная Комната: practical dog costume motion cards for Grok Imagine

Ручная генерация в Grok Imagine. PixVerse не использовать. Цель пакета —
сохранить человека в физическом костюме собаки и избежать чистого CGI-лука.

## Locked direction

- The dog is a real adult performer wearing a practical shaggy dog costume and
  physical dog mask.
- Keep human weight, shoulders, elbows, seated posture and physical contact
  with the counter readable beneath the costume.
- Preserve the existing costume identity and Red Room plates. The old V07–V11
  stills are continuity references, not assets to replace.
- No fully CGI animal, digital fur simulation, clean 3D character render,
  photorealistic real dog, visible bare human face, or costume head floating
  without a body.
- Aspect ratio: 16:9. Prefer 1280×720 delivery at 24 fps when available.
- Camera: fixed bar-counter POV from the existing Red Room plates. No camera
  movement, no readable text, no subtitles, no logos, no watermark, no extra
  characters, no open-curtain reveal.
- Upload only a neutral first-frame still to Imagine. Mid-action stills are
  references/fallbacks, not first frames.

## 1. Dog wander — 8.0 s burst

First frame:

`assets/guest/red-room/lora/scenes/v08-dog-settled.webp`

Reduced-motion fallback frames:

`assets/guest/red-room/lora/scenes/v08-dog-stand.webp`

`assets/guest/red-room/lora/scenes/v08-dog-aisle.webp`

Do not upload the fallback frames as Imagine first frames.

Suggested output name: `dog-suit-wander-v2.mp4`

Prompt:

```text
Create an 8-second cinematic analog-horror motion clip from the supplied
neutral first frame. Preserve the exact fixed first-person bar-counter camera,
the Red Room architecture, glossy dark crimson walls, mirror panels, warm globe
lamps, black telephone, coffee machine, paper note, closed red curtain,
framing, lighting and color grade.

The same real adult performer in the same old shaggy dog mascot costume starts
seated behind the counter. The performer slowly rises, pauses as if listening,
then walks a few quiet steps down the central aisle toward the closed red
curtain while holding the small microphone close to the torso. The walk is
awkwardly human under the costume: visible weight transfer, practical fabric
movement, slightly rigid mask, real foot contact with the glossy floor. The
performer pauses near the aisle and looks toward the curtain. Do not turn this
into a digital animal performance.

Keep one performer only. Preserve the same costume, dog mask, microphone and
late-shift practical lighting. No fully CGI animal, no digital fur simulation,
no clean 3D render, no photorealistic real dog, no visible bare human face, no
extra hands, no duplicate microphone, no new characters, no text, no subtitles,
no logos, no watermark, no camera movement, no open curtain, no figure behind
the curtain, no cartoon style.
```

Target duration: 8.0 s. Keep the existing `holdMs: 900` behavior unchanged
until integration QA.

## 2. Dog warms hands on coffee — 6.0 s burst

First frame:

`assets/guest/red-room/lora/scenes/concepts/costume/dog-suit-coffee-start-v2.png`

Action reference only:

`assets/guest/red-room/lora/scenes/concepts/costume/dog-suit-coffee-action-v2.png`

Suggested output name: `dog-suit-coffee-v2.mp4`

Prompt:

```text
Create a 6-second cinematic analog-horror motion clip from the supplied
neutral first frame. Preserve the exact fixed Red Room bar-counter POV,
glossy dark crimson walls, mirror panels, warm globe lamps, telephone, coffee
machine, paper note, closed red curtain, framing, practical lighting and color
grade.

The same real adult performer remains seated in the same physical shaggy dog
costume. The performer notices the single plain coffee cup, slowly brings both
costumed hands around the outside of the cup, and quietly warms them against
it without lifting the cup or drinking. The performer leans slightly toward
the warmth, holds the small human gesture, then relaxes while staying seated.
The cup remains grounded on the counter. The microphone stays visible once on
the counter or close to the torso.

Make the action read as a tired human performer warming gloved costume hands
around coffee during a late shift. Preserve practical faux-fur fabric,
slightly imperfect mask construction, human shoulder and elbow weight, and
real contact shadows. No animal-only CGI behavior.

No fully CGI animal, no digital fur simulation, no clean 3D render, no
photorealistic real dog, no bare human hands, no visible bare face, no extra
fingers, no duplicate cups, no floating cup, no drinking, no lifted cup, no
extra characters, no text, no subtitles, no logos, no watermark, no camera
movement, no open curtain, no cartoon style.
```

Target duration: 6.0 s. Integration should restore to `V08_DOG_SETTLED` and
coordinate the current `dog_coffee` delay with `video.ended`.

## 3. Dog falls asleep — 4.0 s transition

First frame:

`assets/guest/red-room/lora/scenes/concepts/costume/dog-suit-sleep-start-v2.png`

Poster/fallback after the clip:

`assets/guest/red-room/lora/scenes/v11-dog-sleep.webp`

Suggested output name: `dog-suit-sleep-v2.mp4`

Prompt:

```text
Create a 4-second quiet cinematic analog-horror transition from the supplied
awake first frame. Preserve the exact fixed Red Room bar-counter POV, glossy
dark crimson walls, mirror panels, warm globe lamps, telephone, coffee
machine, paper note, closed red curtain, framing, practical lighting and color
grade.

The same real adult performer remains seated in the same physical shaggy dog
costume. The performer stays awake for a brief moment, lowers the masked head,
releases a slow tired breath, and gradually lets the head come to rest on the
crossed costumed forearms on the counter. The handheld microphone remains
lying once on the counter and the coffee cup remains once to the side. Finish
in the existing quiet sleep pose. The motion is small, heavy and physically
continuous, like a person in a costume falling asleep after a long shift.

Preserve human performer weight, practical costume fabric, mask rigidity and
physical contact with the counter. No transformation into an animal, no fully
CGI dog, no digital fur simulation, no clean 3D render, no visible bare face,
no extra character, no curtain reveal, no camera movement, no text, no
subtitles, no logos, no watermark, no duplicate cup, no duplicate microphone,
no duplicate limbs, no cartoon style.
```

Target duration: 4.0 s. Use the existing `v11-dog-sleep.webp` as the poster
until a replacement sleep still is explicitly requested.

## Handoff after manual generation

Keep the downloaded MP4s in a separate staging location first. Record actual
duration, dimensions, fps, codec, watermark status, first-frame match, practical
costume continuity, action readability and final-frame behavior. Do not
overwrite V07–V11, wire clips, or change the runtime until integration is
explicitly approved.
