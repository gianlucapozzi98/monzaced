import type { APIRoute } from 'astro';
import { timingSafeEqual } from 'node:crypto';
import { archivio } from '@/lib/server/archivio';
import { elencoPratiche, elencoRichieste, eliminaPratica, registra } from '@/lib/server/pratiche';
import { json } from '@/lib/server/http';

export const prerender = false;

/**
 * Cancellazione automatica (conservazione definita):
 *  - pratiche oltre la data di scadenza (CONSERVAZIONE_GIORNI dal caricamento);
 *  - caricamenti mai completati da più di 24 ore (file in quarantena);
 *  - richieste dei moduli oltre la scadenza;
 *  - registro più vecchio di REGISTRO_GIORNI (predefinito 365).
 * Si chiama con l'intestazione x-manutenzione: <MANUTENZIONE_TOKEN> (server.mjs, ogni 6 ore)
 * oppure, su Vercel, dal Cron giornaliero di vercel.json con Authorization: Bearer <CRON_SECRET>.
 */
const uguali = (a: string, b: string) => a.length >= 24 && a.length === b.length && timingSafeEqual(Buffer.from(a), Buffer.from(b));
function autorizzato(request: Request): boolean {
  // server.mjs: intestazione x-manutenzione · Vercel Cron: Authorization: Bearer <CRON_SECRET>
  if (uguali(process.env.MANUTENZIONE_TOKEN ?? '', request.headers.get('x-manutenzione') ?? '')) return true;
  const bearer = (request.headers.get('authorization') ?? '').replace(/^Bearer\s+/i, '');
  return uguali(process.env.CRON_SECRET ?? '', bearer);
}

export const GET: APIRoute = (ctx) => POST(ctx);

export const POST: APIRoute = async ({ request }) => {
  if (!autorizzato(request)) return json({ errore: 'non-autorizzato' }, 401);
  const ora = Date.now();
  const esito = { pratiche: 0, incompiute: 0, richieste: 0, registro: 0 };
  for (const p of await elencoPratiche()) {
    const scaduta = new Date(p.scadenza).getTime() < ora;
    const incompiuta = p.stato === 'in-caricamento' && ora - new Date(p.creata).getTime() > 24 * 3600_000;
    if (scaduta || incompiuta) {
      await eliminaPratica(p);
      if (scaduta) esito.pratiche++;
      else esito.incompiute++;
    }
  }
  const a = archivio();
  for (const r of await elencoRichieste()) {
    if (new Date(r.scadenza).getTime() < ora) {
      await a.elimina(`richieste/${r.id}.json`);
      esito.richieste++;
    }
  }
  const giorniRegistro = Number(process.env.REGISTRO_GIORNI) || 365;
  const limite = new Date(ora - giorniRegistro * 86400_000).toISOString().slice(0, 10);
  for (const k of await a.elenca('registro/')) {
    if (k.split('/')[1] < limite) {
      await a.elimina(k);
      esito.registro++;
    }
  }
  await registra('pulizia', esito);
  return json(esito);
};
