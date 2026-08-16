// Matrix source: https://github.com/vulture20/QLOCKGENERATOR/blob/master/src/app/configs/languages.ts
// Cross-checked with: https://github.com/ukw100/wordclock24h/blob/master/make-tables/tables12h-se.c (word positions)
// and https://github.com/bramp/wordclock/blob/master/lib/languages/natural/swedish_time_to_words.dart (phrase logic)
import { word, type LanguageDef, type WordCoord } from '../types';

const KLOCKAN = word('KLOCKAN', 0, 0);
const AER = word('ÄR', 0, 8);
const FEM_MIN = word('FEM', 1, 0);
const I_FEM = word('I', 1, 4);
const TIO_MIN = word('TIO', 1, 6);
const I_TIO = word('I', 1, 10);
const KVART = word('KVART', 2, 0);
const I_KVART = word('I', 2, 6);
const TJUGO = word('TJUGO', 3, 0);
const I_TJUGO = word('I', 3, 6);
const OEVER = word('ÖVER', 4, 0);
const HALV = word('HALV', 4, 7);
const ETT = word('ETT', 5, 0);
const TVAA = word('TVÅ', 5, 8);
const TRE = word('TRE', 6, 0);
const FYRA = word('FYRA', 6, 7);
const FEM_HOUR = word('FEM', 7, 0);
const SEX = word('SEX', 7, 8);
const SJU = word('SJU', 8, 0);
const AATTA = word('ÅTTA', 8, 3);
const NIO = word('NIO', 8, 8);
const TIO_HOUR = word('TIO', 9, 0);
const ELVA = word('ELVA', 9, 3);
const TOLV = word('TOLV', 9, 7);

const HOURS = [TOLV, ETT, TVAA, TRE, FYRA, FEM_HOUR, SEX, SJU, AATTA, NIO, TIO_HOUR, ELVA];

// Swedish shows the NEXT hour from :25 (fem i halv elva)
const MINUTE_WORDS: Record<number, WordCoord[]> = {
  0: [],
  5: [FEM_MIN, OEVER],
  10: [TIO_MIN, OEVER],
  15: [KVART, OEVER],
  20: [TJUGO, OEVER],
  25: [FEM_MIN, I_FEM, HALV],
  30: [HALV],
  35: [FEM_MIN, OEVER, HALV],
  40: [TJUGO, I_TJUGO],
  45: [KVART, I_KVART],
  50: [TIO_MIN, I_TIO],
  55: [FEM_MIN, I_FEM],
};

function phrase(hours: number, minutes: number): WordCoord[] {
  const m = Math.floor(minutes / 5) * 5;
  const hour = HOURS[(m >= 25 ? hours + 1 : hours) % 12];
  return [...MINUTE_WORDS[m], hour];
}

export const swedish: LanguageDef = {
  id: 'se',
  name: 'Svenska',
  sample: 'KLOCKAN ÄR',
  rows: [
    'KLOCKANTÄRK',
    'FEMYISTIONI',
    'KVARTQIENZO',
    'TJUGOLIVIPM',
    'ÖVERKAMHALV',
    'ETTUSVLXTVÅ',
    'TREMYKYFYRA',
    'FEMSFLORSEX',
    'SJUÅTTAINIO',
    'TIOELVATOLV',
  ],
  itIs: [KLOCKAN, AER],
  words: [KLOCKAN, AER, FEM_MIN, I_FEM, TIO_MIN, I_TIO, KVART, I_KVART, TJUGO, I_TJUGO, OEVER, HALV, ETT, TVAA, TRE, FYRA, FEM_HOUR, SEX, SJU, AATTA, NIO, TIO_HOUR, ELVA, TOLV],
  phrase,
};
