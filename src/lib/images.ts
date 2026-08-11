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

// slug -> filename (for player + club drop-ins)
const playerFiles: Record<string, string> = {};
for (const f of scan('players')) playerFiles[f.replace(IMG_RE, '').toLowerCase()] = f;

const photoFiles = scan('photos').sort();

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

// First matching player (or club) image, else null.
export function playerImage(names: string[]): string | null {
  for (const n of names || []) {
    const s = slugify(n);
    if (playerFiles[s]) return `/players/${playerFiles[s]}`;
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
