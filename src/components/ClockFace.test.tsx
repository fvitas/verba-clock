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

  it('uses dark letters on light finishes', () => {
    const { lit } = resolveTime(10, 17, english, true);
    const { container } = render(<ClockFace rows={english.rows} lit={lit} finish={getFinish('gold')} />);
    const litCell = container.querySelector('[data-lit="true"]');
    expect(litCell?.className).toContain('text-[#181614]');
  });
});
