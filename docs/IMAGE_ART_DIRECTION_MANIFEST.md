# Image Art Direction Manifest

Снимок: 2026-09-06
Scope: `/Users/nateglukhov/analog-horror-site/assets/guest` и
`/Users/nateglukhov/analog-horror-site/assets/staff`.

Это read-only production inventory: одна строка на исходный image asset.
`Public = yes` означает, что соответствующая копия присутствует в
`public/` на момент снимка; `no` означает source-only/concept/staging и не
является указанием на удаление. Категории и подтипы предварительные до
утверждения спорных строк.

## Snapshot

| Class | Total | Public | Source-only |
|---|---:|---:|---:|
| `ADVERTISEMENT` | 28 | 27 | 1 |
| `PERSONNEL` | 18 | 18 | 0 |
| `CCTV` | 15 | 15 | 0 |
| `PERSONAL` | 18 | 18 | 0 |
| `EVENT-RECORD` | 74 | 73 | 1 |
| `SCHEMA` | 25 | 25 | 0 |
| `UTILITY` | 12 | 12 | 0 |
| `IMMERSIVE-SCENE` | 170 | 86 | 84 |

Всего: **360** source assets; public copies: **274**;
source-only: **86**.
`projects/` (110 файлов) намеренно не включён: это отдельный staging/reference
слой. Геометрия считается по исходным размерам: wide ≈ 1.6–1.9, square ≈ 0.9–1.1,
portrait — высота заметно больше ширины.

## Route / carrier map

```text
GUEST-FACADE
 ├─ public ads, locations, recruitment     → ADVERTISEMENT
 ├─ public staff cards                     → PERSONNEL
 └─ backgrounds, logo                     → UTILITY

BROADCAST-ZHIR-TV
 ├─ personnel records / internal cards     → PERSONNEL
 ├─ broll and CCTV posters                 → CCTV
 ├─ staff classes                          → SCHEMA
 └─ TV posters / location stills           → EVENT-RECORD

PAPER-FILE / PHOTO-EVIDENCE
 └─ dossier images                         → mixed PERSONAL / EVENT-RECORD /
                                               CCTV / PERSONNEL / SCHEMA

LIVE-CURATION
 ├─ actions, states, interruptions         → EVENT-RECORD
 ├─ fixed corridor interruption            → CCTV
 └─ artifacts                              → PERSONAL / SCHEMA / EVENT-RECORD

TYNDEX-TERMINAL
 └─ illustrated location reconstructions   → EVENT-RECORD

IMMERSIVE-SCENE (protected)
 ├─ Pavel observation booth
 ├─ Lora red room
 └─ Solnyshko / Red Room game stills
```


## Art-direction rules, revision 0

| Class | Crop | Color / signal | Caption contract |
|---|---|---|---|
| `ADVERTISEMENT` | Wide safe area; poster portrait stays poster | Clean, controlled facility palette; no false `REC` | Campaign/location/offer label outside the image |
| `PERSONNEL` | Subtype-specific: public portrait, internal card, record strip | Record tint only where the source/carrier requires it | Person, role, ID and capture status outside the image |
| `CCTV` | Preserve native sensor frame and camera point | Signal damage only when motivated by source/carrier | Camera, time, source and evidence ID outside the image |
| `PERSONAL` | Preserve paper, Polaroid or card boundaries | Material daylight/flash is evidence, not a universal grade | Owner, date, provenance and uncertainty outside the image |
| `EVENT-RECORD` | Follow the event camera and chronology | Do not turn reconstructions or footage into advertising | Incident, action, location and recovery status outside the image |
| `SCHEMA` | No crop that removes labels, lines or margins | Legibility first; paper/diagram contrast remains visible | Schema/protocol ID, access and revision outside the image |

**Global constraint:** CRT, scanlines, timestamps, signal boxes and captions belong in
the carrier/HTML/CSS whenever they are not part of the depicted source. There is no
universal VHS filter.

**Protected exception:** `IMMERSIVE-SCENE` keeps its own runtime, still/video
lifecycle, rhythm and save contract. It is not migrated to these presets.

**UI exception:** `UTILITY` is not narrative evidence and receives context-specific
treatment rather than an art-class preset.


## Manual review queue

These rows need a human decision before any visual mutation:

- `assets/staff/documents/dossier-sz-312-05.jpg` — personal object evidence or event record.
- `assets/staff/curators/irina/cctv-pavel-observation-booth-poster.webp` — monitor-room event, not automatically CCTV because of its filename.
- `assets/staff/classes/class-10-sun-mask.webp` — portrait used as an admin overlay; verify crop and visible generation mark.
- `assets/staff/about-slides.webp` — location still currently presented inside the broadcast shell.
- Every row with `Public = no` — source-only/staging material; this is not a deletion instruction.

The manifest is an inventory and a proposal. It does not rename, move, delete, generate,
change runtime references or change canon.


## Asset rows

