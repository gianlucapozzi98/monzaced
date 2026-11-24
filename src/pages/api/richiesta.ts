import type { APIRoute } from 'astro';
import { cfg, statoModuli } from '@/lib/server/config';
import { json, corpoJson, testo, emailValida, telefonoValido, type Errori } from '@/lib/server/http';
import { consentito, ipCliente } from '@/lib/server/limiti';
import { gettoneValido } from '@/lib/server/modulo';
import { impronta } from '@/lib/server/firma';
import { notifica } from '@/lib/server/notifiche';
import { salvaRichiesta, registra, nuovoCodice, nuovoId, scadenzaDa, type Richiesta } from '@/lib/server/pratiche';
import { getServizio } from '@/lib/content';

export const prerender = false;

/** Prenotazione di una consulenza o messaggio di contatto. Conferma solo se salvato e notificato davvero. */
export const POST: APIRoute = async ({ request, clientAddress }) => {
  const c = cfg();
  if (!statoModuli(c).attivo) return json({ errore: 'non-attivo' }, 503);
  const ip = ipCliente(request, clientAddress, c.fidatiProxy);
  if (!consentito(`richiesta:${ip}`, Number(process.env.LIMITE_RICHIESTE_10MIN) || 5, 10 * 60_000)) return json({ errore: 'troppe-richieste' }, 429, { 'retry-after': '600' });
  const b = await corpoJson(request);
  if (!b) return json({ errore: 'richiesta-non-valida' }, 400);
  if (testo(b.sito_web, 200)) return json({ errore: 'richiesta-non-valida' }, 400);
  if (!gettoneValido(b.gettone)) return json({ errore: 'gettone' }, 400);

  const tipo = b.tipo === 'contatto' ? 'contatto' : 'prenota';
  const errori: Errori = {};
  const nome = testo(b.nome, 120);
  if (nome.length < 3) errori.nome = 'Scrivi nome e cognome.';
  const telefono = testo(b.telefono, 30);
  const email = testo(b.email, 160);
  if (tipo === 'prenota' && !telefonoValido(telefono)) errori.telefono = 'Scrivi un numero di telefono valido.';
  if (tipo === 'contatto' && !telefonoValido(telefono) && !emailValida(email)) errori.telefono = 'Lasciaci almeno un telefono o un\'email validi.';
  if (telefono && !telefonoValido(telefono) && tipo === 'contatto' && emailValida(email)) errori.telefono = 'Il numero di telefono non sembra corretto.';
  if (email && !emailValida(email)) errori.email = 'L\'indirizzo email non sembra corretto.';
  const slug = testo(b.servizio, 120);
  const servizio = slug ? getServizio(slug) : undefined;
  if (slug && !servizio && slug !== 'altro') errori.servizio = 'Scegli un servizio dall\'elenco.';
  const messaggio = testo(b.messaggio, 2000);
  if (tipo === 'contatto' && messaggio.length < 5) errori.messaggio = 'Scrivi il tuo messaggio.';
  if (b.consenso !== true) errori.consenso = 'Serve la conferma di aver letto l\'informativa.';
  if (Object.keys(errori).length) return json({ errore: 'validazione', errori }, 422);

  const ora = new Date();
  const r: Richiesta = {
    id: nuovoId(), codice: nuovoCodice(ora).replace('MC-', tipo === 'prenota' ? 'PR-' : 'CT-'), tipo, creata: ora.toISOString(),
    scadenza: scadenzaDa(c.conservazioneGiorni || 365, ora),
    nome, telefono, email, servizio: servizio?.titolo ?? (slug === 'altro' ? 'Altro' : ''),
    profilo: b.profilo === 'azienda' ? 'Azienda' : b.profilo === 'privato' ? 'Privato' : '',
    preferenza: ({ mattina: 'Mattina', pomeriggio: 'Pomeriggio', indifferente: 'Indifferente' } as Record<string, string>)[b.preferenza] ?? '',
    messaggio, consenso: ora.toISOString(), origine: impronta(ip), stato: 'nuova', prova: c.prova || undefined,
  };
  try {
    await salvaRichiesta(r);
    await notifica({
      oggetto: `${tipo === 'prenota' ? 'Richiesta di consulenza' : 'Nuovo messaggio'}: ${r.codice}${r.servizio ? ` – ${r.servizio}` : ''}`,
      testo: [
        tipo === 'prenota' ? 'Nuova richiesta di consulenza dal sito.' : 'Nuovo messaggio dal modulo contatti.',
        '',
        `Codice: ${r.codice}`,
        `Nome: ${r.nome}`,
        r.telefono && `Telefono: ${r.telefono}`,
        r.email && `Email: ${r.email}`,
        r.servizio && `Servizio: ${r.servizio}`,
        r.profilo && `Profilo: ${r.profilo}`,
        r.preferenza && `Preferenza di orario: ${r.preferenza}`,
        r.messaggio && `\nMessaggio:\n${r.messaggio}`,
        '',
        `Area riservata: ${c.sito}/area-studio`,
      ].filter(Boolean).join('\n'),
    });
  } catch (e) {
    console.error('[richiesta] non salvata o non notificata', e);
    return json({ errore: 'invio-non-riuscito' }, 502);
  }
  await registra('richiesta-ricevuta', { richiesta: r.id, tipo });
  return json({ codice: r.codice });
};
