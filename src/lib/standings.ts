// Live league standings from football-data.org (token in .env, gitignored).
// Fetched at build time; falls back to the static tables in data/leagueTables.ts
// if the token is missing or the API is unreachable, so the site never breaks.
import { LEAGUE_TABLES, type TableRow } from '../data/leagueTables';

const TOKEN = import.meta.env.FOOTBALL_DATA_TOKEN || process.env.FOOTBALL_DATA_TOKEN || '';

// our league slug -> football-data.org competition code
const COMP: Record<string, string> = {
  'premier-league': 'PL', 'la-liga': 'PD', 'serie-a': 'SA', 'bundesliga': 'BL1', 'ligue-1': 'FL1',
};

// football-data.org team name -> our CLUB_META display name (so badges/club pages match).
const NAME_MAP: Record<string, string> = {
  'Arsenal FC': 'Arsenal', 'Chelsea FC': 'Chelsea', 'Liverpool FC': 'Liverpool',
  'Manchester City FC': 'Manchester City', 'Manchester United FC': 'Manchester United',
  'Tottenham Hotspur FC': 'Tottenham', 'Newcastle United FC': 'Newcastle', 'Aston Villa FC': 'Aston Villa',
  'West Ham United FC': 'West Ham', 'Brighton & Hove Albion FC': 'Brighton',
  'Nottingham Forest FC': 'Nottingham Forest', 'Brentford FC': 'Brentford',
  'Crystal Palace FC': 'Crystal Palace', 'Everton FC': 'Everton', 'Fulham FC': 'Fulham',
  'AFC Bournemouth': 'Bournemouth', 'Wolverhampton Wanderers FC': 'Wolves', 'Leeds United FC': 'Leeds United',
  'Burnley FC': 'Burnley', 'Sunderland AFC': 'Sunderland',
  'Real Madrid CF': 'Real Madrid', 'FC Barcelona': 'Barcelona', 'Club Atlético de Madrid': 'Atletico Madrid',
  'Sevilla FC': 'Sevilla', 'Athletic Club': 'Athletic Bilbao', 'Real Sociedad de Fútbol': 'Real Sociedad',
  'Villarreal CF': 'Villarreal', 'Real Betis Balompié': 'Real Betis', 'Valencia CF': 'Valencia',
  'Girona FC': 'Girona', 'CA Osasuna': 'Osasuna', 'RC Celta de Vigo': 'Celta Vigo',
  'Rayo Vallecano de Madrid': 'Rayo Vallecano', 'Getafe CF': 'Getafe', 'RCD Mallorca': 'Mallorca',
  'RCD Espanyol de Barcelona': 'Espanyol', 'Deportivo Alavés': 'Deportivo Alaves', 'Elche CF': 'Elche',
  'Levante UD': 'Levante', 'Real Oviedo': 'Real Oviedo',
  'Juventus FC': 'Juventus', 'FC Internazionale Milano': 'Inter Milan', 'AC Milan': 'AC Milan',
  'SSC Napoli': 'Napoli', 'AS Roma': 'Roma', 'SS Lazio': 'Lazio', 'ACF Fiorentina': 'Fiorentina',
  'Atalanta BC': 'Atalanta', 'Bologna FC 1909': 'Bologna', 'Torino FC': 'Torino',
  'Udinese Calcio': 'Udinese', 'Genoa CFC': 'Genoa', 'Como 1907': 'Como', 'Cagliari Calcio': 'Cagliari',
  'US Lecce': 'Lecce', 'Hellas Verona FC': 'Hellas Verona', 'Parma Calcio 1913': 'Parma',
  'AC Pisa 1909': 'Pisa', 'US Cremonese': 'Cremonese', 'US Sassuolo Calcio': 'Sassuolo',
  'FC Bayern München': 'Bayern Munich', 'Borussia Dortmund': 'Dortmund', 'Bayer 04 Leverkusen': 'Bayer Leverkusen',
  'RB Leipzig': 'RB Leipzig', 'VfB Stuttgart': 'Stuttgart', 'Eintracht Frankfurt': 'Eintracht Frankfurt',
  'Sport-Club Freiburg': 'Freiburg', 'SC Freiburg': 'Freiburg', 'VfL Wolfsburg': 'Wolfsburg', 'SV Werder Bremen': 'Werder Bremen',
  'TSG 1899 Hoffenheim': 'Hoffenheim', '1. FSV Mainz 05': 'Mainz', "Borussia Mönchengladbach": 'Borussia Monchengladbach',
  'FC Augsburg': 'Augsburg', '1. FC Union Berlin': 'Union Berlin', 'FC St. Pauli 1910': 'St Pauli',
  '1. FC Heidenheim 1846': 'Heidenheim', 'Hamburger SV': 'Hamburg', '1. FC Köln': 'Koln',
  'Paris Saint-Germain FC': 'PSG', 'Olympique de Marseille': 'Marseille', 'AS Monaco FC': 'Monaco',
  'Olympique Lyonnais': 'Lyon', 'LOSC Lille': 'Lille', 'OGC Nice': 'Nice', 'Stade Rennais FC 1901': 'Rennes',
  'RC Lens': 'Lens', 'Racing Club de Lens': 'Lens', 'Lille OSC': 'Lille',
  'RC Strasbourg Alsace': 'Strasbourg', 'FC Nantes': 'Nantes', 'Toulouse FC': 'Toulouse',
  'Stade Brestois 29': 'Brest', 'AJ Auxerre': 'Auxerre', 'Le Havre AC': 'Le Havre', 'Angers SCO': 'Angers',
  'FC Metz': 'Metz', 'FC Lorient': 'Lorient', 'Paris FC': 'Paris FC',
};

