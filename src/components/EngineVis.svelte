<script lang="ts">
  import { onMount } from 'svelte'
  import { lerp, unlerp, exp, max, min, norm } from '$lib/utils'
  import { fromTw } from '$lib/tw-utils'

  import Engine from '$lib/Engine'

  const CANVAS_DPI = 2
  const DRAW_GRID  = true
  const CURVE_RES  = 10

  const MIN_FREQ = 30/2/2/2 // Lowest 3rd sub-octave of 30Hz
  const MAX_FREQ = 2100     // Highest pitch at max base and stride

  const RED   = fromTw('red-500')
  const GREEN = fromTw('green-500')
  const BLUE  = fromTw('blue-500')
  const SLATE = fromTw('slate-700')
  const WHITE = fromTw('white')

  type Range = [ number, number ]


  // Props

  export let engine:Engine


  // State

  let canvas:HTMLCanvasElement
  let ctx:CanvasRenderingContext2D
  let width:number
  let height:number

  let peek:number


  // Draw

  const log = Math.log10

  function logScale (f:number):number {
    //return (log(f) - log(MIN_FREQ)) / (log(MAX_FREQ) - log(MIN_FREQ))
    return unlerp(MIN_FREQ, MAX_FREQ, f)
  }

  function logNormalCurve (dist:EqDist, color:string, range:Range, w:number, h:number) {
    ctx.lineWidth = 3 * CANVAS_DPI
    ctx.strokeStyle = color
    ctx.fillStyle = color

    let freqRange = range[1] - range[0]
    let startX    = logScale(range[0]) * w
    let endX      = logScale(range[1]) * w

    ctx.beginPath()
    ctx.moveTo(startX, h)

    for (let i = 0; i <= CURVE_RES; i += 1) {
      let p = i/CURVE_RES
      let x = logScale(lerp(range[0], range[1], p)) * w
      let y = h - norm(p, dist) * h
      ctx.lineTo(x, y)
      ctx.fillRect(x, y, CANVAS_DPI, CANVAS_DPI)
    }

    ctx.lineTo(endX, h)
    ctx.closePath()

    ctx.globalAlpha = 0.2
    ctx.stroke()
    ctx.globalAlpha = 0.1
    ctx.fill()
  }

  function draw (engine:Engine) {
    if (!ctx) return console.warn('EngineVis - no context')

    const w = width * CANVAS_DPI
    const h = height * CANVAS_DPI
    const bar = 2 * CANVAS_DPI

    ctx.globalAlpha = 1.0
    ctx.lineWidth = CANVAS_DPI

    ctx.clearRect(0, 0, w, h)

    // Grid
    if (DRAW_GRID) {
      ctx.strokeStyle = SLATE
      ctx.beginPath()
      for (let f = MIN_FREQ; f <= MAX_FREQ; f *= 1.14) {
        const x = logScale(f) * w
        ctx.moveTo(x, 0)
        ctx.lineTo(x, h)
      }

      for (let l = 0; l <= 1; l += 0.1) {
        const y = lerp(h, 0, l)
        ctx.moveTo(0, y)
        ctx.lineTo(w, y)
      }
      ctx.closePath()
      ctx.stroke()
    }

    let subRange:Range = [ MAX_FREQ, 0 ]
    let oscRange:Range = [ MAX_FREQ, 0 ]

    // Suboscillators
    for (let sub of engine.subs) {
      ctx.fillStyle = BLUE
      const x = logScale(sub.freq) * w
      const y = lerp(h, 0, sub.level)
      subRange[0] = min(subRange[0], sub.freq)
      subRange[1] = max(subRange[1], sub.freq)
      ctx.fillRect(x - bar/2, y, bar, h - y)
    }

    // Tone oscillators
    for (let ix in engine.oscs) {
      const osc = engine.oscs[ix]
      const x = logScale(osc.freq) * w
      const y = lerp(h, 0, osc.level)
      oscRange[0] = min(oscRange[0], osc.freq)
      oscRange[1] = max(oscRange[1], osc.freq)
      ctx.fillStyle = +ix === 0 ? WHITE : +ix % 2 ? RED : GREEN
      ctx.fillRect(x - bar/2, y, bar, h - y)
    }

    // Curves
    logNormalCurve(engine.params.subs,  BLUE,  subRange, w, h)
    logNormalCurve(engine.params.evens, GREEN, oscRange, w, h)
    logNormalCurve(engine.params.odds,  RED,   oscRange, w, h)

    // Limits
    ctx.globalAlpha = 0.3
    ctx.fillStyle = 'black'
    let minX = logScale(min(subRange[0], oscRange[0])) * w
    let maxX = logScale(max(subRange[1], oscRange[1])) * w
    ctx.fillRect(0, 0, minX - bar * 2, h)
    ctx.fillRect(maxX + bar * 2, 0, w - maxX - bar, h)

    peek = subRange[0]
  }


  // Init

  onMount(() => {
    canvas.width  = width * CANVAS_DPI
    canvas.height = height * CANVAS_DPI

    ctx = canvas.getContext('2d') as CanvasRenderingContext2D
    draw(engine)
  })

  $: draw(engine)

</script>

<canvas class="w-full aspect-[4] xl:aspect-[5] bg-slate-950"
  bind:this={canvas} bind:clientWidth={width} bind:clientHeight={height} />

