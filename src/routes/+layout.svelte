<script lang="ts">
  import '../app.css'
</script>

<svelte:head>
  <title>Binaural Demo</title>
</svelte:head>

<main class="grid grid-cols-6 xl:grid-cols-14 gap-3 xl:gap-4 p-4 xl:p-8 w-full select-none">
  <slot />
</main>
