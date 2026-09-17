import { CalendarDays } from 'lucide-react';
import { Button } from '@novacommerce/ui/components/button';
import { DashboardKpiCards } from '@/components/dashboard/dashboard-kpi-cards';
import { GrowBusinessBanner } from '@/components/dashboard/grow-business-banner';
import { OrderStatusChart } from '@/components/dashboard/order-status-chart';
import { QuickActions } from '@/components/dashboard/quick-actions';
import { RecentOrdersTable } from '@/components/dashboard/recent-orders-table';
import { SalesByCategory } from '@/components/dashboard/sales-by-category';
import { SalesOverviewChart } from '@/components/dashboard/sales-overview-chart';
import { TopSellingProducts } from '@/components/dashboard/top-selling-products';
import { dashboardGreeting } from '@/lib/mock-data/dashboard';

export function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {dashboardGreeting.title}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">{dashboardGreeting.subtitle}</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="w-fit gap-2 rounded-xl"
          aria-label={`Date range ${dashboardGreeting.dateRange}`}
        >
          <CalendarDays className="size-4 text-muted-foreground" aria-hidden="true" />
          {dashboardGreeting.dateRange}
        </Button>
      </div>

      <DashboardKpiCards />

      <div className="grid gap-4 xl:grid-cols-12">
        <div className="xl:col-span-5">
          <SalesOverviewChart />
        </div>
        <div className="xl:col-span-3">
          <OrderStatusChart />
        </div>
        <div className="xl:col-span-4">
          <RecentOrdersTable />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-12">
        <div className="xl:col-span-4">
          <TopSellingProducts />
        </div>
        <div className="xl:col-span-4">
          <SalesByCategory />
        </div>
        <div className="flex flex-col gap-4 xl:col-span-4">
          <QuickActions />
          <GrowBusinessBanner />
        </div>
      </div>
    </div>
  );
}