function normName(apiName: string): string {
  if (NAME_MAP[apiName]) return NAME_MAP[apiName];
  return apiName.replace(/\s+(FC|CF|AFC|SC|AC|BC|CFC|UD|SAD)$/i, '').replace(/^(FC|AC|SS|AS|SSC|RC|CA|SV|VfL|VfB)\s+/i, '').trim();
}

export type LeagueTable = { name: string; slug: string; rows: TableRow[] };
const CACHE_TTL = 30 * 60 * 1000;
let cache: Record<string, LeagueTable> | null = null;
let cachedAt = 0;

async function fetchOne(slug: string, code: string): Promise<LeagueTable> {
  const r = await fetch(`https://api.football-data.org/v4/competitions/${code}/standings`, {
    headers: { 'X-Auth-Token': TOKEN },
    signal: AbortSignal.timeout(8000),
  });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  const d = await r.json();
  const total = (d.standings || []).find((s: any) => s.type === 'TOTAL') || d.standings?.[0];
  const rows: TableRow[] = (total?.table || []).map((e: any) => ({
    pos: e.position, club: normName(e.team?.name || ''), p: e.playedGames,
    w: e.won, d: e.draw, l: e.lost, gd: e.goalDifference, pts: e.points,
  }));
  if (!rows.length) throw new Error('empty table');
  return { name: LEAGUE_TABLES[slug].name, slug, rows };
}

export async function getStandings(): Promise<Record<string, LeagueTable>> {
  if (cache && Date.now() - cachedAt < CACHE_TTL) return cache;
  const out: Record<string, LeagueTable> = {};
  for (const [slug, code] of Object.entries(COMP)) {
    try {
      out[slug] = TOKEN ? await fetchOne(slug, code) : LEAGUE_TABLES[slug];
    } catch {
      out[slug] = LEAGUE_TABLES[slug]; // static fallback
    }
  }
  cache = out; cachedAt = Date.now();
  return out;
}

const ord = (n: number): string => { const s = ['th', 'st', 'nd', 'rd'], v = n % 100; return n + (s[(v - 20) % 10] || s[v] || s[0]); };

export function clubPositionFrom(tables: Record<string, LeagueTable>, club: string) {
  for (const t of Object.values(tables)) {
    const row = t.rows.find((r) => r.club === club);
    if (row) return { league: t.name, slug: t.slug, pos: row.pos, pts: row.pts, total: t.rows.length, ordinal: ord(row.pos) };
  }
  return null;
}
