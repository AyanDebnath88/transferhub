// Generates 100%-original, copyright-free brand assets:
//  1. public/crests/<slug>.svg  — an ORIGINAL stylized shield per club (club colour
//     + monogram). NOT a copy or cartoon of any real trademarked crest.
//  2. public/cards/<n>.svg       — generic football card art (pitch/floodlights/ball),
//     no real players, no logos, no photos → nothing to infringe.
import { writeFileSync, mkdirSync } from 'node:fs';

mkdirSync('public/crests', { recursive: true });
mkdirSync('public/cards', { recursive: true });

const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

// name, primary colour, monogram
const CLUBS = [
  ['Arsenal', '#EF0107', 'ARS'], ['Chelsea', '#034694', 'CHE'], ['Liverpool', '#C8102E', 'LIV'],
  ['Manchester City', '#6CABDD', 'MCI'], ['Manchester United', '#DA291C', 'MUN'], ['Tottenham', '#132257', 'TOT'],
  ['Newcastle', '#241F20', 'NEW'], ['Aston Villa', '#95BFE5', 'AVL'], ['West Ham', '#7A263A', 'WHU'],
  ['Brighton', '#0057B8', 'BHA'], ['Real Madrid', '#FEBE10', 'RMA'], ['Barcelona', '#A50044', 'BAR'],
  ['Atletico Madrid', '#CB3524', 'ATM'], ['Bayern Munich', '#DC052D', 'BAY'], ['Dortmund', '#FDE100', 'BVB'],
  ['PSG', '#003170', 'PSG'], ['Juventus', '#111111', 'JUV'], ['Inter Milan', '#010E80', 'INT'],
  ['AC Milan', '#FB090B', 'MIL'], ['Napoli', '#087AC1', 'NAP'], ['Bayer Leverkusen', '#E32221', 'LEV'],
  ['RB Leipzig', '#DD0741', 'RBL'], ['Ajax', '#D2122E', 'AJX'], ['Porto', '#004B9D', 'POR'],
  ['Benfica', '#CC0000', 'BEN'], ['Sevilla', '#D3000D', 'SEV'], ['Celtic', '#16A850', 'CEL'],
  ['Rangers', '#1B458F', 'RAN'],
];

// pick readable text colour for a given bg
function textOn(hex) {
  const r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16);
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return lum > 0.6 ? '#0c1f14' : '#ffffff';
}
function darken(hex, f = 0.7) {
  const r = Math.round(parseInt(hex.slice(1, 3), 16) * f);
  const g = Math.round(parseInt(hex.slice(3, 5), 16) * f);
  const b = Math.round(parseInt(hex.slice(5, 7), 16) * f);
  return `rgb(${r},${g},${b})`;
}

