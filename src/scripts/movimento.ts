/**
 * Movimento del sito. Una sola grammatica: curve e durate da global.css.
 * - Con "riduci movimento" non parte nulla: tutto è già visibile e fermo.
 * - Solo transform, opacity, clip-path e stroke-dashoffset.
 * - Le animazioni legate allo scroll si fermano da sole fuori schermo (ScrollTrigger).
 */
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

const ridotto = window.matchMedia('(prefers-reduced-motion: reduce)');
const EASE = 'expo.out';
const EASE_IO = 'power3.inOut';

declare global {
  interface Window { __lenis?: Lenis }
}

function avvia() {
  if (ridotto.matches) {
    document.documentElement.classList.remove('js-motion');
    return;
  }
  gsap.registerPlugin(ScrollTrigger);
  document.documentElement.classList.add('movimento-pronto');

  // Scorrimento morbido (solo puntatore; sul touch resta quello nativo)
  const lenis = new Lenis({
    duration: 1.05,
    easing: (t) => 1 - Math.pow(1 - t, 4),
    anchors: { offset: -110 },
    syncTouch: false,
    // I gesti dentro pannelli, menu e finestre (<dialog>) li gestisce il browser:
    // con Lenis in pausa (dialog aperto) altrimenti verrebbero annullati e il dito non scorrerebbe.
    prevent: (node: HTMLElement) => node.nodeName === 'DIALOG',
  });
  window.__lenis = lenis;
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
  // Con una finestra di dialogo aperta, la pagina sotto non scorre
  new MutationObserver(() => {
    const aperto = !!document.querySelector('dialog[open]');
    aperto ? lenis.stop() : lenis.start();
  }).observe(document.body, { subtree: true, attributes: true, attributeFilter: ['open'] });

  rivelazioni();
  fili();
  parallasse();
  porta();

  // Ricalcola dopo il caricamento di font e immagini
  window.addEventListener('load', () => ScrollTrigger.refresh());
  document.fonts?.ready.then(() => ScrollTrigger.refresh());
}

function rivelazioni() {
  gsap.utils.toArray<HTMLElement>('[data-rivela]').forEach((el) => {
    const tipo = el.dataset.rivela;
    const ritardo = Number(el.dataset.ritardo ?? 0);
    const props: gsap.TweenVars =
      tipo === 'arco'
        ? { clipPath: 'inset(0% 0 0 0 round 999px 999px 0px 0px)', duration: 1.3, ease: EASE_IO }
        : { opacity: 1, y: 0, duration: 0.9, ease: EASE };
    gsap.to(el, { ...props, delay: ritardo, scrollTrigger: { trigger: el, start: 'top 88%', once: true } });
  });
}

function fili() {
  gsap.utils.toArray<SVGPathElement>('[data-filo] path[data-traccia]').forEach((p) => {
    const svg = p.closest('[data-filo]') as SVGElement;
    p.style.strokeDasharray = '1';
    p.style.strokeDashoffset = '1';
    gsap.to(p, {
      strokeDashoffset: 0,
      ease: 'none',
      scrollTrigger: {
        trigger: (svg.dataset.trigger && document.querySelector(svg.dataset.trigger)) || svg.parentElement || svg,
        start: svg.dataset.inizio ?? 'top 75%',
        end: svg.dataset.fine ?? 'bottom 60%',
        scrub: 0.8,
      },
    });
  });
}

function parallasse() {
  const mm = gsap.matchMedia();
  mm.add('(min-width: 900px)', () => {
    gsap.utils.toArray<HTMLElement>('[data-parallasse]').forEach((el) => {
      const v = Number(el.dataset.parallasse || 0.15);
      gsap.fromTo(el, { yPercent: v * 50 }, {
        yPercent: -v * 50,
        ease: 'none',
        scrollTrigger: { trigger: el.parentElement || el, start: 'top bottom', end: 'bottom top', scrub: true },
      });
    });
  });
}

/** Hero: la "porta" ad arco si apre fino a tutto schermo mentre si scorre (solo schermi ampi). */
function porta() {
  const hero = document.querySelector<HTMLElement>('[data-hero]');
  if (!hero) return;
  const mm = gsap.matchMedia();
  mm.add('(min-width: 1024px) and (min-height: 620px)', () => {
    // La "porta" (hero alto quanto lo schermo) solo se il contenuto ci sta davvero:
    // su schermi bassi resta l'hero statico, senza scritte sotto la barra o sovrapposte.
    const scena = hero.querySelector<HTMLElement>('[data-hero-scena]')!;
    if (scena.getBoundingClientRect().height > window.innerHeight + 2) return;
    const foto = hero.querySelector<HTMLElement>('[data-porta]')!;
    const testo = hero.querySelector<HTMLElement>('[data-hero-testo]')!;
    const frase = hero.querySelector<HTMLElement>('[data-hero-frase]')!;
    const velo = hero.querySelector<HTMLElement>('[data-hero-velo]')!;
    const cerchio = hero.querySelector<HTMLElement>('[data-hero-cerchio]');
    const filo = hero.querySelector<SVGElement>('[data-hero-filo]');
    const invito = hero.querySelector<HTMLElement>('[data-hero-invito]');
    hero.classList.add('hero--animata');
    ScrollTrigger.refresh();
    gsap.set(frase, { opacity: 0, y: 40 });
    gsap.set(velo, { opacity: 0 });
    const tl = gsap.timeline({
      defaults: { ease: 'none' },
      // Nessun pin (che sposterebbe gli elementi nel DOM): la scena è "sticky" dentro un hero più alto
      scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom bottom', scrub: 0.6 },
    });
    // Valori iniziali espliciti: all'avvio l'ingresso CSS è ancora in corso e i valori calcolati non sono quelli di riposo
    tl.fromTo(foto, { '--p': 0 }, { '--p': 1, duration: 1 }, 0)
      .fromTo(testo, { y: 0, opacity: 1 }, { y: -90, opacity: 0, duration: 0.55, immediateRender: false }, 0)
      .fromTo([cerchio, filo, invito].filter(Boolean), { opacity: 1 }, { opacity: 0, duration: 0.3, immediateRender: false }, 0)
      .fromTo(velo, { opacity: 0 }, { opacity: 1, duration: 0.5, immediateRender: false }, 0.45)
      .fromTo(frase, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.45, immediateRender: false }, 0.55);
    return () => { hero.classList.remove('hero--animata'); };
  });
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', avvia);
else avvia();
