import { CLUB_ALIASES, CONFIRMED_KEYWORDS, KNOWN_CLUBS, RUMOUR_KEYWORDS, TRANSFER_KEYWORDS } from './feeds';
import type { Transfer } from './types';

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Canonical clubs found in text, with the position of first appearance.
// Canonical names match as substrings (they're distinctive); aliases match on
// WORD BOUNDARIES so short nicknames don't false-match ("Barça", "Man Utd").
function findClubs(text: string): { name: string; at: number }[] {
  const found: { name: string; at: number }[] = [];
  const push = (name: string, at: number) => {
    if (at < 0) return;
    const ex = found.find((f) => f.name === name);
    if (ex) { if (at < ex.at) ex.at = at; return; }
    found.push({ name, at });
  };
  for (const club of KNOWN_CLUBS) push(club, text.indexOf(club));
  for (const alias in CLUB_ALIASES) {
    const re = new RegExp(`(?:^|[^\\p{L}])(${escapeRegex(alias)})(?=[^\\p{L}]|$)`, 'iu');
    const m = re.exec(text);
    if (m) push(CLUB_ALIASES[alias], m.index + (m[0].length - m[1].length));
  }
  return found;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80);
}

function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
}

// Titles must contain at least one transfer keyword to pass
// AND must not be pure match/personal content
const EXCLUDE_PATTERNS = [
  /\bmatch report\b/i, /\bfull time\b/i, /\bhalf time\b/i,
  /\binjury update\b/i, /\bpersonal\b.*\bnews\b/i,
  /\bscores\b.*\bwin\b/i, /\bvs\b/i, /\bv\s+\w+\b/i,
  /\blive blog\b/i, /\blive:\b/i, /\b– live\b/i,
  /\bshares (loss|grief|news)\b/i,
];

// Other sports / leagues — SOCCER ONLY. If any of these appear in title OR body,
// the story is rejected outright (e.g. NFL "deal", NBA "trade", cricket "signing").
const OTHER_SPORTS = [
  /\bnfl\b/i, /\bnba\b/i, /\bmlb\b/i, /\bnhl\b/i, /\bwnba\b/i, /\bncaa\b/i,
  /\brunning back\b/i, /\bquarterback\b/i, /\bwide receiver\b/i, /\btight end\b/i,
  /\btouchdown\b/i, /\bsuper bowl\b/i, /\bgridiron\b/i, /\blinebacker\b/i,
  /\bhome run\b/i, /\bpitcher\b/i, /\bslam dunk\b/i, /\bthree-pointer\b/i,
  /\bcricket\b/i, /\btest match\b/i, /\bwicket\b/i, /\bipl\b/i, /\bbatsman\b/i,
  /\brugby\b/i, /\bsix nations\b/i, /\bscrum\b/i, /\btry\b.*\bconversion\b/i,
  /\bnrl\b/i, /\brugby league\b/i, /\bsuper league\b/i, /\bstate of origin\b/i,
  /\bkangaroos\b/i, /\bwallabies\b/i, /\bhull fc\b/i, /\bhull kr\b/i, /\bwigan warriors\b/i,
  /\bleeds rhinos\b/i, /\bst helens\b/i, /\bwarrington wolves\b/i, /\bgaa\b/i, /\bhurling\b/i,
  /\btennis\b/i, /\bwimbledon\b/i, /\bgrand slam\b/i, /\batp\b/i, /\bwta\b/i,
  /\bgolf\b/i, /\bpga\b/i, /\bryder cup\b/i,
  /\bformula 1\b/i, /\bformula one\b/i, /\bgrand prix\b/i, /\bnascar\b/i,
  /\bboxing\b/i, /\bufc\b/i, /\bmma\b/i, /\bnetball\b/i, /\bbaseball\b/i,
  /\bbasketball\b/i, /\bamerican football\b/i, /\bice hockey\b/i,
];

// True only for soccer stories (rejects NFL/NBA/cricket/etc). Used by the
// top-stories fallback, which does NOT require transfer keywords.
export function isSoccerStory(title: string, description: string): boolean {
  return !OTHER_SPORTS.some((re) => re.test(`${title.toLowerCase()} ${description.toLowerCase()}`));
}

