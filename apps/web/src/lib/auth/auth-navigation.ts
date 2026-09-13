import { buildLoginHref } from './return-url';
import { isAuthSurfacePath } from './route-policy';

export type AuthNavigate = (href: string) => void;

function defaultNavigate(href: string): void {
  if (typeof window === 'undefined') {
    return;
  }
  window.location.assign(href);
}

let navigate: AuthNavigate = defaultNavigate;

export function setAuthNavigate(next: AuthNavigate | null): void {
  navigate = next ?? defaultNavigate;
}

export function resetAuthNavigate(): void {
  navigate = defaultNavigate;
}

function currentPathname(): string {
  if (typeof window === 'undefined') {
    return '/';
  }
  return window.location.pathname;
}

function currentPathWithSearch(): string {
  if (typeof window === 'undefined') {
    return '/';
  }
  return `${window.location.pathname}${window.location.search}`;
}

export function redirectToLogin(reason?: 'session-expired' | 'session-required'): void {
  const pathname = currentPathname();
  if (isAuthSurfacePath(pathname)) {
    return;
  }
  navigate(buildLoginHref(currentPathWithSearch(), reason));
}

export function redirectToUnauthorized(): void {
  if (currentPathname() === '/unauthorized') {
    return;
  }
  navigate('/unauthorized');
}
