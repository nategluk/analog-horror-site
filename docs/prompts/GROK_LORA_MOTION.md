# Красная Комната: motion plates for Grok Imagine web

Cursor Grok cannot call Imagine video. Generate clips manually in Imagine web, download mp4, overwrite the paths under `assets/guest/red-room/lora/scenes/`.

Method: first frame is a **neutral pose** still. Action lives only in the prompt. Do not upload mid-action stills (pre-inflated gum, Pig already walking the aisle, candy already held out). Imagine does not honor last frame; drift versus the still plate is dream logic, not a continuity fail.

Locked camera: bar-counter POV from `v01-empty-counter-v1.webp`. No readable text. Do not fight the model for pixel-identical architecture.

Pig arrival paste card: `docs/prompts/GROK_IMAGINE_PIG_ARRIVE.md`

## 1. `v01-empty-idle.mp4` — loop 6s

First/last: `assets/guest/red-room/lora/scenes/v01-empty-counter-v1.webp`

Empty crimson cafe. Espresso steam, globe lamps shimmer, far velvet curtain breathes. No people.

## 2. `v02-pig-masked-idle.mp4` — loop 6s

First/last: `v02-pig-masked.webp`

Standing pig mascot shifts weight, tag sways, glances at the ceiling camera and back. No walking.

## 3. `v02-pig-wander.mp4` — burst 6s

First/last: `v02-pig-masked.webp`  
Mid key: `v02-pig-wander.webp`

Pig turns to the left booths, takes a few steps, returns to the original standing mark.

## 4. `v02-pig-arrive.mp4` — transition 6–10s

First only: `v01-empty-counter-v1.webp` (empty hall). Skip last frame.
Do not upload `v02-pig-arrive-far.webp` or `v02-pig-arrive-mid.webp`.

Pig enters from the rear curtain and walks the aisle to the counter. Walk is prompt-only. Drift vs `v02-pig-masked.webp` is accepted.

## 5. `v02-pig-leave.mp4` — transition 6–10s

First only: `v02-pig-masked.webp`. Skip last frame.
Do not upload far/mid walking stills.

Pig turns and walks back toward the curtain until the hall is empty. Walk is prompt-only.

Pig turns and walks back toward the curtain until the hall is empty. Walk is prompt-only.

## 6. `v08-dog-wander.mp4` — burst 6–8s

First/last: `v08-dog-settled.webp`  
Through: `v08-dog-stand.webp`, `v08-dog-aisle.webp`

Dog stands, walks a few steps toward the curtain, sits back at the counter with the glass and broken microphone.
