// Custom Verba matrix (no QLOCKTWO Finnish exists — checked against the QLOCKGENERATOR
// language list; the only community layout, elParaguayo/qtile-extras, is 19x8, not 11x10)
// System: puoli always names the COMING hour ("puoli kolme" = 2:30), so :20-:55 read off it —
// :20 kymmentä vaille puoli, :40 kymmenen yli puoli, :45 varttia vaille. Nominative with yli
// (viisi yli), partitive with vaille (viittä vaille), genitive vartin yli vs partitive varttia
// vaille. Word order puts minutes before the hour, so the minute zone sits above the hour zone.
// Fragments (D28): VII+SI/TTÄ (viisi/viittä), KYM+MENEN/MEN+TÄ, VART+IN/TIA, KUU/VII+SI,
// Y/KA+KSI(+TOISTA), Y/KA+H+DEKS and SEITSEM sharing the A/Ä + N suffix cells.
import { word, type LanguageDef, type WordCoord } from '../types';

const KELLO = word('KELLO', 0, 0);
const ON = word('ON', 0, 6);

const VII_MIN = word('VII', 1, 0);
const SI_MIN = word('SI', 1, 3);
const TTA = word('TTÄ', 1, 5);
const KYM = word('KYM', 1, 8);
const MENEN = word('MENEN', 2, 0);
const MEN = word('MEN', 2, 0);
const TA = word('TÄ', 2, 5);
const VART = word('VART', 2, 7);
const IN = word('IN', 3, 0);
const TIA = word('TIA', 3, 2);
const VAILLE = word('VAILLE', 3, 5);
const YLI = word('YLI', 4, 0);
const PUOLI = word('PUOLI', 4, 3);

const KA = word('KA', 4, 8);
const Y = word('Y', 4, 10);
const KSI = word('KSI', 5, 0);
const TOISTA = word('TOISTA', 5, 3);
const KOLME = word('KOLME', 6, 0);
const KUU = word('KUU', 6, 5);
const VII_HOUR = word('VII', 6, 8);
const SI_HOUR = word('SI', 7, 0);
const NELJA = word('NELJÄ', 7, 2);
const Y_HOUR = word('Y', 7, 7);
const KA_HOUR = word('KA', 7, 8);
const H = word('H', 7, 10);
const DEKS = word('DEKS', 8, 0);
const SEITSEM = word('SEITSEM', 8, 4);
const A = word('A', 9, 0);
const AE = word('Ä', 9, 1);
const N = word('N', 9, 2);
const KYMMENEN_HOUR = word('KYMMENEN', 9, 3);

const HOURS: WordCoord[][] = [
  [KA, KSI, TOISTA],
  [Y, KSI],
  [KA, KSI],
  [KOLME],
  [NELJA],
  [VII_HOUR, SI_HOUR],
  [KUU, SI_HOUR],
  [SEITSEM, AE, N],
  [KA_HOUR, H, DEKS, A, N],
  [Y_HOUR, H, DEKS, AE, N],
  [KYMMENEN_HOUR],
  [Y, KSI, TOISTA],
];

const MINUTE_WORDS: Record<number, WordCoord[]> = {
  0: [],
  5: [VII_MIN, SI_MIN, YLI],
  10: [KYM, MENEN, YLI],
  15: [VART, IN, YLI],
  20: [KYM, MEN, TA, VAILLE, PUOLI],
  25: [VII_MIN, TTA, VAILLE, PUOLI],
  30: [PUOLI],
  35: [VII_MIN, SI_MIN, YLI, PUOLI],
  40: [KYM, MENEN, YLI, PUOLI],
  45: [VART, TIA, VAILLE],
  50: [KYM, MEN, TA, VAILLE],
  55: [VII_MIN, TTA, VAILLE],
};

function phrase(hours: number, minutes: number): WordCoord[] {
  const m = Math.floor(minutes / 5) * 5;
  // puoli names the coming hour, so everything from :20 on rolls over
  const hour = HOURS[(m >= 20 ? hours + 1 : hours) % 12];
  return [...MINUTE_WORDS[m], ...hour];
}

export const finnish: LanguageDef = {
  id: 'fi',
  name: 'Finnish',
  sample: 'KELLO ON',
  rows: [
    'KELLOTONÄVÖ',
    'VIISITTÄKYM',
    'MENENTÄVART',
    'INTIAVAILLE',
    'YLIPUOLIKAY',
    'KSITOISTAÄM',
    'KOLMEKUUVII',
    'SINELJÄYKAH',
    'DEKSSEITSEM',
    'AÄNKYMMENEN',
  ],
  itIs: [KELLO, ON],
  words: [KELLO, ON, VII_MIN, SI_MIN, TTA, KYM, MENEN, MEN, TA, VART, IN, TIA, VAILLE, YLI, PUOLI, KA, Y, KSI, TOISTA, KOLME, KUU, VII_HOUR, SI_HOUR, NELJA, Y_HOUR, KA_HOUR, H, DEKS, SEITSEM, A, AE, N, KYMMENEN_HOUR],
  phrase,
};
