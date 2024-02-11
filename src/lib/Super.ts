//@ts-nocheck -- not using this for now, will correct if it comes back

import { sin, cos, rand, PI, TAU } from '$lib/utils'

type ParamSetter = (param:AudioParam, v:number, t?:number) => void

const SAFETY_THRESHOLD = 0.5
const MAX_PAN_WIDTH    = 0.8


//
// SuperOscillator
//
// Generates a cluster of out-of-phase and detuned sine waves for a fat sound.
//

export default class SuperOsc {

  out: AudioNode        // Can be connected to external destination

  rate:  number         // Base panning rate
  phase: number         // Panner sine phase

  oscs: OscillatorNode[] // Tone oscillators

  params: {
    freq: AudioParam    // Output ptich
    gain: AudioParam    // Volume
  }

  smoothSet: ParamSetter // Helper function

  // Computed properties
  //
  // level: number    - Sets output volume
  // freq:  number    - Sets output frequency
  // rate:  number    - Sets panning rate

  constructor (ctx:AudioContext) {

    this.lib = {}

    this.oscs = []

    const N = 16

    for (let i = 0; i < N; i++) {
      this.oscs[i] = ctx.createOscillator()
      this.oscs[i].frequency.value = 20
      this.oscs[i].setPeriodicWave(genWave(ctx, phasedSine(rand(PI))))
      this.oscs[i].detune.value = rand(100)
    }

    const gain = ctx.createGain()
    gain.gain.value = 0.5 + 0.1 / N

    const out = ctx.createGain()
    out.gain.value = SAFETY_THRESHOLD

    const width = ctx.createGain()
    width.gain.value = MAX_PAN_WIDTH

    this.oscs.forEach(osc => {
      osc.connect(gain)
      //osc.start()
    })

    gain.connect(out)

    this.params = {
      gain: gain.gain,
    }

    this.out   = out
    this.rate  = 1
    this.phase = rand(TAU)

    // Helper function also closes over the AudioContext
    this.smoothSet = (param:AudioParam, v:number, t = 0.1) => {
      param.linearRampToValueAtTime(v, ctx.currentTime + t)
    }
  }

  get freq ()          { return this.oscs[0].frequency.value }
  set freq (f:number)  { this.oscs.forEach(osc => { this.smoothSet(osc.frequency, f) }) }

  get level ()         { return this.params.gain.value }
  set level (v:number) { this.smoothSet(this.params.gain, v) }

  set (freq:number, rate:number) {
    this.freq = freq
    this.rate = rate
  }
}

const SINE = {
  real: [0, 1],
  imag: [0, 0],
}

const COSINE = {
  real: [0, 0],
  imag: [0, 1],
}

const ANTISINE = {
  real: [0, -1],
  imag: [0, 0],
}


function genWave (ctx, { real, imag }) {
  return ctx.createPeriodicWave(real, imag)
}

function phasedSine (phase = 0) {
  return {
    real: [ 0, cos(phase), 1,  0.5, 0.6,  0.0, 0.4, -0.5 ],
    imag: [ 0, sin(phase), 0, -0.5, 0.0, -0.4, 0.0,  0.0 ],
  }
}

