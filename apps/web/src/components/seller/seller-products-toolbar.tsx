'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { Plus, RotateCcw, Search } from 'lucide-react';
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
import { sellerProductCategories, sellerProductTabs } from '@/lib/mock-data/seller-products';
import {
  sellerWorkspaceHref,
  type SellerProductsQuery,
  type SellerProductsTabFilter,
} from '@/lib/url/seller-workspace-query';

export function SellerProductsToolbar({ query }: { query: SellerProductsQuery }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function navigate(next: Partial<SellerProductsQuery>) {
    startTransition(() => {
      router.push(sellerWorkspaceHref('products', { ...query, page: 1, ...next }));
    });
  }

  return (
    <div className="space-y-4" data-pending={pending || undefined}>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-1.5">
          {sellerProductTabs.map((tab) => {
            const active = query.tab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => navigate({ tab: tab.id as SellerProductsTabFilter })}
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
        <Button
          asChild
          size="sm"
          className="gap-1.5 rounded-xl bg-sky-600 text-white hover:bg-sky-600/90"
        >
          <Link href="/seller?demo=registered&section=products#add">
            <Plus className="size-4" aria-hidden="true" />
            Thêm sản phẩm mới
          </Link>
        </Button>
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-border bg-white p-4 shadow-sm lg:flex-row lg:items-center">
        <div className="min-w-0 flex-1">
          <Input
            key={query.q ?? ''}
            type="search"
            defaultValue={query.q ?? ''}
            placeholder="Tìm theo tên sản phẩm hoặc SKU..."
            aria-label="Tìm sản phẩm"
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
          value={query.category}
          onValueChange={(value) => navigate({ category: value })}
        >
          <SelectTrigger className="h-10 w-full lg:w-40" aria-label="Lọc ngành hàng">
            <SelectValue placeholder="Ngành hàng" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả ngành hàng</SelectItem>
            {sellerProductCategories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select defaultValue="all">
          <SelectTrigger className="h-10 w-full lg:w-36" aria-label="Lọc theo giá">
            <SelectValue placeholder="Giá" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả giá</SelectItem>
            <SelectItem value="low">Dưới 500k</SelectItem>
            <SelectItem value="mid">500k - 2tr</SelectItem>
            <SelectItem value="high">Trên 2tr</SelectItem>
          </SelectContent>
        </Select>

        <Select defaultValue="all">
          <SelectTrigger className="h-10 w-full lg:w-36" aria-label="Lọc tồn kho">
            <SelectValue placeholder="Tồn kho" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả tồn kho</SelectItem>
            <SelectItem value="in">Còn hàng</SelectItem>
            <SelectItem value="low">Sắp hết</SelectItem>
            <SelectItem value="out">Hết hàng</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-10 gap-1.5 rounded-xl"
            onClick={() => navigate({ q: undefined, tab: 'all', category: 'all' })}
          >
            <RotateCcw className="size-3.5" aria-hidden="true" />
            Đặt lại
          </Button>
          <Button
            type="button"
            size="sm"
            className="h-10 rounded-xl bg-sky-600 text-white hover:bg-sky-600/90"
            onClick={() => navigate({})}
          >
            Lọc
          </Button>
        </div>
      </div>
    </div>
  );
}
