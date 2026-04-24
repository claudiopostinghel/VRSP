<script>
  import { onMount } from 'svelte';
  import { LIBRARY, loadCustomTexts } from './library.js';

  let { onSelect } = $props();
  let allTexts = $state([...LIBRARY]);
  let fileInput;

  onMount(async () => {
    const custom = await loadCustomTexts();
    allTexts = [...LIBRARY, ...custom];
  });

  function handleUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const text = reader.result;
      const wordCount = text.trim().split(/\s+/).length;
      const name = file.name.replace(/\.[^.]+$/, '');
      const entry = {
        id: 'custom-' + Date.now(),
        title: name,
        author: 'Custom',
        lang: '??',
        words: wordCount,
        text
      };
      allTexts = [...allTexts, entry];
    };
    reader.readAsText(file);
    e.target.value = '';
  }

  const enTexts = $derived(allTexts.filter(t => t.lang === 'en'));
  const itTexts = $derived(allTexts.filter(t => t.lang === 'it'));
  const otherTexts = $derived(allTexts.filter(t => t.lang !== 'en' && t.lang !== 'it'));
</script>

<div class="library">
  <header class="lib-header">
    <span class="lib-title">VRSP</span>
    <span class="lib-sub">speed reader</span>
  </header>

  <div class="lib-scroll">
    {#if enTexts.length > 0}
      <div class="section-label">English</div>
      {#each enTexts as item}
        <button class="card" onclick={() => onSelect(item)}>
          <div class="card-title">{item.title}</div>
          <div class="card-meta">
            <span>{item.author}</span>
            <span>{item.words} words</span>
          </div>
        </button>
      {/each}
    {/if}

    {#if itTexts.length > 0}
      <div class="section-label">Italiano</div>
      {#each itTexts as item}
        <button class="card" onclick={() => onSelect(item)}>
          <div class="card-title">{item.title}</div>
          <div class="card-meta">
            <span>{item.author}</span>
            <span>{item.words} words</span>
          </div>
        </button>
      {/each}
    {/if}

    {#if otherTexts.length > 0}
      <div class="section-label">Other</div>
      {#each otherTexts as item}
        <button class="card" onclick={() => onSelect(item)}>
          <div class="card-title">{item.title}</div>
          <div class="card-meta">
            <span>{item.author}</span>
            <span>{item.words} words</span>
          </div>
        </button>
      {/each}
    {/if}

    <!-- Upload hidden
    <div class="section-label">Upload</div>
    <button class="card upload-card" onclick={() => fileInput.click()}>
      <div class="card-title">+ Add a text file</div>
      <div class="card-meta"><span>.txt file, any language</span></div>
    </button>
    <input
      bind:this={fileInput}
      type="file"
      accept=".txt"
      style="display:none"
      onchange={handleUpload}
    />
    -->
  </div>
</div>

<style>
  .library {
    height: 100dvh;
    display: flex;
    flex-direction: column;
    background: #0a0a0a;
  }
  .lib-header {
    padding: 20px 20px 16px;
    border-bottom: 0.5px solid #333;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  .lib-title {
    font-size: 20px;
    text-transform: uppercase;
    letter-spacing: 0.3em;
    color: #f0ede8;
  }
  .lib-sub {
    font-size: 13px;
    letter-spacing: 0.15em;
    color: rgba(240,237,232,0.4);
  }
  .lib-scroll {
    flex: 1;
    overflow-y: auto;
    touch-action: pan-y;
    padding: 16px 20px 40px;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .section-label {
    font-size: 13px;
    text-transform: uppercase;
    letter-spacing: 0.2em;
    color: rgba(240,237,232,0.4);
    margin-top: 12px;
    margin-bottom: 2px;
  }
  .section-label:first-child {
    margin-top: 0;
  }
  .card {
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding: 16px;
    border: 0.5px solid #333;
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.05);
    cursor: pointer;
    text-align: left;
    font-family: inherit;
    color: inherit;
    transition: border-color 0.15s;
  }
  .card:active {
    border-color: #e0000f;
  }
  .card-title {
    font-size: 14px;
    text-transform: uppercase;
    letter-spacing: 0.15em;
    color: #f0ede8;
  }
  .card-meta {
    display: flex;
    justify-content: space-between;
    font-size: 13px;
    letter-spacing: 0.1em;
    color: rgba(240,237,232,0.45);
  }
  .upload-card {
    border-style: dashed;
    border-color: #444;
  }
  .upload-card .card-title {
    color: rgba(240,237,232,0.6);
  }
</style>
