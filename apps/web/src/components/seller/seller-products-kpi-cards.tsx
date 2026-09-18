import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Package,
  PackageX,
  type LucideIcon,
} from 'lucide-react';
import { Card, CardContent } from '@novacommerce/ui/components/card';
import { cn } from '@/lib/utils';
import { sellerProductKpis } from '@/lib/mock-data/seller-products';

const kpiIcons: Record<string, LucideIcon> = {
  total: Package,
  active: CheckCircle2,
  pending: Clock3,
  oos: PackageX,
  locked: AlertTriangle,
};

export function SellerProductsKpiCards() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
      {sellerProductKpis.map((kpi) => {
        const Icon = kpiIcons[kpi.id] ?? Package;
        return (
          <Card key={kpi.id} className="rounded-2xl shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-2">
                <span className="flex size-9 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
                  <Icon className="size-4" strokeWidth={1.75} />
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
