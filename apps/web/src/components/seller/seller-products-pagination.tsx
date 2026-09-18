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
  SELLER_PRODUCT_PAGE_SIZE,
  SELLER_PRODUCT_TOTAL_COUNT,
  SELLER_PRODUCT_TOTAL_PAGES,
} from '@/lib/mock-data/seller-products';
import {
  sellerWorkspaceHref,
  type SellerProductsQuery,
} from '@/lib/url/seller-workspace-query';

export function SellerProductsPagination({ query }: { query: SellerProductsQuery }) {
  const page = Math.min(query.page, SELLER_PRODUCT_TOTAL_PAGES);
  const start = (page - 1) * SELLER_PRODUCT_PAGE_SIZE + 1;
  const end = Math.min(page * SELLER_PRODUCT_PAGE_SIZE, SELLER_PRODUCT_TOTAL_COUNT);
  const items = getPaginationRange({
    page,
    totalPages: SELLER_PRODUCT_TOTAL_PAGES,
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
          {SELLER_PRODUCT_TOTAL_COUNT.toLocaleString('vi-VN')}
        </span>{' '}
        sản phẩm
      </p>

      <Pagination className="w-auto justify-start sm:justify-end">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href={sellerWorkspaceHref('products', { ...query, page: Math.max(1, page - 1) })}
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
                  <Link href={sellerWorkspaceHref('products', { ...query, page: item })}>
                    {item}
                  </Link>
                </PaginationLink>
              </PaginationItem>
            ),
          )}

          <PaginationItem>
            <PaginationNext
              href={sellerWorkspaceHref('products', {
                ...query,
                page: Math.min(SELLER_PRODUCT_TOTAL_PAGES, page + 1),
              })}
              disabled={page >= SELLER_PRODUCT_TOTAL_PAGES}
              label="Sau"
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
