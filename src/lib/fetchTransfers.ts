import Parser from 'rss-parser';
import { FEED_SOURCES } from './feeds';
import { isTransferRelated, isSoccerStory, processItem, buildOriginalSummary } from './processor';
import type { Transfer } from './types';

const parser = new Parser({
  customFields: {
    item: [
      ['media:content', 'media'],
      ['media:thumbnail', 'mediaThumbnail'],
      ['enclosure', 'enclosure'],
      ['content:encoded', 'contentEncoded'],
    ],
  },
  timeout: 8000,
});

const LOW_QUALITY_PATTERNS = [
  /[?&](w|width)=([0-9]{1,2}|1[0-9]{2})\b/i,
  /[?&](h|height)=([0-9]{1,2}|1[0-9]{2})\b/i,
  /[?&]s=([0-9]{1,3})\b/i,
  /\/(\d{2,3})x(\d{2,3})\//,
  /thumbnail|thumb(?!nail)|icon|avatar|sprite/i,
  /\.gif$/i,
  /1x1|pixel|tracking|beacon/i,
  /gravatar\.com/i,
  /placeholder/i,
];

const HIGH_QUALITY_PATTERNS = [
  /[?&](w|width)=([3-9]\d{2,}|\d{4,})\b/i,
  /\/([4-9]\d{2}|[1-9]\d{3})x/,
  /[?&]quality=[6-9]\d/i,
  /\/standard\/(480|640|800|1024|1200)\//i,
];

function isAcceptableImage(url: string): boolean {
  if (!url || !url.startsWith('http')) return false;
  return !LOW_QUALITY_PATTERNS.some(p => p.test(url));
}

function scoreImage(url: string): number {
  let score = 1;
  if (HIGH_QUALITY_PATTERNS.some(p => p.test(url))) score += 3;
  if (/\.(jpg|jpeg|webp|png)/i.test(url)) score += 1;
  if (/images\.|media\.|cdn\.|img\.|ichef\./i.test(url)) score += 1;
  return score;
}

function upgradeImageUrl(url: string): string {
  url = url.replace(/(ichef\.bbci\.co\.uk\/[a-z]+\/standard\/)(\d+)\//, '$11024/');
  url = url.replace(/([?&]w=)\d{1,3}(&|$)/, '$11200$2');
  url = url.replace(/([?&]width=)\d{1,3}(&|$)/, '$11200$2');
  return url;
}

function decodeEntities(s: string | null | undefined): string {
  if (!s) return '';
  return s
    .replace(/&amp;/g, '&').replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'").replace(/&apos;/g, "'").replace(/&#x27;/gi, "'")
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&#x2F;/gi, '/').replace(/&hellip;/g, '…')
    .replace(/&nbsp;/g, ' ').replace(/&#8217;/g, '’').replace(/&#8216;/g, '‘')
    .replace(/&#8220;/g, '“').replace(/&#8221;/g, '”').replace(/&#8211;/g, '–')
    .replace(/&mdash;/g, '—').replace(/&ndash;/g, '–');
}

function extractImagesFromHtml(html: string): Array<{ url: string; score: number }> {
  const candidates: Array<{ url: string; score: number }> = [];
  if (!html) return candidates;

  const srcsetMatch = html.match(/srcset="([^"]+)"/i);
  if (srcsetMatch) {
    const parts = srcsetMatch[1].split(',').map(s => s.trim().split(/\s+/));
    const largest = parts.filter(p => p.length === 2).sort((a, b) => parseInt(b[1]) - parseInt(a[1]))[0];
    if (largest?.[0]) candidates.push({ url: upgradeImageUrl(largest[0]), score: scoreImage(largest[0]) + 2 });
  }

  const imgRe = /<img[^>]+src="([^"]+)"/gi;
  let m: RegExpExecArray | null;
  while ((m = imgRe.exec(html)) !== null) {
    const url = upgradeImageUrl(m[1]);
    candidates.push({ url, score: scoreImage(url) });
  }
  return candidates;
}

function extractImageFromRss(item: Record<string, unknown>): string | null {
  const candidates: Array<{ url: string; score: number }> = [];

  const tryMedia = (mm: unknown) => {
    if (!mm || typeof mm !== 'object') return;
    const attrs = (mm as Record<string, unknown>)['$'] as Record<string, string> | undefined;
    const url = attrs?.url ? upgradeImageUrl(attrs.url) : undefined;
    const medium = attrs?.medium;
    if (url && (medium === 'image' || !medium)) candidates.push({ url, score: scoreImage(url) });
  };

  const media = item.media;
  if (Array.isArray(media)) media.forEach(tryMedia);
  else tryMedia(media);
  tryMedia(item.mediaThumbnail);

  if (item.enclosure && typeof item.enclosure === 'object') {
    const enc = item.enclosure as Record<string, string>;
    if (enc.url && enc.type?.startsWith('image/')) {
      const url = upgradeImageUrl(enc.url);
      candidates.push({ url, score: scoreImage(url) });
    }
  }

  candidates.push(...extractImagesFromHtml((item.content || '') as string));
  candidates.push(...extractImagesFromHtml((item.contentEncoded || '') as string));

  const valid = candidates.filter(c => isAcceptableImage(c.url));
  if (!valid.length) return null;
  valid.sort((a, b) => b.score - a.score);
  return valid[0].url;
}

