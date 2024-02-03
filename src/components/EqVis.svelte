<script lang="ts">
  import { onMount } from 'svelte'
  import { normalCurve, TAU } from '$lib/utils'

  const DRAW_RES = 1/50
  const CANVAS_DPI = 2


  // Props

  export let dist:EqDist
  export let color:string


  // Functions

  function draw (dist:EqDist) {
    if (!ctx) return console.warn("EqVis::draw - no context")

    const w = width * CANVAS_DPI, h = height * CANVAS_DPI
    ctx.clearRect(0, 0, w, h)

    // Crosshair
    ctx.globalAlpha = 0.5
    ctx.lineWidth = 1 * CANVAS_DPI
    ctx.strokeStyle = 'white'
    ctx.beginPath()
    ctx.moveTo(dist.f * w, 0)
    ctx.lineTo(dist.f * w, h)
    ctx.moveTo(0, (1 - dist.a) * h)
    ctx.lineTo(w, (1 - dist.a) * h)
    ctx.stroke()

    // Curve
    ctx.globalAlpha = 1
    ctx.lineWidth = 3 * CANVAS_DPI
    ctx.strokeStyle = color
    ctx.beginPath()
    ctx.moveTo(0, (1 - normalCurve(0, dist.f, dist.a, dist.q)) * h)
    for (let i = 0; i <= w; i += w * DRAW_RES) {
      ctx.lineTo(i, (1 - normalCurve(i / w, dist.f, dist.a, dist.q)) * h)
    }
    ctx.stroke()

    // Circle
    ctx.lineWidth = 1 * CANVAS_DPI
    ctx.strokeStyle = 'white'
    ctx.beginPath()
    ctx.arc(dist.f * w, (1 - dist.a) * h, w/20, 0, TAU)
    ctx.stroke()
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
    draw(dist)
  })

  $: draw(dist)

</script>


<canvas class="block w-full {$$restProps.class}"
  bind:this={canvas}
  bind:clientWidth={width}
  bind:clientHeight={height}
/>
