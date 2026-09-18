'use client';

import { Copy, Lightbulb } from 'lucide-react';
import { Badge } from '@novacommerce/ui/components/badge';
import { Button } from '@novacommerce/ui/components/button';
import { Card, CardContent, CardHeader, CardTitle } from '@novacommerce/ui/components/card';
import {
  sellerLatestVouchers,
  sellerPromotionTip,
  sellerVoucherStatusLabel,
  type SellerVoucherStatus,
} from '@/lib/mock-data/seller-promotions';

function StatusBadge({ status }: { status: SellerVoucherStatus }) {
  if (status === 'active') {
    return (
      <Badge variant="success" className="rounded-full">
        {sellerVoucherStatusLabel[status]}
      </Badge>
    );
  }
  if (status === 'pending') {
    return (
      <Badge variant="warning" className="rounded-full">
        {sellerVoucherStatusLabel[status]}
      </Badge>
    );
  }
  return (
    <Badge variant="secondary" className="rounded-full">
      {sellerVoucherStatusLabel[status]}
    </Badge>
  );
}

export function SellerPromotionsVouchersRail() {
  return (
    <aside className="space-y-4">
      <Card className="rounded-2xl shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Mã giảm giá mới nhất</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 pt-0">
          {sellerLatestVouchers.map((voucher) => (
            <div
              key={voucher.id}
              className="rounded-2xl border border-border bg-slate-50/60 p-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-mono text-sm font-bold tracking-wide text-sky-700">
                    {voucher.code}
                  </p>
                  <p className="mt-0.5 truncate text-sm font-medium text-foreground">
                    {voucher.title}
                  </p>
                  <p className="text-caption text-muted-foreground">{voucher.meta}</p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`Sao chép mã ${voucher.code}`}
                  className="shrink-0 text-sky-600"
                  onClick={() => {
                    void navigator.clipboard?.writeText(voucher.code);
                  }}
                >
                  <Copy className="size-4" />
                </Button>
              </div>
              <div className="mt-2">
                <StatusBadge status={voucher.status} />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="rounded-2xl border-sky-100 bg-sky-50/80 shadow-sm">
        <CardContent className="flex gap-3 p-4">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-white text-sky-600 shadow-sm">
            <Lightbulb className="size-4" aria-hidden="true" />
          </span>
          <div>
            <p className="text-sm font-semibold text-foreground">Mẹo tối ưu khuyến mãi</p>
            <p className="mt-1 text-caption leading-relaxed text-slate-600">{sellerPromotionTip}</p>
          </div>
        </CardContent>
      </Card>
    </aside>
  );
}
