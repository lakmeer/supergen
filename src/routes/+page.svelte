<script lang="ts">
  import { onMount } from 'svelte'
  import { round, pow } from '$lib/utils'
  import { fromTw } from '$lib/tw-utils'

  import * as PRESET from '$lib/presets'

  import Panel      from '../components/Panel.svelte'
  import Slider     from '../components/Slider.svelte'
  import EqInput    from '../components/EqInput.svelte'
  import XyInput    from '../components/Xy.svelte'
  import FormantVis from '../components/FormantVis.svelte'

  import EngineVis     from '../components/EngineVis.svelte'
  import EngineSliders from '../components/EngineSliders.svelte'

  import Engine from '$lib/Engine'


  // Config

  const TIME_FACTOR = 1
  let DISPLAY_MODE : 'sliders' | 'spectrum' = 'spectrum'


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
      engine = engine
    }
  }

  function suspendOnSpace (event:KeyboardEvent) {
    if (event.key === ' ') {
      engine.ctx.suspend()
      engine = engine
    }
  }


  // State

  let engine:Engine

  let time:number
  let then:number
  let rafref:number


  // Init

  onMount(() => {
    const ctx = new AudioContext()

    engine = Engine.fromParametricPreset(ctx, 0.6, PRESET.SUPERGEN_PARAM)

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
  <p class="col-span-full text-3xl w-full text-center font-bold text-slate-400">{ engine.preset }</p>

  {#if engine.ctx.state === 'suspended'}
    <p class="col-span-full text-center -mt-2 xl:-mt-4 mb-4 text-slate-500">Click anywhere to start sound</p>
  {:else}
    <p class="col-span-full text-center -mt-2 xl:-mt-4 mb-4 text-slate-500">Spacebar to shut it up</p>
  {/if}

  {#if DISPLAY_MODE === 'spectrum'}
    <div class="col-span-full rounded border border-slate-600 overflow-hidden">
      <EngineVis {engine} />
    </div>
  {:else}
    <Panel class="col-span-full pb-4 xl:pb-8 overflow-hidden">
      <div class="xl:pb-2">
        <EngineSliders {engine} showLabels />
      </div>
    </Panel>
  {/if}


  <!-- Parametric Controls -->

  <Panel vert label="Subs" color="text-blue-500" class="col-span-2">
    <EqInput bind:value={engine.params.subs} color={fromTw('blue-500')} />
  </Panel>

  <Panel vert label="Evens" color="text-green-500" class="col-span-2">
    <EqInput bind:value={engine.params.evens} color={fromTw('green-500')} />
  </Panel>

  <Panel vert label="Odds" color="text-red-400" class="col-span-2">
    <EqInput bind:value={engine.params.odds} color={fromTw('red-400')} />
  </Panel>


  <!-- Voice Panel -->

  <Panel horz label="Voice" color="text-slate-300" class="col-span-3">
    <Slider label="Level"  display="basic" showValue
      bind:value={engine.voice.out.gain.value}
      min={0.0} max={1}   step={0.001} class="accent-slate-300" />

    <Slider label="Voices"  display="basic" showValue
      bind:value={engine.voice.voices}
      min={1} max={32}   step={1} class="accent-slate-300" />

    <Slider label="Spread"  display="basic" showValue
      bind:value={engine.voice.spread}
      min={0.1} max={5}   step={0.001} class="accent-slate-300" />

    <Slider label="Presence"  display="basic" showValue
      bind:value={engine.voice.presence}
      min={0.0} max={1} step={0.001} class="accent-slate-300" />

    <Slider label="Octave"  display="basic" showValue
      bind:value={engine.voice.octave}
      min={-2} max={0} step={1} class="accent-slate-300" />
  </Panel>


  <!-- Master Panel -->

  <Panel horz label="Master" color="text-slate-300" class="col-span-3">
    <Slider label="Master Level" display="percent" showValue bind:value={engine.level}  min={0}   max={1}   step={0.01} class="accent-slate-400" />
    <Slider label="Base Freq"    display="basic"   showValue bind:value={engine.freq}   min={30}  max={320} step={0.1}  class="accent-slate-300" />
    <Slider label="Stride"       display="basic"   showValue bind:value={engine.stride} min={0.0} max={3}   step={0.01} class="accent-slate-300" />
    <!-- <Slider label="Beat Time"    display="basic"   showValue bind:value={engine.rate}   min={0.1} max={60}  step={0.1}  class="accent-slate-300" /> -->
    <Slider label="Sub Crunch"   display="percent" showValue bind:value={engine.dist}   min={0}   max={1}   step={0.01} class="accent-slate-300" />
  </Panel>

{:else}

  <p class="text-3xl col-span-full text-center text-slate-600">Initialising</p>

{/if}
