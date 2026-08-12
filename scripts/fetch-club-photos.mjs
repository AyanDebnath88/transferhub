// Pull real COLOUR club photos (stadium / team / matchday / fans) from Wikimedia
// Commons into public/club-photos/. Used as the card image FALLBACK when no player
// photo matches but a club is named. 2+ per club so cards can rotate for variety.
// Every file credited (author + licence + Commons link) in imageCredits.json.
//
// Usage:
//   node scripts/fetch-club-photos.mjs             # all clubs
//   node scripts/fetch-club-photos.mjs Arsenal     # one club
//   node scripts/fetch-club-photos.mjs --per 3     # N photos per club (default 2)
//   node scripts/fetch-club-photos.mjs --force     # re-fetch existing
//   node scripts/fetch-club-photos.mjs --dry

import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import sharp from 'sharp';

const ROOT = process.cwd();
const OUT = join(ROOT, 'public/club-photos');
const CREDITS_PATH = join(ROOT, 'src/data/imageCredits.json');
const API = 'https://commons.wikimedia.org/w/api.php';
const UA = 'TransferHub/1.0 (https://transferhub.club; copyright-safe image bot) node';

// display name (matches CLUB_META) -> Commons search stem
const CLUBS = {
  'Arsenal': 'Arsenal FC', 'Chelsea': 'Chelsea FC', 'Liverpool': 'Liverpool FC',
  'Manchester City': 'Manchester City FC', 'Manchester United': 'Manchester United FC',
  'Tottenham': 'Tottenham Hotspur', 'Newcastle': 'Newcastle United FC',
  'Aston Villa': 'Aston Villa FC', 'West Ham': 'West Ham United', 'Brighton': 'Brighton Hove Albion',
  'Real Madrid': 'Real Madrid CF', 'Barcelona': 'FC Barcelona', 'Atletico Madrid': 'Atletico Madrid',
  'Bayern Munich': 'FC Bayern Munich', 'Dortmund': 'Borussia Dortmund', 'PSG': 'Paris Saint-Germain',
  'Juventus': 'Juventus FC', 'Inter Milan': 'Inter Milan', 'AC Milan': 'AC Milan', 'Napoli': 'SSC Napoli',
  'Bayer Leverkusen': 'Bayer Leverkusen', 'RB Leipzig': 'RB Leipzig', 'Ajax': 'AFC Ajax',
  'Porto': 'FC Porto', 'Benfica': 'SL Benfica', 'Sevilla': 'Sevilla FC', 'Celtic': 'Celtic FC', 'Rangers': 'Rangers FC',
};

const args = process.argv.slice(2);
const flags = new Set(args.filter((a) => a.startsWith('--')));
const perIdx = args.indexOf('--per');
const positional = args.filter((a, i) => !a.startsWith('--') && i !== perIdx + 1);
const FORCE = flags.has('--force');
const DRY = flags.has('--dry');
const PER = (() => { const i = args.indexOf('--per'); return i >= 0 && args[i + 1] ? parseInt(args[i + 1], 10) : 4; })();

const slugify = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const deburr = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

let targets = Object.keys(CLUBS);
if (positional.length) {
  const hit = targets.find((k) => k === positional[0] || slugify(k) === slugify(positional[0]));
  if (!hit) { console.error(`Unknown club "${positional[0]}".`); process.exit(1); }
  targets = [hit];
}

mkdirSync(OUT, { recursive: true });
const existing = new Set(readdirSync(OUT).map((f) => f.replace(/\.jpg$/i, '').toLowerCase()));

function classifyLicense(meta) {
  const short = (meta?.LicenseShortName?.value || '').trim();
  const hay = `${short} ${(meta?.License?.value || '')}`.toLowerCase();
  if (/fair use|non[- ]?free|all rights reserved/.test(hay)) return null;
  return { label: short || 'Wikimedia Commons' };
}
const cleanText = (h) => !h ? '' : h.replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/&#\d+;/g, ' ').replace(/&[a-z]+;/g, ' ').replace(/\s+/g, ' ').trim();

// want colour scenes; reject logos/charts/maps/kit-diagrams and non-photo files
const BAD = /(logo|crest|badge|escudo|wappen|coat of arms|monogram|\bmap\b|performance|\bchart\b|\bgraph\b|statistics|diagram|kit|\.svg|location|locator|pictogram)/i;
// bland: empty/architectural shots we down-rank (still allowed as backup)
const BLAND = /(tunnel|interior|concourse|construction|aerial|panorama|facade|exterior|\bseats?\b|empty|entrance|\bgate\b|\bsign\b|under construction|demolition|car park|corridor|toilet|scaffold|night view)/i;
const VIVID = /(match|matchday|goal|celebrat|fans|supporters|crowd|derby|final|trophy|action|players|squad|lineup|line-up|kick|attack|corner|penalty|ultras|tifo|banner|flag|pitch)/i;

async function search(term) {
  const url = `${API}?action=query&format=json&origin=*` +
    `&generator=search&gsrsearch=${encodeURIComponent(term)}&gsrnamespace=6&gsrlimit=25` +
    `&prop=imageinfo&iiprop=url|extmetadata|mime|size&iiurlwidth=1280` +
    `&iiextmetadatafilter=LicenseShortName|License|Artist|Credit`;
  const r = await fetch(url, { headers: { 'User-Agent': UA } });
  if (!r.ok) throw new Error(`API HTTP ${r.status}`);
  const d = await r.json();
  const pages = d?.query?.pages;
  return pages ? Object.values(pages).sort((a, b) => (a.index ?? 0) - (b.index ?? 0)) : [];
}

