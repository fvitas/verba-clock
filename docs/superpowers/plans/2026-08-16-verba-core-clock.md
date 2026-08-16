# Verba Core Clock Implementation Plan (Plan 1 of 4)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A working full-bleed English word clock in the browser — pure clock engine, verified English matrix, rendered face with corner minute dots.

**Architecture:** Vite + React + TS + Tailwind static SPA. The clock core (`src/clock/`) is pure TypeScript with zero React: a `LanguageDef` (grid + word coordinates + phrase function) resolved by `engine.ts` into a set of lit cells. React components only paint that result.

**Tech Stack:** Vite, React 19, TypeScript (strict), Tailwind v4, Vitest + Testing Library, pnpm. Font: Barlow (placeholder pending typography mockup decision).

**Follow-up plans:** Plan 2 finishes + settings + seconds mode + wall mode; Plan 3 remaining languages; Plan 4 PWA + Vercel + Capacitor + stores.

**Spec:** `docs/superpowers/specs/2026-08-16-verba-word-clock-design.md` · **Decisions:** `docs/DECISIONS.md`

---

### Task 1: Scaffold the project

**Files:**
- Create: `package.json`, `vite.config.ts`, `tsconfig.json`, `index.html`, `.gitignore`, `src/main.tsx`, `src/index.css`, `src/test-setup.ts`, `src/App.tsx` (placeholder)

- [ ] **Step 1: Write `package.json`**

```json
{
  "name": "verba",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc --noEmit && vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "@fontsource/barlow": "^5.2.0",
    "react": "^19.1.0",
    "react-dom": "^19.1.0"
  },
  "devDependencies": {
    "@tailwindcss/vite": "^4.1.0",
    "@testing-library/jest-dom": "^6.6.0",
    "@testing-library/react": "^16.3.0",
    "@types/react": "^19.1.0",
    "@types/react-dom": "^19.1.0",
    "@vitejs/plugin-react": "^4.5.0",
    "jsdom": "^26.0.0",
    "tailwindcss": "^4.1.0",
    "typescript": "~5.8.0",
    "vitest": "^3.2.0"
  }
}
```

- [ ] **Step 2: Write `vite.config.ts`** (vitest config lives here too)

```ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test-setup.ts',
  },
});
```

- [ ] **Step 3: Write `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "skipLibCheck": true,
    "noEmit": true,
    "types": ["vitest/globals", "@testing-library/jest-dom"]
  },
  "include": ["src", "vite.config.ts"]
}
```

- [ ] **Step 4: Write `index.html`**

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
    <title>Verba</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 5: Write `.gitignore`**

```
node_modules
dist
```

- [ ] **Step 6: Write `src/index.css`** (Tailwind entry — the only CSS file)

```css
@import "tailwindcss";
```

- [ ] **Step 7: Write `src/test-setup.ts`**

```ts
import '@testing-library/jest-dom/vitest';
```

- [ ] **Step 8: Write `src/main.tsx`**

```tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource/barlow/500.css';
import './index.css';
import { App } from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
```

- [ ] **Step 9: Write placeholder `src/App.tsx`** (replaced in Task 5)

```tsx
export function App() {
  return <main className="flex h-dvh items-center justify-center bg-[#050506] text-white">VERBA</main>;
}
```

- [ ] **Step 10: Install and verify**

Run: `pnpm install && pnpm build`
Expected: build succeeds, `dist/` created.

Run: `pnpm dev` briefly, load http://localhost:5173, expect black page with "VERBA".

- [ ] **Step 11: Commit**

```bash
git add -A && git commit -m "Scaffold Vite + React + TS + Tailwind project"
```

---

### Task 2: Clock types and engine

**Files:**
- Create: `src/clock/types.ts`, `src/clock/engine.ts`
- Test: `src/clock/engine.test.ts`

- [ ] **Step 1: Write `src/clock/types.ts`** (needed by the test)

```ts
export type WordCoord = {
  text: string;
  row: number;
  start: number;
  end: number;
};

export type LanguageDef = {
  id: string;
  name: string;
  sample: string;
  rows: string[];
  itIs: WordCoord[];
  words: WordCoord[];
  phrase: (hours: number, minutes: number) => WordCoord[];
};

export const word = (text: string, row: number, start: number): WordCoord => ({
  text,
  row,
  start,
  end: start + text.length - 1,
});
```

