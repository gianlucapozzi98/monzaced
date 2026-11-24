# Direzione artistica — Monza CED (Monza)

Centro di Elaborazione Dati · assistenza fiscale e amministrativa per cittadini, professionisti e aziende
Sito attuale: https://monzaced.it/ · Reference: https://altufanulu.com/en/ e https://recruit.financial-create.co.jp/
Idea: **un percorso, non un elenco**. Il sito prende per mano chi arriva ("di cosa hai bisogno?"), spiega ogni servizio in una pagina sua e porta a due azioni: **prenotare una consulenza** e **caricare i documenti**. Professionale, ma morbido, articolato e curvo, mai "sportello".

> Metodo: parte **FISSO** (non si tocca) e parte **SPUNTO** (seme da superare). Code scrive prima `CONCEPT.md` con tre concept più audaci, ne sceglie uno e **procede fino in fondo senza fermarsi a ogni sezione**; le scelte vanno annotate in `DECISIONI.md`, e il resoconto con gli screenshot arriva alla fine.

---

## 1. Fatti verificati e cose da chiarire

**Dal sito attuale (letto il 23/11/2026):**
- **Monza CED Srl**, Via Solferino 11, 20900 Monza (MB). Tel. **+39 039 326628**. Email **ingresso@monzaced.it**. **P.IVA 12488810966**. Capitale sociale **€ 10.000,00 i.v.** (dal footer). PEC, REA, orari: non indicati.
- Claim: "Affidati all'esperienza di professionisti per un servizio affidabile e aggiornato alle ultime normative"; "La nostra priorità è farti sentire tranquillo". Nessuna data di fondazione, nessun nome del team, nessuna accreditazione dichiarata (CAF e Patronato compaiono solo come opzioni nel modulo).
- Social: Facebook (facebook.com/monzaced) e LinkedIn (company/monzaced). Privacy e cookie policy nel footer. Funzione "Cerca" (/cerca).
- **Modulo "risposta rapida"**: nome, cognome, città, telefono, email, Privato/Azienda, attività richieste (CAF, Contabilità, Patronato, Altro), consenso dati, **"Allegati" con "Aggiungi un altro file"**: oggi gli allegati sono solo nel modulo generale, non nelle pagine dei servizi.
- **Servizi attuali (19 pagine, URL esistenti):** Modello ISEE, Modello 730, Successioni, IMU, Contratti locazione, Assistenza familiare (colf, badanti, babysitter), Dimissioni telematiche, Autoliquidazioni/INAIL/Mod. CU e 770, Contabilità di società, ditte e professionisti, Servizio per autonomi e partite IVA (apertura attività), Disoccupazione (NASpI), **Rilascio SPID e firma digitale**, Maternità, Assegno unico, Ricostituzioni reddituali INPS, Reversibilità e ratei, Pensioni, Estratto contributivo, Invalidità civile e assegno sociale.
- **Da togliere su richiesta del cliente: "Rilascio SPID e firma digitale"** (vanno tolte la pagina, la voce nei menu, i link interni e i testi che la citano; l'URL vecchio reindirizza a /servizi con 301).
- Descrizioni leggibili solo per alcuni servizi: **730** (compilazione e invio telematico per dipendenti, pensionati e altri redditi; elenco documenti in una pagina dedicata; appuntamento), **IMU** (calcolo, consulenza sul carico fiscale, esenzioni), **Titolare partita IVA** (Agenzia Entrate, Registro Imprese, regime fiscale, dichiarazioni, fatturazione elettronica), **Assistenza familiare**, **Maternità** ("richiesta assegno di maternità"). Per gli altri servizi il sito non fornisce descrizioni né documenti.
- Il sito cita anche una sezione "Convenzioni e offerte" senza dettagli.

**Non si sa (mai inventare):** anno di fondazione, nomi del team, orari, PEC, REA, accreditazioni (CAF, Patronato, ordini professionali), tariffe, tempi di lavorazione, elenchi documenti per i servizi senza testo, dettagli di "Convenzioni e offerte", se l'attuale CMS ha utenti da migrare, dove sono ospitati gli allegati oggi.

## 2. Emozione e idea

**Emozione: tranquillità** (dal loro stesso claim: "farti sentire tranquillo").

**Idea guida (seme): "Il percorso."** Il sito è una linea morbida che cambia direzione, e il visitatore la segue. All'ingresso una domanda guida ("Chi sei? Di cosa hai bisogno?") con scelte a bolle/pillole (Famiglia, Lavoro, Casa, Pensione, Impresa) che riordinano i servizi. Le sezioni si aprono con curve e archi, non con riquadri; i servizi sono **stazioni** di un percorso con icone semplici; ogni servizio ha una pagina che spiega "per chi è, cosa facciamo, come funziona, che documenti servono" e permette di **caricare i documenti** e **prenotare** senza lasciare la pagina.

È un punto di partenza: Code deve cercare un'idea più forte se c'è.

---

## 3. FISSO

1. **Dati e fatti**: solo la sezione 1. Contenuti dei servizi dalle pagine esistenti del sito, **migrati** e riscritti con più chiarezza **senza cambiare i fatti** (documenti, procedure, scadenze, importi); dove manca il testo: segnaposto evidente e voce in "Da chiedere". Niente tariffe, tempi o accreditazioni inventati.
2. **Servizio SPID/firma digitale rimosso** ovunque (pagina, menu, ricerca, sitemap, FAQ, moduli, testi), con 301 verso /servizi.
3. **Testi modificabili dal cliente**: ogni pagina e ogni servizio modificabili da un pannello in italiano, senza toccare il codice: titolo, introduzione, "per chi è", passaggi, documenti da portare, FAQ, testo e link dei pulsanti, "Convenzioni e offerte", orari, news. **Un cambio di testo non deve richiedere un intervento tecnico.** Ogni pagina servizio si genera dallo stesso modello, così i servizi si aggiungono in pochi minuti.
4. **Caricamento documenti nella pagina del servizio**: blocco "Carica i documenti" in ogni pagina servizio, con **checklist modificabile** dei documenti richiesti, trascinamento file, anteprima, avanzamento, conferma vera e codice pratica. Richiede un **backend vero** (non un semplice invio email), con archiviazione **privata**, antivirus, tipi e dimensioni limitati, cifratura, nessun link pubblico, notifica allo studio con link a un'area protetta (mai file in allegato email in chiaro). Mai dire "inviato" se il file non è arrivato. Dettagli in sezione 9.
5. **Forma e tono**: professionale ma **non quadrato e non istituzionale**: curve ampie, archi, pillole, linee che scorrono, sezioni che cambiano forma; leggibilità e ordine prima di tutto. Animazioni **eleganti**, mai da gioco.
6. **Immagini**: foto vere dello studio, del team e dei clienti (con consenso) quando il cliente le fornisce; **altrimenti foto di stock di qualità**, realistiche e coerenti (persone al lavoro, famiglie, professionisti, uffici). **Senza didascalie "Immagine illustrativa"** (richiesta del cliente). I crediti stanno **solo nel footer, in un unico link** a una pagina "Crediti". Condizioni: uso solo di fonti con licenza commerciale; **le foto di stock non si presentano come il team, lo studio o i clienti reali** (niente "Il nostro team" o testimonianze con volti di stock); ritocco solo di nitidezza, esposizione, rumore.
7. **Azioni principali** (ripetute): **Prenota una consulenza** e **Carica i documenti**.
8. **Prestazioni e accessibilità**: tante animazioni ma fluide (trasformazioni, opacità, clip-path); pausa fuori schermo; LCP < 2,5 s su 4G; Lighthouse mobile Performance ≥ 90 e Accessibility ≥ 95; WCAG 2.2 AA; `prefers-reduced-motion`; mobile da 360 px; il target principale include persone anziane: testo ≥ 1,125 rem, contrasto alto, pulsanti grandi.
9. Mai "inviato" per un modulo senza backend. **Conformità** (sezione 9).
10. **Lavorare dall'inizio alla fine senza fermarsi a ogni sezione** (vedi sezione 12).

---

## 4. SPUNTO

> Code: parti da qui ma superalo. Scrivi `CONCEPT.md` con **tre concept più audaci** (professionale, curvo, non istituzionale), valutati per impatto, realismo, fattibilità e peso. Scegline uno e **procedi fino in fondo**.

### 4.1 Apertura (hero)
- Foto o video (stock di qualità se mancano quelli veri) a tutto schermo con **forme curve** che si aprono come finestre (clip-path ad arco/cerchio), titolo che entra per righe, una linea morbida che disegna un "percorso". Titolo breve ("Le tue pratiche, in mani sicure." come bozza), due pulsanti: **Prenota una consulenza** e **Carica i documenti**; sotto, la domanda "Di cosa hai bisogno?" con pillole.
- Caricamento < 1,2 s, saltabile, con il logo e la linea che si traccia.

### 4.2 "Di cosa hai bisogno?" (interazione principale)
- Pillole per **situazione**: Famiglia · Lavoro · Casa · Pensione · Impresa/Partita IVA. La scelta riordina e illumina i servizi pertinenti (animazione fluida, FLIP) e propone la pagina. Ricerca testuale (esiste già /cerca).
- Raggruppamento proposto dei servizi (da confermare):
  - **Famiglia**: Assistenza familiare (colf, badanti, babysitter), Maternità, Assegno unico.
  - **Casa e patrimonio**: IMU, Contratti locazione, Successioni.
  - **Dichiarazioni e agevolazioni**: Modello 730, Modello ISEE.
  - **Lavoro**: Dimissioni telematiche, Disoccupazione (NASpI).
  - **Pensioni e previdenza**: Pensioni, Reversibilità e ratei, Ricostituzioni reddituali INPS, Estratto contributivo, Invalidità civile e assegno sociale.
  - **Imprese e professionisti**: Contabilità di società, ditte e professionisti, Servizio per autonomi e partite IVA, Autoliquidazioni/INAIL/CU/770.

### 4.3 I servizi (ispirazione Altufan Ulu e Financial Create)
- Panoramica con schede **non squadrate** (raggi grandi, forme organiche), una frase di spiegazione e un'icona semplice; al clic si apre un **pannello/modale** con riassunto e pulsanti (sul modello dei pannelli con precedente/successivo di Financial Create) e un link alla pagina completa.
- Una **fascia scorrevole** (marquee) con le parole chiave dei servizi o il claim, un solo punto di movimento continuo.
- Cifre in evidenza solo se vere (anni di attività, numero di servizi: 18 dopo la rimozione); niente numeri inventati.

### 4.4 Pagina di ogni servizio (modello unico, modificabile)
1. **Intro**: titolo, frase chiara, pulsanti "Prenota" e "Carica i documenti".
2. **Per chi è** (chi può richiederlo).
3. **Cosa facciamo per te** (elenco semplice).
4. **Come funziona** (passi): una vera sequenza, con linea che si disegna con lo scroll (solo qui i numeri hanno senso).
5. **Documenti da portare** (checklist modificabile e stampabile) **+ blocco "Carica i documenti"** (vedi 3.4).
6. **Domande frequenti** (modificabili).
7. **Prenota una consulenza** (modulo breve o telefono) e **servizi collegati**.
- Intestazione e tono diversi per gruppo (colore o forma), senza perdere coerenza.

### 4.5 Chi siamo e fiducia
- Pagina "Chi siamo" con **persone vere** (con consenso) quando ci sono le foto; senza foto, testo e valori ("esperienza e serietà", "tranquillità"). Nessuna recensione o numero inventato. Link al profilo Google/Facebook/LinkedIn.

### 4.6 Consulenza
- Prenotazione: modulo breve (nome, telefono, servizio, Privato/Azienda, preferenza di orario) con conferma vera; calendario solo se il cliente ha un gestionale.

### 4.7 Convenzioni e offerte
- Pagina modificabile; **solo se esistono** e con condizioni vere.

### 4.8 Microinterazioni
- Pillole che si gonfiano alla pressione, caricamento file con avanzamento morbido, checklist che si spunta, focus visibile, cursore sobrio su desktop, stesse curve e durate.

---

## 5. Riferimenti

**Riferimento 1 — Altufan Ulu (https://altufanulu.com/en/).** Analisi **parziale dal testo**: studio legale turco; hero con titolo "Trusted, fast and strategic legal services" e video di sfondo; sezione "Why" con tre punti numerati e immagini; fascia di cifre (20+ anni, 25 aree, 12 settori); **18 schede di aree di attività** con titolo e una o due frasi; settori; invito alla consulenza (telefono, email, modulo); footer con credito all'agenzia. Colore del tema `#050A34` (blu notte). **Non posso dire** nulla su animazioni, scroll, librerie o font.

**Riferimento 2 — Financial Create, recruit (https://recruit.financial-create.co.jp/).** Analisi **parziale dal testo**: sito giapponese; hero con presentazione a tre immagini e frasi brevi; messaggio, panoramica, **cinque interviste con schede**, **otto episodi con vista di dettaglio e precedente/successivo**, righe di immagini, **sette punti di forza numerati con immagini**, due percorsi di carriera, **frase ripetuta circa dieci volte (forse una fascia scorrevole)**, invito all'azione ripetuto, footer con sei sedi; probabile tema WordPress. **Non posso dire** nulla su animazioni, scroll o librerie.

| Cosa riprodurre | Adattamento a Monza CED |
|---|---|
| Hero con promessa chiara e due azioni (Altufan) | Hero "Prenota consulenza" + "Carica documenti" |
| Schede dei servizi con riassunto (Altufan) | Panoramica servizi con schede morbide e pannello di dettaglio |
| Punti di forza con immagini (entrambi) | Tre valori veri (affidabilità, aggiornamento, tranquillità), non numerati se non c'è sequenza |
| Pannelli con precedente/successivo (Financial Create) | Dettaglio servizio con precedente/successivo |
| Fascia di testo ripetuto (Financial Create) | Fascia scorrevole con servizi o claim |
| Invito all'azione ripetuto (entrambi) | "Prenota" ripetuto in nav, hero, a metà pagina, chiusura |
| Cifre in evidenza (Altufan) | Solo cifre vere |

Non riprodurre: testi, immagini, video, codice, identità, premi, badge. **Code deve aprire entrambi i siti con il browser e scrivere in `CONCEPT.md` le meccaniche reali viste (hero, schede, pannelli, fasce, animazioni, librerie), dichiarando ciò che non riesce a vedere.**

---

## 6. Palette e tipografia (proposta, da ricavare dal logo)

Il logo è un file SVG ("monza-ced.svg") che **non ho potuto vedere**: **Code lo apre e ricava palette e carattere dal logo reale**, senza ridisegnarlo. Proposta provvisoria, distinta dal blu notte istituzionale di Altufan:

| Token | Hex | Uso |
|---|---|---|
| inchiostro verde | #0F3B3A | colore principale (fiducia) |
| salvia | #8DAA9D | superfici e linee |
| avorio | #F6F4EE | fondo chiaro |
| ambra | #E3A13C | CTA e dettagli (contrasto AA da verificare) |
| carbone | #1D2325 | testo |
| nebbia | #D7DEDB | linee sottili |

Niente gradienti blu-viola, niente "crema + serif + terracotta". Tipografia: un titolo morbido e autorevole (es. **Fraunces** con asse SOFT o un grotesco arrotondato) e un testo molto leggibile (es. **Figtree** o **Atkinson Hyperlegible** per l'accessibilità); self-hosted, subset latino.

---

## 7. Struttura

```
[NAV]  logo · Servizi · Chi siamo · Convenzioni · Contatti · [Prenota] · [Carica documenti] · Cerca
[CARICAMENTO]  linea che si traccia (<1,2 s)
[HOME]
   HERO              forme curve · due azioni · "Di cosa hai bisogno?"
   SITUAZIONI        pillole che riordinano i servizi
   SERVIZI           schede morbide per gruppo → pannello di dettaglio
   FASCIA            marquee con i servizi/claim
   COME LAVORIAMO    tre valori veri + percorso (solo sequenze vere)
   CARICA I DOCUMENTI   blocco rapido (scelta servizio → checklist → upload)
   CHI SIAMO         persone vere (con consenso) o valori
   FAQ               domande vere
   CONSULENZA        prenota, telefono, dove siamo (Via Solferino 11, mappa su consenso)
[FOOTER]  dati dell'azienda, privacy, cookie, termini, accessibilità, Crediti (unico link)

PAGINE (URL mantenuti):
 /servizi                         panoramica
 /servizi/modello-isee · /servizi/modello-730 · /servizi/successioni · /servizi/imu · /servizi/contratti-locazione
 /servizi/assistenza-familiare-colf-badanti-babysitter · /servizi/dimissioni-telematiche
 /servizi/autoliquidazioni-inail-modello-cu-770 · /servizi/contabilita-societa-ditte-professionisti
 /servizi/apertura-attivita-partita-iva · /servizi/disoccupazione-naspi · /servizi/maternita
 /servizi/assegno-unico-universale · /servizi/ricostituzione-reddituale-inps · /servizi/pensione-reversibilita-ratei
 /servizi/pensioni · /servizi/consultazione-estratto-conto-contributivo-previdenziale · /servizi/assegno-invalidita-civile-e-sociale
 /servizi/rilascio-spid-firma-digitale  → 301 a /servizi (servizio rimosso)
 /chi-siamo · /contatti · /cerca · /convenzioni-offerte (se esistono)
 /privacy · /cookie · /termini · /accessibilita · /crediti · 404
```

## 8. Testi (bozze da far approvare)

- Hero: "Le tue pratiche, in mani sicure." · "Assistenza fiscale e amministrativa a Monza." · CTA: **Prenota una consulenza** · **Carica i documenti**.
- Valori (dal cliente): "Esperienza e serietà" · "Aggiornati alle ultime normative" · "La nostra priorità è farti sentire tranquillo".
- Servizi: titolo e una frase **dal sito esistente**, riscritta in modo semplice; nessun fatto aggiunto.
- Chiusura: "Parliamone: prenota una consulenza." + telefono 039 326628.

---

## 9. Conformità e pubblicazione (20 punti, con i dati reali)

Testi legali = **bozze da far validare**.

1. **Privacy** (art. 13 GDPR): titolare **Monza CED Srl**, Via Solferino 11, 20900 Monza, P.IVA 12488810966, ingresso@monzaced.it, tel. 039 326628; finalità (consulenza, caricamento documenti, contatti, newsletter se c'è), basi, **conservazione dei documenti caricati**, diritti, destinatari e fornitori (hosting, archiviazione, email). Se i documenti contengono **dati particolari** (salute: invalidità, maternità; ISEE: dati patrimoniali), serve consenso esplicito e misure adeguate.
2. **Termini** e condizioni del servizio di caricamento e di prenotazione.
3. **Cookie** (Garante 2021): Accetta, Rifiuta, Personalizza; nessuno script prima del consenso (mappe, social, analytics, video); "Preferenze cookie" nel footer.
4. **Dati societari** nel footer (art. 2250 c.c.): **Monza CED Srl**, Via Solferino 11, 20900 Monza (MB), P.IVA 12488810966, **capitale sociale € 10.000,00 i.v.** (da verificare con visura); **REA e PEC da chiedere** (segnaposto evidenti); eventuale stato di liquidazione/socio unico. P.IVA in home.
5. **Accessibilità** WCAG 2.2 AA; pagina Accessibilità con contatto. Il pubblico include persone anziane e fragili: testo grande, contrasti alti, nessuna interazione obbligatoria con cursore.
6. **CTA**: "Prenota una consulenza" e "Carica i documenti" in nav, hero, a metà pagina, chiusura.
7. **FAQ** (`FAQPage`): come prenotare, quali documenti, tempi, come inviare i documenti in sicurezza, orari. Solo risposte confermate.
8. **Alt** descrittivi; `alt=""` per forme e linee decorative.
9. **Analytics** senza cookie o dopo il consenso.
10. **Meta title** ≤ 60 caratteri ("Monza CED | Assistenza fiscale e CED a Monza").
11. **Meta description** ≤ 155 caratteri con CTA, unica per ogni servizio.
12. **Open Graph/Twitter** 1200×630.
13. **Favicon** dal logo.
14. **Canonical** e redirect www/non-www, http→https, **URL dei servizi mantenuti**, 301 per la pagina rimossa; dati strutturati `ProfessionalService`/`LocalBusiness` con dati reali e **senza valutazioni auto-referenziali**.
15. **robots.txt** (nessuna area di caricamento indicizzata) · 16. **sitemap.xml** (senza la pagina rimossa).
17. **404** nello stile del sito.
18. **Mobile** da 360 px (anche il caricamento file da telefono: fotocamera e galleria).
19. **Form e upload**: validazione, errori chiari, honeypot e protezione anti-abuso, consenso espresso, invio reale, **conferma vera con codice pratica**; file solo PDF/JPG/PNG (e altri se concordati), limiti di dimensione e numero, **scansione antivirus**, archiviazione **privata e cifrata in UE**, **nessun URL pubblico**, **accesso solo dello studio** con autenticazione, **conservazione definita e cancellazione**, log di accesso, notifica senza allegati. Se il backend non è pronto, il blocco upload mostra un messaggio onesto e un'alternativa (telefono/email), **mai una finta conferma**.
20. **Link rotti** e **prestazioni** (AVIF/WebP, JS minimo, Lighthouse ≥ 90).

**Specifici del settore (da far verificare):**
- **Qualifiche e autorizzazioni**: CAF, Patronato, abilitazioni (consulenti, commercialisti) si citano **solo se esistono e sono documentabili**; chiedere quali servizi sono erogati con quale titolo (assistenza fiscale per 730 e ISEE, pratiche INPS/NASpI, dimissioni telematiche, colf e badanti, contabilità).
- **Responsabilità sui contenuti normativi**: ogni pagina servizio con data di aggiornamento e invito a verificare con lo studio; nessuna promessa su rimborsi, esiti o tempi.
- **Prezzi/tariffe**: solo se il cliente li fornisce; con IVA se rivolti ai consumatori.
- **Offerte e convenzioni**: condizioni e durata vere.
- **Recensioni e numeri**: nessun punteggio, anno, numero di clienti o pratiche senza dati.
- **Foto di stock**: licenza commerciale, crediti nella pagina /crediti raggiungibile da un solo link nel footer; mai spacciate per il team o i clienti reali.
- **Dati dei minori e delle categorie fragili**: massima prudenza nei moduli.
- **Sicurezza**: l'upload di documenti fiscali va protetto da un professionista (DPIA da valutare con il consulente privacy).

## 10. Da chiedere al cliente

- **Logo** in vettoriale e colori ufficiali; foto e video veri dello studio e del team (con consenso).
- **Testi attuali** di ogni servizio (soprattutto quelli senza descrizione), **elenchi documenti**, procedure, tempi, eventuali tariffe; chi li aggiorna.
- **Accreditazioni**: CAF, Patronato, albi professionali; quali servizi con quale titolo.
- **Orari**, PEC, REA, eventuale data di fondazione ("da anni": da quando?), dati di "Convenzioni e offerte".
- **Caricamento documenti**: dove devono arrivare, chi li riceve, tipi di file, per quanto tempo si conservano, chi può accedere; il modulo attuale con "Allegati" dove li salva oggi?
- Prenotazione consulenze: telefono, modulo o gestionale/calendario?
- Chi aggiorna i testi: persone, ruoli, livello tecnico (per scegliere il pannello più semplice).
- Conferma della rimozione di "Rilascio SPID e firma digitale" e del reindirizzamento.
- Social (Facebook, LinkedIn) da mantenere; profilo Google per le recensioni.

## 11. Pannello e backend (note tecniche per Code)

- **Contenuti**: pannello in italiano per non tecnici. Preferire un CMS con **modifica diretta delle scritte** (es. TinaCMS con editing in pagina, oppure Keystatic), con campi per ogni blocco del servizio. Code sceglie e motiva in `DECISIONI.md`.
- **Upload**: rendering lato server (adapter Astro per Node/Vercel/Cloudflare), URL firmati verso storage S3-compatibile **privato in UE**, scansione antivirus (es. ClamAV), limiti e validazione tipo MIME, rate limiting, notifica allo studio con link a un'area protetta, log. Nessun file in email.
- **Se qualcosa non si può fare nel perimetro del progetto, dirlo chiaramente nel README e lasciare il blocco in modalità sicura (messaggio onesto + telefono).**

## 12. Come lavorare (richiesta del cliente)

- **Senza fermarsi a ogni sezione**: dopo `CONCEPT.md` Code sceglie, costruisce tutte le pagine e le sezioni, verifica, e riporta **alla fine** con screenshot, `DECISIONI.md` e l'elenco delle cose ancora da chiedere. Si ferma prima solo per una decisione irreversibile (es. cancellare dati, pubblicare in produzione).
