# Verba: Word Clock — Design Spec

**Date:** 2026-08-16
**Status:** Approved design, pending user spec review
**Decision log:** see `docs/DECISIONS.md` (D1–D10)

## What we're building

A pixel-perfect recreation of the QLOCKTWO word clock as a software product named **Verba** (store title: **"Verba: Word Clock"**). One codebase, three targets:

1. Web app on Vercel (installable PWA)
2. iOS app (App Store, via Capacitor)
3. Android app (Play Store, via Capacitor)

The clock shows time as lit words in a letter matrix ("IT IS QUARTER PAST TEN"), with four corner dots for +1…+4 minutes. Maximum visual fidelity to the QLOCKTWO CLASSIC, under our own brand with zero QLOCKTWO trademarks (D2 — takedown risk accepted by user).

Out of scope for v1: alarm, marketing site, IAP (catalog is pre-wired for it), localized settings chrome.

## Stack

Vite + React + TypeScript + Tailwind, static SPA (D6). Radix UI primitives for settings controls, styled to match the clock's aesthetic. No state library; no server; device time only; fully offline.

## Architecture

```
art-clock/
├── src/
│   ├── clock/               # pure core — zero React
│   │   ├── types.ts         # LanguageDef, WordCoord, ClockState
│   │   ├── engine.ts        # (Date, LanguageDef) → { litCells, cornerDots }
│   │   └── languages/       # one data file per language
│   ├── finishes/            # finish catalog
│   ├── components/          # ClockFace, CornerDots, SecondsDigits, WallFrame
│   ├── settings/            # Radix-based panel + persisted store
│   └── App.tsx
├── public/textures/         # material finish assets (our own, never QLOCKTWO's)
├── mockups/                 # decision mockups — NEVER deleted
├── docs/                    # DECISIONS.md, LANGUAGES.md, specs/
├── ios/ android/            # Capacitor shells
└── capacitor.config.ts
```

### Clock engine

- `LanguageDef` = grid rows (strings), word coordinate map, and a pure phrase
  function `(hours, minutes) → word list` implementing that language's
  time grammar (including regional variants where the physical product has them).
- `engine.ts` resolves a `Date` to lit cell set + corner dot count (minutes % 5).
- Time rounds to 5-minute phrases exactly like the hardware.
- React re-renders once per minute (per second only in seconds mode).

### Rendering (pixel-perfect requirements)

- 11×10 letter matrix (per-language dimensions may vary), perfectly square,
  sized `min(vw, vh)` minus margin; fixed cell grid, no layout shift ever.
- Typeface: free DIN-descendant (D-DIN or Barlow — decided by side-by-side
  mockup vs reference photos, mockup kept in `mockups/`). All caps.
- Unlit letters: faint stencil (~10–15% opacity, tuned per finish).
  Lit letters: white + soft LED glow on dark fronts; dark letters on light fronts.
- Word transitions: ~600ms cross-fade on time change.
- Corner minute dots light clockwise, outside the letter block.
- **Seconds mode:** large 0–9 digits drawn using the letter cells as pixels
  (authentic to hardware). Tap toggles words ↔ seconds.
- **Presentation setting (D3):** Full-bleed (default) or Wall mode (shadowed
  square panel on wall background). Mockup: `mockups/q3-screen-presentation.html`.

### Finishes (D5)

Full QLOCKTWO-style catalog, replicated as close as possible:

- Lacquered colors (Deep Black, Snow White, Cherry Cake, Lime Juice, Blue
  Candy, Vanilla Sugar, …) — pure CSS.
- Material editions (Brushed Steel, Rust, Platinum, Bronze, Concrete, Marble,
  Wood, …) — our own texture assets (procedural or CC0 photos).

Catalog entry: `{ id, displayName, tier: 'free' | 'premium', surface, letterStyle: 'light' | 'dark', glow }`.
All finishes free in v1; `tier` exists so v1.1 can flip material editions to a
one-time IAP without architectural change (D9).

### Languages (D4, D4b)

- Attempt the full QLOCKTWO catalog (~20+ matrices) **plus a custom Serbian
  matrix** (our own design; user is native-speaker verifier).
- Each language is one data file. Each must pass verification before it ships:
  1. Matrix sourced from reliable references (photos of the physical product,
     word-clock community documentation).
  2. Table-driven Vitest spec: `(time → expected lit words)` covering x:00,
     x:04/x:05 boundaries, quarter/half, to/past crossover, midnight/noon,
     regional variants.
  3. Grid-integrity test: every word coordinate actually spells its word.
- Languages that can't be verified are discarded and documented with reason.
- `docs/LANGUAGES.md` tracks per-language status: `pending / verified / discarded (reason)`.
- Language picker shows each language in its own words ("Deutsch — ES IST").

### Settings

- Chromeless face; gear fades in on mouse move (web) / tap (mobile).
  Tap toggles seconds mode; gesture details tuned via mockup if unclear.
- Slide-over panel (right), configurator-styled: finish swatch grid,
  language list, presentation toggle, "IT IS" words toggle (D7),
  night dimming (brightness slider + optional from/to schedule),
  keep-screen-awake toggle (Capacitor builds only).
- Persistence: single versioned object in `localStorage`
  (`schemaVersion` for migrations). Defaults: English, Deep Black,
  full-bleed, it-is on.

## Testing

- **Vitest** (per global preference): engine unit tests per language
  (verification tables), grid-integrity tests, settings-store tests.
- **Playwright screenshot tests** for visual regression on the face
  (grid alignment, lit states, finishes).

## Deployment

- **Web:** static build → Vercel (account exists) + PWA manifest.
- **Mobile:** Capacitor, app id `com.verba.clock`, status bar hidden,
  keep-awake plugin, all orientations. Store submission last — blocked on
  Apple Developer / Play Console accounts (purchasing ~late Aug 2026; new
  personal Play accounts need a 14-day closed test with 12+ testers).
- **Pricing:** free, no ads, no IAP (D9).

## Build order

1. Engine + English + tests
2. Face rendering (full-bleed, typography, glow, transitions, dots, seconds mode)
3. Finishes (colors → materials)
4. Settings panel (Radix) + persistence + wall mode
5. Remaining languages, verified one by one (incl. custom Serbian)
6. PWA + Vercel deploy
7. Capacitor shells (iOS/Android)
8. Store assets & submission (when accounts exist)

## Process rules (user-mandated)

- Uncertain decisions get mockups in `mockups/`; mockups are never deleted.
- Every decision is logged in `docs/DECISIONS.md`.
