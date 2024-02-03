<script lang="ts">
  export let value:number
  export let color = 'white'
  $: v = value/2 + 0.5
</script>

<div class="h-4 w-8 mx-auto relative bg-slate-950 flex overflow-hidden rounded-full border border-slate-500">
  <div class="absolute h-4 w-4 {$$restProps.class} rounded-full"
    style:background-color={color}
    style:top="-1px"
    style:left="{v*50}%" />
</div>
