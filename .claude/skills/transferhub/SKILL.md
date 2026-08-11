---
name: transferhub
description: Develop, extend, and deploy TransferHub — a live football transfer news aggregator (Astro static site, dark "Pitch & Gold" theme, deployed to transferhub.club on Vercel). Use for any change to the site: adding clubs/leagues, editing pipeline/feeds, UI/theme work, SEO, PWA/service worker, sitemap, or deploys.
---

# TransferHub

Live football transfer-news aggregator. Astro v4 static site. Pulls 6 RSS feeds, classifies stories (confirmed / rumour / news), rates reliability, enriches with OpenGraph images + summaries, renders club & league hub pages. Dark forest + gold brand ("Pitch & Gold"). Deployed to **https://transferhub.club** via Vercel; repo `AyanDebnath88/transferhub`, pushes to `main` auto-deploy.

## Run & build

```bash
npm run dev        # dev server :4321
npm run build      # static build -> dist/  (47 pages)
npm run preview    # serve dist
```

Deploy = `git push` to `main` (Vercel auto-builds). Domain: apex `transferhub.club` is primary (serves 200), `www` 308-redirects to apex. Site rebuilds twice daily via `.github/workflows/daily-refresh.yml` (needs repo secret `VERCEL_DEPLOY_HOOK` = a Vercel Deploy Hook URL).

## Architecture

**Data pipeline** (`src/lib/`):
- `feeds.ts` — 6 `FEED_SOURCES` (Sky 9, BBC 9, ESPN 8, Guardian 8, Goal 7, F365 7), `TRANSFER_KEYWORDS`, `CONFIRMED_KEYWORDS`, `RUMOUR_KEYWORDS`, `KNOWN_CLUBS` (club-name extraction list).
- `processor.ts` — `isTransferRelated()` (keyword match + `EXCLUDE_PATTERNS`), `isSoccerStory()` (rejects `OTHER_SPORTS`: NFL/NBA/cricket/etc — soccer only), `classifyType()`, `extractClubs()`, `scoreConfidence()`, `processItem()`.
- `fetchTransfers.ts` — `gather(accept)` pulls+dedupes feed items; `enrich(raw)` fetches each article's OG `og:image`/`og:description` (6s timeout, parallel), upgrades BBC/Sky image URLs, trims summary to ~60 words; 5-min module cache. Exports `fetchAllTransfers()` (transfer-filtered) and `fetchTopStories()` (any soccer story — homepage fallback when no transfers).
- `clubs.ts` — `CLUB_META` (28 clubs: color+short), `CLUB_INFO` (league/city/nick for unique per-club copy), `getClubMeta()`, `getClubInfo()`, `USE_REAL_CRESTS=true`. Crests self-hosted at `public/logos/<slug>.png`.
- `leagues.ts` — `LEAGUES` map (la-liga, serie-a, bundesliga, ligue-1) with `clubs[]` + blurb.
- `types.ts` — `Transfer`, `FeedSource`.

**UI** (`src/`):
- `layouts/BaseLayout.astro` — the shell: `SITE` const, all SEO/OG/JSON-LD (Org, WebSite), **AdSense tag**, `<slot name="head"/>` for per-page schema, scrolling **ticker** (85s desktop / 70s mobile), sticky header with **Leagues dropdown** (desktop) + **working mobile menu** (toggle script), attribution banner, 4-col footer.
- `components/TransferCard.astro` — card: image/gradient fallback, club badges, title (featured = `font-display`), ~60-word summary, source link, reliability stars, breaking accent.
- `components/ClubBadge.astro` — crest on white ring (if `USE_REAL_CRESTS`), else colored monogram fallback.
- `components/ReliabilityStars.astro` — 1–10 → 5 stars (gold/rumor/line).
- `components/CookieConsent.astro` — **UNUSED** (removed from layout; Google certified CMP handles consent now). Kept for reference.

**Pages** (`src/pages/`): `index`, `confirmed`, `rumours`, `premier-league`, `clubs`, `club/[slug]` (28 dynamic), `league/[slug]` (4 dynamic), `about`, `methodology`, `privacy`, `terms`, `disclaimer`, `contact`, `attribution`, `404`, `500`, `offline`, `sitemap.xml.ts`.

