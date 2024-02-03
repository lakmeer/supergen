<script lang="ts">
  import { round, pow } from '$lib/utils'

  import Engine from '$lib/Engine'
  import Slider from './Slider.svelte'
  import Panner from './Panner.svelte'

  export let engine:Engine
  export let showLabels = false
</script>


<div class="flex space-x-4 w-full justify-center mt-6">
  {#each engine.subs as osc, ix}
    <Slider display="percent" bind:value={osc.level} class="accent-blue-500">
      <Panner value={osc.pan} class="bg-blue-500" />
      {#if showLabels}
        <p class="font-bold text-center mt-2">1/{pow(2, engine.subs.length - ix)}</p>
      {/if}
    </Slider>
  {/each}

  {#each engine.oscs as osc, ix}
    {@const color = ix === 0 ? 'slate-300' : ix % 2 ? 'red-400' : 'green-500'}
    <Slider display="percent" bind:value={osc.level} class="accent-{color}">
      <Panner value={osc.pan} class="bg-{color}" />
      {#if showLabels}
        <p class="font-bold text-center mt-2">{ ix === 0 ? 'Base' : '+' + round(engine.curve(engine.stride, 1, ix) - 1) } </p>
      {/if}
    </Slider>
  {/each}
</div>
