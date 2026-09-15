import { Container } from '@novacommerce/ui/components/container';
import { Skeleton } from '@novacommerce/ui/components/skeleton';

export function OrderListSkeleton() {
  return (
    <Container size="wide" className="py-8 lg:py-10">
      <div className="grid gap-5 lg:grid-cols-[248px_minmax(0,1fr)]">
        <Skeleton className="hidden h-[520px] rounded-2xl lg:block" />
        <div className="space-y-4 rounded-2xl border border-border/70 bg-surface p-5 shadow-card-soft">
          <Skeleton variant="text" className="h-8 w-48" />
          <div className="flex gap-2">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-9 w-24 rounded-pill" />
            ))}
          </div>
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="flex items-center gap-4 border-t border-border/60 pt-4">
              <Skeleton className="size-14 rounded-xl" />
              <div className="min-w-0 flex-1 space-y-2">
                <Skeleton variant="text" className="h-4 w-32" />
                <Skeleton variant="text" className="h-3 w-40" />
              </div>
              <Skeleton className="h-6 w-20 rounded-pill" />
              <Skeleton variant="text" className="h-4 w-16" />
            </div>
          ))}
        </div>
      </div>
    </Container>
  );
}

export function OrderDetailSkeleton() {
  return (
    <Container size="wide" className="py-8 lg:py-10">
      <Skeleton variant="text" className="h-3 w-48" />
      <Skeleton variant="text" className="mt-4 h-9 w-72" />
      <div className="mt-8 grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-5">
          <Skeleton className="h-72 rounded-2xl" />
          <Skeleton className="h-64 rounded-2xl" />
        </div>
        <div className="space-y-5">
          <Skeleton className="h-36 rounded-2xl" />
          <Skeleton className="h-40 rounded-2xl" />
          <Skeleton className="h-56 rounded-2xl" />
        </div>
      </div>
    </Container>
  );
}
