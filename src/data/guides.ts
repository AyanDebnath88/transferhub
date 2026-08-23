// Original, evergreen explainer articles — unique long-form content written for
// TransferHub (not aggregated). Powers /guides and /guides/[slug].
export interface Guide {
  slug: string;
  title: string;
  description: string;
  updated: string;   // ISO date
  readMins: number;
  body: string;      // HTML
}

const P = (s: string) => s; // identity, keeps the strings readable below

export const GUIDES: Guide[] = [
  {
    slug: 'how-the-transfer-window-works',
    title: 'How the Football Transfer Window Works',
    description: 'A plain-English guide to the summer and winter transfer windows: dates, deadline day, registration rules and why deals collapse at the last minute.',
    updated: '2026-08-01',
    readMins: 6,
    body: P(`
<p>The transfer window is the fixed period during which clubs can register players moving between teams. Outside these windows a club generally cannot sign a player and add them to its squad, which is why activity clusters into two intense bursts each season.</p>
<h2>The two windows</h2>
<p>Most European associations run a long <strong>summer window</strong> and a shorter <strong>winter window</strong>. The summer window typically opens in June and closes in early September; the winter window runs through January. Exact dates are set each year by national federations under a framework agreed with FIFA, so England, Spain, Italy, Germany and France often close within a day or two of one another but not always on the same date.</p>
<p>A club can only <em>register</em> a signing while the window is open. Deals can be <em>agreed</em> earlier — pre-contract talks and medicals frequently happen before a window opens — but the paperwork that makes a player eligible must be lodged before the deadline.</p>
<h2>Deadline day</h2>
<p>The final 24 hours are chaotic by design. Clubs that have sold late suddenly need replacements, selling clubs hold firm on price knowing buyers are desperate, and agents shuttle between offers. FIFA's Transfer Matching System (TMS) requires both clubs to submit matching information for an international transfer, and a "deal sheet" mechanism gives clubs a short grace period to complete documentation if the core agreement was reached before the bell.</p>
<h2>Why late deals collapse</h2>
<ul>
  <li><strong>Failed medicals.</strong> A scan can reveal an issue that changes the fee or ends the move.</li>
  <li><strong>Personal terms.</strong> Clubs may agree a fee while player and club are still apart on wages, bonuses or agent commission.</li>
  <li><strong>Paperwork.</strong> International Transfer Certificates (ITCs) must pass between federations; time-zone gaps can run a deal past the deadline.</li>
  <li><strong>A domino that never falls.</strong> Many deals depend on another sale funding them; if the first collapses, the chain does too.</li>
</ul>
<h2>Free agents and loans</h2>
<p>Players without a club — free agents — can sometimes be signed outside the window, because no transfer fee or selling club is involved, subject to association rules. Emergency goalkeeper loans are another common exception. Loans, by contrast, must usually be arranged within the window like any permanent move.</p>
<p>Understanding the window explains the rhythm of the season: quiet analysis in mid-window, a surge as the deadline nears, and a scramble of confirmations that our <a href="/confirmed">confirmed feed</a> tracks in real time.</p>
`),
  },
  {
    slug: 'transfer-fees-explained',
    title: 'Transfer Fees Explained: Add-ons, Sell-on Clauses and Amortisation',
    description: 'What a headline transfer fee really means — guaranteed fees vs add-ons, sell-on percentages, instalments and how accountants spread the cost.',
    updated: '2026-08-01',
    readMins: 7,
    body: P(`
<p>When a headline says a club paid "£80m" for a player, the real picture is usually more layered. A modern fee is a package of guaranteed money, conditional bonuses and future clauses, paid over years rather than in one lump.</p>
<h2>Guaranteed fee vs add-ons</h2>
<p>The <strong>guaranteed fee</strong> is what the buying club will pay regardless of what happens next. <strong>Add-ons</strong> are extra payments triggered by achievements — appearances, goals, trophies, or the player earning a senior international call-up. A deal reported as "£70m rising to £85m" means £70m guaranteed and up to £15m in add-ons that may never be paid in full.</p>
<h2>Sell-on clauses</h2>
<p>A <strong>sell-on clause</strong> entitles the selling club to a percentage of any future profit — or sometimes the whole future fee — when the player is later sold again. These clauses reward smaller clubs that develop talent and can be worth more than the original sale. A 20% sell-on on a player who later moves for £100m returns a substantial cheque years after the fact.</p>
<h2>Instalments and cash flow</h2>
<p>Few clubs pay a fee up front. Deals are structured in <strong>instalments</strong> across the length of the contract, which helps the buyer's cash flow and lets the seller book guaranteed income. This is why a club can appear to "spend" heavily in one window without the cash leaving immediately.</p>
<h2>Amortisation — the accountant's view</h2>
<p>For accounting, a transfer fee is treated as the purchase of an asset whose cost is spread evenly over the contract's length, a process called <strong>amortisation</strong>. A £60m player on a five-year deal costs roughly £12m per year on the books. This matters for financial regulations: signing players on long contracts lowers the annual accounting charge, a tactic several clubs have used to stay within spending rules.</p>
<h2>Release clauses</h2>
<p>A <strong>release clause</strong> is a pre-agreed amount that obliges a club to let a player negotiate with a suitor if that figure is met. Common in Spain, where clauses are mandatory, they set a ceiling on a player's price — though clubs often set them far above market value to deter buyers.</p>
<p>Next time you read a fee, look past the number: the structure tells you who really carries the risk.</p>
`),
  },
  {
    slug: 'loan-deals-explained',
    title: 'Loan Deals Explained: Straight Loans, Loan-to-Buy and Wage Splits',
    description: 'Why clubs loan players, the difference between a straight loan and an obligation to buy, and how wages and loan fees are shared.',
    updated: '2026-08-02',
    readMins: 5,
    body: P(`
<p>A loan lets a player move to another club temporarily while their registration stays with the parent club. It is one of football's most flexible tools — used to develop youngsters, offload wages, or trial a signing before committing.</p>
<h2>Why clubs loan players</h2>
<ul>
  <li><strong>Development.</strong> A promising young player gets senior minutes elsewhere that they could not get at a stacked parent club.</li>
  <li><strong>Wage relief.</strong> An out-of-favour earner is moved on, with the borrowing club covering some or all of the salary.</li>
  <li><strong>Short-term need.</strong> An injury crisis can be solved with a loan without a permanent commitment.</li>
</ul>
<h2>Straight loan vs loan-to-buy</h2>
<p>A <strong>straight loan</strong> ends with the player returning to their parent club. A <strong>loan with an option to buy</strong> gives the borrowing club the right — but not the duty — to sign the player permanently at a pre-set fee. A <strong>loan with an obligation to buy</strong> is effectively a deferred permanent transfer: the purchase becomes mandatory, sometimes automatically once conditions such as a number of appearances are met.</p>
<h2>Loan fees and wages</h2>
<p>Borrowing clubs often pay a <strong>loan fee</strong> to the parent club, separate from wages. The salary itself is negotiated: the borrower might cover 100%, or the two clubs might split it. A club desperate to remove a big earner may subsidise wages to make the loan attractive.</p>
<h2>Limits and rules</h2>
<p>To stop squad-hoarding, authorities cap how many players a club may loan out and register on loan, and restrict how many loans can happen between the same two clubs in a season. A player also cannot usually feature for three clubs in one campaign, which shapes mid-season moves.</p>
<p>When our feed tags a move as a loan, these structures are why the same story can read very differently depending on whether an option or an obligation is attached.</p>
`),
  },
  {
    slug: 'free-transfers-and-the-bosman-ruling',
    title: 'Free Transfers and the Bosman Ruling',
    description: 'How players move for nothing, what a pre-contract is, and how one 1995 court case reshaped football economics forever.',
    updated: '2026-08-02',
    readMins: 5,
    body: P(`
<p>A "free transfer" means no fee changes hands between clubs — but the deal is rarely cheap. Signing bonuses, agent fees and higher wages often replace the transfer fee, because the player holds more of the power.</p>
<h2>The Bosman ruling</h2>
<p>In 1995 the European Court of Justice ruled in favour of Belgian midfielder Jean-Marc Bosman, who had been blocked from moving after his contract expired. The judgment established that players inside the EU could leave for <strong>no fee once their contract ended</strong>, and struck down limits on the number of EU players a club could field. It shifted leverage decisively toward players and agents.</p>
<h2>Pre-contract agreements</h2>
<p>A direct consequence is the <strong>pre-contract</strong>. In many associations a player whose deal expires at season's end can agree terms with a foreign club from January 1, then join for free in the summer. This is why clubs scramble to renew stars with 18 months left — after that, a rival can open talks and the asset can walk for nothing.</p>
<h2>Why "free" can be expensive</h2>
<ul>
  <li><strong>Signing-on fees.</strong> A lump sum paid to the player for agreeing to join.</li>
  <li><strong>Agent commission.</strong> Without a transfer fee to negotiate, agents command a larger cut of the wage package.</li>
  <li><strong>Premium wages.</strong> The selling club's loss becomes the player's gain in salary.</li>
</ul>
<p>Free transfers reward planning. Clubs that recruit expiring contracts early can build squads cheaply; those caught letting deals run down lose value they can never recover.</p>
`),
  },
  {
    slug: 'financial-rules-ffp-and-psr',
    title: 'Financial Rules Explained: FFP, PSR and Squad-Cost Ratios',
    description: 'What Financial Fair Play, the Premier League PSR and UEFA squad-cost limits actually restrict — and how they shape transfer strategy.',
    updated: '2026-08-03',
    readMins: 7,
    body: P(`
<p>Spending in football is not unlimited. A web of financial regulations caps how much clubs can lose and how much of their income can go on squads. These rules increasingly decide who can buy whom.</p>
<h2>Financial Fair Play, in principle</h2>
<p>The original idea behind <strong>Financial Fair Play (FFP)</strong>, introduced by UEFA, was simple: clubs should broadly live within their means and not run up unsustainable losses funded by owners. Over time the framework has evolved into more precise tools.</p>
<h2>Premier League PSR</h2>
<p>England's <strong>Profitability and Sustainability Rules (PSR)</strong> allow clubs to lose a set maximum over a rolling three-year period. Certain "good" spending — on infrastructure, academies, women's football and community work — is excluded from the calculation. Breaching the limit can bring points deductions, which is why some clubs sell academy players before the accounting deadline: a homegrown sale is almost pure profit on the books.</p>
<h2>UEFA's squad-cost ratio</h2>
<p>For clubs in European competition, UEFA has moved toward a <strong>squad-cost ratio</strong> that caps combined spending on wages, transfer amortisation and agent fees at a percentage of football revenue. The permitted percentage has been tightened in stages. This directly links how much a club can spend on players to how much it earns — punishing clubs that miss the Champions League.</p>
<h2>How rules shape the market</h2>
<ul>
  <li><strong>Long contracts</strong> spread transfer costs thinner per year (see our <a href="/guides/transfer-fees-explained">fees guide</a>).</li>
  <li><strong>Player-plus-cash swaps</strong> let two clubs book profits on paper.</li>
  <li><strong>Homegrown sales</strong> generate clean profit to offset expensive buys.</li>
  <li><strong>Deadline-day sales</strong> sometimes exist purely to balance the books before a reporting date.</li>
</ul>
<p>When a big club is unusually quiet in a window, financial limits — not a lack of ambition — are often the reason.</p>
`),
  },
  {
    slug: 'how-transfer-reliability-is-rated',
    title: 'How to Read Transfer Rumours: Tiers, Sources and Reliability',
    description: 'Not all transfer news is equal. A guide to source tiers, the language reporters use, and how TransferHub rates reliability.',
    updated: '2026-08-03',
    readMins: 6,
    body: P(`
<p>Transfer season runs on information of wildly varying quality, from confirmed club announcements to speculative gossip. Learning to read the signals saves you from chasing deals that were never real.</p>
<h2>Confirmed vs rumour</h2>
<p>A story is <strong>confirmed</strong> when a club officially announces it, or a top-tier reporter states the deal is done and being signed. Everything before that — interest, talks, bids, "monitoring" — is a <strong>rumour</strong>, however credible. TransferHub separates the two so you can see at a glance where a story sits.</p>
<h2>Reading the language</h2>
<ul>
  <li><strong>"Here we go" / "completed"</strong> — the deal is done bar formalities.</li>
  <li><strong>"In advanced talks" / "agreement close"</strong> — likely, not guaranteed.</li>
  <li><strong>"Linked with" / "monitoring" / "keen"</strong> — early-stage or speculative.</li>
  <li><strong>"Considering a move"</strong> — often little more than an idea.</li>
</ul>
<p>The verb matters: "signs" is not "eyed", and a headline that leads with a rumour word should be read as a rumour even if the article body mentions a past done deal.</p>
<h2>Source tiers</h2>
<p>Experienced followers rank outlets by track record. Official club channels sit at the top, followed by a small group of specialist reporters with strong records, then established newspapers and broadcasters, and finally aggregators and social accounts of unknown reliability. A claim is only as strong as its weakest link in that chain.</p>
<h2>How TransferHub rates reliability</h2>
<p>Every story on TransferHub carries a reliability score shown as stars. It blends the credibility of the publisher with how the story is worded — a confirmed announcement scores higher than a speculative link, and cautious hedging lowers the rating. The aim is not to tell you what will happen, but to show you how much weight a story deserves. Read the full approach on our <a href="/methodology">methodology page</a>.</p>
<p>Treat transfer news like any other reporting: check who is saying it, what exactly they said, and whether anyone with real access has confirmed it.</p>
`),
  },
];

export const getGuide = (slug: string) => GUIDES.find((g) => g.slug === slug) ?? null;
