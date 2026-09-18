import { SellerDashboardAdsPromo, SellerDashboardFeatures } from './seller-dashboard-features';
import { SellerDashboardKpiCards } from './seller-dashboard-kpi-cards';
import { SellerDashboardRecentOrders } from './seller-dashboard-recent-orders';
import { SellerDashboardRevenueChart } from './seller-dashboard-revenue-chart';
import { SellerDashboardSidebar } from './seller-dashboard-sidebar';
import { SellerDashboardTopbar } from './seller-dashboard-topbar';
import { SellerDashboardWelcome } from './seller-dashboard-welcome';

export function SellerDashboardPage() {
  return (
    <div className="flex min-h-svh flex-col bg-[#F7F9FC] text-foreground">
      <SellerDashboardTopbar />
      <div className="flex min-h-0 flex-1">
        <div className="hidden lg:block">
          <SellerDashboardSidebar />
        </div>
        <main className="min-w-0 flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl space-y-6">
            <SellerDashboardWelcome />
            <SellerDashboardKpiCards />
            <div className="grid gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
              <SellerDashboardRevenueChart />
              <SellerDashboardRecentOrders />
            </div>
            <div className="grid gap-4 xl:grid-cols-[minmax(0,1.55fr)_minmax(260px,0.7fr)]">
              <SellerDashboardFeatures />
              <SellerDashboardAdsPromo />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
