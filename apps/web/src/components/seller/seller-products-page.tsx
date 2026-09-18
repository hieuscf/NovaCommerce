import { filterSellerProducts, sellerProducts } from '@/lib/mock-data/seller-products';
import type { SellerProductsQuery } from '@/lib/url/seller-workspace-query';
import { SellerProductsKpiCards } from './seller-products-kpi-cards';
import { SellerProductsPagination } from './seller-products-pagination';
import { SellerProductsSeoRail } from './seller-products-seo-rail';
import { SellerProductsTable } from './seller-products-table';
import { SellerProductsToolbar } from './seller-products-toolbar';

export function SellerProductsPage({ query }: { query: SellerProductsQuery }) {
  const rows = filterSellerProducts(sellerProducts, query);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
          Quản lý sản phẩm
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Theo dõi trạng thái, tồn kho, điểm chất lượng và tối ưu SEO cho toàn bộ danh mục.
        </p>
      </div>

      <SellerProductsKpiCards />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_300px]">
        <div className="min-w-0 space-y-4">
          <SellerProductsToolbar query={query} />
          <div className="space-y-4">
            <SellerProductsTable products={rows} />
            <div className="rounded-2xl border border-border bg-white shadow-sm">
              <SellerProductsPagination query={query} />
            </div>
          </div>
        </div>
        <SellerProductsSeoRail />
      </div>
    </div>
  );
}
