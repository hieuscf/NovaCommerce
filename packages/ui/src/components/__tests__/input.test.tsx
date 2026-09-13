import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Input } from '../input';
import { Label } from '../label';
import { expectNoA11yViolations } from '../../test/a11y';

describe('Input', () => {
  it('accepts typed text', async () => {
    render(<Input aria-label="Email" />);

    await userEvent.type(screen.getByLabelText('Email'), 'ada@novacommerce.io');

    expect(screen.getByLabelText('Email')).toHaveValue('ada@novacommerce.io');
  });

  it('shows the placeholder when empty', () => {
    render(<Input placeholder="you@example.com" aria-label="Email" />);

    expect(screen.getByPlaceholderText('you@example.com')).toBeInTheDocument();
  });

  it('rejects input when disabled', async () => {
    render(<Input disabled aria-label="Email" />);

    const input = screen.getByLabelText('Email');
    await userEvent.type(input, 'hello');

    expect(input).toBeDisabled();
    expect(input).toHaveValue('');
  });

  it('associates a visible label with the control', () => {
    render(
      <>
        <Label htmlFor="email">Email address</Label>
        <Input id="email" />
      </>,
    );

    expect(screen.getByLabelText('Email address')).toBeInTheDocument();
  });

  it('reports an error state and its description to assistive technology', () => {
    render(
      <>
        <Input aria-label="Email" aria-invalid aria-describedby="email-error" />
        <p id="email-error">Enter a valid email address</p>
      </>,
    );

    const input = screen.getByLabelText('Email');

    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAccessibleDescription('Enter a valid email address');
  });

  it('renders leading and trailing adornments around the control', async () => {
    render(
      <Input
        aria-label="Search"
        startAdornment={<span>@</span>}
        endAdornment={<span>.com</span>}
      />,
    );

    expect(screen.getByText('@')).toBeInTheDocument();
    expect(screen.getByText('.com')).toBeInTheDocument();

    await userEvent.type(screen.getByLabelText('Search'), 'nova');
    expect(screen.getByLabelText('Search')).toHaveValue('nova');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <>
        <Label htmlFor="a11y-email">Email address</Label>
        <Input id="a11y-email" />
      </>,
    );

    await expectNoA11yViolations(container);
  });
});
