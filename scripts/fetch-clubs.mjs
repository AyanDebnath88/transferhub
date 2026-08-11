// Pull club crest / logo images from Wikimedia Commons into public/clubs/.
// Used as the card image FALLBACK when no player photo matches a story
// (see clubImage() in src/lib/images.ts). Every file is credited to its
// Commons author + licence in src/data/imageCredits.json (keyed by club slug).
//
// Usage:
//   node scripts/fetch-clubs.mjs            # all clubs
//   node scripts/fetch-clubs.mjs Arsenal    # one club
//   node scripts/fetch-clubs.mjs --force     # overwrite existing
//   node scripts/fetch-clubs.mjs --dry       # preview, write nothing

import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const OUT = join(ROOT, 'public/clubs');
const CREDITS_PATH = join(ROOT, 'src/data/imageCredits.json');
const API = 'https://commons.wikimedia.org/w/api.php';
const UA = 'TransferHub/1.0 (https://transferhub.club; copyright-safe image bot) node';

// display name (matches CLUB_META) -> Commons search term
const CLUBS = {
  'Arsenal': 'Arsenal FC', 'Chelsea': 'Chelsea FC', 'Liverpool': 'Liverpool FC',
  'Manchester City': 'Manchester City FC', 'Manchester United': 'Manchester United FC',
  'Tottenham': 'Tottenham Hotspur FC', 'Newcastle': 'Newcastle United FC',
  'Aston Villa': 'Aston Villa FC', 'West Ham': 'West Ham United FC',
  'Brighton': 'Brighton & Hove Albion FC', 'Real Madrid': 'Real Madrid CF',
  'Barcelona': 'FC Barcelona', 'Atletico Madrid': 'Atlético Madrid',
  'Bayern Munich': 'FC Bayern Munich', 'Dortmund': 'Borussia Dortmund',
  'PSG': 'Paris Saint-Germain', 'Juventus': 'Juventus FC', 'Inter Milan': 'Inter Milan',
  'AC Milan': 'AC Milan', 'Napoli': 'SSC Napoli', 'Bayer Leverkusen': 'Bayer 04 Leverkusen',
  'RB Leipzig': 'RB Leipzig', 'Ajax': 'AFC Ajax', 'Porto': 'FC Porto',
  'Benfica': 'SL Benfica', 'Sevilla': 'Sevilla FC', 'Celtic': 'Celtic FC', 'Rangers': 'Rangers FC',
};

const args = process.argv.slice(2);
const flags = new Set(args.filter((a) => a.startsWith('--')));
const positional = args.filter((a) => !a.startsWith('--'));
const FORCE = flags.has('--force');
const DRY = flags.has('--dry');

const slugify = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
  .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const deburr = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

let targets = Object.keys(CLUBS);
if (positional.length) {
  const hit = targets.find((k) => k === positional[0] || slugify(k) === slugify(positional[0]));
  if (!hit) { console.error(`Unknown club "${positional[0]}".`); process.exit(1); }
  targets = [hit];
}

mkdirSync(OUT, { recursive: true });
const IMG_RE = /\.(svg|png|jpe?g|webp)$/i;
const existing = new Set(readdirSync(OUT).filter((f) => IMG_RE.test(f)).map((f) => f.replace(IMG_RE, '').toLowerCase()));

function classifyLicense(meta) {
  const short = (meta?.LicenseShortName?.value || '').trim();
  const hay = `${short} ${(meta?.License?.value || '')}`.toLowerCase();
  if (/fair use|non[- ]?free|all rights reserved/.test(hay)) return null;
  return { label: short || 'Wikimedia Commons' };
}
function cleanText(html) {
  if (!html) return '';
  return html.replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/&#\d+;/g, ' ')
    .replace(/&[a-z]+;/g, ' ').replace(/\s+/g, ' ').trim();
}

const GOOD = /(logo|crest|badge|escudo|wappen|stemma|\bfc\b|\bcf\b|\bafc\b|\bssc\b|\bsl\b)/i;
const BAD = /(stadium|arena|fans?|supporters|player|squad|kit|jersey|shirt|training|celebrat|\bmap\b|women|u21|u19|u23|academy|performance|league table|\bchart\b|\bgraph\b|statistics|\bresults\b|monogram|coat of arms|anthem|history)/i;

