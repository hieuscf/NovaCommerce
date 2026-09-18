import type { SellerProductsQuery, SellerWorkspaceSection } from '@/lib/url/seller-workspace-query';
import { SellerDashboardPage } from './seller-dashboard-page';
import { SellerProductsPage } from './seller-products-page';
import { SellerWorkspaceShell } from './seller-workspace-shell';

/**
 * Registered-seller workspace (presentation fixtures until the Seller Gateway
 * exists). Preview home with `/seller?demo=registered`, products with
 * `/seller?demo=registered&section=products`.
 */
export function SellerRegisteredState({
  section = 'home',
  productsQuery,
}: {
  section?: SellerWorkspaceSection;
  productsQuery?: SellerProductsQuery;
}) {
  if (section === 'products') {
    return (
      <SellerWorkspaceShell
        section="products"
        contentClassName="mx-auto max-w-[1400px] space-y-6"
      >
        <SellerProductsPage
          query={
            productsQuery ?? {
              tab: 'all',
              category: 'all',
              page: 1,
            }
          }
        />
      </SellerWorkspaceShell>
    );
  }

  return <SellerDashboardPage />;
}
