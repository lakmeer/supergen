<script lang="ts">
  import { onMount } from 'svelte'
  import { round, pow } from '$lib/utils'

  import Slider from '../components/Slider.svelte'
  import Panner from '../components/Panner.svelte'
  import Xy     from '../components/XY.svelte'

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
    engine = engine.update(time, Δt) // poke
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
</script>


<svelte:document on:keydown={suspendOnSpace} on:click={resumeOnClick} />

{#if engine}
  {#if engine.ctx.state === 'suspended'}
    <p class="col-span-12 text-center">Click anywhere to start sound</p>
  {:else}
    <p class="col-span-12 text-center">Spacebar to shut it up</p>
  {/if}

  <div class="grid grid-cols-subgrid col-span-2 p-8 border border-slate-600">
    <div class="col-span-2 flex flex-col items-center">
      <span class="text-4xl mb-8 text-green-500 font-bold">A</span>
      <Xy class="accent-green-500" label="Distribution" value={[0, 0]} />
    </div>
  </div>

  <div class="border col-span-8 p-4 flex items-center border-slate-600">
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

  <div class="grid grid-cols-subgrid col-span-2 p-8 border border-slate-600">
    <div class="col-span-2 flex flex-col items-center">
      <span class="text-4xl mb-8 text-red-500 font-bold">B</span>
      <Xy class="accent-red-400" label="Distribution" value={[0, 0]} />
    </div>
  </div>

  <div class="flex col-span-12 space-x-4 border p-8 justify-center border-slate-600">
    <Slider label="Master Level" display="percent" showValue bind:value={engine.level}  min={0}   max={1}   step={0.01} class="accent-slate-400 mr-8" />
    <Slider label="Base Freq"    display="hz"      showValue bind:value={engine.freq}   min={30}  max={320} step={0.1}  class="accent-slate-300" />
    <Slider label="Stride"       display="basic"   showValue bind:value={engine.stride} min={0.0} max={3}   step={0.01} class="accent-slate-300" />
    <Slider label="Beat Time"    display="basic"   showValue bind:value={engine.rate}   min={0.1} max={60}  step={0.1}  class="accent-slate-300" />
    <Slider label="Sub Crunch"   display="basic"   showValue bind:value={engine.dist}   min={1}   max={50}  step={1}    class="accent-slate-300" />
  </div>

{:else}

  <p class="text-4xl col-span-12 text-center">Initialising</p>

{/if}
