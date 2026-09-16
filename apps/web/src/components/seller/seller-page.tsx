import type { SellerPageViewModel } from '@/lib/view-models/seller';
import { SellerRegisterPage } from './seller-register-page';
import { SellerRegisteredState } from './seller-registered-state';

export function SellerPage({ page }: { page: SellerPageViewModel }) {
  if (page.status === 'registered') {
    return <SellerRegisteredState />;
  }

  return <SellerRegisterPage page={page} />;
}
