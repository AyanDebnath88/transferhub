import type { APIRoute } from 'astro';
import { CLUB_META } from '../lib/clubs';
import { LEAGUES } from '../lib/leagues';

const SITE = 'https://transferhub.club';

const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const clubPages = Object.keys(CLUB_META).map((name) => ({
  path: `/club/${slugify(name)}`, changefreq: 'daily', priority: '0.7',
}));
const leaguePages = Object.keys(LEAGUES).map((slug) => ({
  path: `/league/${slug}`, changefreq: 'daily', priority: '0.8',
}));

const PAGES = [
  { path: '',                changefreq: 'hourly',  priority: '1.0' },
  { path: '/confirmed',      changefreq: 'hourly',  priority: '0.9' },
  { path: '/rumours',        changefreq: 'hourly',  priority: '0.9' },
  { path: '/premier-league', changefreq: 'daily',   priority: '0.8' },
  ...leaguePages,
  { path: '/clubs',          changefreq: 'daily',   priority: '0.7' },
  { path: '/about',          changefreq: 'monthly', priority: '0.5' },
  { path: '/methodology',    changefreq: 'monthly', priority: '0.5' },
  ...clubPages,
  { path: '/attribution',    changefreq: 'monthly', priority: '0.4' },
  { path: '/privacy',        changefreq: 'monthly', priority: '0.3' },
  { path: '/terms',          changefreq: 'monthly', priority: '0.3' },
  { path: '/disclaimer',     changefreq: 'monthly', priority: '0.3' },
  { path: '/credits',        changefreq: 'monthly', priority: '0.3' },
  { path: '/contact',        changefreq: 'monthly', priority: '0.3' },
  // Error pages included so Google sees them as intentional, not crawl errors
  { path: '/404',            changefreq: 'yearly',  priority: '0.1' },
  { path: '/500',            changefreq: 'yearly',  priority: '0.1' },
];

export const GET: APIRoute = () => {
  const today = new Date().toISOString().split('T')[0];

  const urls = PAGES.map(p => `
  <url>
    <loc>${SITE}${p.path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`).join('');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
${urls}
</urlset>`;

  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
};
