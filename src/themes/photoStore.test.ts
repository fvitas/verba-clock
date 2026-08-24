import { beforeEach, describe, expect, it } from 'vitest';
import { deletePhoto, loadPhoto, savePhoto } from './photoStore';

describe('photo store', () => {
  beforeEach(() => localStorage.clear());

  it('round-trips a photo per theme id', () => {
    expect(savePhoto(localStorage, 'custom-1', 'data:image/jpeg;base64,abc')).toBe(true);
    expect(loadPhoto(localStorage, 'custom-1')).toBe('data:image/jpeg;base64,abc');
    expect(loadPhoto(localStorage, 'custom-2')).toBeNull();
  });

  it('deletes a stored photo', () => {
    savePhoto(localStorage, 'custom-1', 'data:image/jpeg;base64,abc');
    deletePhoto(localStorage, 'custom-1');
    expect(loadPhoto(localStorage, 'custom-1')).toBeNull();
  });

  it('reports a failed save instead of throwing', () => {
    const full = {
      setItem: () => {
        throw new DOMException('quota');
      },
    } as unknown as Storage;
    expect(savePhoto(full, 'custom-1', 'data:image/jpeg;base64,abc')).toBe(false);
  });
});
