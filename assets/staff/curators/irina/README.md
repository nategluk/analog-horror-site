# Irina curator media

Web-ready media for curator `0091-A`.

## Playback

- State clips are short performances, not seamless loops. Play them once and
  leave the video on its final frame while the player reads or chooses.
- Action clips play once. `action-shush-exit.mp4` hands off to
  `artifacts/operator-empty-chair.webp`.
- Show document and observation stills with shared CSS signal noise,
  flicker, scanlines, and subtle digital drift. Do not bake those effects into
  the asset.
- Insert a brief signal glitch before `action-return-sit.mp4`: its source
  camera geometry differs slightly from the final empty-room frame in
  `action-shush-exit.mp4`.
- `action-aroma-cycle.mp4` is a single 20-second sequence: Irina notices the
  warning, puts on the gas mask, and waits while pink fog fills the room. Do
  not split it into preparation and fog files.
- Trigger the Plague Doctor flash in HTML/CSS after
  `intrusion-plague-doctor-camera.mp4`; the video intentionally hands off to
  the interface effect.
- `intrusion-disco-room.mp4` interrupts the early rapport sequence. Hold choices
  until the normal lighting returns, then let the player ask what happened.
  Its opt-in foreground audio is `assets/audio/curator/sfx/disco-room-music.mp3`.
- `intrusion-help-sign.mp4` replaces the static Irina state during the line
  about accepting her parents' decision. Do not add a separate explanation:
  the existing `НЕ БУДУ ЗАБЫВАТЬ` and `ХОРОШО` choices answer both Irina and
  the figure behind her. Its opt-in foreground audio is the two-second
  murmur in `assets/audio/curator/sfx/muffled-help.mp3`; the file includes a
  1.5-second pre-roll matching the figure's delayed appearance.
- The damaged-child route arc uses `action-damaged-file-arrival`,
  `action-file-recognition`, the reusable `state-file-investigation`,
  `archive-elena-question`, `archive-elena-breach`, `action-irina-reconnect`,
  and `action-file-preserved`. Elena's question clip may be replayed for more
  than one question; the text and choices stay in HTML.
- `archive-elena-question` uses the separate seamless quiz timer while choices
  are visible. `archive-elena-breach` uses the one-shot transition. Neither
  sound is baked into the video.
- The `artifacts/` directory contains still channel interruptions, materials
  saved to the player's personnel file, and Irina's optional downloadable
  private photograph. WebP assets retain their generated square resolution
  and are stripped of source metadata.
- `lost-child-terminal.webp` is the physical terminal feed. Its CRT contains no
  baked controls; status text stays in HTML and the two physical keys are the
  real dialogue buttons below the feed.
- Keep captions, call controls, IDs, timestamps, and signal indicators in
  HTML/CSS rather than in the video.

## Encoding

- H.264 MP4
- 544 x 544
- 24 fps
- `yuv420p`
- fast-start metadata
- no audio or attached-picture streams
- WebP first-frame posters

The original generated files remain on the Desktop and were not modified.
