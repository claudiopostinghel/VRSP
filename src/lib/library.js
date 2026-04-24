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
  },
  {
    id: 'cos-e-rsvp',
    title: "Cos'è l'RSVP?",
    author: 'VRSP',
    lang: 'it',
    words: 350,
    text: `La Rapid Serial Visual Presentation, o RSVP, è una tecnica di lettura che mostra il testo una parola alla volta in una posizione fissa sullo schermo. Invece di spostare gli occhi lungo righe e paragrafi, lo sguardo resta ancorato a un unico punto mentre le parole scorrono in sequenza. Questo elimina le saccadi, quei piccoli movimenti oculari rapidi che durante la lettura tradizionale consumano una quantità sorprendente di tempo.

Il concetto nasce dalla ricerca in psicologia cognitiva negli anni Settanta, quando gli scienziati iniziarono a studiare la velocità con cui il cervello umano elabora il linguaggio scritto. Scoprirono che gran parte del tempo dedicato alla lettura non viene speso per comprendere le parole, ma per spostare fisicamente gli occhi da una parola all'altra. Eliminando questo sovraccarico meccanico, i lettori potevano assorbire il testo molto più velocemente senza perdere in comprensione.

Un elemento chiave dei lettori RSVP moderni è il Punto di Riconoscimento Ottimale, o ORP. Ogni parola ha una lettera specifica su cui il cervello si fissa naturalmente per prima. Nelle parole corte tende a trovarsi vicino all'inizio, in quelle più lunghe si sposta leggermente verso il centro. Allineando questa lettera in una posizione fissa sullo schermo ed evidenziandola, il lettore riconosce ogni parola più rapidamente perché l'occhio non deve cercare dove mettere a fuoco.

La velocità si misura in parole al minuto, o WPM. La velocità media di lettura silenziosa è di circa 200-250 WPM. Con l'RSVP molte persone raggiungono comodamente le 300-500 WPM dopo un breve periodo di adattamento. Alcuni utenti esperti superano le 600 WPM, anche se la comprensione può calare a velocità molto alte a seconda della complessità del materiale.

Anche la temporizzazione è adattiva. Le parole più lunghe restano sullo schermo un po' di più perché richiedono più tempo per essere elaborate. Le parole seguite da punteggiatura come virgole, punti o punti interrogativi ricevono una pausa aggiuntiva per permettere al cervello di registrare la fine di una frase o di un periodo. Questo riproduce il ritmo naturale della lettura e impedisce che l'esperienza risulti meccanica.

L'RSVP è particolarmente efficace sui dispositivi mobili dove lo spazio sullo schermo è limitato. Una sola parola alla volta non richiede quasi spazio orizzontale, il che lo rende ideale per gli smartphone. Non c'è scorrimento, non ci sono pagine da voltare e nessuna distrazione dal testo circostante. Basta tenere premuto, leggere e lasciare che le parole arrivino a te.`
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
