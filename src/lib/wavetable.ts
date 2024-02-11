
import { max, f32_b64, b64_f32 } from '$lib/utils'


//
// WaveTables
//

export default class WaveTable {
  name:string
  real:number[]
  imag:number[]

  wave:PeriodicWave

  constructor (name:string, real:number[], imag:number[]) {
    if (real.length !== imag.length) throw new Error('Real and Imaginary parts must be the same length')
    this.name = name
    this.real = real
    this.imag = imag
  }

  get length () {
    return this.real.length
  }

  trim () {
    for (var i = wt.real.length - 1; i > 0; i--) {
      if (wt.real[i] !== 0 || wt.imag[i] !== 0) break
    }
    this.truncate(i + 1)
  }

  truncate (length:number):WaveTable {
    return new WaveTable(this.name + '|' + length,
      this.real.slice(0, length),
      this.imag.slice(0, length))
  }

  add (other:WaveTable):WaveTable {
    const len = max(this.length, other.length)
    const real = [], imag = []

    for (let i = 0; i < len; i++) {
      real[i] = (this.real[i] ?? 0) + (other.real[i] ?? 0)
      imag[i] = (this.imag[i] ?? 0) + (other.imag[i] ?? 0)
    }

    return newWaveTable(this.name + '+' + other.name, real, imag)
  }

  gen (ctx:AudioContext):PeriodicWave {
    this.wave = ctx.createPeriodicWave(this.real, this.imag)
  }


  // Storage

  encode ():string {
    const name = this.name.padEnd(15, ' ')
    const len  = this.length.toString().padEnd(7, ' ')
    const data = f32_b64(this.real.concat(this.imag))
    return [ name, len, data, '\n' ].join(' ')
  }

  static decode (line:string):WaveTable {
    const [ name, length, data ] = line.split(' ').map(x => x.trim()).filter(x => x)
    const values = b64_f32(data)
    return new WaveTable(name, values.slice(0, length), values.slice(length))
  }

  static loadLibrary (data:string):WaveTable[] {
    return data.trim().split('\n').map(WaveTable.decode)
  }
}

