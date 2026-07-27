# Curator call ambience

`call-room-tone.ogg` and `call-room-tone.mp3` are browser-ready versions of
the same 3:09 seamless ambient loop used by Irina's call.

The loop combines the four 30-second ElevenLabs source renders in this order:

1. base
2. air
3. base
4. distant
5. base
6. signal
7. base

Adjacent clips use three-second crossfades. The end is blended into the
beginning, and the final master is normalized to approximately -28 LUFS with
true peaks below -12 dBFS. The original Desktop files are not copied into the
site.

## Session sound effects

Browser-ready MP3 files live in `sfx/`. They are derived from the ElevenLabs
source renders supplied for the curator call:

- `irina-keyboard.mp3` plays only while Irina's text is being revealed;
- `aroma-airflow.mp3` follows the full twenty-second aroma-treatment video;
- `baby-cry-costume.mp3` plays when the empty-costume scenario first mentions
  crying from inside the shell;
- `disco-room-music.mp3` follows the ten-second disco interruption and retains
  the fade built into the supplied Suno source;
- `muffled-help.mp3` has a 1.5-second silent pre-roll, then stretches the
  supplied one-second restrained voice to approximately two seconds without
  lowering its pitch so the murmur begins with the masked figure;
- `plague-doctor-string-sting.mp3` marks the Doctor's first frame, while the
  existing synthesized camera tone remains attached to the flash;
- `unknown-female-voice.mp3` is the only clearly articulated spoken line in the
  session and plays in the empty-room scene;
- the three `child-laugh-*` files use one performance with distance, archive,
  and close treatments so the same child appears to move through the session.
- `elena-tick-loop.ogg` and `.mp3` are the uniform eight-second quiz timer.
  The browser loops it only while Elena's answer controls are active;
- `elena-breach-transition.ogg` and `.mp3` are a one-shot twelve-second
  ticking escalation used when the archive stops behaving like a recording.

The source renders remain on the creator's Desktop and are not deployed.
High-level source files were attenuated and filtered before MP3 encoding so
the aroma, cries, voices, and string sting cannot reach their original
near-zero-dB peaks in the browser mix.

Sound remains opt-in. Turning sound off, closing the call, changing nodes, or
revealing a line early stops the relevant foreground or typing audio.
