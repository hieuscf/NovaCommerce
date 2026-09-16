import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AccountDashboard } from '../account-dashboard';
import { resetAuthSession, signIn } from '@/lib/auth/session';

const getAccount = vi.fn();
const getAddresses = vi.fn();
const getPreferences = vi.fn();
const createProfile = vi.fn();
const updateProfile = vi.fn();
const addAddress = vi.fn();
const updateAddress = vi.fn();
const deleteAddress = vi.fn();
const setDefaultAddress = vi.fn();
const updatePreferences = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));

vi.mock('@/lib/user/client', () => ({
  userClient: {
    getAccount: (...args: unknown[]) => getAccount(...args),
    getAddresses: (...args: unknown[]) => getAddresses(...args),
    getPreferences: (...args: unknown[]) => getPreferences(...args),
    createProfile: (...args: unknown[]) => createProfile(...args),
    updateProfile: (...args: unknown[]) => updateProfile(...args),
    addAddress: (...args: unknown[]) => addAddress(...args),
    updateAddress: (...args: unknown[]) => updateAddress(...args),
    deleteAddress: (...args: unknown[]) => deleteAddress(...args),
    setDefaultAddress: (...args: unknown[]) => setDefaultAddress(...args),
    updatePreferences: (...args: unknown[]) => updatePreferences(...args),
  },
}));

const profile = {
  userId: 'u1',
  identityId: 'i1',
  displayName: 'Jane Doe',
  phoneNumber: '+84901234567',
  createdAt: '2026-09-12T00:00:00.000Z',
  updatedAt: '2026-09-12T00:00:00.000Z',
};

const account = {
  userId: 'u1',
  identityId: 'i1',
  profile,
  addressCount: 1,
  preferenceCount: 2,
  createdAt: '2026-09-12T00:00:00.000Z',
  updatedAt: '2026-09-12T00:00:00.000Z',
};

const address = {
  id: 'a1',
  label: 'Home',
  line1: '123 Main St',
  city: 'Hanoi',
  state: 'HN',
  postalCode: '100000',
  country: 'VN',
  isDefault: true,
  createdAt: '2026-09-12T00:00:00.000Z',
  updatedAt: '2026-09-12T00:00:00.000Z',
};

describe('AccountDashboard', () => {
  beforeEach(() => {
    resetAuthSession();
    getAccount.mockReset().mockResolvedValue(account);
    getAddresses.mockReset().mockResolvedValue([address]);
    getPreferences.mockReset().mockResolvedValue([
      { key: 'notifications.email', value: 'true', updatedAt: '2026-09-12T00:00:00.000Z' },
    ]);
    createProfile.mockReset();
    updateProfile.mockReset().mockResolvedValue({ ...profile, displayName: 'Jane Updated' });
    addAddress.mockReset();
    updateAddress.mockReset();
    deleteAddress.mockReset();
    setDefaultAddress.mockReset();
    updatePreferences.mockReset();
  });

  it('loads profile and addresses from the User Gateway adapter', async () => {
    render(<AccountDashboard section="overview" />);

    expect((await screen.findAllByText('Jane Doe')).length).toBeGreaterThan(0);
    expect(screen.getAllByText('+84901234567').length).toBeGreaterThan(0);
    expect(screen.getByText('123 Main St')).toBeInTheDocument();
    expect(screen.getAllByText('Saved Addresses').length).toBeGreaterThan(0);
    expect(screen.queryByText('Alex Johnson')).not.toBeInTheDocument();
  });

  it('updates the profile through the User API', async () => {
    const user = userEvent.setup();
    render(<AccountDashboard section="overview" />);

    await screen.findAllByText('Jane Doe');
    await user.click(screen.getByRole('button', { name: /edit profile/i }));
    const nameInput = await screen.findByLabelText(/display name/i);
    await user.clear(nameInput);
    await user.type(nameInput, 'Jane Updated');
    await user.click(screen.getByRole('button', { name: /save changes/i }));

    await waitFor(() => {
      expect(updateProfile).toHaveBeenCalledWith({
        displayName: 'Jane Updated',
        phoneNumber: '+84901234567',
      });
    });
  });

  it('shows a focused addresses section from the URL', async () => {
    render(<AccountDashboard section="addresses" />);

    expect(await screen.findByText('123 Main St')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add/i })).toBeInTheDocument();
  });

  it('shows notification preferences from the User API', async () => {
    render(<AccountDashboard section="notifications" />);

    expect(await screen.findByRole('heading', { name: /notification preferences/i })).toBeInTheDocument();
    expect(screen.getByText(/order updates by email/i)).toBeInTheDocument();
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
