import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { AccountDashboard } from '../account-dashboard';
import { resetAuthSession, signIn } from '@/lib/auth/session';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));

describe('AccountDashboard', () => {
  beforeEach(() => {
    resetAuthSession();
  });

  it('renders the Alloy overview dashboard', () => {
    render(<AccountDashboard section="overview" />);

    expect(screen.getByRole('heading', { name: 'My Account' })).toBeInTheDocument();
    expect(screen.getAllByText('Alex Johnson').length).toBeGreaterThan(0);
    expect(screen.getByRole('heading', { name: 'Quick Actions' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Recent Orders' })).toBeInTheDocument();
    expect(screen.getByText('#NC2026001')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Loyalty Points' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Saved Addresses' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Payment Methods' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Overview' })).toHaveAttribute('href', '/account');
    expect(screen.getByRole('link', { name: 'Orders' })).toHaveAttribute(
      'href',
      '/account?section=orders',
    );
  });

  it('shows a focused orders section from the URL', () => {
    render(<AccountDashboard section="orders" />);

    expect(screen.getByRole('heading', { name: 'Recent Orders' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Quick Actions' })).not.toBeInTheDocument();
    expect(screen.getByText('Orders', { selector: 'span' })).toBeInTheDocument();
  });

  it('shows a pending empty state for wishlist', () => {
    render(<AccountDashboard section="wishlist" />);

    expect(screen.getByRole('heading', { name: 'Wishlist is coming next' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Back to overview' })).toHaveAttribute('href', '/account');
  });

  it('keeps sign out on the security section', async () => {
    signIn({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      tokenType: 'Bearer',
      expiresIn: 900,
    });

    render(<AccountDashboard section="security" />);

    expect(await screen.findByRole('heading', { name: 'Account security' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sign out' })).toBeInTheDocument();
  });
});