| Asset | Class | Subtype | Carrier | Size | Public | Treatment | Review |
|---|---|---|---|---:|:---:|---|---|
| `assets/guest/about-mission.webp` | `ADVERTISEMENT` | institutional / editorial plate | `GUEST-FACADE` | 1920x1081 | yes | CLEAN-WIDE | — |
| `assets/guest/about-safety-silence.jpg` | `ADVERTISEMENT` | institutional / editorial plate | `GUEST-FACADE` | 1280x720 | yes | CLEAN-WIDE | — |
| `assets/guest/about-softness.webp` | `ADVERTISEMENT` | institutional / editorial plate | `GUEST-FACADE` | 1920x1081 | yes | CLEAN-WIDE | — |
| `assets/guest/about-standard-312.webp` | `ADVERTISEMENT` | institutional / editorial plate | `GUEST-FACADE` | 1920x1081 | yes | CLEAN-WIDE | — |
| `assets/guest/ads/aquapark-hero.webp` | `ADVERTISEMENT` | campaign hero | `GUEST-FACADE` | 1672x941 | yes | CLEAN-WIDE | — |
| `assets/guest/ads/solnyshko-park-hero.webp` | `ADVERTISEMENT` | campaign hero | `GUEST-FACADE` | 1672x941 | yes | CLEAN-WIDE | — |
| `assets/guest/ads/video-archives-hero.webp` | `ADVERTISEMENT` | campaign hero | `GUEST-FACADE` | 1672x941 | yes | CLEAN-WIDE | — |
| `assets/guest/bg-corridor.webp` | `UTILITY` | facade background | `GUEST-FACADE` | 1920x1081 | yes | CONTEXT-SPECIFIC | — |
| `assets/guest/bg-exterior.webp` | `UTILITY` | facade background | `GUEST-FACADE` | 1920x824 | yes | CONTEXT-SPECIFIC | — |
| `assets/guest/bg-lobby.webp` | `UTILITY` | facade background | `GUEST-FACADE` | 1920x1081 | yes | CONTEXT-SPECIFIC | — |
| `assets/guest/happy-family.webp` | `ADVERTISEMENT` | location thumbnail / facade plate | `GUEST-FACADE` | 1920x1081 | yes | CLEAN-WIDE | — |
| `assets/guest/locations/detskiy-zhir-mall-poster.webp` | `ADVERTISEMENT` | location promotion / poster | `GUEST-FACADE` | 960x1200 | yes | CLEAN-WIDE | — |
| `assets/guest/locations/detskiy-zhir-mall.webp` | `ADVERTISEMENT` | location promotion / poster | `GUEST-FACADE` | 1920x1280 | yes | CLEAN-WIDE | — |
| `assets/guest/locations/illusion-cinema-poster.webp` | `ADVERTISEMENT` | location promotion / poster | `GUEST-FACADE` | 960x1200 | yes | CLEAN-WIDE | — |
| `assets/guest/locations/illusion-cinema.webp` | `ADVERTISEMENT` | location promotion / poster | `GUEST-FACADE` | 1920x1081 | yes | CLEAN-WIDE | — |
| `assets/guest/locations/losiny-ad.webp` | `ADVERTISEMENT` | location promotion / poster | `GUEST-FACADE` | 1920x2400 | yes | CLEAN-WIDE | — |
| `assets/guest/locations/losiny-animators.webp` | `ADVERTISEMENT` | location promotion / poster | `GUEST-FACADE` | 1920x1081 | yes | CLEAN-WIDE | — |
| `assets/guest/locations/losiny-entrance.webp` | `ADVERTISEMENT` | location promotion / poster | `GUEST-FACADE` | 1920x1081 | yes | CLEAN-WIDE | — |
| `assets/guest/locations/pavel/bedroom-base.webp` | `IMMERSIVE-SCENE` | Pavel runtime still / fallback | `IMMERSIVE-SCENE` | 1672x941 | yes | OWN-RUNTIME | PROTECTED |
| `assets/guest/locations/pavel/control-channel-switch-hold.webp` | `IMMERSIVE-SCENE` | Pavel runtime still / fallback | `IMMERSIVE-SCENE` | 1024x576 | yes | OWN-RUNTIME | PROTECTED |
| `assets/guest/locations/pavel/control-channel-switch-start.webp` | `IMMERSIVE-SCENE` | Pavel runtime still / fallback | `IMMERSIVE-SCENE` | 1024x576 | yes | OWN-RUNTIME | PROTECTED |
| `assets/guest/locations/pavel/control-empty.webp` | `IMMERSIVE-SCENE` | Pavel runtime still / fallback | `IMMERSIVE-SCENE` | 1024x592 | yes | OWN-RUNTIME | PROTECTED |
| `assets/guest/locations/pavel/control-intro-mask-off-hold.webp` | `IMMERSIVE-SCENE` | Pavel runtime still / fallback | `IMMERSIVE-SCENE` | 1024x576 | yes | OWN-RUNTIME | PROTECTED |
| `assets/guest/locations/pavel/control-intro-mask-off-start.webp` | `IMMERSIVE-SCENE` | Pavel runtime still / fallback | `IMMERSIVE-SCENE` | 1024x576 | yes | OWN-RUNTIME | PROTECTED |
| `assets/guest/locations/pavel/control-listening-hold.webp` | `IMMERSIVE-SCENE` | Pavel runtime still / fallback | `IMMERSIVE-SCENE` | 1024x576 | yes | OWN-RUNTIME | PROTECTED |
| `assets/guest/locations/pavel/control-listening-start.webp` | `IMMERSIVE-SCENE` | Pavel runtime still / fallback | `IMMERSIVE-SCENE` | 1024x576 | yes | OWN-RUNTIME | PROTECTED |
| `assets/guest/locations/pavel/control-look-back-hold.webp` | `IMMERSIVE-SCENE` | Pavel runtime still / fallback | `IMMERSIVE-SCENE` | 1024x576 | yes | OWN-RUNTIME | PROTECTED |
| `assets/guest/locations/pavel/control-look-back-start.webp` | `IMMERSIVE-SCENE` | Pavel runtime still / fallback | `IMMERSIVE-SCENE` | 1024x576 | yes | OWN-RUNTIME | PROTECTED |
| `assets/guest/locations/pavel/control-pavel-remote.webp` | `IMMERSIVE-SCENE` | Pavel runtime still / fallback | `IMMERSIVE-SCENE` | 1024x576 | yes | OWN-RUNTIME | PROTECTED |
| `assets/guest/locations/pavel/control-pavel-right-hold.webp` | `IMMERSIVE-SCENE` | Pavel runtime still / fallback | `IMMERSIVE-SCENE` | 1024x576 | yes | OWN-RUNTIME | PROTECTED |
| `assets/guest/locations/pavel/control-pavel-right-start.webp` | `IMMERSIVE-SCENE` | Pavel runtime still / fallback | `IMMERSIVE-SCENE` | 1024x576 | yes | OWN-RUNTIME | PROTECTED |
| `assets/guest/locations/pavel/control-pseudo-pavel.webp` | `IMMERSIVE-SCENE` | Pavel runtime still / fallback | `IMMERSIVE-SCENE` | 1024x576 | yes | OWN-RUNTIME | PROTECTED |
| `assets/guest/locations/pavel/control-right-disabled.webp` | `IMMERSIVE-SCENE` | Pavel runtime still / fallback | `IMMERSIVE-SCENE` | 1024x576 | yes | OWN-RUNTIME | PROTECTED |
| `assets/guest/locations/pavel/control-screens-glitch-hold.webp` | `IMMERSIVE-SCENE` | Pavel runtime still / fallback | `IMMERSIVE-SCENE` | 1024x576 | yes | OWN-RUNTIME | PROTECTED |
| `assets/guest/locations/pavel/control-screens-glitch-start.webp` | `IMMERSIVE-SCENE` | Pavel runtime still / fallback | `IMMERSIVE-SCENE` | 1024x576 | yes | OWN-RUNTIME | PROTECTED |
| `assets/guest/locations/pavel/control-smile-hold.webp` | `IMMERSIVE-SCENE` | Pavel runtime still / fallback | `IMMERSIVE-SCENE` | 1024x576 | yes | OWN-RUNTIME | PROTECTED |
| `assets/guest/locations/pavel/control-smile-start.webp` | `IMMERSIVE-SCENE` | Pavel runtime still / fallback | `IMMERSIVE-SCENE` | 1024x576 | yes | OWN-RUNTIME | PROTECTED |
| `assets/guest/locations/pavel/control-yawn-hold.webp` | `IMMERSIVE-SCENE` | Pavel runtime still / fallback | `IMMERSIVE-SCENE` | 1024x576 | yes | OWN-RUNTIME | PROTECTED |
| `assets/guest/locations/pavel/control-yawn-start.webp` | `IMMERSIVE-SCENE` | Pavel runtime still / fallback | `IMMERSIVE-SCENE` | 1024x576 | yes | OWN-RUNTIME | PROTECTED |
| `assets/guest/locations/pavel/drain-beckon.webp` | `IMMERSIVE-SCENE` | Pavel runtime still / fallback | `IMMERSIVE-SCENE` | 1024x592 | yes | OWN-RUNTIME | PROTECTED |
| `assets/guest/locations/pavel/drain-cough-start.webp` | `IMMERSIVE-SCENE` | Pavel runtime still / fallback | `IMMERSIVE-SCENE` | 1024x592 | yes | OWN-RUNTIME | PROTECTED |
| `assets/guest/locations/pavel/drain-cough.webp` | `IMMERSIVE-SCENE` | Pavel runtime still / fallback | `IMMERSIVE-SCENE` | 1024x592 | yes | OWN-RUNTIME | PROTECTED |
| `assets/guest/locations/pavel/drain-hair-long.webp` | `IMMERSIVE-SCENE` | Pavel runtime still / fallback | `IMMERSIVE-SCENE` | 736x400 | yes | OWN-RUNTIME | PROTECTED |
| `assets/guest/locations/pavel/drain-hungry.webp` | `IMMERSIVE-SCENE` | Pavel runtime still / fallback | `IMMERSIVE-SCENE` | 1024x577 | yes | OWN-RUNTIME | PROTECTED |
| `assets/guest/locations/pavel/drain-vague.webp` | `IMMERSIVE-SCENE` | Pavel runtime still / fallback | `IMMERSIVE-SCENE` | 1024x592 | yes | OWN-RUNTIME | PROTECTED |
| `assets/guest/locations/pavel/hatch-dessert-hold.webp` | `IMMERSIVE-SCENE` | Pavel runtime still / fallback | `IMMERSIVE-SCENE` | 1024x576 | yes | OWN-RUNTIME | PROTECTED |
| `assets/guest/locations/pavel/hatch-dessert-start.webp` | `IMMERSIVE-SCENE` | Pavel runtime still / fallback | `IMMERSIVE-SCENE` | 1024x576 | yes | OWN-RUNTIME | PROTECTED |
| `assets/guest/locations/pavel/hatch-gasmask-hold.webp` | `IMMERSIVE-SCENE` | Pavel runtime still / fallback | `IMMERSIVE-SCENE` | 1024x576 | yes | OWN-RUNTIME | PROTECTED |
| `assets/guest/locations/pavel/hatch-gasmask-start.webp` | `IMMERSIVE-SCENE` | Pavel runtime still / fallback | `IMMERSIVE-SCENE` | 1024x576 | yes | OWN-RUNTIME | PROTECTED |
| `assets/guest/locations/pavel/hatch-tray-start.webp` | `IMMERSIVE-SCENE` | Pavel runtime still / fallback | `IMMERSIVE-SCENE` | 1024x592 | yes | OWN-RUNTIME | PROTECTED |
| `assets/guest/locations/pavel/hatch-tray.webp` | `IMMERSIVE-SCENE` | Pavel runtime still / fallback | `IMMERSIVE-SCENE` | 1024x592 | yes | OWN-RUNTIME | PROTECTED |
| `assets/guest/locations/pavel/nightstand-cassette-start.webp` | `IMMERSIVE-SCENE` | Pavel runtime still / fallback | `IMMERSIVE-SCENE` | 1024x576 | yes | OWN-RUNTIME | PROTECTED |
| `assets/guest/locations/pavel/nightstand-cassette.webp` | `IMMERSIVE-SCENE` | Pavel runtime still / fallback | `IMMERSIVE-SCENE` | 1024x576 | yes | OWN-RUNTIME | PROTECTED |
| `assets/guest/locations/pavel/senior-guide-waiting.webp` | `IMMERSIVE-SCENE` | Pavel runtime still / fallback | `IMMERSIVE-SCENE` | 736x400 | yes | OWN-RUNTIME | PROTECTED |
| `assets/guest/locations/pavel/storage-base.webp` | `IMMERSIVE-SCENE` | Pavel runtime still / fallback | `IMMERSIVE-SCENE` | 1024x576 | yes | OWN-RUNTIME | PROTECTED |
| `assets/guest/locations/pavel/storage-cleaner-bottle.webp` | `IMMERSIVE-SCENE` | Pavel runtime still / fallback | `IMMERSIVE-SCENE` | 1024x576 | yes | OWN-RUNTIME | PROTECTED |
| `assets/guest/locations/pavel/storage-pavel-escape.webp` | `IMMERSIVE-SCENE` | Pavel runtime still / fallback | `IMMERSIVE-SCENE` | 1024x577 | yes | OWN-RUNTIME | PROTECTED |
| `assets/guest/locations/pavel/storage-provisions.webp` | `IMMERSIVE-SCENE` | Pavel runtime still / fallback | `IMMERSIVE-SCENE` | 1024x576 | yes | OWN-RUNTIME | PROTECTED |
| `assets/guest/locations/pavel/storage-slide-light.webp` | `IMMERSIVE-SCENE` | Pavel runtime still / fallback | `IMMERSIVE-SCENE` | 1024x576 | yes | OWN-RUNTIME | PROTECTED |
| `assets/guest/locations/pavel/storage-slide-loop.webp` | `IMMERSIVE-SCENE` | Pavel runtime still / fallback | `IMMERSIVE-SCENE` | 736x400 | yes | OWN-RUNTIME | PROTECTED |
| `assets/guest/locations/pavel/tour-bathroom-hold.webp` | `IMMERSIVE-SCENE` | Pavel runtime still / fallback | `IMMERSIVE-SCENE` | 1024x576 | yes | OWN-RUNTIME | PROTECTED |
| `assets/guest/locations/pavel/tour-bathroom-start.webp` | `IMMERSIVE-SCENE` | Pavel runtime still / fallback | `IMMERSIVE-SCENE` | 1024x576 | yes | OWN-RUNTIME | PROTECTED |
| `assets/guest/locations/pavel/tour-bedroom.webp` | `IMMERSIVE-SCENE` | Pavel runtime still / fallback | `IMMERSIVE-SCENE` | 752x416 | yes | OWN-RUNTIME | PROTECTED |
| `assets/guest/locations/pavel/tour-control-hold.webp` | `IMMERSIVE-SCENE` | Pavel runtime still / fallback | `IMMERSIVE-SCENE` | 1024x576 | yes | OWN-RUNTIME | PROTECTED |
| `assets/guest/locations/pavel/tour-control-start.webp` | `IMMERSIVE-SCENE` | Pavel runtime still / fallback | `IMMERSIVE-SCENE` | 1024x576 | yes | OWN-RUNTIME | PROTECTED |
| `assets/guest/locations/pavel/tour-hatch-hold.webp` | `IMMERSIVE-SCENE` | Pavel runtime still / fallback | `IMMERSIVE-SCENE` | 1024x576 | yes | OWN-RUNTIME | PROTECTED |
| `assets/guest/locations/pavel/tour-hatch-start.webp` | `IMMERSIVE-SCENE` | Pavel runtime still / fallback | `IMMERSIVE-SCENE` | 1024x576 | yes | OWN-RUNTIME | PROTECTED |
| `assets/guest/locations/pavel/tour-storage-hold.webp` | `IMMERSIVE-SCENE` | Pavel runtime still / fallback | `IMMERSIVE-SCENE` | 1504x832 | yes | OWN-RUNTIME | PROTECTED |
| `assets/guest/locations/pavel/tour-storage-start.webp` | `IMMERSIVE-SCENE` | Pavel runtime still / fallback | `IMMERSIVE-SCENE` | 1024x576 | yes | OWN-RUNTIME | PROTECTED |
| `assets/guest/locations/red-room-cafe-poster.webp` | `ADVERTISEMENT` | location promotion / poster | `GUEST-FACADE` | 960x1200 | yes | CLEAN-WIDE | — |
| `assets/guest/locations/red-room-cafe.webp` | `ADVERTISEMENT` | location promotion / poster | `GUEST-FACADE` | 1920x1081 | yes | CLEAN-WIDE | — |
| `assets/guest/locations/solnyshko-park-poster.webp` | `ADVERTISEMENT` | location promotion / poster | `GUEST-FACADE` | 960x1200 | no | CLEAN-WIDE | — |
| `assets/guest/locations/solnyshko-park.webp` | `ADVERTISEMENT` | location promotion / poster | `GUEST-FACADE` | 1920x1280 | yes | CLEAN-WIDE | — |
| `assets/guest/locations/solnyshko/carousel-empty-10s_poster.webp` | `IMMERSIVE-SCENE` | Solnyshko runtime poster / fallback | `IMMERSIVE-SCENE` | 1280x720 | yes | OWN-RUNTIME | PROTECTED |
| `assets/guest/locations/solnyshko/gate-closed-loop_poster.webp` | `IMMERSIVE-SCENE` | Solnyshko runtime poster / fallback | `IMMERSIVE-SCENE` | 1280x720 | yes | OWN-RUNTIME | PROTECTED |
| `assets/guest/locations/solnyshko/gate-open-enter_poster.webp` | `IMMERSIVE-SCENE` | Solnyshko runtime poster / fallback | `IMMERSIVE-SCENE` | 1280x720 | no | OWN-RUNTIME | PROTECTED |
| `assets/guest/locations/solnyshko/gate-refuse_poster.webp` | `IMMERSIVE-SCENE` | Solnyshko runtime poster / fallback | `IMMERSIVE-SCENE` | 1280x720 | yes | OWN-RUNTIME | PROTECTED |
| `assets/guest/locations/solnyshko/irina-cotton-lookaway_poster.webp` | `IMMERSIVE-SCENE` | Solnyshko runtime poster / fallback | `IMMERSIVE-SCENE` | 1280x720 | yes | OWN-RUNTIME | PROTECTED |
| `assets/guest/locations/solnyshko/irina-cotton-offer_poster.webp` | `IMMERSIVE-SCENE` | Solnyshko runtime poster / fallback | `IMMERSIVE-SCENE` | 1280x720 | yes | OWN-RUNTIME | PROTECTED |
| `assets/guest/locations/solnyshko/irina-cotton-wait_poster.webp` | `IMMERSIVE-SCENE` | Solnyshko runtime poster / fallback | `IMMERSIVE-SCENE` | 1280x720 | yes | OWN-RUNTIME | PROTECTED |
| `assets/guest/locations/solnyshko/park-wide-15s_poster.webp` | `IMMERSIVE-SCENE` | Solnyshko runtime poster / fallback | `IMMERSIVE-SCENE` | 1280x720 | yes | OWN-RUNTIME | PROTECTED |
| `assets/guest/logo.svg` | `UTILITY` | brand mark | `SHELL` | 900x210 | yes | CONTEXT-SPECIFIC | — |
| `assets/guest/pool.webp` | `ADVERTISEMENT` | location thumbnail / facade plate | `GUEST-FACADE` | 1920x1081 | yes | CLEAN-WIDE | — |
| `assets/guest/recruitment-guest.webp` | `ADVERTISEMENT` | guest recruitment | `GUEST-FACADE` | 1920x1072 | yes | CLEAN-WIDE | — |
| `assets/guest/recruitment-staff.webp` | `ADVERTISEMENT` | staff recruitment | `BROADCAST-ZHIR-TV` | 1920x1072 | yes | CLEAN-WIDE | — |
| `assets/guest/red-room/game/espresso-metal-texture.webp` | `IMMERSIVE-SCENE` | Red Room game texture | `IMMERSIVE-SCENE` | 640x640 | yes | OWN-RUNTIME | PROTECTED |
| `assets/guest/red-room/game/espresso-receipt-texture.webp` | `IMMERSIVE-SCENE` | Red Room game texture | `IMMERSIVE-SCENE` | 640x640 | yes | OWN-RUNTIME | PROTECTED |
| `assets/guest/red-room/lora/reference-sheets/dog-character-reference-v1.png` | `IMMERSIVE-SCENE` | Lora reference sheet | `IMMERSIVE-SCENE` | 1536x1024 | no | OWN-RUNTIME | PROTECTED |
| `assets/guest/red-room/lora/reference-sheets/fox-character-reference-v1.png` | `IMMERSIVE-SCENE` | Lora reference sheet | `IMMERSIVE-SCENE` | 1672x941 | no | OWN-RUNTIME | PROTECTED |
| `assets/guest/red-room/lora/reference-sheets/pig-character-reference-v1.png` | `IMMERSIVE-SCENE` | Lora reference sheet | `IMMERSIVE-SCENE` | 1672x941 | no | OWN-RUNTIME | PROTECTED |
| `assets/guest/red-room/lora/scenes/concepts/cgi/dog-cgi-blank-v1.png` | `IMMERSIVE-SCENE` | Lora concept / pilot | `IMMERSIVE-SCENE` | 1672x941 | no | OWN-RUNTIME | PROTECTED |
| `assets/guest/red-room/lora/scenes/concepts/cgi/dog-cgi-coffee-action-v1.png` | `IMMERSIVE-SCENE` | Lora concept / pilot | `IMMERSIVE-SCENE` | 1672x941 | no | OWN-RUNTIME | PROTECTED |
| `assets/guest/red-room/lora/scenes/concepts/cgi/dog-cgi-curtain-v1.png` | `IMMERSIVE-SCENE` | Lora concept / pilot | `IMMERSIVE-SCENE` | 1672x941 | no | OWN-RUNTIME | PROTECTED |
| `assets/guest/red-room/lora/scenes/concepts/cgi/dog-cgi-settled-v1.png` | `IMMERSIVE-SCENE` | Lora concept / pilot | `IMMERSIVE-SCENE` | 1672x941 | no | OWN-RUNTIME | PROTECTED |
| `assets/guest/red-room/lora/scenes/concepts/cgi/dog-cgi-sleep-poster-v1.png` | `IMMERSIVE-SCENE` | Lora concept / pilot | `IMMERSIVE-SCENE` | 1672x941 | no | OWN-RUNTIME | PROTECTED |
| `assets/guest/red-room/lora/scenes/concepts/cgi/dog-cgi-sleep-start-v1.png` | `IMMERSIVE-SCENE` | Lora concept / pilot | `IMMERSIVE-SCENE` | 1672x941 | no | OWN-RUNTIME | PROTECTED |
| `assets/guest/red-room/lora/scenes/concepts/cgi/dog-cgi-wander-aisle-v1.png` | `IMMERSIVE-SCENE` | Lora concept / pilot | `IMMERSIVE-SCENE` | 1672x941 | no | OWN-RUNTIME | PROTECTED |
| `assets/guest/red-room/lora/scenes/concepts/cgi/dog-cgi-wander-stand-v1.png` | `IMMERSIVE-SCENE` | Lora concept / pilot | `IMMERSIVE-SCENE` | 1672x941 | no | OWN-RUNTIME | PROTECTED |
| `assets/guest/red-room/lora/scenes/concepts/costume/dog-suit-coffee-action-v2.png` | `IMMERSIVE-SCENE` | Lora concept / pilot | `IMMERSIVE-SCENE` | 1672x941 | no | OWN-RUNTIME | PROTECTED |
| `assets/guest/red-room/lora/scenes/concepts/costume/dog-suit-coffee-start-v2.png` | `IMMERSIVE-SCENE` | Lora concept / pilot | `IMMERSIVE-SCENE` | 1672x941 | no | OWN-RUNTIME | PROTECTED |
| `assets/guest/red-room/lora/scenes/concepts/costume/dog-suit-sleep-start-v2.png` | `IMMERSIVE-SCENE` | Lora concept / pilot | `IMMERSIVE-SCENE` | 1672x941 | no | OWN-RUNTIME | PROTECTED |
| `assets/guest/red-room/lora/scenes/concepts/grok/v02-pig-masked-pilot.png` | `IMMERSIVE-SCENE` | Lora concept / pilot | `IMMERSIVE-SCENE` | 1672x941 | no | OWN-RUNTIME | PROTECTED |
| `assets/guest/red-room/lora/scenes/concepts/grok/v03-pig-reveal-poster-pilot.png` | `IMMERSIVE-SCENE` | Lora concept / pilot | `IMMERSIVE-SCENE` | 1672x941 | no | OWN-RUNTIME | PROTECTED |
| `assets/guest/red-room/lora/scenes/concepts/grok/v04-pig-unmasked-pilot.png` | `IMMERSIVE-SCENE` | Lora concept / pilot | `IMMERSIVE-SCENE` | 1672x941 | no | OWN-RUNTIME | PROTECTED |
| `assets/guest/red-room/lora/scenes/concepts/grok/v05-fox-gaze-pilot.png` | `IMMERSIVE-SCENE` | Lora concept / pilot | `IMMERSIVE-SCENE` | 1672x941 | no | OWN-RUNTIME | PROTECTED |
| `assets/guest/red-room/lora/scenes/concepts/grok/v06-fox-action-pilot.png` | `IMMERSIVE-SCENE` | Lora concept / pilot | `IMMERSIVE-SCENE` | 1672x941 | no | OWN-RUNTIME | PROTECTED |
| `assets/guest/red-room/lora/scenes/concepts/grok/v07-dog-blank-pilot.png` | `IMMERSIVE-SCENE` | Lora concept / pilot | `IMMERSIVE-SCENE` | 1672x941 | no | OWN-RUNTIME | PROTECTED |
| `assets/guest/red-room/lora/scenes/concepts/grok/v08-dog-settled-pilot.png` | `IMMERSIVE-SCENE` | Lora concept / pilot | `IMMERSIVE-SCENE` | 1672x941 | no | OWN-RUNTIME | PROTECTED |
| `assets/guest/red-room/lora/scenes/concepts/grok/v09-dog-curtain-pilot.png` | `IMMERSIVE-SCENE` | Lora concept / pilot | `IMMERSIVE-SCENE` | 1672x941 | no | OWN-RUNTIME | PROTECTED |
| `assets/guest/red-room/lora/scenes/concepts/grok/v10-fox-dog-pilot.png` | `IMMERSIVE-SCENE` | Lora concept / pilot | `IMMERSIVE-SCENE` | 1671x941 | no | OWN-RUNTIME | PROTECTED |
| `assets/guest/red-room/lora/scenes/concepts/grok/v11-dog-sleep-pilot.png` | `IMMERSIVE-SCENE` | Lora concept / pilot | `IMMERSIVE-SCENE` | 1672x941 | no | OWN-RUNTIME | PROTECTED |
| `assets/guest/red-room/lora/scenes/concepts/grok/v12-empty-curtain-pilot.png` | `IMMERSIVE-SCENE` | Lora concept / pilot | `IMMERSIVE-SCENE` | 1672x941 | no | OWN-RUNTIME | PROTECTED |
| `assets/guest/red-room/lora/scenes/concepts/v01-empty-counter-a-deep-hall-v1.png` | `IMMERSIVE-SCENE` | Lora concept / pilot | `IMMERSIVE-SCENE` | 1672x941 | no | OWN-RUNTIME | PROTECTED |
| `assets/guest/red-room/lora/scenes/concepts/v01-empty-counter-b-intimate-v1.png` | `IMMERSIVE-SCENE` | Lora concept / pilot | `IMMERSIVE-SCENE` | 1672x941 | no | OWN-RUNTIME | PROTECTED |
| `assets/guest/red-room/lora/scenes/concepts/v01-empty-counter-c-curtain-v1.png` | `IMMERSIVE-SCENE` | Lora concept / pilot | `IMMERSIVE-SCENE` | 1672x941 | no | OWN-RUNTIME | PROTECTED |
| `assets/guest/red-room/lora/scenes/dog-suit-coffee-start-v2.png` | `IMMERSIVE-SCENE` | Lora runtime still / fallback | `IMMERSIVE-SCENE` | 1672x941 | no | OWN-RUNTIME | PROTECTED |
| `assets/guest/red-room/lora/scenes/dog-suit-coffee-start-v2.webp` | `IMMERSIVE-SCENE` | Lora runtime still / fallback | `IMMERSIVE-SCENE` | 1672x941 | yes | OWN-RUNTIME | PROTECTED |
| `assets/guest/red-room/lora/scenes/dog-suit-sleep-start-v2.png` | `IMMERSIVE-SCENE` | Lora runtime still / fallback | `IMMERSIVE-SCENE` | 1672x941 | no | OWN-RUNTIME | PROTECTED |
| `assets/guest/red-room/lora/scenes/dog-suit-sleep-start-v2.webp` | `IMMERSIVE-SCENE` | Lora runtime still / fallback | `IMMERSIVE-SCENE` | 1672x941 | yes | OWN-RUNTIME | PROTECTED |
| `assets/guest/red-room/lora/scenes/staging/grok-dog-costume-v2/frames/coffee-del-0.jpg` | `IMMERSIVE-SCENE` | Lora staging / QA frame | `IMMERSIVE-SCENE` | 736x400 | no | OWN-RUNTIME | PROTECTED |
| `assets/guest/red-room/lora/scenes/staging/grok-dog-costume-v2/frames/coffee-del-3.jpg` | `IMMERSIVE-SCENE` | Lora staging / QA frame | `IMMERSIVE-SCENE` | 736x400 | no | OWN-RUNTIME | PROTECTED |
| `assets/guest/red-room/lora/scenes/staging/grok-dog-costume-v2/frames/coffee-del-5_95.jpg` | `IMMERSIVE-SCENE` | Lora staging / QA frame | `IMMERSIVE-SCENE` | 736x400 | no | OWN-RUNTIME | PROTECTED |
| `assets/guest/red-room/lora/scenes/staging/grok-dog-costume-v2/frames/coffee-raw-0.jpg` | `IMMERSIVE-SCENE` | Lora staging / QA frame | `IMMERSIVE-SCENE` | 736x400 | no | OWN-RUNTIME | PROTECTED |
| `assets/guest/red-room/lora/scenes/staging/grok-dog-costume-v2/frames/coffee-raw-3.jpg` | `IMMERSIVE-SCENE` | Lora staging / QA frame | `IMMERSIVE-SCENE` | 736x400 | no | OWN-RUNTIME | PROTECTED |
| `assets/guest/red-room/lora/scenes/staging/grok-dog-costume-v2/frames/coffee-raw-5_95.jpg` | `IMMERSIVE-SCENE` | Lora staging / QA frame | `IMMERSIVE-SCENE` | 736x400 | no | OWN-RUNTIME | PROTECTED |
| `assets/guest/red-room/lora/scenes/staging/grok-dog-costume-v2/frames/sleep-del-0.jpg` | `IMMERSIVE-SCENE` | Lora staging / QA frame | `IMMERSIVE-SCENE` | 736x400 | no | OWN-RUNTIME | PROTECTED |
| `assets/guest/red-room/lora/scenes/staging/grok-dog-costume-v2/frames/sleep-del-2.jpg` | `IMMERSIVE-SCENE` | Lora staging / QA frame | `IMMERSIVE-SCENE` | 736x400 | no | OWN-RUNTIME | PROTECTED |
| `assets/guest/red-room/lora/scenes/staging/grok-dog-costume-v2/frames/sleep-del-3_95.jpg` | `IMMERSIVE-SCENE` | Lora staging / QA frame | `IMMERSIVE-SCENE` | 736x400 | no | OWN-RUNTIME | PROTECTED |
| `assets/guest/red-room/lora/scenes/staging/grok-dog-costume-v2/frames/sleep-raw-0.jpg` | `IMMERSIVE-SCENE` | Lora staging / QA frame | `IMMERSIVE-SCENE` | 736x400 | no | OWN-RUNTIME | PROTECTED |
| `assets/guest/red-room/lora/scenes/staging/grok-dog-costume-v2/frames/sleep-raw-3.jpg` | `IMMERSIVE-SCENE` | Lora staging / QA frame | `IMMERSIVE-SCENE` | 736x400 | no | OWN-RUNTIME | PROTECTED |
| `assets/guest/red-room/lora/scenes/staging/grok-dog-costume-v2/frames/sleep-raw-5_95.jpg` | `IMMERSIVE-SCENE` | Lora staging / QA frame | `IMMERSIVE-SCENE` | 736x400 | no | OWN-RUNTIME | PROTECTED |
| `assets/guest/red-room/lora/scenes/staging/grok-dog-costume-v2/frames/wander-del-0.jpg` | `IMMERSIVE-SCENE` | Lora staging / QA frame | `IMMERSIVE-SCENE` | 736x400 | no | OWN-RUNTIME | PROTECTED |
| `assets/guest/red-room/lora/scenes/staging/grok-dog-costume-v2/frames/wander-del-4.jpg` | `IMMERSIVE-SCENE` | Lora staging / QA frame | `IMMERSIVE-SCENE` | 736x400 | no | OWN-RUNTIME | PROTECTED |
| `assets/guest/red-room/lora/scenes/staging/grok-dog-costume-v2/frames/wander-del-7_95.jpg` | `IMMERSIVE-SCENE` | Lora staging / QA frame | `IMMERSIVE-SCENE` | 736x400 | no | OWN-RUNTIME | PROTECTED |
| `assets/guest/red-room/lora/scenes/staging/grok-dog-costume-v2/frames/wander-raw-0.jpg` | `IMMERSIVE-SCENE` | Lora staging / QA frame | `IMMERSIVE-SCENE` | 736x400 | no | OWN-RUNTIME | PROTECTED |
| `assets/guest/red-room/lora/scenes/staging/grok-dog-costume-v2/frames/wander-raw-5.jpg` | `IMMERSIVE-SCENE` | Lora staging / QA frame | `IMMERSIVE-SCENE` | 736x400 | no | OWN-RUNTIME | PROTECTED |
| `assets/guest/red-room/lora/scenes/staging/grok-dog-costume-v2/frames/wander-raw-9_95.jpg` | `IMMERSIVE-SCENE` | Lora staging / QA frame | `IMMERSIVE-SCENE` | 736x400 | no | OWN-RUNTIME | PROTECTED |
| `assets/guest/red-room/lora/scenes/staging/grok-dog-costume-v2/release-candidate/contact-sheet.png` | `IMMERSIVE-SCENE` | Lora staging / QA frame | `IMMERSIVE-SCENE` | 1488x915 | no | OWN-RUNTIME | PROTECTED |
| `assets/guest/red-room/lora/scenes/staging/grok-dog-costume-v2/release-candidate/first-frames/dog-suit-coffee-start-v2.png` | `IMMERSIVE-SCENE` | Lora staging / QA frame | `IMMERSIVE-SCENE` | 1672x941 | no | OWN-RUNTIME | PROTECTED |
| `assets/guest/red-room/lora/scenes/staging/grok-dog-costume-v2/release-candidate/first-frames/dog-suit-sleep-start-v2.png` | `IMMERSIVE-SCENE` | Lora staging / QA frame | `IMMERSIVE-SCENE` | 1672x941 | no | OWN-RUNTIME | PROTECTED |
| `assets/guest/red-room/lora/scenes/staging/grok-dog-costume-v2/release-candidate/first-frames/v07-dog-blank.webp` | `IMMERSIVE-SCENE` | Lora staging / QA frame | `IMMERSIVE-SCENE` | 1024x576 | no | OWN-RUNTIME | PROTECTED |
| `assets/guest/red-room/lora/scenes/staging/grok-dog-costume-v2/release-candidate/first-frames/v08-dog-aisle.webp` | `IMMERSIVE-SCENE` | Lora staging / QA frame | `IMMERSIVE-SCENE` | 1024x576 | no | OWN-RUNTIME | PROTECTED |
| `assets/guest/red-room/lora/scenes/staging/grok-dog-costume-v2/release-candidate/first-frames/v08-dog-settled.webp` | `IMMERSIVE-SCENE` | Lora staging / QA frame | `IMMERSIVE-SCENE` | 1024x576 | no | OWN-RUNTIME | PROTECTED |
| `assets/guest/red-room/lora/scenes/staging/grok-dog-costume-v2/release-candidate/first-frames/v08-dog-stand.webp` | `IMMERSIVE-SCENE` | Lora staging / QA frame | `IMMERSIVE-SCENE` | 1024x576 | no | OWN-RUNTIME | PROTECTED |
| `assets/guest/red-room/lora/scenes/staging/grok-dog-costume-v2/release-candidate/first-frames/v11-dog-sleep.webp` | `IMMERSIVE-SCENE` | Lora staging / QA frame | `IMMERSIVE-SCENE` | 1024x576 | no | OWN-RUNTIME | PROTECTED |
| `assets/guest/red-room/lora/scenes/staging/grok-dog-costume-v2/release-candidate/frames/coffee-native-first.png` | `IMMERSIVE-SCENE` | Lora staging / QA frame | `IMMERSIVE-SCENE` | 736x400 | no | OWN-RUNTIME | PROTECTED |
| `assets/guest/red-room/lora/scenes/staging/grok-dog-costume-v2/release-candidate/frames/coffee-native-last.png` | `IMMERSIVE-SCENE` | Lora staging / QA frame | `IMMERSIVE-SCENE` | 736x400 | no | OWN-RUNTIME | PROTECTED |
| `assets/guest/red-room/lora/scenes/staging/grok-dog-costume-v2/release-candidate/frames/coffee-native-middle.png` | `IMMERSIVE-SCENE` | Lora staging / QA frame | `IMMERSIVE-SCENE` | 736x400 | no | OWN-RUNTIME | PROTECTED |
| `assets/guest/red-room/lora/scenes/staging/grok-dog-costume-v2/release-candidate/frames/sleep-native-first.png` | `IMMERSIVE-SCENE` | Lora staging / QA frame | `IMMERSIVE-SCENE` | 736x400 | no | OWN-RUNTIME | PROTECTED |
| `assets/guest/red-room/lora/scenes/staging/grok-dog-costume-v2/release-candidate/frames/sleep-native-last.png` | `IMMERSIVE-SCENE` | Lora staging / QA frame | `IMMERSIVE-SCENE` | 736x400 | no | OWN-RUNTIME | PROTECTED |
| `assets/guest/red-room/lora/scenes/staging/grok-dog-costume-v2/release-candidate/frames/sleep-native-middle.png` | `IMMERSIVE-SCENE` | Lora staging / QA frame | `IMMERSIVE-SCENE` | 736x400 | no | OWN-RUNTIME | PROTECTED |
| `assets/guest/red-room/lora/scenes/staging/grok-dog-costume-v2/release-candidate/frames/wander-native-first.png` | `IMMERSIVE-SCENE` | Lora staging / QA frame | `IMMERSIVE-SCENE` | 736x400 | no | OWN-RUNTIME | PROTECTED |
| `assets/guest/red-room/lora/scenes/staging/grok-dog-costume-v2/release-candidate/frames/wander-native-last.png` | `IMMERSIVE-SCENE` | Lora staging / QA frame | `IMMERSIVE-SCENE` | 736x400 | no | OWN-RUNTIME | PROTECTED |
| `assets/guest/red-room/lora/scenes/staging/grok-dog-costume-v2/release-candidate/frames/wander-native-middle.png` | `IMMERSIVE-SCENE` | Lora staging / QA frame | `IMMERSIVE-SCENE` | 736x400 | no | OWN-RUNTIME | PROTECTED |
| `assets/guest/red-room/lora/scenes/staging/grok-dog-costume-v2/release-candidate/frames/wander-raw-first.png` | `IMMERSIVE-SCENE` | Lora staging / QA frame | `IMMERSIVE-SCENE` | 736x400 | no | OWN-RUNTIME | PROTECTED |
| `assets/guest/red-room/lora/scenes/staging/grok-dog-costume-v2/release-candidate/frames/wander-raw-last.png` | `IMMERSIVE-SCENE` | Lora staging / QA frame | `IMMERSIVE-SCENE` | 736x400 | no | OWN-RUNTIME | PROTECTED |
| `assets/guest/red-room/lora/scenes/staging/grok-dog-costume-v2/release-candidate/frames/wander-raw-middle.png` | `IMMERSIVE-SCENE` | Lora staging / QA frame | `IMMERSIVE-SCENE` | 736x400 | no | OWN-RUNTIME | PROTECTED |
| `assets/guest/red-room/lora/scenes/staging/grok-dog-costume-v2/release-candidate/ratio-frames/coffee-crop-first.png` | `IMMERSIVE-SCENE` | Lora staging / QA frame | `IMMERSIVE-SCENE` | 712x400 | no | OWN-RUNTIME | PROTECTED |
| `assets/guest/red-room/lora/scenes/staging/grok-dog-costume-v2/release-candidate/ratio-frames/coffee-crop-last.png` | `IMMERSIVE-SCENE` | Lora staging / QA frame | `IMMERSIVE-SCENE` | 712x400 | no | OWN-RUNTIME | PROTECTED |
| `assets/guest/red-room/lora/scenes/staging/grok-dog-costume-v2/release-candidate/ratio-frames/coffee-crop-middle.png` | `IMMERSIVE-SCENE` | Lora staging / QA frame | `IMMERSIVE-SCENE` | 712x400 | no | OWN-RUNTIME | PROTECTED |
| `assets/guest/red-room/lora/scenes/staging/grok-dog-costume-v2/release-candidate/ratio-frames/coffee-pad-first.png` | `IMMERSIVE-SCENE` | Lora staging / QA frame | `IMMERSIVE-SCENE` | 736x414 | no | OWN-RUNTIME | PROTECTED |
| `assets/guest/red-room/lora/scenes/staging/grok-dog-costume-v2/release-candidate/ratio-frames/coffee-pad-last.png` | `IMMERSIVE-SCENE` | Lora staging / QA frame | `IMMERSIVE-SCENE` | 736x414 | no | OWN-RUNTIME | PROTECTED |
| `assets/guest/red-room/lora/scenes/staging/grok-dog-costume-v2/release-candidate/ratio-frames/coffee-pad-middle.png` | `IMMERSIVE-SCENE` | Lora staging / QA frame | `IMMERSIVE-SCENE` | 736x414 | no | OWN-RUNTIME | PROTECTED |
| `assets/guest/red-room/lora/scenes/staging/grok-dog-costume-v2/release-candidate/ratio-frames/wander-crop-first.png` | `IMMERSIVE-SCENE` | Lora staging / QA frame | `IMMERSIVE-SCENE` | 712x400 | no | OWN-RUNTIME | PROTECTED |
| `assets/guest/red-room/lora/scenes/staging/grok-dog-costume-v2/release-candidate/ratio-frames/wander-crop-last.png` | `IMMERSIVE-SCENE` | Lora staging / QA frame | `IMMERSIVE-SCENE` | 712x400 | no | OWN-RUNTIME | PROTECTED |
| `assets/guest/red-room/lora/scenes/staging/grok-dog-costume-v2/release-candidate/ratio-frames/wander-crop-middle.png` | `IMMERSIVE-SCENE` | Lora staging / QA frame | `IMMERSIVE-SCENE` | 712x400 | no | OWN-RUNTIME | PROTECTED |
| `assets/guest/red-room/lora/scenes/staging/grok-dog-costume-v2/release-candidate/ratio-frames/wander-pad-first.png` | `IMMERSIVE-SCENE` | Lora staging / QA frame | `IMMERSIVE-SCENE` | 736x414 | no | OWN-RUNTIME | PROTECTED |
| `assets/guest/red-room/lora/scenes/staging/grok-dog-costume-v2/release-candidate/ratio-frames/wander-pad-last.png` | `IMMERSIVE-SCENE` | Lora staging / QA frame | `IMMERSIVE-SCENE` | 736x414 | no | OWN-RUNTIME | PROTECTED |
| `assets/guest/red-room/lora/scenes/staging/grok-dog-costume-v2/release-candidate/ratio-frames/wander-pad-middle.png` | `IMMERSIVE-SCENE` | Lora staging / QA frame | `IMMERSIVE-SCENE` | 736x414 | no | OWN-RUNTIME | PROTECTED |
| `assets/guest/red-room/lora/scenes/v01-empty-counter-v1.png` | `IMMERSIVE-SCENE` | Lora runtime still / fallback | `IMMERSIVE-SCENE` | 1672x941 | no | OWN-RUNTIME | PROTECTED |
| `assets/guest/red-room/lora/scenes/v01-empty-counter-v1.webp` | `IMMERSIVE-SCENE` | Lora runtime still / fallback | `IMMERSIVE-SCENE` | 1672x941 | yes | OWN-RUNTIME | PROTECTED |
| `assets/guest/red-room/lora/scenes/v02-pig-arrive-far.webp` | `IMMERSIVE-SCENE` | Lora runtime still / fallback | `IMMERSIVE-SCENE` | 1024x576 | yes | OWN-RUNTIME | PROTECTED |
| `assets/guest/red-room/lora/scenes/v02-pig-arrive-mid.webp` | `IMMERSIVE-SCENE` | Lora runtime still / fallback | `IMMERSIVE-SCENE` | 1024x576 | yes | OWN-RUNTIME | PROTECTED |
| `assets/guest/red-room/lora/scenes/v02-pig-masked.webp` | `IMMERSIVE-SCENE` | Lora runtime still / fallback | `IMMERSIVE-SCENE` | 1024x576 | yes | OWN-RUNTIME | PROTECTED |
| `assets/guest/red-room/lora/scenes/v02-pig-wander.webp` | `IMMERSIVE-SCENE` | Lora runtime still / fallback | `IMMERSIVE-SCENE` | 1024x576 | yes | OWN-RUNTIME | PROTECTED |
| `assets/guest/red-room/lora/scenes/v03-pig-reveal-poster.webp` | `IMMERSIVE-SCENE` | Lora runtime still / fallback | `IMMERSIVE-SCENE` | 1024x576 | yes | OWN-RUNTIME | PROTECTED |
| `assets/guest/red-room/lora/scenes/v04-pig-unmasked.webp` | `IMMERSIVE-SCENE` | Lora runtime still / fallback | `IMMERSIVE-SCENE` | 1024x576 | yes | OWN-RUNTIME | PROTECTED |
| `assets/guest/red-room/lora/scenes/v05-fox-gaze.webp` | `IMMERSIVE-SCENE` | Lora runtime still / fallback | `IMMERSIVE-SCENE` | 1024x576 | yes | OWN-RUNTIME | PROTECTED |
| `assets/guest/red-room/lora/scenes/v06-fox-action.webp` | `IMMERSIVE-SCENE` | Lora runtime still / fallback | `IMMERSIVE-SCENE` | 1024x576 | yes | OWN-RUNTIME | PROTECTED |
| `assets/guest/red-room/lora/scenes/v07-dog-blank.webp` | `IMMERSIVE-SCENE` | Lora runtime still / fallback | `IMMERSIVE-SCENE` | 1024x576 | yes | OWN-RUNTIME | PROTECTED |
| `assets/guest/red-room/lora/scenes/v08-dog-aisle.webp` | `IMMERSIVE-SCENE` | Lora runtime still / fallback | `IMMERSIVE-SCENE` | 1024x576 | yes | OWN-RUNTIME | PROTECTED |
| `assets/guest/red-room/lora/scenes/v08-dog-settled.webp` | `IMMERSIVE-SCENE` | Lora runtime still / fallback | `IMMERSIVE-SCENE` | 1024x576 | yes | OWN-RUNTIME | PROTECTED |
| `assets/guest/red-room/lora/scenes/v08-dog-stand.webp` | `IMMERSIVE-SCENE` | Lora runtime still / fallback | `IMMERSIVE-SCENE` | 1024x576 | yes | OWN-RUNTIME | PROTECTED |
| `assets/guest/red-room/lora/scenes/v09-dog-curtain.webp` | `IMMERSIVE-SCENE` | Lora runtime still / fallback | `IMMERSIVE-SCENE` | 1024x576 | yes | OWN-RUNTIME | PROTECTED |
| `assets/guest/red-room/lora/scenes/v10-fox-dog.webp` | `IMMERSIVE-SCENE` | Lora runtime still / fallback | `IMMERSIVE-SCENE` | 1024x576 | yes | OWN-RUNTIME | PROTECTED |
| `assets/guest/red-room/lora/scenes/v11-dog-sleep.webp` | `IMMERSIVE-SCENE` | Lora runtime still / fallback | `IMMERSIVE-SCENE` | 1024x576 | yes | OWN-RUNTIME | PROTECTED |
| `assets/guest/red-room/lora/scenes/v12-empty-curtain.webp` | `IMMERSIVE-SCENE` | Lora runtime still / fallback | `IMMERSIVE-SCENE` | 1024x576 | yes | OWN-RUNTIME | PROTECTED |
| `assets/guest/red-room/lora/scenes/v14-fox-gum-bubble.png` | `IMMERSIVE-SCENE` | Lora runtime still / fallback | `IMMERSIVE-SCENE` | 1672x941 | no | OWN-RUNTIME | PROTECTED |
| `assets/guest/red-room/lora/scenes/v15-fox-candy-offer.png` | `IMMERSIVE-SCENE` | Lora runtime still / fallback | `IMMERSIVE-SCENE` | 1672x941 | no | OWN-RUNTIME | PROTECTED |
| `assets/guest/red-room/lora/scenes/v18-blue-key-cabinet.png` | `IMMERSIVE-SCENE` | Lora runtime still / fallback | `IMMERSIVE-SCENE` | 1672x941 | yes | OWN-RUNTIME | PROTECTED |
| `assets/guest/red-room/lora/scenes/v19-pig-tag.png` | `IMMERSIVE-SCENE` | Lora runtime still / fallback | `IMMERSIVE-SCENE` | 1024x768 | yes | OWN-RUNTIME | PROTECTED |
| `assets/guest/red-room/lora/scenes/v20-back-room.png` | `IMMERSIVE-SCENE` | Lora runtime still / fallback | `IMMERSIVE-SCENE` | 1024x576 | yes | OWN-RUNTIME | PROTECTED |
| `assets/guest/red-room/lora/scenes/v23-fox-album-start.png` | `IMMERSIVE-SCENE` | Lora runtime still / fallback | `IMMERSIVE-SCENE` | 752x416 | yes | OWN-RUNTIME | PROTECTED |
| `assets/guest/solnyshko/game/cotton-machine-idle.webp` | `IMMERSIVE-SCENE` | Solnyshko game still | `IMMERSIVE-SCENE` | 1024x1024 | yes | OWN-RUNTIME | PROTECTED |
| `assets/guest/solnyshko/game/cotton-machine-ready.webp` | `IMMERSIVE-SCENE` | Solnyshko game still | `IMMERSIVE-SCENE` | 960x960 | yes | OWN-RUNTIME | PROTECTED |
| `assets/guest/solnyshko/game/cotton-machine-sugar.webp` | `IMMERSIVE-SCENE` | Solnyshko game still | `IMMERSIVE-SCENE` | 960x960 | yes | OWN-RUNTIME | PROTECTED |
| `assets/guest/staff/irina_happy.jpg` | `PERSONNEL` | public portrait | `GUEST-FACADE` | 768x1024 | yes | SUBTYPE-CROP | — |
| `assets/guest/staff/kirill_happy.jpg` | `PERSONNEL` | public portrait | `GUEST-FACADE` | 764x1024 | yes | SUBTYPE-CROP | — |
| `assets/guest/staff/lora_happy.jpg` | `PERSONNEL` | public portrait | `GUEST-FACADE` | 764x1024 | yes | SUBTYPE-CROP | — |
| `assets/guest/staff/oleg_happy.webp` | `PERSONNEL` | public portrait | `GUEST-FACADE` | 1920x2560 | yes | SUBTYPE-CROP | — |
| `assets/guest/staff/pavel_happy.jpg` | `PERSONNEL` | public portrait | `GUEST-FACADE` | 559x1024 | yes | SUBTYPE-CROP | — |
| `assets/guest/thumb-ballpit.webp` | `ADVERTISEMENT` | location thumbnail / facade plate | `GUEST-FACADE` | 1920x2400 | yes | CLEAN-WIDE | — |
| `assets/guest/thumb-carousel.webp` | `ADVERTISEMENT` | location thumbnail / facade plate | `GUEST-FACADE` | 1920x2400 | yes | CLEAN-WIDE | — |
| `assets/guest/thumb-cinema.webp` | `ADVERTISEMENT` | location thumbnail / facade plate | `GUEST-FACADE` | 1920x2400 | yes | CLEAN-WIDE | — |
| `assets/guest/thumb-mirror.webp` | `ADVERTISEMENT` | location thumbnail / facade plate | `GUEST-FACADE` | 1920x2400 | yes | CLEAN-WIDE | — |
| `assets/guest/thumb-pool.webp` | `ADVERTISEMENT` | location thumbnail / facade plate | `GUEST-FACADE` | 1920x2400 | yes | CLEAN-WIDE | — |
| `assets/staff/about-slides.webp` | `EVENT-RECORD` | staff location still | `BROADCAST-ZHIR-TV` | 1024x1024 | yes | EVENT-CAMERA | CROP-QA |
| `assets/staff/broll/cinema.webp` | `CCTV` | location camera feed (legacy broll name) | `BROADCAST-ZHIR-TV` | 1024x1024 | yes | NATIVE-FRAME | NAME-QA |
| `assets/staff/broll/mall.webp` | `CCTV` | location camera feed (legacy broll name) | `BROADCAST-ZHIR-TV` | 1024x1024 | yes | NATIVE-FRAME | NAME-QA |
| `assets/staff/broll/park.webp` | `CCTV` | location camera feed (legacy broll name) | `BROADCAST-ZHIR-TV` | 1024x1024 | yes | NATIVE-FRAME | NAME-QA |
| `assets/staff/broll/pool.webp` | `CCTV` | location camera feed (legacy broll name) | `BROADCAST-ZHIR-TV` | 1024x1024 | yes | NATIVE-FRAME | NAME-QA |
| `assets/staff/broll/red-room.webp` | `CCTV` | location camera feed (legacy broll name) | `BROADCAST-ZHIR-TV` | 1024x1024 | yes | NATIVE-FRAME | NAME-QA |
| `assets/staff/broll/zoo.webp` | `CCTV` | location camera feed (legacy broll name) | `BROADCAST-ZHIR-TV` | 1024x1024 | yes | NATIVE-FRAME | NAME-QA |
| `assets/staff/cctv/pool-poster.jpg` | `CCTV` | fixed camera poster | `BROADCAST-ZHIR-TV` | 480x480 | yes | NATIVE-FRAME | — |
| `assets/staff/cctv/slide-poster.jpg` | `CCTV` | fixed camera poster | `BROADCAST-ZHIR-TV` | 480x480 | yes | NATIVE-FRAME | — |
| `assets/staff/cctv/zoo-poster.jpg` | `CCTV` | fixed camera poster | `BROADCAST-ZHIR-TV` | 480x480 | yes | NATIVE-FRAME | — |
| `assets/staff/cinema/cctv-loop-poster.webp` | `CCTV` | fixed cinema CCTV loop poster | `TYNDEX-TERMINAL` | 560x560 | yes | NATIVE-FRAME | WEBP-FALLBACK |
| `assets/staff/classes/animators.png` | `SCHEMA` | training or class plate | `BROADCAST-ZHIR-TV` | 1360x768 | yes | NO-CROP | — |
| `assets/staff/classes/class-10-sun-mask.webp` | `SCHEMA` | training plate / admin overlay | `BROADCAST-ZHIR-TV` | 900x1190 | yes | NO-CROP | WM-QA; OVERLAY |
| `assets/staff/classes/class-6.webp` | `SCHEMA` | training or class plate | `BROADCAST-ZHIR-TV` | 1280x720 | yes | NO-CROP | — |
| `assets/staff/classes/class-7.webp` | `SCHEMA` | training or class plate | `BROADCAST-ZHIR-TV` | 1280x721 | yes | NO-CROP | — |
| `assets/staff/classes/class-8.webp` | `SCHEMA` | training or class plate | `BROADCAST-ZHIR-TV` | 1280x723 | yes | NO-CROP | — |
| `assets/staff/classes/elite.webp` | `SCHEMA` | training or class plate | `BROADCAST-ZHIR-TV` | 1920x1081 | yes | NO-CROP | — |
| `assets/staff/classes/guides.webp` | `SCHEMA` | training or class plate | `BROADCAST-ZHIR-TV` | 1920x1072 | yes | NO-CROP | — |
| `assets/staff/classes/inspectors.jpg` | `SCHEMA` | training or class plate | `BROADCAST-ZHIR-TV` | 1200x677 | yes | NO-CROP | — |
| `assets/staff/classes/medics.webp` | `SCHEMA` | training or class plate | `BROADCAST-ZHIR-TV` | 1920x1072 | yes | NO-CROP | — |
| `assets/staff/classes/trap.png` | `SCHEMA` | training or class plate | `BROADCAST-ZHIR-TV` | 1360x768 | yes | NO-CROP | — |
| `assets/staff/classes/tyndex.webp` | `SCHEMA` | training or class plate | `BROADCAST-ZHIR-TV` | 1920x1072 | yes | NO-CROP | — |
| `assets/staff/curators/irina/action-aroma-cycle-poster.webp` | `EVENT-RECORD` | live curation state / interruption | `LIVE-CURATION` | 544x544 | yes | EVENT-CAMERA | — |
| `assets/staff/curators/irina/action-bear-head-on-poster.webp` | `EVENT-RECORD` | live curation state / interruption | `LIVE-CURATION` | 544x544 | yes | EVENT-CAMERA | — |
| `assets/staff/curators/irina/action-damaged-file-arrival-poster.webp` | `EVENT-RECORD` | live curation state / interruption | `LIVE-CURATION` | 544x544 | yes | EVENT-CAMERA | — |
| `assets/staff/curators/irina/action-file-preserved-poster.webp` | `EVENT-RECORD` | live curation state / interruption | `LIVE-CURATION` | 544x544 | yes | EVENT-CAMERA | — |
| `assets/staff/curators/irina/action-file-recognition-poster.webp` | `EVENT-RECORD` | live curation state / interruption | `LIVE-CURATION` | 544x544 | yes | EVENT-CAMERA | — |
| `assets/staff/curators/irina/action-hears-noise-poster.webp` | `EVENT-RECORD` | live curation state / interruption | `LIVE-CURATION` | 544x544 | yes | EVENT-CAMERA | — |
| `assets/staff/curators/irina/action-irina-reconnect-poster.webp` | `EVENT-RECORD` | live curation state / interruption | `LIVE-CURATION` | 544x544 | yes | EVENT-CAMERA | — |
| `assets/staff/curators/irina/action-private-file-poster.webp` | `EVENT-RECORD` | live curation state / interruption | `LIVE-CURATION` | 544x544 | yes | EVENT-CAMERA | — |
| `assets/staff/curators/irina/action-return-sit-poster.webp` | `EVENT-RECORD` | live curation state / interruption | `LIVE-CURATION` | 544x544 | yes | EVENT-CAMERA | — |
| `assets/staff/curators/irina/action-shush-exit-poster.webp` | `EVENT-RECORD` | live curation state / interruption | `LIVE-CURATION` | 544x544 | yes | EVENT-CAMERA | — |
| `assets/staff/curators/irina/action-unseen-interlocutor-poster.webp` | `EVENT-RECORD` | live curation state / interruption | `LIVE-CURATION` | 544x544 | yes | EVENT-CAMERA | — |
| `assets/staff/curators/irina/archive-elena-breach-poster.webp` | `EVENT-RECORD` | live curation state / interruption | `LIVE-CURATION` | 544x544 | yes | EVENT-CAMERA | — |
| `assets/staff/curators/irina/archive-elena-question-poster.webp` | `EVENT-RECORD` | live curation state / interruption | `LIVE-CURATION` | 544x544 | yes | EVENT-CAMERA | — |
| `assets/staff/curators/irina/archive-ulybarych-empty-chair-poster.webp` | `EVENT-RECORD` | live curation state / interruption | `LIVE-CURATION` | 544x544 | yes | EVENT-CAMERA | — |
| `assets/staff/curators/irina/artifacts/assigned-toy-polaroid.webp` | `PERSONAL` | curator artifact / private material | `PHOTO-EVIDENCE` | 1254x1254 | yes | PRESERVE-CARRIER | — |
| `assets/staff/curators/irina/artifacts/blue-key-evidence.webp` | `PERSONAL` | curator artifact / private material | `PHOTO-EVIDENCE` | 960x960 | yes | PRESERVE-CARRIER | — |
| `assets/staff/curators/irina/artifacts/damaged-child-file.webp` | `PERSONAL` | curator artifact / private material | `PHOTO-EVIDENCE` | 1254x1254 | yes | PRESERVE-CARRIER | — |
| `assets/staff/curators/irina/artifacts/irina-photobooth-strip.jpg` | `PERSONAL` | curator artifact / private material | `PHOTO-EVIDENCE` | 836x1881 | yes | PRESERVE-CARRIER | — |
| `assets/staff/curators/irina/artifacts/lost-child-route-ticket.webp` | `PERSONAL` | curator artifact / private material | `PHOTO-EVIDENCE` | 1254x1254 | yes | PRESERVE-CARRIER | — |
| `assets/staff/curators/irina/artifacts/memory-drawing.webp` | `PERSONAL` | curator artifact / private material | `PHOTO-EVIDENCE` | 1254x1254 | yes | PRESERVE-CARRIER | — |
| `assets/staff/curators/irina/artifacts/operator-empty-chair.webp` | `EVENT-RECORD` | room / operator evidence | `LIVE-CURATION` | 1254x1254 | yes | EVENT-CAMERA | — |
| `assets/staff/curators/irina/artifacts/post-aroma-dessert.webp` | `PERSONAL` | curator artifact / private material | `PHOTO-EVIDENCE` | 1254x1254 | yes | PRESERVE-CARRIER | — |
| `assets/staff/curators/irina/artifacts/recognition-cat-rabbit.webp` | `PERSONAL` | curator artifact / private material | `PHOTO-EVIDENCE` | 1254x1254 | yes | PRESERVE-CARRIER | — |
| `assets/staff/curators/irina/artifacts/return-your-childhood-leaflet.webp` | `PERSONAL` | curator artifact / private material | `PHOTO-EVIDENCE` | 1254x1254 | yes | PRESERVE-CARRIER | — |
| `assets/staff/curators/irina/artifacts/service-route-map.webp` | `SCHEMA` | service route map | `TYNDEX-TERMINAL` | 1254x1254 | yes | NO-CROP | — |
| `assets/staff/curators/irina/artifacts/ulybarych-broadcast.webp` | `EVENT-RECORD` | broadcast artifact | `LIVE-CURATION` | 1254x1254 | yes | EVENT-CAMERA | — |
| `assets/staff/curators/irina/artifacts/zhmuriki-postcard.webp` | `PERSONAL` | curator artifact / private material | `PHOTO-EVIDENCE` | 1254x1254 | yes | PRESERVE-CARRIER | — |
| `assets/staff/curators/irina/cctv-bear-corridor-poster.webp` | `CCTV` | curator interruption / fixed corridor feed | `LIVE-CURATION` | 544x544 | yes | NATIVE-FRAME | — |
| `assets/staff/curators/irina/cctv-pavel-observation-booth-poster.webp` | `EVENT-RECORD` | curator interruption / monitor room | `LIVE-CURATION` | 544x544 | yes | EVENT-CAMERA | AMBIGUOUS |
| `assets/staff/curators/irina/intrusion-disco-room-poster.webp` | `EVENT-RECORD` | live curation state / interruption | `LIVE-CURATION` | 544x544 | yes | EVENT-CAMERA | — |
| `assets/staff/curators/irina/intrusion-help-sign-poster.webp` | `EVENT-RECORD` | live curation state / interruption | `LIVE-CURATION` | 544x544 | yes | EVENT-CAMERA | — |
| `assets/staff/curators/irina/intrusion-plague-doctor-camera-poster.webp` | `EVENT-RECORD` | live curation state / interruption | `LIVE-CURATION` | 544x544 | yes | EVENT-CAMERA | — |
| `assets/staff/curators/irina/lost-child-terminal.webp` | `EVENT-RECORD` | live curation state / interruption | `LIVE-CURATION` | 544x544 | yes | EVENT-CAMERA | — |
| `assets/staff/curators/irina/room-empty.webp` | `EVENT-RECORD` | live curation state / interruption | `LIVE-CURATION` | 544x544 | yes | EVENT-CAMERA | — |
| `assets/staff/curators/irina/state-alarmed-poster.webp` | `EVENT-RECORD` | live curation state / interruption | `LIVE-CURATION` | 544x544 | yes | EVENT-CAMERA | — |
| `assets/staff/curators/irina/state-bear-neutral-poster.webp` | `EVENT-RECORD` | live curation state / interruption | `LIVE-CURATION` | 544x544 | yes | EVENT-CAMERA | — |
| `assets/staff/curators/irina/state-confidential-poster.webp` | `EVENT-RECORD` | live curation state / interruption | `LIVE-CURATION` | 544x544 | yes | EVENT-CAMERA | — |
| `assets/staff/curators/irina/state-file-investigation-poster.webp` | `EVENT-RECORD` | live curation state / interruption | `LIVE-CURATION` | 544x544 | yes | EVENT-CAMERA | — |
| `assets/staff/curators/irina/state-file-investigation-reference.png` | `EVENT-RECORD` | live curation state / interruption | `LIVE-CURATION` | 1254x1254 | no | EVENT-CAMERA | — |
| `assets/staff/curators/irina/state-neutral-poster.webp` | `EVENT-RECORD` | live curation state / interruption | `LIVE-CURATION` | 544x544 | yes | EVENT-CAMERA | — |
| `assets/staff/curators/irina/state-warm-poster.webp` | `EVENT-RECORD` | live curation state / interruption | `LIVE-CURATION` | 1344x1764 | yes | EVENT-CAMERA | — |
| `assets/staff/documents/adepts-check-every-cradle-poster.jpg` | `SCHEMA` | protocol / administrative reconstruction | `PAPER-FILE` | 1248x832 | yes | NO-CROP | RECONSTRUCTION |
| `assets/staff/documents/adepts-close-up-masks.webp` | `SCHEMA` | protocol / administrative reconstruction | `PAPER-FILE` | 1672x941 | yes | NO-CROP | RECONSTRUCTION |
| `assets/staff/documents/adepts-nevalyashka.jpg` | `SCHEMA` | protocol / administrative reconstruction | `PAPER-FILE` | 1248x832 | yes | NO-CROP | RECONSTRUCTION |
| `assets/staff/documents/adepts-praying.webp` | `SCHEMA` | protocol / administrative reconstruction | `PAPER-FILE` | 2528x1696 | yes | NO-CROP | RECONSTRUCTION |
| `assets/staff/documents/adepts-religion-art.webp` | `SCHEMA` | protocol / administrative reconstruction | `PAPER-FILE` | 2528x1696 | yes | NO-CROP | RECONSTRUCTION |
| `assets/staff/documents/adepts-rituals-illustration.webp` | `SCHEMA` | protocol / administrative reconstruction | `PAPER-FILE` | 1536x1024 | yes | NO-CROP | RECONSTRUCTION |
| `assets/staff/documents/adepts-sugar-messiah-mural.jpg` | `SCHEMA` | protocol / administrative reconstruction | `PAPER-FILE` | 1248x832 | yes | NO-CROP | RECONSTRUCTION |
| `assets/staff/documents/dossier-sz-312-01.jpg` | `EVENT-RECORD` | dossier event / recovered frame | `PAPER-FILE` | 1024x682 | yes | EVENT-CAMERA | — |
| `assets/staff/documents/dossier-sz-312-02.jpg` | `PERSONAL` | file / family / object evidence | `PAPER-FILE` | 1024x682 | yes | PRESERVE-CARRIER | — |
| `assets/staff/documents/dossier-sz-312-03.jpg` | `PERSONAL` | file / family / object evidence | `PAPER-FILE` | 1024x682 | yes | PRESERVE-CARRIER | — |
| `assets/staff/documents/dossier-sz-312-04.jpg` | `CCTV` | dossier camera evidence | `PAPER-FILE` | 1024x686 | yes | NATIVE-FRAME | — |
| `assets/staff/documents/dossier-sz-312-05.jpg` | `PERSONAL` | file / family / object evidence | `PAPER-FILE` | 1024x686 | yes | PRESERVE-CARRIER | AMBIGUOUS |
| `assets/staff/documents/dossier-sz-312-06.jpg` | `EVENT-RECORD` | dossier event / recovered frame | `PAPER-FILE` | 1024x681 | yes | EVENT-CAMERA | — |
| `assets/staff/documents/irina-carousel-record.webp` | `EVENT-RECORD` | dossier event / recovered frame | `PAPER-FILE` | 1792x1008 | yes | EVENT-CAMERA | — |
| `assets/staff/documents/irina-cotton-candy-stall.webp` | `EVENT-RECORD` | dossier event / recovered frame | `PAPER-FILE` | 1792x1008 | yes | EVENT-CAMERA | — |
| `assets/staff/documents/irina-gas-station-offer.webp` | `ADVERTISEMENT` | external promotional offer | `PAPER-FILE` | 1792x1008 | yes | CLEAN-WIDE | — |
| `assets/staff/documents/irina-parents-at-park.webp` | `PERSONAL` | file / family / object evidence | `PAPER-FILE` | 1792x1008 | yes | PRESERVE-CARRIER | — |
| `assets/staff/documents/kirill-zaytsev-administrative_reaction_assessment.webp` | `EVENT-RECORD` | dossier event / recovered frame | `PAPER-FILE` | 1248x832 | yes | EVENT-CAMERA | — |
| `assets/staff/documents/kirill-zaytsev-adrenalin_start_platform.webp` | `EVENT-RECORD` | dossier event / recovered frame | `PAPER-FILE` | 1248x832 | yes | EVENT-CAMERA | — |
| `assets/staff/documents/kirill-zaytsev-empty_promotion_planning_room.webp` | `EVENT-RECORD` | dossier event / recovered frame | `PAPER-FILE` | 1248x832 | yes | EVENT-CAMERA | — |
| `assets/staff/documents/kirill-zaytsev-final_trial_bunny_suit.webp` | `EVENT-RECORD` | dossier event / recovered frame | `PAPER-FILE` | 1248x832 | yes | EVENT-CAMERA | — |
| `assets/staff/documents/kirill-zaytsev-first_arrival_in_complex.webp` | `EVENT-RECORD` | dossier event / recovered frame | `PAPER-FILE` | 1248x832 | yes | EVENT-CAMERA | — |
| `assets/staff/documents/kirill-zaytsev-pink_bunny_dossier_portrait.webp` | `PERSONNEL` | dossier portrait | `PERSONAL-FILE` | 1248x832 | yes | SUBTYPE-CROP | — |
| `assets/staff/documents/kirill-zaytsev-pool_after_disappearance.webp` | `EVENT-RECORD` | dossier event / recovered frame | `PAPER-FILE` | 1248x832 | yes | EVENT-CAMERA | — |
| `assets/staff/documents/kirill-zaytsev-red_room_freedom_or_key.webp` | `EVENT-RECORD` | dossier event / recovered frame | `PAPER-FILE` | 1248x832 | yes | EVENT-CAMERA | — |
| `assets/staff/documents/kirill-zaytsev-sun_mask_observation.webp` | `EVENT-RECORD` | dossier event / recovered frame | `PAPER-FILE` | 1248x832 | yes | EVENT-CAMERA | — |
| `assets/staff/documents/kirill-zaytsev-trap_tester_harness_room.webp` | `EVENT-RECORD` | dossier event / recovered frame | `PAPER-FILE` | 1248x832 | yes | EVENT-CAMERA | — |
| `assets/staff/documents/laura-and-plague-doctor.webp` | `EVENT-RECORD` | dossier event / recovered frame | `PAPER-FILE` | 1248x832 | yes | EVENT-CAMERA | — |
| `assets/staff/documents/laura-behind-the-scene.webp` | `EVENT-RECORD` | dossier event / recovered frame | `PAPER-FILE` | 1248x832 | yes | EVENT-CAMERA | — |
| `assets/staff/documents/laura-employee-of-the-month.webp` | `EVENT-RECORD` | dossier event / recovered frame | `PAPER-FILE` | 1248x832 | yes | EVENT-CAMERA | — |
| `assets/staff/documents/laura-full-body.webp` | `PERSONNEL` | dossier portrait | `PERSONAL-FILE` | 1248x832 | yes | SUBTYPE-CROP | — |
| `assets/staff/documents/laura-sleeping.webp` | `EVENT-RECORD` | dossier event / recovered frame | `PAPER-FILE` | 1248x832 | yes | EVENT-CAMERA | — |
| `assets/staff/documents/laura-theater-audition.webp` | `EVENT-RECORD` | dossier event / recovered frame | `PAPER-FILE` | 1248x832 | yes | EVENT-CAMERA | — |
| `assets/staff/documents/laura-theater.webp` | `EVENT-RECORD` | dossier event / recovered frame | `PAPER-FILE` | 1248x832 | yes | EVENT-CAMERA | — |
| `assets/staff/documents/laura-writing.webp` | `EVENT-RECORD` | dossier event / recovered frame | `PAPER-FILE` | 1248x832 | yes | EVENT-CAMERA | — |
| `assets/staff/documents/media-elena-cafe.webp` | `EVENT-RECORD` | dossier event / recovered frame | `PAPER-FILE` | 1248x832 | yes | EVENT-CAMERA | — |
| `assets/staff/documents/media-host-trust-coefficient.webp` | `SCHEMA` | protocol / administrative reconstruction | `PAPER-FILE` | 1248x832 | yes | NO-CROP | — |
| `assets/staff/documents/media-kapitanov-studio.webp` | `EVENT-RECORD` | dossier event / recovered frame | `PAPER-FILE` | 1248x832 | yes | EVENT-CAMERA | — |
| `assets/staff/documents/media-small-contingent-guide.webp` | `SCHEMA` | protocol / administrative reconstruction | `PAPER-FILE` | 1248x832 | yes | NO-CROP | — |
| `assets/staff/documents/media-ulybarych-playroom.webp` | `EVENT-RECORD` | dossier event / recovered frame | `PAPER-FILE` | 1248x832 | yes | EVENT-CAMERA | — |
| `assets/staff/documents/pavel-auction-porcelain-mask.webp` | `EVENT-RECORD` | dossier event / recovered frame | `PAPER-FILE` | 1792x1008 | yes | EVENT-CAMERA | — |
| `assets/staff/documents/pavel-childhood-vhs-room.webp` | `PERSONAL` | file / family / object evidence | `PAPER-FILE` | 1536x1024 | yes | PRESERVE-CARRIER | — |
| `assets/staff/documents/pavel-illusion-cinema.webp` | `EVENT-RECORD` | dossier event / recovered frame | `PAPER-FILE` | 1536x1024 | yes | EVENT-CAMERA | — |
| `assets/staff/documents/pavel-moose-island-blind-spot.webp` | `EVENT-RECORD` | dossier event / recovered frame | `PAPER-FILE` | 1536x1024 | yes | EVENT-CAMERA | — |
| `assets/staff/documents/pavel-observation-booth.webp` | `EVENT-RECORD` | dossier event / recovered frame | `PAPER-FILE` | 1536x1024 | yes | EVENT-CAMERA | — |
| `assets/staff/documents/pavel-passport-office.webp` | `EVENT-RECORD` | dossier event / recovered frame | `PAPER-FILE` | 1536x1024 | yes | EVENT-CAMERA | — |
| `assets/staff/documents/pavel-personnel-portrait.webp` | `PERSONNEL` | dossier portrait | `PERSONAL-FILE` | 1536x1024 | yes | SUBTYPE-CROP | — |
| `assets/staff/documents/pavel-return-service-hatch.webp` | `EVENT-RECORD` | dossier event / recovered frame | `PAPER-FILE` | 1792x1008 | yes | EVENT-CAMERA | — |
| `assets/staff/documents/pavel-theater-leaflet.webp` | `EVENT-RECORD` | dossier event / recovered frame | `PAPER-FILE` | 1792x1008 | yes | EVENT-CAMERA | — |
| `assets/staff/documents/protocol-312-r-lab-01.webp` | `EVENT-RECORD` | dossier event / recovered frame | `PAPER-FILE` | 1536x1024 | yes | EVENT-CAMERA | — |
| `assets/staff/documents/protocol-312-r-lab-02.webp` | `EVENT-RECORD` | dossier event / recovered frame | `PAPER-FILE` | 1473x1068 | yes | EVENT-CAMERA | — |
| `assets/staff/documents/protocol-312-r-lab-03.webp` | `EVENT-RECORD` | dossier event / recovered frame | `PAPER-FILE` | 1448x1086 | yes | EVENT-CAMERA | — |
| `assets/staff/documents/protocol-312-t-infographic.webp` | `SCHEMA` | protocol / administrative reconstruction | `PAPER-FILE` | 1024x1536 | yes | NO-CROP | — |
| `assets/staff/documents/protocol-playground-schema-01.webp` | `SCHEMA` | protocol / administrative reconstruction | `PAPER-FILE` | 1536x1024 | yes | NO-CROP | — |
| `assets/staff/documents/protocol-playground-schema-02.webp` | `SCHEMA` | protocol / administrative reconstruction | `PAPER-FILE` | 1536x1024 | yes | NO-CROP | — |
| `assets/staff/documents/protocol-playground-schema-03.webp` | `SCHEMA` | protocol / administrative reconstruction | `PAPER-FILE` | 1536x1024 | yes | NO-CROP | — |
| `assets/staff/documents/ulybarych-message-avatar.webp` | `UTILITY` | UI avatar | `BROADCAST-ZHIR-TV` | 512x512 | yes | CONTEXT-SPECIFIC | — |
| `assets/staff/logo.png` | `UTILITY` | brand mark | `SHELL` | 760x200 | yes | CONTEXT-SPECIFIC | — |
| `assets/staff/mall/cctv-loop-poster.webp` | `CCTV` | fixed toy-store CCTV loop poster | `TYNDEX-TERMINAL` | 560x560 | yes | NATIVE-FRAME | WEBP-FALLBACK |
| `assets/staff/park/cctv-loop-poster.webp` | `CCTV` | fixed carousel CCTV loop poster | `TYNDEX-TERMINAL` | 544x544 | yes | NATIVE-FRAME | WEBP-FALLBACK |
| `assets/staff/personnel/irina-record.webp` | `PERSONNEL` | record strip / front-profile capture | `PERSONAL-FILE` | 1536x865 | yes | SUBTYPE-CROP | — |
| `assets/staff/personnel/kirill-record.webp` | `PERSONNEL` | record strip / front-profile capture | `PERSONAL-FILE` | 1536x640 | yes | SUBTYPE-CROP | — |
| `assets/staff/personnel/laura-record.webp` | `PERSONNEL` | record strip / front-profile capture | `PERSONAL-FILE` | 1536x640 | yes | SUBTYPE-CROP | — |
| `assets/staff/personnel/oleg-record.webp` | `PERSONNEL` | record strip / front-profile capture | `PERSONAL-FILE` | 1536x768 | yes | SUBTYPE-CROP | — |
| `assets/staff/personnel/pavel-record.webp` | `PERSONNEL` | record strip / front-profile capture | `PERSONAL-FILE` | 1536x640 | yes | SUBTYPE-CROP | — |
| `assets/staff/photos/polaroid-empty-pool.webp` | `PERSONAL` | Polaroid / physical photo | `PHOTO-EVIDENCE` | 900x900 | yes | PRESERVE-CARRIER | — |
| `assets/staff/photos/polaroid-mascot-corridor.webp` | `PERSONAL` | Polaroid / physical photo | `PHOTO-EVIDENCE` | 900x900 | yes | PRESERVE-CARRIER | — |
| `assets/staff/photos/polaroid-play-area.webp` | `PERSONAL` | Polaroid / physical photo | `PHOTO-EVIDENCE` | 900x900 | yes | PRESERVE-CARRIER | — |
| `assets/staff/player-avatars/avatar-01.webp` | `UTILITY` | UI avatar | `BROADCAST-ZHIR-TV` | 960x1280 | yes | CONTEXT-SPECIFIC | — |
| `assets/staff/player-avatars/avatar-02.webp` | `UTILITY` | UI avatar | `BROADCAST-ZHIR-TV` | 960x1280 | yes | CONTEXT-SPECIFIC | — |
| `assets/staff/player-avatars/avatar-03-fox.webp` | `UTILITY` | UI avatar | `BROADCAST-ZHIR-TV` | 960x1280 | yes | CONTEXT-SPECIFIC | — |
| `assets/staff/player-avatars/avatar-04-dog.webp` | `UTILITY` | UI avatar | `BROADCAST-ZHIR-TV` | 960x1280 | yes | CONTEXT-SPECIFIC | — |
| `assets/staff/pool/comic1.webp` | `EVENT-RECORD` | illustrated reconstruction | `TYNDEX-TERMINAL` | 1024x1024 | yes | EVENT-CAMERA | — |
| `assets/staff/pool/comic2.webp` | `EVENT-RECORD` | illustrated reconstruction | `TYNDEX-TERMINAL` | 1024x1024 | yes | EVENT-CAMERA | — |
| `assets/staff/pool/comic3.webp` | `EVENT-RECORD` | illustrated reconstruction | `TYNDEX-TERMINAL` | 1024x1024 | yes | EVENT-CAMERA | — |
| `assets/staff/red-room/cctv-loop-poster.webp` | `CCTV` | fixed cafe CCTV loop poster | `TYNDEX-TERMINAL` | 544x544 | yes | NATIVE-FRAME | WEBP-FALLBACK |
| `assets/staff/staff/alice-message-avatar.webp` | `UTILITY` | UI avatar | `BROADCAST-ZHIR-TV` | 512x512 | yes | CONTEXT-SPECIFIC | — |
| `assets/staff/staff/irina_sad.jpg` | `PERSONNEL` | internal personnel card | `BROADCAST-ZHIR-TV` | 764x1024 | yes | SUBTYPE-CROP | — |
| `assets/staff/staff/kirill_sad.jpg` | `PERSONNEL` | internal personnel card | `BROADCAST-ZHIR-TV` | 761x1024 | yes | SUBTYPE-CROP | — |
| `assets/staff/staff/lora-message-avatar.webp` | `UTILITY` | UI avatar | `BROADCAST-ZHIR-TV` | 512x512 | yes | CONTEXT-SPECIFIC | — |
| `assets/staff/staff/lora_sad.jpg` | `PERSONNEL` | internal personnel card | `BROADCAST-ZHIR-TV` | 764x1024 | yes | SUBTYPE-CROP | — |
| `assets/staff/staff/oleg_sad.webp` | `PERSONNEL` | internal personnel card | `BROADCAST-ZHIR-TV` | 1920x2560 | yes | SUBTYPE-CROP | — |
| `assets/staff/staff/pavel_sad.jpg` | `PERSONNEL` | internal personnel card | `BROADCAST-ZHIR-TV` | 559x1024 | yes | SUBTYPE-CROP | — |
| `assets/staff/tv/adrenaline-poster.webp` | `EVENT-RECORD` | VHS playback poster / fallback | `VHS-PLAYBACK` | 720x720 | yes | EVENT-CAMERA | — |
| `assets/staff/tv/pavel-cassette-poster.webp` | `EVENT-RECORD` | VHS playback poster / fallback | `VHS-PLAYBACK` | 720x720 | yes | EVENT-CAMERA | — |
| `assets/staff/tv/sytno-poster.webp` | `EVENT-RECORD` | VHS playback poster / fallback | `VHS-PLAYBACK` | 720x720 | yes | EVENT-CAMERA | — |
| `assets/staff/tv/ulybarych-poster.webp` | `EVENT-RECORD` | VHS playback poster / fallback | `VHS-PLAYBACK` | 720x720 | yes | EVENT-CAMERA | — |
| `assets/staff/tv/zhmuriki-poster.webp` | `EVENT-RECORD` | VHS playback poster / fallback | `VHS-PLAYBACK` | 720x720 | yes | EVENT-CAMERA | — |
| `assets/staff/zoo/comic1.webp` | `EVENT-RECORD` | illustrated reconstruction | `TYNDEX-TERMINAL` | 1920x1920 | yes | EVENT-CAMERA | — |
| `assets/staff/zoo/comic2.webp` | `EVENT-RECORD` | illustrated reconstruction | `TYNDEX-TERMINAL` | 1024x1024 | yes | EVENT-CAMERA | — |
| `assets/staff/zoo/comic3.webp` | `EVENT-RECORD` | illustrated reconstruction | `TYNDEX-TERMINAL` | 1920x1920 | yes | EVENT-CAMERA | — |
