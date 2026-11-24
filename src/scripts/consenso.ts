/** Memoria del consenso (archiviazione locale, strumento tecnico). Validità 6 mesi. */
export interface Consenso { v: number; data: string; esterni: boolean }
const CHIAVE = 'mced-consenso';
const VERSIONE = 1;
const SEI_MESI = 182 * 24 * 60 * 60 * 1000;

export function leggiConsenso(): Consenso | null {
  try {
    const raw = localStorage.getItem(CHIAVE);
    if (!raw) return null;
    const c = JSON.parse(raw) as Consenso;
    if (c.v !== VERSIONE || Date.now() - new Date(c.data).getTime() > SEI_MESI) return null;
    return c;
  } catch {
    return null;
  }
}

export function salvaConsenso(scelte: { esterni: boolean }) {
  const c: Consenso = { v: VERSIONE, data: new Date().toISOString(), ...scelte };
  try { localStorage.setItem(CHIAVE, JSON.stringify(c)); } catch { /* archiviazione non disponibile */ }
  window.dispatchEvent(new CustomEvent('consenso-cambiato', { detail: c }));
}
