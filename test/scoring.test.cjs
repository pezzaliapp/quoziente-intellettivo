/* Test unitari minimali per scoring.js — eseguire con: node test/scoring.test.js */
const { rawToIQ, computeRawScores, cognitiveProfile, buildReport } = require('../js/scoring.js');
const { ICAR16_ITEMS } = require('../js/icar_items.js');

let failed = 0;
function eq(actual, expected, label) {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  console.log((ok ? '✓' : '✗') + '  ' + label + (ok ? '' : `  expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`));
  if (!ok) failed++;
}
function ok(cond, label) { console.log((cond ? '✓' : '✗') + '  ' + label); if (!cond) failed++; }

// === Casi richiesti dall'utente ===
const r0  = rawToIQ(0);   eq(r0.iq,  36,  'raw=0  → QI 36');
const r4  = rawToIQ(4);   eq(r4.iq,  69,  'raw=4  → QI 69 (confine soglia 70)');
const r8  = rawToIQ(8);   eq(r8.iq,  101, 'raw=8  → QI ≈100 (atteso, centro distribuzione)');
const r11 = rawToIQ(11);  eq(r11.iq, 125, 'raw=11 → QI 125 (confine soglia 120)');
const r16 = rawToIQ(16);  eq(r16.iq, 165, 'raw=16 → QI 165 (estremo alto)');

// === Confidence flag ===
ok(r0.confidence  === 'low',  'raw=0  → confidence=low');
ok(r4.confidence  === 'high', 'raw=4  → confidence=high');
ok(r8.confidence  === 'high', 'raw=8  → confidence=high');
ok(r11.confidence === 'high', 'raw=11 → confidence=high');
ok(r16.confidence === 'low',  'raw=16 → confidence=low');
ok(r0.warning  !== null, 'raw=0  → warning presente');
ok(r8.warning  === null, 'raw=8  → nessun warning');
ok(r16.warning !== null, 'raw=16 → warning presente');

// === Confidence interval ±13 ===
ok(r8.ci95.hi - r8.ci95.lo === 26 || r8.ci95.hi - r8.ci95.lo === 25, 'raw=8 → IC 95% ampio ~26 punti');

// === Classificazione Wechsler ===
eq(rawToIQ(8).classification.code,  'average',          'raw=8  → "Medio"');
eq(rawToIQ(11).classification.code, 'superior',         'raw=11 → "Superiore"');
eq(rawToIQ(12).classification.code, 'very_superior',    'raw=12 → "Molto superiore" (QI 133)');
eq(rawToIQ(5).classification.code,  'borderline',       'raw=5  → "Borderline" (QI 77)');

// === Range error ===
let threwLow = false; try { rawToIQ(-1); } catch(e) { threwLow = true; }
ok(threwLow, 'raw=-1 → RangeError');
let threwHigh = false; try { rawToIQ(17); } catch(e) { threwHigh = true; }
ok(threwHigh, 'raw=17 → RangeError');

// === computeRawScores: tutte le risposte corrette ===
const allCorrect = Object.fromEntries(ICAR16_ITEMS.map(it => [it.id, it.key]));
const cr = computeRawScores(ICAR16_ITEMS, allCorrect);
eq(cr.total, 16, 'tutte risposte corrette → raw 16');
eq(cr.subscale, { LN: 4, MR: 4, VR: 4, R3D: 4 }, 'subscale tutti 4/4');

// === computeRawScores: nessuna risposta ===
const cr0 = computeRawScores(ICAR16_ITEMS, {});
eq(cr0.total, 0, 'nessuna risposta → raw 0');

// === Profile ===
const profMixed = cognitiveProfile({ LN: 4, MR: 0, VR: 3, R3D: 1 });
eq(profMixed.LN.code,  'strength',  'LN 4/4 → punto di forza');
eq(profMixed.MR.code,  'weakness',  'MR 0/4 → debolezza');
eq(profMixed.VR.code,  'average',   'VR 3/4 (vicino a 2.83) → media');
eq(profMixed.R3D.code, 'average',   'R3D 1/4 (vicino a 0.84) → media');

// === buildReport end-to-end ===
const report = buildReport(ICAR16_ITEMS, allCorrect);
eq(report.score.iq, 165, 'buildReport tutte corrette → QI 165');
eq(report.score.classification.code, 'very_superior', 'classificazione=Molto superiore');
ok(report.profile.LN.symbol === '▲', 'profilo include simbolo ▲');

console.log('\n' + (failed === 0 ? '✓ Tutti i test passati' : `✗ ${failed} test falliti`));
process.exit(failed === 0 ? 0 : 1);
