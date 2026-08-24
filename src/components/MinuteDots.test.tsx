import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { resolveTheme } from '../themes/model';
import { MinuteDots } from './MinuteDots';

const theme = resolveTheme('deep-black', []);

describe('MinuteDots', () => {
  it('always renders four dots with the first `count` lit', () => {
    render(<MinuteDots count={3} theme={theme} visible nearEdge />);
    const dots = screen.getByTestId('minute-dots').children;
    expect(dots).toHaveLength(4);
    expect([...dots].map((dot) => dot.getAttribute('data-lit'))).toEqual([
      'true',
      'true',
      'true',
      'false',
    ]);
  });

  it('ghosts unlit dots at the theme stencil opacity', () => {
    render(<MinuteDots count={0} theme={theme} visible nearEdge />);
    const [first] = screen.getByTestId('minute-dots').children;
    expect((first as HTMLElement).style.backgroundColor).toBe('rgba(255, 255, 255, 0.15)');
  });

  it('gives e-ink dots the exact ink, with no glow and no fade', () => {
    const ink = resolveTheme('ink', []);
    render(<MinuteDots count={1} theme={ink} visible nearEdge={false} />);
    const [first, second] = screen.getByTestId('minute-dots').children;
    expect((first as HTMLElement).style.backgroundColor).toBe('rgb(197, 195, 190)');
    expect((first as HTMLElement).style.boxShadow).toBe('none');
    expect(first.className).not.toContain('transition-colors');
    expect((second as HTMLElement).style.backgroundColor).toBe('rgba(197, 195, 190, 0.12)');
  });

  it('fades a dot with the letters, never staggered', () => {
    render(<MinuteDots count={1} theme={theme} visible nearEdge transition="crossfade" />);
    const [first] = screen.getByTestId('minute-dots').children;
    expect(first.getAttribute('style')).toContain('background-color 600ms ease-in-out');
  });

  it('leaves an instant dot untransitioned', () => {
    render(<MinuteDots count={1} theme={theme} visible nearEdge />);
    const [first] = screen.getByTestId('minute-dots').children;
    expect(first.getAttribute('style') ?? '').not.toContain('transition:');
  });

  // The desktop sheet pads the query container, so `cqw` here drifts the row off the face
  it('centres the row on its containing block, not on container units', () => {
    render(<MinuteDots count={2} theme={theme} visible nearEdge />);
    const row = screen.getByTestId('minute-dots');
    expect(row.className).toContain('left-1/2');
    expect(row.className).not.toContain('cqw');
  });

  it('fades the row out when not visible', () => {
    render(<MinuteDots count={2} theme={theme} visible={false} nearEdge />);
    expect(screen.getByTestId('minute-dots').className).toContain('opacity-0');
  });
});
