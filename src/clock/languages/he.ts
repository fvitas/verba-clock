// Official QLOCKTWO Hebrew face — an 11x10 LETTER grid like the Latin faces, but read
// RIGHT-to-left: column 0 is the RIGHTMOST cell. Rows below are stored in logical
// (reading) order and the renderer flips them visually via dir="rtl".
// Transcribed cell by cell at high zoom from mockups/reference-languages/he-hebrew-taupe.png
// and he-hebrew.png (both 7:30, showing השעה ... שבע וחצי).
// Grammar is digital-style: hour then minutes, always the CURRENT hour — the face has no
// "to" word (ל), so 7:45 reads שבע וארבעים וחמש, never רבע לשמונה.
// Two quirks the grid depends on:
// - חמש / שש / שבע overlap in row 3 (חמש+שש share a ש, שש+שבע share the next ש)
// - שתיים is squeezed into 4 cells; its single yod cell prints "יי" (see cellOverrides)
import { word, type LanguageDef, type WordCoord } from '../types';

// Fragments spell each row right-to-left; concatenating keeps the logical order auditable
const ROWS = [
  'השעה' + 'ר' + 'אחת' + 'עשר',
  'א' + 'ר' + 'שתים' + 'ר' + 'עשרה',
  'שלוש' + 'ארבע' + 'ראם',
  'חמש' + 'שבע' + 'שמונה',
  'ש' + 'תשע' + 'ר' + 'וחמישה',
  'א' + 'ועשרים' + 'מראש',
  'שלושים' + 'ועשרה',
  'וארבעים' + 'ורבע',
  'וחמישים' + 'וחצי',
  'אבת' + 'ושר' + 'וחמש' + 'א',
];

const HA_SHAA = word('השעה', 0, 0);
const ACHAT = word('אחת', 0, 5);
const ESER = word('עשר', 0, 8);
const SHTAIM = word('שתים', 1, 2);
const ESRE = word('עשרה', 1, 7);
const SHALOSH = word('שלוש', 2, 0);
const ARBA = word('ארבע', 2, 4);
const CHAMESH = word('חמש', 3, 0);
const SHESH = word('שש', 3, 2);
const SHEVA = word('שבע', 3, 3);
const SHMONE = word('שמונה', 3, 6);
const TESHA = word('תשע', 4, 1);

const VE_CHAMISHA = word('וחמישה', 4, 5);
const VE_ESRIM = word('ועשרים', 5, 1);
const SHLOSHIM = word('שלושים', 6, 0);
const VE_ASARA = word('ועשרה', 6, 6);
const VE_ARBAIM = word('וארבעים', 7, 0);
const VE_REVA = word('ורבע', 7, 7);
const VE_CHAMISHIM = word('וחמישים', 8, 0);
const VA_CHATZI = word('וחצי', 8, 7);
const VE_CHAMESH = word('וחמש', 9, 6);

// index 0 = twelve; 11 and 12 are two-word pairs ending in עשרה
const HOURS: WordCoord[][] = [
  [SHTAIM, ESRE],
  [ACHAT],
  [SHTAIM],
  [SHALOSH],
  [ARBA],
  [CHAMESH],
  [SHESH],
  [SHEVA],
  [SHMONE],
  [TESHA],
  [ESER],
  [ACHAT, ESRE],
];

// The tens words sit above וחמש so "twenty five" through "fifty five" stay in reading order
const MINUTES: Record<number, WordCoord[]> = {
  0: [],
  5: [VE_CHAMISHA],
  10: [VE_ASARA],
  15: [VE_REVA],
  20: [VE_ESRIM],
  25: [VE_ESRIM, VE_CHAMESH],
  30: [VA_CHATZI],
  35: [SHLOSHIM, VE_CHAMESH],
  40: [VE_ARBAIM],
  45: [VE_ARBAIM, VE_CHAMESH],
  50: [VE_CHAMISHIM],
  55: [VE_CHAMISHIM, VE_CHAMESH],
};

function phrase(hours: number, minutes: number): WordCoord[] {
  return [...HOURS[hours % 12], ...MINUTES[Math.floor(minutes / 5) * 5]];
}

export const hebrew: LanguageDef = {
  id: 'he',
  name: 'Hebrew',
  sample: 'שבע וחצי',
  rows: ROWS,
  itIs: [HA_SHAA],
  dir: 'rtl',
  // The stencil crams both yods of שתיים into one cell
  cellOverrides: { '1:4': 'יי' },
  words: [
    HA_SHAA,
    ACHAT,
    ESER,
    SHTAIM,
    ESRE,
    SHALOSH,
    ARBA,
    CHAMESH,
    SHESH,
    SHEVA,
    SHMONE,
    TESHA,
    VE_CHAMISHA,
    VE_ESRIM,
    SHLOSHIM,
    VE_ASARA,
    VE_ARBAIM,
    VE_REVA,
    VE_CHAMISHIM,
    VA_CHATZI,
    VE_CHAMESH,
  ],
  phrase,
};