async function search(term) {
  const url = `${API}?action=query&format=json&origin=*` +
    `&generator=search&gsrsearch=${encodeURIComponent(term)}&gsrnamespace=6&gsrlimit=20` +
    `&prop=imageinfo&iiprop=url|extmetadata|mime|size` +
    `&iiextmetadatafilter=LicenseShortName|License|Artist|Credit`;
  const r = await fetch(url, { headers: { 'User-Agent': UA } });
  if (!r.ok) throw new Error(`API HTTP ${r.status}`);
  const d = await r.json();
  const pages = d?.query?.pages;
  return pages ? Object.values(pages).sort((a, b) => (a.index ?? 0) - (b.index ?? 0)) : [];
}

function pick(pages, club) {
  const tokens = deburr(club).split(/\s+/).filter((t) => t.length > 2);
  let best = null;
  for (const p of pages) {
    const ii = p.imageinfo?.[0];
    if (!ii) continue;
    if (!/image\/(svg\+xml|png)/i.test(ii.mime || '')) continue; // official logos only; jpg = photos
    const title = (p.title || '').replace(/^File:/, '');
    if (BAD.test(title)) continue;
    const t = deburr(title);
    if (!tokens.some((tok) => t.includes(tok))) continue; // must name the club
    if (!GOOD.test(title)) continue;                       // MUST be a crest/logo/badge (kills maps, stray photos)
    const lic = classifyLicense(ii.extmetadata);
    if (!lic) continue;

    let score = 0;
    for (const tok of tokens) if (t.includes(tok)) score += 2;
    if (/crest|logo|badge/i.test(title)) score += 2;
    if (/image\/svg/i.test(ii.mime)) score += 2; // scalable is best for a crest
    if (!best || score > best.score) {
      best = {
        score, title, lic,
        url: ii.url, // original file (keep SVG vector, not a raster thumb)
        mime: ii.mime,
        page: ii.descriptionurl || `https://commons.wikimedia.org/wiki/${encodeURIComponent(p.title)}`,
        artist: cleanText(ii.extmetadata?.Artist?.value) || cleanText(ii.extmetadata?.Credit?.value) || 'Wikimedia Commons',
      };
    }
  }
  return best;
}

const extFor = (mime) => mime.includes('svg') ? 'svg' : mime.includes('png') ? 'png' : 'jpg';

function loadCredits() { try { return JSON.parse(readFileSync(CREDITS_PATH, 'utf8')); } catch { return {}; } }
function saveCredits(obj) {
  const { _note, ...rest } = obj;
  const out = {}; if (_note) out._note = _note;
  for (const k of Object.keys(rest).sort()) out[k] = rest[k];
  writeFileSync(CREDITS_PATH, JSON.stringify(out, null, 2) + '\n');
}

const credits = loadCredits();
let dirty = false, ok = 0, miss = 0, skip = 0, fail = 0;

for (const club of targets) {
  const slug = slugify(club);
  if (!FORCE && existing.has(slug)) { console.log(`skip  ${club} (already have)`); skip++; continue; }
  try {
    const term = CLUBS[club];
    let pages = await search(`${term} crest`);
    let cand = pick(pages, club);
    if (!cand) { await sleep(250); pages = await search(`${term} logo`); cand = pick(pages, club); }
    if (!cand) { await sleep(250); pages = await search(term); cand = pick(pages, club); }
    if (!cand) {
      console.log(`MISS  ${club} (no crest found)`); miss++;
      if (credits[slug]) { delete credits[slug]; dirty = true; } // emblem fallback: no stale credit
      await sleep(300); continue;
    }

    if (DRY) { console.log(`dry   ${club} <- ${cand.lic.label} | ${cand.title}`); await sleep(300); continue; }

    const r = await fetch(cand.url, { headers: { 'User-Agent': UA } });
    if (!r.ok) throw new Error(`img HTTP ${r.status}`);
    const buf = Buffer.from(await r.arrayBuffer());
    writeFileSync(join(OUT, `${slug}.${extFor(cand.mime)}`), buf);
    existing.add(slug);
    credits[slug] = { author: cand.artist, license: cand.lic.label, url: cand.page, source: 'Wikimedia Commons' };
    dirty = true;
    console.log(`OK    ${club} -> ${slug}.${extFor(cand.mime)}  [${cand.lic.label} © ${cand.artist}]`);
    ok++;
  } catch (e) { console.log(`FAIL  ${club}: ${e.message}`); fail++; }
  await sleep(300);
}

if (dirty && !DRY) { saveCredits(credits); console.log(`\nUpdated ${CREDITS_PATH.replace(ROOT + '\\', '')}`); }
console.log(`\nDone. ${ok} downloaded, ${skip} skipped, ${miss} no-crest, ${fail} failed -> public/clubs/`);
