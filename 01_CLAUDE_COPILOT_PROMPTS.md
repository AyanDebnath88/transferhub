# Football Transfer Hub - Claude Copilot Prompts for VS Code

Copy and paste these prompts directly into GitHub Copilot Chat in VS Code.
Each prompt is designed for a specific phase of the project.

---

## MASTER BUILD CONTEXT PROMPT
**Use this FIRST to set up the context for all subsequent prompts**

```
I'm building a football transfer news aggregation website using Next.js 14, 
Vercel (free), and free APIs. The site will:
- Aggregate transfer news from 8+ RSS feeds
- Use Claude Haiku to summarize and verify transfers
- Display news in an infographic/image-rich format
- Be 100% Google AdSense compliant
- Rank well for "transfer news" keywords
- Update every 30 minutes with fresh data

KEY CONSTRAINTS:
✓ Zero backend costs (Vercel free tier only)
✓ Free APIs only: RSS feeds, TheSportsDB (free), Claude Haiku (free tier)
✓ File-based data storage (JSON in /data folder)
✓ Mobile-first responsive design
✓ Must pass Google AdSense approval
✓ Must have 100/100 Lighthouse SEO score
✓ TypeScript + Next.js 14 App Router

TECH STACK:
- Framework: Next.js 14 App Router
- Hosting: Vercel (free hobby tier)
- Styling: Tailwind CSS
- Images: @vercel/og, Vercel Image Optimization
- Database: JSON files
- APIs: TheSportsDB, Claude Haiku, RSS feeds

FOLDER STRUCTURE:
/app (routes)
/components (UI)
/lib (utilities)
/data (JSON storage)
/public (images)
/styles (CSS)

When I give you a task, assume this context unless I specify otherwise.
Help me build this project phase by phase, ensuring every code you generate is:
1. Production-ready and type-safe
2. AdSense compliant
3. SEO optimized
4. Error-handled
5. Fully documented
```

---

## PHASE 1: PROJECT SETUP
**Duration: 2-3 hours**

### Prompt 1.1: Initialize Project

```
Create a production-ready Next.js 14 project for football transfer news.

Provide the exact terminal commands and configuration needed:

1. Initialize Next.js 14 with App Router
2. Install all dependencies:
   - axios (HTTP client for RSS)
   - feed-parser (RSS parsing)
   - zod (schema validation)
   - sharp (image optimization)
   - @vercel/og (OG image generation)
   - typescript, eslint, prettier

3. Create this folder structure:
   src/
   ├── app/
   │   ├── layout.tsx
   │   ├── page.tsx
   │   └── (routes)/
   ├── components/
   │   ├── layouts/
   │   ├── ui/
   │   └── feeds/
   ├── lib/
   │   ├── rss-parser.ts
   │   ├── claude-processor.ts
   │   ├── data-store.ts
   │   ├── types.ts
   │   └── utils.ts
   ├── data/
   │   ├── transfers-latest.json
   │   ├── transfers-archive.json
   │   └── feeds.json
   ├── public/
   │   ├── images/
   │   └── logos/
   ├── styles/
   │   └── globals.css
   └── .env.example

4. Setup configuration files:
   - next.config.js (image domains, rewrites)
   - tailwind.config.js (sports theme colors)
   - tsconfig.json (strict mode)
   - .eslintrc.json (strict rules)
   - .prettierrc (formatting)

5. Create .env.example with:
   NEXT_PUBLIC_SITE_URL=
   NEXT_PUBLIC_GA_ID=
   CLAUDE_API_KEY=
   THESPORTSDB_KEY=3

6. Create README.md with:
   - Setup instructions
   - Project structure
   - Tech stack details
   - Development commands

Output: Complete commands to run locally, ready to deploy to Vercel.
```

### Prompt 1.2: Setup Next.js Config for Images & SEO

```
Configure next.config.js for:
1. Image optimization from TheSportsDB, Sky Sports, BBC domains
2. Proper image sizes for sports content
3. Environment variable handling
4. Vercel deployment settings
5. Feed caching strategy

Include allowed image domains:
- api.thesportsdb.com
- images.sky.com
- bbcimg.co.uk
- img.goal.com
- images.theppa.com
- cdn.sport365.co.uk

Also setup Vercel.json for:
- Cron job configuration (Phase 5)
- Build settings
- Function memory limits
```

### Prompt 1.3: Create Base Layout Component

```
Create /app/layout.tsx with:
1. Base HTML structure with Google Analytics tracking
2. Metadata for homepage (title, description, OG tags)
3. Header component with navigation
4. Main content area with sidebar
5. Footer component
6. Dark mode toggle support
7. Cookie consent banner (for GDPR)

Make it:
- Mobile responsive (Tailwind CSS)
- Accessible (proper ARIA labels)
- SEO friendly (structured data ready)
- TypeScript strict mode
- Dark mode compatible

Include providers:
- Theme provider (for dark mode)
- Analytics provider (GA4)
- Cookie consent provider
```

---

## PHASE 2: DATA PIPELINE & RSS AGGREGATION
**Duration: 4-5 hours**

### Prompt 2.1: Build RSS Parser Module

