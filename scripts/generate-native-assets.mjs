import { mkdir, writeFile } from 'node:fs/promises';
// sharp is a transitive dep of @vite-pwa/assets-generator, not hoisted by pnpm
import sharp from '../node_modules/.pnpm/sharp@0.33.5/node_modules/sharp/lib/index.js';
import { ANDROID_GRID, gridSvg, solidSvg } from './icon-svg.mjs';

await mkdir('assets', { recursive: true });

const outputs = [
  // Full-bleed square: OS applies its own corner mask
  ['icon-only.png', gridSvg({ size: 1_024, span: 760, background: '#0a0a0a' })],
  // Android adaptive layers: glyph corners (not the grid box) sized to the 66dp safe zone
  ['icon-foreground.png', gridSvg({ size: 1_024, span: 1_024 * ANDROID_GRID.span, fontRatio: ANDROID_GRID.fontRatio })],
  ['icon-background.png', solidSvg(1_024)],
  ['splash.png', gridSvg({ size: 2_732, span: 620, background: '#0a0a0a' })],
  ['splash-dark.png', gridSvg({ size: 2_732, span: 620, background: '#0a0a0a' })],
];

for (const [name, svg] of outputs) {
  await writeFile(`assets/${name}`, await sharp(Buffer.from(svg), { density: 300 }).png().toBuffer());
  console.log(`assets/${name} OK`);
}
