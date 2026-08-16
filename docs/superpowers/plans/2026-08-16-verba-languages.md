# Verba Languages Implementation Plan (Plan 3 of 4)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship every European face from `docs/LANGUAGES.md`: German (+ 3 variants), French, Italian, Spanish, Catalan, Dutch, Danish, Norwegian, Swedish, Czech, Romanian, Portuguese, Turkish, Swiss German, English-alt, Russian, Greek — plus the custom Serbian matrix.

**Architecture:** Unchanged — each language is one data file exporting a `LanguageDef` (rows, word coords via `word()`, pure `phrase()`), registered in `src/clock/languages/index.ts`. No engine or UI changes except Greek's font subset.

**The non-negotiable pipeline (per language):**
1. **Research:** find the authentic QLOCKTWO matrix for the language — reference photos of the physical product, retailer images, or established open-source word-clock projects that replicate QLOCKTWO layouts. Record the source URL in a comment at the top of the language file AND in `docs/LANGUAGES.md`.
2. **Data:** write `src/clock/languages/<code>.ts` following the exact structure of `en.ts` / `de.ts`.
3. **Tests first:** table-driven spec like `en.test.ts` — minimum 14 phrase cases covering: on-the-hour, :04 round-down, :05, :15 quarter, :25, :30 half, :35, :45, :50, :55, midnight, noon, hour-rollover at the to-crossing, and any language-specific oddity (e.g. German EIN vs EINS, "halb" counting to the NEXT hour). Plus the two grid-integrity tests (matrix dimensions, every word spells its text).
4. **Green, register, record:** tests pass → add to `LANGUAGES` registry → set `verified` + source in `docs/LANGUAGES.md` → commit (one commit per language).
5. **If no reliable matrix source is found:** do NOT invent one. Mark `discarded (no verifiable source)` in `docs/LANGUAGES.md` per D4 and move on. (Does not apply to Serbian — we design that one ourselves by decision D4b.)

**Verification hard rule:** never write the test table by reading your own `phrase()` implementation. Derive expected sentences from the researched source (photos show real times) and general knowledge of the language's time grammar; where uncertain, cross-check two sources.

---

### Task 1: German (fully worked template)

**Files:**
- Create: `src/clock/languages/de.ts`
- Test: `src/clock/languages/de.test.ts`
- Modify: `src/clock/languages/index.ts`, `docs/LANGUAGES.md`

The canonical German QLOCKTWO matrix (verify against a product photo during execution; this layout is widely replicated):

```
ESKISTAFÜNF
ZEHNZWANZIG
DREIVIERTEL
VORFUNKNACH
HALBAELFÜNF
EINSXAMZWEI
DREIPMJVIER
SECHSNLACHT
SIEBENZWÖLF
ZEHNEUNKUHR
```

- [ ] **Step 1: Research** — confirm the matrix above against at least one reference photo/source; record URL.

- [ ] **Step 2: Write the failing test `src/clock/languages/de.test.ts`**

```ts
import { describe, expect, it } from 'vitest';
import { german } from './de';

function spell(hours: number, minutes: number): string {
  return [...german.itIs, ...german.phrase(hours, minutes)]
    .sort((a, b) => a.row - b.row || a.start - b.start)
    .map((w) => w.text)
    .join(' ');
}

describe('german grid integrity', () => {
  it('is an 11x10 matrix', () => {
    expect(german.rows).toHaveLength(10);
    for (const row of german.rows) expect(row).toHaveLength(11);
  });

  it('every word coordinate spells its text in the grid', () => {
    for (const w of german.words) {
      expect(german.rows[w.row].slice(w.start, w.end + 1)).toBe(w.text);
    }
  });
});

describe('german time phrases', () => {
  it.each([
    [10, 0, 'ES IST ZEHN UHR'],
    [10, 4, 'ES IST ZEHN UHR'],
    [10, 5, 'ES IST FÜNF NACH ZEHN'],
    [10, 10, 'ES IST ZEHN NACH ZEHN'],
    [10, 15, 'ES IST VIERTEL NACH ZEHN'],
    [10, 20, 'ES IST ZWANZIG NACH ZEHN'],
    [10, 25, 'ES IST FÜNF VOR HALB ELF'],
    [10, 30, 'ES IST HALB ELF'],
    [10, 35, 'ES IST FÜNF NACH HALB ELF'],
    [10, 40, 'ES IST ZWANZIG VOR ELF'],
    [10, 45, 'ES IST VIERTEL VOR ELF'],
    [10, 50, 'ES IST ZEHN VOR ELF'],
    [10, 55, 'ES IST FÜNF VOR ELF'],
    [0, 0, 'ES IST ZWÖLF UHR'],
    [13, 0, 'ES IST EIN UHR'],
    [13, 5, 'ES IST FÜNF NACH EINS'],
    [12, 30, 'ES IST HALB EINS'],
  ])('%i:%i → "%s"', (hours, minutes, expected) => {
    expect(spell(hours, minutes)).toBe(expected);
  });
});
```

