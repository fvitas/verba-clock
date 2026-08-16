import '@testing-library/jest-dom/vitest';

// jsdom lacks ResizeObserver; Radix Slider requires it
class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}

globalThis.ResizeObserver ??= ResizeObserverStub as unknown as typeof ResizeObserver;
