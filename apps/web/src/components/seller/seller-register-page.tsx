import { Container } from '@novacommerce/ui/components/container';
import type { SellerPageViewModel } from '@/lib/view-models/seller';
import { SellerRegisterAside } from './seller-register-aside';
import { SellerRegisterForm } from './seller-register-form';

export function SellerRegisterPage({ page }: { page: SellerPageViewModel }) {
  return (
    <div className="bg-page-canvas min-h-svh">
      <Container size="wide" className="py-8 lg:py-12">
        <div className="grid items-start gap-8 lg:grid-cols-[minmax(280px,0.9fr)_minmax(0,1.35fr)] lg:gap-10 xl:gap-14">
          <SellerRegisterAside />
          <div className="max-lg:order-first">
            <SellerRegisterForm page={page} />
          </div>
        </div>
      </Container>
    </div>
  );
}
