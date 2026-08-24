import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { resolveTime } from '../clock/engine';
import { english } from '../clock/languages/en';
import { resolveTheme } from '../themes/model';
import { ClockFace } from './ClockFace';

const deepBlack = resolveTheme('deep-black', []);

describe('ClockFace', () => {
  it('renders all 110 cells', () => {
    const { container } = render(<ClockFace rows={english.rows} lit={new Set<string>()} theme={deepBlack} />);
    expect(container.querySelectorAll('[data-lit]')).toHaveLength(110);
  });

  it('lights exactly the resolved words in reading order', () => {
    const { lit } = resolveTime(10, 17, english, true);
    const { container } = render(<ClockFace rows={english.rows} lit={lit} theme={deepBlack} />);
    const on = [...container.querySelectorAll('[data-lit="true"]')];
    expect(on.map((el) => el.textContent).join('')).toBe('ITISAQUARTERPASTTEN');
  });

  it('renders cell overrides for in-cell apostrophes', () => {
    const { container } = render(
      <ClockFace rows={english.rows} lit={new Set<string>()} theme={deepBlack} cellOverrides={{ '0:0': "I'" }} />,
    );
    const cells = [...container.querySelectorAll('[data-lit]')];
    expect(cells[0].textContent).toBe("I'");
    expect(cells[1].textContent).toBe('T');
  });

  it('renders e-ink letters as flat ink — no glow, no fade', () => {
    const { lit } = resolveTime(10, 17, english, true);
    const { container } = render(
      <ClockFace rows={english.rows} lit={lit} theme={resolveTheme('paper', [])} />,
    );
    const litCell = container.querySelector<HTMLElement>('[data-lit="true"]');
    expect(litCell?.style.color).toBe('rgb(22, 23, 26)');
    expect(litCell?.style.textShadow).toBe('none');
    expect(litCell?.className).not.toContain('transition-colors');
  });

  // A panel holds one ink, so an unlit letter is fewer ink pixels — not a lighter colour
  it('dithers unlit e-ink letters, clipped to the glyph', () => {
    const { container } = render(
      <ClockFace rows={english.rows} lit={new Set<string>()} theme={resolveTheme('ink', [])} />,
    );
    const dimCell = container.querySelector<HTMLElement>('[data-lit="false"]');
    expect(dimCell?.style.color).toBe('transparent');
    expect(dimCell?.style.backgroundSize).toBe('8px 8px');
    // jsdom drops both the vendor-prefixed clip and the data-URI background; the lattice itself
    // is covered by the ditherImage test in the catalog
    expect(dimCell?.getAttribute('style')).toContain('background-clip: text');
  });

  it('leaves no transition behind on an instant face', () => {
    const { container } = render(<ClockFace rows={english.rows} lit={new Set<string>()} theme={deepBlack} />);
    const cell = container.querySelector('[data-lit]');
    expect(cell?.getAttribute('style')).not.toContain('transition:');
  });

  it('crossfades every cell together, glow included', () => {
    const { container } = render(
      <ClockFace rows={english.rows} lit={new Set<string>()} theme={deepBlack} transition="crossfade" />,
    );
    const cells = [...container.querySelectorAll('[data-lit]')];
    const expected = 'color 600ms ease-in-out 0ms, text-shadow 600ms ease-in-out 0ms';
    expect(cells[0].getAttribute('style')).toContain(expected);
    expect(cells[109].getAttribute('style')).toContain(expected);
  });

  // The sweep crosses the whole face, so the delay is the cell's own place in reading order
  it('staggers the typewriter across the whole grid inside one second', () => {
    const { container } = render(
      <ClockFace rows={english.rows} lit={new Set<string>()} theme={deepBlack} transition="typewriter" />,
    );
    const cells = [...container.querySelectorAll('[data-lit]')];
    expect(cells[0].getAttribute('style')).toContain('color 180ms ease-out 0ms');
    expect(cells[109].getAttribute('style')).toContain('color 180ms ease-out 820ms');
  });

  it('drops the face as one on the way dark', () => {
    const { container } = render(
      <ClockFace rows={english.rows} lit={new Set<string>()} theme={deepBlack} transition="offthenon" dark />,
    );
    const cells = [...container.querySelectorAll('[data-lit]')];
    expect(cells[109].getAttribute('style')).toContain('color 220ms ease-in-out 0ms');
  });

  it('uses dark letters on light finishes', () => {
    const { lit } = resolveTime(10, 17, english, true);
    const { container } = render(
      <ClockFace rows={english.rows} lit={lit} theme={resolveTheme('gold', [])} />,
    );
    const litCell = container.querySelector<HTMLElement>('[data-lit="true"]');
    expect(litCell?.style.color).toBe('rgb(24, 22, 20)');
  });

  it('lights letters in the custom LED color', () => {
    const { lit } = resolveTime(10, 17, english, true);
    const amber = resolveTheme('custom-1', [
      {
        id: 'custom-1',
        name: 'Amber',
        background: { kind: 'solid', color: '#0a0a0c' },
        ledColor: '#ffb347',
        dimOpacity: 0.15,
        glow: 0.55,
      },
    ]);
    const { container } = render(<ClockFace rows={english.rows} lit={lit} theme={amber} />);
    const litCell = container.querySelector<HTMLElement>('[data-lit="true"]');
    const dimCell = container.querySelector<HTMLElement>('[data-lit="false"]');
    expect(litCell?.style.color).toBe('rgb(255, 179, 71)');
    expect(dimCell?.style.color).toBe('rgba(255, 179, 71, 0.15)');
  });
});
