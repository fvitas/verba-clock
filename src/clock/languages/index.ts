import type { LanguageDef } from '../types';
import { english } from './en';
import { german } from './de';
import { french } from './fr';
import { italian } from './it';
import { spanish } from './es';
import { dutch } from './nl';
import { catalan } from './ca';
import { danish } from './dk';
import { norwegian } from './no';

export const LANGUAGES: LanguageDef[] = [english, german, french, italian, spanish, catalan, dutch, danish, norwegian];

export const getLanguage = (id: string): LanguageDef => LANGUAGES.find((l) => l.id === id) ?? english;
