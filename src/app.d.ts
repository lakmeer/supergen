declare global {

  // Svelte

	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}


  // App Domain

  type StrideCurve = (width:number, freq:number, ix:number) => number

  type EqDist = {
    f: number
    a: number
    q: number
  }

  type ManualPreset = {
    freq:   number      // Base frequency
    rate:   number      // Panning rate
    stride: number      // Stride width
    curve:  StrideCurve // Stride curve
    subs:   number[]    // Sub oscillator levels
    oscs:   number[]    // Tone oscillator levels
  }

  type ParametricPreset = {
    freq:   number      // Base frequency
    rate:   number      // Panning rate
    crunch: number      // Sub distortion
    stride: number      // Stride width
    curve:  StrideCurve // Stride curve
    distS:  EqDist      // Sub oscillator EQ
    distA:  EqDist      // Tone EQ bank A
    distB:  EqDist      // Tone EQ bank B
  }


  // Pointer Stuff

  type PointerOptions = {
    clamp: 'square' | 'circle'    // clamping rules
    recalculate: boolean          // recalculate bounds on every move
    immediate: boolean            // apply move update on start
    angleOrigin: 'top' | 'bottom' | 'default' // angle to use as the zero point
  }

  type PointerState = {
    id: number
    x: number
    y: number
    a: number
    r: number
    node: HTMLElement | null
    bounds: DOMRect | undefined
    options: PointerOptions
    active: boolean
    event: 'create' | 'init' | 'down' | 'move' | 'up' | 'manual'
  }

}

export {};
