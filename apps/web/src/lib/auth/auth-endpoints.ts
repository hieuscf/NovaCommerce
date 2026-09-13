const SESSION_BOOTSTRAP_PATHS = ['/auth/login', '/auth/register', '/auth/refresh', '/auth/logout'];

const AUTH_FORM_PATHS = [
  '/auth/login',
  '/auth/register',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/auth/oauth/callback',
];

function normalizeApiPath(path: string): string {
  const pathname = path.split('?')[0] ?? path;
  const prefix = '/api/v1';
  return pathname.startsWith(prefix) ? pathname.slice(prefix.length) || '/' : pathname;
}

export function isAuthSessionEndpoint(path: string): boolean {
  const normalized = normalizeApiPath(path);
  return SESSION_BOOTSTRAP_PATHS.some(
    (candidate) => normalized === candidate || normalized.startsWith(`${candidate}/`),
  );
}

export function isAuthFormEndpoint(path: string): boolean {
  const normalized = normalizeApiPath(path);
  return AUTH_FORM_PATHS.some(
    (candidate) => normalized === candidate || normalized.startsWith(`${candidate}/`),
  );
}

export function shouldIgnoreUnauthorizedRecovery(path: string): boolean {
  return isAuthSessionEndpoint(path) || isAuthFormEndpoint(path);
}
