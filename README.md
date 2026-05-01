# Quoziente Intellettivo · Test cognitivo ICAR-16

Test cognitivo online basato su **ICAR-16** (International Cognitive Ability Resource), pubblicato in letteratura scientifica e di pubblico dominio. Stima il QI con classificazione qualitativa Wechsler e profilo cognitivo per 4 sottoscale.

App **statica vanilla** (HTML + CSS + JS, niente framework, niente build step) pensata per:

1. essere pubblicata su **GitHub Pages** (`index.html` modulare)
2. essere embeddata su **pezzalihub.app** o usata offline (`index_standalone.html`, single-file 511 KB)

## 📚 Base scientifica

Il test riproduce l'**ICAR Sample Test** descritto in:

> Condon, D. M., & Revelle, W. (2014). The international cognitive ability resource: Development and initial validation of a public-domain measure. *Intelligence*, 43, 52-64. <https://doi.org/10.1016/j.intell.2014.01.004>

- **16 item** suddivisi in 4 sottoscale: Verbal Reasoning, Letter & Number Series, Matrix Reasoning, Three-Dimensional Rotation
- **Tempo limite: 15 minuti**
- **Norme**: M = 7.88, SD = 1.86, α = 0.81 (paper, Tabella 2/3/12)
- **Conversione raw → QI**: lineare con z-scaling (M=100, SD=15), IC 95% = ±13 punti
- **Reliability adeguata** nel range raw 4–13 (≈ QI 70–130). Fuori da questo range il punteggio è etichettato come stima a bassa affidabilità

Item, immagini e chiavi corrette provengono da:

- **Appendix A** del Supplementary Material: <https://icar-project.com/attachments/download/61/Intelligence%20Supplement%202014.pdf> (vedi `docs/supp.pdf`)
- **Pacchetto R `psychTools::iqitems`** mantenuto da William Revelle (file `iqitems.Rd`, riga 58, vettore `iq.keys`)

## 🚀 Avvio locale

```bash
cd ~/Desktop/quoziente-intellettivo
python3 -m http.server 8000
# → http://localhost:8000          (modulare, con asset da assets/)
# → http://localhost:8000/index_standalone.html   (single file)
```

Per i test unitari di scoring (Node ≥ 18):

```bash
node test/scoring.test.cjs
```

## 📧 Configurazione EmailJS (3 step)

Il test funziona anche **senza** email. Per abilitare l'invio del report:

1. **Crea un account gratis** su <https://www.emailjs.com>
2. Aggiungi un servizio email (es. Gmail) e crea un **Email Template** che usi questi parametri: `{{to_email}}`, `{{to_name}}`, `{{qi}}`, `{{qi_class}}`, `{{raw}}`, `{{{report_html}}}` (triple braces per HTML raw)
3. **Copia `config.example.js` in `config.js`** e sostituisci i tre placeholder con `EMAILJS_PUBLIC_KEY`, `EMAILJS_SERVICE_ID`, `EMAILJS_TEMPLATE_ID` presi dalla dashboard EmailJS

`config.js` è già nel `.gitignore`, non verrà committato.

Per la **versione standalone**, modifica direttamente i valori dentro `index_standalone.html` (cerca il blocco `window.QIConfig = {...}`).

## 🌐 Deploy GitHub Pages

```bash
cd ~/Desktop/quoziente-intellettivo
git init
git add .
git commit -m "Initial commit: test cognitivo ICAR-16"
git branch -M main
git remote add origin https://github.com/[USERNAME]/quoziente-intellettivo.git
git push -u origin main
```

Quindi su GitHub: **Settings → Pages → Build from branch → main, /(root)**. Il sito sarà disponibile su `https://[USERNAME].github.io/quoziente-intellettivo`.

## 🔌 Embed su pezzalihub.app

Carica `index_standalone.html` come pagina autonoma o iframe:

```html
<iframe src="https://pezzalihub.app/qi/" width="100%" height="900" loading="lazy"
        title="Test cognitivo ICAR-16"></iframe>
```

Tutto è inline nel file, niente fetch esterni se non EmailJS via CDN (e EmailJS è opzionale).

## 📁 Struttura

```
quoziente-intellettivo/
├── index.html                  Versione modulare (GitHub Pages)
├── index_standalone.html       Versione single-file inline (pezzalihub.app)
├── build_standalone.cjs        Script Node che genera lo standalone
├── package.json                "type": "commonjs" + script di test/serve
├── config.example.js           Placeholder credenziali EmailJS
├── css/
│   └── style.css               Tema indaco/giallo, mobile-first, WCAG AA
├── js/
│   ├── icar_items.js           16 item ICAR (testo IT + chiavi originali)
│   ├── scoring.js              Conversione raw → QI + IC + profilo
│   ├── email.js                Invio risultato via EmailJS + HTML report
│   └── app.js                  Logica UI, timer, persistenza localStorage
├── assets/
│   ├── MR_45.jpg .. MR_55.jpg     Stimoli matrici (originali ICAR, CC)
│   └── R3D_03.jpg .. R3D_08.jpg   Stimoli rotazione 3D (originali ICAR, CC)
├── test/
│   └── scoring.test.cjs        Test unitari (30+ assert)
├── docs/                       Materiale di riferimento (paper, supplement, R help)
├── README.md
├── LICENSE                     CC BY-SA 4.0
└── .gitignore
```

## ⚠️ Disclaimer scientifico e legale

- Questo test è una somministrazione online della batteria ICAR-16 (Condon & Revelle, 2014). La traduzione italiana degli item verbali **non è stata oggetto di validazione su campione normativo italiano**.
- Il punteggio fornito è una **stima del QI** con margine di errore di ±13 punti (IC 95%).
- **Questo test NON è una valutazione clinica.** Non sostituisce strumenti psicometrici validati (WAIS, WISC, Raven) somministrati da uno psicologo abilitato.
- In Italia la diagnosi di funzionamento intellettivo è atto riservato agli psicologi iscritti all'Albo (L. 56/89). Per finalità cliniche, scolastiche, lavorative o legali rivolgersi a un professionista.
- I dati inseriti sono trattati ai sensi del GDPR. L'email è usata solo per inviare il risultato e non viene condivisa con terzi.

## 📜 Licenza

Codice rilasciato sotto **Creative Commons Attribution-ShareAlike 4.0** (CC BY-SA 4.0). Vedi `LICENSE`.

Gli item ICAR originali sono pubblicati con licenza Creative Commons dall'**ICAR Project** (<https://icar-project.com>). Quando redistribuisci o costruisci sopra questo lavoro, cita sia l'ICAR Project sia questa adattazione italiana.

## 🙏 Crediti

- David M. Condon e William Revelle per la creazione e pubblicazione open-source di ICAR-16
- Il pacchetto R [`psychTools`](https://CRAN.R-project.org/package=psychTools) di Revelle per il chiavi di scoring
- L'ICAR Project per la distribuzione gratuita degli stimoli
