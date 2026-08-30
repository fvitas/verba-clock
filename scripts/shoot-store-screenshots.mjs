// Renders the store screenshot sets against a running build, in two passes:
// raw/ is the bare device capture, composed/ wraps it in a captioned marketing
// frame. The composed set is what gets uploaded.
//   pnpm build && pnpm preview   (then, in another shell)
//   BASE_URL=http://localhost:4173 node scripts/shoot-store-screenshots.mjs
//
// Apple only requires the largest size per family and scales it down the chain
// (6.9"->6.5"->6.3"..., 13"->12.9"->11"...), so two Apple sets suffice. Play
// rejects those files outright: it caps the long edge at 2x the short one and
// 2796/1290 is 2.17, so Play needs its own 9:16 renders.
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const BASE_URL = process.env.BASE_URL ?? 'http://localhost:4173';
const OUT_DIR = new URL('../mockups/store/', import.meta.url);

// CSS viewport x DPR, chosen so the output lands exactly on a store-legal size
// The screen inside the frame keeps the device's true aspect — a device frame
// around a cropped window looks fake — so the frame is sized to bleed off the
// bottom edge, which absorbs the app's empty lower margin.
// `capture` overrides the viewport of the device shot: only the canvas size is
// fixed by the store, so the screen content can come from any viewport, and a
// phone frame wants a phone-shaped one or the cover fit crops it.
// `render` picks the product render (see RENDERS). `island` keeps that render's
// Dynamic Island — only the iPhone set has one, since a Play listing showing one
// is the wrong hardware.
const SETS = [
  { id: 'ios-iphone-6.9', width: 430, height: 932, scale: 3, frame: 0.84, device: 'phone', render: 'iphone', island: true }, // 1290x2796, required
  // Devices are anchored to the stage bottom, so a frame that is too wide grows
  // tall enough to climb over the headline. The iPad's squarer 3:4 screen and
  // the Play tablet's 16:9 hit that ceiling at different widths.
  { id: 'ios-ipad-13', width: 1024, height: 1366, scale: 2, frame: 0.74, device: 'tablet', render: 'ipad' }, // 2048x2732, required
  // 9:16 is the squarest phone canvas here, so the same frame ratio grows taller
  // relative to the canvas than on the 6.9" set — 0.84 put every device over the copy.
  { id: 'play-phone', width: 360, height: 640, scale: 3, frame: 0.74, device: 'phone', render: 'iphone', capture: { width: 400, height: 870 } }, // 1080x1920
  // Tablets are used landscape, so this set is a 16:9 canvas: the app is
  // captured landscape, pre-rotated into the portrait frame, and the whole
  // framed device is spun back upright at compose time. The iPad render works
  // here because its 3:4 screen rotated is exactly the 4:3 capture — no 9-slice.
  { id: 'play-tablet', width: 1280, height: 720, scale: 2, frame: 0.46, device: 'tablet', render: 'ipad', orient: 'landscape', capture: { width: 1024, height: 768 } }, // 2560x1440
];

const BASE_SETTINGS = {
  schemaVersion: 1,
  languageId: 'en',
  finishId: 'deep-black',
  presentation: 'fullbleed',
  showItIs: true,
  dots: 'none', // corner dots read as specks of dust at store thumbnail size
  transition: 'instant', // a crossfade mid-flight would smear the capture
  lightPlay: 'off',
  brightness: 1,
  keepAwake: true,
  dockMode: false,
  haptics: true,
};

