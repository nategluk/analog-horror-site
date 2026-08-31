# Ready audio asset catalog

This file lists browser-ready audio that may be reused by future games. A file
enters this catalog only after semantic acceptance and technical mastering.
Generated sources, rejected candidates and work files stay under `projects/`
and are not ready assets.

All paths are repository-relative. Runtime volume remains scene-specific; the
catalog level is a safe master, not a required playback setting.

## Solnyshko after-hours carnival bed — accepted 2026-08-31

Provider: ElevenLabs Music v2 through the official MCP on an active commercial
Starter plan. Source prompt, raw file, account usage and QA are recorded in
`projects/solnyshko-after-hours/audio/source-elevenlabs/carnival-bed/README.md`.

| Stable ID | Ready file | Role | Playback | Duration | Reuse guidance |
| --- | --- | --- | ---: | --- | --- |
| `solnyshko.music.carnival-horror` | `assets/audio/guest/solnyshko/music-carnival-horror-loop.mp3` | faded horror-carnival park bed | loop | 28.032s | after-hours «Солнышко»: gate, grounds, empty carousel and cotton stand; do not use as cheerful daytime park music or as a jump-scare sting |

Master uses a two-second end-to-start crossfade and approximately `-28` dBFS
mean program level.

## Solnyshko after-hours SFX batch 1 — accepted 2026-08-31

Provider: ElevenLabs Sound Effects through the official MCP. Sources, prompts
and QA are in
`projects/solnyshko-after-hours/audio/source-elevenlabs/sfx-batch-1/README.md`.
Peaks mastered below `-6` dBFS.

| Stable ID | Ready file | Role | Playback | Duration | Reuse guidance |
| --- | --- | --- | ---: | --- | --- |
| `solnyshko.sfx.gate-chain` | `assets/audio/guest/solnyshko/sfx-gate-chain.mp3` | chain and padlock rattle on a closed park gate | one-shot | 2.795s | closed-gate refusal; not a substitute for opening, finger-taps or a door |
| `solnyshko.sfx.gate-open` | `assets/audio/guest/solnyshko/sfx-gate-open.mp3` | rusty hinge and inward swing of a heavy park gate | one-shot | 3.422s | first after-hours entry only; do not replay after `enterPlayed` |
| `solnyshko.sfx.carousel-mechanism` | `assets/audio/guest/solnyshko/sfx-carousel-mechanism.mp3` | empty carousel gearbox and half-turn | one-shot | 4.519s | empty night carousel; no calliope and not a child-voice substitute |
| `solnyshko.sfx.cotton-spinner` | `assets/audio/guest/solnyshko/sfx-cotton-spinner.mp3` | cotton-candy spinner bowl and sugar | one-shot | 3.239s | Irina prize stall; not a kitchen or espresso machine |
| `solnyshko.sfx.lock-finger-taps` | `assets/audio/guest/solnyshko/sfx-lock-finger-taps.mp3` | exactly two fingertip ticks on a padlock | one-shot | 0.862s | «постучал пальцем по замку»; do not use as chain, knock-three or gate open |

Paper inspect reuses `shared.paper.unfold`. Distant child laugh remains available
and unwired so it does not stack with the carousel mechanism.

## Pavel batch 1 — accepted 2026-08-30

Provider: ElevenLabs Music v2 / Sound Effects through the official MCP on an
active commercial Starter plan. Source prompts, raw files, account usage and QA
are recorded in
`projects/pavel-observation-booth/audio/source-elevenlabs/batch-1/README.md`.

