<script lang="ts">
  //@ts-nocheck - ignore 'orient' complaints

  import { onMount } from 'svelte'
  import { lerp, unlerp, clamp } from '$lib/utils'
  import { touchable, newPointer } from '$lib/pointer'

  export let x = 0
  export let y:number
  export let z = 0

  export let minX = 0
  export let maxX = 1
  export let minY = 0
  export let maxY = 1
  export let minZ = 0
  export let maxZ = 1

  export let step = 0.001

  export let label = ""
  export let disabled = false


  // Pointer stuff

  const pointer = newPointer({ recalculate: true, immediate: true })

  const valueToPointer = (state:PointerState) => {
    state.x = lerp(-1, 1, unlerp(minX, maxX, x));
    state.y = lerp(1, -1, unlerp(minY, maxY, y));
    return state
  }

  const pointerToValue = (state:PointerState) => {
    if (disabled) return
    x = lerp(minX, maxX, unlerp(-1, 1, state.x))
    y = lerp(minY, maxY, unlerp(1, -1, state.y))
    return state
  }


  // Mousewheel

  function wheel (e:WheelEvent) {
    if (disabled) return
    const dy = e.deltaY * step
    z = clamp(z - dy, minZ, maxZ)
  }


  // Init

  onMount(() => {
    if (!disabled) {
      pointer.update(valueToPointer)
      return pointer.subscribe(pointerToValue)
    }
  })
</script>


<div class="text-center max-w-32 select-none touch-none {$$restProps.class}">
  <div class="w-full aspect-square rounded border border-slate-700 bg-slate-950/50"
    class:opacity-30={disabled}
    use:touchable={pointer}
    on:wheel|preventDefault={wheel}>
    <slot />
  </div>

  {#if label}
    <span class="mt-2 hidden xl:block">
      {label}
    </span>
  {/if}
</div>
