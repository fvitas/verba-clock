import type { LanguageDef } from '../types';
import { english } from './en';
import { german } from './de';

export const LANGUAGES: LanguageDef[] = [english, german];

export const getLanguage = (id: string): LanguageDef => LANGUAGES.find((l) => l.id === id) ?? english;
