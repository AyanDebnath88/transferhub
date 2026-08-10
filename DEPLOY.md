# TransferHub — Deployment Runbook

Ship TransferHub to a real custom domain on **Vercel**, monetized with **Google AdSense**. This is a static **Astro v4** site (`output: 'static'`, build → `dist`).

Follow the steps **in order**. Every command is copy-paste ready. Where you must type your real values, they appear as `YOUR_DOMAIN`, `pub-XXXX…`, etc. — replace them literally.

> Throughout this doc, `YOUR_DOMAIN` means your purchased apex domain **without** protocol or `www`, e.g. `transferhub.com`. `https://YOUR_DOMAIN` means the full URL, e.g. `https://transferhub.com`.

---

## Critical path (check these off)

- [ ] 1. Swap `transferhub.vercel.app` → your real domain everywhere (Section 1)
- [ ] 2. Push code to a GitHub repo (Section 2)
- [ ] 3. Deploy on Vercel + attach the custom domain + DNS records (Section 3)
- [ ] 4. AdSense: publisher ID → `ads.txt`, script → `BaseLayout` `<head>`, submit for review (Section 4)
- [ ] 5. Google Search Console: verify + submit sitemap (Section 5)
- [ ] 6. (Optional) GA4 wired to the consent banner (Section 6)
- [ ] 7. Pre-launch smoke test — `npm run build` clean, key routes load (Section 7)
- [ ] 8. Post-launch — request indexing + monitor (Section 8)

