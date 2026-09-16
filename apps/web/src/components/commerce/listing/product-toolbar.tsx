'use client';

import { useRouter } from 'next/navigation';
import { LayoutGrid, List, SlidersHorizontal } from 'lucide-react';
import { Button } from '@novacommerce/ui/components/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@novacommerce/ui/components/select';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@novacommerce/ui/components/sheet';
import { shopHref, type ShopQuery } from '@/lib/url/shop-query';
import {
  formatProductCount,
  SHOP_SORT_LABELS,
  SHOP_SORTS,
  type ShopFacets,
  type ShopSort,
} from '@/lib/view-models/shop';
import { cn } from '@/lib/utils';
import { FilterSidebar } from './filter-sidebar';

export function ProductToolbar({
  query,
  total,
  facets,
}: {
  query: ShopQuery;
  total: number;
  facets: ShopFacets;
}) {
  const router = useRouter();

  return (
    <div className="flex min-w-0 flex-wrap items-center gap-3">
      <p className="mr-auto text-sm font-medium tabular-nums text-copy">{formatProductCount(total)}</p>

      <Sheet>
        <SheetTrigger asChild>
          <Button type="button" variant="secondary" className="lg:hidden">
            <SlidersHorizontal className="size-4" aria-hidden="true" />
            Filters
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-full max-w-sm overflow-y-auto p-6">
          <SheetHeader className="p-0">
            <SheetTitle className="sr-only">Filters</SheetTitle>
          </SheetHeader>
          <FilterSidebar query={query} facets={facets} idPrefix="mobile-filters" />
        </SheetContent>
      </Sheet>

      <div className="flex items-center gap-1 rounded-xl border border-border/80 bg-surface p-1">
        <Button
          type="button"
          size="icon-sm"
          variant="ghost"
          aria-label="Grid view"
          aria-pressed={query.view === 'grid'}
          className={cn(query.view === 'grid' && 'bg-primary-tint text-primary')}
          onClick={() => router.push(shopHref({ ...query, view: 'grid' }))}
        >
          <LayoutGrid className="size-4" aria-hidden="true" />
        </Button>
        <Button
          type="button"
          size="icon-sm"
          variant="ghost"
          aria-label="List view"
          aria-pressed={query.view === 'list'}
          className={cn(query.view === 'list' && 'bg-primary-tint text-primary')}
          onClick={() => router.push(shopHref({ ...query, view: 'list' }))}
        >
          <List className="size-4" aria-hidden="true" />
        </Button>
      </div>

      <div className="flex min-w-0 items-center gap-2">
        <span className="hidden text-sm text-copy sm:inline">Sort by:</span>
        <Select
          value={query.sort}
          onValueChange={(value) => {
            const sort = SHOP_SORTS.includes(value as ShopSort) ? (value as ShopSort) : 'featured';
            router.push(shopHref({ ...query, sort, page: 1 }));
          }}
        >
          <SelectTrigger
            aria-label="Sort products"
            className="h-10 w-[168px] rounded-xl border-border bg-surface font-medium text-ink sm:w-[188px]"
          >
            <SelectValue placeholder="Featured">{SHOP_SORT_LABELS[query.sort]}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {SHOP_SORTS.map((sort) => (
              <SelectItem key={sort} value={sort}>
                {SHOP_SORT_LABELS[sort]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
