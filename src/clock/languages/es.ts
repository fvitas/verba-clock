// Matrix sources: https://github.com/vulture20/QLOCKGENERATOR/blob/master/src/app/configs/languages.ts
// and https://github.com/ukw100/wordclock24h/blob/master/make-tables/tables12h-es.c (identical)
// Phrase logic cross-checked with https://github.com/bracci/Qlockthree/blob/master/Renderer.cpp
import { word, type LanguageDef, type WordCoord } from '../types';

const ES = word('ES', 0, 0);
const SON = word('SON', 0, 1);
const LA = word('LA', 0, 5);
const LAS = word('LAS', 0, 5);
const UNA = word('UNA', 0, 8);
const DOS = word('DOS', 1, 0);
const TRES = word('TRES', 1, 4);
const CUATRO = word('CUATRO', 2, 0);
const CINCO_HOUR = word('CINCO', 2, 6);
const SEIS = word('SEIS', 3, 0);
const SIETE = word('SIETE', 3, 5);
const OCHO = word('OCHO', 4, 0);
const NUEVE = word('NUEVE', 4, 4);
const DIEZ_HOUR = word('DIEZ', 5, 2);
const ONCE = word('ONCE', 5, 7);
const DOCE = word('DOCE', 6, 0);
const Y = word('Y', 6, 5);
const MENOS = word('MENOS', 6, 6);
const VEINTE = word('VEINTE', 7, 1);
const DIEZ_MIN = word('DIEZ', 7, 7);
const VEINTICINCO = word('VEINTICINCO', 8, 0);
const CINCO_MIN = word('CINCO', 8, 6);
const MEDIA = word('MEDIA', 9, 0);
const CUARTO = word('CUARTO', 9, 5);

const HOURS = [DOCE, UNA, DOS, TRES, CUATRO, CINCO_HOUR, SEIS, SIETE, OCHO, NUEVE, DIEZ_HOUR, ONCE];

const displayHour = (hours: number, m: number): number => (m >= 35 ? hours + 1 : hours) % 12;

const MINUTE_WORDS: Record<number, WordCoord[]> = {
  0: [],
  5: [Y, CINCO_MIN],
  10: [Y, DIEZ_MIN],
  15: [Y, CUARTO],
  20: [Y, VEINTE],
  25: [Y, VEINTICINCO],
  30: [Y, MEDIA],
  35: [MENOS, VEINTICINCO],
  40: [MENOS, VEINTE],
  45: [MENOS, CUARTO],
  50: [MENOS, DIEZ_MIN],
  55: [MENOS, CINCO_MIN],
};

function itIsFor(hours: number, minutes: number): WordCoord[] {
  const m = Math.floor(minutes / 5) * 5;
  return displayHour(hours, m) === 1 ? [ES, LA] : [SON, LAS];
}

function phrase(hours: number, minutes: number): WordCoord[] {
  const m = Math.floor(minutes / 5) * 5;
  return [HOURS[displayHour(hours, m)], ...MINUTE_WORDS[m]];
}

export const spanish: LanguageDef = {
  id: 'es',
  name: 'Spanish',
  sample: 'SON LAS',
  rows: [
    'ESONELASUNA',
    'DOSITRESOAM',
    'CUATROCINCO',
    'SEISASIETEN',
    'OCHONUEVEPM',
    'LADIEZSONCE',
    'DOCELYMENOS',
    'OVEINTEDIEZ',
    'VEINTICINCO',
    'MEDIACUARTO',
  ],
  itIs: [SON, LAS],
  itIsFor,
  words: [ES, SON, LA, LAS, UNA, DOS, TRES, CUATRO, CINCO_HOUR, SEIS, SIETE, OCHO, NUEVE, DIEZ_HOUR, ONCE, DOCE, Y, MENOS, VEINTE, DIEZ_MIN, VEINTICINCO, CINCO_MIN, MEDIA, CUARTO],
  phrase,
};
