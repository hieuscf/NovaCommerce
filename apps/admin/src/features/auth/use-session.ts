'use client';

import { useSyncExternalStore } from 'react';
import { adminSession, getAdminSession } from '@/lib/auth/session';
import type { AdminSessionSnapshot } from '@/lib/auth/session';

function subscribe(listener: () => void): () => void {
  return adminSession.subscribe(listener);
}

export function useAdminSession(): AdminSessionSnapshot {
  return useSyncExternalStore(subscribe, getAdminSession, getAdminSession);
}
