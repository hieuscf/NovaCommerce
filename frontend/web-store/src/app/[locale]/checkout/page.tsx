import { Breadcrumbs } from '@/components/store/breadcrumbs';
import { CheckoutFlow } from '@/components/store/checkout-flow';

export default function CheckoutPage() {
  return (
    <div className="space-y-4">
      <Breadcrumbs
        items={[
          { href: '/', label: 'Trang chu' },
          { href: '/cart', label: 'Gio hang' },
          { label: 'Checkout' },
        ]}
      />
      <h1 className="text-2xl font-semibold">Checkout</h1>
      <CheckoutFlow />
    </div>
  );
}
