/**
 * Configurazione lato server, letta dalle variabili d'ambiente a ogni richiesta (vedi .env.example).
 * Se manca qualcosa di essenziale, il caricamento resta in "modalità sicura":
 * il sito mostra un messaggio onesto con telefono e indirizzo, e non accetta file.
 */
const env = (k: string) => (process.env[k] ?? '').trim();
const num = (k: string, d: number) => {
  const n = Number(env(k));
  return Number.isFinite(n) && n > 0 ? n : d;
};

export function cfg() {
  return {
    sito: env('SITE_URL') || 'http://localhost:4321',
    /** Modalità di prova: consente antivirus e notifiche di test (MAI in produzione). */
    prova: env('MODALITA_PROVA') === '1',
    fidatiProxy: env('TRUST_PROXY') === '1',
    archivio: env('ARCHIVIO_DRIVER') as '' | 's3' | 'locale',
    s3: {
      endpoint: env('S3_ENDPOINT').replace(/\/$/, ''),
      regione: env('S3_REGION'),
      bucket: env('S3_BUCKET'),
      chiave: env('S3_ACCESS_KEY_ID'),
      segreto: env('S3_SECRET_ACCESS_KEY'),
      sse: env('S3_SSE') || 'AES256', // "none" se il fornitore cifra già tutto di default
    },
    locale: {
      cartella: env('ARCHIVIO_LOCALE_CARTELLA') || '.data/archivio',
      chiave: env('ARCHIVIO_LOCALE_CHIAVE'), // 32 byte in base64
    },
    antivirus: env('ANTIVIRUS_DRIVER') as '' | 'clamd' | 'prova-eicar',
    clamd: { host: env('CLAMD_HOST'), porta: num('CLAMD_PORT', 3310), timeoutMs: num('CLAMD_TIMEOUT_MS', 30000) },
    notifiche: env('NOTIFICHE_DRIVER') as '' | 'smtp' | 'prova-file',
    smtp: {
      host: env('SMTP_HOST'), porta: num('SMTP_PORT', 587), utente: env('SMTP_USER'), password: env('SMTP_PASS'),
      sicuro: env('SMTP_SECURE') === '1',
    },
    notificaA: env('NOTIFICA_A'),
    notificaDa: env('NOTIFICA_DA'),
    segreto: env('SEGRETO_APP'),
    utentiStudio: env('UTENTI_STUDIO'),
    maxFile: num('UPLOAD_MAX_FILE', 10),
    maxMB: num('UPLOAD_MAX_MB', 15),
    conservazioneGiorni: num('CONSERVAZIONE_GIORNI', 0),
    tipi: ['application/pdf', 'image/jpeg', 'image/png'],
  };
}
export type Config = ReturnType<typeof cfg>;

function archivioPronto(c: Config): string | null {
  if (c.archivio === 's3') {
    const s = c.s3;
    return s.endpoint && s.regione && s.bucket && s.chiave && s.segreto ? null : 'archivio S3 incompleto';
  }
  if (c.archivio === 'locale' && process.env.VERCEL) return 'archivio locale non disponibile su Vercel (disco di sola lettura): usare S3';
  if (c.archivio === 'locale') {
    try {
      return Buffer.from(c.locale.chiave, 'base64').length === 32 ? null : 'chiave di cifratura locale non valida';
    } catch {
      return 'chiave di cifratura locale non valida';
    }
  }
  return 'archivio non configurato';
}
function notifichePronte(c: Config): string | null {
  if (c.notifiche === 'smtp') return c.smtp.host && c.notificaA && c.notificaDa ? null : 'SMTP incompleto';
  if (c.notifiche === 'prova-file') return c.prova && !process.env.VERCEL ? null : 'notifiche di prova non ammesse qui';
  return 'notifiche non configurate';
}

export function statoCaricamento(c = cfg()) {
  const motivi: string[] = [];
  const a = archivioPronto(c); if (a) motivi.push(a);
  if (c.antivirus === 'clamd') { if (!c.clamd.host) motivi.push('antivirus: CLAMD_HOST mancante'); }
  else if (c.antivirus === 'prova-eicar') { if (!c.prova) motivi.push('antivirus di prova non ammesso fuori dalla modalità di prova'); }
  else motivi.push('antivirus non configurato');
  const n = notifichePronte(c); if (n) motivi.push(n);
  if (c.segreto.length < 32) motivi.push('SEGRETO_APP mancante o troppo corto');
  if (!c.utentiStudio) motivi.push('nessun utente per l\'area riservata dello studio');
  if (!c.conservazioneGiorni) motivi.push('periodo di conservazione (CONSERVAZIONE_GIORNI) non definito');
  return { attivo: motivi.length === 0, motivi };
}

export function statoModuli(c = cfg()) {
  const motivi: string[] = [];
  const a = archivioPronto(c); if (a) motivi.push(a);
  const n = notifichePronte(c); if (n) motivi.push(n);
  if (c.segreto.length < 32) motivi.push('SEGRETO_APP mancante o troppo corto');
  return { attivo: motivi.length === 0, motivi };
}
