# Codex task: Fox burst clips via PixVerse / Pixieverse

You are working in the static ARG repo `analog-horror-site`.
Use the PixVerse / Pixieverse plugin you already have (subscription). Do **not** use Grok Imagine video, Seedance, or any new paid API.

Do not invent story. Do not rewrite `content/lora/red-room-content.js` except if a filename in `NODE_MOTIONS` must change after the new files exist. Do not change save keys. Do not push. Do not commit unless the user asks.

---

## Hard method (read this before any generate)

Video models degenerate when the **first frame already contains the finished action**. A still of Fox with a blown gum bubble, a lit cigarette, or an outstretched candy is a last frame, not a first frame. The model then morphs, doubles the prop, or pops in and out of identity.

**Always:**

1. First frame = the character’s **neutral pose still** for that visual state.
2. The action lives **only in the video prompt**.
3. Last frame should return close to that same neutral pose so the clip can burst over the looping idle and restore cohesively.
4. One subject, one action, no cuts, no camera move.
5. Do **not** generate a mid-action still and then animate it.
6. Do **not** use `v14-fox-gum-bubble.png` as an input. Delete it. It is the broken method.

Neutral plates already in the game (use these, do not make new identity stills):

| Visual | Neutral still | Who |
| --- | --- | --- |
| `V05_FOX_GAZE` | `assets/guest/red-room/lora/scenes/v05-fox-gaze.webp` | Fox seated, phone up, not smoking, no gum bubble |
| `V06_FOX_ACTION` | `assets/guest/red-room/lora/scenes/v06-fox-action.webp` | Fox seated, phone/glove business, no bubble, no candy in the air |

If a plugin asks for first + last frame, set **both** to the same neutral still. Let the prompt carry the in-between action.

---

## Why this exists

Fox is a modern ADHD fixer: always on the phone, chews gum, offers candy, lights a cigarette without waiting. Those beats play **on top of dialogue**, as short bursts, then return to the V05/V06 idle loop. They must look like one continuous person, not a jump into a different generated photo.

The current gum clip starts from an already-inflated pink bubble (`v14-fox-gum-bubble.png`). That still must go. Regenerate from `v06-fox-action.webp`.

---

## Hard visual contract

Read:

- `docs/LORA_VISUAL_STATE_MATRIX.md`
- `js/lora-red-room.js` (`VISUAL_ASSETS`, `NODE_MOTIONS`)
- stills in `assets/guest/red-room/lora/scenes/`

Rules:

1. Locked bar-counter POV. Same camera as `v01-empty-counter-v1.webp`. No new angle, no dolly, no handheld, no interrogation window.
2. Same cafe incarnation: espresso machine right, black rotary phone and blank note on the counter, red booths, globe lamps, far velvet curtain, tiny CCTV indicator.
3. Fox identity locked: black knitted fox balaclava, pointed red ears, deep red faux-fur coat, black gloves. Eyes visible. Do not unmask. Do not change the ears.
4. No readable text, logos, captions, phone UI, subtitles, watermarks.
5. No blood, gore, mold, medical lamps, extra fingers, extra limbs, face melt.
6. Night, warm, sparse, analog. Not festive, not social-media gloss, not a cute cartoon gag.
7. Silent video. 5s preferred (8s only if the action is rushed at 5s). 16:9, 540p or 720p, motion **normal**.
8. Download every result into the repo. No remote PixVerse URLs in the game.

Do **not** retouch Pig, Dog, reveal, sleep, or cafe idles in this task.

---

## P0 — delete the inflated-gum segment and regenerate

Delete these files if they exist:

- `assets/guest/red-room/lora/scenes/v14-fox-gum-bubble.png`
- `assets/guest/red-room/lora/scenes/v14-fox-gum-pop-v1.mp4`
- `projects/lora-red-room-motion/assets/images/v14-fox-gum-bubble.png`

Do not keep a copy “as fallback”. The inflated bubble still is the defect.

### New file: `assets/guest/red-room/lora/scenes/v14-fox-gum-pop-v1.mp4`

- Mode: image-to-video
- **First frame (upload):** `assets/guest/red-room/lora/scenes/v06-fox-action.webp`
- Last frame: same still, or omit if the plugin is I2V-only
- Duration: 5s
- Node: `fox_why` burst, then restore `V06_FOX_ACTION`
- Prompt:

```text
Locked bar-counter POV. First frame is the exact supplied still: the woman in the black knitted fox balaclava and red faux-fur coat sits at the crimson cafe counter in her neutral pose, no gum bubble, mouth closed. She holds that pose for a beat, then slowly blows one translucent pink chewing-gum bubble. The bubble grows, pops near her mouth, she wipes a gloved finger across her lips, and returns to the same neutral seated pose. Same wardrobe, same eyes, same cafe, same camera. No cut, no zoom, no morphing, no extra people, no phone UI, no text.
```

