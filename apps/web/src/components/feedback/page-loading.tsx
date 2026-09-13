import { Skeleton } from '@novacommerce/ui/components/skeleton';
import { Container } from '@novacommerce/ui/components/container';

export function PageLoading({ label = 'Loading content' }: { label?: string }) {
  return (
    <Container className="py-10 lg:py-14" aria-busy="true" aria-label={label}>
      <Skeleton className="h-10 w-48" />
      <Skeleton className="mt-3 h-5 w-80 max-w-full" />
      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <Skeleton key={index} className="h-72 w-full" />
        ))}
      </div>
    </Container>
  );
}
