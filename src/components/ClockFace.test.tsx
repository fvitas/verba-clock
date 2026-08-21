import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { resolveTime } from '../clock/engine';
import { english } from '../clock/languages/en';
import { getFinish } from '../finishes/catalog';
import { ClockFace } from './ClockFace';

const deepBlack = getFinish('deep-black');

describe('ClockFace', () => {
  it('renders all 110 cells', () => {
    const { container } = render(<ClockFace rows={english.rows} lit={new Set<string>()} finish={deepBlack} />);
    expect(container.querySelectorAll('[data-lit]')).toHaveLength(110);
  });

  it('lights exactly the resolved words in reading order', () => {
    const { lit } = resolveTime(10, 17, english, true);
    const { container } = render(<ClockFace rows={english.rows} lit={lit} finish={deepBlack} />);
    const on = [...container.querySelectorAll('[data-lit="true"]')];
    expect(on.map((el) => el.textContent).join('')).toBe('ITISAQUARTERPASTTEN');
  });

  it('renders cell overrides for in-cell apostrophes', () => {
    const { container } = render(
      <ClockFace rows={english.rows} lit={new Set<string>()} finish={deepBlack} cellOverrides={{ '0:0': "I'" }} />,
    );
    const cells = [...container.querySelectorAll('[data-lit]')];
    expect(cells[0].textContent).toBe("I'");
    expect(cells[1].textContent).toBe('T');
  });

  it('renders e-ink letters as flat ink — no glow, no fade', () => {
    const { lit } = resolveTime(10, 17, english, true);
    const { container } = render(<ClockFace rows={english.rows} lit={lit} finish={getFinish('paper')} />);
    const litCell = container.querySelector<HTMLElement>('[data-lit="true"]');
    expect(litCell?.style.color).toBe('rgb(22, 23, 26)');
    expect(litCell?.className).not.toContain('text-shadow');
    expect(litCell?.className).not.toContain('transition-colors');
  });

  // A panel holds one ink, so an unlit letter is fewer ink pixels — not a lighter colour
  it('dithers unlit e-ink letters, clipped to the glyph', () => {
    const { container } = render(<ClockFace rows={english.rows} lit={new Set<string>()} finish={getFinish('ink')} />);
    const dimCell = container.querySelector<HTMLElement>('[data-lit="false"]');
    expect(dimCell?.style.color).toBe('transparent');
    expect(dimCell?.style.backgroundSize).toBe('8px 8px');
    // jsdom drops both the vendor-prefixed clip and the data-URI background; the lattice itself
    // is covered by the ditherImage test in the catalog
    expect(dimCell?.getAttribute('style')).toContain('background-clip: text');
  });

  it('uses dark letters on light finishes', () => {
    const { lit } = resolveTime(10, 17, english, true);
    const { container } = render(<ClockFace rows={english.rows} lit={lit} finish={getFinish('gold')} />);
    const litCell = container.querySelector('[data-lit="true"]');
    expect(litCell?.className).toContain('text-[#181614]');
  });
});
