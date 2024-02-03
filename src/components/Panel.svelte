<script lang="ts">
  export let label:string
  export let color = 'text-slate-400'
  export let vert = false
  export let horz = false
</script>


<div class="border rounded p-4 pb-2 border-slate-600 {$$restProps.class}">
  {#if label}
  <p class="text-3xl mb-6 w-full text-center font-bold {color}">{ label }</p>
  {/if}

  {#if horz}
    <div class="flex space-x-4 w-full justify-center">
      <slot />
    </div>
  {:else if vert}
    <div class="flex flex-col w-full items-center">
      <slot />
    </div>
  {:else}
    <slot />
  {/if}
</div>

