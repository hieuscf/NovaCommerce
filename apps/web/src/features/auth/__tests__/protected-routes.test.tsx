import * as React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ProtectedRoutes } from '../protected-routes';
import { resetAuthSession, signIn } from '@/lib/auth/session';

const replaceMock = vi.fn();
let pathname = '/shop';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: replaceMock }),
  usePathname: () => pathname,
}));

describe('ProtectedRoutes', () => {
  beforeEach(() => {
    replaceMock.mockClear();
    resetAuthSession();
    pathname = '/shop';
  });

  it('renders public storefront routes without a session redirect', () => {
    render(
      <ProtectedRoutes>
        <p>Public catalog</p>
      </ProtectedRoutes>,
    );

    expect(screen.getByText('Public catalog')).toBeInTheDocument();
    expect(replaceMock).not.toHaveBeenCalled();
  });

  it('guards /orders and /checkout with the shared RequireAuth policy', async () => {
    pathname = '/orders';
    render(
      <ProtectedRoutes>
        <p>Orders</p>
      </ProtectedRoutes>,
    );

    await waitFor(() => {
      expect(replaceMock).toHaveBeenCalledWith(
        '/login?returnUrl=%2Forders&reason=session-required',
      );
    });

    pathname = '/checkout';
    replaceMock.mockClear();
    resetAuthSession();
    render(
      <ProtectedRoutes>
        <p>Checkout</p>
      </ProtectedRoutes>,
    );

    await waitFor(() => {
      expect(replaceMock).toHaveBeenCalledWith(
        '/login?returnUrl=%2Fcheckout&reason=session-required',
      );
    });
  });

  it('renders a protected route when the session is authenticated', async () => {
    pathname = '/account';
    signIn({
      accessToken: 'access-token',
      tokenType: 'Bearer',
      expiresIn: 900,
    });

    render(
      <ProtectedRoutes>
        <p>Account</p>
      </ProtectedRoutes>,
    );

    expect(await screen.findByText('Account')).toBeInTheDocument();
    expect(replaceMock).not.toHaveBeenCalled();
  });
});
