# art-clock — Decision Log

Running log of product/technical decisions made during brainstorming and implementation.
Rules: every settled question gets an entry. Mockups for uncertain decisions live in `mockups/` and are never deleted.

## Process

- Mockups for undecided questions go in `mockups/`, one file per option where practical
- Mockups are never deleted, even after a decision is made
- Every decision is recorded here with the date, the options considered, and the rationale

## Decisions

### D1 — Scope: the clock only (2026-08-16)

**Question:** Recreate the QLOCKTWO product (functional word clock) or the qlocktwo.com marketing site?
**Decision:** The clock only — a full-screen functional word clock with settings for background/finish and language. No marketing/e-commerce pages.
**Options considered:** (A) clock only, (B) marketing site, (C) clock + small landing page.

### D2 — Fidelity & branding: exact replica, new name (2026-08-16)

**Question:** How literal can the clone be given QLOCKTWO's trademark/trade dress?
**Decision:** Faithful, pixel-perfect replica of the QLOCKTWO look (grid layouts, typography feel, finishes), but shipped under our own name with no QLOCKTWO trademarks anywhere in the app, store listings, or code-facing branding. Name TBD.
**Options considered:** (A) inspired-by with own styling, (B) faithful replica + own name, (C) exact clone incl. names.
**Rationale:** User wants maximum fidelity; dropping the trademark is the minimum change needed for store viability. Takedown risk explicitly accepted by user ("we will update it" if it happens) — so we aim for maximum visual match.

### D3 — Screen presentation: both, as a setting (2026-08-16)

**Question:** Full-bleed grid vs framed "physical product" panel on a wall background?
**Decision:** Both. A presentation setting toggles between Full-bleed (default) and Wall mode (framed square panel with shadow).
**Mockup:** `mockups/q3-screen-presentation.html`

### D4 — Languages: all QLOCKTWO matrices, individually verified (2026-08-16)

**Question:** Language set at launch?
**Decision:** Attempt the full QLOCKTWO catalog (~20+ matrices). Every language gets its own verification pass (matrix layout + time-phrase grammar checked against reliable sources / native references). Any language that can't be verified as correct is discarded and the discard is documented here with the reason.
**Options considered:** (A) EN+DE, (B) big six, (C) full catalog.
**Follow-up:** maintain a per-language verification status table in `docs/LANGUAGES.md`.

### D4b — Serbian matrix: yes, custom addition (2026-08-16)

**Decision:** Design our own Serbian letter matrix (not offered by QLOCKTWO). User is the native-speaker verifier. The one intentional deviation from "maximum match."

### D5 — Finishes: full catalog, colors + materials (2026-08-16)

