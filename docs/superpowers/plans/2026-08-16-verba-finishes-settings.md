# Verba Finishes & Settings Implementation Plan (Plan 2 of 4)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** The clock gains the 16-finish EARTH catalog, a Radix slide-over settings panel (finish, language, presentation, IT-IS toggle, brightness), hardware-style seconds mode, and wall presentation.

**Architecture:** Settings live in one versioned localStorage object behind a React context. Finishes are catalog data (`surface` = CSS background layers incl. SVG-noise data-URIs; `letter` = light/dark lit-letter scheme). Seconds mode reuses `ClockFace` — digits are just a different lit-cell set, exactly like the hardware. The Radix Dialog portal keeps the panel outside the dimming filter.

**Tech Stack:** Existing stack + `@radix-ui/react-dialog`, `@radix-ui/react-switch`, `@radix-ui/react-slider`.

**References:** `docs/FINISHES.md` (D14 catalog), spec §Settings/§Finishes, D3 (both presentations), D7 (feature set), D9 (`tier` field).

---

### Task 1: Settings model and persistence

**Files:**
- Create: `src/settings/store.ts`, `src/settings/SettingsContext.tsx`
- Test: `src/settings/store.test.ts`

- [x] **Step 1: Write the failing test `src/settings/store.test.ts`**

```ts
import { beforeEach, describe, expect, it } from 'vitest';
import { DEFAULT_SETTINGS, loadSettings, saveSettings } from './store';

describe('settings store', () => {
  beforeEach(() => localStorage.clear());

  it('returns defaults when storage is empty', () => {
    expect(loadSettings(localStorage)).toEqual(DEFAULT_SETTINGS);
  });

  it('round-trips saved settings', () => {
    const custom = { ...DEFAULT_SETTINGS, finishId: 'rust', brightness: 0.5 };
    saveSettings(localStorage, custom);
    expect(loadSettings(localStorage)).toEqual(custom);
  });

  it('returns defaults on corrupt JSON', () => {
    localStorage.setItem('verba-settings', '{not json');
    expect(loadSettings(localStorage)).toEqual(DEFAULT_SETTINGS);
  });

  it('returns defaults on unknown schema version', () => {
    localStorage.setItem('verba-settings', JSON.stringify({ schemaVersion: 99, finishId: 'rust' }));
    expect(loadSettings(localStorage)).toEqual(DEFAULT_SETTINGS);
  });

  it('fills missing keys from defaults', () => {
    localStorage.setItem('verba-settings', JSON.stringify({ schemaVersion: 1, finishId: 'gold' }));
    expect(loadSettings(localStorage)).toEqual({ ...DEFAULT_SETTINGS, finishId: 'gold' });
  });
});
```

- [x] **Step 2: Run test to verify it fails**

Run: `pnpm vitest run src/settings/store.test.ts`
Expected: FAIL — cannot resolve `./store`.

- [x] **Step 3: Write `src/settings/store.ts`**

```ts
export type Presentation = 'fullbleed' | 'wall';

export type Settings = {
  schemaVersion: 1;
  languageId: string;
  finishId: string;
  presentation: Presentation;
  showItIs: boolean;
  brightness: number;
};

export const DEFAULT_SETTINGS: Settings = {
  schemaVersion: 1,
  languageId: 'en',
  finishId: 'deep-black',
  presentation: 'fullbleed',
  showItIs: true,
  brightness: 1,
};

const KEY = 'verba-settings';

export function loadSettings(storage: Storage): Settings {
  try {
    const raw = storage.getItem(KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw) as Partial<Settings>;
    if (parsed.schemaVersion !== 1) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...parsed };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(storage: Storage, settings: Settings): void {
  storage.setItem(KEY, JSON.stringify(settings));
}
```

- [x] **Step 4: Run test to verify it passes**

Run: `pnpm vitest run src/settings/store.test.ts`
Expected: PASS (5 tests).

- [x] **Step 5: Write `src/settings/SettingsContext.tsx`**

```tsx
import { createContext, useContext, useState, type ReactNode } from 'react';
import { loadSettings, saveSettings, type Settings } from './store';

type SettingsContextValue = {
  settings: Settings;
  update: (patch: Partial<Settings>) => void;
};

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState(() => loadSettings(localStorage));

  const update = (patch: Partial<Settings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      saveSettings(localStorage, next);
      return next;
    });
  };

  return <SettingsContext.Provider value={{ settings, update }}>{children}</SettingsContext.Provider>;
}

export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings requires SettingsProvider');
  return ctx;
}
```

