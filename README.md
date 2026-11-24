# Monza CED — sito

Sito di **Monza CED Srl** (Via Solferino 11, Monza): 18 servizi spiegati ognuno nella sua pagina, percorso "Di cosa hai bisogno?", **Prenota una consulenza** e **Carica i documenti** con archivio privato, antivirus e codice pratica.

- Concept e analisi dei riferimenti: [CONCEPT.md](CONCEPT.md)
- Scelte fatte e motivi: [DECISIONI.md](DECISIONI.md)
- Foto, autori e licenze: [IMMAGINI.md](IMMAGINI.md)
- Screenshot e report Lighthouse: cartella [verifica/](verifica/)

---

## 1. Cosa serve ancora dal cliente

**Dati e identità**
- [ ] **REA** e **PEC** (nel footer compaiono come "da completare": sono obbligatori, art. 2250 c.c.).
- [ ] Conferma del **capitale sociale** (€ 10.000,00 i.v., dal vecchio footer) con la visura.
- [ ] **Logo** in vettoriale ufficiale e colori ufficiali (usato quello del vecchio sito, `monza-ced.svg`).
- [ ] Conferma degli **orari** (presi dalla pagina Contatti del vecchio sito: lun–ven 9:30–13:00 e 14:00–18:00) e delle coordinate della mappa.
- [ ] Anno di fondazione, se si vuole citarlo (oggi il testo dice solo "da anni").

**Foto**
- [ ] Foto e video veri dello studio e del team, **con consenso scritto** delle persone ritratte. Fino ad allora: foto di stock, mai presentate come lo studio (vedi IMMAGINI.md).

**Contenuti dei servizi** (visibili come riquadri arancioni "Da completare" in anteprima)
- [ ] **Elenchi documenti** mancanti: IMU, Pensioni, Estratto contributivo, Contabilità, Partita IVA, INAIL/CU/770.
- [ ] Elenco documenti **730 aggiornato** all'anno in corso (quello del vecchio sito era per il 730/2024) e date di presentazione dell'anno.
- [ ] Elenco documenti **ISEE aggiornato** (il PDF del vecchio sito è un volantino di terzi con dati 2022).
- [ ] **Passaggi specifici** dei servizi che non li hanno (oggi mostrano i passi generali "Come iniziare").
- [ ] **Verifica delle norme** riportate dal vecchio sito e probabilmente superate:
  - NASpI: requisito dei "30 giorni di lavoro nell'anno precedente" (abolito dal 2022) e requisiti successivi;
  - Maternità: indennità del congedo parentale "30% per sei mesi" (cambiata dal 2023);
  - ANF per i nuclei con figli (sostituito dall'Assegno Unico dal 2022);
  - Successioni: aliquote e franchigie; IMU: scadenze;
  - Dimissioni: il vecchio testo parlava di "consulenza legale";
  - Invalidità/assegno sociale: percorso per l'assegno sociale.
- [ ] Conferma delle **situazioni** associate a ogni servizio nelle pillole (Famiglia, Casa, Lavoro, Pensione, Impresa).
- [ ] Conferma della **rimozione di "Rilascio SPID e firma digitale"** e del redirect; dire se lo studio aiuta ancora con l'accesso al portale INPS (tolto dal testo dell'Estratto contributivo).

**Accreditamenti**
- [ ] **CAF, Patronato, albi professionali**: quali esistono e per quali servizi (oggi non ne citiamo nessuno). Rapporto con **CAAF Confesercenti** (il cui logo compare nel PDF ISEE del vecchio sito).
- [ ] "Convenzioni e offerte": solo se esistono, con condizioni e durata.

