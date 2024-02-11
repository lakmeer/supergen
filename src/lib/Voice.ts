
import { round, lerp, pow, rand, nrand, cos, sin, PI } from '$lib/utils'

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


// Load WaveTable data

import WAVE_DATA from '../data/vowels.wavedata?raw'

const TONES = Object.fromEntries(
  WaveTable.loadLibrary(WAVE_DATA)
    .map(wt => wt.truncate(50))
    .map(wt => [ wt.name, wt ]))


// Main Class

export default class Voice {

  oscs:       OscillatorNode[]
  mixer:      GainNode
  out:        GainNode
  level:      AudioParam

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

    this.mixer = ctx.createGain()
    this.mixer.gain.value = 1.5

    this.out = ctx.createGain()
    this.out.gain.value = 0.5

    this.level = this.out.gain

    this.oscs = []

    for (let i = 0; i < MAX_OSCS; i++) {
      const osc = ctx.createOscillator()
      osc.detune.value = this.#spread * nrand(100)
      osc.start()
      this.oscs.push(osc)
    }

    this.setWave(this.#wave)

    this.voices = DEFAULT_VOICES

    this.mixer.connect(this.out)
  }

  apply (config:VoxConfig) {
    const { level, tone, spread, pres, oct, num } = config
    this.spread = spread
    this.presence = pres
    this.octave = oct
    this.out.gain.value = level
    this.voices = num
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
        this.oscs[i].connect(this.mixer)
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
  set x (x: number) { this.#x = x; this.blendWave() }

  get y () { return this.#y }
  set y (y: number) { this.#y = y; this.blendWave() }

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
}

