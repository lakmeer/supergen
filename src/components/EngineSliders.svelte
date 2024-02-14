<script lang="ts">
  import { onMount } from 'svelte'
  import { unlerp, pow, round, norm } from '$lib/utils'
  import { fromTw } from '$lib/tw-utils'

  import Engine from '$lib/Engine'
  import Slider from './Slider.svelte'
  import Panner from './Panner.svelte'

  const CANVAS_DPI = 2
  const CURVE_RES  = 500

  const RED   = fromTw('red-400')
  const GREEN = fromTw('green-500')
  const BLUE  = fromTw('blue-500')
  const SLATE = fromTw('slate-300')

  export let engine:Engine
  export let showLabels = false

  type Range = [ number, number ]


  // State

  let canvas:HTMLCanvasElement
  let ctx:CanvasRenderingContext2D
  let width:number
  let height:number

  let peek:number


  // Draw

  function normalCurve (dist:EqDist, color:string, range:Range, w:number, h:number) {
    ctx.lineWidth = 3 * CANVAS_DPI
    ctx.strokeStyle = color
    ctx.fillStyle = color

    ctx.beginPath()
    ctx.moveTo(0, h/20 + (1 - norm(unlerp(range[0], range[1], -0.5), dist)) * h * 0.9)

    for (let i = 0; i <= CURVE_RES; i += 1) {
      let p = i/CURVE_RES
      let q = p * engine.total - 0.5
      let v = unlerp(range[0], range[1], q)
      let x = p * w
      let y = h/20 + (1 - norm(v, dist)) * h * 0.9
      ctx.lineTo(x, y)
    }

    ctx.stroke()
  }

  function draw (engine:Engine) {
    if (!ctx) return console.warn('EngineSliders - no context')

    const w = width  * CANVAS_DPI
    const h = height * CANVAS_DPI

    ctx.clearRect(0, 0, w, h)
    ctx.globalAlpha = 0.2

    const numSubs = engine.subs.length
    const total = engine.total - 1

    normalCurve(engine.params.evens, GREEN, [numSubs, total], w, h)
    normalCurve(engine.params.odds,  RED,   [numSubs, total], w, h)
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

<div class="w-full relative">
  <canvas class="absolute w-full -z-10"
    style:height="calc(100% - { showLabels ? '4rem' : '2rem' })"
    bind:this={canvas} bind:clientWidth={width} bind:clientHeight={height} />

  <div class="flex w-full justify-around">
    {#each engine.subs as osc, ix}
      <Slider display="percent" bind:value={osc.level} color={BLUE}>
        <Panner value={osc.pan} color={BLUE} />
        {#if showLabels}
          <p class="font-bold text-center mt-2">1/{pow(2, engine.subs.length - ix)}</p>
        {/if}
      </Slider>
    {/each}

    {#each engine.oscs as osc, ix}
      {@const color = ix === 0 ? SLATE : ix % 2 ? RED : GREEN }
      <Slider display="percent" bind:value={osc.level} {color}>
        <Panner value={osc.pan} {color} />
        {#if showLabels}
          <p class="font-bold text-center mt-2">{ ix === 0 ? 'Base' : '+' + round(engine.curve(engine.stride, 1, ix) - 1) } </p>
        {/if}
      </Slider>
    {/each}
  </div>
</div>

{#if peek} {peek} {/if}

