/** Dati strutturati schema.org con i soli dati reali (nessuna valutazione o recensione). */
import { impostazioni as s, type Servizio } from './content';
import { piano } from './testo';

const base = (site?: URL) => (site ?? new URL('https://monzaced.it')).origin;

export function schemaStudio(site?: URL) {
  const url = base(site);
  // Orari ricavati dal testo del pannello: "9:30–13:00 e 14:00–18:00"
  const GIORNI = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const NOMI = ['luned', 'marted', 'mercoled', 'gioved', 'venerd', 'sabat', 'domenic'];
  const orari = s.orari.flatMap((o) => {
    const g = o.giorni.toLowerCase();
    const idx = NOMI.map((n, i) => (g.includes(n) ? i : -1)).filter((i) => i >= 0);
    const giorni = idx.length === 2 && /[–-]/.test(g) ? GIORNI.slice(idx[0], idx[1] + 1) : idx.map((i) => GIORNI[i]);
    const fasce = [...o.ore.matchAll(/(\d{1,2})[:.](\d{2})\s*[–-]\s*(\d{1,2})[:.](\d{2})/g)];
    return fasce.map((f) => ({ '@type': 'OpeningHoursSpecification', dayOfWeek: giorni, opens: `${f[1].padStart(2, '0')}:${f[2]}`, closes: `${f[3].padStart(2, '0')}:${f[4]}` }));
  });
  return {
    '@context': 'https://schema.org',
    '@type': ['ProfessionalService', 'LocalBusiness'],
    '@id': `${url}/#studio`,
    name: 'Monza CED',
    legalName: s.ragioneSociale,
    url,
    logo: `${url}/apple-touch-icon.png`,
    image: `${url}/og/monza-ced.jpg`,
    telephone: s.telefonoLink,
    email: s.email,
    vatID: `IT${s.partitaIva}`,
    address: { '@type': 'PostalAddress', streetAddress: s.indirizzo, postalCode: s.cap, addressLocality: s.citta, addressRegion: s.provincia, addressCountry: 'IT' },
    ...(s.mappaLat ? { geo: { '@type': 'GeoCoordinates', latitude: Number(s.mappaLat), longitude: Number(s.mappaLon) } } : {}),
    ...(orari.length ? { openingHoursSpecification: orari } : {}),
    areaServed: { '@type': 'City', name: 'Monza' },
    sameAs: [s.facebook, s.linkedin].filter(Boolean),
  };
}

export function schemaFaq(voci: { domanda: string; risposta: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: voci.map((v) => ({ '@type': 'Question', name: v.domanda, acceptedAnswer: { '@type': 'Answer', text: piano(v.risposta) } })),
  };
}

export function schemaServizio(x: Servizio, site?: URL) {
  const url = base(site);
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: x.titoloPagina,
    serviceType: x.titolo,
    description: x.seo.descrizione || x.riassunto,
    url: `${url}/servizi/${x.slug}`,
    areaServed: { '@type': 'City', name: 'Monza' },
    provider: { '@id': `${url}/#studio` },
  };
}

export function schemaBriciole(voci: { nome: string; url: string }[], site?: URL) {
  const url = base(site);
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: voci.map((v, i) => ({ '@type': 'ListItem', position: i + 1, name: v.nome, item: `${url}${v.url}` })),
  };
}