- [x] **Step 6: Commit**

```bash
git add src/settings && git commit -m "Add versioned settings store with React context"
```

---

### Task 2: Finish catalog

**Files:**
- Create: `src/finishes/catalog.ts`
- Test: `src/finishes/catalog.test.ts`

- [x] **Step 1: Write the failing test `src/finishes/catalog.test.ts`**

```ts
import { describe, expect, it } from 'vitest';
import { FINISHES, getFinish } from './catalog';

describe('finish catalog', () => {
  it('contains the 16 EARTH finishes from docs/FINISHES.md', () => {
    expect(FINISHES).toHaveLength(16);
  });

  it('has unique ids', () => {
    expect(new Set(FINISHES.map((f) => f.id)).size).toBe(FINISHES.length);
  });

  it('keeps stencil opacity in a visible-but-subtle range', () => {
    for (const f of FINISHES) {
      expect(f.stencilOpacity).toBeGreaterThan(0);
      expect(f.stencilOpacity).toBeLessThanOrEqual(0.35);
    }
  });

  it('every finish has a non-empty surface and valid tier', () => {
    for (const f of FINISHES) {
      expect(f.surface.length).toBeGreaterThan(0);
      expect(['free', 'premium']).toContain(f.tier);
    }
  });

  it('falls back to deep-black for unknown ids', () => {
    expect(getFinish('nope').id).toBe('deep-black');
    expect(getFinish('rust').id).toBe('rust');
  });
});
```

- [x] **Step 2: Run test to verify it fails**

Run: `pnpm vitest run src/finishes/catalog.test.ts`
Expected: FAIL — cannot resolve `./catalog`.

- [x] **Step 3: Write `src/finishes/catalog.ts`**

```ts
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
```

- [x] **Step 4: Run test to verify it passes**

Run: `pnpm vitest run src/finishes/catalog.test.ts`
Expected: PASS (5 tests).

- [x] **Step 5: Commit**

```bash
git add src/finishes && git commit -m "Add 16-finish EARTH catalog with procedural surfaces"
```

---

### Task 3: Finish-aware face rendering

**Files:**
- Modify: `src/components/ClockFace.tsx`, `src/components/CornerDots.tsx`
- Modify test: `src/components/ClockFace.test.tsx`

- [x] **Step 1: Extend the test — add a finish-scheme case and update props**

Replace `src/components/ClockFace.test.tsx` with:

```tsx
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { resolveTime } from '../clock/engine';
import { english } from '../clock/languages/en';
import { getFinish } from '../finishes/catalog';
import { ClockFace } from './ClockFace';

const deepBlack = getFinish('deep-black');

describe('ClockFace', () => {
  it('renders all 110 cells', () => {
    const { container } = render(<ClockFace rows={english.rows} lit={new Set<string>()} finish={deepBlack} />);
    expect(container.querySelectorAll('[data-lit]')).toHaveLength(110);
  });

  it('lights exactly the resolved words in reading order', () => {
    const { lit } = resolveTime(10, 17, english, true);
    const { container } = render(<ClockFace rows={english.rows} lit={lit} finish={deepBlack} />);
    const on = [...container.querySelectorAll('[data-lit="true"]')];
    expect(on.map((el) => el.textContent).join('')).toBe('ITISAQUARTERPASTTEN');
  });

  it('uses dark letters on light finishes', () => {
    const { lit } = resolveTime(10, 17, english, true);
    const { container } = render(<ClockFace rows={english.rows} lit={lit} finish={getFinish('gold')} />);
    const litCell = container.querySelector('[data-lit="true"]');
    expect(litCell?.className).toContain('text-[#181614]');
  });
});
```

- [x] **Step 2: Run to verify the new/changed tests fail**

Run: `pnpm vitest run src/components/ClockFace.test.tsx`
Expected: FAIL — `finish` prop not accepted / class assertions.

- [x] **Step 3: Update `src/components/ClockFace.tsx`**

