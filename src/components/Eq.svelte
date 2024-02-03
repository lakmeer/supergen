<script lang="ts">
  import Xy     from '../components/XY.svelte'
  import EqVis  from '../components/EqVis.svelte'

  export let value:EqDist
  export let color = 'white'
</script>

<Xy label="Parametric Curve"
  bind:x={value.f}
  bind:y={value.a}
  bind:z={value.q} minZ={0.01} maxZ={10}>

  <EqVis dist={value} {color} class="w-full aspect-square" />

</Xy>
<p class="text-sm text-center text-slate-400">Scroll controls Q</p>