```
Create /lib/rss-parser.ts to:

1. Fetch and parse 8 RSS feeds:
   - Sky Sports: https://feeds.skysports.com/~r/skysports/football/transfernews/
   - BBC: https://feeds.bbc.co.uk/sport/football/rss.xml
   - ESPN: https://www.espn.com/espn/rss/news?sport=soccer
   - Goal: https://www.goal.com/feeds/news
   - Football365: https://www.football365.com/feed/
   - (Add 3 more of your choice)

2. For each feed item, extract:
   - title (transfer headline)
   - description (news summary)
   - image URL (if available)
   - source (which feed)
   - pubDate (publication date)
   - link (source URL)
   - guid (unique identifier)

3. Filter to ONLY football transfer content:
   - Include keywords: "transfer", "sign", "deal", "rumor", "bid", "move"
   - Exclude: "injury", "injury-time", "benched", "squad", "lineup"

4. Deduplication:
   - Compare by title similarity (80%+ match = duplicate)
   - Compare by content hash
   - Keep most recent version only

5. Error handling:
   - Retry failed feeds with exponential backoff
   - Log failed feeds
   - Continue with other feeds if one fails

6. Return type:
   interface ParsedFeed {
     title: string
     description: string
     image?: string
     source: string
     pubDate: Date
     url: string
     guid: string
     hash: string
   }

Make it efficient (process in parallel), type-safe, and ready for Phase 5 automation.
```

### Prompt 2.2: Build Claude API Integration

```
Create /lib/claude-processor.ts to:

1. Use Claude Haiku API (free tier: 15 requests/minute, 90K tokens/day)

2. For each transfer news item:
   - Summarize to 2-3 sentences max
   - Extract key entities:
     * Player names
     * Clubs involved
     * Transfer type: "rumor" | "confirmed" | "in_talks"
   - Assign confidence score (1-10) for accuracy
   - Generate 3 SEO-friendly headline variations
   - Extract key dates if mentioned

3. Validation:
   - Check if transfer news (not injury, suspension, etc)
   - Validate player/club names against a whitelist
   - Skip if confidence < 3

4. Rate limiting:
   - Respect 15 req/min limit
   - Queue requests if needed
   - Exponential backoff on rate limit

5. Return type:
   interface ProcessedTransfer {
     originalTitle: string
     summary: string
     players: string[]
     clubs: string[]
     type: 'rumor' | 'confirmed' | 'in_talks'
     confidence: number // 1-10
     headlines: string[] // 3 variations for SEO
     keyDates?: Date[]
     processedAt: Date
   }

6. Include error handling for Claude API failures

7. Add caching to avoid re-processing same transfer

Make Claude processing robust and respect rate limits strictly.
```

### Prompt 2.3: Build Data Storage System

```
Create /lib/data-store.ts to:

1. Store processed transfers to JSON files:
   - /data/transfers-latest.json (last 100 transfers)
   - /data/transfers-archive.json (all transfers, 30 days)
   - /data/feeds-status.json (which feeds are working)

2. Data schema (Zod validation):
   TransferSchema {
     id: uuid
     title: string
     summary: string
     players: string[]
     clubs: string[]
     type: 'rumor' | 'confirmed' | 'in_talks'
     confidence: number
     source: string
     image?: string
     publishedAt: Date
     url: string
     slug: string
     headlines: string[]
     processedAt: Date
   }

3. File operations:
   - Read latest transfers
   - Append new transfer
   - Archive old transfers (>30 days)
   - Update feed status
   - Cleanup old archives

4. Deduplication on write:
   - Check if transfer already exists
   - Compare by slug or content hash
   - Update if newer info available

5. Functions:
   - addTransfer(transfer)
   - getLatestTransfers(limit)
   - getTransferBySlug(slug)
   - archiveOldTransfers()
   - getFeedStatus()
   - updateFeedStatus(feedName, status)

6. Error handling:
   - File write failures
   - JSON parse errors
   - Disk space issues

Make it safe for concurrent writes (Vercel Cron + manual calls).
```

### Prompt 2.4: Create Type Definitions

```
Create /lib/types.ts with Zod schemas and TypeScript interfaces for:

1. Feed-related types:
   - RSSFeed
   - ParsedFeedItem
   - FeedStatus
   - FeedConfig

2. Transfer-related types:
   - Transfer
   - ProcessedTransfer
   - TransferType
   - ConfidenceLevel

3. Player/Club types:
   - Player
   - Club
   - TeamData

4. API Response types:
   - ApiResponse<T>
   - Error types
   - Success types

5. Validation schemas (Zod):
   - transferSchema
   - feedItemSchema
   - playerSchema
   - clubSchema

Export all as both TypeScript types and Zod schemas.
Include proper validation messages.
```

### Prompt 2.5: Test Data Generation

