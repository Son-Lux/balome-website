<?php
/**
 * blog.php — Balomè
 * Pagina blog con tutti gli articoli, filtri per categoria e archivio per data.
 * Legge articoli/articoli.json rigenerato automaticamente da genera-json.php.
 */

// Rigenera il JSON e carica gli articoli
$articoli = [];
require_once __DIR__ . '/genera-json.php';

// Formattazione data in italiano
function dataItaliana(string $iso): string {
  $mesi = ['','Gennaio','Febbraio','Marzo','Aprile','Maggio','Giugno',
           'Luglio','Agosto','Settembre','Ottobre','Novembre','Dicembre'];
  [$y, $m, $d] = explode('-', $iso);
  return (int)$d . ' ' . $mesi[(int)$m] . ' ' . $y;
}
function meseAnno(string $iso): string {
  $mesi = ['','Gennaio','Febbraio','Marzo','Aprile','Maggio','Giugno',
           'Luglio','Agosto','Settembre','Ottobre','Novembre','Dicembre'];
  [$y, $m] = explode('-', $iso);
  return $mesi[(int)$m] . ' ' . $y;
}

// Filtro attivo da querystring
$filtCat  = $_GET['categoria'] ?? '';
$filtAnno = $_GET['anno'] ?? '';
$filtMese = $_GET['mese'] ?? '';
$search   = trim($_GET['q'] ?? '');

// Costruisci elenco categorie e archivio mesi
$categorie = [];
$archivio  = []; // ['2024-12' => ['label'=>'Dicembre 2024', 'count'=>3]]

foreach ($articoli as $a) {
  $cat = $a['categoria'] ?? 'Notizie';
  $categorie[$cat] = ($categorie[$cat] ?? 0) + 1;

  $ym = substr($a['data'], 0, 7); // YYYY-MM
  if (!isset($archivio[$ym])) {
    $archivio[$ym] = ['label' => meseAnno($a['data'] . '-01'), 'count' => 0];
  }
  $archivio[$ym]['count']++;
}
arsort($categorie);

// Applica filtri
$articoliFiltrati = array_filter($articoli, function($a) use ($filtCat, $filtAnno, $filtMese, $search) {
  if ($filtCat && ($a['categoria'] ?? '') !== $filtCat) return false;
  if ($filtAnno && substr($a['data'], 0, 4) !== $filtAnno) return false;
  if ($filtMese && substr($a['data'], 5, 2) !== $filtMese) return false;
  if ($search) {
    $hay = strtolower($a['titolo'] . ' ' . $a['estratto']);
    if (strpos($hay, strtolower($search)) === false) return false;
  }
  return true;
});
$articoliFiltrati = array_values($articoliFiltrati);

// Label filtro attivo
$filtroLabel = '';
if ($filtCat)  $filtroLabel = $filtCat;
if ($filtAnno && !$filtMese) $filtroLabel = $filtAnno;
if ($filtMese && $filtAnno)  $filtroLabel = $archivio["$filtAnno-$filtMese"]['label'] ?? '';

