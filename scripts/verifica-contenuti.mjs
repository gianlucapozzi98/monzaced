/** Controlla che tutti i file dei contenuti siano YAML validi. Uso: node scripts/verifica-contenuti.mjs */
import { load } from 'js-yaml';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
let errori = 0;
const giro = (d) => readdirSync(d).forEach((f) => {
  const p = join(d, f);
  if (statSync(p).isDirectory()) return giro(p);
  if (!p.endsWith('.yaml')) return;
  try { load(readFileSync(p, 'utf8')); } catch (e) { errori++; console.error(`✗ ${p}\n  ${e.message.split('\n')[0]}`); }
});
giro('src/content');
console.log(errori ? `${errori} file con errori` : 'Tutti i contenuti sono validi.');
process.exit(errori ? 1 : 0);
