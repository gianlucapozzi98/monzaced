/**
 * Accesso all'area riservata dello studio.
 * Utenti in UTENTI_STUDIO, separati da virgola: "nome:scrypt$<sale>$<hash>[:<segreto TOTP base32>]"
 * (le righe si generano con `npm run hash-password`). La password non è mai salvata in chiaro.
 * Sessione: cookie firmato, HttpOnly, SameSite=Strict, durata 8 ore.
 */
import { scryptSync, timingSafeEqual, createHmac } from 'node:crypto';
import type { AstroCookies } from 'astro';
import { cfg } from './config';
import { firma, verifica } from './firma';

export const COOKIE = 'mced_studio';
const DURATA_MS = 8 * 60 * 60 * 1000;

interface Utente { nome: string; sale: string; hash: string; totp?: string }
function utenti(): Utente[] {
  return cfg().utentiStudio.split(',').map((r) => r.trim()).filter(Boolean).map((r) => {
    const [nome, pw, totp] = r.split(':');
    const [, sale, hash] = (pw ?? '').split('$');
    return { nome, sale, hash, totp };
  }).filter((u) => u.nome && u.sale && u.hash);
}

export function hashPassword(password: string, sale: string) {
  return scryptSync(password.normalize('NFKC'), Buffer.from(sale, 'base64url'), 64, { N: 16384, r: 8, p: 1 }).toString('base64url');
}

function base32(s: string): Buffer {
  const A = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let bits = '';
  for (const ch of s.replace(/=+$/, '').toUpperCase()) { const v = A.indexOf(ch); if (v >= 0) bits += v.toString(2).padStart(5, '0'); }
  const out = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) out.push(parseInt(bits.slice(i, i + 8), 2));
  return Buffer.from(out);
}
export function codiceTotp(segreto: string, t = Date.now()): string {
  const contatore = Buffer.alloc(8);
  contatore.writeBigUInt64BE(BigInt(Math.floor(t / 30000)));
  const h = createHmac('sha1', base32(segreto)).update(contatore).digest();
  const o = h[h.length - 1] & 0xf;
  const n = ((h[o] & 0x7f) << 24) | (h[o + 1] << 16) | (h[o + 2] << 8) | h[o + 3];
  return String(n % 1_000_000).padStart(6, '0');
}

export function verificaCredenziali(nome: string, password: string, otp: string): { ok: boolean; serveOtp?: boolean } {
  const u = utenti().find((x) => x.nome === nome);
  // Confronto sempre eseguito, anche se l'utente non esiste (stessi tempi di risposta)
  const atteso = Buffer.from(u?.hash ?? 'x'.repeat(86), 'base64url');
  const calcolato = Buffer.from(hashPassword(password, u?.sale ?? 'c2FsZQ'), 'base64url');
  const passOk = !!u && atteso.length === calcolato.length && timingSafeEqual(atteso, calcolato);
  if (!passOk) return { ok: false };
  if (u!.totp) {
    if (!otp) return { ok: false, serveOtp: true };
    const ora = Date.now();
    const valido = [-30000, 0, 30000].some((d) => codiceTotp(u!.totp!, ora + d) === otp.replace(/\s/g, ''));
    if (!valido) return { ok: false, serveOtp: true };
  }
  return { ok: true };
}

export function apriSessione(cookies: AstroCookies, nome: string, https: boolean) {
  const token = firma({ u: nome, e: Date.now() + DURATA_MS }, 'sessione');
  cookies.set(COOKIE, token, { httpOnly: true, secure: https, sameSite: 'strict', path: '/', maxAge: DURATA_MS / 1000 });
}
export function chiudiSessione(cookies: AstroCookies) {
  cookies.delete(COOKIE, { path: '/' });
}
export function utenteSessione(cookies: AstroCookies): string | null {
  if (cfg().segreto.length < 32) return null;
  const d = verifica<{ u: string; e: number }>(cookies.get(COOKIE)?.value, 'sessione');
  if (!d || d.e < Date.now()) return null;
  return utenti().some((x) => x.nome === d.u) ? d.u : null;
}
