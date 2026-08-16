# Language Verification Status

A language ships only when `verified`. Per D4 a language may be discarded with a documented reason. Per D13 (2026-08-16): all **European** faces (Latin, Russian, Greek) are must-haves; Chinese, Japanese, Arabic, Hebrew are `not planned` (descoped by user).

Official catalog source: Clock Forward EARTH 90 listing + QLOCKTWO W line (see `docs/research/2026-08-16-qlocktwo-typeface.md`).

| Code | Language | Script / Font | File | Status | Notes |
|---|---|---|---|---|---|
| EN | English | Latin / DINish | `src/clock/languages/en.ts` | verified | 16 phrase cases + grid integrity |
| E2 | English (alt display) | Latin / DINish | — | pending | variant of EN face |
| DE | German | Latin / DINish | `src/clock/languages/de.ts` | verified | 17 phrase cases + grid integrity; source: https://github.com/ministubbe/clock/blob/master/qlocktwo.html |
| D2 | German (alt) | Latin / DINish | `src/clock/languages/d2.ts` | verified | 15 phrase cases; same DE faceplate, DREIVIERTEL at :45, halb pivot from :20; sources: bramp GermanAlternative + ukw100 de modes |
| D3 | German (Swabian) | Latin / DINish | — | pending | dialect |
| D4 | German (alt) | Latin / DINish | — | pending | |
| CH | Swiss German | Latin / DINish | `src/clock/languages/ch.ts` | verified | 16 phrase cases + grid integrity; sources: QLOCKGENERATOR + ukw100 ch1 + bracci renderer logic |
| FR | French | Latin / DINish | `src/clock/languages/fr.ts` | verified | 20 phrase cases + grid integrity; sources: QLOCKGENERATOR languages.ts + bracci/Qlockthree Woerter_FR.h |
| IT | Italian | Latin / DINish | `src/clock/languages/it.ts` | verified | 18 phrase cases + grid integrity; sources: QLOCKGENERATOR + ukw100/wordclock24h tables12h-it.c; hour-dependent it-is (SONO LE / È) via new `itIsFor` |
| ES | Spanish | Latin / DINish | `src/clock/languages/es.ts` | verified | 18 phrase cases + grid integrity; sources: QLOCKGENERATOR + ukw100 tables12h-es.c; ES LA UNA vs SON LAS via itIsFor |
| CA | Catalan | Latin / DINish | `src/clock/languages/ca.ts` | verified | 20 phrase cases + grid integrity; bell-quart system; sources: QLOCKGENERATOR + bramp/wordclock reference grid + cdmoro examples |
| NL | Dutch | Latin / DINish | `src/clock/languages/nl.ts` | verified | 17 phrase cases + grid integrity; sources: QLOCKGENERATOR + bracci/Qlockthree Woerter_NL.h; next-hour pivot from :20 |
| DK | Danish | Latin / DINish | `src/clock/languages/dk.ts` | verified | 16 phrase cases + grid integrity; sources: QLOCKGENERATOR + bramp/wordclock reference; MINUTTER lit on 5/10/20 deltas |
| NO | Norwegian | Latin / DINish | `src/clock/languages/no.ts` | verified | 16 phrase cases + grid integrity; sources: QLOCKGENERATOR + bramp reference; lowercase-l quirk normalized to I; next-hour from :20 |
| SE | Swedish | Latin / DINish | `src/clock/languages/se.ts` | verified | 16 phrase cases + grid integrity; sources: QLOCKGENERATOR + ukw100 tables12h-se.c positions + bramp logic |
| CZ | Czech | Latin / DINish | `src/clock/languages/cz.ts` | verified | 19 phrase cases + grid integrity; digital-readout style; JE/JSOU via itIsFor; sources: QLOCKGENERATOR + bramp reference |
| RO | Romanian | Latin / DINish | `src/clock/languages/ro.ts` | verified | 17 phrase cases + grid integrity; sources: QLOCKGENERATOR + bramp reference; FĂRĂ + next hour from :40 |
| PE | Portuguese | Latin / DINish | `src/clock/languages/pe.ts` | verified | 19 phrase cases + grid integrity; sources: QLOCKGENERATOR + bramp reference + cdmoro indices; MEIA NOITE/MEIO DIA faces; 12:30 quirk É MEIA HORA |
| TR | Turkish | Latin / DINish | `src/clock/languages/tr.ts` | verified | 21 phrase cases + grid integrity; accusative hours + GEÇİYOR; sources: QLOCKGENERATOR + bramp reference + cdmoro examples |
| GR | Greek | Greek / Noto Sans | — | pending | DINish lacks Greek |
| RU | Russian | Cyrillic / DINish | — | pending | |
| HE | Hebrew | Hebrew / Noto Sans Hebrew | — | not planned (v1) | descoped per D13; RTL |
| AR | Arabic | Arabic / Noto Kufi Arabic | — | not planned (v1) | descoped per D13; RTL; from QLOCKTWO W line |
| CN | Chinese | Han / Noto Sans SC (subset) | — | not planned (v1) | descoped per D13; |
| JP | Japanese | Kana+Han / Noto Sans JP (subset) | — | not planned (v1) | descoped per D13; |
| SR | Serbian (custom) | Cyrillic / DINish | — | pending | our own matrix (D4b); user verifies |

Non-Latin fonts are subset at build time to each matrix's exact glyphs (few-KB files even for CJK).
