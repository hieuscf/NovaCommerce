import * as React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { PasswordRequirements } from '../password-requirements';

describe('PasswordRequirements', () => {
  it('reflects the documented Identity minimum length only', () => {
    render(<PasswordRequirements password="short" />);

    expect(screen.getByText('Password requirements')).toBeInTheDocument();
    expect(screen.getByText(/at least 8 characters/i)).toBeInTheDocument();
    expect(screen.getByText(/not met yet/i)).toBeInTheDocument();
  });

  it('announces when the documented requirement is met', () => {
    render(<PasswordRequirements password="Password8" />);

    expect(screen.getByText(/met/i)).toBeInTheDocument();
  });
});
