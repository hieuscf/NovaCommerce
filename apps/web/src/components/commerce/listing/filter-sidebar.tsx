'use client';

import { useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { Star } from 'lucide-react';
import { Checkbox } from '@novacommerce/ui/components/checkbox';
import { clearShopFilters, hasActiveShopFilters, shopHref, type ShopQuery } from '@/lib/url/shop-query';
import { getShopChildCollections, type ShopFacets } from '@/lib/view-models/shop';
import { cn } from '@/lib/utils';
import { PriceRangeFilter } from './price-range-filter';

const VISIBLE_FACETS = 5;

function toggleValue(values: readonly string[], value: string): string[] {
  return values.includes(value) ? values.filter((item) => item !== value) : [...values, value];
}

function FilterCheckRow({
  id,
  label,
  count,
  checked,
  onChange,
}: {
  id: string;
  label: string;
  count?: number;
  checked: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <label htmlFor={id} className="flex min-h-9 cursor-pointer items-center gap-2.5 rounded-lg px-0.5">
      <Checkbox id={id} checked={checked} onCheckedChange={(value) => onChange(value === true)} />
      <span className="min-w-0 flex-1 truncate text-sm text-copy">{label}</span>
      {count != null ? (
        <span className="text-xs tabular-nums text-muted-foreground">{count}</span>
      ) : null}
    </label>
  );
}

function FacetList({
  items,
  renderItem,
}: {
  items: readonly { slug: string }[];
  renderItem: (slug: string, index: number) => ReactNode;
}) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? items : items.slice(0, VISIBLE_FACETS);

  return (
    <div className="space-y-1">
      {visible.map((item, index) => renderItem(item.slug, index))}
      {items.length > VISIBLE_FACETS ? (
        <button
          type="button"
          className="mt-1 px-0.5 text-sm font-medium text-primary hover:underline"
          onClick={() => setExpanded((current) => !current)}
        >
          {expanded ? 'Show less' : '+ Show more'}
        </button>
      ) : null}
    </div>
  );
}

export function FilterSidebar({
  query,
  facets,
  idPrefix = 'filters',
}: {
  query: ShopQuery;
  facets: ShopFacets;
  idPrefix?: string;
}) {
  const router = useRouter();
  const childCategories = query.collection ? getShopChildCollections(query.collection) : [];
  const filterChildren = childCategories.length > 0;
  const canClear = hasActiveShopFilters(query);

  function navigate(next: ShopQuery) {
    router.push(shopHref(next));
  }

  function onCategoryChange(slug: string, checked: boolean) {
    if (filterChildren) {
      navigate({
        ...query,
        categories: checked
          ? [...query.categories, slug]
          : query.categories.filter((item) => item !== slug),
        page: 1,
      });
      return;
    }

    if (checked) {
      navigate({
        ...query,
        collection: slug,
        categories: [],
        page: 1,
      });
      return;
    }

    navigate({
      ...query,
      collection: query.collection === slug ? undefined : query.collection,
      categories: query.categories.filter((item) => item !== slug),
      page: 1,
    });
  }

  return (
    <div className="flex flex-col">
      <div className="mb-5 flex items-center justify-between gap-3">
        <h2 className="text-base font-bold text-foreground">Filter</h2>
        {canClear ? (
          <button
            type="button"
            className="text-sm font-medium text-primary hover:underline"
            onClick={() => navigate(clearShopFilters(query))}
          >
            Clear all
          </button>
        ) : (
          <span className="text-sm text-muted-foreground">Clear all</span>
        )}
      </div>

      <section className="border-b border-border/70 py-4 first:pt-0">
        <h3 className="mb-3 text-sm font-semibold text-foreground">Price Range</h3>
        <PriceRangeFilter
          minPrice={query.minPrice}
          maxPrice={query.maxPrice}
          onCommit={({ minPrice, maxPrice }) => navigate({ ...query, minPrice, maxPrice, page: 1 })}
        />
      </section>

      <section className="border-b border-border/70 py-4">
        <h3 className="mb-3 text-sm font-semibold text-foreground">Brand</h3>
        <FacetList
          items={facets.brands}
          renderItem={(slug) => {
            const option = facets.brands.find((item) => item.slug === slug);
            if (!option) {
              return null;
            }
            return (
              <FilterCheckRow
                key={option.slug}
                id={`${idPrefix}-brand-${option.slug}`}
                label={option.name}
                count={option.count}
                checked={query.brands.includes(option.slug)}
                onChange={() =>
                  navigate({
                    ...query,
                    brands: toggleValue(query.brands, option.slug),
                    page: 1,
                  })
                }
              />
            );
          }}
        />
      </section>

      <section className="border-b border-border/70 py-4">
        <h3 className="mb-3 text-sm font-semibold text-foreground">Category</h3>
        <FacetList
          items={facets.categories}
          renderItem={(slug) => {
            const option = facets.categories.find((item) => item.slug === slug);
            if (!option) {
              return null;
            }
            const checked = filterChildren
              ? query.categories.includes(option.slug)
              : query.collection === option.slug || query.categories.includes(option.slug);
            return (
              <FilterCheckRow
                key={option.slug}
                id={`${idPrefix}-category-${option.slug}`}
                label={option.name}
                count={option.count}
                checked={checked}
                onChange={(next) => onCategoryChange(option.slug, next)}
              />
            );
          }}
        />
      </section>

      <section className="border-b border-border/70 py-4">
        <h3 className="mb-3 text-sm font-semibold text-foreground">Rating</h3>
        <div className="space-y-1">
          {(facets.ratings ?? []).map((option) => {
            const selected = query.rating === option.value;
            return (
              <button
                key={option.value}
                type="button"
                className={cn(
                  'flex min-h-9 w-full items-center gap-2 rounded-lg px-0.5 text-left',
                  selected && 'font-medium text-foreground',
                )}
                aria-pressed={selected}
                onClick={() =>
                  navigate({
                    ...query,
                    rating: selected ? undefined : option.value,
                    page: 1,
                  })
                }
              >
                <span className="flex items-center gap-0.5 text-warning" aria-hidden="true">
                  {Array.from({ length: 5 }, (_, index) => (
                    <Star
                      key={index}
                      className={cn(
                        'size-3.5',
                        index < option.value ? 'fill-current' : 'fill-transparent text-border',
                      )}
                    />
                  ))}
                </span>
                <span className="text-sm text-copy">& up</span>
                <span className="ml-auto text-xs tabular-nums text-muted-foreground">{option.count}</span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="py-4 last:pb-0">
        <h3 className="mb-3 text-sm font-semibold text-foreground">Availability</h3>
        <FilterCheckRow
          id={`${idPrefix}-in-stock`}
          label="In stock"
          count={facets.inStockCount}
          checked={query.inStock}
          onChange={(checked) => navigate({ ...query, inStock: checked, page: 1 })}
        />
      </section>
    </div>
  );
}
