import { describe, expect, it } from 'vitest';
import { ditherImage, FINISHES, getFinish, withAlpha } from './catalog';

const einkFinish = (id: string) => {
  const finish = getFinish(id);
  if (finish.render !== 'eink') throw new Error(`${id} is not an e-ink finish`);
  return finish;
};

describe('finish catalog', () => {
  it('contains 18 finishes: 15 EARTH replicas, Waves, and the e-ink pair', () => {
    expect(FINISHES).toHaveLength(18);
    expect(FINISHES.some((f) => f.id === 'waves')).toBe(true);
    expect(FINISHES.some((f) => f.id === 'glintscape')).toBe(false);
  });

  it('renders Paper and Ink as e-ink: a flat surface and an exact ink colour', () => {
    for (const id of ['paper', 'ink']) {
      const finish = getFinish(id);
      expect(finish.render).toBe('eink');
      expect(finish.ink).toMatch(/^#[0-9a-f]{6}$/);
      // no gradient, no texture — a real panel is one flat tone
      expect(finish.surface).toMatch(/^#[0-9a-f]{6}$/);
    }
  });

  // Light ink on a dark field reads brighter at equal opacity, so Ink must sit lower
  it('gives Ink a lower stencil than Paper', () => {
    expect(getFinish('ink').stencilOpacity).toBeLessThan(getFinish('paper').stencilOpacity);
  });

  it('only the e-ink pair carries a render tag', () => {
    const tagged = FINISHES.filter((f) => f.render).map((f) => f.id);
    expect(tagged).toEqual(['paper', 'ink']);
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

  it('draws the dither as one ink pixel per lattice slot', () => {
    const ink = einkFinish('ink');
    const svg = decodeURIComponent(ditherImage(ink.ink, ink.dither));
    expect(svg.match(/<rect/g)).toHaveLength(6); // 6/64 = 9.4%
    expect(svg).toContain("viewBox='0 0 8 8'");
    expect(svg).toContain("fill='#c5c3be'");
    // an un-encoded '#' would end the data URI at the colour
    expect(ditherImage(ink.ink, ink.dither)).not.toContain('#');
  });

  it('gives Paper a coarser lattice than Ink, since dark-on-light needs more dots', () => {
    const paper = einkFinish('paper');
    expect(paper.dither.dots).toHaveLength(4); // 4/16 = 25%
    expect(paper.dither.size).toBe(4);
  });

  it('splits a hex into an rgba triplet', () => {
    expect(withAlpha('#c5c3be', 0.12)).toBe('rgba(197, 195, 190, 0.12)');
    expect(withAlpha('#000000', 1)).toBe('rgba(0, 0, 0, 1)');
  });

  it('falls back to deep-black for unknown ids', () => {
    expect(getFinish('nope').id).toBe('deep-black');
    expect(getFinish('rust').id).toBe('rust');
  });
});
