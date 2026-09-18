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
  SELLER_ORDER_PAGE_SIZE,
  SELLER_ORDER_TOTAL_COUNT,
  SELLER_ORDER_TOTAL_PAGES,
} from '@/lib/mock-data/seller-orders';
import {
  sellerWorkspaceHref,
  type SellerOrdersQuery,
} from '@/lib/url/seller-workspace-query';

export function SellerOrdersPagination({ query }: { query: SellerOrdersQuery }) {
  const page = Math.min(query.page, SELLER_ORDER_TOTAL_PAGES);
  const start = (page - 1) * SELLER_ORDER_PAGE_SIZE + 1;
  const end = Math.min(page * SELLER_ORDER_PAGE_SIZE, SELLER_ORDER_TOTAL_COUNT);
  const items = getPaginationRange({
    page,
    totalPages: SELLER_ORDER_TOTAL_PAGES,
    siblingCount: 1,
  });

  return (
    <div className="flex flex-col gap-3 border-t border-border px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-muted-foreground">
        Hiển thị{' '}
        <span className="font-medium text-foreground">
          {start} - {end}
        </span>{' '}
        trong{' '}
        <span className="font-medium text-foreground">
          {SELLER_ORDER_TOTAL_COUNT.toLocaleString('vi-VN')}
        </span>{' '}
        đơn hàng
      </p>

      <Pagination className="w-auto justify-start sm:justify-end">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href={sellerWorkspaceHref('orders', { ...query, page: Math.max(1, page - 1) })}
              disabled={page <= 1}
              label="Trước"
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
                  <Link href={sellerWorkspaceHref('orders', { ...query, page: item })}>
                    {item}
                  </Link>
                </PaginationLink>
              </PaginationItem>
            ),
          )}

          <PaginationItem>
            <PaginationNext
              href={sellerWorkspaceHref('orders', {
                ...query,
                page: Math.min(SELLER_ORDER_TOTAL_PAGES, page + 1),
              })}
              disabled={page >= SELLER_ORDER_TOTAL_PAGES}
              label="Sau"
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
