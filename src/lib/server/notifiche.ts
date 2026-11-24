/**
 * Notifiche allo studio. Contengono solo il codice, il servizio e il link all'area riservata:
 * MAI documenti allegati e mai il contenuto dei file.
 */
import { mkdir, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { cfg } from './config';

export interface Notifica { oggetto: string; testo: string }

export async function notifica(n: Notifica): Promise<void> {
  const c = cfg();
  if (c.notifiche === 'smtp') {
    const nodemailer = await import('nodemailer');
    const t = nodemailer.createTransport({
      host: c.smtp.host, port: c.smtp.porta, secure: c.smtp.sicuro,
      auth: c.smtp.utente ? { user: c.smtp.utente, pass: c.smtp.password } : undefined,
      requireTLS: !c.smtp.sicuro,
    });
    await t.sendMail({ from: c.notificaDa, to: c.notificaA, subject: n.oggetto, text: n.testo });
    return;
  }
  if (c.notifiche === 'prova-file' && c.prova) {
    const dir = resolve('.data/posta-di-prova');
    await mkdir(dir, { recursive: true });
    await writeFile(join(dir, `${Date.now()}.json`), JSON.stringify({ a: c.notificaA || 'studio@prova', ...n }, null, 2));
    return;
  }
  throw new Error('Notifiche non configurate');
}