```
Create /data/transfers-latest.json with 100+ sample transfer items.
Format each transfer exactly as per the TransferSchema.

Include diverse examples:
- Haaland to Real Madrid (confirmed rumor)
- Vinicius Jr to PSG (in_talks)
- Kane to Bayern (confirmed)
- Mudryk to Arsenal (confirmed historical)
- Saka contract extension (rumor)
- Rashford to PSG (rumor)
- Salah to Saudi Arabia (confirmed rumor)
- Plus 90+ more from 2024-2026

Ensure:
- Proper slug generation (lowercase, hyphenated)
- Valid dates (recent to 2026)
- Confidence scores vary (2-10)
- Multiple sources represented
- Team color accuracy

Make it realistic test data for Phase 3 UI testing.
```

---

## PHASE 3: FRONTEND UI & COMPONENTS
**Duration: 5-6 hours**

### Prompt 3.1: Create Layout Components

```
Build the main layout structure in /components/layouts/:

1. Header Component (/components/layouts/Header.tsx):
   - Logo/brand name
   - Navigation: Home, Top Transfers, Clubs, Players
   - Search bar (placeholder for Phase 3)
   - Dark mode toggle
   - Mobile menu toggle
   - Make sticky on scroll

2. Navigation Component (/components/layouts/Navigation.tsx):
   - Links to all main sections
   - Active state styling
   - Mobile responsive (hamburger menu)
   - Quick search dropdown

3. Sidebar Component (/components/layouts/Sidebar.tsx):
   - Trending players widget
   - Hot clubs widget
   - Filter options (confidence, date range, source)
   - Newsletter signup form
   - Trending hashtags for social sharing

4. Footer Component (/components/layouts/Footer.tsx):
   - Quick links (Privacy, Terms, Contact)
   - Social media links (Twitter, TikTok, Instagram, YouTube)
   - Newsletter signup
   - Copyright and disclaimer
   - Latest posts feed

5. Meta/SEO Section (/components/layouts/Head.tsx):
   - Google Analytics script
   - Cookie consent script
   - Meta tags (to be filled per page)

All components:
- Tailwind CSS styling
- Mobile responsive
- Dark mode support
- Proper TypeScript typing
- Accessibility attributes (ARIA labels)

Make them reusable across all pages.
```

### Prompt 3.2: Build Transfer Card Component

```
Create /components/ui/TransferCard.tsx:

A reusable card component displaying one transfer with:

1. Visual Elements:
   - Player image (left): Circle avatar, click to go to player page
   - Transfer arrow or indicator: 🔴 (from club) → 🟢 (to club)
   - Club logos/badges: Small icons for both teams
   - Headline: SEO-optimized title
   - Summary: 2-3 sentence summary
   - Meta info row: Source badge, date, confidence indicator

2. Confidence Badge:
   - Color coding: Red (2-3), Orange (4-6), Green (7-10)
   - Show as number/10
   - Tooltip: "Based on news sources"

3. Interactive Elements:
   - Hover effect: Subtle shadow, slight scale up
   - Click: Navigate to /transfer/[slug]
   - Share buttons: Twitter, Facebook, Telegram
   - Like/save button (stored in localStorage for MVP)

4. Props:
   transfer: Transfer
   onClick?: () => void
   showDetails?: boolean

5. Responsive:
   - Desktop: Full card with all details
   - Tablet: Slightly compressed
   - Mobile: Vertical stack, images on top

6. Example data:
   {
     players: ["Erling Haaland"],
     clubs: ["Manchester City", "Real Madrid"],
     headline: "Haaland Targeted by Real Madrid in Summer Bid",
     summary: "Sky Sports reports Real Madrid have made first contact...",
     confidence: 8,
     source: "Sky Sports",
     publishedAt: "2026-06-05T10:30:00Z"
   }

Make it the core component for the news feed.
```

### Prompt 3.3: Build Homepage Page

```
Create /app/page.tsx (Homepage) with:

1. Hero Section:
   - Large headline: "Football Transfer News Hub"
   - Subheading: "Real-time verified transfer news from global sources"
   - Search bar (full width)
   - Quick filter buttons: Today, This Week, Trending

2. Trending Section:
   - 5-6 top trending transfers (by confidence + recency)
   - Large format cards
   - "See all trending" link

3. Latest News Feed:
   - Infinite scroll or pagination
   - Use TransferCard component
   - Group by date if possible
   - Lazy load images

4. Sidebar (Desktop only):
   - Top players this window
   - Most active clubs
   - Filter panel
   - Newsletter signup

5. SEO Setup:
   - Metadata for homepage
   - H1, H2 tags proper structure
   - Image alt text
   - Schema markup (NewsArticle, Organization)

6. Data Fetching:
   - Load transfers from /data/transfers-latest.json
   - Show loading state
   - Handle empty state
   - Optimize with ISR (revalidate: 1800 seconds)

Make it visually stunning and fast-loading.
```

### Prompt 3.4: Build Dynamic Transfer Detail Page

