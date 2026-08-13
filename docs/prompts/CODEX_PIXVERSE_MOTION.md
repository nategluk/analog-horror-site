# Codex task: generate missing Red Room motion videos via PixVerse

You are working in the static ARG repo `analog-horror-site`.
Use the PixVerse plugin / MCP you already have (subscription). Do **not** use Grok Imagine video, Seedance, or any new paid API.

Goal: replace the still-crossfade B-roll in the Lora night-shift minigame with real short footage, then wire the files into the existing engine.

Do not invent story, do not rewrite `content/lora/red-room-content.js`, do not change save keys, do not push.

---

## Why this exists

Grok Build cannot emit mp4 on this team (ZDR / missing `upload_url`). The game already has cinematic stills and a fallback still-sequence player in `js/lora-red-room.js` (`NODE_MOTIONS`). Players still see a lot of frozen staring. PixVerse is the cheap footage tool for this job: image-to-video and first/last-frame transitions, not social-story films.

Existing videos that must stay untouched:

- `assets/guest/red-room/lora/scenes/v03-pig-reveal.mp4`
- `assets/guest/red-room/lora/scenes/v05-fox-gaze-idle.mp4`
- `assets/guest/red-room/lora/scenes/v06-fox-action-idle.mp4`
- `assets/guest/red-room/lora/scenes/v11-dog-sleep-idle.mp4`

---

## Hard visual contract

Read before generating:

- `docs/LORA_VISUAL_STATE_MATRIX.md`
- `js/lora-red-room.js` (`VISUAL_ASSETS`, `NODE_MOTIONS`)
- stills in `assets/guest/red-room/lora/scenes/`

Rules:

1. Locked bar-counter POV. Same camera as `v01-empty-counter-v1.webp`. No new angle, no dolly, no handheld, no interrogation-window frame.
2. Same incarnation of the cafe for this minigame: espresso machine right, black rotary phone and blank note on the counter, red booths, globe lamps, far velvet curtain, tiny CCTV indicator on the ceiling.
3. No readable text, logos, captions, phone UI, nametags with letters, subtitles.
4. No blood, gore, mold, medical lamps, or the cafe attacking the player.
5. Night, warm, sparse, analog. Not festive, not social-media gloss.
6. Pig stays the dirty padded hoodie + heavy pig head from `v02-pig-masked.webp`. Do not unmask unless the source still is already `v04`.
7. Dog stays fully masked. Dog, not bear. Dark ordinary plastic eyes. Broken microphone stays the same prop.
8. One subject, one motion per clip. No cuts inside a clip.
9. Silent video (game has its own bed + sfx).
10. Last frame of a loop/burst must be usable as the existing still poster. Arrive last frame ≈ `v02-pig-masked.webp`. Leave last frame ≈ `v01-empty-counter-v1.webp`.

Prefer PixVerse **image-to-video** for idles and **first–last frame / transition** for arrive, leave, wander. 5s is enough; 8s only if first–last needs more travel. Quality **540p or 720p**, aspect **16:9**. Motion mode **normal**, not fast.

Download every result into the repo. Do not leave remote PixVerse URLs in the game.

---

## Deliver exactly these six files

All paths relative to repo root, next to the stills.

### 1. `assets/guest/red-room/lora/scenes/v01-empty-idle.mp4`

- Mode: image-to-video, intended as **loop**
- First/last: `assets/guest/red-room/lora/scenes/v01-empty-counter-v1.webp`
- Duration: 5s
- Prompt:

```text
Locked bar-counter POV. Empty crimson night cafe. Thin espresso steam rises from the machine on the right. Milk-glass globe lamps shimmer. The far velvet curtain breathes once. No people, no camera move, no text.
```

### 2. `assets/guest/red-room/lora/scenes/v02-pig-masked-idle.mp4`

- Mode: image-to-video, intended as **loop**
- First/last: `assets/guest/red-room/lora/scenes/v02-pig-masked.webp`
- Duration: 5s
- Prompt:

```text
Locked bar-counter POV. The dirty pig mascot stands in the aisle facing the counter. It shifts weight, the costume breathes, the blank chest tag sways, then the heavy head glances up at the ceiling camera and back. No walking, no camera move, no text.
```

### 3. `assets/guest/red-room/lora/scenes/v02-pig-wander.mp4`

- Mode: first–last if the plugin allows a mid key; otherwise I2V from first, aiming at last
- First/last: `v02-pig-masked.webp`
- Mid (optional upload): `v02-pig-wander.webp`
- Duration: 5s
- Prompt:

```text
Locked bar-counter POV. The standing pig mascot turns toward the left booths, takes a few heavy steps, almost touches a chair, then returns to the same mark facing the counter. Same costume and pig head. No camera move, no text.
```

