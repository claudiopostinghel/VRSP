<script>
  let { totalWords, elapsed, finalWpm, onRestart, onLibrary } = $props();

  const minutes = $derived(Math.floor(elapsed / 60));
  const seconds = $derived(elapsed % 60);
  const timeStr = $derived(minutes + ':' + (seconds < 10 ? '0' : '') + seconds);
</script>

<div class="end-screen">
  <div class="end-symbol">&#9632;</div>
  <div class="end-title">End of text</div>
  <div class="end-stats">
    {totalWords} words<br>
    {timeStr} total time<br>
    {finalWpm} WPM final
  </div>
  <div class="end-buttons">
    <button class="end-btn" onclick={onRestart}>&#8634; Restart</button>
    <button class="end-btn library-btn" onclick={onLibrary}>Library</button>
  </div>
</div>

<style>
  .end-screen {
    position: fixed;
    inset: 0;
    background: #0a0a0a;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    z-index: 10;
    gap: 24px;
  }
  .end-symbol {
    font-size: 48px;
    color: #e0000f;
    line-height: 1;
  }
  .end-title {
    font-size: 14px;
    text-transform: uppercase;
    letter-spacing: 0.25em;
    color: rgba(240,237,232,0.8);
  }
  .end-stats {
    font-size: 13px;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    color: rgba(240,237,232,0.6);
    text-align: center;
    line-height: 1.8;
  }
  .end-buttons {
    display: flex;
    gap: 12px;
    margin-top: 12px;
  }
  .end-btn {
    border: 1px solid #e0000f;
    color: #e0000f;
    background: transparent;
    cursor: pointer;
    padding: 14px 28px;
    font-family: 'Courier New', Courier, monospace;
    text-transform: uppercase;
    letter-spacing: 0.15em;
    font-size: 13px;
    transition: background 0.2s, color 0.2s;
  }
  .end-btn:active {
    background: #e0000f;
    color: #0a0a0a;
  }
  .library-btn {
    border-color: #555;
    color: rgba(240,237,232,0.7);
  }
  .library-btn:active {
    background: #555;
    color: #0a0a0a;
  }
</style>
