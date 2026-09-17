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
  PRODUCT_PAGE_SIZE,
  PRODUCT_TOTAL_COUNT,
  PRODUCT_TOTAL_PAGES,
} from '@/lib/mock-data/products';
import { productsHref, type ProductsQuery } from '@/lib/url/products-query';

export function ProductsPagination({ query }: { query: ProductsQuery }) {
  const page = Math.min(query.page, PRODUCT_TOTAL_PAGES);
  const start = (page - 1) * PRODUCT_PAGE_SIZE + 1;
  const end = Math.min(page * PRODUCT_PAGE_SIZE, PRODUCT_TOTAL_COUNT);
  const items = getPaginationRange({ page, totalPages: PRODUCT_TOTAL_PAGES, siblingCount: 2 });

  return (
    <div className="flex flex-col gap-3 border-t border-border px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-muted-foreground">
        Showing{' '}
        <span className="font-medium text-foreground">
          {start}-{end}
        </span>{' '}
        of{' '}
        <span className="font-medium text-foreground">
          {PRODUCT_TOTAL_COUNT.toLocaleString()}
        </span>{' '}
        products
      </p>

      <Pagination className="w-auto justify-start sm:justify-end">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href={productsHref({ ...query, page: Math.max(1, page - 1) })}
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
                  <Link href={productsHref({ ...query, page: item })}>{item}</Link>
                </PaginationLink>
              </PaginationItem>
            ),
          )}

          <PaginationItem>
            <PaginationNext
              href={productsHref({ ...query, page: Math.min(PRODUCT_TOTAL_PAGES, page + 1) })}
              disabled={page >= PRODUCT_TOTAL_PAGES}
              label="Next"
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
