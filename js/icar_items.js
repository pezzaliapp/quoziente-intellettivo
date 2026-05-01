/* eslint-disable */
/**
 * ICAR-16 — 16 item del Sample Test (Condon & Revelle, 2014, Intelligence 43, 52-64).
 * Testo originale: Appendix A del Supplementary Material (CC BY).
 * Chiavi corrette: psychTools::iqitems (file iqitems.Rd, riga 58 — vettore iq.keys).
 * I nomi propri inglesi (Zach, Matt, Richard, Joshua) sono mantenuti per fedeltà al test sorgente.
 * Le immagini MR/R3D sono le originali ufficiali ICAR estratte dal Supplementary Material PDF.
 */

const ICAR16_ITEMS = [
  // ───── VR — Verbal Reasoning ─────
  {
    id: 'VR.04', subscale: 'VR', type: 'text',
    stem: 'Quale numero è un quinto di un quarto di un nono di 900?',
    options: ['2', '3', '4', '5', '6', '7'],
    key: 4 // 5
  },
  {
    id: 'VR.16', subscale: 'VR', type: 'text',
    stem: 'Zach è più alto di Matt e Richard è più basso di Zach. Quale delle seguenti affermazioni sarebbe più accurata?',
    options: [
      'Richard è più alto di Matt',
      'Richard è più basso di Matt',
      'Richard è alto come Matt',
      'È impossibile dirlo'
    ],
    key: 4
  },
  {
    id: 'VR.17', subscale: 'VR', type: 'text',
    stem: 'Joshua ha 12 anni e sua sorella ha tre volte la sua età. Quando Joshua avrà 23 anni, quanti anni avrà sua sorella?',
    options: ['35', '39', '44', '47', '53', '57'],
    key: 4
  },
  {
    id: 'VR.19', subscale: 'VR', type: 'text',
    stem: 'Se il giorno dopo domani è due giorni prima di giovedì, che giorno è oggi?',
    options: ['Venerdì', 'Lunedì', 'Mercoledì', 'Sabato', 'Martedì', 'Domenica'],
    key: 6
  },

  // ───── LN — Letter and Number Series ─────
  {
    id: 'LN.07', subscale: 'LN', type: 'text',
    stem: 'Nella seguente serie alfanumerica, qual è la lettera successiva? K N P S U',
    options: ['S', 'T', 'U', 'V', 'W', 'X'],
    key: 6
  },
  {
    id: 'LN.33', subscale: 'LN', type: 'text',
    stem: 'Nella seguente serie alfanumerica, qual è la lettera successiva? V Q M J H',
    options: ['E', 'F', 'G', 'H', 'I', 'J'],
    key: 3
  },
  {
    id: 'LN.34', subscale: 'LN', type: 'text',
    stem: 'Nella seguente serie alfanumerica, qual è la lettera successiva? I J L O S',
    options: ['T', 'U', 'V', 'X', 'Y', 'Z'],
    key: 4
  },
  {
    id: 'LN.58', subscale: 'LN', type: 'text',
    stem: 'Nella seguente serie alfanumerica, qual è la lettera successiva? Q S N P L',
    options: ['J', 'H', 'I', 'N', 'M', 'L'],
    key: 4
  },

  // ───── MR — Matrix Reasoning ─────
  {
    id: 'MR.45', subscale: 'MR', type: 'image',
    stem: 'Indica quale risposta completa correttamente la figura sottostante.',
    image: 'assets/MR_45.jpg',
    options: ['A', 'B', 'C', 'D', 'E', 'F'],
    key: 5 // E
  },
  {
    id: 'MR.46', subscale: 'MR', type: 'image',
    stem: 'Indica quale risposta completa correttamente la figura sottostante.',
    image: 'assets/MR_46.jpg',
    options: ['A', 'B', 'C', 'D', 'E', 'F'],
    key: 2 // B
  },
  {
    id: 'MR.47', subscale: 'MR', type: 'image',
    stem: 'Indica quale risposta completa correttamente la figura sottostante.',
    image: 'assets/MR_47.jpg',
    options: ['A', 'B', 'C', 'D', 'E', 'F'],
    key: 2 // B
  },
  {
    id: 'MR.55', subscale: 'MR', type: 'image',
    stem: 'Indica quale risposta completa correttamente la figura sottostante.',
    image: 'assets/MR_55.jpg',
    options: ['A', 'B', 'C', 'D', 'E', 'F'],
    key: 4 // D
  },

  // ───── R3D — Three-Dimensional Rotation ─────
  {
    id: 'R3D.03', subscale: 'R3D', type: 'image',
    stem: 'Tutti i cubi qui sotto hanno un’immagine diversa su ogni faccia. Seleziona la scelta che potrebbe rappresentare una rotazione del cubo X.',
    image: 'assets/R3D_03.jpg',
    options: ['A', 'B', 'C', 'D — Nessuno dei cubi può essere una rotazione', 'E', 'F', 'G', 'H — Non so la soluzione'],
    key: 3 // C
  },
  {
    id: 'R3D.04', subscale: 'R3D', type: 'image',
    stem: 'Tutti i cubi qui sotto hanno un’immagine diversa su ogni faccia. Seleziona la scelta che potrebbe rappresentare una rotazione del cubo X.',
    image: 'assets/R3D_04.jpg',
    options: ['A', 'B', 'C', 'D — Nessuno dei cubi può essere una rotazione', 'E', 'F', 'G', 'H — Non so la soluzione'],
    key: 2 // B
  },
  {
    id: 'R3D.06', subscale: 'R3D', type: 'image',
    stem: 'Tutti i cubi qui sotto hanno un’immagine diversa su ogni faccia. Seleziona la scelta che potrebbe rappresentare una rotazione del cubo X.',
    image: 'assets/R3D_06.jpg',
    options: ['A', 'B', 'C', 'D — Nessuno dei cubi può essere una rotazione', 'E', 'F', 'G', 'H — Non so la soluzione'],
    key: 6 // F
  },
  {
    id: 'R3D.08', subscale: 'R3D', type: 'image',
    stem: 'Tutti i cubi qui sotto hanno un’immagine diversa su ogni faccia. Seleziona la scelta che potrebbe rappresentare una rotazione del cubo X.',
    image: 'assets/R3D_08.jpg',
    options: ['A', 'B', 'C', 'D — Nessuno dei cubi può essere una rotazione', 'E', 'F', 'G', 'H — Non so la soluzione'],
    key: 7 // G
  }
];

if (typeof module !== 'undefined') module.exports = { ICAR16_ITEMS };
