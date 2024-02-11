<script lang="ts">
  import { onMount } from 'svelte'
  import { lerp, TAU } from '$lib/utils'
  import { fromTw } from '$lib/tw-utils'

  const CANVAS_DPI = 2


  // Props

  export let x:number
  export let y:number

  export let labels = ['A', 'I', 'O', 'U']


  // Functions

  function draw (x:number, y:number) {
    if (!ctx) return console.warn("FormantVis::draw - no context")

    const w = width * CANVAS_DPI, h = height * CANVAS_DPI
    ctx.clearRect(0, 0, w, h)

    // Labels
    ctx.font = `bold ${w/3}px sans-serif`
    ctx.fillStyle = fromTw('slate-200')
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'

    ctx.globalAlpha = lerp(0.3, 1, (1 - x) * y)
    ctx.fillText(labels[0], w * 1/4, h * 1/4)
    ctx.globalAlpha = lerp(0.3, 1, x * y)
    ctx.fillText(labels[1], w * 3/4, h * 1/4)
    ctx.globalAlpha = lerp(0.3, 1, (1 - x) * (1 - y))
    ctx.fillText(labels[2], w * 1/4, h * 3/4)
    ctx.globalAlpha = lerp(0.3, 1, x * (1 - y))
    ctx.fillText(labels[3], w * 3/4, h * 3/4)

    // Crosshair
    ctx.globalAlpha = 0.5
    ctx.lineWidth = 1 * CANVAS_DPI
    ctx.strokeStyle = 'white'
    ctx.beginPath()
    ctx.moveTo(x * w, 0)
    ctx.lineTo(x * w, h)
    ctx.moveTo(0, (1 - y) * h)
    ctx.lineTo(w, (1 - y) * h)
    ctx.stroke()

    // Circle
    ctx.globalAlpha = 1
    ctx.lineWidth = 1 * CANVAS_DPI
    ctx.strokeStyle = 'white'
    ctx.beginPath()
    ctx.arc(x * w, (1 - y) * h, w/20, 0, TAU)
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
    draw(x, y)
  })

  $: draw(x, y)

</script>


<canvas class="block w-full aspect-square {$$restProps.class}"
  bind:this={canvas}
  bind:clientWidth={width}
  bind:clientHeight={height}
/>

