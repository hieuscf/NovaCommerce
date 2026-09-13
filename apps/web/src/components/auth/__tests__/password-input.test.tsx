import * as React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { PasswordInput } from '../password-input';

describe('PasswordInput', () => {
  it('renders password input with label', () => {
    render(<PasswordInput label="Password" id="password" />);

    const input = screen.getByLabelText('Password');
    expect(input).toHaveAttribute('type', 'password');
  });

  it('toggles password visibility and updates accessible label', async () => {
    render(<PasswordInput label="Password" id="password" />);

    const input = screen.getByLabelText('Password');
    const toggle = screen.getByRole('button', { name: /show password/i });

    expect(input).toHaveAttribute('type', 'password');

    await userEvent.click(toggle);
    expect(input).toHaveAttribute('type', 'text');
    expect(screen.getByRole('button', { name: /hide password/i })).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /hide password/i }));
    expect(input).toHaveAttribute('type', 'password');
  });

  it('toggles visibility with the keyboard', async () => {
    render(<PasswordInput label="Password" id="password" />);

    const toggle = screen.getByRole('button', { name: /show password/i });
    toggle.focus();
    await userEvent.keyboard('{Enter}');

    expect(screen.getByLabelText('Password')).toHaveAttribute('type', 'text');
    expect(toggle).toHaveAttribute('aria-pressed', 'true');
  });

  it('displays error message and aria-invalid', () => {
    render(<PasswordInput label="Password" id="password" error="Password is required" />);

    expect(screen.getByText('Password is required')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toHaveAttribute('aria-invalid', 'true');
  });
});
