/**
 * Crea la riga per un utente dell'area riservata (variabile UTENTI_STUDIO).
 * Uso:  npm run hash-password -- nomeutente            (chiede la password senza mostrarla)
 *       npm run hash-password -- nomeutente --totp     (aggiunge la verifica in due passaggi)
 */
import { scryptSync, randomBytes } from 'node:crypto';
import { createInterface } from 'node:readline';

const [nome, ...opz] = process.argv.slice(2);
if (!nome || !/^[a-z0-9._-]{2,40}$/i.test(nome)) {
  console.error('Indica un nome utente (lettere, numeri, . _ -).');
  process.exit(1);
}

const chiedi = (domanda) =>
  new Promise((ok) => {
    const rl = createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    rl._writeToOutput = (s) => {
      if (s.includes(domanda)) process.stdout.write(s);
    };
    rl.question(domanda, (r) => {
      rl.close();
      process.stdout.write('\n');
      ok(r);
    });
  });

const pw = process.env.PASSWORD_NUOVA ?? (await chiedi('Password (almeno 12 caratteri): '));
if (pw.length < 12) {
  console.error('Password troppo corta: almeno 12 caratteri.');
  process.exit(1);
}
const sale = randomBytes(16).toString('base64url');
const hash = scryptSync(pw.normalize('NFKC'), Buffer.from(sale, 'base64url'), 64, { N: 16384, r: 8, p: 1 }).toString('base64url');
let riga = `${nome}:scrypt$${sale}$${hash}`;
if (opz.includes('--totp')) {
  const A = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  const segreto = [...randomBytes(20)].map((b) => A[b % 32]).join('');
  riga += `:${segreto}`;
  console.log("\nVerifica in due passaggi: aggiungi questo account all'app di autenticazione (es. Google Authenticator):");
  console.log(`otpauth://totp/MonzaCED:${nome}?secret=${segreto}&issuer=MonzaCED`);
}
console.log('\nAggiungi questa riga a UTENTI_STUDIO (più utenti separati da virgola):\n');
console.log(riga);