// Pull a <meta property|name="..."> content value (order-agnostic)
function readMeta(html: string, key: string): string | null {
  const a = html.match(new RegExp(`<meta[^>]+(?:property|name)=["']${key}["'][^>]*content=["']([^"']+)["']`, 'i'));
  if (a) return a[1];
  const b = html.match(new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]*(?:property|name)=["']${key}["']`, 'i'));
  return b ? b[1] : null;
}

// Fetch the article page and read OpenGraph image + description
async function fetchArticleMeta(url: string): Promise<{ image: string | null; description: string | null }> {
  if (!url || !url.startsWith('http')) return { image: null, description: null };
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 6000);
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; TransferHubBot/1.0; +https://transferhub.club)' },
    });
    clearTimeout(timer);
    if (!res.ok) return { image: null, description: null };
    // Only read the <head> — bail after ~80KB to keep it fast
    const html = (await res.text()).slice(0, 120_000);

    const rawImg = readMeta(html, 'og:image')
      || readMeta(html, 'og:image:url')
      || readMeta(html, 'twitter:image')
      || readMeta(html, 'twitter:image:src');
    const image = rawImg ? upgradeImageUrl(decodeEntities(rawImg)) : null;

    const rawDesc = readMeta(html, 'og:description') || readMeta(html, 'description');
    const description = rawDesc ? decodeEntities(rawDesc) : null;

    return { image, description };
  } catch {
    return { image: null, description: null };
  }
}

// Trim text to ~N words, clean of HTML
function toSummary(text: string, words = 60): string {
  const clean = decodeEntities(text).replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
  if (!clean) return '';
  const w = clean.split(' ');
  if (w.length <= words) return clean;
  return w.slice(0, words).join(' ').replace(/[,;:.\-–—]+$/, '') + '…';
}

type RawItem = { item: Record<string, unknown>; source: { name: string; confidence: number } };

// Pull raw items from all feeds, keeping only those passing `accept`
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // hide anything older than 7 days

async function gather(accept: (title: string, desc: string) => boolean): Promise<RawItem[]> {
  const seen = new Set<string>();
  const raw: RawItem[] = [];
  const now = Date.now();

  await Promise.allSettled(
    FEED_SOURCES.map(async (source) => {
      try {
        const feed = await parser.parseURL(source.url);
        for (const item of feed.items.slice(0, 20)) {
          const title = (item.title as string) || '';
          const description = (item.contentSnippet || item.content || item.summary || '') as string;
          if (!title) continue;
          // Age gate: drop stories older than 7 days (skip only when date is valid)
          const ts = new Date((item.isoDate || item.pubDate || '') as string).getTime();
          if (!isNaN(ts) && now - ts > MAX_AGE_MS) continue;
          if (!accept(title, description)) continue;

          const dedupeKey = title.toLowerCase().slice(0, 60);
          if (seen.has(dedupeKey)) continue;
          seen.add(dedupeKey);

          raw.push({ item: item as Record<string, unknown>, source });
        }
      } catch {
        // Feed unavailable — skip silently
      }
    })
  );
  return raw;
}

// Enrich raw items with OG image + summary (parallel), return sorted Transfers
async function enrich(raw: RawItem[]): Promise<Transfer[]> {
  const settled = await Promise.allSettled(
    raw.map(async ({ item, source }) => {
      const title = (item.title as string) || '';
      const rssDescription = (item.contentSnippet || item.content || item.summary || '') as string;
      const link = (item.link as string) || '';

      const meta = await fetchArticleMeta(link);

      const image =
        (meta.image && isAcceptableImage(meta.image) ? meta.image : null) ??
        extractImageFromRss(item);

      const transfer = processItem(
        title,
        rssDescription,
        link,
        (item.pubDate || item.isoDate || '') as string,
        source.name,
        source.confidence,
        image
      );
      // ORIGINAL TransferHub summary (not copied from the source article).
      transfer.summary = buildOriginalSummary(transfer);
      return transfer;
    })
  );

  return settled
    .filter((s): s is PromiseFulfilledResult<Transfer> => s.status === 'fulfilled')
    .map(s => s.value)
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
}

// Module-level caches so dev navigation + repeated calls don't re-fetch
const CACHE_TTL = 5 * 60 * 1000;
let transfersCache: { at: number; data: Transfer[] } | null = null;
let storiesCache: { at: number; data: Transfer[] } | null = null;

export async function fetchAllTransfers(): Promise<Transfer[]> {
  if (transfersCache && Date.now() - transfersCache.at < CACHE_TTL) return transfersCache.data;
  const data = await enrich(await gather(isTransferRelated));
  transfersCache = { at: Date.now(), data };
  return data;
}

// Fallback feed: latest top football stories regardless of transfer relevance.
// Used when there is no transfer news to show.
export async function fetchTopStories(limit = 12): Promise<Transfer[]> {
  if (storiesCache && Date.now() - storiesCache.at < CACHE_TTL) return storiesCache.data;
  // Any soccer story with a title (rejects NFL/NBA/etc); processItem tags type 'news'
  const data = (await enrich(await gather((title, desc) => title.trim().length > 0 && isSoccerStory(title, desc)))).slice(0, limit);
  storiesCache = { at: Date.now(), data };
  return data;
}
