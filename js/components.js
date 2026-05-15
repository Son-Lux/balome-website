/**
 * components.js — Balomè
 * Inietta header e footer condivisi in ogni pagina del sito.
 *
 * Come funziona:
 *  • Ogni pagina ha <div id="site-header"></div> e <div id="site-footer"></div>
 *  • Questo script calcola automaticamente il percorso relativo verso /includes/
 *    in base a dove si trova la pagina (root, articoli/, ecc.)
 *  • Sostituisce {{ROOT}} con il percorso relativo corretto
 *  • Dopo l'inject inizializza hamburger, sticky header e anno nel footer
 */
(function () {

  // Calcola la profondità della pagina rispetto alla root
  // root/index.html  → ROOT = ''
  // articoli/foo.html → ROOT = '../'
  const pathParts = window.location.pathname.split('/').filter(Boolean);
  // Rimuove il nome file dall'ultimo segmento
  const depth = pathParts.length > 0 ? pathParts.length - 1 : 0;
  const ROOT = depth > 0 ? '../'.repeat(depth) : '';
  const INCLUDES = ROOT + 'includes/';

  function loadFragment(url, targetId, callback) {
    fetch(url)
      .then(function (r) {
        if (!r.ok) throw new Error('Fragment not found: ' + url);
        return r.text();
      })
      .then(function (html) {
        // Sostituisce tutti i segnaposto {{ROOT}}
        html = html.replace(/\{\{ROOT\}\}/g, ROOT);
        var el = document.getElementById(targetId);
        if (el) el.innerHTML = html;
        if (callback) callback();
      })
      .catch(function (err) {
        console.warn('components.js:', err.message);
      });
  }

  function initAfterHeader() {
    // Anno corrente nel footer
    document.querySelectorAll('.js-year').forEach(function (el) {
      el.textContent = new Date().getFullYear();
    });

    // Sticky header
    var header = document.getElementById('header');
    if (header) {
      window.addEventListener('scroll', function () {
        header.classList.toggle('scrolled', window.scrollY > 40);
      });
    }

    // Hamburger menu mobile
    var hamburger = document.getElementById('hamburger');
    var nav = document.getElementById('nav');
    if (hamburger && nav) {
      hamburger.addEventListener('click', function () {
        hamburger.classList.toggle('active');
        nav.classList.toggle('open');
      });
      nav.querySelectorAll('a').forEach(function (a) {
        a.addEventListener('click', function () {
          hamburger.classList.remove('active');
          nav.classList.remove('open');
        });
      });
    }

    // Evidenzia "News" nella nav quando si è su una pagina articolo
    if (window.location.pathname.includes('/articoli/')) {
      document.querySelectorAll('.nav-link').forEach(function (link) {
        if ((link.getAttribute('href') || '').includes('#news')) {
          link.style.color = 'var(--orange)';
        }
      });
    }
  }

  // Carica prima header (poi lo inizializza), poi footer
  loadFragment(INCLUDES + 'header.html', 'site-header', function () {
    initAfterHeader();
    loadFragment(INCLUDES + 'footer.html', 'site-footer');
  });

})();