**Caricamento documenti e privacy**
- [ ] **Periodo di conservazione** dei documenti caricati (`CONSERVAZIONE_GIORNI`), delle richieste e del registro.
- [ ] **Chi riceve** le notifiche (email) e **chi accede** all'area riservata (nomi utente, verifica in due passaggi sì/no).
- [ ] Tipi e dimensioni dei file ammessi (oggi PDF/JPG/PNG, 10 file, 15 MB).
- [ ] Fornitori: hosting, archivio S3 in UE, email (vanno nominati responsabili del trattamento e scritti nell'informativa).
- [ ] **DPIA** e registro dei trattamenti con il consulente privacy (documenti con dati sanitari e di minori).
- [ ] Il vecchio modulo con "Allegati": dove salva oggi i file? Vanno cancellati o migrati?
- [ ] Prenotazioni: va bene "lo studio richiama" o c'è un gestionale/calendario da collegare?

**Pannello dei testi**
- [ ] Chi aggiorna i testi (persone e account GitHub per il pannello in produzione).

---

## 2. Testi legali: sono BOZZE

Da far validare allo studio e al suo consulente/legale prima della pubblicazione. Ognuna mostra in pagina l'avviso "Testo in revisione" finché nel pannello resta spuntato "Bozza".

| Pagina | Stato | Cosa manca |
|---|---|---|
| `/privacy` (art. 13 GDPR) | bozza | PEC, DPO (se nominato), fornitori, tempi di conservazione, nota DPIA da togliere |
| `/cookie` | bozza | verifica finale dopo la scelta dell'hosting |
| `/termini` | bozza | validazione del legale, legge e foro |
| `/accessibilita` | bozza | limiti noti dopo una prova con utenti reali |

Anche i testi del sito (titolo dell'hero "Le tue pratiche, *in mani sicure.*", valori, FAQ, passi) sono **bozze da approvare**: sono tutti nel pannello.

---

## 3. Come si aggiornano i testi (per lo studio)

Tutti i testi si cambiano dal **pannello**, senza toccare il codice.

- **In locale**: `npm run dev`, poi apri **http://127.0.0.1:4321/keystatic**. Ogni pagina ha anche il pulsante "✎ Modifica questa pagina" in basso a destra.
- **In produzione**: il pannello è su `/keystatic` con accesso tramite GitHub (vedi §5.6). Ogni "Salva" crea una versione e il sito si ripubblica da solo in 1–2 minuti.

Sezioni del pannello:

| Sezione | Cosa contiene |
|---|---|
| **Servizi** | Una scheda per servizio, sempre con gli stessi campi: nome breve, titolo, frase per le schede, area, situazioni (pillole), icona, foto, Google (titolo ≤ 60, descrizione ≤ 155), introduzione, per chi è, cosa facciamo, passaggi, **documenti da portare** (la checklist del caricamento), approfondimenti, domande frequenti, testo e link dei pulsanti, data di aggiornamento, promemoria "da completare". **Nuovo servizio = "Aggiungi"**: la pagina, la scheda in home, la ricerca e la sitemap si creano da sole. |
| **Home** | Titolo (le parole tra `*asterischi*` diventano corsivo blu), sottotitolo, frase della "porta", domanda delle pillole, fascia scorrevole, valori, passi, testi di caricamento, chi siamo, chiusura. |
| **Chi siamo**, **Contatti e prenotazione**, **Domande frequenti** | Testi delle rispettive pagine. "Persone dello studio" compare solo con la spunta del consenso. |
| **Convenzioni e offerte** | Pagina spenta finché non si spunta "Pubblicata" e si aggiunge almeno un'offerta con condizioni. |
| **Notizie** | Le notizie compaiono (con la voce nel menu) solo se almeno una è "Pubblicata". |
| **Dati dello studio** | Indirizzo, telefono, email, PEC, P.IVA, REA, capitale, **orari**, social, coordinate mappa, testo e link dei due pulsanti principali. Cambiati qui, cambiano in tutto il sito. |
| **Pagine legali** | Privacy, cookie, termini, accessibilità (a sezioni). |
| **Foto e crediti** | Testo alternativo, autore e licenza di ogni foto (genera la pagina /crediti). |

Scrittura nei campi di testo lungo: **riga vuota** = nuovo paragrafo · riga che inizia con `- ` = punto elenco · `**parola**` = grassetto · `[testo](indirizzo)` = link. Non serve altro.

> Attenzione: non cambiare l'"Indirizzo della pagina" dei servizi esistenti (romperebbe i link e Google).

---

## 4. Sviluppo

Requisiti: **Node 22.23+ (consigliato 24 LTS)**.

```bash
npm install
```

```bash
npm run dev
```

| Comando | Cosa fa |
|---|---|
| `npm run dev` | sito + pannello in locale (http://127.0.0.1:4321) |
| `npm run build` | controlla i contenuti (YAML), i tipi e crea `dist/` |
| `npm start` | avvia il sito pubblicato (`server.mjs`, legge `.env`) |
| `npm test` | test di caricamento, moduli e pubblicazione (serve il sito avviato in modalità di prova) |
| `npm run contenuti` | controlla che i file dei contenuti siano validi |
| `npm run hash-password -- nome [--totp]` | crea un utente per l'area riservata |
| `npm run genera-chiave` | genera una chiave casuale (segreti, cifratura locale) |
| `npm run purge` | cancella subito i dati scaduti sul server avviato |
| `npm run icone` | rigenera favicon e immagine di condivisione dal logo |

Struttura: `src/content/` (testi del pannello, YAML) · `src/pages/` (pagine e API) · `src/components/` · `src/lib/server/` (archivio, antivirus, notifiche, accesso, pratiche) · `src/scripts/` (movimento, percorso, caricamento, moduli, consenso) · `tests/` · `deploy/`.

### Test in locale (modalità di prova)
Nel file `.env` di prova (non incluso nel progetto): `ARCHIVIO_DRIVER=locale` con chiave, `ANTIVIRUS_DRIVER=prova-eicar`, `NOTIFICHE_DRIVER=prova-file`, `MODALITA_PROVA=1`, `CONSERVAZIONE_GIORNI`, `SEGRETO_APP`, `UTENTI_STUDIO`, `MANUTENZIONE_TOKEN`. Poi:

```bash
npm run build:veloce && npm start
```

```bash
npm test
```

Le notifiche di prova finiscono in `.data/posta-di-prova/`, i file cifrati in `.data/archivio/`.

---

## 5. Messa in produzione

### 5.0 Pubblicazione su Vercel
Il progetto si pubblica anche su Vercel collegando il repository GitHub: in build Vercel imposta `VERCEL=1` e il sito usa l'**adapter Vercel** (pagine statiche + funzioni per le API). Senza adapter Vercel servirebbe la cartella `dist/` come sito statico e la radice darebbe **404**.
- `vercel.json`: funzioni nella regione **fra1 (Francoforte, UE)**, intestazioni di sicurezza, `noindex` su tutti i domini `*.vercel.app` (le anteprime non finiscono su Google), pulizia automatica giornaliera (Cron alle 3:00).
- Variabili da impostare su Vercel (Project → Settings → Environment Variables), come in `.env.example`: `SITE_URL`, `SEGRETO_APP`, `ARCHIVIO_DRIVER=s3` e `S3_*`, `ANTIVIRUS_DRIVER=clamd` con `CLAMD_HOST`/`CLAMD_PORT`, `NOTIFICHE_DRIVER=smtp` e `SMTP_*`, `NOTIFICA_DA`, `NOTIFICA_A`, `UTENTI_STUDIO`, `CONSERVAZIONE_GIORNI`, `PUBLIC_MOSTRA_SEGNAPOSTO=false`, e **`CRON_SECRET`** (almeno 24 caratteri) per la pulizia.
- Su Vercel l'**archivio locale non funziona** (disco di sola lettura): serve S3. **ClamAV non gira su Vercel**: serve un servizio clamd raggiungibile in rete (per esempio un piccolo server in UE). Finché manca, il caricamento resta in modalità sicura.
- I limiti anti-abuso sono in memoria e valgono per singola istanza: su Vercel sono più deboli.

### 5.1 Variabili
Copiare `.env.example` in `.env` e compilare. **Senza** archivio, antivirus, notifiche, `SEGRETO_APP`, `UTENTI_STUDIO` e `CONSERVAZIONE_GIORNI` il caricamento resta in **modalità sicura** (messaggio onesto con telefono e indirizzo; nessun file accettato). L'area riservata elenca cosa manca.

In **build** servono: `SITE_URL` (canonical, sitemap, domini ammessi), `S3_ENDPOINT` (va nella CSP), `PUBLIC_MOSTRA_SEGNAPOSTO=false`.

### 5.2 Archivio dei documenti (S3 privato in UE)
1. Bucket in una regione **UE**, **accesso pubblico bloccato**, versioning facoltativo, cifratura di default attiva.
2. Utente tecnico con permessi **solo su quel bucket**: `s3:PutObject`, `s3:GetObject`, `s3:DeleteObject`, `s3:ListBucket`.
3. CORS: vedi `deploy/s3-cors.json` (solo PUT dal dominio del sito).
4. Ogni caricamento richiede `x-amz-server-side-encryption: AES256` (impostabile con `S3_SSE`).

### 5.3 Antivirus
ClamAV (`clamd`) sulla stessa macchina o in un container: `deploy/docker-compose.yml` avvia sito + `clamav/clamav`. Senza antivirus raggiungibile i file **non** vengono accettati.

### 5.4 Email di notifica
SMTP di un fornitore (preferibilmente UE). Le email contengono solo codice, servizio e link all'area riservata.

### 5.5 Area riservata dello studio
`https://monzaced.it/area-studio` — utenti creati con `npm run hash-password -- nome --totp` (consigliata la verifica in due passaggi). Lì: elenco pratiche e richieste, scaricamento dei file (registrato), "segna come lavorata", eliminazione definitiva, registro eventi.

### 5.6 Pannello in produzione (GitHub)
1. Codice in un repository GitHub privato collegato a un servizio di pubblicazione automatica (o a una pipeline che esegue `npm run build` e riavvia il sito).
2. `PUBLIC_KEYSTATIC_STORAGE=github` e `PUBLIC_KEYSTATIC_GITHUB_REPO=proprietario/repo` in build; al primo accesso a `/keystatic` Keystatic guida nella creazione della GitHub App (`KEYSTATIC_GITHUB_CLIENT_ID`, `KEYSTATIC_GITHUB_CLIENT_SECRET`, `KEYSTATIC_SECRET`).
3. Con il pannello attivo in produzione la CSP a hash di Astro viene disattivata (l'interfaccia del pannello usa stili inline): resta la CSP di base di `server.mjs`. In alternativa si pubblica il pannello su un'istanza separata.

### 5.7 HTTPS, redirect e intestazioni
Davanti al sito un proxy HTTPS (esempio: `deploy/Caddyfile.esempio`): http→https e www→senza www con **301**. `TRUST_PROXY=1`, `HSTS=1`. Il redirect `/servizi/rilascio-spid-firma-digitale` → `/servizi` (301) è nel sito; tutti gli altri URL dei servizi sono **identici** a quelli del vecchio sito.

### 5.8 Cosa NON è stato provato in questo ambiente
Dichiarato apertamente:
- **ClamAV reale**: provato il protocollo con un finto server ClamAV nei test e l'antivirus di prova EICAR; non un'installazione vera di ClamAV (Docker assente).
- **S3 reale**: la firma degli URL e le chiamate sono implementate (aws4fetch) ma non provate contro un fornitore; i test hanno usato l'archivio locale cifrato.
- **SMTP reale**: provate solo le notifiche "di prova" su file.
- **Docker e Caddy**: file forniti ma non eseguiti.
- **Pannello in modalità GitHub**: provata solo la modalità locale (modifica → file → sito).
- **Limiti di richieste**: in memoria, validi per un solo processo (con più istanze serve Redis).

---

## 6. Verifica (24/11/2026)

| Controllo | Esito |
|---|---|
| Build (`astro check` + `astro build`) | 0 errori |
| Test automatici (`npm test`) | **24/24**: file valido, file non valido (contenuto falso), tipo non ammesso, troppo grande, più grande del dichiarato, **antivirus** (EICAR e protocollo ClamAV), consensi, trappola anti-robot, gettone, area riservata, moduli, sitemap, SPID assente, redirect 301, meta ≤ 60/155 unici, **link rotti**, dati societari, CTA, dati strutturati, robots, 404 e intestazioni |
| Lighthouse mobile (4G simulato, server locale) | home, servizi, 730, carica-documenti, chi-siamo, contatti: **Performance 100 · Accessibilità 100 · Best Practices 100 · SEO 100**, LCP 0,8 s, CLS ≤ 0,001 (report in `verifica/lighthouse/`) |
| Screenshot 1440 e 390 px, anche "riduci movimento" | `verifica/screenshot/`; nessuno scorrimento orizzontale a 390 px, nessun errore in console |
| Cookie | nessuna richiesta a terzi prima del consenso; mappa solo dopo il sì; "Preferenze cookie" dal footer |
| Riduci movimento | niente Lenis, niente caricamento iniziale, hero statico, fascia ferma, tutto visibile |
| Caricamento dall'interfaccia | checklist, anteprima, errori per campo, avanzamento, conferma con codice; file cifrati su disco (AES-256-GCM); notifica senza dati |
| Area riservata | password errata respinta, CSRF bloccato (403), cookie HttpOnly, scaricamento registrato |
| Pannello | modifica di un testo dal pannello → file aggiornato → visibile sul sito (poi ripristinato) |

Lighthouse su server locale: i valori reali dipenderanno da hosting e rete (attesi comunque sopra le soglie grazie a CSS in linea, compressione e immagini AVIF/WebP).