```tsx
import { cellKey } from '../clock/engine';
import type { Finish } from '../finishes/catalog';

type ClockFaceProps = {
  rows: string[];
  lit: ReadonlySet<string>;
  finish: Finish;
};

export function ClockFace({ rows, lit, finish }: ClockFaceProps) {
  const cols = rows[0].length;
  const litClass =
    finish.letter === 'light'
      ? 'text-white [text-shadow:0_0_0.4em_rgba(255,255,255,0.55)]'
      : 'text-[#181614] [text-shadow:0_0_0.3em_rgba(0,0,0,0.3)]';
  const stencilColor =
    finish.letter === 'light'
      ? `rgba(255,255,255,${finish.stencilOpacity})`
      : `rgba(0,0,0,${finish.stencilOpacity})`;

  return (
    <div
      className="grid w-[min(82vw,82vh)] select-none font-medium tracking-widest"
      style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`, fontSize: 'min(4.2vw, 4.2vh)' }}
    >
      {rows.flatMap((row, r) =>
        [...row].map((ch, c) => {
          const on = lit.has(cellKey(r, c));
          return (
            <span
              key={cellKey(r, c)}
              className={`flex aspect-square items-center justify-center transition-colors duration-[600ms] ${on ? litClass : ''}`}
              style={on ? undefined : { color: stencilColor }}
              data-lit={on}
            >
              {ch}
            </span>
          );
        }),
      )}
    </div>
  );
}
```

- [x] **Step 4: Update `src/components/CornerDots.tsx`**

```tsx
type CornerDotsProps = {
  count: number;
  letter: 'light' | 'dark';
};

// Dots light clockwise from top-left, matching the hardware
const CORNERS = ['top-4 left-4', 'top-4 right-4', 'bottom-4 right-4', 'bottom-4 left-4'];

export function CornerDots({ count, letter }: CornerDotsProps) {
  const onClass =
    letter === 'light' ? 'bg-white [box-shadow:0_0_10px_rgba(255,255,255,0.55)]' : 'bg-[#181614] [box-shadow:0_0_8px_rgba(0,0,0,0.35)]';
  const offClass = letter === 'light' ? 'bg-white/15' : 'bg-black/20';

  return (
    <>
      {CORNERS.map((corner, index) => (
        <span
          key={corner}
          className={`absolute size-2 rounded-full transition-colors duration-[600ms] ${corner} ${index < count ? onClass : offClass}`}
          data-lit={index < count}
        />
      ))}
    </>
  );
}
```

- [x] **Step 5: Fix `src/App.tsx` compile errors minimally** (full rewrite comes in Task 7)

```tsx
import { resolveTime } from './clock/engine';
import { english } from './clock/languages/en';
import { useClockTime } from './clock/use-clock-time';
import { ClockFace } from './components/ClockFace';
import { CornerDots } from './components/CornerDots';
import { getFinish } from './finishes/catalog';

export function App() {
  const time = useClockTime();
  const finish = getFinish('deep-black');
  const { lit, dots } = resolveTime(time.getHours(), time.getMinutes(), english, true);

  return (
    <main
      className="relative flex h-dvh w-dvw items-center justify-center overflow-hidden font-[DINish]"
      style={{ background: finish.surface }}
    >
      <CornerDots count={dots} letter={finish.letter} />
      <ClockFace rows={english.rows} lit={lit} finish={finish} />
    </main>
  );
}
```

- [x] **Step 6: Run full suite and build**

Run: `pnpm test && pnpm build`
Expected: all tests PASS (34), build OK.

- [x] **Step 7: Commit**

```bash
git add -A && git commit -m "Render face and dots per finish letter scheme"
```

---

### Task 4: Seconds mode

**Files:**
- Create: `src/clock/seconds.ts`
- Test: `src/clock/seconds.test.ts`

- [x] **Step 1: Write the failing test `src/clock/seconds.test.ts`**

```ts
import { describe, expect, it } from 'vitest';
import { DIGITS, resolveSeconds } from './seconds';

describe('digit patterns', () => {
  it('defines 0-9 as 7x5 bitmaps', () => {
    for (const digit of '0123456789') {
      const rows = DIGITS[digit];
      expect(rows).toHaveLength(7);
      for (const row of rows) expect(row).toMatch(/^[01]{5}$/);
    }
  });

  it('all ten patterns are distinct', () => {
    expect(new Set(Object.values(DIGITS).map((rows) => rows.join(''))).size).toBe(10);
  });
});

