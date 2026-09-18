import { SellerDashboardAdsPromo, SellerDashboardFeatures } from './seller-dashboard-features';
import { SellerDashboardKpiCards } from './seller-dashboard-kpi-cards';
import { SellerDashboardRecentOrders } from './seller-dashboard-recent-orders';
import { SellerDashboardRevenueChart } from './seller-dashboard-revenue-chart';
import { SellerDashboardWelcome } from './seller-dashboard-welcome';
import { SellerWorkspaceShell } from './seller-workspace-shell';

export function SellerDashboardPage() {
  return (
    <SellerWorkspaceShell section="home">
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
    </SellerWorkspaceShell>
  );
}
