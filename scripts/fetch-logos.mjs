// One-time: download club crests from TheSportsDB (free API) into public/logos/.
// Self-hosted so they always load — no CDN hotlink failures at runtime.
import { writeFileSync, mkdirSync } from 'node:fs';

const OUT = 'public/logos';
mkdirSync(OUT, { recursive: true });

// Display name -> slug (file name) + search term for TheSportsDB
const CLUBS = [
  ['Arsenal', 'Arsenal'],
  ['Chelsea', 'Chelsea'],
  ['Liverpool', 'Liverpool'],
  ['Manchester City', 'Manchester City'],
  ['Manchester United', 'Manchester United'],
  ['Tottenham', 'Tottenham Hotspur'],
  ['Newcastle', 'Newcastle United'],
  ['Aston Villa', 'Aston Villa'],
  ['West Ham', 'West Ham United'],
  ['Brighton', 'Brighton'],
  ['Real Madrid', 'Real Madrid'],
  ['Barcelona', 'Barcelona'],
  ['Atletico Madrid', 'Atletico Madrid'],
  ['Bayern Munich', 'Bayern Munich'],
  ['Dortmund', 'Borussia Dortmund'],
  ['PSG', 'Paris Saint-Germain'],
  ['Juventus', 'Juventus'],
  ['Inter Milan', 'Inter Milan'],
  ['AC Milan', 'AC Milan'],
  ['Napoli', 'Napoli'],
  ['Bayer Leverkusen', 'Bayer Leverkusen'],
  ['RB Leipzig', 'RB Leipzig'],
  ['Ajax', 'Ajax'],
  ['Porto', 'FC Porto'],
  ['Benfica', 'Benfica'],
  ['Sevilla', 'Sevilla'],
  ['Celtic', 'Celtic'],
  ['Rangers', 'Rangers'],
];

const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function getBadgeUrl(searchName) {
  const url = `https://www.thesportsdb.com/api/v1/json/3/searchteams.php?t=${encodeURIComponent(searchName)}`;
  const res = await fetch(url, { headers: { 'User-Agent': 'TransferHub/1.0' } });
  if (!res.ok) return null;
  const data = await res.json();
  const team = data?.teams?.find((t) => t.strSport === 'Soccer') || data?.teams?.[0];
  return team?.strBadge || team?.strTeamBadge || null;
}

async function download(url) {
  const res = await fetch(url, { headers: { 'User-Agent': 'TransferHub/1.0' } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

let ok = 0, fail = 0;
for (const [display, search] of CLUBS) {
  const slug = slugify(display);
  try {
    const badge = await getBadgeUrl(search);
    if (!badge) { console.log(`MISS  ${display} (no badge)`); fail++; await sleep(300); continue; }
    const buf = await download(`${badge}/small`.replace('/small', '') ); // full-size badge
    writeFileSync(`${OUT}/${slug}.png`, buf);
    console.log(`OK    ${display} -> ${slug}.png (${(buf.length / 1024).toFixed(0)}KB)`);
    ok++;
  } catch (e) {
    console.log(`FAIL  ${display}: ${e.message}`);
    fail++;
  }
  await sleep(350); // be polite to the free API
}
console.log(`\nDone. ${ok} downloaded, ${fail} failed -> ${OUT}/`);
