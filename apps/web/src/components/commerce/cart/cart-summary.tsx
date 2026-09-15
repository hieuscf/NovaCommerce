import { Headphones, Lock, RefreshCw, ShieldCheck } from 'lucide-react';
import { Button } from '@novacommerce/ui/components/button';
import { Separator } from '@novacommerce/ui/components/separator';
import { formatCartMoney, type CartSummaryViewModel } from '@/lib/view-models/cart';

const TRUST = [
  {
    icon: ShieldCheck,
    title: 'Secure Payment',
    description: '100% protected with SSL encryption',
  },
  {
    icon: RefreshCw,
    title: 'Easy Returns',
    description: '30 days return policy',
  },
  {
    icon: Headphones,
    title: '24/7 Support',
    description: "We're here to help",
  },
] as const;

export function CartSummary({
  summary,
  onCheckout,
  onPayPal,
}: {
  summary: CartSummaryViewModel;
  onCheckout: () => void;
  onPayPal: () => void;
}) {
  const canCheckout = summary.selectedCount > 0;
  const shippingLabel = summary.freeShippingUnlocked ? 'Free' : 'Calculated at checkout';

  return (
    <aside className="rounded-2xl border border-border/70 bg-surface p-5 shadow-card-soft sm:p-6 lg:sticky lg:top-24">
      <h2 className="text-lg font-semibold text-ink">Order Summary</h2>

      <dl className="mt-5 space-y-3 text-sm" aria-live="polite">
        <div className="flex items-center justify-between gap-4">
          <dt className="text-muted-foreground">
            Subtotal ({summary.selectedCount} {summary.selectedCount === 1 ? 'Item' : 'Items'})
          </dt>
          <dd className="font-medium text-foreground tabular-nums">
            {formatCartMoney(summary.subtotal, summary.currency)}
          </dd>
        </div>
        <div className="flex items-center justify-between gap-4">
          <dt className="text-muted-foreground">Shipping</dt>
          <dd className="font-medium text-foreground">{shippingLabel}</dd>
        </div>
        <div className="flex items-center justify-between gap-4">
          <dt className="text-muted-foreground">Tax ({summary.taxRatePercent}%)</dt>
          <dd className="font-medium text-foreground tabular-nums">
            {formatCartMoney(summary.tax, summary.currency)}
          </dd>
        </div>
      </dl>

      <Separator className="my-4" />

      <div className="flex items-center justify-between gap-4">
        <p className="text-base font-semibold text-ink">Total</p>
        <p className="text-xl font-extrabold text-ink tabular-nums">
          {formatCartMoney(summary.total, summary.currency)}
        </p>
      </div>

      <div className="mt-6 space-y-3">
        <Button
          type="button"
          variant="primary-gradient"
          className="h-12 w-full rounded-xl"
          disabled={!canCheckout}
          onClick={onCheckout}
        >
          <Lock className="size-4" aria-hidden="true" />
          Proceed to Checkout
        </Button>
        <Button
          type="button"
          variant="secondary"
          className="h-12 w-full rounded-xl"
          disabled={!canCheckout}
          onClick={onPayPal}
        >
          Pay with PayPal
        </Button>
      </div>

      <ul className="mt-6 space-y-4">
        {TRUST.map((item) => (
          <li key={item.title} className="flex gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-primary-tint text-primary">
              <item.icon className="size-4" aria-hidden="true" />
            </span>
            <span>
              <span className="block text-sm font-semibold text-ink">{item.title}</span>
              <span className="block text-xs text-muted-foreground">{item.description}</span>
            </span>
          </li>
        ))}
      </ul>
    </aside>
  );
}
