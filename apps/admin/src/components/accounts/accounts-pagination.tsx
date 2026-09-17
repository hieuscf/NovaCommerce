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
import { ACCOUNT_PAGE_SIZE, ACCOUNT_TOTAL_COUNT, ACCOUNT_TOTAL_PAGES } from '@/lib/mock-data/accounts';
import { accountsHref, type AccountsQuery } from '@/lib/url/accounts-query';

export function AccountsPagination({ query }: { query: AccountsQuery }) {
  const page = Math.min(query.page, ACCOUNT_TOTAL_PAGES);
  const start = (page - 1) * ACCOUNT_PAGE_SIZE + 1;
  const end = Math.min(page * ACCOUNT_PAGE_SIZE, ACCOUNT_TOTAL_COUNT);
  const items = getPaginationRange({ page, totalPages: ACCOUNT_TOTAL_PAGES, siblingCount: 2 });

  return (
    <div className="flex flex-col gap-3 border-t border-border px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-muted-foreground">
        Showing{' '}
        <span className="font-medium text-foreground">
          {start}-{end}
        </span>{' '}
        of <span className="font-medium text-foreground">{ACCOUNT_TOTAL_COUNT.toLocaleString()}</span>{' '}
        accounts
      </p>

      <Pagination className="w-auto justify-start sm:justify-end">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href={accountsHref({ ...query, page: Math.max(1, page - 1) })}
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
                  <Link href={accountsHref({ ...query, page: item })}>{item}</Link>
                </PaginationLink>
              </PaginationItem>
            ),
          )}

          <PaginationItem>
            <PaginationNext
              href={accountsHref({ ...query, page: Math.min(ACCOUNT_TOTAL_PAGES, page + 1) })}
              disabled={page >= ACCOUNT_TOTAL_PAGES}
              label="Next"
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
