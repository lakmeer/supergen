
import { rand, lerp } from '$lib/utils'

const lerpFormant = (formantA, formantB, t) => 
  formantA.map((a, i) => a.map((_a, j) => lerp(_a, formantB[i][j], t)))


const FORMANT_BASS = {
  A: [
    [ 600,    0 / 20, 1000 /  60 ],
    [ 1040,  -7 / 20, 1000 /  70 ],
    [ 2250,  -9 / 20, 1000 / 110 ],
    [ 2450,  -9 / 20, 1000 / 120 ],
    [ 2750, -20 / 20, 1000 / 130 ]
  ],                         
  E: [                       
    [ 400,    0 / 20, 1000 /  40 ],
    [ 1620, -12 / 20, 1000 /  80 ],
    [ 2400,  -9 / 20, 1000 / 100 ],
    [ 2800, -12 / 20, 1000 / 120 ],
    [ 3100, -18 / 20, 1000 / 120 ]
  ],                         
  I: [                       
    [ 250,    0 / 20, 1000 /  60 ],
    [ 1750, -30 / 20, 1000 /  90 ],
    [ 2600, -16 / 20, 1000 / 100 ],
    [ 3050, -22 / 20, 1000 / 120 ],
    [ 3340, -28 / 20, 1000 / 120 ]
  ],                         
  O: [                       
    [ 400,    0 / 20, 1000 /  40 ],
    [ 750,  -11 / 20, 1000 /  80 ],
    [ 2400, -21 / 20, 1000 / 100 ],
    [ 2600, -20 / 20, 1000 / 120 ],
    [ 2900, -40 / 20, 1000 / 120 ]
  ],                         
  U: [                       
    [ 350,    0 / 20, 1000 /  40 ],
    [ 600,  -20 / 20, 1000 /  80 ],
    [ 2400, -32 / 20, 1000 / 100 ],
    [ 2675, -28 / 20, 1000 / 120 ],
    [ 2950, -36 / 20, 1000 / 120 ]
  ]
}


export default class Voice {

  #x: number
  #y: number

  // Formant Space:
  //
  // A --- I
  // |     |
  // E --- O

  oscs:     OscillatorNode[]
  filters:  BiquadFilterNode[]
  mixer:    GainNode
  smooth:   BiquadFilterNode
  out:      AudioNode

  // Node Graph
  //
  // osc ---|                     |--> filter ---|
  // osc ---+-> mixer -> smooth --+--> filter ---+--> out
  // osc ---|                     |--> filter ---|

  constructor (ctx:AudioContext) {
    this.mixer = ctx.createGain()

    this.oscs = []

    for (let i = 0; i < 4; i++) {
      const osc = ctx.createOscillator()
      osc.type = 'sawtooth'
      osc.detune.value = 4 * i
      osc.connect(this.mixer)
      osc.start()
      this.oscs.push(osc)
    }

    //this.mixer.gain.value = 3

    this.smooth = ctx.createBiquadFilter()
    this.smooth.type = 'lowpass'
    this.smooth.frequency.value = 440
    this.smooth.Q.value = 1.2

    this.filters = []

    for (let i = 0; i < 5; i++) {
      const filter = ctx.createBiquadFilter()
      filter.type = 'bandpass'
      filter.connect(this.smooth)
      this.mixer.connect(filter)
      this.filters.push(filter)
    }

    this.out = ctx.createGain()
    this.out.gain.value = 0.9
    this.smooth.connect(this.out)

    this.#x = 0.75
    this.#y = 0.25

    this.freq = 30

    this.setFilters()
  }

  get x () { return this.#x } 
  set x (x: number) { this.#x = x; this.setFilters() }

  get y () { return this.#y }
  set y (y: number) { this.#y = y; this.setFilters() }

  get freq () { return this.smooth.frequency.value / 2 }
  set freq (f:number) {
    this.oscs.forEach((osc, i) => osc.frequency.value = f * Math.pow(2, i))
  }

  setFilters () {
    const formant = lerpFormant(
      lerpFormant(FORMANT_BASS.E, FORMANT_BASS.U, this.#x),
      lerpFormant(FORMANT_BASS.A, FORMANT_BASS.I, this.#x),
      this.#y
    )

    for (let ix in this.filters) {
      let i = parseInt(ix)
      const [freq, amp, q] = formant[i]
      const filter = this.filters[i]
      filter.frequency.value = freq
      filter.gain.value      = amp
      filter.Q.value         = q
    }
  }
}
