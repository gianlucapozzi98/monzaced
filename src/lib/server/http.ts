/** Piccoli aiuti per le API: risposte JSON, lettura sicura del corpo, validazione. */
export const json = (dati: unknown, status = 200, extra: Record<string, string> = {}) =>
  new Response(JSON.stringify(dati), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', 'x-robots-tag': 'noindex', ...extra },
  });

export async function corpoJson<T = any>(request: Request, maxByte = 32 * 1024): Promise<T | null> {
  const ct = request.headers.get('content-type') ?? '';
  if (!ct.includes('application/json')) return null;
  const testo = await request.text();
  if (testo.length > maxByte) return null;
  try { return JSON.parse(testo) as T; } catch { return null; }
}

export const testo = (v: unknown, max: number) => (typeof v === 'string' ? v.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').trim().slice(0, max) : '');
export const emailValida = (e: string) => /^[^\s@]{1,64}@[^\s@]{1,190}\.[^\s@]{2,24}$/.test(e);
export const telefonoValido = (t: string) => /^[+()\d\s./-]{6,30}$/.test(t) && (t.match(/\d/g)?.length ?? 0) >= 6;

export type Errori = Record<string, string>;
