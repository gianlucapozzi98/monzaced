/** Gettone anti-abuso dei moduli: rilasciato da /api/stato, valido da 3 secondi a 2 ore dopo. */
import { firma, verifica } from './firma';
export const nuovoGettone = () => firma({ t: Date.now() }, 'modulo');
export function gettoneValido(g: unknown): boolean {
  const d = verifica<{ t: number }>(typeof g === 'string' ? g : '', 'modulo');
  if (!d) return false;
  const eta = Date.now() - d.t;
  return eta >= 3000 && eta <= 2 * 60 * 60 * 1000;
}
