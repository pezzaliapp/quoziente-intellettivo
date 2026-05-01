#!/usr/bin/env node
/**
 * Genera index_standalone.html — versione single-file con tutto inline:
 * CSS, JS, immagini base64. Pensato per embed su pezzalihub.app o uso
 * offline senza dipendenze esterne (ad esclusione di EmailJS via CDN).
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
const indexHtml = r('index.html');

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

let html = indexHtml;

// 1. Inline CSS
html = html.replace(
  /<link rel="stylesheet" href="css\/style\.css">/,
  `<style>\n${css}\n</style>`
);

// 2. Rimuovi font Google (offline-first); fallback su system font
html = html.replace(/<link rel="preconnect"[^>]*>\s*/g, '');
html = html.replace(/<link href="https:\/\/fonts\.googleapis[^"]*"[^>]*>\s*/, '');

// 3. Rimuovi i 4 <script src="js/..."> e config.js, sostituiscili con un blocco inline
html = html.replace(/<script src="config\.js"[^>]*><\/script>\s*/, '');
html = html.replace(/<script src="js\/icar_items\.js"[^>]*><\/script>\s*/, '');
html = html.replace(/<script src="js\/scoring\.js"[^>]*><\/script>\s*/, '');
html = html.replace(/<script src="js\/email\.js"[^>]*><\/script>\s*/, '');
html = html.replace(/<script src="js\/app\.js"[^>]*><\/script>\s*/, '');

const inlinedScripts = `
  <!-- Configurazione EmailJS: sostituire i valori sotto prima di pubblicare -->
  <script>
    window.QIConfig = {
      EMAILJS_PUBLIC_KEY:  'INSERIRE_QUI',
      EMAILJS_SERVICE_ID:  'INSERIRE_QUI',
      EMAILJS_TEMPLATE_ID: 'INSERIRE_QUI',
      EMAILJS_REPLY_TO:    ''
    };
    window.QIInlineImages = ${JSON.stringify(inlineImages)};
  </script>
  <script>${itemsJs}</script>
  <script>${scoringJs}</script>
  <script>${emailJs}</script>
  <script>${appJs}</script>
`;
// Inseriamo il bundle subito prima del </body>
html = html.replace('</body>', inlinedScripts + '\n</body>');

// 4. Rimuovi il bridge che ora è inutile (ma se rimasto, va bene comunque)

// 5. Adatta titolo standalone
html = html.replace(
  /<title>[^<]*<\/title>/,
  '<title>Quoziente Intellettivo · Test ICAR-16 (standalone)</title>'
);

fs.writeFileSync(path.join(ROOT, 'index_standalone.html'), html, 'utf8');
const sizeKB = (fs.statSync(path.join(ROOT, 'index_standalone.html')).size / 1024).toFixed(1);
console.log(`✓ index_standalone.html generato (${sizeKB} KB)`);
