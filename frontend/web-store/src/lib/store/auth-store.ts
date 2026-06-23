import { create } from 'zustand';

import type { AuthUser } from '@/types/auth';

type AuthState = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  setAuth: (user: AuthUser) => void;
  clearAuth: () => void;
  updateUser: (user: Partial<AuthUser>) => void;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  setAuth: (user) => {
    set({ user, isAuthenticated: true });
  },
  clearAuth: () => {
    set({ user: null, isAuthenticated: false });
  },
  updateUser: (user) => {
    const currentUser = get().user;

    if (!currentUser) {
      return;
    }

    set({ user: { ...currentUser, ...user } });
  },
}));
