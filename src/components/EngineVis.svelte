<script lang="ts">
  import { onMount } from 'svelte'
  import { lerp, unlerp, pow, log, max, min, norm, abs, clamp } from '$lib/utils'
  import { fromTw } from '$lib/tw-utils'

  import Engine from '$lib/Engine'

  const CANVAS_DPI = 2
  const DRAW_GRID  = true
  const GRID_DIVS  = 40
  const CURVE_RES  = 500

  const MIN_FREQ = 30/2/2/2 // Lowest 3rd sub-octave of 30Hz
  const MAX_FREQ = 2100     // Highest pitch at max base and stride

  const RED    = fromTw('red-500')
  const YELLOW = fromTw('yellow-500')
  const GREEN  = fromTw('green-500')
  const BLUE   = fromTw('blue-500')
  const SLATE  = fromTw('slate-700')
  const WHITE  = fromTw('white')

  let MODE : 'log' | 'linear' = 'log'

  type Range = [ number, number ]


  // Props

  export let engine:Engine


  // State

  let canvas:HTMLCanvasElement
  let ctx:CanvasRenderingContext2D
  let width:number
  let height:number


  // Helpers

  const hz = (f:number) => `${f.toFixed(2)} Hz`

  const D = log(MAX_FREQ/MIN_FREQ)

  const logScale   = (f:number) => MODE === 'linear'
    ? unlerp(MIN_FREQ, MAX_FREQ, f)
    : log(f/MIN_FREQ) / D

  const unlogScale = (x:number) => MODE === 'linear'
    ? lerp(MIN_FREQ, MAX_FREQ, x)
    : MIN_FREQ * pow(10, x * D)


  // Drawing

  function logNormalCurve (dist:EqDist, color:string, range:Range, w:number, h:number) {
    ctx.lineWidth = 2 * CANVAS_DPI
    ctx.strokeStyle = color

    ctx.beginPath()
    ctx.moveTo(0, h)

    for (let i = 0; i <= CURVE_RES; i += 1) {
      let p = i/CURVE_RES
      let x = w * p

      let v1 = unlerp(logScale(range[0]), logScale(range[1]), p) // slightly wrong
      //let v2 = unlerp(range[0], range[1], unlogScale(p))  // ???
      //let crop = unlogScale(p) > range[0] && unlogScale(p) < range[1] ? 1 : 0
      let y = norm(v1, dist)

      ctx.lineTo(x, h - y * h)
    }

    ctx.fillStyle = color

    ctx.lineTo(w, h)
    ctx.closePath()
    ctx.globalAlpha = 0.4
    ctx.stroke()

    ctx.globalAlpha = 0.1
    ctx.fill()
  }

  function grid (w:number, h:number, showLabels = true) {
    ctx.strokeStyle = SLATE
    ctx.fillStyle = '#fff9'

    const step = w / GRID_DIVS

    ctx.beginPath()
    for (let y = 0; y <= h; y += step) {
      ctx.moveTo(0, y)
      ctx.lineTo(w, y)
    }
    ctx.closePath()
    ctx.stroke()

    ctx.beginPath()
    for (let i = 0; i <= GRID_DIVS; i += 1) {
      const x = i * step
      ctx.moveTo(x, 0)
      ctx.lineTo(x, h)
      if (showLabels && (i % 2 === 1)) ctx.fillText(unlogScale(i / GRID_DIVS).toFixed(0), x, step/2)
    }
    ctx.closePath()
    ctx.stroke()
  }

  function draw (engine:Engine) {
    if (!ctx) return console.warn('EngineVis - no context')

    const w = width * CANVAS_DPI
    const h = height * CANVAS_DPI
    const bar = 2 * CANVAS_DPI

    ctx.globalAlpha = 1.0
    ctx.lineWidth = CANVAS_DPI

    ctx.font = '2vw sans-serif'

    ctx.clearRect(0, 0, w, h)

    // Grid
    if (DRAW_GRID) {
      grid(w, h)
    }

    let subRange:Range = [ MAX_FREQ, 0 ]
    let oscRange:Range = [ MAX_FREQ, 0 ]

    // Suboscillators
    for (let ix in engine.subs) {
      const sub = engine.subs[ix]
      const p = +ix/engine.subs.length
      ctx.fillStyle = BLUE
      const x = logScale(sub.freq) * w
      const y = lerp(h, 0, sub.level)
      subRange[0] = min(subRange[0], sub.freq)
      subRange[1] = max(subRange[1], sub.freq)
      ctx.fillRect(x - bar, y, bar*2, h - y)

      // Fade to white
      ctx.fillStyle = WHITE
      ctx.globalAlpha = p
      ctx.fillRect(x - bar, y, bar*2, h - y)
      ctx.globalAlpha = 1
    }

    // Tone oscillators
    for (let ix in engine.oscs) {
      const osc = engine.oscs[ix]
      const x = logScale(osc.freq) * w
      const y = lerp(h, 0, osc.level)
      oscRange[0] = min(oscRange[0], osc.freq)
      oscRange[1] = max(oscRange[1], osc.freq)
      ctx.fillStyle = +ix === 0 ? WHITE : +ix % 2 ? RED : GREEN
      if (engine.params.pair) ctx.fillStyle = YELLOW
      if (+ix === 0) ctx.fillStyle = WHITE
      ctx.fillRect(x - bar/2, y, bar, h - y)
      if (ix === '0') ctx.fillText(hz(osc.freq), x + 15, y + 100)
    }

    // Curves
    //logNormalCurve(engine.params.pair,  YELLOW, oscRange, w, h)
    logNormalCurve(engine.params.evens, GREEN,  oscRange, w, h)
    logNormalCurve(engine.params.odds,  RED,    oscRange, w, h)

    // Limits
    ctx.globalAlpha = 0.4
    ctx.fillStyle = 'black'
    let minX = logScale(min(subRange[0], oscRange[0])) * w
    let maxX = logScale(max(subRange[1], oscRange[1])) * w
    ctx.fillRect(0, 0, minX - bar * 2, h)
    ctx.fillRect(maxX + bar * 2, 0, w - maxX - bar, h)
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

<div class="relative">
  <canvas class="w-full aspect-[4] xl:aspect-[5] bg-slate-950"
    bind:this={canvas} bind:clientWidth={width} bind:clientHeight={height} />

  <button class="button absolute bottom-2 right-2"
    on:click={() => MODE = MODE === 'log' ? 'linear' : 'log'}
    type="button">
    { MODE }
  </button>
</div>

