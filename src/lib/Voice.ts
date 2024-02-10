
import { lerp, pow, rand, nrand, cos, sin, PI } from '$lib/utils'

const MAX_OSCS = 32
const MIN_Q    = 0.1
const MAX_Q    = 5
const DEFAULT_VOICES = 16

type WaveTable = {
  real: number | Float32Array,
  imag: number | Float32Array,
}

function phased (ctx, phase = 0) {
  let real = cos(phase)
  let imag = sin(phase)

  return ctx.createPeriodicWave(
    [ 0, 1,  0.5, 0.6,  0.0, 0.4, -0.5 ],
    [ 0, 0, -0.5, 0.0, -0.4, 0.0,  0.0 ],
  )
}

function moreHum (real:number[], imag:number[], length:number, amount:number, falloff = () => 1, ignoreImag = false) {
  for (let i = 0; i < length; i++) {
    real.push(amount * falloff(i/length))
    imag.push(ignoreImag ? 0 : (amount * falloff(i/length)))
  }
  return [ real, imag ]
}

function truncate (real:number[], imag:number[], length:number) {
  const len = real.length
  return [ real.slice(0, len - length), imag.slice(0, len - length) ]
}

function add (realA:number[], imagA:number[], realB:number[], imagB:number[]) {
  const len = Math.max(realA.length, realB.length)
  for (let i = 0; i < len; i++) {
    realA[i] += realB[i] || 0
    imagA[i] += imagB[i] || 0
  }
  return [ realA, imagA ]
}

const GUESS = [
  [ 0, 1, 0.372, 0.357, 0.266, 0.269, 0.093, 0.040, 0.083 ],
  [ 0, 0, 0.495, 0.463, 0.350, 0.347, 0.121, 0.047, 0.106 ],
]

const GUESS_NO_FUND = [
  [ 0, 0.372, 0.357, 0.266, 0.269, 0.093, 0.040, 0.083 ],
  [ 0, 0.495, 0.463, 0.350, 0.347, 0.121, 0.047, 0.106 ],
]

const A = [
  [ 0, 0.01, 0.915, 0.023, 0.023, 0.045, 0.015, 0.045, 0.03, 0.045, 0.025, 0.205, 0.095, 0.02, 0.03, 0.02, 0.02, 0.01, 0.015, 0.015, 0.01, 0.01, 0.0, 0.015, 0.01, 0.01, 0.015, 0.025, 0.03, 0.03, 0.015, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.0, 0.01, 0.0, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.015, 0.015, 0.01, 0.015, 0.01 ],
  [ 0, 0.01, 0.015, 0.023, 0.023, 0.045, 0.015, 0.045, 0.03, 0.045, 0.025, 0.205, 0.095, 0.02, 0.03, 0.02, 0.02, 0.01, 0.015, 0.015, 0.01, 0.01, 0.0, 0.015, 0.01, 0.01, 0.015, 0.025, 0.03, 0.03, 0.015, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.0, 0.01, 0.0, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.015, 0.015, 0.01, 0.015, 0.01 ],
]


function test1 (ctx, phase = 0) {
  return ctx.createPeriodicWave(...GUESS)
}

function test2 (ctx, phase = 0) {
  return ctx.createPeriodicWave(...GUESS_NO_FUND)
}

function test3 (ctx, phase = 0) {
  return ctx.createPeriodicWave(...moreHum(...GUESS_NO_FUND, 20, 0.001, (n) => n*n))
}

function testA (ctx, phase = 0) {
  return ctx.createPeriodicWave(...truncate(...A, 40))
}

const TONES = [
  phased,
  testA,
]


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
      osc.setPeriodicWave(this.#table(ctx, rand(PI)))
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

  get tone () { return this.#toneIx }
  set tone (ix:number) {
    this.#toneIx = ix
    this.#table = TONES[ix]
    this.oscs.forEach((osc, i) =>
      osc.setPeriodicWave(this.#table(osc.context, rand(PI))))
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
