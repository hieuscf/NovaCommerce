import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';

import { useAuthStore } from '@/lib/store/auth-store';
import type {
  ApiEnvelope,
  ApiErrorPayload,
  RefreshTokenResponse,
} from '@/types/api';

type PendingRequest = {
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
};

type RetryConfig = InternalAxiosRequestConfig & { _retry?: boolean };

export class ApiClientError extends Error {
  code: string;

  constructor(error: ApiErrorPayload) {
    super(error.message);
    this.name = 'ApiClientError';
    this.code = error.code;
  }
}

const refreshClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
});

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

let isRefreshing = false;
let pendingRequests: PendingRequest[] = [];

const resolvePendingRequests = (error: unknown, token?: string) => {
  pendingRequests.forEach((request) => {
    if (error || !token) {
      request.reject(error);
      return;
    }

    request.resolve(token);
  });

  pendingRequests = [];
};

apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => {
    const envelope = response.data as ApiEnvelope<unknown>;

    if (envelope && typeof envelope === 'object' && 'error' in envelope) {
      if (envelope.error) {
        throw new ApiClientError(envelope.error);
      }

      return envelope.data;
    }

    return response.data;
  },
  async (error: AxiosError<ApiEnvelope<unknown>>) => {
    const originalRequest = error.config as RetryConfig | undefined;

    if (!originalRequest || error.response?.status !== 401) {
      return Promise.reject(error);
    }

    if (
      originalRequest.url?.includes('/auth/refresh') ||
      originalRequest._retry
    ) {
      await useAuthStore.getState().clearAuth();

      if (typeof window !== 'undefined') {
        window.location.assign('/login');
      }

      return Promise.reject(error);
    }

    originalRequest._retry = true;

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        pendingRequests.push({
          resolve: (token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(apiClient(originalRequest));
          },
          reject,
        });
      });
    }

    isRefreshing = true;

    try {
      const refreshResponse =
        await refreshClient.post<ApiEnvelope<RefreshTokenResponse>>(
          '/auth/refresh',
        );
      const payload = refreshResponse.data;

      if (payload.error || !payload.data?.accessToken) {
        throw payload.error ?? new Error('Unable to refresh token');
      }

      const { accessToken, user } = payload.data;
      await useAuthStore
        .getState()
        .setAuth({ accessToken, user: user ?? null });

      resolvePendingRequests(null, accessToken);
      originalRequest.headers.Authorization = `Bearer ${accessToken}`;

      return apiClient(originalRequest);
    } catch (refreshError) {
      resolvePendingRequests(refreshError);
      await useAuthStore.getState().clearAuth();

      if (typeof window !== 'undefined') {
        window.location.assign('/login');
      }

      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);
