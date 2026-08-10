// Generates the default Open Graph social-share image for TransferHub.
// 1200x630 branded card: dark emerald gradient, arrow logo mark, wordmark,
// tagline, and a rose "LIVE" pill echoing the site's breaking-news accent.
import { createCanvas } from 'canvas';
import { writeFileSync, mkdirSync } from 'node:fs';

mkdirSync('public', { recursive: true });

const GOLD_LIGHT = '#e6c24d';
const GOLD       = '#d4af37';
const GOLD_DARK  = '#b8942a';
const PITCH      = '#0c1f14';

const W = 1200, H = 630;

// Draw the brand arrow inside a rounded emerald square at (x,y) of size `s`.
function drawLogoMark(ctx, x, y, s) {
  const r = s * 0.22; // corner radius

  ctx.save();
  // soft drop shadow for depth
  ctx.shadowColor = 'rgba(0,0,0,0.35)';
  ctx.shadowBlur = s * 0.14;
  ctx.shadowOffsetY = s * 0.06;

  // rounded square with its own emerald gradient
  const g = ctx.createLinearGradient(x, y, x + s, y + s);
  g.addColorStop(0, GOLD_LIGHT);
  g.addColorStop(0.55, GOLD);
  g.addColorStop(1, GOLD_DARK);
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + s, y, x + s, y + s, r);
  ctx.arcTo(x + s, y + s, x, y + s, r);
  ctx.arcTo(x, y + s, x, y, r);
  ctx.arcTo(x, y, x + s, y, r);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // White arrow, following the site's path M7 16h18M17 9l8 7-8 7 in a 32-unit box.
  ctx.save();
  ctx.translate(x, y);
  const k = s / 32; // scale from the 32-unit viewBox
  ctx.strokeStyle = PITCH;
  ctx.lineWidth = 3.2 * k;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  // shaft: M7 16 h18
  ctx.beginPath();
  ctx.moveTo(7 * k, 16 * k);
  ctx.lineTo(25 * k, 16 * k);
  ctx.stroke();
  // head: M17 9 l8 7 -8 7
  ctx.beginPath();
  ctx.moveTo(17 * k, 9 * k);
  ctx.lineTo(25 * k, 16 * k);
  ctx.lineTo(17 * k, 23 * k);
  ctx.stroke();
  ctx.restore();
}

function makeOg() {
  const c = createCanvas(W, H);
  const ctx = c.getContext('2d');

  // Rich dark-pitch diagonal gradient background
  const g = ctx.createLinearGradient(0, 0, W, H);
  g.addColorStop(0, '#0a1a10');   // deepest pitch
  g.addColorStop(0.5, '#0f2417'); // pitch
  g.addColorStop(1, '#14301e');   // pitch surface
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);

  // Gold glow from the upper-left for depth
  const rg = ctx.createRadialGradient(W * 0.28, H * 0.22, 40, W * 0.28, H * 0.22, W * 0.7);
  rg.addColorStop(0, 'rgba(212,175,55,0.28)');
  rg.addColorStop(1, 'rgba(212,175,55,0)');
  ctx.fillStyle = rg;
  ctx.fillRect(0, 0, W, H);

  // Soft green glow lower-right
  const rg2 = ctx.createRadialGradient(W * 0.9, H * 0.9, 20, W * 0.9, H * 0.9, W * 0.55);
  rg2.addColorStop(0, 'rgba(74,222,128,0.14)');
  rg2.addColorStop(1, 'rgba(74,222,128,0)');
  ctx.fillStyle = rg2;
  ctx.fillRect(0, 0, W, H);

  // Bottom gold keyline for a crisp brand edge
  ctx.fillStyle = GOLD;
  ctx.fillRect(0, H - 12, W, 12);

  const padX = 90;

  // --- LIVE pill (top-left) ---
  const pillY = 96, pillH = 52;
  ctx.font = 'bold 26px Arial, sans-serif';
  const liveText = 'LIVE';
  const dotR = 8;
  const pillTextW = ctx.measureText(liveText).width;
  const pillPad = 26;
  const pillW = pillPad + dotR * 2 + 12 + pillTextW + pillPad;
  // pill body
  ctx.fillStyle = GOLD;
  const pr = pillH / 2;
  ctx.beginPath();
  ctx.moveTo(padX + pr, pillY);
  ctx.arcTo(padX + pillW, pillY, padX + pillW, pillY + pillH, pr);
  ctx.arcTo(padX + pillW, pillY + pillH, padX, pillY + pillH, pr);
  ctx.arcTo(padX, pillY + pillH, padX, pillY, pr);
  ctx.arcTo(padX, pillY, padX + pillW, pillY, pr);
  ctx.closePath();
  ctx.fill();
  // dark dot
  ctx.fillStyle = PITCH;
  ctx.beginPath();
  ctx.arc(padX + pillPad + dotR, pillY + pillH / 2, dotR, 0, Math.PI * 2);
  ctx.fill();
  // LIVE text
  ctx.fillStyle = PITCH;
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'left';
  ctx.fillText(liveText, padX + pillPad + dotR * 2 + 12, pillY + pillH / 2 + 1);

  // --- Logo mark + wordmark ---
  const markSize = 132;
  const markY = 250;
  drawLogoMark(ctx, padX, markY, markSize);

  ctx.fillStyle = '#ffffff';
  ctx.textBaseline = 'alphabetic';
  ctx.textAlign = 'left';
  ctx.font = 'bold 108px Arial, sans-serif';
  const wordX = padX + markSize + 40;
  const wordBaseline = markY + markSize * 0.72;
  // "Transfer" cream, "Hub" gold
  ctx.fillText('Transfer', wordX, wordBaseline);
  const transferW = ctx.measureText('Transfer').width;
  ctx.fillStyle = GOLD_LIGHT;
  ctx.fillText('Hub', wordX + transferW, wordBaseline);

  // --- Tagline ---
  ctx.fillStyle = 'rgba(255,255,255,0.9)';
  ctx.font = '44px Arial, sans-serif';
  ctx.fillText('Live Football Transfer News, Rumours & Done Deals', padX, markY + markSize + 96);

  return c;
}

writeFileSync('public/og-default.png', makeOg().toBuffer('image/png'));
console.log('Generated public/og-default.png — 1200x630 branded OG card');
