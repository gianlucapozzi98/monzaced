// @ts-check
import { defineConfig, fontProviders } from 'astro/config';
import node from '@astrojs/node';
import vercel from '@astrojs/vercel';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import keystatic from '@keystatic/astro';
import { readFileSync } from 'node:fs';
import { load as yamlLoad } from 'js-yaml';

const SITE = process.env.SITE_URL ?? 'https://monzaced.it';

// Il pannello Keystatic è attivo:
// - sempre in sviluppo (`astro dev`), con salvataggio sui file locali;
// - in produzione solo in modalità GitHub (PUBLIC_KEYSTATIC_STORAGE=github), con login GitHub.
// In produzione senza GitHub il pannello NON viene pubblicato: scriverebbe sul server.
const isDev = process.argv.includes('dev');
const cmsEnabled = isDev || process.env.PUBLIC_KEYSTATIC_STORAGE === 'github';

// La pagina "Convenzioni e offerte" entra nella sitemap solo se pubblicata dal pannello.
const convenzioni = /** @type {{pubblicata?: boolean}} */ (
  yamlLoad(readFileSync(new URL('./src/content/convenzioni.yaml', import.meta.url), 'utf8'))
);

const fontFile = (/** @type {string} */ name) => `@fontsource-variable/${name}`;

// Su Vercel (variabile VERCEL impostata in build) si usa l'adapter Vercel: pagine statiche + funzioni.
// Altrove l'adapter Node, avviato da server.mjs.
const suVercel = !!process.env.VERCEL;
// Domini di Vercel (anteprime e dominio *.vercel.app del progetto), per il controllo anti-CSRF
const dominiVercel = [process.env.VERCEL_URL, process.env.VERCEL_BRANCH_URL, process.env.VERCEL_PROJECT_PRODUCTION_URL]
  .filter(Boolean)
  .map((h) => ({ hostname: String(h), protocol: 'https' }));

export default defineConfig({
  site: SITE,
  output: 'static',
  trailingSlash: 'never',
  build: { format: 'preserve', inlineStylesheets: 'always' }, // CSS in linea: nessuna richiesta che blocca il primo disegno
  adapter: suVercel
    ? vercel({ maxDuration: 60 }) // il controllo antivirus dei file può richiedere qualche secondo
    : node({ mode: 'standalone', bodySizeLimit: 20 * 1024 * 1024 }),
  integrations: [
    ...(cmsEnabled ? [react(), keystatic()] : []),
    sitemap({
      filter: (page) =>
        !/\/(area-studio|keystatic|api)(\/|$)/.test(page) &&
        !/\/404$/.test(page) &&
        (convenzioni?.pubblicata || !/\/convenzioni-offerte$/.test(page)),
    }),
  ],
  redirects: {
    // Servizio rimosso su richiesta del cliente: l'URL storico va alla panoramica.
    '/servizi/rilascio-spid-firma-digitale': { status: 301, destination: '/servizi' },
  },
  security: {
    checkOrigin: true,
    // Host accettati: senza questo elenco Astro non si fida dell'host e il controllo anti-CSRF respinge i moduli.
    allowedDomains: [
      { hostname: new URL(SITE).hostname, protocol: new URL(SITE).protocol.replace(':', '') },
      { hostname: `www.${new URL(SITE).hostname.replace(/^www\./, '')}`, protocol: 'https' },
      { hostname: 'localhost' },
      { hostname: '127.0.0.1' },
      ...dominiVercel,
    ],
    // CSP con hash per script e stili. Con il pannello attivo in produzione (GitHub) si disattiva,
    // perché l'interfaccia del pannello usa stili inline: resta la CSP di base impostata da server.mjs.
    csp: cmsEnabled
      ? false
      : {
          algorithm: 'SHA-256',
          directives: [
            "default-src 'self'",
            "img-src 'self' data: blob:",
            "font-src 'self'",
            `connect-src 'self'${process.env.S3_ENDPOINT ? ' ' + new URL(process.env.S3_ENDPOINT).origin : ''}`,
            'frame-src https://www.openstreetmap.org',
            "form-action 'self'",
            "base-uri 'self'",
            "object-src 'none'",
          ],
        },
  },
  prefetch: { prefetchAll: false, defaultStrategy: 'hover' },
  fonts: [
    {
      provider: fontProviders.local(),
      name: 'Montserrat',
      cssVariable: '--font-display',
      fallbacks: ['Arial', 'sans-serif'],
      display: 'swap',
      options: {
        variants: [
          { src: [`${fontFile('montserrat')}/files/montserrat-latin-wght-normal.woff2`], weight: '100 900', style: 'normal' },
          { src: [`${fontFile('montserrat')}/files/montserrat-latin-wght-italic.woff2`], weight: '100 900', style: 'italic' },
        ],
      },
    },
    {
      provider: fontProviders.local(),
      name: 'Atkinson Hyperlegible Next',
      cssVariable: '--font-body',
      fallbacks: ['Verdana', 'sans-serif'],
      display: 'swap',
      options: {
        variants: [
          { src: [`${fontFile('atkinson-hyperlegible-next')}/files/atkinson-hyperlegible-next-latin-wght-normal.woff2`], weight: '200 800', style: 'normal' },
          { src: [`${fontFile('atkinson-hyperlegible-next')}/files/atkinson-hyperlegible-next-latin-wght-italic.woff2`], weight: '200 800', style: 'italic' },
        ],
      },
    },
  ],
  vite: {
    ssr: { external: ['nodemailer'] },
  },
});
