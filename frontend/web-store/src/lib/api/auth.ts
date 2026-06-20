import { apiClient } from './client';

import type { AuthUser } from '@/types/auth';

export type LoginPayload = {
  identifier: string;
  password: string;
};

export type LoginResponse = {
  accessToken: string;
  user: AuthUser;
};

export const authApi = {
  login: async (payload: LoginPayload) =>
    apiClient.post<LoginResponse>('/auth/login', payload),
  me: async () => apiClient.get<AuthUser>('/auth/me'),
};