describe('resolveSeconds', () => {
  it('renders 00 as two zeros with 19 cells each', () => {
    const lit = resolveSeconds(0);
    expect(lit.size).toBe(38);
    expect(lit.has('1:1')).toBe(true);   // top bar of left zero
    expect(lit.has('1:0')).toBe(false);
    expect(lit.has('1:7')).toBe(true);   // top bar of right zero
  });

  it('places tens digit left, ones digit right', () => {
    const lit = resolveSeconds(42);
    expect(lit.has('1:3')).toBe(true);   // '4' top row 00010 at col offset 0
    expect(lit.has('1:8')).toBe(true);   // '2' top row 01110 at col offset 6
  });

  it('pads single digits with a leading zero', () => {
    expect(resolveSeconds(7).has('1:1')).toBe(true); // leading zero top bar on the left
  });
});
```

- [x] **Step 2: Run test to verify it fails**

Run: `pnpm vitest run src/clock/seconds.test.ts`
Expected: FAIL — cannot resolve `./seconds`.

- [x] **Step 3: Write `src/clock/seconds.ts`**

```ts
import { cellKey } from './engine';

export const DIGITS: Record<string, string[]> = {
  '0': ['01110', '10001', '10011', '10101', '11001', '10001', '01110'],
  '1': ['00100', '01100', '00100', '00100', '00100', '00100', '01110'],
  '2': ['01110', '10001', '00001', '00010', '00100', '01000', '11111'],
  '3': ['11111', '00010', '00100', '00010', '00001', '10001', '01110'],
  '4': ['00010', '00110', '01010', '10010', '11111', '00010', '00010'],
  '5': ['11111', '10000', '11110', '00001', '00001', '10001', '01110'],
  '6': ['00110', '01000', '10000', '11110', '10001', '10001', '01110'],
  '7': ['11111', '00001', '00010', '00100', '01000', '01000', '01000'],
  '8': ['01110', '10001', '10001', '01110', '10001', '10001', '01110'],
  '9': ['01110', '10001', '10001', '01111', '00001', '00010', '01100'],
};

// Digits use the letter grid as pixels, like the hardware's seconds display
export function resolveSeconds(seconds: number, cols = 11, rows = 10): ReadonlySet<string> {
  const text = String(seconds).padStart(2, '0');
  const rowOffset = Math.floor((rows - 7) / 2);
  const lit = new Set<string>();
  [...text].forEach((digit, index) => {
    const colOffset = index === 0 ? 0 : cols - 5;
    DIGITS[digit].forEach((line, r) => {
      [...line].forEach((bit, c) => {
        if (bit === '1') lit.add(cellKey(rowOffset + r, colOffset + c));
      });
    });
  });
  return lit;
}
```

- [x] **Step 4: Run test to verify it passes**

Run: `pnpm vitest run src/clock/seconds.test.ts`
Expected: PASS (5 tests).

- [x] **Step 5: Commit**

```bash
git add src/clock/seconds.ts src/clock/seconds.test.ts
git commit -m "Add seconds mode digits rendered on the letter grid"
```

---

### Task 5: Language registry

**Files:**
- Create: `src/clock/languages/index.ts`

- [x] **Step 1: Write `src/clock/languages/index.ts`** (Plan 3 appends here; keeps App decoupled from individual languages)

```ts
import type { LanguageDef } from '../types';
import { english } from './en';

export const LANGUAGES: LanguageDef[] = [english];

export const getLanguage = (id: string): LanguageDef => LANGUAGES.find((l) => l.id === id) ?? english;
```

- [x] **Step 2: Verify compile**

Run: `pnpm build`
Expected: OK.

- [x] **Step 3: Commit**

```bash
git add src/clock/languages/index.ts && git commit -m "Add language registry"
```

---

### Task 6: Radix settings panel

**Files:**
- Create: `src/settings/SettingsPanel.tsx`
- Test: `src/settings/SettingsPanel.test.tsx`
- Modify: `package.json` (new deps)

- [x] **Step 1: Install Radix primitives**

Run: `pnpm add @radix-ui/react-dialog @radix-ui/react-switch @radix-ui/react-slider`

- [x] **Step 2: Write the failing test `src/settings/SettingsPanel.test.tsx`**

```tsx
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { SettingsPanel } from './SettingsPanel';
import { SettingsProvider } from './SettingsContext';
import { loadSettings } from './store';

function renderPanel() {
  return render(
    <SettingsProvider>
      <SettingsPanel />
    </SettingsProvider>,
  );
}

