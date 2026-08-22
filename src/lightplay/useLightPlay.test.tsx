import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cellKey } from '../clock/engine';
import { getLanguage } from '../clock/languages';
import { getFinish } from '../finishes/catalog';
import { getEffect, type LightPlaySetting } from './effects';
import { EXIT_FADE, LONG_PRESS_MS } from './engine';
import { useLightPlay } from './useLightPlay';

const tapHaptic = vi.fn();
vi.mock('../native/haptics', () => ({ tapHaptic: () => tapHaptic() }));

const ROWS = getLanguage('en').rows;
const FINISH = getFinish('deep-black');
const RIPPLE = getEffect('ripple')!;
const LIT = new Set([cellKey(4, 2), cellKey(4, 3)]);

type Api = ReturnType<typeof useLightPlay>;
let api: Api;

type HarnessProps = { enabled?: boolean; effectId?: LightPlaySetting };

function Harness({ enabled = true, effectId = 'ripple' }: HarnessProps) {
  const lightPlay = useLightPlay({ enabled, effectId, liveLit: LIT, rows: ROWS, finish: FINISH });
  api = lightPlay;
  return (
    <div data-testid="grid" {...lightPlay.pressProps} onClick={() => lightPlay.consumeClick()}>
      {lightPlay.overlay}
    </div>
  );
}

// jsdom measures every box as zero, so the press point needs a real grid to land in
const press = (): void => {
  const grid = screen.getByTestId('grid');
  grid.getBoundingClientRect = () =>
    ({ left: 0, top: 0, width: 110, height: 100 }) as DOMRect;
  fireEvent.pointerDown(grid, { clientX: 50, clientY: 40 });
};

const advance = (ms: number): void => void act(() => void vi.advanceTimersByTime(ms));

// The settle frame is requested from a committed effect, so it needs a tick of its own
const finishRun = (dur: number): void => {
  advance(dur + 100);
  advance(100);
};

// Every glyph of the overlay carries an inline opacity; the real face has none
const overlayCells = (): HTMLElement[] =>
  [...document.querySelectorAll<HTMLElement>('[aria-hidden] span[style*="opacity"]')];

describe('useLightPlay', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it('takes over the lattice after a long press, and hands it back when the run ends', () => {
    render(<Harness />);
    expect(api.active).toBe(false);
    expect(overlayCells()).toHaveLength(0);

    press();
    advance(LONG_PRESS_MS);
    expect(api.takeover).toBe(true);
    expect(tapHaptic).toHaveBeenCalledOnce();
    expect(overlayCells()).toHaveLength(ROWS.length * ROWS[0].length);

    finishRun(RIPPLE.dur);
    expect(api.active).toBe(false);
    expect(overlayCells()).toHaveLength(0);
  });

  it('paints the lit time on its last frame, so the overlay leaves over identical pixels', () => {
    render(<Harness />);
    press();
    advance(LONG_PRESS_MS);
    advance(RIPPLE.dur - 20);

    const cells = overlayCells();
    const cols = ROWS[0].length;
    const opacity = (r: number, c: number) => Number(cells[r * cols + c].style.opacity);
    expect(opacity(4, 2)).toBeGreaterThan(0.95);
    expect(opacity(4, 3)).toBeGreaterThan(0.95);
    expect(opacity(0, 0)).toBeLessThan(0.05);
  });

  it('is still animating an effect when the blend opens', () => {
    render(<Harness />);
    press();
    advance(LONG_PRESS_MS);
    advance(RIPPLE.dur - EXIT_FADE);

    const alive = overlayCells().filter((cell) => Number(cell.style.opacity) > 0.25);
    expect(alive.length).toBeGreaterThan(10);
  });

  it('swallows the click that ends a long press, but passes an ordinary tap through', () => {
    render(<Harness />);
    press();
    advance(LONG_PRESS_MS);
    expect(api.consumeClick()).toBe(true);
    finishRun(RIPPLE.dur);
    expect(api.consumeClick()).toBe(false);
  });

  it('ignores a press let go before the threshold', () => {
    render(<Harness />);
    press();
    advance(LONG_PRESS_MS - 100);
    fireEvent.pointerUp(screen.getByTestId('grid'));
    advance(LONG_PRESS_MS);
    expect(api.active).toBe(false);
    expect(tapHaptic).not.toHaveBeenCalled();
  });

  it('holds nothing back when the setting is off or the context forbids it', () => {
    const { unmount } = render(<Harness effectId="off" />);
    press();
    advance(LONG_PRESS_MS);
    expect(api.active).toBe(false);
    unmount();

    render(<Harness enabled={false} />);
    press();
    advance(LONG_PRESS_MS);
    expect(api.active).toBe(false);
  });

  it('drops the run when the app goes to the background', () => {
    render(<Harness />);
    press();
    advance(LONG_PRESS_MS);
    advance(400);
    expect(api.takeover).toBe(true);

    const hidden = vi.spyOn(document, 'hidden', 'get').mockReturnValue(true);
    act(() => void document.dispatchEvent(new Event('visibilitychange')));
    expect(api.active).toBe(false);
    expect(overlayCells()).toHaveLength(0);
    hidden.mockRestore();
  });

  // The picker previews the effect it just chose; the store commit may land a render later
  it('previews an effect even while the stored setting still says off', () => {
    render(<Harness effectId="off" />);
    act(() => api.play('sonar'));
    expect(api.takeover).toBe(true);
  });

  it('cuts the running effect off and plays the newly picked one from the start', () => {
    render(<Harness />);
    act(() => api.play('ripple'));
    advance(1_000);

    act(() => api.play('sonar'));
    // Past where the ripple would have ended, so only a restarted run can still hold the lattice
    advance(RIPPLE.dur);
    expect(api.takeover).toBe(true);
    expect(overlayCells()).toHaveLength(ROWS.length * ROWS[0].length);

    finishRun(getEffect('sonar')!.dur);
    expect(api.active).toBe(false);
  });

  it('restarts the effect that is already playing when it is picked again', () => {
    render(<Harness />);
    act(() => api.play('ripple'));
    advance(RIPPLE.dur - 200);

    act(() => api.play('ripple'));
    // The first run's clock is past its duration here, so a still-held lattice means it restarted
    advance(300);
    expect(api.takeover).toBe(true);

    finishRun(RIPPLE.dur - 300);
    expect(api.active).toBe(false);
  });
});
