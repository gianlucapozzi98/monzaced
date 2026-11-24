# CONCEPT — Monza CED

Documento scritto prima di costruire. Contiene: cosa ho visto davvero nei riferimenti (con il browser, 24/11/2026), cosa ho ricavato dal logo e dal sito attuale, tre concept più audaci dello spunto, la scelta finale.

---

## 1. Riferimenti: meccaniche osservate

### Altufan Ulu — https://altufanulu.com/en/
Aperto con il browser integrato a 1440×900 e ispezionato con JavaScript (oggetti globali, `ScrollTrigger.getAll()`, istanze Swiper, video).

| Elemento | Cosa ho visto |
|---|---|
| Stack | WordPress (tema custom `altufan-ulu`, LiteSpeed). **GSAP 3.14.2 + ScrollTrigger**, **Lenis** (classe `lenis` su `<html>`), **Swiper**, **Barba.js** (transizioni tra pagine, `data-barba="wrapper"`), jQuery. Font: **Inter** + **Victor Serif**. `font-size: 10px` forzato su `<html>` via script. |
| Hero | Video a tutto schermo `autoplay muted loop` con poster `.webp`, velo scuro; titolo serif grande in basso a sinistra su due righe, pulsante contornato "Our Story" con freccia, breve testo a destra. Menu a hamburger che si espande in voci orizzontali sopra 1440 px. |
| "Why" | Titolo + paragrafo, poi uno **Swiper di 3 grandi schede-immagine** (`slidesPerView 1.15`, nessun autoplay, velocità 300 ms) con numerazione 01–03 e titolo in maiuscolo sovrapposto in basso. |
| Fascia di cifre | Blocco blu notte: frase grande + tre cifre (20+, 24, 11) separate da filetti, foto a destra. Le cifre **contano** all'ingresso (ScrollTrigger `start: "top 85%"`, tween su `val` con `onUpdate`). |
| Aree di attività | **Swiper di 18 schede** (`slidesPerView 2.8`), colonne separate da filetti verticali: titolo grande, 2 righe di testo, freccia; frecce precedente/successivo e link "All Areas". |
| Settori | Titolo + foto architettonica a destra, pulsante "Sectors". |
| Invito alla consulenza | Fascia con foto notturna a tutta larghezza e testo ("telefono, email o modulo"). |
| Footer | Ripete il claim in grande, indirizzo, menu a due colonne, badge, credito agenzia. |
| Animazioni | 6 ScrollTrigger attivi, tutti "fade + y" o contatori con `start: top 85%`; link con sottolineatura animata (`line-animated`). Nessun pin, nessuno scrub, nessun clip-path rilevato. |
| Da non imitare | `gtag` di Google Analytics caricato **prima** di qualsiasi consenso. |

**Non visto:** comportamento di Barba tra le pagine interne (non ho navigato), easing esatti, versione mobile del menu, eventuale `prefers-reduced-motion`.

### Financial Create (recruit) — https://recruit.financial-create.co.jp/
| Elemento | Cosa ho visto |
|---|---|
| Stack | WordPress (tema `standard_sass`), **jQuery + Splide** (slider), **nessun GSAP/Lenis**: le animazioni sono **CSS** (`@keyframes`) attivate da classi `scroll_ac` / `scroll_active` all'ingresso nel viewport. Font: Noto Sans JP + **Familjen Grotesk** (TypeSquare per il giapponese). GTM caricato prima del consenso. |
| Hero | Splide in **dissolvenza** con due/tre ritratti sovrapposti in trasparenza, frase enorme bianca su due righe al centro; animazione d'apertura (`catch-color`, 3 s) e piccole "scintille" CSS. |
| Messaggio | Testo lungo con frasi chiave evidenziate in **rettangoli scuri** (effetto "pennarello" che scorre: `flowing-anim` 0,75 s). |
| Righe di immagini | Liste `<ul>` che scorrono all'infinito con `loopLeft`/`loopRight` (40 s, 60 s, 120 s) in direzioni opposte. |
| Episodi | Griglia di 8 schede (bordo sinistro colorato, "EPISODE 0X", titolo, "詳しく見る"). Il clic apre un **modale** (`.post--modal`, transizione `opacity .3s, visibility .3s`) con overlay cliccabile, **×** di chiusura e pulsante **"NEXT EPISODE"** (`js-modal-nav`). Il contenuto è già nel DOM (nessun caricamento). |
| Invito | Blocco "ENTRY" con foto di gruppo e due pulsanti a **pillola**, racchiuso da **due fasce scorrevoli** con la stessa frase in inglese ripetuta. |
| Footer | Sedi e link. |

