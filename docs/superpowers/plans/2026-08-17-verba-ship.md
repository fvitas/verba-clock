# Verba Ship (PWA + Vercel + Capacitor) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the finished Verba clock as an installable offline PWA on Vercel and wrap it in iOS/Android Capacitor shells (app id `com.verba.clock`, hidden status bar, keep-awake).

**Architecture:** The web app stays a static Vite SPA; `vite-plugin-pwa` adds manifest + Workbox precache on top of the existing build. Capacitor consumes the same `dist/` via `webDir` — native-only behavior (status bar, keep-awake) is gated behind `Capacitor.isNativePlatform()` so web bundles are unaffected.

**Tech Stack:** vite-plugin-pwa (Workbox), @vite-pwa/assets-generator, Vercel CLI, Capacitor 7 (@capacitor/core, @capacitor/ios, @capacitor/android, @capacitor/status-bar, @capacitor-community/keep-awake).

**Out of scope (blocked on accounts, ~late Aug 2026):** App Store / Play Console submission, store screenshots/listing copy, signing configs. Icons produced here double as store assets later.

**Verification limits:** `pnpm build`, `vitest`, `cap sync`, and web preview are fully verifiable here. Opening/running the native projects needs Xcode / Android Studio — those steps are marked "user-verified".

---

### Task 1: App icon + favicon

**Files:**
- Create: `public/icon.svg` (source of truth, also the favicon)
- Create: `pwa-assets.config.ts`
- Generated: `public/pwa-64x64.png`, `public/pwa-192x192.png`, `public/pwa-512x512.png`, `public/maskable-icon-512x512.png`, `public/apple-touch-icon-180x180.png`, `public/favicon.ico`
- Modify: `index.html`

- [ ] **Step 1: Create the source icon**

A mini word-clock face: faint letter grid, middle row lights up VERBA. Uses Helvetica (present on macOS build machine and rasterized by the generator).

```xml
<!-- public/icon.svg -->
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="96" fill="#0a0a0a"/>
  <g font-family="Helvetica, Arial, sans-serif" font-size="64" font-weight="500" text-anchor="middle" letter-spacing="8">
    <text x="256" y="122" fill="#ffffff" fill-opacity="0.13">KLOSAMTREN</text>
    <text x="256" y="210" fill="#ffffff" fill-opacity="0.13">AMODESATRI</text>
    <text x="256" y="298" fill="#ffffff">VERBA</text>
    <text x="256" y="386" fill="#ffffff" fill-opacity="0.13">CETIRPESTO</text>
    <text x="256" y="474" fill="#ffffff" fill-opacity="0.13">RDEVETOSAM</text>
  </g>
</svg>
```

- [ ] **Step 2: Add the assets-generator config**

```ts
// pwa-assets.config.ts
import { defineConfig, minimal2023Preset } from '@vite-pwa/assets-generator/config';

export default defineConfig({
  preset: minimal2023Preset,
  images: ['public/icon.svg'],
});
```

- [ ] **Step 3: Generate the icons**

Run: `pnpm dlx @vite-pwa/assets-generator`
Expected: PNGs + favicon.ico written into `public/`.

- [ ] **Step 4: Visually verify the rasterized text**

Run: `open public/pwa-512x512.png`
Expected: dark rounded square, faint letter rows, bright centered VERBA. If text is missing (font not resolved by the rasterizer), replace `<text>` letters with a `<path>`-drawn V glyph and regenerate — do not ship an empty square.

- [ ] **Step 5: Link icons in index.html**

```html
    <link rel="icon" href="/favicon.ico" sizes="48x48" />
    <link rel="icon" href="/icon.svg" type="image/svg+xml" />
    <link rel="apple-touch-icon" href="/apple-touch-icon-180x180.png" />
    <meta name="theme-color" content="#0a0a0a" />
    <title>Verba: Word Clock</title>
```

(replaces the bare `<title>Verba</title>` line)

- [ ] **Step 6: Verify build passes**

Run: `pnpm build`
Expected: exit 0, icons copied into `dist/`.

- [ ] **Step 7: Commit**

```bash
git add public/icon.svg pwa-assets.config.ts public/*.png public/favicon.ico index.html
git commit -m "Add app icon, favicon, and touch icons"
```

---

### Task 2: PWA manifest + offline service worker

**Files:**
- Modify: `vite.config.ts`
- Modify: `package.json` (devDependency)

- [ ] **Step 1: Install the plugin**

Run: `pnpm add -D vite-plugin-pwa`

- [ ] **Step 2: Register the plugin**

```ts
// vite.config.ts — add import and plugin entry
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon.svg', 'fonts/**/*'],
      manifest: {
        name: 'Verba: Word Clock',
        short_name: 'Verba',
        description: 'A word clock. The time, written out in light.',
        theme_color: '#0a0a0a',
        background_color: '#0a0a0a',
        display: 'standalone',
        orientation: 'any',
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: 'maskable-icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
      },
    }),
  ],
  test: { /* unchanged */ },
});
```

- [ ] **Step 3: Build and inspect output**

