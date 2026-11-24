/**
 * Controlli di pubblicazione sul sito in esecuzione (npm start, poi npm test).
 * Link rotti, SPID rimosso, meta unici e nei limiti, sitemap, robots, dati societari, redirect, dati strutturati.
 */
import { test, before } from 'node:test';
import assert from 'node:assert/strict';

const BASE = process.env.BASE_URL ?? 'http://127.0.0.1:4321';
const pagine = new Map(); // url -> html

const estrai = (html, re) => [...html.matchAll(re)].map((m) => m[1]);
const meta = (html, nome) => (html.match(new RegExp(`<meta (?:name|property)="${nome}" content="([^"]*)"`)) ?? [])[1];
const decodifica = (s) => s.replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&quot;/g, '"');

before(async () => {
  // Tutte le pagine della sitemap + le pagine di servizio
  const indice = await (await fetch(`${BASE}/sitemap-index.xml`)).text();
  const mappe = estrai(indice, /<loc>([^<]+)<\/loc>/g);
  const urls = new Set();
  for (const m of mappe) {
    const xml = await (await fetch(m.replace(/^https?:\/\/[^/]+/, BASE))).text();
    estrai(xml, /<loc>([^<]+)<\/loc>/g).forEach((u) => urls.add(new URL(u).pathname));
  }
  for (const u of urls) pagine.set(u, await (await fetch(BASE + u)).text());
});

test('la sitemap contiene home, 18 servizi e le pagine principali, ma non la pagina SPID né le aree riservate', () => {
  const lista = [...pagine.keys()];
  assert.ok(lista.includes('/'));
  assert.equal(lista.filter((u) => /^\/servizi\/[^/]+$/.test(u)).length, 18);
  for (const u of ['/servizi', '/chi-siamo', '/contatti', '/prenota', '/carica-documenti', '/cerca', '/crediti', '/privacy', '/cookie', '/termini', '/accessibilita']) assert.ok(lista.includes(u), u);
  assert.ok(!lista.some((u) => /spid|firma|area-studio|keystatic|api|404/.test(u)), 'pagine non ammesse in sitemap');
});

test('nessun riferimento a SPID o firma digitale nelle pagine', () => {
  for (const [u, html] of pagine) {
    const testo = html.replace(/<script[\s\S]*?<\/script>/g, ' ');
    assert.ok(!/\bSPID\b/i.test(testo), `SPID in ${u}`);
    assert.ok(!/firma digitale/i.test(testo), `firma digitale in ${u}`);
    assert.ok(!/rilascio-spid/i.test(html), `link SPID in ${u}`);
  }
});

test('la vecchia pagina SPID reindirizza con 301 a /servizi', async () => {
  const r = await fetch(`${BASE}/servizi/rilascio-spid-firma-digitale`, { redirect: 'manual' });
  assert.equal(r.status, 301);
  assert.match(r.headers.get('location') ?? '', /\/servizi$/);
});

test('titoli ≤ 60 caratteri e descrizioni ≤ 155, unici per pagina; canonical e Open Graph presenti', () => {
  const titoli = new Set(), descr = new Set();
  for (const [u, html] of pagine) {
    const t = decodifica((html.match(/<title>([^<]*)<\/title>/) ?? [])[1] ?? '');
    const d = decodifica(meta(html, 'description') ?? '');
    assert.ok(t.length > 0 && t.length <= 60, `titolo ${t.length} caratteri in ${u}: ${t}`);
    assert.ok(d.length > 0 && d.length <= 155, `descrizione ${d.length} caratteri in ${u}`);
    assert.ok(!titoli.has(t), `titolo duplicato: ${t}`);
    assert.ok(!descr.has(d), `descrizione duplicata in ${u}`);
    titoli.add(t); descr.add(d);
    assert.match(html, /<link rel="canonical" href="https:\/\/[^"]+"/, `canonical in ${u}`);
    assert.ok(meta(html, 'og:image') && meta(html, 'og:title'), `Open Graph in ${u}`);
    assert.match(html, /<html lang="it"/);
  }
});

