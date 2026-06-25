import { CircleAlert } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Link } from '@/i18n/navigation';

export default function CheckoutFailedPage() {
  return (
    <div className="mx-auto max-w-xl rounded-xl border p-8 text-center">
      <CircleAlert className="mx-auto mb-3 size-12 text-amber-500" />
      <h1 className="mb-2 text-2xl font-semibold">Thanh toan that bai</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Co loi xay ra trong qua trinh thanh toan. Vui long thu lai.
      </p>
      <div className="flex justify-center gap-2">
        <Link href="/checkout">
          <Button>Retry payment</Button>
        </Link>
        <Link href="/cart">
          <Button variant="outline">Quay lai gio hang</Button>
        </Link>
      </div>
    </div>
  );
}
