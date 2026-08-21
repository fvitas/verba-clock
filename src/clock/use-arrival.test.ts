import { renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useArrival, type Face } from './use-arrival';

const face = (words: string[], dots = 0): Face => ({ lit: new Set(words), dots });

const TEN_PAST = face(['0:0', '1:0'], 0);
const QUARTER_PAST = face(['0:0', '2:0'], 3);

describe('useArrival', () => {
  it('paints straight through when nothing is animated', () => {
    const { result, rerender } = renderHook(({ next }) => useArrival(next, false, 0), {
      initialProps: { next: TEN_PAST },
    });
    expect(result.current.face).toBe(TEN_PAST);
    expect(result.current.dark).toBe(false);

    rerender({ next: QUARTER_PAST });
    expect(result.current.face).toBe(QUARTER_PAST);
    expect(result.current.dark).toBe(false);
  });

  it('lights up on open instead of just being on', async () => {
    const { result } = renderHook(() => useArrival(TEN_PAST, true, 0));
    expect(result.current.dark).toBe(true);
    expect(result.current.face.lit.size).toBe(0);

    await waitFor(() => expect(result.current.dark).toBe(false));
    expect(result.current.face).toBe(TEN_PAST);
  });

  it('crosses straight over to the next minute with no dark frame', async () => {
    const { result, rerender } = renderHook(({ next }) => useArrival(next, true, 0), {
      initialProps: { next: TEN_PAST },
    });
    await waitFor(() => expect(result.current.face).toBe(TEN_PAST));

    rerender({ next: QUARTER_PAST });
    expect(result.current.dark).toBe(false);
    expect(result.current.face).toBe(QUARTER_PAST);
  });

  it('holds a real dark frame for off-then-on', async () => {
    const { result, rerender } = renderHook(({ next }) => useArrival(next, true, 60), {
      initialProps: { next: TEN_PAST },
    });
    await waitFor(() => expect(result.current.face).toBe(TEN_PAST));

    rerender({ next: QUARTER_PAST });
    expect(result.current.dark).toBe(true);
    expect(result.current.face.lit.size).toBe(0);

    await waitFor(() => expect(result.current.face).toBe(QUARTER_PAST));
    expect(result.current.dark).toBe(false);
  });

  // `lit` is a fresh Set every tick, so identity can't be the trigger — the same words must not blink
  it('ignores a rebuilt face that says the same thing', async () => {
    const { result, rerender } = renderHook(({ next }) => useArrival(next, true, 60), {
      initialProps: { next: TEN_PAST },
    });
    await waitFor(() => expect(result.current.face).toBe(TEN_PAST));

    rerender({ next: face(['0:0', '1:0'], 0) });
    expect(result.current.dark).toBe(false);
    expect(result.current.face).toBe(TEN_PAST);
  });
});
