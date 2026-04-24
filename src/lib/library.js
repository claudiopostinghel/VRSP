export const LIBRARY = [
  {
    id: 'what-is-rsvp',
    title: 'What is RSVP?',
    author: 'VRSP',
    lang: 'en',
    words: 350,
    text: `Rapid Serial Visual Presentation, or RSVP, is a reading technique that displays text one word at a time in a fixed position on the screen. Instead of moving your eyes across lines and paragraphs, you keep your gaze locked on a single point while words flash in sequence. This eliminates saccades, the small rapid eye movements that consume a surprising amount of time during traditional reading.

The concept emerged from cognitive psychology research in the 1970s, when scientists began studying how quickly the human brain could process written language. They discovered that much of the time spent reading is not actually spent understanding words but rather physically relocating the eyes from one word to the next. By removing that mechanical overhead, readers could absorb text significantly faster without losing comprehension.

A key element of modern RSVP readers is the Optimal Recognition Point, or ORP. Every word has a specific letter that your brain naturally fixates on first. For short words it tends to be near the beginning, for longer words it shifts slightly toward the center. By aligning this letter at a fixed position on screen and highlighting it, the reader can recognize each word faster because the eye does not need to search for where to focus.

The speed is measured in words per minute, or WPM. Average silent reading speed is around 200 to 250 WPM. With RSVP, many people comfortably reach 300 to 500 WPM after a short adjustment period. Some experienced users push beyond 600 WPM, though comprehension can start to decline at very high speeds depending on the complexity of the material.

Timing is also adaptive. Longer words stay on screen slightly longer because they take more time to process. Words followed by punctuation like commas, periods, or question marks receive an extra pause to let the brain register the end of a phrase or sentence. This mimics the natural rhythm of reading and prevents the experience from feeling robotic.

RSVP is particularly effective on mobile devices where screen space is limited. A single word at a time needs almost no horizontal space, making it ideal for phones. There is no scrolling, no page turning, and no distraction from surrounding text. You simply hold, read, and let the words come to you.`
  }
];

// Texts loaded from /public/texts/ at runtime
export async function loadCustomTexts() {
  try {
    const res = await fetch('/texts/index.json');
    if (!res.ok) return [];
    const list = await res.json();
    const texts = await Promise.all(list.map(async (entry) => {
      const r = await fetch(`/texts/${entry.file}`);
      const text = await r.text();
      const wordCount = text.trim().split(/\s+/).length;
      return { ...entry, text, words: wordCount };
    }));
    return texts;
  } catch {
    return [];
  }
}
