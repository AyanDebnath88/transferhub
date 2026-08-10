// Run: node scripts/generate-icons.mjs
// Generates PWA icons from an SVG using sharp (installed as dev dep)
import { createCanvas } from 'canvas';
import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, '../public/icons');
mkdirSync(outDir, { recursive: true });

const SIZES = [32, 72, 96, 128, 144, 152, 192, 384, 512];

for (const size of SIZES) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // Background
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.roundRect(0, 0, size, size, size * 0.2);
  ctx.fill();

  // Football emoji
  const fontSize = Math.floor(size * 0.6);
  ctx.font = `${fontSize}px serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('⚽', size / 2, size / 2 + size * 0.04);

  const buf = canvas.toBuffer('image/png');
  writeFileSync(join(outDir, `icon-${size}.png`), buf);
  console.log(`✓ icon-${size}.png`);
}
console.log('Icons generated!');
