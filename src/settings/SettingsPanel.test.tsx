import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SettingsPanel } from './SettingsPanel';
import { SettingsProvider } from './SettingsContext';
import { loadSettings } from './store';

const isNativePlatform = vi.fn();
vi.mock('@capacitor/core', () => ({ Capacitor: { isNativePlatform: () => isNativePlatform() } }));

function renderPanel(open = true, onOpenChange: (open: boolean) => void = () => {}) {
  return render(
    <SettingsProvider>
      <SettingsPanel open={open} onOpenChange={onOpenChange} />
    </SettingsProvider>,
  );
}

describe('SettingsPanel', () => {
  beforeEach(() => {
    localStorage.clear();
    isNativePlatform.mockReturnValue(false);
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
    fireEvent.click(screen.getByRole('button', { name: /^Српски/ }));

    expect(loadSettings(localStorage).languageId).toBe('sr');
    expect(screen.queryByRole('button', { name: 'Back' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Language/ })).toHaveTextContent('Српски');
  });

  it('goes back from the language subview without changing the language', () => {
    renderPanel();
    fireEvent.click(screen.getByRole('button', { name: /^Language/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Back' }));
    expect(screen.getByText('Presentation')).toBeInTheDocument();
    expect(loadSettings(localStorage).languageId).toBe('en');
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

  it('renders a brightness slider', () => {
    renderPanel();
    expect(screen.getByRole('slider', { name: 'Brightness' })).toBeInTheDocument();
  });

  it('hides keep-awake on web', () => {
    renderPanel();
    expect(screen.queryByRole('switch', { name: 'Keep screen awake' })).not.toBeInTheDocument();
  });

  it('shows keep-awake on native', () => {
    isNativePlatform.mockReturnValue(true);
    renderPanel();
    fireEvent.click(screen.getByRole('switch', { name: 'Keep screen awake' }));
    expect(loadSettings(localStorage).keepAwake).toBe(false);
  });
});
