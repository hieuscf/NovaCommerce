import { resetAuthGuards } from './auth-guards';
import type { AccessSession, AuthenticationResponse, SessionReason, SessionSnapshot } from './types';

type SessionListener = () => void;
type SessionRestoreLoader = () => Promise<AccessSession | null>;

export interface AuthSession {
  getTokens(): AccessSession | null;
  setTokens(tokens: AccessSession | AuthenticationResponse): void;
  clearTokens(): void;
  isAuthenticated(): boolean;
  getAccessToken(): string | null;
  getSnapshot(): SessionSnapshot;
  subscribe(listener: SessionListener): () => void;
  bootstrap(): void;
  restore(loader: SessionRestoreLoader): Promise<SessionSnapshot>;
  markExpired(): void;
  signOut(revoke?: (refreshToken: string) => Promise<void>): Promise<void>;
  resetToLoading(): void;
}

const LOADING_SNAPSHOT: SessionSnapshot = {
  status: 'loading',
  isAuthenticated: false,
  isSigningOut: false,
  reason: null,
};

function toAccessSession(tokens: AccessSession | AuthenticationResponse): AccessSession {
  return {
    accessToken: tokens.accessToken,
    tokenType: tokens.tokenType,
    expiresIn: tokens.expiresIn,
  };
}

/**
 * In-memory access-token store.
 *
 * Access tokens stay in application memory only. Refresh tokens are persisted
 * by the Next.js `/api/auth/session` BFF as an httpOnly cookie — never
 * localStorage / sessionStorage, and never exposed on the session snapshot.
 *
 * Production target remains Gateway-issued httpOnly cookies. This BFF is the
 * current adapter around `POST /auth/refresh`.
 */
function createMemoryAuthSession(): AuthSession {
  let tokens: AccessSession | null = null;
  let resolved = false;
  let signingOut = false;
  let reason: SessionReason | null = null;
  let cachedSnapshot: SessionSnapshot = LOADING_SNAPSHOT;
  let restoreInFlight: Promise<SessionSnapshot> | null = null;
  const listeners = new Set<SessionListener>();

  const notify = () => {
    for (const listener of listeners) {
      listener();
    }
  };

  const computeSnapshot = (): SessionSnapshot => {
    if (!resolved) {
      return signingOut || reason
        ? { status: 'loading', isAuthenticated: false, isSigningOut: signingOut, reason }
        : LOADING_SNAPSHOT;
    }
    if (tokens) {
      return {
        status: 'authenticated',
        isAuthenticated: true,
        isSigningOut: signingOut,
        reason: null,
      };
    }
    return {
      status: 'unauthenticated',
      isAuthenticated: false,
      isSigningOut: signingOut,
      reason,
    };
  };

  const snapshot = (): SessionSnapshot => {
    const next = computeSnapshot();
    if (
      cachedSnapshot.status === next.status &&
      cachedSnapshot.isAuthenticated === next.isAuthenticated &&
      cachedSnapshot.isSigningOut === next.isSigningOut &&
      cachedSnapshot.reason === next.reason
    ) {
      return cachedSnapshot;
    }
    cachedSnapshot = next;
    return cachedSnapshot;
  };

  const settleUnauthenticated = (nextReason: SessionReason | null = null) => {
    tokens = null;
    resolved = true;
    signingOut = false;
    reason = nextReason;
    notify();
  };

  const session: AuthSession = {
    getTokens: () => tokens,
    setTokens: (value) => {
      tokens = toAccessSession(value);
      resolved = true;
      signingOut = false;
      reason = null;
      resetAuthGuards();
      notify();
    },
    clearTokens: () => {
      settleUnauthenticated(null);
    },
    isAuthenticated: () => tokens !== null,
    getAccessToken: () => tokens?.accessToken ?? null,
    getSnapshot: snapshot,
    subscribe: (listener) => {
      listeners.add(listener);
      if (!resolved && !restoreInFlight) {
        queueMicrotask(() => {
          if (!resolved) {
            void import('./session-persistence').then(({ readPersistedSession }) => {
              void session.restore(readPersistedSession);
            });
          }
        });
      }
      return () => {
        listeners.delete(listener);
      };
    },
    bootstrap: () => {
      if (!resolved) {
        resolved = true;
        notify();
      }
    },
    restore: (loader) => {
      if (resolved && tokens) {
        return Promise.resolve(snapshot());
      }
      if (restoreInFlight) {
        return restoreInFlight;
      }
      restoreInFlight = (async () => {
        try {
          const restored = await loader();
          if (restored) {
            tokens = toAccessSession(restored);
            resolved = true;
            signingOut = false;
            reason = null;
            resetAuthGuards();
            notify();
          } else {
            settleUnauthenticated(null);
          }
        } catch {
          settleUnauthenticated(null);
        } finally {
          restoreInFlight = null;
        }
        return snapshot();
      })();
      return restoreInFlight;
    },
    markExpired: () => {
      settleUnauthenticated('session_expired');
    },
    signOut: async (revoke) => {
      signingOut = true;
      notify();
      try {
        if (revoke) {
          await revoke('');
        }
      } catch {
        // Local UI state must recover even if Gateway logout is unavailable.
      } finally {
        settleUnauthenticated(null);
      }
    },
    resetToLoading: () => {
      tokens = null;
      resolved = false;
      signingOut = false;
      reason = null;
      restoreInFlight = null;
      cachedSnapshot = LOADING_SNAPSHOT;
      notify();
    },
  };

  return session;
}

export const authSession = createMemoryAuthSession();

export function signIn(tokens: AccessSession | AuthenticationResponse): void {
  authSession.setTokens(tokens);
}

export function signOut(revoke?: (refreshToken: string) => Promise<void>): Promise<void> {
  return authSession.signOut(revoke);
}

export function getSession(): SessionSnapshot {
  return authSession.getSnapshot();
}

export function getServerSessionSnapshot(): SessionSnapshot {
  return LOADING_SNAPSHOT;
}

export function bootstrapSession(): void {
  authSession.bootstrap();
}

export async function restoreSession(): Promise<SessionSnapshot> {
  const { readPersistedSession } = await import('./session-persistence');
  return authSession.restore(readPersistedSession);
}

export function markSessionExpired(): void {
  authSession.markExpired();
}

/** Test helper — settles the in-memory session to a known unauthenticated state. */
export function resetAuthSession(): void {
  authSession.clearTokens();
}

/** Test helper — returns the singleton to an unresolved loading snapshot. */
export function resetAuthSessionToLoading(): void {
  authSession.resetToLoading();
}
