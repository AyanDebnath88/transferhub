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

export const DONE_DEALS: DoneDeal[] = [
  { player: 'Florian Wirtz',        to: 'Liverpool',         from: 'Bayer Leverkusen', fee: '£116m' },
  { player: 'Hugo Ekitike',         to: 'Liverpool',         from: 'Eintracht Frankfurt', fee: '£79m' },
  { player: 'Milos Kerkez',         to: 'Liverpool',         from: 'Bournemouth',      fee: '£40m' },
  { player: 'Jeremie Frimpong',     to: 'Liverpool',         from: 'Bayer Leverkusen', fee: '£30m' },
  { player: 'Viktor Gyokeres',      to: 'Arsenal',           from: 'Sporting',         fee: '£64m' },
  { player: 'Martin Zubimendi',     to: 'Arsenal',           from: 'Real Sociedad',    fee: '£51m' },
  { player: 'Noni Madueke',         to: 'Arsenal',           from: 'Chelsea',          fee: '£48m' },
  { player: 'Matheus Cunha',        to: 'Manchester United', from: 'Wolves',           fee: '£62m' },
  { player: 'Bryan Mbeumo',         to: 'Manchester United', from: 'Brentford',        fee: '£65m' },
  { player: 'Benjamin Sesko',       to: 'Manchester United', from: 'RB Leipzig',       fee: '£74m' },
  { player: 'Tijjani Reijnders',    to: 'Manchester City',   from: 'AC Milan',         fee: '£46m' },
  { player: 'Rayan Cherki',         to: 'Manchester City',   from: 'Lyon',             fee: '£34m' },
  { player: 'Rayan Ait-Nouri',      to: 'Manchester City',   from: 'Wolves',           fee: '£31m' },
  { player: 'Joao Pedro',           to: 'Chelsea',           from: 'Brighton',         fee: '£60m' },
  { player: 'Jamie Gittens',        to: 'Chelsea',           from: 'Dortmund',         fee: '£48m' },
  { player: 'Trent Alexander-Arnold', to: 'Real Madrid',     from: 'Liverpool',        fee: '£8.4m' },
  { player: 'Dean Huijsen',         to: 'Real Madrid',       from: 'Bournemouth',      fee: '£50m' },
  { player: 'Alvaro Carreras',      to: 'Real Madrid',       from: 'Benfica',          fee: '£42m' },
  { player: 'Marcus Rashford',      to: 'Barcelona',         from: 'Manchester United', fee: 'Loan' },
  { player: 'Luis Diaz',            to: 'Bayern Munich',     from: 'Liverpool',        fee: '£65m' },
  { player: 'Jonathan David',       to: 'Juventus',          from: 'Lille',            fee: 'Free' },
  { player: 'Luka Modric',          to: 'AC Milan',          from: 'Real Madrid',      fee: 'Free' },
  { player: 'Ange-Yoan Bonny',      to: 'Inter Milan',       from: 'Parma',            fee: '£20m' },
  { player: 'Illya Zabarnyi',       to: 'PSG',               from: 'Bournemouth',      fee: '£56m' },
  { player: 'Lucas Chevalier',      to: 'PSG',               from: 'Lille',            fee: '£34m' },
  { player: 'Richard Rios',         to: 'Benfica',           from: 'Palmeiras',        fee: '£26m' },
];
