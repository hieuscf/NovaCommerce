import { describe, expect, it, vi } from 'vitest';
import { resetApiClient } from '@/lib/api/client';
import { createAuthClient } from '../client';
import { createMockAuthClient, MOCK_AUTH_FIXTURES } from '../mock-auth-client';

describe('createAuthClient', () => {
  it('selects the mock adapter only outside production when requested', async () => {
    const client = createAuthClient({
      NODE_ENV: 'development',
      NEXT_PUBLIC_AUTH_ADAPTER: 'mock',
    });
    const tokens = await client.login({
      email: MOCK_AUTH_FIXTURES.email,
      password: MOCK_AUTH_FIXTURES.password,
    });
    expect(tokens.accessToken.startsWith('mock-access')).toBe(true);
  });

  it('never selects the mock adapter in production', async () => {
    resetApiClient();
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        data: {
          accessToken: 'gateway-token',
          tokenType: 'Bearer',
          expiresIn: 900,
          refreshToken: 'gateway-refresh',
        },
        meta: {},
      }),
    });
    global.fetch = fetchImpl;

    const client = createAuthClient({
      NODE_ENV: 'production',
      NEXT_PUBLIC_AUTH_ADAPTER: 'mock',
    });
    const tokens = await client.login({
      email: MOCK_AUTH_FIXTURES.email,
      password: MOCK_AUTH_FIXTURES.password,
    });
    expect(tokens.accessToken).toBe('gateway-token');
    expect(fetchImpl).toHaveBeenCalled();
  });
});

describe('createMockAuthClient', () => {
  it('signs in only with the documented development fixture', async () => {
    const client = createMockAuthClient();
    const tokens = await client.login({
      email: MOCK_AUTH_FIXTURES.email,
      password: MOCK_AUTH_FIXTURES.password,
    });
    expect(tokens.tokenType).toBe('Bearer');
    expect(tokens.accessToken).toContain('mock-access');
  });

  it('rotates a mock refresh token', async () => {
    const client = createMockAuthClient();
    const tokens = await client.refresh({ refreshToken: 'mock-refresh-user@novacommerce.dev' });
    expect(tokens.accessToken).toContain('mock-access-user@novacommerce.dev');
  });

  it('rejects unknown credentials without logging secrets', async () => {
    const client = createMockAuthClient();
    await expect(
      client.login({ email: 'other@example.com', password: 'Password8' }),
    ).rejects.toMatchObject({ category: 'authentication' });
  });
});
