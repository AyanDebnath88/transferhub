import { CLUB_ALIASES, CONFIRMED_KEYWORDS, KNOWN_CLUBS, RUMOUR_KEYWORDS, TRANSFER_KEYWORDS } from './feeds';
import { getClubInfo } from './clubs';
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
  // tennis
  /\bsabalenka\b/i, /\bdjokovic\b/i, /\balcaraz\b/i, /\bswiatek\b/i, /\bus open\b/i,
  /\baustralian open\b/i, /\bfrench open\b/i, /\broland garros\b/i, /\bstraight sets\b/i,
  // golf
  /\bsolheim cup\b/i, /\bpga\b/i, /\blpga\b/i, /\bbirdie\b/i, /\bbogey\b/i, /\bthe open championship\b/i,
  // horse racing
  /\bhorse racing\b/i, /\bcheltenham\b/i, /\bascot\b/i, /\baintree\b/i, /\bnewmarket\b/i, /\bepsom\b/i,
  /\bgrand national\b/i, /\bjockey\b/i, /\bfurlong\b/i, /\bfilly\b/i, /\bgelding\b/i, /\bthoroughbred\b/i,
  /\bmaiden hurdle\b/i, /\bsteeplechase\b/i,
  // athletics / cycling / other
  /\bathletics\b/i, /\bmarathon\b/i, /\bsnooker\b/i, /\bdarts\b/i, /\btour de france\b/i, /\bcycling\b/i,
  /\bolympics?\b/i, /\bcommonwealth games\b/i, /\bhandball\b/i, /\bwaterpolo\b/i,
];

// Positive soccer signals — a story must contain at least one to count as football,
// so cross-sport items with no banned keyword (a golf/tennis headline) are dropped.
const SOCCER_SIGNALS = [
  /\bfootball\b/i, /\bsoccer\b/i, /\bpremier league\b/i, /\bla liga\b/i, /\bserie a\b/i,
  /\bbundesliga\b/i, /\bligue 1\b/i, /\bchampions league\b/i, /\beuropa league\b/i,
  /\bfa cup\b/i, /\bcarabao\b/i, /\bworld cup\b/i, /\beuros?\b/i, /\bwembley\b/i,
  /\bgoalkeeper\b/i, /\bmidfielder\b/i, /\bstriker\b/i, /\bdefender\b/i, /\bwinger\b/i, /\bforward\b/i,
  /\bmanager\b/i, /\bhead coach\b/i, /\btransfer\b/i, /\bsigning\b/i, /\bloan\b/i, /\bpenalty\b/i,
  /\boffside\b/i, /\bvar\b/i, /\bmatchday\b/i, /\bfixture\b/i, /\bkick-?off\b/i, /\bequaliser\b/i,
  /\bhat-?trick\b/i, /\bclean sheet\b/i, /\bderby\b/i, /\brelegation\b/i, /\bpromotion\b/i,
  /\bafc\b/i, /\bfc\b/i, /\bunited\b/i, /\bcity\b/i, /\brovers\b/i, /\balbion\b/i, /\bwanderers\b/i,
];

