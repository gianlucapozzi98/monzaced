import type { APIRoute } from 'astro';
import { utenteSessione } from '@/lib/server/accesso';
import { archivio } from '@/lib/server/archivio';
import { leggiPratica, registra } from '@/lib/server/pratiche';

export const prerender = false;

/** Scaricamento di un documento: solo con sessione valida; ogni scaricamento viene registrato. */
export const GET: APIRoute = async ({ cookies, url, redirect }) => {
  const u = utenteSessione(cookies);
  if (!u) return new Response('Accesso richiesto', { status: 401 });
  const p = await leggiPratica(url.searchParams.get('p') ?? '');
  const f = p?.file.find((x) => x.indice === Number(url.searchParams.get('i')) && x.stato === 'accettato');
  if (!p || !f) return new Response('Non trovato', { status: 404 });
  const nome = `${p.codice}-${String(f.indice + 1).padStart(2, '0')}-${f.nomeOriginale}`.replace(/[^\w.\- ]/g, '_');
  await registra('scaricamento', { utente: u, pratica: p.id, indice: f.indice });
  const a = archivio();
  const firmato = await a.urlLettura(f.chiave, nome, 120);
  if (firmato) return redirect(firmato, 302);
  const dati = await a.leggi(f.chiave);
  if (!dati) return new Response('Non trovato', { status: 404 });
  return new Response(Buffer.from(dati), {
    headers: {
      'content-type': f.tipo,
      'content-disposition': `attachment; filename="${nome}"`,
      'cache-control': 'no-store, private',
      'x-content-type-options': 'nosniff',
    },
  });
};
