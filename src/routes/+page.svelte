<script lang="ts">
  import { onMount, tick } from 'svelte'
  import { round, pow, whichKey, cos, sin, PI } from '$lib/utils'
  import { fromTw } from '$lib/tw-utils'

  import * as PRESETS from '$lib/presets'

  import Panel      from '../components/Panel.svelte'
  import Slider     from '../components/Slider.svelte'
  import EqInput    from '../components/EqInput.svelte'
  import XyInput    from '../components/Xy.svelte'
  import FormantVis from '../components/FormantVis.svelte'
  import EqVis      from '../components/EqVis.svelte'

  import FourierPlot from '../components/FourierPlot.svelte'

  import EngineVis     from '../components/EngineVis.svelte'
  import EngineSliders from '../components/EngineSliders.svelte'

  import Engine from '$lib/Engine'


  // Config

  let DISPLAY_MODE : 'sliders' | 'spectrum' = 'spectrum'


  // Update Loop

  const TIME_FACTOR = 1

  let time:number
  let then:number
  let rafref:number

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


  // State

  let engine:Engine
  let error:string
  let preset: (keyof typeof PRESETS) = 'VOICE_TEST'


  // Init

  onMount(() => {
    const ctx = new AudioContext()

    if (!PRESETS[preset]) return error = `Preset not found: ${preset}`

    engine = Engine.fromPreset(ctx, 0.6, PRESETS[preset])

    time = 0
    then = performance.now()

    if (engine) poke()

    return () => {
      ctx.close()
      cancelAnimationFrame(rafref)
    }
  })
</script>


<svelte:document on:keydown={ whichKey('Escape', () => engine = engine.toggle()) } />

{#if error}
  <p class="col-span-full text-3xl w-full text-center font-bold text-red-500">{ error }</p>
{:else}

  {#if engine}
    <div class="flex col-span-full justify-between items-center mb-4">
      <span class="text-lg xl:text-base nowrap font-bold text-slate-500">
        <button type="button" class="button mr-4" on:click={() => engine = engine.toggle()}>
          { engine.running ? '🟢' : '🔴' }
        </button>

        <span class="hidden xl:inline">
          { engine.running ? 'Stop' : 'Start' } Engine
        </span>
      </span>

      <p class="text-2xl xl:text-3xl w-full xl:text-center font-bold text-slate-400">{ engine.preset }</p>

      <span class="hidden xl:block text-lg xl:text-base nowrap font-bold text-slate-700">
        Escape to 
        { engine.running ? 'stop' : 'start' }
      </span>
    </div>

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

    <Panel horz label="Voice" color="text-purple-500" class="col-span-4">
      <div class="flex space-x-3">
      <div class="flex-1">
        <XyInput label="Presence"
          bind:y={engine.voice.level.value} minY={0}   maxY={1}
          bind:z={engine.voice.spread}      minZ={0.1} maxZ={2}>

          <EqVis dist={{ f: 0.5, a: engine.voice.level.value, q: engine.voice.spread / 4}} 
            color={fromTw('purple-500')} class="w-full aspect-square" />
        </XyInput>

        <p class="mt-1 xl:hidden text-center text-sm text-slate-400">
          Presence
        </p>

        <div class="flex flex-col text-sm hidden xl:block text-center text-slate-400 mt-1">
          <p>Level: { (engine.voice.level.value * 100).toFixed(0) }%</p>
          <p>Spread: { engine.voice.spread.toFixed(2) }</p>
        </div>
      </div>

      <div class="flex-1">
        <XyInput label="Tone" bind:x={engine.voice.x} bind:y={engine.voice.y}>
          <FormantVis color={fromTw('purple-500')} bind:x={engine.voice.x} bind:y={engine.voice.y} />
        </XyInput>

        <div class="flex items-center text-sm justify-center space-x-1 xl:space-x-2 text-slate-400 accent-purple-500 mt-1">
          <label for="voice-wander">Wander</label>
          <input id="voice-wander" type="checkbox" bind:checked={engine.voice.wander} />
        </div>
      </div>
      </div>
    </Panel>


    <!-- Master Panel -->

    <Panel horz label="Master" color="text-slate-300" class="col-span-1 xl:col-span-4">
      <Slider label="Level"   display="percent" showValue bind:value={engine.level}  min={0}   max={1}   step={0.01} class="accent-slate-400" />
      <Slider label="Freq"    display="hz"      showValue bind:value={engine.freq}   min={30}  max={320} step={0.1}  class="accent-slate-300" />
      <Slider label="Stride"  display="basic"   showValue bind:value={engine.stride} min={0.0} max={3}   step={0.01} class="accent-slate-300" />
      <!-- <Slider label="Beat Time"    display="basic"   showValue bind:value={engine.rate}   min={0.1} max={60}  step={0.1}  class="accent-slate-300" /> -->
    </Panel>

  {:else}

    <p class="text-3xl col-span-full text-center text-slate-600">Initialising</p>

  {/if}

{/if}
