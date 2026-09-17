import Link from 'next/link';
import { ApprovalsFilters } from '@/components/sellers/approvals-filters';
import { ApprovalsKpiCards } from '@/components/sellers/approvals-kpi-cards';
import { ApprovalsPagination } from '@/components/sellers/approvals-pagination';
import { ApprovalsTable } from '@/components/sellers/approvals-table';
import {
  approvalsPageMeta,
  filterApplications,
  sellerApplications,
} from '@/lib/mock-data/seller-approvals';
import { type ApprovalsQuery } from '@/lib/url/approvals-query';

export function SellerApprovalsPage({ query }: { query: ApprovalsQuery }) {
  const rows = filterApplications(sellerApplications, query);

  return (
    <div className="space-y-6">
      <div>
        <nav aria-label="Breadcrumb" className="mb-2 text-caption text-muted-foreground">
          <ol className="flex flex-wrap items-center gap-1.5">
            {approvalsPageMeta.breadcrumb.map((crumb, index) => (
              <li key={crumb.label} className="flex items-center gap-1.5">
                {index > 0 ? <span aria-hidden="true">/</span> : null}
                {crumb.href ? (
                  <Link href={crumb.href} className="hover:text-foreground hover:underline">
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="text-foreground">{crumb.label}</span>
                )}
              </li>
            ))}
          </ol>
        </nav>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          {approvalsPageMeta.title}
        </h1>
        <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
          {approvalsPageMeta.description} Click a seller to open the full registration review
          before approving.
        </p>
      </div>

      <ApprovalsKpiCards />
      <ApprovalsFilters query={query} />

      <div className="space-y-4">
        <ApprovalsTable applications={rows} />
        <div className="rounded-2xl border border-border bg-card shadow-sm">
          <ApprovalsPagination query={query} />
        </div>
      </div>
    </div>
  );
}
