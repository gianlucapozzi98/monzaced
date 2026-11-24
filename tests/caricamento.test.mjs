/**
 * Test di integrazione del caricamento documenti e dei moduli.
 * Richiedono il sito in esecuzione in MODALITÀ DI PROVA (vedi README, "Test"):
 *   npm run build:veloce && npm start      (con .env di prova)
 *   npm test
 * Variabile BASE_URL per puntare a un altro indirizzo (predefinito http://127.0.0.1:4321).
 */
import { test, before } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { createServer } from 'node:net';

const BASE = process.env.BASE_URL ?? 'http://127.0.0.1:4321';
const EICAR = 'X5O!P%@AP[4\\PZX54(P^)7CC)7}$EICAR-STANDARD-ANTIVIRUS-TEST-FILE!$H+H*';
const pausa = (ms) => new Promise((r) => setTimeout(r, ms));
const pdf = (testo = 'documento di prova') =>
  Buffer.from(`%PDF-1.4\n1 0 obj<<>>endobj\n% ${testo}\ntrailer<<>>\n%%EOF\n`, 'latin1');

let gettone;
async function nuovoGettone(base = BASE) {
  const s = await (await fetch(`${base}/api/stato`)).json();
  await pausa(3100); // il gettone è valido solo dopo 3 secondi (anti-robot)
  return s.gettone;
}

function corpo(files, extra = {}) {
  return {
    gettone, servizio: 'modello-730', nome: 'Mario Rossi Prova', telefono: '039 000000', email: 'prova@example.com',
    note: 'test automatico', sito_web: '', consensoPrivacy: true, consensoSalute: true,
    documenti: ['Certificazione Unica (CU) e dati dell\'attuale datore di lavoro'],
    files: files.map((f) => ({ nome: f.nome, tipo: f.tipo, dimensione: f.dati.length })),
    ...extra,
  };
}

async function carica(files, extra, base = BASE) {
  const r = await fetch(`${base}/api/upload/init`, {
    method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(corpo(files, extra)),
  });
  const init = await r.json();
  if (!r.ok) return { init, status: r.status };
  const put = [];
  for (const c of init.caricamenti) {
    const url = c.url.startsWith('http') ? c.url : base + c.url;
    const f = files[c.indice];
    const rp = await fetch(url, { method: 'PUT', headers: c.intestazioni, body: f.inviare ?? f.dati });
    put.push(rp.status);
  }
  const rc = await fetch(`${base}/api/upload/complete`, {
    method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ pratica: init.pratica }),
  });
  return { status: rc.status, put, fine: await rc.json() };
}

before(async () => {
  const s = await (await fetch(`${BASE}/api/stato`)).json();
  assert.equal(s.caricamento.attivo, true, 'Il caricamento deve essere attivo (modalità di prova)');
  gettone = await nuovoGettone();
});

test('stato: il server dichiara limiti e tipi ammessi', async () => {
  const s = await (await fetch(`${BASE}/api/stato`)).json();
  assert.deepEqual(s.caricamento.tipi, ['application/pdf', 'image/jpeg', 'image/png']);
  assert.ok(s.caricamento.maxMB > 0 && s.caricamento.maxFile > 0);
});

test('file valido (PDF): ricevuto, controllato e confermato con codice pratica', async () => {
  const r = await carica([{ nome: 'cu-2026.pdf', tipo: 'application/pdf', dati: pdf() }]);
  assert.equal(r.status, 200);
  assert.deepEqual(r.put, [200]);
  assert.match(r.fine.codice, /^MC-\d{6}-[A-Z0-9]{5}$/);
  assert.equal(r.fine.accettati.length, 1);
  assert.equal(r.fine.rifiutati.length, 0);
});

test('file non valido: dichiarato PDF ma il contenuto non lo è → rifiutato, nessun codice', async () => {
  const r = await carica([{ nome: 'finto.pdf', tipo: 'application/pdf', dati: Buffer.from('MZ\x90\x00 eseguibile travestito', 'latin1') }]);
  assert.equal(r.status, 200);
  assert.equal(r.fine.codice, null);
  assert.match(r.fine.rifiutati[0].motivo, /non è un PDF valido/);
});

test('tipo non ammesso (.exe) → respinto prima del caricamento', async () => {
  const r = await carica([{ nome: 'programma.exe', tipo: 'application/x-msdownload', dati: Buffer.from('MZ') }]);
  assert.equal(r.status, 422);
  assert.match(r.init.errori.file, /solo PDF, JPG e PNG/);
});

test('file troppo grande → respinto prima del caricamento', async () => {
  const s = await (await fetch(`${BASE}/api/stato`)).json();
  const grande = Buffer.alloc(s.caricamento.maxMB * 1024 * 1024 + 1, 0x20);
  grande.write('%PDF-1.4', 0, 'latin1');
  const r = await carica([{ nome: 'enorme.pdf', tipo: 'application/pdf', dati: grande }]);
  assert.equal(r.status, 422);
  assert.match(r.init.errori.file, /supera/);
});

test('file più grande di quanto dichiarato → il caricamento viene bloccato', async () => {
  const dichiarato = pdf('piccolo');
  const r = await carica([{ nome: 'trucco.pdf', tipo: 'application/pdf', dati: dichiarato, inviare: Buffer.concat([dichiarato, Buffer.alloc(50_000, 0x20)]) }]);
  assert.equal(r.put[0], 413);
  assert.equal(r.fine.codice, null);
});

