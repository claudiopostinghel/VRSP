<script>
  import { onMount, onDestroy } from 'svelte';
  import EndScreen from './EndScreen.svelte';

  let { item, onBack } = $props();

  // Words
  const words = $derived(item.text.trim().split(/\s+/));

  // State
  let index = $state(0);
  let wpm = $state(380);
  let playing = $state(false);
  let touchDown = $state(false);
  let hasUsed = $state(false);
  let startTime = $state(null);
  let showEnd = $state(false);
  let elapsed = $state(0);
  let isScrubbing = $state(false);
  let showDragHint = $state(false);

  let timerId = null;
  let startX = 0;
  let startWpm = 380;

  // DOM refs
  let wordContainer;
  let orpSpan;
  let gestureZone;

  // ORP
  function getOrpIndex(len) {
    if (len <= 1) return 0;
    if (len <= 5) return 1;
    if (len <= 9) return 2;
    if (len <= 13) return 3;
    return 4;
  }

  const currentWord = $derived(index < words.length ? words[index] : '');
  const orpIdx = $derived(getOrpIndex(currentWord.length));
  const preOrpText = $derived(currentWord.slice(0, orpIdx));
  const orpChar = $derived(currentWord[orpIdx] || '');
  const postOrpText = $derived(currentWord.slice(orpIdx + 1));
  const progress = $derived(words.length > 0 ? ((index + 1) / words.length * 100) : 0);
  const remaining = $derived(words.length - index - 1);
  const remainingSeconds = $derived(Math.ceil(remaining / (wpm / 60)));
  const timeStr = $derived.by(() => {
    const m = Math.floor(remainingSeconds / 60);
    const s = remainingSeconds % 60;
    return m + ':' + (s < 10 ? '0' : '') + s;
  });
  const sliderPct = $derived(((wpm - 60) / (700 - 60)) * 100);

  // Center ORP after render
  $effect(() => {
    // track these to re-run
    currentWord;
    if (orpSpan && wordContainer) {
      requestAnimationFrame(() => {
        const rect = orpSpan.getBoundingClientRect();
        const center = rect.left + rect.width / 2;
        const screenCenter = window.innerWidth / 2;
        const dx = screenCenter - center;
        const current = parseFloat(wordContainer.style.transform?.replace('translateX(', '').replace('px)', '')) || 0;
        wordContainer.style.transform = 'translateX(' + (current + dx) + 'px)';
      });
    }
  });

  // Timing
  function getDelay(word) {
    const base = 60000 / wpm;
    const lengthPenalty = word.length > 8 ? (word.length - 8) * 14 : 0;
    const punctPenalty = /[.,;:!?\u2014\u2013\u2026]$/.test(word) ? 110 : 0;
    return base + lengthPenalty + punctPenalty;
  }

  function showNextWord() {
    if (!playing) return;
    if (index >= words.length) {
      finishReading();
      return;
    }
    const delay = getDelay(words[index]);
    index++;
    timerId = setTimeout(showNextWord, delay);
  }

  function startPlayback() {
    if (playing) return;
    if (!hasUsed) {
      hasUsed = true;
      showDragHint = true;
      setTimeout(() => { showDragHint = false; }, 2000);
      return;
    }
    playing = true;
    if (!startTime) startTime = Date.now();
    showNextWord();
  }

  function stopPlayback() {
    playing = false;
    clearTimeout(timerId);
  }

  function finishReading() {
    stopPlayback();
    elapsed = Math.round((Date.now() - startTime) / 1000);
    showEnd = true;
  }

  function restart() {
    index = 0;
    startTime = null;
    showEnd = false;
    playing = false;
    hasUsed = false;
    clearTimeout(timerId);
  }

  function goLibrary() {
    stopPlayback();
    onBack();
  }

  // Gesture handlers
  function onDown(x) {
    touchDown = true;
    startX = x;
    startWpm = wpm;
    isScrubbing = false;
    startPlayback();
  }

  function onMove(x) {
    if (!touchDown) return;
    const dist = x - startX;
    if (Math.abs(dist) > 8) isScrubbing = true;
    if (isScrubbing) {
      const halfScreen = window.innerWidth / 2;
      const ratio = dist / halfScreen;
      const newWpm = Math.round((startWpm + ratio * (700 - 60)) / 10) * 10;
      wpm = Math.max(60, Math.min(700, newWpm));
    }
  }

  function onUp() {
    touchDown = false;
    isScrubbing = false;
    stopPlayback();
  }

  // Event binding
  function handleTouchStart(e) { e.preventDefault(); onDown(e.touches[0].clientX); }
  function handleTouchMove(e) { e.preventDefault(); onMove(e.touches[0].clientX); }
  function handleTouchEnd(e) { e.preventDefault(); onUp(); }
  function handleMouseDown(e) { e.preventDefault(); onDown(e.clientX); }
  function handleGlobalMouseMove(e) { if (touchDown) onMove(e.clientX); }
  function handleGlobalMouseUp() { if (touchDown) onUp(); }
  function handleGlobalTouchMove(e) { if (touchDown) e.preventDefault(); }
  function handleContextMenu(e) { e.preventDefault(); }

  let sliderDragging = $state(false);

  onMount(() => {
    window.addEventListener('mousemove', handleGlobalMouseMove);
    window.addEventListener('mouseup', handleGlobalMouseUp);
    document.addEventListener('touchmove', handleGlobalTouchMove, { passive: false });
    document.addEventListener('contextmenu', handleContextMenu);
  });

  onDestroy(() => {
    clearTimeout(timerId);
    window.removeEventListener('mousemove', handleGlobalMouseMove);
    window.removeEventListener('mouseup', handleGlobalMouseUp);
    document.removeEventListener('touchmove', handleGlobalTouchMove);
    document.removeEventListener('contextmenu', handleContextMenu);
  });

  const delta = $derived(wpm - startWpm);
  const deltaText = $derived((delta >= 0 ? '+' : '') + delta + ' WPM');