**Non visto:** la pagina delle interviste e i percorsi di carriera nel dettaglio, il comportamento su mobile, se il modale gestisce il focus da tastiera (ho solo verificato che Esc non dà errori).

### Cosa prendo (meccanica, non contenuti)
1. **Hero con promessa + due azioni** (Altufan) → hero con "Prenota una consulenza" e "Carica i documenti".
2. **Schede con riassunto** (Altufan, 18 aree) → 18 servizi in schede morbide.
3. **Cifre che contano** (Altufan) → **non adottata**: senza cifre vere e significative (anni di attività, clienti) la fascia sarebbe solo riempimento. Tolta dopo la prima revisione del cliente.
4. **Modale con "successivo"** (Financial Create) → pannello di dettaglio del servizio con precedente/successivo, ma accessibile (`<dialog>`, focus, Esc, ritorno del focus).
5. **Fascia di testo ripetuto** (Financial Create) → una sola fascia scorrevole con i servizi, con pulsante Pausa.
6. **Invito ripetuto con pillole** (entrambi) → CTA in nav, hero, metà pagina, chiusura.
7. Cosa **non** prendo: analytics prima del consenso, menu a hamburger anche su desktop, testo bianco sottile su foto (contrasto basso per un pubblico anziano), Barba (navigazione normale = più robusta e accessibile).

---

## 2. Il sito attuale e il logo

