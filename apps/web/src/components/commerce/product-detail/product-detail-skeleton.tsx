import { Container } from '@novacommerce/ui/components/container';
import { Skeleton, SkeletonText } from '@novacommerce/ui/components/skeleton';

export function ProductDetailSkeleton() {
  return (
    <Container size="wide" className="pt-6 pb-16 lg:pt-8">
      <Skeleton variant="text" className="h-3 w-64" />
      <div className="mt-8 grid items-start gap-10 lg:grid-cols-[minmax(0,1.22fr)_minmax(0,1fr)] lg:gap-14">
        <div className="flex flex-col gap-4 lg:flex-row">
          <div className="order-2 flex gap-2.5 lg:order-1 lg:flex-col">
            {Array.from({ length: 4 }, (_, index) => (
              <Skeleton key={index} className="size-16 shrink-0 rounded-xl md:size-[4.5rem]" />
            ))}
          </div>
          <Skeleton className="order-1 aspect-square w-full rounded-2xl lg:order-2" />
        </div>
        <div className="space-y-5">
          <Skeleton variant="text" className="h-3 w-20" />
          <Skeleton variant="text" className="h-9 w-3/4" />
          <Skeleton variant="text" className="h-4 w-40" />
          <Skeleton variant="text" className="h-10 w-32" />
          <SkeletonText lines={3} />
          <div className="flex gap-2">
            <Skeleton className="h-11 w-28 rounded-full" />
            <Skeleton className="h-11 w-28 rounded-full" />
            <Skeleton className="h-11 w-28 rounded-full" />
          </div>
          <Skeleton className="h-11 w-36 rounded-xl" />
          <Skeleton className="h-12 w-full rounded-xl" />
          <Skeleton className="h-12 w-full rounded-xl" />
        </div>
      </div>
    </Container>
  );
}
