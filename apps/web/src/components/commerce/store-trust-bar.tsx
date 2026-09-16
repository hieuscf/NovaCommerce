import { Headphones, RefreshCw, ShieldCheck, Truck } from 'lucide-react';

const TRUST = [
  { icon: Truck, title: 'Free Shipping', description: 'On orders over $50' },
  { icon: ShieldCheck, title: 'Secure Payment', description: '100% protected' },
  { icon: RefreshCw, title: 'Easy Returns', description: '30 days return policy' },
  { icon: Headphones, title: '24/7 Support', description: "We're here to help" },
] as const;

export function StoreTrustBar() {
  return (
    <ul className="grid grid-cols-2 gap-4 rounded-[1.75rem] border border-border/70 bg-surface px-4 py-4 shadow-card-soft sm:grid-cols-4 sm:px-6 sm:py-5">
      {TRUST.map((item) => (
        <li key={item.title} className="flex items-center gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-primary-tint text-primary">
            <item.icon className="size-4" strokeWidth={1.75} aria-hidden="true" />
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-semibold text-ink">{item.title}</span>
            <span className="block truncate text-xs text-muted-foreground">{item.description}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}