| Stable ID | Ready file | Role | Playback | Duration | Reuse guidance |
| --- | --- | --- | --- | ---: | --- |
| `pavel.music.tour-calm` | `assets/audio/guest/pavel/music-tour-calm-loop.mp3` | calm faded institutional tour music | loop | 28.029s | guided tours, visitor tapes and deceptively safe institutional passages; do not use as generic cheerful music |
| `pavel.music.drain-anxiety` | `assets/audio/guest/pavel/music-drain-anxiety-loop.mp3` | low industrial bathroom/drain anxiety bed | loop | 28.029s | pipes, filtration, basements and sewer-adjacent rooms; keep quiet and avoid stacking with another score |
| `shared.pipe.wet-gurgle` | `assets/audio/guest/pavel/sfx-drain-wet-gurgle.mp3` | short confined wet plumbing movement | one-shot | 3.030s | ordinary or ambiguous old plumbing; not a creature voice and not flowing tap water |
| `shared.drain.cleaner-pour` | `assets/audio/guest/pavel/sfx-cleaner-pour-drain.mp3` | liquid poured through a metal grate with restrained reaction | one-shot | 4.049s | drain treatment and cleaning-liquid scenes; preserve the fiction-only context and do not label it as safe real-world chemical practice |
| `shared.water.enclosed-slide` | `assets/audio/guest/pavel/sfx-water-slide-enclosed.mp3` | water rushing through an enclosed old slide | one-shot | 5.042s | enclosed slides, service tubes or close hollow water flow; no implied body impact or scream |
| `shared.door.three-knocks` | `assets/audio/guest/pavel/sfx-three-knocks-service-door.mp3` | exactly three spaced knuckle impacts on a closed metal service door | one-shot | 2.638s | use only for the authored three-knock signal; do not substitute it for opening, latch, chain or hatch movement |

Both music masters use a two-second end-to-start crossfade and approximately
`-28` dBFS mean program level. SFX masters target a restrained browser cue
level with peaks below `-6` dBFS after encoding.

## Pavel reactions — accepted 2026-08-30

Provider: ElevenLabs TTS `eleven_v3`, voice `Russian True Crime`
(`wHITr9DIwXcV7yzFV816`). Retry 1 phonetic source and rejected cuts stay under
`projects/pavel-observation-booth/audio/`. Cues 01, 06, 07 and 08 were rejected
and must not be cataloged or wired.

| Stable ID | Ready file | Role | Playback | Duration | Reuse guidance |
| --- | --- | --- | --- | ---: | --- |
| `pavel.voice.hm-question` | `assets/audio/guest/pavel/sfx-pavel-hm-question.mp3` | short questioning «Хм?» | one-shot | 0.392s | Pavel only; «Кто просил?»; not a creature or POV voice |
| `pavel.voice.mm` | `assets/audio/guest/pavel/sfx-pavel-mm.mp3` | approving «М-м» | one-shot | 0.679s | Pavel only; shift-handover beat |
| `pavel.voice.tired-exhale` | `assets/audio/guest/pavel/sfx-pavel-tired-exhale.mp3` | tired «Ф-фух...» | one-shot | 0.679s | Pavel only; medicine / медкорпус beat |
| `pavel.voice.hmm` | `assets/audio/guest/pavel/sfx-pavel-hmm.mp3` | drawn «Хм-м...» | one-shot | 0.522s | Pavel only; «Гарри Поттер» beat; not a stand-in for the rejected chuckle |

## Drain gibberish — accepted 2026-08-30

Twelve creature-voice cues cut from the accepted ElevenLabs web sources in
`projects/pavel-observation-booth/audio/source-elevenlabs/drain-gibberish-web/`.
The node map is locked in
`projects/pavel-observation-booth/audio/review/drain-gibberish-v1/README.md`.
`00-review-reel.mp3` must never be copied into runtime. Visible Russian text
and speaker «ГОЛОС ИЗ СЛИВА» remain the source of meaning.

