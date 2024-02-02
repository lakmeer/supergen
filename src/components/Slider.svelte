<script lang="ts">
  export let value:number

  export let min = 0
  export let max = 1
  export let step = 0.001

  export let label = ""
  export let disabled = false
</script>


<div class="text-center w-12 {$$restProps.class}">

  <input class="block mx-auto" type="range" orient="vertical" bind:value {min} {max} {step} {disabled} />

  <span class="block">
    <strong>{value/max * 100}%</strong>
  </span>

  {#if label}
    <span class="block">
      {label}
    </span>
  {/if}

</div>

