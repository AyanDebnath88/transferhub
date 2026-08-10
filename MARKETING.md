# TransferHub — Zero-Budget Marketing, Promotion & Search-Ranking Plan

> **Operating reality:** solo operator, no budget, no paid ads. Revenue = Google AdSense, which scales with pageviews. So the entire game is **cheap, repeatable traffic + retention**. Every tactic below is free/organic and chosen for leverage-per-hour.

**Live site:** `https://transferhub.vercel.app` · **Handle:** `@TransferHubFC` · **Stack:** Astro static + PWA · **Niche:** football (soccer) transfers only.

**What's already built (don't rebuild — exploit it):**
- Aggregates 6 trusted feeds — Sky Sports (rating 9), BBC Sport (9), ESPN (8), The Guardian (8), Goal.com (7), Football365 (7).
- Classifies every item **Confirmed / Rumour / News** with a per-source **reliability rating (1–9)**. This is the product's moat — lead with it everywhere.
- Refreshes every 30 min; links out to the original article (copyright-safe, metadata-only, full attribution page live).
- SEO foundation present: `Organization` + `WebSite` JSON-LD with SearchAction, per-page `ItemList`/`FAQPage` slot, canonical, OG image (1200×630), robots directives, `sitemap.xml`, keywords meta.
- PWA: installable (iOS/Android), service worker, offline page, `manifest.json`.
- Pages live: `/` (Latest), `/confirmed`, `/rumours`, `/premier-league`, plus privacy/terms/disclaimer/contact/attribution.
- Theme: dark "pitch green + gold", Newsreader editorial headline font — reads premium.

---

