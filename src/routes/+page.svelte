<script lang="ts">
  import { onMount } from 'svelte'
  import { round, pow } from '$lib/utils'
  import { fromTw } from '$lib/tw-utils'

  import { PRESET_SUPERGEN, PRESET_TEST_PARAM } from '$lib/presets'

  import Panel  from '../components/Panel.svelte'
  import Slider from '../components/Slider.svelte'
  import Panner from '../components/Panner.svelte'
  import Xy     from '../components/XY.svelte'
  import EqVis  from '../components/EqVis.svelte'
  import Eq     from '../components/Eq.svelte'

  import Engine from '$lib/Engine'


  // Config

  const TIME_FACTOR = 1


  // Functions

  function poke () {
    const now = performance.now()
    const Δt = (now - then)/1000
    time += Δt * TIME_FACTOR
    then = now
    if (engine.ctx.state !== 'suspended') {
      engine = engine.update(time, Δt) // poke
      anotherEngine = anotherEngine.update(time, Δt) // poke
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

  let anotherEngine:Engine


  // Init

  onMount(() => {
    const ctx = new AudioContext()

    anotherEngine = Engine.fromManualPreset(ctx, 0.6, PRESET_SUPERGEN)
    engine = Engine.fromParametricPreset(ctx, 0.6, PRESET_TEST_PARAM)

    time = 0
    then = performance.now()

    poke()

    return () => {
      ctx.close()
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

  <Panel horz label="Parametric" class="col-span-12">
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
  </Panel>

  <Panel horz label="Manual" class="col-span-12">
    {#each anotherEngine.subs as osc, ix}
      <Slider display="percent" bind:value={osc.level} class="accent-blue-500">
        <Panner value={osc.pan} class="bg-blue-500" />
        <p class="font-bold text-center mt-2">1/{pow(2, anotherEngine.subs.length - ix)}</p>
      </Slider>
    {/each}

    {#each anotherEngine.oscs as osc, ix}
      {@const color = ix % 2 ? 'red-400' : 'green-500'}
      <Slider display="percent" bind:value={osc.level} class="accent-{color}">
        <Panner value={osc.pan} class="bg-{color}" />
        <p class="font-bold text-center mt-2">{ ix === 0 ? 'Base' : '+' + round(anotherEngine.curve(anotherEngine.stride, 1, ix) - 1) } </p>
      </Slider>
    {/each}
  </Panel>


  <!-- Parametric Controls -->

  <Panel vert label="Subs" color="text-blue-500" class="col-span-2">
    <Eq bind:value={engine.params.subs} color={fromTw('blue-500')} />
  </Panel>

  <Panel vert label="Evens" color="text-green-500" class="col-span-2">
    <Eq bind:value={engine.params.evens} color={fromTw('green-500')} />
  </Panel>

  <Panel vert label="Odds" color="text-red-400" class="col-span-2">
    <Eq bind:value={engine.params.odds} color={fromTw('red-400')} />
  </Panel>


  <!-- Master Panel -->

  <Panel horz label="Master" color="text-slate-300" class="col-span-6">
    <Slider label="Master Level" display="percent" showValue bind:value={engine.level}  min={0}   max={1}   step={0.01} class="accent-slate-400" />
    <Slider label="Base Freq"    display="basic"   showValue bind:value={engine.freq}   min={30}  max={320} step={0.1}  class="accent-slate-300" />
    <Slider label="Stride"       display="basic"   showValue bind:value={engine.stride} min={0.0} max={3}   step={0.01} class="accent-slate-300" />
    <Slider label="Beat Time"    display="basic"   showValue bind:value={engine.rate}   min={0.1} max={60}  step={0.1}  class="accent-slate-300" />
    <Slider label="Sub Crunch"   display="percent" showValue bind:value={engine.dist}   min={0}   max={1}   step={0.01} class="accent-slate-300" />
  </Panel>

{:else}

  <p class="text-3xl col-span-12 text-center">Initialising</p>

{/if}
