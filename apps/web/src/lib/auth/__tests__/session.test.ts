import { describe, expect, it, vi } from 'vitest';
import {
  authSession,
  getServerSessionSnapshot,
  getSession,
  markSessionExpired,
  resetAuthSession,
  resetAuthSessionToLoading,
  restoreSession,
  signIn,
  signOut,
} from '../session';

describe('authSession', () => {
  it('starts unresolved as loading and hides tokens from the UI snapshot', () => {
    resetAuthSessionToLoading();
    expect(getSession()).toEqual({
      status: 'loading',
      isAuthenticated: false,
      isSigningOut: false,
      reason: null,
    });
    expect(Object.keys(getSession())).not.toContain('refreshToken');
    expect(Object.keys(getSession())).not.toContain('accessToken');
  });

  it('stores only the access session after sign-in', async () => {
    resetAuthSession();
    signIn({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      tokenType: 'Bearer',
      expiresIn: 900,
    });

    expect(getSession()).toMatchObject({
      status: 'authenticated',
      isAuthenticated: true,
    });
    expect(authSession.getAccessToken()).toBe('access-token');
    expect(authSession.getTokens()).toEqual({
      accessToken: 'access-token',
      tokenType: 'Bearer',
      expiresIn: 900,
    });
    expect(Object.keys(getSession())).not.toContain('refreshToken');

    await signOut();
    expect(getSession()).toMatchObject({
      status: 'unauthenticated',
      isAuthenticated: false,
      isSigningOut: false,
    });
  });

  it('exposes a loading server snapshot to avoid auth flicker', () => {
    expect(getServerSessionSnapshot()).toEqual({
      status: 'loading',
      isAuthenticated: false,
      isSigningOut: false,
      reason: null,
    });
  });

  it('marks an expired session without exposing tokens', () => {
    signIn({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      tokenType: 'Bearer',
      expiresIn: 900,
    });

    markSessionExpired();

    expect(getSession()).toMatchObject({
      status: 'unauthenticated',
      isAuthenticated: false,
      reason: 'session_expired',
    });
    expect(authSession.getAccessToken()).toBeNull();
  });

  it('clears local session even when logout revocation fails', async () => {
    signIn({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      tokenType: 'Bearer',
      expiresIn: 900,
    });

    await signOut(async () => {
      throw new Error('gateway unavailable');
    });

    expect(getSession().isAuthenticated).toBe(false);
    expect(authSession.getAccessToken()).toBeNull();
  });

  it('restores an authenticated session from the persistence loader', async () => {
    resetAuthSessionToLoading();
    const snapshot = await authSession.restore(async () => ({
      accessToken: 'restored-access',
      tokenType: 'Bearer',
      expiresIn: 900,
    }));

    expect(snapshot).toMatchObject({
      status: 'authenticated',
      isAuthenticated: true,
    });
    expect(authSession.getAccessToken()).toBe('restored-access');
  });

  it('settles unauthenticated when restore finds no session', async () => {
    resetAuthSessionToLoading();
    const snapshot = await authSession.restore(async () => null);

    expect(snapshot).toMatchObject({
      status: 'unauthenticated',
      isAuthenticated: false,
      reason: null,
    });
  });

  it('does not treat a failed bootstrap restore as session-expired', async () => {
    resetAuthSessionToLoading();
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => ({
        error: { code: 'UNAUTHENTICATED', message: 'No session', requestId: 'req-1' },
      }),
    } as Response);

    const snapshot = await restoreSession();
    expect(snapshot).toMatchObject({
      status: 'unauthenticated',
      reason: null,
    });
  });
});
