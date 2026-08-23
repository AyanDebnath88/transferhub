// Hand-maintained league standings for the covered leagues. The feed can't
// provide live tables, so update these as the season progresses (edit pts/w/d/l/gd,
// reorder rows) and redeploy. Club names should match CLUB_META display names where
// a club page exists, so club pages can show the team's current position.
export interface TableRow { pos: number; club: string; p: number; w: number; d: number; l: number; gd: number; pts: number; }

// Build rows from an ordered name list. Stats default to 0 (season start); edit later.
const T = (names: string[]): TableRow[] =>
  names.map((club, i) => ({ pos: i + 1, club, p: 0, w: 0, d: 0, l: 0, gd: 0, pts: 0 }));

export const LEAGUE_TABLES: Record<string, { name: string; slug: string; rows: TableRow[] }> = {
  'premier-league': {
    name: 'Premier League', slug: 'premier-league',
    rows: T(['Liverpool', 'Arsenal', 'Manchester City', 'Chelsea', 'Newcastle', 'Aston Villa',
      'Tottenham', 'Manchester United', 'Brighton', 'Nottingham Forest', 'Brentford', 'Crystal Palace',
      'Fulham', 'Bournemouth', 'West Ham', 'Everton', 'Wolves', 'Leeds United', 'Burnley', 'Sunderland']),
  },
  'la-liga': {
    name: 'La Liga', slug: 'la-liga',
    rows: T(['Real Madrid', 'Barcelona', 'Atletico Madrid', 'Athletic Bilbao', 'Villarreal', 'Real Betis',
      'Real Sociedad', 'Sevilla', 'Valencia', 'Girona', 'Osasuna', 'Celta Vigo', 'Rayo Vallecano',
      'Getafe', 'Mallorca', 'Espanyol', 'Deportivo Alaves', 'Elche', 'Levante', 'Real Oviedo']),
  },
  'serie-a': {
    name: 'Serie A', slug: 'serie-a',
    rows: T(['Napoli', 'Inter Milan', 'Juventus', 'AC Milan', 'Atalanta', 'Roma', 'Lazio', 'Fiorentina',
      'Bologna', 'Torino', 'Udinese', 'Genoa', 'Como', 'Cagliari', 'Lecce', 'Hellas Verona',
      'Parma', 'Pisa', 'Cremonese', 'Sassuolo']),
  },
  'bundesliga': {
    name: 'Bundesliga', slug: 'bundesliga',
    rows: T(['Bayern Munich', 'Bayer Leverkusen', 'Dortmund', 'RB Leipzig', 'Stuttgart', 'Eintracht Frankfurt',
      'Freiburg', 'Wolfsburg', 'Werder Bremen', 'Hoffenheim', 'Mainz', 'Borussia Monchengladbach',
      'Augsburg', 'Union Berlin', 'St Pauli', 'Heidenheim', 'Hamburg', 'Koln']),
  },
  'ligue-1': {
    name: 'Ligue 1', slug: 'ligue-1',
    rows: T(['PSG', 'Marseille', 'Monaco', 'Lille', 'Nice', 'Lyon', 'Lens', 'Rennes', 'Strasbourg',
      'Nantes', 'Toulouse', 'Brest', 'Auxerre', 'Le Havre', 'Angers', 'Metz', 'Lorient', 'Paris FC']),
  },
};

export const ALL_TABLES = Object.values(LEAGUE_TABLES);

// A club's current standing, or null if not in any covered table.
export function getClubPosition(club: string): { league: string; slug: string; pos: number; pts: number; total: number } | null {
  for (const t of ALL_TABLES) {
    const row = t.rows.find((r) => r.club === club);
    if (row) return { league: t.name, slug: t.slug, pos: row.pos, pts: row.pts, total: t.rows.length };
  }
  return null;
}

export const ordinal = (n: number): string => {
  const s = ['th', 'st', 'nd', 'rd'], v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
};
