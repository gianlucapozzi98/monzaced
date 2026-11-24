/** Esegue subito la cancellazione dei dati scaduti sul server in esecuzione. Uso: npm run purge */
const base = process.env.SITE_INTERNO ?? `http://127.0.0.1:${process.env.PORT ?? 4321}`;
const r = await fetch(`${base}/api/manutenzione/pulizia`, {
  method: 'POST',
  headers: { 'x-manutenzione': process.env.MANUTENZIONE_TOKEN ?? '' },
});
console.log(r.status, await r.text());
process.exit(r.ok ? 0 : 1);
