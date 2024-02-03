<script lang="ts">
  export let label = ""
  export let color = 'text-slate-400'
  export let vert  = false
  export let horz  = false
</script>


<div class="rounded xl:p-4 xl:pb-2 xl:border border-slate-600 {$$restProps.class}">
  {#if label}
    <p class="text-xl xl:text-2xl mb-2 xl:mb-4 w-full text-center font-bold {color}">{ label }</p>
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

