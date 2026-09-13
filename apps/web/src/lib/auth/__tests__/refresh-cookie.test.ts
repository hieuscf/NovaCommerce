import { describe, expect, it } from 'vitest';
import {
  REFRESH_COOKIE_MAX_AGE_SECONDS,
  buildRefreshCookieOptions,
  isDevelopmentMockRefreshToken,
  isValidRefreshTokenShape,
} from '../refresh-cookie';

describe('refresh cookie helpers', () => {
  it('builds an httpOnly session cookie when Remember Me is off', () => {
    expect(buildRefreshCookieOptions(false, { NODE_ENV: 'development' })).toEqual({
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      path: '/',
    });
  });

  it('caps Remember Me at the Identity refresh TTL and secures production cookies', () => {
    expect(buildRefreshCookieOptions(true, { NODE_ENV: 'production' })).toEqual({
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
      maxAge: REFRESH_COOKIE_MAX_AGE_SECONDS,
    });
  });

  it('never treats mock refresh tokens as valid in production', () => {
    expect(isDevelopmentMockRefreshToken('mock-refresh-user', { NODE_ENV: 'production' })).toBe(
      false,
    );
    expect(isDevelopmentMockRefreshToken('mock-refresh-user', { NODE_ENV: 'development' })).toBe(
      true,
    );
    expect(isValidRefreshTokenShape('short')).toBe(false);
    expect(isValidRefreshTokenShape('refresh-token-value')).toBe(true);
  });
});
