<?php
/**
 * notizie.php — Balomè
 * Ad ogni visita rigenera articoli.json e mostra le card degli articoli.
 * Nessun intervento manuale necessario dopo aver caricato un HTML.
 */

// Rigenera il JSON automaticamente
$articoli = [];
require_once __DIR__ . '/genera-json.php';
// $articoli è già ordinato per data decrescente

// Formattazione data in italiano
function dataItaliana(string $iso): string {
  $mesi = ['','Gennaio','Febbraio','Marzo','Aprile','Maggio','Giugno',
           'Luglio','Agosto','Settembre','Ottobre','Novembre','Dicembre'];
  [$y, $m, $d] = explode('-', $iso);
  return (int)$d . ' ' . $mesi[(int)$m] . ' ' . $y;
}
?>
<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="Tutte le notizie e gli aggiornamenti dell'associazione Balomè.">
  <title>Notizie – Balomè</title>
  <link rel="icon" type="image/x-icon" href="favicon.ico">
  <link rel="apple-touch-icon" href="apple-touch-icon.png">
  <link href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,300;0,400;0,500;0,600;0,700;0,900;1,700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="css/style.css">
  <style>
    .notizie-hero {
      background: linear-gradient(135deg, #1a1a2e 0%, #2d1b69 100%);
      padding: 120px clamp(1rem,5vw,3rem) 60px;
      text-align: center;
      color: #fff;
    }
    .notizie-hero .tag {
      display: inline-block;
      background: var(--orange, #f59e0b);
      color: #fff;
      font-size: .75rem;
      font-weight: 700;
      letter-spacing: .1em;
      text-transform: uppercase;
      padding: .3em 1em;
      border-radius: 100px;
      margin-bottom: 1.25rem;
    }
    .notizie-hero h1 {
      font-size: clamp(2rem, 5vw, 3.5rem);
      font-weight: 800;
      margin: 0 0 1rem;
      line-height: 1.15;
    }
    .notizie-hero p { font-size: 1.1rem; opacity: .8; max-width: 560px; margin: 0 auto; }

    .notizie-main {
      max-width: 1200px;
      margin: 0 auto;
      padding: clamp(2.5rem,6vw,5rem) clamp(1rem,5vw,2rem);
    }
    .notizie-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 2rem;
    }
    .notizia-card {
      background: #fff;
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 4px 24px rgba(0,0,0,.07);
      display: flex;
      flex-direction: column;
      transition: transform .25s, box-shadow .25s;
      text-decoration: none;
      color: inherit;
    }
    .notizia-card:hover { transform: translateY(-6px); box-shadow: 0 16px 48px rgba(0,0,0,.13); }
    .notizia-card-img {
      width: 100%; aspect-ratio: 16/9; object-fit: cover;
      background: #f3f4f6; display: block;
    }
    .notizia-card-img-placeholder {
      width: 100%; aspect-ratio: 16/9;
      background: linear-gradient(135deg, #fff8ec, #fef3c7);
      display: flex; align-items: center; justify-content: center;
      font-size: 3rem;
    }
    .notizia-card-body { padding: 1.5rem; display: flex; flex-direction: column; flex: 1; }
    .notizia-card-meta { display: flex; align-items: center; gap: .75rem; margin-bottom: .75rem; flex-wrap: wrap; }
    .notizia-card-data { font-size: .8rem; color: #888; font-weight: 500; }
    .notizia-card-tag {
      font-size: .72rem; font-weight: 700; letter-spacing: .06em; text-transform: uppercase;
      color: var(--orange, #f59e0b); background: #fff8ec; padding: .2em .7em; border-radius: 100px;
    }
    .notizia-card h3 { font-size: 1.15rem; font-weight: 700; line-height: 1.35; margin: 0 0 .75rem; color: #1a1a2e; }
    .notizia-card p { font-size: .95rem; line-height: 1.65; color: #555; flex: 1; margin: 0 0 1.25rem; }
    .notizia-card-link {
      font-size: .9rem; font-weight: 600; color: var(--orange, #f59e0b);
      display: inline-flex; align-items: center; gap: .35rem; transition: gap .2s;
    }
    .notizia-card:hover .notizia-card-link { gap: .6rem; }

    .notizie-empty { text-align: center; padding: 4rem 2rem; color: #aaa; }
    .notizie-empty .emoji { font-size: 3rem; display: block; margin-bottom: 1rem; }

    .notizie-footer { text-align: center; margin-top: 3rem; }
    .notizie-footer a {
      display: inline-block; background: var(--orange,#f59e0b); color: #fff;
      padding: .8rem 2rem; border-radius: 100px; font-weight: 600; text-decoration: none;
      transition: transform .2s, box-shadow .2s;
    }
    .notizie-footer a:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(245,158,11,.35); }
  </style>
</head>
<body>

  <!-- ═══ TOPBAR ═══════════════════════════════════════════════ -->
  <div class="topbar">
    <div class="topbar-inner">
      <a href="mailto:info@balome.org">info@balome.org</a>
      <a href="tel:+393930181276">393 018 1276</a>
      <a href="https://www.facebook.com/info.balome/" target="_blank" aria-label="Facebook">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
      </a>
    </div>
  </div>

  <!-- ═══ HEADER ══════════════════════════════════════════════════ -->
  <header class="header" id="header">
    <div class="header-inner">
      <a href="index.html" class="logo">
        <img src="logo.png" alt="Balomè logo" width="38" height="38">
        <span>Balomè</span>
      </a>
      <nav class="nav" id="nav">
        <a href="index.html#chi-siamo" class="nav-link">Chi siamo</a>
        <a href="index.html#missione" class="nav-link">Missione</a>
        <a href="index.html#progetti" class="nav-link">Progetti</a>
        <a href="index.html#cinque-per-mille" class="nav-link">5 per mille</a>
        <a href="index.html#donazioni" class="nav-link">Donazioni</a>
        <a href="notizie.php" class="nav-link" style="color:var(--orange,#f59e0b)">News</a>
        <a href="index.html#contatti" class="nav-link">Contatti</a>
        <a href="index.html#donazioni" class="btn-nav">Dona ora ♥</a>
      </nav>
      <button class="hamburger" id="hamburger" aria-label="Menu">
        <span></span><span></span><span></span>
      </button>
    </div>
  </header>

  <div class="notizie-hero">
    <span class="tag">📰 Notizie</span>
    <h1>Le nostre storie</h1>
    <p>Aggiornamenti, reportage e storie dai progetti che sosteniamo in Italia e in India.</p>
  </div>

  <main class="notizie-main">
    <div class="notizie-grid">
      <?php if (empty($articoli)): ?>
        <div class="notizie-empty" style="grid-column:1/-1">
          <span class="emoji">📭</span>
          <p>Nessun articolo pubblicato ancora.<br>
          <small>Carica un file HTML nella cartella <code>/articoli/</code> per iniziare.</small></p>
        </div>
      <?php else: ?>
        <?php foreach ($articoli as $a): ?>
          <?php
            $target = $a['esterno'] ? ' target="_blank" rel="noopener"' : '';
            $dataStr = dataItaliana($a['data']);
          ?>
          <a class="notizia-card" href="<?= htmlspecialchars($a['link']) ?>"<?= $target ?>>
            <?php if (!empty($a['immagine'])): ?>
              <img class="notizia-card-img"
                   src="<?= htmlspecialchars($a['immagine']) ?>"
                   alt="<?= htmlspecialchars($a['titolo']) ?>"
                   onerror="this.outerHTML='<div class=\'notizia-card-img-placeholder\'>📰</div>'">
            <?php else: ?>
              <div class="notizia-card-img-placeholder">📰</div>
            <?php endif; ?>
            <div class="notizia-card-body">
              <div class="notizia-card-meta">
                <span class="notizia-card-data">🗓 <?= $dataStr ?></span>
                <?php if (!empty($a['categoria'])): ?>
                  <span class="notizia-card-tag"><?= htmlspecialchars($a['categoria']) ?></span>
                <?php endif; ?>
              </div>
              <h3><?= htmlspecialchars($a['titolo']) ?></h3>
              <p><?= htmlspecialchars($a['estratto']) ?></p>
              <span class="notizia-card-link"><?= htmlspecialchars($a['linkTesto'] ?? 'Leggi →') ?> →</span>
            </div>
          </a>
        <?php endforeach; ?>
      <?php endif; ?>
    </div>

    <div class="notizie-footer">
      <a href="index.html#donazioni">💛 Sostieni Balomè</a>
    </div>
  </main>

  <button class="scroll-top" id="scrollTop" onclick="scrollToTop()" aria-label="Torna su">↑</button>

  <footer class="footer">
    <div class="footer-inner">
      <div class="footer-brand">
        <img src="logo.png" alt="Balomè" width="42" height="42">
        <span>Balomè</span>
        <p>Tutti i bimbi sono bravi e i grandi lo devono sapere!</p>
        <a href="https://www.facebook.com/info.balome/" target="_blank" class="footer-fb" aria-label="Facebook">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
        </a>
      </div>
      <div class="footer-col">
        <h4>Navigazione</h4>
        <a href="index.html#chi-siamo">Chi siamo</a>
        <a href="index.html#missione">Missione</a>
        <a href="index.html#progetti">Progetti</a>
        <a href="index.html#cinque-per-mille">5 per mille</a>
        <a href="index.html#donazioni">Donazioni</a>
        <a href="notizie.php">Notizie</a>
        <a href="index.html#contatti">Contatti</a>
      </div>
      <div class="footer-col">
        <h4>Come aiutare</h4>
        <a href="index.html#cinque-per-mille">Dona il 5 × mille</a>
        <a href="index.html#donazioni">Dona con PayPal</a>
        <a href="index.html#donazioni">Bonifico bancario</a>
        <a href="mailto:info@balome.org?subject=Voglio diventare volontario">Diventa volontario</a>
      </div>
      <div class="footer-col">
        <h4>Contatti</h4>
        <a href="mailto:info@balome.org">info@balome.org</a>
        <a href="tel:+393930181276">+39 393 018 1276</a>
        <p>P.le Risorgimento n. 14<br>24128 Bergamo (BG)</p>
        <p>C.F. 95254690167</p>
      </div>
    </div>
    <div class="footer-bottom">
      © Associazione Balomè · C.F. 95254690167 · P.le Risorgimento n. 14, 24128 Bergamo · info@balome.org<br>
      Associazione di Volontariato senza scopo di lucro
    </div>
  </footer>

  <script src="js/main.js"></script>
</body>
</html>
