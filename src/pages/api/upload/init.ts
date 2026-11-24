import type { APIRoute } from 'astro';
import { cfg, statoCaricamento } from '@/lib/server/config';
import { archivio } from '@/lib/server/archivio';
import { json, corpoJson, testo, emailValida, telefonoValido, type Errori } from '@/lib/server/http';
import { consentito, ipCliente } from '@/lib/server/limiti';
import { gettoneValido } from '@/lib/server/modulo';
import { firma, impronta } from '@/lib/server/firma';
import { nuovoCodice, nuovoId, chiaveFile, salvaPratica, registra, scadenzaDa, type Pratica } from '@/lib/server/pratiche';
import { getServizio } from '@/lib/content';

export const prerender = false;
const EST: Record<string, string> = { 'application/pdf': 'pdf', 'image/jpeg': 'jpg', 'image/png': 'png' };
const estDaNome = (n: string) => n.toLowerCase().split('.').pop() ?? '';
const tipoDaEst: Record<string, string> = { pdf: 'application/pdf', jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png' };

export const POST: APIRoute = async ({ request, clientAddress }) => {
  const c = cfg();
  if (!statoCaricamento(c).attivo) return json({ errore: 'non-attivo' }, 503);
  const ip = ipCliente(request, clientAddress, c.fidatiProxy);
  if (!consentito(`init:${ip}`, Number(process.env.LIMITE_CARICAMENTI_10MIN) || 6, 10 * 60_000)) return json({ errore: 'troppe-richieste' }, 429, { 'retry-after': '600' });

  const b = await corpoJson(request);
  if (!b) return json({ errore: 'richiesta-non-valida' }, 400);
  // Trappola per i robot: campo nascosto compilato o gettone assente/troppo rapido
  if (testo(b.sito_web, 200)) return json({ errore: 'richiesta-non-valida' }, 400);
  if (!gettoneValido(b.gettone)) return json({ errore: 'gettone' }, 400);

  const errori: Errori = {};
  const servizio = getServizio(testo(b.servizio, 120));
  if (!servizio || !servizio.caricamentoAttivo) errori.servizio = 'Scegli un servizio dall\'elenco.';
  const nome = testo(b.nome, 120);
  if (nome.length < 3) errori.nome = 'Scrivi nome e cognome.';
  const telefono = testo(b.telefono, 30);
  if (!telefonoValido(telefono)) errori.telefono = 'Scrivi un numero di telefono valido.';
  const email = testo(b.email, 160);
  if (email && !emailValida(email)) errori.email = 'L\'indirizzo email non sembra corretto.';
  if (b.consensoPrivacy !== true) errori.consensoPrivacy = 'Serve la conferma per poter ricevere i documenti.';
  if (b.consensoSalute !== true) errori.consensoSalute = 'Serve il consenso per i dati relativi alla salute.';

  const files = Array.isArray(b.files) ? b.files : [];
  if (files.length === 0) errori.file = 'Aggiungi almeno un file.';
  if (files.length > c.maxFile) errori.file = `Puoi caricare al massimo ${c.maxFile} file per volta.`;
  const maxByte = c.maxMB * 1024 * 1024;
  const pronti: { nome: string; tipo: string; dimensione: number }[] = [];
  for (const f of files.slice(0, c.maxFile)) {
    const nomeF = testo(f?.nome, 180) || 'documento';
    const tipo = testo(f?.tipo, 60) || tipoDaEst[estDaNome(nomeF)] || '';
    const dimensione = Number(f?.dimensione);
    if (!c.tipi.includes(tipo) || tipoDaEst[estDaNome(nomeF)] !== tipo) { errori.file = `"${nomeF}": sono ammessi solo PDF, JPG e PNG.`; break; }
    if (!Number.isFinite(dimensione) || dimensione <= 0) { errori.file = `"${nomeF}" è vuoto.`; break; }
    if (dimensione > maxByte) { errori.file = `"${nomeF}" supera ${c.maxMB} MB.`; break; }
    pronti.push({ nome: nomeF, tipo, dimensione });
  }
  if (Object.keys(errori).length) return json({ errore: 'validazione', errori }, 422);

  const id = nuovoId();
  const ora = new Date();
  const p: Pratica = {
    id, codice: nuovoCodice(ora), creata: ora.toISOString(), scadenza: scadenzaDa(c.conservazioneGiorni, ora),
    servizio: servizio!.slug, servizioTitolo: servizio!.titolo, nome, telefono, email, note: testo(b.note, 1500),
    documentiSpuntati: (Array.isArray(b.documenti) ? b.documenti : []).map((d: unknown) => testo(d, 200)).filter(Boolean).slice(0, 60),
    consensi: { privacy: ora.toISOString(), salute: ora.toISOString() },
    origine: impronta(ip), stato: 'in-caricamento', prova: c.prova || undefined,
    file: pronti.map((f, i) => ({ indice: i, nomeOriginale: f.nome, tipo: f.tipo, dimensione: f.dimensione, chiave: chiaveFile(id, 'quarantena', i, EST[f.tipo]), stato: 'atteso' })),
    eventi: [{ ts: ora.toISOString(), tipo: 'avviata' }],
  };
  await salvaPratica(p);
  const a = archivio();
  const caricamenti = await Promise.all(p.file.map(async (f) => ({ indice: f.indice, ...(await a.urlCaricamento(f.chiave, f.tipo, f.dimensione, 900)) })));
  await registra('caricamento-avviato', { pratica: id, servizio: p.servizio, file: p.file.length, origine: p.origine });
  return json({ pratica: firma({ id, e: Date.now() + 60 * 60_000 }, 'pratica'), caricamenti });
};
