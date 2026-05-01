/**
 * Configurazione EmailJS — istruzioni:
 *
 * 1. Crea un account gratis su https://www.emailjs.com
 * 2. Aggiungi un servizio email (es. Gmail) → annota il SERVICE_ID
 * 3. Crea un Email Template con questi parametri dinamici:
 *      {{to_email}}, {{to_name}}, {{qi}}, {{qi_class}}, {{raw}}, {{report_html}}
 *    Il body del template DEVE contenere {{{report_html}}} (triple braces, HTML raw)
 *    → annota il TEMPLATE_ID
 * 4. In Account → API Keys, copia la Public Key
 * 5. Copia questo file in `config.js` e sostituisci i placeholder
 * 6. NON committare `config.js` (è già nel .gitignore)
 *
 * Per pezzalihub.app: incollare i valori direttamente in `index_standalone.html`
 * nel blocco <script> all'inizio.
 */

window.QIConfig = {
  EMAILJS_PUBLIC_KEY:  'INSERIRE_QUI',
  EMAILJS_SERVICE_ID:  'INSERIRE_QUI',
  EMAILJS_TEMPLATE_ID: 'INSERIRE_QUI',
  EMAILJS_REPLY_TO:    ''  // opzionale, indirizzo a cui inoltrare le risposte
};
