import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

// Turns a folder of numbered frames (a render's PNG sequence) into the WebP frames a
// suite page scrolls through: 000.webp, 001.webp and so on, in the frames' own order.
//
//   node scripts/import-sequence.mjs <folder of frames> public/suites/<name>
//
// Then give the tab a `sequence:` with that folder and the number of frames printed here.
const WEBP_QUALITY = 80;

const [source, target] = process.argv.slice(2);
if (!source || !target) {
  console.error("usage: node scripts/import-sequence.mjs <folder of frames> <folder to write>");
  process.exit(1);
}

function formatBytes(n) {
  if (n > 1024 * 1024) return (n / 1024 / 1024).toFixed(2) + " MB";
  if (n > 1024) return (n / 1024).toFixed(1) + " KB";
  return n + " B";
}

const frames = (await fs.readdir(source))
  .filter((f) => /\.(png|jpe?g|tiff?)$/i.test(f))
  .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

await fs.mkdir(target, { recursive: true });

let before = 0;
let after = 0;
for (const [n, frame] of frames.entries()) {
  const file = path.join(source, frame);
  before += (await fs.stat(file)).size;
  const { size } = await sharp(file)
    .webp({ quality: WEBP_QUALITY, effort: 5 })
    .toFile(path.join(target, `${String(n).padStart(3, "0")}.webp`));
  after += size;
}

console.log(`${frames.length} frames → ${target}`);
console.log(`${formatBytes(before)} → ${formatBytes(after)}`);
