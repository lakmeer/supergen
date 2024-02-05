
import { abs, pow, norm, PI } from '$lib/utils'

import Osc from '$lib/Osc'

const PLUS_ONE:StrideCurve   = (w, f, ix) => f + ix * w
const LOW_OCTAVE:StrideCurve = (w, f, ix) => f/pow(2, abs(ix))
const X_SQ:StrideCurve       = (w, f, ix) => f + pow(ix * w, 2)

const CRUNCH_SAMPLES = 256;
const CRUNCH_OVERSAMPLE = '4x'
const MAX_CRUNCH = 50

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

  params: {
    subs:  EqDist           // Suboscillator distribution
    evens: EqDist           // Oscillator bank A distribution
    odds:  EqDist           // Oscillator bank B distribution
  }

  curve: StrideCurve        // Calculates frequency for each osc from base, index and stride
  preset: string            // Saved copy of the preset's name

  crunch: WaveShaperNode    // Suboscillator distortion node
  distLevel:number          // Seed used to create WaveShaper profile
  crunchCurve:Float32Array  // WaveShaper profile


  constructor (ctx:AudioContext, level:number) {

    this.ctx = ctx

    this.out = ctx.createGain()
    this.out.gain.value = level
    this.out.connect(ctx.destination)

    // Set default values
    this.#freq   = 110
    this.#rate   = 20
    this.#stride = 1
    this.curve   = PLUS_ONE

    this.params = {
      subs:  { f: 0, a: 0, q: 0 },
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

    // Suboscillator Distortion
    this.distLevel = 0
    this.crunchCurve = new Float32Array(CRUNCH_SAMPLES)

    this.crunch = ctx.createWaveShaper()
    this.crunch.oversample = CRUNCH_OVERSAMPLE
    this.crunch.connect(this.out)
    this.setCrunchCurve(this.distLevel)

    // Connect oscillator banks
    this.subs.forEach(sub => sub.out.connect(this.crunch))
    this.oscs.forEach(osc => osc.out.connect(this.out))

    this.preset = 'none'
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
  }

  get dist () {
    return this.distLevel
  }

  set dist (v:number) {
    this.distLevel = v
    this.setCrunchCurve(this.distLevel)
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
    return this // so that parent context can poke reactives
  }

  destroy () {
    this.ctx.close()
  }

  setCrunchCurve (dist:number) {
    const k = 1 + dist * (MAX_CRUNCH - 1)
    for (let i = 0; i < CRUNCH_SAMPLES; i++) {
      const x = (i * 2) / CRUNCH_SAMPLES - 1
      this.crunchCurve[i] = DIST_SIGMOID(k, x)
    }
    this.crunch.curve = this.crunchCurve
  }


  // Manual Constructor

  static fromManualPreset (ctx:AudioContext, level:number, preset:ManualPreset) {
    const engine = new Engine(ctx, level)
    engine.applyManual(preset)
    return engine
  }

  applyManual (preset:ManualPreset) {
    const { name, freq, rate, curve, stride, subs, oscs } = preset

    this.#freq   = freq
    this.#rate   = rate
    this.#stride = stride
    this.curve   = curve

    console.log('Engine::apply - applying manual preset', name, preset)

    for (const ix in this.subs) {
      const sub = this.subs[+ix]
      sub.level = subs[+ix]
      this.setSub(+ix)
    }

    for (const ix in this.oscs) {
      const osc = this.oscs[+ix]
      osc.level = oscs[+ix]
      this.setOsc(+ix, curve)
    }

    this.preset = name
  }


  // Parametric Mode

  static fromParametricPreset (ctx:AudioContext, level:number, preset:ParametricPreset) {
    const engine = new Engine(ctx, level)
    engine.applyParametric(preset)
    return engine
  }

  applyParametric (preset:ParametricPreset) {
    const { name, freq, rate, curve, stride, crunch, subs, evens, odds } = preset

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

    console.log('Engine::apply - applying parametric preset', name, preset)

    this.#freq   = freq
    this.#rate   = rate
    this.#stride = stride
    this.curve   = curve

    this.params.subs  = distTrap(subs,  this.updateSubs)
    this.params.evens = distTrap(evens, this.updateEvens)
    this.params.odds  = distTrap(odds,  this.updateOdds)

    this.dist = crunch // updates curve automatically

    // Set stride frequencies
    for (const ix in this.subs) this.setSub(+ix)
    for (const ix in this.oscs) this.setOsc(+ix, curve)

    // Set levels
    this.updateSubs(subs)
    this.updateEvens(evens)
    this.updateOdds(odds)

    this.preset = name
  }

  updateSubs (dist:EqDist) {
    for (const ix in this.subs) {
      const p = +ix / (this.subs.length - 1)
      this.subs[+ix].level = norm(p, dist)
    }
  }

  updateEvens (dist:EqDist) {
    for (const ix in this.oscs) {
      if (+ix % 2 === 1) continue
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

}

