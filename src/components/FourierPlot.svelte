<script lang="ts">
  import { onMount } from 'svelte'
  import { fromTw } from '$lib/tw-utils'

  const GRID_RES = 1/50
  const CANVAS_DPI = 2

  const RED   = fromTw('red-500')
  const GREEN = fromTw('green-500')
  const BLUE  = fromTw('blue-500')
  const SLATE = fromTw('slate-700')


  // Props

  export let real:Float32Array
  export let imag:Float32Array
  export let input:Float32Array


  // Functions

  function grid (w:number, h:number, showLabels = true) {
    ctx.strokeStyle = SLATE
    ctx.fillStyle = '#fff9'

    const step = w * GRID_RES

    ctx.beginPath()
    for (let y = 0; y <= h; y += step) {
      ctx.moveTo(0, h - y)
      ctx.lineTo(w, h - y)
    }
    ctx.closePath()
    ctx.stroke()

    ctx.beginPath()
    for (let x = 0; x <= w; x += step) {
      ctx.moveTo(x, 0)
      ctx.lineTo(x, h)
    }
    ctx.closePath()
    ctx.stroke()
  }

  function draw (real:Float32Array, imag:Float32Array, input:Float32Array) {
    if (!ctx) return console.warn("FourierPlot::draw - no context")

    const w = width * CANVAS_DPI, h = height * CANVAS_DPI
    ctx.clearRect(0, 0, w, h)

    grid(w, h)

    const PEEK = 256
    const SAMPLES = input.length

    const step = w / PEEK

    // Wave
    ctx.beginPath()
    ctx.moveTo(0, h/2)
    for (let ix = 0; ix < SAMPLES; ix += 2) {
      const d = input[ix]
      ctx.lineTo(ix/SAMPLES * w, h/2 + d * h)
    }
    ctx.strokeStyle = GREEN
    ctx.stroke()

    // Fourier terms (up to PEEK)
    for (let ix = 0; ix < PEEK; ix++) {
      const r = real[ix] * 10
      const i = imag[ix] * 10
      ctx.fillStyle = RED
      ctx.fillRect(ix * step,          h - r * h, step/2, r * h)
      ctx.fillStyle = BLUE
      ctx.fillRect(ix * step + step/2, h - i * h, step/2, i * h)
    }
  }


  // State

  let canvas:HTMLCanvasElement
  let ctx:CanvasRenderingContext2D
  let width:number
  let height:number

  onMount(() => {
    canvas.width  = width  * CANVAS_DPI
    canvas.height = height * CANVAS_DPI
    ctx = canvas.getContext('2d') as CanvasRenderingContext2D
    draw(real, imag, input)
  })

  $: draw(real, imag, input)

</script>


<canvas class="block w-full {$$restProps.class}"
  bind:this={canvas}
  bind:clientWidth={width}
  bind:clientHeight={height}
/>