| Stable ID | Ready file | Role | Playback | Duration | Reuse guidance |
| --- | --- | --- | --- | ---: | --- |
| `drain.voice.damp` | `assets/audio/guest/pavel/sfx-drain-voice-damp.mp3` | visit-1 presence | one-shot | 0.888s | `drain-damp` only; not a plumbing Foley substitute |
| `drain.voice.neighbors` | `assets/audio/guest/pavel/sfx-drain-voice-neighbors.mp3` | visit-2 joke | one-shot | 2.142s | `drain-cough-neighbors` |
| `drain.voice.hair` | `assets/audio/guest/pavel/sfx-drain-voice-hair.mp3` | visit-2 hair | one-shot | 2.116s | `drain-cough-hair` |
| `drain.voice.hairy-friend` | `assets/audio/guest/pavel/sfx-drain-voice-hairy-friend.mp3` | visit-2 invitation | one-shot | 2.299s | `drain-cough-bald` |
| `drain.voice.lucky` | `assets/audio/guest/pavel/sfx-drain-voice-lucky.mp3` | visit-2 password | one-shot | 0.575s | `drain-password` |
| `drain.voice.shift` | `assets/audio/guest/pavel/sfx-drain-voice-shift.mp3` | visit-3 shift rule | one-shot | 2.377s | `drain-shift-wait` |
| `drain.voice.slide` | `assets/audio/guest/pavel/sfx-drain-voice-slide.mp3` | visit-3 slide dare | one-shot | 2.429s | `drain-slide-wait` |
| `drain.voice.thirst` | `assets/audio/guest/pavel/sfx-drain-voice-thirst.mp3` | visit-3 КРОТ ask | one-shot | 2.247s | `drain-thirst` |
| `drain.voice.cleaner-request` | `assets/audio/guest/pavel/sfx-drain-voice-cleaner-request.mp3` | visit-3 bottle | one-shot | 1.411s | `drain-thirst-ask` |
| `drain.voice.cleaner-delight` | `assets/audio/guest/pavel/sfx-drain-voice-cleaner-delight.mp3` | pour thanks | one-shot | 1.620s | `drain-pour-thanks` |
| `drain.voice.thanks-zone` | `assets/audio/guest/pavel/sfx-drain-voice-thanks-zone.mp3` | filtration thanks | one-shot | 3.161s | `drain-pour-cat` |
| `drain.voice.aromatization` | `assets/audio/guest/pavel/sfx-drain-voice-aromatization.mp3` | mask warning | one-shot | 2.717s | `hatch-mask-aroma` |

## Pavel user-supplied voice cue — accepted 2026-08-31

Source: user-supplied MP3. The visible Russian line remains the source of
meaning; this optional cue supplies the glitched unknown voice at the dessert
tray.

| Stable ID | Ready file | Role | Playback | Duration | Reuse guidance |
| --- | --- | --- | --- | ---: | --- |
| `pavel.voice.conductor-dessert` | `assets/audio/guest/pavel/sfx-hatch-dessert-voice.mp3` | glitched unknown voice for «Проводница уже знает, что ты здесь.» | one-shot | 3.291s | `hatch-dessert-voice` only; do not use as a generic voice or ambience |

## Existing approved reuse pool

These files predate this catalog but were audited for Pavel batch 1. Reuse the
canonical files; do not generate substitutes for the same physical event
unless audition proves a semantic mismatch.

| Stable role | Canonical file | Notes |
| --- | --- | --- |
| neutral empty-room bed | `assets/audio/guest/red-room/shift/bed-empty.mp3` | 60.024s loop; suitable for low fluorescent/room tone after audition in the target mix |
| ordinary door movement | `assets/audio/guest/red-room/shift/sfx-door.mp3` | proven Red Room one-shot; not a knock or chain substitute |
| metal cabinet/latch | `assets/audio/guest/red-room/shift/sfx-key-cabinet.mp3` | candidate for tray hatch or service latch |
| small metal/key movement | `assets/audio/guest/red-room/shift/sfx-key-ring.mp3` | candidate for chain or keys; do not use as a door impact |
| paper unfold | `assets/audio/guest/red-room/shift/sfx-paper-unfold.mp3` | use when the paper is physically handled |
| unseen phone buzz | `assets/audio/guest/red-room/shift/sfx-phone-buzz.mp3` | short vibration cue |
| CCTV channel static | `assets/audio/staff/cctv/channel-static.mp3` | channel acknowledgement one-shot |
| tactile control click | `assets/audio/staff/cctv/remote-button-click.mp3` | physical button cue |
| distant child laugh | `assets/audio/curator/sfx/child-laugh-distant.mp3` | same performance family as close/archive variants |
| close child laugh | `assets/audio/curator/sfx/child-laugh-close.mp3` | use only when the same implied child is perceptually nearer |

`assets/audio/guest/red-room/espresso-water.mp3` is not approved as a generic
drain sound: its coffee-machine origin remains semantically audible.