**Realistic timeline:** Sections 1–3 and 7 = ~half a day (you're live). Sections 4–5 = minutes of work, then AdSense review is **days to ~2 weeks** (out of your hands). GA4 optional.

Run everything from the project root:

```bash
cd "C:\Claude Projects\TransferHub"
```

---

## 0. Prerequisites (one-time)

Install and verify these tools. On Windows, run in PowerShell or Git Bash.

```bash
node --version    # need v18+ (Astro v4 requires 18.20.8+ / 20.3+ / 22+)
npm --version
git --version
gh --version      # GitHub CLI — https://cli.github.com/
```

If `gh` is missing: install from https://cli.github.com/ then authenticate:

```bash
gh auth login
```

You also need:
- A **purchased domain** at a registrar (Namecheap, GoDaddy, Cloudflare, etc.).
- A **Vercel account** (sign in with GitHub): https://vercel.com/signup
- A **Google account** for AdSense + Search Console.

Install project dependencies once and confirm a clean build before changing anything:

```bash
npm install
npm run build
```

The build must succeed and produce a `dist/` folder before you continue.

---

## 1. Domain swap — replace `transferhub.vercel.app` with your real domain

The old preview URL `https://transferhub.vercel.app` is hard-coded in several files. **Every one must point to `https://YOUR_DOMAIN`** or your canonical URLs, sitemap, Open Graph tags, and structured data will be wrong (and Google will index the wrong host).

### 1a. Find every occurrence

```bash
grep -rn "transferhub.vercel.app" .
```

Expect hits in the files below. Edit each one, replacing `https://transferhub.vercel.app` with `https://YOUR_DOMAIN`.

| # | File | What to change |
|---|------|----------------|
| 1 | `astro.config.mjs` | `site: 'https://transferhub.vercel.app'` → `site: 'https://YOUR_DOMAIN'` |
| 2 | `src/layouts/BaseLayout.astro` | `const SITE = 'https://transferhub.vercel.app';` → `const SITE = 'https://YOUR_DOMAIN';` (drives canonical, OG image, Twitter image, Organization + WebSite JSON-LD) |
| 3 | `src/pages/sitemap.xml.ts` | `const SITE = 'https://transferhub.vercel.app';` → `const SITE = 'https://YOUR_DOMAIN';` |
| 4 | `public/robots.txt` | `Sitemap:` line → `https://YOUR_DOMAIN/sitemap.xml` (see fix note below) |

**`public/manifest.json`** uses only relative paths (`start_url: "/"`, `scope: "/"`), so **no domain edit is needed** there — it inherits whatever origin serves it. Leave it as-is.

### 1b. Fix the robots.txt sitemap path (do this now)

`public/robots.txt` currently points to `/sitemap-index.xml`, but this project's actual sitemap route is `/sitemap.xml` (see `src/pages/sitemap.xml.ts`, and `BaseLayout.astro` links `/sitemap.xml`). Update the line so it matches the real route **and** your domain:

```
User-agent: *
Allow: /

Sitemap: https://YOUR_DOMAIN/sitemap.xml
```

### 1c. Verify nothing was missed

```bash
grep -rn "transferhub.vercel.app" .
```

This should now return **nothing** (ignore any hits inside `node_modules/` or `dist/` — those are generated; a fresh `npm run build` regenerates `dist/` from your edited source). Then rebuild to bake the new URLs into the output:

```bash
npm run build
grep -rn "transferhub.vercel.app" dist/   # should be empty after a clean rebuild
```

---

## 2. Git + GitHub

Initialize a repo, commit, and push to a **new** GitHub repository. Vercel deploys from GitHub.

### 2a. Confirm a `.gitignore` exists

You do **not** want to commit `node_modules/` or `dist/`. Confirm they're ignored:

```bash
cat .gitignore
```

If there's no `.gitignore`, create one:

```bash
cat > .gitignore <<'EOF'
node_modules/
dist/
.astro/
.vercel/
.env
.env.*
.DS_Store
EOF
```

### 2b. Init, commit, push

```bash
git init
git add -A
git commit -m "Initial commit: TransferHub ready for production"
```

Create the GitHub repo and push in one step with the GitHub CLI (choose `--public` or `--private`):

```bash
gh repo create transferhub --private --source=. --remote=origin --push
```

If you prefer to do it manually: create an empty repo at https://github.com/new (do **not** add a README), then:

```bash
git branch -M main
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/transferhub.git
git push -u origin main
```

---

## 3. Vercel deploy + custom domain + DNS

### 3a. Import the project

1. Go to https://vercel.com/new
2. **Import** the `transferhub` GitHub repo (authorize Vercel to access it if prompted).
3. Vercel auto-detects the settings from `vercel.json`. Confirm they read:
   - **Framework Preset:** `Astro`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`
4. Click **Deploy**. Wait for the build to finish — you'll get a `*.vercel.app` URL. Open it and confirm the site loads.

> **Note on the cron job:** `vercel.json` defines a cron `"/api/refresh"` every 30 min. Cron jobs require the route to exist as a serverless function and are a **Vercel Pro** feature. On the Hobby (free) plan the cron simply won't run — the static site still works fine (it just won't auto-refresh on that schedule). If `/api/refresh` doesn't exist in this repo, the cron is a no-op; you can ignore it or remove the `crons` block from `vercel.json` later. Do not block launch on this.

### 3b. Add your custom domain in Vercel

1. In the Vercel dashboard: **Project → Settings → Domains**.
2. Enter `YOUR_DOMAIN` (the apex, e.g. `transferhub.com`) and click **Add**.
3. Add `www.YOUR_DOMAIN` too when prompted. Set **one as primary** (apex `YOUR_DOMAIN` is the common choice) and let Vercel **redirect** the other to it. Your `site:`/`SITE` values from Section 1 must match the primary you pick here.
4. Vercel shows the exact DNS records to add. They will look like the table below.

### 3c. Add DNS records at your registrar

Log in to your **domain registrar** (where you bought the domain) and open its DNS settings. Add:

| Purpose | Type | Name / Host | Value |
|---------|------|-------------|-------|
| Apex (`YOUR_DOMAIN`) | `A` | `@` | `76.76.21.21` |
| www (`www.YOUR_DOMAIN`) | `CNAME` | `www` | `cname.vercel-dns.com` |

- **Apex vs www:** The apex (root) domain can't use a CNAME, so it uses an `A` record to Vercel's IP. The `www` subdomain uses a `CNAME` to Vercel.
- **Always use the exact values Vercel shows you** in Settings → Domains — the `A` IP above is Vercel's current standard, but the dashboard is the source of truth. If your registrar is Cloudflare, set the records to **DNS only** (grey cloud), not proxied.
- Remove any old/parked `A`, `AAAA`, or `CNAME` records for `@` and `www` that point elsewhere.

### 3d. Wait for propagation + HTTPS

DNS can take from a few minutes up to ~48 hours (usually under an hour). In **Settings → Domains**, each domain flips to **Valid Configuration** once detected, and Vercel auto-issues an SSL certificate. Then verify:

```bash
# Should resolve and return your site over HTTPS
curl -I https://YOUR_DOMAIN
curl -I https://www.YOUR_DOMAIN   # should redirect to the primary
```

Do not proceed to AdSense/Search Console until `https://YOUR_DOMAIN` loads the live site.

---

## 4. Google AdSense

### 4a. Sign up and add the site

1. Go to https://adsense.google.com and sign up (or sign in).
2. Add your site: enter `YOUR_DOMAIN`.
3. AdSense gives you a **publisher ID** in the form `pub-XXXXXXXXXXXXXXXX` (16 digits). You'll also get a `ca-pub-XXXXXXXXXXXXXXXX` value for the script tag — same digits.

### 4b. Update `public/ads.txt`

Currently `public/ads.txt` contains a placeholder `pub-0000000000000000`. Replace it with your real publisher ID (keep the rest of the line intact):

```
google.com, pub-XXXXXXXXXXXXXXXX, DIRECT, f08c47fec0942fa0
```

This file becomes reachable at `https://YOUR_DOMAIN/ads.txt` after deploy. AdSense **requires** a correct `ads.txt` for ads to serve.

### 4c. Add the AdSense script to `BaseLayout.astro`

Add the AdSense loader **inside `<head>`** in `src/layouts/BaseLayout.astro`. A good spot is right **after the two JSON-LD `<script type="application/ld+json">` blocks (around line 119) and before the service-worker `<script>`**. Replace `ca-pub-XXXXXXXXXXXXXXXX` with your real ID:

```html
    <!-- Google AdSense -->
    <script async
      src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX"
      crossorigin="anonymous"></script>
```

For reference, the surrounding region of `BaseLayout.astro` looks like this — insert the block where marked:

```html
    <script type="application/ld+json" set:html={orgSchema} />
    <script type="application/ld+json" set:html={siteSchema} />

    <!-- Google AdSense -->   <!-- ← INSERT the AdSense <script> here -->

    <script>
      if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
          navigator.serviceWorker.register('/sw.js').catch(() => {});
        });
      }
    </script>
```

> **Consent Mode note:** This site already ships Google Consent Mode v2 via `src/components/CookieConsent.astro`, which defaults `ad_storage`/`ad_user_data`/`ad_personalization` to `denied` until the user accepts. The AdSense script is fine to load in `<head>`; it will respect the consent state. For heavy EEA/UK traffic, Google requires a **certified CMP** — see the comment at the top of `CookieConsent.astro`.

### 4d. Rebuild, commit, deploy

```bash
npm run build
git add -A
git commit -m "Add AdSense publisher ID (ads.txt) and loader script"
git push
```

Vercel auto-deploys on push. Confirm `https://YOUR_DOMAIN/ads.txt` shows your real ID.

### 4e. Submit for review and wait

Back in AdSense, click **Request review**. Review typically takes **a few days up to ~2 weeks**. Ads won't display until you're approved. Make sure your legal pages (Privacy, Terms, Contact — already in the footer) are live, since AdSense checks for them.

---

## 5. Google Search Console

Verify ownership and submit your sitemap so Google indexes the site.

1. Go to https://search.google.com/search-console and click **Add property**.
2. Choose a property type:
   - **Domain property** (recommended) — covers apex + `www` + all subdomains. Verify with a **DNS TXT record**: Google gives you a `TXT` record; add it at your registrar (Type `TXT`, Host `@`, Value = the `google-site-verification=…` string Google provides). Click **Verify**.
   - **URL-prefix property** (alternative) — enter `https://YOUR_DOMAIN`. You can verify with the **HTML tag** method: Google gives a `<meta name="google-site-verification" content="…">` tag. Add it inside `<head>` in `src/layouts/BaseLayout.astro` (near the other `<meta>` SEO tags around line 85), then rebuild/commit/push and click **Verify**:

     ```html
     <meta name="google-site-verification" content="YOUR_VERIFICATION_TOKEN" />
     ```

3. Once verified, open **Sitemaps** (left nav), enter the path, and **Submit**:

   ```
   sitemap.xml
   ```

   Full URL: `https://YOUR_DOMAIN/sitemap.xml`. Confirm it loads in a browser first — it's generated by `src/pages/sitemap.xml.ts`.

---

## 6. Analytics (optional) — GA4 wired to the consent banner

The consent banner in `src/components/CookieConsent.astro` already defines `window.gtag`, sets Consent Mode v2 defaults to `denied`, and calls `gtag('consent', 'update', …)` on Accept. To add GA4, just load the GA library and configure your Measurement ID **after** the consent script has defined `gtag`.

1. Create a **GA4 property** at https://analytics.google.com and copy the **Measurement ID** (`G-XXXXXXXXXX`).
2. In `src/layouts/BaseLayout.astro`, add this inside `<head>`, placed **after** `<CookieConsent />` is not applicable (the consent script runs in the component) — instead put it near the AdSense block, and it will use the `gtag` already defined by the consent banner. Replace `G-XXXXXXXXXX`:

   ```html
   <!-- Google Analytics 4 (respects Consent Mode v2 from CookieConsent.astro) -->
   <script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
   <script is:inline>
     window.dataLayer = window.dataLayer || [];
     window.gtag = window.gtag || function(){ dataLayer.push(arguments); };
     gtag('js', new Date());
     gtag('config', 'G-XXXXXXXXXX');
   </script>
   ```

   Because `CookieConsent.astro` sets all consent signals to `denied` by default and only flips them to `granted` on **Accept all**, GA4 will collect analytics only after the user consents — no extra wiring needed.
3. Rebuild, commit, push:

   ```bash
   npm run build
   git add -A
   git commit -m "Add GA4 analytics (consent-gated)"
   git push
   ```

---

## 7. Pre-launch smoke test

Run these before announcing the site. Do a clean build and preview locally:

```bash
npm run build      # must finish with no errors
npm run preview    # serves the built dist/ at http://localhost:4321
```

Open the preview (or the live `https://YOUR_DOMAIN`) and check:

- [ ] **Build passes** — `npm run build` exits 0, no red errors.
- [ ] `/sitemap.xml` — loads as XML, and every `<loc>` starts with `https://YOUR_DOMAIN` (not `transferhub.vercel.app`).
- [ ] `/robots.txt` — loads, `Sitemap:` line points to `https://YOUR_DOMAIN/sitemap.xml`.
- [ ] `/ads.txt` — loads, shows your real `pub-XXXX…` (not the placeholder).
- [ ] **404 page** — visit a nonsense path like `/does-not-exist` and confirm the custom 404 renders.
- [ ] **Ticker** — the scrolling transfer ticker at the top of the homepage shows items and animates (labelled `CONFIRMED` or `LATEST`).
- [ ] **Mobile view** — open DevTools device mode (or your phone): header, nav, ticker, and cards are readable; the cookie banner appears and Accept/Reject work.
- [ ] **Canonical / OG** — View Source on the homepage: `<link rel="canonical">`, `og:url`, and `og:image` all use `https://YOUR_DOMAIN`.
- [ ] **Legal pages** — `/privacy`, `/terms`, `/attribution`, `/disclaimer`, `/contact` all load (needed for AdSense).
- [ ] **HTTPS + redirect** — `https://YOUR_DOMAIN` loads with a valid padlock; `www` redirects to the primary (or vice-versa).

Quick command-line checks against the live domain:

```bash
curl -sS https://YOUR_DOMAIN/sitemap.xml | head -20
curl -sS https://YOUR_DOMAIN/robots.txt
curl -sS https://YOUR_DOMAIN/ads.txt
```

---

## 8. Post-launch

1. **Request indexing.** In Google Search Console → **URL Inspection**, paste `https://YOUR_DOMAIN`, then click **Request Indexing**. Repeat for `/confirmed`, `/rumours`, `/premier-league`.
2. **Confirm sitemap status.** Search Console → Sitemaps should show your `sitemap.xml` as **Success** within a day or two.
3. **Watch AdSense.** Check the AdSense dashboard for the review result. Once approved, confirm ads render on the live site (test in a non-EEA context or after accepting cookies, since Consent Mode gates ad storage).
4. **Monitor Vercel.** Project → Deployments shows each push's build status; Project → Logs shows runtime/cron activity. Every `git push` to `main` auto-deploys.
5. **Ongoing checks (first week):**
   - Search Console → **Coverage/Pages** for indexing errors.
   - Search Console → **Core Web Vitals** and Vercel Analytics (if enabled) for performance.
   - Re-run `grep -rn "transferhub.vercel.app" .` after any future edits to make sure the old URL never creeps back in.

---

### Quick reference — all files that carry the domain or IDs

| File | Holds | Set to |
|------|-------|--------|
| `astro.config.mjs` | `site` | `https://YOUR_DOMAIN` |
| `src/layouts/BaseLayout.astro` | `SITE` const + AdSense/GA/verification tags | `https://YOUR_DOMAIN`, `ca-pub-…`, `G-…`, verification token |
| `src/pages/sitemap.xml.ts` | `SITE` const | `https://YOUR_DOMAIN` |
| `public/robots.txt` | `Sitemap:` line | `https://YOUR_DOMAIN/sitemap.xml` |
| `public/ads.txt` | publisher ID | `pub-XXXXXXXXXXXXXXXX` |
| `public/manifest.json` | relative paths only | no change needed |
| `vercel.json` | build config + cron | no change (cron needs Vercel Pro) |