// True only for football stories: rejects other sports AND requires a positive
// soccer signal (club names count too). Used by /news + the top-stories fallback,
// which don't require transfer keywords.
export function isSoccerStory(title: string, description: string): boolean {
  const text = `${title.toLowerCase()} ${description.toLowerCase()}`;
  if (OTHER_SPORTS.some((re) => re.test(text))) return false;
  if (SOCCER_SIGNALS.some((re) => re.test(text))) return true;
  // Fall back to our known club list so club-only headlines still pass.
  return KNOWN_CLUBS.some((c) => text.includes(c.toLowerCase()));
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
  'Man', 'Real', 'West', 'East', 'North', 'South', 'United', 'City', 'Is', 'To', 'Of', 'A', 'An',
  'Premier', 'League', 'Champions', 'Europa', 'Cup', 'Scottish', 'Premiership', 'Championship',
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']);
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

// Original, synthesised card blurb built from OUR extracted data — never copied
// from the source article. This is TransferHub's own write-up: the source article
// is only linked, not reproduced. Transfer cards (with a player/club to work
// from) get a full 100-140 word piece; headline-only news stays tight and factual
// rather than padded with detail we can't verify.
const money = (s: string): string | null => {
  const m = s.match(/[£€$]\s?\d+(?:\.\d+)?\s?(m|million|bn|billion)\b/i);
  return m ? m[0].replace(/\s+/g, '').replace(/illion/i, '').replace(/^(.*?)m$/i, '$1m') : null;
};
const wc = (str: string) => str.trim().split(/\s+/).filter(Boolean).length;
// Deterministic pick, seeded per slot so two cards rarely share the same combo.
const pick = <T,>(arr: T[], seed: string): T => {
  let h = 0; for (const c of seed) h = (h * 31 + c.charCodeAt(0)) | 0;
  return arr[Math.abs(h) % arr.length];
};

export function buildOriginalSummary(t: {
  title: string; players: string[]; clubs: string[]; headlineClubs: string[];
  type: Transfer['type']; source: string; confidence: number; id: string;
}, transferContext = false): string {
  const p = t.players[0];
  const from = t.headlineClubs[0];
  const to = t.headlineClubs[1];
  // Prefer a headline club for the narrative, but fall back to any club found in
  // the body so transfer-feed stories that only name a club in passing still get
  // grounded, full-length context rather than the short news blurb.
  const club = to || from || t.clubs[0];
  const fee = money(t.title);
  const info = getClubInfo(club || '');
  const id = t.id;

  // Cards from the transfer feed are all transfer-related even when the headline
  // carries no explicit "signed"/"linked" wording (type falls back to 'news').
  // On those, still write the full piece; only genuine football news stays short.
  const isTransferStory = t.type === 'confirmed' || t.type === 'rumour' || (transferContext && !!club);

  // ---- Genuine NEWS (not a transfer): full ~100w write-up, honest framing.
  // We only have the headline + our extracted names, so we DON'T invent scores,
  // quotes or specifics — the piece frames the story and points to the source. ----
  if (!isTransferStory) {
    const lc = t.title.toLowerCase();
    const subtype =
      /\b(round-?up|as it happened|talking points|player ratings|ratings|review)\b/.test(lc) ? 'roundup' :
      /\b(win|wins|won|beat|beaten|rout|thrash|thrashed|held?|draw|drew|defeat|loss|lose|victory|comeback|equaliser|hat-?trick|scored?|goals?|inspires?|seals?|stunner|late)\b/.test(lc) ? 'result' :
      /\b(boss|manager|head coach|sacked|appointed|returns as|takes? over|in charge|caretaker|dugout)\b/.test(lc) ? 'manager' :
      /\b(injury|injured|ruled out|out for|fitness|sidelined|scan|knock)\b/.test(lc) ? 'injury' :
      'general';
    const subj = club || p;
    const np: string[] = [];

    // 1) Lead — shaped by story type, honest about what we do/don't know.
    if (subtype === 'result') np.push(pick([
      `${subj ? `${subj} are the talking point here` : 'A result is the story today'} after a match that will not have gone unnoticed${p && p !== subj ? `, with ${p} among the names catching the eye` : ''}.`,
      `${p ? `${p} is in the spotlight` : `${club} take the headlines`} following a result the football pages are chewing over.`,
      `This one turns on a result${club ? ` involving ${club}` : ''}, the kind of afternoon that shifts the mood around a club.`,
    ], id + '1'));
    else if (subtype === 'roundup') np.push(pick([
      `This is a wider round-up of the day's football${club ? `, ${club} included` : ''}, pulling several stories and results into one place.`,
      `A sweep across the latest action and talking points${club ? ` featuring ${club}` : ''}, with plenty to work through.`,
    ], id + '1'));
    else if (subtype === 'manager') np.push(pick([
      `${subj ?? 'A club'} are in focus over the dugout, and a managerial story like this tends to set the tone for everything below it.`,
      `There is movement on the touchline${club ? ` at ${club}` : ''}, the kind of call that shapes a season more than most headlines.`,
    ], id + '1'));
    else if (subtype === 'injury') np.push(pick([
      `${p ? `${p} is the concern here` : 'A fitness worry is the story'}${club ? ` for ${club}` : ''}, and how serious it proves will matter for the weeks ahead.`,
      `An injury update${club ? ` at ${club}` : ''}${p ? ` centred on ${p}` : ''} — never the headline anyone wants, and one worth keeping an eye on.`,
    ], id + '1'));
    else np.push(pick([
      `${club ? `${club} are in the news` : 'This is one from around the grounds today'}${p && p !== club ? `, with ${p} involved` : ''}, and it is worth a couple of minutes.`,
      `A story catching the eye across football today${club ? ` around ${club}` : ''}${p && p !== club ? ` and ${p}` : ''}.`,
    ], id + '1'));

    // 2) Context — grounded in real club facts where we have them.
    if (info) np.push(pick([
      `${club}, ${info.nick} from ${info.city}, are followed closely across ${info.league}, so even a smaller item draws attention.`,
      `Based in ${info.city}, ${club} rarely slip under the radar in ${info.league}.`,
    ], id + '2'));
    else if (club) np.push(pick([
      `${club} are one of the names that keep supporters refreshing the football pages.`,
      `Anything involving ${club} tends to travel quickly among fans.`,
    ], id + '2'));
    else np.push(`It is the sort of item that rounds out a busy day across the leagues.`);

    // 3) What the source covers — honest, no reproduction.
    np.push(pick([
      `The original report carries the detail, the quotes and the context in full, and the link takes you straight there.`,
      `For the specifics — what was said, how it played out and why it matters — the source article is a click away.`,
      `We point you to the original for the complete picture rather than rehashing every line of it here.`,
    ], id + '3'));

    // 4) Outlook — honest, no invented facts.
    np.push(pick([
      `On its own it may not move the table, but these are the threads that add up over a long season.`,
      `It is a small piece of a much bigger picture, and the season will keep writing the rest.`,
      `Worth filing away as the campaign takes shape week by week.`,
      `Supporters will have their own read on it, and the debate rarely stays quiet for long.`,
    ], id + '4'));

    // Top up towards ~90 words with non-repeating, honest lines.
    const nTop = [
      `Football moves fast, so it is worth a look now while it is still the talk of the day.`,
      `${subj ? `${subj}'s` : 'The club\'s'} supporters will be watching where this goes next.`,
      `Days like this are what make following the game week to week worthwhile.`,
      `We will keep surfacing the stories that matter and linking you to the people who broke them.`,
    ];
    const nUsed = new Set(np); let nsalt = 5;
    while (wc(np.join(' ')) < 90) {
      const before = np.length;
      const cand = pick(nTop, id + nsalt);
      if (!nUsed.has(cand)) { np.push(cand); nUsed.add(cand); }
      nsalt++;
      if (np.length === before) break;
    }

    let ns = np.join(' ');
    const nw = ns.split(/\s+/);
    if (nw.length > 130) ns = nw.slice(0, 130).join(' ').replace(/[,;:.]+$/, '') + '.';
    return ns;
  }

  // ---- TRANSFERS (confirmed / rumour): full 100-140 word original write-up ----
  const parts: string[] = [];

  // 1) Lead — the actual move, from our extracted facts.
  if (t.type === 'confirmed') {
    if (p && to) parts.push(pick([
      `${to} have completed the signing of ${p}${from ? ` from ${from}` : ''}, wrapping up a deal that had been taking shape behind the scenes.`,
      `It is done: ${p} has put pen to paper at ${to}${from ? `, leaving ${from} behind` : ''}, and the club has made the move official.`,
      `${p} is officially a ${to} player${from ? ` after departing ${from}` : ''}, with the paperwork now signed and the announcement made.`,
      `${to} have got their man, confirming the arrival of ${p}${from ? ` from ${from}` : ''} after terms were finalised on both sides.`,
      `${p} has sealed a switch to ${to}${from ? ` from ${from}` : ''}, one of the more notable pieces of business the club has pushed through.`,
    ], id + '1'));
    else if (club) parts.push(pick([
      `${club} have pushed a deal over the line and confirmed their latest addition.`,
      `${club} have wrapped up a signing the recruitment staff had been chasing for some time.`,
      `${club} have made it official, ending a piece of business that had been building for weeks.`,
    ], id + '1'));
    else parts.push('The move is now official, with both clubs confirming the deal has gone through.');
  } else if (t.type === 'rumour') {
    if (p && to) parts.push(pick([
      `${to} are pushing to sign ${p}${from ? ` from ${from}` : ''}, though the two sides have yet to settle on terms.`,
      `Talk is growing that ${p}${from ? `, currently at ${from},` : ''} could be on the move to ${to}, with nothing signed as things stand.`,
      `${to} have been linked with a move for ${p}${from ? ` of ${from}` : ''}, and the speculation is building rather than cooling.`,
      `Reports connect ${p}${from ? ` of ${from}` : ''} with a switch to ${to}, but this remains firmly in the rumour stage.`,
      `${p} is being tipped for a move to ${to}${from ? ` from ${from}` : ''}, though no agreement has been struck between the clubs.`,
    ], id + '1'));
    else if (club) parts.push(pick([
      `${club} are being linked with a fresh move in the market, though nothing is close to done.`,
      `${club} are weighing up business, with the rumour mill turning but no deal yet agreed.`,
      `${club} are among the names being connected with activity, all of it still speculation for now.`,
    ], id + '1'));
    else parts.push(`Nothing is agreed yet${p ? `, with ${p} the name being mentioned` : ', and the talk remains unconfirmed'}.`);
  } else { // transfer-context 'news' — a transfer story without explicit signed/linked wording
    if (p && club) parts.push(pick([
      `${p} is caught up in the transfer picture around ${club}, with the situation still developing.`,
      `There is transfer business swirling around ${club}, and ${p} is right in the middle of it.`,
      `${club} and ${p} are part of the latest movement in the market, though how it ends is not yet settled.`,
    ], id + '1'));
    else if (club) parts.push(pick([
      `${club} are in the thick of the transfer picture, with business still taking shape around them.`,
      `There is plenty of market activity involving ${club} as the details continue to firm up.`,
      `${club} are one of the sides driving the day's transfer talk, even if nothing is nailed down yet.`,
    ], id + '1'));
    else parts.push(`This one sits in the transfer conversation, with the specifics still coming into focus.`);
  }

  // 2) Fee, when the headline gives us one.
  if (fee) parts.push(pick([
    `The figure being talked about is around ${fee}.`,
    `Reports put the value of the deal close to ${fee}.`,
    `A fee in the region of ${fee} has been attached to it.`,
  ], id + '2'));

  // 3) Club context — grounded in real club facts where we have them.
  if (info) parts.push(pick([
    `${club}, ${info.nick} from ${info.city}, have been among the busier names in ${info.league} as they reshape the squad.`,
    `Based in ${info.city}, ${club} know how closely rivals across ${info.league} watch every move they make in the window.`,
    `For ${club} — ${info.nick} — this is the kind of business that sets the tone for their season in ${info.league}.`,
    `${club} sit in ${info.league}, and ${info.nick} have made getting their recruitment right a clear priority.`,
  ], id + '3'));
  else if (club) parts.push(pick([
    `${club} are one of the sides shaping the market as clubs firm up their squads.`,
    `${club} have been active as the window develops, keen not to be left behind by their rivals.`,
    `${club} are among the clubs whose moves tend to set off activity elsewhere in the market.`,
  ], id + '3'));

  // 4) Analysis — what it means, by type.
  if (t.type === 'confirmed') parts.push(pick([
    `The arrival deepens the group and hands the manager another option in an area the club had flagged.`,
    `On paper it strengthens the squad and settles a need the coaching staff had been keen to address.`,
    `It is a signing that reshapes the pecking order and gives the side more to work with across a long season.`,
    `The deal ties down a target the club rated highly and closes a gap in the squad.`,
  ], id + '4'));
  else parts.push(pick([
    `Whether it moves forward will come down to valuation, wages and how willing the other side is to do business.`,
    `Any deal would hinge on the fee, personal terms and whether the selling club can line up a replacement.`,
    `The sticking points, as ever, are price and timing — plenty can change before anything is agreed.`,
    `Interest is one thing; turning it into a signed deal is another, and there is distance to cover yet.`,
  ], id + '4'));

  // 5) Outlook / caution — no deadline-day or "opening weeks" clichés.
  if (t.type === 'confirmed') parts.push(pick([
    `Attention now turns to how quickly the new signing settles and where they fit into the side.`,
    `The focus shifts to integration — how soon the player is up to speed and in the starting mix.`,
    `From here it is about minutes and form, and whether the fee ends up looking like good value.`,
  ], id + '5'));
  else parts.push(pick([
    `Until the clubs or the player say something on the record, it is best filed as speculation rather than fact.`,
    `We would treat it with caution for now: rumours like this can firm up quickly or fade just as fast.`,
    `Take it with the usual pinch of salt until there is something official to back it up.`,
  ], id + '5'));

  // Top up towards ~100 words when still short — draw seeded, non-repeating
  // sentences from a wider pool (works with or without a named player).
  const topUp: string[] = [];
  if (p) {
    topUp.push(`${p} is the name at the centre of it all, and supporters will be watching how the situation develops.`);
    topUp.push(`Much of the attention lands on ${p}, whose next step could shape more than one club's plans.`);
  }
  topUp.push(`${club ? `${club}'s` : 'The club\'s'} plans for the rest of the window may hinge on how this one plays out.`);
  topUp.push(`It is the sort of story that can shift quickly, so it is worth keeping an eye on how it develops.`);
  topUp.push(`Squad balance and budget will both feed into what happens from here.`);
  topUp.push(`Fans will be keen to see whether the talk turns into concrete movement in the days ahead.`);
  topUp.push(`As ever in the market, timing matters as much as intent, and plenty can change before anything is settled.`);
  const usedTop = new Set(parts);
  let salt = 6;
  while (wc(parts.join(' ')) < 100) {
    const before = parts.length;
    for (const cand of [pick(topUp, id + salt)]) {
      if (!usedTop.has(cand)) { parts.push(cand); usedTop.add(cand); }
    }
    salt++;
    if (parts.length === before) break; // pool exhausted
  }

  let s = parts.join(' ');
  const words = s.split(/\s+/);
  if (words.length > 150) s = words.slice(0, 150).join(' ').replace(/[,;:.]+$/, '') + '.';
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