// One message per shot. 10:30 matches the "IT IS HALF PAST TEN" description line.
// ** marks the accent word: serif lead, bold sans emphasis.
const SHOTS = [
  {
    name: 'hero-half-past-ten',
    at: '10:30',
    settings: {},
    theme: 'light',
    headline: 'Time,\n**in words.**',
    sub: 'An elegant way to read the time.',
  },
  {
    name: 'finishes-fan',
    at: '10:30',
    // Full-bleed, not the wall plate: the finish covers the whole screen, so a
    // fanned group shows three of them at full strength
    settings: { finishId: 'deep-black' },
    extras: [
      { at: '10:30', settings: { finishId: 'desert' } }, // left
      { at: '10:30', settings: { finishId: 'gold' } }, // right
    ],
    theme: 'light',
    headline: 'Eighteen\n**finishes.**',
    // Broken by hand: left to wrap, the second sentence orphans its last word
    sub: 'From deep black to brushed gold.\nOne of them will be your favorite.',
  },
  {
    name: 'language-japanese',
    at: '20:05',
    settings: { languageId: 'ja', finishId: 'red-pepper' },
    theme: 'dark',
    tint: ['#1b1416', '#0a0708'],
    accent: '#d9a3a3',
    headline: 'Speaks\n**32 languages.**',
    sub: 'The same time, a different sentence in every one.',
  },
  {
    name: 'every-detail-yours',
    at: '19:45',
    settings: { finishId: 'paper', dots: 'minutes' },
    theme: 'light',
    headline: 'Every detail,\n**yours.**',
    sub: 'A minute row, a softer light, a slower fade — all optional.',
  },
  {
    name: 'night-dock-mode',
    at: '02:40',
    settings: { dockMode: true, brightness: 0.6 },
    theme: 'dark',
    tint: ['#0f1219', '#06070a'],
    accent: '#8fa4c8',
    headline: 'A clock for\n**the room.**',
    sub: 'Dock it while charging for a dimmed night clock.',
  },
  {
    name: 'offline-waves',
    at: '13:20',
    settings: { finishId: 'waves' },
    theme: 'light',
    headline: 'Fully\n**offline.**',
    sub: 'No accounts, no tracking, no network. Ever.',
  },
];

function initScript({ settings, at }) {
  const [hours, minutes] = at.split(':').map(Number);
  return `
    localStorage.setItem('verba-settings', ${JSON.stringify(JSON.stringify(settings))});
    const Real = Date;
    const frozen = new Real(2026, 7, 22, ${hours}, ${minutes}, 0);
    class Frozen extends Real {
      constructor(...args) { return args.length ? new Real(...args) : new Real(frozen); }
      static now() { return frozen.getTime(); }
    }
    window.Date = Frozen;
  `;
}

// The cog is real UI but reads as clutter inside a marketing frame
const HIDE_CHROME = 'button[aria-label="Settings"] { display: none !important; }';

function headlineHtml(headline) {
  return headline
    .split(/\*\*(.+?)\*\*/g)
    .map((part, index) => (index % 2 ? `<b>${part}</b>` : part))
    .join('');
}

// Real product renders, supplied by the user. All numbers below are pixel
// measurements read off each file — re-measure if either is ever replaced. `body`
// excludes the buttons, which protrude past it on both sides, and `gap` is the
// transparent strip under the body, subtracted so the visible body bleeds off the
// canvas edge. `behind` says the render's screen is a transparent hole and the
// capture goes under it; without it the screen is an opaque placeholder and the
// capture has to be laid over the render instead.
const RENDERS = {
  // iPhone 17, portrait. Transparent screen, so the render's own bezel, camera
  // and buttons cover every seam of the capture behind it.
  iphone: {
    file: new URL('../assets/store-frames/iphone-17-black-portrait.png', import.meta.url),
    width: 1800,
    height: 3668,
    body: { left: 36, width: 1728, gap: 34 },
    behind: true,
    // The hole is 1606x3494, inset 97px on both sides and `bottom` px above the
    // image bottom. Every capture is cover-fitted into it, so each set's viewport
    // is picked to match `aspect` and the crop stays under 1%.
    //
    // The capture must be corner-clipped or its square corners escape the body's
    // rounded outline — unclipped, 67px of screen spills outside the frame. Solved
    // numerically against the alpha channel: any radius in 120–230 covers the hole
    // fully (the hole is a squircle, so too large a radius uncovers its corners)
    // while staying inside the opaque body. 200 sits in the middle of that window.
    //
    // `overfill` grows the capture on all four sides so it runs *under* the bezel.
    // Sized exactly to the hole it left a 1px line of backdrop showing through both
    // long edges: the rect is rounded independently of the frame's scale, and the
    // hole's own edge is antialiased, so a hairline of it stays uncovered. The bezel
    // is 61px thick, so 8px of overfill hides under it with room to spare.
    screen: { left: 97, top: 81, bottom: 93, radius: 200, overfill: 8, aspect: 1606 / 3494 },
    // The Dynamic Island is baked into the render as an opaque pill at the top of
    // the hole. It floats inside the hole with nothing else around it, so clearing
    // a padded box is exact — no shape to trace.
    island: { left: 644, top: 130, width: 512, height: 158 },
    // 9-slice inset for the stretched tablet frames. Big enough that both the
    // body's and the hole's whole corner curve stays inside a natural-size corner
    // slice (the hole's squircle tail runs to y=400), so only flat rail and bezel
    // are ever stretched, and the shot's corner radius still lines up with the hole.
    slice: 420,
  },
  // iPad Pro 13", portrait. This render's screen is an opaque grey placeholder,
  // not a hole, so the capture is laid on top and its own rounded corners are the
  // only thing shaping the screen. Both radius and overfill therefore have two
  // sides to satisfy — too small and the shot's squarish corner overhangs the
  // black bezel on a light finish, too large and placeholder grey peeks through.
  // Swept numerically against both metrics: 44–52 leaves zero placeholder pixels
  // showing (it fails at 56) and 50 keeps the least bezel covered.
  ipad: {
    file: new URL('../assets/store-frames/ipad-pro-13-portrait.png', import.meta.url),
    width: 2336,
    height: 3040,
    body: { left: 15, width: 2312, gap: 13 },
    // Screen 2114x2817. Its aspect is within 0.1% of the iPad set's 3:4 capture,
    // so that set needs no stretching at all.
    screen: { left: 111, top: 111, bottom: 112, radius: 50, overfill: 6, aspect: 2114 / 2817 },
    slice: 480,
  },
};

