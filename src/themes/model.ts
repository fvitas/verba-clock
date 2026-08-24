import { getFinish, withAlpha, type Dither, type Finish } from '../finishes/catalog';

export type ThemeBackground =
  | { kind: 'solid'; color: string }
  | { kind: 'finish'; finishId: string }
  // Photo pixels live in the photo store; the luminance is measured once at pick time
  | { kind: 'photo'; luminance: number };

export type CustomTheme = {
  id: string;
  name: string;
  background: ThemeBackground;
  ledColor: string;
  dimOpacity: number;
  glow: number;
};

// What the renderers consume: every treatment resolved to concrete CSS values, so the
// components carry no light/dark/eink branching of their own
export type Theme = {
  id: string;
  name: string;
  builtin: boolean;
  surface: string;
  letter: 'light' | 'dark';
  lit: { color: string; textShadow: string };
  // Unlit letters and unlit minute dots share this colour
  dim: string;
  // Corner fixture fill; the glass bevel stays in the component, keyed on `letter`
  dot: string;
  dotGlow: string;
  eink?: { ink: string; dither: Dither };
};

export const DIM_DEFAULT = 0.15;
export const GLOW_DEFAULT = 0.55;

export const LED_PRESETS = [
  { name: 'LED white', hex: '#ffffff' },
  { name: 'Warm white', hex: '#ffd9a8' },
  { name: 'Amber', hex: '#ffb347' },
  { name: 'Red', hex: '#ff4b3a' },
  { name: 'Green', hex: '#4bd964' },
  { name: 'Ice blue', hex: '#9fd9ff' },
  { name: 'Violet', hex: '#c07cff' },
];

export const SOLID_PRESETS = [
  { name: 'Near black', hex: '#0a0a0c' },
  { name: 'Navy', hex: '#0d1526' },
  { name: 'Forest', hex: '#12211a' },
  { name: 'Cream', hex: '#e8e2d5' },
];

// A fresh editor boots looking like the default clock (D52)
export const DEFAULT_DRAFT: Omit<CustomTheme, 'id'> = {
  name: '',
  background: { kind: 'solid', color: '#0a0a0c' },
  ledColor: '#ffffff',
  dimOpacity: DIM_DEFAULT,
  glow: GLOW_DEFAULT,
};

const hexRgb = (hex: string): [number, number, number] => {
  const rgb = parseInt(hex.slice(1), 16);
  return [(rgb >> 16) & 255, (rgb >> 8) & 255, rgb & 255];
};

export const luminance = (hex: string): number => {
  const [r, g, b] = hexRgb(hex);
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
};

const lightLetters = (background: ThemeBackground): boolean => {
  if (background.kind === 'solid') return luminance(background.color) < 0.5;
  if (background.kind === 'finish') return getFinish(background.finishId).letter === 'light';
  return background.luminance < 0.5;
};

const fromFinish = (finish: Finish): Theme => {
  if (finish.render === 'eink') {
    return {
      id: finish.id,
      name: finish.name,
      builtin: true,
      surface: finish.surface,
      letter: finish.letter,
      lit: { color: finish.ink, textShadow: 'none' },
      dim: withAlpha(finish.ink, finish.stencilOpacity),
      dot: finish.ink,
      dotGlow: 'none',
      eink: { ink: finish.ink, dither: finish.dither },
    };
  }
  const light = finish.letter === 'light';
  return {
    id: finish.id,
    name: finish.name,
    builtin: true,
    surface: finish.surface,
    letter: finish.letter,
    lit: light
      ? { color: '#ffffff', textShadow: '0 0 0.4em rgba(255,255,255,0.55)' }
      : { color: '#181614', textShadow: '0 0 0.07em rgba(0,0,0,0.5), 0 0 0.2em rgba(0,0,0,0.3)' },
    dim: light
      ? `rgba(255,255,255,${finish.stencilOpacity})`
      : `rgba(0,0,0,${finish.stencilOpacity})`,
    dot: light ? 'rgba(255,255,255,0.6)' : '#181614',
    dotGlow: light ? '0 0 10px rgba(255,255,255,0.55)' : '0 0 8px rgba(0,0,0,0.3)',
  };
};

const surfaceOf = (background: ThemeBackground, photoUrl?: string | null): string => {
  if (background.kind === 'solid') return background.color;
  if (background.kind === 'finish') return getFinish(background.finishId).surface;
  return photoUrl ? `url("${photoUrl}") center / cover no-repeat, #0a0a0c` : '#0a0a0c';
};

// The mockup's polarity formula: on a light front the LED hue survives as a deep shade
export const resolveCustom = (theme: CustomTheme, photoUrl?: string | null): Theme => {
  const light = lightLetters(theme.background);
  const led = theme.ledColor;
  const [r, g, b] = hexRgb(led);
  const shade = (v: number): number => Math.round(v * 0.16);
  return {
    id: theme.id,
    name: theme.name,
    builtin: false,
    surface: surfaceOf(theme.background, photoUrl),
    letter: light ? 'light' : 'dark',
    lit: light
      ? {
          color: led,
          textShadow:
            theme.glow > 0 ? `0 0 ${(0.7 * theme.glow).toFixed(2)}em ${withAlpha(led, theme.glow)}` : 'none',
        }
      : { color: `rgb(${shade(r)}, ${shade(g)}, ${shade(b)})`, textShadow: 'none' },
    dim: light ? withAlpha(led, theme.dimOpacity) : `rgba(20, 18, 14, ${theme.dimOpacity * 1.6})`,
    dot: light ? withAlpha(led, 0.6) : `rgb(${shade(r)}, ${shade(g)}, ${shade(b)})`,
    dotGlow: light ? `0 0 10px ${withAlpha(led, 0.55)}` : '0 0 8px rgba(0,0,0,0.3)',
  };
};

export const resolveTheme = (
  themeId: string,
  customThemes: CustomTheme[],
  photoUrl?: string | null,
): Theme => {
  const custom = customThemes.find((t) => t.id === themeId);
  if (custom) return resolveCustom(custom, photoUrl);
  return fromFinish(getFinish(themeId));
};

// "Custom Theme", "Custom Theme 2", ... — the first free slot, not a counter
export const fallbackName = (existing: CustomTheme[]): string => {
  const names = new Set(existing.map((t) => t.name));
  if (!names.has('Custom Theme')) return 'Custom Theme';
  let n = 2;
  while (names.has(`Custom Theme ${n}`)) n += 1;
  return `Custom Theme ${n}`;
};
