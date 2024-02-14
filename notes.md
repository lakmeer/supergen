
# Notes

- Voice Synth
  - References
    - https://github.com/GoogleChromeLabs/web-audio-samples/tree/main/src/demos/wavetable-synth/wave-tables
    - https://waveeditonline.com/

# Todo

- Remove sub curve
- Decouple base freq from Evens curve
  - Base freq always max volume?
  - If there's a slider for it, attach sub gain to this slider, possibly with a falloff
- Travelling pair
  - Two frequencies v close to each other based on the +6 and +8 positions with stride 1,
    at a relative gain of .7 and .5 (ish) respectively.
  - Move the pair either with a manual control or with the stride
    - Test both: how does each one affect the beating?
    -
  - Try using a curve on the pair with a Q that introduces more neighbouring frequencies
  - Alternate mode?
    - Dropdown: Control mode: 'Evens and Odds' vs 'Travelling Pair'
- Play with panning rates
- Sub vibration output simulator/visualiser

