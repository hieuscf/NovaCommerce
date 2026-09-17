import {
  CheckCircle2,
  Clock3,
  Users,
  XCircle,
  type LucideIcon,
} from 'lucide-react';
import { Card, CardContent } from '@novacommerce/ui/components/card';
import { cn } from '@/lib/utils';
import { approvalKpis, type ApprovalKpi } from '@/lib/mock-data/seller-approvals';

const toneStyles: Record<
  ApprovalKpi['tone'],
  { wrap: string; icon: string }
> = {
  primary: { wrap: 'bg-primary/10', icon: 'text-primary' },
  success: { wrap: 'bg-success/12', icon: 'text-success-strong' },
  destructive: { wrap: 'bg-destructive/12', icon: 'text-destructive-strong' },
  secondary: { wrap: 'bg-secondary/12', icon: 'text-secondary' },
};

const hintStyles: Record<ApprovalKpi['hintTone'], string> = {
  muted: 'text-muted-foreground',
  success: 'text-success-strong',
  destructive: 'text-destructive-strong',
};

const kpiIcons: Record<string, LucideIcon> = {
  pending: Clock3,
  approved: CheckCircle2,
  rejected: XCircle,
  total: Users,
};

export function ApprovalsKpiCards() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {approvalKpis.map((kpi) => {
        const styles = toneStyles[kpi.tone];
        const Icon = kpiIcons[kpi.id] ?? Clock3;

        return (
          <Card key={kpi.id} className="rounded-2xl shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{kpi.label}</p>
                  <p className="mt-2 text-2xl font-bold tracking-tight text-foreground">
                    {kpi.value}
                  </p>
                  <p className={cn('mt-1.5 text-xs font-semibold', hintStyles[kpi.hintTone])}>
                    {kpi.hint}
                  </p>
                </div>
                <div
                  className={cn(
                    'flex size-10 items-center justify-center rounded-xl',
                    styles.wrap,
                  )}
                >
                  <Icon className={cn('size-4', styles.icon)} strokeWidth={1.75} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
