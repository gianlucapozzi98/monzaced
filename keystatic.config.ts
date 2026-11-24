/**
 * Pannello dei contenuti (Keystatic) — interfaccia in italiano.
 *
 * In locale (npm run dev) il pannello è su http://127.0.0.1:4321/keystatic
 * e salva direttamente i file in src/content/.
 * In produzione si usa la modalità GitHub (vedi README): ogni salvataggio
 * crea un commit e il sito si ripubblica da solo, senza interventi tecnici.
 */
import { config, collection, singleton, fields } from '@keystatic/core';

const GRUPPI = [
  { label: 'Famiglia', value: 'famiglia' },
  { label: 'Casa e patrimonio', value: 'casa' },
  { label: 'Dichiarazioni e agevolazioni', value: 'dichiarazioni' },
  { label: 'Lavoro', value: 'lavoro' },
  { label: 'Pensioni e previdenza', value: 'pensioni' },
  { label: 'Imprese e professionisti', value: 'imprese' },
] as const;

const SITUAZIONI = [
  { label: 'Famiglia', value: 'famiglia' },
  { label: 'Casa', value: 'casa' },
  { label: 'Lavoro', value: 'lavoro' },
  { label: 'Pensione', value: 'pensione' },
  { label: 'Impresa e Partita IVA', value: 'impresa' },
] as const;

const ICONE = [
  { label: 'Modulo / dichiarazione', value: 'modulo' },
  { label: 'Bilancia / indicatore', value: 'indicatore' },
  { label: 'Casa', value: 'casa' },
  { label: 'Chiave', value: 'chiave' },
  { label: 'Albero / successione', value: 'albero' },
  { label: 'Persone che si aiutano', value: 'aiuto' },
  { label: 'Porta / uscita', value: 'uscita' },
  { label: 'Scudo', value: 'scudo' },
  { label: 'Grafico / contabilità', value: 'grafico' },
  { label: 'Valigetta / partita IVA', value: 'valigetta' },
  { label: 'Ombrello / sostegno', value: 'ombrello' },
  { label: 'Carrozzina / nascita', value: 'nascita' },
  { label: 'Cuore / assegno', value: 'cuore' },
  { label: 'Frecce / ricalcolo', value: 'ricalcolo' },
  { label: 'Fiore / reversibilità', value: 'fiore' },
  { label: 'Clessidra / pensione', value: 'clessidra' },
  { label: 'Lente / estratto', value: 'lente' },
  { label: 'Mano / invalidità', value: 'mano' },
] as const;

const IMMAGINI = [
  { label: 'Coppia con documenti a casa', value: 'hero-documenti-casa' },
  { label: 'Famiglia sul divano', value: 'famiglia' },
  { label: 'Chiavi di casa', value: 'casa-chiavi' },
  { label: 'Documenti al tavolo della cucina', value: 'dichiarazioni' },
  { label: 'Lavoro alla scrivania', value: 'lavoro' },
  { label: 'Coppia di pensionati', value: 'pensioni' },
  { label: 'Titolare di un locale', value: 'imprese' },
  { label: 'Firma di un documento', value: 'dettaglio-firma' },
  { label: 'Telefonata con il portatile', value: 'consulenza-telefono' },
  { label: 'Villa Reale di Monza', value: 'monza-villa-reale' },
] as const;

const testoLungo = (label: string, description?: string) =>
  fields.text({
    label,
    description:
      description ??
      'Testo semplice. Riga vuota = nuovo paragrafo. Riga che inizia con "- " = punto elenco. **parola** = grassetto. [testo](indirizzo) = link.',
    multiline: true,
  });

const pulsante = (labelDefault: string, linkDefault: string) =>
  fields.object({
    testo: fields.text({ label: 'Testo del pulsante', defaultValue: labelDefault }),
    link: fields.text({ label: 'Link del pulsante', defaultValue: linkDefault }),
  });

