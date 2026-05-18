<?php
/**
 * genera-json.php — Balomè
 * Scansiona /articoli/, legge i metadati da ogni HTML
 * e rigenera articoli/articoli.json automaticamente.
 *
 * Chiamato automaticamente da notizie.php ad ogni visita.
 * Può anche essere chiamato manualmente: tuosito.it/genera-json.php
 */

// ── CONFIGURAZIONE ──────────────────────────────────────────────
define('ARTICOLI_DIR',  __DIR__ . '/articoli/');
define('JSON_OUTPUT',   __DIR__ . '/articoli/articoli.json');
define('FILE_ESCLUSI',  ['articolo-template.html']); // file da ignorare

// ── FUNZIONE: estrai metadati da un file HTML ───────────────────
function estraiMetadati(string $filepath, string $filename): ?array {

  $html = file_get_contents($filepath);
  if (!$html) return null;

  // Titolo: <title>TITOLO – Balomè</title>  oppure  <h1>TITOLO</h1>
  $titolo = '';
  if (preg_match('/<title[^>]*>([^<]+?)\s*[–—-]\s*Balom[eè]/i', $html, $m)) {
    $titolo = trim($m[1]);
  } elseif (preg_match('/<h1[^>]*>(.*?)<\/h1>/is', $html, $m)) {
    $titolo = trim(strip_tags($m[1]));
  }
  if (!$titolo || $titolo === 'TITOLO_ARTICOLO') return null; // template non compilato
  if ($estratto === 'DESCRIZIONE_ARTICOLO') return null;       // template non compilato

  // Data: <meta name="data-articolo" content="YYYY-MM-DD">
  $data = '';
  if (preg_match('/<meta\s+name=["\']data-articolo["\']\s+content=["\']([\d\-]+)["\']/i', $html, $m)) {
    $data = trim($m[1]);
  }
  // Fallback: cerca una data nel formato DD/MM/YYYY o YYYY-MM-DD nel testo
  if (!$data) {
    if (preg_match('/(\d{4}-\d{2}-\d{2})/', $html, $m)) $data = $m[1];
  }
  if (!$data) $data = date('Y-m-d', filemtime($filepath)); // usa data modifica file

  // Descrizione/estratto: <meta name="description" content="...">
  $estratto = '';
  if (preg_match('/<meta\s+name=["\']description["\']\s+content=["\'](.*?)["\']/i', $html, $m)) {
    $estratto = trim($m[1]);
  }
  if (!$estratto || $estratto === 'DESCRIZIONE_ARTICOLO') {
    // Fallback: primo <p class="articolo-sommario">
    if (preg_match('/<p[^>]*articolo-sommario[^>]*>(.*?)<\/p>/is', $html, $m)) {
      $estratto = trim(strip_tags($m[1]));
    }
  }

  // Immagine hero: <img class="..." src="../img/...">  nella sezione .articolo-hero
  $immagine = '';
  if (preg_match('/<div[^>]*articolo-hero[^>]*>.*?<img[^>]+src=["\'](.*?)["\']/is', $html, $m)) {
    // Normalizza percorso: ../img/foto.jpg → img/foto.jpg
    $immagine = preg_replace('#^\.\./+#', '', trim($m[1]));
  }

  // Categoria: <meta name="categoria" content="...">
  $categoria = '';
  if (preg_match('/<meta\s+name=["\']categoria["\']\s+content=["\'](.*?)["\']/i', $html, $m)) {
    $categoria = trim($m[1]);
  }
  if (!$categoria) $categoria = 'Notizie';

  return [
    'titolo'    => $titolo,
    'data'      => $data,
    'categoria' => $categoria,
    'estratto'  => $estratto ?: 'Leggi l\'articolo completo.',
    'immagine'  => $immagine,
    'link'      => 'articoli/' . $filename,
    'linkTesto' => 'Leggi l\'articolo',
    'esterno'   => false,
  ];
}

// ── SCANSIONA LA CARTELLA ───────────────────────────────────────
$articoli = [];
$files = glob(ARTICOLI_DIR . '*.html');

foreach ($files as $filepath) {
  $filename = basename($filepath);
  if (in_array($filename, FILE_ESCLUSI)) continue;

  $meta = estraiMetadati($filepath, $filename);
  if ($meta) $articoli[] = $meta;
}

// Ordina per data decrescente
usort($articoli, fn($a, $b) => strcmp($b['data'], $a['data']));

// ── SCRIVI IL JSON ──────────────────────────────────────────────
$json = json_encode($articoli, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
$ok   = file_put_contents(JSON_OUTPUT, $json);

// ── RISPOSTA ────────────────────────────────────────────────────
// Stampa JSON solo se chiamato direttamente via browser (non via require/include)
if (basename($_SERVER['SCRIPT_FILENAME'] ?? '') === basename(__FILE__)) {
  header('Content-Type: application/json; charset=utf-8');
  echo $ok !== false
    ? json_encode(['ok' => true, 'articoli' => count($articoli), 'file' => JSON_OUTPUT], JSON_PRETTY_PRINT)
    : json_encode(['ok' => false, 'errore' => 'Impossibile scrivere ' . JSON_OUTPUT]);
}

return $articoli; // usabile con include
