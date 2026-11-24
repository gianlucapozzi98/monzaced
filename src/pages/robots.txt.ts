import type { APIRoute } from 'astro';
export const GET: APIRoute = ({ site }) => {
  const base = (site ?? new URL('https://monzaced.it')).origin;
  return new Response(
    [
      'User-agent: *',
      'Allow: /',
      'Disallow: /area-studio',
      'Disallow: /api/',
      'Disallow: /keystatic',
      '',
      `Sitemap: ${base}/sitemap-index.xml`,
      '',
    ].join('\n'),
    { headers: { 'content-type': 'text/plain; charset=utf-8' } },
  );
};
