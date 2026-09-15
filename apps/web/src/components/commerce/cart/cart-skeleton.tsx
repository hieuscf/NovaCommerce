import { Container } from '@novacommerce/ui/components/container';
import { Skeleton } from '@novacommerce/ui/components/skeleton';

export function CartSkeleton() {
  return (
    <Container size="wide" className="py-8 lg:py-10">
      <Skeleton variant="text" className="h-3 w-24" />
      <Skeleton variant="text" className="mt-4 h-9 w-64" />
      <div className="mt-8 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px] xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-4 rounded-2xl border border-border/70 bg-surface p-5 shadow-card-soft">
          <Skeleton variant="text" className="h-5 w-40" />
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="flex gap-4 border-t border-border/60 pt-4">
              <Skeleton className="size-20 rounded-xl" />
              <div className="min-w-0 flex-1 space-y-2">
                <Skeleton variant="text" className="h-4 w-2/3" />
                <Skeleton variant="text" className="h-3 w-1/2" />
                <Skeleton variant="text" className="h-4 w-20" />
              </div>
            </div>
          ))}
        </div>
        <div className="space-y-4 rounded-2xl border border-border/70 bg-surface p-5 shadow-card-soft">
          <Skeleton variant="text" className="h-5 w-36" />
          <Skeleton variant="text" className="h-4 w-full" />
          <Skeleton variant="text" className="h-4 w-full" />
          <Skeleton className="h-12 w-full rounded-xl" />
          <Skeleton className="h-12 w-full rounded-xl" />
        </div>
      </div>
    </Container>
  );
}
