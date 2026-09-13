import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Checkbox } from '../checkbox';
import { Label } from '../label';
import { expectNoA11yViolations } from '../../test/a11y';

describe('Checkbox', () => {
  it('starts unchecked and toggles on click', async () => {
    render(<Checkbox aria-label="Free shipping only" />);

    const checkbox = screen.getByRole('checkbox', { name: 'Free shipping only' });
    expect(checkbox).not.toBeChecked();

    await userEvent.click(checkbox);
    expect(checkbox).toBeChecked();
  });

  it('toggles with the keyboard', async () => {
    const onCheckedChange = vi.fn();
    render(<Checkbox aria-label="In stock" onCheckedChange={onCheckedChange} />);

    await userEvent.tab();
    expect(screen.getByRole('checkbox')).toHaveFocus();

    await userEvent.keyboard(' ');
    expect(onCheckedChange).toHaveBeenCalledWith(true);
  });

  it('reports the mixed state for indeterminate', () => {
    render(<Checkbox aria-label="Select all" checked="indeterminate" />);

    expect(screen.getByRole('checkbox', { name: 'Select all' })).toHaveAttribute(
      'aria-checked',
      'mixed',
    );
  });

  it('does not toggle when disabled', async () => {
    const onCheckedChange = vi.fn();
    render(<Checkbox aria-label="In stock" disabled onCheckedChange={onCheckedChange} />);

    await userEvent.click(screen.getByRole('checkbox'));

    expect(onCheckedChange).not.toHaveBeenCalled();
  });

  it('reports an error state', () => {
    render(<Checkbox aria-label="Accept terms" aria-invalid />);

    expect(screen.getByRole('checkbox')).toHaveAttribute('aria-invalid', 'true');
  });

  it('is toggled by clicking its associated label', async () => {
    render(
      <>
        <Checkbox id="terms" />
        <Label htmlFor="terms">Accept the terms</Label>
      </>,
    );

    await userEvent.click(screen.getByText('Accept the terms'));

    expect(screen.getByRole('checkbox', { name: 'Accept the terms' })).toBeChecked();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <>
        <Checkbox id="a11y-terms" />
        <Label htmlFor="a11y-terms">Accept the terms</Label>
      </>,
    );

    await expectNoA11yViolations(container);
  });
});
