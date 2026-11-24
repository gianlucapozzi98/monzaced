import type { APIRoute } from 'astro';
import { cfg } from '@/lib/server/config';
import { verifica } from '@/lib/server/firma';
import { archivio } from '@/lib/server/archivio';
import { json } from '@/lib/server/http';

export const prerender = false;

/** Ricezione del file per l'archivio "locale" (con S3 il browser carica direttamente sul bucket). */
export const PUT: APIRoute = async ({ params, request }) => {
  const c = cfg();
  if (c.archivio !== 'locale') return json({ errore: 'non-disponibile' }, 404);
  const t = verifica<{ k: string; t: string; m: number; e: number }>(params.token, 'put');
  if (!t || t.e < Date.now()) return json({ errore: 'link-scaduto' }, 403);
  if ((request.headers.get('content-type') ?? '') !== t.t) return json({ errore: 'tipo' }, 415);
  const dichiarata = Number(request.headers.get('content-length') ?? 0);
  if (dichiarata && dichiarata > t.m) return json({ errore: 'troppo-grande' }, 413);
  const reader = request.body?.getReader();
  if (!reader) return json({ errore: 'vuoto' }, 400);
  const parti: Uint8Array[] = [];
  let tot = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    tot += value.byteLength;
    if (tot > t.m) { await reader.cancel(); return json({ errore: 'troppo-grande' }, 413); }
    parti.push(value);
  }
  await archivio().scrivi(t.k, Buffer.concat(parti), t.t);
  return new Response(null, { status: 200 });
};
