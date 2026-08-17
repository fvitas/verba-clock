# Word-clock app icon landscape (App Store research)

**Date:** 2026-08-17
**Method:** iTunes Search API (`itunes.apple.com/search`, terms `word clock`, `text clock`, `qlocktwo`) + lookup by id; every direct competitor's 512px icon (`artworkUrl512`) downloaded and visually inspected. US storefront.

## Direct competitors and their icons

| App | Author | Price | Ratings | Icon (inspected) |
|---|---|---|---|---|
| [Word Clock Pro: Widget](https://apps.apple.com/us/app/word-clock-pro-widget/id6756194050) | Vasic Stefan | $3.99 | 2 | **Dark square, faint grey letter grid, "WORD / CLOCK" lit white** — near-identical concept to our current icon |
| [WordClock Widget - Text Clock](https://apps.apple.com/us/app/wordclock-widget-text-clock/id6754885165) | Tobias Weissert | $0.99 | 2 | Full dense letter grid in small **amber** letters, a few lit; illegible at small sizes |
| [Word Clock · Text Time Widget](https://apps.apple.com/us/app/word-clock-text-time-widget/id6751505765) | Aarnav Ram | free | 2 | Playful 3D letters scattered on blue with a clock hand — toy-like |
| [Custom Word Clock - TextTime](https://apps.apple.com/us/app/custom-word-clock-texttime/id6449908609) | Daniel Gauthier | free | 4 | Teal "te:xt" wordmark |
| [Word Clock Pro - Text Time](https://apps.apple.com/us/app/word-clock-pro-text-time/id6504540811) | Daniel Gauthier | $2.99 | 0 | Same "te:xt" wordmark, dark |
| [Timeless – The Word Clock](https://apps.apple.com/us/app/a-word-clock/id431269615) | BuddhaCat | free | 3 | Black square, bold phrase **"twenty after four"** in white |
| [Text Clock Widget](https://apps.apple.com/us/app/text-clock-widget/id6483004254) | Magne Roald | $0.99 | 0 | Blue, phrase **"Nine to five"** over ghost clock face |
| [A Word Clock](https://apps.apple.com/us/app/a-word-clock/id977246406) | Raymund Vorwerk | $0.99 | 0 | Serif "Time in Words" over silver clock face — dated |
| [time4words](https://apps.apple.com/us/app/time4words/id1280479018) | BuddhaCat | free | 0 | Clock + "time for words" text — dated |
| [WordClock - Standing](https://apps.apple.com/us/app/wordclock-standing-word-clock-for-your-desk/id1246680738) | Miklos Kekkoi | free | 0 | Loud serif grid ITISHALFTEN / THREE**WORD** / SEVEN**CLOCK**, red accents |
| [Flashsetter](https://apps.apple.com/us/app/flashsetter/id1110375389) | **QLOCKTWO Manufacture GmbH** | free | 5 | Elegant: warm gradient, letter grid **dissolving into vertical stripes** on the left — their brand abstraction |

Notable: QLOCKTWO's own consumer app "TIME IN WORDS" and the classic "Tock - Text Clock" are **no longer on the US store** — the category is thinner than it once was; no dominant player (max 5 ratings among direct competitors).

## Findings

1. **Collision:** our shipped icon (authentic grid + lit VERBA in the middle) is conceptually identical to Word Clock Pro: Widget's icon (grid + lit WORD/CLOCK). Same dark square, same faint grid, same centered lit words.
2. Three established icon camps: **letter-grid** (Vasic, Weissert, Kekkoi), **phrase-as-icon** (Timeless, Text Clock Widget), **wordmark** (te:xt).
3. **Unclaimed territory** (things no competitor's icon uses): QLOCKTWO's corner minute dots; LED glow; material finishes (steel/marble); seconds-mode pixel digits; multi-script grids; negative space. The physical product's most recognizable cues are all free.
4. Everyone except Aarnav and the two blue ones is a dark flat square — a **light/material icon would stand out** in search results.
5. QLOCKTWO's own brand abstraction (grid→stripes dissolve) is elegant but theirs — imitating it is a trademark-adjacent risk on top of D2.

## Consequence

Icon exploration board: `mockups/app-icon-explorations.html` (13 concepts, elegant → eye-catchy → crazy, each at 220/64/32 px). Decision pending → D17 will be amended once the user picks.
