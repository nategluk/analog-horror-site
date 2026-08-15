# Source / prompt manifest — dog costume v2

Packet assembled 2026-08-14. Runtime, V07–V11 originals, and content files were not modified.

## Direction

Practical adult performer in a physical shaggy dog costume and mask.
Rejected: `assets/guest/red-room/lora/scenes/concepts/cgi/`, `docs/prompts/GROK_IMAGINE_DOG_CGI.md`, PixVerse.

Canon cards: `docs/prompts/GROK_IMAGINE_DOG_COSTUME.md`
Execution instruction: `docs/prompts/GROK_CLI_DOG_COSTUME_RUN.md`

## Applied first frames

| Clip | First frame used for Imagine |
| --- | --- |
| wander | `assets/guest/red-room/lora/scenes/v08-dog-settled.webp` |
| coffee | `assets/guest/red-room/lora/scenes/concepts/costume/dog-suit-coffee-start-v2.png` |
| sleep | `assets/guest/red-room/lora/scenes/concepts/costume/dog-suit-sleep-start-v2.png` |

Copies live in `first-frames/`. Continuity refs copied for QA only: `v07-dog-blank.webp`, `v08-dog-stand.webp`, `v08-dog-aisle.webp`, `v11-dog-sleep.webp`.

Wander fallback stills `v08-dog-stand.webp` / `v08-dog-aisle.webp` were **not** uploaded as Imagine first frames.

## Imagine generation

| Clip | Tool | duration asked | resolution | Result raw |
| --- | --- | --- | --- | --- |
| wander | `image_to_video` | 10 s (nearest ≥ 8) | 480p | 10.041667 s, 736×400, 24 fps, h264+aac |
| coffee | `image_to_video` | 6 s | 480p | 6.041667 s, 736×400, 24 fps, h264+aac |
| sleep | `image_to_video` | 6 s (nearest ≥ 4) | 480p | 6.041667 s, 736×400, 24 fps, h264+aac |

Prompts were the three cards from `GROK_IMAGINE_DOG_COSTUME.md`, verbatim.

Failed attempts earlier in the same CLI session: 3× `image_to_video` HTTP 400 ZDR / missing `output.upload_url` (before Opt-in). Those calls produced no MP4. A later 480p probe (`probe-zdr-off-480p.mp4`) confirmed the path; it is **not** a delivery clip.

## Local ffmpeg (no generation cost)

- Raw preserved: `*.raw.mp4`
- Delivery: `-t` to 8.000 / 6.000 / 4.000, `-an`, drop attached mjpeg, libx264 crf 18, 24 fps
- Ratio candidates: crop 712×400 and pad 736×414, not replacements

## Applied prompt text

### 1. Wander

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

### 2. Coffee

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

### 3. Sleep

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
