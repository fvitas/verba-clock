// Matrix source: https://github.com/vulture20/QLOCKGENERATOR/blob/master/src/app/configs/languages.ts
// Cross-checked with: https://github.com/bramp/wordclock/blob/master/lib/languages/natural/portuguese.dart (reference grid + logic)
// Word cell indices confirmed against cdmoro/wordoclock pt-PT.ts (standalone E is the E inside MENOS)
// Reference quirk kept: 12:30 reads É MEIA HORA
import { word, type LanguageDef, type WordCoord } from '../types';

const E_COPULA = word('É', 0, 0);
const SAO = word('SÃO', 0, 1);
const UMA = word('UMA', 0, 4);
const TRES = word('TRÊS', 0, 7);
const MEIO = word('MEIO', 1, 0);
const DIA = word('DIA', 1, 5);
const DEZ_HOUR = word('DEZ', 1, 8);
const DUAS = word('DUAS', 2, 0);
const SEIS = word('SEIS', 2, 3);
const SETE = word('SETE', 2, 6);
const QUATRO = word('QUATRO', 3, 0);
const NOVE = word('NOVE', 3, 7);
const CINCO_HOUR = word('CINCO', 4, 0);
const OITO = word('OITO', 4, 4);
const ONZE = word('ONZE', 4, 7);
const MEIA_NOITE = word('MEIA', 5, 1);
const NOITE = word('NOITE', 5, 6);
const HORA = word('HORA', 6, 0);
const HORAS = word('HORAS', 6, 0);
const MENOS = word('MENOS', 6, 6);
const E_AND = word('E', 6, 7);
const VINTE = word('VINTE', 7, 0);
const MEIA_MIN = word('MEIA', 7, 7);
const UM = word('UM', 8, 0);
const QUARTO = word('QUARTO', 8, 3);
const DEZ_MIN = word('DEZ', 9, 0);
const E_2 = word('E', 9, 4);
const CINCO_MIN = word('CINCO', 9, 6);

const HOURS = [MEIA_NOITE, UMA, DUAS, TRES, QUATRO, CINCO_HOUR, SEIS, SETE, OITO, NOVE, DEZ_HOUR, ONZE];

const MINUTE_WORDS: Record<number, WordCoord[]> = {
  0: [],
  5: [E_AND, CINCO_MIN],
  10: [E_AND, DEZ_MIN],
  15: [E_AND, UM, QUARTO],
  20: [E_AND, VINTE],
  25: [E_AND, VINTE, E_2, CINCO_MIN],
  30: [E_AND, MEIA_MIN],
  35: [MENOS, VINTE, E_2, CINCO_MIN],
  40: [MENOS, VINTE],
  45: [MENOS, UM, QUARTO],
  50: [MENOS, DEZ_MIN],
  55: [MENOS, CINCO_MIN],
};

const bucket = (minutes: number): number => Math.floor(minutes / 5) * 5;
const displayHour24 = (hours: number, m: number): number => (m >= 35 ? hours + 1 : hours) % 24;

function itIsFor(hours: number, minutes: number): WordCoord[] {
  const h24 = displayHour24(hours, bucket(minutes));
  return h24 === 0 || h24 === 12 || h24 % 12 === 1 ? [E_COPULA] : [SAO];
}

function phrase(hours: number, minutes: number): WordCoord[] {
  const m = bucket(minutes);
  const h24 = displayHour24(hours, m);
  if (h24 === 12 && m === 30) return [MEIA_NOITE, HORA];
  if (h24 === 0) return [MEIA_NOITE, NOITE, ...MINUTE_WORDS[m]];
  if (h24 === 12) return [MEIO, DIA, ...MINUTE_WORDS[m]];
  const hour = HOURS[h24 % 12];
  if (m === 0) return [hour, h24 % 12 === 1 ? HORA : HORAS];
  return [hour, ...MINUTE_WORDS[m]];
}

export const portuguese: LanguageDef = {
  id: 'pe',
  name: 'Portuguese',
  sample: 'SÃO',
  rows: [
    'ÉSÃOUMATRÊS',
    'MEIOLDIADEZ',
    'DUASEISETEY',
    'QUATROHNOVE',
    'CINCOITONZE',
    'ZMEIALNOITE',
    'HORASYMENOS',
    'VINTECAMEIA',
    'UMVQUARTOPM',
    'DEZOEYCINCO',
  ],
  itIs: [SAO],
  itIsFor,
  words: [E_COPULA, SAO, UMA, TRES, MEIO, DIA, DEZ_HOUR, DUAS, SEIS, SETE, QUATRO, NOVE, CINCO_HOUR, OITO, ONZE, MEIA_NOITE, NOITE, HORA, HORAS, MENOS, E_AND, VINTE, MEIA_MIN, UM, QUARTO, DEZ_MIN, E_2, CINCO_MIN],
  phrase,
};
