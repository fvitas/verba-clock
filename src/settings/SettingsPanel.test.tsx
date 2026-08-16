import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { SettingsPanel } from './SettingsPanel';
import { SettingsProvider } from './SettingsContext';
import { loadSettings } from './store';

function renderPanel() {
  return render(
    <SettingsProvider>
      <SettingsPanel />
    </SettingsProvider>,
  );
}

describe('SettingsPanel', () => {
  beforeEach(() => localStorage.clear());

  it('opens via the gear button', () => {
    renderPanel();
    fireEvent.click(screen.getByRole('button', { name: /settings/i }));
    expect(screen.getByText('Finish')).toBeInTheDocument();
  });

  it('persists a finish selection', () => {
    renderPanel();
    fireEvent.click(screen.getByRole('button', { name: /settings/i }));
    fireEvent.click(screen.getByRole('button', { name: 'Rust' }));
    expect(loadSettings(localStorage).finishId).toBe('rust');
  });

  it('persists the presentation choice', () => {
    renderPanel();
    fireEvent.click(screen.getByRole('button', { name: /settings/i }));
    fireEvent.click(screen.getByRole('button', { name: 'Wall' }));
    expect(loadSettings(localStorage).presentation).toBe('wall');
  });
});
