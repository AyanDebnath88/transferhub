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

// Generic football card art — original vector scenes in the pitch/gold palette.
const ACCENTS = ['#d4af37', '#4ade80', '#7dd3fc', '#fbbf24', '#e6c24d', '#22c55e', '#38bdf8', '#b8942a'];
function cardArt(i) {
  const a = ACCENTS[i % ACCENTS.length];
  const glowX = 120 + (i * 137) % 900;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 675" preserveAspectRatio="xMidYMid slice">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#0f2417"/>
      <stop offset="0.55" stop-color="#0c1f14"/>
      <stop offset="1" stop-color="#0a1a10"/>
    </linearGradient>
    <radialGradient id="glow" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stop-color="${a}" stop-opacity="0.32"/>
      <stop offset="1" stop-color="${a}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1200" height="675" fill="url(#bg)"/>
  <!-- pitch stripes -->
  <g opacity="0.06" fill="#ffffff">
    ${[0,1,2,3,4,5].map(n => `<rect x="${n*200}" y="0" width="100" height="675"/>`).join('')}
  </g>
  <!-- floodlight glow -->
  <circle cx="${glowX}" cy="200" r="520" fill="url(#glow)"/>
  <!-- centre circle + ball -->
  <circle cx="600" cy="470" r="150" fill="none" stroke="${a}" stroke-opacity="0.22" stroke-width="3"/>
  <circle cx="600" cy="470" r="34" fill="none" stroke="${a}" stroke-opacity="0.5" stroke-width="4"/>
  <path d="M600 444 l24 17 -9 28 h-30 l-9 -28 Z" fill="${a}" fill-opacity="0.45"/>
  <!-- gold baseline -->
  <rect x="0" y="663" width="1200" height="12" fill="#d4af37" opacity="0.85"/>
</svg>`;
}

const CARD_COUNT = 8;
for (let i = 0; i < CARD_COUNT; i++) writeFileSync(`public/cards/${i}.svg`, cardArt(i));

console.log(`Generated ${CLUBS.length} original crests -> public/crests/, ${CARD_COUNT} card-art -> public/cards/`);