Fallback still after this ships: `v06-fox-action.webp` (neutral). Never a bubble still.

---

## P1 — candy burst, same method

`v15-fox-candy-offer.png` is also a finished gesture (hand already holding candy out). Do not use it as a first frame. You may delete it after the new mp4 exists, or stop referencing it in `NODE_MOTIONS`.

### New/replaced file: `assets/guest/red-room/lora/scenes/v15-fox-candy-offer-v1.mp4`

- Mode: image-to-video
- **First frame:** `assets/guest/red-room/lora/scenes/v06-fox-action.webp`
- Duration: 5s
- Node: `fox_monopoly` burst, restore V06
- Prompt:

```text
Locked bar-counter POV. First frame is the exact supplied still: Fox in the black knitted fox balaclava and red faux-fur coat sits in her neutral pose at the crimson counter. From that pose she puts a small worn black bag on the counter, takes one wrapped hard candy, holds it toward the player for a moment, then lowers her hand and returns to the same neutral seated pose. Same identity, same cafe, same camera. No cut, no zoom, no morphing, no readable wrapper text, no extra people.
```

---

## P1 — cigarette burst (new)

There is no smoking clip yet. Dialogue on `fox_camera` already says she lights up without waiting. Do **not** generate a still of her already smoking.

### New file: `assets/guest/red-room/lora/scenes/v16-fox-cigarette.mp4`

- Mode: image-to-video
- **First frame:** `assets/guest/red-room/lora/scenes/v05-fox-gaze.webp` (neutral V05: phone already up, not smoking)
- Duration: 5s
- Node: `fox_camera` burst (`requireVisual: "V05_FOX_GAZE"`), restore V05
- Prompt:

```text
Locked bar-counter POV. First frame is the exact supplied still: Fox in the black knitted fox balaclava and red faux-fur coat sits at the crimson counter in her neutral pose, phone raised, no cigarette. She keeps filming, flicks a lighter with one gloved hand, lights a cigarette without looking at the player, takes one small drag, then the smoke thins and she settles back toward the same seated pose with the phone still up. ADHD, casual, not ceremonial. Same identity, same cafe, same camera. No cut, no zoom, no morphing, no huge smoke cloud, no readable phone screen, no text.
```

Optional still-fallback: do not invent a smoking poster. If a fallback frame is required, reuse `v05-fox-gaze.webp`.

Wire in `js/lora-red-room.js` `NODE_MOTIONS`:

```js
fox_camera: {
  mode: "burst",
  video: "v16-fox-cigarette.mp4",
  frames: ["v05-fox-gaze.webp"],
  requireVisual: "V05_FOX_GAZE",
  delayMs: 900,
  holdMs: 1800,
},
```

Keep the existing gum/candy burst delay pattern so the clip plays over the spoken line, not as an extra click.

---

## Engine wiring after files exist

Update `js/lora-red-room.js` `NODE_MOTIONS` only as needed:

- `fox_why`: video `v14-fox-gum-pop-v1.mp4`, `frames: ["v06-fox-action.webp"]` (or omit frames)
- `fox_monopoly`: video `v15-fox-candy-offer-v1.mp4`, `frames: ["v06-fox-action.webp"]`
- `fox_camera`: video `v16-fox-cigarette.mp4` as above

Update `scripts/validate-lora-red-room.js` `requiredAssets`:

- remove `v14-fox-gum-bubble.png`
- remove `v15-fox-candy-offer.png` if deleted
- add `v16-fox-cigarette.mp4`
- keep the mp4 paths that still exist

If `docs/LORA_VISUAL_STATE_MATRIX.md` extra-footage paragraph still describes a pre-inflated gum still, update that sentence to: bursts start from V05/V06 neutral plates; action is prompt-only.

Do not reformat `call-content.js` or unrelated files.

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

Reach Fox. Confirm:

- gum starts with no bubble, bubble appears, pops, returns to V06 idle
- candy starts from neutral V06, offer happens in motion, returns to idle
- on `fox_camera`, she lights a cigarette from V05, then V05 idle continues
- no identity snap, no second Fox, no frozen mid-bubble still
- mobile ~390×844 does not overflow
- `prefers-reduced-motion` stays on the **neutral** posters, not a bubble/candy/smoke freeze-frame
- no console errors

Do not clear the user's localStorage except the Lora test key if a clean run is required: `tyndex_lora_red_room_v1`.

---

## Report back

For each clip: path, PixVerse mode, first-frame file used, and whether the opening frame still contains the finished action (if yes, reject and rerun). Do not commit unless the user asks.
