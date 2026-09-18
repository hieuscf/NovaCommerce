'use client';

import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { Download, Filter, Search } from 'lucide-react';
import { Button } from '@novacommerce/ui/components/button';
import { Input } from '@novacommerce/ui/components/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@novacommerce/ui/components/select';
import { cn } from '@/lib/utils';
import { sellerOrderStatusLabel, sellerOrderTabs } from '@/lib/mock-data/seller-orders';
import {
  sellerWorkspaceHref,
  type SellerOrdersQuery,
  type SellerOrdersTabFilter,
} from '@/lib/url/seller-workspace-query';

export function SellerOrdersToolbar({ query }: { query: SellerOrdersQuery }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function navigate(next: Partial<SellerOrdersQuery>) {
    startTransition(() => {
      router.push(sellerWorkspaceHref('orders', { ...query, page: 1, ...next }));
    });
  }

  return (
    <div className="space-y-4" data-pending={pending || undefined}>
      <div className="flex flex-col gap-3 rounded-2xl border border-border bg-white p-4 shadow-sm lg:flex-row lg:items-center">
        <div className="min-w-0 flex-1">
          <Input
            key={query.q ?? ''}
            type="search"
            defaultValue={query.q ?? ''}
            placeholder="Tìm theo mã đơn, tên khách hoặc SĐT..."
            aria-label="Tìm đơn hàng"
            startAdornment={<Search className="size-4 text-muted-foreground" aria-hidden="true" />}
            className="h-10"
            groupClassName="rounded-xl"
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                navigate({ q: event.currentTarget.value });
              }
            }}
          />
        </div>

        <Select
          value={query.status}
          onValueChange={(value) => navigate({ status: value })}
        >
          <SelectTrigger className="h-10 w-full lg:w-44" aria-label="Lọc trạng thái">
            <SelectValue placeholder="Trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả trạng thái</SelectItem>
            {(Object.keys(sellerOrderStatusLabel) as Array<keyof typeof sellerOrderStatusLabel>).map(
              (status) => (
                <SelectItem key={status} value={status}>
                  {sellerOrderStatusLabel[status]}
                </SelectItem>
              ),
            )}
          </SelectContent>
        </Select>

        <Select
          value={query.range}
          onValueChange={(value) => navigate({ range: value })}
        >
          <SelectTrigger className="h-10 w-full lg:w-44" aria-label="Lọc thời gian">
            <SelectValue placeholder="Thời gian" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Thời gian đặt hàng</SelectItem>
            <SelectItem value="today">Hôm nay</SelectItem>
            <SelectItem value="last_7_days">7 ngày gần đây</SelectItem>
            <SelectItem value="last_30_days">30 ngày gần đây</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-10 gap-1.5 rounded-xl"
            onClick={() => navigate({})}
          >
            <Filter className="size-3.5" aria-hidden="true" />
            Bộ lọc
          </Button>
          <Button
            type="button"
            size="sm"
            className="h-10 gap-1.5 rounded-xl bg-sky-600 text-white hover:bg-sky-600/90"
          >
            <Download className="size-3.5" aria-hidden="true" />
            Xuất file
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {sellerOrderTabs.map((tab) => {
          const active = query.tab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => navigate({ tab: tab.id as SellerOrdersTabFilter })}
              className={cn(
                'rounded-full px-3 py-1.5 text-sm font-medium transition-colors',
                active
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 ring-1 ring-border hover:bg-slate-50',
              )}
            >
              {tab.label}{' '}
              <span className={cn(active ? 'text-sky-100' : 'text-muted-foreground')}>
                ({tab.count})
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
