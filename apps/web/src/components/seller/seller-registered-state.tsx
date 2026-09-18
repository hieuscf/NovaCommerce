import type {
  SellerChatQuery,
  SellerFinanceQuery,
  SellerOrdersQuery,
  SellerProductsQuery,
  SellerPromotionsQuery,
  SellerWorkspaceSection,
} from '@/lib/url/seller-workspace-query';
import { SellerChatPage } from './seller-chat-page';
import { SellerDashboardPage } from './seller-dashboard-page';
import { SellerFinancePage } from './seller-finance-page';
import { SellerOrdersPage } from './seller-orders-page';
import { SellerProductsPage } from './seller-products-page';
import { SellerPromotionsPage } from './seller-promotions-page';
import { SellerWorkspaceShell } from './seller-workspace-shell';

/**
 * Registered-seller workspace (presentation fixtures until the Seller Gateway
 * exists). Preview sections via `?demo=registered&section=...`.
 */
export function SellerRegisteredState({
  section = 'home',
  productsQuery,
  ordersQuery,
  financeQuery,
  promotionsQuery,
  chatQuery,
}: {
  section?: SellerWorkspaceSection;
  productsQuery?: SellerProductsQuery;
  ordersQuery?: SellerOrdersQuery;
  financeQuery?: SellerFinanceQuery;
  promotionsQuery?: SellerPromotionsQuery;
  chatQuery?: SellerChatQuery;
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

  if (section === 'finance') {
    return (
      <SellerWorkspaceShell
        section="finance"
        contentClassName="mx-auto max-w-[1400px] space-y-6"
      >
        <SellerFinancePage
          query={
            financeQuery ?? {
              tab: 'wallet',
              month: '2025-04',
            }
          }
        />
      </SellerWorkspaceShell>
    );
  }

  if (section === 'promotions') {
    return (
      <SellerWorkspaceShell
        section="promotions"
        contentClassName="mx-auto max-w-[1400px] space-y-6"
      >
        <SellerPromotionsPage
          query={
            promotionsQuery ?? {
              tab: 'all',
              range: '2025-04',
            }
          }
        />
      </SellerWorkspaceShell>
    );
  }

  if (section === 'chat') {
    return (
      <SellerWorkspaceShell
        section="chat"
        mainClassName="overflow-hidden py-4"
        contentClassName="mx-auto h-full max-w-[1600px]"
      >
        <SellerChatPage
          query={
            chatQuery ?? {
              tab: 'messages',
              inbox: 'all',
            }
          }
        />
      </SellerWorkspaceShell>
    );
  }

  return <SellerDashboardPage />;
}
