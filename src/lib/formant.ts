
import { lerp } from '$lib/utils'

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


//
// Formant Filter
//
// Doesn't generate any of it's own noise, but provides an `in` node which can
// accept an external connection
//
// Formant Space:
//   A --- I
//   |     |
//   E --- O
//

export default class Formant {

  #x: number
  #y: number
  #gain: AudioParam

  in:       GainNode
  out:      GainNode
  filters:  BiquadFilterNode[]

  constructor (ctx:AudioContext) {

    this.in = ctx.createGain()
    this.out = ctx.createGain()

    this.gain = this.out.gain

    this.filters = []

    for (let i = 0; i < 5; i++) {
      const filter = ctx.createBiquadFilter()
      filter.type = 'bandpass'
      filter.connect(this.out)
      this.filters.push(filter)
    }

    this.#x = 0.75
    this.#y = 0.25

    this.setFilters()
  }

  get x () { return this.#x }
  set x (x: number) { this.#x = x; this.setFilters() }

  get y () { return this.#y }
  set y (y: number) { this.#y = y; this.setFilters() }

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

