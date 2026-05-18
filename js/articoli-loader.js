/**
 * articoli-loader.js — Balomè
 * Legge articoli/articoli.json e inietta le ultime 3 card news
 * nel container #newsCardsContainer della home page.
 *
 * Funziona su qualsiasi server web (Apache + PHP, Node.js, ecc.)
 * Il JSON viene rigenerato automaticamente da genera-json.php ad ogni
 * visita di notizie.php, quindi le card sono sempre aggiornate.
 */

(function () {
  'use strict';

  const CONTAINER_ID  = 'newsCardsContainer';
  const JSON_URL = (function() {
    // Costruisce il percorso assoluto per evitare problemi con spazi nel nome cartella
    const base = window.location.href.replace(/\/[^\/]*$/, '/');
    return base + 'articoli/articoli.json';
  })();
  const MAX_CARDS     = 3;
  const ESTRATTO_MAX  = 160; // caratteri estratto nelle card

  /* Mesi italiani per formattazione data */
  const MESI = ['Gennaio','Febbraio','Marzo','Aprile','Maggio','Giugno',
                'Luglio','Agosto','Settembre','Ottobre','Novembre','Dicembre'];

  function dataItaliana(iso) {
    if (!iso) return '';
    try {
      const [y, m, d] = iso.split('-');
      return `${parseInt(d)} ${MESI[parseInt(m) - 1]} ${y}`;
    } catch(e) { return iso; }
  }

  function tronca(testo, max) {
    if (!testo || testo.length <= max) return testo;
    return testo.substring(0, max).trimEnd() + '…';
  }

  function buildCard(articolo) {
    const data     = dataItaliana(articolo.data);
    const estratto = tronca(articolo.estratto || '', ESTRATTO_MAX);
    const link     = articolo.link || '#';
    const titolo   = articolo.titolo || 'Articolo';
    const target   = articolo.esterno ? ' target="_blank" rel="noopener"' : '';

    return `
      <div class="news-card reveal">
        <div class="news-date">🗓 ${data}</div>
        <h4>${titolo}</h4>
        <p>${estratto}</p>
        <a href="${link}" class="read-more"${target}>Leggi di più →</a>
      </div>`;
  }

  function buildEmpty() {
    return `
      <div class="news-card" style="text-align:center;padding:2rem;color:var(--text-light)">
        <div style="font-size:2rem;margin-bottom:.75rem">📭</div>
        <h4 style="color:var(--dark);margin-bottom:.5rem">Nessun articolo ancora</h4>
        <p style="font-size:.9rem">Pubblica il primo articolo dall'editor per vederlo qui.</p>
      </div>`;
  }

  function buildError() {
    return `
      <div class="news-card" style="text-align:center;padding:2rem;color:var(--text-light)">
        <div style="font-size:2rem;margin-bottom:.75rem">⚠️</div>
        <p style="font-size:.88rem">Impossibile caricare le notizie.<br>
        <a href="notizie.php" style="color:var(--orange);font-weight:600">Vai alla pagina notizie →</a></p>
      </div>`;
  }

  function init() {
    const container = document.getElementById(CONTAINER_ID);
    if (!container) return; // non siamo sulla home, esci

    /* Skeleton loading */
    container.innerHTML = Array(MAX_CARDS).fill(`
      <div class="news-card" style="animation:pulse 1.4s ease infinite alternate">
        <div style="height:14px;background:var(--border);border-radius:4px;width:40%;margin-bottom:12px"></div>
        <div style="height:18px;background:var(--border);border-radius:4px;width:80%;margin-bottom:10px"></div>
        <div style="height:12px;background:var(--border);border-radius:4px;width:100%;margin-bottom:6px"></div>
        <div style="height:12px;background:var(--border);border-radius:4px;width:90%;margin-bottom:6px"></div>
        <div style="height:12px;background:var(--border);border-radius:4px;width:75%"></div>
      </div>`).join('');

    /* Cache-busting: aggiungi timestamp per evitare cache del browser */
    const url = JSON_URL + '?t=' + Math.floor(Date.now() / 60000); // refresh ogni minuto

    fetch(url)
      .then(res => {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.json();
      })
      .then(articoli => {
        console.log('[Balomè] Articoli caricati:', articoli.length);
        if (!Array.isArray(articoli) || articoli.length === 0) {
          container.innerHTML = buildEmpty();
          return;
        }

        /* Prendi i primi MAX_CARDS (già ordinati per data decrescente da genera-json.php) */
        const ultimi = articoli.slice(0, MAX_CARDS);
        container.innerHTML = ultimi.map(buildCard).join('');

        /* Aggiungi link "Tutte le notizie" se ci sono più di MAX_CARDS articoli */
        if (articoli.length > MAX_CARDS) {
          container.insertAdjacentHTML('beforeend', `
            <div style="text-align:center;margin-top:8px">
              <a href="notizie.php" class="read-more" style="font-size:.95rem;font-weight:700">
                Tutte le notizie (${articoli.length}) →
              </a>
            </div>`);
        }

        /* Ri-attiva le animazioni reveal per le nuove card */
        if (typeof IntersectionObserver !== 'undefined' && typeof revealObserver !== 'undefined') {
          container.querySelectorAll('.reveal').forEach(el => {
            el.classList.remove('visible');
            revealObserver.observe(el);
          });
        } else {
          // Fallback: rendi visibili le card direttamente
          container.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
        }
      })
      .catch(err => {
        console.error('[Balomè] Errore caricamento articoli:', err);
        container.innerHTML = buildError();
      });
  }

  /* Avvia dopo il DOM */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
