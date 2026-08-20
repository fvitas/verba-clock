import { describe, expect, it } from 'vitest';
import { FINISHES, getFinish } from './catalog';

describe('finish catalog', () => {
  it('contains 16 finishes: 15 EARTH replicas plus the original Waves', () => {
    expect(FINISHES).toHaveLength(16);
    expect(FINISHES.some((f) => f.id === 'waves')).toBe(true);
    expect(FINISHES.some((f) => f.id === 'glintscape')).toBe(false);
  });

  it('hazelnut is a light bronze-tan with dark letters', () => {
    expect(getFinish('hazelnut').letter).toBe('dark');
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

  // iOS 18 WebKit aspect-fits a viewBox-less SVG instead of stretching it to the element
  it('every embedded SVG declares a viewBox and preserveAspectRatio=none', () => {
    for (const f of FINISHES) {
      // gradients carry bare % signs, so only the data URIs may be percent-decoded
      for (const uri of f.surface.match(/data:image\/svg\+xml,[^"]+/g) ?? []) {
        const root = decodeURIComponent(uri).match(/<svg[^>]*>/)?.[0] ?? '';
        expect(root).toMatch(/viewBox='0 0 (120 120|900 900)'/);
        expect(root).toContain("preserveAspectRatio='none'");
      }
    }
  });

  it('falls back to deep-black for unknown ids', () => {
    expect(getFinish('nope').id).toBe('deep-black');
    expect(getFinish('rust').id).toBe('rust');
  });
});
