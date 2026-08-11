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

import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync } from 'node:fs';
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
const positional = args.filter((a) => !a.startsWith('--'));
const FORCE = flags.has('--force');
const DRY = flags.has('--dry');
const LIMIT = (() => {
  const i = args.indexOf('--limit');
  return i >= 0 && args[i + 1] ? parseInt(args[i + 1], 10) : Infinity;
})();

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
// Returns { label, attribution } if allowed, or null to REJECT.
function classifyLicense(meta) {
  const short = (meta?.LicenseShortName?.value || '').trim();
  const code = (meta?.License?.value || '').toLowerCase();
  const hay = `${short} ${code}`.toLowerCase();

  // hard reject anything that smells non-free
  if (/fair use|non[- ]?free|all rights reserved|©|copyright(?!ed free)/.test(hay)) return null;

  // public domain / CC0 -> no attribution required
  if (/\bcc0\b|cc-zero|public domain|\bpd\b|pd-|pdmark|no restrictions/.test(hay)) {
    return { label: short || 'Public domain', attribution: false };
  }
  // CC-BY-SA (check before CC-BY) -> attribution required
  if (/cc[ -]?by[ -]?sa|cc-by-sa/.test(hay)) {
    return { label: short || 'CC BY-SA', attribution: true };
  }
  // CC-BY -> attribution required
  if (/cc[ -]?by(?![ -]?sa)/.test(hay)) {
    return { label: short || 'CC BY', attribution: true };
  }
  // GFDL-only, unknown, or empty -> reject to stay safe
  return null;
}

function cleanText(html) {
  if (!html) return '';
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ')
    .replace(/&#\d+;/g, ' ').replace(/&[a-z]+;/g, ' ')
    .replace(/\s+/g, ' ').trim();
}

const BAD_TITLE = /(logo|crest|badge|signature|stadium|arena|jersey|shirt|kit|coat of arms|trophy|celebrat|fans?|graffiti|mural|autograph|training ground)/i;

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

// Pick the best licensed portrait for a player, or null.
function pickCandidate(pages, playerName) {
  const surname = deburr(playerName.split(' ').slice(-1)[0]);
  const tokens = deburr(playerName).split(/\s+/).filter((t) => t.length > 2);
  let best = null;

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
    // must plausibly be this person: surname in the file title
    if (!t.includes(surname)) continue;

    let score = 0;
    for (const tok of tokens) if (t.includes(tok)) score += 2;
    if (/image\/jpeg/i.test(ii.mime)) score += 1;
    if ((ii.height || 0) >= (ii.width || 1)) score += 1; // prefer portrait
    if (!lic.attribution) score += 1;                    // prefer PD/CC0 (no credit needed)

    if (!best || score > best.score) {
      best = {
        score, title, lic,
        src: ii.thumburl || ii.url,
        page: ii.descriptionurl || `https://commons.wikimedia.org/wiki/${encodeURIComponent(p.title)}`,
        artist: cleanText(ii.extmetadata?.Artist?.value) || cleanText(ii.extmetadata?.Credit?.value) || 'Wikimedia Commons',
      };
    }
  }
  return best;
}

async function toCard(buf) {
  // 16:9 card crop, biased to the top so faces survive portrait sources.
  return sharp(buf).rotate().resize(800, 450, { fit: 'cover', position: 'top' }).jpeg({ quality: 82 }).toBuffer();
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
      const cand = pickCandidate(pages, player);
      if (!cand) { console.log(`  MISS  ${player} (no free portrait)`); miss++; await sleep(250); continue; }

      if (DRY) {
        console.log(`  dry   ${player} <- ${cand.lic.label} | ${cand.title}`);
        done++; await sleep(250); continue;
      }

      const r = await fetch(cand.src, { headers: { 'User-Agent': UA } });
      if (!r.ok) throw new Error(`img HTTP ${r.status}`);
      const card = await toCard(Buffer.from(await r.arrayBuffer()));
      writeFileSync(join(PLAYERS_DIR, `${slug}.jpg`), card);
      existing.add(slug);

      if (cand.lic.attribution) {
        credits[slug] = { author: cand.artist, license: cand.lic.label, url: cand.page };
        creditsDirty = true;
        console.log(`  OK    ${player} -> ${slug}.jpg  [${cand.lic.label} © ${cand.artist}]`);
      } else {
        if (credits[slug]) { delete credits[slug]; creditsDirty = true; } // was CC, now PD source
        console.log(`  OK    ${player} -> ${slug}.jpg  [${cand.lic.label}, no credit needed]`);
      }
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
