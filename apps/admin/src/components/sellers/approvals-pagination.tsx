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
  APPROVAL_PAGE_SIZE,
  APPROVAL_TOTAL_COUNT,
  APPROVAL_TOTAL_PAGES,
} from '@/lib/mock-data/seller-approvals';
import { approvalsHref, type ApprovalsQuery } from '@/lib/url/approvals-query';

export function ApprovalsPagination({ query }: { query: ApprovalsQuery }) {
  const page = Math.min(query.page, APPROVAL_TOTAL_PAGES);
  const start = (page - 1) * APPROVAL_PAGE_SIZE + 1;
  const end = Math.min(page * APPROVAL_PAGE_SIZE, APPROVAL_TOTAL_COUNT);
  const items = getPaginationRange({ page, totalPages: APPROVAL_TOTAL_PAGES, siblingCount: 1 });

  return (
    <div className="flex flex-col gap-3 border-t border-border px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-muted-foreground">
        Showing{' '}
        <span className="font-medium text-foreground">
          {start}-{end}
        </span>{' '}
        of{' '}
        <span className="font-medium text-foreground">{APPROVAL_TOTAL_COUNT.toLocaleString()}</span>{' '}
        applications
      </p>

      <Pagination className="w-auto justify-start sm:justify-end">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href={approvalsHref({ ...query, page: Math.max(1, page - 1) })}
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
                  <Link href={approvalsHref({ ...query, page: item })}>{item}</Link>
                </PaginationLink>
              </PaginationItem>
            ),
          )}
          <PaginationItem>
            <PaginationNext
              href={approvalsHref({ ...query, page: Math.min(APPROVAL_TOTAL_PAGES, page + 1) })}
              disabled={page >= APPROVAL_TOTAL_PAGES}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
