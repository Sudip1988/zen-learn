/**
 * Run after npm install: node scripts/generate-icons.js
 * Requires: npm install --save-dev sharp
 */
import sharp from "sharp";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const src = join(__dirname, "../public/icons/icon-source.svg");
const out = join(__dirname, "../public/icons");

const sizes = [
  { name: "icon-192.png", size: 192 },
  { name: "icon-512.png", size: 512 },
  { name: "icon-512-maskable.png", size: 512 },
];

for (const { name, size } of sizes) {
  await sharp(src).resize(size, size).png().toFile(join(out, name));
  console.log(`✓ Generated ${name}`);
}
console.log("Icons generated in public/icons/");
