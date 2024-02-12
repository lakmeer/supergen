<script lang="ts">
  import { onMount } from 'svelte'
  import { fromTw } from '$lib/tw-utils'

  import WaveTable from '$lib/wavetable'

  const CANVAS_DPI = 2

  const RED   = fromTw('red-500')
  const BLUE  = fromTw('blue-500')
  const SLATE = fromTw('slate-700')


  // Props

  export let wave:WaveTable

  // Functions

  function draw (wave:WaveTable) {
    if (!ctx) return console.warn("EqVis::draw - no context")

    const w = width * CANVAS_DPI, h = height * CANVAS_DPI
    ctx.clearRect(0, 0, w, h)

    // Zero line
    ctx.globalCompositeOperation = 'source-over'
    ctx.lineWidth = 1 * CANVAS_DPI
    ctx.strokeStyle = SLATE
    ctx.beginPath()
    ctx.moveTo(0, h/2)
    ctx.lineTo(w, h/2)
    ctx.stroke()

    // Fourier coefficients
    ctx.globalCompositeOperation = 'lighten'

    const step = w / wave.length

    for (let i = 0; i < wave.length; i++) {
      const x = i * step
      const r = ( wave.real[i]) * h/2
      const z = ( wave.imag[i]) * h/2
      ctx.fillStyle = RED
      ctx.fillRect(x, h/2 - r, step, r)
      ctx.fillStyle = BLUE
      ctx.fillRect(x, h/2 - z, step, z)
    }
  }


  // State

  let canvas:HTMLCanvasElement
  let ctx:CanvasRenderingContext2D
  let width:number
  let height:number

  onMount(() => {
    canvas.width  = width * CANVAS_DPI
    canvas.height = height * CANVAS_DPI
    ctx = canvas.getContext('2d') as CanvasRenderingContext2D
    draw(wave)
  })

  $: draw(wave)

</script>


<canvas class="block w-full bg-slate-950 rounded {$$restProps.class}"
  bind:this={canvas}
  bind:clientWidth={width}
  bind:clientHeight={height}
/>
