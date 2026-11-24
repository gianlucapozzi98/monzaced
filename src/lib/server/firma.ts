/** Gettoni firmati (HMAC-SHA256) per moduli, caricamenti e sessioni. */
import { createHmac, timingSafeEqual, randomBytes, createHash } from 'node:crypto';
import { cfg } from './config';

const b64u = (b: Buffer | string) => Buffer.from(b).toString('base64url');

export function firma<T extends object>(dati: T, scopo: string): string {
  const corpo = b64u(JSON.stringify(dati));
  const mac = createHmac('sha256', cfg().segreto).update(`${scopo}.${corpo}`).digest('base64url');
  return `${corpo}.${mac}`;
}

export function verifica<T>(token: string | null | undefined, scopo: string): T | null {
  if (!token || typeof token !== 'string' || token.length > 4096) return null;
  const [corpo, mac] = token.split('.');
  if (!corpo || !mac) return null;
  const atteso = createHmac('sha256', cfg().segreto).update(`${scopo}.${corpo}`).digest();
  const dato = Buffer.from(mac, 'base64url');
  if (dato.length !== atteso.length || !timingSafeEqual(dato, atteso)) return null;
  try {
    return JSON.parse(Buffer.from(corpo, 'base64url').toString('utf8')) as T;
  } catch {
    return null;
  }
}

export const casuale = (n = 16) => randomBytes(n).toString('base64url');
/** Impronta dell'IP (non si salva l'IP in chiaro nei dati della pratica). */
export const impronta = (s: string) => createHash('sha256').update(`${cfg().segreto}|${s}`).digest('hex').slice(0, 24);
