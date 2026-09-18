'use client';

import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@novacommerce/ui/components/select';
import { sellerFinanceMonthOptions } from '@/lib/mock-data/seller-finance';
import {
  sellerWorkspaceHref,
  type SellerFinanceQuery,
} from '@/lib/url/seller-workspace-query';
import { SellerFinanceBreakdown } from './seller-finance-breakdown';
import { SellerFinanceChart } from './seller-finance-chart';
import { SellerFinanceDocuments } from './seller-finance-documents';
import { SellerFinanceSummaryCards } from './seller-finance-summary-cards';
import { SellerFinanceWithdrawals } from './seller-finance-withdrawals';

export function SellerFinancePage({ query }: { query: SellerFinanceQuery }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const monthLabel =
    sellerFinanceMonthOptions.find((option) => option.value === query.month)?.label ??
    'Tháng 4/2025';

  function navigate(next: Partial<SellerFinanceQuery>) {
    startTransition(() => {
      router.push(sellerWorkspaceHref('finance', { ...query, ...next }));
    });
  }

  return (
    <div className="space-y-6" data-pending={pending || undefined}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
            Ví Seller / Số dư tài khoản
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Theo dõi số dư, quản lý rút tiền và xem chi tiết doanh thu của gian hàng.
          </p>
        </div>
        <Select value={query.month} onValueChange={(value) => navigate({ month: value })}>
          <SelectTrigger className="h-10 w-full gap-1.5 rounded-xl sm:w-44" aria-label="Chọn tháng">
            <SelectValue placeholder={monthLabel} />
          </SelectTrigger>
          <SelectContent>
            {sellerFinanceMonthOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <SellerFinanceSummaryCards />

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.5fr)_minmax(0,0.9fr)]">
        <SellerFinanceChart />
        <SellerFinanceBreakdown month={query.month} />
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        <SellerFinanceWithdrawals />
        <SellerFinanceDocuments />
      </div>
    </div>
  );
}
