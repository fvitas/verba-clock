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
- Caveat: non-Latin/non-Cyrillic matrices (Chinese, Japanese, Arabic, Hebrew, Greek if attempted in Plan 3) are NOT covered — those need per-language font fallbacks or count toward D4 discards.
