
import { max, lerp, f32_b64, b64_f32 } from '$lib/utils'


//
// WaveTables
//

export default class WaveTable {
  name:string
  real:Float32Array
  imag:Float32Array

  constructor (name:string, real:number[]|Float32Array, imag:number[]|Float32Array) {
    if (real.length !== imag.length) throw new Error('Real and Imaginary parts must be the same length')

    this.name = name
    this.real = Array.isArray(real) ? new Float32Array(real) : real
    this.imag = Array.isArray(imag) ? new Float32Array(imag) : imag
  }

  get length () {
    return this.real.length
  }

  trim () {
    for (var i = this.length - 1; i > 0; i--) {
      if (this.real[i] !== 0 || this.imag[i] !== 0) break
    }
    this.truncate(i + 1)
  }

  truncate (length:number):WaveTable {
    return new WaveTable(this.name,
      this.real.slice(0, length),
      this.imag.slice(0, length))
  }

  static add (a:WaveTable, b:WaveTable):WaveTable {
    const len = max(a.length, b.length)
    const real = new Float32Array(len), imag = new Float32Array(len)

    for (let i = 0; i < len; i++) {
      real[i] = (a.real[i] ?? 0) + (b.real[i] ?? 0)
      imag[i] = (a.imag[i] ?? 0) + (b.imag[i] ?? 0)
    }

    return new WaveTable(a.name + '+' + b.name, real, imag)
  }


  // Static

  static blend (a:WaveTable, b:WaveTable, amount:number):WaveTable {
    const len = max(a.length, b.length)
    const real = new Float32Array(len), imag = new Float32Array(len)

    for (let i = 0; i < len; i++) {
      real[i] = lerp(a.real[i] ?? 0, b.real[i] ?? 0, amount)
      imag[i] = lerp(a.imag[i] ?? 0, b.imag[i] ?? 0, amount)
    }

    return new WaveTable(a.name + '+' + b.name, real, imag)
  }


  // Storage

  encode ():string {
    const name = this.name.padEnd(15, ' ')
    const len  = this.length.toString().padEnd(7, ' ')
    const data = new Float32Array(this.length * 2)
    data.set(this.real, 0)
    data.set(this.imag, this.length)
    return [ name, len, f32_b64(data), '\n' ].join(' ')
  }

  static decode (line:string):WaveTable {
    const [ name, length, data ] = line.split(' ').map(x => x.trim()).filter(x => x)
    const len = parseInt(length)
    const values = b64_f32(data)
    return new WaveTable(name, values.slice(0, len), values.slice(len))
  }

  static loadLibrary (data:string):WaveTable[] {
    return data.trim().split('\n').map(WaveTable.decode)
  }
}

