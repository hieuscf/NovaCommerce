import {
  MoreHorizontal,
  Package,
  ShoppingCart,
  Users,
  Wallet,
  type LucideIcon,
} from 'lucide-react';
import { Button } from '@novacommerce/ui/components/button';
import { Card, CardContent } from '@novacommerce/ui/components/card';
import { cn } from '@/lib/utils';
import { sellerDashboardKpis, type SellerDashboardKpi } from '@/lib/mock-data/seller-dashboard';

const toneStyles: Record<
  SellerDashboardKpi['tone'],
  { wrap: string; icon: string }
> = {
  orders: { wrap: 'bg-sky-50', icon: 'text-sky-600' },
  revenue: { wrap: 'bg-emerald-50', icon: 'text-emerald-600' },
  products: { wrap: 'bg-violet-50', icon: 'text-violet-600' },
  customers: { wrap: 'bg-amber-50', icon: 'text-amber-600' },
};

const kpiIcons: Record<string, LucideIcon> = {
  orders: ShoppingCart,
  revenue: Wallet,
  products: Package,
  customers: Users,
};

export function SellerDashboardKpiCards() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {sellerDashboardKpis.map((kpi) => {
        const styles = toneStyles[kpi.tone];
        const Icon = kpiIcons[kpi.id] ?? Package;

        return (
          <Card key={kpi.id} className="rounded-2xl shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div
                  className={cn(
                    'flex size-10 items-center justify-center rounded-xl',
                    styles.wrap,
                  )}
                >
                  <Icon className={cn('size-4', styles.icon)} strokeWidth={1.75} />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`Tùy chọn ${kpi.label}`}
                >
                  <MoreHorizontal className="size-4" />
                </Button>
              </div>
              <p className="mt-4 text-sm font-medium text-muted-foreground">{kpi.label}</p>
              <p className="mt-1 text-2xl font-bold tracking-tight text-foreground">{kpi.value}</p>
              <p className="mt-1.5 text-xs font-semibold text-emerald-600">{kpi.change}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
