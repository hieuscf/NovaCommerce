import { CircleCheck } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Link } from '@/i18n/navigation';

type CheckoutSuccessPageProps = {
  searchParams: {
    order_id?: string;
    payment?: string;
  };
};

export default function CheckoutSuccessPage({
  searchParams,
}: CheckoutSuccessPageProps) {
  const orderId = searchParams.order_id ?? 'N/A';
  const payment = searchParams.payment ?? 'unknown';

  return (
    <div className="mx-auto max-w-xl rounded-xl border p-8 text-center">
      <CircleCheck className="mx-auto mb-3 size-12 text-emerald-600" />
      <h1 className="mb-2 text-2xl font-semibold">Dat hang thanh cong</h1>
      <p className="mb-1 text-sm text-muted-foreground">
        Ma don hang: {orderId}
      </p>
      <p className="mb-6 text-sm text-muted-foreground">
        Phuong thuc thanh toan: {payment}
      </p>
      <div className="flex justify-center gap-2">
        <Link href="/">
          <Button variant="outline">Ve trang chu</Button>
        </Link>
        <Link href="/account">
          <Button>Theo doi don hang</Button>
        </Link>
      </div>
    </div>
  );
}
