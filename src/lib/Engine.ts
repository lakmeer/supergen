
import { abs, pow, norm, lerp, PI } from '$lib/utils'

import Osc      from '$lib/Osc'
import Voice    from '$lib/Voice'
//import SuperOsc from '$lib/Super'

const PLUS_ONE:StrideCurve   = (w, f, ix) => f + ix * w
const LOW_OCTAVE:StrideCurve = (w, f, ix) => f/pow(2, abs(ix))
const X_SQ:StrideCurve       = (w, f, ix) => f + pow(ix * w, 2)

const DEG = PI / 180;
const DIST_SIGMOID = (k:number, x:number) => ((3 + k) * x * 20 * DEG) / (PI + k * abs(x))


//
// Binaural Explorer Engine
//
// Creates and manages relevant oscillators and configuration parameters.
//
// Behaviour must be specified by a Preset object, which specifies the relevant
// levels and parameters to set up the engine for use.
//

export default class Engine {

  ctx: AudioContext
  out: GainNode

  #rate:number              // Base panning rate
  #freq:number              // Base frequency
  #stride:number            // Stride width

  subs: Osc[]               // Suboscillators
  oscs: Osc[]               // Tone oscillators
  voice: Voice              // Chant oscillator

  //super: SuperOsc           // Multi-voice detuned oscillator

  params: {
    evens: EqDist           // Oscillator bank A distribution
    odds:  EqDist           // Oscillator bank B distribution
  }

  curve: StrideCurve        // Calculates frequency for each osc from base, index and stride
  preset: string            // Saved copy of the preset's name


  constructor (ctx:AudioContext, level:number) {

    this.ctx = ctx

    this.out = ctx.createGain()
    this.out.gain.value = level
    this.out.connect(ctx.destination)

    // Set default values
    this.#freq   = 120
    this.#rate   = 20
    this.#stride = 1
    this.curve   = PLUS_ONE

    this.params = {
      evens: { f: 0, a: 0, q: 0 },
      odds:  { f: 0, a: 0, q: 0 },
    }

    // Oscillator banks
    this.subs = [ new Osc(ctx), new Osc(ctx), new Osc(ctx) ]

    this.oscs = [
      new Osc(ctx), new Osc(ctx), new Osc(ctx), new Osc(ctx),
      new Osc(ctx), new Osc(ctx), new Osc(ctx), new Osc(ctx),
      new Osc(ctx), new Osc(ctx), new Osc(ctx), new Osc(ctx),
    ]

    this.voice = new Voice(ctx)
    this.voice.freq = this.#freq / 4

    // Connect oscillator banks
    this.subs.forEach(sub => sub.out.connect(this.out))
    this.oscs.forEach(osc => osc.out.connect(this.out))

    this.voice.out.connect(this.out)

    this.preset = 'none'

    this.freq = this.#freq
  }


  // Accessors

  get level () {
    return this.out.gain.value
  }

  set level (level: number) {
    this.out.gain.linearRampToValueAtTime(level, this.ctx.currentTime + 0.1)
  }

  get freq () {
    return this.#freq
  }

  set freq (freq: number) {
    this.#freq = freq
    for (const ix in this.subs) { this.setSub(+ix) }
    for (const ix in this.oscs) { this.setOsc(+ix) }
    this.voice.freq = freq
    //this.super.freq = freq / 2
  }

  get stride () {
    return this.#stride
  }

  set stride (stride: number) {
    this.#stride = stride
    for (const ix in this.subs) { this.setSub(+ix) }
    for (const ix in this.oscs) { this.setOsc(+ix) }
  }

  get rate () {
    return this.#rate
  }

  set rate (rate:number) {
    this.#rate = rate
    for (const ix in this.subs) { this.setSub(+ix) }
    for (const ix in this.oscs) { this.setOsc(+ix) }
  }

  get total () {
    return this.subs.length + this.oscs.length
  }


  // Methods

  setSub (ix:number) {
    this.subs[ix].set(LOW_OCTAVE(this.#stride, this.#freq, this.subs.length - ix), this.rate/(pow(ix+1, 2)))
  }

  setOsc (ix:number, curve = this.curve) {
    this.oscs[ix].set(curve(this.#stride, this.#freq, ix), 1/(this.#rate + ix))
  }

  update (t: number, Δt: number):Engine {
    for (const sub of this.subs) { sub.update(Δt) }
    for (const osc of this.oscs) { osc.update(Δt) }
    this.voice.update(Δt)
    return this // so that parent context can poke reactives
  }

  destroy () {
    this.ctx.close()
  }


  // Parametric Mode

  static fromPreset (ctx:AudioContext, level:number, preset:Preset) {
    const engine = new Engine(ctx, level)
    engine.apply(preset)
    return engine
  }

  apply (preset:Preset) {
    const { name, freq, rate, curve, stride, evens, odds, vox } = preset

    console.log('Engine::apply - applying parametric preset:', name, preset)

    this.preset = name

    this.freq   = freq
    this.rate   = rate
    this.stride = stride
    this.curve  = curve

    this.applyCurve(curve, evens, odds)
    this.voice.apply(vox)

    console.log('Engine::apply - 🟢 done.')
  }

  applyCurve (curve:StrideCurve, evens:EqDist, odds:EqDist) {
    const distTrap = (dist:EqDist, fn:(dist:EqDist) => void) => {
      const callback = fn.bind(this)

      return new Proxy(structuredClone(dist), {
        set (target:EqDist, prop:keyof EqDist, value:number):boolean {
          target[prop] = value
          callback(target)
          return true
        }
      })
    }

    // Proxy eq distribution objects to watch updates
    this.params.evens = distTrap(evens, this.updateEvens)
    this.params.odds  = distTrap(odds,  this.updateOdds)

    // Set stride frequencies
    for (const ix in this.subs) this.setSub(+ix)
    for (const ix in this.oscs) this.setOsc(+ix, curve)

    // Set levels
    this.oscs[0].level = 1
    this.updateSubs()
    this.updateEvens(evens)
    this.updateOdds(odds)
  }

  updateSubs () {
    for (const ix in this.subs) {
      const p = +ix / (this.subs.length)
      console.log(p)
      this.subs[+ix].level = lerp(0.5, 1, p)
    }
  }

  updateEvens (dist:EqDist) {
    for (const ix in this.oscs) {
      if (+ix % 2 === 1 || +ix < 2) continue
      const p = +ix / (this.oscs.length - 1)
      this.oscs[+ix].level = norm(p, dist)
    }
  }

  updateOdds (dist:EqDist) {
    for (const ix in this.oscs) {
      if (+ix % 2 === 0) continue
      const p = +ix / (this.oscs.length - 1)
      this.oscs[+ix].level = norm(p, dist)
    }
  }


  // External Use

  get running () {
    return this.ctx.state !== 'suspended'
  }

  start () {
    if (this.running) return console.warn('Engine::start - already running')
    this.ctx.resume()
  }

  stop () {
    if (!this.running) return console.warn('Engine::stop - already stopped')
    this.ctx.suspend()
  }

  toggle () {
    if (this.running) { this.stop() } else { this.start() }
    return this // for svelte reactive poke
  }

}

