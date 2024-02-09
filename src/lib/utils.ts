
// Math Stuff

const  { abs, pow, exp, sqrt, floor, round, cos, sin, hypot, atan2, min, max, PI } = Math
export { abs, pow, exp, sqrt, floor, round, cos, sin, hypot, atan2, min, max, PI }
export const TAU = PI * 2
export const log = Math.log10
export const ln  = Math.log

export const lerp   = (a:number, b:number, t:number) => a + (b - a) * t
export const unlerp = (a:number, b:number, t:number) => (t - a) / (b - a)
export const sq     = (x:number) => x * x
export const clamp  = (x:number, a = 0, b = 1) => x < a ? a : x > b ? b : x
export const rand   = (n:number) => Math.random() * n
export const snap   = (n:number, step:number) => round(n / step) * step
export const nrand  = (n:number) => rand(n) - n/2

export const normalCurve = (x:number, f:number, g:number, q:number) =>
  g * exp(-((x - f) ** 2) / (2 * q ** 2))

export const norm = (x:number, dist:EqDist) =>
  normalCurve(x, dist.f, dist.a, dist.q)

export const closeEnough = (a:number, b:number, e = 0.001) => abs(a - b) < e
