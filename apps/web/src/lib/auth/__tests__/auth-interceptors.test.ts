import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiClientError } from '@novacommerce/frontend';
import { handleForbidden, handleUnauthorized, resetAuthInterceptors } from '../auth-interceptors';
import { resetAuthNavigate, setAuthNavigate } from '../auth-navigation';
import { authSession, resetAuthSession, resetAuthSessionToLoading, signIn } from '../session';

const expired = new ApiClientError({
  category: 'authentication',
  code: 'UNAUTHENTICATED',
  message: 'Expired',
  status: 401,
});

const forbidden = new ApiClientError({
  category: 'authorization',
  code: 'FORBIDDEN',
  message: 'No access',
  status: 403,
});

describe('auth interceptors', () => {
  const navigate = vi.fn();

  beforeEach(() => {
    navigate.mockClear();
    resetAuthInterceptors();
    resetAuthSession();
    setAuthNavigate(navigate);
    global.fetch = vi.fn();
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { pathname: '/account', search: '', assign: vi.fn() },
    });
  });

  afterEach(() => {
    resetAuthNavigate();
  });

  it('does not expire the session for login 401 responses', async () => {
    signIn({
      accessToken: 'access-token',
      tokenType: 'Bearer',
      expiresIn: 900,
    });

    await expect(
      handleUnauthorized(expired, { method: 'POST', path: '/auth/login', retried: false }),
    ).resolves.toBe('throw');
    expect(navigate).not.toHaveBeenCalled();
    expect(authSession.isAuthenticated()).toBe(true);
  });

  it('does not treat an anonymous bootstrap 401 as session-expired', async () => {
    resetAuthSessionToLoading();
    await expect(
      handleUnauthorized(expired, { method: 'GET', path: '/products', retried: false }),
    ).resolves.toBe('throw');
    expect(navigate).not.toHaveBeenCalled();
  });

  it('refreshes once and retries after an authenticated 401', async () => {
    signIn({
      accessToken: 'stale-access',
      tokenType: 'Bearer',
      expiresIn: 900,
    });
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        data: { accessToken: 'next-access', tokenType: 'Bearer', expiresIn: 900 },
      }),
    } as Response);

    await expect(
      handleUnauthorized(expired, { method: 'GET', path: '/orders', retried: false }),
    ).resolves.toBe('retry');
    expect(navigate).not.toHaveBeenCalled();
    expect(authSession.getAccessToken()).toBe('next-access');
  });

  it('expires the session once for concurrent authenticated 401s', async () => {
    signIn({
      accessToken: 'stale-access',
      tokenType: 'Bearer',
      expiresIn: 900,
    });
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => ({
        error: { code: 'UNAUTHENTICATED', message: 'No session', requestId: 'req-1' },
      }),
    } as Response);

    const [first, second] = await Promise.all([
      handleUnauthorized(expired, { method: 'GET', path: '/orders', retried: false }),
      handleUnauthorized(expired, { method: 'GET', path: '/orders', retried: false }),
    ]);

    expect(first).toBe('throw');
    expect(second).toBe('throw');
    expect(navigate).toHaveBeenCalledTimes(1);
    expect(navigate).toHaveBeenCalledWith('/login?returnUrl=%2Faccount&reason=session-expired');
    expect(authSession.isAuthenticated()).toBe(false);
  });

  it('preserves a safe return URL including query parameters', async () => {
    signIn({
      accessToken: 'stale-access',
      tokenType: 'Bearer',
      expiresIn: 900,
    });
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
    } as Response);
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { pathname: '/orders', search: '?status=pending', assign: vi.fn() },
    });

    await handleUnauthorized(expired, { method: 'GET', path: '/orders', retried: false });

    expect(navigate).toHaveBeenCalledWith(
      '/login?returnUrl=%2Forders%3Fstatus%3Dpending&reason=session-expired',
    );
  });

  it('does not redirect 403 from auth form endpoints', () => {
    handleForbidden(forbidden, { method: 'POST', path: '/auth/login', retried: false });
    expect(navigate).not.toHaveBeenCalled();
  });

  it('redirects 403 to /unauthorized without clearing the session or going to login', () => {
    signIn({
      accessToken: 'access-token',
      tokenType: 'Bearer',
      expiresIn: 900,
    });

    handleForbidden(forbidden, { method: 'GET', path: '/admin', retried: false });
    handleForbidden(forbidden, { method: 'GET', path: '/admin', retried: false });

    expect(navigate).toHaveBeenCalledTimes(1);
    expect(navigate).toHaveBeenCalledWith('/unauthorized');
    expect(authSession.isAuthenticated()).toBe(true);
  });
});
