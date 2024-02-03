declare global {

  // Svelte

	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}


  // Domain

  type StrideCurve = (width:number, freq:number, ix:number) => number

  type Preset = {
    freq:   number      // Base frequency
    rate:   number      // Panning rate
    stride: number      // Stride width
    curve:  StrideCurve // Stride curve
    subs:   number[]    // Sub oscillator levels
    oscs:   number[]    // Tone oscillator levels
  }

}

export {};
