import type { SellerPageViewModel } from '@/lib/view-models/seller';
import type { SellerProductsQuery, SellerWorkspaceSection } from '@/lib/url/seller-workspace-query';
import { SellerRegisterPage } from './seller-register-page';
import { SellerRegisteredState } from './seller-registered-state';

export function SellerPage({
  page,
  section = 'home',
  productsQuery,
}: {
  page: SellerPageViewModel;
  section?: SellerWorkspaceSection;
  productsQuery?: SellerProductsQuery;
}) {
  if (page.status === 'registered') {
    return <SellerRegisteredState section={section} productsQuery={productsQuery} />;
  }

  return <SellerRegisterPage page={page} />;
}
