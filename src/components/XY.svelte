<script lang="ts">
  export let value: [ number, number ]

  export let min = -1
  export let max = 1
  export let step = 0.001

  export let label = ""
  export let disabled = false
</script>


<div class="text-center w-32 {$$restProps.class}">

  <div class="flex justify-center">
    <input class="block mx-auto" type="range" bind:value={value[0]} {min} {max} {step} {disabled} />
    <input class="block mx-auto" type="range" bind:value={value[1]} {min} {max} {step} {disabled} />
  </div>

  <span class="flex gap-4 justify-center">
    <strong>{value[0].toFixed(2)}%</strong>
    <strong>{value[1].toFixed(2)}%</strong>
  </span>

  {#if label}
    <span class="block">
      {label}
    </span>
  {/if}
</div>


<style>
  input {
    writing-mode: bt-lr;
    appearance: slider-vertical;
    width: 1rem;
  }
</style>
