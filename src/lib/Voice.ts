
import { round, pow, nrand, cos, sin, TAU } from '$lib/utils'

import WaveTable from '$lib/wavetable'


//
// Voice Synth
//
// A chorus of almost-in-tune wavetable oscillators.
// TODO:
//  - Bring back formant filtering, maybe
//  - Tension/etc params from SIM-THROAT, pending response from author
//
// Vowel space:
//   A --- I
//   |     |
//   O --- U


// Config

const MAX_OSCS = 32
const MIN_Q    = 0.1
const MAX_Q    = 5
const DEFAULT_VOICES = 16
const WANDER_SPEED = 0.2


// Load WaveTable data

import WAVE_DATA from '../data/vowels.wavedata?raw'

const TONES = Object.fromEntries(
  WaveTable.loadLibrary(WAVE_DATA)
    .map(wt => wt.truncate(40))
    .map(wt => [ wt.name, wt ]))


// Main Class

export default class Voice {

  oscs:       OscillatorNode[]
  left:       StereoPannerNode
  right:      StereoPannerNode
  mixer:      GainNode
  out:        GainNode
  level:      AudioParam

  wander:     boolean   // Automatically drift around the vowel space
  #phase:     number    // Current phase of the wander

  #x:         number    // Vowel blend X coord
  #y:         number    // Vowel blend Y coord
  #wave:      WaveTable // Blended vowel table

  #freq:      number    // Base frequency
  #voices:    number    // Number of oscillators active
  #spread:    number    // Detune spread
  #oct:       number    // Octave shift

  constructor (ctx:AudioContext) {

    // Setup
    this.#freq     = 55
    this.#spread   = 0
    this.#voices   = 0
    this.#oct      = -1

    this.#x = 0
    this.#y = 0
    this.#wave = TONES.A

    this.wander = true
    this.#phase = TAU * 5/8   // Start in the 'A' zone (y is flipped)

    this.left = ctx.createStereoPanner()
    this.left.pan.value = -1.0

    this.right = ctx.createStereoPanner()
    this.right.pan.value = 1.0

    this.mixer = ctx.createGain()
    this.mixer.gain.value = 1

    this.out = ctx.createGain()
    this.out.gain.value = 0.5

    this.level = this.out.gain

    this.oscs = []

    for (let i = 0; i < MAX_OSCS; i++) {
      const osc = ctx.createOscillator()
      osc.detune.value = this.#spread * nrand(100)
      osc.start()
      osc.panner = i % 2 ? this.left : this.right
      this.oscs.push(osc)
    }

    this.setWave(this.#wave)
    this.voices = DEFAULT_VOICES

    this.left.connect(this.mixer)
    this.right.connect(this.mixer)
    this.mixer.connect(this.out)
  }

  apply (config:VoxConfig) {
    const { level, tone, spread, oct, wander } = config
    this.spread = spread
    this.octave = oct
    this.out.gain.value = level
    this.wander = wander
    this.#x = tone[0]
    this.#y = tone[1]
    this.blendWave()
  }


  // Computed properties

  get freq () { return this.#freq }
  set freq (f:number) {
    const freq = f * pow(2, this.#oct)
    this.#freq = f
    this.oscs.forEach((osc, i) => osc.frequency.value = freq)
  }

  get spread () { return this.#spread }
  set spread (s:number) {
    this.#spread = s
    this.oscs.forEach((osc, i) => osc.detune.value = s * nrand(100))
  }

  get voices () { return this.#voices }
  set voices (s:number) {
    s = round(s)

    if (s > this.#voices) {
      for (let i = this.#voices; i < s; i++) {
        this.oscs[i].connect(this.oscs[i].panner)
      }
    } else if (s < this.#voices) {
      for (let i = s; i < this.#voices; i++) {
        this.oscs[i].disconnect()
      }
    }
    this.#voices = s
    this.freq = this.#freq
    this.mixer.gain.value = 1/Math.sqrt(s)
  }

  get octave () { return this.#oct }
  set octave (o:number) {
    this.#oct = o
    this.freq = this.freq
  }

  get x () { return this.#x }
  set x (x: number) { this.#x = x; if (!this.wander) this.blendWave() }

  get y () { return this.#y }
  set y (y: number) { this.#y = y; if (!this.wander) this.blendWave() }

  blendWave () {
    this.#wave = WaveTable.blend(
      WaveTable.blend(TONES.O, TONES.U, this.#x),
      WaveTable.blend(TONES.A, TONES.I, this.#x),
      this.#y
    )

    this.setWave(this.#wave)
  }

  setWave (wt:WaveTable) {
    const wave = this.oscs[0].context.createPeriodicWave(wt.real, wt.imag)
    this.oscs.forEach((osc, i) => osc.setPeriodicWave(wave))
  }

  update (Δt:number) {
    if (this.wander) {
      this.#phase += Δt * WANDER_SPEED
      this.#x = 0.5 + 0.4 * cos(this.#phase * 3)
      this.#y = 0.5 - 0.4 * sin(this.#phase * 1)
      this.blendWave()
    }
  }
}

