import { ApiClientError } from './client';

import type { ApiEnvelope } from '@/types/api';
import type {
  AuthUser,
  ChangePasswordPayload,
  ForgotPasswordPayload,
  LoginPayload,
  RegisterPayload,
  RegisterResponse,
  ResetPasswordPayload,
  UpdateProfilePayload,
} from '@/types/auth';

async function requestBff<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
    credentials: 'include',
  });

  const payload = (await response.json()) as ApiEnvelope<T>;

  if (!response.ok || payload.error) {
    throw new ApiClientError(
      payload.error ?? {
        code: 'REQUEST_FAILED',
        message: 'Authentication request failed.',
      },
      response.status,
    );
  }

  return payload.data;
}

export const authApi = {
  register: async (payload: RegisterPayload) =>
    requestBff<RegisterResponse>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  login: async (payload: LoginPayload) =>
    requestBff<AuthUser>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  logout: async () =>
    requestBff<{ success: boolean }>('/api/auth/logout', {
      method: 'POST',
    }),
  logoutAll: async () =>
    requestBff<{ success: boolean }>('/api/auth/logout-all', {
      method: 'POST',
    }),
  getMe: async () => requestBff<AuthUser>('/api/auth/me'),
  changePassword: async (payload: ChangePasswordPayload) =>
    requestBff<{ message: string }>('/api/auth/change-password', {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),
  forgotPassword: async (payload: ForgotPasswordPayload) =>
    requestBff<{ message: string }>('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  resetPassword: async (payload: ResetPasswordPayload) =>
    requestBff<{ message: string }>('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  updateProfile: async (payload: UpdateProfilePayload) =>
    requestBff<AuthUser>('/api/account/profile', {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),
};
