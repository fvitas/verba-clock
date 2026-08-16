import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useClockTime } from './use-clock-time';

describe('useClockTime', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-08-16T10:17:00'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns the current time', () => {
    const { result } = renderHook(() => useClockTime());
    expect(result.current.getHours()).toBe(10);
    expect(result.current.getMinutes()).toBe(17);
  });

  it('ticks forward once per second', () => {
    const { result } = renderHook(() => useClockTime());
    act(() => vi.advanceTimersByTime(60_000));
    expect(result.current.getMinutes()).toBe(18);
  });
});