**Question:** Replicate only lacquered color fronts, or also material editions (steel, rust, concrete, marble, wood…)?
**Decision:** Full catalog. Lacquered colors in pure CSS; material editions via our own texture assets (procedural or CC0 photos — never QLOCKTWO's imagery), replicated as close as possible.
**Options considered:** (A) colors only, (B) colors + materials.

### D6 — Stack: Vite + React + TypeScript + Tailwind, static SPA, Capacitor wrapper (2026-08-16)

**Question:** Web framework for the shared codebase (web on Vercel + Capacitor for iOS/Android)?
**Decision:** Vite + React + TS + Tailwind static SPA. Same build deployed to Vercel and wrapped by Capacitor.
**Options considered:** (A) Vite+React, (B) Next.js static export, (C) vanilla TS.
**Rationale:** No SSR/SEO needs; Capacitor wraps static builds natively; single set of pixels on all platforms.

### D7 — v1 feature set (2026-08-16)

**Decision:** In scope: seconds mode (large digits), night dimming (manual + optional schedule), keep-screen-awake toggle (Capacitor), "IT IS" words toggle. Out of scope for v1: alarm.

### D8 — Name: Verba, store title "Verba: Word Clock" (2026-08-16)

**Question:** Product name for app + stores + web.
**Decision:** Brand is **Verba** (Latin: "words"); store title **"Verba: Word Clock"**. "Art clock" goes in the store keyword field. Domain checked at deploy time.
**Store research (2026-08-16):** No clock apps named Verba on either store. "Word Clock"/"Art Clock" neighborhoods are crowded (WordClock Widget, Word Clock Pro, Art Clock Lite, The Artclock…) and polluted by "World Clock" search results — hence brand + descriptive subtitle.
**Options considered:** ArtClock, Word Clock, Word Art Clock, It Is., LitClock, Litera, Tessera, Meridiem, Verbum, Tempus, and combinations.

### D9 — Pricing: free v1, IAP-ready for later (2026-08-16)

**Decision:** v1 ships free — no ads, no IAP. Finish catalog carries `tier: 'free' | 'premium'` from day one so a v1.1 can flip material editions to a one-time IAP unlock without architectural change.
**Options considered:** (A) free, (B) paid upfront, (C) free + IAP. Chosen: A now, C later.

### D10 — Deploy logistics (2026-08-16)

**Status:** Vercel account exists; Mac + Xcode available. Apple Developer ($99/yr) and Play Console ($25) to be purchased ~late Aug 2026. Note: new personal Play accounts require a 14-day closed test with 12+ testers before production.
**Consequence:** Build order = web first (deployable immediately), Capacitor shells ready but store submission waits on accounts.

### D11 — Face typeface: DINish Medium, self-hosted (2026-08-16)

**Question:** Which free typeface best matches QLOCKTWO's face (a modified FF DIN)?
**Decision:** DINish v4.007 Medium (SIL OFL 1.1), self-hosted woff2 in `public/fonts/` with license file. Closest maintained free descendant of the DIN lineage; covers 243 Latin-based languages + Cyrillic (Serbian matrix). Non-Latin/non-Cyrillic matrices in Plan 3 need per-language fallbacks or become D4 discards.
**Research:** `docs/research/2026-08-16-qlocktwo-typeface.md`. Mockups: `mockups/typography-choice.html` (Barlow/Jost/Archivo round, superseded), `mockups/typography-dinish-2026-08-16.png`.
**Options considered:** Barlow, Jost, Archivo (Google Fonts approximations), D-DIN, Alte DIN 1451, DINish.

### D12 — Non-Latin scripts are must-haves with per-script companion fonts (2026-08-16)

**Question:** Discard Chinese/Japanese/Arabic/Hebrew matrices (DINish can't render them) or support them?
**Decision:** Must-haves per user — no discards for CN/JP/AR/HE. Per-script OFL companions, weight-matched to DINish Medium: Noto Kufi Arabic (AR — geometric Kufi, the DIN-equivalent for Arabic), Noto Sans Hebrew (HE), Noto Sans SC (CN), Noto Sans JP (JP), Noto Sans (GR). Fonts are subset at build time to each matrix's exact glyphs, so even CJK faces cost a few KB.
**Amends:** D4 (discard option no longer applies to these four), D11 caveat resolved.
**Research:** `docs/research/2026-08-16-qlocktwo-typeface.md`; full catalog table in `docs/LANGUAGES.md` (26 faces + custom Serbian).

### D13 — Language scope: European only; CN/JP/AR/HE not implemented (2026-08-16)

**Decision:** Supersedes D12's must-have status. All European faces are must-haves: the 19 Latin faces, Russian (Cyrillic), Greek. Chinese, Japanese, Arabic, Hebrew are **not planned** — user descoped them same day after seeing the full catalog ("other exotic we will not implement"). Rows stay in `docs/LANGUAGES.md` as `not planned` for the record; the D12 font research remains valid if they're ever revived.
**Consequence:** Fonts needed are only DINish (Latin + Cyrillic) and Noto Sans Greek subset. No RTL rendering needed. Serbian custom face (D4b) unaffected.

### D14 — Finish catalog: 16 finishes from the current EARTH lineup (2026-08-16)

**Decision:** Replicate the current EARTH catalog (researched across EARTH 13.5/45/90/180 + Creator's Edition + frontcover pages): Deep Black, Stainless Steel, 5 Pepper-series coatings, Hazelnut, and 8 Creator's Editions (Rust, Vintage Copper, Gold, Silver & Gold, Platinum, Moon Gold, Glintscape, Metamorphite, Desert). Full table in `docs/FINISHES.md`. v1 renders all procedurally (CSS + SVG noise); CC0 photo textures are the upgrade path for stones/metals.