```
Create /app/transfer/[slug]/page.tsx for individual transfers:

1. Main Content Area:
   - Large header image (player or club)
   - Full headline
   - Source badge with link
   - Published date + last updated
   - Full summary (2-3 paragraphs)

2. Details Section:
   - Player profile: Name, image, position, club, age
   - From club: Logo, name, link to club page
   - To club: Logo, name, link to club page
   - Transfer type: Rumor/Confirmed badge
   - Confidence: Detailed breakdown
   - Price: If available from TheSportsDB

3. Related News:
   - 5-10 related transfers for same players/clubs
   - "Other transfers" section

4. Social Sharing:
   - Twitter/X button with pre-written text
   - Facebook share
   - Copy link button
   - @vercel/og for dynamic OG image

5. Comments Section (Optional):
   - Show last 10 comments
   - "Add comment" form (optional: Disqus integration)
   - Sort by newest/popular

6. Newsletter CTA:
   - "Get transfer alerts in your inbox"
   - Email signup form

7. SEO:
   - Dynamic title: "Haaland Transfer News - Latest Updates"
   - Dynamic meta description
   - Structured data: NewsArticle schema
   - Canonical URL

8. Data Fetching:
   - Read from JSON
   - Handle 404 if not found
   - ISR revalidation: 1800 seconds

Make it feel like a complete news article.
```

### Prompt 3.5: Build Club Page (/app/club/[club]/page.tsx)

```
Create club-specific transfer pages:

1. Club Header:
   - Large team logo/banner
   - Team name, league
   - Link to official site
   - "Follow" button (localStorage)

2. Current Season Activity:
   - Recent transfers IN (last 5)
   - Recent transfers OUT (last 5)
   - Transfer targets (rumors)
   - Player departures

3. Trending Players:
   - Top 5 most discussed players at this club
   - By confidence + mention frequency

4. Club Stats:
   - Total spending this window
   - Net spend
   - Top target club (where their players are going)
   - Top source club (where they're buying from)

5. News Feed:
   - All transfers related to this club
   - Infinite scroll

6. SEO:
   - Title: "[Club Name] Transfer News & Rumors"
   - Description: "Latest transfer news for [Club]"
   - Schema: LocalBusiness + Team schema

Make it a dedicated hub for fans of specific clubs.
```

### Prompt 3.6: Build Player Page (/app/player/[player]/page.tsx)

```
Create player-specific pages:

1. Player Profile Card:
   - Avatar image (from TheSportsDB)
   - Player name, age, position
   - Current club
   - International team (if applicable)

2. Transfer History Timeline:
   - Visual timeline of all transfers
   - Current club highlighted
   - Clubs they've been to
   - Dates and fees (if available)

3. Current Transfer Rumors:
   - Latest news about this player
   - Target clubs
   - Confidence scores
   - Timeline

4. Player Stats (from TheSportsDB):
   - Position, height, weight
   - Current team
   - International appearances
   - Career achievements

5. Related News:
   - All transfers mentioning this player
   - Sorted by date

6. SEO:
   - Title: "[Player Name] Transfer News & Rumors"
   - Canonical URL with player name standardized

Make it a fan's go-to page for specific players.
```

### Prompt 3.7: Build Search Page (/app/search/page.tsx)

```
Create search results page:

1. Search Bar:
   - Large, prominent search input
   - Real-time suggestions as you type
   - Filters (By Player, By Club, By Date, By Confidence)

2. Results Display:
   - Grid of matching transfers
   - Show relevance score
   - Filter refinement options
   - Sort: Relevance, Newest, Confidence, Trending

3. Empty State:
   - "No results found" message
   - Suggestions: "Try searching for..."
   - Popular searches

4. Client-side Search:
   - Load all transfers once on page load
   - Filter in browser (fast, no latency)
   - Highlight matching terms

5. SEO:
   - Title: "Search Transfer News"
   - Meta robots: noindex (optional: prevent duplicate indexing)

Make search fast and intuitive.
```

### Prompt 3.8: Styling & Theme

```
Configure Tailwind CSS for football transfer news:

1. Color Scheme:
   - Primary: Blue (#0066cc - football neutral)
   - Secondary: Orange (#ff6600 - accent)
   - Success: Green (#22c55e - confirmed)
   - Warning: Orange (#f59e0b - rumor)
   - Danger: Red (#ef4444 - unlikely)
   - Gray: Proper gray scale for text

2. Dark Mode:
   - Dark background (#111827)
   - Light text (#f3f4f6)
   - Cards: #1f2937
   - Borders: #374151
   - Toggle in header

3. Typography:
   - Headings: Bold, 1.5x line height
   - Body: Regular, 1.6x line height
   - Small text: Gray, slightly smaller
   - Links: Primary color, underline on hover

4. Components:
   - Buttons: Hover effects, disabled states
   - Forms: Proper spacing, error states
   - Cards: Shadow on hover, rounded corners
   - Badges: Inline, colored

5. Spacing:
   - Use 4px base unit
   - Consistent gaps between sections
   - Proper padding inside components

6. Responsive Breakpoints:
   - Mobile: <640px
   - Tablet: 640px-1024px
   - Desktop: >1024px

Make it feel modern, sporty, and professional (like Bleacher Report or ESPN).
```

---

## PHASE 4: SEO & STRUCTURED DATA
**Duration: 3-4 hours**

### Prompt 4.1: Implement Next.js Metadata API

