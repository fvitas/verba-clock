import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { LanguageList } from './LanguageList';

const tapHaptic = vi.fn();
vi.mock('../native/haptics', () => ({ tapHaptic: () => tapHaptic() }));

// Registry has variants ("English (E2)", "German (D2)"), so name matchers are anchored.
describe('LanguageList', () => {
  it('lists languages with samples, marks selected, selects and goes back', () => {
    const onSelect = vi.fn();
    const onBack = vi.fn();
    render(<LanguageList selectedId="en" onSelect={onSelect} onBack={onBack} />);

    const english = screen.getByRole('button', { name: /^English\b(?! \()/ });
    expect(english).toHaveTextContent('IT IS');
    expect(english.querySelector('[data-selected]')).not.toBeNull();

    expect(screen.getByRole('button', { name: /^English \(E2\)/ })).toHaveTextContent('IT IS');
    expect(screen.getByRole('button', { name: /^Swiss German/ })).toHaveTextContent('ES ISCH');

    fireEvent.click(screen.getByRole('button', { name: /^German\b(?! \(| East)/ }));
    expect(onSelect).toHaveBeenCalledWith('de');

    fireEvent.click(screen.getByRole('button', { name: 'Back' }));
    expect(onBack).toHaveBeenCalled();
  });

  it('buzzes on a language row and on back', () => {
    tapHaptic.mockClear();
    render(<LanguageList selectedId="en" onSelect={vi.fn()} onBack={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: /^Polish/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Back' }));
    expect(tapHaptic).toHaveBeenCalledTimes(2);
  });

  it('selecting a language stays on the list', () => {
    const onSelect = vi.fn();
    const onBack = vi.fn();
    render(<LanguageList selectedId="en" onSelect={onSelect} onBack={onBack} />);
    fireEvent.click(screen.getByRole('button', { name: /^German\b(?! \(| East)/ }));
    expect(onSelect).toHaveBeenCalledWith('de');
    expect(onBack).not.toHaveBeenCalled();
  });
});
