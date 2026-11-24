/**
 * Pillole "Di cosa hai bisogno?" → riordino delle schede (GSAP Flip) + pannello di dettaglio
 * con precedente/successivo. Tutto funziona anche da tastiera; con "riduci movimento" niente animazioni.
 */
import { gsap } from 'gsap';
import { Flip } from 'gsap/Flip';

gsap.registerPlugin(Flip);
const ridotto = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

interface Dato {
  slug: string; titolo: string; titoloPagina: string; gruppo: string; gruppoNome: string; riassunto: string;
  intro: string; perChi: string[]; prenota: string; carica: string; ndoc: number;
}

document.querySelectorAll<HTMLElement>('[data-percorso]').forEach((root) => {
  const dati: Dato[] = JSON.parse(root.querySelector('[data-servizi-json]')?.textContent || '[]');
  const lista = root.querySelector<HTMLUListElement>('[data-schede]')!;
  const pillole = [...root.querySelectorAll<HTMLButtonElement>('[data-situazione]')];
  const esito = root.querySelector<HTMLElement>('[data-esito]')!;
  const ordineOriginale = [...lista.querySelectorAll<HTMLLIElement>('.scheda')];
  const nomi: Record<string, string> = {};
  pillole.forEach((p) => (nomi[p.dataset.situazione!] = p.textContent!.trim()));

  // ---------- Filtro ----------
  function filtra(sit: string, annuncia = true) {
    const schede = [...lista.querySelectorAll<HTMLLIElement>('.scheda')];
    const stato = ridotto() ? null : Flip.getState(schede, { props: 'opacity' });
    lista.querySelector('.separatore')?.remove();
    if (sit === 'tutti') {
      lista.classList.remove('schede--filtrate');
      ordineOriginale.forEach((li) => { li.classList.remove('in-evidenza'); lista.appendChild(li); });
    } else {
      lista.classList.add('schede--filtrate');
      const si = ordineOriginale.filter((li) => li.dataset.situazioni?.split(' ').includes(sit));
      const no = ordineOriginale.filter((li) => !si.includes(li));
      si.forEach((li) => { li.classList.add('in-evidenza'); lista.appendChild(li); });
      if (no.length) {
        const sep = document.createElement('li');
        sep.className = 'separatore';
        sep.setAttribute('aria-hidden', 'true');
        sep.textContent = 'Altri servizi';
        lista.appendChild(sep);
      }
      no.forEach((li) => { li.classList.remove('in-evidenza'); lista.appendChild(li); });
    }
    if (stato) {
      Flip.from(stato, { duration: 0.7, ease: 'expo.out', stagger: 0.015, absolute: false, nested: true, prune: true });
    }
    if (annuncia) {
      const n = sit === 'tutti' ? ordineOriginale.length : lista.querySelectorAll('.in-evidenza').length;
      esito.textContent = sit === 'tutti'
        ? `Tutti i ${n} servizi.`
        : `${nomi[sit]}: ${n} servizi in evidenza, in cima all'elenco. Gli altri servizi restano qui sotto.`;
    }
  }

  pillole.forEach((p) =>
    p.addEventListener('click', () => {
      pillole.forEach((q) => q.setAttribute('aria-pressed', String(q === p)));
      filtra(p.dataset.situazione!);
      if (!ridotto()) gsap.fromTo(p, { scale: 0.92 }, { scale: 1, duration: 0.5, ease: 'back.out(3)' });
    }),
  );

  // ---------- Pannello di dettaglio ----------
  const dlg = root.querySelector<HTMLDialogElement>('[data-pannello]')!;
  const q = <T extends Element = HTMLElement>(s: string) => dlg.querySelector<T>(s)!;
  let corrente = 0;
  let origine: HTMLElement | null = null;
  const ordineVisibile = () =>
    [...lista.querySelectorAll<HTMLLIElement>('.scheda')].map((li) => li.dataset.slug!).map((slug) => dati.findIndex((d) => d.slug === slug));

  function mostra(indice: number, direzione = 0) {
    const d = dati[indice];
    if (!d) return;
    corrente = indice;
    const scheda = lista.querySelector<HTMLElement>(`.scheda[data-slug="${d.slug}"]`)!;
    dlg.style.setProperty('--g', `var(--g-${d.gruppo})`);
    dlg.style.setProperty('--ga', `var(--g-${d.gruppo}-a)`);
    q('[data-p-icona]').innerHTML = scheda.querySelector('.scheda__arco')!.innerHTML;
    q('[data-p-area]').textContent = d.gruppoNome;
    q('[data-p-titolo]').textContent = d.titoloPagina;
    q('[data-p-intro]').textContent = d.intro || d.riassunto;
    const ul = q('[data-p-perchi]');
    ul.innerHTML = '';
    d.perChi.forEach((t) => { const li = document.createElement('li'); li.textContent = t; ul.appendChild(li); });
    q('[data-p-perchi-box]').hidden = d.perChi.length === 0;
    q<HTMLAnchorElement>('[data-p-pagina]').href = `/servizi/${d.slug}`;
    q<HTMLAnchorElement>('[data-p-prenota]').href = d.prenota;
    q<HTMLAnchorElement>('[data-p-carica]').href = d.carica;
    const ordine = ordineVisibile();
    const pos = ordine.indexOf(indice);
    const prec = dati[ordine[(pos - 1 + ordine.length) % ordine.length]];
    const succ = dati[ordine[(pos + 1) % ordine.length]];
    q('[data-prec-nome]').textContent = prec.titolo;
    q('[data-succ-nome]').textContent = succ.titolo;
    q('[data-conta-pannello]').textContent = `${pos + 1} di ${ordine.length}`;
    if (direzione && !ridotto()) {
      gsap.fromTo(q('.pannello__corpo'), { opacity: 0, x: 40 * direzione }, { opacity: 1, x: 0, duration: 0.45, ease: 'expo.out' });
    }
  }

  function vai(passo: number) {
    const ordine = ordineVisibile();
    const pos = ordine.indexOf(corrente);
    mostra(ordine[(pos + passo + ordine.length) % ordine.length], passo);
    q<HTMLElement>('[data-p-titolo]').focus({ preventScroll: true });
  }

  q('[data-p-titolo]').setAttribute('tabindex', '-1');
  lista.addEventListener('click', (e) => {
    const a = (e.target as HTMLElement).closest<HTMLAnchorElement>('[data-apri]');
    if (!a) return;
    const me = e as MouseEvent;
    if (me.metaKey || me.ctrlKey || me.shiftKey || me.altKey || me.button !== 0) return; // nuova scheda: link normale
    e.preventDefault();
    origine = a;
    mostra(dati.findIndex((d) => d.slug === a.dataset.apri));
    dlg.showModal();
  });
  q('[data-chiudi]').addEventListener('click', () => dlg.close());
  q('[data-prec]').addEventListener('click', () => vai(-1));
  q('[data-succ]').addEventListener('click', () => vai(1));
  dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); });
  dlg.addEventListener('keydown', (e) => {
    if ((e.target as HTMLElement).closest('a,button,input')) return;
    if (e.key === 'ArrowRight') vai(1);
    if (e.key === 'ArrowLeft') vai(-1);
  });
  dlg.addEventListener('close', () => {
    // Il focus torna alla scheda del servizio mostrato per ultimo
    const s = lista.querySelector<HTMLElement>(`.scheda[data-slug="${dati[corrente]?.slug}"] a`) ?? origine;
    // dopo il ripristino automatico del focus del browser
    setTimeout(() => s?.focus(), 0);
  });
});