- **monzaced.it** è Joomla + SP Page Builder, font Montserrat da Google Fonts (senza consenso), modulo RSForm con allegati.
- **Logo** (`/images/monza-ced.svg`, 252×31): due tracciati. **"MONZA" in bianco** (pensato per un fondo scuro) e **"CED" in corsivo, blu `#2E81FF`**. Le lettere sono un **sans geometrico molto pesante** (M con aste divaricate, O perfettamente tonda): coerente con **Montserrat** ExtraBold, lo stesso font usato dal sito.
- Ne ricavo:
  - **Palette**: un solo colore di marca, il blu `#2E81FF`, più un fondo chiaro caldo e un inchiostro scuro. Niente verde (la proposta provvisoria del brief non trova riscontro nel logo).
  - **Carattere**: Montserrat per i titoli, con **parole chiave in corsivo blu** come "CED" nel logo. Per il testo, Atkinson Hyperlegible Next (progettato per l'ipovisione: adatto al pubblico anziano).
  - **Uso del logo senza ridisegnarlo**: poiché "MONZA" è bianco, il logo vive su una **navigazione a pillola scura**. Nessuna ricolorazione.
- **Testi**: tutte le 18 pagine servizio hanno contenuto (più di quanto indicato nel brief). Li migro tutti.
- **Orari** trovati su /contatti: lun–ven 9:30–13:00 e 14:00–18:00.
- **Convenzioni e offerte**: la pagina esiste ma è **non pubblicata** (404 "page is unpublished") → la nostra pagina resta spenta finché il cliente non inserisce offerte vere.
- **Attenzione SPID**: la pagina "Estratto contributivo" cita SPID e offre aiuto per "creare le credenziali digitali" (che è il servizio da eliminare). Va riscritta.

---

## 3. Tre concept

Criteri: impatto (quanto è memorabile), realismo (quanto regge con contenuti veri e foto di stock), fattibilità (tempo/robustezza), peso (KB e rischio su LCP). Voti da 1 a 5.

### Concept A — "La porta"
Il motivo è l'**arco**: una porta che si apre ("entra pure, ci pensiamo noi").
- **Hero**: fondo avorio, a destra un grande arco alto quanto lo schermo con la foto; all'apertura l'arco cresce da una piccola nicchia (clip-path); allo scroll si allarga fino a tutto schermo e rivela la frase "La nostra priorità è farti sentire tranquillo".
- **Di cosa hai bisogno?**: cinque archi-porta (Famiglia, Casa, Lavoro, Pensione, Impresa); se ne sceglie uno e la porta "si apre" sui servizi.
- Impatto 4 · Realismo 5 · Fattibilità 5 · Peso 5. Rischio: l'arco è molto di moda, da solo può sembrare un template.

### Concept B — "Il filo"
Una **linea continua blu** (il "percorso") accompagna la persona dall'inizio alla fine: nasce sotto il titolo, gira intorno alla foto, passa per le pillole, tocca i servizi come **fermate** e finisce sottolineando "Prenota".
- **Hero**: titolo enorme "Le tue pratiche, *in mani sicure*." con il corsivo blu del logo; il filo si traccia sotto "in mani sicure" e scende verso le pillole.
- **Di cosa hai bisogno?**: le pillole stanno sul filo come fermate; scegliendone una, il filo "devia" verso i servizi pertinenti, che si riordinano (FLIP) e si accendono.
- Impatto 5 · Realismo 4 · Fattibilità 3 (un tracciato unico su tutta la pagina è fragile tra 360 e 1440 px) · Peso 5.

### Concept C — "Il respiro"
La tranquillità come **ritmo**: un grande cerchio-finestra con la foto che "respira" lentamente (scala 1→1,03 in 6 s), anelli concentrici.
- **Di cosa hai bisogno?**: le pillole orbitano intorno al cerchio; scegliendone una, i servizi pertinenti vengono attirati al centro.
- Impatto 4 · Realismo 3 · Fattibilità 2 (orbite illeggibili su mobile e per gli screen reader) · Peso 4. Rischio: movimento continuo che distrae chi è anziano, effetto "gioco".

---

## 4. Scelta: B "Il filo", con gli archi di A come finestre

Scelgo **B** perché traduce letteralmente l'idea del brief ("un percorso, non un elenco") e perché la linea è **leggera** (SVG) e animabile con le sole proprietà consigliate. Ne correggo il punto debole e prendo da A la forma più forte:

1. **Il filo è a tratti, non un tracciato unico**: ogni sezione ha il suo segmento SVG che entra ed esce sempre dagli stessi punti (bordo sinistro/destro), così sembra una linea continua ma si adatta a ogni larghezza. Si disegna con `stroke-dashoffset` legato allo scroll (ScrollTrigger, `scrub`). Su mobile diventa una linea verticale morbida a sinistra.
2. **Le foto stanno in archi e cerchi** (concept A): la porta si apre allo scroll nell'hero (clip-path ad arco → tutto schermo), le schede e le immagini dei gruppi hanno la sommità curva.
3. **Le pillole sono fermate del filo**: alla scelta, il filo si "aggancia" alla pillola scelta, i servizi si riordinano con **GSAP Flip** e i non pertinenti si attenuano (restano raggiungibili).
4. **Il blu del logo è il filo**; il corsivo blu del logo è la voce dei titoli.

### Mappa della home
```
NAV a pillola scura (logo originale) · Servizi · Chi siamo · Contatti · Cerca · [Carica documenti] [Prenota]
HERO 100svh   titolo per righe + filo che si traccia + arco con foto e cerchio con dettaglio (parallasse)
              → allo scroll la porta si apre a tutto schermo: "La nostra priorità è farti sentire tranquillo."
DI COSA HAI BISOGNO?   pillole-fermate → 18 schede che si riordinano (FLIP) → pannello con prec./succ.
FASCIA         nomi dei servizi che scorrono (unico movimento continuo, con Pausa)
COME LAVORIAMO tre valori del cliente + tre passi reali del sito (il filo li unisce)
CARICA I DOCUMENTI   scelta servizio → checklist che si spunta → caricamento (CTA a metà pagina)
CHI SIAMO      testo vero, nessun volto di stock spacciato per il team
FAQ            risposte basate su fatti del sito
CONSULENZA     prenota (modulo breve) · telefono · orari · dove siamo (mappa solo col consenso)
FOOTER         dati societari completi, legali, "Preferenze cookie", unico link "Crediti"
```

### Ritmo e movimento (una sola grammatica)
- Curve: `--ease-out: cubic-bezier(.22,1,.36,1)` (ingressi), `--ease-in-out: cubic-bezier(.65,0,.35,1)` (trasformazioni), una sola molla per le pillole.
- Durate: 180 ms (micro), 420 ms (componenti), 900 ms (sezioni), filo legato allo scroll.
- Solo `transform`, `opacity`, `clip-path`, `stroke-dashoffset`. Pausa fuori schermo (ScrollTrigger `toggleActions`, IntersectionObserver per la fascia). `prefers-reduced-motion`: niente Lenis, niente pin, filo già disegnato, nessun movimento continuo.
- Caricamento: logo + filo che si traccia in < 1 s, solo alla prima visita della sessione, saltabile (clic, tasto, pulsante "Salta"), il contenuto è già renderizzato sotto.

### Cosa NON faccio
Niente video nell'hero (peso e LCP su 4G; nessun video vero del cliente): il "tutto schermo" lo dà la porta che si apre. Niente 3D, niente cursore personalizzato obbligatorio, niente interazioni che richiedono il mouse.
