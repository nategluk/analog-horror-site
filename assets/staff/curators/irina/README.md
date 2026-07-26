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
- The `artifacts/` directory contains still channel interruptions, materials
  saved to the player's personnel file, and Irina's optional downloadable
  private photograph. WebP assets retain their generated square resolution
  and are stripped of source metadata.
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
