import type { LanguageDef } from '../types';
import { english } from './en';

export const LANGUAGES: LanguageDef[] = [english];

export const getLanguage = (id: string): LanguageDef => LANGUAGES.find((l) => l.id === id) ?? english;