Run: `pnpm build && ls dist/sw.js dist/manifest.webmanifest`
Expected: both files exist; build log shows "precache" entry count covering js/css/html/woff2.

- [ ] **Step 4: Verify offline behavior**

Run: `pnpm preview` then in the Playwright browser: load `http://localhost:4173`, wait for SW registration (`navigator.serviceWorker.ready`), then set browser offline and reload.
Expected: clock still renders offline.

- [ ] **Step 5: Verify tests still pass**

Run: `pnpm test`
Expected: all pass (plugin is build-time only; jsdom tests untouched).

- [ ] **Step 6: Commit**

```bash
git add vite.config.ts package.json pnpm-lock.yaml
git commit -m "Add PWA manifest and offline service worker"
```

---

### Task 3: Vercel deploy

**Files:**
- Create: `vercel.json`
- Create: `.vercelignore`

- [ ] **Step 1: Create vercel.json**

Service worker must never be served stale, else updates lag a full cache TTL:

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "headers": [
    {
      "source": "/sw.js",
      "headers": [{ "key": "Cache-Control", "value": "public, max-age=0, must-revalidate" }]
    },
    {
      "source": "/assets/(.*)",
      "headers": [{ "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }]
    }
  ]
}
```

- [ ] **Step 2: Create .vercelignore**

```
ios
android
mockups
docs
```

- [ ] **Step 3: Verify local production build one more time**

Run: `pnpm build`
Expected: exit 0.

- [ ] **Step 4: Deploy (user-interactive)**

Vercel auth is interactive — the user runs these in-session with the `!` prefix:

```
! pnpm dlx vercel login
! pnpm dlx vercel --prod
```

Framework preset: Vite (auto-detected); build command `pnpm build`; output `dist`.
Expected: production URL printed; clock loads there; `https://<url>/manifest.webmanifest` returns 200.

- [ ] **Step 5: Verify deployed PWA installability**

Open the production URL in the Playwright browser; check console for SW registration and no 404s on icons.

- [ ] **Step 6: Commit**

```bash
git add vercel.json .vercelignore
git commit -m "Add Vercel deploy configuration"
```

---

### Task 4: keepAwake setting (TDD, web-safe)

**Files:**
- Modify: `src/settings/store.ts`
- Test: `src/settings/store.test.ts`

- [ ] **Step 1: Write the failing tests**

```ts
it('defaults keepAwake to true', () => {
  expect(DEFAULT_SETTINGS.keepAwake).toBe(true);
});

it('fills keepAwake for persisted v1 settings that predate it', () => {
  const storage = fakeStorage({ 'verba-settings': JSON.stringify({ schemaVersion: 1, languageId: 'sr' }) });
  expect(loadSettings(storage).keepAwake).toBe(true);
});
```

(reuse the existing fake-storage helper in store.test.ts; match its actual name)

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm vitest run src/settings/store.test.ts`
Expected: FAIL — `keepAwake` not in Settings.

- [ ] **Step 3: Extend the schema**

Still `schemaVersion: 1` — `loadSettings` already merges missing fields from defaults, so no migration needed:

```ts
export type Settings = {
  schemaVersion: 1;
  languageId: string;
  finishId: string;
  presentation: Presentation;
  showItIs: boolean;
  brightness: number;
  keepAwake: boolean;
};

export const DEFAULT_SETTINGS: Settings = {
  schemaVersion: 1,
  languageId: 'en',
  finishId: 'deep-black',
  presentation: 'fullbleed',
  showItIs: true,
  brightness: 1,
  keepAwake: true,
};
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm vitest run src/settings/store.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/settings/store.ts src/settings/store.test.ts
git commit -m "Add keepAwake setting with default true"
```

---

### Task 5: Capacitor shells

**Files:**
- Create: `capacitor.config.ts`
- Create: `ios/` and `android/` (generated — commit them; they are the native projects)
- Modify: `package.json` (deps + scripts), `.gitignore`

- [ ] **Step 1: Install Capacitor**

Run: `pnpm add @capacitor/core @capacitor/status-bar @capacitor-community/keep-awake && pnpm add -D @capacitor/cli @capacitor/ios @capacitor/android`

- [ ] **Step 2: Create capacitor.config.ts**

```ts
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.verba.clock',
  appName: 'Verba',
  webDir: 'dist',
};

