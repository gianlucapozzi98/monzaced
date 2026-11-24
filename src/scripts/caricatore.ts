/**
 * Caricamento documenti lato browser.
 * La conferma ("Documenti ricevuti" + codice pratica) compare SOLO quando il server ha ricevuto,
 * controllato con l'antivirus e archiviato almeno un file. Nessuna conferma finta.
 */
interface Documento { voce: string; nota: string }
interface ServizioC { slug: string; titolo: string; documenti: Documento[]; datiParticolari: boolean }
interface StatoApi { caricamento: { attivo: boolean; maxFile: number; maxMB: number; tipi: string[]; prova: boolean }; gettone: string | null }
interface Voce { file: File; li: HTMLLIElement; url?: string }

const TIPI_EST: Record<string, string> = { pdf: 'application/pdf', jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png' };
const mb = (n: number) => (n < 1024 * 1024 ? `${Math.max(1, Math.round(n / 1024))} KB` : `${(n / 1024 / 1024).toFixed(1).replace('.', ',')} MB`);
const ridotto = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let statoPromessa: Promise<StatoApi | null> | null = null;
const leggiStato = () =>
  (statoPromessa ??= fetch('/api/stato', { headers: { accept: 'application/json' }, cache: 'no-store' })
    .then((r) => (r.ok ? (r.json() as Promise<StatoApi>) : null))
    .catch(() => null));

document.querySelectorAll<HTMLElement>('[data-caricatore]').forEach(async (root) => {
  const vista = (nome: string) => root.querySelectorAll<HTMLElement>('[data-vista]').forEach((v) => (v.hidden = v.dataset.vista !== nome));
  const servizi: ServizioC[] = JSON.parse(root.querySelector('[data-servizi-caricatore]')?.textContent || '[]');
  const form = root.querySelector<HTMLFormElement>('form')!;
  const sel = form.querySelector<HTMLSelectElement>('[data-sel-servizio]');
  const checklist = form.querySelector<HTMLFieldSetElement>('[data-checklist]')!;
  const listaCheck = form.querySelector<HTMLUListElement>('[data-checklist-lista]')!;
  const contaCheck = form.querySelector<HTMLElement>('[data-checklist-conta]')!;
  const zona = form.querySelector<HTMLElement>('[data-zona]')!;
  const inFile = form.querySelector<HTMLInputElement>('[data-input-file]')!;
  const inFoto = form.querySelector<HTMLInputElement>('[data-input-foto]')!;
  const listaFile = form.querySelector<HTMLUListElement>('[data-file-lista]')!;
  const esito = form.querySelector<HTMLElement>('[data-esito]')!;
  const invia = form.querySelector<HTMLButtonElement>('[data-invia]')!;
  const fatto = root.querySelector<HTMLElement>('[data-vista="fatto"]')!;
  const notaSalute = form.querySelector<HTMLElement>('[data-nota-salute]');
  const uid = root.id;
  let voci: Voce[] = [];
  let limiti = { maxFile: 10, maxMB: 15, tipi: ['application/pdf', 'image/jpeg', 'image/png'] };
  let gettone: string | null = null;
  let inviando = false;

  // ---------- 1. Il caricamento è attivo davvero? ----------
  const stato = await leggiStato();
  if (!stato || !stato.caricamento.attivo || !stato.gettone) { vista('spento'); return; }
  limiti = stato.caricamento;
  gettone = stato.gettone;
  vista('modulo');
  form.querySelector<HTMLElement>('[data-limiti]')!.textContent =
    `PDF, JPG o PNG · fino a ${limiti.maxFile} file · massimo ${limiti.maxMB} MB ciascuno.`;
  if (stato.caricamento.prova) fatto.querySelector<HTMLElement>('[data-prova]')!.hidden = false;

  // ---------- 2. Checklist ----------
  const servizioCorrente = () => servizi.find((s) => s.slug === (sel ? sel.value : root.dataset.servizio));
  const aggiornaConta = () => {
    const tot = listaCheck.querySelectorAll('input').length;
    const fatti = listaCheck.querySelectorAll('input:checked').length;
    contaCheck.textContent = tot ? `(${fatti} di ${tot} pronti)` : '';
  };
  const disegnaChecklist = () => {
    const s = servizioCorrente();
    if (notaSalute) notaSalute.hidden = !s?.datiParticolari;
    if (!sel) { aggiornaConta(); return; }
    listaCheck.innerHTML = '';
    if (!s || !s.documenti.length) { checklist.hidden = true; return; }
    s.documenti.forEach((d, i) => {
      const li = document.createElement('li');
      const id = `${uid}-doc-${i}`;
      li.innerHTML = `<input type="checkbox" id="${id}" name="documenti"><label for="${id}"><span class="checklist__box" aria-hidden="true"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg></span><span></span></label>`;
      (li.querySelector('input') as HTMLInputElement).value = d.voce;
      const testo = li.querySelector('label > span:last-child')!;
      testo.textContent = d.voce;
      if (d.nota) { const sm = document.createElement('small'); sm.textContent = d.nota; testo.appendChild(sm); }
      listaCheck.appendChild(li);
    });
    checklist.hidden = false;
    aggiornaConta();
  };
  sel?.addEventListener('change', () => { disegnaChecklist(); pulisciErrore('servizio'); });
  listaCheck.addEventListener('change', aggiornaConta);
  disegnaChecklist();

  form.querySelector('[data-stampa]')?.addEventListener('click', () => {
    const s = servizioCorrente();
    if (!s) return;
    stampa(`Documenti da preparare — ${s.titolo}`, `<ul>${s.documenti.map((d) => `<li>☐ ${esc(d.voce)}${d.nota ? ` <em>(${esc(d.nota)})</em>` : ''}</li>`).join('')}</ul>`);
  });

  // ---------- 3. File ----------
  const errFile = form.querySelector<HTMLElement>('[data-errore-per="file"]')!;
  const tipoDi = (f: File) => f.type || TIPI_EST[f.name.toLowerCase().split('.').pop() ?? ''] || '';
  function aggiungi(files: FileList | File[]) {
    errFile.textContent = '';
    const problemi: string[] = [];
    for (const f of Array.from(files)) {
      const tipo = tipoDi(f);
      if (voci.length >= limiti.maxFile) { problemi.push(`Puoi caricare al massimo ${limiti.maxFile} file per volta.`); break; }
      if (!limiti.tipi.includes(tipo)) { problemi.push(`"${f.name}" non è un PDF, JPG o PNG.`); continue; }
      if (f.size === 0) { problemi.push(`"${f.name}" è vuoto.`); continue; }
      if (f.size > limiti.maxMB * 1024 * 1024) { problemi.push(`"${f.name}" pesa ${mb(f.size)}: il massimo è ${limiti.maxMB} MB.`); continue; }
      if (voci.some((v) => v.file.name === f.name && v.file.size === f.size)) continue;
      voci.push(creaVoce(f, tipo));
    }
    if (problemi.length) errFile.textContent = problemi.join(' ');
  }
  function creaVoce(file: File, tipo: string): Voce {
    const li = document.createElement('li');
    const v: Voce = { file, li };
    let anteprima: HTMLElement;
    if (tipo.startsWith('image/')) {
      v.url = URL.createObjectURL(file);
      const img = document.createElement('img');
      img.className = 'anteprima'; img.alt = ''; img.src = v.url;
      anteprima = img;
    } else {
      anteprima = document.createElement('span');
      anteprima.className = 'anteprima'; anteprima.setAttribute('aria-hidden', 'true'); anteprima.textContent = 'PDF';
    }
    const info = document.createElement('div');
    info.innerHTML = '<div class="nome"></div><div class="dettaglio" data-stato-file></div><div class="barra" aria-hidden="true"><span></span></div>';
    info.querySelector('.nome')!.textContent = file.name;
    info.querySelector('[data-stato-file]')!.textContent = `${mb(file.size)} · pronto`;
    const togli = document.createElement('button');
    togli.type = 'button'; togli.className = 'togli';
    togli.innerHTML = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>';
    togli.setAttribute('aria-label', `Togli ${file.name}`);
    togli.addEventListener('click', () => {
      voci = voci.filter((x) => x !== v);
      if (v.url) URL.revokeObjectURL(v.url);
      li.remove();
      invia.focus();
    });
    li.append(anteprima, info, togli);
    listaFile.appendChild(li);
    if (!ridotto()) li.animate([{ opacity: 0, transform: 'translateY(12px) scale(0.98)' }, { opacity: 1, transform: 'none' }], { duration: 420, easing: 'cubic-bezier(0.22,1,0.36,1)' });
    return v;
  }
  const statoFile = (v: Voce, testo: string, perc?: number, classe?: 'ok' | 'ko') => {
    v.li.querySelector('[data-stato-file]')!.textContent = `${mb(v.file.size)} · ${testo}`;
    if (perc !== undefined) (v.li.querySelector('.barra span') as HTMLElement).style.transform = `scaleX(${perc})`;
    v.li.classList.remove('ok', 'ko');
    if (classe) v.li.classList.add(classe);
  };

  form.querySelector('[data-scegli]')!.addEventListener('click', () => inFile.click());
  form.querySelector('[data-scatta]')!.addEventListener('click', () => inFoto.click());
  [inFile, inFoto].forEach((i) => i.addEventListener('change', () => { if (i.files) aggiungi(i.files); i.value = ''; }));
  ['dragenter', 'dragover'].forEach((ev) => zona.addEventListener(ev, (e) => { e.preventDefault(); zona.classList.add('zona--sopra'); }));
  ['dragleave', 'drop'].forEach((ev) => zona.addEventListener(ev, (e) => { e.preventDefault(); zona.classList.remove('zona--sopra'); }));
  zona.addEventListener('drop', (e) => { const dt = (e as DragEvent).dataTransfer; if (dt?.files) aggiungi(dt.files); });

  // ---------- 4. Validazione ----------
  const campo = (n: string) => form.elements.namedItem(n) as HTMLInputElement | null;
  const errore = (n: string, msg: string) => {
    const p = form.querySelector<HTMLElement>(`[data-errore-per="${n}"]`);
    if (p) p.textContent = msg;
    const c = campo(n);
    if (c && 'setAttribute' in c) c.setAttribute('aria-invalid', msg ? 'true' : 'false');
  };
  const pulisciErrore = (n: string) => errore(n, '');
  ['nome', 'telefono', 'email', 'consensoPrivacy', 'consensoSalute'].forEach((n) => campo(n)?.addEventListener('input', () => pulisciErrore(n)));
  function valida(): boolean {
    let primo: HTMLElement | null = null;
    const segna = (n: string, msg: string, el?: HTMLElement | null) => { errore(n, msg); if (msg && !primo) primo = el ?? campo(n); };
    if (sel) segna('servizio', sel.value ? '' : 'Scegli il servizio.', sel);
    segna('file', voci.length ? '' : 'Aggiungi almeno un file.', form.querySelector('[data-scegli]'));
    const nome = campo('nome')!.value.trim();
    segna('nome', nome.length >= 3 ? '' : 'Scrivi nome e cognome.');
    const tel = campo('telefono')!.value.trim();
    segna('telefono', /^[+()\d\s./-]{6,30}$/.test(tel) && (tel.match(/\d/g)?.length ?? 0) >= 6 ? '' : 'Scrivi un numero di telefono valido.');
    const em = campo('email')!.value.trim();
    segna('email', !em || /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(em) ? '' : "L'indirizzo email non sembra corretto.");
    segna('consensoPrivacy', campo('consensoPrivacy')!.checked ? '' : 'Serve la conferma per poter ricevere i documenti.');
    segna('consensoSalute', campo('consensoSalute')!.checked ? '' : 'Serve il consenso per i dati relativi alla salute.');
    if (primo) (primo as HTMLElement).focus();
    return !primo;
  }

  // ---------- 5. Invio reale ----------
  const putXhr = (url: string, intestazioni: Record<string, string>, file: File, prog: (p: number) => void) =>
    new Promise<void>((ok, ko) => {
      const x = new XMLHttpRequest();
      x.open('PUT', url);
      Object.entries(intestazioni).forEach(([k, val]) => x.setRequestHeader(k, val));
      x.upload.onprogress = (e) => { if (e.lengthComputable) prog(e.loaded / e.total); };
      x.onload = () => (x.status >= 200 && x.status < 300 ? ok() : ko(new Error(String(x.status))));
      x.onerror = () => ko(new Error('rete'));
      x.ontimeout = () => ko(new Error('timeout'));
      x.timeout = 10 * 60_000;
      x.send(file);
    });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (inviando) return;
    esito.innerHTML = '';
    if (!valida()) return;
    inviando = true;
    invia.disabled = true;
    form.setAttribute('aria-busy', 'true');
    messaggio('Sto preparando l\'invio protetto…');
    voci.forEach((v) => { v.li.querySelector<HTMLButtonElement>('.togli')!.hidden = true; statoFile(v, 'in attesa', 0); });
    try {
      const corpo = {
        gettone,
        servizio: sel ? sel.value : root.dataset.servizio,
        nome: campo('nome')!.value, telefono: campo('telefono')!.value, email: campo('email')!.value,
        note: (form.elements.namedItem('note') as HTMLTextAreaElement).value,
        sito_web: campo('sito_web')!.value,
        consensoPrivacy: campo('consensoPrivacy')!.checked, consensoSalute: campo('consensoSalute')!.checked,
        documenti: [...listaCheck.querySelectorAll<HTMLInputElement>('input:checked')].map((i) => i.value),
        files: voci.map((v) => ({ nome: v.file.name, tipo: tipoDi(v.file), dimensione: v.file.size })),
      };
      const r = await fetch('/api/upload/init', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(corpo) });
      const d = await r.json().catch(() => ({}));
      if (r.status === 503) { vista('spento'); return; }
      if (r.status === 422 && d.errori) {
        Object.entries(d.errori as Record<string, string>).forEach(([k, v]) => errore(k, v));
        messaggio('Controlla i campi segnati in rosso.', 'errore');
        throw new Error('validazione');
      }
      if (r.status === 429) { messaggio('Troppi invii in poco tempo. Riprova tra qualche minuto o chiamaci.', 'errore'); throw new Error('limite'); }
      if (!r.ok || !d.pratica) { messaggio('Non è stato possibile avviare l\'invio. Riprova o chiamaci.', 'errore'); throw new Error('init'); }

      messaggio('Caricamento in corso: non chiudere la pagina.');
      for (const c of d.caricamenti as { indice: number; url: string; intestazioni: Record<string, string> }[]) {
        const v = voci[c.indice];
        statoFile(v, 'caricamento 0%', 0);
        try {
          await putXhr(c.url, c.intestazioni, v.file, (p) => statoFile(v, `caricamento ${Math.round(p * 100)}%`, p));
          statoFile(v, 'controllo antivirus…', 1);
        } catch {
          statoFile(v, 'caricamento non riuscito', 1, 'ko');
        }
      }
      messaggio('Controllo di sicurezza dei file in corso…');
      const r2 = await fetch('/api/upload/complete', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ pratica: d.pratica }) });
      const f = await r2.json().catch(() => ({}));
      if (!r2.ok) { messaggio('Non abbiamo potuto confermare la ricezione. Riprova o chiamaci.', 'errore'); throw new Error('complete'); }
      (f.accettati as { indice: number }[]).forEach((a) => statoFile(voci[a.indice], 'ricevuto ✓', 1, 'ok'));
      (f.rifiutati as { indice: number; motivo: string }[]).forEach((a) => statoFile(voci[a.indice], `non accettato: ${a.motivo}`, 1, 'ko'));

      if (f.codice) {
        mostraFatto(f.codice, f.accettati.length, f.rifiutati);
      } else {
        messaggio('Nessun file è stato accettato: leggi il motivo accanto a ciascun file. Puoi riprovare o chiamarci.', 'errore');
        voci.forEach((v) => (v.li.querySelector<HTMLButtonElement>('.togli')!.hidden = false));
        ricaricaGettone();
      }
    } catch {
      voci.forEach((v) => (v.li.querySelector<HTMLButtonElement>('.togli')!.hidden = false));
      ricaricaGettone();
    } finally {
      inviando = false;
      invia.disabled = false;
      form.removeAttribute('aria-busy');
    }
  });

  async function ricaricaGettone() {
    statoPromessa = null;
    const s = await leggiStato();
    gettone = s?.gettone ?? gettone;
  }
  function messaggio(t: string, tipo?: 'errore') {
    esito.innerHTML = '';
    const p = document.createElement('p');
    p.className = tipo === 'errore' ? 'avviso avviso--errore' : 'avviso';
    p.textContent = t;
    esito.appendChild(p);
  }
  function mostraFatto(codice: string, n: number, rifiutati: { indice: number; motivo: string }[]) {
    fatto.querySelector('[data-codice]')!.textContent = codice;
    fatto.querySelector('[data-fatto-titolo]')!.textContent = n === 1 ? 'Abbiamo ricevuto 1 documento.' : `Abbiamo ricevuto ${n} documenti.`;
    const box = fatto.querySelector<HTMLElement>('[data-rifiutati-box]')!;
    const ul = fatto.querySelector<HTMLUListElement>('[data-rifiutati]')!;
    ul.innerHTML = '';
    rifiutati.forEach((r) => { const li = document.createElement('li'); li.textContent = `${voci[r.indice]?.file.name ?? 'File'}: ${r.motivo}`; ul.appendChild(li); });
    box.hidden = rifiutati.length === 0;
    vista('fatto');
    fatto.focus();
    if (!ridotto()) fatto.animate([{ opacity: 0, transform: 'translateY(20px)' }, { opacity: 1, transform: 'none' }], { duration: 600, easing: 'cubic-bezier(0.22,1,0.36,1)' });
    fatto.querySelector('[data-stampa-codice]')!.addEventListener('click', () =>
      stampa('Monza CED — codice pratica', `<p style="font-size:28pt;font-weight:800">${esc(codice)}</p><p>Documenti ricevuti: ${n}. Conserva questo codice.</p>`), { once: true });
  }
  fatto.querySelector('[data-ricomincia]')!.addEventListener('click', () => {
    voci.forEach((v) => v.url && URL.revokeObjectURL(v.url));
    voci = [];
    listaFile.innerHTML = '';
    esito.innerHTML = '';
    form.reset();
    disegnaChecklist();
    ricaricaGettone();
    vista('modulo');
    (sel ?? form.querySelector<HTMLElement>('[data-scegli]'))?.focus();
  });
});

function esc(s: string) { return s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]!)); }
function stampa(titolo: string, html: string) {
  const w = window.open('', '_blank', 'noopener=no,width=720,height=900');
  if (!w) { window.print(); return; }
  w.document.write(`<!doctype html><html lang="it"><head><meta charset="utf-8"><title>${esc(titolo)}</title><style>body{font:14pt/1.5 Verdana,sans-serif;padding:32px;color:#0e1a2b}h1{font:800 20pt Arial,sans-serif}li{margin:8px 0;list-style:none}</style></head><body><h1>${esc(titolo)}</h1>${html}<p style="margin-top:32px;font-size:11pt">Monza CED Srl · Via Solferino 11, 20900 Monza (MB) · 039 326628</p></body></html>`);
  w.document.close();
  w.focus();
  w.print();
}
