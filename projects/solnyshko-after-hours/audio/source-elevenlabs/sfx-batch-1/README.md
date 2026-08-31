# Solnyshko after-hours — SFX batch 1 sources

Generated 2026-08-31 through the official ElevenLabs MCP after explicit user
approval of the GENERATE list. Production candidates stay here until accepted
and mastered.

## Usage

- Account counter before batch: `14932 / 90000`.
- Account counter after batch: `15101 / 90000`.
- Batch cost: `169` credits. Overage `$0`.
- Calls: five Sound Effects generations.

## Candidates

| File | Intended stable ID | Duration | Technical QA | Acceptance |
| --- | --- | ---: | --- | --- |
| `sfx-gate-chain-source.mp3` | `solnyshko.sfx.gate-chain` | 2.795s | MP3 44.1kHz stereo; mean -28.1 dBFS, peak -0.7 dBFS | accepted; mastered to `assets/audio/guest/solnyshko/sfx-gate-chain.mp3` |
| `sfx-gate-open-source.mp3` | none as raw | 5.042s | 1.7s leading silence | trimmed then mastered |
| `sfx-gate-open-trimmed.mp3` | `solnyshko.sfx.gate-open` | 3.422s | leading silence removed | accepted; mastered to `assets/audio/guest/solnyshko/sfx-gate-open.mp3` |
| `sfx-carousel-mechanism-source.mp3` | `solnyshko.sfx.carousel-mechanism` | 4.519s | mean -21.2 dBFS, peak -0.6 dBFS | accepted; mastered |
| `sfx-cotton-spinner-source.mp3` | `solnyshko.sfx.cotton-spinner` | 3.239s | mean -19.0 dBFS, peak -5.0 dBFS | accepted; mastered |
| `sfx-lock-finger-taps-source.mp3` | none | 1.411s | three transients at 0.287s, 0.559s, 1.022s | rejected as a raw cue; third hit removed |
| `sfx-lock-finger-taps-edited.mp3` | `solnyshko.sfx.lock-finger-taps` | 0.862s | two transients at 0.287s and 0.559s | accepted; mastered |

MCP timestamped copies (`sfx_Heavy_*`, `sfx_A_tal_*`, `sfx_An_em_*`,
`sfx_Close_*`, `sfx_Two_l_*`) are the same raw takes.

## Submitted prompts

### `solnyshko.sfx.gate-chain`

> Heavy steel chain and a rusted padlock rattle once against a closed painted
> metal amusement-park gate at night. Close Foley: chain links scrape the bar,
> the lock body knocks once, then the chain settles. No gate opening, no
> footsteps, no voice, no music, no cinematic boom.

### `solnyshko.sfx.gate-open`

> A tall late-Soviet amusement-park iron gate slowly opens at night: long rusty
> hinge creak, the heavy leaf swings inward, and a chain drops aside. One
> continuous opening. Outdoor close-to-mid Foley. No slam, no alarm, no voice,
> no music, no crowd footsteps.

### `solnyshko.sfx.carousel-mechanism`

> An empty old children's carousel at night: slow grinding gearbox, a tired
> electric motor, and one lazy half-turn of metal horses on a worn platform,
> then it almost stops. Modest fairground mechanism. No children, no laughter,
> no calliope, no music, no scream, no voice.

### `solnyshko.sfx.cotton-spinner`

> Close Foley of a small night-time cotton-candy stall: electric spinner bowl
> humming, sugar granules hitting a hot drum, a paper stick rustle. Modest
> Soviet prize stall. No carnival music, no voice, no children, no steam
> explosion.

### `solnyshko.sfx.lock-finger-taps`

> Two light fingertip taps on a cold metal padlock of a closed park gate, dry
> and close, proving it is locked. Tap at 0.2 seconds. Silence. Tap at 0.8
> seconds. Exactly two isolated metal ticks. No chain rattle, no third tap, no
> gate opening, no voice, no music.
