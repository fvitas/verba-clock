import { beforeEach, describe, expect, it } from 'vitest';
import { DEFAULT_SETTINGS, loadSettings, saveSettings } from './store';

describe('settings store', () => {
  beforeEach(() => localStorage.clear());

  it('returns defaults when storage is empty', () => {
    expect(loadSettings(localStorage)).toEqual(DEFAULT_SETTINGS);
  });

  it('round-trips saved settings', () => {
    const custom = { ...DEFAULT_SETTINGS, finishId: 'rust', brightness: 0.5 };
    saveSettings(localStorage, custom);
    expect(loadSettings(localStorage)).toEqual(custom);
  });

  it('returns defaults on corrupt JSON', () => {
    localStorage.setItem('verba-settings', '{not json');
    expect(loadSettings(localStorage)).toEqual(DEFAULT_SETTINGS);
  });

  it('returns defaults on unknown schema version', () => {
    localStorage.setItem('verba-settings', JSON.stringify({ schemaVersion: 99, finishId: 'rust' }));
    expect(loadSettings(localStorage)).toEqual(DEFAULT_SETTINGS);
  });

  it('fills missing keys from defaults', () => {
    localStorage.setItem('verba-settings', JSON.stringify({ schemaVersion: 1, finishId: 'gold' }));
    expect(loadSettings(localStorage)).toEqual({ ...DEFAULT_SETTINGS, finishId: 'gold' });
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

  it('fills light play for persisted v1 settings that predate it', () => {
    localStorage.setItem('verba-settings', JSON.stringify({ schemaVersion: 1, dots: 'minutes' }));
    expect(loadSettings(localStorage).lightPlay).toBe('ripple');
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
