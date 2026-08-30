// Renders the mandatory Play feature graphic (1024x500) and an Apple-style
// wide banner from the real app, so the face is a true render rather than art.
//   pnpm build && pnpm preview   (then, in another shell)
//   BASE_URL=http://localhost:4173 node scripts/shoot-feature-graphic.mjs
//
// Two passes: capture the live face, then compose it with the wordmark. Play
// crops this asset in some placements, so nothing that matters goes near an edge.
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const BASE_URL = process.env.BASE_URL ?? 'http://localhost:4173';
const OUT_DIR = new URL('../mockups/store/graphics/', import.meta.url);
const TMP_FACE = new URL('../mockups/store/graphics/.face.png', import.meta.url);

// Backdrop, scrim and accent are tuned per finish so the banner reads as one surface
const THEMES = {
  gold: {
    finishId: 'gold',
    background: 'linear-gradient(170deg, #2e2a25 0%, #211e1c 55%, #151312 100%)',
    scrim: 'linear-gradient(90deg, rgba(10,9,8,0) 38%, rgba(10,9,8,0.86) 66%, #0d0c0b 100%)',
    accent: '#d8b45f',
    tagline: '#b0aca6',
  },
  black: {
    finishId: 'deep-black',
    background: 'linear-gradient(170deg, #1d1d21 0%, #131315 55%, #0a0a0c 100%)',
    scrim: 'linear-gradient(90deg, rgba(9,9,11,0) 38%, rgba(9,9,11,0.86) 66%, #0a0a0c 100%)',
    accent: '#c2c6cc',
    tagline: '#a2a2a8',
  },
  red: {
    finishId: 'red-pepper',
    background: 'linear-gradient(170deg, #3a1216 0%, #290d10 55%, #170708 100%)',
    scrim: 'linear-gradient(90deg, rgba(23,7,8,0) 38%, rgba(23,7,8,0.86) 66%, #170708 100%)',
    accent: '#d97a7e',
    tagline: '#c09fa1',
  },
};

// black is the shipped v1 banner, so a bare run reproduces the canonical asset
const themeId = process.env.THEME ?? 'black';
const THEME = THEMES[themeId];
if (!THEME) throw new Error(`Unknown THEME "${themeId}" — expected ${Object.keys(THEMES).join(', ')}`);

const FACE_SETTINGS = {
  schemaVersion: 1,
  languageId: 'en',
  finishId: THEME.finishId,
  presentation: 'fullbleed',
  showItIs: true,
  dots: 'none',
  transition: 'instant',
  lightPlay: 'off',
  brightness: 1,
  keepAwake: true,
  dockMode: false,
  haptics: true,
};

const outId = themeId === 'black' ? 'play-feature-graphic' : `play-feature-graphic-${themeId}`;
const VARIANTS = [
  { id: outId, width: 1024, height: 500, scale: 1 },
  { id: `${outId}@2x`, width: 1024, height: 500, scale: 2 },
];

function faceInitScript() {
  return `
    localStorage.setItem('verba-settings', ${JSON.stringify(JSON.stringify(FACE_SETTINGS))});
    const Real = Date;
    const frozen = new Real(2026, 7, 22, 10, 30, 0);
    class Frozen extends Real {
      constructor(...args) { return args.length ? new Real(...args) : new Real(frozen); }
      static now() { return frozen.getTime(); }
    }
    window.Date = Frozen;
  `;
}

// Layered rather than side-by-side: pasting the face render as a hard rectangle
// against a different backdrop left a visible vertical seam, so the render is
// feathered out on its right edge over a matching base colour.
function composite(faceDataUri) {
  return `<!doctype html>
<html><head><meta charset="utf-8"><style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { width: 1024px; height: 500px; overflow: hidden; position: relative;
    background: ${THEME.background};
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
  .face { position: absolute; inset: 0 auto 0 0; height: 500px; width: 560px;
    display: flex; align-items: center; justify-content: center;
    -webkit-mask-image: linear-gradient(to right, #000 0%, #000 66%, transparent 100%);
    mask-image: linear-gradient(to right, #000 0%, #000 66%, transparent 100%); }
  .face img { height: 520px; }
  .scrim { position: absolute; inset: 0;
    background: ${THEME.scrim}; }
  .copy { position: absolute; right: 72px; top: 50%; transform: translateY(-50%); width: 380px; }
  h1 { font-size: 3.25rem; line-height: 1.02; letter-spacing: -0.03em; color: #f2f2f4; font-weight: 600; }
  h1 span { display: block; color: ${THEME.accent}; }
  p { margin-top: 1.1rem; font-size: 1.3125rem; line-height: 1.4; color: ${THEME.tagline}; letter-spacing: -0.01em; }
</style></head><body>
  <div class="face"><img src="${faceDataUri}" alt=""></div>
  <div class="scrim"></div>
  <div class="copy">
    <h1>Verba<span>Clock</span></h1>
    <p>The time, written out in light.</p>
  </div>
</body></html>`;
}

const browser = await chromium.launch();
await mkdir(OUT_DIR, { recursive: true });

// Pass 1: the live face, square so the wall plate is not cropped
const faceContext = await browser.newContext({
  viewport: { width: 620, height: 620 },
  deviceScaleFactor: 2,
  colorScheme: 'dark',
  reducedMotion: 'reduce',
});
const facePage = await faceContext.newPage();
await facePage.addInitScript(faceInitScript());
await facePage.goto(BASE_URL, { waitUntil: 'networkidle' });
await facePage.addStyleTag({ content: 'button[aria-label="Settings"] { display: none !important; }' });
await facePage.waitForTimeout(1_200);
await facePage.screenshot({ path: fileURLToPath(TMP_FACE), type: 'png' });
await faceContext.close();

const faceDataUri = `data:image/png;base64,${(await readFile(TMP_FACE)).toString('base64')}`;

// Pass 2: compose. jpeg output guarantees no alpha, which Play rejects.
const written = [];
for (const variant of VARIANTS) {
  const context = await browser.newContext({
    viewport: { width: variant.width, height: variant.height },
    deviceScaleFactor: variant.scale,
  });
  const page = await context.newPage();
  await page.setContent(composite(faceDataUri), { waitUntil: 'load' });
  await page.waitForTimeout(300);
  const file = new URL(`${variant.id}.jpg`, OUT_DIR);
  await page.screenshot({ path: fileURLToPath(file), type: 'jpeg', quality: 96 });
  await context.close();
  written.push(`${variant.id}.jpg  ${variant.width * variant.scale}x${variant.height * variant.scale}`);
}

await browser.close();
await writeFile(
  new URL('README.txt', OUT_DIR),
  [
    'Generated by scripts/shoot-feature-graphic.mjs — do not hand-edit.',
    '',
    'play-feature-graphic.jpg  -> Play Console feature graphic (mandatory, exactly 1024x500)',
    'play-feature-graphic@2x.jpg -> 2048x1000 spare, NOT accepted by Play (it wants exactly 1024x500)',
    '',
    '.face.png is an intermediate render, not an upload.',
    ...written,
  ].join('\n'),
);
console.log(written.join('\n'));
