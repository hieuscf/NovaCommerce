'use client';

import { useSyncExternalStore } from 'react';
import {
  authSession,
  getServerSessionSnapshot,
  getSession,
  signOut as signOutSession,
} from '@/lib/auth/session';
import type { SessionSnapshot } from '@/lib/auth/types';

function subscribe(listener: () => void): () => void {
  return authSession.subscribe(listener);
}

async function revokeAndSignOut(): Promise<void> {
  const { authClient } = await import('@/lib/auth/client');
  const { clearPersistedSession } = await import('@/lib/auth/session-persistence');
  await signOutSession(() => authClient.logout());
  await clearPersistedSession();
}

export function useSession(): SessionSnapshot & { signOut: () => Promise<void> } {
  const snapshot = useSyncExternalStore(subscribe, getSession, getServerSessionSnapshot);
  return {
    ...snapshot,
    signOut: revokeAndSignOut,
  };
}
