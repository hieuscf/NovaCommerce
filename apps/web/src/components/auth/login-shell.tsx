import type { ReactNode } from 'react';
import { AuthSplitShell } from './auth-split-shell';

export function LoginShell({ children }: { children: ReactNode }) {
  return (
    <AuthSplitShell
      title={
        <>
          Welcome Back to
          <br />
          <span className="text-gradient-hero">NovaCommerce</span>
        </>
      }
      description="Your trusted e-commerce platform for a better shopping experience. Sign in to continue your journey."
    >
      {children}
    </AuthSplitShell>
  );
}
