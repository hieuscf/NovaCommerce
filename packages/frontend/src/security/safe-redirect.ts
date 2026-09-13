/**
 * Allows only same-origin relative paths. Rejects protocol-relative and external URLs.
 */
export function isSafeRedirectPath(value: string | null | undefined): value is string {
  if (!value) {
    return false;
  }
  if (!value.startsWith('/')) {
    return false;
  }
  if (value.startsWith('//') || value.startsWith('/\\')) {
    return false;
  }
  if (value.includes('://')) {
    return false;
  }
  return true;
}

export function sanitizeRedirect(value: string | null | undefined, fallback = '/'): string {
  return isSafeRedirectPath(value) ? value : fallback;
}