const STAGE_MARGIN = { phone: 0.055, tablet: 0.045 };
const CLEARANCE = 0.025; // of canvas width, kept between the copy and the tallest device
// A landscape device shows whole: instead of bleeding off the bottom it floats
// this far above it, mirroring the stage margin at the top of the group.
const LANDSCAPE_LIFT = 0.045;

// A fanned group trades word legibility on the outer phones for showing three
// finishes at once — fine here, because a full-bleed finish reads from a strip.
const LAYOUTS = {
  1: [{ scale: 1, center: 50, tilt: 0, z: 2, bleed: 0.02 }],
  2: [
    { scale: 0.76, center: 72, tilt: 0, z: 2, bleed: 0.02 },
    { scale: 0.6, center: 25, tilt: 2, z: 1, bleed: 0.09 },
  ],
  // How much of a rear phone shows is (canvasWidth - frontWidth) / 2, so a wider
  // front phone hides the sides no matter how far out they move. The middle one
  // stays the tallest and frontmost; the sides are smaller and sunk further off
  // the bottom edge, so they only lean out from behind it and never rise past it.
  3: [
    { scale: 0.82, center: 50, tilt: 0, z: 3, bleed: 0.012 },
    { scale: 0.72, center: 20, tilt: -9, z: 2, bleed: 0.06 },
    { scale: 0.72, center: 80, tilt: 9, z: 1, bleed: 0.06 },
  ],
};

// A tablet is close to twice as wide per unit of height, so the phone fan runs
// its side devices off both canvas edges — and a tablet sliced open mid-screen
// reads as a rendering fault rather than a crop. Pulled in and shrunk until the
// tilted bounding box clears x=0 on both tablet canvases, which still leaves
// ~200px of each side device showing past the front one.
const TABLET_LAYOUTS = {
  3: [
    { scale: 0.82, center: 50, tilt: 0, z: 3, bleed: 0.012 },
    { scale: 0.62, center: 28, tilt: -9, z: 2, bleed: 0.06 },
    { scale: 0.62, center: 72, tilt: 9, z: 1, bleed: 0.06 },
  ],
};

function slotsFor({ count, width, frameRatio, device, groupScale }) {
  const layout = (device === 'tablet' && TABLET_LAYOUTS[count]) || LAYOUTS[count];
  return layout.map((slot) => ({
    ...slot,
    bodyWidth: Math.round(width * frameRatio * slot.scale * groupScale),
  }));
}

// The positioned element for a given visible body width. That is the whole
// render, which is wider than the body because the buttons stick out. Phones use
// it at its natural aspect. Tablets stretch it, so their height is whatever makes
// the hole match the capture — the bezel and corners stay at natural size, so
// only the flat middle of each edge takes the stretch.
function elementBox({ bodyWidth, frame, stretch, holeAspect }) {
  const width = Math.round((bodyWidth * frame.width) / frame.body.width);
  if (!stretch) return { width, height: Math.round((width * frame.height) / frame.width) };
  const ratio = width / frame.width;
  const holeWidth = width - Math.round(frame.screen.left * ratio) * 2;
  const margins = Math.round((frame.screen.top + frame.screen.bottom) * ratio);
  return { width, height: Math.round(holeWidth / holeAspect) + margins };
}

