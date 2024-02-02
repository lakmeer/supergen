
//
// Binaural Panning Oscillator
//

export default class Osc {

  ctx: AudioContext

  freq: AudioParam    // Output ptich
  gain: AudioParam    // Volume
  rate: AudioParam    // LFO rate

  fx: FreqXform

  constructor (ctx:AudioContext, out:AudioNode, base:number, fx:FreqXform, amp:number, k:number) {

    const osc = ctx.createOscillator()
    osc.frequency.value = fx(base)

    const gain = ctx.createGain()
    gain.gain.value = amp

    const safety = ctx.createGain()
    safety.gain.value = 0.5

    const pan = ctx.createStereoPanner()
    pan.pan.value = 0

    const lfoGain = ctx.createGain()
    lfoGain.gain.value = 0.8
    lfoGain.connect(pan.pan)

    const analyser = ctx.createAnalyser()
    analyser.fftSize = 2048
    analyser.connect(lfoGain)

    const lfo = ctx.createOscillator()
    lfo.frequency.value = k
    lfo.connect(analyser)

    gain.connect(out)
    safety.connect(gain)
    pan.connect(safety)
    osc.connect(pan)

    lfo.start()
    osc.start()

    this.ctx  = ctx
    this.fx   = fx
    this.freq = osc.frequency
    this.rate = lfo.frequency
    this.gain = gain.gain

    this.ana  = analyser
    this.peek = new Float32Array(1)
  }

  get base () {
    return this.fx(this.freq.value)
  }

  set base (f:number) {
    this.freq.linearRampToValueAtTime(this.fx(f), this.ctx.currentTime + 0.1)
  }

  get level () {
    return this.gain.value
  }

  set level (v:number) {
    this.gain.linearRampToValueAtTime(v, this.ctx.currentTime + 0.1)
  }

  get pan () {
    this.ana.getFloatTimeDomainData(this.peek)
    return this.peek[0]
  }
}
