const CUSTOMER_PROTECTED_PREFIXES = ['/account', '/orders', '/checkout'] as const;

export function isCustomerProtectedPath(pathname: string): boolean {
  return CUSTOMER_PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}
