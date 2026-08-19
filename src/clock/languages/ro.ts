// Matrix source: https://github.com/vulture20/QLOCKGENERATOR/blob/master/src/app/configs/languages.ts
// Cross-checked with: https://github.com/bramp/wordclock/blob/master/lib/languages/natural/romanian.dart (reference grid + logic)
import { word, type LanguageDef, type WordCoord } from '../types';

const ESTE = word('ESTE', 0, 0);
const ORA = word('ORA', 0, 5);
const DOUA = word('DOUĂ', 1, 0);
const SPRE = word('SPRE', 1, 5);
const UNSPREZECE = word('UNSPREZECE', 2, 0);
const ZECE_HOUR = word('ZECE', 2, 6);
const NOUA = word('NOUĂ', 3, 0);
const OPT = word('OPT', 3, 4);
const SASE = word('ŞASE', 3, 7);
const PATRU = word('PATRU', 4, 0);
const UNU = word('UNU', 4, 4);
const TREI = word('TREI', 4, 7);
const SAPTE = word('ŞAPTE', 5, 0);
const CINCI_HOUR = word('CINCI', 5, 5);
const SI = word('ŞI', 6, 0);
const TREIZECI = word('TREIZECI', 6, 3);
const FARA = word('FĂRĂ', 7, 0);
const ZECE_MIN = word('ZECE', 7, 5);
const UN = word('UN', 7, 9);
const DOUAZECI = word('DOUĂZECI', 8, 0);
const SI_2 = word('ŞI', 8, 9);
const CINCI_MIN = word('CINCI', 9, 0);
const SFERT = word('SFERT', 9, 6);

const HOURS: WordCoord[][] = [
  [DOUA, SPRE, ZECE_HOUR],
  [UNU],
  [DOUA],
  [TREI],
  [PATRU],
  [CINCI_HOUR],
  [SASE],
  [SAPTE],
  [OPT],
  [NOUA],
  [ZECE_HOUR],
  [UNSPREZECE],
];

// Romanian shows the NEXT hour from :40 (fără douăzeci)
const MINUTE_WORDS: Record<number, WordCoord[]> = {
  0: [],
  5: [SI, CINCI_MIN],
  10: [SI, ZECE_MIN],
  15: [SI, UN, SFERT],
  20: [SI, DOUAZECI],
  25: [SI, DOUAZECI, SI_2, CINCI_MIN],
  30: [SI, TREIZECI],
  35: [SI, TREIZECI, SI_2, CINCI_MIN],
  40: [FARA, DOUAZECI],
  45: [FARA, UN, SFERT],
  50: [FARA, ZECE_MIN],
  55: [FARA, CINCI_MIN],
};

function phrase(hours: number, minutes: number): WordCoord[] {
  const m = Math.floor(minutes / 5) * 5;
  const hour = HOURS[(m >= 40 ? hours + 1 : hours) % 12];
  return [...hour, ...MINUTE_WORDS[m]];
}

export const romanian: LanguageDef = {
  id: 'ro',
  name: 'Romanian',
  sample: 'ESTE ORA',
  rows: [
    'ESTEZORAPMO',
    'DOUĂNSPREAM',
    'UNSPREZECEL',
    'NOUĂOPTŞASE',
    'PATRUNUTREI',
    'ŞAPTECINCIA',
    'ŞIBTREIZECI',
    'FĂRĂOZECEUN',
    'DOUĂZECIVŞI',
    'CINCIUSFERT',
  ],
  itIs: [ESTE, ORA],
  words: [ESTE, ORA, DOUA, SPRE, UNSPREZECE, ZECE_HOUR, NOUA, OPT, SASE, PATRU, UNU, TREI, SAPTE, CINCI_HOUR, SI, TREIZECI, FARA, ZECE_MIN, UN, DOUAZECI, SI_2, CINCI_MIN, SFERT],
  phrase,
};
