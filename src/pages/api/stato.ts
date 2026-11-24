import type { APIRoute } from 'astro';
import { cfg, statoCaricamento, statoModuli } from '@/lib/server/config';
import { json } from '@/lib/server/http';
import { nuovoGettone } from '@/lib/server/modulo';

export const prerender = false;

/** Dice al sito se caricamento e moduli funzionano davvero. Non espone i motivi tecnici. */
export const GET: APIRoute = () => {
  const c = cfg();
  const car = statoCaricamento(c);
  const mod = statoModuli(c);
  if (!car.attivo || !mod.attivo) console.warn('[stato] modalità sicura:', [...car.motivi, ...mod.motivi].join('; '));
  return json({
    caricamento: { attivo: car.attivo, maxFile: c.maxFile, maxMB: c.maxMB, tipi: c.tipi, prova: c.prova },
    moduli: { attivo: mod.attivo, prova: c.prova },
    gettone: c.segreto.length >= 32 ? nuovoGettone() : null,
  });
};
