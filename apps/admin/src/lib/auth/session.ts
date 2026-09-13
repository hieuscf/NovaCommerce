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
    getSnapshot: () => ({ isAuthenticated: accessToken !== null }),
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
