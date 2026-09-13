import * as React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { RequireAuth } from '../require-auth';
import { resetAuthSession, signIn } from '@/lib/auth/session';

const replaceMock = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: replaceMock }),
  usePathname: () => '/account',
}));

describe('RequireAuth', () => {
  beforeEach(() => {
    replaceMock.mockClear();
    resetAuthSession();
  });

  it('shows a session loading state before redirecting unauthenticated users', async () => {
    render(
      <RequireAuth>
        <p>Private content</p>
      </RequireAuth>,
    );

    expect(screen.queryByText('Private content')).not.toBeInTheDocument();
    expect(screen.getByText(/checking your session|redirecting to sign in/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(replaceMock).toHaveBeenCalledWith(
        '/login?returnUrl=%2Faccount&reason=session-required',
      );
    });
  });

  it('renders children when the session is authenticated', async () => {
    signIn({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      tokenType: 'Bearer',
      expiresIn: 900,
    });

    render(
      <RequireAuth>
        <p>Private content</p>
      </RequireAuth>,
    );

    expect(await screen.findByText('Private content')).toBeInTheDocument();
    expect(replaceMock).not.toHaveBeenCalled();
  });
});
