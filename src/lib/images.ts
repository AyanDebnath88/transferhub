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

// slug -> filename (for player + club drop-ins)
const playerFiles: Record<string, string> = {};
for (const f of scan('players')) playerFiles[f.replace(IMG_RE, '').toLowerCase()] = f;

// Loose name index for matching headlines that use only a mononym ("Rodri")
// or a surname ("Haaland") instead of the full filename. Keys map to a filename,
// but only when UNAMBIGUOUS — a name part shared by two players is dropped so we
// never show the wrong face (e.g. "silva", "hernandez", "james").
const nameIndex: Record<string, string> = {};
{
  const collide = new Set<string>();
  for (const slug in playerFiles) {
    const file = playerFiles[slug];
    const parts = slug.split('-');
    const keys = new Set<string>([parts.join(' ')]);       // full name
    keys.add(parts[0]);                                     // first name / mononym
    keys.add(parts[parts.length - 1]);                      // surname
    for (const k of keys) {
      if (k.length < 4) continue;                           // skip tiny/ambiguous tokens
      if (nameIndex[k] && nameIndex[k] !== file) collide.add(k);
      else nameIndex[k] = file;
    }
  }
  for (const k of collide) delete nameIndex[k];
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

// First matching player image, else null.
export function playerImage(names: string[]): string | null {
  for (const n of names || []) {
    const s = slugify(n);
    if (playerFiles[s]) return `/players/${playerFiles[s]}`;
  }
  return null;
}

// Resolve a player photo for a story: try the extracted names exactly, then scan
// the TITLE for any known player (full name, mononym, or unambiguous surname).
// Returns the image path + the player slug (for credit lookup), or null.
export function resolvePlayer(names: string[], title: string): { src: string; slug: string } | null {
  for (const n of names || []) {
    const s = slugify(n);
    if (playerFiles[s]) return { src: `/players/${playerFiles[s]}`, slug: s };
  }
  const norm = deburr(title).replace(/[^a-z0-9]+/g, ' ').replace(/\s+/g, ' ').trim();
  const padded = ` ${norm} `;
  const toHit = (file: string) => ({ src: `/players/${file}`, slug: file.replace(IMG_RE, '').toLowerCase() });
  // full names (multi-word keys) first — most specific
  for (const key in nameIndex) {
    if (key.includes(' ') && padded.includes(` ${key} `)) return toHit(nameIndex[key]);
  }
  // then single-token (mononym / surname) matches
  for (const tok of norm.split(' ')) {
    if (nameIndex[tok]) return toHit(nameIndex[tok]);
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
