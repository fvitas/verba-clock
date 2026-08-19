export type Finish = {
  id: string;
  name: string;
  series: 'classic' | 'steel' | 'pepper' | 'creators-edition';
  tier: 'free' | 'premium';
  surface: string;
  letter: 'light' | 'dark';
  stencilOpacity: number;
};

// SVG fractal noise as a data-URI background layer — the procedural grain for coatings/stone
const noise = (opacity: number, frequency = 0.8): string =>
  `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='${frequency}' numOctaves='3'/%3E%3C/filter%3E%3Crect width='120' height='120' filter='url(%23n)' opacity='${opacity}'/%3E%3C/svg%3E")`;

const svgTex = (svg: string): string => `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;

type Channels = { r: string; g: string; b: string };

// hex palette -> feComponentTransfer table values per channel
const ramp = (hexes: string[]): Channels => {
  const channel = (i: number): string =>
    hexes.map((h) => (parseInt(h.slice(1 + i * 2, 3 + i * 2), 16) / 255).toFixed(3)).join(' ');
  return { r: channel(0), g: channel(1), b: channel(2) };
};

type MottleOptions = {
  freq: number | string;
  hexes: string[];
  octaves?: number;
  seed?: number;
  rotate?: number;
  type?: 'fractalNoise' | 'turbulence';
};

// organic mottling: turbulence noise mapped through a palette ramp, stretched over the element.
// sRGB interpolation is required — the default linearRGB washes every palette out.
const mottle = ({ freq, hexes, octaves = 5, seed = 7, rotate = 0, type = 'fractalNoise' }: MottleOptions): string => {
  const p = ramp(hexes);
  const rect = rotate
    ? `<g transform='rotate(${rotate} 450 450)'><rect x='-450' y='-450' width='1800' height='1800' filter='url(#f)'/></g>`
    : `<rect width='900' height='900' filter='url(#f)'/>`;
  const svg =
    `<svg xmlns='http://www.w3.org/2000/svg' width='900' height='900'>` +
    `<filter id='f' x='0' y='0' width='100%' height='100%' color-interpolation-filters='sRGB'>` +
    `<feTurbulence type='${type}' baseFrequency='${freq}' numOctaves='${octaves}' seed='${seed}' stitchTiles='stitch'/>` +
    `<feColorMatrix values='1 0 0 0 0 1 0 0 0 0 1 0 0 0 0 0 0 0 0 1'/>` +
    `<feComponentTransfer><feFuncR type='table' tableValues='${p.r}'/><feFuncG type='table' tableValues='${p.g}'/><feFuncB type='table' tableValues='${p.b}'/></feComponentTransfer>` +
    `</filter>${rect}</svg>`;
  return `${svgTex(svg)} 0 0 / 100% 100%`;
};

// desert stone: pink-cream grain, golden clouds, brown speck clusters and thin
// meandering veins with debris, geometry traced from the QLOCKTWO reference
const desertSurface = (): string => {
  const grain = ramp(['#c9b596', '#dcccb4', '#e8dbc6', '#f0e6d4', '#f7f0e1']);
  const vein = 'M495,-20 C440,180 370,330 300,470 C240,590 160,720 70,880';
  const vein2 = 'M-20,160 C120,120 260,90 400,70';
  const vein3 = 'M830,-20 C800,120 760,240 690,400';
  const svg =
    `<svg xmlns='http://www.w3.org/2000/svg' width='900' height='900'>` +
    `<filter id='g' x='0' y='0' width='100%' height='100%' color-interpolation-filters='sRGB'><feTurbulence type='fractalNoise' baseFrequency='0.55' numOctaves='3' seed='8' stitchTiles='stitch'/><feColorMatrix values='1 0 0 0 0 1 0 0 0 0 1 0 0 0 0 0 0 0 0 1'/><feComponentTransfer><feFuncR type='table' tableValues='${grain.r}'/><feFuncG type='table' tableValues='${grain.g}'/><feFuncB type='table' tableValues='${grain.b}'/></feComponentTransfer></filter>` +
    `<filter id='w' x='0' y='0' width='100%' height='100%' color-interpolation-filters='sRGB'><feTurbulence type='fractalNoise' baseFrequency='0.006' numOctaves='4' seed='31' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.753 0 0 0 0 0.627 0 0 0 0 0.412 1 0 0 0 0'/><feComponentTransfer><feFuncA type='table' tableValues='0 0.02 0.08 0.18 0.3'/></feComponentTransfer></filter>` +
    `<filter id='k' x='0' y='0' width='100%' height='100%' color-interpolation-filters='sRGB'><feTurbulence type='fractalNoise' baseFrequency='0.4' numOctaves='3' seed='17' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.478 0 0 0 0 0.361 0 0 0 0 0.204 1 0 0 0 0'/><feComponentTransfer><feFuncA type='table' tableValues='0 0 0 0 0.12 0.26'/></feComponentTransfer></filter>` +
    `<filter id='d' x='-10%' y='-10%' width='120%' height='120%'><feTurbulence type='turbulence' baseFrequency='0.035' numOctaves='2' seed='5' result='t'/><feDisplacementMap in='SourceGraphic' in2='t' scale='20'/></filter>` +
    `<rect width='900' height='900' filter='url(#g)'/>` +
    `<rect width='900' height='900' filter='url(#w)'/>` +
    `<rect width='900' height='900' filter='url(#k)'/>` +
    `<g filter='url(#d)' fill='none' stroke-linecap='round'>` +
    `<path d='${vein}' stroke='#a5804d' stroke-width='16' opacity='0.12'/>` +
    `<path d='${vein}' stroke='#b08e58' stroke-width='8' opacity='0.3'/>` +
    `<path d='${vein}' stroke='#7d5c34' stroke-width='3.5' opacity='0.6'/>` +
    `<path d='${vein}' stroke='#6f5230' stroke-width='1.4' stroke-dasharray='3 5' opacity='0.55'/>` +
    `<path d='M370,330 L430,380 L470,400' stroke='#85643c' stroke-width='1.8' opacity='0.4'/>` +
    `<path d='M240,590 L300,640 L330,670' stroke='#85643c' stroke-width='1.6' opacity='0.38'/>` +
    `<path d='${vein2}' stroke='#a5804d' stroke-width='5' opacity='0.2'/>` +
    `<path d='${vein2}' stroke='#85643c' stroke-width='1.8' opacity='0.4'/>` +
    `<path d='${vein3}' stroke='#a5804d' stroke-width='4' opacity='0.18'/>` +
    `<path d='${vein3}' stroke='#85643c' stroke-width='1.6' opacity='0.35'/>` +
    `</g></svg>`;
  return `${svgTex(svg)} 0 0 / 100% 100%`;
};

