// Downloads royalty-free football images into public/photos/ for card backgrounds.
// Pixabay license = free, no attribution, self-host (we download, don't hotlink).
// Usage:  node scripts/fetch-images.mjs <PIXABAY_API_KEY>
//   or set PIXABAY_KEY env var. Get a free key at https://pixabay.com/api/docs/
import { writeFileSync, mkdirSync } from 'node:fs';

const KEY = process.argv[2] || process.env.PIXABAY_KEY;
if (!KEY) {
  console.error('Missing key. Run: node scripts/fetch-images.mjs <PIXABAY_API_KEY>');
  process.exit(1);
}

mkdirSync('public/photos', { recursive: true });

// Generic football imagery — stadiums, pitch, action, crowds. No specific players/logos.
const QUERIES = ['football stadium', 'soccer pitch', 'football match', 'stadium floodlights', 'soccer ball grass', 'football crowd'];
const PER = 12;      // per query
const TARGET = 24;   // total images to keep

async function search(q) {
  const url = `https://pixabay.com/api/?key=${KEY}&q=${encodeURIComponent(q)}&image_type=photo&orientation=horizontal&category=sports&safesearch=true&per_page=${PER}&min_width=1200`;
  const r = await fetch(url);
  if (!r.ok) { console.error(`Pixabay ${r.status} for "${q}"`); return []; }
  const d = await r.json();
  return (d.hits || []).map((h) => h.largeImageURL || h.webformatURL).filter(Boolean);
}

async function download(url) {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return Buffer.from(await r.arrayBuffer());
}

const urls = new Set();
for (const q of QUERIES) {
  for (const u of await search(q)) { urls.add(u); if (urls.size >= TARGET * 2) break; }
}

let i = 0;
for (const u of urls) {
  if (i >= TARGET) break;
  try {
    const buf = await download(u);
    writeFileSync(`public/photos/${i}.jpg`, buf);
    console.log(`OK  photos/${i}.jpg (${(buf.length / 1024) | 0}KB)`);
    i++;
  } catch (e) {
    console.log(`skip: ${e.message}`);
  }
}
writeFileSync('public/photos/count.json', JSON.stringify({ count: i }));
console.log(`\nDone. ${i} royalty-free images -> public/photos/  (set PHOTO_COUNT=${i} in TransferCard)`);
