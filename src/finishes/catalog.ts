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

export const FINISHES: Finish[] = [
  { id: 'deep-black', name: 'Deep Black', series: 'classic', tier: 'free', letter: 'light', stencilOpacity: 0.15,
    surface: 'linear-gradient(135deg, #0a0a0c, #050506 60%, #070709)' },
  { id: 'stainless-steel', name: 'Stainless Steel', series: 'steel', tier: 'free', letter: 'dark', stencilOpacity: 0.3,
    surface: `${noise(0.05)}, repeating-linear-gradient(90deg, #b9bcc0 0px, #a7abb0 1px, #b3b6ba 2px), linear-gradient(120deg, #c6c9cd, #9da1a6)` },
  { id: 'black-pepper', name: 'Black Pepper', series: 'pepper', tier: 'free', letter: 'light', stencilOpacity: 0.16,
    surface: `${noise(0.15)}, linear-gradient(135deg, #17181a, #101113)` },
  { id: 'grey-pepper', name: 'Grey Pepper', series: 'pepper', tier: 'free', letter: 'light', stencilOpacity: 0.22,
    surface: `${noise(0.18)}, linear-gradient(135deg, #5e6165, #4c4f53)` },
  { id: 'white-pepper', name: 'White Pepper', series: 'pepper', tier: 'free', letter: 'dark', stencilOpacity: 0.25,
    surface: `${noise(0.12)}, linear-gradient(135deg, #eceae5, #dedbd4)` },
  { id: 'red-pepper', name: 'Red Pepper', series: 'pepper', tier: 'free', letter: 'light', stencilOpacity: 0.2,
    surface: `${noise(0.15)}, linear-gradient(135deg, #7d1f24, #641419)` },
  { id: 'hazelnut', name: 'Hazelnut', series: 'pepper', tier: 'free', letter: 'light', stencilOpacity: 0.2,
    surface: `${noise(0.12)}, linear-gradient(135deg, #6b4a35, #54382a)` },
  { id: 'rust', name: 'Rust', series: 'creators-edition', tier: 'free', letter: 'light', stencilOpacity: 0.22,
    surface: `${noise(0.25, 0.6)}, radial-gradient(120% 90% at 20% 15%, #8a4a26 0%, transparent 55%), radial-gradient(90% 80% at 75% 70%, #5c2f18 0%, transparent 60%), linear-gradient(135deg, #7a3f1f, #4a2513)` },
  { id: 'vintage-copper', name: 'Vintage Copper', series: 'creators-edition', tier: 'free', letter: 'light', stencilOpacity: 0.22,
    surface: `${noise(0.2, 0.5)}, radial-gradient(100% 80% at 30% 25%, #3f7f6f 0%, transparent 55%), linear-gradient(135deg, #7a5140, #3c5f55)` },
  { id: 'gold', name: 'Gold', series: 'creators-edition', tier: 'free', letter: 'dark', stencilOpacity: 0.28,
    surface: `${noise(0.08, 0.3)}, linear-gradient(125deg, #d4af37 0%, #f0d878 30%, #c69f2e 55%, #e8cc60 80%, #b8922a 100%)` },
  { id: 'silver-gold', name: 'Silver & Gold', series: 'creators-edition', tier: 'free', letter: 'dark', stencilOpacity: 0.28,
    surface: `${noise(0.08, 0.3)}, linear-gradient(125deg, #cfc8ae 0%, #e9e4cf 35%, #c2bb9f 65%, #ded6ba 100%)` },
  { id: 'platinum', name: 'Platinum', series: 'creators-edition', tier: 'free', letter: 'light', stencilOpacity: 0.3,
    surface: `${noise(0.06, 0.4)}, linear-gradient(130deg, #8f9294, #6d7073 45%, #95989a 75%, #7c7f82)` },
  { id: 'moon-gold', name: 'Moon Gold', series: 'creators-edition', tier: 'free', letter: 'dark', stencilOpacity: 0.28,
    surface: `${noise(0.1, 0.35)}, linear-gradient(125deg, #c9b189, #e6d3ad 40%, #bfa77e 70%, #dcc79e)` },
  { id: 'glintscape', name: 'Glintscape', series: 'creators-edition', tier: 'free', letter: 'light', stencilOpacity: 0.24,
    surface: `${noise(0.22, 0.7)}, linear-gradient(160deg, #6e6659, #4e483e 50%, #5d564a)` },
  { id: 'metamorphite', name: 'Metamorphite', series: 'creators-edition', tier: 'free', letter: 'light', stencilOpacity: 0.2,
    surface: `${noise(0.25, 0.9)}, linear-gradient(150deg, #3a3d40, #26282b 45%, #33363a 80%, #212326)` },
  { id: 'desert', name: 'Desert', series: 'creators-edition', tier: 'free', letter: 'dark', stencilOpacity: 0.26,
    surface: `${noise(0.12, 0.25)}, radial-gradient(130% 100% at 25% 20%, #e7ddcc 0%, transparent 60%), linear-gradient(140deg, #dfd5c2, #cabfa8 55%, #d8cdb8)` },
];

export const getFinish = (id: string): Finish => FINISHES.find((f) => f.id === id) ?? FINISHES[0];
