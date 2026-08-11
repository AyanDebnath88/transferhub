# TransferHub — Project State

**Live:** https://transferhub.club
**Repo:** github.com/AyanDebnath88/transferhub (`main` auto-deploys to Vercel)
**Stack:** Astro v4 (static) · Tailwind CSS · rss-parser · Capacitor (iOS/Android shells)
**Theme:** "Pitch & Gold" — dark forest `#0c1f14` + gold `#d4af37` + cream text, Newsreader serif headlines.

A live football transfer-news aggregator. Pulls 6 RSS feeds, classifies each story (confirmed / rumour / news), rates source reliability, enriches with OpenGraph images and ~60-word summaries, and renders club + league hub pages. Independent aggregator — links to originals, reproduces no article in full.

---

## Feature inventory (all shipped & live)

**Content pipeline**
- 6 sources: Sky Sports (9), BBC Sport (9), ESPN (8), The Guardian (8), Goal.com (7), Football365 (7). Number = base reliability weight.
- Rule-based classification (no AI): Confirmed / Rumour / News from headline+body language.
- Reliability rating 1–10 → 5 stars, adjusted by type + "exclusive".
- Article `og:description` fetched for ~60-word summaries. **No agency/press photos** — see Images below.
- **Soccer-only filter**: rejects NFL/NBA/MLB/cricket/rugby/tennis/etc in title or body.
- 5-minute in-memory cache; homepage falls back to top football stories when no transfers.

**Pages (48 total)**
- Feeds: Home, Confirmed, Rumours.
- League hubs: Premier League + `/league/{la-liga,serie-a,bundesliga,ligue-1}` (dynamic, unique blurb each).
- Club hubs: `/club/<slug>` — 28 clubs, each with a unique intro (league/city/nickname) + live counts.
- Clubs index `/clubs`.
- Editorial: `/about`, `/methodology` (how reliability works) — original long-form copy.
- Legal: `/privacy`, `/terms`, `/disclaimer`, `/attribution`, `/credits` (image attribution), `/contact` (DMCA).

**Images (copyright-safe)**
- No agency photos. Card image priority: your player drop-in (`public/players/<slug>.jpg`) → royalty-free Pixabay generic (`public/photos/`, 24) → original vector art (`public/cards/`, 12). Club emblem always shown.
- Player drop-ins: add files named `player-name.jpg`; only PD/CC0/CC-BY/CC-BY-SA (Wikimedia etc). CC-BY/BY-SA → add a credit to `src/data/imageCredits.json`; shown on `/credits`.
- Crests are original own-design emblems, not real trademarks. Full detail in `.claude/skills/transferhub/SKILL.md`.
- Error/utility: `/404`, `/500`, `/offline`.

**Brand & UX**
- Custom gold arrow logo (favicon + PWA + app icons all regenerated to match).
- Scrolling confirmed-transfers ticker (85s desktop / 70s mobile).
- Sticky header: desktop **Leagues dropdown**, working **mobile hamburger menu**.
- **Original** club emblems (own design, `public/crests/`, 28 clubs) — not real trademarked crests — with colored-monogram fallback.
- Fully responsive, no horizontal scroll, 44px tap targets.

**SEO**
- Per-page unique title/description/keywords, canonical.
- JSON-LD: Organization, WebSite (SearchAction), ItemList, FAQPage, BreadcrumbList, CollectionPage.
- `sitemap.xml` (46 URLs incl. all club + league pages), `robots.txt`, OG image (1200×630).
- Crawlable editorial copy + FAQ on homepage; unique copy on every club/league page.
- Google Search Console: verified; homepage confirmed indexable; sitemap submitted (indexing in progress).

**PWA / native**
- Manifest, service worker (**network-first for pages** so news is never stale; cache `transferhub-v3`), offline page, installable.
- Capacitor iOS + Android projects scaffolded (`android/`, `ios/`). Building needs macOS+Xcode (iOS) / Android Studio (Android).

**Ops**
- Vercel: apex `transferhub.club` primary (200), `www` → 308 redirect to apex, auto-HTTPS.
- **Daily auto-refresh**: `.github/workflows/daily-refresh.yml` triggers a Vercel Deploy Hook twice daily (06:00 & 18:00 UTC) so the static feed re-fetches. Needs repo secret `VERCEL_DEPLOY_HOOK`.
- Monetization: Google AdSense integrated (tag + `ads.txt`) with a Google certified CMP for EEA/UK consent. *(Setup/tax specifics intentionally omitted from this doc.)*

---

## How to work on it

See `.claude/skills/transferhub/SKILL.md` for architecture, file map, common tasks, and gotchas. Quick version:

```bash
npm run dev      # local
npm run build    # -> dist/
git push         # deploy (Vercel auto)
```

Key gotchas: restart dev after editing `tailwind.config.cjs`; define helpers *inside* `getStaticPaths`; bump `public/sw.js` cache version when static assets change; verify deploys in **incognito** (service worker is sticky).

---

## Roadmap / open items

**External (waiting, not code):**
- AdSense site review (days–2wk) → on approval, place ad units.
- Google indexing of the 47 pages (days–weeks); watch Search Console.

**Enhancements (when wanted):**
- Expand club rosters in `CLUB_META` / `KNOWN_CLUBS` (add Marseille, Roma, Atalanta, Villarreal, etc.) to fatten Ligue 1 / La Liga / Serie A hubs + pull their crests.
- Execute `MARKETING.md` — backlinks, social seeding, Google Discover/News eligibility.
- Native app store builds (needs Mac / Android Studio, or cloud CI like Codemagic).
- Optional: an "About the author"/editorial byline, a rumour-accuracy scorecard content asset.

---

*Last updated: build handoff. Site is live, self-refreshing, and maintenance-free between changes.*
