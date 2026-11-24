/**
 * Archivio privato dei documenti.
 *  - "s3": bucket S3-compatibile PRIVATO in UE. Il browser carica con URL firmati a scadenza breve;
 *          cifratura lato server (SSE) imposta su ogni oggetto. Nessun link pubblico.
 *  - "locale": cartella sul server, ogni file cifrato con AES-256-GCM (chiave in ARCHIVIO_LOCALE_CHIAVE).
 *          Il "link firmato" punta a /api/upload/put/<gettone> sul nostro server.
 */
import { AwsClient } from 'aws4fetch';
import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';
import { mkdir, readFile, writeFile, rm, readdir, rename, stat } from 'node:fs/promises';
import { dirname, join, resolve, sep } from 'node:path';
import { cfg, type Config } from './config';
import { firma } from './firma';

export interface CaricamentoFirmato { url: string; metodo: 'PUT'; intestazioni: Record<string, string> }

export interface Archivio {
  urlCaricamento(chiave: string, tipo: string, maxByte: number, scadenzaSec: number): Promise<CaricamentoFirmato>;
  dimensione(chiave: string): Promise<number | null>;
  leggi(chiave: string): Promise<Uint8Array | null>;
  scrivi(chiave: string, dati: Uint8Array | string, tipo: string): Promise<void>;
  sposta(da: string, a: string): Promise<void>;
  elimina(chiave: string): Promise<void>;
  elenca(prefisso: string): Promise<string[]>;
  /** Per lo scaricamento dall'area riservata: URL temporaneo (S3) oppure null (lo serve il nostro server). */
  urlLettura(chiave: string, nomeFile: string, scadenzaSec: number): Promise<string | null>;
}

const chiaveSicura = (k: string) => {
  if (!/^[a-zA-Z0-9/_.-]+$/.test(k) || k.includes('..') || k.startsWith('/')) throw new Error('Chiave non valida');
  return k;
};

/* ------------------------------- S3 ------------------------------- */
class ArchivioS3 implements Archivio {
  private aws: AwsClient;
  constructor(private c: Config['s3']) {
    this.aws = new AwsClient({ accessKeyId: c.chiave, secretAccessKey: c.segreto, service: 's3', region: c.regione });
  }
  private url(k: string) {
    return `${this.c.endpoint}/${this.c.bucket}/${chiaveSicura(k).split('/').map(encodeURIComponent).join('/')}`;
  }
  private sseHeaders(): Record<string, string> {
    return this.c.sse && this.c.sse !== 'none' ? { 'x-amz-server-side-encryption': this.c.sse } : {};
  }
  async urlCaricamento(k: string, tipo: string, _max: number, scad: number): Promise<CaricamentoFirmato> {
    const u = new URL(this.url(k));
    u.searchParams.set('X-Amz-Expires', String(scad));
    const intestazioni = { 'content-type': tipo, ...this.sseHeaders() };
    const req = await this.aws.sign(u.toString(), { method: 'PUT', headers: intestazioni, aws: { signQuery: true, allHeaders: true } });
    return { url: req.url, metodo: 'PUT', intestazioni };
  }
  async dimensione(k: string) {
    const r = await this.aws.fetch(this.url(k), { method: 'HEAD' });
    if (r.status === 404) return null;
    if (!r.ok) throw new Error(`S3 HEAD ${r.status}`);
    return Number(r.headers.get('content-length') ?? -1);
  }
  async leggi(k: string) {
    const r = await this.aws.fetch(this.url(k));
    if (r.status === 404) return null;
    if (!r.ok) throw new Error(`S3 GET ${r.status}`);
    return new Uint8Array(await r.arrayBuffer());
  }
  async scrivi(k: string, dati: Uint8Array | string, tipo: string) {
    const body = typeof dati === 'string' ? dati : Buffer.from(dati);
    const r = await this.aws.fetch(this.url(k), { method: 'PUT', body, headers: { 'content-type': tipo, ...this.sseHeaders() } });
    if (!r.ok) throw new Error(`S3 PUT ${r.status}`);
  }
  async sposta(da: string, a: string) {
    const r = await this.aws.fetch(this.url(a), {
      method: 'PUT',
      headers: { 'x-amz-copy-source': `/${this.c.bucket}/${chiaveSicura(da)}`, ...this.sseHeaders() },
    });
    if (!r.ok) throw new Error(`S3 COPY ${r.status}`);
    await this.elimina(da);
  }
  async elimina(k: string) {
    const r = await this.aws.fetch(this.url(k), { method: 'DELETE' });
    if (!r.ok && r.status !== 404) throw new Error(`S3 DELETE ${r.status}`);
  }
  async elenca(prefisso: string) {
    const out: string[] = [];
    let token = '';
    do {
      const u = new URL(`${this.c.endpoint}/${this.c.bucket}`);
      u.searchParams.set('list-type', '2');
      u.searchParams.set('prefix', prefisso);
      if (token) u.searchParams.set('continuation-token', token);
      const r = await this.aws.fetch(u.toString());
      if (!r.ok) throw new Error(`S3 LIST ${r.status}`);
      const xml = await r.text();
      for (const m of xml.matchAll(/<Key>([^<]+)<\/Key>/g)) out.push(m[1].replace(/&amp;/g, '&'));
      token = /<IsTruncated>true<\/IsTruncated>/.test(xml) ? (xml.match(/<NextContinuationToken>([^<]+)</)?.[1] ?? '') : '';
    } while (token);
    return out;
  }
  async urlLettura(k: string, nome: string, scad: number) {
    const u = new URL(this.url(k));
    u.searchParams.set('X-Amz-Expires', String(scad));
    u.searchParams.set('response-content-disposition', `attachment; filename="${nome.replace(/[^\w.\- ]/g, '_')}"`);
    const req = await this.aws.sign(u.toString(), { method: 'GET', aws: { signQuery: true } });
    return req.url;
  }
}

