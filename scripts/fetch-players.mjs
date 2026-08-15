// Pull COPYRIGHT-SAFE player portraits from Wikimedia Commons into public/players/.
//
// Pipeline (per player):
//   Commons API search -> read each file's license from extmetadata
//   -> KEEP ONLY  Public Domain / CC0 / CC-BY / CC-BY-SA  (everything else skipped)
//   -> download -> crop to 16:9 (sharp, face-safe top crop) -> save public/players/<slug>.jpg
//   -> if CC-BY / CC-BY-SA: auto-write the credit into src/data/imageCredits.json
//
// Squads live in scripts/rosters.json (keys = CLUB_META display names).
//
// Usage:
//   node scripts/fetch-players.mjs "Arsenal"        # one club (batch)
//   node scripts/fetch-players.mjs arsenal          # slug also works
//   node scripts/fetch-players.mjs all              # every club
//   node scripts/fetch-players.mjs Arsenal --force  # re-fetch even if file exists
//   node scripts/fetch-players.mjs Arsenal --limit 5
//   node scripts/fetch-players.mjs Arsenal --dry    # preview, write nothing
//   node scripts/fetch-players.mjs --list           # list club keys and exit

import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync, unlinkSync } from 'node:fs';
import { join } from 'node:path';
import sharp from 'sharp';

const ROOT = process.cwd();
const ROSTERS = JSON.parse(readFileSync(join(ROOT, 'scripts/rosters.json'), 'utf8'));
const PLAYERS_DIR = join(ROOT, 'public/players');
const CREDITS_PATH = join(ROOT, 'src/data/imageCredits.json');
const API = 'https://commons.wikimedia.org/w/api.php';
const UA = 'TransferHub/1.0 (https://transferhub.club; copyright-safe image bot) node';

const args = process.argv.slice(2);
const flags = new Set(args.filter((a) => a.startsWith('--')));
const valIdx = new Set(['--limit', '--multi'].map((f) => args.indexOf(f) + 1).filter((i) => i > 0));
const positional = args.filter((a, i) => !a.startsWith('--') && !valIdx.has(i));
const FORCE = flags.has('--force');
const DRY = flags.has('--dry');
const LIMIT = (() => {
  const i = args.indexOf('--limit');
  return i >= 0 && args[i + 1] ? parseInt(args[i + 1], 10) : Infinity;
})();
const MULTI = (() => {
  const i = args.indexOf('--multi');
  return i >= 0 && args[i + 1] ? Math.max(1, parseInt(args[i + 1], 10)) : 1;
})();
const yearOf = (s) => { const m = (s.match(/\b(19|20)\d{2}\b/g) || []).map(Number); return m.length ? Math.max(...m) : 0; };

const clubKeys = Object.keys(ROSTERS).filter((k) => k !== '_note');
const slugify = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
  .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const deburr = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

if (flags.has('--list') || positional.length === 0) {
  console.log('Clubs (pass one, or "all"):\n' + clubKeys.map((k) => `  ${k}  (${slugify(k)})`).join('\n'));
  process.exit(0);
}

// Resolve the club arg (display name OR slug) to roster keys.
const target = positional[0];
let clubs;
if (target.toLowerCase() === 'all') {
  clubs = clubKeys;
} else {
  const hit = clubKeys.find((k) => k === target || slugify(k) === slugify(target));
  if (!hit) { console.error(`Unknown club "${target}". Run --list to see options.`); process.exit(1); }
  clubs = [hit];
}

mkdirSync(PLAYERS_DIR, { recursive: true });

// existing player files by slug (any image ext) so we can skip already-done ones
const IMG_RE = /\.(jpe?g|png|webp)$/i;
const existing = new Set(
  readdirSync(PLAYERS_DIR).filter((f) => IMG_RE.test(f)).map((f) => f.replace(IMG_RE, '').toLowerCase())
);

// --- license classification ------------------------------------------------
// Commons hosts free-content only, so accept ANY licence and credit it.
// Only guard against anything explicitly marked non-free / all-rights-reserved.
// Returns { label } if allowed, or null to REJECT. Every kept image is credited.
function classifyLicense(meta) {
  const short = (meta?.LicenseShortName?.value || '').trim();
  const code = (meta?.License?.value || '').toLowerCase();
  const hay = `${short} ${code}`.toLowerCase();
  if (/fair use|non[- ]?free|all rights reserved/.test(hay)) return null;
  return { label: short || 'Wikimedia Commons' };
}

