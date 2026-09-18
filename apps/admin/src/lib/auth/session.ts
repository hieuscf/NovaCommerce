type SessionListener = () => void;

export interface AdminSessionSnapshot {
  readonly isAuthenticated: boolean;
}

export interface AdminSession {
  getAccessToken(): string | null;
  setAccessToken(token: string | null): void;
  getSnapshot(): AdminSessionSnapshot;
  subscribe(listener: SessionListener): () => void;
}

/** Cached snapshots so useSyncExternalStore sees stable Object.is equality. */
const UNAUTHENTICATED_SNAPSHOT: AdminSessionSnapshot = Object.freeze({
  isAuthenticated: false,
});
const AUTHENTICATED_SNAPSHOT: AdminSessionSnapshot = Object.freeze({
  isAuthenticated: true,
});

/**
 * Admin session is isolated from the customer web session.
 * Tokens stay in memory until the Gateway issues httpOnly cookies.
 */
function createMemoryAdminSession(): AdminSession {
  let accessToken: string | null = null;
  const listeners = new Set<SessionListener>();

  const notify = () => {
    for (const listener of listeners) {
      listener();
    }
  };

  return {
    getAccessToken: () => accessToken,
    setAccessToken: (token) => {
      accessToken = token;
      notify();
    },
    getSnapshot: () =>
      accessToken !== null ? AUTHENTICATED_SNAPSHOT : UNAUTHENTICATED_SNAPSHOT,
    subscribe: (listener) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}

export const adminSession = createMemoryAdminSession();

export function getAdminSession(): AdminSessionSnapshot {
  return adminSession.getSnapshot();
}

export function signIn(accessToken: string): void {
  adminSession.setAccessToken(accessToken);
}

export function signOut(): void {
  adminSession.setAccessToken(null);
}