```
Setup metadata across all pages:

1. /app/layout.tsx (Base metadata):
   - Default title template
   - Default description
   - OG tags (site-wide)
   - Twitter tags
   - Verification meta tags (Google Search Console)
   - Viewport, charset

2. /app/page.tsx (Homepage):
   - Title: "Football Transfer News Hub | Latest Verified Rumors & Updates"
   - Description: "Real-time football transfer news from verified sources. Track player movements, club targets, and the hottest transfer rumors."
   - Keywords: (as comment)
   - OG image: Hero image or generated
   - Canonical: https://yoursite.com

3. /app/transfer/[slug]/page.tsx (Dynamic):
   - Dynamic title from transfer data
   - Dynamic description from summary
   - Dynamic OG image (generated with @vercel/og)
   - Canonical URL with slug

4. /app/club/[club]/page.tsx:
   - Title: "[Club] Transfer News & Rumors"
   - Description: Auto-generated from club data

5. /app/player/[player]/page.tsx:
   - Title: "[Player] Transfer News & Rumors"
   - Description: Auto-generated from player data

6. Format for all:
   - 50-60 character titles
   - 150-160 character descriptions
   - Include primary keyword naturally

Implementation pattern:
export const metadata: Metadata = {
  title: '...',
  description: '...',
  openGraph: {
    title: '...',
    description: '...',
    image: '...',
    url: '...',
  },
  twitter: {
    card: 'summary_large_image',
    title: '...',
    description: '...',
    image: '...',
  },
}
```

### Prompt 4.2: Dynamic OG Image Generation with @vercel/og

```
Create /app/api/og/route.ts for dynamic OG images:

1. Generate social card image for each transfer:
   - Player image (left side)
   - Club logos (center)
   - Headline (top)
   - Confidence score (badge)
   - Source (small text, bottom)

2. URL parameters:
   - /api/og?player=Haaland&from=Man City&to=Real Madrid&confidence=8

3. Image specs:
   - Size: 1200x630px (standard for social)
   - Format: PNG
   - Font: Bold for headline
   - Colors: Match site theme

4. Fallback if images not available:
   - Colored background with text
   - Brand logo
   - Clean typography

5. Integration:
   - Use in transfer detail pages
   - Reference in OG metadata:
     openGraph: {
       image: `/api/og?player=...&from=...&to=...`
     }

6. Performance:
   - Cache OG images (1 hour)
   - Use Vercel's image optimization

Make OG images shareable and attractive.
```

### Prompt 4.3: Structured Data & JSON-LD

```
Create /lib/structured-data.ts with JSON-LD schemas:

1. NewsArticle Schema (for each transfer):
```json
{
  "@context": "https://schema.org",
  "@type": "NewsArticle",
  "headline": "Haaland Transfer News",
  "description": "...",
  "image": [...],
  "datePublished": "2026-06-05",
  "dateModified": "2026-06-05",
  "author": {
    "@type": "Organization",
    "name": "Transfer News Hub"
  },
  "publisher": {
    "@type": "Organization",
    "name": "Transfer News Hub",
    "logo": {
      "@type": "ImageObject",
      "url": "..."
    }
  },
  "mainEntityOfPage": "https://..."
}
```

2. Organization Schema (for homepage):
   - Name: "Football Transfer News Hub"
   - Logo
   - Contact point
   - Social profiles

3. BreadcrumbList Schema:
   - Home > Clubs > [Club] > [Transfer]
   - Home > Players > [Player]
   - Implement on all nested pages

4. FAQPage Schema:
   - Create /app/faq.tsx with common questions
   - "What is a transfer?"
   - "How accurate are these rumors?"
   - "Where do you get your data?"

5. Functions:
   - generateTransferSchema(transfer)
   - generateClubSchema(club)
   - generatePlayerSchema(player)
   - generateBreadcrumbSchema(breadcrumbs)

6. Validation:
   - Google Rich Results Test pass
   - No errors in Search Console

Integrate schemas into pages systematically.
```

### Prompt 4.4: Generate Dynamic Sitemap

```
Create /app/sitemap.ts:

Generate XML sitemap that includes:

1. Static URLs:
   - Homepage
   - /search
   - /about
   - /privacy
   - /terms
   - /contact

2. Dynamic URLs:
   - All transfers: /transfer/[slug] (100+ URLs)
   - All clubs: /club/[club] (20+ URLs)
   - All players: /player/[player] (100+ URLs)

3. Sitemap structure:
   <?xml version="1.0" encoding="UTF-8"?>
   <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
     <url>
       <loc>https://...</loc>
       <lastmod>2026-06-05</lastmod>
       <priority>1.0</priority>
       <changefreq>hourly</changefreq>
     </url>
   </urlset>

4. Priority levels:
   - Homepage: 1.0
   - Transfer pages: 0.8
   - Club/Player pages: 0.7
   - Other: 0.5

5. Change frequency:
   - Homepage: hourly (new transfers)
   - Transfer pages: weekly (when updated)
   - Club/Player: weekly
   - Static pages: monthly

6. Auto-generate from data:
   - Read latest transfers JSON
   - Read clubs from TheSportsDB
   - Read players from transfers
   - Update daily

Implementation:
export async function GET() {
  const sitemap = generateSitemap(transfers, clubs, players)
  return new Response(sitemap, {
    headers: { 'Content-Type': 'application/xml' },
  })
}
```

