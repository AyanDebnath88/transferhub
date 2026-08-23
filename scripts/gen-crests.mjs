// Generate ORIGINAL monogram-shield crests (public/crests/<slug>.svg) for clubs
// that appear in the live league tables but have no full club page (not in
// CLUB_META), so their badges stop rendering as blank grey initials.
//
// These are our OWN designs (gradient shield + band + initials), NOT real
// trademarked crests. Also emits src/lib/crestColors.ts so ClubBadge knows the
// colour/short for each and can render the SVG.
//
// Run:  node scripts/gen-crests.mjs         (skip existing)
//       node scripts/gen-crests.mjs --force (rewrite all extras)
import { writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const CRESTS = join(ROOT, 'public', 'crests');
const FORCE = process.argv.includes('--force');

// display name -> { color: primary brand colour, short: 2-4 char monogram }
// Keyed by the display names produced by standings NAME_MAP (src/lib/standings.ts).
const EXTRA = {
  // Premier League
  'Nottingham Forest': { color: '#DD0000', short: 'NFO' },
  'Brentford': { color: '#E30613', short: 'BRE' },
  'Crystal Palace': { color: '#1B458F', short: 'CRY' },
  'Everton': { color: '#003399', short: 'EVE' },
  'Fulham': { color: '#000000', short: 'FUL' },
  'Bournemouth': { color: '#DA291C', short: 'BOU' },
  'Wolves': { color: '#FDB913', short: 'WOL' },
  'Leeds United': { color: '#1D428A', short: 'LEE' },
  'Burnley': { color: '#6C1D45', short: 'BUR' },
  'Sunderland': { color: '#EB172B', short: 'SUN' },
  // La Liga
  'Athletic Bilbao': { color: '#EE2523', short: 'ATH' },
  'Real Sociedad': { color: '#143C8B', short: 'RSO' },
  'Villarreal': { color: '#FFE667', short: 'VIL' },
  'Real Betis': { color: '#00954C', short: 'BET' },
  'Valencia': { color: '#F18E00', short: 'VAL' },
  'Girona': { color: '#CD2534', short: 'GIR' },
  'Osasuna': { color: '#0A346F', short: 'OSA' },
  'Celta Vigo': { color: '#6FADE3', short: 'CLV' },
  'Rayo Vallecano': { color: '#E53027', short: 'RAY' },
  'Getafe': { color: '#005999', short: 'GET' },
  'Mallorca': { color: '#E20613', short: 'MLL' },
  'Espanyol': { color: '#007FC8', short: 'ESP' },
  'Deportivo Alaves': { color: '#0761AF', short: 'ALA' },
  'Elche': { color: '#00963E', short: 'ELC' },
  'Levante': { color: '#9E1B32', short: 'LVT' },
  'Real Oviedo': { color: '#004B9E', short: 'OVI' },
  // Serie A
  'Roma': { color: '#8E1F2F', short: 'ROM' },
  'Lazio': { color: '#87D8F7', short: 'LAZ' },
  'Fiorentina': { color: '#592C82', short: 'FIO' },
  'Atalanta': { color: '#1E71B8', short: 'ATA' },
  'Bologna': { color: '#A21C26', short: 'BOL' },
  'Torino': { color: '#881600', short: 'TOR' },
  'Udinese': { color: '#000000', short: 'UDI' },
  'Genoa': { color: '#C8102E', short: 'GEN' },
  'Como': { color: '#0057B8', short: 'COM' },
  'Cagliari': { color: '#A50021', short: 'CAG' },
  'Lecce': { color: '#FCD200', short: 'LEC' },
  'Hellas Verona': { color: '#1C3F94', short: 'VER' },
  'Parma': { color: '#005DAA', short: 'PAR' },
  'Pisa': { color: '#00539B', short: 'PIS' },
  'Cremonese': { color: '#A6192E', short: 'CRE' },
  'Sassuolo': { color: '#00A752', short: 'SAS' },
  // Bundesliga
  'Stuttgart': { color: '#E32219', short: 'STU' },
  'Eintracht Frankfurt': { color: '#E1000F', short: 'SGE' },
  'Freiburg': { color: '#E2001A', short: 'SCF' },
  'Wolfsburg': { color: '#65B32E', short: 'WOB' },
  'Werder Bremen': { color: '#1D9053', short: 'SVW' },
  'Hoffenheim': { color: '#1C63B7', short: 'TSG' },
  'Mainz': { color: '#C3141E', short: 'M05' },
  'Borussia Monchengladbach': { color: '#00983A', short: 'BMG' },
  'Augsburg': { color: '#C8102E', short: 'FCA' },
  'Union Berlin': { color: '#EB1923', short: 'FCU' },
  'St Pauli': { color: '#614B3A', short: 'STP' },
  'Heidenheim': { color: '#E30613', short: 'FCH' },
  'Hamburg': { color: '#003087', short: 'HSV' },
  'Koln': { color: '#ED1C24', short: 'KOE' },
  // Ligue 1
  'Marseille': { color: '#2FAEE0', short: 'OM' },
  'Monaco': { color: '#E51B22', short: 'ASM' },
  'Lyon': { color: '#1D3A8A', short: 'OL' },
  'Lille': { color: '#E01E13', short: 'LIL' },
  'Nice': { color: '#C8102E', short: 'OGN' },
  'Rennes': { color: '#E23138', short: 'REN' },
  'Lens': { color: '#FFE500', short: 'RCL' },
  'Strasbourg': { color: '#0072CE', short: 'RCS' },
  'Nantes': { color: '#FCD200', short: 'FCN' },
  'Toulouse': { color: '#6F2C91', short: 'TFC' },
  'Brest': { color: '#E2001A', short: 'BRT' },
  'Auxerre': { color: '#1D5CA8', short: 'AUX' },
  'Le Havre': { color: '#00539F', short: 'HAC' },
  'Angers': { color: '#222222', short: 'SCO' },
  'Metz': { color: '#7A0026', short: 'FCM' },
  'Lorient': { color: '#FF6600', short: 'FCL' },
  'Paris FC': { color: '#0A2240', short: 'PFC' },
};

const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

// Darken a hex colour for the gradient's bottom stop.
function darken(hex, f = 0.72) {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.round(((n >> 16) & 255) * f);
  const g = Math.round(((n >> 8) & 255) * f);
  const b = Math.round((n & 255) * f);
  return `rgb(${r},${g},${b})`;
}
// Readable text/band colour: dark ink on light crests, white on dark.
function inkFor(hex) {
  const n = parseInt(hex.slice(1), 16);
  const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return lum > 0.6 ? '#111111' : '#ffffff';
}

function svg({ color, short }) {
  const ink = inkFor(color);
  const bandBase = ink === '#111111' ? '17,17,17' : '255,255,255';
  const stroke = ink === '#111111' ? 'rgba(0,0,0,0.35)' : 'rgba(255,255,255,0.65)';
  const size = short.length >= 4 ? 16 : short.length === 3 ? 19 : 23;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 74" role="img">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${color}"/>
      <stop offset="1" stop-color="${darken(color)}"/>
    </linearGradient>
  </defs>
  <path d="M32 2 L60 11 V40 C60 57 47 68 32 72 C17 68 4 57 4 40 V11 Z"
        fill="url(#g)" stroke="${stroke}" stroke-width="2"/>
  <path d="M4 24 H60 V33 H4 Z" fill="rgba(${bandBase},0.14)"/>
  <circle cx="32" cy="12" r="2.4" fill="${ink}"/>
  <text x="32" y="52" text-anchor="middle" font-family="Georgia, serif" font-weight="700"
        font-size="${size}" letter-spacing="0.5" fill="${ink}">${short}</text>
</svg>`;
}

if (!existsSync(CRESTS)) mkdirSync(CRESTS, { recursive: true });

let written = 0, skipped = 0;
for (const [name, meta] of Object.entries(EXTRA)) {
  const file = join(CRESTS, `${slugify(name)}.svg`);
  if (existsSync(file) && !FORCE) { skipped++; continue; }
  writeFileSync(file, svg(meta));
  written++;
}

// Emit the registry consumed by ClubBadge.
const entries = Object.entries(EXTRA)
  .map(([name, m]) => `  ${JSON.stringify(name)}: { color: '${m.color}', short: '${m.short}' },`)
  .join('\n');
const ts = `// AUTO-GENERATED by scripts/gen-crests.mjs — do not edit by hand.
// Brand colour + monogram for clubs that appear in league tables but have no
// full club page (not in CLUB_META). Lets ClubBadge render an original crest
// (public/crests/<slug>.svg) instead of a blank grey initials circle.
export const EXTRA_CREST_COLORS: Record<string, { color: string; short: string }> = {
${entries}
};
`;
writeFileSync(join(ROOT, 'src', 'lib', 'crestColors.ts'), ts);

console.log(`crests: ${written} written, ${skipped} skipped, ${Object.keys(EXTRA).length} total. Registry: src/lib/crestColors.ts`);
