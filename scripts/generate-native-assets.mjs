import { mkdir, writeFile } from 'node:fs/promises';
// sharp is a transitive dep of @vite-pwa/assets-generator, not hoisted by pnpm
import sharp from '../node_modules/.pnpm/sharp@0.33.5/node_modules/sharp/lib/index.js';

const ROWS = ['ARTOF', 'HOURS', 'WORDS', 'LIGHT', 'CLOCK'];
const isLit = (r, c) => (r === 0 && c <= 2) || (r === 2 && c <= 3) || r === 4;

// Same geometry as public/icon.svg, parameterized by canvas size and grid span
function gridSvg({ size, span, background }) {
  const pad = (size - span) / 2;
  const cw = span / 5;
  const fs = cw * (55 / 76);
  let cells = '';
  ROWS.forEach((row, r) =>
    [...row].forEach((ch, c) => {
      const x = (pad + (c + 0.5) * cw).toFixed(1);
      const y = (pad + (r + 0.5) * cw + fs * 0.35).toFixed(1);
      const opacity = isLit(r, c) ? '' : ' fill="#d2ccb6" fill-opacity="0.32"';
      cells += `<text x="${x}" y="${y}" font-size="${fs.toFixed(1)}"${opacity}>${ch}</text>`;
    }),
  );
  const bg = background ? `<rect width="${size}" height="${size}" fill="${background}"/>` : '';
  // Bi-metal (logo E): lit letters gold, dim letters platinum
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">${bg}<g font-family="Helvetica, Arial, sans-serif" font-weight="500" text-anchor="middle" fill="#e8cc60">${cells}</g></svg>`;
}

const solidSvg = (size) => `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}"><rect width="${size}" height="${size}" fill="#0a0a0a"/></svg>`;

await mkdir('assets', { recursive: true });

const outputs = [
  // Full-bleed square: OS applies its own corner mask
  ['icon-only.png', gridSvg({ size: 1_024, span: 760, background: '#0a0a0a' })],
  // Android adaptive layers: grid kept inside the 66% safe zone
  ['icon-foreground.png', gridSvg({ size: 1_024, span: 560 })],
  ['icon-background.png', solidSvg(1_024)],
  ['splash.png', gridSvg({ size: 2_732, span: 620, background: '#0a0a0a' })],
  ['splash-dark.png', gridSvg({ size: 2_732, span: 620, background: '#0a0a0a' })],
];

for (const [name, svg] of outputs) {
  await writeFile(`assets/${name}`, await sharp(Buffer.from(svg), { density: 300 }).png().toBuffer());
  console.log(`assets/${name} OK`);
}
