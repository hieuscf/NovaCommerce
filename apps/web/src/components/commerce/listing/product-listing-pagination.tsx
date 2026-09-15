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
    <Pagination className="pt-4">
      <PaginationContent className="flex-wrap gap-1">
        <PaginationItem>
          <PaginationPrevious
            href={page <= 1 ? undefined : shopHref({ ...query, page: page - 1 })}
            disabled={page <= 1}
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
                <Link href={shopHref({ ...query, page: item })}>{item}</Link>
              </PaginationLink>
            </PaginationItem>
          ),
        )}
        <PaginationItem>
          <PaginationNext
            href={page >= totalPages ? undefined : shopHref({ ...query, page: page + 1 })}
            disabled={page >= totalPages}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
