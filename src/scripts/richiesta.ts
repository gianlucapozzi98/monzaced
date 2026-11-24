/** Moduli "Prenota una consulenza" e "Contatti": invio reale, errori chiari, conferma solo dal server. */
let statoP: Promise<{ moduli: { attivo: boolean }; gettone: string | null } | null> | null = null;
const stato = () =>
  (statoP ??= fetch('/api/stato', { cache: 'no-store' }).then((r) => (r.ok ? r.json() : null)).catch(() => null));

document.querySelectorAll<HTMLElement>('[data-richiesta]').forEach(async (root) => {
  const vista = (n: string) => root.querySelectorAll<HTMLElement>('[data-vista-r]').forEach((v) => (v.hidden = v.dataset.vistaR !== n));
  const form = root.querySelector('form')!;
  const tipo = root.dataset.tipo as 'prenota' | 'contatto';
  const esito = root.querySelector<HTMLElement>('[data-esito-r]')!;
  const btn = root.querySelector<HTMLButtonElement>('[data-invia-r]')!;
  const s = await stato();
  if (!s?.moduli?.attivo || !s.gettone) { vista('spento'); return; }
  let gettone = s.gettone;
  vista('modulo');

  // Servizio preselezionato da ?servizio=
  const sel = form.elements.namedItem('servizio') as HTMLSelectElement;
  const q = new URLSearchParams(location.search).get('servizio');
  if (q && [...sel.options].some((o) => o.value === q)) sel.value = q;

  const el = (n: string) => form.elements.namedItem(n) as HTMLInputElement;
  const errore = (n: string, msg: string) => {
    const p = form.querySelector<HTMLElement>(`[data-errore-per="${n}"]`);
    if (p) p.textContent = msg;
    const c = el(n);
    if (c && 'setAttribute' in c) c.setAttribute('aria-invalid', msg ? 'true' : 'false');
  };
  ['nome', 'telefono', 'email', 'messaggio', 'consenso'].forEach((n) => el(n)?.addEventListener('input', () => errore(n, '')));

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    esito.innerHTML = '';
    const tel = el('telefono').value.trim(), email = el('email').value.trim(), nome = el('nome').value.trim();
    const msg = (form.elements.namedItem('messaggio') as HTMLTextAreaElement).value.trim();
    const telOk = /^[+()\d\s./-]{6,30}$/.test(tel) && (tel.match(/\d/g)?.length ?? 0) >= 6;
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
    const err: Record<string, string> = {
      nome: nome.length >= 3 ? '' : 'Scrivi nome e cognome.',
      telefono: tipo === 'prenota' ? (telOk ? '' : 'Scrivi un numero di telefono valido.') : telOk || emailOk ? (tel && !telOk ? 'Il numero non sembra corretto.' : '') : 'Lasciaci almeno un telefono o un\'email validi.',
      email: !email || emailOk ? '' : "L'indirizzo email non sembra corretto.",
      messaggio: tipo === 'contatto' && msg.length < 5 ? 'Scrivi il tuo messaggio.' : '',
      consenso: el('consenso').checked ? '' : "Serve la conferma di aver letto l'informativa.",
    };
    Object.entries(err).forEach(([k, v]) => errore(k, v));
    const primo = Object.entries(err).find(([, v]) => v);
    if (primo) { (el(primo[0]) as HTMLElement)?.focus(); return; }

    btn.disabled = true;
    form.setAttribute('aria-busy', 'true');
    esito.innerHTML = '<p class="avviso">Invio in corso…</p>';
    try {
      const fd = new FormData(form);
      const r = await fetch('/api/richiesta', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          tipo, gettone, nome, telefono: tel, email, servizio: sel.value, messaggio: msg,
          profilo: fd.get('profilo'), preferenza: fd.get('preferenza'), consenso: el('consenso').checked, sito_web: el('sito_web').value,
        }),
      });
      const d = await r.json().catch(() => ({}));
      if (r.ok && d.codice) {
        root.querySelector('[data-codice-r]')!.textContent = d.codice;
        vista('fatto');
        root.querySelector<HTMLElement>('[data-vista-r="fatto"]')!.focus();
        return;
      }
      if (r.status === 503) { vista('spento'); return; }
      if (r.status === 422 && d.errori) {
        Object.entries(d.errori as Record<string, string>).forEach(([k, v]) => errore(k, v));
        esito.innerHTML = '<p class="avviso avviso--errore">Controlla i campi segnati in rosso.</p>';
      } else if (r.status === 429) {
        esito.innerHTML = '<p class="avviso avviso--errore">Troppi invii in poco tempo. Riprova tra qualche minuto o chiamaci.</p>';
      } else {
        esito.innerHTML = '<p class="avviso avviso--errore">La richiesta non è stata inviata. Riprova o chiamaci.</p>';
      }
      statoP = null;
      gettone = (await stato())?.gettone ?? gettone;
    } catch {
      esito.innerHTML = '<p class="avviso avviso--errore">La richiesta non è stata inviata (problema di connessione). Riprova o chiamaci.</p>';
    } finally {
      btn.disabled = false;
      form.removeAttribute('aria-busy');
    }
  });
});
