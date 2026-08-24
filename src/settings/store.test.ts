import { beforeEach, describe, expect, it } from 'vitest';
import { DEFAULT_SETTINGS, loadSettings, saveSettings } from './store';

describe('settings store', () => {
  beforeEach(() => localStorage.clear());

  it('returns defaults when storage is empty', () => {
    expect(loadSettings(localStorage)).toEqual(DEFAULT_SETTINGS);
  });

  it('round-trips saved settings', () => {
    const custom = { ...DEFAULT_SETTINGS, themeId: 'rust', brightness: 0.5 };
    saveSettings(localStorage, custom);
    expect(loadSettings(localStorage)).toEqual(custom);
  });

  it('round-trips custom themes', () => {
    const theme = {
      id: 'custom-1',
      name: 'Night Amber',
      background: { kind: 'solid' as const, color: '#0d1526' },
      ledColor: '#ffb347',
      dimOpacity: 0.15,
      glow: 0.55,
    };
    const custom = { ...DEFAULT_SETTINGS, themeId: 'custom-1', customThemes: [theme] };
    saveSettings(localStorage, custom);
    expect(loadSettings(localStorage)).toEqual(custom);
  });

  it('returns defaults on corrupt JSON', () => {
    localStorage.setItem('verba-settings', '{not json');
    expect(loadSettings(localStorage)).toEqual(DEFAULT_SETTINGS);
  });

  it('returns defaults on unknown schema version', () => {
    localStorage.setItem('verba-settings', JSON.stringify({ schemaVersion: 99, themeId: 'rust' }));
    expect(loadSettings(localStorage)).toEqual(DEFAULT_SETTINGS);
  });

  it('fills missing keys from defaults', () => {
    localStorage.setItem('verba-settings', JSON.stringify({ schemaVersion: 2, themeId: 'gold' }));
    expect(loadSettings(localStorage)).toEqual({ ...DEFAULT_SETTINGS, themeId: 'gold' });
  });

  it('migrates a v1 finishId to the theme id', () => {
    localStorage.setItem('verba-settings', JSON.stringify({ schemaVersion: 1, finishId: 'gold' }));
    const settings = loadSettings(localStorage);
    expect(settings.schemaVersion).toBe(2);
    expect(settings.themeId).toBe('gold');
    expect(settings.customThemes).toEqual([]);
    expect('finishId' in settings).toBe(false);
  });

  it('migrates a full v1 payload without losing other keys', () => {
    localStorage.setItem(
      'verba-settings',
      JSON.stringify({ schemaVersion: 1, finishId: 'rust', languageId: 'sr', brightness: 0.5 }),
    );
    expect(loadSettings(localStorage)).toEqual({
      ...DEFAULT_SETTINGS,
      themeId: 'rust',
      languageId: 'sr',
      brightness: 0.5,
    });
  });

  it('defaults keepAwake to true', () => {
    expect(DEFAULT_SETTINGS.keepAwake).toBe(true);
  });

  it('fills keepAwake for persisted v1 settings that predate it', () => {
    localStorage.setItem('verba-settings', JSON.stringify({ schemaVersion: 1, languageId: 'sr' }));
    expect(loadSettings(localStorage).keepAwake).toBe(true);
  });

  it('defaults the minute change to a crossfade', () => {
    expect(DEFAULT_SETTINGS.transition).toBe('crossfade');
  });

  it('fills the transition for persisted v1 settings that predate it', () => {
    localStorage.setItem('verba-settings', JSON.stringify({ schemaVersion: 1, dots: 'minutes' }));
    expect(loadSettings(localStorage).transition).toBe('crossfade');
  });

  it('defaults light play to the ripple', () => {
    expect(DEFAULT_SETTINGS.lightPlay).toBe('ripple');
  });

  it('migrates the legacy egg key to light play', () => {
    localStorage.setItem('verba-settings', JSON.stringify({ schemaVersion: 1, egg: 'moire' }));
    const settings = loadSettings(localStorage);
    expect(settings.lightPlay).toBe('moire');
    expect('egg' in settings).toBe(false);
  });

  it('keeps an explicit light play choice over the legacy egg key', () => {
    localStorage.setItem(
      'verba-settings',
      JSON.stringify({ schemaVersion: 1, lightPlay: 'off', egg: 'moire' }),
    );
    expect(loadSettings(localStorage).lightPlay).toBe('off');
  });

  it('migrates legacy showDots: false to dots off', () => {
    localStorage.setItem('verba-settings', JSON.stringify({ schemaVersion: 1, showDots: false }));
    expect(loadSettings(localStorage).dots).toBe('off');
  });

  it('migrates legacy showDots: true to corner dots', () => {
    localStorage.setItem('verba-settings', JSON.stringify({ schemaVersion: 1, showDots: true }));
    const settings = loadSettings(localStorage);
    expect(settings.dots).toBe('corners');
    expect('showDots' in settings).toBe(false);
  });

  it('keeps an explicit dots mode over the legacy flag', () => {
    localStorage.setItem(
      'verba-settings',
      JSON.stringify({ schemaVersion: 1, dots: 'minutes', showDots: false }),
    );
    expect(loadSettings(localStorage).dots).toBe('minutes');
  });
});
