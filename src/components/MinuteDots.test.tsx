import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { getFinish } from '../finishes/catalog';
import { MinuteDots } from './MinuteDots';

const finish = getFinish('deep-black');

describe('MinuteDots', () => {
  it('always renders four dots with the first `count` lit', () => {
    render(<MinuteDots count={3} finish={finish} visible nearEdge />);
    const dots = screen.getByTestId('minute-dots').children;
    expect(dots).toHaveLength(4);
    expect([...dots].map((dot) => dot.getAttribute('data-lit'))).toEqual([
      'true',
      'true',
      'true',
      'false',
    ]);
  });

  it('ghosts unlit dots at the finish stencil opacity', () => {
    render(<MinuteDots count={0} finish={finish} visible nearEdge />);
    const [first] = screen.getByTestId('minute-dots').children;
    expect((first as HTMLElement).style.backgroundColor).toBe(
      `rgba(255, 255, 255, ${finish.stencilOpacity})`,
    );
  });

  it('gives e-ink dots the exact ink, with no glow and no fade', () => {
    const ink = getFinish('ink');
    render(<MinuteDots count={1} finish={ink} visible nearEdge={false} />);
    const [first, second] = screen.getByTestId('minute-dots').children;
    expect((first as HTMLElement).style.backgroundColor).toBe('rgb(197, 195, 190)');
    expect(first.className).not.toContain('box-shadow');
    expect(first.className).not.toContain('transition-colors');
    expect((second as HTMLElement).style.backgroundColor).toBe('rgba(197, 195, 190, 0.12)');
  });

  it('fades a dot with the letters, never staggered', () => {
    render(<MinuteDots count={1} finish={finish} visible nearEdge transition="crossfade" />);
    const [first] = screen.getByTestId('minute-dots').children;
    expect(first.getAttribute('style')).toContain('background-color 600ms ease-in-out');
  });

  it('leaves an instant dot untransitioned', () => {
    render(<MinuteDots count={1} finish={finish} visible nearEdge />);
    const [first] = screen.getByTestId('minute-dots').children;
    expect(first.getAttribute('style') ?? '').not.toContain('transition');
  });

  // The desktop sheet pads the query container, so `cqw` here drifts the row off the face
  it('centres the row on its containing block, not on container units', () => {
    render(<MinuteDots count={2} finish={finish} visible nearEdge />);
    const row = screen.getByTestId('minute-dots');
    expect(row.className).toContain('left-1/2');
    expect(row.className).not.toContain('cqw');
  });

  it('fades the row out when not visible', () => {
    render(<MinuteDots count={2} finish={finish} visible={false} nearEdge />);
    expect(screen.getByTestId('minute-dots').className).toContain('opacity-0');
  });
});
