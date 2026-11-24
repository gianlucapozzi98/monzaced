/**
 * Lettura dei contenuti modificati dal pannello (file YAML in src/content).
 * I file vengono inclusi nel bundle al momento della build: le pagine pubbliche
 * e le API leggono sempre la stessa versione, senza accedere al disco.
 */
import { load } from 'js-yaml';

type Raw = Record<string, string>;
const rawServizi = import.meta.glob('/src/content/servizi/*.yaml', { query: '?raw', import: 'default', eager: true }) as Raw;
const rawNotizie = import.meta.glob('/src/content/notizie/*.yaml', { query: '?raw', import: 'default', eager: true }) as Raw;
const rawLegale = import.meta.glob('/src/content/legale/*.yaml', { query: '?raw', import: 'default', eager: true }) as Raw;
const rawImmagini = import.meta.glob('/src/content/immagini/*.yaml', { query: '?raw', import: 'default', eager: true }) as Raw;
const rawSingle = import.meta.glob('/src/content/*.yaml', { query: '?raw', import: 'default', eager: true }) as Raw;

const slugOf = (path: string) => path.split('/').pop()!.replace(/\.yaml$/, '');
const parse = <T>(src: string): T => (load(src) ?? {}) as T;
const asDate = (v: unknown): string => {
  if (v instanceof Date) return v.toISOString().slice(0, 10);
  return typeof v === 'string' ? v : '';
};
const arr = <T>(v: T[] | null | undefined): T[] => (Array.isArray(v) ? v : []);
const str = (v: unknown): string => (v == null ? '' : String(v));

export type Gruppo = 'famiglia' | 'casa' | 'dichiarazioni' | 'lavoro' | 'pensioni' | 'imprese';
export type Situazione = 'famiglia' | 'casa' | 'lavoro' | 'pensione' | 'impresa';

export const GRUPPI: Record<Gruppo, { nome: string; breve: string; ordine: number }> = {
  famiglia: { nome: 'Famiglia', breve: 'Famiglia', ordine: 1 },
  casa: { nome: 'Casa e patrimonio', breve: 'Casa', ordine: 2 },
  dichiarazioni: { nome: 'Dichiarazioni e agevolazioni', breve: 'Dichiarazioni', ordine: 3 },
  lavoro: { nome: 'Lavoro', breve: 'Lavoro', ordine: 4 },
  pensioni: { nome: 'Pensioni e previdenza', breve: 'Pensioni', ordine: 5 },
  imprese: { nome: 'Imprese e professionisti', breve: 'Imprese', ordine: 6 },
};

export const SITUAZIONI: { id: Situazione; nome: string }[] = [
  { id: 'famiglia', nome: 'Famiglia' },
  { id: 'casa', nome: 'Casa' },
  { id: 'lavoro', nome: 'Lavoro' },
  { id: 'pensione', nome: 'Pensione' },
  { id: 'impresa', nome: 'Impresa e Partita IVA' },
];

export interface Pulsante { testo: string; link: string }
export interface Servizio {
  slug: string;
  titolo: string;
  titoloPagina: string;
  riassunto: string;
  gruppo: Gruppo;
  situazioni: Situazione[];
  icona: string;
  immagine: string;
  ordine: number;
  seo: { titolo: string; descrizione: string };
  introduzione: string;
  perChi: string[];
  perChiNota: string;
  cosaFacciamo: string[];
  passaggi: { titolo: string; testo: string }[];
  documenti: { voce: string; nota: string }[];
  documentiNota: string;
  approfondimenti: { titolo: string; testo: string }[];
  faq: { domanda: string; risposta: string }[];
  pulsanti: { prenota: Pulsante; carica: Pulsante };
  caricamentoAttivo: boolean;
  datiParticolari: boolean;
  aggiornatoIl: string;
  daCompletare: string[];
}