// collect scored colour-photo candidates for a club
function collect(pages, club, into, seen) {
  const tokens = deburr(`${club} ${CLUBS[club]}`).split(/\s+/).filter((t) => t.length > 3);
  for (const p of pages) {
    const ii = p.imageinfo?.[0];
    if (!ii) continue;
    if (!/image\/(jpeg|png)/i.test(ii.mime || '')) continue;
    const title = (p.title || '').replace(/^File:/, '');
    if (BAD.test(title)) continue;
    if ((ii.width || 0) < 800) continue;
    if ((ii.width || 0) < (ii.height || 1)) continue; // landscape only (fits 16:9)
    const t = deburr(title);
    if (!tokens.some((tok) => t.includes(tok))) continue; // must name the club
    if (seen.has(ii.url)) continue;
    const lic = classifyLicense(ii.extmetadata);
    if (!lic) continue;
    seen.add(ii.url);
    let score = 0;
    for (const tok of tokens) if (t.includes(tok)) score += 2;
    if (VIVID.test(title)) score += 4;      // action/crowd/celebration -> vivid
    if (BLAND.test(title)) score -= 4;       // empty/architectural -> dull
    if ((ii.width || 0) >= 1600) score += 1;
    into.push({
      score, title,
      src: ii.thumburl || ii.url,
      page: ii.descriptionurl || `https://commons.wikimedia.org/wiki/${encodeURIComponent(p.title)}`,
      artist: cleanText(ii.extmetadata?.Artist?.value) || cleanText(ii.extmetadata?.Credit?.value) || 'Wikimedia Commons',
      lic,
    });
  }
}

const toCard = async (buf) => sharp(buf).rotate().resize(800, 450, { fit: 'cover', position: 'centre' }).jpeg({ quality: 82 }).toBuffer();

// mean pixel saturation 0..1 — low = grey/architectural/B&W, high = vivid colour
async function vividness(buf) {
  try {
    const { data } = await sharp(buf).resize(48, 48, { fit: 'cover' }).removeAlpha().raw().toBuffer({ resolveWithObject: true });
    let sum = 0, n = data.length / 3;
    for (let i = 0; i < data.length; i += 3) {
      const r = data[i], g = data[i + 1], b = data[i + 2];
      const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
      sum += mx === 0 ? 0 : (mx - mn) / mx;
    }
    return sum / n;
  } catch { return 0; }
}
const VIVID_MIN = 0.22;

function loadCredits() { try { return JSON.parse(readFileSync(CREDITS_PATH, 'utf8')); } catch { return {}; } }
function saveCredits(o) { const { _note, ...r } = o; const out = {}; if (_note) out._note = _note; for (const k of Object.keys(r).sort()) out[k] = r[k]; writeFileSync(CREDITS_PATH, JSON.stringify(out, null, 2) + '\n'); }

const credits = loadCredits();
let dirty = false, ok = 0, miss = 0, skip = 0, fail = 0;

for (const club of targets) {
  const slug = slugify(club);
  const have = [...existing].filter((k) => k === slug || k.startsWith(slug + '-')).length;
  if (!FORCE && have >= PER) { console.log(`skip  ${club} (have ${have})`); skip++; continue; }

  const term = CLUBS[club];
  const cands = [], seen = new Set();
  try {
    for (const q of [`${term} celebration`, `${term} fans`, `${term} match`, `${term} supporters`, `${term} goal`, `${term} team`, `${term} stadium`, term]) {
      collect(await search(q), club, cands, seen);
      await sleep(160);
      if (cands.length >= PER * 5) break;
    }
  } catch (e) { console.log(`FAIL  ${club}: ${e.message}`); fail++; continue; }

  cands.sort((a, b) => b.score - a.score);
  if (!cands.length) { console.log(`MISS  ${club} (no photo)`); miss++; continue; }

  // Download in score order; keep only vivid (colour-saturated) shots, stash the
  // rest as backups so we still reach PER if few vivid ones exist.
  const picks = [], backups = [];
  for (const c of cands) {
    if (picks.length >= PER) break;
    if (DRY) { if (picks.length + backups.length < PER * 2) { console.log(`dry   ${slug} <- s${c.score} ${c.lic.label} | ${c.title}`); picks.push(c); } continue; }
    try {
      const r = await fetch(c.src, { headers: { 'User-Agent': UA } });
      if (!r.ok) throw new Error(`img HTTP ${r.status}`);
      const raw = Buffer.from(await r.arrayBuffer());
      const v = await vividness(raw);
      c.buf = raw;
      if (v >= VIVID_MIN) picks.push(c); else backups.push({ c, v });
    } catch { /* skip */ }
    await sleep(160);
  }
  if (!DRY) { backups.sort((a, b) => b.v - a.v); while (picks.length < PER && backups.length) picks.push(backups.shift().c); }
  if (!picks.length) { console.log(`MISS  ${club} (no usable photo)`); miss++; continue; }

  for (let i = 0; i < picks.length; i++) {
    const c = picks[i];
    const name = `${slug}-${i + 1}`;
    if (DRY) continue;
    try {
      writeFileSync(join(OUT, `${name}.jpg`), await toCard(c.buf));
      credits[name] = { author: c.artist, license: c.lic.label, url: c.page, source: 'Wikimedia Commons' };
      dirty = true; ok++;
      console.log(`OK    ${name}.jpg  [${c.lic.label} © ${c.artist}]`);
    } catch (e) { console.log(`FAIL  ${name}: ${e.message}`); fail++; }
  }
}

if (dirty && !DRY) { saveCredits(credits); console.log('\nUpdated imageCredits.json'); }
console.log(`\nDone. ${ok} photos, ${skip} clubs skipped, ${miss} no-photo, ${fail} failed -> public/club-photos/`);
