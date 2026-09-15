import { Container } from '@novacommerce/ui/components/container';
import { OrderLoadingState } from '@/components/commerce/orders/order-states';

export default function OrderConfirmedLoading() {
  return (
    <div className="bg-page-canvas min-h-svh">
      <Container className="flex min-h-[60vh] items-center justify-center py-16">
        <OrderLoadingState />
      </Container>
    </div>
  );
}
