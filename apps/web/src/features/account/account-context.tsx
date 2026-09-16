'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { isApiClientError } from '@novacommerce/frontend';
import { toFormError } from '@/lib/errors';
import { userClient } from '@/lib/user/client';
import {
  isPreferenceEnabled,
  mapAccountStats,
  mapAddressToViewModel,
  mapProfileToViewModel,
  preferenceMap,
} from '@/lib/user/mappers';
import type { AddressRequest, UpdateProfileRequest, UserPreferenceDto } from '@/lib/user/types';
import type {
  AccountAddressViewModel,
  AccountProfileViewModel,
  AccountStatViewModel,
} from '@/lib/view-models/account';

export type AccountLoadStatus = 'loading' | 'ready' | 'error';

export interface AccountNotificationPreferences {
  readonly email: boolean;
  readonly push: boolean;
  readonly sms: boolean;
  readonly marketingEmail: boolean;
}

interface AccountContextValue {
  readonly status: AccountLoadStatus;
  readonly error: string | null;
  readonly profile: AccountProfileViewModel | null;
  readonly stats: readonly AccountStatViewModel[];
  readonly addresses: readonly AccountAddressViewModel[];
  readonly notifications: AccountNotificationPreferences;
  readonly refreshing: boolean;
  reload: () => Promise<void>;
  updateProfile: (data: UpdateProfileRequest) => Promise<void>;
  addAddress: (data: AddressRequest) => Promise<void>;
  updateAddress: (addressId: string, data: AddressRequest) => Promise<void>;
  deleteAddress: (addressId: string) => Promise<void>;
  setDefaultAddress: (addressId: string) => Promise<void>;
  updateNotifications: (prefs: AccountNotificationPreferences) => Promise<void>;
}

const DEFAULT_NOTIFICATIONS: AccountNotificationPreferences = {
  email: true,
  push: false,
  sms: false,
  marketingEmail: false,
};

const AccountContext = createContext<AccountContextValue | null>(null);

function mapNotifications(preferences: readonly UserPreferenceDto[]): AccountNotificationPreferences {
  const map = preferenceMap(preferences);
  return {
    email: isPreferenceEnabled(map, 'notifications.email') || map['notifications.email'] === undefined,
    push: isPreferenceEnabled(map, 'notifications.push'),
    sms: isPreferenceEnabled(map, 'notifications.sms'),
    marketingEmail: isPreferenceEnabled(map, 'marketing.email'),
  };
}

async function ensureAccountBundle() {
  try {
    const [account, addresses, preferences] = await Promise.all([
      userClient.getAccount(),
      userClient.getAddresses(),
      userClient.getPreferences(),
    ]);
    return { account, addresses, preferences };
  } catch (error) {
    if (!isApiClientError(error) || error.status !== 404) {
      throw error;
    }

    await userClient.createProfile({ displayName: 'Customer' });
    const [account, addresses, preferences] = await Promise.all([
      userClient.getAccount(),
      userClient.getAddresses(),
      userClient.getPreferences(),
    ]);
    return { account, addresses, preferences };
  }
}

export function AccountProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AccountLoadStatus>('loading');
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<AccountProfileViewModel | null>(null);
  const [stats, setStats] = useState<readonly AccountStatViewModel[]>([]);
  const [addresses, setAddresses] = useState<readonly AccountAddressViewModel[]>([]);
  const [notifications, setNotifications] =
    useState<AccountNotificationPreferences>(DEFAULT_NOTIFICATIONS);
  const [refreshing, setRefreshing] = useState(false);

  const applyBundle = useCallback(
    (bundle: Awaited<ReturnType<typeof ensureAccountBundle>>) => {
      setProfile(mapProfileToViewModel(bundle.account.profile));
      setStats(mapAccountStats(bundle.account));
      setAddresses(bundle.addresses.map(mapAddressToViewModel));
      setNotifications(mapNotifications(bundle.preferences));
      setError(null);
      setStatus('ready');
    },
    [],
  );

  const reload = useCallback(async () => {
    setRefreshing(true);
    try {
      const bundle = await ensureAccountBundle();
      applyBundle(bundle);
    } catch (err) {
      setError(toFormError(err));
      setStatus('error');
    } finally {
      setRefreshing(false);
    }
  }, [applyBundle]);

  useEffect(() => {
    let cancelled = false;
    setStatus('loading');
    void (async () => {
      try {
        const bundle = await ensureAccountBundle();
        if (!cancelled) {
          applyBundle(bundle);
        }
      } catch (err) {
        if (!cancelled) {
          setError(toFormError(err));
          setStatus('error');
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [applyBundle]);

  const updateProfile = useCallback(async (data: UpdateProfileRequest) => {
    const updated = await userClient.updateProfile(data);
    setProfile(mapProfileToViewModel(updated));
    const account = await userClient.getAccount();
    setStats(mapAccountStats(account));
  }, []);

  const addAddress = useCallback(async (data: AddressRequest) => {
    await userClient.addAddress(data);
    const [addressesResult, account] = await Promise.all([
      userClient.getAddresses(),
      userClient.getAccount(),
    ]);
    setAddresses(addressesResult.map(mapAddressToViewModel));
    setStats(mapAccountStats(account));
  }, []);

  const updateAddress = useCallback(async (addressId: string, data: AddressRequest) => {
    await userClient.updateAddress(addressId, data);
    if (data.isDefault) {
      await userClient.setDefaultAddress(addressId);
    }
    const addressesResult = await userClient.getAddresses();
    setAddresses(addressesResult.map(mapAddressToViewModel));
  }, []);

  const deleteAddress = useCallback(async (addressId: string) => {
    await userClient.deleteAddress(addressId);
    const [addressesResult, account] = await Promise.all([
      userClient.getAddresses(),
      userClient.getAccount(),
    ]);
    setAddresses(addressesResult.map(mapAddressToViewModel));
    setStats(mapAccountStats(account));
  }, []);

  const setDefaultAddress = useCallback(async (addressId: string) => {
    await userClient.setDefaultAddress(addressId);
    const addressesResult = await userClient.getAddresses();
    setAddresses(addressesResult.map(mapAddressToViewModel));
  }, []);

  const updateNotifications = useCallback(async (prefs: AccountNotificationPreferences) => {
    const updated = await userClient.updatePreferences({
      preferences: [
        { key: 'notifications.email', value: prefs.email ? 'true' : 'false' },
        { key: 'notifications.push', value: prefs.push ? 'true' : 'false' },
        { key: 'notifications.sms', value: prefs.sms ? 'true' : 'false' },
        { key: 'marketing.email', value: prefs.marketingEmail ? 'true' : 'false' },
      ],
    });
    setNotifications(mapNotifications(updated));
    const account = await userClient.getAccount();
    setStats(mapAccountStats(account));
  }, []);

  const value = useMemo<AccountContextValue>(
    () => ({
      status,
      error,
      profile,
      stats,
      addresses,
      notifications,
      refreshing,
      reload,
      updateProfile,
      addAddress,
      updateAddress,
      deleteAddress,
      setDefaultAddress,
      updateNotifications,
    }),
    [
      status,
      error,
      profile,
      stats,
      addresses,
      notifications,
      refreshing,
      reload,
      updateProfile,
      addAddress,
      updateAddress,
      deleteAddress,
      setDefaultAddress,
      updateNotifications,
    ],
  );

  return <AccountContext.Provider value={value}>{children}</AccountContext.Provider>;
}

export function useAccount(): AccountContextValue {
  const value = useContext(AccountContext);
  if (!value) {
    throw new Error('useAccount must be used within AccountProvider');
  }
  return value;
}
