import type {
  SellerOrdersQuery,
  SellerProductsQuery,
  SellerWorkspaceSection,
} from '@/lib/url/seller-workspace-query';
import { SellerDashboardPage } from './seller-dashboard-page';
import { SellerOrdersPage } from './seller-orders-page';
import { SellerProductsPage } from './seller-products-page';
import { SellerWorkspaceShell } from './seller-workspace-shell';

/**
 * Registered-seller workspace (presentation fixtures until the Seller Gateway
 * exists). Preview home with `/seller?demo=registered`, products with
 * `/seller?demo=registered&section=products`, orders with
 * `/seller?demo=registered&section=orders`.
 */
export function SellerRegisteredState({
  section = 'home',
  productsQuery,
  ordersQuery,
}: {
  section?: SellerWorkspaceSection;
  productsQuery?: SellerProductsQuery;
  ordersQuery?: SellerOrdersQuery;
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

  if (section === 'orders') {
    return (
      <SellerWorkspaceShell
        section="orders"
        contentClassName="mx-auto max-w-[1500px] space-y-6"
      >
        <SellerOrdersPage
          query={
            ordersQuery ?? {
              tab: 'all',
              status: 'all',
              range: 'all',
              page: 1,
            }
          }
        />
      </SellerWorkspaceShell>
    );
  }

  return <SellerDashboardPage />;
}
