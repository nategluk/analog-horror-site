# SUPERSEDED — do not use

This card set targeted a fully CGI dog and was superseded on 2026-08-14.
The approved direction is a real performer in a practical dog costume. Use
`docs/prompts/GROK_IMAGINE_DOG_COSTUME.md` instead.

# Красная Комната: CGI dog motion cards for Grok Imagine

Ручная генерация в Grok Imagine. PixVerse не использовать. Codex предоставляет
16:9 stills и эти prompt cards; видео в Imagine запускается вручную.

## Locked production rules

- Aspect ratio: 16:9. Prefer 1280×720 delivery at 24 fps when the interface
  allows it.
- Camera: fixed bar-counter POV from
  `assets/guest/red-room/lora/scenes/v01-empty-counter-v1.png`.
- Preserve the Red Room: glossy dark crimson walls, mirror panels, warm globe
  lamps, black telephone, coffee machine, paper note, closed red curtain,
  amber-red late-shift lighting.
- The dog is one continuous fully rendered CGI canine creature, not a human in
  a mascot costume. No human skin, costume seams, zipper, gloves, or visible
  human anatomy.
- No readable text, subtitles, logos, watermark, extra characters, or curtain
  reveal.
- Upload only a neutral first-frame still. Do not upload mid-action stills as
  first frames. Last-frame drift is acceptable dream logic; the runtime poster
  and still fallback are separate assets.
- Keep the old V07–V11 costume files untouched until integration is explicitly
  approved.

## 1. Dog wander — 8.0 s burst

First frame:

`assets/guest/red-room/lora/scenes/concepts/cgi/dog-cgi-settled-v1.png`

Do not upload:

`dog-cgi-wander-stand-v1.png` or `dog-cgi-wander-aisle-v1.png`; those are only
reduced-motion fallback stills.

Suggested output name:

`dog-cgi-wander-v1.mp4`

Prompt:

```text
Create an 8-second cinematic analog-horror motion clip from the supplied
neutral first frame. Keep the exact fixed first-person bar-counter camera and
the same Red Room architecture, lighting, reflections, red curtain, telephone,
coffee machine, paper note, and glossy counter.

The single upright CGI canine creature starts seated behind the counter in the
same neutral pose. It slowly rises, pauses as if listening, then walks a few
quiet steps down the central aisle toward the closed red curtain while holding
the small microphone close to its torso. The movement is restrained and
physically readable: weight shifts, paws move naturally, fur responds subtly,
footfalls reflect faintly on the glossy floor. It does not run, speak, wave, or
look at any new character. Keep the creature's exact gray-beige fur, floppy
ears, canine muzzle, dark reflective eyes, black nose, and fully CGI material.

Preserve one creature only. No human in a mascot suit, no human skin, no
costume seams, no zipper, no gloves, no human hands, no duplicate limbs, no
duplicate microphone, no new cup, no text, no subtitles, no logos, no
watermark, no open curtain, no figure behind the curtain, no camera movement,
no scene change, no cartoon style.
```

Target duration: 8.0 s. Keep the existing `holdMs: 900` behavior unchanged
until integration QA.

## 2. Dog warms paws on coffee — 6.0 s burst

First frame:

`assets/guest/red-room/lora/scenes/concepts/cgi/dog-cgi-settled-v1.png`

Action reference only, not first frame:

`assets/guest/red-room/lora/scenes/concepts/cgi/dog-cgi-coffee-action-v1.png`

Suggested output name:

`dog-cgi-coffee-v1.mp4`

Prompt:

```text
Create a 6-second cinematic analog-horror motion clip from the supplied
neutral first frame. Preserve the exact fixed bar-counter POV, Red Room
architecture, glossy dark crimson surfaces, warm globe lamps, closed red
curtain, telephone, coffee machine, paper note, and amber-red late-shift
lighting.

The same single upright CGI canine creature remains seated behind the counter.
It notices the plain coffee cup, slowly brings both forepaws around the outside
of that one cup, and quietly warms them against it without lifting the cup or
drinking. A very small thread of steam may rise. The dog lowers its gaze toward
the warmth, holds the pose for a moment, then relaxes slightly while remaining
seated. The handheld microphone stays visible once on the counter, set aside.

The action must read as paws warming around one grounded cup, not human hands
using a mug. Preserve the creature's exact CGI gray-beige fur, floppy ears,
canine muzzle, dark eyes, black nose, scale, and unsettling quiet expression.

No second cup, no duplicate paws, no floating cup, no drinking, no human in a
mascot costume, no human skin, no costume seams, no zipper, no gloves, no
human fingers, no extra characters, no text, no subtitles, no logos, no
watermark, no camera movement, no open curtain, no scene change, no cartoon
style.
```

Target duration: 6.0 s. Runtime integration should restore to
`V08_DOG_SETTLED`; coordinate the current `dog_coffee` delay with
`video.ended` before wiring.

## 3. Dog falls asleep — 4.0 s transition

First frame:

`assets/guest/red-room/lora/scenes/concepts/cgi/dog-cgi-sleep-start-v1.png`

Poster/fallback after the clip:

`assets/guest/red-room/lora/scenes/concepts/cgi/dog-cgi-sleep-poster-v1.png`

Suggested output name:

`dog-cgi-sleep-v1.mp4`

Prompt:

```text
Create a 4-second quiet cinematic analog-horror transition from the supplied
awake first frame. Preserve the exact fixed bar-counter POV, Red Room
architecture, glossy dark crimson surfaces, warm globe lamps, closed red
curtain, telephone, coffee machine, paper note, and amber-red late-shift
lighting.

The same single upright CGI canine creature remains seated behind the counter.
It stays visibly awake for a brief moment, lowers its gaze, releases a slow
breath, and gradually lowers its head until it rests on its crossed forepaws on
the counter. The handheld microphone remains lying once on the counter and the
plain coffee cup remains once to the side. Finish in a quiet fully asleep
state. The movement is small, heavy, and physically continuous.

Preserve the creature's exact CGI gray-beige fur, floppy ears, canine muzzle,
dark eyes, black nose, scale, and non-costume anatomy. No transformation, no
human body underneath, no new character, no curtain reveal, no camera move, no
text, no subtitles, no logos, no watermark, no duplicate cup, no duplicate
microphone, no duplicate limbs, no cartoon style.
```

Target duration: 4.0 s. Keep the existing transition behavior and use the new
sleep poster as the still state after the clip.

## Handoff after manual generation

Keep generated MP4s in a separate staging location first. For each file record
the actual duration, dimensions, fps, codec, watermark status, first-frame
match, dog identity, action readability, and final-frame behavior. Do not
overwrite the existing V07–V11 files and do not wire anything until the
selected clips receive an explicit integration approval.