Key German rules encoded there: minutes 25–39 pivot around HALB of the NEXT hour; "EIN UHR" (no S) on the hour but "EINS" otherwise; VIERTEL NACH/VOR in the standard face (DREIVIERTEL belongs to the D3 Swabian variant).

- [ ] **Step 3: Run to verify it fails**

Run: `pnpm vitest run src/clock/languages/de.test.ts`
Expected: FAIL — cannot resolve `./de`.

- [ ] **Step 4: Write `src/clock/languages/de.ts`**

```ts
// Matrix source: <record reference URL during execution>
import { word, type LanguageDef, type WordCoord } from '../types';

const ES = word('ES', 0, 0);
const IST = word('IST', 0, 3);
const FUENF_MIN = word('FÜNF', 0, 7);
const ZEHN_MIN = word('ZEHN', 1, 0);
const ZWANZIG = word('ZWANZIG', 1, 4);
const VIERTEL = word('VIERTEL', 2, 4);
const VOR = word('VOR', 3, 0);
const NACH = word('NACH', 3, 7);
const HALB = word('HALB', 4, 0);
const ELF = word('ELF', 4, 5);
const FUENF_HOUR = word('FÜNF', 4, 7);
const EINS = word('EINS', 5, 0);
const EIN = word('EIN', 5, 0);
const ZWEI = word('ZWEI', 5, 7);
const DREI = word('DREI', 6, 0);
const VIER = word('VIER', 6, 7);
const SECHS = word('SECHS', 7, 0);
const ACHT = word('ACHT', 7, 7);
const SIEBEN = word('SIEBEN', 8, 0);
const ZWOELF = word('ZWÖLF', 8, 6);
const ZEHN_HOUR = word('ZEHN', 9, 0);
const NEUN = word('NEUN', 9, 3);
const UHR = word('UHR', 9, 8);

const HOURS = [ZWOELF, EINS, ZWEI, DREI, VIER, FUENF_HOUR, SECHS, SIEBEN, ACHT, NEUN, ZEHN_HOUR, ELF];

function phrase(hours: number, minutes: number): WordCoord[] {
  const m = Math.floor(minutes / 5) * 5;
  const nextHour = HOURS[(hours + 1) % 12];
  const thisHour = HOURS[hours % 12];

  if (m === 0) return [hours % 12 === 1 ? EIN : thisHour, UHR];

  const MINUTES: Record<number, WordCoord[]> = {
    5: [FUENF_MIN, NACH, thisHour],
    10: [ZEHN_MIN, NACH, thisHour],
    15: [VIERTEL, NACH, thisHour],
    20: [ZWANZIG, NACH, thisHour],
    25: [FUENF_MIN, VOR, HALB, nextHour],
    30: [HALB, nextHour],
    35: [FUENF_MIN, NACH, HALB, nextHour],
    40: [ZWANZIG, VOR, nextHour],
    45: [VIERTEL, VOR, nextHour],
    50: [ZEHN_MIN, VOR, nextHour],
    55: [FUENF_MIN, VOR, nextHour],
  };
  return MINUTES[m];
}

export const german: LanguageDef = {
  id: 'de',
  name: 'Deutsch',
  sample: 'ES IST',
  rows: [
    'ESKISTAFÜNF',
    'ZEHNZWANZIG',
    'DREIVIERTEL',
    'VORFUNKNACH',
    'HALBAELFÜNF',
    'EINSXAMZWEI',
    'DREIPMJVIER',
    'SECHSNLACHT',
    'SIEBENZWÖLF',
    'ZEHNEUNKUHR',
  ],
  itIs: [ES, IST],
  words: [ES, IST, FUENF_MIN, ZEHN_MIN, ZWANZIG, VIERTEL, VOR, NACH, HALB, ELF, FUENF_HOUR, EINS, ZWEI, DREI, VIER, SECHS, ACHT, SIEBEN, ZWOELF, ZEHN_HOUR, NEUN, UHR],
  phrase,
};
```

