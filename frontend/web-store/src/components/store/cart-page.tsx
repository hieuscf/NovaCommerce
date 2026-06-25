'use client';

import { useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Link } from '@/i18n/navigation';
import { formatVnd } from '@/lib/mock/catalog';
import { useCartStore } from '@/lib/store/cart-store';

const couponMap: Record<string, { type: 'percent' | 'fixed'; value: number }> =
  {
    SALE10: { type: 'percent', value: 10 },
    SAVE50000: { type: 'fixed', value: 50000 },
  };

export function CartPage() {
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [couponError, setCouponError] = useState('');

  const items = useCartStore((state) => state.items);
  const totalPrice = useCartStore((state) => state.totalPrice);
  const removeItem = useCartStore((state) => state.removeItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);

  const discount = useMemo(() => {
    if (!appliedCoupon) {
      return 0;
    }
    const config = couponMap[appliedCoupon];
    if (!config) {
      return 0;
    }
    if (config.type === 'percent') {
      return Math.round((totalPrice * config.value) / 100);
    }
    return config.value;
  }, [appliedCoupon, totalPrice]);

  const finalTotal = Math.max(0, totalPrice - discount);

  const applyCoupon = () => {
    const normalized = couponInput.trim().toUpperCase();
    if (!normalized) {
      setCouponError('Vui long nhap ma coupon.');
      return;
    }
    if (!couponMap[normalized]) {
      setCouponError('Coupon khong hop le.');
      setAppliedCoupon(null);
      return;
    }
    setAppliedCoupon(normalized);
    setCouponError('');
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <section className="space-y-3">
        {items.length === 0 ? (
          <p className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
            Gio hang cua ban dang trong. Hay them san pham tu trang chi tiet.
          </p>
        ) : (
          items.map((item) => (
            <article className="rounded-xl border p-4" key={item.id}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-muted-foreground">
                    Don gia: {formatVnd(item.unitPrice)}
                  </p>
                </div>
                <button
                  className="text-sm text-red-500 hover:underline"
                  onClick={() => removeItem(item.id)}
                  type="button"
                >
                  Remove
                </button>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <Input
                  className="w-24"
                  min={1}
                  onChange={(event) =>
                    updateQuantity(
                      item.id,
                      Number.parseInt(event.target.value, 10) || 1,
                    )
                  }
                  type="number"
                  value={item.quantity}
                />
                <p className="font-semibold">
                  {formatVnd(item.quantity * item.unitPrice)}
                </p>
              </div>
            </article>
          ))
        )}
      </section>

      <aside className="h-fit space-y-3 rounded-xl border p-4">
        <h2 className="text-lg font-semibold">Tong don hang</h2>
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Tam tinh</span>
            <span>{formatVnd(totalPrice)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Giam gia</span>
            <span>-{formatVnd(discount)}</span>
          </div>
          <div className="flex items-center justify-between border-t pt-2 font-semibold">
            <span>Thanh toan</span>
            <span>{formatVnd(finalTotal)}</span>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium">Coupon</p>
          <div className="flex gap-2">
            <Input
              onChange={(event) => setCouponInput(event.target.value)}
              placeholder="SALE10"
              value={couponInput}
            />
            <Button onClick={applyCoupon} variant="outline">
              Apply
            </Button>
          </div>
          {couponError && <p className="text-xs text-red-500">{couponError}</p>}
          {appliedCoupon && (
            <p className="text-xs text-emerald-600">
              Da ap dung coupon {appliedCoupon}.
            </p>
          )}
        </div>

        <Link className="block" href="/checkout">
          <Button className="w-full" disabled={items.length === 0}>
            Tien hanh checkout
          </Button>
        </Link>
      </aside>
    </div>
  );
}
