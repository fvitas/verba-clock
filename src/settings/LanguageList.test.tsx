import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { LanguageList } from './LanguageList';

// Registry has variants ("English (E2)", "Deutsch (D2)"), so name matchers are anchored.
describe('LanguageList', () => {
  it('lists languages with samples, marks selected, selects and goes back', () => {
    const onSelect = vi.fn();
    const onBack = vi.fn();
    render(<LanguageList selectedId="en" onSelect={onSelect} onBack={onBack} />);

    const english = screen.getByRole('button', { name: /^English\b(?! \()/ });
    expect(english).toHaveTextContent('IT IS');
    expect(english.querySelector('[data-selected]')).not.toBeNull();

    expect(screen.getByRole('button', { name: /^English \(E2\)/ })).toHaveTextContent('IT IS');
    expect(screen.getByRole('button', { name: /^Schwiizerdütsch/ })).toHaveTextContent('ES ISCH');

    fireEvent.click(screen.getByRole('button', { name: /^Deutsch\b(?! [(O])/ }));
    expect(onSelect).toHaveBeenCalledWith('de');

    fireEvent.click(screen.getByRole('button', { name: 'Back' }));
    expect(onBack).toHaveBeenCalled();
  });

  it('selecting a language also navigates back', () => {
    const onSelect = vi.fn();
    const onBack = vi.fn();
    render(<LanguageList selectedId="en" onSelect={onSelect} onBack={onBack} />);
    fireEvent.click(screen.getByRole('button', { name: /^Deutsch\b(?! [(O])/ }));
    expect(onBack).toHaveBeenCalled();
  });
});
