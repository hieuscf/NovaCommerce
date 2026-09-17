import {
  BadgeDollarSign,
  Ban,
  Clock3,
  Store,
  UserCheck,
  type LucideIcon,
} from 'lucide-react';
import { Card, CardContent } from '@novacommerce/ui/components/card';
import { cn } from '@/lib/utils';
import { sellerKpis, type SellerKpi } from '@/lib/mock-data/sellers';

const toneStyles: Record<
  SellerKpi['tone'],
  { wrap: string; icon: string; change: string }
> = {
  primary: {
    wrap: 'bg-primary/10',
    icon: 'text-primary',
    change: 'text-success-strong',
  },
  success: {
    wrap: 'bg-success/12',
    icon: 'text-success-strong',
    change: 'text-success-strong',
  },
  warning: {
    wrap: 'bg-warning/15',
    icon: 'text-warning-strong',
    change: 'text-success-strong',
  },
  destructive: {
    wrap: 'bg-destructive/12',
    icon: 'text-destructive-strong',
    change: 'text-destructive-strong',
  },
  info: {
    wrap: 'bg-info/12',
    icon: 'text-info-strong',
    change: 'text-success-strong',
  },
};

const kpiIcons: Record<string, LucideIcon> = {
  total: Store,
  active: UserCheck,
  pending: Clock3,
  suspended: Ban,
  commission: BadgeDollarSign,
};

export function SellersKpiCards() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
      {sellerKpis.map((kpi) => {
        const styles = toneStyles[kpi.tone];
        const Icon = kpiIcons[kpi.id] ?? Store;

        return (
          <Card key={kpi.id} className="rounded-2xl shadow-sm">
            <CardContent className="p-5">
              <div
                className={cn(
                  'flex size-10 items-center justify-center rounded-xl',
                  styles.wrap,
                )}
              >
                <Icon className={cn('size-4', styles.icon)} strokeWidth={1.75} />
              </div>
              <p className="mt-4 text-sm font-medium text-muted-foreground">{kpi.label}</p>
              <p className="mt-1 text-2xl font-bold tracking-tight text-foreground">{kpi.value}</p>
              <p className={cn('mt-1.5 text-xs font-semibold', styles.change)}>
                {kpi.change}{' '}
                <span className="font-medium text-muted-foreground">{kpi.changeLabel}</span>
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
