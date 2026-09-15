import { ProductCard } from '@/components/commerce/product-card';
import type { ProductViewModel } from '@/lib/view-models/product';
import type { ShopFacets, ShopHeaderViewModel } from '@/lib/view-models/shop';
import type { ShopQuery } from '@/lib/url/shop-query';
import { CategoryHeader } from './category-header';
import { FilterSidebar } from './filter-sidebar';
import { ProductListingEmptyState } from './product-listing-empty';
import { ProductListingPagination } from './product-listing-pagination';
import { ProductToolbar } from './product-toolbar';

export function ProductListing({
  query,
  header,
  facets,
  products,
  total,
  page,
  totalPages,
}: {
  query: ShopQuery;
  header: ShopHeaderViewModel;
  facets: ShopFacets;
  products: readonly ProductViewModel[];
  total: number;
  page: number;
  totalPages: number;
}) {
  return (
    <div className="space-y-5">
      <CategoryHeader header={header} />

      <div className="grid items-start gap-8 lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="hidden lg:block">
          <div className="sticky top-24 rounded-2xl border border-border/70 bg-surface p-5 shadow-card-soft">
            <FilterSidebar query={query} facets={facets} idPrefix="desktop-filters" />
          </div>
        </aside>

        <div className="min-w-0 space-y-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h1 className="text-[1.375rem] font-semibold tracking-tight text-foreground md:text-2xl">
              {header.title}
            </h1>
            <ProductToolbar query={query} total={total} page={page} facets={facets} />
          </div>

          {products.length === 0 ? (
            <ProductListingEmptyState />
          ) : (
            <ul className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4 xl:gap-5">
              {products.map((product) => (
                <li key={product.id} className="h-full">
                  <ProductCard product={product} variant="listing" />
                </li>
              ))}
            </ul>
          )}

          <ProductListingPagination query={query} page={page} totalPages={totalPages} />
        </div>
      </div>
    </div>
  );
}
