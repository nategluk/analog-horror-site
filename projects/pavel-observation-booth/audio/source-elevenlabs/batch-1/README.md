# Pavel audio batch 1 — ElevenLabs sources

Generated 2026-08-30 through the official ElevenLabs MCP after explicit user
approval. These files are production candidates, not public runtime assets.
Only accepted and locally mastered files may be copied to
`assets/audio/guest/pavel/` and entered in the shared ready-asset catalog.

## Usage

- Account counter before batch: `10950 / 90000`.
- Account counter after batch and approved knock retry: `12926 / 90000`.
- Batch cost including retry: `1976` credits.
- Overage after batch: `$0`.
- Calls: two Music v2 compositions and four Sound Effects generations.

## Candidates

| File | Intended stable ID | Duration | Technical QA | Acceptance |
| --- | --- | ---: | --- | --- |
| `music-tour-calm-source.mp3` | `pavel.music.tour-calm` | 30.024s | MP3, 48kHz stereo; mean -33.3 dBFS, peak -17.1 dBFS | accepted; mastered to `assets/audio/guest/pavel/music-tour-calm-loop.mp3` |
| `music-drain-anxiety-source.mp3` | `pavel.music.drain-anxiety` | 30.024s | MP3, 48kHz stereo; mean -17.5 dBFS, peak 0.0 dBFS | accepted; mastered to `assets/audio/guest/pavel/music-drain-anxiety-loop.mp3` |
| `sfx-drain-wet-gurgle-source.mp3` | `shared.pipe.wet-gurgle` | 3.030s | MP3, 44.1kHz stereo; mean -29.7 dBFS, peak -9.5 dBFS | accepted; mastered to `assets/audio/guest/pavel/sfx-drain-wet-gurgle.mp3` |
| `sfx-cleaner-pour-drain-source.mp3` | `shared.drain.cleaner-pour` | 4.049s | MP3, 44.1kHz stereo; mean -25.7 dBFS, peak -4.1 dBFS | accepted; mastered to `assets/audio/guest/pavel/sfx-cleaner-pour-drain.mp3` |
| `sfx-water-slide-enclosed-source.mp3` | `shared.water.enclosed-slide` | 5.042s | MP3, 44.1kHz stereo; mean -25.0 dBFS, peak -2.5 dBFS | accepted; mastered to `assets/audio/guest/pavel/sfx-water-slide-enclosed.mp3` |
| `sfx-three-knocks-service-door-rejected.mp3` | none | 3.030s | MP3, 44.1kHz stereo; waveform contains one dominant initial impact rather than three discrete knocks | rejected; never publish or catalog as ready |
| `sfx-three-knocks-service-door-retry-overcount.mp3` | none | 2.586s | MP3, 44.1kHz stereo; generated five distinct impacts instead of three | rejected as a raw cue; retained as edit source only |
| `sfx-three-knocks-service-door-edited.mp3` | `shared.door.three-knocks` | 2.638s | local edit of three distinct retry impacts at 0.398s, 1.197s and 2.007s | accepted; mastered to `assets/audio/guest/pavel/sfx-three-knocks-service-door.mp3` |

## Submitted prompts

### `pavel.music.tour-calm`

> Instrumental background music for a quiet guided tour through a worn
> late-Soviet institutional service block. Calm, modest and slightly faded,
> like an old educational film or municipal visitor tape. Soft electric piano,
> restrained analog synth pad, faint tape wow and gentle mechanical warmth.
> Slow and unobtrusive, no vocals, no spoken words, no choir, no drums, no
> dramatic build, no horror sting, no bright pop melody, no cinematic climax.
> Keep dynamics even and make the ending compatible with a seamless ambient
> loop.

### `pavel.music.drain-anxiety`

> Instrumental low-volume anxiety bed for an old institutional bathroom and
> sewer drain in an analog-horror web game. Sparse industrial ambient: low pipe
> resonance, damp sub-bass drone, unstable fluorescent overtones, distant
> metallic harmonics and very slow pressure changes. Claustrophobic and
> increasingly uneasy but restrained and plausible as building vibration. No
> vocals, no whispers, no creature voice, no heartbeat, no percussion, no jump
> scare, no braam, no trailer rise, no melody, no climax. Even dynamics,
> minimal movement, ending compatible with a seamless loop.

### `shared.door.three-knocks` — rejected output

> Exactly three firm human knuckle knocks on a heavy insulated institutional
> service door made of painted metal, evenly spaced, heard from inside the
> room. Three impacts only. Dry close perspective with a short dull metal
> resonance. No fourth knock, no handle movement, no latch, no door opening,
> no creak, no footsteps, no voice, no music, no cinematic boom.

### `shared.door.three-knocks` — retry source

> Three separate identical knuckle knocks on a closed painted metal door.
> Knock at 0.3 seconds. Silence. Knock at 1.1 seconds. Silence. Knock at 1.9
> seconds. Exactly three isolated impacts total, with clear quiet gaps between
> them. No knocking sequence inside each impact, no fourth sound, no echo tail,
> no handle, no latch, no opening door, no footsteps, no voice, no ambience, no
> music.

### `shared.pipe.wet-gurgle`

> A short wet plumbing gurgle from deep inside an old floor drain: two
> irregular muffled churning gulps, confined inside narrow pipes, damp and
> slightly organic but still plausibly ordinary building plumbing. Close
> institutional bathroom perspective. No flowing faucet, no toilet flush, no
> coffee machine, no creature voice, no growl, no scream, no impact, no music.

### `shared.drain.cleaner-pour`

> One continuous close-up Foley sequence in an old tiled bathroom: thin
> cleaning liquid pours from a plastic bottle through a metal floor-drain
> grate, splashes inside the pipe, then produces a brief restrained foamy
> chemical fizz and one subtle shift of wet hair against the grate. Realistic
> small scale, no explosion, no corrosive fantasy effect, no creature
> vocalization, no swallowing, no scream, no music.

### `shared.water.enclosed-slide`

> Water suddenly begins rushing through an old enclosed fiberglass water slide
> viewed from inside the service entrance. A confined hollow tube resonance,
> steady accelerating flow and close splashes moving away into darkness.
> Realistic neglected indoor water attraction, tense but not cinematic. No
> person, no footsteps, no body impact, no scream, no voice, no music, no
> mechanical motor, no dramatic hit.
