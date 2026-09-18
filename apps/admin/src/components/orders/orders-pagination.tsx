import Link from 'next/link';
import {
  getPaginationRange,
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@novacommerce/ui/components/pagination';
import {
  ORDER_PAGE_SIZE,
  ORDER_TOTAL_COUNT,
  ORDER_TOTAL_PAGES,
} from '@/lib/mock-data/orders';
import { ordersHref, type OrdersQuery } from '@/lib/url/orders-query';

export function OrdersPagination({ query }: { query: OrdersQuery }) {
  const page = Math.min(query.page, ORDER_TOTAL_PAGES);
  const start = (page - 1) * ORDER_PAGE_SIZE + 1;
  const end = Math.min(page * ORDER_PAGE_SIZE, ORDER_TOTAL_COUNT);
  const items = getPaginationRange({ page, totalPages: ORDER_TOTAL_PAGES, siblingCount: 2 });

  return (
    <div className="flex flex-col gap-3 border-t border-border px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-muted-foreground">
        Showing{' '}
        <span className="font-medium text-foreground">
          {start}-{end}
        </span>{' '}
        of{' '}
        <span className="font-medium text-foreground">
          {ORDER_TOTAL_COUNT.toLocaleString()}
        </span>{' '}
        orders
      </p>

      <Pagination className="w-auto justify-start sm:justify-end">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href={ordersHref({ ...query, page: Math.max(1, page - 1) })}
              disabled={page <= 1}
              label="Previous"
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
                  <Link href={ordersHref({ ...query, page: item })}>{item}</Link>
                </PaginationLink>
              </PaginationItem>
            ),
          )}

          <PaginationItem>
            <PaginationNext
              href={ordersHref({ ...query, page: Math.min(ORDER_TOTAL_PAGES, page + 1) })}
              disabled={page >= ORDER_TOTAL_PAGES}
              label="Next"
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
