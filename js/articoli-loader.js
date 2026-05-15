/* ============================================================
   CARICAMENTO ARTICOLI DINAMICO — da aggiungere in main.js
   Gli articoli vengono letti da articoli/articoli.json,
   ordinati per data più recente e iniettati nella sezione news.
   ============================================================ */

function formatDataItaliana(isoString) {
  const mesi = [
    'Gennaio','Febbraio','Marzo','Aprile','Maggio','Giugno',
    'Luglio','Agosto','Settembre','Ottobre','Novembre','Dicembre'
  ];
  const d = new Date(isoString + 'T00:00:00');
  return mesi[d.getMonth()] + ' ' + d.getFullYear();
}

function buildNewsCard(articolo) {
  const dataLabel = formatDataItaliana(articolo.data);
  const target = articolo.esterno ? ' target="_blank" rel="noopener"' : '';
  return `
    <div class="news-card">
      <div class="news-date">🗓 ${dataLabel}</div>
      <h4>${articolo.titolo}</h4>
      <p>${articolo.estratto}</p>
      <a href="${articolo.link}"${target} class="read-more">${articolo.linkTesto}</a>
    </div>`;
}

async function loadArticoli() {
  const container = document.getElementById('newsCardsContainer');
  if (!container) return;

  try {
    const response = await fetch('articoli/articoli.json');
    if (!response.ok) throw new Error('fetch failed');
    const articoli = await response.json();

    // Ordina per data decrescente (più recente per primo)
    articoli.sort((a, b) => new Date(b.data) - new Date(a.data));

    // Svuota il contenitore e popola
    container.innerHTML = '';
    articoli.forEach(art => {
      container.insertAdjacentHTML('beforeend', buildNewsCard(art));
    });

    // Aggiungi sempre il box CTA social in fondo
    container.insertAdjacentHTML('beforeend', `
      <div class="cta-social">
        <h4>Seguici per le ultime news!</h4>
        <p>Ogni giorno condividiamo aggiornamenti, foto e storie dei bambini che aiutiamo.</p>
        <a href="https://www.facebook.com/info.balome/" target="_blank" class="btn-fb">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
          </svg>
          Segui Balomè su Facebook
        </a>
      </div>`);

  } catch (err) {
    // Fallback: lascia il contenuto statico (le card HTML originali restano visibili)
    console.warn('Articoli JSON non trovato, uso contenuto statico.', err);
  }
}

// Avvia al caricamento della pagina
document.addEventListener('DOMContentLoaded', loadArticoli);
