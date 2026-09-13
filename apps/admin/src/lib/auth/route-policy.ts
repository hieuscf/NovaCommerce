const PUBLIC_ADMIN_PATHS = ['/login'] as const;

export function isAdminPublicPath(pathname: string): boolean {
  return PUBLIC_ADMIN_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

export function isAdminProtectedPath(pathname: string): boolean {
  return !isAdminPublicPath(pathname);
}
