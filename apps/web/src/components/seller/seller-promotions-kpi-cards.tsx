import {
  MousePointerClick,
  ShoppingBag,
  TrendingUp,
  Users,
  type LucideIcon,
} from 'lucide-react';
import { Card, CardContent } from '@novacommerce/ui/components/card';
import { cn } from '@/lib/utils';
import { sellerPromotionKpis } from '@/lib/mock-data/seller-promotions';

const kpiIcons: Record<string, LucideIcon> = {
  reach: Users,
  orders: ShoppingBag,
  revenue: TrendingUp,
  conversion: MousePointerClick,
};

export function SellerPromotionsKpiCards() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {sellerPromotionKpis.map((kpi) => {
        const Icon = kpiIcons[kpi.id] ?? TrendingUp;
        return (
          <Card key={kpi.id} className="rounded-2xl shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-2">
                <span className="flex size-9 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
                  <Icon className="size-4" strokeWidth={1.75} aria-hidden="true" />
                </span>
                <span
                  className={cn(
                    'text-xs font-semibold',
                    kpi.changeTone === 'up' ? 'text-emerald-600' : 'text-rose-600',
                  )}
                >
                  {kpi.change}
                </span>
              </div>
              <p className="mt-3 text-caption font-medium text-muted-foreground">{kpi.label}</p>
              <p className="mt-1 text-xl font-bold tracking-tight text-foreground">{kpi.value}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
