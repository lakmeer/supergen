<script lang="ts">
  import { onMount } from 'svelte'

  import Slider from '../components/Slider.svelte'
  import XY     from '../components/XY.svelte'


  onMount(() => {

  })

  function resumeOnClick () {
    if (audioCtx.state === 'suspended') {
      audioCtx.resume()
    }
  }

  function suspendOnSpace (event:KeyboardEvent) {
    if (event.key === ' ') {
      audioCtx.suspend()
    }
  }
</script>


<svelte:document on:keydown={suspendOnSpace} on:click={resumeOnClick} />



<div class="grid grid-cols-subgrid col-span-2 p-8 border">
  <div class="col-span-2 flex flex-col items-center">
    <span class="text-4xl mb-8 text-green-500 font-bold">A</span>
    <XY class="accent-green-500" label="Distribution" value={[0, 0]} />
  </div>
</div>

<div class="border col-span-8 p-4 flex items-center">
  <div class="flex justify-between w-full">

    <Slider label="sub3"   value={0.5} class="accent-blue-500" />
    <Slider label="sub2"   value={0.5} class="accent-blue-500" />
    <Slider label="sub1"   value={0.5} class="accent-blue-500" />
    <Slider label="base"   value={0.5} class="accent-green-500" />
    <Slider label="+1 Hz"  value={0.5} class="accent-red-400" />
    <Slider label="+3 Hz"  value={0.5} class="accent-green-500" />
    <Slider label="+4 Hz"  value={0.5} class="accent-red-400" />
    <Slider label="+6 Hz"  value={0.5} class="accent-green-500" />
    <Slider label="+8 Hz"  value={0.5} class="accent-red-400" />
    <Slider label="+8 Hz"  value={0.5} class="accent-green-500" />
    <Slider label="+12 Hz" value={0.5} class="accent-red-400" />
    <Slider label="+16 Hz" value={0.5} class="accent-green-500" />
    <Slider label="+24 Hz" value={0.5} class="accent-red-400" />
    <Slider label="+32 Hz" value={0.5} class="accent-green-500" />

  </div>
</div>

<div class="grid grid-cols-subgrid col-span-2 p-8 border">
  <div class="col-span-2 flex flex-col items-center">
    <span class="text-4xl mb-8 text-red-500 font-bold">B</span>
    <XY class="accent-red-400" label="Distribution" value={[0, 0]} />
  </div>
</div>

<div class="grid grid-cols-subgrid col-span-12 border p-8 justify-center">
  <Slider label="Master Level" value={1} class="accent-slate-300" />
  <Slider label="Base Freq"    value={1} class="accent-slate-300" />
  <Slider label="Stride"       value={1} class="accent-slate-300" />
  <Slider label="Beat Time"    value={1} class="accent-slate-300" />
</div>