export function isTransferRelated(title: string, description: string): boolean {
  const t = title.toLowerCase();
  const body = description.toLowerCase();
  const combined = `${t} ${body}`;
  // Reject anything from a non-soccer sport
  if (OTHER_SPORTS.some((re) => re.test(combined))) return false;
  if (EXCLUDE_PATTERNS.some((re) => re.test(title))) return false;
  // Title match: one keyword is enough
  if (TRANSFER_KEYWORDS.some((kw) => t.includes(kw))) return true;
  // Body match: require at least 2 distinct keywords to avoid false positives
  const bodyHits = TRANSFER_KEYWORDS.filter((kw) => body.includes(kw));
  return bodyHits.length >= 2;
}

export function classifyType(title: string, description: string): Transfer['type'] {
  const t = title.toLowerCase();
  const text = `${title} ${description}`.toLowerCase();
  // A rumour/speculation word in the HEADLINE dominates: "Diomande might move to
  // Chelsea" is a rumour even if the article body mentions an old "signed" deal.
  // This runs BEFORE the confirmed check to stop body text from faking a done deal.
  if (RUMOUR_KEYWORDS.some((kw) => t.includes(kw))) return 'rumour';
  if (CONFIRMED_KEYWORDS.some((kw) => text.includes(kw))) return 'confirmed';
  if (RUMOUR_KEYWORDS.some((kw) => text.includes(kw))) return 'rumour';
  return 'news';
}

// Every known club mentioned anywhere (title or body, incl. nicknames) — for
// club-page membership.
export function extractClubs(text: string): string[] {
  return findClubs(text).map((f) => f.name);
}

// Clubs named in the TITLE, ordered by where they appear (nicknames resolved) —
// for the from->to badges so a card reflects its actual headline, not a club
// mentioned in passing in the article body.
export function extractHeadlineClubs(title: string): string[] {
  return findClubs(title)
    .sort((a, b) => a.at - b.at)
    .map((f) => f.name)
    .slice(0, 2);
}

const NAME_STOP = new Set(['With', 'The', 'After', 'Before', 'As', 'On', 'In', 'For', 'And', 'But',
  'His', 'Her', 'New', 'Why', 'How', 'What', 'When', 'Deal', 'Source', 'Exclusive', 'Breaking',
  'Confirmed', 'Official', 'Done', 'Latest', 'Update', 'Report', 'Reports', 'Loan', 'Transfer',
  'Man', 'Real', 'West', 'East', 'North', 'South', 'United', 'City', 'Is', 'To', 'Of', 'A', 'An']);
export function extractPlayers(title: string): string[] {
  const matches = title.match(/([A-Z][a-zÀ-ÿ]+(?:\s[A-Z][a-zÀ-ÿ]+)+)/g) || [];
  return matches
    .map((m) => {
      // drop leading sentence-words that aren't part of a name ("With Guéhi" -> "Guéhi")
      let words = m.split(' ');
      while (words.length > 1 && NAME_STOP.has(words[0])) words = words.slice(1);
      return words.join(' ');
    })
    .filter((m) => m.split(' ').length >= 2 && m.split(' ').length <= 4) // real names have 2+ words
    .filter((m) => !KNOWN_CLUBS.includes(m))
    .slice(0, 3);
}

export function scoreConfidence(
  type: Transfer['type'],
  baseConfidence: number,
  title: string
): number {
  let score = baseConfidence;
  if (type === 'confirmed') score = Math.min(10, score + 1);
  if (type === 'rumour') score = Math.max(1, score - 2);
  if (title.toLowerCase().includes('exclusive')) score = Math.min(10, score + 1);
  return score;
}

