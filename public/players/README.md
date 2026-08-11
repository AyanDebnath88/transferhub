# Player / club images drop folder

Drop image files here. The site auto-uses them as card backgrounds — **no code change needed**, just match the naming.

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
