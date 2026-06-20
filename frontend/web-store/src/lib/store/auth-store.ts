import { create } from 'zustand';

import {
  removeAccessTokenCookie,
  persistAccessTokenCookie,
} from '@/lib/utils/token-cookie';
import type { AuthUser } from '@/types/auth';

type SetAuthPayload = {
  user: AuthUser | null;
  accessToken: string;
};

type AuthState = {
  user: AuthUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  setAuth: (payload: SetAuthPayload) => Promise<void>;
  clearAuth: () => Promise<void>;
  updateUser: (user: Partial<AuthUser>) => void;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  setAuth: async ({ user, accessToken }) => {
    set({ user, accessToken, isAuthenticated: true });
    await persistAccessTokenCookie(accessToken);
  },
  clearAuth: async () => {
    set({ user: null, accessToken: null, isAuthenticated: false });
    await removeAccessTokenCookie();
  },
  updateUser: (user) => {
    const currentUser = get().user;

    if (!currentUser) {
      return;
    }

    set({ user: { ...currentUser, ...user } });
  },
}));
