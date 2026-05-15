/**
 * Balomè – Server di pubblicazione articoli (Node.js)
 * 
 * Requisiti: Node.js 18+  (nessuna dipendenza esterna)
 * 
 * Avvio:
 *   node upload-articolo.js
 * 
 * Oppure con PM2 per tenerlo attivo in background:
 *   npm install -g pm2
 *   pm2 start upload-articolo.js --name balome-upload
 *   pm2 save && pm2 startup
 */

import http from 'http';
import fs   from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// ── Configurazione ──────────────────────────────────────────────
const CONFIG = {
  SECRET_TOKEN:  'CAMBIA_QUESTA_CHIAVE_SEGRETA',   // stessa chiave dell'editor
  PORT:          3077,                              // porta del server
  HOST:          '0.0.0.0',                        // 0.0.0.0 = tutte le interfacce
  SITE_ROOT:     './balome-website',               // percorso root del sito
  MAX_IMG_MB:    5,
  ALLOWED_MIME:  ['image/jpeg','image/png','image/webp','image/gif'],
  CORS_ORIGIN:   '*',                              // restringi al tuo dominio in produzione
};
// ────────────────────────────────────────────────────────────────

const __dir      = path.dirname(fileURLToPath(import.meta.url));
const SITE_ROOT  = path.resolve(__dir, CONFIG.SITE_ROOT);
const ART_DIR    = path.join(SITE_ROOT, 'articoli');
const IMG_DIR    = path.join(SITE_ROOT, 'img');

// Crea cartelle se mancanti
[ART_DIR, IMG_DIR].forEach(d => fs.mkdirSync(d, { recursive: true }));

// ── Server ───────────────────────────────────────────────────────
const server = http.createServer(async (req, res) => {

  // CORS
  res.setHeader('Access-Control-Allow-Origin',  CONFIG.CORS_ORIGIN);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Auth-Token');

  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }
  if (req.method !== 'POST')    { return jsonError(res, 405, 'Metodo non consentito'); }

  // Auth
  const token = req.headers['x-auth-token'] ?? '';
  if (!timingSafeEqual(CONFIG.SECRET_TOKEN, token)) {
    return jsonError(res, 401, 'Token non valido. Controlla la chiave segreta nell\'editor.');
  }

  // Leggi body
  let body = '';
  for await (const chunk of req) body += chunk;

  let data;
  try { data = JSON.parse(body); }
  catch { return jsonError(res, 400, 'JSON non valido'); }

  // ── Routing ──────────────────────────────────────────────────
  switch (data.action) {

    case 'publish_article': {
      const filename = sanitize(data.filename ?? '');
      const html     = data.html ?? '';
      if (!filename.endsWith('.html')) return jsonError(res, 400, 'Nome file deve terminare in .html');
      if (html.length < 100)           return jsonError(res, 400, 'HTML troppo corto');

      const dest = path.join(ART_DIR, filename);
      fs.writeFileSync(dest, html, 'utf8');
      console.log(`[PUBBLICA] articoli/${filename} (${(html.length/1024).toFixed(1)} KB)`);
      return jsonOk(res, { message: `Articolo pubblicato: articoli/${filename}`, path: `articoli/${filename}` });
    }

    case 'upload_image': {
      const filename = sanitize(data.filename ?? '');
      const mime     = data.mimeType ?? '';
      const b64      = data.data ?? '';

      if (!filename)                              return jsonError(res, 400, 'Nome file mancante');
      if (!CONFIG.ALLOWED_MIME.includes(mime))   return jsonError(res, 400, 'Tipo immagine non consentito');

      let buf;
      try { buf = Buffer.from(b64, 'base64'); }
      catch { return jsonError(res, 400, 'Base64 non valido'); }

      if (buf.length > CONFIG.MAX_IMG_MB * 1024 * 1024) {
        return jsonError(res, 413, `Immagine troppo grande (max ${CONFIG.MAX_IMG_MB} MB)`);
      }

      const dest = path.join(IMG_DIR, filename);
      fs.writeFileSync(dest, buf);
      console.log(`[IMMAGINE] img/${filename} (${(buf.length/1024).toFixed(1)} KB)`);
      return jsonOk(res, { message: `Immagine caricata: img/${filename}`, path: `img/${filename}` });
    }

    case 'list_articles': {
      const files = fs.readdirSync(ART_DIR).filter(f => f.endsWith('.html')).sort();
      return jsonOk(res, { articles: files });
    }

    default:
      return jsonError(res, 400, `Azione sconosciuta: ${data.action}`);
  }
});

server.listen(CONFIG.PORT, CONFIG.HOST, () => {
  console.log(`\n✅ Balomè Upload Server avviato`);
  console.log(`   URL: http://${CONFIG.HOST === '0.0.0.0' ? 'localhost' : CONFIG.HOST}:${CONFIG.PORT}`);
  console.log(`   Site root: ${SITE_ROOT}`);
  console.log(`   Articoli → ${ART_DIR}`);
  console.log(`   Immagini → ${IMG_DIR}\n`);
});

// ── Helper ───────────────────────────────────────────────────────
function sanitize(name) {
  return path.basename(name).replace(/[^a-zA-Z0-9._\-]/g, '').toLowerCase();
}

function timingSafeEqual(a, b) {
  // Simple constant-time compare (avoids timing attacks on the token)
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function jsonOk(res, data) {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ ok: true, ...data }));
}

function jsonError(res, code, error) {
  res.writeHead(code, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ ok: false, error }));
}
