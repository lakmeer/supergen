
const { floor, random, cos, sin, hypot, PI } = Math
export { floor, random, cos, sin, hypot, PI }

export const lerp   = (a:number, b:number, t:number) => a + (b - a) * t
export const unlerp = (a:number, b:number, t:number) => (t - a) / (b - a)
export const sq     = (x:number) => x * x
export const clamp  = (x:number, a = 0, b = 1) => x < a ? a : x > b ? b : x

export const Q = (selector: string, context:HTMLElement = document) => context.querySelector(selector)

