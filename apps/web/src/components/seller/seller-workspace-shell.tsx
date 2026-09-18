import type { SellerWorkspaceSection } from '@/lib/url/seller-workspace-query';
import { cn } from '@/lib/utils';
import { SellerDashboardSidebar } from './seller-dashboard-sidebar';
import { SellerDashboardTopbar } from './seller-dashboard-topbar';

export function SellerWorkspaceShell({
  section,
  children,
  contentClassName,
  mainClassName,
}: {
  section: SellerWorkspaceSection;
  children: React.ReactNode;
  contentClassName?: string;
  mainClassName?: string;
}) {
  return (
    <div className="flex min-h-svh flex-col bg-[#F7F9FC] text-foreground">
      <SellerDashboardTopbar section={section} />
      <div className="flex min-h-0 flex-1">
        <div className="hidden lg:block">
          <SellerDashboardSidebar section={section} />
        </div>
        <main
          className={cn(
            'min-w-0 flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8',
            mainClassName,
          )}
        >
          <div className={contentClassName ?? 'mx-auto max-w-7xl space-y-6'}>{children}</div>
        </main>
      </div>
    </div>
  );
}
