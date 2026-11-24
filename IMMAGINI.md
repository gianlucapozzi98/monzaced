# Catalogo immagini

Tutte le foto sono **di stock**: da Unsplash (filtro "licenza gratuita", non Unsplash+) e due da Pexels, scaricate il 24-25/11/2026. La [Licenza Unsplash](https://unsplash.com/license) e la [Licenza Pexels](https://www.pexels.com/it-it/license/) consentono l'uso commerciale senza autorizzazione; l'attribuzione non è obbligatoria ma la diamo comunque nella pagina **/crediti**, raggiungibile da un solo link nel footer.

Regole rispettate:
- nessuna didascalia "Immagine illustrativa";
- nessuna foto di stock presentata come il team, lo studio o i clienti (non ci sono sezioni "Il nostro team" né testimonianze con volti);
- nessun ritocco oltre al ridimensionamento e alla compressione automatica (AVIF/WebP) in build;
- la foto della Villa Reale ritrae davvero Monza (luogo dichiarato sulla pagina Unsplash: "Villa Reale di Monza, Viale Brianza, Monza").

| File (`src/assets/img/`) | Cosa si vede | Dove è usata | Autore | Pagina della foto |
|---|---|---|---|---|
| `hero-coppia-giovane.jpg` | Giovane coppia che legge con calma dei documenti al tavolo di casa | **Prima foto** della sequenza dell'hero (sul computer inquadrata un po' più a destra, perché entrino entrambi i volti), immagine Open Graph | Ron Lach (**Pexels**) | https://www.pexels.com/it-it/foto/9869635/ |
| `hero-coppia-50.jpg` | Coppia sui cinquant'anni, sorridente, al portatile sul divano (sullo sfondo un camino in TV con un festone) | Seconda foto della sequenza dell'hero | Anthony Shkraba (**Pexels**) | https://www.pexels.com/it-it/foto/5810702/ |
| `hero-documenti-casa.jpg` | Coppia di anziani sul divano che controlla documenti | Terza foto della sequenza dell'hero | Vitaly Gariev | https://unsplash.com/photos/DQdilc0v6u8 |
| `dettaglio-firma.jpg` | Mani che firmano un documento | Cerchio nell'hero, "Esperienza e serietà", testata Successioni | Gabrielle Henderson | https://unsplash.com/photos/HJckKnwCXxQ |
| `famiglia.jpg` | Famiglia sorridente sul divano | Testata dei servizi Famiglia e ISEE | Vitaly Gariev | https://unsplash.com/photos/SwaEMQAzP_8 |
| `casa-chiavi.jpg` | Mano con le chiavi di casa davanti a una porta | Testata IMU e Locazioni | Jakub Żerdzicki | https://unsplash.com/photos/bqUZEAeWuok |
| `dichiarazioni.jpg` | Donna che legge un documento in cucina | Testata 730, /servizi, /carica-documenti, "Aggiornati alle normative" | Vitaly Gariev | https://unsplash.com/photos/RNUNbvIXUbg |
| `lavoro.jpg` | Giovane donna al portatile alla scrivania | Testata servizi Lavoro | Vitaly Gariev | https://unsplash.com/photos/x1YcazlZ7N8 |
| `pensioni.jpg` | Coppia di pensionati sorridente | Testata servizi Pensioni, "La tua tranquillità" | Vitaly Gariev | https://unsplash.com/photos/iV9F0sHl7OU |
| `imprese.jpg` | Giovane titolare nel suo locale | Testata servizi Imprese | Vitaly Gariev | https://unsplash.com/photos/QGg-vsPYbu8 |
| `monza-villa-reale.jpg` | Villa Reale di Monza dal laghetto | Chi siamo (home e pagina) | Cristina Gottardi | https://unsplash.com/photos/JTThNh7vtio |
| `consulenza-telefono.jpg` | Donna al telefono con il portatile | Contatti, Prenota | Vitaly Gariev | https://unsplash.com/photos/j5B2A4R4NKU |

Il catalogo modificabile (testi alternativi, autori, licenze) è nel pannello, sezione **Foto e crediti** (`src/content/immagini/`): la pagina /crediti si genera da lì.

## Quando arrivano le foto vere dello studio
1. Copiarle in `src/assets/img/` (JPG o PNG, lato lungo almeno 2000 px).
2. Aggiungere la scheda nel pannello → Foto e crediti, con **tipo "Foto vera dello studio (con consenso)"**.
3. Solo per le foto vere si possono usare titoli come "Il nostro team" e la sezione "Persone dello studio" (pannello → Chi siamo → persone, con la spunta del consenso scritto).

## Altri file grafici
- `src/assets/brand/monza-ced.svg`: logo originale del cliente, scaricato da monzaced.it, **non modificato**.
- `public/favicon.svg`, `favicon-32.png`, `apple-touch-icon.png`, `icon-512.png`: generati da `scripts/genera-icone.mjs` usando i tracciati originali della "M" (MONZA) e della "C" (CED) del logo.
- `public/og/monza-ced.jpg` (1200×630): generata dallo stesso script con il logo originale e la prima foto dell'hero.
- Icone: disegnate per il sito (tratto semplice), in `src/components/Icon.astro`.

**Sequenza dell'hero**: le foto si scelgono e si ordinano dal pannello (Home → "Foto dell'apertura"). Oggi: giovane coppia → coppia sui cinquant'anni → coppia di anziani, per parlare a età diverse.
