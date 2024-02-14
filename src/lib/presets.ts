
// Helpers

const C_SHARP = [ 17.32, 34.65, 69.30, 138.59, 277.18 ]

const DEFAULT_STRIDE_CURVE:StrideCurve = (w, f, ix) => {
  const x = ix * w
  return f + 0.0573*(x*x*x) - 0.3228*(x*x) + 1.8576*x - 0.162
}

const DEFAULT_VOX:VoxConfig = { level: 0.2, reverb: 0.8, tone: [ 0.5, 0.5 ], wander: false, oct: -1, spread: 2 }
const NO_VOX:VoxConfig      = { level: 0.0, reverb: 0.0, tone: [ 0.5, 0.5 ], wander: false, oct:  0, spread: 0 }
const DEEP_VOX:VoxConfig    = { level: 0.7, reverb: 0.9, tone: [ 0.5, 0.5 ], wander: false, oct: -2, spread: 0.8 }


//
// Primary Settings
//

export const NEW_SUPERGEN:Preset = {
  name: "Nangineering 0.51",
  freq: C_SHARP[3],
  rate: 2,
  stride: 1,
  curve: DEFAULT_STRIDE_CURVE,
  subs:  { f: 0.90, a: 0.67, q: 0.65 },
  evens: { f: 0.00, a: 0.77, q: 0.32 },
  odds:  { f: 0.09, a: 0.36, q: 0.05 },
  vox: {
    level: 0.2,
    tone: [ 0.4, 0.75 ],
    oct: -1,
    wander: false,
    spread: 0.75,
    reverb: 0.7,
  }
}


//
// Parametric Presets
//

export const TEST_MAXXED:Preset = {
  name: "Maxxed Test",
  freq: C_SHARP[4],
  rate: 2,
  stride: 3,
  curve: DEFAULT_STRIDE_CURVE,
  subs:  { f: 0.5, a: 0.8, q: 0.5 },
  evens: { f: 0.5, a: 0.5, q: 0.2 },
  odds:  { f: 0.9, a: 0.9, q: 0.3 },
  vox: NO_VOX
}

export const STRIDE_TEST:Preset = {
  name: "Stride Test",
  freq: C_SHARP[1],
  rate: 2,
  stride: 3,
  curve: DEFAULT_STRIDE_CURVE,
  subs:  { f: 0.5, a: 0.8, q: 0.5 },
  evens: { f: 0.1, a: 0.7, q: 0.2 },
  odds:  { f: 0.9, a: 0.9, q: 0.3 },
  vox: NO_VOX
}

export const MATT_SUPERGEN:Preset = {
  name: "Matt's Supergen",
  freq: C_SHARP[3],
  rate: 2,
  stride: 1,
  curve: DEFAULT_STRIDE_CURVE,
  subs:  { f: 0.50, a: 0.00, q: 1.00 },
  evens: { f: 0.00, a: 0.77, q: 0.32 },
  odds:  { f: 0.09, a: 0.36, q: 0.05 },
  vox: NO_VOX
}

export const VOICE_TEST:Preset = {
  name: "Vocal Testing",
  freq: 100,
  rate: 2,
  stride: 1,
  curve: DEFAULT_STRIDE_CURVE,
  subs:  { f: 0.90, a: 0.0, q: 0.65 },
  evens: { f: 0.00, a: 0.0, q: 0.32 },
  odds:  { f: 0.09, a: 0.0, q: 0.05 },
  vox: {
    level: 0.9,
    tone: [ 0, 1 ],
    oct: 0,
    spread: 0.8,
    wander: true,
    reverb: 0.8
  }
}

export const WAVETABLES:Preset = {
  name: "Wavetable Auditions",
  freq: 100,
  rate: 2,
  stride: 1,
  curve: DEFAULT_STRIDE_CURVE,
  subs:  { f: 0.90, a: 0.0, q: 0.65 },
  evens: { f: 0.00, a: 0.0, q: 0.32 },
  odds:  { f: 0.09, a: 0.0, q: 0.05 },
  vox: {
    level: 0.9,
    tone: [ 1, 1 ],
    oct: 0,
    spread: 0.8,
    wander: false,
    reverb: 1.0
  }
}
