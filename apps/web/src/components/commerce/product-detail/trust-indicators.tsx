import { Headphones, RefreshCw, ShieldCheck, Truck } from 'lucide-react';
import type { ProductTrustItemViewModel } from '@/lib/view-models/product-detail';

const icons = {
  shipping: Truck,
  secure: ShieldCheck,
  returns: RefreshCw,
  support: Headphones,
};

export function TrustIndicators({ items }: { items: readonly ProductTrustItemViewModel[] }) {
  return (
    <ul className="grid grid-cols-2 gap-3 rounded-[1.5rem] border border-border/70 bg-surface px-4 py-4 shadow-card-soft sm:grid-cols-4 sm:px-5">
      {items.map((item) => {
        const Icon = icons[item.icon];
        return (
          <li key={item.id} className="flex items-center gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-primary-tint text-primary">
              <Icon className="size-4" strokeWidth={1.75} aria-hidden="true" />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold text-ink">{item.label}</span>
              <span className="block truncate text-[11px] text-muted-foreground">{item.description}</span>
            </span>
          </li>
        );
      })}
    </ul>
  );
}