// A tilt widens the bounding box, and since the rotation is about the centre,
// half of that growth goes upward. A landscape device is the same box rotated
// 90°, and its painted bottom is pinned to the lift line (see place), so its
// whole rotated bounding box counts as height.
function visualHeight({ tilt, landscape, ...box }) {
  const { width, height } = elementBox(box);
  const radians = Math.abs(tilt) * (Math.PI / 180);
  if (landscape) return height * Math.sin(radians) + width * Math.cos(radians);
  return (height + height * Math.cos(radians) + width * Math.sin(radians)) / 2;
}

// Devices are bottom-anchored and bleed off the canvas, so nothing bounds their
// tops except this: shrink the whole group until the tallest one clears the copy.
// The copy height is measured from the rendered DOM, so any headline or subhead
// length is safe — a device can never land on the text.
function groupScaleFor({ copyHeight, width, height, frameRatio, device, frame, holeAspect, stretch, count, landscape }) {
  // Margins and bleeds scale on the canvas's short side, or a landscape canvas
  // would get phone-sized gaps from its doubled width
  const base = landscape ? height : width;
  const room = height - copyHeight - Math.round(base * (STAGE_MARGIN[device] + CLEARANCE));
  const fits = slotsFor({ count, width, frameRatio, device, groupScale: 1 }).map(
    (slot) =>
      (landscape ? room - Math.round(base * LANDSCAPE_LIFT) : room + Math.round(base * slot.bleed)) /
      visualHeight({ bodyWidth: slot.bodyWidth, tilt: slot.tilt, frame, holeAspect, stretch, landscape }),
  );
  return Math.min(1, ...fits);
}

