<script lang="ts">
  //@ts-nocheck - ignore 'orient' complaints
  export let value:number

  export let min = 0
  export let max = 1
  export let step = 0.001

  export let color = "white"
  export let label = ""
  export let disabled = false
  export let showValue = false

  export let display : 'basic' | 'percent' | 'hz' = 'basic'
</script>


<div class="text-center text-xs xl:text-base w-14 space-y-2 {$$restProps.class}">
  <input class="block mx-auto h-24 xl:h-32"
    orient="vertical"
    type="range"
    style:accent-color={color}
    bind:value {min} {max} {step} {disabled} />

  {#if label}
    <span class="block">
      {label}
    </span>
  {/if}

  <div class="block my-2">
    <slot>
      {#if showValue}
        {#if display === 'basic'}
          <strong>{value.toFixed(2)}</strong>
        {/if}
        {#if display === 'hz'}
          <strong>{value.toFixed(1)}Hz</strong>
        {/if}
        {#if display === 'percent'}
          <strong>{(value/(max - min)*100).toFixed(0)}%</strong>
        {/if}
      {/if}
    </slot>
  </div>
</div>


<style>
  input {
    writing-mode: bt-lr;
    appearance: slider-vertical;
    width: 1rem;
  }
</style>
