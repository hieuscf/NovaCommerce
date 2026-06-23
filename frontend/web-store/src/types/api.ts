import type { AuthUser } from './auth';

export type ApiErrorPayload = {
  code: string;
  message: string;
};

export type ApiEnvelope<TData> = {
  data: TData;
  meta?: Record<string, unknown> | null;
  error: ApiErrorPayload | null;
};

export type RefreshTokenResponse = {
  access_token: string;
  refresh_token: string;
  user?: AuthUser;
};