function normalizzaServizio(slug: string, d: any): Servizio {
  return {
    slug,
    titolo: str(d.titolo),
    titoloPagina: str(d.titoloPagina || d.titolo),
    riassunto: str(d.riassunto),
    gruppo: (d.gruppo ?? 'famiglia') as Gruppo,
    situazioni: arr(d.situazioni) as Situazione[],
    icona: str(d.icona || 'modulo'),
    immagine: str(d.immagine || 'dichiarazioni'),
    ordine: Number(d.ordine ?? 99),
    seo: { titolo: str(d.seo?.titolo), descrizione: str(d.seo?.descrizione) },
    introduzione: str(d.introduzione),
    perChi: arr(d.perChi).map(str).filter(Boolean),
    perChiNota: str(d.perChiNota),
    cosaFacciamo: arr(d.cosaFacciamo).map(str).filter(Boolean),
    passaggi: arr<any>(d.passaggi).map((p) => ({ titolo: str(p?.titolo), testo: str(p?.testo) })).filter((p) => p.titolo),
    documenti: arr<any>(d.documenti).map((p) => ({ voce: str(p?.voce), nota: str(p?.nota) })).filter((p) => p.voce),
    documentiNota: str(d.documentiNota),
    approfondimenti: arr<any>(d.approfondimenti).map((p) => ({ titolo: str(p?.titolo), testo: str(p?.testo) })).filter((p) => p.titolo || p.testo),
    faq: arr<any>(d.faq).map((p) => ({ domanda: str(p?.domanda), risposta: str(p?.risposta) })).filter((p) => p.domanda),
    pulsanti: {
      prenota: { testo: str(d.pulsanti?.prenota?.testo) || 'Prenota una consulenza', link: str(d.pulsanti?.prenota?.link) || `/prenota?servizio=${slug}` },
      carica: { testo: str(d.pulsanti?.carica?.testo) || 'Carica i documenti', link: str(d.pulsanti?.carica?.link) || '#carica-documenti' },
    },
    caricamentoAttivo: d.caricamentoAttivo !== false,
    datiParticolari: d.datiParticolari === true,
    aggiornatoIl: asDate(d.aggiornatoIl),
    daCompletare: arr(d.daCompletare).map(str).filter(Boolean),
  };
}

const servizi: Servizio[] = Object.entries(rawServizi)
  .map(([p, src]) => normalizzaServizio(slugOf(p), parse<any>(src)))
  .sort((a, b) => a.ordine - b.ordine || a.titolo.localeCompare(b.titolo, 'it'));

export const getServizi = (): Servizio[] => servizi;
export const getServizio = (slug: string): Servizio | undefined => servizi.find((s) => s.slug === slug);

const single = (name: string): any => parse<any>(rawSingle[`/src/content/${name}.yaml`] ?? '');

export interface Impostazioni {
  ragioneSociale: string; indirizzo: string; cap: string; citta: string; provincia: string;
  telefono: string; telefonoLink: string; email: string; pec: string; partitaIva: string; rea: string;
  capitaleSociale: string; orari: { giorni: string; ore: string }[];
  facebook: string; linkedin: string; profiloGoogle: string; mappaLat: string; mappaLon: string;
  ctaPrenota: Pulsante; ctaCarica: Pulsante;
}
const imp = single('impostazioni');
export const impostazioni: Impostazioni = {
  ragioneSociale: str(imp.ragioneSociale), indirizzo: str(imp.indirizzo), cap: str(imp.cap), citta: str(imp.citta),
  provincia: str(imp.provincia), telefono: str(imp.telefono), telefonoLink: str(imp.telefonoLink), email: str(imp.email),
  pec: str(imp.pec), partitaIva: str(imp.partitaIva), rea: str(imp.rea), capitaleSociale: str(imp.capitaleSociale),
  orari: arr<any>(imp.orari).map((o) => ({ giorni: str(o?.giorni), ore: str(o?.ore) })),
  facebook: str(imp.facebook), linkedin: str(imp.linkedin), profiloGoogle: str(imp.profiloGoogle),
  mappaLat: str(imp.mappaLat), mappaLon: str(imp.mappaLon),
  ctaPrenota: { testo: str(imp.ctaPrenota?.testo) || 'Prenota una consulenza', link: str(imp.ctaPrenota?.link) || '/prenota' },
  ctaCarica: { testo: str(imp.ctaCarica?.testo) || 'Carica i documenti', link: str(imp.ctaCarica?.link) || '/carica-documenti' },
};

