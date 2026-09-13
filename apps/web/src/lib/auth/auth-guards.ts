let sessionExpiryHandled = false;
let forbiddenRedirectHandled = false;

export function hasHandledSessionExpiry(): boolean {
  return sessionExpiryHandled;
}

export function markSessionExpiryHandled(): boolean {
  if (sessionExpiryHandled) {
    return false;
  }
  sessionExpiryHandled = true;
  return true;
}

export function hasHandledForbiddenRedirect(): boolean {
  return forbiddenRedirectHandled;
}

export function markForbiddenRedirectHandled(): boolean {
  if (forbiddenRedirectHandled) {
    return false;
  }
  forbiddenRedirectHandled = true;
  return true;
}

export function resetAuthGuards(): void {
  sessionExpiryHandled = false;
  forbiddenRedirectHandled = false;
}