### Prompt 4.5: Create robots.txt

```
Create /public/robots.txt:

```
User-agent: *
Allow: /

# Disallow private/admin areas
Disallow: /api/
Disallow: /admin/
Disallow: /.next/

# Allow crawling of important paths
Allow: /transfer/
Allow: /club/
Allow: /player/
Allow: /search

# Specify sitemap
Sitemap: https://yoursite.com/sitemap.xml

# Crawl delay (optional, be generous)
Crawl-delay: 1
```

Make sure it allows all public content.
```

### Prompt 4.6: Performance Optimization for SEO

```
Optimize for Core Web Vitals:

1. Largest Contentful Paint (LCP) < 2.5s:
   - Optimize images (WebP, lazy loading)
   - Load JavaScript asynchronously
   - Use static generation where possible (ISR)
   - Preload critical resources

2. First Input Delay (FID) < 100ms:
   - Minimize JavaScript
   - Use code splitting
   - Defer non-critical scripts
   - Use Web Workers for heavy processing

3. Cumulative Layout Shift (CLS) < 0.1:
   - Reserve space for images (width/height)
   - Avoid inserting content above existing content
   - Use font-display: swap
   - Avoid animations that cause layout shifts

Implementation:
- Image optimization: Use next/image with sizes prop
- Dynamic imports: React.lazy() for components
- CSS optimization: Extract critical CSS
- Minify and compress: Handled by Next.js
- Remove render-blocking resources
- Enable GZIP compression (Vercel default)

Audit with Lighthouse and ensure 90+ score.
```

---

## PHASE 5: AUTOMATION & VERCEL CRON
**Duration: 2-3 hours**

### Prompt 5.1: Configure Vercel Cron Jobs

```
Create /vercel.json with automated tasks:

{
  "crons": [{
    "path": "/api/cron/refresh-feeds",
    "schedule": "*/30 * * * *"
  }, {
    "path": "/api/cron/process-transfers",
    "schedule": "0 * * * *"
  }, {
    "path": "/api/cron/update-players",
    "schedule": "0 */6 * * *"
  }, {
    "path": "/api/cron/cleanup",
    "schedule": "0 0 * * *"
  }]
}

Explanation:
- Every 30 min: Refresh RSS feeds
- Every 1 hour: Process transfers with Claude
- Every 6 hours: Update player data from TheSportsDB
- Every day at midnight: Archive and cleanup

Security:
- Add header verification (X-Vercel-Cron token)
- Log all executions
- Email alerts on failures

Test locally with: node node_modules/vercel/bin/vercel.js cron list
```

### Prompt 5.2: Create Refresh Feeds Cron API

```
Create /app/api/cron/refresh-feeds/route.ts:

This endpoint runs every 30 minutes to refresh all RSS feeds.

1. Verify request is from Vercel:
   - Check X-Vercel-Cron header
   - Verify CRON_SECRET from env

2. Fetch all 8 feeds in parallel:
   - Use Promise.all() for speed
   - Timeout: 25 seconds (Vercel limit 60s, be safe)

3. Parse feeds:
   - Extract: title, description, image, pubDate, URL
   - Filter: Football transfer content only
   - Deduplicate: Against existing transfers

4. New transfers:
   - Send to Phase 2.2 processor (Claude)
   - Don't save directly

5. Logging:
   - Log success/failure
   - Save to /data/feeds-status.json:
     {
       "feedName": "Sky Sports",
       "status": "success|error",
       "count": 25,
       "lastRun": "2026-06-05T10:30:00Z",
       "nextRun": "2026-06-05T11:00:00Z"
     }

6. Error handling:
   - If feed fails: Mark as down, continue
   - Retry logic: Exponential backoff
   - Email alert if >3 failures

7. Response:
   {
     "success": true,
     "feedsProcessed": 8,
     "itemsFound": 150,
     "newTransfers": 45,
     "nextRun": "..."
   }

Make it fast and reliable.
```

### Prompt 5.3: Create Process Transfers Cron API

```
Create /app/api/cron/process-transfers/route.ts:

This endpoint runs every hour to process new transfers with Claude.

1. Get unprocessed transfers from a queue
   - Read from /data/transfers-queue.json
   - Contains raw feed items

2. For each transfer (up to 15 due to rate limit):
   - Call Claude processor (Phase 2.2)
   - Generate: summary, entities, confidence, headlines

3. Save processed transfers:
   - Write to /data/transfers-latest.json
   - Update timestamps
   - Generate slug from title

4. Rate limiting:
   - Claude: 15 req/min max
   - Spread over 60 seconds
   - Queue remaining for next hour

5. Logging:
   - Log processed count
   - Save to /data/process-log.json

6. Error handling:
   - If Claude fails: Requeue for next hour
   - Exponential backoff on rate limit

7. Response:
   {
     "success": true,
     "processed": 15,
     "queued": 30,
     "failed": 0,
     "nextRun": "..."
   }

Keep this optimized for Claude's rate limits.
```

### Prompt 5.4: Create Update Players Cron API

