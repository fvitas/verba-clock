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
});
