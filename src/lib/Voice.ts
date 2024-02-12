
import { lerp, round, pow, nrand, cos, sin, sigmoid, TAU } from '$lib/utils'

import WaveTable from '$lib/wavetable'


//
// Voice Synth
//
// A chorus of almost-in-tune wavetable oscillators.
// TODO:
//  - Bring back formant filtering, maybe
//  - Tension/etc params from SIM-THROAT, pending response from author
//
// Vowel space:
//   A --- I
//   |     |
//   O --- U


// Config

const MAX_OSCS = 32
const MIN_Q    = 0.1
const MAX_Q    = 5
const DEFAULT_VOICES = 16
const WANDER_SPEED = 0.2


// Load WaveTable data

import WAVE_DATA from '../data/vowels.wavedata?raw'

const TONES = Object.fromEntries(
  WaveTable.loadLibrary(WAVE_DATA)
    .map(wt => wt.truncate(40))
    .map(wt => [ wt.name, wt ]))

const REVERB_IR_SRC = '/ir-2x.wav?raw'
const REVERB_LIMIT = 0.1 // compensates for convolution gain
const DELAY_TIME = 0.4
const DELAY_FEEDBACK = 0.4


// Main Class

export default class Voice {

  oscs:       OscillatorNode[]
  left:       StereoPannerNode
  right:      StereoPannerNode
  mixer:      GainNode  // Collects panned oscillators
  fade:       GainNode  // Ramps to zero when blending with NONE tone
  preamp:     GainNode  // External level control
  out:        GainNode  // Destination
  level:      AudioParam

  convolver:  ConvolverNode
  delay:      DelayNode
  feedback:   GainNode  // Looped into delay node
  wet:        GainNode
  dry:        GainNode
  #reverb:    number    // Wet/dry blend

  #x:         number    // Vowel blend X coord
  #y:         number    // Vowel blend Y coord
  #wave:      WaveTable // Blended vowel table
  #knee:      number    // How sharply to blend between tones

  wander:     boolean   // Automatically drift around the vowel space
  #phase:     number    // Current phase of the wander

  #freq:      number    // Base frequency
  #voices:    number    // Number of oscillators active
  #spread:    number    // Detune spread
  #oct:       number    // Octave shift

  constructor (ctx:AudioContext) {

    // Setup
    this.#freq     = 55
    this.#spread   = 0
    this.#voices   = 0
    this.#oct      = -1

    this.#x = 0
    this.#y = 0
    this.#wave = TONES.A

    this.wander = true
    this.#phase = TAU * 5/8   // Start in the 'A' zone (y is flipped)
    this.#knee  = 1.5

    this.#reverb = 0.8


    // Create nodes

    this.left = ctx.createStereoPanner()
    this.left.pan.value = -1.0

    this.right = ctx.createStereoPanner()
    this.right.pan.value = 1.0

    this.mixer = ctx.createGain()
    this.fade  = ctx.createGain()
    this.dry   = ctx.createGain()
    this.wet   = ctx.createGain()

    this.convolver = ctx.createConvolver()
    this.convolver.buffer = ctx.createBuffer(2, ctx.sampleRate * 2, ctx.sampleRate)
    this.convolver.normalize = false

    this.delay = ctx.createDelay(2)
    this.delay.delayTime.value = DELAY_TIME

    this.feedback = ctx.createGain()
    this.feedback.gain.value = DELAY_FEEDBACK * this.#reverb

    this.preamp = ctx.createGain()
    this.level = this.preamp.gain

    this.out = ctx.createGain()
    this.out.gain.value = 1


    // Generate Oscillators

    this.oscs = []

    for (let i = 0; i < MAX_OSCS; i++) {
      const osc = ctx.createOscillator()
      osc.detune.value = this.#spread * nrand(100)
      osc.start()
      //@ts-ignore -- we need somewhere to save this for later
      osc.panner = i % 2 ? this.left : this.right
      this.oscs.push(osc)
    }

    // Set up wavetables
    this.setWave(this.#wave)
    this.voices = DEFAULT_VOICES

    // Wiring
    this.left.connect(this.mixer)
    this.right.connect(this.mixer)
    this.mixer.connect(this.fade)
    this.fade.connect(this.preamp)
    this.preamp.connect(this.wet)
    this.preamp.connect(this.dry)
    this.dry.connect(this.out)
    this.wet.connect(this.convolver)
    this.wet.connect(this.delay)
    this.delay.connect(this.out)
    this.delay.connect(this.feedback)
    this.feedback.connect(this.delay)

    // Load reverb IR
    fetch(REVERB_IR_SRC)
      .then(response => response.arrayBuffer())
      .then(buffer => ctx.decodeAudioData(buffer))
      .then(data => this.convolver.buffer = data)

    this.reverb = this.#reverb
  }

  apply (config:VoxConfig) {
    const { level, tone, spread, oct, wander, reverb } = config
    this.spread = spread
    this.octave = oct
    this.reverb = reverb
    this.preamp.gain.value = level
    this.wander = wander
    this.#x = tone[0]
    this.#y = tone[1]
    this.blendWave()
  }


  // Computed properties

  get freq () { return this.#freq }
  set freq (f:number) {
    const freq = f * pow(2, this.#oct)
    this.#freq = f
    this.oscs.forEach((osc, i) => osc.frequency.value = freq)
  }

  get spread () { return this.#spread }
  set spread (s:number) {
    this.#spread = s
    this.oscs.forEach((osc, i) => osc.detune.value = s * nrand(100))
  }

  get voices () { return this.#voices }
  set voices (s:number) {
    s = round(s)

    if (s > this.#voices) {
      for (let i = this.#voices; i < s; i++) {
        //@ts-ignore -- no such panner on OscillatorNode
        this.oscs[i].connect(this.oscs[i].panner)
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

  get x () { return this.#x }
  set x (x: number) { this.#x = x; if (!this.wander) this.blendWave() }

  get y () { return this.#y }
  set y (y: number) { this.#y = y; if (!this.wander) this.blendWave() }

  get reverb () { return this.#reverb }
  set reverb (r:number) {
    this.#reverb = r
    this.dry.gain.value = 0.8 - r/3
    this.wet.gain.value = r * REVERB_LIMIT
    this.feedback.gain.value = DELAY_FEEDBACK * r
  }

  get wave () { return this.#wave }

  blendWave () {
    const sx = sigmoid(this.#x, this.#knee)
    const sy = sigmoid(this.#y, this.#knee)

    this.#wave = WaveTable.blend(
      WaveTable.blend(TONES.NONE, TONES.M, sx),
      WaveTable.blend(TONES.A,    TONES.O, sx),
      sy)

    this.setWave(this.#wave)
  }

  setWave (wt:WaveTable) {
    const wave = this.oscs[0].context.createPeriodicWave(wt.real, wt.imag)
    this.fade.gain.linearRampToValueAtTime(wt.gain, this.oscs[0].context.currentTime + 0.01)
    this.oscs.forEach((osc, i) => osc.setPeriodicWave(wave))
  }

  update (Δt:number) {
    if (this.wander) {
      this.#phase += Δt * WANDER_SPEED
      this.#x = 0.5 + 0.4 * cos(this.#phase)
      this.#y = 0.5 - 0.4 * sin(this.#phase)
      this.blendWave()
    }
  }
}

