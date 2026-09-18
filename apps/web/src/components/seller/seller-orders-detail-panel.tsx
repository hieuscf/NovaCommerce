import {
  MapPin,
  Package,
  Phone,
  Printer,
  RotateCcw,
  User,
} from 'lucide-react';
import { Badge } from '@novacommerce/ui/components/badge';
import { Button } from '@novacommerce/ui/components/button';
import { Card, CardContent, CardHeader, CardTitle } from '@novacommerce/ui/components/card';
import { cn } from '@/lib/utils';
import {
  sellerOrderStatusLabel,
  type SellerOrderFulfillmentStatus,
  type SellerOrderRow,
} from '@/lib/mock-data/seller-orders';

function DetailStatusBadge({ status }: { status: SellerOrderFulfillmentStatus }) {
  if (status === 'pending_confirm') {
    return (
      <Badge variant="warning" className="rounded-full">
        {sellerOrderStatusLabel[status]}
      </Badge>
    );
  }
  if (status === 'awaiting_pickup') {
    return (
      <Badge variant="secondary" className="rounded-full bg-violet-500/15 text-violet-700">
        {sellerOrderStatusLabel[status]}
      </Badge>
    );
  }
  if (status === 'shipping') {
    return (
      <Badge variant="success" className="rounded-full">
        {sellerOrderStatusLabel[status]}
      </Badge>
    );
  }
  if (status === 'delivered') {
    return (
      <Badge variant="secondary" className="rounded-full bg-teal-500/15 text-teal-700">
        {sellerOrderStatusLabel[status]}
      </Badge>
    );
  }
  if (status === 'return_refund') {
    return (
      <Badge variant="secondary" className="rounded-full bg-orange-500/15 text-orange-700">
        {sellerOrderStatusLabel[status]}
      </Badge>
    );
  }
  return (
    <Badge variant="destructive" className="rounded-full">
      {sellerOrderStatusLabel[status]}
    </Badge>
  );
}

