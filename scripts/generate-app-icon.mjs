// Generates captivating app icon + splash from the TransferHub brand mark.
// Single bold symbol (transfer arrow) on a vibrant emerald gradient with depth.
import { createCanvas } from 'canvas';
import { writeFileSync, mkdirSync } from 'node:fs';

mkdirSync('assets', { recursive: true });

const EMERALD_LIGHT = '#e6c24d';
const EMERALD       = '#d4af37';
const EMERALD_DARK  = '#b8942a';

// Draw the brand arrow centered in a box of size `s`, scaled by `k` (0..1)
function drawMark(ctx, s, k = 0.46) {
  const head0 = s * 0.16;       // arrowhead size (for centering)
  const cx = s / 2 - head0 / 2, cy = s / 2;  // shift left so head balances
  const len = s * k;            // arrow shaft half-length
  const x0 = cx - len, x1 = cx + len;
  const head = s * 0.16;        // arrowhead size
  const lw = s * 0.085;         // stroke width — bold

  ctx.save();
  // soft drop shadow for depth
  ctx.shadowColor = 'rgba(0,0,0,0.18)';
  ctx.shadowBlur = s * 0.03;
  ctx.shadowOffsetY = s * 0.012;
  ctx.strokeStyle = '#0c1f14';
  ctx.lineWidth = lw;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  // shaft
  ctx.beginPath();
  ctx.moveTo(x0, cy);
  ctx.lineTo(x1, cy);
  ctx.stroke();
  // arrowhead
  ctx.beginPath();
  ctx.moveTo(x1 - head, cy - head);
  ctx.lineTo(x1, cy);
  ctx.lineTo(x1 - head, cy + head);
  ctx.stroke();
  ctx.restore();
}

function makeIcon(size) {
  const c = createCanvas(size, size);
  const ctx = c.getContext('2d');

  // Diagonal vibrant gradient (depth)
  const g = ctx.createLinearGradient(0, 0, size, size);
  g.addColorStop(0, EMERALD_LIGHT);
  g.addColorStop(0.55, EMERALD);
  g.addColorStop(1, EMERALD_DARK);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);

  // Subtle radial glow top-left for dimensionality
  const rg = ctx.createRadialGradient(size * 0.3, size * 0.28, size * 0.05, size * 0.3, size * 0.28, size * 0.8);
  rg.addColorStop(0, 'rgba(255,255,255,0.22)');
  rg.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = rg;
  ctx.fillRect(0, 0, size, size);

  // Faint backdrop disc behind mark for contrast
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size * 0.30, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255,255,255,0.08)';
  ctx.fill();

  drawMark(ctx, size, 0.30);
  return c;
}

function makeSplash(w, h) {
  const c = createCanvas(w, h);
  const ctx = c.getContext('2d');
  const g = ctx.createLinearGradient(0, 0, w, h);
  g.addColorStop(0, EMERALD_LIGHT);
  g.addColorStop(0.55, EMERALD);
  g.addColorStop(1, EMERALD_DARK);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  // center the mark at ~22% of min dimension
  const s = Math.min(w, h);
  ctx.save();
  ctx.translate((w - s) / 2, (h - s) / 2);
  drawMark(ctx, s, 0.16);
  ctx.restore();
  return c;
}

writeFileSync('assets/icon.png', makeIcon(1024).toBuffer('image/png'));
writeFileSync('assets/icon-foreground.png', makeIcon(1024).toBuffer('image/png'));
writeFileSync('assets/splash.png', makeSplash(2732, 2732).toBuffer('image/png'));
writeFileSync('assets/splash-dark.png', makeSplash(2732, 2732).toBuffer('image/png'));

// Overwrite PWA png icons (manifest) so installed web app matches new design
mkdirSync('public/icons', { recursive: true });
for (const size of [32, 72, 96, 128, 144, 152, 167, 180, 192, 256, 384, 512]) {
  writeFileSync(`public/icons/icon-${size}.png`, makeIcon(size).toBuffer('image/png'));
}
console.log('Generated app icon + splash + PWA png icons — emerald gradient + bold arrow');
