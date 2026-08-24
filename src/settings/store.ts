import type { LightPlaySetting } from '../lightplay/effects';
import type { CustomTheme } from '../themes/model';

export type Presentation = 'fullbleed' | 'wall';

export type DotsMode = 'corners' | 'minutes' | 'off';

export type Transition = 'instant' | 'crossfade' | 'typewriter' | 'offthenon';

export type Settings = {
  schemaVersion: 2;
  languageId: string;
  themeId: string;
  customThemes: CustomTheme[];
  presentation: Presentation;
  showItIs: boolean;
  dots: DotsMode;
  transition: Transition;
  lightPlay: LightPlaySetting;
  brightness: number;
  keepAwake: boolean;
  dockMode: boolean;
  haptics: boolean;
};

export const DEFAULT_SETTINGS: Settings = {
  schemaVersion: 2,
  languageId: 'en',
  themeId: 'deep-black',
  customThemes: [],
  presentation: 'fullbleed',
  showItIs: true,
  dots: 'corners',
  transition: 'crossfade',
  lightPlay: 'ripple',
  brightness: 1,
  keepAwake: true,
  dockMode: false,
  haptics: true,
};

const KEY = 'verba-settings';

export function loadSettings(storage: Storage): Settings {
  try {
    const raw = storage.getItem(KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const { showDots, egg, finishId, ...parsed } = JSON.parse(raw) as Partial<Settings> & {
      schemaVersion?: number;
      showDots?: boolean;
      egg?: LightPlaySetting;
      finishId?: string;
    };
    if (parsed.schemaVersion !== 2 && parsed.schemaVersion !== 1) return DEFAULT_SETTINGS;
    const settings = { ...DEFAULT_SETTINGS, ...parsed, schemaVersion: 2 as const };
    // v1 stored the built-in look as finishId; built-in ids double as theme ids
    if (parsed.themeId === undefined && finishId !== undefined) settings.themeId = finishId;
    // Legacy boolean predates the dots mode; true meant the corner dots
    if (parsed.dots === undefined && showDots === false) settings.dots = 'off';
    // Light play shipped briefly under its design name, "easter egg"
    if (parsed.lightPlay === undefined && egg !== undefined) settings.lightPlay = egg;
    return settings;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(storage: Storage, settings: Settings): void {
  storage.setItem(KEY, JSON.stringify(settings));
}
