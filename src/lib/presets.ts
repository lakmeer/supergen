
// Helpers

const C_SHARP = [ 17.32, 34.65, 69.30, 138.59, 277.18 ]

const DEFAULT_STRIDE_CURVE:StrideCurve = (w, f, ix) => {
  const x = ix * w
  return f + 0.0573*(x*x*x) - 0.3228*(x*x) + 1.8576*x - 0.162
}


//
// Manual (per-frequency) Presets
//

export const TEST:ManualPreset = {
  name: 'Single Freq Test',
  freq: C_SHARP[3],
  rate: 23,
  stride: 1,
  curve: DEFAULT_STRIDE_CURVE,
  subs: [ 0, 0, 0 ],
  oscs: [ 0.77, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, ],
}

export const SUPERGEN:ManualPreset = {
  name: "Matt's Supergen",
  freq: C_SHARP[3],
  rate: 23,
  stride: 1,
  curve: DEFAULT_STRIDE_CURVE,
  subs: [ 0.25, 0.45, 0.65 ],
  //subs: [ 0, 0, 0 ],
  oscs: [ 0.77, 0.36, 0.64, 0.00, 0.32, 0.00, 0.18, 0.00, 0.00, 0.00, 0, 0, ],
}

export const SUB_ONLY:ManualPreset = {
  name: "Subs Only Test",
  freq: C_SHARP[3],
  rate: 2,
  stride: 1,
  curve: DEFAULT_STRIDE_CURVE,
  subs: [ 0.25, 0.45, 0.65 ],
  oscs: [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, ],
}


//
// Parametric Presets
//

export const TEST_PARAM:ParametricPreset = {
  name: "Paramatric Test",
  freq: C_SHARP[1],
  rate: 2,
  stride: 1,
  curve: DEFAULT_STRIDE_CURVE,
  crunch: 0.0,
  subs:  { f: 0.9, a: 0.8, q: 0.5 },
  evens: { f: 0.0, a: 0.7, q: 0.2 },
  odds:  { f: 1.0, a: 0.3, q: 0.8 }
}

export const TEST_MAXXED:ParametricPreset = {
  name: "Maxxed Test",
  freq: C_SHARP[4],
  rate: 2,
  stride: 3,
  curve: DEFAULT_STRIDE_CURVE,
  crunch: 0.1,
  subs:  { f: 0.5, a: 0.8, q: 0.5 },
  evens: { f: 0.5, a: 0.5, q: 0.2 },
  odds:  { f: 0.9, a: 0.9, q: 0.3 }
}


export const SUPERGEN_PARAM:ParametricPreset = {
  name: "Matt's Supergen",
  freq: C_SHARP[3],
  rate: 2,
  stride: 1,
  curve: DEFAULT_STRIDE_CURVE,
  crunch: 0.1,
  subs:  { f: 0.90, a: 0.67, q: 0.65 },
  evens: { f: 0.00, a: 0.77, q: 0.32 },
  odds:  { f: 0.09, a: 0.36, q: 0.05 }
}

