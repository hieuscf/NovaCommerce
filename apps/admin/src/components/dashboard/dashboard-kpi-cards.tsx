import {
  DollarSign,
  Percent,
  ShoppingBag,
  TrendingUp,
  Users,
  type LucideIcon,
} from 'lucide-react';
import { Card, CardContent } from '@novacommerce/ui/components/card';
import { cn } from '@/lib/utils';
import { dashboardKpis, type DashboardKpi } from '@/lib/mock-data/dashboard';

const toneStyles: Record<
  DashboardKpi['tone'],
  { iconWrap: string; icon: string; change: string; spark: string }
> = {
  primary: {
    iconWrap: 'bg-primary/10',
    icon: 'text-primary',
    change: 'text-success-strong',
    spark: '#6366F1',
  },
  success: {
    iconWrap: 'bg-success/12',
    icon: 'text-success-strong',
    change: 'text-success-strong',
    spark: '#22C55E',
  },
  warning: {
    iconWrap: 'bg-warning/15',
    icon: 'text-warning-strong',
    change: 'text-success-strong',
    spark: '#F59E0B',
  },
  destructive: {
    iconWrap: 'bg-destructive/12',
    icon: 'text-destructive-strong',
    change: 'text-success-strong',
    spark: '#EF4444',
  },
};

const kpiIcons: Record<string, LucideIcon> = {
  revenue: DollarSign,
  orders: ShoppingBag,
  customers: Users,
  conversion: Percent,
};

function Sparkline({ values, color }: { values: number[]; color: string }) {
  const width = 88;
  const height = 36;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const points = values
    .map((value, index) => {
      const x = (index / (values.length - 1)) * width;
      const y = height - ((value - min) / range) * (height - 4) - 2;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="overflow-visible"
      aria-hidden="true"
    >
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
}

export function DashboardKpiCards() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {dashboardKpis.map((kpi) => {
        const styles = toneStyles[kpi.tone];
        const Icon = kpiIcons[kpi.id] ?? TrendingUp;

        return (
          <Card key={kpi.id} className="rounded-2xl shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div
                  className={cn(
                    'flex size-10 items-center justify-center rounded-xl',
                    styles.iconWrap,
                  )}
                >
                  <Icon className={cn('size-4', styles.icon)} strokeWidth={1.75} />
                </div>
                <Sparkline values={kpi.sparkline} color={styles.spark} />
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
