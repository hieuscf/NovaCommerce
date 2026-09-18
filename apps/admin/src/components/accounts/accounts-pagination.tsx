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
import { accountsHref, type AccountsQuery } from '@/lib/url/accounts-query';

export function AccountsPagination({
  query,
  page,
  pageSize,
  total,
  totalPages,
}: {
  query: AccountsQuery;
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}) {
  const safePage = Math.min(page, Math.max(1, totalPages));
  const start = total === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const end = Math.min(safePage * pageSize, total);
  const items = getPaginationRange({ page: safePage, totalPages: Math.max(1, totalPages), siblingCount: 2 });

  return (
    <div className="flex flex-col gap-3 border-t border-border px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-muted-foreground">
        Showing{' '}
        <span className="font-medium text-foreground">
          {start}-{end}
        </span>{' '}
        of <span className="font-medium text-foreground">{total.toLocaleString()}</span>{' '}
        accounts
      </p>

      <Pagination className="w-auto justify-start sm:justify-end">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href={accountsHref({ ...query, page: Math.max(1, safePage - 1) })}
              disabled={safePage <= 1}
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
                <PaginationLink asChild isActive={item === safePage}>
                  <Link href={accountsHref({ ...query, page: item })}>{item}</Link>
                </PaginationLink>
              </PaginationItem>
            ),
          )}

          <PaginationItem>
            <PaginationNext
              href={accountsHref({ ...query, page: Math.min(Math.max(1, totalPages), safePage + 1) })}
              disabled={safePage >= totalPages || total === 0}
              label="Next"
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