**Static** (`public/`): `logos/` (28 crest PNGs), `icons/` (PWA), `sw.js` (service worker — network-first pages, cache version `transferhub-v3`), `manifest.json`, `robots.txt`, `ads.txt`, `favicon.svg`, `og-default.png`, Google verify HTML.

**Scripts** (`scripts/`): `fetch-logos.mjs` (download crests from TheSportsDB), `generate-og.mjs` (1200×630 OG image), `generate-app-icon.mjs` (icon+splash+PWA pngs), `generate-icons.mjs` (legacy).

**Native**: Capacitor — `capacitor.config.ts`, `android/`, `ios/`. `npm run app:sync` / `app:open:android` / `app:open:ios`. iOS build needs macOS+Xcode; Android needs Android Studio.

## Design tokens (tailwind.config.cjs)

- Backgrounds: `pitch-800` (page), `pitch-700` (cards), `pitch-600` (insets/hover), `pitch-900` (footer/ticker).
- Borders: `line`, `line-soft`.
- Text: `cream` (primary), `cream-muted` (secondary), `cream-dim` (tertiary).
- Accents: `gold` (brand/CTA/active/links) + `gold-400`; `grass` (confirmed); `rumor` (rumour); `info` (news / Premier League).
- Headlines use `font-display` (Newsreader serif, loaded in BaseLayout head).

## Common tasks

**Add a club:** add to `CLUB_META` + `CLUB_INFO` (clubs.ts) and `KNOWN_CLUBS` (feeds.ts) using the exact name the feeds print; add its badge: put row in `scripts/fetch-logos.mjs`, run `node scripts/fetch-logos.mjs`. Club page + sitemap entry auto-generate. To include it in a league, add the name to that league's `clubs[]` in `leagues.ts`.

**Add a league:** add entry to `LEAGUES` (leagues.ts). Page (`/league/<slug>`) + sitemap auto. Add a footer + nav link in BaseLayout.

**Regenerate brand assets:** edit color consts in the relevant `scripts/generate-*.mjs`, run with `node`. Brand = gold `#d4af37` square + pitch `#0c1f14` arrow.

**Force fresh content for users:** bump `CACHE` version in `public/sw.js` (e.g. v3→v4) when static assets change; pages are already network-first so news is never stale.

## Gotchas (learned this build)

- **Tailwind config change → restart the dev server.** HMR does not pick up new theme tokens; you'll see stale/old styling until restart.
- **`getStaticPaths` runs in an isolated module scope** — helper functions defined in the component frontmatter are NOT visible inside it. Define any `slugify`-type helper *inside* `getStaticPaths`.
- **`grep -c` exits non-zero when it finds 0 matches** — it breaks `&&` command chains. Use `;` or `|| true` when chaining after a grep count.
- **Service worker is sticky.** After a deploy, your own browser may serve the old SW cache. Verify in **incognito**, or DevTools → Application → Service Workers → Unregister. Pages are network-first so this self-heals on next load for real users.
- **Browser caching** generally: use incognito to confirm a deploy is actually live before assuming it failed. Curl the live URL to check `http_code` / content.
- **`fetchAllTransfers` is cached 5 min** (module-level). In dev SSR every page nav reuses the cache; restart dev to force a re-fetch.
- **Crests are trademarks.** `USE_REAL_CRESTS=true` shows them (editorial-use basis). Flip to `false` in clubs.ts for instant colored-monogram fallback if a rights issue ever arises.
- **Sitemap/canonical/OG use the `SITE` const** in BaseLayout, plus `astro.config.mjs` `site`, `sitemap.xml.ts` `SITE`, `robots.txt`, and `club`/`league` page `SITE` — change all together if the domain ever changes.

## Reference docs in repo

- `DEPLOY.md` — full deploy runbook (domain swap, Vercel, DNS, Search Console).
- `MARKETING.md` — zero-budget growth/SEO/ranking plan.
- `transferhub.md` — project state & feature inventory.
