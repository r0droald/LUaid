import { readdirSync, statSync } from "node:fs";
import { resolve, dirname, extname, basename } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const photoDir = resolve(__dirname, "..", "public", "demo-hazards");

const MAX_WIDTH = 1000;
const JPEG_QUALITY = 72;

function kb(bytes: number): string {
  return `${(bytes / 1024).toFixed(0)}KB`;
}

async function compress(filePath: string): Promise<void> {
  const before = statSync(filePath).size;
  const buffer = await sharp(filePath)
    .resize({ width: MAX_WIDTH, withoutEnlargement: true })
    .jpeg({ quality: JPEG_QUALITY, progressive: true, mozjpeg: true })
    .toBuffer();

  // Only write back if the savings are meaningful (>10%). Tiny shavings
  // come from JPEG re-encoding drift, not real compression gains.
  const savingsPct = (before - buffer.length) / before;
  if (savingsPct > 0.1) {
    const fs = await import("node:fs/promises");
    await fs.writeFile(filePath, buffer);
    console.log(`  ${basename(filePath)}: ${kb(before)} → ${kb(buffer.length)} ✓`);
  } else {
    console.log(`  ${basename(filePath)}: ${kb(before)} (already compressed, skipping)`);
  }
}

async function main(): Promise<void> {
  const files = readdirSync(photoDir)
    .filter((f) => extname(f).toLowerCase() === ".jpg" || extname(f).toLowerCase() === ".jpeg")
    .map((f) => resolve(photoDir, f));

  if (files.length === 0) {
    console.log(`No JPEGs found in ${photoDir}`);
    return;
  }

  console.log(`Compressing ${files.length} hazard photo(s)…`);
  for (const file of files) {
    await compress(file);
  }
  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
