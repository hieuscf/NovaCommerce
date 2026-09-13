import type { AuthenticationResponse, SessionReason, SessionSnapshot } from './types';

type SessionListener = () => void;

export interface AuthSession {
  getTokens(): AuthenticationResponse | null;
  setTokens(tokens: AuthenticationResponse): void;
  clearTokens(): void;
  isAuthenticated(): boolean;
  getAccessToken(): string | null;
  getSnapshot(): SessionSnapshot;
  subscribe(listener: SessionListener): () => void;
  bootstrap(): void;
  markExpired(): void;
  signOut(revoke?: (refreshToken: string) => Promise<void>): Promise<void>;
}

const LOADING_SNAPSHOT: SessionSnapshot = {
  status: 'loading',
  isAuthenticated: false,
  isSigningOut: false,
  reason: null,
};

/**
 * In-memory session storage.
 *
 * Tokens stay in application memory only. They are not written to
 * localStorage or sessionStorage. UI consumers must use getSnapshot()
 * or useSession() — never read refresh tokens in components.
 *
 * Production target: Gateway-issued httpOnly, Secure, SameSite cookies.
 * Until that exists, the first client snapshot is `loading` so protected
 * routes do not flash an unauthenticated state before memory is read.
 */
function createMemoryAuthSession(): AuthSession {
  let tokens: AuthenticationResponse | null = null;
  let resolved = false;
  let signingOut = false;
  let reason: SessionReason | null = null;
  let cachedSnapshot: SessionSnapshot = LOADING_SNAPSHOT;
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

  return {
    getTokens: () => tokens,
    setTokens: (value) => {
      tokens = value;
      resolved = true;
      signingOut = false;
      reason = null;
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
      if (!resolved) {
        queueMicrotask(() => {
          if (!resolved) {
            resolved = true;
            notify();
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
    markExpired: () => {
      settleUnauthenticated('session_expired');
    },
    signOut: async (revoke) => {
      const refreshToken = tokens?.refreshToken;
      signingOut = true;
      notify();
      try {
        if (refreshToken && revoke) {
          await revoke(refreshToken);
        }
      } catch {
        // Local UI state must recover even if Gateway logout is unavailable.
      } finally {
        settleUnauthenticated(null);
      }
    },
  };
}

export const authSession = createMemoryAuthSession();

export function signIn(tokens: AuthenticationResponse): void {
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

export function markSessionExpired(): void {
  authSession.markExpired();
}

/** Test helper — settles the in-memory session to a known unauthenticated state. */
export function resetAuthSession(): void {
  authSession.clearTokens();
}
