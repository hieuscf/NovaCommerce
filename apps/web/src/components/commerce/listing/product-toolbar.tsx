'use client';

import { useRouter } from 'next/navigation';
import { SlidersHorizontal } from 'lucide-react';
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
  formatResultRange,
  SHOP_PAGE_SIZE,
  SHOP_SORT_LABELS,
  SHOP_SORTS,
  type ShopFacets,
  type ShopSort,
} from '@/lib/view-models/shop';
import { FilterSidebar } from './filter-sidebar';

export function ProductToolbar({
  query,
  total,
  page,
  facets,
}: {
  query: ShopQuery;
  total: number;
  page: number;
  facets: ShopFacets;
}) {
  const router = useRouter();

  return (
    <div className="flex min-w-0 flex-wrap items-center justify-between gap-3 sm:flex-nowrap sm:justify-end">
      <p className="text-sm tabular-nums text-muted-foreground">
        {formatResultRange({ total, page, pageSize: SHOP_PAGE_SIZE })}
      </p>

      <Sheet>
        <SheetTrigger asChild>
          <Button type="button" variant="secondary" className="lg:hidden">
            <SlidersHorizontal className="size-4" aria-hidden="true" />
            Filters
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-full max-w-sm p-6">
          <SheetHeader className="p-0">
            <SheetTitle className="sr-only">Filters</SheetTitle>
          </SheetHeader>
          <FilterSidebar query={query} facets={facets} idPrefix="mobile-filters" />
        </SheetContent>
      </Sheet>

      <div className="flex min-w-0 items-center gap-2">
        <span className="hidden text-sm font-medium text-copy sm:inline">Sort by</span>
        <Select
          value={query.sort}
          onValueChange={(value) => {
            const sort = SHOP_SORTS.includes(value as ShopSort) ? (value as ShopSort) : 'featured';
            router.push(shopHref({ ...query, sort, page: 1 }));
          }}
        >
          <SelectTrigger
            aria-label="Sort products"
            className="h-11 w-[196px] rounded-xl border-border bg-surface font-medium text-ink sm:w-[220px]"
          >
            <SelectValue placeholder="Featured" />
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
