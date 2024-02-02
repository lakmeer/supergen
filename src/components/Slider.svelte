<script lang="ts">
  export let value:number

  export let min = 0
  export let max = 1
  export let step = 0.001

  export let label = ""
  export let disabled = false
  export let showValue = false

  export let display : 'basic' | 'percent' | 'hz' = 'basic'
</script>


<div class="text-center w-12 {$$restProps.class}">
  <input class="block mx-auto" type="range" bind:value {min} {max} {step} {disabled} />

  {#if showValue}
    <span class="block">
      {#if display === 'basic'}
        <strong>{value.toFixed(2)}</strong>
      {/if}
      {#if display === 'hz'}
        <strong>{value.toFixed(1)}Hz</strong>
      {/if}
      {#if display === 'percent'}
        <strong>{(value/(max - min)*100).toFixed(0)}%</strong>
      {/if}
    </span>
  {/if}

  {#if label}
    <span class="block">
      {label}
    </span>
  {/if}

  <div class="mt-4">
    <slot />
  </div>
</div>


<style>
  input {
    writing-mode: bt-lr;
    appearance: slider-vertical;
    width: 1rem;
  }
</style>
