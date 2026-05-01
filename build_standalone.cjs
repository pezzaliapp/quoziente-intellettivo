#!/usr/bin/env node
/**
 * Genera le versioni single-file (tutto inline) dei due entry HTML:
 *
 *   index.html  →  index_standalone.html        (pagina autonoma)
 *   embed.html  →  embed_standalone.html        (iframe-ready, postMessage)
 *
 * Pensati per essere caricati senza dipendenze esterne ad eccezione
 * di EmailJS via CDN. CSS/JS/immagini base64 e credenziali EmailJS
 * inline (lette da config.js, locale e non versionato).
 *
 * NB: usiamo SEMPRE callback come secondo argomento di .replace().
 * Con replacement-string, '$$' viene interpretato come '$' letterale
 * (escape MDN). app.js contiene `const $$ = ...` e finiva scritto come
 * `const $ = ...` nel bundle, generando "Identifier '$' already declared".
 * Le callback NON subiscono questa sostituzione.
 */
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const r = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');
const b64 = (p) => fs.readFileSync(path.join(ROOT, p)).toString('base64');

const css       = r('css/style.css');
const itemsJs   = r('js/icar_items.js');
const scoringJs = r('js/scoring.js');
const emailJs   = r('js/email.js');
const appJs     = r('js/app.js');

const inlineImages = {
  'MR.45':  'data:image/jpeg;base64,' + b64('assets/MR_45.jpg'),
  'MR.46':  'data:image/jpeg;base64,' + b64('assets/MR_46.jpg'),
  'MR.47':  'data:image/jpeg;base64,' + b64('assets/MR_47.jpg'),
  'MR.55':  'data:image/jpeg;base64,' + b64('assets/MR_55.jpg'),
  'R3D.03': 'data:image/jpeg;base64,' + b64('assets/R3D_03.jpg'),
  'R3D.04': 'data:image/jpeg;base64,' + b64('assets/R3D_04.jpg'),
  'R3D.06': 'data:image/jpeg;base64,' + b64('assets/R3D_06.jpg'),
  'R3D.08': 'data:image/jpeg;base64,' + b64('assets/R3D_08.jpg')
};

// Se config.js esiste in locale, ne preserviamo le credenziali EmailJS nello standalone.
// Altrimenti restano i placeholder INSERIRE_QUI.
const creds = {
  EMAILJS_PUBLIC_KEY:  'INSERIRE_QUI',
  EMAILJS_SERVICE_ID:  'INSERIRE_QUI',
  EMAILJS_TEMPLATE_ID: 'INSERIRE_QUI',
  EMAILJS_REPLY_TO:    ''
};
try {
  const cfgRaw = r('config.js');
  const re = /EMAILJS_(\w+):\s*'([^']*)'/g;
  let m;
  while ((m = re.exec(cfgRaw)) !== null) {
    creds['EMAILJS_' + m[1]] = m[2];
  }
  console.log('✓ credenziali EmailJS lette da config.js');
} catch (_) {
  console.log('⚠ config.js assente — uso placeholder INSERIRE_QUI');
}

const inlinedScripts = `
  <!-- Configurazione EmailJS: sostituire i valori sotto prima di pubblicare -->
  <script>
    window.QIConfig = {
      EMAILJS_PUBLIC_KEY:  '${creds.EMAILJS_PUBLIC_KEY}',
      EMAILJS_SERVICE_ID:  '${creds.EMAILJS_SERVICE_ID}',
      EMAILJS_TEMPLATE_ID: '${creds.EMAILJS_TEMPLATE_ID}',
      EMAILJS_REPLY_TO:    '${creds.EMAILJS_REPLY_TO}'
    };
    window.QIInlineImages = ${JSON.stringify(inlineImages)};
  </script>
  <script>${itemsJs}</script>
  <script>${scoringJs}</script>
  <script>${emailJs}</script>
  <script>${appJs}</script>
`;

/**
 * Trasforma un entry HTML modulare in versione single-file inline.
 * @param {string} sourceFile   es. 'index.html' o 'embed.html'
 * @param {string} outFile      es. 'index_standalone.html'
 * @param {string} title        nuovo <title> da iniettare
 */
function buildStandalone(sourceFile, outFile, title) {
  let html = r(sourceFile);

  // 1. Inline CSS (path relativo allo stesso file)
  html = html.replace(
    /<link rel="stylesheet" href="css\/style\.css">/,
    () => `<style>\n${css}\n</style>`
  );

  // 2. Rimuovi link a Google Fonts (lo standalone deve funzionare offline)
  html = html.replace(/<link rel="preconnect"[^>]*>\s*/g, '');
  html = html.replace(/<link href="https:\/\/fonts\.googleapis[^"]*"[^>]*>\s*/, '');

  // 3. Rimuovi i 4 <script src="js/..."> + config.js, saranno re-iniettati inline
  html = html.replace(/<script src="config\.js"[^>]*><\/script>\s*/, '');
  html = html.replace(/<script src="js\/icar_items\.js"[^>]*><\/script>\s*/, '');
  html = html.replace(/<script src="js\/scoring\.js"[^>]*><\/script>\s*/, '');
  html = html.replace(/<script src="js\/email\.js"[^>]*><\/script>\s*/, '');
  html = html.replace(/<script src="js\/app\.js"[^>]*><\/script>\s*/, '');

  // 4. Inserisci il bundle inline subito prima del </body>
  //    (callback obbligatoria: vedi nota sopra su '$$' nelle replacement-string)
  html = html.replace('</body>', () => inlinedScripts + '\n</body>');

  // 5. Adatta <title>
  html = html.replace(/<title>[^<]*<\/title>/, () => `<title>${title}</title>`);

  fs.writeFileSync(path.join(ROOT, outFile), html, 'utf8');
  const sizeKB = (fs.statSync(path.join(ROOT, outFile)).size / 1024).toFixed(1);
  console.log(`✓ ${outFile} generato (${sizeKB} KB)`);
}

// ── Genera i due artefatti ──────────────────────────────────────────────
buildStandalone(
  'index.html',
  'index_standalone.html',
  'Quoziente Intellettivo · Test ICAR-16 (standalone)'
);
buildStandalone(
  'embed.html',
  'embed_standalone.html',
  'Quoziente Intellettivo · embed (standalone)'
);
