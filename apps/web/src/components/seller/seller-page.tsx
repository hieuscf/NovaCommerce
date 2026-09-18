import type { SellerPageViewModel } from '@/lib/view-models/seller';
import type {
  SellerOrdersQuery,
  SellerProductsQuery,
  SellerWorkspaceSection,
} from '@/lib/url/seller-workspace-query';
import { SellerRegisterPage } from './seller-register-page';
import { SellerRegisteredState } from './seller-registered-state';

export function SellerPage({
  page,
  section = 'home',
  productsQuery,
  ordersQuery,
}: {
  page: SellerPageViewModel;
  section?: SellerWorkspaceSection;
  productsQuery?: SellerProductsQuery;
  ordersQuery?: SellerOrdersQuery;
}) {
  if (page.status === 'registered') {
    return (
      <SellerRegisteredState
        section={section}
        productsQuery={productsQuery}
        ordersQuery={ordersQuery}
      />
    );
  }

  return <SellerRegisterPage page={page} />;
}