function composed({ shot, width, height, frameRatio, device, frame, holeAspect, stretch, captures, groupScale, frameUri, landscape }) {
  const base = landscape ? height : width;
  const px = (fraction) => `${Math.round(base * fraction)}px`;
  const light = shot.theme === 'light';
  const phone = device === 'phone';

  // A phone in the fan is narrow enough that running off the side edge still
  // leaves its whole outline legible, and that bleed is the composition. A tablet
  // is not: cut at the canvas edge it loses the outer bezel entirely and looks
  // like a broken render. So a tablet's centre is pulled in until its rotated
  // footprint fits, which keeps the group's size and only moves what must move.
  const keepOnCanvas = (slot) => {
    if (device !== 'tablet') return slot;
    const box = elementBox({ bodyWidth: slot.bodyWidth, frame, stretch, holeAspect });
    const radians = Math.abs(slot.tilt) * (Math.PI / 180);
    const half = landscape
      ? (box.height * Math.cos(radians) + box.width * Math.sin(radians)) / 2
      : (box.width * Math.cos(radians) + box.height * Math.sin(radians)) / 2;
    const room = Math.max(0, width / 2 - half);
    const offset = (width * slot.center) / 100 - width / 2;
    return { ...slot, center: 50 + (100 * Math.max(-room, Math.min(room, offset))) / width };
  };

  const slots = slotsFor({ count: captures.length, width, frameRatio, device, groupScale }).map((slot, index) => ({
    ...keepOnCanvas(slot),
    uri: captures[index],
  }));

  // Common to both frame kinds: where the element sits on the stage. Portrait
  // devices bleed off the bottom; a landscape device is the portrait element
  // spun -90° and shown whole, floating LANDSCAPE_LIFT above the edge. The
  // rotation is about the centre, so the painted box ends up shorter than the
  // layout box and the difference is pushed down to pin the painted bottom to
  // the lift line. The body gap sits on a side after the spin, so no extraBleed.
  const place = (slot, extraBleed = 0) => {
    const box = elementBox({ bodyWidth: slot.bodyWidth, frame, stretch, holeAspect });
    const radians = Math.abs(slot.tilt) * (Math.PI / 180);
    if (landscape) {
      const painted = box.height * Math.sin(radians) + box.width * Math.cos(radians);
      const sunk = Math.round((box.height - painted) / 2);
      return `
    left: ${slot.center}%; bottom: ${Math.round(base * LANDSCAPE_LIFT) - sunk}px; z-index: ${slot.z};
    transform: translateX(-50%) rotate(${slot.tilt - 90}deg);`;
    }
    return `
    left: ${slot.center}%; bottom: ${-Math.round(base * slot.bleed) - extraBleed}px; z-index: ${slot.z};
    transform: translateX(-50%) rotate(${slot.tilt}deg);`;
  };

  // Frame geometry derives from each body width, so every device in a group
  // keeps the same proportions at its own size. The hole's margins are measured
  // from the element's own edges, which is what makes the same arithmetic work
  // for a stretched frame: those margins live in natural-size slices either way.
  const deviceCss = (selector, slot) => {
    const box = elementBox({ bodyWidth: slot.bodyWidth, frame, stretch, holeAspect });
    const ratio = box.width / frame.width;
    const scaled = (value) => Math.round(value * ratio);
    const { screen } = frame;
    const over = screen.overfill;
    const shadow = `0 ${px(0.03)} ${px(0.075)} rgba(0,0,0,${light ? 0.3 : 0.6})`;
    // drop-shadow follows the render's alpha, so the shadow takes the body's
    // rounded silhouette; a box-shadow would draw a rectangle around it.
    return `
  ${selector} { width: ${box.width}px; height: ${box.height}px;${place(slot, scaled(frame.body.gap))}
    filter: drop-shadow(${shadow}); }${stretch ? `
  ${selector} .chrome { border-width: ${scaled(frame.slice)}px; }` : ''}
  ${selector} .shot { left: ${scaled(screen.left - over)}px; top: ${scaled(screen.top - over)}px;
    width: ${box.width - scaled(screen.left - over) * 2}px;
    height: ${box.height - scaled(screen.top - over) - scaled(screen.bottom - over)}px;
    border-radius: ${scaled(screen.radius + over)}px; }`;
  };

  const backdrop = light
    ? 'linear-gradient(168deg, #f5f3ef 0%, #ebe8e2 62%, #e2ded6 100%)'
    : `radial-gradient(120% 80% at 50% 0%, ${shot.tint[0]} 0%, ${shot.tint[1]} 72%)`;

  // Paint order is DOM order here, and children always paint above a parent's
  // border, so the chrome has to be the shot's sibling for either layering.
  const deviceHtml = (slot, index) => {
    const layers = ['<div class="chrome"></div>', `<img class="shot" src="${slot.uri}" alt="">`];
    if (frame.behind) layers.reverse();
    return `
    <div class="framed d${index}">${layers.join('')}</div>`;
  };

  // One copy of the render for the whole page: at ~1MB of base64 it is not
  // something to repeat per device. A stretched frame draws it through
  // border-image, which is a 9-slice — corners at natural size, the flat rail
  // between them stretched — so an iPad's bezel does not go fat with its width.
  const chrome = stretch
    ? `border-style: solid; border-color: transparent;
    border-image: url(${frameUri}) ${frame.slice} stretch;`
    : `background: url(${frameUri}) 0 0 / 100% 100% no-repeat;`;

  return `<!doctype html>
<html><head><meta charset="utf-8"><style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    width: ${width}px; height: ${height}px; overflow: hidden; background: ${backdrop};
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    display: flex; flex-direction: column;
  }
  .copy { flex: none; padding: ${px(phone ? 0.085 : 0.062)} ${px(0.075)} 0; }
  .eyebrow {
    font-size: ${px(phone ? 0.023 : 0.017)}; font-weight: 600; text-transform: uppercase;
    letter-spacing: 0.22em; color: ${light ? '#a09a90' : 'rgba(255,255,255,0.38)'};
    margin-bottom: ${px(0.03)};
  }
  /* serif lead, bold sans accent — the reference sets typographic contrast
     inside a single headline rather than across two weights of one face */
  h1 {
    font-family: Georgia, "Iowan Old Style", "Times New Roman", serif;
    font-size: ${px(phone ? 0.092 : 0.07)}; line-height: 1.03; letter-spacing: -0.025em;
    font-weight: 400; color: ${light ? '#15150f' : '#f6f5f3'}; white-space: pre-line;
  }
  h1 b {
    font-family: inherit; font-weight: 700;
    color: ${light ? '#000' : '#fff'}; letter-spacing: -0.035em;
  }
  p.sub {
    margin-top: ${px(0.028)}; font-style: italic;
    font-size: ${px(phone ? 0.036 : 0.027)}; line-height: 1.34; letter-spacing: -0.005em;
    white-space: pre-line;
    color: ${light ? '#6d675e' : shot.accent};
  }
  .stage { position: relative; flex: 1; margin-top: ${px(STAGE_MARGIN[device])}; }
  /* The capture and the product render, stacked in whichever order this render
     needs. The bezel, corners, camera and buttons always come from the PNG. */
  .framed { position: absolute; }
  .framed .shot { position: absolute; display: block; object-fit: cover; background: #000; }
  .chrome { position: absolute; inset: 0; ${chrome} }
${slots.map((slot, index) => deviceCss(`.d${index}`, slot)).join('\n')}
</style></head><body>
  <div class="copy">
    <div class="eyebrow">Verba Clock</div>
    <h1>${headlineHtml(shot.headline)}</h1>
    <p class="sub">${shot.sub}</p>
  </div>
  <div class="stage">
    ${slots.map(deviceHtml).join('')}
  </div>
</body></html>`;
}

