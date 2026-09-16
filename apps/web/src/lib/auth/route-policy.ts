const CUSTOMER_PROTECTED_PREFIXES = ['/account', '/orders', '/checkout', '/cart'] as const;

const AUTH_SURFACE_PATHS = [
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/verify-email',
  '/unauthorized',
] as const;

/**
 * UX-only customer protected prefixes. Gateway / Identity remain the
 * authorization boundary — this helper must not be treated as security.
 */
export function isCustomerProtectedPath(pathname: string): boolean {
  return CUSTOMER_PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export const isProtectedRoute = isCustomerProtectedPath;

export function isAuthSurfacePath(pathname: string): boolean {
  return AUTH_SURFACE_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
}
