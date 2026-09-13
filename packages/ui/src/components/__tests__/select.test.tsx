import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../select';
import { expectNoA11yViolations } from '../../test/a11y';
import { openPopper, useSynchronousCleanup } from '../../test/popper';

function SortSelect(props: React.ComponentProps<typeof Select> = {}) {
  return (
    <Select {...props}>
      <SelectTrigger aria-label="Sort by">
        <SelectValue placeholder="Select an option" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="newest">Newest</SelectItem>
        <SelectItem value="price-asc">Price: low to high</SelectItem>
        <SelectItem value="unavailable" disabled>
          Unavailable
        </SelectItem>
      </SelectContent>
    </Select>
  );
}

describe('Select', () => {
  useSynchronousCleanup();

  it('renders a combobox showing the placeholder', () => {
    render(<SortSelect />);

    expect(screen.getByRole('combobox', { name: 'Sort by' })).toHaveTextContent(
      'Select an option',
    );
  });

  it('opens the listbox and lists the options', () => {
    render(<SortSelect />);

    openPopper(screen.getByRole('combobox', { name: 'Sort by' }));

    expect(screen.getByRole('listbox')).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Newest' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Price: low to high' })).toBeInTheDocument();
  });

  it('selects an option and reflects it on the trigger', () => {
    const onValueChange = vi.fn();
    render(<SortSelect onValueChange={onValueChange} />);

    openPopper(screen.getByRole('combobox', { name: 'Sort by' }));
    fireEvent.click(screen.getByRole('option', { name: 'Price: low to high' }));

    expect(onValueChange).toHaveBeenCalledWith('price-asc');
    expect(screen.getByRole('combobox', { name: 'Sort by' })).toHaveTextContent(
      'Price: low to high',
    );
  });

  it('opens with the keyboard', () => {
    render(<SortSelect />);

    fireEvent.keyDown(screen.getByRole('combobox', { name: 'Sort by' }), { key: 'Enter' });

    expect(screen.getByRole('listbox')).toBeInTheDocument();
  });

  it('closes on Escape', () => {
    render(<SortSelect />);

    openPopper(screen.getByRole('combobox', { name: 'Sort by' }));
    fireEvent.keyDown(screen.getByRole('listbox'), { key: 'Escape' });

    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('marks disabled options as disabled', () => {
    render(<SortSelect />);

    openPopper(screen.getByRole('combobox', { name: 'Sort by' }));

    expect(screen.getByRole('option', { name: 'Unavailable' })).toHaveAttribute(
      'aria-disabled',
      'true',
    );
  });

  it('displays the default value instead of the placeholder', () => {
    render(<SortSelect defaultValue="newest" />);

    expect(screen.getByRole('combobox', { name: 'Sort by' })).toHaveTextContent('Newest');
  });

  it('does not open when disabled', () => {
    render(<SortSelect disabled />);

    const trigger = screen.getByRole('combobox', { name: 'Sort by' });
    expect(trigger).toBeDisabled();

    openPopper(trigger);

    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('reports an error state', () => {
    render(
      <Select>
        <SelectTrigger aria-label="Sort by" aria-invalid>
          <SelectValue placeholder="Select an option" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="newest">Newest</SelectItem>
        </SelectContent>
      </Select>,
    );

    expect(screen.getByRole('combobox', { name: 'Sort by' })).toHaveAttribute(
      'aria-invalid',
      'true',
    );
  });

  it('has no accessibility violations when closed', async () => {
    const { container } = render(<SortSelect />);

    await expectNoA11yViolations(container);
  });
});
