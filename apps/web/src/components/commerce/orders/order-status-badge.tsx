import { CheckCircle2, Clock, Truck, XCircle } from 'lucide-react';
import { Badge } from '@novacommerce/ui/components/badge';
import {
  ORDER_LIST_STATUS_LABELS,
  type OrderListStatus,
} from '@/lib/view-models/order';

const STATUS_BADGE: Record<
  OrderListStatus,
  { variant: 'success' | 'info' | 'warning' | 'destructive'; icon: typeof CheckCircle2 }
> = {
  delivered: { variant: 'success', icon: CheckCircle2 },
  shipped: { variant: 'success', icon: Truck },
  processing: { variant: 'warning', icon: Clock },
  cancelled: { variant: 'destructive', icon: XCircle },
};

export function OrderStatusBadge({
  status,
  className,
}: {
  status: OrderListStatus;
  className?: string;
}) {
  const meta = STATUS_BADGE[status];
  const Icon = meta.icon;

  return (
    <Badge variant={meta.variant} className={className}>
      <Icon aria-hidden="true" />
      {ORDER_LIST_STATUS_LABELS[status]}
    </Badge>
  );
}
