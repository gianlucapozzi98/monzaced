/** Pratiche di caricamento, richieste dai moduli e registro degli eventi. */
import { randomInt, randomUUID } from 'node:crypto';
import { archivio } from './archivio';
import { casuale } from './firma';

export interface FilePratica {
  indice: number;
  nomeOriginale: string;
  tipo: string;
  dimensione: number;
  chiave: string; // quarantena, poi documenti
  stato: 'atteso' | 'accettato' | 'rifiutato';
  motivo?: string;
}
export interface Pratica {
  id: string;
  codice: string;
  creata: string;
  scadenza: string;
  servizio: string;
  servizioTitolo: string;
  nome: string;
  telefono: string;
  email: string;
  note: string;
  documentiSpuntati: string[];
  consensi: { privacy: string; salute: string };
  origine: string; // impronta dell'IP, non l'IP
  stato: 'in-caricamento' | 'ricevuta' | 'vuota' | 'lavorata';
  file: FilePratica[];
  eventi: { ts: string; tipo: string; chi?: string; dettaglio?: string }[];
  prova?: boolean;
}

const ALFABETO = 'ACDEFGHJKLMNPQRTUVWXY34679';
export function nuovoCodice(d = new Date()): string {
  const data = `${String(d.getFullYear()).slice(2)}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
  let s = '';
  for (let i = 0; i < 5; i++) s += ALFABETO[randomInt(ALFABETO.length)];
  return `MC-${data}-${s}`;
}
export const nuovoId = () => randomUUID();

const chiavePratica = (id: string) => `pratiche/${id}/pratica.json`;
export const chiaveFile = (id: string, cartella: 'quarantena' | 'documenti', indice: number, est: string) =>
  `pratiche/${id}/${cartella}/${String(indice + 1).padStart(2, '0')}-${casuale(6)}.${est}`;

export async function salvaPratica(p: Pratica) {
  await archivio().scrivi(chiavePratica(p.id), JSON.stringify(p, null, 2), 'application/json');
}
export async function leggiPratica(id: string): Promise<Pratica | null> {
  if (!/^[0-9a-f-]{36}$/.test(id)) return null;
  const d = await archivio().leggi(chiavePratica(id));
  return d ? (JSON.parse(Buffer.from(d).toString('utf8')) as Pratica) : null;
}
export async function elencoPratiche(): Promise<Pratica[]> {
  const chiavi = (await archivio().elenca('pratiche/')).filter((k) => k.endsWith('/pratica.json'));
  const out: Pratica[] = [];
  for (const k of chiavi) {
    const p = await leggiPratica(k.split('/')[1]);
    if (p) out.push(p);
  }
  return out.sort((a, b) => b.creata.localeCompare(a.creata));
}
export async function eliminaPratica(p: Pratica) {
  const a = archivio();
  for (const k of await a.elenca(`pratiche/${p.id}/`)) await a.elimina(k);
}

/* Richieste dai moduli (prenotazione e contatto) */
export interface Richiesta {
  id: string; codice: string; tipo: 'prenota' | 'contatto'; creata: string; scadenza: string;
  nome: string; telefono: string; email: string; servizio: string; profilo: string; preferenza: string; messaggio: string;
  consenso: string; origine: string; stato: 'nuova' | 'gestita'; prova?: boolean;
}
export async function salvaRichiesta(r: Richiesta) {
  await archivio().scrivi(`richieste/${r.id}.json`, JSON.stringify(r, null, 2), 'application/json');
}
export async function elencoRichieste(): Promise<Richiesta[]> {
  const a = archivio();
  const out: Richiesta[] = [];
  for (const k of (await a.elenca('richieste/')).filter((k) => k.endsWith('.json'))) {
    const d = await a.leggi(k);
    if (d) out.push(JSON.parse(Buffer.from(d).toString('utf8')));
  }
  return out.sort((x, y) => y.creata.localeCompare(x.creata));
}

/* Registro degli eventi (chi ha fatto cosa, quando). Un oggetto per evento: funziona anche su S3. */
export async function registra(tipo: string, dettaglio: Record<string, unknown> = {}) {
  const ora = new Date();
  const k = `registro/${ora.toISOString().slice(0, 10)}/${ora.getTime()}-${casuale(4)}.json`;
  try {
    await archivio().scrivi(k, JSON.stringify({ ts: ora.toISOString(), tipo, ...dettaglio }), 'application/json');
  } catch (e) {
    console.error('[registro] scrittura non riuscita', tipo, e);
  }
}
export async function leggiRegistro(giorni = 30): Promise<{ ts: string; tipo: string; [k: string]: unknown }[]> {
  const a = archivio();
  const limite = new Date(Date.now() - giorni * 86400_000).toISOString().slice(0, 10);
  const chiavi = (await a.elenca('registro/')).filter((k) => k.split('/')[1] >= limite).slice(-500);
  const out = [];
  for (const k of chiavi) {
    const d = await a.leggi(k);
    if (d) out.push(JSON.parse(Buffer.from(d).toString('utf8')));
  }
  return out.sort((x, y) => y.ts.localeCompare(x.ts));
}

export const scadenzaDa = (giorni: number, da = new Date()) => new Date(da.getTime() + giorni * 86400_000).toISOString();