## Table of Contents
1. [Positioning & Hook](#1-positioning--hook)
2. [SEO / Google Ranking (Primary Channel)](#2-seo--google-ranking-primary-channel)
3. [Google Discover & Google News](#3-google-discover--google-news)
4. [Social & Community Seeding](#4-social--community-seeding-free)
5. [Content Flywheel](#5-content-flywheel)
6. [Retention & Direct Traffic](#6-retention--direct-traffic)
7. [Backlinks (White-Hat, Free)](#7-backlinks-white-hat-free)
8. [Analytics & KPIs](#8-analytics--kpis)
9. [30 / 60 / 90-Day Action Plan](#9--30--60--90-day-action-plan)
10. [The Football Calendar (timing map)](#the-football-calendar--when-to-push)

---

## 1. Positioning & Hook

### One-line value prop
> **Every football transfer, ranked by how likely it's actually true — updated every 30 minutes, in one clean feed.**

### The 10-second pitch (use in bios, DMs, subreddit descriptions)
> "FotMob tells you the score. Fabrizio tells you one deal. TransferHub tells you **every** deal from Sky, BBC, ESPN & Guardian at once — and flags what's **Confirmed** vs a **Rumour** so you stop getting baited."

### 30-second pitch
> Transfer window is chaos: ten sources, ninety rumours, no idea what's real. TransferHub aggregates the trusted UK/EU outlets into a single live feed, auto-classifies each item **Confirmed / Rumour / News**, and attaches a **reliability rating** based on which outlet broke it. No paywall, no clickbait, no app install required — it loads in under a second and links you straight to the original. Refreshes every 30 minutes so it's never stale.

### Why we're different (the differentiation table — memorise this)
| | TransferHub | FotMob / OneFootball | footballtransfers.com | The Athletic | Fabrizio (X) |
|---|---|---|---|---|---|
| **Aggregates all major outlets in one feed** | ✅ 6 sources | Partial | Own newsroom | Own newsroom | Single voice |
| **Reliability rating per item** | ✅ **signature** | ❌ | Rumour "probability" only | ❌ | Implicit ("Here we go") |
| **Confirmed vs Rumour split** | ✅ explicit | ❌ | Partial | ❌ | ❌ |
| **Speed / page weight** | ✅ <1s, zero-JS | Heavy app | Medium | Medium+paywall | N/A |
| **Free, no paywall, no login** | ✅ | Freemium | Free+ads | ❌ Paywall | Free |
| **Links out to the original** | ✅ | ❌ (keeps you in-app) | Sometimes | ❌ | ❌ |

**The wedge:** we don't compete on *reporting* (we can't out-scoop Romano). We compete on **triage** — being the fastest, cleanest place to see *everything at once and know what to trust*. That's a real, unmet job-to-be-done and it's defensible because it's a product feature, not a person.

### Brand voice (keep every post/page on-voice)
Three traits, applied everywhere:
- **Trustworthy, not boring** — we're the calm signal in the noise. We cite sources and label uncertainty. Never invent scoops.
- **Fast & clean, not breathless** — short, scannable, no ALL-CAPS clickbait spam. One 🚨 max.
- **Fan-first, not corporate** — we talk like someone refreshing the feed at 11pm on deadline day, because we are.

**We sound like:** "Confirmed ✅ — [player] to [club], via Sky Sports (9/10 reliability). Full story linked."
**We don't sound like:** "🚨🚨BOMBSHELL!! You WON'T BELIEVE who [club] just signed 🤯 (link in bio)"

### Target audiences
| Segment | Their pain | The message that lands | Where they are |
|---|---|---|---|
| **Transfer-window addicts** | Refreshing 8 tabs, burned by fake rumours | "One feed, every source, reliability-rated" | r/soccer, X transfer threads, deadline day |
| **Fantasy (FPL) managers** | Need confirmed ins/outs fast to plan transfers | "Confirmed deals only, filtered — plan your FPL" | r/FantasyPL, FPL Twitter |
| **Club-specific diehards** | Only care about *their* club's business | "[Club] transfer hub — all rumours, ranked" | Club subreddits, club fan groups |
| **Casual mobile checkers** | Want a 20-second "what happened today" | "Done Deals roundup, 6am daily" | Google Discover, push notifications |

---

## 2. SEO / Google Ranking (Primary Channel)

SEO is ~40–50% of the addressable traffic and the only channel that compounds while you sleep. For an **aggregator**, the ranking formula is: **freshness + structured data + topical authority + speed**. You already win on speed and structured data. The gap is **topical authority via architecture**.

### 2.1 Keyword clusters to target

**Head terms (high volume, brutal difficulty — long game, don't expect page 1 in year 1):**
- `football transfer news`, `transfer news today`, `confirmed transfers`, `transfer rumours`
- *KD note:* these are dominated by Sky, BBC, footballtransfers.com, fotmob with 15+ years of domain authority. Realistic timeline to page 1: 12–24 months, and only via the long-tail + freshness path below. **Do not build your strategy on these.**

**Mid-tail (winnable in 3–9 months with hub pages):**
- `[club] transfer news` — e.g. `arsenal transfer news`, `chelsea transfer news`, `man united transfer news` (one per club in `CLUB_META` — you have ~28)
- `[club] transfer rumours`, `[club] confirmed signings`, `[club] transfer targets`
- `[league] transfers` — `premier league transfers`, `la liga transfers`, `serie a transfers`, `bundesliga transfers`

**Long-tail (winnable in weeks — freshness plays, your best early ROI):**
- `[player] to [club]` — e.g. `[player] to real madrid`, `is [player] signing for [club]`
- `confirmed transfers today`, `done deals today`, `transfer deadline day live`
- `[club] transfer news today`, `who did [club] sign`
- `is the [player] to [club] rumour true` ← **this is our sweet spot** — it maps directly to the reliability rating.

**KD reality check:** As a brand-new site on a `vercel.app` subdomain, your Domain Authority is ~0–5. You will **not** rank for anything competitive until you (a) get a custom domain, (b) earn a handful of backlinks, and (c) prove freshness+depth. Win long-tail + club-hub first; let authority compound into mid-tail.

### 2.2 Content architecture to ADD (highest-leverage SEO work)

You currently have one league page (`/premier-league`) and three status feeds. That's not enough surface area to rank. Build these **template-driven pages** (near-zero marginal effort since the data pipeline already extracts club + status):

- [ ] **Per-club hub pages** — `/club/arsenal`, `/club/chelsea`, … one per club in `CLUB_META` (~28 pages). Each is a filtered live feed of that club's transfers, split Confirmed / Rumour, with an evergreen 150-word intro ("Arsenal's latest transfer business, ranked by reliability…"). **This is the single biggest ranking unlock** — it turns 1 rankable page into ~28, each targeting a mid-tail keyword with real search volume.
- [ ] **Per-league hub pages** — `/la-liga`, `/serie-a`, `/bundesliga`, `/ligue-1` mirroring `/premier-league`.
- [ ] **Evergreen explainer: `/how-reliability-ratings-work`** — explains the 1–9 source scoring (Sky/BBC 9, ESPN/Guardian 8, Goal/F365 7) and Confirmed/Rumour/News logic. This page is your **E-E-A-T anchor** and a natural link magnet ("a site that actually explains how it rates rumours"). Add `FAQPage` schema.
- [ ] **`/about` + `/methodology`** — who runs it, why, how items are classified/sourced. Critical for E-E-A-T and Google News (see §3).
- [ ] **Glossary: `/transfer-glossary`** — "release clause", "loan-to-buy", "Bosman", "medical", "here we go". Evergreen, links internally, catches definitional long-tail.

### 2.3 On-page tactics — present vs to-add

| Tactic | Status | Action |
|---|---|---|
| Canonical, robots, OG, sitemap | ✅ Present | Keep |
| `Organization` + `WebSite` JSON-LD | ✅ Present | Keep |
| `ItemList` / `FAQPage` per-page slot | ✅ Present | **Use it on every hub page** — emit `ItemList` of transfers + `FAQPage` ("Who have Arsenal signed?") |
| `sitemap.xml` | ✅ Present | Add `<lastmod>` that updates each 30-min build so Google sees freshness; add all new club/league pages |
| Custom domain | ❌ **Missing** | **Buy a domain** (`transferhub.football` / `.news` / `.co`, ~$10). `vercel.app` caps trust, News eligibility, and brand recall. Do this first. |
| Per-club/league pages | ❌ Missing | Build (§2.2) |
| Reliability explainer / About | ❌ Missing | Build (§2.2) |
| Internal linking | ⚠️ Thin | See §2.4 |
| Unique title/meta per hub page | ⚠️ | Template: `[Club] Transfer News & Rumours 2026 — Ranked by Reliability \| TransferHub` |
| `NewsArticle`/`WebPage` freshness `dateModified` | ⚠️ | Add `dateModified` to hub pages, refreshed each build |

### 2.4 Internal linking (free authority routing)
- [ ] Every transfer card mentioning a club links to that club's hub (`/club/arsenal`). Automatic — you already extract the club name.
- [ ] Club hubs link up to their league hub; league hubs link to `/` and `/confirmed`.
- [ ] Footer: add "Clubs" and "Leagues" columns linking all hubs (spreads link equity to every page in 1 click from the homepage — helps indexing).
- [ ] The `/how-reliability-ratings-work` page gets linked from every reliability badge (tooltip/"?" → explainer). Sends a topical-authority signal and boosts the money page.

### 2.5 How a static aggregator actually ranks
Google *will* rank aggregators when they add value beyond the sources. Your value-adds that Google can measure:
1. **Freshness** — 30-min rebuilds + `lastmod`/`dateModified` = strong recency signal for transfer queries (which are inherently time-sensitive). This is your unfair advantage over slow CMS competitors.
2. **Structured data** — `ItemList` + `FAQPage` can win rich results / "People also ask" real estate before you outrank on blue links.
3. **Topical authority** — 28 club hubs + league hubs + glossary + explainer = a tight topical cluster all about one thing (transfers). Google rewards focused depth.
4. **Core Web Vitals** — Astro zero-JS + <1s LCP puts you in the top percentile. When two pages are equal on relevance, speed breaks the tie, and CWV is a confirmed ranking factor. **Protect this** — AdSense scripts are the main CLS/LCP risk; lazy-load ads below the fold and reserve ad slot height to avoid layout shift.

### 2.6 First SEO moves (do in week 1)
- [ ] Verify site in **Google Search Console**, submit `sitemap.xml`.
- [ ] Request indexing for `/`, `/confirmed`, `/premier-league`.
- [ ] Buy custom domain, set canonical to it, 301 the vercel subdomain.
- [ ] Ship 5 club hubs (start with the biggest search volume: Man United, Arsenal, Liverpool, Chelsea, Man City).

---

## 3. Google Discover & Google News

**Why this matters more than everything else combined:** Google Discover is a *push* feed on hundreds of millions of Android/Chrome home screens. Transfer content is *exactly* what Discover amplifies — timely, entity-rich (players/clubs), high-interest. A single deal that hits Discover can send **10k–100k visits in a day**. It's the closest thing to a free traffic firehose, and unlike search you don't need to outrank anyone.

### Eligibility & how to earn it
- [ ] **Custom domain + HTTPS** (Vercel gives HTTPS free; domain is on you). `vercel.app` subdomains rarely get Discover.
- [ ] **E-E-A-T signals** (Discover leans hard on trust):
  - [ ] `/about` page with a real named author/editor and a photo/bio.
  - [ ] Author byline + `Person` schema on content ("Curated by [name], TransferHub editor").
  - [ ] `/methodology` explaining sourcing & the reliability system (you're *more* trustworthy than most because you're transparent about it — lean in).
  - [ ] Clear contact + DMCA page (✅ already live).
- [ ] **Large, high-quality images** — Discover needs `max-image-preview:large` (✅ you have it) **and** a genuinely large (1200px+ wide) unique image per surfaced page. Generate on-brand pitch-green/gold transfer graphics (free: Canva/AI) rather than relying on one static OG image. Discover suppresses generic/duplicate images.
- [ ] **Structured data** — `ItemList` (✅) and per-story `NewsArticle` where you write original blurbs (e.g. the daily Done Deals roundup in §5).
- [ ] **Consistent freshness** — Discover favours sites that publish timely content regularly. Your 30-min pipeline + daily roundup satisfies this.

### Google News (secondary, stricter)
- [ ] Apply via **Google Publisher Center** once `/about`, `/methodology`, bylines, and a custom domain are live.
- [ ] Note: pure link-aggregators can struggle with News approval. Your edge is the **original daily roundup + reliability commentary** — that's the "original reporting" News wants. Frame the site as "editorial curation with original analysis," not "RSS scraper."
- [ ] Even without formal News approval, follow News structured-data best practices — Discover eligibility is largely the same checklist and is the bigger prize anyway.

**Priority:** custom domain → About/author/methodology → per-page big images. These three unlock both Discover and News.

---

## 4. Social & Community Seeding (Free)

Social won't compound like SEO, but it's how you get the **first 1,000 humans**, seed backlinks, and catch viral deadline-day spikes before SEO exists. Rule #1 everywhere: **add value first, link second.** Self-promo that reads as spam gets you banned and poisons the brand.

### 4.1 Reddit (highest early ROI — but read the rules)
Subreddits, by priority:
| Subreddit | Size | Self-promo rule | How to add value (not spam) |
|---|---|---|---|
| **r/soccer** | ~4M | Strict — **no self-promo/blogspam**; links must be to *original sources*, and Tier 3 sites are filtered | **Do NOT drop your link.** Instead, post the *original Sky/BBC link* and add a comment with context. Build karma/reputation. Only mention the tool where genuinely asked ("is there a site that…") |
| **r/FantasyPL** | ~2M | Relaxed in help threads | Answer "will X play this week / is the transfer confirmed?" with the confirmed status + link. Genuinely useful here. |
| **Club subs** (r/reddevils, r/Gunners, r/chelseafc, r/LiverpoolFC, r/coys, r/MCFC…) | 100k–600k each | Varies — most allow useful tools in comments, ban repetitive linking | Share your **club hub page** when someone asks "any good place to track our rumours?" One post per sub per window, max. |
| r/football | ~500k | More lenient than r/soccer | OK to share genuinely useful tools with context |
| r/PremierLeague | ~500k | Standard | Deadline-day live-thread participation |

**Reddit playbook:**
- Spend 2 weeks *only* commenting helpfully, zero links — build account age/karma (most subs auto-remove links from new/low-karma accounts).
- The **reliability angle** is your Reddit killer feature: when a fresh rumour drops, reply "Worth noting this is from [outlet] — historically ~[7/10]. TransferHub flags it as Rumour, not Confirmed." You're being *useful*, and the brand rides along.
- Never post the same link twice in a week. Never post to a sub you don't participate in.

### 4.2 X / Twitter (`@TransferHubFC`) — the breaking-news channel
This is where transfer culture lives. You can't out-scoop Romano, so you play **fast aggregator + reliability referee**.
- **Cadence:** 5–10 posts/day during windows, 2–3/day off-season.
- **Content mix:**
  - *Confirmed deals (auto-worthy):* `✅ CONFIRMED: [player] → [club]. Reported by Sky Sports (9/10 reliability). More: [link]`
  - *Reliability referee (your signature):* quote-tweet a viral rumour with `Our take: sourced from [outlet], we rate this a Rumour (7/10) — not confirmed yet. Track it: [club hub link]`
  - *Reply-guy on the big accounts:* thoughtful, non-spammy replies under Fabrizio Romano, David Ornstein, transfer news accounts within minutes of a drop. Add the reliability context. This is how a 0-follower account gets seen.
  - *Daily "Done Deals" card* (see §5) at a fixed time.
- **Hashtags (sparingly):** `#TransferNews #DeadlineDay #[Club]` — 1–2 max.
- **Peak times:** 7–10pm UK weekdays; all day on deadline day.

### 4.3 TikTok / Reels / Shorts — the growth engine
Short vertical video is the only channel that hands reach to 0-follower accounts. Near-zero effort if you templatise:
- **Format:** 10–20s. Hook in first 1.5s. Text-on-screen (most watch muted). Trending audio.
- **Templates (batch 5–10 at once):**
  - *"Done Deals — [date]"*: fast cuts of confirmed signings, gold-on-green cards, ticking clock.
  - *"Rumour Report Card"*: "This rumour is being reported by [outlet] — is it legit? [reliability score] /10." Ends "Track every rumour, ranked → link in bio."
  - *"Deadline Day countdown"*: hourly deal tally.
- **Tooling:** Canva or CapCut templates (free). Auto-clip from your own feed data. Same video → TikTok + Instagram Reels + YouTube Shorts (post to all three; never let a render die on one platform).
- **Bio link:** to the site (or a free Linktree → site + newsletter).

### 4.4 Others (lower priority, low effort)
- **Threads / Bluesky:** cross-post the X content. Football community is growing there; less crowded, easier reach.
- **Facebook fan groups:** huge club fan groups (e.g. "Manchester United Fans Worldwide," 1M+). Join, be a member, share your club hub only when relevant/asked. Groups are stricter than pages on links — earn standing first.
- **Discord:** don't build your own server yet (dead servers hurt). Instead be active in existing football/FPL Discords; drop the confirmed-deals link where welcomed.

### 4.5 Sample first-week posting calendar
| Day | X / Twitter | TikTok/Reels/Shorts | Reddit | Other |
|---|---|---|---|---|
| **Mon** | Intro post + 3 confirmed-deal cards + 2 replies to Romano | 1 "Done Deals" clip | Comment-only, build karma (r/soccer, r/FantasyPL) | Set up Threads, cross-post |
| **Tue** | 4 deal cards + 1 reliability quote-tweet | 1 "Rumour Report Card" | Answer 3 FPL "is it confirmed?" questions | — |
| **Wed** | Daily Done Deals card + 3 replies | Batch-film 5 clips | — | Facebook: join 3 club groups |
| **Thu** | 4 cards + reliability referee on trending rumour | 1 clip | Share club hub in 1 club sub (if asked) | Bluesky cross-post |
| **Fri** | Deal cards + "weekend watch" thread | 1 "Done Deals" | Comment in r/football | Newsletter #1 teaser |
| **Sat** | Live-ish match-day rumours + 3 replies | 1 clip | — | — |
| **Sun** | **Weekly roundup thread** + Done Deals | 1 "week in transfers" clip | Post weekly roundup to a club sub (if genuinely useful) | Send newsletter #1 |

---

## 5. Content Flywheel

Turn the feed you already have into shareable, schedulable assets — **near-zero marginal effort**, because the data (club, status, source, reliability) is already structured.

### 5.1 The three repeatable assets
1. **Daily "Done Deals" roundup** — auto-generate a page + image each morning listing yesterday's *Confirmed* transfers with reliability tags. This is:
   - a new indexable URL every day (freshness for SEO/Discover),
   - the daily X/TikTok post,
   - the newsletter body,
   - your "original content" claim for Google News.
   - *One data query drives four channels.*
2. **Deadline-day live thread / live page** — a `/live` page that surfaces the feed with a countdown, plus a pinned X thread you reply to all day. Deadline day is the single biggest traffic event of the year — own it.
3. **Weekly Rumour Accuracy Scorecard** — *your killer original asset.* Each week, revisit rumours from N weeks ago and score which came true, by outlet. "This week: Sky Sports 8/10 confirmed, Goal.com 4/10." This is:
   - genuinely original journalism (News/Discover love it),
   - inherently shareable/controversial (outlets and fans argue about it),
   - the ultimate proof of your reliability-rating premise,
   - a natural backlink magnet ("the site that grades transfer rumours").

### 5.2 Scheduling (all free)
- Generate roundup/scorecard pages automatically in the 30-min build pipeline (roundup = daily cron; scorecard = weekly).
- Social scheduling: **Buffer free tier** or native schedulers (X, Meta Business Suite) — batch a week of posts in one 45-min sitting.
- Video: batch-film/render 5–10 clips weekly; schedule across TikTok/Reels/Shorts.

---

## 6. Retention & Direct Traffic

Google can change its mind overnight. Direct/returning traffic is insurance **and** a ranking signal (returning visitors, brand searches). Turn one-time SEO visitors into regulars:

- [ ] **PWA install prompt** — you're already installable. Add a tasteful "Add to home screen — track transfers offline" prompt after a user's 2nd visit (not on first — that annoys). One tap = a home-screen icon = direct traffic forever.
- [ ] **Push notifications for confirmed deals** — the retention superpower. "✅ [Player] to [Club] — Confirmed" as a web push is exactly what an addict wants. Use a free tier (OneSignal free ≤10k subscribers). Let users pick *their club* so pushes are relevant, not spammy. **This alone can rebuild your whole audience if SEO dips.**
- [ ] **Email newsletter** — free ESP (Buttondown free ≤100 / Substack free / MailerLite free ≤1k). Weekly "Done Deals + Rumour Scorecard" digest. Capture emails with a slim inline form on club hubs ("Get [club]'s confirmed deals in your inbox"). Segment by club later.
- [ ] **Bookmarking hooks** — a fixed daily-value ritual ("Done Deals, every morning at 6am") trains the bookmark/return habit. Add "🔖 Bookmark for daily deals" microcopy.
- [ ] **Per-club landing = return reason** — a Gooner who finds `/club/arsenal` bookmarks *that*, not the homepage. Club hubs are both an SEO play (§2) and a retention play.

---

## 7. Backlinks (White-Hat, Free)

Backlinks are the missing ingredient for Domain Authority (currently ~0). All free, all white-hat:

- [ ] **HARO / Featured / journalism request platforms** (Featured.com, Qwoted, SourceBottle — free tiers). Respond to journalist queries about transfers/transfer-window trends as "founder of TransferHub, an aggregator that rates rumour reliability." Land a link on a real news site → huge authority jump.
- [ ] **The Rumour Accuracy Scorecard as link-bait** — pitch it to football bloggers/journalists: "we tracked which outlets' rumours came true — data attached." Data-driven, quotable, controversial = links.
- [ ] **Free tool = "Transfer Reliability Checker"** — a tiny page where a fan pastes/searches a rumour and sees the source's historical reliability score. Tools earn links far better than articles. You already have the scoring logic — expose it as a standalone tool and people will cite it.
- [ ] **Football blog directories & aggregator lists** — get listed on football-blog directories, "best transfer sites" roundups, and awesome-lists. Search `"best football transfer sites" + [year]` and email each author to be added.
- [ ] **Be cited as a source** — footer "Embed our Done Deals feed" widget; make it trivially easy for small club-blogs to embed your reliability-rated feed (with a link back).
- [ ] **Reddit/forum links** (nofollow but real referral traffic + discovery) from §4.
- [ ] **Product directories** — Indie Hackers, BetaList, relevant "launch" communities. Frame as a maker story ("I built a rumour-reliability tracker").

---

## 8. Analytics & KPIs

All free tools:
- **Google Search Console** — the most important. Track impressions, clicks, avg position, which queries/pages, indexing coverage. Your weekly source of truth.
- **Google Analytics 4** — sessions, sources, engagement, top pages, Discover referrals.
- **Bing Webmaster Tools** — free, 5-min setup, extra crawl + IndexNow instant indexing.

### Leading vs lagging indicators
| Type | Metric | Why it matters | Target trajectory |
|---|---|---|---|
| **Leading** | Pages indexed (GSC) | Can't rank what isn't indexed | 5 → 40+ (after hubs ship) |
| **Leading** | Impressions (GSC) | Demand finding you, precedes clicks | Up week-over-week |
| **Leading** | Avg position for club terms | Are hubs climbing? | Page 5 → page 2 by day 90 |
| **Leading** | Push/email subscribers | Direct-traffic insurance | +50–100/week in window |
| **Lagging** | Organic sessions | The revenue driver | Compounds after ~month 3 |
| **Lagging** | Discover clicks (GSC) | The firehose moments | Spiky; grows with E-E-A-T |
| **Lagging** | Returning-visitor % | Retention health | >25% |
| **Lagging** | AdSense RPM / revenue | The point | Post-approval |

### Weekly review loop (30 min, every Monday)
1. GSC: top rising & falling queries → write/refresh a hub or roundup targeting the risers.
2. GA4: top traffic sources → double down on what's working, cut what isn't.
3. Which social post drove the most clicks? → make 3 more like it.
4. Indexing coverage errors → fix.
5. Log the numbers in a simple sheet (sessions, subs, indexed pages, revenue). Trend > absolute.

---

## 9.  30 / 60 / 90-Day Action Plan

Prioritised **most-leverage-first**, matched to the football calendar. Checkboxes = do-able tasks.

### Days 1–30 — Foundation & indexing (goal: be findable, own the basics)
**Highest leverage first:**
- [ ] **Buy a custom domain** (~$10) and point Vercel to it; 301 the `.vercel.app` subdomain. *(Unlocks Discover, News, trust, brand.)*
- [ ] Verify **Google Search Console** + **Bing Webmaster**; submit sitemap; request indexing of core pages.
- [ ] Ship **5 club hub pages** (Man United, Arsenal, Liverpool, Chelsea, Man City) — biggest search volume first.
- [ ] Build **`/about` + `/methodology` + author byline** (E-E-A-T for Discover/News).
- [ ] Build **`/how-reliability-ratings-work`** explainer with FAQPage schema; link it from every reliability badge.
- [ ] Set up **GA4**; confirm events fire.
- [ ] Claim **@TransferHubFC** (✅ referenced) + TikTok + Instagram + Threads handles; consistent bio + link.
- [ ] Start **Reddit karma-building** (comment-only, no links) in r/soccer, r/FantasyPL + your 2 favourite club subs.
- [ ] Ship the **daily "Done Deals"** auto-page + image (freshness + daily social asset).
- [ ] Post to social **daily** using the week-1 calendar (§4.5).

### Days 31–60 — Surface area & authority (goal: rank the long-tail, seed backlinks)
- [ ] Ship **remaining ~23 club hubs** + **league hubs** (La Liga, Serie A, Bundesliga, Ligue 1).
- [ ] Add **footer Clubs/Leagues link columns** + automatic in-card internal links to hubs.
- [ ] Launch the **Weekly Rumour Accuracy Scorecard** (original content → News/Discover/links).
- [ ] Apply to **Google Publisher Center / News** once About+methodology+domain are live.
- [ ] Start **HARO/Featured** responses (2–3/week) for backlinks.
- [ ] Get listed in **3–5 football blog directories / "best transfer sites" lists**.
- [ ] Launch **email newsletter** (free ESP) + inline capture on club hubs.
- [ ] Stand up **web push** (confirmed-deal alerts, club-segmented).
- [ ] Batch **TikTok/Reels/Shorts** — 5+ clips/week; identify what format pops.
- [ ] **AdSense:** apply once you have ~15–20 quality pages + steady traffic (don't apply too early with thin content — rejection stings).

### Days 61–90 — Compound & convert (goal: turn traffic into returning revenue)
- [ ] Ship the **"Transfer Reliability Checker" free tool** (link magnet).
- [ ] Add **"Embed our feed" widget** for small blogs (backlinks + reach).
- [ ] Turn on **PWA install prompt** (2nd-visit trigger).
- [ ] **Refresh** the 5 original club hubs with better intros/FAQs based on GSC query data.
- [ ] Build the **`/live` deadline-day page** and pre-write the deadline-day social playbook (see calendar below — the **Jan 2027 window** and its deadline day is your first big test; the **summer 2026 window is closing early in this plan — capture whatever's left**).
- [ ] Double down on the **top 3 traffic sources** from the weekly review; cut dead channels.
- [ ] Pitch the **Rumour Scorecard** to 10 football journalists/bloggers for coverage.
- [ ] Review **AdSense placement** for RPM without wrecking Core Web Vitals (reserve ad heights, lazy-load below fold).

---

## The Football Calendar — When to Push

Traffic is *wildly* seasonal. Map every big effort to a window; coast in the dead months.

| Period | Football event | Traffic | Your move |
|---|---|---|---|
| **Aug (early)** | **Summer window closing / deadline day** | 🔥🔥🔥 Peak | Whatever's left of it *right now* — go all-in on deadline day, `/live` page, hourly social |
| Sep–Dec | Season underway, window shut | Baseline | Build hubs, backlinks, newsletter — the compounding work |
| **Jan** | **Winter window + deadline day (31 Jan)** | 🔥🔥 Big | Your first fully-prepared window — Done Deals daily, live page, push blast |
| Feb–May | Run-in, no window | Baseline | Rumour Scorecard content, retention, refresh hubs for summer |
| **Jun–Aug** | **Summer window (the big one)** | 🔥🔥🔥 Peak | By now hubs rank + you have subscribers — harvest. This is the year-defining window. |

**Off-season isn't dead time — it's when you *build* so you're ranked and subscribed *before* the window opens.** Rankings take 3–9 months; the work you do in a quiet September is what pays out in a frantic July.

---

### The one thing, if you do nothing else
**Buy a custom domain today, then ship the per-club hub pages.** The domain unlocks Discover/News/trust (currently capped by the `vercel.app` subdomain), and the ~28 club hubs turn one rankable page into ~28 — each targeting a real "[club] transfer news" mid-tail keyword — using data your pipeline *already* extracts. It's the highest ratio of ranking surface area to effort available to you.