```
Create /app/api/cron/update-players/route.ts:

This endpoint runs every 6 hours to sync TheSportsDB data.

1. Get all players mentioned in recent transfers
2. For each player:
   - Check TheSportsDB for latest data
   - Get: image, position, age, club, stats

3. Store player metadata:
   - Create /data/players-metadata.json
   - Include: id, name, image, position, club, lastUpdated

4. Error handling:
   - Skip if TheSportsDB fails (not critical)
   - Use cached data as fallback

5. Response:
   {
     "success": true,
     "playersUpdated": 50,
     "imagesRefreshed": 48
   }

This enriches transfers with player images & stats.
```

### Prompt 5.5: Create Cleanup Cron API

```
Create /app/api/cron/cleanup/route.ts:

This endpoint runs daily at midnight UTC to archive and cleanup.

1. Archive old transfers (>30 days):
   - Move to /data/transfers-archive.json
   - Compress with gzip (optional)

2. Compress data files:
   - Remove processed queue
   - Keep last 7 days of logs
   - Delete temp files

3. Generate daily report:
   - Save to /data/reports/2026-06-05.json
   - Include: transfers added, sources active, feeds status

4. Validate data integrity:
   - Check for corrupt JSON
   - Validate all schemas
   - Fix issues if possible

5. Backup (optional):
   - Upload latest.json to external storage (Vercel KV)
   - Keep 7-day rolling backup

6. Email report:
   - Send daily summary to admin email
   - Include: new transfers, errors, system health

7. Response:
   {
     "success": true,
     "archived": 500,
     "logsCompressed": true,
     "backupCreated": true
   }

Make it a comprehensive maintenance routine.
```

---

## PHASE 6: GOOGLE ADSENSE & MONETIZATION
**Duration: 2-3 hours**

### Prompt 6.1: Create Compliance Pages

```
Create compliance pages required by Google AdSense:

1. /app/privacy/page.tsx (Privacy Policy):
   - GDPR compliant
   - Data collection practices
   - Cookie usage
   - Third-party services (Analytics, AdSense)
   - User rights
   - Contact info for data requests
   - ~800-1000 words

2. /app/terms/page.tsx (Terms of Service):
   - Site usage terms
   - Liability disclaimers
   - Content ownership
   - User responsibilities
   - Termination clause
   - ~600-800 words

3. /app/contact/page.tsx (Contact Page):
   - Contact form (name, email, message)
   - Email address
   - Business hours (if applicable)
   - Social media links

4. /app/about/page.tsx (About):
   - What is this site?
   - Our mission
   - Data sources
   - Team info (optional: "Created by you")
   - ~400-600 words

5. Disclaimers:
   - Add to footer: "This site contains affiliate links"
   - Add to transfer cards: "Unverified rumor" vs "Confirmed"
   - Add to sidebar: "For entertainment purposes"

6. Generate with AI-friendly headers:
   - Use semantic HTML (h1, h2, p)
   - Include schema markup (FAQPage for Privacy)
   - Make readable by search engines

Templates provided or AI-generated.
```

### Prompt 6.2: Implement Cookie Consent Banner

```
Create /components/CookieConsent.tsx:

1. Banner display:
   - Appears on first visit (localStorage: cookieConsent)
   - Shows at bottom of page
   - "We use cookies to improve your experience"

2. Consent options:
   - "Accept All" button
   - "Reject All" button
   - "Customize" link (shows cookie settings)

3. Cookie types:
   - Essential (always on): Site functionality
   - Analytics (optional): Google Analytics
   - Marketing (optional): AdSense tracking

4. Privacy link:
   - Link to /privacy in banner

5. GDPR Compliance:
   - Store consent in localStorage
   - Only load GA4 if user accepts
   - Only load AdSense if user accepts

6. Customize modal:
   - Toggle each cookie type
   - "Save preferences" button
   - Show cookie details/duration

7. Re-consent:
   - Add "Cookie settings" link in footer
   - Allow users to change preferences

Implementation:
- Use useEffect hook
- Check localStorage for consent
- Lazy load GA4 and AdSense scripts based on consent

This is required for GDPR compliance and AdSense approval.
```

### Prompt 6.3: AdSense Implementation

```
Create /components/AdSense.tsx for ad integration:

1. Verify code from Google AdSense (after approval):
   - Get your publisher ID: ca-pub-xxxxxxxxxx
   - Save to .env: NEXT_PUBLIC_ADSENSE_ID

2. Create ad component:
   interface AdSenseProps {
     slot: string // Ad slot ID
     format?: 'rectangle' | 'horizontal' | 'vertical'
   }

   export function AdSense({ slot, format = 'rectangle' }) {
     return (
       <script async src="..." />
     )
   }

3. Ad placements strategy:
   - Homepage:
     * Above-the-fold: 300x250 rectangle
     * Sidebar: 300x600 half-page
     * Below footer: 970x90 leaderboard
   
   - Transfer detail page:
     * Top of article: 728x90
     * Mid-article: 300x250
     * Bottom: 300x250
   
   - Don't over-ad: Max 3 units per page

4. Responsive ads:
   - Use auto format for mobile
   - Test on different screen sizes

5. Performance:
   - Load AdSense async
   - Don't block page render
   - Respect user consent (cookie banner)

6. Testing:
   - Use Google AdSense preview mode
   - Don't click your own ads
   - Monitor for policy violations

Implementation includes proper async loading and consent checks.
```