export const home = single('home') as {
  seoTitolo: string; seoDescrizione: string; occhiello: string; titolo: string; sottotitolo: string;
  fraseApertura: string; domanda: string; domandaSotto: string; fascia: string[];
  valoriTitolo: string; valori: { titolo: string; testo: string }[];
  passiTitolo: string; passi: { titolo: string; testo: string }[];
  caricaTitolo: string; caricaTesto: string; chiSiamoTitolo: string; chiSiamoTesto: string;
  faqTitolo: string; chiusuraTitolo: string; chiusuraTesto: string;
};
export const chiSiamo = single('chi-siamo') as {
  seoTitolo: string; seoDescrizione: string; titolo: string; sottotitolo: string; testo: string;
  valori: { titolo: string; testo: string }[]; servizi: string; colfTitolo: string; colfTesto: string;
  team: { nome: string; ruolo: string; consenso: boolean }[];
};
export const contatti = single('contatti') as {
  titolo: string; testo: string; prenotaTitolo: string; prenotaTesto: string;
  caricaTitolo: string; caricaTesto: string; conferma: string;
};
export const faqHome = arr<any>(single('faq').domande).map((d) => ({ domanda: str(d?.domanda), risposta: str(d?.risposta) }));

const conv = single('convenzioni');
export const convenzioni = {
  pubblicata: conv.pubblicata === true && arr(conv.offerte).length > 0,
  titolo: str(conv.titolo) || 'Convenzioni e offerte',
  introduzione: str(conv.introduzione),
  offerte: arr<any>(conv.offerte).map((o) => ({
    titolo: str(o?.titolo), descrizione: str(o?.descrizione), condizioni: str(o?.condizioni),
    validaDal: asDate(o?.validaDal), validaAl: asDate(o?.validaAl),
  })),
};

export interface PaginaLegale { slug: string; titolo: string; descrizione: string; bozza: boolean; aggiornatoIl: string; sezioni: { titolo: string; testo: string }[] }
export const getLegale = (slug: string): PaginaLegale | undefined => {
  const src = rawLegale[`/src/content/legale/${slug}.yaml`];
  if (!src) return undefined;
  const d = parse<any>(src);
  return {
    slug, titolo: str(d.titolo), descrizione: str(d.descrizione), bozza: d.bozza !== false, aggiornatoIl: asDate(d.aggiornatoIl),
    sezioni: arr<any>(d.sezioni).map((s) => ({ titolo: str(s?.titolo), testo: str(s?.testo) })),
  };
};

export interface Notizia { slug: string; titolo: string; data: string; riassunto: string; testo: string }
export const getNotizie = (): Notizia[] =>
  Object.entries(rawNotizie)
    .map(([p, src]) => ({ slug: slugOf(p), d: parse<any>(src) }))
    .filter(({ d }) => d.pubblicata === true)
    .map(({ slug, d }) => ({ slug, titolo: str(d.titolo), data: asDate(d.data), riassunto: str(d.riassunto), testo: str(d.testo) }))
    .sort((a, b) => b.data.localeCompare(a.data));

export interface Credito { nome: string; descrizione: string; autore: string; fonte: string; urlFonte: string; licenza: string; urlLicenza: string; tipo: string }
export const getImmagini = (): Credito[] =>
  Object.entries(rawImmagini).map(([p, src]) => {
    const d = parse<any>(src);
    return {
      nome: slugOf(p), descrizione: str(d.descrizione), autore: str(d.autore), fonte: str(d.fonte),
      urlFonte: str(d.urlFonte), licenza: str(d.licenza), urlLicenza: str(d.urlLicenza), tipo: str(d.tipo || 'stock'),
    };
  });

/** In anteprima (default) i contenuti mancanti compaiono come segnaposto evidenti. */
export const MOSTRA_SEGNAPOSTO = import.meta.env.PUBLIC_MOSTRA_SEGNAPOSTO !== 'false';

export const formatData = (iso: string): string => {
  if (!iso) return '';
  const d = new Date(iso + 'T12:00:00');
  return d.toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' });
};
