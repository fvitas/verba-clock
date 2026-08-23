import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SettingsPanel } from './SettingsPanel';
import { SettingsProvider } from './SettingsContext';
import { loadSettings } from './store';

const haptics = { supported: false };
const tapHaptic = vi.fn();
const startSelectionHaptic = vi.fn();
const selectionHaptic = vi.fn();
const endSelectionHaptic = vi.fn();
vi.mock('../native/haptics', () => ({
  supportsHaptics: () => haptics.supported,
  setHapticsEnabled: () => {},
  tapHaptic: () => tapHaptic(),
  startSelectionHaptic: () => startSelectionHaptic(),
  selectionHaptic: () => selectionHaptic(),
  endSelectionHaptic: () => endSelectionHaptic(),
}));

const isNativePlatform = vi.fn();
vi.mock('@capacitor/core', () => ({
  Capacitor: { isNativePlatform: () => isNativePlatform(), getPlatform: () => 'web' },
  registerPlugin: () => ({ syncSettings: () => Promise.resolve() }),
}));

const backHandler = { current: (): boolean => false };
vi.mock('../native/useBackButton', () => ({
  useBackButton: (handler: () => boolean) => {
    backHandler.current = handler;
  },
}));

const pressBack = (): void => void act(() => void backHandler.current());

// The desktop dialog skips vaul, whose pointer-drag handlers can't run in jsdom
function useDesktopPanel(): void {
  vi.stubGlobal('matchMedia', (media: string) => ({
    matches: true,
    media,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }));
}

const onPreviewEffect = vi.fn();

function renderPanel(open = true, onOpenChange: (open: boolean) => void = () => {}, docked = false) {
  return render(
    <SettingsProvider>
      <SettingsPanel
        open={open}
        docked={docked}
        onOpenChange={onOpenChange}
        onPreviewEffect={onPreviewEffect}
      />
    </SettingsProvider>,
  );
}

