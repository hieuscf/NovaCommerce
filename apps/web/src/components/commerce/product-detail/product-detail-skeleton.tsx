import { Container } from '@novacommerce/ui/components/container';
import { Skeleton, SkeletonText } from '@novacommerce/ui/components/skeleton';

export function ProductDetailSkeleton() {
  return (
    <Container size="wide" className="pt-5 pb-16 lg:pt-6">
      <Skeleton variant="text" className="h-3 w-72" />
      <div className="mt-6 grid items-start gap-5 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.92fr)_18.75rem]">
        <div className="flex flex-col gap-4 lg:flex-row">
          <div className="order-2 hidden gap-2.5 md:flex lg:order-1 lg:flex-col">
            {Array.from({ length: 4 }, (_, index) => (
              <Skeleton key={index} className="size-16 shrink-0 rounded-2xl md:size-[4.35rem]" />
            ))}
          </div>
          <Skeleton className="order-1 aspect-square w-full rounded-[1.75rem] lg:order-2" />
        </div>
        <div className="space-y-4">
          <Skeleton variant="text" className="h-3 w-16" />
          <Skeleton variant="text" className="h-8 w-3/4" />
          <Skeleton variant="text" className="h-4 w-52" />
          <Skeleton variant="text" className="h-9 w-40" />
          <SkeletonText lines={3} />
          <div className="grid grid-cols-3 gap-2.5">
            <Skeleton className="h-20 rounded-2xl" />
            <Skeleton className="h-20 rounded-2xl" />
            <Skeleton className="h-20 rounded-2xl" />
          </div>
          <div className="flex gap-3">
            <Skeleton className="size-[4.5rem] rounded-2xl" />
            <Skeleton className="size-[4.5rem] rounded-2xl" />
            <Skeleton className="size-[4.5rem] rounded-2xl" />
          </div>
          <Skeleton className="h-12 w-36 rounded-2xl" />
          <Skeleton className="h-12 w-full rounded-2xl" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-56 rounded-[1.75rem]" />
          <Skeleton className="h-40 rounded-[1.75rem]" />
        </div>
      </div>
    </Container>
  );
}
