// Rasterizes an oversized flag-icons SVG to a PNG for the settings language picker.
// Some flags are mostly heraldry that is invisible at the 24x18 the picker draws: rs.svg
// is 182 KB of double-headed eagle. A small PNG is a couple of KB, indistinguishable at
// 24px, and cheap enough that Vite inlines it as a data URI (D51).
//   node scripts/render-flag-png.mjs rs es@6
//
// Scale defaults to 3x; append @N for more detail. Keep the output under 4096 B or Vite
// emits it as a separate file instead of inlining it. Output is committed, not built.
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { chromium } from 'playwright';

const DEFAULT_SCALE = 3;
const INLINE_LIMIT = 4096;
const WIDTH = 24;
const HEIGHT = 18;
const SRC_DIR = new URL('../node_modules/flag-icons/flags/4x3/', import.meta.url);
const OUT_DIR = new URL('../src/settings/flags/', import.meta.url);

const codes = process.argv.slice(2);
if (codes.length === 0) {
  console.error('usage: node scripts/render-flag-png.mjs <code[@scale]> [code[@scale]...]');
  process.exit(1);
}

await mkdir(OUT_DIR, { recursive: true });
const browser = await chromium.launch();

for (const arg of codes) {
  const [code, rawScale] = arg.split('@');
  const scale = Number(rawScale ?? DEFAULT_SCALE);
  if (!Number.isFinite(scale) || scale < 1) throw new Error(`bad scale in "${arg}"`);

  const svg = await readFile(new URL(`${code}.svg`, SRC_DIR));
  const uri = `data:image/svg+xml;base64,${svg.toString('base64')}`;

  const page = await browser.newPage({
    viewport: { width: WIDTH, height: HEIGHT },
    deviceScaleFactor: scale,
  });
  await page.setContent(
    `<body style="margin:0"><img src="${uri}" style="width:${WIDTH}px;height:${HEIGHT}px;display:block"></body>`,
  );
  await page.waitForLoadState('load');
  const png = await page.screenshot({ type: 'png' });
  await page.close();

  await writeFile(new URL(`${code}.png`, OUT_DIR), png);
  const saved = (100 - (100 * png.length) / svg.length).toFixed(1);
  console.log(
    `${code}: ${svg.length.toLocaleString()} B svg -> ${png.length.toLocaleString()} B png ` +
      `(${WIDTH * scale}x${HEIGHT * scale} @${scale}x, -${saved}%)` +
      (png.length < INLINE_LIMIT ? '' : `  WARNING: over ${INLINE_LIMIT} B, will be emitted as a file`),
  );
}

await browser.close();
