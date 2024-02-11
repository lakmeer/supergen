
import { lerp, pow, rand, nrand, cos, sin, PI } from '$lib/utils'
import WaveTable from '$lib/wavetable'
import WAVE_DATA from '../data/vowels.wavedata?raw'

const TONES = WaveTable.loadLibrary(WAVE_DATA).map(wt => wt.truncate(50))

const MAX_OSCS = 32
const MIN_Q    = 0.1
const MAX_Q    = 5
const DEFAULT_VOICES = 16

function wave (ctx, table) {
  return { name: table.name, wave: ctx.createPeriodicWave(table.real, table.imag) } 
}


//
// Voice Synth
//
// A chorus of almost-in-tune wavetable oscillators.
// TODO:
//  - Wavetables for different vowels?
//  - Wavetable blending/marching
//  - Bring back formant filtering, maybe
//  - Tension/etc params from SIM-THROAT, pending response from author
//

export default class Voice {

  oscs:       OscillatorNode[]
  mixer:      GainNode
  resonance:  BiquadFilterNode
  out:        GainNode

  #toneIx:    number    // Index of the current wavetable
  #table:     Function  // Current wavetable generator
  #freq:      number    // Base frequency
  #voices:    number    // Number of oscillators active
  #spread:    number    // Detune spread
  #presence:  number    // Presence of the formants
  #oct:       number    // Octave shift

  constructor (ctx:AudioContext) {

    // Build tone library using audioContext
    TONES.map(wt => wt.gen(ctx))

    // Setup
    this.#freq     = 55
    this.#spread   = 0
    this.#voices   = 0
    this.#presence = 0.8
    this.#oct      = -1
    this.#toneIx   = 0
    this.#table    = TONES[this.#toneIx]

    this.mixer = ctx.createGain()
    this.mixer.gain.value = 1.5

    this.resonance = ctx.createBiquadFilter()
    this.resonance.type = 'bandpass'
    this.resonance.Q.value = lerp(MIN_Q, MAX_Q, 1 - this.#presence)

    this.out = ctx.createGain()
    this.out.gain.value = 0.5

    this.oscs = []

    for (let i = 0; i < MAX_OSCS; i++) {
      const osc = ctx.createOscillator()
      osc.setPeriodicWave(this.#table.wave)
      osc.detune.value = this.#spread * nrand(100)
      osc.start()
      this.oscs.push(osc)
    }

    this.mixer.connect(this.out)
    //this.resonance.connect(this.out)

    // Connect the appropriate number of oscillators
    this.voices = 1 // DEFAULT_VOICES
  }

  apply (config:VoxConfig) {
    const { level, tone, spread, pres, oct, num } = config
    this.spread = spread
    this.tone = tone
    this.presence = pres
    this.octave = oct
    this.out.gain.value = level
    this.voices = num
  }


  // Computed properties

  get wave () { return this.#table.name }

  get tone () { return this.#toneIx }
  set tone (ix:number) {
    if (!TONES[ix]) return
    this.#toneIx = ix
    this.#table = TONES[ix]
    this.oscs.forEach((osc, i) => osc.setPeriodicWave(this.#table.wave))
  }

  get freq () { return this.#freq }
  set freq (f:number) {
    const freq = f * pow(2, this.#oct)
    this.#freq = f
    this.resonance.frequency.value = freq * 2
    this.oscs.forEach((osc, i) => osc.frequency.value = freq)
  }

  get spread () { return this.#spread }
  set spread (s:number) {
    this.#spread = s
    this.oscs.forEach((osc, i) => osc.detune.value = s * nrand(100))
  }

  get presence () { return this.#presence }
  set presence (p:number) { 
    this.#presence = p
    this.resonance.Q.value = lerp(MIN_Q, MAX_Q, 1 - p)
  }

  get voices () { return this.#voices }
  set voices (s:number) {
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
}

