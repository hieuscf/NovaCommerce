import { Skeleton } from '@novacommerce/ui/components/skeleton';

export default function ConsoleLoading() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading dashboard">
      <div className="flex items-end justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-80 max-w-full" />
        </div>
        <Skeleton className="h-9 w-52 rounded-xl" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-36 w-full rounded-2xl" />
        ))}
      </div>
      <div className="grid gap-4 xl:grid-cols-12">
        <Skeleton className="h-72 rounded-2xl xl:col-span-5" />
        <Skeleton className="h-72 rounded-2xl xl:col-span-3" />
        <Skeleton className="h-72 rounded-2xl xl:col-span-4" />
      </div>
      <div className="grid gap-4 xl:grid-cols-12">
        <Skeleton className="h-80 rounded-2xl xl:col-span-4" />
        <Skeleton className="h-80 rounded-2xl xl:col-span-4" />
        <Skeleton className="h-80 rounded-2xl xl:col-span-4" />
      </div>
    </div>
  );
}
