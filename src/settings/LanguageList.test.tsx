import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { LANGUAGES } from '../clock/languages';
import { LanguageList } from './LanguageList';
import { LANGUAGE_FLAGS } from './language-flags';

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

describe('language flags', () => {
  it('maps every shipped language, so a new face cannot ship with an empty slot', () => {
    const unmapped = LANGUAGES.filter((lang) => !(lang.id in LANGUAGE_FLAGS)).map((lang) => lang.id);
    expect(unmapped).toEqual([]);
  });

  // `null` stays legal as an escape hatch, but no face needs it today
  it('resolves every shipped language to an actual flag', () => {
    const blank = LANGUAGES.filter((lang) => !LANGUAGE_FLAGS[lang.id]).map((lang) => lang.id);
    expect(blank).toEqual([]);
  });

  it('gives Arabic the Arab League rather than a member state', () => {
    expect(LANGUAGE_FLAGS.ar).toContain('arab');
    expect(LANGUAGE_FLAGS.ar).not.toBe(LANGUAGE_FLAGS.tr);
  });

  it('draws flags decoratively, leaving the row label to the name alone', () => {
    render(<LanguageList selectedId="en" onSelect={vi.fn()} onBack={vi.fn()} />);

    for (const name of [/^German\b(?! \(| East)/, /^Arabic/]) {
      expect(screen.getByRole('button', { name }).querySelector('img')).toHaveAttribute('alt', '');
    }
  });
});