/* ----------------------------- Locale ----------------------------- */
const MAGIA = Buffer.from('MCE1');
class ArchivioLocale implements Archivio {
  private base: string;
  private chiave: Buffer;
  constructor(c: Config['locale']) {
    this.base = resolve(c.cartella);
    this.chiave = Buffer.from(c.chiave, 'base64');
  }
  private percorso(k: string) {
    const p = resolve(join(this.base, chiaveSicura(k)));
    if (!p.startsWith(this.base + sep)) throw new Error('Percorso non valido');
    return p;
  }
  cifra(dati: Uint8Array): Buffer {
    const iv = randomBytes(12);
    const c = createCipheriv('aes-256-gcm', this.chiave, iv);
    const enc = Buffer.concat([c.update(dati), c.final()]);
    return Buffer.concat([MAGIA, iv, c.getAuthTag(), enc]);
  }
  decifra(buf: Buffer): Uint8Array {
    if (!buf.subarray(0, 4).equals(MAGIA)) throw new Error('File non cifrato o danneggiato');
    const iv = buf.subarray(4, 16), tag = buf.subarray(16, 32);
    const d = createDecipheriv('aes-256-gcm', this.chiave, iv);
    d.setAuthTag(tag);
    return new Uint8Array(Buffer.concat([d.update(buf.subarray(32)), d.final()]));
  }
  async urlCaricamento(k: string, tipo: string, max: number, scad: number): Promise<CaricamentoFirmato> {
    const t = firma({ k, t: tipo, m: max, e: Date.now() + scad * 1000 }, 'put');
    return { url: `/api/upload/put/${t}`, metodo: 'PUT', intestazioni: { 'content-type': tipo } };
  }
  async dimensione(k: string) {
    const d = await this.leggi(k);
    return d ? d.byteLength : null;
  }
  async leggi(k: string) {
    try { return this.decifra(await readFile(this.percorso(k))); } catch (e: any) { if (e?.code === 'ENOENT') return null; throw e; }
  }
  async scrivi(k: string, dati: Uint8Array | string, _tipo: string) {
    const p = this.percorso(k);
    await mkdir(dirname(p), { recursive: true, mode: 0o700 });
    const tmp = `${p}.${randomBytes(4).toString('hex')}.tmp`;
    await writeFile(tmp, this.cifra(typeof dati === 'string' ? Buffer.from(dati) : dati), { mode: 0o600 });
    await rename(tmp, p);
  }
  async sposta(da: string, a: string) {
    const pa = this.percorso(a);
    await mkdir(dirname(pa), { recursive: true, mode: 0o700 });
    await rename(this.percorso(da), pa);
  }
  async elimina(k: string) { await rm(this.percorso(k), { force: true }); }
  async elenca(prefisso: string) {
    const out: string[] = [];
    const giro = async (dir: string, rel: string) => {
      let voci: string[] = [];
      try { voci = await readdir(dir); } catch { return; }
      for (const v of voci) {
        const p = join(dir, v), r = rel ? `${rel}/${v}` : v;
        if ((await stat(p)).isDirectory()) await giro(p, r);
        else if (!v.endsWith('.tmp')) out.push(r);
      }
    };
    await giro(this.base, '');
    return out.filter((k) => k.startsWith(prefisso)).sort();
  }
  async urlLettura() { return null; }
}

let istanza: { firma: string; a: Archivio } | null = null;
export function archivio(): Archivio {
  const c = cfg();
  const f = JSON.stringify([c.archivio, c.s3, c.locale]);
  if (istanza?.firma === f) return istanza.a;
  const a = c.archivio === 's3' ? new ArchivioS3(c.s3) : new ArchivioLocale(c.locale);
  istanza = { firma: f, a };
  return a;
}
