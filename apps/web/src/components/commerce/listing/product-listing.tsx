import { ProductCard } from '@/components/commerce/product-card';
import { StoreTrustBar } from '@/components/commerce/store-trust-bar';
import type { ProductViewModel } from '@/lib/view-models/product';
import type { ShopFacets, ShopHeaderViewModel } from '@/lib/view-models/shop';
import type { ShopQuery } from '@/lib/url/shop-query';
import { CategoryHeader } from './category-header';
import { FilterSidebar } from './filter-sidebar';
import { ProductListingEmptyState } from './product-listing-empty';
import { ProductListingPagination } from './product-listing-pagination';
import { ProductToolbar } from './product-toolbar';
import { cn } from '@/lib/utils';

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
  const list = query.view === 'list';

  return (
    <div className="space-y-5">
      <CategoryHeader header={header} />

      <div className="grid items-start gap-8 lg:grid-cols-[250px_minmax(0,1fr)]">
        <aside className="hidden lg:block">
          <div className="sticky top-24 rounded-[1.75rem] border border-border/70 bg-surface p-5 shadow-card-soft">
            <FilterSidebar query={query} facets={facets} idPrefix="desktop-filters" />
          </div>
        </aside>

        <div className="min-w-0 space-y-5">
          <ProductToolbar query={query} total={total} facets={facets} />

          {products.length === 0 ? (
            <ProductListingEmptyState query={query} />
          ) : (
            <ul
              className={cn(
                list
                  ? 'grid grid-cols-1 gap-4'
                  : 'grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4 xl:gap-5',
              )}
            >
              {products.map((product) => (
                <li key={product.id} className="h-full">
                  <ProductCard product={product} variant={list ? 'row' : 'listing'} />
                </li>
              ))}
            </ul>
          )}

          <ProductListingPagination query={query} page={page} totalPages={totalPages} />
        </div>
      </div>

      <StoreTrustBar />
    </div>
  );
}
