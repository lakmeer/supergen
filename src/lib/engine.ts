
import Osc from '$lib/Osc'


//
// Binaural Explorer Engine
//

export default class Engine {

  ctx:    AudioContext
  output: GainNode

  sep:    number
  rate:   number

  oscs: {
    all: Osc[],
    sub: Osc[],
    a:   Osc[],
    b:   Osc[],
  }

  #freq: number

  constructor (level: number, preset: Preset) {

    const ctx = new AudioContext()

    this.output = ctx.createGain()
    this.output.gain.value = level
    this.output.connect(ctx.destination)

    this.ctx   = ctx

    const { freq, sep, rate } = preset

    this.sep   = sep
    this.rate  = rate
    this.#freq = freq

    this.oscs = {}

    this.oscs.sub =  [
      new Osc(ctx, this.output, freq, (f => f/8), 0, 1/(rate/1.3)),
      new Osc(ctx, this.output, freq, (f => f/4), 0, 1/(rate/1.2)),
      new Osc(ctx, this.output, freq, (f => f/2), 0, 1/(rate/1.1)),
    ]

    this.oscs.a = [
      new Osc(ctx, this.output, freq, (f => f + sep * 0),  0, 1/(rate - 0)),
      new Osc(ctx, this.output, freq, (f => f + sep * 1),  0, 1/(rate - 1)),
      new Osc(ctx, this.output, freq, (f => f + sep * 3),  0, 1/(rate - 2)),
      new Osc(ctx, this.output, freq, (f => f + sep * 4),  0, 1/(rate - 3)),
      new Osc(ctx, this.output, freq, (f => f + sep * 6),  0, 1/(rate - 4)),
      new Osc(ctx, this.output, freq, (f => f + sep * 8),  0, 1/(rate - 5)),
      new Osc(ctx, this.output, freq, (f => f + sep * 12), 0, 1/(rate - 6)),
      new Osc(ctx, this.output, freq, (f => f + sep * 16), 0, 1/(rate - 7)),
      new Osc(ctx, this.output, freq, (f => f + sep * 24), 0, 1/(rate - 8)),
      new Osc(ctx, this.output, freq, (f => f + sep * 32), 0, 1/(rate - 9)),
    ]

    this.oscs.b = [
    ]

    this.oscs.all = this.oscs.sub.concat(this.oscs.a).concat(this.oscs.b)

    this.apply(preset)
  }

  apply (preset: Preset) {
    const { freq, sep, rate, tones } = preset

    this.sep   = sep
    this.rate  = rate
    this.#freq = freq

    for (const i in this.oscs.all) {
      const osc = this.oscs.all[i]
      osc.base = freq
      osc.level = tones[i]
    }
  }

  get base () {
    return this.#freq
  }

  set base (freq: number) {
    this.#freq = freq

    for (const osc of this.oscs.all) {
      osc.base = freq
    }
  }

  get level () {
    return this.output.gain.value
  }

  set level (level: number) {
    this.output.gain.linearRampToValueAtTime(level, this.ctx.currentTime + 0.1)
  }

  destroy () {
    this.ctx.close()
  }
}

