# Grok Imagine web: Pig arrival

Cursor Grok cannot call Imagine video. Generate this clip in the Imagine web UI, download the mp4, drop it on the path below. Do not use PixVerse.

Engine already expects:

`assets/guest/red-room/lora/scenes/v02-pig-arrive.mp4`

`pig_arrive` starts on the empty hall. After the clip, `pig_enter` is the standing V02 still. Imagine ignores last-frame uploads; costume and booth layout may drift. That is Red Room dream logic, not a reject.

Current accepted file: the Imagine take already in `v02-pig-arrive.mp4` (empty hall, one Pig walks in, stops at the counter). Do not keep regenerating to match `v02-pig-masked.webp`.

---

## Method

Do **not** upload `v02-pig-arrive-far.webp` or `v02-pig-arrive-mid.webp`. Those are mid-walk stills. Imagine will morph.

**First / start image only:** `assets/guest/red-room/lora/scenes/v01-empty-counter-v1.webp`  
(empty cafe, no Pig). Do not spend a slot on last frame.

Duration: 6–10s if the slider allows. Silent. 16:9.

---

## Paste prompt

```text
Locked bar-counter POV, same camera as the start image. First frame is this empty crimson night cafe: no people, espresso machine on the right, black rotary phone and a blank note on the counter, red booths, milk-glass globe lamps, far velvet curtain. From that empty hall one dirty pig mascot enters from the far velvet curtain: heavy pig head, padded dirty hoodie, blank chest tag, no readable text. He walks the center aisle toward the counter and stops in a standing mark facing the camera. One pig only. No cut, no camera move, no morphing, no extra people, no subtitles, no logos. Photoreal analog night cafe, warm sparse lighting.
```

---

## Reject and rerun if

- Pig is already in the first frames
- two Pigs
- the body melts mid-walk
- he pops onto the counter without walking
- readable text on the tag

Do **not** reject because the hoodie, pig head, or booths disagree with `v02-pig-masked.webp`. Overwrite `v02-pig-arrive.mp4` only for a clearly better walk.
