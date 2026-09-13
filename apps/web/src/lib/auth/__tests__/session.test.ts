import { describe, expect, it } from 'vitest';
import {
  authSession,
  getServerSessionSnapshot,
  getSession,
  markSessionExpired,
  resetAuthSession,
  signIn,
  signOut,
} from '../session';

describe('authSession', () => {
  it('hides tokens from the session snapshot used by UI', async () => {
    resetAuthSession();
    expect(getSession()).toMatchObject({
      status: 'unauthenticated',
      isAuthenticated: false,
    });
    expect(Object.keys(getSession())).not.toContain('refreshToken');

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
});
