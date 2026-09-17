'use client';

import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { RotateCcw, Search } from 'lucide-react';
import { Button } from '@novacommerce/ui/components/button';
import { Input } from '@novacommerce/ui/components/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@novacommerce/ui/components/select';
import { productBrands, productCategories } from '@/lib/mock-data/products';
import {
  productsHref,
  type ProductsQuery,
  type ProductsStatusFilter,
} from '@/lib/url/products-query';

export function ProductsFilters({ query }: { query: ProductsQuery }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function navigate(next: Partial<ProductsQuery>) {
    startTransition(() => {
      router.push(productsHref({ ...query, page: 1, ...next }));
    });
  }

  return (
    <div
      className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm lg:flex-row lg:items-center"
      data-pending={pending || undefined}
    >
      <div className="min-w-0 flex-1">
        <Input
          key={query.q ?? ''}
          type="search"
          name="q"
          defaultValue={query.q ?? ''}
          placeholder="Search by name, SKU, category, brand..."
          aria-label="Search products"
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
        <SelectTrigger className="h-10 w-full lg:w-44" aria-label="Filter by category">
          <SelectValue placeholder="All Categories" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Categories</SelectItem>
          {productCategories.map((category) => (
            <SelectItem key={category} value={category}>
              {category}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={query.brand} onValueChange={(value) => navigate({ brand: value })}>
        <SelectTrigger className="h-10 w-full lg:w-40" aria-label="Filter by brand">
          <SelectValue placeholder="All Brands" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Brands</SelectItem>
          {productBrands.map((brand) => (
            <SelectItem key={brand} value={brand}>
              {brand}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={query.status}
        onValueChange={(value) => navigate({ status: value as ProductsStatusFilter })}
      >
        <SelectTrigger className="h-10 w-full lg:w-40" aria-label="Filter by status">
          <SelectValue placeholder="All Statuses" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Statuses</SelectItem>
          <SelectItem value="active">Active</SelectItem>
          <SelectItem value="inactive">Inactive</SelectItem>
        </SelectContent>
      </Select>

      <Button
        type="button"
        variant="outline"
        size="sm"
        className="h-10 gap-1.5 rounded-xl"
        onClick={() =>
          navigate({ q: undefined, category: 'all', brand: 'all', status: 'all' })
        }
      >
        <RotateCcw className="size-3.5" aria-hidden="true" />
        Reset
      </Button>
    </div>
  );
}
