import { ApiClientError } from '@novacommerce/frontend';
import type {
  AuthenticationResponse,
  IAuthClient,
  LoginRequest,
  RegisterRequest,
  RegisterResponse,
} from './types';

/**
 * Development-only authentication adapter.
 *
 * Never selected in production. Enable with:
 * `NEXT_PUBLIC_AUTH_ADAPTER=mock` while `NODE_ENV !== 'production'`.
 *
 * Documented fixtures (not production credentials):
 * - customer@novacommerce.dev / Password8 → success
 * - locked@novacommerce.dev → account unavailable
 * - limited@novacommerce.dev → rate limited
 * - existing@novacommerce.dev on register → conflict
 */
export const MOCK_AUTH_FIXTURES = {
  email: 'customer@novacommerce.dev',
  password: 'Password8',
  lockedEmail: 'locked@novacommerce.dev',
  rateLimitedEmail: 'limited@novacommerce.dev',
  existingEmail: 'existing@novacommerce.dev',
} as const;

function delay(ms = 200): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function tokensFor(email: string): AuthenticationResponse {
  return {
    accessToken: `mock-access-${email}`,
    refreshToken: `mock-refresh-${email}`,
    tokenType: 'Bearer',
    expiresIn: 900,
  };
}

export function createMockAuthClient(): IAuthClient {
  return {
    async login(credentials: LoginRequest): Promise<AuthenticationResponse> {
      await delay();
      if (credentials.email === MOCK_AUTH_FIXTURES.lockedEmail) {
        throw new ApiClientError({
          category: 'authorization',
          code: 'FORBIDDEN',
          message: 'Account unavailable',
          status: 403,
        });
      }
      if (credentials.email === MOCK_AUTH_FIXTURES.rateLimitedEmail) {
        throw new ApiClientError({
          category: 'rate_limit',
          code: 'RATE_LIMITED',
          message: 'Too many attempts',
          status: 429,
        });
      }
      if (
        credentials.email === MOCK_AUTH_FIXTURES.email &&
        credentials.password === MOCK_AUTH_FIXTURES.password
      ) {
        return tokensFor(credentials.email);
      }
      throw new ApiClientError({
        category: 'authentication',
        code: 'INVALID_CREDENTIALS',
        message: 'Invalid credentials',
        status: 401,
      });
    },

    async register(data: RegisterRequest): Promise<RegisterResponse> {
      await delay();
      if (data.email === MOCK_AUTH_FIXTURES.existingEmail) {
        throw new ApiClientError({
          category: 'conflict',
          code: 'CONFLICT',
          message: 'Identity already exists',
          status: 409,
        });
      }
      return {
        identityId: 'mock-identity',
        email: data.email,
        status: 'ACTIVE',
      };
    },

    async logout(): Promise<void> {
      await delay(80);
    },

    async refresh(data: { refreshToken: string }): Promise<AuthenticationResponse> {
      await delay(80);
      if (data.refreshToken.startsWith('mock-refresh-')) {
        const email = data.refreshToken.slice('mock-refresh-'.length) || MOCK_AUTH_FIXTURES.email;
        return tokensFor(email);
      }
      throw new ApiClientError({
        category: 'authentication',
        code: 'UNAUTHENTICATED',
        message: 'Invalid refresh token',
        status: 401,
      });
    },

    async forgotPassword(): Promise<void> {
      await delay();
    },

    async resetPassword(): Promise<void> {
      await delay();
    },
  };
}
