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
  accessToken: string;
  user?: AuthUser;
};