// Original shield emblem — a generic heraldic shield, no resemblance to any real crest.
function crest(color, mono) {
  const ink = textOn(color);
  const dk = darken(color, 0.66);
  const band = ink === '#ffffff' ? 'rgba(255,255,255,0.14)' : 'rgba(0,0,0,0.10)';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 74" role="img">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${color}"/>
      <stop offset="1" stop-color="${dk}"/>
    </linearGradient>
  </defs>
  <path d="M32 2 L60 11 V40 C60 57 47 68 32 72 C17 68 4 57 4 40 V11 Z"
        fill="url(#g)" stroke="rgba(255,255,255,0.65)" stroke-width="2"/>
  <path d="M4 24 H60 V33 H4 Z" fill="${band}"/>
  <circle cx="32" cy="12" r="2.4" fill="${ink}"/>
  <text x="32" y="52" text-anchor="middle" font-family="Georgia, serif" font-weight="700"
        font-size="21" letter-spacing="0.5" fill="${ink}">${mono}</text>
</svg>`;
}

for (const [name, color, mono] of CLUBS) {
  writeFileSync(`public/crests/${slugify(name)}.svg`, crest(color, mono));
}

// Vivid, varied football card art — original vector scenes. Bold accent field +
// stylised ball + motion streaks so cards feel alive (no photos, fully ours).
const PALETTES = [
  { d1: '#134e34', d2: '#0a1a10', a: '#d4af37' }, // gold
  { d1: '#0b2b3a', d2: '#07141c', a: '#38bdf8' }, // sky
  { d1: '#123524', d2: '#08150e', a: '#22c55e' }, // emerald
  { d1: '#2a1030', d2: '#150818', a: '#a78bfa' }, // violet
  { d1: '#331a0a', d2: '#1a0d05', a: '#fb923c' }, // orange
  { d1: '#0e3330', d2: '#071b19', a: '#2dd4bf' }, // teal
  { d1: '#331624', d2: '#1a0b12', a: '#fb7185' }, // rose
  { d1: '#3a3208', d2: '#1d1904', a: '#facc15' }, // amber
  { d1: '#101f3a', d2: '#080f1d', a: '#818cf8' }, // indigo
  { d1: '#123c1e', d2: '#08200f', a: '#4ade80' }, // green
  { d1: '#3a2408', d2: '#1d1204', a: '#e6c24d' }, // brass
  { d1: '#0e2733', d2: '#07141a', a: '#7dd3fc' }, // ice
];

function cardArt(i) {
  const p = PALETTES[i % PALETTES.length];
  const flip = i % 2 === 0;      // alternate diagonal direction
  const ballX = flip ? 940 : 260;
  // hexagon "ball" panels
  const hexes = [[0, -46], [40, -23], [40, 23], [0, 46], [-40, 23], [-40, -23]]
    .map(([dx, dy]) => `<circle cx="${ballX + dx}" cy="${230 + dy}" r="15" fill="${p.a}" fill-opacity="0.5"/>`)
    .join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 675" preserveAspectRatio="xMidYMid slice">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${p.d1}"/>
      <stop offset="1" stop-color="${p.d2}"/>
    </linearGradient>
    <linearGradient id="band" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${p.a}" stop-opacity="0.9"/>
      <stop offset="1" stop-color="${p.a}" stop-opacity="0.35"/>
    </linearGradient>
    <radialGradient id="glow" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stop-color="${p.a}" stop-opacity="0.5"/>
      <stop offset="1" stop-color="${p.a}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1200" height="675" fill="url(#bg)"/>
  <!-- bold diagonal accent field -->
  <g transform="${flip ? '' : 'translate(1200,0) scale(-1,1)'}">
    <path d="M0 675 L520 675 L820 0 L300 0 Z" fill="url(#band)"/>
    <path d="M540 675 L620 675 L900 0 L820 0 Z" fill="${p.a}" fill-opacity="0.25"/>
  </g>
  <!-- floodlight glow -->
  <circle cx="${ballX}" cy="200" r="430" fill="url(#glow)"/>
  <!-- stylised ball -->
  <circle cx="${ballX}" cy="230" r="66" fill="#0a1a10" fill-opacity="0.55" stroke="${p.a}" stroke-width="5"/>
  ${hexes}
  <circle cx="${ballX}" cy="230" r="18" fill="${p.a}"/>
  <!-- motion streaks -->
  <g stroke="${p.a}" stroke-opacity="0.55" stroke-width="7" stroke-linecap="round">
    <line x1="${ballX + (flip ? -150 : 150)}" y1="180" x2="${ballX + (flip ? -300 : 300)}" y2="150"/>
    <line x1="${ballX + (flip ? -150 : 150)}" y1="230" x2="${ballX + (flip ? -330 : 330)}" y2="230"/>
    <line x1="${ballX + (flip ? -150 : 150)}" y1="280" x2="${ballX + (flip ? -300 : 300)}" y2="310"/>
  </g>
  <!-- accent baseline -->
  <rect x="0" y="661" width="1200" height="14" fill="${p.a}"/>
</svg>`;
}

const CARD_COUNT = 12;
for (let i = 0; i < CARD_COUNT; i++) writeFileSync(`public/cards/${i}.svg`, cardArt(i));

console.log(`Generated ${CLUBS.length} original crests -> public/crests/, ${CARD_COUNT} card-art -> public/cards/`);
