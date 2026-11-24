import type { APIRoute } from 'astro';
import { utenteSessione } from '@/lib/server/accesso';
import { leggiPratica, salvaPratica, eliminaPratica, registra } from '@/lib/server/pratiche';

export const prerender = false;

export const POST: APIRoute = async ({ cookies, request, redirect }) => {
  const u = utenteSessione(cookies);
  if (!u) return redirect('/area-studio/accesso', 303);
  const d = await request.formData();
  const p = await leggiPratica(String(d.get('id') ?? ''));
  if (!p) return redirect('/area-studio', 303);
  const azione = String(d.get('azione') ?? '');
  if (azione === 'lavorata') {
    p.stato = 'lavorata';
    p.eventi.push({ ts: new Date().toISOString(), tipo: 'segnata-lavorata', chi: u });
    await salvaPratica(p);
    await registra('pratica-lavorata', { utente: u, pratica: p.id });
    return redirect(`/area-studio/pratica/${p.id}`, 303);
  }
  if (azione === 'elimina' && d.get('conferma') === p.codice) {
    await eliminaPratica(p);
    await registra('pratica-eliminata', { utente: u, pratica: p.id, codice: p.codice });
    return redirect('/area-studio?eliminata=1', 303);
  }
  return redirect(`/area-studio/pratica/${p.id}?errore=conferma`, 303);
};
