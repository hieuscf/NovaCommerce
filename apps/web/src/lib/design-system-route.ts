/**
 * The design-system showcase is an internal reference surface, not a customer
 * page. It is always available outside production; in production it stays off
 * unless explicitly opted in with `NEXT_PUBLIC_ENABLE_DESIGN_SYSTEM=true`
 * (useful for sharing a deployed preview with designers).
 */
export function isDesignSystemRouteEnabled(
  env: { NODE_ENV?: string; NEXT_PUBLIC_ENABLE_DESIGN_SYSTEM?: string } = process.env,
): boolean {
  if (env.NODE_ENV !== 'production') {
    return true;
  }

  return env.NEXT_PUBLIC_ENABLE_DESIGN_SYSTEM === 'true';
}
