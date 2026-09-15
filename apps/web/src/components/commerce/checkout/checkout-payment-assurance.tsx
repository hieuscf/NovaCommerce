import { Lock, ShieldCheck, Zap } from 'lucide-react';

const ASSURANCE = [
  { icon: ShieldCheck, title: 'Secure Payment', description: 'SSL 256-bit encryption' },
  { icon: Lock, title: 'PCI DSS Compliant', description: 'Your data is safe with us' },
  { icon: Zap, title: 'Instant Confirmation', description: 'Get your order in seconds' },
] as const;

export function CheckoutPaymentAssurance() {
  return (
    <ul className="grid gap-3 border-t border-border/70 pt-5 sm:grid-cols-3">
      {ASSURANCE.map((item) => (
        <li key={item.title} className="flex items-start gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-primary-tint text-primary">
            <item.icon className="size-4" strokeWidth={1.75} aria-hidden="true" />
          </span>
          <span className="min-w-0">
            <span className="block text-sm font-semibold text-ink">{item.title}</span>
            <span className="block text-xs text-muted-foreground">{item.description}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}
