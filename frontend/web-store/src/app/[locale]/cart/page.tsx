import { Breadcrumbs } from '@/components/store/breadcrumbs';
import { CartPage } from '@/components/store/cart-page';

export default function CartRoutePage() {
  return (
    <div className="space-y-4">
      <Breadcrumbs
        items={[{ href: '/', label: 'Trang chu' }, { label: 'Gio hang' }]}
      />
      <h1 className="text-2xl font-semibold">Gio hang</h1>
      <CartPage />
    </div>
  );
}
