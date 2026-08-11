# Player / club images drop folder

Drop image files here. The site auto-uses them as card backgrounds — **no code change needed**, just match the naming.

## Automated fetch (recommended)

`scripts/fetch-players.mjs` fills this folder from **Wikimedia Commons**, license-safe and automatic:

```bash
node scripts/fetch-players.mjs "Arsenal"    # one club (a batch)
node scripts/fetch-players.mjs all          # every club in scripts/rosters.json
node scripts/fetch-players.mjs Arsenal --dry --limit 5   # preview, no writes
node scripts/fetch-players.mjs --list       # list club keys
```

It searches each player, reads the file's license via the Commons API, **keeps only PD / CC0 / CC-BY / CC-BY-SA**, downloads, crops to a 16:9 card (face-safe top crop), renames to the player slug, and — for CC-BY(-SA) — writes the required credit into `src/data/imageCredits.json` automatically. Already-present files are skipped (re-run to resume; `--force` to overwrite). Squad lists live in `scripts/rosters.json` (edit as squads change, then re-run that club).

When no player photo matches a story, the card falls back to the club's **original emblem** (`public/crests/<slug>.svg`) — see `clubImage()` in `src/lib/images.ts`.

---

## Manual drop-in (also works)

## Naming (this is how the site matches them)

Name each file as the **player's name, lowercased, words joined by hyphens**, matching how the name appears in headlines:

```
jude-bellingham.jpg
kylian-mbappe.jpg
erling-haaland.jpg
```

- Extension: `.jpg`, `.jpeg`, `.png`, or `.webp`.
- The site slugifies the player name from each story and looks for a matching file here. Match = that photo becomes the card image.
- No match → falls back to a Pixabay generic football photo → then to vector art. The **club emblem always shows** in the card either way.

Club images work the same — name them by club slug (e.g. `real-madrid.jpg`) if you want a club fallback image.

## ⚠ Wikimedia Commons licensing — READ BEFORE UPLOADING

Only upload images whose licence is one of: **Public Domain, CC0, CC-BY, or CC-BY-SA**. On the file's Commons page, check the licence box.

- **PD / CC0** → no credit needed. Upload freely.
- **CC-BY / CC-BY-SA** → credit is **required**. Add an entry to `src/data/imageCredits.json` so the site shows the credit (see that file). Format:

```json
{
  "jude-bellingham": { "author": "Photographer Name", "license": "CC BY-SA 4.0", "url": "https://commons.wikimedia.org/wiki/File:..." }
}
```

- **Do NOT upload**: anything marked "non-free", "fair use", agency photos (Getty/PA/Reuters), or images with no clear licence. When unsure, skip it.

The site renders all credits on the `/credits` page automatically.
