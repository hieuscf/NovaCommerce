import type { ReactNode } from 'react';
import Link from 'next/link';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@novacommerce/ui/components/button';

function AmbientOrbs() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <span className="absolute top-[18%] left-[12%] size-16 rounded-full bg-[#c4b5fd]/50 blur-[1px]" />
      <span className="absolute top-[22%] right-[18%] size-10 rounded-full bg-[#93c5fd]/55" />
      <span className="absolute bottom-[22%] left-[22%] size-8 rounded-full bg-[#ddd6fe]/70" />
      <span className="absolute right-[12%] bottom-[18%] size-14 rounded-full bg-[#bfdbfe]/50 blur-[1px]" />
    </div>
  );
}

export function OrderLoadingState() {
  return (
    <div className="relative overflow-hidden rounded-[28px] border border-white/70 bg-white/80 px-6 py-16 text-center shadow-card-soft sm:px-10">
      <AmbientOrbs />
      <div className="relative mx-auto flex max-w-sm flex-col items-center">
        <div className="relative mb-6 size-28" aria-hidden="true">
          <span className="absolute inset-x-6 top-2 h-20 rounded-[18px] bg-gradient-to-br from-white to-[#e8eef8] shadow-md" />
          <span className="absolute inset-x-8 top-5 h-3 rounded-full bg-[#dbe4f3]" />
          <span className="absolute inset-x-10 top-10 h-2 rounded-full bg-[#edf2fb]" />
          <span className="absolute inset-x-10 top-14 h-2 rounded-full bg-[#edf2fb]" />
          <span className="absolute bottom-1 left-1/2 size-8 -translate-x-1/2 rounded-full bg-primary/15" />
        </div>
        <p className="text-lg font-bold text-ink" role="status">
          Loading your order…
        </p>
        <p className="mt-2 text-sm text-muted-foreground">Please wait while we fetch your order details</p>
        <span className="mt-5 flex items-center gap-1.5" aria-hidden="true">
          <span className="size-2 animate-pulse rounded-full bg-primary" />
          <span className="size-2 animate-pulse rounded-full bg-primary/70 [animation-delay:150ms]" />
          <span className="size-2 animate-pulse rounded-full bg-primary/40 [animation-delay:300ms]" />
        </span>
      </div>
    </div>
  );
}

export function OrderErrorState({
  action,
  title = 'Something went wrong',
  description = "We couldn't load your order details. Please try again in a moment or contact our support team.",
}: {
  action: ReactNode;
  title?: string;
  description?: string;
}) {
  return (
    <div
      className="relative overflow-hidden rounded-[28px] border border-white/70 bg-white/80 px-6 py-16 text-center shadow-card-soft sm:px-10"
      role="alert"
    >
      <AmbientOrbs />
      <div className="relative mx-auto flex max-w-md flex-col items-center">
        <span className="mb-5 grid size-16 place-items-center rounded-full bg-destructive/10 text-destructive">
          <AlertTriangle className="size-7" aria-hidden="true" />
        </span>
        <h2 className="text-2xl font-extrabold tracking-tight text-ink">{title}</h2>
        <p className="mt-3 max-w-sm text-sm text-muted-foreground">{description}</p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          {action}
          <Button asChild variant="secondary">
            <Link href="/account?section=help">Contact Support</Link>
          </Button>
        </div>
        <Button asChild variant="ghost" className="mt-3 text-muted-foreground">
          <Link href="/orders">Back to Orders</Link>
        </Button>
      </div>
    </div>
  );
}
