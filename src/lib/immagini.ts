import type { ImageMetadata } from 'astro';
import { getImmagini } from './content';

const files = import.meta.glob<{ default: ImageMetadata }>('/src/assets/img/*.{jpg,jpeg,png}', { eager: true });

export function img(nome: string): ImageMetadata {
  const f = files[`/src/assets/img/${nome}.jpg`] ?? files[`/src/assets/img/${nome}.png`] ?? files['/src/assets/img/dichiarazioni.jpg'];
  return f.default;
}
export function alt(nome: string): string {
  return getImmagini().find((i) => i.nome === nome)?.descrizione ?? '';
}
