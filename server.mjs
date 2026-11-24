/**
 * Avvio in produzione: `npm start` (legge .env se presente).
 * Avvolge il server di Astro e aggiunge le intestazioni di sicurezza a tutte le risposte,
 * comprese le pagine statiche.
 */
import http from 'node:http';
import compression from 'compression';

process.env.ASTRO_NODE_AUTOSTART = 'disabled';
const { handler } = await import('./dist/server/entry.mjs');

const s3 = process.env.S3_ENDPOINT ? ' ' + new URL(process.env.S3_ENDPOINT).origin : '';
const pannello = (url) => url.startsWith('/keystatic') || url.startsWith('/api/keystatic');
const CSP_BASE = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'", // le pagine hanno in più una CSP con hash (meta) generata da Astro
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self'",
  `connect-src 'self'${s3}`,
  'frame-src https://www.openstreetmap.org',
  "frame-ancestors 'none'",
  "form-action 'self'",
  "base-uri 'self'",
  "object-src 'none'",
].join('; ');

const comprimi = compression({ threshold: 1024 }); // brotli/gzip per HTML, CSS, JS, JSON, SVG

const server = http.createServer((req, res) => comprimi(req, res, () => {
  const url = req.url ?? '/';
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), interest-cohort=()');
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  if (!pannello(url)) {
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Content-Security-Policy', CSP_BASE);
  }
  if (process.env.HSTS === '1') res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  if (url.startsWith('/area-studio') || url.startsWith('/api/')) res.setHeader('X-Robots-Tag', 'noindex, nofollow');
  if (url.startsWith('/_astro/')) res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  handler(req, res, () => { res.statusCode = 404; res.end('Non trovato'); });
}));

const port = Number(process.env.PORT ?? 4321);
const host = process.env.HOST ?? '127.0.0.1';
server.listen(port, host, () => console.log(`Monza CED in ascolto su http://${host}:${port}`));

// Conservazione definita: ogni 6 ore cancella pratiche e richieste scadute (vedi /api/manutenzione/pulizia)
const tokenManutenzione = process.env.MANUTENZIONE_TOKEN ?? '';
if (tokenManutenzione.length >= 24) {
  const pulizia = () =>
    fetch(`http://127.0.0.1:${port}/api/manutenzione/pulizia`, { method: 'POST', headers: { 'x-manutenzione': tokenManutenzione } })
      .then((r) => r.json())
      .then((e) => console.log('[pulizia]', JSON.stringify(e)))
      .catch((e) => console.error('[pulizia] errore', e.message));
  setTimeout(pulizia, 60_000).unref();
  setInterval(pulizia, 6 * 3600_000).unref();
}
