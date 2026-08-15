# Release preflight — dog costume v2

Date: 2026-08-14  
Role: technical + visual audit before official launch. **Not published. Not integrated.**  
Verdict: **READY FOR INTEGRATION**

No commit, no push, no runtime/content/matrix edits, no change to `end_leave_sleep` copy, visual IDs, or save keys.

---

## Verdict in one line

Three silent 480p deliveries exist, action is readable, costume stays a person in a suit. Wire them in a later integration pass; do not treat 736×400 as 16:9 and do not auto-pick the raw 10 s wander.

---

## Files in this candidate

Included:

- `dog-suit-wander-v2.mp4` / `dog-suit-coffee-v2.mp4` / `dog-suit-sleep-v2.mp4`
- `raw/` — untouched Imagine downloads (audio + extra duration)
- `first-frames/` — applied stills + V07/V08/V11 continuity copies
- `contact-sheet.png`
- `ffprobe-report.json`
- `SOURCE_MANIFEST.md`
- `ratio-candidates/` — non-destructive crop/pad, **not** delivery
- `frames/` and `ratio-frames/` — QA extracts

Excluded (left in parent staging, not chosen as delivery):

| File | Why |
| --- | --- |
| `probe-zdr-off-480p.mp4` | ZDR-unblock probe, not a costume card |
| staging `frames/*.jpg` | superseded by RC extracts |
| `concepts/cgi/` and `GROK_IMAGINE_DOG_CGI.md` | rejected CGI package |
| live `v07`–`v11` and `v08-dog-wander.mp4` / `v11-dog-sleep-idle.mp4` | existing runtime/fallbacks; not overwritten |

---

## Technical metadata (delivery)

SAR/DAR tags are unset (`N/A`). Pixel ratio is authoritative.

| File | Duration | Frames | Size | fps | Codec | Audio | Pixel AR |
| --- | ---: | ---: | ---: | ---: | --- | --- | --- |
| wander | **8.000 s** | 192 | 736×400 | 24 | h264 High yuv420p | **none** | 1.84 |
| coffee | **6.000 s** | 144 | 736×400 | 24 | h264 High yuv420p | **none** | 1.84 |
| sleep | **4.000 s** | 96 | 736×400 | 24 | h264 High yuv420p | **none** | 1.84 |

Bitrate ~1.85–1.91 Mbps. Filesizes: wander 1.91 MB, coffee 1.39 MB, sleep 0.99 MB.

### Raw versus delivery

| Clip | Raw | Delivery work |
| --- | --- | --- |
| wander | 10.041667 s, 241 frames, h264+aac+mjpeg cover, 736×400 | trim 8.000 s, strip audio, drop cover |
| coffee | 6.041667 s, 145 frames, h264+aac+mjpeg | trim 6.000 s, silent |
| sleep | 6.041667 s, 145 frames, h264+aac+mjpeg | trim 4.000 s, silent |

Duration and silence match the expected delivery. Aspect does **not** match requested 16:9.

---

## 736×400 decision

`736/400 = 1.84`. `16/9 ≈ 1.778`. Native is **wider**, not square-pixel 16:9. Not stretched.

Non-destructive candidates (do not replace delivery):

