'use client';

import { useEffect } from 'react';
import { restoreSession } from '@/lib/auth/session';

export function SessionBootstrap() {
  useEffect(() => {
    void restoreSession();
  }, []);

  return null;
}