test('nessun link interno rotto (pagine, immagini, script, ancore principali)', async () => {
  const visti = new Map();
  for (const [u, html] of pagine) {
    const link = [...estrai(html, /\shref="([^"]+)"/g), ...estrai(html, /\ssrc="([^"]+)"/g), ...estrai(html, /\ssrcset="([^"]+)"/g).flatMap((s) => s.split(',').map((x) => x.trim().split(' ')[0]))];
    for (let l of link) {
      l = decodifica(l);
      if (/^(https?:|mailto:|tel:|data:|#)/.test(l) && !l.startsWith(BASE)) continue;
      const path = l.replace(BASE, '').split('#')[0];
      if (!path) continue;
      if (!visti.has(path)) visti.set(path, (await fetch(BASE + path, { redirect: 'manual' })).status);
      const st = visti.get(path);
      assert.ok(st === 200 || st === 301 || st === 302, `${path} → ${st} (da ${u})`);
    }
  }
  assert.ok(visti.size > 50);
});

test('dati societari nel footer coincidenti con il brief (+ segnaposto REA e PEC)', () => {
  const html = pagine.get('/');
  for (const dato of ['Monza CED Srl', 'Via Solferino 11', '20900', 'Monza', '12488810966', '10.000,00 i.v.', '039 326628', 'ingresso@monzaced.it']) {
    assert.ok(html.includes(dato), `manca "${dato}" in home`);
  }
  assert.match(html, /REA <span class="segnaposto-inline"[^>]*>da completare/);
  assert.match(html, /PEC <span class="segnaposto-inline"[^>]*>da completare/);
  // un solo link "Crediti" nel footer
  assert.equal((html.match(/href="\/crediti"/g) ?? []).length, 1);
  assert.ok(!/Immagine illustrativa/i.test(html));
});

test('CTA "Prenota una consulenza" e "Carica i documenti" in navigazione, hero, metà pagina e chiusura', () => {
  const html = pagine.get('/');
  assert.ok((html.match(/Prenota una consulenza/g) ?? []).length >= 4);
  assert.ok((html.match(/Carica i documenti/g) ?? []).length >= 4);
});

test('dati strutturati validi: ProfessionalService senza valutazioni, FAQPage, Service', () => {
  const blocchi = (html) => estrai(html, /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g).map((j) => JSON.parse(j));
  const home = blocchi(pagine.get('/'));
  const studio = home.find((b) => [].concat(b['@type']).includes('ProfessionalService'));
  assert.ok(studio && studio.vatID === 'IT12488810966' && studio.address.streetAddress === 'Via Solferino 11');
  assert.ok(!JSON.stringify(home).includes('aggregateRating') && !JSON.stringify(home).includes('review'));
  assert.ok(home.some((b) => b['@type'] === 'FAQPage'));
  assert.ok(blocchi(pagine.get('/servizi/modello-730')).some((b) => b['@type'] === 'Service'));
});

test('robots.txt esclude area riservata e API; nessuno script di tracciamento nelle pagine', async () => {
  const r = await (await fetch(`${BASE}/robots.txt`)).text();
  assert.match(r, /Disallow: \/area-studio/);
  assert.match(r, /Disallow: \/api\//);
  assert.match(r, /Sitemap: /);
  for (const [u, html] of pagine) {
    assert.ok(!/googletagmanager|google-analytics|gtag\(|fbq\(|hotjar|clarity\.ms/i.test(html), `tracciamento in ${u}`);
    const esterni = estrai(html, /<script[^>]+src="(https?:\/\/[^"]+)"/g);
    assert.deepEqual(esterni, [], `script esterni in ${u}`);
  }
});

test('pagina 404 nello stile del sito e intestazioni di sicurezza', async () => {
  const r = await fetch(`${BASE}/non-esiste-davvero`);
  assert.equal(r.status, 404);
  assert.match(await r.text(), /non porta da nessuna parte/);
  const h = (await fetch(BASE + '/')).headers;
  assert.equal(h.get('x-frame-options'), 'DENY');
  assert.equal(h.get('x-content-type-options'), 'nosniff');
  assert.ok(h.get('content-security-policy'));
});
