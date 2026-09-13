import * as React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { UnauthorizedState } from '../unauthorized-state';

const backMock = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ back: backMock }),
}));

describe('UnauthorizedState', () => {
  beforeEach(() => {
    backMock.mockClear();
  });

  it('renders a 403 access-restricted experience', () => {
    render(<UnauthorizedState />);

    expect(screen.getByRole('heading', { name: /access restricted/i })).toBeInTheDocument();
    expect(screen.getByText(/you don't have permission/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /go to home/i })).toHaveAttribute('href', '/');
    expect(screen.getByRole('link', { name: /go to account/i })).toHaveAttribute(
      'href',
      '/account',
    );
  });

  it('returns to the previous page from Back', async () => {
    render(<UnauthorizedState />);

    await userEvent.click(screen.getByRole('button', { name: /back/i }));

    expect(backMock).toHaveBeenCalledOnce();
  });
});
