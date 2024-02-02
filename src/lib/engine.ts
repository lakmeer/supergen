
import { browser } from '$app/environment'

const C_SHARP = [ 17.32, 34.65, 69.30, 138.59, 277.18 ]

const smoothSet = (param:AudioParam, target:number, gap = 0.1) => {
  param.linearRampToValueAtTime(target, audioCtx.currentTime + gap)
}

const addOver = (label:string, f:FreqXform, a:number, k = 1) => {

  const over = audioCtx.createOscillator()
  over.frequency.value = f(baseFreq)
  over.start()

  const pan = audioCtx.createStereoPanner()
  pan.pan.value = 0
  over.connect(pan)

  if (k !== 0) {
    const lfo = audioCtx.createOscillator()
    lfo.type = 'sine'
    lfo.frequency.value = 1/k
    lfo.start()

    const lfoGain = audioCtx.createGain()
    lfoGain.gain.value = 0.8
    lfo.connect(lfoGain)
    lfoGain.connect(pan.pan)
  }

  const gain = audioCtx.createGain()
  gain.gain.value = 0.5 * a
  gain.connect(globalGain)
  pan.connect(gain)

  const self = {
    xform: f,
    freq: over.frequency,
    gain: gain.gain,
    pan:  pan.pan,
  }

  const slider = addSlider(label, a, v => smoothSet(gain.gain, v))

  overs[label] = self
  return self
}

let baseFreq = C_SHARP[3]
const loopTime = 23 // seconds

let seperation = 1

const overs = {}


const PRESET_TEST = {
  freq: C_SHARP[3],
  base: [ 0.25, 0.45, 0.65, 0.77 ],
  over: [ 0.36, 0.64, 0.00, 0.32, 0.00, 0.18, 0.00, 0.00, 0.00 ],
}

const PRESET_SUPERGEN = {
  freq: C_SHARP[3],
  base: [ 0, 0, 0, 0.77 ],
  over: [ 0.36, 0.64, 0.00, 0.32, 0.00, 0.18, 0.00, 0.00, 0.00 ],
}

const PRESET_TOWEL = {
  freq: C_SHARP[2],
  base: [ 0.8, 0.8, 0.8, 0.8 ],
  over: [ 0, 0, 0, 0, 0, 0, 0, 0, 0 ],
}

const preset = PRESET_SUPERGEN


let audioCtx
let globalGain

let Engine = { value: 2 }

export default Engine


if (browser) {
  console.log(audioCtx, AudioContext)
  audioCtx = new AudioContext()
  console.log(audioCtx, AudioContext)

  globalGain = audioCtx.createGain()
  globalGain.gain.value = 0.9
  globalGain.connect(audioCtx.destination)


  const setBaseFreq = (freq:number) => {
    baseFreq = freq 

    for (const over of Object.values(overs)) {
      over.freq.value = over.xform(baseFreq)
    }
  }

  addOver('sssub', f => f/8, preset.base[0], loopTime/7)
  addOver('ssub',  f => f/4, preset.base[1], loopTime/5)
  addOver('sub',   f => f/2, preset.base[2], loopTime/3)
  addOver('base',  f => f,   preset.base[3], loopTime)

  addOver('+1',  f => f + seperation * 1,  preset.over[0], loopTime - 1)
  addOver('+3',  f => f + seperation * 3,  preset.over[1], loopTime - 2)
  addOver('+4',  f => f + seperation * 4,  preset.over[2], loopTime - 3)
  addOver('+6',  f => f + seperation * 6,  preset.over[3], loopTime - 4)
  addOver('+8',  f => f + seperation * 8,  preset.over[4], loopTime - 5)
  addOver('+12', f => f + seperation * 12, preset.over[5], loopTime - 6)
  addOver('+16', f => f + seperation * 16, preset.over[6], loopTime - 7)
  addOver('+24', f => f + seperation * 24, preset.over[7], loopTime - 8)
  addOver('+32', f => f + seperation * 32, preset.over[8], loopTime - 9)

  addSlider('master', globalGain.gain.value, v => smoothSet(globalGain.gain, v))
  addSlider('sep', 1, (v) => {
    seperation = v
    setBaseFreq(baseFreq)
  }, 0.1, 10, 0.01)

  addSlider('core freq', baseFreq, v => setBaseFreq(v), C_SHARP[0], C_SHARP[4], 0.1)

}
