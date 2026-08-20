import { renderHook } from '@testing-library/react';
import { vi, describe, expect, it, beforeEach } from 'vitest';

const isNative = vi.fn();
vi.mock('./useNative', () => ({ isNative: () => isNative() }));

const remove = vi.fn();
const addListener = vi.fn();
const exitApp = vi.fn();
vi.mock('@capacitor/app', () => ({
  App: {
    addListener: (event: string, listener: () => void) => addListener(event, listener),
    exitApp: () => exitApp(),
  },
}));

import { useBackButton } from './useBackButton';

const press = async (): Promise<void> => {
  addListener.mock.calls[0][1]();
  await Promise.resolve();
};

beforeEach(() => {
  vi.clearAllMocks();
  isNative.mockReturnValue(true);
  addListener.mockReturnValue(Promise.resolve({ remove }));
});

describe('useBackButton', () => {
  it('does nothing on web', () => {
    isNative.mockReturnValue(false);
    renderHook(() => useBackButton(() => true));
    expect(addListener).not.toHaveBeenCalled();
  });

  it('leaves the app running when the press is consumed', async () => {
    const onBack = vi.fn(() => true);
    renderHook(() => useBackButton(onBack));
    await press();
    expect(onBack).toHaveBeenCalled();
    expect(exitApp).not.toHaveBeenCalled();
  });

  it('exits when nothing consumes the press', async () => {
    renderHook(() => useBackButton(() => false));
    await press();
    expect(exitApp).toHaveBeenCalled();
  });

  it('calls the latest handler without re-registering', async () => {
    const first = vi.fn(() => true);
    const second = vi.fn(() => true);
    const { rerender } = renderHook(({ onBack }) => useBackButton(onBack), {
      initialProps: { onBack: first },
    });
    rerender({ onBack: second });
    await press();
    expect(addListener).toHaveBeenCalledTimes(1);
    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalled();
  });

  it('removes the listener on unmount', async () => {
    const { unmount } = renderHook(() => useBackButton(() => true));
    unmount();
    await Promise.resolve();
    expect(remove).toHaveBeenCalled();
  });
});
