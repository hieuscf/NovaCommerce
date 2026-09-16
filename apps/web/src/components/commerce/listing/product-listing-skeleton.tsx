import { ProductCardSkeleton } from '@/components/commerce/product-card';
import { Skeleton } from '@novacommerce/ui/components/skeleton';
import { cn } from '@/lib/utils';

function FilterRailSkeleton() {
  return (
    <div className="hidden rounded-[1.75rem] border border-border/70 bg-surface p-5 lg:block">
      <Skeleton variant="text" className="h-6 w-16" />
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="mt-5 space-y-3 border-t border-border/70 pt-4">
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
    <div className={cn('space-y-5', className)}>
      <Skeleton variant="text" className="h-3 w-40" />
      <div className="grid gap-8 lg:grid-cols-[250px_minmax(0,1fr)]">
        <FilterRailSkeleton />
        <div className="space-y-6">
          <div className="flex justify-end">
            <Skeleton className="h-10 w-64 rounded-xl" />
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4 xl:gap-5">
            {Array.from({ length: 8 }).map((_, index) => (
              <ProductCardSkeleton key={index} listing />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