</script>

<div class="red-line"></div>

<div class="reader">
  <header class="header">
    <div class="header-left">
      <button class="back-btn" onclick={goLibrary}>&#8249;</button>
      <span class="title">
        <span class="title-sub">Reading</span>
        <span class="title-main">{item.title}</span>
      </span>
    </div>
    <span class="time-remaining">{timeStr}</span>
  </header>

  <div class="progress-bar">
    <div class="progress-fill" style="width:{progress}%"></div>
  </div>

  <section class="word-zone">
    <div class="word-container" bind:this={wordContainer}>
      <span class="pre-orp">{preOrpText}</span><span class="orp-letter" bind:this={orpSpan}>{orpChar}</span><span class="post-orp">{postOrpText}</span>
    </div>
  </section>

  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <section
    class="gesture-zone"
    bind:this={gestureZone}
    ontouchstart={handleTouchStart}
    ontouchmove={handleTouchMove}
    ontouchend={handleTouchEnd}
    ontouchcancel={handleTouchEnd}
    onmousedown={handleMouseDown}
  >
    <div class="drag-hint" class:show={showDragHint}>
      <span class="drag-hint-text"><span class="step-num small">2</span> Drag to change speed</span>
      <span class="drag-hint-arrow"></span>
    </div>

    {#if isScrubbing && touchDown}
      <div class="delta-label">{deltaText}</div>
    {/if}

    <div class="wpm-row">
      <span class="wpm-label">slow</span>
      <input
        type="range"
        class="wpm-slider"
        class:dragging={sliderDragging || isScrubbing}
        min="60"
        max="700"
        step="10"
        bind:value={wpm}
        ontouchstart={(e) => { e.stopPropagation(); sliderDragging = true; }}
        ontouchend={(e) => { e.stopPropagation(); sliderDragging = false; }}
        onmousedown={(e) => { e.stopPropagation(); sliderDragging = true; }}
        onmouseup={(e) => { e.stopPropagation(); sliderDragging = false; }}
      />
      <span class="wpm-label">fast</span>
    </div>

    <div class="hold-pad" class:active={touchDown}>
      <div class="pad-label" class:first-use={!hasUsed}>
        {#if !hasUsed}<span class="step-num">1</span>{/if}
        Hold to play
      </div>
    </div>
  </section>

  <footer class="footer">
    <span>{index + 1} / {words.length}</span>
    <span>{timeStr}</span>
  </footer>
</div>

{#if showEnd}
  <EndScreen
    totalWords={words.length}
    {elapsed}
    finalWpm={wpm}
    onRestart={restart}
    onLibrary={goLibrary}
  />
{/if}

<style>
  .red-line {
    position: fixed;
    left: 50%;
    top: 0;
    bottom: 0;
    width: 1.5px;
    transform: translateX(-50%);
    background: #e0000f;
    opacity: 0.18;
    z-index: 0;
    pointer-events: none;
  }
  .reader {
    display: grid;
    grid-template-rows: auto auto 1fr 1fr auto;
    height: 100dvh;
    width: 100%;
  }

  /* Header */
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 14px 20px;
  }
  .header-left {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .back-btn {
    background: none;
    border: none;
    color: rgba(240,237,232,0.6);
    font-size: 16px;
    cursor: pointer;
    font-family: inherit;
    padding: 0;
  }
  .title {
    display: flex;
    flex-direction: column;
    gap: 1px;
  }
  .title-sub {
    font-size: 12px;
    letter-spacing: 0.1em;
    color: rgba(240,237,232,0.7);
  }
  .title-main {
    font-size: 14px;
    text-transform: uppercase;
    letter-spacing: 0.2em;
    color: #f0ede8;
  }
  .time-remaining {
    font-size: 13px;
    text-transform: uppercase;
    letter-spacing: 0.15em;
    color: #f0ede8;
  }

  /* Word Zone */
  .word-zone {
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    overflow: hidden;
  }
  .word-container {
    position: absolute;
    left: 50%;
    white-space: nowrap;
    font-size: clamp(36px, 8vw, 64px);
    line-height: 1;
    will-change: transform;
  }
  .pre-orp, .post-orp {
    color: rgba(240,237,232,0.85);
    font-weight: 400;
  }
  .orp-letter {
    color: #e0000f;
    font-weight: 700;
  }

  /* Gesture Zone */
  .gesture-zone {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    position: relative;
    -webkit-user-select: none;
    user-select: none;
    cursor: pointer;
    padding: 16px 20px 20px;
    gap: 12px;
  }
  .hold-pad {
    width: 100%;
    max-width: 360px;
    flex: 1;
    border-radius: 16px;
    background: rgba(240,237,232,0.05);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 0.5px solid rgba(240,237,232,0.12);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.2s, border-color 0.2s, transform 0.15s;
  }
  .hold-pad.active {
    background: rgba(224,0,15,0.06);
    border-color: rgba(224,0,15,0.3);
    transform: scale(0.97);
  }
  .pad-label {
    font-size: 13px;
    text-transform: uppercase;
    letter-spacing: 0.2em;
    color: #ffffff;
    transition: font-size 0.3s, letter-spacing 0.3s;
    pointer-events: none;
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .pad-label.first-use {
    font-size: 16px;
    letter-spacing: 0.25em;
  }
  .step-num {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    border: 1.5px solid #ffffff;
    font-size: 15px;
    letter-spacing: 0;
    flex-shrink: 0;
  }
  .step-num.small {
    width: 16px;
    height: 16px;
    font-size: 12px;
    border-width: 1px;
  }
  .pad-label:not(.first-use) .step-num {
    width: 22px;
    height: 22px;
    font-size: 13px;
  }
  .delta-label {
    position: absolute;
    top: 8px;
    left: 50%;
    transform: translateX(-50%);
    font-size: 13px;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: #e0000f;
    pointer-events: none;
  }
  .drag-hint {
    position: absolute;
    top: -4px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 3px;
    opacity: 0;
    pointer-events: none;
  }
  .drag-hint-text {
    font-size: 13px;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    color: #ffffff;
    white-space: nowrap;
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .drag-hint-arrow {
    width: 0;
    height: 0;
    border-style: solid;
    border-width: 5px 4px 0 4px;
    border-color: #ffffff transparent transparent transparent;
  }
  @keyframes hintWiggle {
    0%   { transform: translateX(-50%); opacity: 0; }
    10%  { transform: translateX(-50%); opacity: 1; }
    30%  { transform: translateX(calc(-50% + 18px)); }
    50%  { transform: translateX(calc(-50% - 18px)); }
    70%  { transform: translateX(calc(-50% + 10px)); }
    85%  { transform: translateX(-50%); opacity: 1; }
    100% { transform: translateX(-50%); opacity: 0; }
  }
  .drag-hint.show {
    animation: hintWiggle 2s ease-in-out forwards;
  }

  /* Slider */
  .wpm-row {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    width: 100%;
    max-width: 360px;
    padding: 0 4px;
  }
  .wpm-label {
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    color: rgba(240,237,232,0.6);
    white-space: nowrap;
    flex-shrink: 0;
  }
  .wpm-slider {
    -webkit-appearance: none;
    appearance: none;
    flex: 1;
    max-width: 300px;
    height: 3px;
    background: #222;
    border-radius: 2px;
    outline: none;
    cursor: pointer;
  }
  .wpm-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #ffffff;
    border: none;
    cursor: pointer;
    transition: width 0.15s, height 0.15s;
  }
  .wpm-slider.dragging::-webkit-slider-thumb {
    width: 16px;
    height: 16px;
  }
  .wpm-slider::-moz-range-thumb {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #ffffff;
    border: none;
    cursor: pointer;
  }
  .wpm-slider.dragging::-moz-range-thumb {
    width: 16px;
    height: 16px;
  }

  /* Progress */
  .progress-bar {
    height: 2px;
    background: #333;
  }
  .progress-fill {
    height: 100%;
    background: #e0000f;
    transition: width 0.1s linear;
  }

  /* Footer */
  .footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 20px;
    border-top: 0.5px solid #333;
    font-size: 13px;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    color: rgba(240,237,232,0.75);
  }
</style>
