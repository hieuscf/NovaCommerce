import type { SellerPageViewModel } from '@/lib/view-models/seller';
import type {
  SellerChatQuery,
  SellerFinanceQuery,
  SellerOrdersQuery,
  SellerProductsQuery,
  SellerPromotionsQuery,
  SellerWorkspaceSection,
} from '@/lib/url/seller-workspace-query';
import { SellerRegisterPage } from './seller-register-page';
import { SellerRegisteredState } from './seller-registered-state';

export function SellerPage({
  page,
  section = 'home',
  productsQuery,
  ordersQuery,
  financeQuery,
  promotionsQuery,
  chatQuery,
}: {
  page: SellerPageViewModel;
  section?: SellerWorkspaceSection;
  productsQuery?: SellerProductsQuery;
  ordersQuery?: SellerOrdersQuery;
  financeQuery?: SellerFinanceQuery;
  promotionsQuery?: SellerPromotionsQuery;
  chatQuery?: SellerChatQuery;
}) {
  if (page.status === 'registered') {
    return (
      <SellerRegisteredState
        section={section}
        productsQuery={productsQuery}
        ordersQuery={ordersQuery}
        financeQuery={financeQuery}
        promotionsQuery={promotionsQuery}
        chatQuery={chatQuery}
      />
    );
  }

  return <SellerRegisterPage page={page} />;
}