Layout notes to verify in Step 1 (fix coords if the photo differs): `EIN`/`EINS` share row 5 col 0; hour DREI is row 6 (row 2's DREI belongs to DREIVIERTEL); NEUN overlaps ZEHN in row 9 (`ZEHNEUN`).

- [ ] **Step 5: Run to verify it passes**

Run: `pnpm vitest run src/clock/languages/de.test.ts`
Expected: PASS (19 tests).

- [ ] **Step 6: Register + record + commit**

Add `german` to `LANGUAGES` in `src/clock/languages/index.ts`; update `docs/LANGUAGES.md` (verified + source URL).

```bash
git add -A && git commit -m "Add verified German language matrix and phrase logic"
```

---

### Task 2: Latin batch A — FR, IT, ES, CA, NL

- [ ] For each of French, Italian, Spanish, Catalan, Dutch — run the full pipeline (research → failing test table ≥14 cases → data file → green → register → record → commit per language).

Language-specific rules the test tables MUST cover:
- **French:** "IL EST"; HEURE vs HEURES; MOINS LE QUART / ET QUART / ET DEMIE; MIDI/MINUIT faces exist on some variants — follow the sourced matrix.
- **Italian:** "SONO LE" vs "È L'UNA"; E UN QUARTO / E MEZZA / MENO UN QUARTO.
- **Spanish:** "SON LAS" vs "ES LA UNA"; Y CUARTO / Y MEDIA / MENOS CUARTO.
- **Catalan:** the bell system (UN QUART DE DUES = quarter past one) — trickiest matrix; cross-check two sources.
- **Dutch:** VOOR/OVER pivot around HALF at :20 already (TIEN VOOR HALF); OVER/VOOR both appear twice.

- [ ] Batch commit checkpoints: one commit per language, message pattern "Add verified <Language> language matrix and phrase logic".

---

### Task 3: Latin batch B — DK, NO, SE, CZ, RO, PE, TR, CH, D2, D3, D4, E2

- [ ] Same pipeline for: Danish, Norwegian, Swedish, Czech, Romanian, Portuguese, Turkish, Swiss German (Züridütsch-style), German variants D2/D4 (alt displays), D3 (Swabian: DREIVIERTEL/VIERTEL system), English E2 (alt display).
- [ ] Variant faces (CH, D2–D4, E2) may share matrices with different phrase functions or differ entirely — follow sources; a variant that can't be sourced is discarded per D4 with a note.
- [ ] Scandinavian rule to cover: "half to" semantics (HALV TI = 9:30).

---

### Task 4: Russian

- [ ] Full pipeline for Russian (Cyrillic — DINish covers it since v3.006; verify glyphs render by eye in the browser).
- [ ] Test table must cover Russian genitive hour forms as they appear on the sourced matrix (the physical face words are fixed — encode what the matrix offers, not full grammar).

---

### Task 5: Greek + font subset

- [ ] Run pipeline for Greek.
- [ ] Font: `pnpm add @fontsource/noto-sans` and import the Greek subset CSS (`@fontsource/noto-sans/greek-500.css`) in `src/main.tsx`; extend the font stack in `App.tsx` to `font-[DINish,'Noto_Sans']` so Greek glyphs fall through to Noto Sans while Latin stays DINish.
- [ ] Visual check in browser: Greek face renders in Noto Sans weight 500, no tofu boxes.

---

### Task 6: Custom Serbian (D4b)

- [ ] Design an 11×10 Cyrillic matrix for Serbian time phrases ("САДА ЈЕ ДЕСЕТ И ПЕТНАЕСТ" style — decide И/ДО pivot grammar with the user).
- [ ] Build a mockup (`mockups/serbian-matrix.html`) rendering the proposed matrix with 3-4 sample times lit; the user (native speaker) verifies grammar and matrix before the data file is written.
- [ ] Then run the standard pipeline (test table authored WITH the user's confirmed sentences).
- [ ] Record in `docs/LANGUAGES.md` as `verified (native speaker)`.

---

### Task 7: Wrap-up

- [ ] `docs/LANGUAGES.md`: every row is `verified` or `discarded (reason)` — no `pending` left except not-planned rows.
- [ ] Language picker sanity check in browser: all languages listed with native samples, switching re-renders instantly.
- [ ] Full suite green: `pnpm test` (expect ~250+ tests). Build green.
- [ ] Commit any stragglers; update `docs/DECISIONS.md` with a D15 summarizing shipped vs discarded languages.
