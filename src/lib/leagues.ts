// League hubs. `clubs` are matched against the club names our pipeline extracts
// (see KNOWN_CLUBS in feeds.ts), so a story is shown if it mentions any of them.
export const LEAGUES: Record<
  string,
  { name: string; country: string; blurb: string; clubs: string[] }
> = {
  'la-liga': {
    name: 'La Liga',
    country: 'Spain',
    blurb:
      "Spain's top flight is where the Clásico giants Real Madrid and Barcelona duel for the title while Atlético Madrid, Sevilla and the rest reshape their squads.",
    clubs: ['Real Madrid', 'Barcelona', 'Atletico Madrid', 'Sevilla', 'Valencia'],
  },
  'serie-a': {
    name: 'Serie A',
    country: 'Italy',
    blurb:
      "Italy's Serie A blends tactical heritage with big-money ambition — Juventus, the two Milan clubs and Napoli headline every window's movement.",
    clubs: ['Juventus', 'Inter Milan', 'AC Milan', 'Napoli'],
  },
  'bundesliga': {
    name: 'Bundesliga',
    country: 'Germany',
    blurb:
      "Germany's Bundesliga is a talent factory: Bayern Munich set the pace while Borussia Dortmund, Bayer Leverkusen and RB Leipzig trade rising stars.",
    clubs: ['Bayern Munich', 'Dortmund', 'Bayer Leverkusen', 'RB Leipzig'],
  },
  'ligue-1': {
    name: 'Ligue 1',
    country: 'France',
    blurb:
      "France's Ligue 1 is a launchpad for world-class attackers, with Paris Saint-Germain leading the spending and the chase for European talent.",
    clubs: ['PSG'],
  },
};

export function getLeague(slug: string) {
  return LEAGUES[slug] ?? null;
}
