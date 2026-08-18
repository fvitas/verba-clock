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

  it('fades the row out when not visible', () => {
    render(<MinuteDots count={2} finish={finish} visible={false} nearEdge />);
    expect(screen.getByTestId('minute-dots').className).toContain('opacity-0');
  });
});
