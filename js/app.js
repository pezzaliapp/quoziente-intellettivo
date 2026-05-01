/* eslint-disable */
/**
 * Logica UI del Test Cognitivo ICAR-16.
 * Stato persistito in localStorage per resistere a refresh/chiusura tab.
 */

(function () {
  const STATE_KEY = 'qi_state_v1';
  const TIME_LIMIT_SEC = 15 * 60;
  const items = window.ICAR16_ITEMS_DATA || (typeof ICAR16_ITEMS !== 'undefined' ? ICAR16_ITEMS : []);

  // ── Stato ────────────────────────────────────────────────────────────────
  function defaultState() {
    return {
      phase: 'intro',          // intro | test | result
      order: shuffleWithinSubscale(items.map((it, i) => i)),
      currentIdx: 0,
      answers: {},             // { itemId: optionNumber 1-based }
      startedAt: null,
      finishedAt: null
    };
  }
  let state = loadState() || defaultState();

  function loadState() {
    try {
      const raw = localStorage.getItem(STATE_KEY);
      if (!raw) return null;
      const s = JSON.parse(raw);
      if (s && typeof s === 'object' && Array.isArray(s.order)) return s;
    } catch (_) {}
    return null;
  }
  function saveState() {
    try { localStorage.setItem(STATE_KEY, JSON.stringify(state)); } catch (_) {}
  }
  function clearState() {
    try { localStorage.removeItem(STATE_KEY); } catch (_) {}
  }

  function shuffleWithinSubscale(indices) {
    // Randomizza ordine all'interno di ogni sottoscala, mantiene blocchi VR/LN/MR/R3D
    const grouped = { VR: [], LN: [], MR: [], R3D: [] };
    indices.forEach(i => grouped[items[i].subscale].push(i));
    Object.keys(grouped).forEach(sc => {
      const arr = grouped[sc];
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
    });
    return [...grouped.VR, ...grouped.LN, ...grouped.MR, ...grouped.R3D];
  }

  // ── Render helpers ──────────────────────────────────────────────────────
  const $ = sel => document.querySelector(sel);
  const $$ = sel => Array.from(document.querySelectorAll(sel));

  function show(screenId) {
    $$('.screen').forEach(el => el.classList.add('hidden'));
    $('#' + screenId).classList.remove('hidden');
  }

  function fmtTime(sec) {
    const m = Math.max(0, Math.floor(sec / 60)).toString().padStart(2, '0');
    const s = Math.max(0, sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }

  // ── Timer ────────────────────────────────────────────────────────────────
  let timerInterval = null;
  function startTimer() {
    stopTimer();
    if (!state.startedAt) state.startedAt = Date.now();
    saveState();
    tickTimer();
    timerInterval = setInterval(tickTimer, 1000);
  }
  function stopTimer() {
    if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
  }
  function tickTimer() {
    if (state.phase !== 'test') return;
    const elapsed = Math.floor((Date.now() - state.startedAt) / 1000);
    const remaining = TIME_LIMIT_SEC - elapsed;
    const t = $('#timer');
    if (t) {
      t.textContent = fmtTime(remaining);
      t.classList.remove('warning', 'critical');
      if (remaining <= 60) t.classList.add('critical');
      else if (remaining <= 180) t.classList.add('warning');
    }
    if (remaining <= 0) {
      stopTimer();
      finishTest();
    }
  }

  // ── Embed mode: postMessage al parent (auto-resize + lifecycle events) ───
  const isEmbed = !!window.QIEmbedMode && window.parent !== window;
  let lastEmbedHeight = 0;
  function postToParent(payload) {
    if (!isEmbed) return;
    try { window.parent.postMessage(payload, '*'); } catch (_) {}
  }
  function emitHeight() {
    if (!isEmbed) return;
    const h = Math.ceil(document.documentElement.scrollHeight);
    if (Math.abs(h - lastEmbedHeight) >= 2) {
      lastEmbedHeight = h;
      postToParent({ type: 'qi:height', value: h });
    }
  }
  if (isEmbed) {
    document.addEventListener('DOMContentLoaded', () => {
      if ('ResizeObserver' in window) {
        new ResizeObserver(() => emitHeight()).observe(document.documentElement);
      }
      emitHeight();
      // safety: alcuni font/immagini ritardano il layout finale
      setTimeout(emitHeight, 200);
      setTimeout(emitHeight, 800);
    }, { once: true });
  }

  // ── Render: intro ────────────────────────────────────────────────────────
  function renderIntro() {
    state.phase = 'intro';
    saveState();
    show('intro');
    $('#start-btn').onclick = () => {
      state = defaultState();
      state.phase = 'test';
      state.startedAt = Date.now();
      saveState();
      postToParent({ type: 'qi:start' });
      renderItem();
      startTimer();
      emitHeight();
    };
  }

  // ── Render: item ─────────────────────────────────────────────────────────
  function renderItem() {
    show('test');
    const idx = state.currentIdx;
    const itemIdx = state.order[idx];
    const item = items[itemIdx];
    if (!item) { finishTest(); return; }

    $('#progress-text').textContent = `Item ${idx + 1} / ${items.length}`;
    $('#progress-fill').style.width = ((idx + 1) / items.length * 100) + '%';
    $('#item-subscale').textContent = subscaleLabel(item.subscale);
    $('#item-stem').textContent = item.stem;

    const imageWrap = $('#item-image-wrap');
    if (item.type === 'image') {
      const src = window.QIInlineImages ? window.QIInlineImages[item.id] : item.image;
      imageWrap.innerHTML = `<img src="${src}" alt="Stimolo ICAR ${item.id}">`;
      imageWrap.classList.remove('hidden');
    } else {
      imageWrap.innerHTML = '';
      imageWrap.classList.add('hidden');
    }

    const optsBox = $('#options');
    optsBox.innerHTML = '';
    const labels = ['A','B','C','D','E','F','G','H'];
    item.options.forEach((opt, i) => {
      const n = i + 1;
      const id = `opt-${item.id}-${n}`;
      const checked = state.answers[item.id] === n ? 'checked' : '';
      const sel = state.answers[item.id] === n ? 'selected' : '';
      const html = `
        <label class="option ${sel}" for="${id}">
          <input type="radio" id="${id}" name="opt" value="${n}" ${checked}>
          <span class="option-marker">${labels[i]}</span>
          <span class="option-text">${escape(opt)}</span>
        </label>`;
      optsBox.insertAdjacentHTML('beforeend', html);
    });
    optsBox.onchange = (ev) => {
      if (ev.target && ev.target.name === 'opt') {
        state.answers[item.id] = parseInt(ev.target.value, 10);
        saveState();
        $$('.option').forEach(el => el.classList.toggle(
          'selected',
          el.querySelector('input').checked
        ));
        $('#next-btn').disabled = false;
      }
    };

    $('#prev-btn').disabled = idx === 0;
    $('#prev-btn').onclick = () => { state.currentIdx = Math.max(0, idx - 1); saveState(); renderItem(); };
    const isLast = idx === items.length - 1;
    $('#next-btn').textContent = isLast ? 'Termina e calcola' : 'Avanti →';
    $('#next-btn').disabled = !state.answers[item.id];
    $('#next-btn').onclick = () => {
      if (isLast) { finishTest(); }
      else { state.currentIdx = idx + 1; saveState(); renderItem(); }
    };
  }

  function subscaleLabel(sc) {
    return ({ VR: 'Verbale', LN: 'Serie', MR: 'Matrici', R3D: 'Rotazione 3D' })[sc] || sc;
  }
  function escape(s) {
    return String(s).replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
  }

  // ── Finish + Result ──────────────────────────────────────────────────────
  function finishTest() {
    stopTimer();
    state.phase = 'result';
    state.finishedAt = Date.now();
    saveState();
    renderResult();
    if (isEmbed) {
      try {
        const report = window.QIScoring.buildReport(items, state.answers);
        postToParent({
          type: 'qi:complete',
          iq: report.score.iq,
          classification: report.score.classification.label,
          percentile: report.score.percentile,
          ci95: report.score.ci95,
          confidence: report.score.confidence
        });
      } catch (_) {}
      emitHeight();
    }
  }

  function renderResult() {
    const report = window.QIScoring.buildReport(items, state.answers);
    show('result');

    const s = report.score;
    $('#qi-number').textContent = s.iq;
    $('#qi-ci').textContent = `Intervallo di confidenza 95%: ${s.ci95.lo} – ${s.ci95.hi}`;
    $('#qi-class').textContent = s.classification.label;
    $('#qi-percentile').textContent = `Hai risposto correttamente a ${s.raw} su ${items.length} item (percentile ${s.percentile}%).`;

    const warn = $('#warning-banner');
    if (s.warning) {
      warn.classList.remove('hidden');
      warn.querySelector('.warning-text').textContent = s.warning;
    } else {
      warn.classList.add('hidden');
    }

    const profileBox = $('#profile-bars');
    profileBox.innerHTML = '';
    const subscaleNames = window.QIScoring.SUBSCALE_LABEL;
    ['VR', 'LN', 'MR', 'R3D'].forEach(sc => {
      const r = report.profile[sc];
      const fill = Math.max(2, Math.min(100, r.barFill));
      profileBox.insertAdjacentHTML('beforeend', `
        <div class="profile-row">
          <div>
            <div class="pname">${escape(subscaleNames[sc])}</div>
            <div class="pdesc">${r.raw} / 4 corrette · media popolazione ${r.mean}</div>
            <div class="profile-bar">
              <div class="profile-bar-fill" style="width:${fill}%"></div>
              <div class="profile-bar-mean" style="left:${r.meanBarFill}%"
                   title="Media popolazione"></div>
            </div>
          </div>
          <div class="profile-symbol ${r.code}" title="${escape(r.label)}">${r.symbol}</div>
        </div>
      `);
    });

    $('#restart-btn').onclick = () => {
      if (confirm('Vuoi davvero ricominciare il test? Le risposte attuali andranno perse.')) {
        clearState();
        state = defaultState();
        renderIntro();
      }
    };

    setupEmail(report);
  }

  // ── Email ────────────────────────────────────────────────────────────────
  function setupEmail(report) {
    const form  = $('#email-form');
    const input = $('#email-input');
    const btn   = $('#email-btn');
    const status = $('#email-status');
    form.onsubmit = async (ev) => {
      ev.preventDefault();
      const email = input.value.trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        status.textContent = 'Inserisci un indirizzo email valido.';
        status.className = 'email-status error';
        return;
      }
      btn.disabled = true; btn.textContent = 'Invio in corso…';
      status.textContent = ''; status.className = 'email-status';
      const res = await window.QIEmail.sendReportEmail(report, email);
      if (res.ok) {
        status.textContent = '✓ Email inviata. Controlla la posta (anche lo spam).';
        status.className = 'email-status success';
        btn.textContent = 'Inviata';
        postToParent({ type: 'qi:emailSent' });
      } else {
        status.textContent = '✗ ' + (res.error || 'Errore nell\'invio.');
        status.className = 'email-status error';
        btn.disabled = false; btn.textContent = 'Riprova';
      }
    };
  }

  // ── Bootstrap ────────────────────────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', () => {
    if (state.phase === 'test' && state.startedAt) {
      const elapsed = (Date.now() - state.startedAt) / 1000;
      if (elapsed >= TIME_LIMIT_SEC) {
        finishTest();
      } else {
        renderItem();
        startTimer();
      }
    } else if (state.phase === 'result') {
      renderResult();
    } else {
      renderIntro();
    }
  });
})();
