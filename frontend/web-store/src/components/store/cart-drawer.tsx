'use client';

import { X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Link } from '@/i18n/navigation';
import { formatVnd } from '@/lib/mock/catalog';
import { useCartStore } from '@/lib/store/cart-store';

export function CartDrawer() {
  const {
    items,
    totalItems,
    totalPrice,
    isDrawerOpen,
    closeDrawer,
    removeItem,
    updateQuantity,
  } = useCartStore((state) => state);

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-black/40 transition-opacity ${
          isDrawerOpen
            ? 'pointer-events-auto opacity-100'
            : 'pointer-events-none opacity-0'
        }`}
        onClick={closeDrawer}
      />
      <aside
        className={`fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col border-l bg-background shadow-2xl transition-transform duration-300 ${
          isDrawerOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div>
            <p className="font-semibold">Gio hang</p>
            <p className="text-xs text-muted-foreground">
              {totalItems} san pham
            </p>
          </div>
          <Button onClick={closeDrawer} size="icon-sm" variant="ghost">
            <X className="size-4" />
          </Button>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto p-4">
          {items.length === 0 ? (
            <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
              Gio hang hien dang trong.
            </p>
          ) : (
            items.map((item) => (
              <article className="rounded-lg border p-3" key={item.id}>
                <div className="mb-2 flex items-start justify-between gap-2">
                  <p className="text-sm font-medium">{item.name}</p>
                  <button
                    className="text-xs text-red-500 hover:underline"
                    onClick={() => removeItem(item.id)}
                    type="button"
                  >
                    Xoa
                  </button>
                </div>
                <p className="text-sm text-muted-foreground">
                  {formatVnd(item.unitPrice)}
                </p>
                <div className="mt-2 flex items-center justify-between">
                  <Input
                    className="w-20"
                    min={1}
                    onChange={(event) =>
                      updateQuantity(
                        item.id,
                        Number.parseInt(event.target.value, 10) ||
                          item.quantity,
                      )
                    }
                    type="number"
                    value={item.quantity}
                  />
                  <p className="text-sm font-semibold">
                    {formatVnd(item.unitPrice * item.quantity)}
                  </p>
                </div>
              </article>
            ))
          )}
        </div>

        <div className="space-y-3 border-t p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Tam tinh</p>
            <p className="font-semibold">{formatVnd(totalPrice)}</p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Link className="w-full" href="/cart" onClick={closeDrawer}>
              <Button className="w-full" variant="outline">
                Xem gio hang
              </Button>
            </Link>
            <Link className="w-full" href="/checkout" onClick={closeDrawer}>
              <Button className="w-full">Checkout</Button>
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
}
