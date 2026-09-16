import Link from 'next/link';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  getPaginationRange,
} from '@novacommerce/ui/components/pagination';
import { shopHref, type ShopQuery } from '@/lib/url/shop-query';
import { cn } from '@/lib/utils';

const pill =
  'size-9 min-w-9 rounded-full p-0 text-sm font-semibold shadow-none';

export function ProductListingPagination({
  query,
  page,
  totalPages,
}: {
  query: ShopQuery;
  page: number;
  totalPages: number;
}) {
  if (totalPages <= 1) {
    return null;
  }

  const items = getPaginationRange({ page, totalPages });

  return (
    <Pagination className="pt-6">
      <PaginationContent className="flex-wrap gap-1.5">
        <PaginationItem>
          <PaginationPrevious
            href={page <= 1 ? undefined : shopHref({ ...query, page: page - 1 })}
            disabled={page <= 1}
            label="Previous"
            className={cn(pill, 'text-muted-foreground hover:bg-muted [&>span]:hidden')}
          />
        </PaginationItem>
        {items.map((item, index) =>
          item === 'ellipsis' ? (
            <PaginationItem key={`ellipsis-${index}`}>
              <PaginationEllipsis />
            </PaginationItem>
          ) : (
            <PaginationItem key={item}>
              <PaginationLink asChild isActive={item === page}>
                <Link
                  href={shopHref({ ...query, page: item })}
                  className={cn(
                    pill,
                    item === page
                      ? 'border-transparent bg-primary text-primary-foreground shadow-cta'
                      : 'text-copy hover:bg-muted',
                  )}
                >
                  {item}
                </Link>
              </PaginationLink>
            </PaginationItem>
          ),
        )}
        <PaginationItem>
          <PaginationNext
            href={page >= totalPages ? undefined : shopHref({ ...query, page: page + 1 })}
            disabled={page >= totalPages}
            label="Next"
            className={cn(pill, 'text-muted-foreground hover:bg-muted [&>span]:hidden')}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
