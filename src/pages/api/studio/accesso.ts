import type { APIRoute } from 'astro';
import { verificaCredenziali, apriSessione } from '@/lib/server/accesso';
import { cfg } from '@/lib/server/config';
import { consentito, ipCliente } from '@/lib/server/limiti';
import { registra } from '@/lib/server/pratiche';
import { impronta } from '@/lib/server/firma';

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies, clientAddress, redirect, url }) => {
  const c = cfg();
  const ip = ipCliente(request, clientAddress, c.fidatiProxy);
  const dati = await request.formData();
  const utente = String(dati.get('utente') ?? '').trim().slice(0, 60);
  const password = String(dati.get('password') ?? '').slice(0, 200);
  const otp = String(dati.get('otp') ?? '').slice(0, 10);
  if (!consentito(`accesso:${ip}`, 5, 15 * 60_000) || !consentito(`accesso-u:${utente}`, 8, 15 * 60_000)) {
    await registra('accesso-bloccato', { utente, origine: impronta(ip) });
    return redirect('/area-studio/accesso?errore=troppi', 303);
  }
  if (c.segreto.length < 32) return redirect('/area-studio/accesso', 303);
  const esito = verificaCredenziali(utente, password, otp);
  if (!esito.ok) {
    await registra('accesso-fallito', { utente, origine: impronta(ip) });
    return redirect(`/area-studio/accesso?errore=credenziali${esito.serveOtp ? '&otp=1' : ''}`, 303);
  }
  apriSessione(cookies, utente, url.protocol === 'https:');
  await registra('accesso', { utente, origine: impronta(ip) });
  return redirect('/area-studio', 303);
};
