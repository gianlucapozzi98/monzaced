/**
 * Genera favicon e immagine Open Graph a partire dal logo originale (monza-ced.svg).
 * Il logo non viene ridisegnato: si usano i suoi tracciati ("M" di MONZA e "C" di CED per la favicon).
 * Uso: node scripts/genera-icone.mjs
 */
import sharp from 'sharp';
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';

const logo = readFileSync(new URL('../src/assets/brand/monza-ced.svg', import.meta.url), 'utf8');
const paths = [...logo.matchAll(/<path d="([^"]+)" fill="([^"]+)"/g)].map((m) => ({ d: m[1], fill: m[2] }));
const monza = paths.find((p) => p.fill === 'white').d;
const ced = paths.find((p) => p.fill === '#2E81FF').d;
const primo = (d) => d.slice(0, d.indexOf('Z') + 1); // primo glifo del tracciato
const M = primo(monza);
const C = primo(ced);

// Favicon: "M" bianca + "C" corsiva blu su arco scuro (stessi tracciati del logo)
const fav = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="16" fill="#0e1a2b"/>
  <g transform="translate(5 19) scale(0.86)"><path d="${M}" fill="#ffffff"/></g>
  <g transform="translate(-112 19) scale(0.86)"><path d="${C}" fill="#2E81FF"/></g>
</svg>`;
mkdirSync('public/og', { recursive: true });
writeFileSync('public/favicon.svg', fav);
await sharp(Buffer.from(fav)).resize(32, 32).png().toFile('public/favicon-32.png');
await sharp(Buffer.from(fav)).resize(180, 180).png().toFile('public/apple-touch-icon.png');
await sharp(Buffer.from(fav)).resize(512, 512).png().toFile('public/icon-512.png');

// Open Graph 1200×630: foto nell'arco + logo originale su fondo scuro + filo blu
const W = 1200, H = 630;
const foto = await sharp('src/assets/img/hero-coppia-giovane.jpg').resize(560, 600, { fit: 'cover', position: 'centre' }).toBuffer();
const arco = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="560" height="600"><path d="M0 600V280A280 280 0 0 1 560 280V600Z" fill="#fff"/></svg>`);
const fotoArco = await sharp(foto).composite([{ input: arco, blend: 'dest-in' }]).png().toBuffer();
const sfondo = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <rect width="${W}" height="${H}" fill="#0e1a2b"/>
  <path d="M-10 470 C 160 380, 300 560, 470 470 S 560 300, 640 330" fill="none" stroke="#2E81FF" stroke-width="6" stroke-linecap="round"/>
  <g transform="translate(70 120) scale(1.9)">${logo.replace(/<\?xml[^>]*>/, '').replace(/<svg[^>]*>/, '').replace('</svg>', '')}</g>
</svg>`);
await sharp(sfondo).composite([{ input: fotoArco, left: 600, top: 30 }]).jpeg({ quality: 86, mozjpeg: true }).toFile('public/og/monza-ced.jpg');
console.log('Icone e immagine OG generate.');
