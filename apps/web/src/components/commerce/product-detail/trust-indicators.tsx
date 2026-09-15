import { RefreshCw, ShieldCheck, Truck } from 'lucide-react';
import type { ProductTrustItemViewModel } from '@/lib/view-models/product-detail';

const icons = {
  shipping: Truck,
  secure: ShieldCheck,
  returns: RefreshCw,
};

export function TrustIndicators({ items }: { items: readonly ProductTrustItemViewModel[] }) {
  return (
    <ul className="grid gap-2.5 text-sm text-muted-foreground sm:grid-cols-3">
      {items.map((item) => {
        const Icon = icons[item.icon];
        return (
          <li key={item.id} className="flex items-center gap-2">
            <span className="grid size-8 place-items-center rounded-lg bg-primary-tint text-primary">
              <Icon className="size-4" strokeWidth={1.75} aria-hidden="true" />
            </span>
            {item.label}
          </li>
        );
      })}
    </ul>
  );
}
