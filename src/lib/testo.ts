/**
 * Formattazione minima per i testi scritti nel pannello, pensata per chi non è tecnico:
 *  - riga vuota = nuovo paragrafo
 *  - riga che inizia con "- " = punto elenco
 *  - **grassetto**, *corsivo*, [testo](indirizzo)
 * Tutto il resto viene mostrato come testo (l'HTML non è ammesso).
 */
const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const linkSicuro = (href: string) => /^(https?:\/\/|mailto:|tel:|\/|#)/i.test(href);

export function inline(text: string): string {
  let s = esc(text);
  s = s.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_m, label: string, href: string) => {
    const h = href.replace(/&amp;/g, '&');
    if (!linkSicuro(h)) return label;
    const ext = /^https?:\/\//i.test(h);
    return `<a href="${esc(h)}"${ext ? ' rel="noopener" target="_blank"' : ''}>${label}${ext ? '<span class="sr-only"> (si apre in una nuova scheda)</span>' : ''}</a>`;
  });
  s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  s = s.replace(/(^|[^*])\*([^*]+)\*/g, '$1<em>$2</em>');
  return s;
}

export function blocchi(text: string): string {
  if (!text) return '';
  const out: string[] = [];
  const parti = text.replace(/\r\n/g, '\n').split(/\n\s*\n/);
  for (const parte of parti) {
    const righe = parte.split('\n').map((r) => r.trim()).filter(Boolean);
    if (!righe.length) continue;
    if (righe.every((r) => r.startsWith('- '))) {
      out.push('<ul>' + righe.map((r) => `<li>${inline(r.slice(2))}</li>`).join('') + '</ul>');
    } else if (righe.some((r) => r.startsWith('- '))) {
      // paragrafo seguito da elenco senza riga vuota
      let buf: string[] = [];
      let lista: string[] = [];
      const flushP = () => { if (buf.length) { out.push(`<p>${inline(buf.join(' '))}</p>`); buf = []; } };
      const flushL = () => { if (lista.length) { out.push('<ul>' + lista.map((l) => `<li>${inline(l)}</li>`).join('') + '</ul>'); lista = []; } };
      for (const r of righe) {
        if (r.startsWith('- ')) { flushP(); lista.push(r.slice(2)); } else { flushL(); buf.push(r); }
      }
      flushP(); flushL();
    } else {
      out.push(`<p>${inline(righe.join(' '))}</p>`);
    }
  }
  return out.join('\n');
}

/** Testo semplice (per meta e schema.org). */
export const piano = (text: string) =>
  text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').replace(/\*\*?([^*]+)\*\*?/g, '$1').replace(/^- /gm, '').replace(/\s+/g, ' ').trim();
