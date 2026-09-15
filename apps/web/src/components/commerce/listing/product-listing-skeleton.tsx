import { ProductCardSkeleton } from '@/components/commerce/product-card';
import { Skeleton } from '@novacommerce/ui/components/skeleton';
import { cn } from '@/lib/utils';

function FilterRailSkeleton() {
  return (
    <div className="hidden space-y-6 lg:block">
      <Skeleton variant="text" className="h-6 w-20" />
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="space-y-3 border-b border-border/70 pb-5">
          <Skeleton variant="text" className="h-4 w-24" />
          <Skeleton variant="text" className="h-4 w-full" />
          <Skeleton variant="text" className="h-4 w-5/6" />
          <Skeleton variant="text" className="h-4 w-2/3" />
        </div>
      ))}
    </div>
  );
}

export function ProductListingSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('grid gap-8 lg:grid-cols-[260px_minmax(0,1fr)]', className)}>
      <FilterRailSkeleton />
      <div className="space-y-6">
        <div className="flex justify-end">
          <Skeleton className="h-11 w-52 rounded-xl" />
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4 xl:gap-5">
          {Array.from({ length: 8 }).map((_, index) => (
            <ProductCardSkeleton key={index} listing />
          ))}
        </div>
      </div>
    </div>
  );
}