describe('SettingsPanel', () => {
  beforeEach(() => localStorage.clear());

  it('opens via the gear button', () => {
    renderPanel();
    fireEvent.click(screen.getByRole('button', { name: /settings/i }));
    expect(screen.getByText('Finish')).toBeInTheDocument();
  });

  it('persists a finish selection', () => {
    renderPanel();
    fireEvent.click(screen.getByRole('button', { name: /settings/i }));
    fireEvent.click(screen.getByRole('button', { name: 'Rust' }));
    expect(loadSettings(localStorage).finishId).toBe('rust');
  });

  it('persists the presentation choice', () => {
    renderPanel();
    fireEvent.click(screen.getByRole('button', { name: /settings/i }));
    fireEvent.click(screen.getByRole('button', { name: 'Wall' }));
    expect(loadSettings(localStorage).presentation).toBe('wall');
  });
});
```

- [x] **Step 3: Run test to verify it fails**

Run: `pnpm vitest run src/settings/SettingsPanel.test.tsx`
Expected: FAIL — cannot resolve `./SettingsPanel`.

- [x] **Step 4: Write `src/settings/SettingsPanel.tsx`**

```tsx
import * as React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import * as Slider from '@radix-ui/react-slider';
import * as Switch from '@radix-ui/react-switch';
import { LANGUAGES } from '../clock/languages';
import { FINISHES } from '../finishes/catalog';
import { useSettings } from './SettingsContext';
import type { Presentation } from './store';

const PRESENTATIONS: { value: Presentation; label: string }[] = [
  { value: 'fullbleed', label: 'Full-bleed' },
  { value: 'wall', label: 'Wall' },
];

