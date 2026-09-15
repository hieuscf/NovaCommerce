'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Checkbox } from '@novacommerce/ui/components/checkbox';
import { Input } from '@novacommerce/ui/components/input';
import { Label } from '@novacommerce/ui/components/label';
import { RadioGroup, RadioGroupItem } from '@novacommerce/ui/components/radio-group';
import { Button } from '@novacommerce/ui/components/button';
import { shopHref, type ShopQuery } from '@/lib/url/shop-query';
import type { ShopFacets } from '@/lib/view-models/shop';
import { FilterSection } from './filter-section';

function toggleValue(values: readonly string[], value: string): string[] {
  return values.includes(value) ? values.filter((item) => item !== value) : [...values, value];
}

function FilterCheckRow({
  id,
  label,
  checked,
  onChange,
}: {
  id: string;
  label: string;
  checked: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <label
      htmlFor={id}
      className="flex min-h-11 cursor-pointer items-center gap-3 rounded-lg px-1 hover:bg-muted/70"
    >
      <Checkbox
        id={id}
        checked={checked}
        onCheckedChange={(value) => onChange(value === true)}
      />
      <span className="text-sm text-copy">{label}</span>
    </label>
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
  const [minPrice, setMinPrice] = useState(query.minPrice?.toString() ?? '');
  const [maxPrice, setMaxPrice] = useState(query.maxPrice?.toString() ?? '');

  function navigate(next: ShopQuery) {
    router.push(shopHref(next));
  }

  function applyPrice() {
    const min = minPrice === '' ? undefined : Number(minPrice);
    const max = maxPrice === '' ? undefined : Number(maxPrice);
    navigate({
      ...query,
      minPrice: min != null && Number.isFinite(min) ? min : undefined,
      maxPrice: max != null && Number.isFinite(max) ? max : undefined,
      page: 1,
    });
  }

  return (
    <div className="flex flex-col">
      <h2 className="text-base font-bold text-foreground">Filters</h2>

      <FilterSection title="Categories">
        {facets.categories.map((option) => (
          <FilterCheckRow
            key={option.slug}
            id={`${idPrefix}-category-${option.slug}`}
            label={option.name}
            checked={query.categories.includes(option.slug)}
            onChange={() =>
              navigate({
                ...query,
                categories: toggleValue(query.categories, option.slug),
                page: 1,
              })
            }
          />
        ))}
      </FilterSection>

      <FilterSection title="Brand">
        {facets.brands.map((option) => (
          <FilterCheckRow
            key={option.slug}
            id={`${idPrefix}-brand-${option.slug}`}
            label={option.name}
            checked={query.brands.includes(option.slug)}
            onChange={() =>
              navigate({
                ...query,
                brands: toggleValue(query.brands, option.slug),
                page: 1,
              })
            }
          />
        ))}
      </FilterSection>

      <FilterSection title="Price">
        <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-2 px-1">
          <div className="space-y-1.5">
            <Label htmlFor={`${idPrefix}-min-price`} className="text-xs text-muted-foreground">
              Min
            </Label>
            <Input
              id={`${idPrefix}-min-price`}
              type="number"
              inputMode="decimal"
              min={0}
              placeholder="0"
              value={minPrice}
              className="h-10"
              onChange={(event) => setMinPrice(event.target.value)}
            />
          </div>
          <span className="mb-2.5 text-muted-foreground" aria-hidden="true">
            —
          </span>
          <div className="space-y-1.5">
            <Label htmlFor={`${idPrefix}-max-price`} className="text-xs text-muted-foreground">
              Max
            </Label>
            <Input
              id={`${idPrefix}-max-price`}
              type="number"
              inputMode="decimal"
              min={0}
              placeholder="Any"
              value={maxPrice}
              className="h-10"
              onChange={(event) => setMaxPrice(event.target.value)}
            />
          </div>
        </div>
        <Button type="button" variant="secondary" size="sm" className="mt-3 w-full" onClick={applyPrice}>
          Apply price
        </Button>
      </FilterSection>

      <FilterSection title="Rating">
        <RadioGroup
          value={query.rating ? String(query.rating) : 'any'}
          onValueChange={(value) =>
            navigate({
              ...query,
              rating: value === '4' ? 4 : value === '3' ? 3 : undefined,
              page: 1,
            })
          }
          className="gap-0 px-1"
        >
          <label htmlFor={`${idPrefix}-rating-any`} className="flex min-h-11 cursor-pointer items-center gap-3">
            <RadioGroupItem id={`${idPrefix}-rating-any`} value="any" />
            <span className="text-sm text-copy">Any rating</span>
          </label>
          <label htmlFor={`${idPrefix}-rating-4`} className="flex min-h-11 cursor-pointer items-center gap-3">
            <RadioGroupItem id={`${idPrefix}-rating-4`} value="4" />
            <span className="text-sm text-copy">4★ &amp; up</span>
          </label>
          <label htmlFor={`${idPrefix}-rating-3`} className="flex min-h-11 cursor-pointer items-center gap-3">
            <RadioGroupItem id={`${idPrefix}-rating-3`} value="3" />
            <span className="text-sm text-copy">3★ &amp; up</span>
          </label>
        </RadioGroup>
      </FilterSection>

      <FilterSection title="Availability">
        <FilterCheckRow
          id={`${idPrefix}-in-stock`}
          label="In stock"
          checked={query.inStock}
          onChange={(checked) => navigate({ ...query, inStock: checked, page: 1 })}
        />
      </FilterSection>
    </div>
  );
}
