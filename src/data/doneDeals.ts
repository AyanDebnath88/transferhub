// Season's completed transfers for the biggest clubs — powers the homepage
// "Top Clubs — Done Deals" sidebar. The live RSS feed only holds ~7 days, so
// this is a hand-maintained list. Edit freely (add/remove/correct) and redeploy.
// `to` should match a name in TOP_CLUBS (index.astro). Order = newest first.
export interface DoneDeal {
  player: string;
  to: string;    // signing club (one of TOP_CLUBS)
  from: string;  // selling club
  fee?: string;  // e.g. "£116m", "Free", "Loan"
}

// Summer 2026 window — cross-checked against Fabrizio Romano / club news (Aug 2026).
export const DONE_DEALS: DoneDeal[] = [
  { player: 'Anthony Gordon',    to: 'Barcelona',         from: 'Newcastle',           fee: '€80m' },
  { player: 'Morgan Rogers',     to: 'Chelsea',           from: 'Aston Villa',         fee: '£117m' },
  { player: 'Bruno Guimaraes',   to: 'Arsenal',           from: 'Newcastle',           fee: '£75m' },
  { player: 'Elliot Anderson',   to: 'Manchester City',   from: 'Nottingham Forest',   fee: 'Club record' },
  { player: 'Goncalo Ramos',     to: 'AC Milan',          from: 'PSG',                 fee: '€74m' },
  { player: 'Marc Cucurella',    to: 'Real Madrid',       from: 'Chelsea',             fee: '£52m' },
  { player: 'Bernardo Silva',    to: 'Real Madrid',       from: 'Manchester City',     fee: 'Free' },
  { player: 'Ibrahima Konate',   to: 'Real Madrid',       from: 'Liverpool',           fee: 'Free' },
  { player: 'Denzel Dumfries',   to: 'Real Madrid',       from: 'Inter Milan',         fee: undefined },
  { player: 'Randal Kolo Muani', to: 'Juventus',          from: 'PSG',                 fee: undefined },
  { player: 'John Stones',       to: 'Inter Milan',       from: 'Manchester City',     fee: 'Free' },
  { player: 'Andrey Santos',     to: 'Manchester United', from: 'Chelsea',             fee: undefined },
  { player: 'Youri Tielemans',   to: 'Manchester United', from: 'Aston Villa',         fee: undefined },
  { player: 'Christos Tzolis',   to: 'Arsenal',           from: 'Club Brugge',         fee: undefined },
  { player: 'Piero Hincapie',    to: 'Arsenal',           from: 'Bayer Leverkusen',    fee: undefined },
  { player: 'Nathaniel Brown',   to: 'Bayern Munich',     from: 'Eintracht Frankfurt', fee: undefined },
  { player: 'Ismael Saibari',    to: 'Bayern Munich',     from: 'PSV',                 fee: undefined },
  { player: 'Maghnes Akliouche', to: 'PSG',               from: 'Monaco',              fee: undefined },
  { player: 'Jeremy Jacquet',    to: 'Liverpool',         from: 'Rennes',              fee: undefined },
];
