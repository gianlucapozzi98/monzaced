/**
 * Controllo antivirus.
 *  - "clamd": protocollo INSTREAM di ClamAV (servizio clamd, di solito sullo stesso server o in un container).
 *  - "prova-eicar": SOLO per test (MODALITA_PROVA=1). Riconosce solo il file di prova standard EICAR.
 */
import { createConnection } from 'node:net';
import { cfg } from './config';

export interface Esito { pulito: boolean; firma?: string; motore: string }

export async function scansiona(dati: Uint8Array): Promise<Esito> {
  const c = cfg();
  if (c.antivirus === 'clamd') return clamd(dati, c.clamd.host, c.clamd.porta, c.clamd.timeoutMs);
  if (c.antivirus === 'prova-eicar' && c.prova) {
    const t = Buffer.from(dati).toString('latin1');
    const infetto = t.includes('EICAR-STANDARD-ANTIVIRUS-TEST-FILE');
    return { pulito: !infetto, firma: infetto ? 'Eicar-Test-Signature' : undefined, motore: 'prova-eicar' };
  }
  throw new Error('Antivirus non configurato');
}

export function clamd(dati: Uint8Array, host: string, porta: number, timeoutMs: number): Promise<Esito> {
  return new Promise((ok, ko) => {
    const s = createConnection({ host, port: porta });
    const parti: Buffer[] = [];
    const t = setTimeout(() => { s.destroy(); ko(new Error('Timeout antivirus')); }, timeoutMs);
    s.on('error', (e) => { clearTimeout(t); ko(e); });
    s.on('data', (d) => parti.push(Buffer.isBuffer(d) ? d : Buffer.from(d)));
    s.on('end', () => {
      clearTimeout(t);
      const r = Buffer.concat(parti).toString('utf8').replace(/\0/g, '').trim();
      if (/:\s*OK$/.test(r)) return ok({ pulito: true, motore: 'clamd' });
      const m = r.match(/:\s*(.+)\s+FOUND$/);
      if (m) return ok({ pulito: false, firma: m[1], motore: 'clamd' });
      ko(new Error(`Risposta antivirus inattesa: ${r.slice(0, 120)}`));
    });
    s.on('connect', () => {
      s.write('zINSTREAM\0');
      const buf = Buffer.from(dati);
      const PEZZO = 64 * 1024;
      for (let i = 0; i < buf.length; i += PEZZO) {
        const pezzo = buf.subarray(i, i + PEZZO);
        const len = Buffer.alloc(4);
        len.writeUInt32BE(pezzo.length, 0);
        s.write(len);
        s.write(pezzo);
      }
      s.end(Buffer.alloc(4));
    });
  });
}

/** Il contenuto corrisponde davvero al tipo dichiarato? (controllo dei "numeri magici") */
export function tipoReale(dati: Uint8Array): 'application/pdf' | 'image/jpeg' | 'image/png' | null {
  const b = Buffer.from(dati.subarray(0, 1024));
  if (b.subarray(0, 1024).toString('latin1').trimStart().startsWith('%PDF-')) return 'application/pdf';
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return 'image/jpeg';
  if (b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return 'image/png';
  return null;
}