export function SellerOrdersDetailPanel({ order }: { order: SellerOrderRow | undefined }) {
  if (!order) {
    return (
      <aside className="xl:w-[340px] xl:shrink-0">
        <Card className="rounded-2xl shadow-sm">
          <CardContent className="p-6 text-sm text-muted-foreground">
            Chọn một đơn hàng để xem chi tiết.
          </CardContent>
        </Card>
      </aside>
    );
  }

  return (
    <aside className="space-y-4 xl:w-[340px] xl:shrink-0">
      <Card className="rounded-2xl shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-caption text-muted-foreground">Chi tiết đơn hàng</p>
              <CardTitle className="mt-1 text-lg">{order.orderNumber}</CardTitle>
            </div>
            <DetailStatusBadge status={order.status} />
          </div>
        </CardHeader>
        <CardContent className="space-y-5 pt-0">
          <div className="space-y-3">
            {order.items.map((item) => (
              <div key={`${order.id}-${item.name}`} className="flex items-center gap-3">
                <span
                  className="flex size-12 shrink-0 items-center justify-center rounded-xl text-xs font-bold text-white"
                  style={{ backgroundColor: item.accent }}
                  aria-hidden="true"
                >
                  {item.initials}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-foreground">{item.name}</p>
                  <p className="text-caption text-muted-foreground">x{item.quantity}</p>
                </div>
                <p className="text-sm font-semibold text-foreground">{item.price}</p>
              </div>
            ))}
          </div>

          <div className="space-y-2 rounded-2xl border border-border bg-slate-50/80 p-3.5 text-sm">
            <div className="flex items-center justify-between gap-3">
              <span className="text-muted-foreground">Tạm tính</span>
              <span className="font-medium text-foreground">{order.subtotal}</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-muted-foreground">Phí vận chuyển</span>
              <span className="font-medium text-foreground">{order.shippingFee}</span>
            </div>
            <div className="flex items-center justify-between gap-3 border-t border-border pt-2">
              <span className="font-semibold text-foreground">Tổng cộng</span>
              <span className="text-base font-bold text-sky-700">{order.total}</span>
            </div>
          </div>

          <div className="space-y-2.5">
            <p className="text-sm font-semibold text-foreground">Khách hàng</p>
            <div className="flex items-start gap-2.5 text-sm text-slate-600">
              <User className="mt-0.5 size-4 shrink-0 text-sky-600" aria-hidden="true" />
              <span>{order.customerName}</span>
            </div>
            <div className="flex items-start gap-2.5 text-sm text-slate-600">
              <Phone className="mt-0.5 size-4 shrink-0 text-sky-600" aria-hidden="true" />
              <span>{order.customerPhone}</span>
            </div>
            <div className="flex items-start gap-2.5 text-sm text-slate-600">
              <MapPin className="mt-0.5 size-4 shrink-0 text-sky-600" aria-hidden="true" />
              <span>{order.customerAddress}</span>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-semibold text-foreground">Vận chuyển</p>
            <div className="flex items-start gap-2.5 rounded-2xl border border-border bg-white p-3 text-sm text-slate-600">
              <Package className="mt-0.5 size-4 shrink-0 text-sky-600" aria-hidden="true" />
              <div>
                {order.carrier ? (
                  <p className="font-medium text-foreground">
                    {order.carrier}
                    {order.trackingCode ? ` · ${order.trackingCode}` : ''}
                  </p>
                ) : null}
                <p>{order.shippingNote}</p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            {order.status === 'pending_confirm' ? (
              <Button
                type="button"
                className="w-full rounded-xl bg-sky-600 text-white hover:bg-sky-600/90"
              >
                Xác nhận đơn
              </Button>
            ) : null}
            <Button type="button" variant="outline" className="w-full gap-1.5 rounded-xl">
              <Printer className="size-4" aria-hidden="true" />
              In nhãn vận đơn
            </Button>
            <Button type="button" variant="outline" className="w-full rounded-xl">
              Chuẩn bị hàng loạt
            </Button>
          </div>

          <div>
            <p className="mb-3 text-sm font-semibold text-foreground">Tiến trình đơn hàng</p>
            <ol className="space-y-0">
              {order.timeline.map((step, index) => {
                const isLast = index === order.timeline.length - 1;
                return (
                  <li key={step.id} className="relative flex gap-3 pb-4 last:pb-0">
                    {!isLast ? (
                      <span
                        className="absolute top-3 left-[7px] h-[calc(100%-4px)] w-px bg-slate-200"
                        aria-hidden="true"
                      />
                    ) : null}
                    <span
                      className={cn(
                        'relative z-10 mt-0.5 size-3.5 shrink-0 rounded-full border-2',
                        step.state === 'done' && 'border-sky-600 bg-sky-600',
                        step.state === 'current' && 'border-sky-600 bg-white',
                        step.state === 'upcoming' && 'border-slate-300 bg-white',
                      )}
                      aria-hidden="true"
                    />
                    <div className="min-w-0">
                      <p
                        className={cn(
                          'text-sm',
                          step.state === 'upcoming'
                            ? 'text-muted-foreground'
                            : 'font-medium text-foreground',
                        )}
                      >
                        {step.label}
                      </p>
                      {step.at ? (
                        <p className="text-caption text-muted-foreground">{step.at}</p>
                      ) : null}
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>

          <div className="rounded-2xl border border-orange-100 bg-orange-50/70 p-3.5">
            <div className="flex items-start gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-white text-orange-600 shadow-sm">
                <RotateCcw className="size-4" aria-hidden="true" />
              </span>
              <div>
                <p className="text-sm font-semibold text-foreground">Trả hàng / Hoàn tiền</p>
                <p className="mt-0.5 text-caption text-muted-foreground">
                  Theo dõi yêu cầu đổi trả và xử lý hoàn tiền nhanh chóng.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </aside>
  );
}