export default config({
  locale: 'it-IT',
  // Questo file gira anche nel browser: si usano solo variabili PUBLIC_ (import.meta.env).
  storage:
    import.meta.env.PUBLIC_KEYSTATIC_STORAGE === 'github'
      ? {
          kind: 'github',
          repo: (import.meta.env.PUBLIC_KEYSTATIC_GITHUB_REPO ?? 'proprietario/monza-ced-sito') as `${string}/${string}`,
        }
      : { kind: 'local' },
  ui: {
    brand: { name: 'Monza CED — Testi del sito' },
    navigation: {
      'Servizi': ['servizi'],
      'Pagine': ['home', 'chiSiamo', 'contatti', 'convenzioni', 'faq'],
      'Notizie': ['notizie'],
      'Dati dello studio': ['impostazioni'],
      'Pagine legali': ['legale'],
      'Foto e crediti': ['immagini'],
    },
  },
  collections: {
    servizi: collection({
      label: 'Servizi',
      slugField: 'titolo',
      path: 'src/content/servizi/*',
      format: { data: 'yaml' },
      columns: ['titolo', 'gruppo'],
      schema: {
        titolo: fields.slug({
          name: {
            label: 'Nome breve del servizio',
            description: 'Usato nelle schede e nei menu (es. "Modello 730").',
            validation: { isRequired: true },
          },
          slug: {
            label: 'Indirizzo della pagina',
            description: 'Attenzione: cambiarlo rompe i link esistenti. Lasciare com\'è per i servizi già pubblicati.',
          },
        }),
        titoloPagina: fields.text({
          label: 'Titolo grande della pagina',
          description: 'Il titolo principale in cima alla pagina del servizio.',
          validation: { isRequired: true },
        }),
        riassunto: fields.text({
          label: 'Frase di riassunto',
          description: 'Una frase breve per le schede (massimo 140 caratteri).',
          validation: { length: { max: 140 } },
        }),
        gruppo: fields.select({ label: 'Area', options: [...GRUPPI], defaultValue: 'famiglia' }),
        situazioni: fields.multiselect({
          label: 'Situazioni ("Di cosa hai bisogno?")',
          description: 'Le pillole della home in cui compare questo servizio.',
          options: [...SITUAZIONI],
        }),
        icona: fields.select({ label: 'Icona', options: [...ICONE], defaultValue: 'modulo' }),
        immagine: fields.select({ label: 'Foto di testata', options: [...IMMAGINI], defaultValue: 'dichiarazioni' }),
        ordine: fields.integer({ label: 'Ordine nelle liste', defaultValue: 10 }),
        seo: fields.object(
          {
            titolo: fields.text({
              label: 'Titolo per Google (massimo 60 caratteri)',
              validation: { length: { max: 60 } },
            }),
            descrizione: fields.text({
              label: 'Descrizione per Google (massimo 155 caratteri)',
              multiline: true,
              validation: { length: { max: 155 } },
            }),
          },
          { label: 'Motori di ricerca' },
        ),
        introduzione: testoLungo('Introduzione'),
        perChi: fields.array(fields.text({ label: 'Voce' }), {
          label: 'Per chi è',
          itemLabel: (p) => p.value || 'Nuova voce',
        }),
        perChiNota: testoLungo('Per chi è — testo aggiuntivo (facoltativo)'),
        cosaFacciamo: fields.array(fields.text({ label: 'Voce', multiline: true }), {
          label: 'Cosa facciamo per te',
          itemLabel: (p) => p.value || 'Nuova voce',
        }),
        passaggi: fields.array(
          fields.object({
            titolo: fields.text({ label: 'Titolo del passaggio' }),
            testo: fields.text({ label: 'Spiegazione', multiline: true }),
          }),
          {
            label: 'Come funziona (passaggi in ordine)',
            description: 'Se vuoto, la pagina mostra i passaggi generali "Come iniziare".',
            itemLabel: (p) => p.fields.titolo.value || 'Nuovo passaggio',
          },
        ),
        documenti: fields.array(
          fields.object({
            voce: fields.text({ label: 'Documento' }),
            nota: fields.text({ label: 'Nota (facoltativa)' }),
          }),
          {
            label: 'Documenti da portare (checklist)',
            itemLabel: (p) => p.fields.voce.value || 'Nuovo documento',
          },
        ),
        documentiNota: testoLungo('Nota sotto la checklist (facoltativa)'),
        approfondimenti: fields.array(
          fields.object({
            titolo: fields.text({ label: 'Titolo' }),
            testo: testoLungo('Testo'),
          }),
          {
            label: 'Approfondimenti (sezioni informative)',
            itemLabel: (p) => p.fields.titolo.value || 'Nuova sezione',
          },
        ),
        faq: fields.array(
          fields.object({
            domanda: fields.text({ label: 'Domanda' }),
            risposta: testoLungo('Risposta'),
          }),
          { label: 'Domande frequenti', itemLabel: (p) => p.fields.domanda.value || 'Nuova domanda' },
        ),
        pulsanti: fields.object(
          {
            prenota: pulsante('Prenota una consulenza', '/prenota'),
            carica: pulsante('Carica i documenti', '#carica-documenti'),
          },
          { label: 'Pulsanti' },
        ),
        caricamentoAttivo: fields.checkbox({
          label: 'Mostra il blocco "Carica i documenti"',
          defaultValue: true,
        }),
        datiParticolari: fields.checkbox({
          label: 'I documenti possono contenere dati sanitari',
          description: 'Se attivo, il modulo di caricamento ricorda in modo esplicito il consenso per i dati relativi alla salute.',
          defaultValue: false,
        }),
        aggiornatoIl: fields.date({ label: 'Testo aggiornato il', validation: { isRequired: true } }),
        daCompletare: fields.array(fields.text({ label: 'Cosa manca' }), {
          label: 'Da completare con lo studio (promemoria interno)',
          description: 'Visibile solo in anteprima (riquadro tratteggiato). Non compare sul sito pubblicato.',
          itemLabel: (p) => p.value || 'Nuovo promemoria',
        }),
        fonte: fields.text({ label: 'Fonte del testo (nota interna)', multiline: true }),
      },
    }),

    notizie: collection({
      label: 'Notizie',
      slugField: 'titolo',
      path: 'src/content/notizie/*',
      format: { data: 'yaml' },
      schema: {
        titolo: fields.slug({ name: { label: 'Titolo', validation: { isRequired: true } } }),
        data: fields.date({ label: 'Data', validation: { isRequired: true } }),
        riassunto: fields.text({ label: 'Riassunto (massimo 155 caratteri)', validation: { length: { max: 155 } } }),
        testo: testoLungo('Testo'),
        pubblicata: fields.checkbox({ label: 'Pubblicata', defaultValue: false }),
      },
    }),

    legale: collection({
      label: 'Pagine legali',
      slugField: 'titolo',
      path: 'src/content/legale/*',
      format: { data: 'yaml' },
      schema: {
        titolo: fields.slug({ name: { label: 'Titolo', validation: { isRequired: true } } }),
        descrizione: fields.text({ label: 'Descrizione per Google', validation: { length: { max: 155 } } }),
        bozza: fields.checkbox({
          label: 'Bozza da far validare',
          description: 'Se attivo, in cima alla pagina compare l\'avviso "Testo in revisione".',
          defaultValue: true,
        }),
        aggiornatoIl: fields.date({ label: 'Ultimo aggiornamento' }),
        sezioni: fields.array(
          fields.object({ titolo: fields.text({ label: 'Titolo sezione' }), testo: testoLungo('Testo') }),
          { label: 'Sezioni', itemLabel: (p) => p.fields.titolo.value || 'Nuova sezione' },
        ),
      },
    }),

    immagini: collection({
      label: 'Foto e crediti',
      slugField: 'nome',
      path: 'src/content/immagini/*',
      format: { data: 'yaml' },
      columns: ['nome', 'autore'],
      schema: {
        nome: fields.slug({ name: { label: 'Nome del file (senza .jpg)' } }),
        descrizione: fields.text({ label: 'Testo alternativo (cosa si vede)', multiline: true }),
        autore: fields.text({ label: 'Autore' }),
        fonte: fields.text({ label: 'Sito di provenienza (es. Unsplash)' }),
        urlFonte: fields.url({ label: 'Pagina della foto' }),
        licenza: fields.text({ label: 'Licenza' }),
        urlLicenza: fields.url({ label: 'Testo della licenza' }),
        tipo: fields.select({
          label: 'Tipo',
          options: [
            { label: 'Foto di stock (non sono persone dello studio)', value: 'stock' },
            { label: 'Foto vera dello studio (con consenso)', value: 'reale' },
          ],
          defaultValue: 'stock',
        }),
      },
    }),
  },

  singletons: {
    impostazioni: singleton({
      label: 'Dati dello studio',
      path: 'src/content/impostazioni',
      format: { data: 'yaml' },
      schema: {
        ragioneSociale: fields.text({ label: 'Ragione sociale' }),
        indirizzo: fields.text({ label: 'Indirizzo (via e numero)' }),
        cap: fields.text({ label: 'CAP' }),
        citta: fields.text({ label: 'Città' }),
        provincia: fields.text({ label: 'Provincia (sigla)' }),
        telefono: fields.text({ label: 'Telefono (come si legge)' }),
        telefonoLink: fields.text({ label: 'Telefono (per il link, es. +39039326628)' }),
        email: fields.text({ label: 'Email' }),
        pec: fields.text({ label: 'PEC', description: 'Lasciare vuoto finché non è confermata: compare un segnaposto.' }),
        partitaIva: fields.text({ label: 'Partita IVA' }),
        rea: fields.text({ label: 'Numero REA', description: 'Lasciare vuoto finché non è confermato: compare un segnaposto.' }),
        capitaleSociale: fields.text({ label: 'Capitale sociale' }),
        orari: fields.array(
          fields.object({ giorni: fields.text({ label: 'Giorni' }), ore: fields.text({ label: 'Orario' }) }),
          { label: 'Orari di apertura', itemLabel: (p) => `${p.fields.giorni.value} ${p.fields.ore.value}` },
        ),
        facebook: fields.url({ label: 'Pagina Facebook' }),
        linkedin: fields.url({ label: 'Pagina LinkedIn' }),
        profiloGoogle: fields.url({ label: 'Profilo Google (facoltativo)' }),
        mappaLat: fields.text({ label: 'Mappa: latitudine' }),
        mappaLon: fields.text({ label: 'Mappa: longitudine' }),
        ctaPrenota: pulsante('Prenota una consulenza', '/prenota'),
        ctaCarica: pulsante('Carica i documenti', '/carica-documenti'),
      },
    }),

    home: singleton({
      label: 'Home',
      path: 'src/content/home',
      format: { data: 'yaml' },
      schema: {
        seoTitolo: fields.text({ label: 'Titolo per Google', validation: { length: { max: 60 } } }),
        seoDescrizione: fields.text({ label: 'Descrizione per Google', multiline: true, validation: { length: { max: 155 } } }),
        occhiello: fields.text({ label: 'Testo sopra il titolo' }),
        titolo: fields.text({ label: 'Titolo grande', description: 'Metti tra asterischi la parte in corsivo blu: Le tue pratiche, *in mani sicure.*' }),
        sottotitolo: fields.text({ label: 'Sottotitolo', multiline: true }),
        fraseApertura: fields.text({ label: 'Frase che compare quando la "porta" si apre', multiline: true }),
        domanda: fields.text({ label: 'Domanda delle pillole' }),
        domandaSotto: fields.text({ label: 'Testo sotto la domanda', multiline: true }),
        fascia: fields.array(fields.text({ label: 'Parola' }), { label: 'Fascia scorrevole', itemLabel: (p) => p.value }),
        valoriTitolo: fields.text({ label: 'Come lavoriamo — titolo' }),
        valori: fields.array(
          fields.object({ titolo: fields.text({ label: 'Titolo' }), testo: fields.text({ label: 'Testo', multiline: true }) }),
          { label: 'Valori', itemLabel: (p) => p.fields.titolo.value },
        ),
        passiTitolo: fields.text({ label: 'Passi — titolo' }),
        passi: fields.array(
          fields.object({ titolo: fields.text({ label: 'Titolo' }), testo: fields.text({ label: 'Testo', multiline: true }) }),
          { label: 'Passi (sequenza reale)', itemLabel: (p) => p.fields.titolo.value },
        ),
        caricaTitolo: fields.text({ label: 'Blocco "Carica i documenti" — titolo' }),
        caricaTesto: fields.text({ label: 'Blocco "Carica i documenti" — testo', multiline: true }),
        chiSiamoTitolo: fields.text({ label: 'Chi siamo — titolo' }),
        chiSiamoTesto: testoLungo('Chi siamo — testo'),
        faqTitolo: fields.text({ label: 'Domande frequenti — titolo' }),
        chiusuraTitolo: fields.text({ label: 'Chiusura — titolo' }),
        chiusuraTesto: fields.text({ label: 'Chiusura — testo', multiline: true }),
      },
    }),

    chiSiamo: singleton({
      label: 'Chi siamo',
      path: 'src/content/chi-siamo',
      format: { data: 'yaml' },
      schema: {
        seoTitolo: fields.text({ label: 'Titolo per Google', validation: { length: { max: 60 } } }),
        seoDescrizione: fields.text({ label: 'Descrizione per Google', multiline: true, validation: { length: { max: 155 } } }),
        titolo: fields.text({ label: 'Titolo' }),
        sottotitolo: fields.text({ label: 'Sottotitolo' }),
        testo: testoLungo('L\'azienda'),
        valori: fields.array(
          fields.object({ titolo: fields.text({ label: 'Titolo' }), testo: fields.text({ label: 'Testo', multiline: true }) }),
          { label: 'Valori', itemLabel: (p) => p.fields.titolo.value },
        ),
        servizi: testoLungo('I nostri servizi'),
        colfTitolo: fields.text({ label: 'Riquadro colf e badanti — titolo' }),
        colfTesto: fields.text({ label: 'Riquadro colf e badanti — testo', multiline: true }),
        team: fields.array(
          fields.object({
            nome: fields.text({ label: 'Nome e cognome' }),
            ruolo: fields.text({ label: 'Ruolo' }),
            consenso: fields.checkbox({ label: 'Ho il consenso scritto alla pubblicazione', defaultValue: false }),
          }),
          {
            label: 'Persone dello studio (solo con consenso)',
            description: 'Compare solo chi ha il consenso. Nessuna foto di stock va usata per le persone.',
            itemLabel: (p) => p.fields.nome.value || 'Nuova persona',
          },
        ),
      },
    }),

    contatti: singleton({
      label: 'Contatti e prenotazione',
      path: 'src/content/contatti',
      format: { data: 'yaml' },
      schema: {
        titolo: fields.text({ label: 'Titolo pagina Contatti' }),
        testo: fields.text({ label: 'Testo pagina Contatti', multiline: true }),
        prenotaTitolo: fields.text({ label: 'Titolo pagina Prenota' }),
        prenotaTesto: fields.text({ label: 'Testo pagina Prenota', multiline: true }),
        caricaTitolo: fields.text({ label: 'Titolo pagina Carica i documenti' }),
        caricaTesto: fields.text({ label: 'Testo pagina Carica i documenti', multiline: true }),
        conferma: fields.text({ label: 'Messaggio dopo l\'invio di una richiesta', multiline: true }),
      },
    }),

    convenzioni: singleton({
      label: 'Convenzioni e offerte',
      path: 'src/content/convenzioni',
      format: { data: 'yaml' },
      schema: {
        pubblicata: fields.checkbox({
          label: 'Pagina pubblicata',
          description: 'Attivare solo quando ci sono offerte vere, con condizioni e durata.',
          defaultValue: false,
        }),
        titolo: fields.text({ label: 'Titolo' }),
        introduzione: testoLungo('Introduzione'),
        offerte: fields.array(
          fields.object({
            titolo: fields.text({ label: 'Nome della convenzione/offerta' }),
            descrizione: testoLungo('Descrizione'),
            condizioni: testoLungo('Condizioni (obbligatorie)'),
            validaDal: fields.date({ label: 'Valida dal' }),
            validaAl: fields.date({ label: 'Valida fino al' }),
          }),
          { label: 'Offerte', itemLabel: (p) => p.fields.titolo.value || 'Nuova offerta' },
        ),
      },
    }),

    faq: singleton({
      label: 'Domande frequenti (home)',
      path: 'src/content/faq',
      format: { data: 'yaml' },
      schema: {
        domande: fields.array(
          fields.object({ domanda: fields.text({ label: 'Domanda' }), risposta: testoLungo('Risposta') }),
          { label: 'Domande', itemLabel: (p) => p.fields.domanda.value },
        ),
      },
    }),
  },
});