const browser = await chromium.launch();
const written = [];
const clamped = [];
// Erasing the island needs the pixels, and a canvas is the only image editor in
// reach, so it happens in a throwaway page rather than by committing a second PNG.
async function withoutIsland(uri, box) {
  const page = await browser.newPage();
  const erased = await page.evaluate(
    ([source, island]) =>
      new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = image.width;
          canvas.height = image.height;
          const context = canvas.getContext('2d');
          context.drawImage(image, 0, 0);
          context.clearRect(island.left, island.top, island.width, island.height);
          resolve(canvas.toDataURL('image/png'));
        };
        image.onerror = () => reject(new Error('frame render failed to decode'));
        image.src = source;
      }),
    [uri, box],
  );
  await page.close();
  return erased;
}

// A landscape capture is pre-rotated clockwise to fill the portrait frame hole;
// the framed element is spun back counter-clockwise at compose time.
async function rotatedClockwise(uri) {
  const page = await browser.newPage();
  const rotated = await page.evaluate(
    (source) =>
      new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = image.height;
          canvas.height = image.width;
          const context = canvas.getContext('2d');
          context.translate(canvas.width, 0);
          context.rotate(Math.PI / 2);
          context.drawImage(image, 0, 0);
          resolve(canvas.toDataURL('image/png'));
        };
        image.onerror = () => reject(new Error('capture failed to decode'));
        image.src = source;
      }),
    uri,
  );
  await page.close();
  return rotated;
}

// Inlined: the compose page is set from a string, so it has no base URL to
// resolve a file path against. Each render is decoded once, in both the variant
// that keeps its island and the one with it erased.
const frameUris = {};
for (const [key, frame] of Object.entries(RENDERS)) {
  const uri = `data:image/png;base64,${(await readFile(frame.file)).toString('base64')}`;
  frameUris[key] = { island: uri, plain: frame.island ? await withoutIsland(uri, frame.island) : uri };
}

async function capture({ set, settings, at, file }) {
  const viewport = set.capture ?? set;
  const context = await browser.newContext({
    viewport: { width: viewport.width, height: viewport.height },
    deviceScaleFactor: set.scale,
    colorScheme: 'dark',
    reducedMotion: 'reduce',
  });
  const page = await context.newPage();
  await page.addInitScript(initScript({ settings: { ...BASE_SETTINGS, ...settings }, at }));
  const failures = [];
  page.on('pageerror', (error) => failures.push(String(error)));
  await page.goto(BASE_URL, { waitUntil: 'networkidle' });
  await page.addStyleTag({ content: HIDE_CHROME });
  await page.waitForTimeout(1_200); // the grid settles on the first tick
  await page.screenshot({ path: fileURLToPath(file), type: 'png' });
  await context.close();
  if (failures.length) throw new Error(`${set.id}: ${failures.join('; ')}`);
  const uri = `data:image/png;base64,${(await readFile(file)).toString('base64')}`;
  return set.orient === 'landscape' ? rotatedClockwise(uri) : uri;
}

