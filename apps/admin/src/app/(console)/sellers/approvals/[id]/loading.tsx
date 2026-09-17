import { Skeleton } from '@novacommerce/ui/components/skeleton';

export default function SellerApplicationReviewLoading() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading seller application">
      <Skeleton className="h-4 w-72" />
      <Skeleton className="h-10 w-48 rounded-xl" />
      <Skeleton className="h-20 w-full max-w-xl" />
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-48 w-full rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-96 w-full rounded-2xl" />
      </div>
    </div>
  );
}
