// Renders each Android launcher mipmap straight from the icon SVG at its exact
// pixel size, so the text is vector-crisp at every density (no resampling).
//   node scripts/make-android-icons.mjs
//
// Adaptive layers are 108dp full-bleed — the anydpi-v26 XMLs keep their 16.7%
// inset. Legacy icons are 48dp; the round one gets a circular alpha mask.
import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
// sharp is a transitive dep of @vite-pwa/assets-generator, not hoisted by pnpm
import sharp from '../node_modules/.pnpm/sharp@0.33.5/node_modules/sharp/lib/index.js';
import { ANDROID_GRID, gridSvg, solidSvg } from './icon-svg.mjs';

const RES = new URL('../android/app/src/main/res/', import.meta.url);
const DENSITIES = { ldpi: 0.75, mdpi: 1, hdpi: 1.5, xhdpi: 2, xxhdpi: 3, xxxhdpi: 4 };
const ADAPTIVE_DP = 108;
const LEGACY_DP = 48;

const render = (svg) => sharp(Buffer.from(svg)).png().toBuffer();
const grid = (size, background) =>
  gridSvg({ size, span: size * ANDROID_GRID.span, fontRatio: ANDROID_GRID.fontRatio, background });
const circleMask = (size) =>
  Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}"><circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="#fff"/></svg>`,
  );

for (const [density, factor] of Object.entries(DENSITIES)) {
  const adaptive = Math.round(ADAPTIVE_DP * factor);
  const legacy = Math.round(LEGACY_DP * factor);
  const files = {
    'ic_launcher_foreground.png': await render(grid(adaptive)),
    'ic_launcher_background.png': await render(solidSvg(adaptive)),
    'ic_launcher.png': await render(grid(legacy, '#0a0a0a')),
    'ic_launcher_round.png': await sharp(await render(grid(legacy, '#0a0a0a')))
      .composite([{ input: circleMask(legacy), blend: 'dest-in' }])
      .png()
      .toBuffer(),
  };
  for (const [name, buffer] of Object.entries(files)) {
    await writeFile(fileURLToPath(new URL(`mipmap-${density}/${name}`, RES)), buffer);
    console.log(`mipmap-${density}/${name}`);
  }
}
