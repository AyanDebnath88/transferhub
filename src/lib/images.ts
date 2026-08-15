// Build-time image resolver. Scans public/players and public/photos once at build,
// then resolves a card background per story: player photo -> Pixabay generic -> null.
import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import creditsRaw from '../data/imageCredits.json';

const PUBLIC = join(process.cwd(), 'public');
const IMG_RE = /\.(jpe?g|png|webp)$/i;

function scan(dir: string): string[] {
  try { return readdirSync(join(PUBLIC, dir)).filter((f) => IMG_RE.test(f)); }
  catch { return []; }
}

export function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function deburr(s: string): string {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

// base-slug -> [filenames], newest first (slug.jpg, then slug-2.jpg, slug-3.jpg…).
// Multiple images per player let repeated cards rotate instead of showing the same face.
const playerFiles: Record<string, string[]> = {};
for (const f of scan('players')) {
  const base = f.replace(IMG_RE, '').toLowerCase().replace(/-\d+$/, '');
  (playerFiles[base] ||= []).push(f);
}
for (const s in playerFiles) {
  playerFiles[s].sort((a, b) => {
    const na = a.match(/-(\d+)\./); const nb = b.match(/-(\d+)\./);
    return (na ? +na[1] : 1) - (nb ? +nb[1] : 1); // base (=1, newest) first
  });
}

// Loose name index for matching headlines that use only a mononym ("Rodri")
// or a surname ("Haaland") instead of the full filename. Keys map to a filename,
// but only when UNAMBIGUOUS — a name part shared by two players is dropped so we
// never show the wrong face (e.g. "silva", "hernandez", "james").
// Players genuinely known by a single (usually first) name. Only these get a
// first-name key — generic first-name matching is unsafe ("Lamine Camara" must
// NOT resolve to Lamine Yamal).
const MONONYMS = ['rodri', 'vinicius', 'raphinha', 'pedri', 'gavi', 'rodrygo', 'casemiro',
  'richarlison', 'fabinho', 'endrick', 'koke', 'joelinton', 'neymar', 'savinho'];
// name key -> base slug (unambiguous only)
const nameIndex: Record<string, string> = {};
{
  const collide = new Set<string>();
  const add = (k: string, slug: string) => {
    if (k.length < 4) return;
    if (nameIndex[k] && nameIndex[k] !== slug) collide.add(k);
    else nameIndex[k] = slug;
  };
  for (const slug in playerFiles) {
    const parts = slug.split('-');
    add(parts.join(' '), slug);               // full name (safe)
    add(parts[parts.length - 1], slug);        // surname (last token)
  }
  for (const k of collide) delete nameIndex[k];
  for (const m of MONONYMS) {
    const hits = Object.keys(playerFiles).filter((s) => s === m || s.startsWith(m + '-'));
    if (hits.length === 1) nameIndex[m] = hits[0];
  }
}

const photoFiles = scan('photos').sort();

// Real club photos (public/club-photos/<slug>-N.jpg) for the card fallback when
// no player matched but a club is named. slug -> [filenames] for rotation.
const clubPhotos: Record<string, string[]> = {};
for (const f of scan('club-photos')) {
  const slug = f.replace(IMG_RE, '').toLowerCase().replace(/-\d+$/, '');
  (clubPhotos[slug] ||= []).push(f);
}
for (const s in clubPhotos) clubPhotos[s].sort();

// Club emblem used as the card image when no player photo matches.
// Priority: real crest downloaded from Wikimedia Commons (public/clubs/<slug>.*)
// -> our own original emblem (public/crests/<slug>.svg).
// slug -> filename for downloaded Commons crests (any image ext incl. SVG)
const clubFiles: Record<string, string> = {};
try {
  for (const f of readdirSync(join(PUBLIC, 'clubs'))) {
    if (/\.(svg|png|jpe?g|webp)$/i.test(f)) clubFiles[f.replace(/\.(svg|png|jpe?g|webp)$/i, '').toLowerCase()] = f;
  }
} catch { /* no clubs dir yet */ }
function scanSvg(dir: string): Set<string> {
  try { return new Set(readdirSync(join(PUBLIC, dir)).filter((f) => /\.svg$/i.test(f)).map((f) => f.replace(/\.svg$/i, '').toLowerCase())); }
  catch { return new Set(); }
}
const crestSlugs = scanSvg('crests');

const credits = creditsRaw as Record<string, { author: string; license: string; url: string }>;

// Pick one of a player's images, rotating by story id so the same player on
// different cards doesn't repeat (list is newest-first, so single-image players
// always show their most recent shot).
function pickPlayer(slug: string, id: string): { src: string; slug: string } | null {
  const list = playerFiles[slug];
  if (!list || !list.length) return null;
  let h = 0;
  for (const c of id || slug) h = (h * 31 + c.charCodeAt(0)) | 0;
  const f = list[Math.abs(h) % list.length];
  return { src: `/players/${f}`, slug: f.replace(IMG_RE, '').toLowerCase() };
}

// Resolve a player photo for a story: try the extracted names exactly, then scan
// the title/summary for any known player (full name, mononym, or surname).
// `id` drives which of several images is shown. Returns path + slug (for credit).
export function resolvePlayer(names: string[], id: string, ...texts: string[]): { src: string; slug: string } | null {
  for (const n of names || []) {
    const s = slugify(n);
    if (playerFiles[s]) return pickPlayer(s, id);
  }
  for (const text of texts) {
    if (!text) continue;
    const norm = deburr(text).replace(/[^a-z0-9]+/g, ' ').replace(/\s+/g, ' ').trim();
    const padded = ` ${norm} `;
    for (const key in nameIndex) {
      if (key.includes(' ') && padded.includes(` ${key} `)) return pickPlayer(nameIndex[key], id);
    }
    for (const tok of norm.split(' ')) {
      if (nameIndex[tok]) return pickPlayer(nameIndex[tok], id);
    }
  }
  return null;
}

// Real club photo (rotating by story id) for the fallback when no player matched
// but a club is named. Returns image path + file slug (for credit), or null.
export function clubPhoto(names: string[], id: string): { src: string; slug: string } | null {
  let h = 0;
  for (const c of id) h = (h * 31 + c.charCodeAt(0)) | 0;
  for (const n of names || []) {
    const s = slugify(n);
    const list = clubPhotos[s];
    if (list && list.length) {
      const f = list[Math.abs(h) % list.length];
      return { src: `/club-photos/${f}`, slug: f.replace(IMG_RE, '').toLowerCase() };
    }
  }
  return null;
}

// First matching club image for the story's clubs, else null.
// Prefers a real crest downloaded from Commons, else our original emblem.
export function clubImage(names: string[]): string | null {
  for (const n of names || []) {
    const s = slugify(n);
    if (clubFiles[s]) return `/clubs/${clubFiles[s]}`;
    if (crestSlugs.has(s)) return `/crests/${s}.svg`;
  }
  return null;
}

// The club slug a clubImage() path resolves to (for credit lookup), or null.
export function clubSlugForImage(names: string[]): string | null {
  for (const n of names || []) {
    const s = slugify(n);
    if (clubFiles[s] || crestSlugs.has(s)) return s;
  }
  return null;
}

// Deterministic royalty-free generic photo from the id, or null if none downloaded yet.
export function genericPhoto(id: string): string | null {
  if (!photoFiles.length) return null;
  let h = 0;
  for (const c of id) h = (h * 31 + c.charCodeAt(0)) | 0;
  return `/photos/${photoFiles[Math.abs(h) % photoFiles.length]}`;
}

export function getCredit(slug: string) {
  return credits[slug] ?? null;
}
