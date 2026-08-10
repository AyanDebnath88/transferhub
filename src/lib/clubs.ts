// Commercial-safe default: render our OWN monogram badges (initials + club colors).
// Real club crests are trademarks/copyright — using them commercially needs a license.
// Crest PNGs in public/logos/ stay available for dev only; flip this to use them.
export const USE_REAL_CRESTS = true;

// color/short = our original monogram design (no third-party IP).
export const CLUB_META: Record<string, { color: string; short: string }> = {
  'Arsenal': { color: '#EF0107', short: 'ARS' },
  'Chelsea': { color: '#034694', short: 'CHE' },
  'Liverpool': { color: '#C8102E', short: 'LIV' },
  'Manchester City': { color: '#6CABDD', short: 'MCI' },
  'Manchester United': { color: '#DA291C', short: 'MUN' },
  'Tottenham': { color: '#132257', short: 'TOT' },
  'Newcastle': { color: '#241F20', short: 'NEW' },
  'Aston Villa': { color: '#95BFE5', short: 'AVL' },
  'West Ham': { color: '#7A263A', short: 'WHU' },
  'Brighton': { color: '#0057B8', short: 'BHA' },
  'Real Madrid': { color: '#FEBE10', short: 'RMA' },
  'Barcelona': { color: '#A50044', short: 'BAR' },
  'Atletico Madrid': { color: '#CB3524', short: 'ATM' },
  'Bayern Munich': { color: '#DC052D', short: 'BAY' },
  'Dortmund': { color: '#FDE100', short: 'BVB' },
  'PSG': { color: '#003170', short: 'PSG' },
  'Juventus': { color: '#000000', short: 'JUV' },
  'Inter Milan': { color: '#010E80', short: 'INT' },
  'AC Milan': { color: '#FB090B', short: 'MIL' },
  'Napoli': { color: '#087AC1', short: 'NAP' },
  'Bayer Leverkusen': { color: '#E32221', short: 'LEV' },
  'RB Leipzig': { color: '#DD0741', short: 'RBL' },
  'Ajax': { color: '#D2122E', short: 'AJX' },
  'Porto': { color: '#004B9D', short: 'POR' },
  'Benfica': { color: '#CC0000', short: 'BEN' },
  'Sevilla': { color: '#D3000D', short: 'SEV' },
  'Celtic': { color: '#16A850', short: 'CEL' },
  'Rangers': { color: '#1B458F', short: 'RAN' },
};

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export function getClubMeta(name: string) {
  const meta = CLUB_META[name];
  if (!meta) return null;
  return { ...meta, badge: `/logos/${slugify(name)}.png` };
}

export function clubInitials(name: string): string {
  return name.split(' ').map(w => w[0]).join('').slice(0, 3).toUpperCase();
}
