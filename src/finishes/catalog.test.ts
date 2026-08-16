import { describe, expect, it } from 'vitest';
import { FINISHES, getFinish } from './catalog';

describe('finish catalog', () => {
  it('contains the 16 EARTH finishes from docs/FINISHES.md', () => {
    expect(FINISHES).toHaveLength(16);
  });

  it('has unique ids', () => {
    expect(new Set(FINISHES.map((f) => f.id)).size).toBe(FINISHES.length);
  });

  it('keeps stencil opacity in a visible-but-subtle range', () => {
    for (const f of FINISHES) {
      expect(f.stencilOpacity).toBeGreaterThan(0);
      expect(f.stencilOpacity).toBeLessThanOrEqual(0.35);
    }
  });

  it('every finish has a non-empty surface and valid tier', () => {
    for (const f of FINISHES) {
      expect(f.surface.length).toBeGreaterThan(0);
      expect(['free', 'premium']).toContain(f.tier);
    }
  });

  it('falls back to deep-black for unknown ids', () => {
    expect(getFinish('nope').id).toBe('deep-black');
    expect(getFinish('rust').id).toBe('rust');
  });
});
