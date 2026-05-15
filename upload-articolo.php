<?php
/**
 * Balomè – Script di pubblicazione articoli
 * Posizionare nella root del sito web (stessa cartella di index.html)
 *
 * CONFIGURAZIONE: modifica le costanti qui sotto prima di caricare sul server.
 */

// ── Configurazione ──────────────────────────────────────────────
define('SECRET_TOKEN',   'CAMBIA_QUESTA_CHIAVE_SEGRETA');  // scegli una stringa casuale lunga
define('ARTICOLI_DIR',   __DIR__ . '/articoli/');           // percorso cartella articoli
define('IMG_DIR',        __DIR__ . '/img/');                // percorso cartella immagini
define('MAX_FILE_SIZE',  5 * 1024 * 1024);                  // 5 MB per file immagine
define('ALLOWED_IMG',    ['image/jpeg','image/png','image/webp','image/gif']);
// ────────────────────────────────────────────────────────────────

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');           // restringi al tuo dominio in produzione
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-Auth-Token');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }
if ($_SERVER['REQUEST_METHOD'] !== 'POST')    { json_error(405, 'Metodo non consentito'); }

// ── Autenticazione ───────────────────────────────────────────────
$token = $_SERVER['HTTP_X_AUTH_TOKEN'] ?? '';
if (!hash_equals(SECRET_TOKEN, $token)) {
    json_error(401, 'Token non valido. Controlla la chiave segreta nell\'editor.');
}

// ── Lettura payload ──────────────────────────────────────────────
$raw  = file_get_contents('php://input');
$data = json_decode($raw, true);

if (!$data || !isset($data['action'])) {
    json_error(400, 'Payload non valido');
}

// ── Routing ──────────────────────────────────────────────────────
switch ($data['action']) {

    // Pubblica HTML articolo
    case 'publish_article':
        $filename = sanitize_filename($data['filename'] ?? '');
        $html     = $data['html'] ?? '';

        if (!$filename || !str_ends_with($filename, '.html')) {
            json_error(400, 'Nome file non valido (deve terminare in .html)');
        }
        if (strlen($html) < 100) {
            json_error(400, 'Il contenuto HTML sembra troppo corto');
        }
        if (!is_dir(ARTICOLI_DIR)) {
            json_error(500, 'Cartella articoli non trovata sul server: ' . ARTICOLI_DIR);
        }

        $dest = ARTICOLI_DIR . $filename;
        if (file_put_contents($dest, $html) === false) {
            json_error(500, 'Impossibile scrivere il file. Controlla i permessi della cartella articoli/');
        }

        json_ok(['message' => "Articolo pubblicato: articoli/$filename", 'path' => "articoli/$filename"]);
        break;

    // Carica immagine (hero o galleria)
    case 'upload_image':
        $filename  = sanitize_filename($data['filename'] ?? '');
        $b64       = $data['data'] ?? '';           // base64 senza prefisso data:…
        $mimeType  = $data['mimeType'] ?? '';

        if (!$filename) json_error(400, 'Nome file mancante');
        if (!in_array($mimeType, ALLOWED_IMG, true)) json_error(400, 'Tipo immagine non consentito');

        $bytes = base64_decode($b64, true);
        if ($bytes === false) json_error(400, 'Dati immagine non validi (base64)');
        if (strlen($bytes) > MAX_FILE_SIZE) json_error(413, 'Immagine troppo grande (max 5 MB)');

        if (!is_dir(IMG_DIR)) {
            json_error(500, 'Cartella img/ non trovata sul server: ' . IMG_DIR);
        }

        $dest = IMG_DIR . $filename;
        if (file_put_contents($dest, $bytes) === false) {
            json_error(500, 'Impossibile scrivere l\'immagine. Controlla i permessi della cartella img/');
        }

        json_ok(['message' => "Immagine caricata: img/$filename", 'path' => "img/$filename"]);
        break;

    // Lista articoli esistenti
    case 'list_articles':
        if (!is_dir(ARTICOLI_DIR)) json_error(500, 'Cartella articoli non trovata');
        $files = glob(ARTICOLI_DIR . '*.html');
        $list  = array_map(fn($f) => basename($f), $files);
        sort($list);
        json_ok(['articles' => $list]);
        break;

    default:
        json_error(400, 'Azione sconosciuta: ' . $data['action']);
}

// ── Helper ───────────────────────────────────────────────────────
function sanitize_filename(string $name): string {
    $name = basename($name);                          // no path traversal
    $name = preg_replace('/[^a-zA-Z0-9._\-]/', '', $name);
    return strtolower($name);
}

function json_ok(array $data): never {
    echo json_encode(['ok' => true, ...$data], JSON_UNESCAPED_UNICODE);
    exit;
}

function json_error(int $code, string $msg): never {
    http_response_code($code);
    echo json_encode(['ok' => false, 'error' => $msg], JSON_UNESCAPED_UNICODE);
    exit;
}
