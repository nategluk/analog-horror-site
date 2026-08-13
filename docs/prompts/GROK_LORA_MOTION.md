# Красная Комната: motion plates for Imagine / Seedance

Grok Build video tools on this team require `output.upload_url` (ZDR) and cannot emit mp4 here. Use these first/last frames in Seedance 2.5 or Imagine once video export works. Drop finished files next to the stills; the engine already looks for them later.

Locked camera: bar-counter POV from `v01-empty-counter-v1.webp`. No new architecture, no readable text, no camera move.

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

## 4. `v02-pig-arrive.mp4` — transition 6s

First: `v01-empty-counter-v1.webp`  
Through: `v02-pig-arrive-far.webp`, `v02-pig-arrive-mid.webp`  
Last: `v02-pig-masked.webp`

Pig enters from the rear curtain and walks the aisle to the counter.

## 5. `v02-pig-leave.mp4` — transition 6s

First: `v02-pig-masked.webp`  
Through: `v02-pig-arrive-mid.webp`, `v02-pig-arrive-far.webp`  
Last: `v01-empty-counter-v1.webp`

Pig turns and walks back toward the curtain until the hall is empty.

## 6. `v08-dog-wander.mp4` — burst 6–8s

First/last: `v08-dog-settled.webp`  
Through: `v08-dog-stand.webp`, `v08-dog-aisle.webp`

Dog stands, walks a few steps toward the curtain, sits back at the counter with the glass and broken microphone.
