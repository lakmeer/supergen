
import { lerp, pow, rand, nrand, cos, sin, PI } from '$lib/utils'

const MAX_OSCS = 32
const MIN_Q    = 0.1
const MAX_Q    = 5
const DEFAULT_VOICES = 16

function phased (ctx, phase = 0) {
  return ctx.createPeriodicWave(
    [ 0, cos(phase), 1,  0.5, 0.6,  0.0, 0.4, -0.5 ],
    [ 0, sin(phase), 0, -0.5, 0.0, -0.4, 0.0,  0.0 ],
  )
}


export default class Voice {

  oscs:       OscillatorNode[]
  mixer:      GainNode
  smooth:     BiquadFilterNode
  out:        GainNode

  #freq:      number
  #voices:    number
  #spread:    number
  #presence:  number
  #oct:       number

  constructor (ctx:AudioContext) {

    this.#freq     = 55
    this.#spread   = 2
    this.#voices   = 0
    this.#presence = 0.8
    this.#oct      = -1

    this.mixer = ctx.createGain()
    this.mixer.gain.value = 1.5

    this.smooth = ctx.createBiquadFilter()
    this.smooth.type = 'bandpass'
    this.smooth.Q.value = lerp(MIN_Q, MAX_Q, 1 - this.#presence)

    this.out = ctx.createGain()
    this.out.gain.value = 0.5

    this.oscs = []

    for (let i = 0; i < MAX_OSCS; i++) {
      const osc = ctx.createOscillator()
      osc.setPeriodicWave(phased(ctx, rand(PI)))
      osc.detune.value = nrand(100)
      osc.start()
      this.oscs.push(osc)
    }

    this.mixer.connect(this.smooth)
    this.smooth.connect(this.out)

    // Connect the appropriate number of oscillators
    this.voices = DEFAULT_VOICES
  }

  get freq () { return this.#freq }
  set freq (f:number) {
    const freq = f * pow(2, this.#oct)
    this.#freq = f
    this.smooth.frequency.value = freq * 2
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
    this.smooth.Q.value = lerp(MIN_Q, MAX_Q, 1 - p)
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
