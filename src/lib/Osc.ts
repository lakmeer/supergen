
import { sin, rand, TAU } from '$lib/utils'

type ParamSetter = (param:AudioParam, v:number, t?:number) => void

const SAFETY_THRESHOLD = 0.5
const MAX_PAN_WIDTH    = 0.8


//
// Binaural Panning Oscillator
//
// Generates a sine tone. The output signal automatically pans from left to right based
// on the panning rate set by the parent context. Must be updated every frame to keep
// the panning alive.
//
// When core properties are updated, it will use the xform to update the output
// frequency accordingly.
//
// The class's `out` property is the final output node which can be plugged into some
// destination by the parent context. It is a gain node that it always set to 50% to
// help prevent clipping.
//

export default class Osc {

  out: AudioNode        // Can be connected to external destination

  rate:  number         // Base panning rate
  phase: number         // Panner sine phase

  params: {
    freq: AudioParam    // Output ptich
    gain: AudioParam    // Volume
    pan:  AudioParam    // Panning position
  }

  smoothSet: ParamSetter // Helper function

  // Computed properties
  //
  // level: number    - Sets output volume
  // freq:  number    - Sets output frequency
  // rate:  number    - Sets panning rate

  constructor (ctx:AudioContext) {

    const osc = ctx.createOscillator()
    osc.frequency.value = 20

    const gain = ctx.createGain()
    gain.gain.value = 0.0

    const out = ctx.createGain()
    out.gain.value = SAFETY_THRESHOLD

    const pan = ctx.createStereoPanner()
    pan.pan.value = 0

    const width = ctx.createGain()
    width.gain.value = MAX_PAN_WIDTH

    osc.connect(pan)
    pan.connect(gain)
    gain.connect(out)

    osc.start()

    this.params = {
      freq: osc.frequency,
      gain: gain.gain,
      pan:  pan.pan,
    }

    this.out   = out
    this.rate  = 1
    this.phase = rand(TAU)

    // Helper function also closes over the AudioContext
    this.smoothSet = (param:AudioParam, v:number, t = 0.1) => {
      param.linearRampToValueAtTime(v, ctx.currentTime + t)
    }
  }

  get freq ()          { return this.params.freq.value }
  set freq (f:number)  { this.smoothSet(this.params.freq, f) }

  get level ()         { return this.params.gain.value }
  set level (v:number) { this.smoothSet(this.params.gain, v) }

  get pan ()           { return this.params.pan.value }


  update (Δt:number) {
    this.phase += Δt * this.rate
    this.smoothSet(this.params.pan, MAX_PAN_WIDTH * sin(this.phase), Δt)
  }

  set (freq:number, rate:number) {
    this.freq = freq
    this.rate = rate
  }

}
