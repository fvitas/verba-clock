import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Toggle } from './Toggle';
import { Segmented } from './Segmented';
import { Group } from './Group';
import { Cell } from './Cell';
import { SwatchRow } from './SwatchRow';

describe('Toggle', () => {
  it('reflects checked state and calls onCheckedChange', () => {
    const onCheckedChange = vi.fn();
    render(<Toggle checked={false} onCheckedChange={onCheckedChange} aria-label="It is words" />);
    const toggle = screen.getByRole('switch', { name: 'It is words' });
    expect(toggle).toHaveAttribute('data-state', 'unchecked');
    fireEvent.click(toggle);
    expect(onCheckedChange).toHaveBeenCalledWith(true);
  });
});

describe('Segmented', () => {
  it('marks the selected option and reports selection', () => {
    const onChange = vi.fn();
    render(
      <Segmented
        options={[
          { value: 'fullbleed', label: 'Full-bleed' },
          { value: 'wall', label: 'Wall' },
        ]}
        value="fullbleed"
        onChange={onChange}
      />,
    );
    expect(screen.getByRole('radio', { name: 'Full-bleed' })).toBeChecked();
    fireEvent.click(screen.getByRole('radio', { name: 'Wall' }));
    expect(onChange).toHaveBeenCalledWith('wall');
  });
});

describe('Group and Cell', () => {
  it('renders label and children', () => {
    render(
      <Group label="Clock">
        <Cell label="Language">
          <span>English</span>
        </Cell>
      </Group>,
    );
    expect(screen.getByText('Clock')).toBeInTheDocument();
    expect(screen.getByText('Language')).toBeInTheDocument();
    expect(screen.getByText('English')).toBeInTheDocument();
  });

  it('Cell with onClick renders a button', () => {
    const onClick = vi.fn();
    render(<Cell label="Language" onClick={onClick} />);
    fireEvent.click(screen.getByRole('button', { name: /Language/ }));
    expect(onClick).toHaveBeenCalled();
  });
});

describe('SwatchRow', () => {
  it('selects a swatch', () => {
    const onSelect = vi.fn();
    render(
      <SwatchRow
        swatches={[
          { id: 'deep-black', name: 'Deep Black', surface: '#0a0a0a' },
          { id: 'cream', name: 'Cream', surface: '#efe9dd' },
        ]}
        selectedId="deep-black"
        onSelect={onSelect}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Cream' }));
    expect(onSelect).toHaveBeenCalledWith('cream');
  });
});
