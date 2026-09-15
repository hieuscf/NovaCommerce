import { Container } from '@novacommerce/ui/components/container';
import { Skeleton } from '@novacommerce/ui/components/skeleton';

export function CheckoutSkeleton() {
  return (
    <Container size="wide" className="py-8 lg:py-10">
      <Skeleton variant="text" className="h-3 w-28" />
      <div className="mt-8 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-5">
          <Skeleton className="h-16 w-full rounded-2xl" />
          <div className="space-y-4 rounded-2xl border border-border/70 bg-surface p-5 shadow-card-soft">
            <Skeleton variant="text" className="h-5 w-48" />
            <div className="grid gap-4 sm:grid-cols-2">
              <Skeleton className="h-11 rounded-xl" />
              <Skeleton className="h-11 rounded-xl" />
              <Skeleton className="h-11 rounded-xl" />
            </div>
          </div>
          <div className="space-y-4 rounded-2xl border border-border/70 bg-surface p-5 shadow-card-soft">
            <Skeleton variant="text" className="h-5 w-40" />
            <Skeleton className="h-11 rounded-xl" />
            <Skeleton className="h-11 rounded-xl" />
          </div>
        </div>
        <div className="space-y-4 rounded-2xl border border-border/70 bg-surface p-5 shadow-card-soft">
          <Skeleton variant="text" className="h-5 w-36" />
          <Skeleton variant="text" className="h-16 w-full" />
          <Skeleton variant="text" className="h-16 w-full" />
          <Skeleton className="h-12 w-full rounded-xl" />
        </div>
      </div>
    </Container>
  );
}