export const FINISHES: Finish[] = [
  { id: 'deep-black', name: 'Deep Black', series: 'classic', tier: 'free', letter: 'light', stencilOpacity: 0.15,
    surface: 'linear-gradient(135deg, #0a0a0c, #050506 60%, #070709)' },
  { id: 'stainless-steel', name: 'Stainless Steel', series: 'steel', tier: 'free', letter: 'dark', stencilOpacity: 0.3,
    surface: `linear-gradient(100deg, rgba(255,255,255,.12), rgba(0,0,0,.04) 40%, rgba(255,255,255,.09) 65%, rgba(0,0,0,.07)), ${mottle({ freq: '0.006 0.55', octaves: 3, seed: 7, hexes: ['#9a9ea3', '#a8acb0', '#b4b7bb', '#bfc2c6'] })}` },
  { id: 'black-pepper', name: 'Black Pepper', series: 'pepper', tier: 'free', letter: 'light', stencilOpacity: 0.16,
    surface: `${noise(0.12)}, radial-gradient(130% 90% at 30% 0%, rgba(44,44,52,.45) 0%, transparent 55%), linear-gradient(135deg, #0a0a0c, #050506 60%, #070709)` },
  { id: 'grey-pepper', name: 'Grey Pepper', series: 'pepper', tier: 'free', letter: 'light', stencilOpacity: 0.22,
    surface: `${noise(0.18)}, linear-gradient(135deg, #5e6165, #4c4f53)` },
  { id: 'white-pepper', name: 'White Pepper', series: 'pepper', tier: 'free', letter: 'dark', stencilOpacity: 0.25,
    surface: `${noise(0.12)}, linear-gradient(135deg, #eceae5, #dedbd4)` },
  { id: 'red-pepper', name: 'Red Pepper', series: 'pepper', tier: 'free', letter: 'light', stencilOpacity: 0.2,
    surface: `${noise(0.15)}, linear-gradient(135deg, #7d1f24, #641419)` },
  { id: 'hazelnut', name: 'Hazelnut', series: 'pepper', tier: 'free', letter: 'dark', stencilOpacity: 0.25,
    surface: `${noise(0.07)}, radial-gradient(120% 80% at 30% 10%, rgba(255,240,210,.22), transparent 60%), linear-gradient(135deg, #ad9161, #8c714a 60%, #9f8355)` },
  { id: 'rust', name: 'Rust', series: 'creators-edition', tier: 'free', letter: 'light', stencilOpacity: 0.22,
    surface: `${noise(0.14, 0.5)}, ${mottle({ freq: 0.006, octaves: 6, seed: 11, hexes: ['#120804', '#1e0d06', '#2b1308', '#3a1a0b', '#4f2410', '#6d3315', '#a04e1a', '#d97a28'] })}` },
  { id: 'vintage-copper', name: 'Vintage Copper', series: 'creators-edition', tier: 'free', letter: 'light', stencilOpacity: 0.22,
    surface: `${noise(0.1, 0.6)}, ${mottle({ type: 'turbulence', freq: 0.007, octaves: 5, seed: 5, hexes: ['#0f3230', '#15514c', '#27897d', '#4fb3a4', '#8fd8c8', '#c9e8dd'] })}` },
  { id: 'waves', name: 'Waves', series: 'creators-edition', tier: 'free', letter: 'light', stencilOpacity: 0.22,
    surface: `${noise(0.1, 0.6)}, ${mottle({ freq: 0.005, octaves: 5, seed: 5, hexes: ['#0f1a32', '#062460', '#274b89', '#4f77b3', '#8fb1d8', '#c9dce8'] })}` },
  { id: 'gold', name: 'Gold', series: 'creators-edition', tier: 'free', letter: 'dark', stencilOpacity: 0.28,
    surface: `${noise(0.08, 0.3)}, linear-gradient(125deg, #d4af37 0%, #f0d878 30%, #c69f2e 55%, #e8cc60 80%, #b8922a 100%)` },
  { id: 'silver-gold', name: 'Silver & Gold', series: 'creators-edition', tier: 'free', letter: 'dark', stencilOpacity: 0.28,
    surface: `${noise(0.08, 0.5)}, ${mottle({ freq: 0.009, octaves: 6, seed: 13, hexes: ['#6d6650', '#8a836a', '#a49c84', '#bdb59d', '#d2ccb6'] })}` },
  { id: 'platinum', name: 'Platinum', series: 'creators-edition', tier: 'free', letter: 'light', stencilOpacity: 0.3,
    surface: `${noise(0.07, 0.5)}, ${mottle({ freq: 0.005, octaves: 5, seed: 21, hexes: ['#847c6e', '#a29a8c', '#bcb5a8', '#d2ccc0', '#e8e4da'] })}` },
  { id: 'moon-gold', name: 'Moon Gold', series: 'creators-edition', tier: 'free', letter: 'dark', stencilOpacity: 0.28,
    surface: `${noise(0.07, 0.5)}, ${mottle({ freq: 0.006, octaves: 5, seed: 9, hexes: ['#ab8759', '#bd9a6c', '#cdac7e', '#dbbd90', '#e8cfa4'] })}` },
  { id: 'metamorphite', name: 'Metamorphite', series: 'creators-edition', tier: 'free', letter: 'light', stencilOpacity: 0.2,
    surface: `${noise(0.15, 0.8)}, ${mottle({ freq: '0.003 0.014', octaves: 4, seed: 9, rotate: -35, hexes: ['#0b0d0f', '#131518', '#1a1d20', '#22262a', '#31363c'] })}` },
  { id: 'desert', name: 'Desert', series: 'creators-edition', tier: 'free', letter: 'dark', stencilOpacity: 0.3,
    surface: desertSurface() },
];

export const getFinish = (id: string): Finish => FINISHES.find((f) => f.id === id) ?? FINISHES[0];
