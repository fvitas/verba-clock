# Language Verification Status

A language ships only when `verified`. Per D4 a language may be discarded with a documented reason. Per D13 (2026-08-16): all **European** faces (Latin, Russian, Greek) are must-haves; Chinese, Japanese, Arabic, Hebrew are `not planned` (descoped by user).

Official catalog source: Clock Forward EARTH 90 listing + QLOCKTWO W line (see `docs/research/2026-08-16-qlocktwo-typeface.md`).

| Code | Language | Script / Font | File | Status | Notes |
|---|---|---|---|---|---|
| EN | English | Latin / DINish | `src/clock/languages/en.ts` | verified | 16 phrase cases + grid integrity |
| E2 | English (alt display) | Latin / DINish | — | pending | variant of EN face |
| DE | German | Latin / DINish | `src/clock/languages/de.ts` | verified | 17 phrase cases + grid integrity; source: https://github.com/ministubbe/clock/blob/master/qlocktwo.html |
| D2 | German (alt) | Latin / DINish | — | pending | |
| D3 | German (Swabian) | Latin / DINish | — | pending | dialect |
| D4 | German (alt) | Latin / DINish | — | pending | |
| CH | Swiss German | Latin / DINish | — | pending | |
| FR | French | Latin / DINish | `src/clock/languages/fr.ts` | verified | 20 phrase cases + grid integrity; sources: QLOCKGENERATOR languages.ts + bracci/Qlockthree Woerter_FR.h |
| IT | Italian | Latin / DINish | `src/clock/languages/it.ts` | verified | 18 phrase cases + grid integrity; sources: QLOCKGENERATOR + ukw100/wordclock24h tables12h-it.c; hour-dependent it-is (SONO LE / È) via new `itIsFor` |
| ES | Spanish | Latin / DINish | `src/clock/languages/es.ts` | verified | 18 phrase cases + grid integrity; sources: QLOCKGENERATOR + ukw100 tables12h-es.c; ES LA UNA vs SON LAS via itIsFor |
| CA | Catalan | Latin / DINish | `src/clock/languages/ca.ts` | verified | 20 phrase cases + grid integrity; bell-quart system; sources: QLOCKGENERATOR + bramp/wordclock reference grid + cdmoro examples |
| NL | Dutch | Latin / DINish | `src/clock/languages/nl.ts` | verified | 17 phrase cases + grid integrity; sources: QLOCKGENERATOR + bracci/Qlockthree Woerter_NL.h; next-hour pivot from :20 |
| DK | Danish | Latin / DINish | `src/clock/languages/dk.ts` | verified | 16 phrase cases + grid integrity; sources: QLOCKGENERATOR + bramp/wordclock reference; MINUTTER lit on 5/10/20 deltas |
| NO | Norwegian | Latin / DINish | — | pending | |
| SE | Swedish | Latin / DINish | — | pending | |
| CZ | Czech | Latin / DINish | — | pending | |
| RO | Romanian | Latin / DINish | — | pending | |
| PE | Portuguese | Latin / DINish | — | pending | |
| TR | Turkish | Latin / DINish | — | pending | |
| GR | Greek | Greek / Noto Sans | — | pending | DINish lacks Greek |
| RU | Russian | Cyrillic / DINish | — | pending | |
| HE | Hebrew | Hebrew / Noto Sans Hebrew | — | not planned (v1) | descoped per D13; RTL |
| AR | Arabic | Arabic / Noto Kufi Arabic | — | not planned (v1) | descoped per D13; RTL; from QLOCKTWO W line |
| CN | Chinese | Han / Noto Sans SC (subset) | — | not planned (v1) | descoped per D13; |
| JP | Japanese | Kana+Han / Noto Sans JP (subset) | — | not planned (v1) | descoped per D13; |
| SR | Serbian (custom) | Cyrillic / DINish | — | pending | our own matrix (D4b); user verifies |

Non-Latin fonts are subset at build time to each matrix's exact glyphs (few-KB files even for CJK).
