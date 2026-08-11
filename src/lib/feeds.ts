import type { FeedSource } from './types';

export const FEED_SOURCES: FeedSource[] = [
  { name: 'Sky Sports', url: 'https://www.skysports.com/rss/12040', confidence: 9 },
  { name: 'BBC Sport', url: 'https://feeds.bbci.co.uk/sport/football/rss.xml', confidence: 9 },
  { name: 'ESPN FC', url: 'https://www.espn.com/espn/rss/soccer/news', confidence: 8 },
  { name: 'Goal.com', url: 'https://www.goal.com/feeds/en/news', confidence: 7 },
  { name: 'Football365', url: 'https://www.football365.com/feed', confidence: 7 },
  { name: 'The Guardian Football', url: 'https://www.theguardian.com/football/rss', confidence: 8 },
];

// Keywords that indicate transfer-related content
export const TRANSFER_KEYWORDS = [
  'transfer', 'signing', 'signed', 'deal', 'move', 'bid', 'fee', 'loan',
  'rumour', 'rumor', 'linked', 'target', 'interest', 'join', 'joins',
  'agree', 'agreed', 'contract', 'swap', 'release', 'free agent',
  'permanent', 'medical', 'unveiled', 'announce', 'confirmed',
];

export const CONFIRMED_KEYWORDS = [
  'confirmed', 'official', 'signs', 'signed', 'completes', 'completed',
  'announces', 'announced', 'unveiled', 'done deal', 'medical passed',
  'agrees personal terms',
];

export const RUMOUR_KEYWORDS = [
  'linked', 'interest', 'target', 'rumour', 'rumor', 'considering',
  'eyeing', 'tracking', 'monitoring', 'could', 'may', 'might', 'set to',
  'close to', 'in talks', 'negotiating',
];

// Well-known club names for extraction
export const KNOWN_CLUBS = [
  'Arsenal', 'Chelsea', 'Liverpool', 'Manchester City', 'Manchester United',
  'Tottenham', 'Newcastle', 'Aston Villa', 'West Ham', 'Brighton',
  'Real Madrid', 'Barcelona', 'Atletico Madrid', 'Bayern Munich', 'Dortmund',
  'PSG', 'Juventus', 'Inter Milan', 'AC Milan', 'Napoli',
  'Ajax', 'Porto', 'Benfica', 'Sporting', 'Galatasaray',
  'Bayer Leverkusen', 'RB Leipzig', 'Sevilla', 'Valencia',
  'Celtic', 'Rangers', 'Feyenoord',
];

// Headline nicknames / short forms -> canonical KNOWN_CLUBS name.
// Matched with WORD BOUNDARIES in processor.ts, so short/ambiguous tokens
// (e.g. "Inter", "City", "United") are deliberately NOT listed here.
export const CLUB_ALIASES: Record<string, string> = {
  'Barça': 'Barcelona', 'Barca': 'Barcelona', 'Blaugrana': 'Barcelona',
  'Spurs': 'Tottenham', 'Gunners': 'Arsenal',
  'Man City': 'Manchester City', 'Man Utd': 'Manchester United', 'Man United': 'Manchester United',
  'Atleti': 'Atletico Madrid', 'Atlético Madrid': 'Atletico Madrid', 'Atlético': 'Atletico Madrid',
  'Bayern': 'Bayern Munich', 'BVB': 'Dortmund', 'Leverkusen': 'Bayer Leverkusen',
  'Leipzig': 'RB Leipzig', 'Nerazzurri': 'Inter Milan', 'Rossoneri': 'AC Milan',
  'Los Blancos': 'Real Madrid', 'Bianconeri': 'Juventus',
};
