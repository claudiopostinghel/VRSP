<script>
  import Library from './lib/Library.svelte';
  import Reader from './lib/Reader.svelte';

  let currentItem = $state(null);

  function selectText(item) {
    currentItem = item;
  }

  function backToLibrary() {
    currentItem = null;
  }
</script>

{#if currentItem}
  <Reader item={currentItem} onBack={backToLibrary} />
{:else}
  <Library onSelect={selectText} />
{/if}
