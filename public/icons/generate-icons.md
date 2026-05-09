# PWA Icon Generation

You need three PNG icons in this folder:
- `icon-192.png` — 192×192 pixels
- `icon-512.png` — 512×512 pixels
- `icon-512-maskable.png` — 512×512 pixels (content within centre 80% of canvas)

## Quick generation options

### Option A — Online tool (recommended)
1. Go to https://realfavicongenerator.net or https://favicon.io
2. Upload any square image (your logo or a placeholder)
3. Download and rename to the three filenames above
4. Place them in this folder

### Option B — Node.js script (after npm install)
```bash
node scripts/generate-icons.js
```

### Option C — Use the SVG source
The file `icon-source.svg` in this folder can be converted with:
```bash
npx sharp-cli -i icon-source.svg -o icon-192.png resize 192 192
npx sharp-cli -i icon-source.svg -o icon-512.png resize 512 512
npx sharp-cli -i icon-source.svg -o icon-512-maskable.png resize 512 512
```

> The app will work without icons in development. Icons are only required for PWA installability.
