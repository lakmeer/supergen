<script lang="ts">
  import { onMount } from 'svelte'

  import Slider from '../components/Slider.svelte'
  import Panner from '../components/Panner.svelte'
  import Xy     from '../components/XY.svelte'

  import Engine  from '$lib/Engine'


  const C_SHARP = [ 17.32, 34.65, 69.30, 138.59, 277.18 ]

  const PRESET_TEST:Preset = {
    freq: C_SHARP[3],
    rate: 23,
    sep: 1,
    tones: [ 0, 0, 0, 0.77, 0, 0, 0, 0, 0, 0, 0, 0, 0 ],
  }

  const PRESET_SUPERGEN:Preset = {
    freq: C_SHARP[3],
    rate: 23,
    sep: 1,
    tones: [ 0.25, 0.45, 0.65, 0.77, 0.36, 0.64, 0.00, 0.32, 0.00, 0.18, 0.00, 0.00, 0.00 ],
  }

  let rafref
  let engine:Engine

  onMount(() => {
    engine = new Engine(0.6, PRESET_SUPERGEN)

    const poke = () => {
      engine = engine
      rafref = requestAnimationFrame(poke)
    }

    poke()

    return () => {
      engine.destroy()
      cancelAnimationFrame(rafref)
    }
  })

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
</script>


<svelte:document on:keydown={suspendOnSpace} on:click={resumeOnClick} />


{#if engine}
  <div class="grid grid-cols-subgrid col-span-2 p-8 border border-slate-600">
    <div class="col-span-2 flex flex-col items-center">
      <span class="text-4xl mb-8 text-green-500 font-bold">A</span>
      <Xy class="accent-green-500" label="Distribution" value={[0, 0]} />
    </div>
  </div>

  <div class="border col-span-8 p-4 flex items-center border-slate-600">
    <div class="flex justify-between w-full">
      {#each engine.oscs.sub as osc, i}
        <Slider display="percent" bind:value={osc.level} class="accent-blue-500">
          <Panner value={osc.pan} class="bg-blue-500" />
        </Slider>
      {/each}

      {#each engine.oscs.a as osc, i}
        <Slider display="percent" bind:value={osc.level} class="accent-green-500">
          <Panner value={osc.pan} class="bg-green-500" />
        </Slider>
      {/each}

      {#each engine.oscs.b as osc, i}
        <Slider display="percent" bind:value={osc.level} class="accent-red-400">
          <Panner value={osc.pan} class="bg-red-400" />
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
    <Slider label="Master Level" display="percent" showValue bind:value={engine.level} min={0}   max={1}   step={0.01} class="accent-slate-300" />
    <Slider label="Base Freq"    display="hz"      showValue bind:value={engine.base}  min={10}  max={320} step={0.1}  class="accent-slate-300" />
    <Slider label="Stride"       display="basic"   showValue bind:value={engine.sep}   min={0.1} max={10}  step={0.1} class="accent-slate-300" />
    <Slider label="Beat Time"    display="basic"   showValue bind:value={engine.rate}  min={0.1} max={60}  step={0.1} class="accent-slate-300" />
  </div>

  <p class="col-span-12 text-center">Click anywhre to start sound</p>
{/if}
