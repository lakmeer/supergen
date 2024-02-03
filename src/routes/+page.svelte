<script lang="ts">
  import { onMount } from 'svelte'
  import { round, pow } from '$lib/utils'
  import { fromTw } from '$lib/tw-utils'

  import Slider from '../components/Slider.svelte'
  import Panner from '../components/Panner.svelte'
  import Xy     from '../components/XY.svelte'
  import EqVis  from '../components/EqVis.svelte'

  import Engine from '$lib/Engine'


  // Config

  const DEFAULT_STRIDE_CURVE:StrideCurve = (w, f, ix) => {
    const x = ix * w
    return f + 0.0573*(x*x*x) - 0.3228*(x*x) + 1.8576*x - 0.162
  }

  const TIME_FACTOR = 1
  const C_SHARP = [ 17.32, 34.65, 69.30, 138.59, 277.18 ]


  // Presets

  const PRESET_TEST:Preset = {
    freq: C_SHARP[3],
    rate: 23,
    stride: 1,
    curve: DEFAULT_STRIDE_CURVE,
    subs: [ 0, 0, 0 ],
    oscs: [ 0.77, 0, 0, 0, 0, 0, 0, 0, 0, 0 ],
  }

  const PRESET_SUPERGEN:Preset = {
    freq: C_SHARP[3],
    rate: 23,
    stride: 1,
    curve: DEFAULT_STRIDE_CURVE,
    subs: [ 0.25, 0.45, 0.65 ],
    //subs: [ 0, 0, 0 ],
    oscs: [ 0.77, 0.36, 0.64, 0.00, 0.32, 0.00, 0.18, 0.00, 0.00, 0.00 ],
  }

  const PRESET_SUB_ONLY:Preset = {
    freq: C_SHARP[3],
    rate: 2,
    stride: 1,
    curve: DEFAULT_STRIDE_CURVE,
    subs: [ 0.25, 0.45, 0.65 ],
    oscs: [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ],
  }


  // Functions

  function poke () {
    const now = performance.now()
    const Δt = (now - then)/1000
    time += Δt * TIME_FACTOR
    then = now
    if (engine.ctx.state !== 'suspended') {
      engine = engine.update(time, Δt) // poke
    }
    rafref = requestAnimationFrame(poke)
  }

  function resumeOnClick () {
    if (engine.ctx.state === 'suspended') {
      engine.ctx.resume()
    }
  }

  function suspendOnSpace (event:KeyboardEvent) {
    if (event.key === ' ') {
      engine.ctx.suspend()
    }
  }


  // State

  let engine:Engine

  let time:number
  let then:number
  let rafref:number


  // Init

  onMount(() => {
    engine = new Engine(0.6, PRESET_SUPERGEN)

    time = 0
    then = performance.now()

    poke()

    return () => {
      engine.destroy()
      cancelAnimationFrame(rafref)
    }
  })

  let distS:EqDist = {
    freq: 1.0,
    gain: 1.0,
    q: 0.5,
  }

  let distA:EqDist = {
    freq: 0.5,
    gain: 0.7,
    q: 0.2,
  }

  let distB:EqDist = {
    freq: 0.5,
    gain: 0.3,
    q: 0.2,
  }

</script>


<svelte:document on:keydown={suspendOnSpace} on:click={resumeOnClick} />

{#if engine}
  {#if engine.ctx.state === 'suspended'}
    <p class="col-span-12 text-center">Click anywhere to start sound</p>
  {:else}
    <p class="col-span-12 text-center">Spacebar to shut it up</p>
  {/if}

  <div class="border rounded col-span-12 p-4 border-slate-600">
    <div class="flex justify-between w-full">
      {#each engine.subs as osc, ix}
        <Slider display="percent" bind:value={osc.level} class="accent-blue-500">
          <Panner value={osc.pan} class="bg-blue-500" />
          <p class="font-bold text-center mt-2">1/{pow(2, engine.subs.length - ix)}</p>
        </Slider>
      {/each}

      {#each engine.oscs as osc, ix}
        {@const color = ix % 2 ? 'red-400' : 'green-500'}
        <Slider display="percent" bind:value={osc.level} class="accent-{color}">
          <Panner value={osc.pan} class="bg-{color}" />
          <p class="font-bold text-center mt-2">{ ix === 0 ? 'Base' : '+' + round(engine.curve(engine.stride, 1, ix) - 1) } </p>
        </Slider>
      {/each}
    </div>
  </div>


  <!-- Parametric Controls -->

  <div class="grid col-span-2 p-8 border rounded border-slate-600">
    <div class="flex flex-col items-center">
      <span class="text-3xl mb-6 text-blue-500 font-bold">SUB</span>
      <Xy label="Parametric Curve"
        bind:x={distS.freq}
        bind:y={distS.gain}
        bind:z={distS.q} minZ={0.01} maxZ={10}>
        <EqVis dist={distS} color={fromTw('blue-500')} class="w-full aspect-square" />
      </Xy>
      <p class="text-sm text-center text-slate-400">Scroll controls Q</p>
    </div>
  </div>

  <div class="grid col-span-2 p-8 border rounded border-slate-600">
    <div class="flex flex-col items-center">
      <span class="text-3xl mb-6 text-green-500 font-bold">A</span>
      <Xy label="Parametric Curve"
        bind:x={distA.freq}
        bind:y={distA.gain}
        bind:z={distA.q} minZ={0.01} maxZ={10}>
        <EqVis dist={distA} color={fromTw('green-500')} class="w-full aspect-square" />
      </Xy>
      <p class="text-sm text-center text-slate-400">Scroll controls Q</p>
    </div>
  </div>

  <div class="grid col-span-2 p-8 border rounded border-slate-600">
    <div class="flex flex-col items-center">
      <span class="text-3xl mb-6 text-red-400 font-bold">B</span>
      <Xy label="Parametric Curve"
        bind:x={distB.freq}
        bind:y={distB.gain}
        bind:z={distB.q} minZ={0.01} maxZ={10}>
        <EqVis dist={distB} color={fromTw('red-400')} class="w-full aspect-square" />
      </Xy>
      <p class="text-sm text-center text-slate-400">Scroll controls Q</p>
    </div>
  </div>


  <!-- Master Panel -->

  <div class="col-span-6 border rounded p-8 border-slate-600">
    <p class="text-3xl mb-6 w-full text-center text-slate-400 font-bold">Master</p>

    <div class="flex space-x-4 w-full justify-center">
      <Slider label="Master Level" display="percent" showValue bind:value={engine.level}  min={0}   max={1}   step={0.01} class="accent-slate-400" />
      <Slider label="Base Freq"    display="hz"      showValue bind:value={engine.freq}   min={30}  max={320} step={0.1}  class="accent-slate-300" />
      <Slider label="Stride"       display="basic"   showValue bind:value={engine.stride} min={0.0} max={3}   step={0.01} class="accent-slate-300" />
      <Slider label="Beat Time"    display="basic"   showValue bind:value={engine.rate}   min={0.1} max={60}  step={0.1}  class="accent-slate-300" />
      <Slider label="Sub Crunch"   display="basic"   showValue bind:value={engine.dist}   min={1}   max={50}  step={1}    class="accent-slate-300" />
    </div>
  </div>

{:else}

  <p class="text-3xl col-span-12 text-center">Initialising</p>

{/if}
