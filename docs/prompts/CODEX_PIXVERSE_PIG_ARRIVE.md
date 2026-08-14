# Codex task: Pig arrival via PixVerse / Pixieverse

You are working in the static ARG repo `analog-horror-site`.
Use the PixVerse / Pixieverse plugin you already have (subscription). Do **not** use Grok Imagine video, Seedance, or any new paid API.

Do not invent story. Do not rewrite `content/lora/red-room-content.js`. Do not change save keys. Do not push. Do not commit unless the user asks.

This task is **only** the Pig walking into the cafe (`pig_arrive` → `v02-pig-arrive.mp4`). Do not regenerate Fox gum/candy/smoke, reveal, Dog, or idles here.

---

## Hard method

Video models degenerate when a **mid-action still** is used as a first frame or extra keyframe.

Do **not** feed these as generation inputs:

- `assets/guest/red-room/lora/scenes/v02-pig-arrive-far.webp` (Pig already walking the aisle)
- `assets/guest/red-room/lora/scenes/v02-pig-arrive-mid.webp` (Pig already closer)

A four-image PixVerse transition that included those stills already failed (`param_invalid`). They are the same class of defect as the pre-inflated gum bubble.

**Always:**

1. First frame = **neutral empty cafe** `v01-empty-counter-v1.webp`.
2. Last frame = **neutral standing Pig** `v02-pig-masked.webp` (destination pose at the counter, not a walking pose).
3. The walk lives **only in the video prompt**.
4. One subject, one action, no cuts, no camera move.
5. Silent, 16:9, 720p, 5–8s, motion **normal**.

If the plugin is image-to-video with a single image, upload **only** the empty cafe and describe the Pig entering. Prefer first–last (empty → standing) when the plugin allows exactly two images.

---

## Why this exists

`pig_arrive` now starts on `V01_EMPTY_COUNTER`. The player reads «Дверь дёргается…» on the empty hall, then the clip must carry the dirty pig mascot from the far velvet curtain down the aisle to the counter. Then `pig_enter` shows `V02_PIG_MASKED` and he asks «Где официантка?»

The engine already points at `v02-pig-arrive.mp4` with `openWith: v01-empty-counter-v1.webp` and `restore: false`. Replace that mp4 if the current walk morphs, pops a second Pig, or starts with him already in the aisle.

Pig identity is the dirty padded hoodie + heavy pig head from `v02-pig-masked.webp`. Do not unmask. Do not swap to a tracksuit-only look if it fights the standing still. Blank chest tag, no readable letters.

---

## Hard visual contract

Read:

- `docs/LORA_VISUAL_STATE_MATRIX.md`
- `js/lora-red-room.js` (`NODE_MOTIONS.pig_arrive`)
- `assets/guest/red-room/lora/scenes/v01-empty-counter-v1.webp`
- `assets/guest/red-room/lora/scenes/v02-pig-masked.webp`

Rules:

1. Locked bar-counter POV. Same camera as `v01-empty-counter-v1.webp`.
2. Same cafe: espresso machine right, black rotary phone, blank note, red booths, globe lamps, far velvet curtain, tiny CCTV indicator.
3. No readable text, logos, captions, nametags with letters, subtitles.
4. No blood, gore, mold, medical lamps, extra people.
5. Night, warm, sparse, analog.
6. Download the file into the repo. No remote PixVerse URLs in the game.

---

## Deliver

### `assets/guest/red-room/lora/scenes/v02-pig-arrive.mp4`

Overwrite the existing file.

- Mode: transition / first–last if the plugin accepts **exactly two** images. Otherwise I2V from the first image only.
- **First:** `assets/guest/red-room/lora/scenes/v01-empty-counter-v1.webp`
- **Last:** `assets/guest/red-room/lora/scenes/v02-pig-masked.webp`
- Do not attach far/mid stills.
- Duration: 5s; 8s only if the walk is rushed.
- Prompt:

```text
Locked bar-counter POV. First frame is the exact supplied empty crimson night cafe: no people, espresso machine on the right, black rotary phone and a blank note on the counter, red booths, globe lamps, far velvet curtain. From that empty hall the same dirty pig mascot (heavy pig head, padded hoodie, blank chest tag) enters from the far velvet curtain and walks the center aisle toward the counter until it stands in the final mark facing the player, matching the last-frame still. One pig only. No cut, no camera move, no morphing, no extra people, no text.
```

Reject and rerun if:

- the first frames already contain the Pig
- two Pigs appear
- the body melts between empty hall and costume
- he appears at the counter without walking
- last frame does not read as `v02-pig-masked.webp`

---

## Engine

`js/lora-red-room.js` `NODE_MOTIONS.pig_arrive` should already be:

```js
pig_arrive: {
  mode: "transition",
  video: "v02-pig-arrive.mp4",
  openWith: "v01-empty-counter-v1.webp",
  frames: ["v01-empty-counter-v1.webp"],
  holdMs: 900,
  restore: false,
},
```

Do not point `openWith` or `frames` at `v02-pig-arrive-far.webp` / `v02-pig-arrive-mid.webp`. Reduced-motion fallback is empty hall, then the V02 still on `pig_enter`.

You do not need to change `content/lora/red-room-content.js` (`pig_arrive` visual is already `V01_EMPTY_COUNTER`).

Leave/wander clips are out of scope unless credits remain and arrival is accepted. If you do leave: first `v02-pig-masked.webp`, last `v01-empty-counter-v1.webp`, walk described in the prompt, no far/mid keyframes. Also wire `pig_key_given` to the same leave clip as `pig_tomorrow`.

---

## Checks

```sh
node --check js/lora-red-room.js
node scripts/validate-lora-red-room.js
node scripts/smoke-lora-red-room.js
git diff --check
```

Browser: `locations/red-room-shift.html` with

`sessionStorage.tyndex_lora_channel_v1 = {"assigned":true,"at":Date.now()}`

Confirm:

- note/wait leads to an **empty** hall while the door line types
- then one Pig walks in from the curtain
- next line is «Где официантка?» on the standing V02 idle
- no flash of the far/mid walking stills
- mobile ~390×844 does not overflow
- reduced motion stays on empty, then standing Pig
- no console errors

Do not clear the user's localStorage except `tyndex_lora_red_room_v1` if a clean run is required.

---

## Report back

Path, PixVerse mode, first-frame file, last-frame file, and whether any opening frame already contains the Pig (if yes, reject). Do not commit unless the user asks.
