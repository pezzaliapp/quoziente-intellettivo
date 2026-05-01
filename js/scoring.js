/* eslint-disable */
/**
 * Scoring ICAR-16 → QI standardizzato (M=100, SD=15).
 *
 * Norme da Condon & Revelle (2014), "The international cognitive ability resource:
 * Development and initial validation of a public-domain measure",
 * Intelligence, 43, 52-64.
 *
 *   Mean raw    = 7.88   [paper Tabella 2 — somma item means delle 4 sottoscale]
 *   SD raw      = 1.86   [paper Tabella 12 — Study 1 unrestricted]
 *   alpha       = 0.81   [paper Tabella 3]
 *   SEM_QI      = 6.54   [= 15 * sqrt(1 - alpha)]
 *   95% CI      = ±13    [= 1.96 * SEM_QI]
 *
 * Affidabilità del punteggio (dal supplementary, Tabelle 7-11):
 *   reliability >= 0.7 nel range latente [-2, +2]  ≡  raw [4, 13]
 *   Fuori da questo range il valore esatto è poco preciso.
 */

const ICAR16 = Object.freeze({
  MEAN: 7.88,
  SD: 1.86,
  ALPHA: 0.81,
  SEM_QI: 6.54,
  CI95: 12.82,
  RELIABLE_RAW_MIN: 4,
  RELIABLE_RAW_MAX: 13
});

// Medie stimate empiricamente da Condon & Revelle 2014 + ricostruzione binomiale;
// SD non pubblicate per sottoscale separate, quindi confronto qualitativo invece di z-score.
const SUBSCALE_MEAN = Object.freeze({
  LN: 2.25,   // 0.62 + 0.59 + 0.62 + 0.42
  MR: 1.96,   // 0.52 + 0.60 + 0.48 + 0.36
  VR: 2.83,   // 0.77 + 0.69 + 0.73 + 0.64
  R3D: 0.84   // 0.17 + 0.21 + 0.29 + 0.17
});

/**
 * CDF della normale standard, approssimazione Abramowitz & Stegun 26.2.17.
 */
function normalCDF(z) {
  const t = 1 / (1 + 0.2316419 * Math.abs(z));
  const d = 0.3989422804014327 * Math.exp(-0.5 * z * z);
  const p = d * t * (0.31938153 + t * (-0.356563782 +
    t * (1.781477937 + t * (-1.821255978 + t * 1.330274429))));
  return z >= 0 ? 1 - p : p;
}

/**
 * Classificazione qualitativa Wechsler.
 */
function wechslerClass(qi) {
  if (qi < 70)  return { code: 'extremely_low', label: 'Estremamente basso' };
  if (qi < 80)  return { code: 'borderline',    label: 'Borderline' };
  if (qi < 90)  return { code: 'low_average',   label: 'Medio-basso' };
  if (qi < 110) return { code: 'average',       label: 'Medio' };
  if (qi < 120) return { code: 'high_average',  label: 'Medio-alto' };
  if (qi < 130) return { code: 'superior',      label: 'Superiore' };
  return        { code: 'very_superior', label: 'Molto superiore' };
}

/**
 * Conversione raw → QI con IC 95% e flag di affidabilità.
 *
 * @param {number} raw   somma item corretti, intero in [0, 16]
 * @returns {{
 *   raw: number,
 *   z: number,
 *   iq: number,
 *   ci95: { lo: number, hi: number },
 *   percentile: number,
 *   classification: { code: string, label: string },
 *   confidence: 'high' | 'low',
 *   warning: string | null
 * }}
 */
function rawToIQ(raw) {
  if (!Number.isInteger(raw) || raw < 0 || raw > 16) {
    throw new RangeError('raw deve essere un intero in [0, 16], ricevuto: ' + raw);
  }
  const z = (raw - ICAR16.MEAN) / ICAR16.SD;
  const iq = Math.round(100 + 15 * z);
  const lo = Math.round(iq - ICAR16.CI95);
  const hi = Math.round(iq + ICAR16.CI95);
  const reliable = raw >= ICAR16.RELIABLE_RAW_MIN && raw <= ICAR16.RELIABLE_RAW_MAX;
  return {
    raw,
    z: Math.round(z * 100) / 100,
    iq,
    ci95: { lo, hi },
    percentile: Math.round(normalCDF(z) * 1000) / 10,
    classification: wechslerClass(iq),
    confidence: reliable ? 'high' : 'low',
    warning: reliable ? null :
      'Punteggio fuori dal range di misurazione affidabile del test (raw ≤ 3 o ≥ 14). ' +
      'Il valore esatto è statisticamente poco preciso: la reliability del test scende sotto 0.5 in queste code. ' +
      'Per una valutazione accurata in questo range si consiglia un test psicometrico completo (WAIS) ' +
      'somministrato da uno psicologo abilitato.'
  };
}

/**
 * Calcola raw totale + raw per sottoscala dato un array di risposte.
 *
 * @param {Array<{ id: string, subscale: string, key: number }>} items
 * @param {Object<string, number>} answers   {id: opzione_scelta_1based}
 */
function computeRawScores(items, answers) {
  const subscale = { LN: 0, MR: 0, VR: 0, R3D: 0 };
  let total = 0;
  for (const it of items) {
    const a = answers[it.id];
    if (a === it.key) {
      subscale[it.subscale]++;
      total++;
    }
  }
  return { total, subscale };
}

/**
 * Profilo cognitivo qualitativo (▲ / → / ▼) per le 4 sottoscale.
 * Soglia: ±1 punto grezzo rispetto alla media stimata della popolazione.
 */
function cognitiveProfile(subscaleRaw) {
  const profile = {};
  for (const sc of ['LN', 'MR', 'VR', 'R3D']) {
    const raw = subscaleRaw[sc] ?? 0;
    const mean = SUBSCALE_MEAN[sc];
    const delta = raw - mean;
    let symbol, code, label;
    if (delta >= 1)       { symbol = '▲'; code = 'strength';  label = 'Punto di forza relativo'; }
    else if (delta <= -1) { symbol = '▼'; code = 'weakness';  label = 'Area di debolezza relativa'; }
    else                  { symbol = '→'; code = 'average';   label = 'Nella media'; }
    profile[sc] = {
      raw, mean, delta: Math.round(delta * 100) / 100,
      symbol, code, label,
      // % posizione barra: raw / 4 (max items per sottoscala)
      barFill: Math.round((raw / 4) * 100),
      meanBarFill: Math.round((mean / 4) * 100)
    };
  }
  return profile;
}

const SUBSCALE_LABEL = Object.freeze({
  LN:  'Serie alfanumeriche (ragionamento induttivo)',
  MR:  'Ragionamento per matrici (logico-astratto)',
  VR:  'Ragionamento verbale e logico',
  R3D: 'Rotazione 3D (visuospaziale)'
});

/**
 * Funzione "tutto in uno": dalle risposte → report completo.
 */
function buildReport(items, answers) {
  const { total, subscale } = computeRawScores(items, answers);
  return {
    score: rawToIQ(total),
    subscaleRaw: subscale,
    profile: cognitiveProfile(subscale),
    answeredCount: Object.keys(answers).length,
    itemCount: items.length
  };
}

if (typeof module !== 'undefined') {
  module.exports = {
    ICAR16, SUBSCALE_MEAN, SUBSCALE_LABEL,
    normalCDF, wechslerClass, rawToIQ,
    computeRawScores, cognitiveProfile, buildReport
  };
}
