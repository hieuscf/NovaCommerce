'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { Plus, Tag } from 'lucide-react';
import { Button } from '@novacommerce/ui/components/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@novacommerce/ui/components/select';
import { cn } from '@/lib/utils';
import {
  filterTopPrograms,
  sellerPromotionRangeOptions,
  sellerPromotionTabs,
  sellerTopPrograms,
} from '@/lib/mock-data/seller-promotions';
import {
  sellerWorkspaceHref,
  type SellerPromotionsQuery,
  type SellerPromotionsTabFilter,
} from '@/lib/url/seller-workspace-query';
import { SellerPromotionsKpiCards } from './seller-promotions-kpi-cards';
import { SellerPromotionsTools } from './seller-promotions-tools';
import { SellerPromotionsTopPrograms } from './seller-promotions-top-programs';
import { SellerPromotionsVouchersRail } from './seller-promotions-vouchers-rail';

export function SellerPromotionsPage({ query }: { query: SellerPromotionsQuery }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const programs = filterTopPrograms(sellerTopPrograms, query.tab);

  function navigate(next: Partial<SellerPromotionsQuery>) {
    startTransition(() => {
      router.push(sellerWorkspaceHref('promotions', { ...query, ...next }));
    });
  }

  return (
    <div className="space-y-6" data-pending={pending || undefined}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
            <Tag className="size-5" strokeWidth={1.75} aria-hidden="true" />
          </span>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
              Khuyến mãi &amp; Chiến dịch
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Tăng doanh số và thu hút khách hàng với voucher, flash sale, combo và quảng cáo.
            </p>
          </div>
        </div>
        <Button
          asChild
          size="sm"
          className="h-10 gap-1.5 rounded-xl bg-sky-600 text-white hover:bg-sky-600/90"
        >
          <Link href="/seller?demo=registered&section=promotions&tab=vouchers">
            <Plus className="size-4" aria-hidden="true" />
            Tạo khuyến mãi mới
          </Link>
        </Button>
      </div>

      <SellerPromotionsTools />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0 space-y-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap gap-1.5">
              {sellerPromotionTabs.map((tab) => {
                const active = query.tab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => navigate({ tab: tab.id as SellerPromotionsTabFilter })}
                    className={cn(
                      'rounded-full px-3 py-1.5 text-sm font-medium transition-colors',
                      active
                        ? 'bg-sky-600 text-white shadow-sm'
                        : 'bg-white text-slate-600 ring-1 ring-border hover:bg-slate-50',
                    )}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
            <Select value={query.range} onValueChange={(value) => navigate({ range: value })}>
              <SelectTrigger className="h-10 w-full rounded-xl lg:w-56" aria-label="Chọn khoảng thời gian">
                <SelectValue placeholder="Khoảng thời gian" />
              </SelectTrigger>
              <SelectContent>
                {sellerPromotionRangeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <h2 className="mb-3 text-base font-semibold text-foreground">Hiệu quả khuyến mãi</h2>
            <SellerPromotionsKpiCards />
          </div>

          <SellerPromotionsTopPrograms programs={programs} />
        </div>

        <SellerPromotionsVouchersRail />
      </div>
    </div>
  );
}
