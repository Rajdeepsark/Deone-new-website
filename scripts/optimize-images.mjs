import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const PUBLIC_DIR = path.resolve("public");
const JPG_QUALITY = 82;
const WEBP_QUALITY = 80;

const isJpg = (f) => /\.jpe?g$/i.test(f);

async function* walk(dir) {
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(p);
    else yield p;
  }
}

function formatBytes(n) {
  if (n > 1024 * 1024) return (n / 1024 / 1024).toFixed(2) + " MB";
  if (n > 1024) return (n / 1024).toFixed(1) + " KB";
  return n + " B";
}

async function optimizeOne(file) {
  const before = (await fs.stat(file)).size;

  // Read into buffer FIRST to release the file handle before sharp processes
  const input = await fs.readFile(file);

  const jpgBuf = await sharp(input)
    .jpeg({ quality: JPG_QUALITY, mozjpeg: true, progressive: true })
    .toBuffer();
  await fs.writeFile(file, jpgBuf);
  const afterJpg = jpgBuf.length;

  const webpBuf = await sharp(input)
    .webp({ quality: WEBP_QUALITY, effort: 5 })
    .toBuffer();
  const webpPath = file.replace(/\.jpe?g$/i, ".webp");
  await fs.writeFile(webpPath, webpBuf);
  const afterWebp = webpBuf.length;

  return { file, before, afterJpg, afterWebp };
}

const results = [];
for await (const f of walk(PUBLIC_DIR)) {
  if (!isJpg(f)) continue;
  try {
    const r = await optimizeOne(f);
    results.push(r);
    const savedJpg = 100 - (r.afterJpg / r.before) * 100;
    const savedWebp = 100 - (r.afterWebp / r.before) * 100;
    console.log(
      `${path.relative(PUBLIC_DIR, f).padEnd(38)}  ${formatBytes(r.before).padStart(10)} → jpg ${formatBytes(
        r.afterJpg
      ).padStart(10)} (−${savedJpg.toFixed(0)}%)  webp ${formatBytes(r.afterWebp).padStart(10)} (−${savedWebp.toFixed(0)}%)`
    );
  } catch (e) {
    console.error(`FAILED ${f}:`, e.message);
  }
}

const totalBefore = results.reduce((s, r) => s + r.before, 0);
const totalAfterJpg = results.reduce((s, r) => s + r.afterJpg, 0);
const totalAfterWebp = results.reduce((s, r) => s + r.afterWebp, 0);
console.log("\n=== totals ===");
console.log(`before:      ${formatBytes(totalBefore)}`);
console.log(`after JPG:   ${formatBytes(totalAfterJpg)}  (−${(100 - (totalAfterJpg / totalBefore) * 100).toFixed(0)}%)`);
console.log(`WebP total:  ${formatBytes(totalAfterWebp)}  (−${(100 - (totalAfterWebp / totalBefore) * 100).toFixed(0)}% vs orig)`);