| Variant | Geometry | Exact 16:9? | Composition |
| --- | --- | --- | --- |
| native | 736×400 | no | keeps phone, globe lamp, espresso, dog, closed curtain |
| crop | 712×400 (12 px each side) | almost (1.780 vs 1.778) | tightens lamp/phone/machine; violates “do not crop those for ratio” |
| pad | 736×414 (#140808 bars) | yes | no subject loss; letterbox |

Stage CSS is `object-fit: cover` on `.lora-room__media`. Pad bars would be cropped away on mobile and can flash as letterbox on a 16:9 desktop stage. Crop buys almost nothing and risks the counter props.

**Recommendation: keep native 736×400.** Do not silently scale to 1280×720.

---

## Visual QA

Costume family matches V07–V11: adult human volume, shaggy practical suit, rigid mask, dark eyes. Not a CGI animal. Curtain stays closed. No text, watermark, or extra character.

### Wander — PASS with documented trim

- First frame matches `v08-dog-settled.webp` (seated, one mic, water glass, closed curtain).
- Middle: stands and walks; human weight under the suit.
- Delivery last (7.96 s): back to camera, walking the aisle toward a **closed** curtain. Rise + walk read clearly.
- Raw last (10.0 s): performer has **turned in profile and looks at the curtain**.
- **8 s trim cuts the look-at-curtain beat.** Confirmed against raw. Do not auto-select the 10 s raw for runtime.
- Final frame is mid-walk, not a loop back to the seat.
- **Delivery choice: keep 8.000 s** (contract). Raw stays in `raw/` if integration later wants the look.

### Coffee — PASS with prop drift

- First frame matches `dog-suit-coffee-start-v2.png`.
- Middle: both costumed hands around **one grounded** cup; no lift, no drink, no second cup.
- Last: hands relax, cup remains. Microphone stays one object but **morphs** from handheld to a stand on the counter.
- Restore still `v08-dog-settled.webp` has a water glass, not this cup — dream-logic drift, not a regen blocker.

### Sleep — PASS

- First frame matches `dog-suit-sleep-start-v2.png` (awake, arms on counter, one mic, one cup).
- Middle (2 s): head already lowering.
- Last (3.96 s): head on crossed forearms. The 4 s trim **does** contain the fall-asleep.
- Not a loop: starts awake, ends asleep.
- Existing `v11-dog-sleep.webp` is a different sleep still (water glass, broken mic). Keep it as poster until a replacement is requested. Do not pretend the new last frame is that poster.

---

## Runtime readiness (map only — files not edited)

Current engine: `js/lora-red-room.js`. Content: `content/lora/red-room-content.js`. Checks: `scripts/validate-lora-red-room.js`, `scripts/smoke-lora-red-room.js`. Save key remains `tyndex_lora_red_room_v1`.

### `dog_dreams` → wander

- Node visual is already `V08_DOG_SETTLED` (`expectedVisual` matches).
- Motion today: `NODE_MOTIONS.dog_dreams` = `transition`, `video: v08-dog-wander.mp4`, frames `v08-dog-stand.webp`, `v08-dog-aisle.webp`, `holdMs: 900`.
- `dog_dreams` has **choices**, not `autoNext`. `playNodeMotionVideo` for `mode: "transition"` runs only inside `if (node.autoNext)`. So the current wander file is **not played** on this choice node.
- Integration must either switch this slot to `burst` + `delayMs` (like fox bursts) or extend the engine. Do not drop `holdMs: 900` still fallback.
- `requiredAssets` already lists `v08-dog-wander.mp4` and the two stills. Replacing the filename is an integration edit, not done here.

### `dog_coffee` → coffee (new slot)

- Node exists: visual `V08_DOG_SETTLED`, `autoNext: dog_settled`, `delay: 500`, `sound: "cup"`.
- **No `NODE_MOTIONS.dog_coffee` today.**
- If added as `transition`, `video.ended` **replaces** `node.delay` / `armAutoAdvance`. A 6 s clip would hold the node until end, then restore V08 still. That matches the costume card (“coordinate delay with `video.ended`”).
- If added as `burst`, `delayMs` then play then `goTo` — do not stack 500 ms + 6 s by accident.
- Reduced-motion fallback: stay on `v08-dog-settled.webp` (or the coffee start still). Do not use `dog-suit-coffee-action-v2.png` as first frame.

### `V11_DOG_SLEEP` → sleep

- `end_leave` / `end_leave_sleep` already map to `V11_DOG_SLEEP` (smoke + expectedVisual).
- Asset today: poster `v11-dog-sleep.webp`, `openWith: v09-dog-curtain.webp`, video `v11-dog-sleep-idle.mp4`, `playback: "transition"`.
- `playTransitionSceneVideo` runs on first V11 visit, then sets `dogSleepPlayed`. `end_leave` is `autoNext` (delay 700) — if the video plays, **advance waits on `video.ended`**, not on 700 ms.
- New 4 s clip can replace `v11-dog-sleep-idle.mp4` later. `openWith` must **not** stay `v09-dog-curtain.webp` if the new first frame is the seated sleep-start still.
- Keep `v11-dog-sleep.webp` as poster until an explicit replacement. Do not change `end_leave_sleep` copy.

### requiredAssets / expectedVisual

- Visual IDs are already correct. No ID change needed.
- After integration, add or retarget MP4 paths in `requiredAssets`. New coffee file is not listed yet. Sleep/wander currently point at the old runtime files.

---

## Blockers before integration

None that stop **starting** integration. Must not skip:

1. `dog_dreams` is a choice node — `transition` will not play until the slot or engine is adjusted.
2. `dog_coffee` has no motion slot yet.
3. V11 `openWith` / poster vs new sleep first/last frame must be decided before swap.
4. Do not overwrite V07–V11 stills or existing fallbacks in the same commit as a blind rename.
5. Do not stretch 736×400 to fake 16:9.

Non-blocking: wander look beat lives only in raw 10 s; coffee mic melts to a stand; V08 restore still has water, coffee clip has a cup.

---

## Usage (three counters, do not mix)

| Counter | Value |
| --- | --- |
| Grok CLI model context (this session `signals.json`) | `contextTokensUsed` **92809** / window 500000 (18%). No before/after billing meter. |
| Provider Imagine video | 3 successful 480p gens (10+6+6 s) + 1 probe 6 s after ZDR lift. 3 earlier HTTP 400 produced no file. **No $ / credit line exposed.** |
| Local ffmpeg | trim, mute, crop/pad candidates, frames, contact sheet. **$0.** |

---

## Conclusion

**READY FOR INTEGRATION**

Launch is **not** complete. Next step is a separate, explicit integration pass.