### Prompt 6.4: Google Analytics 4 Integration

```
Create /lib/analytics.ts:

1. Initialize GA4:
   - Get Measurement ID from Google Analytics
   - Save to .env: NEXT_PUBLIC_GA_ID

2. Add to /app/layout.tsx:
   <Script
     src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
     strategy="afterInteractive"
   />
   <Script
     dangerouslySetInnerHTML={{
       __html: `
         window.dataLayer = window.dataLayer || [];
         function gtag(){dataLayer.push(arguments);}
         gtag('js', new Date());
         gtag('config', '${GA_ID}', {
           page_path: window.location.pathname,
         });
       `
     }}
     strategy="afterInteractive"
   />

3. Track custom events:
   - transfer_viewed: When user views transfer detail
   - transfer_shared: When user shares transfer
   - search_performed: When user searches
   - newsletter_signup: When user subscribes
   - ad_impression: Track ad impressions

4. Create tracking functions (/lib/analytics.ts):
   - trackEvent(eventName, params)
   - trackPageView(path)
   - trackConversion()

5. Ensure:
   - Respect user consent (only track if accepted)
   - GDPR compliant
   - Not tracking PII

6. Monitor in GA4 Dashboard:
   - Traffic sources
   - User behavior
   - Conversion funnel
   - Ad performance (cross-reference with AdSense)

Provides data for optimization.
```

### Prompt 6.5: AdSense Approval Checklist

```
Create /docs/ADSENSE_CHECKLIST.md:

Before applying for AdSense:

✅ Content Quality
- [ ] 50+ unique, original articles (NOT copied)
- [ ] No Wikipedia or duplicate content
- [ ] Articles are 500+ words each
- [ ] Proper research and sourcing
- [ ] Professional writing quality

✅ Site Requirements
- [ ] Domain purchased (not subdomain)
- [ ] 15,000+ monthly sessions (estimated)
- [ ] Mobile responsive design
- [ ] Page speed: 90+ Lighthouse score
- [ ] HTTPS enabled (SSL certificate)

✅ Compliance Pages
- [ ] Privacy Policy (GDPR compliant)
- [ ] Terms of Service
- [ ] About page
- [ ] Contact page / Contact form

✅ Prohibited Content
- [ ] No adult content
- [ ] No violence or weapons
- [ ] No gambling or betting
- [ ] No hate speech
- [ ] No copyright infringement
- [ ] No malware or hacking content
- [ ] No fake news / misinformation

✅ Policy Compliance
- [ ] No excessive ads in content
- [ ] No click-baiting headlines
- [ ] No misleading content
- [ ] No keyword stuffing
- [ ] Proper disclosure of affiliate links
- [ ] Cookie consent banner
- [ ] No hidden content behind ads

✅ Traffic Requirements
- [ ] Google Search Console verified
- [ ] Sitemap submitted
- [ ] Robots.txt configured
- [ ] 15K-20K monthly sessions (realistic)
- [ ] Consistent traffic growth
- [ ] User engagement metrics good

✅ Monetization Setup
- [ ] Ad units placed strategically
- [ ] Responsive ads implemented
- [ ] Analytics tracking enabled
- [ ] AdSense code ready to integrate

Timeline:
- Months 1-2: Build traffic to 2K sessions
- Months 3-4: Reach 8K sessions, prepare content
- Months 5-6: Reach 15K+ sessions, apply for AdSense
- Weeks after: AdSense approval (typically 1-4 weeks)

Approval signals:
- Unique, original content
- Professional design
- Proper business pages
- Compliance with all policies
- Established traffic (15K+)
```

---

## FINAL INTEGRATION PROMPT
**Use when starting implementation**

```
I'm ready to build the Football Transfer Hub.

I've reviewed all 6 phases and understand:
- Phase 1: Next.js setup (2-3 hours)
- Phase 2: RSS + Claude data pipeline (4-5 hours)
- Phase 3: Frontend UI and components (5-6 hours)
- Phase 4: SEO and structured data (3-4 hours)
- Phase 5: Vercel Cron automation (2-3 hours)
- Phase 6: AdSense setup and compliance (2-3 hours)

Total build time: 18-24 hours (or 3-4 days full-time)

Let's start with Phase 1. I'm in VS Code and ready to run commands.

Provide:
1. Exact npm/yarn commands to initialize the project
2. File structure to create
3. Configuration files (next.config.js, tsconfig.json, etc)
4. First-time setup verification steps

After Phase 1 is complete, I'll move to Phase 2.
```

---

**END OF CLAUDE COPILOT PROMPTS**

These prompts are designed to be copied directly into GitHub Copilot Chat in VS Code.
Each one is self-contained and can be used independently or in sequence.

For best results:
1. Start with "MASTER BUILD CONTEXT PROMPT" to set up the context
2. Use phase-specific prompts in order (Phase 1 → Phase 6)
3. Within each phase, follow the numbered prompts sequentially
4. After each phase, verify the output before moving to the next phase
