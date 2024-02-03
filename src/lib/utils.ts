
// Math Stuff

const  { abs, pow, exp, sqrt, floor, round, cos, sin, hypot, atan2, PI } = Math
export { abs, pow, exp, sqrt, floor, round, cos, sin, hypot, atan2, PI }
export const TAU = PI * 2

export const lerp   = (a:number, b:number, t:number) => a + (b - a) * t
export const unlerp = (a:number, b:number, t:number) => (t - a) / (b - a)
export const sq     = (x:number) => x * x
export const clamp  = (x:number, a = 0, b = 1) => x < a ? a : x > b ? b : x
export const rand   = (n:number) => Math.random() * n
export const snap   = (n:number, step:number) => round(n / step) * step
