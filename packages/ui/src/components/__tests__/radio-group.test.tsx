import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RadioGroup, RadioGroupItem } from '../radio-group';
import { Label } from '../label';
import { expectNoA11yViolations } from '../../test/a11y';

function ShippingOptions({ disabled = false }: { disabled?: boolean } = {}) {
  return (
    <RadioGroup aria-label="Shipping speed" defaultValue="standard" disabled={disabled}>
      <div>
        <RadioGroupItem value="standard" id="standard" />
        <Label htmlFor="standard">Standard</Label>
      </div>
      <div>
        <RadioGroupItem value="express" id="express" />
        <Label htmlFor="express">Express</Label>
      </div>
    </RadioGroup>
  );
}

describe('RadioGroup', () => {
  it('renders a radiogroup with the default option selected', () => {
    render(<ShippingOptions />);

    expect(screen.getByRole('radiogroup', { name: 'Shipping speed' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Standard' })).toBeChecked();
    expect(screen.getByRole('radio', { name: 'Express' })).not.toBeChecked();
  });

  it('selects an option on click', async () => {
    render(<ShippingOptions />);

    await userEvent.click(screen.getByRole('radio', { name: 'Express' }));

    expect(screen.getByRole('radio', { name: 'Express' })).toBeChecked();
    expect(screen.getByRole('radio', { name: 'Standard' })).not.toBeChecked();
  });

  it('moves focus between options with arrow keys and selects with space', async () => {
    render(<ShippingOptions />);

    await userEvent.tab();
    expect(screen.getByRole('radio', { name: 'Standard' })).toHaveFocus();

    await userEvent.keyboard('{ArrowDown}');
    expect(screen.getByRole('radio', { name: 'Express' })).toHaveFocus();

    await userEvent.keyboard(' ');
    expect(screen.getByRole('radio', { name: 'Express' })).toBeChecked();
  });

  it('does not change selection when disabled', async () => {
    render(<ShippingOptions disabled />);

    await userEvent.click(screen.getByRole('radio', { name: 'Express' }));

    expect(screen.getByRole('radio', { name: 'Express' })).not.toBeChecked();
  });

  it('reports an error state on an item', () => {
    render(
      <RadioGroup aria-label="Shipping speed">
        <RadioGroupItem value="standard" aria-label="Standard" aria-invalid />
      </RadioGroup>,
    );

    expect(screen.getByRole('radio', { name: 'Standard' })).toHaveAttribute(
      'aria-invalid',
      'true',
    );
  });

  it('emits the selected value', async () => {
    const onValueChange = vi.fn();
    render(
      <RadioGroup aria-label="Shipping speed" onValueChange={onValueChange}>
        <RadioGroupItem value="express" aria-label="Express" />
      </RadioGroup>,
    );

    await userEvent.click(screen.getByRole('radio', { name: 'Express' }));

    expect(onValueChange).toHaveBeenCalledWith('express');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<ShippingOptions />);

    await expectNoA11yViolations(container);
  });
});