test('antivirus: file di prova EICAR → rifiutato e cancellato; gli altri file passano', async () => {
  const infetto = Buffer.concat([Buffer.from('%PDF-1.4\n', 'latin1'), Buffer.from(EICAR, 'latin1'), Buffer.from('\n%%EOF\n')]);
  const r = await carica([
    { nome: 'buono.pdf', tipo: 'application/pdf', dati: pdf('buono') },
    { nome: 'virus.pdf', tipo: 'application/pdf', dati: infetto },
  ]);
  assert.equal(r.status, 200);
  assert.ok(r.fine.codice, 'Il file buono genera comunque il codice pratica');
  assert.equal(r.fine.accettati.length, 1);
  assert.match(r.fine.rifiutati[0].motivo, /antivirus/);
});

test('consensi mancanti e campi non validi → errori chiari per campo', async () => {
  const r = await carica([{ nome: 'a.pdf', tipo: 'application/pdf', dati: pdf() }], { consensoSalute: false, telefono: 'abc', nome: '' });
  assert.equal(r.status, 422);
  assert.ok(r.init.errori.consensoSalute && r.init.errori.telefono && r.init.errori.nome);
});

test('trappola anti-robot (campo nascosto compilato) → respinto', async () => {
  const r = await carica([{ nome: 'a.pdf', tipo: 'application/pdf', dati: pdf() }], { sito_web: 'http://spam.example' });
  assert.equal(r.status, 400);
});

test('senza gettone valido → respinto', async () => {
  const r = await carica([{ nome: 'a.pdf', tipo: 'application/pdf', dati: pdf() }], { gettone: 'falso.falso' });
  assert.equal(r.status, 400);
});

test('area riservata: senza accesso non si vedono pratiche né file', async () => {
  const r = await fetch(`${BASE}/area-studio`, { redirect: 'manual' });
  assert.equal(r.status, 302);
  const f = await fetch(`${BASE}/api/studio/file?p=00000000-0000-0000-0000-000000000000&i=0`, { redirect: 'manual' });
  assert.equal(f.status, 401);
});

test('modulo "Prenota una consulenza": invio reale con codice', async () => {
  const r = await fetch(`${BASE}/api/richiesta`, {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ tipo: 'prenota', gettone, nome: 'Anna Bianchi Prova', telefono: '039 111111', servizio: 'imu', profilo: 'privato', preferenza: 'mattina', consenso: true, sito_web: '' }),
  });
  const d = await r.json();
  assert.equal(r.status, 200);
  assert.match(d.codice, /^PR-\d{6}-/);
});

test('modulo contatti: senza consenso → errore, nessun invio', async () => {
  const r = await fetch(`${BASE}/api/richiesta`, {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ tipo: 'contatto', gettone, nome: 'Anna Prova', email: 'a@example.com', messaggio: 'Buongiorno', consenso: false }),
  });
  assert.equal(r.status, 422);
});

/* ---- Protocollo ClamAV (clamd INSTREAM) contro un finto clamd ---- */
test('antivirus clamd: protocollo INSTREAM verificato con un finto server ClamAV', async (t) => {
  const finto = createServer((s) => {
    let buf = Buffer.alloc(0), testa = false, dati = Buffer.alloc(0);
    s.on('data', (d) => {
      buf = Buffer.concat([buf, d]);
      if (!testa) {
        const i = buf.indexOf(0);
        if (i < 0) return;
        assert.equal(buf.subarray(0, i).toString(), 'zINSTREAM');
        buf = buf.subarray(i + 1); testa = true;
      }
      while (buf.length >= 4) {
        const n = buf.readUInt32BE(0);
        if (n === 0) {
          const infetto = dati.toString('latin1').includes('EICAR-STANDARD-ANTIVIRUS-TEST-FILE');
          s.end(infetto ? 'stream: Win.Test.EICAR_HDB-1 FOUND\0' : 'stream: OK\0');
          return;
        }
        if (buf.length < 4 + n) return;
        dati = Buffer.concat([dati, buf.subarray(4, 4 + n)]);
        buf = buf.subarray(4 + n);
      }
    });
  });
  await new Promise((r) => finto.listen(0, '127.0.0.1', r));
  const portaClamd = finto.address().port;
  const porta = 4399;
  const app = spawn(process.execPath, ['--env-file-if-exists=.env', 'server.mjs'], {
    env: { ...process.env, PORT: String(porta), ANTIVIRUS_DRIVER: 'clamd', CLAMD_HOST: '127.0.0.1', CLAMD_PORT: String(portaClamd) },
    stdio: 'ignore',
  });
  t.after(() => { app.kill(); finto.close(); });
  const base = `http://127.0.0.1:${porta}`;
  for (let i = 0; i < 60; i++) { try { await fetch(`${base}/robots.txt`); break; } catch { await pausa(250); } }
  gettone = await nuovoGettone(base);
  const infetto = Buffer.concat([Buffer.from('%PDF-1.4\n', 'latin1'), Buffer.from(EICAR, 'latin1')]);
  const grande = Buffer.concat([pdf('grande'), Buffer.alloc(200_000, 0x41)]); // più pezzi da 64 KB
  const r = await carica([
    { nome: 'ok.pdf', tipo: 'application/pdf', dati: grande },
    { nome: 'eicar.pdf', tipo: 'application/pdf', dati: infetto },
  ], {}, base);
  assert.equal(r.status, 200);
  assert.equal(r.fine.accettati.length, 1);
  assert.equal(r.fine.rifiutati.length, 1);
  assert.match(r.fine.rifiutati[0].motivo, /antivirus/);
});