describe('SettingsPanel', () => {
  beforeEach(() => {
    localStorage.clear();
    isNativePlatform.mockReturnValue(false);
    haptics.supported = false;
  });
  afterEach(() => vi.clearAllMocks());

  it('requests opening via the gear button', () => {
    const onOpenChange = vi.fn();
    renderPanel(false, onOpenChange);
    expect(screen.queryByText('Finish')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /settings/i }));
    expect(onOpenChange).toHaveBeenCalledWith(true);
  });

  it('renders the sheet groups when open', () => {
    renderPanel();
    expect(screen.getByText('Finish')).toBeInTheDocument();
    expect(screen.getByText('Brightness')).toBeInTheDocument();
    expect(screen.getByText('Presentation')).toBeInTheDocument();
  });

  it('persists a finish selection', () => {
    renderPanel();
    fireEvent.click(screen.getByRole('button', { name: 'Rust' }));
    expect(loadSettings(localStorage).finishId).toBe('rust');
  });

  it('persists a language selection from the language subview', () => {
    renderPanel();
    const cell = screen.getByRole('button', { name: /^Language/ });
    expect(cell).toHaveTextContent('English');

    fireEvent.click(cell);
    fireEvent.click(screen.getByRole('button', { name: /^Serbian\b(?! Latin)/ }));

    expect(loadSettings(localStorage).languageId).toBe('sr');
    // Picking a language keeps the subview open with the checkmark moved
    const serbian = screen.getByRole('button', { name: /^Serbian\b(?! Latin)/ });
    expect(serbian.querySelector('[data-selected]')).not.toBeNull();

    fireEvent.click(screen.getByRole('button', { name: 'Back' }));
    expect(screen.getByRole('button', { name: /^Language/ })).toHaveTextContent('Serbian');
  });

  it('goes back from the language subview without changing the language', () => {
    renderPanel();
    fireEvent.click(screen.getByRole('button', { name: /^Language/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Back' }));
    expect(screen.getByText('Presentation')).toBeInTheDocument();
    expect(loadSettings(localStorage).languageId).toBe('en');
  });

  it('pops the language subview on the Android back press, then closes the panel', () => {
    const onOpenChange = vi.fn();
    renderPanel(true, onOpenChange);
    fireEvent.click(screen.getByRole('button', { name: /^Language/ }));

    pressBack();
    expect(screen.getByText('Presentation')).toBeInTheDocument();
    expect(onOpenChange).not.toHaveBeenCalled();

    pressBack();
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('leaves the closed panel alone so the back press exits the app', () => {
    const onOpenChange = vi.fn();
    renderPanel(false, onOpenChange);
    pressBack();
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it('persists the presentation choice', () => {
    renderPanel();
    fireEvent.click(screen.getByRole('radio', { name: 'Wall' }));
    expect(loadSettings(localStorage).presentation).toBe('wall');
  });

  it('toggles the "It is" words switch', () => {
    renderPanel();
    fireEvent.click(screen.getByRole('switch', { name: 'It is words' }));
    expect(loadSettings(localStorage).showItIs).toBe(false);
  });

  it('persists the dots mode choice', () => {
    renderPanel();
    fireEvent.click(screen.getByRole('radio', { name: 'Minutes' }));
    expect(loadSettings(localStorage).dots).toBe('minutes');
    fireEvent.click(screen.getByRole('radio', { name: 'Off' }));
    expect(loadSettings(localStorage).dots).toBe('off');
  });

  it('persists the word transition', () => {
    renderPanel();
    expect(screen.getByText('Word Transition')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('radio', { name: 'Typewriter' }));
    expect(loadSettings(localStorage).transition).toBe('typewriter');
    fireEvent.click(screen.getByRole('radio', { name: 'Blink' }));
    expect(loadSettings(localStorage).transition).toBe('offthenon');
  });

  it('renders a brightness slider', () => {
    renderPanel();
    expect(screen.getByRole('slider', { name: 'Brightness' })).toBeInTheDocument();
  });

  it('hides keep-awake on web without the Wake Lock API', () => {
    renderPanel();
    expect(screen.queryByRole('switch', { name: 'Keep screen awake' })).not.toBeInTheDocument();
  });

  it('shows keep-awake on web when the Wake Lock API is available', () => {
    Object.defineProperty(navigator, 'wakeLock', { value: { request: vi.fn() }, configurable: true });
    renderPanel();
    expect(screen.getByRole('switch', { name: 'Keep screen awake' })).toBeInTheDocument();
    Reflect.deleteProperty(navigator, 'wakeLock');
  });

  it('shows keep-awake on native', () => {
    isNativePlatform.mockReturnValue(true);
    renderPanel();
    fireEvent.click(screen.getByRole('switch', { name: 'Keep screen awake' }));
    expect(loadSettings(localStorage).keepAwake).toBe(false);
  });

  it('persists the dock mode toggle on native', () => {
    isNativePlatform.mockReturnValue(true);
    renderPanel();
    fireEvent.click(screen.getByRole('switch', { name: 'Dock when charging' }));
    expect(loadSettings(localStorage).dockMode).toBe(true);
  });

  it('hides dock mode on web without the Battery API', () => {
    renderPanel();
    expect(screen.queryByRole('switch', { name: 'Dock when charging' })).not.toBeInTheDocument();
  });

  it('hides the haptics switch where haptics are unsupported', () => {
    renderPanel();
    expect(screen.queryByRole('switch', { name: 'Haptics' })).not.toBeInTheDocument();
  });

  it('persists the haptics toggle where haptics work', () => {
    haptics.supported = true;
    renderPanel();
    fireEvent.click(screen.getByRole('switch', { name: 'Haptics' }));
    expect(loadSettings(localStorage).haptics).toBe(false);
  });

  it('buzzes when the sheet opens and closes', () => {
    const { unmount } = renderPanel(false, () => {});
    fireEvent.click(screen.getByRole('button', { name: /settings/i }));
    expect(tapHaptic).toHaveBeenCalledOnce();
    unmount();

    renderPanel(true, () => {});
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(tapHaptic).toHaveBeenCalledTimes(2);
  });

  it('brackets a brightness drag with selection feedback', () => {
    useDesktopPanel();
    renderPanel();
    const slider = screen.getByRole('slider', { name: 'Brightness' });
    fireEvent.pointerDown(slider);
    fireEvent.keyDown(slider, { key: 'ArrowLeft' });
    fireEvent.keyUp(slider, { key: 'ArrowLeft' });
    expect(startSelectionHaptic).toHaveBeenCalledOnce();
    expect(selectionHaptic).toHaveBeenCalledOnce();
    expect(endSelectionHaptic).toHaveBeenCalled();
    expect(loadSettings(localStorage).brightness).toBeCloseTo(0.95);
    vi.unstubAllGlobals();
  });

  it('persists a light play choice from its subview and previews it on the face', () => {
    renderPanel();
    const cell = screen.getByRole('button', { name: /^Light play/ });
    expect(cell).toHaveTextContent('Ripple');

    fireEvent.click(cell);
    fireEvent.click(screen.getByRole('button', { name: /^Rose curve/ }));

    expect(loadSettings(localStorage).lightPlay).toBe('rose');
    expect(onPreviewEffect).toHaveBeenCalledWith('rose');
    expect(screen.getByRole('button', { name: /^Rose curve/ }).querySelector('[data-selected]')).not.toBeNull();

    fireEvent.click(screen.getByRole('button', { name: 'Back' }));
    expect(screen.getByRole('button', { name: /^Light play/ })).toHaveTextContent('Rose curve');
  });

  it('offers Off last in the light play list and plays nothing for it', () => {
    renderPanel();
    fireEvent.click(screen.getByRole('button', { name: /^Light play/ }));
    const options = screen.getAllByRole('button').slice(1);
    expect(options).toHaveLength(11);
    expect(options[options.length - 1]).toHaveTextContent('Off');

    fireEvent.click(screen.getByRole('button', { name: /^Off/ }));
    expect(loadSettings(localStorage).lightPlay).toBe('off');
    expect(onPreviewEffect).not.toHaveBeenCalled();
  });

  it('shows the light play row off and unreachable on an e-ink finish', () => {
    renderPanel();
    fireEvent.click(screen.getByRole('button', { name: 'Ink' }));
    expect(screen.queryByRole('button', { name: /^Light play/ })).not.toBeInTheDocument();
    expect(screen.getByText('Light play').parentElement).toHaveTextContent('Off');
  });

  it('shows the light play row off and unreachable on the Arabic word face', () => {
    renderPanel();
    fireEvent.click(screen.getByRole('button', { name: /^Language/ }));
    fireEvent.click(screen.getByRole('button', { name: /^Arabic/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Back' }));
    expect(screen.queryByRole('button', { name: /^Light play/ })).not.toBeInTheDocument();
    expect(screen.getByText('Light play').parentElement).toHaveTextContent('Off');
  });

  it('hides the gear trigger while docked', () => {
    renderPanel(false, () => {}, true);
    expect(screen.queryByRole('button', { name: /settings/i })).not.toBeInTheDocument();
  });
});
