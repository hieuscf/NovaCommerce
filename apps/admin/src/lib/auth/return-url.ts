import { sanitizeRedirect } from '@novacommerce/frontend';

export type AuthReturnParams = {
  get(name: string): string | null;
};

/**
 * Accepts `returnUrl` (preferred) or legacy `redirect`.
 * Sanitized to same-origin relative paths only.
 */
export function getSafeAuthReturnUrl(searchParams: AuthReturnParams, fallback = '/'): string {
  return sanitizeRedirect(searchParams.get('returnUrl') ?? searchParams.get('redirect'), fallback);
}

export function buildLoginHref(
  returnUrl?: string,
  reason?: 'session-expired' | 'session-required',
): string {
  const params = new URLSearchParams();
  const safeReturn = returnUrl ? sanitizeRedirect(returnUrl) : '/';
  if (safeReturn !== '/') {
    params.set('returnUrl', safeReturn);
  }
  if (reason) {
    params.set('reason', reason);
  }
  const query = params.toString();
  return query ? `/login?${query}` : '/login';
}
