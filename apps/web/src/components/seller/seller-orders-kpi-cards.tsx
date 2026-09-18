import {
  CheckCircle2,
  Clock3,
  PackageCheck,
  PackageX,
  ShoppingBag,
  Truck,
  type LucideIcon,
} from 'lucide-react';
import { Card, CardContent } from '@novacommerce/ui/components/card';
import { cn } from '@/lib/utils';
import { sellerOrderKpis } from '@/lib/mock-data/seller-orders';

const kpiIcons: Record<string, LucideIcon> = {
  total: ShoppingBag,
  pending: Clock3,
  pickup: PackageCheck,
  shipping: Truck,
  delivered: CheckCircle2,
  cancelled: PackageX,
};

const kpiIconTone: Record<string, string> = {
  total: 'bg-sky-50 text-sky-600',
  pending: 'bg-amber-50 text-amber-600',
  pickup: 'bg-violet-50 text-violet-600',
  shipping: 'bg-emerald-50 text-emerald-600',
  delivered: 'bg-teal-50 text-teal-600',
  cancelled: 'bg-rose-50 text-rose-600',
};

export function SellerOrdersKpiCards() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
      {sellerOrderKpis.map((kpi) => {
        const Icon = kpiIcons[kpi.id] ?? ShoppingBag;
        return (
          <Card key={kpi.id} className="rounded-2xl shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-2">
                <span
                  className={cn(
                    'flex size-9 items-center justify-center rounded-xl',
                    kpiIconTone[kpi.tone] ?? 'bg-sky-50 text-sky-600',
                  )}
                >
                  <Icon className="size-4" strokeWidth={1.75} />
                </span>
                <span
                  className={cn(
                    'text-xs font-semibold',
                    kpi.changeTone === 'up' ? 'text-emerald-600' : 'text-rose-600',
                  )}
                >
                  {kpi.change.replace(' so với tuần trước', '')}
                </span>
              </div>
              <p className="mt-3 text-caption font-medium text-muted-foreground">{kpi.label}</p>
              <p className="mt-1 text-xl font-bold tracking-tight text-foreground">{kpi.value}</p>
              <p className="mt-1 text-[11px] text-muted-foreground">so với tuần trước</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
