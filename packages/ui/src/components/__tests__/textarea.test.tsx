import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CharacterCount, Textarea } from '../textarea';
import { expectNoA11yViolations } from '../../test/a11y';

describe('Textarea', () => {
  it('accepts multiline text', async () => {
    render(<Textarea aria-label="Review" />);

    await userEvent.type(screen.getByLabelText('Review'), 'Great product{Enter}Would buy again');

    expect(screen.getByLabelText('Review')).toHaveValue('Great product\nWould buy again');
  });

  it('rejects input when disabled', async () => {
    render(<Textarea disabled aria-label="Review" />);

    await userEvent.type(screen.getByLabelText('Review'), 'hello');

    expect(screen.getByLabelText('Review')).toBeDisabled();
    expect(screen.getByLabelText('Review')).toHaveValue('');
  });

  it('reports an error state and its description', () => {
    render(
      <>
        <Textarea aria-label="Review" aria-invalid aria-describedby="review-error" />
        <p id="review-error">Review must be at least 20 characters</p>
      </>,
    );

    const textarea = screen.getByLabelText('Review');

    expect(textarea).toHaveAttribute('aria-invalid', 'true');
    expect(textarea).toHaveAccessibleDescription('Review must be at least 20 characters');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<Textarea aria-label="Review" />);

    await expectNoA11yViolations(container);
  });
});

describe('CharacterCount', () => {
  it('reports the current length against the maximum', () => {
    render(<CharacterCount value="nova" maxLength={10} />);

    expect(screen.getByText('4/10')).toBeInTheDocument();
  });

  it('flags an over-limit value', () => {
    render(<CharacterCount value="novacommerce" maxLength={5} />);

    expect(screen.getByText('12/5')).toHaveClass('text-destructive');
  });
});
