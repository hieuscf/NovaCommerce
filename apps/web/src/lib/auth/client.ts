import type {
  AuthenticationResponse,
  ForgotPasswordRequest,
  IAuthClient,
  LoginRequest,
  LogoutRequest,
  RegisterRequest,
  RegisterResponse,
  ResetPasswordRequest,
} from './types';
import { getApiClient } from '@/lib/api/client';
import { createMockAuthClient } from './mock-auth-client';

function createGatewayAuthClient(): IAuthClient {
  return {
    login(credentials: LoginRequest): Promise<AuthenticationResponse> {
      return getApiClient().post<AuthenticationResponse>('/auth/login', credentials);
    },

    register(data: RegisterRequest): Promise<RegisterResponse> {
      return getApiClient().post<RegisterResponse>('/auth/register', data);
    },

    logout(data?: LogoutRequest): Promise<void> {
      return getApiClient().post<void>('/auth/logout', data ?? {});
    },

    forgotPassword(data: ForgotPasswordRequest): Promise<void> {
      return getApiClient().post<void>('/auth/forgot-password', data);
    },

    resetPassword(data: ResetPasswordRequest): Promise<void> {
      return getApiClient().post<void>('/auth/reset-password', data);
    },
  };
}

function shouldUseMockAdapter(
  env: { NODE_ENV?: string; NEXT_PUBLIC_AUTH_ADAPTER?: string } = process.env,
): boolean {
  return env.NODE_ENV !== 'production' && env.NEXT_PUBLIC_AUTH_ADAPTER === 'mock';
}

export function createAuthClient(
  env: { NODE_ENV?: string; NEXT_PUBLIC_AUTH_ADAPTER?: string } = process.env,
): IAuthClient {
  if (shouldUseMockAdapter(env)) {
    return createMockAuthClient();
  }
  return createGatewayAuthClient();
}

export const authClient: IAuthClient = createAuthClient();
