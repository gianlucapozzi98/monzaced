import type { APIRoute } from 'astro';
import { chiudiSessione, utenteSessione } from '@/lib/server/accesso';
import { registra } from '@/lib/server/pratiche';
export const prerender = false;
export const POST: APIRoute = async ({ cookies, redirect }) => {
  const u = utenteSessione(cookies);
  chiudiSessione(cookies);
  if (u) await registra('uscita', { utente: u });
  return redirect('/area-studio/accesso', 303);
};
