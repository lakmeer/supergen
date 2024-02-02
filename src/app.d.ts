declare global {

	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}


  // Domain

  type FreqXform = (f:number) => number

  type Preset = {
    freq: number
    rate: number
    sep: number
    tones: number[]
  }

}

export {};
