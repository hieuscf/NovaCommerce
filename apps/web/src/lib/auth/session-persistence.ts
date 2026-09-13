import { reportFrontendEvent } from '@novacommerce/frontend';
import type { AccessSession, AuthenticationResponse } from './types';

interface PersistSessionOptions {
  readonly rememberMe?: boolean;
}

function isAccessSession(value: unknown): value is AccessSession {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const record = value as Record<string, unknown>;
  return (
    typeof record.accessToken === 'string' &&
    record.tokenType === 'Bearer' &&
    typeof record.expiresIn === 'number'
  );
}

/**
 * Same-origin BFF calls. Must not go through `getApiClient()` — that client
 * prefixes `/api/v1` and would recurse into 401 handling.
 */
export async function persistSession(
  tokens: AuthenticationResponse,
  options: PersistSessionOptions = {},
): Promise<void> {
  try {
    const response = await fetch('/api/auth/session', {
      method: 'POST',
      credentials: 'include',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        refreshToken: tokens.refreshToken,
        rememberMe: options.rememberMe === true,
      }),
    });
    if (!response.ok) {
      reportFrontendEvent({ level: 'warn', event: 'auth.session.persist_failed' });
    }
  } catch {
    reportFrontendEvent({ level: 'warn', event: 'auth.session.persist_failed' });
  }
}

export async function readPersistedSession(): Promise<AccessSession | null> {
  try {
    const response = await fetch('/api/auth/session', {
      method: 'GET',
      credentials: 'include',
      headers: { Accept: 'application/json' },
    });
    if (!response.ok) {
      return null;
    }
    const body: unknown = await response.json();
    if (typeof body !== 'object' || body === null || !('data' in body)) {
      return null;
    }
    return isAccessSession(body.data) ? body.data : null;
  } catch {
    return null;
  }
}

export async function clearPersistedSession(): Promise<void> {
  try {
    await fetch('/api/auth/session', {
      method: 'DELETE',
      credentials: 'include',
      headers: { Accept: 'application/json' },
    });
  } catch {
    reportFrontendEvent({ level: 'warn', event: 'auth.session.clear_failed' });
  }
}
