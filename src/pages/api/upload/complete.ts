import type { APIRoute } from 'astro';
import { cfg, statoCaricamento } from '@/lib/server/config';
import { archivio } from '@/lib/server/archivio';
import { scansiona, tipoReale } from '@/lib/server/antivirus';
import { notifica } from '@/lib/server/notifiche';
import { json, corpoJson } from '@/lib/server/http';
import { verifica } from '@/lib/server/firma';
import { consentito, ipCliente } from '@/lib/server/limiti';
import { leggiPratica, salvaPratica, eliminaPratica, registra, chiaveFile } from '@/lib/server/pratiche';

export const prerender = false;
const ETICHETTA: Record<string, string> = { 'application/pdf': 'PDF', 'image/jpeg': 'JPG', 'image/png': 'PNG' };

export const POST: APIRoute = async ({ request, clientAddress }) => {
  const c = cfg();
  if (!statoCaricamento(c).attivo) return json({ errore: 'non-attivo' }, 503);
  const ip = ipCliente(request, clientAddress, c.fidatiProxy);
  if (!consentito(`complete:${ip}`, 20, 10 * 60_000)) return json({ errore: 'troppe-richieste' }, 429);
  const b = await corpoJson<{ pratica?: string }>(request);
  const t = verifica<{ id: string; e: number }>(b?.pratica, 'pratica');
  if (!t || t.e < Date.now()) return json({ errore: 'pratica-scaduta' }, 403);
  const p = await leggiPratica(t.id);
  if (!p) return json({ errore: 'pratica-non-trovata' }, 404);

  // Già completata: risposta identica (idempotente), nessun nuovo controllo
  if (p.stato !== 'in-caricamento') {
    return json({
      codice: p.stato === 'ricevuta' ? p.codice : null,
      accettati: p.file.filter((f) => f.stato === 'accettato').map((f) => ({ indice: f.indice })),
      rifiutati: p.file.filter((f) => f.stato === 'rifiutato').map((f) => ({ indice: f.indice, motivo: f.motivo })),
      prova: !!p.prova,
    });
  }

  const a = archivio();
  const maxByte = c.maxMB * 1024 * 1024;
  for (const f of p.file) {
    const rifiuta = async (motivo: string) => { f.stato = 'rifiutato'; f.motivo = motivo; await a.elimina(f.chiave).catch(() => {}); };
    let dati: Uint8Array | null = null;
    try { dati = await a.leggi(f.chiave); } catch (e) { console.error('[complete] lettura', e); }
    if (!dati) { await rifiuta('Il file non è arrivato: riprova.'); continue; }
    if (dati.byteLength > maxByte) { await rifiuta(`Il file supera ${c.maxMB} MB.`); continue; }
    if (dati.byteLength !== f.dimensione) { await rifiuta('Il file è arrivato incompleto: riprova.'); continue; }
    const reale = tipoReale(dati);
    if (reale !== f.tipo) { await rifiuta(`Il contenuto non è un ${ETICHETTA[f.tipo] ?? 'file'} valido.`); continue; }
    let esito;
    try { esito = await scansiona(dati); } catch (e) {
      console.error('[complete] antivirus non raggiungibile', e);
      await rifiuta('Il controllo antivirus non è disponibile in questo momento: riprova più tardi.');
      continue;
    }
    if (!esito.pulito) {
      await registra('file-infetto', { pratica: p.id, indice: f.indice, firma: esito.firma, motore: esito.motore });
      await rifiuta('Il file non ha superato il controllo antivirus.');
      continue;
    }
    const finale = chiaveFile(p.id, 'documenti', f.indice, f.chiave.split('.').pop()!);
    try {
      await a.sposta(f.chiave, finale);
      f.chiave = finale;
      f.stato = 'accettato';
    } catch (e) {
      console.error('[complete] spostamento', e);
      await rifiuta('Errore di archiviazione: riprova.');
    }
  }
  const accettati = p.file.filter((f) => f.stato === 'accettato');
  const rifiutati = p.file.filter((f) => f.stato === 'rifiutato');
  const ora = new Date().toISOString();

  if (accettati.length === 0) {
    await registra('caricamento-vuoto', { pratica: p.id, rifiutati: rifiutati.length });
    await eliminaPratica(p); // nessun dato inutile conservato
    return json({ codice: null, accettati: [], rifiutati: rifiutati.map((f) => ({ indice: f.indice, motivo: f.motivo })), prova: c.prova });
  }

  p.stato = 'ricevuta';
  p.eventi.push({ ts: ora, tipo: 'ricevuta', dettaglio: `${accettati.length} accettati, ${rifiutati.length} rifiutati` });
  await salvaPratica(p);
  await registra('caricamento-completato', { pratica: p.id, codice: p.codice, accettati: accettati.length, rifiutati: rifiutati.length });

  try {
    await notifica({
      oggetto: `Nuovi documenti: ${p.codice} – ${p.servizioTitolo}`,
      testo: [
        `È arrivata una nuova pratica dal sito.`,
        ``,
        `Codice: ${p.codice}`,
        `Servizio: ${p.servizioTitolo}`,
        `Documenti ricevuti: ${accettati.length}${rifiutati.length ? ` (rifiutati: ${rifiutati.length})` : ''}`,
        ``,
        `Apri la pratica nell'area riservata (serve l'accesso):`,
        `${c.sito}/area-studio/pratica/${p.id}`,
        ``,
        `Per sicurezza i documenti e i dati personali non sono allegati a questa email.`,
      ].join('\n'),
    });
  } catch (e) {
    console.error('[complete] notifica non inviata', e);
    await registra('notifica-non-inviata', { pratica: p.id });
  }

  return json({
    codice: p.codice,
    accettati: accettati.map((f) => ({ indice: f.indice })),
    rifiutati: rifiutati.map((f) => ({ indice: f.indice, motivo: f.motivo })),
    prova: c.prova,
  });
};
