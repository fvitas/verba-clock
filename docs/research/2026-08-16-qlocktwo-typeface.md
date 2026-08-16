# QLOCKTWO Typeface Research

**Date:** 2026-08-16 · **Question:** What typeface does the QLOCKTWO face use, and what's the closest free alternative?

## Findings

1. **QLOCKTWO's face is set in DIN — specifically a modified FF DIN.**
   - A DIN-dedicated typography blog states the QLOCKTWO W grid is "110 DIN typeface letters" ([din-din-din.tumblr.com](https://din-din-din.tumblr.com/)).
   - A dafont identification thread concludes "a modified DIN," pointing at FF DIN from FontFont ([dafont forum](https://www.dafont.com/forum/read/343338/qlocktwo-font)). FF DIN is commercial — not usable for us.

2. **Closest free clones of DIN:**
   - **D-DIN** — commissioned by Datto from Monotype, modeled on DIN 1451, SIL OFL 1.1. Only 2 weights ([FontsArena](https://fontsarena.com/blog/free-din-font-and-alternatives/), [learnui.design](https://www.learnui.design/blog/din-similar-fonts.html)).
   - **DINish** — actively maintained fork of D-DIN (via Altinn-DIN), SIL OFL 1.1, v4.007. Light→Bold weights incl. variable font, 243 Latin-based languages, **Cyrillic since v3.006** ([github.com/playbeing/dinish](https://github.com/playbeing/dinish)).
   - **Alte DIN 1451 Mittelschrift** — faithful digitization of the 1931 standard, but mixed licensing per source and no family ([Use & Modify](https://usemodify.com/fonts/alte-din-1451/)).
   - Google Fonts has **no true DIN clone** — Archivo/Barlow/Oswald are only approximations.

## Decision input

**Recommendation: DINish (self-hosted woff2 from GitHub releases).**
- Closest free descendant of the DIN lineage QLOCKTWO actually uses (D-DIN base + human-reader refinements).
- OFL 1.1 permits bundling in web + store apps.
- Cyrillic coverage serves the custom Serbian matrix; broad Latin coverage serves the QLOCKTWO catalog languages.
- Caveat: non-Latin/non-Cyrillic matrices are NOT covered by DINish — resolved below (user made CN/JP/AR/HE must-haves, no discards).

## Official language catalog (researched 2026-08-16)

QLOCKTWO EARTH ships in 23–24 face variants. Codes from [Clock Forward's EARTH 90 listing](https://clockforward.com/qlocktwo/earth-90-large-word-clock/):
CA Catalan, CH Swiss German, CN Chinese, CZ Czech, D2/D3 (Swabian)/D4/DE German variants, DK Danish, E2/EN English variants, ES Spanish, FR French, GR Greek, HE Hebrew, IT Italian, JP Japanese, NL Dutch, NO Norwegian, PE Portuguese, RO Romanian, RU Russian, SE Swedish, TR Turkish.
Arabic exists in the [QLOCKTWO W line](https://quillandpad.com/2018/08/31/word-for-word-qlocktwo-presents-a-new-approach-to-telling-the-time/) (7 languages incl. Arabic).
Finish names confirmed on [qlocktwo.com Earth 45](https://www.qlocktwo.com/en-us/earth/45): Steel Series, Desert (marble), Glintscape, Metamorphite (slate), Rust, Vintage Copper, Silver & Gold, Gold, Platinum, Moon Gold, Black/Grey/White Pepper, Hazelnut, Stainless Steel.

## Non-Latin script fonts (must-have per user, 2026-08-16)

| Script | Languages | Font | Why |
|---|---|---|---|
| Latin | EN, DE×4, FR, IT, ES, CA, NL, DK, NO, SE, CZ, RO, PE, TR, CH | DINish Medium | closest free DIN descendant |
| Cyrillic | RU, custom Serbian | DINish Medium | covered since v3.006 |
| Arabic | AR | [Noto Kufi Arabic](https://fonts.google.com/noto/specimen/Noto+Kufi+Arabic) | OFL; "simplified, unmodulated Kufi" — geometric/engineered like DIN; angular, constant-thickness strokes; ideal for signage/UI (a clock face is display use, not long-form text) |
| Hebrew | HE | Noto Sans Hebrew | OFL, Medium weight available, consistent with Noto system |
| Chinese | CN | Noto Sans SC | OFL; large font solved by subsetting (below) |
| Japanese | JP | Noto Sans JP | OFL; subsetting (below) |
| Greek | GR | Noto Sans (Greek) | DINish has no Greek; Noto Sans is the weight-matched fallback |

**Size strategy:** every matrix uses at most ~110 fixed glyphs, so at build time each non-Latin font is **subset to exactly its matrix's characters** (fonttools/pyftsubset → woff2). A CJK font collapses from ~10 MB to a few KB. OFL permits subsetting and redistribution with the license file retained.

**Fidelity note:** the physical CN/JP/AR/HE QLOCKTWO faces use the manufacturer's own letterforms; ours will be the closest open equivalents, weight-matched to DINish Medium (Arabic set one optical step larger per bilingual-pairing practice, since Arabic has no capitals — [Medium: Matching Arabic & Latin scripts](https://medium.com/3azalam/matching-arabic-latin-scripts-in-logotypes-777db80c5c17)).