- [ ] **Step 2: Write the failing test `src/clock/engine.test.ts`**

```ts
import { describe, expect, it } from 'vitest';
import { cellKey, resolveTime } from './engine';
import { word, type LanguageDef } from './types';

const AB = word('AB', 0, 0);
const DE = word('DE', 1, 0);
const F = word('F', 1, 2);

const fake: LanguageDef = {
  id: 'fake',
  name: 'Fake',
  sample: 'AB',
  rows: ['ABC', 'DEF'],
  itIs: [AB],
  words: [AB, DE, F],
  phrase: (_hours, minutes) => (minutes < 30 ? [DE] : [F]),
};

describe('resolveTime', () => {
  it('lights it-is words plus phrase words', () => {
    const { lit } = resolveTime(10, 0, fake, true);
    expect(lit).toEqual(new Set(['0:0', '0:1', '1:0', '1:1']));
  });

  it('omits it-is words when disabled', () => {
    const { lit } = resolveTime(10, 0, fake, false);
    expect(lit).toEqual(new Set(['1:0', '1:1']));
  });

  it('sets corner dots to minutes modulo five', () => {
    expect(resolveTime(10, 0, fake, true).dots).toBe(0);
    expect(resolveTime(10, 17, fake, true).dots).toBe(2);
    expect(resolveTime(10, 59, fake, true).dots).toBe(4);
  });
});

describe('cellKey', () => {
  it('formats row and column', () => {
    expect(cellKey(3, 10)).toBe('3:10');
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `pnpm vitest run src/clock/engine.test.ts`
Expected: FAIL — cannot resolve `./engine`.

- [ ] **Step 4: Write `src/clock/engine.ts`**

```ts
import type { LanguageDef } from './types';

export type ClockDisplay = {
  lit: ReadonlySet<string>;
  dots: number;
};

export const cellKey = (row: number, col: number): string => `${row}:${col}`;