// Original, synthesised card blurb (~45-55 words) built from OUR extracted data —
// not copied from the source article. This is TransferHub's own curation/analysis,
// which is what turns an aggregated link into added-value content.
const money = (s: string): string | null => {
  const m = s.match(/[£€$]\s?\d+(?:\.\d+)?\s?(m|million|bn|billion)\b/i);
  return m ? m[0].replace(/\s+/g, '').replace(/illion/i, '').replace(/^(.*?)m$/i, '$1m') : null;
};
const vary = <T,>(arr: T[], seed: string): T => {
  let h = 0; for (const c of seed) h = (h * 31 + c.charCodeAt(0)) | 0;
  return arr[Math.abs(h) % arr.length];
};

export function buildOriginalSummary(t: {
  title: string; players: string[]; clubs: string[]; headlineClubs: string[];
  type: Transfer['type']; source: string; confidence: number; id: string;
}): string {
  const p = t.players[0];
  const from = t.headlineClubs[0];
  const to = t.headlineClubs[1];
  const club = to || from;
  const fee = money(t.title);
  const parts: string[] = [];

  if (t.type === 'confirmed') {
    if (p && to) parts.push(vary([
      `${p} has completed a switch to ${to}${from ? ` from ${from}` : ''}, with the transfer now officially over the line.`,
      `It's done: ${p} joins ${to}${from ? ` from ${from}` : ''} after the clubs settled terms.`,
    ], t.id));
    else if (club) parts.push(`${club} have wrapped up a confirmed piece of transfer business in this window.`);
    else parts.push('A transfer that has now been officially confirmed by the clubs involved.');
  } else if (t.type === 'rumour') {
    if (p && to) parts.push(vary([
      `${to} are being strongly linked with ${p}${from ? `, currently at ${from}` : ''}, though nothing is agreed yet.`,
      `Speculation is building over a possible move for ${p} to ${to}${from ? ` from ${from}` : ''}.`,
    ], t.id));
    else if (club) parts.push(`${club} are reportedly weighing up a new addition as the rumour gathers pace.`);
    else parts.push(`A developing rumour doing the rounds on the transfer grapevine${p ? ` involving ${p}` : ''}.`);
  } else {
    parts.push(`The latest transfer-window development${p ? ` around ${p}` : club ? ` at ${club}` : ''}, as the story continues to move.`);
  }

  if (fee) parts.push(`The deal is understood to be worth in the region of ${fee}.`);
  parts.push(`First reported via ${t.source}; TransferHub rates it ${t.confidence}/10 for reliability.`);
  parts.push(club
    ? `Track every ${club} signing and rumour on our dedicated club page.`
    : `Follow confirmed deals and rumours across Europe's top leagues on TransferHub.`);

  let s = parts.join(' ');
  const w = s.split(/\s+/);
  if (w.length > 56) s = w.slice(0, 56).join(' ').replace(/[,;:.]+$/, '') + '.';
  return s;
}

export function buildSummary(title: string, description: string): string {
  // Strip HTML tags from description
  const clean = description.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
  if (clean.length > 20) {
    return clean.slice(0, 200) + (clean.length > 200 ? '…' : '');
  }
  return title;
}

export function processItem(
  rawTitle: string,
  rawDescription: string,
  link: string,
  pubDate: string,
  sourceName: string,
  sourceConfidence: number,
  image: string | null
): Transfer {
  const title = rawTitle.replace(/<[^>]+>/g, '').trim();
  const description = rawDescription || '';
  const fullText = `${title} ${description}`;

  const type = classifyType(title, description);
  const clubs = extractClubs(fullText);
  const headlineClubs = extractHeadlineClubs(title);
  const players = extractPlayers(title);
  const confidence = scoreConfidence(type, sourceConfidence, title);
  const summary = buildSummary(title, description);
  const slug = slugify(title);
  const id = hashString(link || title);

  const tags = [
    type,
    ...clubs.map((c) => c.toLowerCase().replace(/\s+/g, '-')),
  ];

  return {
    id,
    title,
    summary,
    players,
    clubs,
    headlineClubs,
    type,
    confidence,
    source: sourceName,
    sourceUrl: link,
    image,
    publishedAt: pubDate || new Date().toISOString(),
    slug,
    tags,
  };
}
