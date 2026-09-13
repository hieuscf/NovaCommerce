import { CategorySection } from '@/components/marketing/category-section';
import { DarkPromoSection } from '@/components/marketing/dark-promo-section';
import { FeaturedProductsSection } from '@/components/marketing/featured-products-section';
import { HeroSection } from '@/components/marketing/hero-section';
import { ServiceBenefits } from '@/components/marketing/service-benefits';
import { SpecialOfferRail } from '@/components/marketing/special-offer-rail';
import { Container } from '@novacommerce/ui/components/container';

export default function HomePage() {
  return (
    <div className="bg-page-canvas min-h-svh">
      <Container size="wide" className="pb-8">
        <div className="grid gap-4 pr-0 xl:grid-cols-[minmax(0,1fr)_16.5rem] xl:pr-4">
          <HeroSection embedded />
          <SpecialOfferRail />
        </div>

        <div className="mt-4 grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_16.5rem]">
          <div className="flex min-w-0 flex-col gap-9">
            <ServiceBenefits embedded />
            <CategorySection embedded />
            <FeaturedProductsSection embedded />
          </div>
          <DarkPromoSection embedded />
        </div>
      </Container>
    </div>
  );
}
