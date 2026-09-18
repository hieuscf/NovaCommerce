'use client';

import { useSyncExternalStore } from 'react';
import { adminSession, getAdminSession } from '@/lib/auth/session';
import type { AdminSessionSnapshot } from '@/lib/auth/session';

/** Stable server snapshot — must be referentially equal across calls. */
const SERVER_SNAPSHOT: AdminSessionSnapshot = Object.freeze({ isAuthenticated: false });

function subscribe(listener: () => void): () => void {
  return adminSession.subscribe(listener);
}

function getServerSnapshot(): AdminSessionSnapshot {
  return SERVER_SNAPSHOT;
}

export function useAdminSession(): AdminSessionSnapshot {
  return useSyncExternalStore(subscribe, getAdminSession, getServerSnapshot);
}
