import type { Metadata } from 'next';
import { UnauthorizedState } from '@/components/auth/unauthorized-state';

export const metadata: Metadata = {
  title: 'Access restricted',
  robots: { index: false, follow: false },
};

export default function UnauthorizedPage() {
  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-gradient-ambient" aria-hidden="true" />
      <div className="relative flex min-h-[70vh] items-center justify-center px-6 py-16">
        <div className="w-full max-w-lg">
          <UnauthorizedState />
        </div>
      </div>
    </div>
  );
}
