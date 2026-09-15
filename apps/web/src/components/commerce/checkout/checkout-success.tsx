import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';
import { Button } from '@novacommerce/ui/components/button';
import { formatCartMoney, type CartSummaryViewModel } from '@/lib/view-models/cart';

export function CheckoutSuccess({
  orderNumber,
  summary,
}: {
  orderNumber: string;
  summary: CartSummaryViewModel;
}) {
  return (
    <div className="mx-auto max-w-lg rounded-2xl border border-border/70 bg-surface px-6 py-12 text-center shadow-card-soft">
      <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-success/10 text-success">
        <CheckCircle2 className="size-7" aria-hidden="true" />
      </span>
      <h2 className="mt-5 text-2xl font-bold text-ink">Order confirmed</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Thanks for your order. This preview does not charge a payment provider yet.
      </p>
      <p className="mt-4 text-sm font-semibold text-ink">Order {orderNumber}</p>
      <p className="mt-1 text-sm text-muted-foreground">
        Total {formatCartMoney(summary.total, summary.currency)}
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Button asChild variant="primary-gradient">
          <Link href="/shop">Continue shopping</Link>
        </Button>
        <Button asChild variant="secondary">
          <Link href="/account?section=orders">View orders</Link>
        </Button>
      </div>
    </div>
  );
}
