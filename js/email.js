/* eslint-disable */
/**
 * Invio risultato via EmailJS (client-side, gratis, niente backend).
 * Configurazione: vedi config.example.js → copia in config.js e compila.
 */

function buildEmailHtml(report, userEmail) {
  const s = report.score;
  const p = report.profile;
  const subscaleNames = {
    LN: 'Serie alfanumeriche',
    MR: 'Ragionamento per matrici',
    VR: 'Ragionamento verbale',
    R3D: 'Rotazione 3D'
  };
  const profileRows = ['LN', 'MR', 'VR', 'R3D'].map(sc => {
    const r = p[sc];
    const color = r.code === 'strength' ? '#059669' :
                  r.code === 'weakness' ? '#dc2626' : '#6b7280';
    const fill = Math.max(2, Math.min(100, r.barFill));
    return `
      <tr>
        <td style="padding:8px 0;width:55%;font-size:14px;color:#111827;">
          <strong>${subscaleNames[sc]}</strong><br>
          <span style="font-size:12px;color:#6b7280;">${r.raw} / 4 risposte corrette · media pop. ${r.mean}</span>
        </td>
        <td style="padding:8px 0;width:30%;">
          <div style="background:#f3f4f6;border-radius:999px;height:10px;overflow:hidden;">
            <div style="background:#4f46e5;height:100%;width:${fill}%;"></div>
          </div>
        </td>
        <td style="padding:8px 0;width:15%;text-align:right;font-size:18px;font-weight:700;color:${color};">
          ${r.symbol}
        </td>
      </tr>`;
  }).join('');

  const warningBlock = s.warning ? `
    <div style="background:#fff7ed;border-left:4px solid #f59e0b;padding:14px;margin:18px 0;border-radius:6px;">
      <strong style="color:#7c2d12;">⚠️ Attenzione</strong><br>
      <span style="font-size:13px;color:#7c2d12;">${s.warning}</span>
    </div>` : '';

  return `
  <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:600px;margin:0 auto;color:#111827;">
    <div style="background:linear-gradient(135deg,#3730a3,#1e1b4b);padding:32px 24px;border-radius:12px 12px 0 0;text-align:center;color:white;">
      <div style="font-size:13px;opacity:0.85;letter-spacing:0.05em;">IL TUO RISULTATO</div>
      <div style="font-size:64px;font-weight:800;line-height:1;margin:14px 0 4px;color:#fde047;">${s.iq}</div>
      <div style="font-size:14px;opacity:0.95;">QI stimato (Intervallo di confidenza 95%: ${s.ci95.lo} – ${s.ci95.hi})</div>
      <div style="display:inline-block;margin-top:18px;padding:6px 16px;border:1px solid #facc15;border-radius:999px;color:#fde047;font-size:13px;font-weight:600;">
        ${s.classification.label}
      </div>
    </div>
    <div style="background:white;padding:28px 24px;border:1px solid #e5e7eb;border-top:0;border-radius:0 0 12px 12px;">
      <p style="margin:0 0 14px;font-size:14px;color:#374151;">
        Hai risposto correttamente a <strong>${s.raw} su 16 item</strong> (percentile ${s.percentile}%).
      </p>
      ${warningBlock}
      <h3 style="margin:24px 0 12px;font-size:16px;color:#1e1b4b;">Profilo cognitivo</h3>
      <table style="width:100%;border-collapse:collapse;font-size:14px;">${profileRows}</table>
      <p style="margin-top:14px;font-size:12px;color:#6b7280;">▲ punto di forza relativo · → in media · ▼ area da rinforzare</p>
      <hr style="border:0;border-top:1px solid #e5e7eb;margin:24px 0;">
      <p style="font-size:12px;color:#6b7280;line-height:1.5;">
        <strong>Fonte:</strong> Test basato su ICAR-16 (Condon, D. M., &amp; Revelle, W., 2014. The international cognitive ability resource: Development and initial validation of a public-domain measure. <em>Intelligence</em>, 43, 52-64).
        Item rilasciati con licenza Creative Commons. Traduzione italiana non validata su campione normativo italiano. I nomi propri sono mantenuti nella forma originale inglese per fedeltà al test sorgente.
      </p>
      <p style="font-size:12px;color:#6b7280;line-height:1.5;margin-top:10px;">
        <strong>Disclaimer.</strong> Questo test è una stima del QI con margine di errore di ±13 punti (95% CI).
        <strong>Non sostituisce una valutazione clinica.</strong> In Italia la diagnosi del funzionamento intellettivo è atto riservato agli psicologi iscritti all'Albo (L. 56/89). Per finalità cliniche, scolastiche, lavorative o legali rivolgersi a un professionista.
      </p>
      <p style="font-size:11px;color:#9ca3af;margin-top:14px;">
        Email inviata a ${userEmail} · I tuoi dati sono trattati ai sensi del GDPR e non condivisi con terzi.
      </p>
    </div>
  </div>`;
}

/**
 * Inoltra il report via EmailJS. Restituisce promise<{ ok, error? }>.
 */
async function sendReportEmail(report, userEmail) {
  if (typeof window === 'undefined' || !window.emailjs) {
    return { ok: false, error: 'EmailJS non caricato' };
  }
  const cfg = window.QIConfig || {};
  if (!cfg.EMAILJS_PUBLIC_KEY || cfg.EMAILJS_PUBLIC_KEY === 'INSERIRE_QUI') {
    return { ok: false, error: 'EmailJS non configurato (vedi config.example.js)' };
  }

  try {
    window.emailjs.init({ publicKey: cfg.EMAILJS_PUBLIC_KEY });
    const html = buildEmailHtml(report, userEmail);
    await window.emailjs.send(cfg.EMAILJS_SERVICE_ID, cfg.EMAILJS_TEMPLATE_ID, {
      to_email: userEmail,
      to_name: userEmail.split('@')[0],
      qi: report.score.iq,
      qi_class: report.score.classification.label,
      raw: report.score.raw,
      report_html: html,
      reply_to: cfg.EMAILJS_REPLY_TO || ''
    });
    return { ok: true };
  } catch (err) {
    return { ok: false, error: (err && err.text) || String(err) };
  }
}

if (typeof window !== 'undefined') {
  window.QIEmail = { sendReportEmail, buildEmailHtml };
}
if (typeof module !== 'undefined') {
  module.exports = { sendReportEmail, buildEmailHtml };
}