export default config;
```

- [ ] **Step 3: Add native platforms**

Run: `pnpm build && pnpm exec cap add ios && pnpm exec cap add android`
Expected: `ios/` and `android/` created; `cap add` output ends "success".

- [ ] **Step 4: Add sync script**

In `package.json` scripts: `"sync": "pnpm build && cap sync"`.

- [ ] **Step 5: Ignore native build products**

Append to `.gitignore`:

```
ios/App/Pods
ios/App/App/public
ios/DerivedData
android/.gradle
android/app/build
android/build
android/app/src/main/assets/public
```

- [ ] **Step 6: Sync and verify**

Run: `pnpm sync`
Expected: "Sync finished" with ios + android both copied.

- [ ] **Step 7: Commit**

```bash
git add capacitor.config.ts package.json pnpm-lock.yaml .gitignore ios android
git commit -m "Add Capacitor shells for iOS and Android"
```

---

### Task 6: Native integration — hidden status bar, keep-awake, native-only toggle

**Files:**
- Create: `src/native/useNative.ts`
- Modify: `src/App.tsx`
- Modify: `src/settings/SettingsPanel.tsx`
- Test: `src/native/useNative.test.ts`

- [ ] **Step 1: Write the failing test**

Mock the Capacitor modules; assert the hook calls `KeepAwake.keepAwake()` when native + enabled, `allowSleep()` when disabled, and does nothing on web:

```ts
import { renderHook } from '@testing-library/react';
import { vi, describe, expect, it, beforeEach } from 'vitest';

const isNativePlatform = vi.fn();
const keepAwake = vi.fn();
const allowSleep = vi.fn();
const hide = vi.fn();

vi.mock('@capacitor/core', () => ({ Capacitor: { isNativePlatform: () => isNativePlatform() } }));
vi.mock('@capacitor-community/keep-awake', () => ({ KeepAwake: { keepAwake: () => keepAwake(), allowSleep: () => allowSleep() } }));
vi.mock('@capacitor/status-bar', () => ({ StatusBar: { hide: () => hide() } }));

import { useNative } from './useNative';

beforeEach(() => vi.clearAllMocks());

describe('useNative', () => {
  it('does nothing on web', () => {
    isNativePlatform.mockReturnValue(false);
    renderHook(() => useNative(true));
    expect(hide).not.toHaveBeenCalled();
    expect(keepAwake).not.toHaveBeenCalled();
  });

  it('hides status bar and keeps awake on native', () => {
    isNativePlatform.mockReturnValue(true);
    renderHook(() => useNative(true));
    expect(hide).toHaveBeenCalled();
    expect(keepAwake).toHaveBeenCalled();
  });

  it('allows sleep when keepAwake is off', () => {
    isNativePlatform.mockReturnValue(true);
    renderHook(() => useNative(false));
    expect(allowSleep).toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm vitest run src/native/useNative.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement the hook**

Side effects belong in useEffect (this is device state, not derived state):

```ts
// src/native/useNative.ts
import { useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { StatusBar } from '@capacitor/status-bar';
import { KeepAwake } from '@capacitor-community/keep-awake';

export const isNative = (): boolean => Capacitor.isNativePlatform();

export function useNative(keepAwake: boolean): void {
  useEffect(() => {
    if (!isNative()) return;
    void StatusBar.hide();
  }, []);

  useEffect(() => {
    if (!isNative()) return;
    if (keepAwake) void KeepAwake.keepAwake();
    else void KeepAwake.allowSleep();
  }, [keepAwake]);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm vitest run src/native/useNative.test.ts`
Expected: PASS.

- [ ] **Step 5: Wire into App**

In `src/App.tsx`, inside the component (settings already come from context):

```ts
useNative(settings.keepAwake);
```

- [ ] **Step 6: Add the native-only toggle to SettingsPanel**

Next to the existing `showItIs` Radix Switch, following its exact markup/props pattern:

```tsx
{isNative() && (
  <SettingRow label="Keep screen awake">
    <Switch
      checked={settings.keepAwake}
      onCheckedChange={(checked: boolean) => update({ keepAwake: checked })}
    />
  </SettingRow>
)}
```

(match the panel's real row/Switch component names — copy the `showItIs` row verbatim and adjust)

- [ ] **Step 7: Run the full suite**

Run: `pnpm test && pnpm build`
Expected: all tests pass (jsdom is non-native, toggle hidden, hook inert); build exit 0.

- [ ] **Step 8: Sync native shells**

Run: `pnpm sync`
Expected: plugins listed for ios + android include status-bar and keep-awake.

- [ ] **Step 9: Commit**

```bash
git add src/native src/App.tsx src/settings/SettingsPanel.tsx ios android
git commit -m "Hide status bar and add keep-awake toggle on native builds"
```

---

### Task 7: Native smoke test (user-verified) + docs

**Files:**
- Modify: `docs/DECISIONS.md`

- [ ] **Step 1: iOS smoke test (user runs, needs Xcode)**

```
! pnpm exec cap open ios
```

Run on simulator. Expected: full-screen clock, no status bar, screen never sleeps with the toggle on.

- [ ] **Step 2: Android smoke test (user runs, needs Android Studio)**

```
! pnpm exec cap open android
```

Same expectations on an emulator.

- [ ] **Step 3: Record D16 in docs/DECISIONS.md**

Append, matching the existing D-entry format: D16 — shipped as installable PWA on Vercel + Capacitor 7 shells (`com.verba.clock`); standalone display, autoUpdate SW, keep-awake default ON (native only), status bar hidden; store submission deferred until Apple/Play accounts exist (~late Aug 2026); icons in `public/` double as store assets.

- [ ] **Step 4: Commit**

```bash
git add docs/DECISIONS.md
git commit -m "Record ship decision D16"
```