### 4. `assets/guest/red-room/lora/scenes/v02-pig-arrive.mp4`

- Mode: first–last / transition
- First: `v01-empty-counter-v1.webp`
- Guides: `v02-pig-arrive-far.webp`, then `v02-pig-arrive-mid.webp`
- Last: `v02-pig-masked.webp`
- Duration: 5s (8s if the walk looks rushed)
- Prompt:

```text
Locked bar-counter POV. The empty crimson cafe. The same dirty pig mascot enters from the far velvet curtain and walks the center aisle toward the counter until it stands in the final mark facing the player. No camera move, no text, no extra people.
```

### 5. `assets/guest/red-room/lora/scenes/v02-pig-leave.mp4`

- Mode: first–last / transition
- First: `v02-pig-masked.webp`
- Guides: `v02-pig-arrive-mid.webp`, then `v02-pig-arrive-far.webp`
- Last: `v01-empty-counter-v1.webp`
- Duration: 5s (8s if needed)
- Prompt:

```text
Locked bar-counter POV. The dirty pig mascot turns away from the counter and walks down the aisle toward the far velvet curtain until the hall is empty again. Same costume. No camera move, no text.
```

### 6. `assets/guest/red-room/lora/scenes/v08-dog-wander.mp4`

- Mode: first–last with mids if possible
- First/last: `v08-dog-settled.webp`
- Mids: `v08-dog-stand.webp`, then `v08-dog-aisle.webp`
- Duration: 5–8s
- Prompt:

```text
Locked bar-counter POV. The worn gray dog mascot at the counter stands up, still holding the broken microphone, walks a few steps toward the far curtain, then returns and sits back at the counter beside the water glass. Mask stays on. Dark plastic eyes. No camera move, no text.
```

Do **not** generate Fox footage, reveal, or sleep — those already exist.
Do **not** generate unmasked-pig walking. After reveal the face is a still on purpose.
P2 only if the six files are done and credits remain: `v07-dog-blank` breathe loop, `v09-dog-curtain` sway loop. Same naming: `v07-dog-blank-idle.mp4`, `v09-dog-curtain-idle.mp4`.

---

## After files exist: wire the engine

Update `js/lora-red-room.js` only.

1. Add videos to `VISUAL_ASSETS`:

```js
V01_EMPTY_COUNTER: {
  image: ".../v01-empty-counter-v1.webp",
  video: ".../v01-empty-idle.mp4",
  playback: "loop",
},
V02_PIG_MASKED: {
  image: ".../v02-pig-masked.webp",
  video: ".../v02-pig-masked-idle.mp4",
  playback: "loop",
},
```

Keep V05/V06 as `playback: "loop"`. Do not change V03 reveal or V11 transition.

2. Prefer real video over still sequences when the mp4 exists. Suggested node mapping:

| Node | Video | Playback |
| --- | --- | --- |
| `pig_arrive` | `v02-pig-arrive.mp4` | transition, then settle on V02 |
| `pig_escapes` | `v02-pig-wander.mp4` | transition, restore V02 |
| `pig_talk` | `v02-pig-wander.mp4` | burst, only if visual is `V02_PIG_MASKED` |
| `pig_hide`, `pig_tech_run`, `pig_tomorrow`, `pig_deny_leave` | `v02-pig-leave.mp4` | transition, no restore; next node is empty. Skip `pig_hide` when visual is `V04_PIG_UNMASKED` |
| `dog_dreams` | `v08-dog-wander.mp4` | transition, restore V08 |

Reuse the existing `playTransitionSceneVideo` / `playLoopSceneVideo` / burst helpers. Do not break `prefers-reduced-motion` (stay on stills).

3. Keep `NODE_MOTIONS` stills as fallback if a video file is missing.

4. Add the six mp4 paths to `scripts/validate-lora-red-room.js` `requiredAssets`.

5. Do not reformat `call-content.js` or unrelated files.

---

## Checks

```sh
node --check js/lora-red-room.js
node scripts/validate-lora-red-room.js
node scripts/smoke-lora-red-room.js
git diff --check
```

Browser if you can: `locations/red-room-shift.html` with `sessionStorage.tyndex_lora_channel_v1 = {"assigned":true,"at":Date.now()}`. Confirm:

- empty hall loops
- pig walks in on `pig_arrive`
- pig wander on escapes
- fox still loops
- dog stand/walk/sit on dreams
- no console errors
- mobile ~390×844 does not overflow
- reduced motion stays on posters

Do not clear the user's localStorage except the Lora test key if a clean run is required: `tyndex_lora_red_room_v1`.

---

## Report back

For each of the six clips: path, duration, PixVerse mode used, and one defect if the last frame does not match the poster. Do not commit unless the user asks.