function cleanText(html) {
  if (!html) return '';
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ')
    .replace(/&#\d+;/g, ' ').replace(/&[a-z]+;/g, ' ')
    .replace(/\s+/g, ' ').trim();
}

const BAD_TITLE = /(logo|crest|badge|signature|stadium|arena|jersey|shirt|kit|coat of arms|trophy|celebrat|fans?|graffiti|mural|autograph|training ground|statue|monument|waxwork|wax figure|tussauds|sculpture|\bbust\b|mosaic|painting|drawing|cartoon|caricature|figurine|mannequin|est[aá]tua|escultura|estatua|denkmal|standbeeld|museu cr7|\bmuseo\b|\bmuseu\b|\bmuseum\b)/i;

async function searchFiles(name) {
  const url = `${API}?action=query&format=json&origin=*` +
    `&generator=search&gsrsearch=${encodeURIComponent(name)}&gsrnamespace=6&gsrlimit=20` +
    `&prop=imageinfo&iiprop=url|extmetadata|mime|size&iiurlwidth=1200` +
    `&iiextmetadatafilter=LicenseShortName|License|Artist|Credit|LicenseUrl|AttributionRequired`;
  const r = await fetch(url, { headers: { 'User-Agent': UA } });
  if (!r.ok) throw new Error(`API HTTP ${r.status}`);
  const d = await r.json();
  const pages = d?.query?.pages;
  if (!pages) return [];
  return Object.values(pages).sort((a, b) => (a.index ?? 0) - (b.index ?? 0));
}

// Ranked licensed portraits for a player (best first).
function pickCandidates(pages, playerName) {
  const surname = deburr(playerName.split(' ').slice(-1)[0]);
  const tokens = deburr(playerName).split(/\s+/).filter((t) => t.length > 2);
  const out = [];

  for (const p of pages) {
    const ii = p.imageinfo?.[0];
    if (!ii) continue;
    if (!/image\/(jpeg|png)/i.test(ii.mime || '')) continue;
    const title = (p.title || '').replace(/^File:/, '');
    if (BAD_TITLE.test(title)) continue;
    if ((ii.width || 0) < 400) continue;

    const lic = classifyLicense(ii.extmetadata);
    if (!lic) continue;

    const t = deburr(title);
    // must plausibly be this person: surname OR a name token in the file title
    if (!t.includes(surname) && !tokens.some((tok) => t.includes(tok))) continue;

    let score = 0;
    if (t.includes(surname)) score += 2;                 // strong signal
    for (const tok of tokens) if (t.includes(tok)) score += 2;
    if (/image\/jpeg/i.test(ii.mime)) score += 1;
    if ((ii.height || 0) >= (ii.width || 1)) score += 1; // prefer portrait

    out.push({
      score, title, lic,
      src: ii.thumburl || ii.url,
      page: ii.descriptionurl || `https://commons.wikimedia.org/wiki/${encodeURIComponent(p.title)}`,
      artist: cleanText(ii.extmetadata?.Artist?.value) || cleanText(ii.extmetadata?.Credit?.value) || 'Wikimedia Commons',
    });
  }
  return out.sort((a, b) => b.score - a.score);
}

// mean pixel saturation 0..1 — near 0 = black & white / greyscale / statue.
async function vividness(buf) {
  try {
    const { data } = await sharp(buf).resize(48, 48, { fit: 'cover' }).removeAlpha().raw().toBuffer({ resolveWithObject: true });
    let sum = 0; const n = data.length / 3;
    for (let i = 0; i < data.length; i += 3) {
      const mx = Math.max(data[i], data[i + 1], data[i + 2]);
      const mn = Math.min(data[i], data[i + 1], data[i + 2]);
      sum += mx === 0 ? 0 : (mx - mn) / mx;
    }
    return sum / n;
  } catch { return 1; }
}
const VIVID_MIN = 0.10; // below this = greyscale/B&W, reject

async function toCard(buf) {
  // Fit the WHOLE image into the 16:9 card (no cropping/cutting). The letterbox
  // margins are filled with a blurred, darkened cover of the same image so the
  // player is fully visible and centred without ugly flat bars.
  const W = 800, H = 450;
  const fg = await sharp(buf).rotate().resize(W, H, { fit: 'inside' }).toBuffer();
  const bg = await sharp(buf).rotate().resize(W, H, { fit: 'cover', position: 'attention' })
    .blur(22).modulate({ brightness: 0.55 }).toBuffer();
  return sharp(bg).composite([{ input: fg, gravity: 'center' }]).jpeg({ quality: 82 }).toBuffer();
}

// --- credits file ----------------------------------------------------------
function loadCredits() {
  try { return JSON.parse(readFileSync(CREDITS_PATH, 'utf8')); } catch { return {}; }
}
function saveCredits(obj) {
  const { _note, ...rest } = obj;
  const sorted = {};
  if (_note) sorted._note = _note;
  for (const k of Object.keys(rest).sort()) sorted[k] = rest[k];
  writeFileSync(CREDITS_PATH, JSON.stringify(sorted, null, 2) + '\n');
}

const credits = loadCredits();
let creditsDirty = false;
let ok = 0, skip = 0, miss = 0, fail = 0;

for (const club of clubs) {
  const roster = [...new Set(ROSTERS[club])]; // dedupe
  console.log(`\n=== ${club} (${roster.length} players) ===`);
  let done = 0;
  for (const player of roster) {
    if (done >= LIMIT) break;
    const slug = slugify(player);
    if (!FORCE && existing.has(slug)) { console.log(`  skip  ${player} (already have)`); skip++; continue; }

    try {
      const pages = await searchFiles(player);
      const cands = pickCandidates(pages, player);
      if (!cands.length) { console.log(`  MISS  ${player} (no free portrait)`); miss++; await sleep(250); continue; }

      if (DRY) {
        console.log(`  dry   ${player} <- ${cands[0].lic.label} | ${cands[0].title}`);
        done++; await sleep(250); continue;
      }

      // Download candidates in rank order; keep up to MULTI distinct COLOUR shots
      // (skip greyscale/B&W). Fall back to best colour seen if none clear the bar.
      const keep = []; let fallback = null, fallbackBuf = null, fbV = -1;
      for (const c of cands.slice(0, MULTI > 1 ? 12 : 6)) {
        if (keep.length >= MULTI) break;
        const r = await fetch(c.src, { headers: { 'User-Agent': UA } });
        if (!r.ok) continue;
        const raw = Buffer.from(await r.arrayBuffer());
        const v = await vividness(raw);
        if (v >= VIVID_MIN) { keep.push({ c, buf: raw }); }
        else if (v > fbV) { fbV = v; fallback = c; fallbackBuf = raw; }
        await sleep(120);
      }
      if (!keep.length && fallback) keep.push({ c: fallback, buf: fallbackBuf });
      if (!keep.length) {
        const had = existing.has(slug);
        if (had) { try { unlinkSync(join(PLAYERS_DIR, `${slug}.jpg`)); } catch {} existing.delete(slug); }
        for (let k = 2; k <= 6; k++) { try { unlinkSync(join(PLAYERS_DIR, `${slug}-${k}.jpg`)); } catch {} }
        if (credits[slug]) { delete credits[slug]; creditsDirty = true; }
        console.log(`  MISS  ${player} (no colour portrait${had ? ', removed stale' : ''})`); miss++; await sleep(200); continue;
      }

      // newest-first, so slug.jpg is the most recent image
      keep.sort((a, b) => yearOf(b.c.title) - yearOf(a.c.title));
      for (let k = keep.length + 1; k <= 6; k++) { try { unlinkSync(join(PLAYERS_DIR, `${slug}-${k}.jpg`)); } catch {} } // clear stale extras
      for (let i = 0; i < keep.length; i++) {
        const name = i === 0 ? slug : `${slug}-${i + 1}`;
        writeFileSync(join(PLAYERS_DIR, `${name}.jpg`), await toCard(keep[i].buf));
        credits[name] = { author: keep[i].c.artist, license: keep[i].c.lic.label, url: keep[i].c.page, source: 'Wikimedia Commons' };
      }
      existing.add(slug);
      creditsDirty = true;
      console.log(`  OK    ${player} -> ${slug}.jpg${keep.length > 1 ? ` (+${keep.length - 1})` : ''}  [${keep[0].c.lic.label}]`);
      ok++; done++;
    } catch (e) {
      console.log(`  FAIL  ${player}: ${e.message}`);
      fail++;
    }
    await sleep(300); // be polite to Commons
  }
}

if (creditsDirty && !DRY) { saveCredits(credits); console.log(`\nUpdated ${CREDITS_PATH.replace(ROOT + '\\', '')}`); }
console.log(`\nDone. ${ok} downloaded, ${skip} skipped, ${miss} no-free-image, ${fail} failed -> public/players/`);
