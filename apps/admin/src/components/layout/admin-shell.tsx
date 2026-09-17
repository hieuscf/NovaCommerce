'use client';

import { Suspense } from 'react';
import { AdminSidebarPanel } from './admin-sidebar';
import { AdminTopbar } from './admin-topbar';

export function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background-secondary">
      <aside className="sticky top-0 hidden h-screen w-[260px] shrink-0 lg:block" aria-label="Sidebar">
        <Suspense fallback={null}>
          <AdminSidebarPanel />
        </Suspense>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <AdminTopbar />
        <main className="flex-1 p-4 lg:p-6">{children}</main>
        <footer className="flex flex-col gap-1 border-t border-border px-4 py-4 text-caption text-muted-foreground sm:flex-row sm:items-center sm:justify-between lg:px-6">
          <span>NovaCommerce Admin Panel</span>
          <span>© 2026 NovaCommerce. All rights reserved.</span>
        </footer>
      </div>
    </div>
  );
}