const only = process.env.ONLY; // e.g. ONLY=ios-iphone-6.9, to iterate on one set

for (const set of SETS.filter((candidate) => !only || candidate.id === only)) {
  const rawDir = new URL(`raw/${set.id}/`, OUT_DIR);
  const outDir = new URL(`composed/${set.id}/`, OUT_DIR);
  await mkdir(rawDir, { recursive: true });
  await mkdir(outDir, { recursive: true });

  for (const [index, shot] of SHOTS.entries()) {
    const prefix = String(index + 1).padStart(2, '0');

    // Pass 1: the bare device captures — one per device in the group
    const captures = [];
    for (const [slot, source] of [shot, ...(shot.extras ?? [])].entries()) {
      captures.push(
        await capture({
          set,
          settings: source.settings,
          at: source.at,
          file: new URL(`${prefix}-${shot.name}${slot ? `-${slot}` : ''}.png`, rawDir),
        }),
      );
    }

    // Pass 2: wrap it in the captioned frame. jpeg guarantees no alpha channel,
    // which both stores reject.
    const composeContext = await browser.newContext({
      viewport: { width: set.width * set.scale, height: set.height * set.scale },
      deviceScaleFactor: 1,
    });
    const composePage = await composeContext.newPage();
    const viewport = set.capture ?? set;
    const frame = RENDERS[set.render];
    const landscape = set.orient === 'landscape';
    // A rotated capture presents its short side as the hole's width
    const holeAspect = landscape ? viewport.height / viewport.width : viewport.width / viewport.height;
    const geometry = {
      shot,
      width: set.width * set.scale,
      height: set.height * set.scale,
      frameRatio: set.frame,
      device: set.device,
      frame,
      // A render whose screen already matches the capture is used at its natural
      // aspect; anything further off than 1% gets 9-sliced, or a 3:4 screen in a
      // phone-shaped hole would be cover-cropped by a third.
      stretch: Math.abs(holeAspect / frame.screen.aspect - 1) > 0.01,
      holeAspect,
      captures,
      frameUri: frameUris[set.render][set.island ? 'island' : 'plain'],
      landscape,
    };
    await composePage.setContent(composed({ ...geometry, groupScale: 1 }), { waitUntil: 'load' });

    // Measure the copy as rendered, then shrink the group if the tallest device
    // would reach it. Hand-tuned ratios per set could not hold this: the copy
    // height depends on how the headline and subhead wrap at that canvas width.
    const copyHeight = await composePage.evaluate(() => document.querySelector('.copy').offsetHeight);
    const groupScale = groupScaleFor({ ...geometry, copyHeight, count: captures.length });
    if (groupScale < 1) {
      await composePage.setContent(composed({ ...geometry, groupScale }), { waitUntil: 'load' });
      clamped.push(`${set.id}/${prefix}-${shot.name} group scaled to ${groupScale.toFixed(3)} to clear the copy`);
    }
    await composePage.waitForTimeout(250);
    const outFile = new URL(`${prefix}-${shot.name}.jpg`, outDir);
    await composePage.screenshot({ path: fileURLToPath(outFile), type: 'jpeg', quality: 94 });
    await composeContext.close();

    written.push(`composed/${set.id}/${prefix}-${shot.name}.jpg  ${set.width * set.scale}x${set.height * set.scale}`);
  }
}

await browser.close();

await writeFile(
  new URL('README.txt', OUT_DIR),
  [
    'Generated by scripts/shoot-store-screenshots.mjs — do not hand-edit.',
    '',
    'composed/  <- UPLOAD THESE. Captioned marketing frames.',
    'raw/       <- bare device captures, kept for reference and re-composition.',
    '',
    'ios-iphone-6.9  -> App Store Connect, iPhone 6.9" (required; scales to all smaller iPhones)',
    'ios-ipad-13     -> App Store Connect, iPad 13" (required; scales to all smaller iPads)',
    'play-phone      -> Play Console, phone screenshots',
    'play-tablet     -> Play Console, tablet screenshots',
    '',
    'The 1024x500 Play feature graphic comes from scripts/shoot-feature-graphic.mjs.',
    '',
    ...written,
  ].join('\n'),
);

console.log(written.join('\n'));
if (clamped.length) console.log(`\n${clamped.join('\n')}`);
console.log(`\n${written.length} composed files -> mockups/store/composed/`);
