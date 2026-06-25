'use client';

import { useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useRouter } from '@/i18n/navigation';
import { formatVnd } from '@/lib/mock/catalog';
import { useCartStore } from '@/lib/store/cart-store';

type Address = {
  id: string;
  fullName: string;
  phone: string;
  line1: string;
  district: string;
  city: string;
};

type ShippingMethod = {
  id: string;
  label: string;
  fee: number;
  eta: string;
};

const steps = ['address', 'shipping', 'payment', 'review'] as const;

const shippingMethods: ShippingMethod[] = [
  { id: 'standard', label: 'Giao tieu chuan', fee: 25000, eta: '2-4 ngay' },
  { id: 'fast', label: 'Giao nhanh', fee: 45000, eta: '1-2 ngay' },
  { id: 'express', label: 'Giao hoa toc', fee: 75000, eta: 'Trong ngay' },
];

const initialAddresses: Address[] = [
  {
    id: 'addr-1',
    fullName: 'Nguyen Van A',
    phone: '0901234567',
    line1: '123 Nguyen Trai',
    district: 'Quan 1',
    city: 'TP.HCM',
  },
];

export function CheckoutFlow() {
  const router = useRouter();
  const items = useCartStore((state) => state.items);
  const subtotal = useCartStore((state) => state.totalPrice);
  const clearCart = useCartStore((state) => state.clearCart);
  const [stepIndex, setStepIndex] = useState(0);
  const [addresses, setAddresses] = useState<Address[]>(initialAddresses);
  const [selectedAddressId, setSelectedAddressId] = useState(
    initialAddresses[0]?.id ?? '',
  );
  const [selectedShipping, setSelectedShipping] = useState(
    shippingMethods[0]?.id ?? 'standard',
  );
  const [paymentMethod, setPaymentMethod] = useState<'vnpay' | 'momo' | 'cod'>(
    'cod',
  );
  const [addressDraft, setAddressDraft] = useState<Omit<Address, 'id'>>({
    fullName: '',
    phone: '',
    line1: '',
    district: '',
    city: '',
  });

  const shippingFee =
    shippingMethods.find((method) => method.id === selectedShipping)?.fee ?? 0;
  const total = subtotal + shippingFee;
  const selectedAddress =
    addresses.find((address) => address.id === selectedAddressId) ?? null;

  const step = steps[stepIndex];
  const orderId = useMemo(() => `NC${Date.now().toString().slice(-8)}`, []);

  const nextStep = () =>
    setStepIndex((current) => Math.min(current + 1, steps.length - 1));
  const prevStep = () => setStepIndex((current) => Math.max(current - 1, 0));

  const addAddress = () => {
    if (
      !addressDraft.fullName.trim() ||
      !addressDraft.phone.trim() ||
      !addressDraft.line1.trim() ||
      !addressDraft.district.trim() ||
      !addressDraft.city.trim()
    ) {
      return;
    }

    const newAddress = {
      id: `addr-${Date.now()}`,
      ...addressDraft,
    };
    setAddresses((current) => [newAddress, ...current]);
    setSelectedAddressId(newAddress.id);
    setAddressDraft({
      fullName: '',
      phone: '',
      line1: '',
      district: '',
      city: '',
    });
  };

  const confirmOrder = () => {
    if (!selectedAddress || items.length === 0) {
      return;
    }

    clearCart();
    if (paymentMethod === 'vnpay') {
      router.push(`/checkout/success?order_id=${orderId}&payment=vnpay`);
      return;
    }
    if (paymentMethod === 'momo') {
      router.push(`/checkout/success?order_id=${orderId}&payment=momo`);
      return;
    }
    router.push(`/checkout/success?order_id=${orderId}&payment=cod`);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <section className="space-y-4 rounded-xl border p-4">
        <div className="flex flex-wrap gap-2">
          {steps.map((item, index) => (
            <span
              className={`rounded-full px-3 py-1 text-xs ${
                index <= stepIndex
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted'
              }`}
              key={item}
            >
              {index + 1}. {item}
            </span>
          ))}
        </div>

        {step === 'address' && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Address</h2>
            <div className="space-y-2">
              {addresses.map((address) => (
                <label
                  className="block rounded-lg border p-3 text-sm"
                  key={address.id}
                >
                  <input
                    checked={selectedAddressId === address.id}
                    className="mr-2"
                    onChange={() => setSelectedAddressId(address.id)}
                    type="radio"
                  />
                  {address.fullName} - {address.phone}, {address.line1},{' '}
                  {address.district}, {address.city}
                </label>
              ))}
            </div>

            <div className="grid gap-2 rounded-lg border border-dashed p-3 sm:grid-cols-2">
              <Input
                onChange={(event) =>
                  setAddressDraft((current) => ({
                    ...current,
                    fullName: event.target.value,
                  }))
                }
                placeholder="Ho ten"
                value={addressDraft.fullName}
              />
              <Input
                onChange={(event) =>
                  setAddressDraft((current) => ({
                    ...current,
                    phone: event.target.value,
                  }))
                }
                placeholder="So dien thoai"
                value={addressDraft.phone}
              />
              <Input
                className="sm:col-span-2"
                onChange={(event) =>
                  setAddressDraft((current) => ({
                    ...current,
                    line1: event.target.value,
                  }))
                }
                placeholder="Dia chi cu the"
                value={addressDraft.line1}
              />
              <Input
                onChange={(event) =>
                  setAddressDraft((current) => ({
                    ...current,
                    district: event.target.value,
                  }))
                }
                placeholder="Quan/Huyen"
                value={addressDraft.district}
              />
              <Input
                onChange={(event) =>
                  setAddressDraft((current) => ({
                    ...current,
                    city: event.target.value,
                  }))
                }
                placeholder="Tinh/Thanh pho"
                value={addressDraft.city}
              />
              <Button
                className="sm:col-span-2"
                onClick={addAddress}
                variant="outline"
              >
                Luu dia chi moi
              </Button>
            </div>
          </div>
        )}

        {step === 'shipping' && (
          <div className="space-y-3">
            <h2 className="text-lg font-semibold">Shipping method</h2>
            {shippingMethods.map((method) => (
              <label
                className="flex items-center justify-between rounded-lg border p-3"
                key={method.id}
              >
                <div className="text-sm">
                  <p className="font-medium">{method.label}</p>
                  <p className="text-muted-foreground">{method.eta}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold">
                    {formatVnd(method.fee)}
                  </span>
                  <input
                    checked={selectedShipping === method.id}
                    onChange={() => setSelectedShipping(method.id)}
                    type="radio"
                  />
                </div>
              </label>
            ))}
            <p className="text-sm text-muted-foreground">
              Phi ship cap nhat real-time theo phuong thuc duoc chon.
            </p>
          </div>
        )}

        {step === 'payment' && (
          <div className="space-y-3">
            <h2 className="text-lg font-semibold">Payment method</h2>
            <label className="flex items-center justify-between rounded-lg border p-3 text-sm">
              <span>VNPay redirect</span>
              <input
                checked={paymentMethod === 'vnpay'}
                onChange={() => setPaymentMethod('vnpay')}
                type="radio"
              />
            </label>
            <label className="flex items-center justify-between rounded-lg border p-3 text-sm">
              <span>MoMo deeplink</span>
              <input
                checked={paymentMethod === 'momo'}
                onChange={() => setPaymentMethod('momo')}
                type="radio"
              />
            </label>
            <label className="flex items-center justify-between rounded-lg border p-3 text-sm">
              <span>COD</span>
              <input
                checked={paymentMethod === 'cod'}
                onChange={() => setPaymentMethod('cod')}
                type="radio"
              />
            </label>
            {paymentMethod === 'momo' && (
              <p className="rounded bg-muted p-2 text-xs">
                Deeplink preview: momo://payment?amount={total}
              </p>
            )}
          </div>
        )}

        {step === 'review' && (
          <div className="space-y-3">
            <h2 className="text-lg font-semibold">Order review</h2>
            <div className="rounded-lg border p-3 text-sm">
              <p className="font-medium">Dia chi giao hang</p>
              <p className="text-muted-foreground">
                {selectedAddress
                  ? `${selectedAddress.fullName} - ${selectedAddress.phone}, ${selectedAddress.line1}, ${selectedAddress.district}, ${selectedAddress.city}`
                  : 'Chua chon dia chi'}
              </p>
            </div>
            <div className="rounded-lg border p-3 text-sm">
              <p className="font-medium">San pham</p>
              <ul className="mt-2 space-y-1 text-muted-foreground">
                {items.map((item) => (
                  <li key={item.id}>
                    {item.name} x{item.quantity} -{' '}
                    {formatVnd(item.unitPrice * item.quantity)}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        <div className="flex justify-between pt-2">
          <Button
            disabled={stepIndex === 0}
            onClick={prevStep}
            variant="outline"
          >
            Back
          </Button>
          {stepIndex < steps.length - 1 ? (
            <Button
              disabled={
                (step === 'address' && !selectedAddress) || items.length === 0
              }
              onClick={nextStep}
            >
              Continue
            </Button>
          ) : (
            <Button disabled={items.length === 0} onClick={confirmOrder}>
              Confirm order
            </Button>
          )}
        </div>
      </section>

      <aside className="h-fit space-y-2 rounded-xl border p-4 text-sm">
        <p className="font-semibold">Summary</p>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Subtotal</span>
          <span>{formatVnd(subtotal)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Shipping</span>
          <span>{formatVnd(shippingFee)}</span>
        </div>
        <div className="flex items-center justify-between border-t pt-2 font-semibold">
          <span>Total</span>
          <span>{formatVnd(total)}</span>
        </div>
      </aside>
    </div>
  );
}
