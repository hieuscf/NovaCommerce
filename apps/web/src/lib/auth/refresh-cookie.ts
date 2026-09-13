/**
 * Cookie option helpers for the Next.js session BFF.
 *
 * The refresh token is stored in an httpOnly cookie so the browser JS bundle
 * never reads it. Gateway still owns token validity (`JWT_REFRESH_TOKEN_TTL`,
 * default 7d). Remember Me only changes browser cookie lifetime.
 */

export const REFRESH_COOKIE_NAME = 'nc_refresh';
export const REFRESH_PERSIST_COOKIE_NAME = 'nc_refresh_persist';

/** Matches Identity `JWT_REFRESH_TOKEN_TTL` default (`7d`). */
export const REFRESH_COOKIE_MAX_AGE_SECONDS = 7 * 24 * 60 * 60;

export const MOCK_REFRESH_PREFIX = 'mock-refresh-';

export interface RefreshCookieOptions {
  readonly httpOnly: true;
  readonly secure: boolean;
  readonly sameSite: 'lax';
  readonly path: '/';
  readonly maxAge?: number;
}

export function shouldUseSecureCookies(
  env: { NODE_ENV?: string } = process.env,
): boolean {
  return env.NODE_ENV === 'production';
}

export function buildRefreshCookieOptions(
  rememberMe: boolean,
  env: { NODE_ENV?: string } = process.env,
): RefreshCookieOptions {
  return {
    httpOnly: true,
    secure: shouldUseSecureCookies(env),
    sameSite: 'lax',
    path: '/',
    ...(rememberMe ? { maxAge: REFRESH_COOKIE_MAX_AGE_SECONDS } : {}),
  };
}

export function isDevelopmentMockRefreshToken(
  token: string,
  env: { NODE_ENV?: string } = process.env,
): boolean {
  return env.NODE_ENV !== 'production' && token.startsWith(MOCK_REFRESH_PREFIX);
}

export function isValidRefreshTokenShape(token: unknown): token is string {
  return typeof token === 'string' && token.length >= 8 && token.length <= 2048;
}
