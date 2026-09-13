import type { ApiClientError, ApiErrorHandlerContext, UnauthorizedRecovery } from '@novacommerce/frontend';
import { shouldIgnoreUnauthorizedRecovery } from './auth-endpoints';
import {
  hasHandledForbiddenRedirect,
  hasHandledSessionExpiry,
  markForbiddenRedirectHandled,
  markSessionExpiryHandled,
  resetAuthGuards,
} from './auth-guards';
import { redirectToLogin, redirectToUnauthorized } from './auth-navigation';
import { authSession, markSessionExpired, signIn } from './session';
import { readPersistedSession } from './session-persistence';

let refreshInFlight: Promise<boolean> | null = null;

export function resetAuthInterceptors(): void {
  refreshInFlight = null;
  resetAuthGuards();
}

async function refreshAccessSession(): Promise<boolean> {
  if (refreshInFlight) {
    return refreshInFlight;
  }

  refreshInFlight = (async () => {
    const restored = await readPersistedSession();
    if (!restored) {
      return false;
    }
    signIn(restored);
    return true;
  })().finally(() => {
    refreshInFlight = null;
  });

  return refreshInFlight;
}

function expireAuthenticatedSession(): void {
  if (hasHandledSessionExpiry() || !markSessionExpiryHandled()) {
    return;
  }
  markSessionExpired();
  redirectToLogin('session-expired');
}

export async function handleUnauthorized(
  _error: ApiClientError,
  context: ApiErrorHandlerContext,
): Promise<UnauthorizedRecovery> {
  if (shouldIgnoreUnauthorizedRecovery(context.path)) {
    return 'throw';
  }

  if (!authSession.isAuthenticated() && authSession.getSnapshot().reason !== 'session_expired') {
    return 'throw';
  }

  if (context.retried) {
    expireAuthenticatedSession();
    return 'throw';
  }

  const refreshed = await refreshAccessSession();
  if (refreshed) {
    return 'retry';
  }

  expireAuthenticatedSession();
  return 'throw';
}

export function handleForbidden(_error: ApiClientError, context: ApiErrorHandlerContext): void {
  if (shouldIgnoreUnauthorizedRecovery(context.path)) {
    return;
  }
  if (hasHandledForbiddenRedirect() || !markForbiddenRedirectHandled()) {
    return;
  }
  redirectToUnauthorized();
}