// URL builder per sidebar links
function buildUrl(array $params): string {
  $base = array_filter($params, fn($v) => $v !== '');
  return 'blog.php' . ($base ? '?' . http_build_query($base) : '');
}
?>
<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="Tutti gli articoli e le storie dell'associazione Balomè.">
  <title>Blog – Balomè</title>
  <link rel="icon" type="image/x-icon" href="favicon.ico">
  <link rel="apple-touch-icon" href="apple-touch-icon.png">
  <link href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,300;0,400;0,500;0,600;0,700;0,900;1,700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="css/style.css">
  <style>
    /* ── HERO ── */
    .blog-hero {
      background: linear-gradient(135deg, #1a1a2e 0%, #2d1b69 100%);
      padding: 120px clamp(1rem,5vw,3rem) 60px;
      text-align: center;
      color: #fff;
      position: relative;
      overflow: hidden;
    }
    .blog-hero::before {
      content:'';
      position:absolute;inset:0;
      background-image:radial-gradient(circle,rgba(245,146,30,.08) 1px,transparent 1px);
      background-size:28px 28px;
      pointer-events:none;
    }
    .blog-hero .tag {
      display:inline-block;
      background:var(--orange,#F5921E);color:#fff;
      font-size:.75rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;
      padding:.3em 1em;border-radius:100px;margin-bottom:1.25rem;
      position:relative;z-index:1;
    }
    .blog-hero h1 {
      font-size:clamp(2rem,5vw,3.5rem);font-weight:900;
      margin:0 0 1rem;line-height:1.15;position:relative;z-index:1;
    }
    .blog-hero p { font-size:1.05rem;opacity:.75;max-width:560px;margin:0 auto;position:relative;z-index:1; }

    /* ── SEARCH BAR ── */
    .blog-search-wrap {
      background:#fff;
      border-bottom:1px solid #eee;
      padding:16px clamp(1rem,5vw,3rem);
      position:sticky;top:72px;z-index:100;
      box-shadow:0 2px 12px rgba(0,0,0,.05);
    }
    .blog-search-form {
      max-width:600px;margin:0 auto;
      display:flex;gap:8px;
    }
    .blog-search-form input {
      flex:1;padding:10px 18px;
      border:2px solid #e0e8f0;border-radius:50px;
      font-family:inherit;font-size:.95rem;outline:none;
      transition:border-color .2s;
    }
    .blog-search-form input:focus { border-color:var(--orange,#F5921E); }
    .blog-search-form button {
      background:var(--orange,#F5921E);color:#fff;border:none;
      padding:10px 22px;border-radius:50px;
      font-family:inherit;font-weight:700;font-size:.9rem;cursor:pointer;
      transition:background .2s;
    }
    .blog-search-form button:hover { background:#d97f10; }
    .blog-search-form a.reset {
      display:flex;align-items:center;padding:10px 16px;
      color:#888;font-size:.85rem;text-decoration:none;border-radius:50px;
      border:2px solid #e0e8f0;transition:all .2s;white-space:nowrap;
    }
    .blog-search-form a.reset:hover { border-color:var(--orange,#F5921E);color:var(--orange,#F5921E); }

    /* ── LAYOUT ── */
    .blog-wrap {
      max-width:1200px;
      margin:0 auto;
      padding:clamp(2rem,5vw,4rem) clamp(1rem,5vw,2rem);
      display:grid;
      grid-template-columns:1fr 300px;
      gap:3rem;
      align-items:start;
    }
    @media(max-width:900px){
      .blog-wrap { grid-template-columns:1fr; }
      .blog-sidebar { order:-1; }
    }

    /* ── FILTRO ATTIVO ── */
    .filtro-attivo {
      display:inline-flex;align-items:center;gap:8px;
      background:#fff8ec;border:1.5px solid #fdd;
      border-color:rgba(245,146,30,.3);
      color:var(--orange,#F5921E);
      font-size:.85rem;font-weight:600;
      padding:8px 16px;border-radius:50px;
      margin-bottom:1.5rem;
    }
    .filtro-attivo a { color:inherit;margin-left:4px;text-decoration:none;font-size:1rem; }
    .filtro-attivo a:hover { color:#c0392b; }

    .results-count {
      font-size:.85rem;color:#888;margin-bottom:1.5rem;
    }

    /* ── CARD LIST ── */
    .blog-list { display:flex;flex-direction:column;gap:1.75rem; }

    .blog-card {
      background:#fff;border-radius:20px;overflow:hidden;
      box-shadow:0 4px 24px rgba(0,0,0,.07);
      display:grid;grid-template-columns:220px 1fr;
      transition:transform .25s,box-shadow .25s;
      text-decoration:none;color:inherit;
    }
    .blog-card:hover { transform:translateY(-4px);box-shadow:0 16px 48px rgba(0,0,0,.13); }
    @media(max-width:600px){ .blog-card { grid-template-columns:1fr; } }

    .blog-card-img {
      width:100%;height:100%;min-height:160px;
      object-fit:cover;display:block;background:#f3f4f6;
    }
    .blog-card-img-ph {
      width:100%;min-height:160px;
      background:linear-gradient(135deg,#fff8ec,#fef3c7);
      display:flex;align-items:center;justify-content:center;
      font-size:2.5rem;
    }
    .blog-card-body {
      padding:1.5rem;display:flex;flex-direction:column;justify-content:space-between;
    }
    .blog-card-meta { display:flex;align-items:center;gap:.6rem;flex-wrap:wrap;margin-bottom:.6rem; }
    .blog-card-data { font-size:.78rem;color:#999;font-weight:500; }
    .blog-card-tag {
      font-size:.7rem;font-weight:700;letter-spacing:.06em;text-transform:uppercase;
      color:var(--orange,#F5921E);background:#fff8ec;
      padding:.2em .7em;border-radius:100px;
      text-decoration:none;transition:background .15s;
    }
    .blog-card-tag:hover { background:#fde68a; }
    .blog-card-body h3 {
      font-size:1.1rem;font-weight:700;line-height:1.35;
      margin:0 0 .6rem;color:#1a1a2e;
    }
    .blog-card-body p { font-size:.9rem;line-height:1.65;color:#666;flex:1;margin:0 0 1rem; }
    .blog-card-link {
      font-size:.88rem;font-weight:600;color:var(--orange,#F5921E);
      display:inline-flex;align-items:center;gap:.35rem;transition:gap .2s;
    }
    .blog-card:hover .blog-card-link { gap:.6rem; }

    /* ── EMPTY ── */
    .blog-empty {
      text-align:center;padding:4rem 2rem;color:#aaa;
      background:#fff;border-radius:20px;
      box-shadow:0 4px 24px rgba(0,0,0,.05);
    }
    .blog-empty .emoji { font-size:3rem;display:block;margin-bottom:1rem; }

    /* ── SIDEBAR ── */
    .blog-sidebar { position:sticky;top:140px; }

    .sidebar-widget {
      background:#fff;border-radius:18px;
      box-shadow:0 4px 24px rgba(0,0,0,.07);
      padding:1.5rem;margin-bottom:1.5rem;overflow:hidden;
    }
    .sidebar-widget h4 {
      font-size:.8rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;
      color:var(--orange,#F5921E);margin:0 0 1rem;
      padding-bottom:.75rem;border-bottom:2px solid #fff8ec;
    }

    /* Categorie */
    .cat-list { list-style:none;padding:0;margin:0; }
    .cat-list li { margin-bottom:.35rem; }
    .cat-list a {
      display:flex;justify-content:space-between;align-items:center;
      padding:.45rem .75rem;border-radius:10px;
      font-size:.9rem;color:#444;text-decoration:none;
      transition:background .15s,color .15s;
    }
    .cat-list a:hover,
    .cat-list a.active {
      background:var(--orange,#F5921E);color:#fff;
    }
    .cat-list a.active { font-weight:700; }
    .cat-count {
      font-size:.75rem;font-weight:700;
      background:#f3f4f6;color:#888;
      padding:2px 8px;border-radius:50px;
      transition:background .15s,color .15s;
    }
    .cat-list a:hover .cat-count,
    .cat-list a.active .cat-count {
      background:rgba(255,255,255,.25);color:#fff;
    }

    /* Archivio */
    .archivio-list { list-style:none;padding:0;margin:0; }
    .archivio-anno { font-size:.75rem;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#bbb;margin:1rem 0 .4rem; }
    .archivio-anno:first-child { margin-top:0; }
    .archivio-list a {
      display:flex;justify-content:space-between;align-items:center;
      padding:.4rem .75rem;border-radius:10px;
      font-size:.88rem;color:#444;text-decoration:none;
      transition:background .15s,color .15s;
    }
    .archivio-list a:hover,
    .archivio-list a.active {
      background:var(--orange,#F5921E);color:#fff;
    }
    .archivio-count {
      font-size:.72rem;font-weight:700;
      background:#f3f4f6;color:#888;
      padding:2px 7px;border-radius:50px;
      transition:background .15s,color .15s;
    }
    .archivio-list a:hover .archivio-count,
    .archivio-list a.active .archivio-count { background:rgba(255,255,255,.25);color:#fff; }

    /* CTA sidebar */
    .sidebar-cta {
      background:linear-gradient(135deg,var(--dark,#148708),#0a5e04);
      border-radius:18px;padding:1.5rem;text-align:center;color:#fff;
    }
    .sidebar-cta h4 { color:rgba(255,255,255,.7);border-bottom-color:rgba(255,255,255,.15); }
    .sidebar-cta p { font-size:.88rem;line-height:1.55;margin:0 0 1rem;opacity:.85; }
    .sidebar-cta a {
      display:inline-block;background:#fff;color:var(--dark,#148708);
      font-weight:700;font-size:.9rem;padding:.65rem 1.5rem;
      border-radius:50px;text-decoration:none;transition:transform .2s,box-shadow .2s;
    }
    .sidebar-cta a:hover { transform:translateY(-2px);box-shadow:0 6px 20px rgba(0,0,0,.2); }
  </style>
</head>
<body>

  <!-- TOPBAR -->
  <div class="topbar">
    <div class="topbar-inner">
      <a href="mailto:info@balome.org">info@balome.org</a>
      <a href="tel:+393930181276">393 018 1276</a>
      <a href="https://www.facebook.com/info.balome/" target="_blank" aria-label="Facebook">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
      </a>
    </div>
  </div>

  <!-- HEADER -->
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
        <a href="blog.php" class="nav-link" style="color:var(--orange,#F5921E)">Blog</a>
        <a href="index.html#contatti" class="nav-link">Contatti</a>
        <a href="index.html#donazioni" class="btn-nav">Dona ora ♥</a>
      </nav>
      <button class="hamburger" id="hamburger" aria-label="Menu">
        <span></span><span></span><span></span>
      </button>
    </div>
  </header>

  <!-- HERO -->
  <div class="blog-hero">
    <span class="tag">📖 Blog</span>
    <h1>Le nostre storie</h1>
    <p>Reportage, aggiornamenti e racconti dai progetti che sosteniamo in Italia e in India.</p>
  </div>

  <!-- SEARCH -->
  <div class="blog-search-wrap">
    <form class="blog-search-form" method="get" action="blog.php">
      <?php if($filtCat):  ?><input type="hidden" name="categoria" value="<?= htmlspecialchars($filtCat) ?>"><?php endif; ?>
      <?php if($filtAnno): ?><input type="hidden" name="anno"      value="<?= htmlspecialchars($filtAnno) ?>"><?php endif; ?>
      <?php if($filtMese): ?><input type="hidden" name="mese"      value="<?= htmlspecialchars($filtMese) ?>"><?php endif; ?>
      <input type="text" name="q" placeholder="Cerca un articolo…"
             value="<?= htmlspecialchars($search) ?>">
      <button type="submit">🔍 Cerca</button>
      <?php if($search || $filtCat || $filtAnno): ?>
        <a href="blog.php" class="reset">✕ Reset</a>
      <?php endif; ?>
    </form>
  </div>

  <!-- MAIN -->
  <div class="blog-wrap">

    <!-- ── ARTICOLI ── -->
    <main>
      <?php if ($filtroLabel || $search): ?>
        <div class="filtro-attivo">
          <?= $search ? "🔍 \"".htmlspecialchars($search)."\"" : "🏷 ".htmlspecialchars($filtroLabel) ?>
          <a href="blog.php" title="Rimuovi filtro">✕</a>
        </div>
      <?php endif; ?>

      <p class="results-count">
        <?= count($articoliFiltrati) ?> articol<?= count($articoliFiltrati) === 1 ? 'o' : 'i' ?>
        <?= (count($articoliFiltrati) < count($articoli)) ? ' (su ' . count($articoli) . ' totali)' : '' ?>
      </p>

      <?php if (empty($articoliFiltrati)): ?>
        <div class="blog-empty">
          <span class="emoji">📭</span>
          <p><?= $search ? 'Nessun articolo trovato per <strong>'.htmlspecialchars($search).'</strong>.' : 'Nessun articolo in questa categoria.' ?></p>
          <a href="blog.php" style="display:inline-block;margin-top:1rem;color:var(--orange,#F5921E);font-weight:600">← Vedi tutti</a>
        </div>

      <?php else: ?>
        <div class="blog-list">
          <?php foreach ($articoliFiltrati as $a):
            $target  = !empty($a['esterno']) ? ' target="_blank" rel="noopener"' : '';
            $dataStr = dataItaliana($a['data']);
            $catUrl  = buildUrl(['categoria' => $a['categoria'] ?? '']);
            [$anno, $mese] = explode('-', $a['data']);
          ?>
            <a class="blog-card" href="<?= htmlspecialchars($a['link']) ?>"<?= $target ?>>

              <?php if (!empty($a['immagine'])): ?>
                <img class="blog-card-img"
                     src="<?= htmlspecialchars($a['immagine']) ?>"
                     alt="<?= htmlspecialchars($a['titolo']) ?>"
                     loading="lazy"
                     onerror="this.outerHTML='<div class=\'blog-card-img-ph\'>📰</div>'">
              <?php else: ?>
                <div class="blog-card-img-ph">📰</div>
              <?php endif; ?>

              <div class="blog-card-body">
                <div>
                  <div class="blog-card-meta">
                    <span class="blog-card-data">🗓 <?= $dataStr ?></span>
                    <?php if (!empty($a['categoria'])): ?>
                      <span class="blog-card-tag"><?= htmlspecialchars($a['categoria']) ?></span>
                    <?php endif; ?>
                  </div>
                  <h3><?= htmlspecialchars($a['titolo']) ?></h3>
                  <p><?= htmlspecialchars($a['estratto']) ?></p>
                </div>
                <span class="blog-card-link">Leggi l'articolo →</span>
              </div>
            </a>
          <?php endforeach; ?>
        </div>
      <?php endif; ?>
    </main>

    <!-- ── SIDEBAR ── -->
    <aside class="blog-sidebar">

      <!-- Categorie -->
      <div class="sidebar-widget">
        <h4>📂 Categorie</h4>
        <ul class="cat-list">
          <li>
            <a href="blog.php<?= $search ? '?q='.urlencode($search) : '' ?>"
               class="<?= !$filtCat ? 'active' : '' ?>">
              Tutte <span class="cat-count"><?= count($articoli) ?></span>
            </a>
          </li>
          <?php foreach ($categorie as $cat => $count):
            $url = buildUrl(['categoria' => $cat, 'q' => $search]);
          ?>
            <li>
              <a href="<?= $url ?>" class="<?= $filtCat === $cat ? 'active' : '' ?>">
                <?= htmlspecialchars($cat) ?>
                <span class="cat-count"><?= $count ?></span>
              </a>
            </li>
          <?php endforeach; ?>
        </ul>
      </div>

      <!-- Archivio per anno/mese -->
      <?php if (!empty($archivio)): ?>
      <div class="sidebar-widget">
        <h4>🗓 Archivio</h4>
        <?php
          $anni = [];
          foreach ($archivio as $ym => $info) {
            [$y, $m] = explode('-', $ym);
            $anni[$y][$m] = $info;
          }
          krsort($anni);
        ?>
        <ul class="archivio-list">
          <?php foreach ($anni as $anno => $mesi): ?>
            <li class="archivio-anno"><?= $anno ?></li>
            <?php
              krsort($mesi);
              foreach ($mesi as $m => $info):
                $url = buildUrl(['anno' => $anno, 'mese' => $m, 'q' => $search]);
                $isActive = ($filtAnno === $anno && $filtMese === $m);
            ?>
              <li>
                <a href="<?= $url ?>" class="<?= $isActive ? 'active' : '' ?>">
                  <?= htmlspecialchars($info['label']) ?>
                  <span class="archivio-count"><?= $info['count'] ?></span>
                </a>
              </li>
            <?php endforeach; ?>
          <?php endforeach; ?>
        </ul>
      </div>
      <?php endif; ?>

      <!-- CTA donazione -->
      <div class="sidebar-widget sidebar-cta">
        <h4>💛 Sostieni Balomè</h4>
        <p>Ogni donazione fa la differenza nella vita dei bambini che seguiamo.</p>
        <a href="index.html#donazioni">Dona ora ♥</a>
      </div>

    </aside>
  </div><!-- /blog-wrap -->

  <button class="scroll-top" id="scrollTop" onclick="scrollToTop()" aria-label="Torna su">↑</button>

  <!-- FOOTER -->
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
        <a href="blog.php">Blog</a>
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