export function SettingsPanel() {
  const { settings, update } = useSettings();

  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <button
          aria-label="Settings"
          className="fixed right-5 bottom-5 z-10 rounded-full p-2 text-xl opacity-30 transition-opacity hover:opacity-100"
          onClick={(event: React.MouseEvent<HTMLButtonElement>) => event.stopPropagation()}
        >
          ⚙
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40" />
        <Dialog.Content className="fixed top-0 right-0 z-20 h-dvh w-80 overflow-y-auto bg-neutral-900/95 p-6 text-neutral-100 backdrop-blur">
          <Dialog.Title className="mb-6 text-sm font-semibold tracking-[0.3em] uppercase">Verba</Dialog.Title>

          <section className="mb-6">
            <h3 className="mb-3 text-xs tracking-widest text-neutral-400 uppercase">Finish</h3>
            <div className="grid grid-cols-4 gap-3">
              {FINISHES.map((finish) => (
                <button
                  key={finish.id}
                  aria-label={finish.name}
                  title={finish.name}
                  className={`aspect-square rounded-full border ${
                    settings.finishId === finish.id ? 'border-white ring-2 ring-white/60' : 'border-white/20'
                  }`}
                  style={{ background: finish.surface }}
                  onClick={() => update({ finishId: finish.id })}
                />
              ))}
            </div>
          </section>

          <section className="mb-6">
            <h3 className="mb-3 text-xs tracking-widest text-neutral-400 uppercase">Language</h3>
            {LANGUAGES.map((lang) => (
              <button
                key={lang.id}
                className={`mb-1 block w-full rounded px-3 py-2 text-left text-sm ${
                  settings.languageId === lang.id ? 'bg-white/15' : 'hover:bg-white/5'
                }`}
                onClick={() => update({ languageId: lang.id })}
              >
                {lang.name} — {lang.sample}
              </button>
            ))}
          </section>

          <section className="mb-6">
            <h3 className="mb-3 text-xs tracking-widest text-neutral-400 uppercase">Presentation</h3>
            <div className="flex gap-2">
              {PRESENTATIONS.map((p) => (
                <button
                  key={p.value}
                  className={`flex-1 rounded px-3 py-2 text-sm ${
                    settings.presentation === p.value ? 'bg-white/15' : 'bg-white/5 hover:bg-white/10'
                  }`}
                  onClick={() => update({ presentation: p.value })}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </section>

          <section className="mb-6 flex items-center justify-between">
            <h3 className="text-xs tracking-widest text-neutral-400 uppercase">"It is" words</h3>
            <Switch.Root
              checked={settings.showItIs}
              onCheckedChange={(checked) => update({ showItIs: checked })}
              className="h-6 w-10 rounded-full bg-white/15 data-[state=checked]:bg-white/60"
            >
              <Switch.Thumb className="block size-5 translate-x-0.5 rounded-full bg-white transition-transform data-[state=checked]:translate-x-[18px]" />
            </Switch.Root>
          </section>

          <section className="mb-6">
            <h3 className="mb-3 text-xs tracking-widest text-neutral-400 uppercase">Brightness</h3>
            <Slider.Root
              value={[settings.brightness]}
              min={0.2}
              max={1}
              step={0.05}
              onValueChange={([value]) => update({ brightness: value })}
              className="relative flex h-5 items-center"
            >
              <Slider.Track className="relative h-1 grow rounded-full bg-white/15">
                <Slider.Range className="absolute h-full rounded-full bg-white/60" />
              </Slider.Track>
              <Slider.Thumb aria-label="Brightness" className="block size-4 rounded-full bg-white" />
            </Slider.Root>
          </section>

          <Dialog.Close asChild>
            <button className="mt-2 w-full rounded bg-white/10 px-3 py-2 text-sm hover:bg-white/20">Close</button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
```

- [x] **Step 5: Run test to verify it passes**

Run: `pnpm vitest run src/settings/SettingsPanel.test.tsx`
Expected: PASS (3 tests).

- [x] **Step 6: Commit**

```bash
git add -A && git commit -m "Add Radix settings panel with finish swatches and controls"
```

---

### Task 7: Final assembly — presentations, seconds toggle, dimming

**Files:**
- Modify: `src/App.tsx` (full rewrite below)

- [x] **Step 1: Rewrite `src/App.tsx`**

```tsx
import { useState } from 'react';
import { resolveTime } from './clock/engine';
import { getLanguage } from './clock/languages';
import { resolveSeconds } from './clock/seconds';
import { useClockTime } from './clock/use-clock-time';
import { ClockFace } from './components/ClockFace';
import { CornerDots } from './components/CornerDots';
import { getFinish } from './finishes/catalog';
import { SettingsProvider, useSettings } from './settings/SettingsContext';
import { SettingsPanel } from './settings/SettingsPanel';

export function App() {
  return (
    <SettingsProvider>
      <ClockScreen />
      <SettingsPanel />
    </SettingsProvider>
  );
}

type Mode = 'words' | 'seconds';

function ClockScreen() {
  const { settings } = useSettings();
  const time = useClockTime();
  const [mode, setMode] = useState<Mode>('words');

  const lang = getLanguage(settings.languageId);
  const finish = getFinish(settings.finishId);
  const display = resolveTime(time.getHours(), time.getMinutes(), lang, settings.showItIs);
  const lit = mode === 'words' ? display.lit : resolveSeconds(time.getSeconds());

  const toggleMode = () => setMode((prev) => (prev === 'words' ? 'seconds' : 'words'));

  const face = (
    <>
      {mode === 'words' && <CornerDots count={display.dots} letter={finish.letter} />}
      <ClockFace rows={lang.rows} lit={lit} finish={finish} />
    </>
  );

  if (settings.presentation === 'wall') {
    return (
      <main
        className="flex h-dvh w-dvw items-center justify-center overflow-hidden bg-[radial-gradient(120%_100%_at_50%_20%,#38342f,#211f1c)] font-[DINish]"
        style={{ filter: `brightness(${settings.brightness})` }}
        onClick={toggleMode}
      >
        <div
          className="relative flex aspect-square h-[min(80vh,80vw)] items-center justify-center [box-shadow:0_25px_50px_rgba(0,0,0,0.6),0_4px_10px_rgba(0,0,0,0.4)]"
          style={{ background: finish.surface }}
        >
          {face}
        </div>
      </main>
    );
  }

  return (
    <main
      className="relative flex h-dvh w-dvw items-center justify-center overflow-hidden font-[DINish]"
      style={{ background: finish.surface, filter: `brightness(${settings.brightness})` }}
      onClick={toggleMode}
    >
      {face}
    </main>
  );
}
```

Note: `ClockFace` sizes with `min(82vw,82vh)` which overflows the wall panel slightly — acceptable for this step only if visually verified; if it overflows, change the grid width class in `ClockFace.tsx` from `w-[min(82vw,82vh)]` to `w-[74%]` and font-size style to `fontSize: 'min(3.4vw, 3.4vh)'` — verify both presentations after.

- [x] **Step 2: Run full suite and build**

Run: `pnpm test && pnpm build`
Expected: all tests PASS, build OK.

- [x] **Step 3: Visual verification (dev server + Playwright)**

With dev server running: check full-bleed Deep Black; open settings → pick Rust, Gold (dark letters), Wall mode; click face → seconds digits tick; brightness slider dims. Save screenshots of at least Rust full-bleed + Wall mode into `mockups/` (never deleted), e.g. `mockups/plan2-rust-2026-08-16.png`, `mockups/plan2-wall-2026-08-16.png`.

- [x] **Step 4: Commit**

```bash
git add -A && git commit -m "Assemble settings-driven clock with presentations, seconds mode, dimming"
```