export function resolveTime(
  hours: number,
  minutes: number,
  lang: LanguageDef,
  showItIs: boolean,
): ClockDisplay {
  const words = [...(showItIs ? lang.itIs : []), ...lang.phrase(hours, minutes)];
  const lit = new Set<string>();
  for (const w of words) {
    for (let col = w.start; col <= w.end; col++) lit.add(cellKey(w.row, col));
  }
  return { lit, dots: minutes % 5 };
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `pnpm vitest run src/clock/engine.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 6: Commit**

```bash
git add src/clock && git commit -m "Add clock engine resolving language words to lit cells"
```

---

### Task 3: English language definition

**Files:**
- Create: `src/clock/languages/en.ts`
- Create: `docs/LANGUAGES.md`
- Test: `src/clock/languages/en.test.ts`

The classic English 11×10 matrix:

```
ITLISASAMPM
ACQUARTERDC
TWENTYFIVEX
HALFSTENFTO
PASTERUNINE
ONESIXTHREE
FOURFIVETWO
EIGHTELEVEN
SEVENTWELVE
TENSEOCLOCK
```

- [ ] **Step 1: Write the failing test `src/clock/languages/en.test.ts`**

`spell()` reproduces the sentence in reading order (row, then column) — tests read like the clock face.

```ts
import { describe, expect, it } from 'vitest';
import { english } from './en';

function spell(hours: number, minutes: number): string {
  return [...english.itIs, ...english.phrase(hours, minutes)]
    .sort((a, b) => a.row - b.row || a.start - b.start)
    .map((w) => w.text)
    .join(' ');
}

describe('english grid integrity', () => {
  it('is an 11x10 matrix', () => {
    expect(english.rows).toHaveLength(10);
    for (const row of english.rows) expect(row).toHaveLength(11);
  });

  it('every word coordinate spells its text in the grid', () => {
    for (const w of english.words) {
      expect(english.rows[w.row].slice(w.start, w.end + 1)).toBe(w.text);
    }
  });
});

describe('english time phrases', () => {
  it.each([
    [10, 0, 'IT IS TEN OCLOCK'],
    [10, 4, 'IT IS TEN OCLOCK'],
    [10, 5, 'IT IS FIVE PAST TEN'],
    [10, 10, 'IT IS TEN PAST TEN'],
    [10, 17, 'IT IS A QUARTER PAST TEN'],
    [10, 20, 'IT IS TWENTY PAST TEN'],
    [10, 25, 'IT IS TWENTY FIVE PAST TEN'],
    [9, 30, 'IT IS HALF PAST NINE'],
    [10, 35, 'IT IS TWENTY FIVE TO ELEVEN'],
    [10, 40, 'IT IS TWENTY TO ELEVEN'],
    [10, 45, 'IT IS A QUARTER TO ELEVEN'],
    [23, 50, 'IT IS TEN TO TWELVE'],
    [12, 55, 'IT IS FIVE TO ONE'],
    [0, 0, 'IT IS TWELVE OCLOCK'],
    [12, 0, 'IT IS TWELVE OCLOCK'],
    [0, 59, 'IT IS FIVE TO ONE'],
  ])('%i:%i → "%s"', (hours, minutes, expected) => {
    expect(spell(hours, minutes)).toBe(expected);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm vitest run src/clock/languages/en.test.ts`
Expected: FAIL — cannot resolve `./en`.

- [ ] **Step 3: Write `src/clock/languages/en.ts`**

```ts
import { word, type LanguageDef, type WordCoord } from '../types';

const IT = word('IT', 0, 0);
const IS = word('IS', 0, 3);
const A = word('A', 1, 0);
const QUARTER = word('QUARTER', 1, 2);
const TWENTY = word('TWENTY', 2, 0);
const FIVE_MIN = word('FIVE', 2, 6);
const HALF = word('HALF', 3, 0);
const TEN_MIN = word('TEN', 3, 5);
const TO = word('TO', 3, 9);
const PAST = word('PAST', 4, 0);
const NINE = word('NINE', 4, 7);
const ONE = word('ONE', 5, 0);
const SIX = word('SIX', 5, 3);
const THREE = word('THREE', 5, 6);
const FOUR = word('FOUR', 6, 0);
const FIVE_HOUR = word('FIVE', 6, 4);
const TWO = word('TWO', 6, 8);
const EIGHT = word('EIGHT', 7, 0);
const ELEVEN = word('ELEVEN', 7, 5);
const SEVEN = word('SEVEN', 8, 0);
const TWELVE = word('TWELVE', 8, 5);
const TEN_HOUR = word('TEN', 9, 0);
const OCLOCK = word('OCLOCK', 9, 5);

const HOURS = [TWELVE, ONE, TWO, THREE, FOUR, FIVE_HOUR, SIX, SEVEN, EIGHT, NINE, TEN_HOUR, ELEVEN];

const MINUTE_WORDS: Record<number, WordCoord[]> = {
  5: [FIVE_MIN, PAST],
  10: [TEN_MIN, PAST],
  15: [A, QUARTER, PAST],
  20: [TWENTY, PAST],
  25: [TWENTY, FIVE_MIN, PAST],
  30: [HALF, PAST],
  35: [TWENTY, FIVE_MIN, TO],
  40: [TWENTY, TO],
  45: [A, QUARTER, TO],
  50: [TEN_MIN, TO],
  55: [FIVE_MIN, TO],
};

function phrase(hours: number, minutes: number): WordCoord[] {
  const m = Math.floor(minutes / 5) * 5;
  const hour = HOURS[(m >= 35 ? hours + 1 : hours) % 12];
  return m === 0 ? [hour, OCLOCK] : [...MINUTE_WORDS[m], hour];
}

export const english: LanguageDef = {
  id: 'en',
  name: 'English',
  sample: 'IT IS',
  rows: [
    'ITLISASAMPM',
    'ACQUARTERDC',
    'TWENTYFIVEX',
    'HALFSTENFTO',
    'PASTERUNINE',
    'ONESIXTHREE',
    'FOURFIVETWO',
    'EIGHTELEVEN',
    'SEVENTWELVE',
    'TENSEOCLOCK',
  ],
  itIs: [IT, IS],
  words: [IT, IS, A, QUARTER, TWENTY, FIVE_MIN, HALF, TEN_MIN, TO, PAST, NINE, ONE, SIX, THREE, FOUR, FIVE_HOUR, TWO, EIGHT, ELEVEN, SEVEN, TWELVE, TEN_HOUR, OCLOCK],
  phrase,
};
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm vitest run src/clock/languages/en.test.ts`
Expected: PASS (18 tests).

- [ ] **Step 5: Create `docs/LANGUAGES.md`**

```markdown
# Language Verification Status

A language ships only when `verified`. Discarded languages keep their row with the reason (per D4).

| Language | File | Status | Notes |
|---|---|---|---|
| English | `src/clock/languages/en.ts` | verified | Table-driven spec, 16 phrase cases + grid integrity |
| German | — | pending | incl. regional variants (dreiviertel) |
| French | — | pending | |
| Italian | — | pending | |
| Spanish | — | pending | |
| Dutch | — | pending | |
| Serbian (custom) | — | pending | our own matrix; user is native verifier (D4b) |
| Remaining QLOCKTWO catalog | — | pending | enumerate during Plan 3 |
```

- [ ] **Step 6: Commit**

```bash
git add src/clock/languages docs/LANGUAGES.md
git commit -m "Add verified English language matrix and phrase logic"
```

---

### Task 4: Clock time hook

**Files:**
- Create: `src/clock/use-clock-time.ts`
- Test: `src/clock/use-clock-time.test.ts`

- [ ] **Step 1: Write the failing test `src/clock/use-clock-time.test.ts`**

```ts
import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useClockTime } from './use-clock-time';

describe('useClockTime', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-08-16T10:17:00'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns the current time', () => {
    const { result } = renderHook(() => useClockTime());
    expect(result.current.getHours()).toBe(10);
    expect(result.current.getMinutes()).toBe(17);
  });

  it('ticks forward once per second', () => {
    const { result } = renderHook(() => useClockTime());
    act(() => vi.advanceTimersByTime(60_000));
    expect(result.current.getMinutes()).toBe(18);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm vitest run src/clock/use-clock-time.test.ts`
Expected: FAIL — cannot resolve `./use-clock-time`.

- [ ] **Step 3: Write `src/clock/use-clock-time.ts`**

1-second tick: the minute display only changes per minute (cheap re-render), and seconds mode (Plan 2) needs per-second updates.

```ts
import { useEffect, useState } from 'react';

export function useClockTime(): Date {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1_000);
    return () => clearInterval(id);
  }, []);

  return now;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm vitest run src/clock/use-clock-time.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add src/clock/use-clock-time.ts src/clock/use-clock-time.test.ts
git commit -m "Add ticking clock time hook"
```

---

### Task 5: Face components and app assembly

**Files:**
- Create: `src/components/ClockFace.tsx`, `src/components/CornerDots.tsx`
- Modify: `src/App.tsx` (replace placeholder)
- Test: `src/components/ClockFace.test.tsx`

- [ ] **Step 1: Write the failing test `src/components/ClockFace.test.tsx`**

```tsx
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { resolveTime } from '../clock/engine';
import { english } from '../clock/languages/en';
import { ClockFace } from './ClockFace';

describe('ClockFace', () => {
  it('renders all 110 cells', () => {
    const { container } = render(<ClockFace rows={english.rows} lit={new Set<string>()} />);
    expect(container.querySelectorAll('[data-lit]')).toHaveLength(110);
  });

  it('lights exactly the resolved words in reading order', () => {
    const { lit } = resolveTime(10, 17, english, true);
    const { container } = render(<ClockFace rows={english.rows} lit={lit} />);
    const on = [...container.querySelectorAll('[data-lit="true"]')];
    expect(on.map((el) => el.textContent).join('')).toBe('ITISAQUARTERPASTTEN');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm vitest run src/components/ClockFace.test.tsx`
Expected: FAIL — cannot resolve `./ClockFace`.

- [ ] **Step 3: Write `src/components/ClockFace.tsx`**

```tsx
import { cellKey } from '../clock/engine';

type ClockFaceProps = {
  rows: string[];
  lit: ReadonlySet<string>;
};

export function ClockFace({ rows, lit }: ClockFaceProps) {
  const cols = rows[0].length;
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
              className={`flex aspect-square items-center justify-center transition-colors duration-[600ms] ${
                on ? 'text-white [text-shadow:0_0_0.4em_rgba(255,255,255,0.55)]' : 'text-white/15'
              }`}
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

- [ ] **Step 4: Write `src/components/CornerDots.tsx`**

Dots light clockwise from top-left, matching the hardware.

```tsx
type CornerDotsProps = {
  count: number;
};

const CORNERS = ['top-4 left-4', 'top-4 right-4', 'bottom-4 right-4', 'bottom-4 left-4'];

export function CornerDots({ count }: CornerDotsProps) {
  return (
    <>
      {CORNERS.map((corner, index) => (
        <span
          key={corner}
          className={`absolute size-2 rounded-full transition-colors duration-[600ms] ${corner} ${
            index < count ? 'bg-white [box-shadow:0_0_10px_rgba(255,255,255,0.55)]' : 'bg-white/15'
          }`}
          data-lit={index < count}
        />
      ))}
    </>
  );
}
```

- [ ] **Step 5: Replace `src/App.tsx`**

```tsx
import { resolveTime } from './clock/engine';
import { english } from './clock/languages/en';
import { useClockTime } from './clock/use-clock-time';
import { ClockFace } from './components/ClockFace';
import { CornerDots } from './components/CornerDots';

export function App() {
  const time = useClockTime();
  const { lit, dots } = resolveTime(time.getHours(), time.getMinutes(), english, true);

  return (
    <main className="relative flex h-dvh w-dvw items-center justify-center overflow-hidden bg-[#050506] font-[Barlow]">
      <CornerDots count={dots} />
      <ClockFace rows={english.rows} lit={lit} />
    </main>
  );
}
```

- [ ] **Step 6: Run the full test suite**

Run: `pnpm test`
Expected: PASS — engine (4), english (18), hook (2), face (2).

- [ ] **Step 7: Verify visually**

Run: `pnpm dev`, open http://localhost:5173. Expected: near-black full-bleed page, faint 11×10 letter stencil, current time lit in white with soft glow, correct corner dots. Compare sentence against a real clock.

- [ ] **Step 8: Commit**

```bash
git add -A && git commit -m "Render full-bleed English word clock with corner minute dots"
```

---

### Task 6: Typography decision mockup

**Files:**
- Create: `mockups/typography-choice.html` (mockups are never deleted — D-rule)

- [ ] **Step 1: Write `mockups/typography-choice.html`**

Candidates from Google Fonts (all free): Barlow (current), Jost (geometric, Futura-like), Archivo (grotesque). One row of the matrix rendered in each at face size, lit + unlit, for side-by-side comparison against QLOCKTWO reference photos.

```html
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>Typography — Barlow vs Jost vs Archivo</title>
<link href="https://fonts.googleapis.com/css2?family=Barlow:wght@500&family=Jost:wght@500&family=Archivo:wght@500&display=swap" rel="stylesheet" />
<style>
  body { background: #050506; color: #eee; font-family: sans-serif; padding: 40px; }
  h1 { font-size: 18px; margin-bottom: 24px; }
  .sample { margin-bottom: 36px; }
  .sample h2 { font-size: 13px; color: #888; margin-bottom: 10px; }
  .grid { display: grid; grid-template-columns: repeat(11, 56px); font-size: 34px; font-weight: 500; text-align: center; }
  .grid span { color: rgba(255,255,255,0.14); line-height: 1.6; }
  .grid span.on { color: #fff; text-shadow: 0 0 14px rgba(255,255,255,0.55); }
  .barlow { font-family: 'Barlow'; } .jost { font-family: 'Jost'; } .archivo { font-family: 'Archivo'; }
</style>
</head>
<body>
<h1>Pick the face typeface — compare against QLOCKTWO reference photos</h1>
<div id="samples"></div>
<script>
  const row = 'ACQUARTERDC';
  const lit = new Set([2,3,4,5,6,7,8]);
  for (const font of ['barlow', 'jost', 'archivo']) {
    const div = document.createElement('div');
    div.className = 'sample';
    div.innerHTML = '<h2>' + font.toUpperCase() + '</h2>';
    const grid = document.createElement('div');
    grid.className = 'grid ' + font;
    [...row].forEach((ch, i) => {
      const s = document.createElement('span');
      s.textContent = ch;
      if (lit.has(i)) s.className = 'on';
      grid.appendChild(s);
    });
    div.appendChild(grid);
    document.getElementById('samples').appendChild(div);
  }
</script>
</body>
</html>
```

- [ ] **Step 2: Open it for the user and record the decision**

Run: `open mockups/typography-choice.html`
Then: append the user's choice to `docs/DECISIONS.md` (D11 — face typeface). If the choice isn't Barlow, update the `@fontsource` import in `src/main.tsx` and `font-[...]` class in `src/App.tsx` (one-line swaps; Jost and Archivo are also on fontsource).

- [ ] **Step 3: Commit**

```bash
git add mockups/typography-choice.html docs/DECISIONS.md
git commit -m "Add typography decision mockup"
```
