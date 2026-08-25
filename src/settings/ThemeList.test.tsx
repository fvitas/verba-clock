import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ThemeList } from './ThemeList';

const noop = () => {};

describe('ThemeList', () => {
  it('hides the create entry while custom themes are off for v1', () => {
    render(
      <ThemeList
        selectedId="deep-black"
        customThemes={[]}
        onSelect={noop}
        onCreate={noop}
        onEdit={noop}
        onBack={noop}
      />,
    );
    screen.getByRole('button', { name: /Deep Black/ });
    expect(screen.queryByText('Create custom theme')).toBeNull();
  });
});
