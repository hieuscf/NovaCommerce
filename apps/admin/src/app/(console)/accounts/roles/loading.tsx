import { Skeleton } from '@novacommerce/ui/components/skeleton';

export default function RolesLoading() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading roles">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96 max-w-full" />
        </div>
        <Skeleton className="h-9 w-36 rounded-xl" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-32 w-full rounded-2xl" />
        ))}
      </div>
      <Skeleton className="h-16 w-full rounded-2xl" />
      <Skeleton className="h-80 w-full rounded-2xl" />
    </div>
  );
}
