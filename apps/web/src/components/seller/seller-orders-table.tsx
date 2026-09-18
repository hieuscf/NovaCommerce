'use client';

import { MoreHorizontal } from 'lucide-react';
import { Badge } from '@novacommerce/ui/components/badge';
import { Button } from '@novacommerce/ui/components/button';
import { Checkbox } from '@novacommerce/ui/components/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@novacommerce/ui/components/table';
import { cn } from '@/lib/utils';
import {
  sellerOrderStatusLabel,
  type SellerOrderFulfillmentStatus,
  type SellerOrderRow,
} from '@/lib/mock-data/seller-orders';

function StatusBadge({ status }: { status: SellerOrderFulfillmentStatus }) {
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

function ActionButton({
  order,
  onSelect,
}: {
  order: SellerOrderRow;
  onSelect: (id: string) => void;
}) {
  if (order.action === 'confirm') {
    return (
      <Button
        type="button"
        size="sm"
        className="h-8 rounded-lg bg-sky-600 px-3 text-white hover:bg-sky-600/90"
        onClick={() => onSelect(order.id)}
      >
        Xác nhận đơn
      </Button>
    );
  }
  if (order.action === 'prepare') {
    return (
      <Button
        type="button"
        size="sm"
        variant="outline"
        className="h-8 rounded-lg"
        onClick={() => onSelect(order.id)}
      >
        Chuẩn bị hàng
      </Button>
    );
  }
  if (order.action === 'track') {
    return (
      <Button
        type="button"
        size="sm"
        variant="outline"
        className="h-8 rounded-lg"
        onClick={() => onSelect(order.id)}
      >
        Theo dõi
      </Button>
    );
  }
  if (order.action === 'refund') {
    return (
      <Button
        type="button"
        size="sm"
        variant="outline"
        className="h-8 rounded-lg"
        onClick={() => onSelect(order.id)}
      >
        Xử lý hoàn
      </Button>
    );
  }
  return (
    <Button
      type="button"
      size="sm"
      variant="ghost"
      className="h-8 rounded-lg text-sky-700"
      onClick={() => onSelect(order.id)}
    >
      Xem chi tiết
    </Button>
  );
}

export function SellerOrdersTable({
  orders,
  selectedId,
  onSelect,
}: {
  orders: SellerOrderRow[];
  selectedId?: string;
  onSelect: (id: string) => void;
}) {
  return (
    <Table density="dense" className="min-w-[1080px]">
      <TableHeader>
        <TableRow>
          <TableHead className="w-12">
            <Checkbox aria-label="Chọn tất cả đơn hàng" />
          </TableHead>
          <TableHead>Sản phẩm</TableHead>
          <TableHead>Khách hàng</TableHead>
          <TableHead>Tổng tiền</TableHead>
          <TableHead>Trạng thái</TableHead>
          <TableHead>Vận chuyển</TableHead>
          <TableHead className="w-36 text-right">Thao tác</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {orders.map((order) => {
          const isSelected = selectedId === order.id;
          return (
            <TableRow
              key={order.id}
              data-state={isSelected ? 'selected' : undefined}
              className={cn('cursor-pointer', isSelected && 'bg-sky-50/60')}
              onClick={() => onSelect(order.id)}
            >
              <TableCell onClick={(event) => event.stopPropagation()}>
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={() => onSelect(order.id)}
                  aria-label={`Chọn ${order.orderNumber}`}
                />
              </TableCell>
              <TableCell>
                <div className="min-w-0 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold text-sky-700">{order.orderNumber}</p>
                    <p className="text-caption text-muted-foreground">{order.placedAt}</p>
                  </div>
                  <div className="flex min-w-0 items-center gap-3">
                    <span
                      className="flex size-11 shrink-0 items-center justify-center rounded-xl text-xs font-bold text-white"
                      style={{ backgroundColor: order.accent }}
                      aria-hidden="true"
                    >
                      {order.initials}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-foreground">
                        {order.productName}
                      </p>
                      <p className="text-caption text-muted-foreground">x{order.quantity}</p>
                    </div>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <p className="text-sm font-semibold text-foreground">{order.customerName}</p>
                <p className="text-caption text-muted-foreground">{order.customerPhone}</p>
                <p className="text-caption text-muted-foreground">{order.customerCity}</p>
              </TableCell>
              <TableCell>
                <p className="text-sm font-semibold text-foreground">{order.total}</p>
                <p className="text-caption text-muted-foreground">{order.paymentMethod}</p>
              </TableCell>
              <TableCell>
                <StatusBadge status={order.status} />
              </TableCell>
              <TableCell>
                {order.carrier ? (
                  <div>
                    <p className="text-sm font-medium text-foreground">{order.carrier}</p>
                    <p className="text-caption text-muted-foreground">{order.trackingCode}</p>
                    <button
                      type="button"
                      className="mt-0.5 text-caption font-medium text-sky-600 hover:underline"
                      onClick={(event) => {
                        event.stopPropagation();
                        onSelect(order.id);
                      }}
                    >
                      Xem hành trình
                    </button>
                  </div>
                ) : (
                  <p className="text-caption text-muted-foreground">Chưa có mã vận đơn</p>
                )}
              </TableCell>
              <TableCell className="text-right" onClick={(event) => event.stopPropagation()}>
                <div className="inline-flex items-center justify-end gap-1">
                  <ActionButton order={order} onSelect={onSelect} />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Thêm thao tác cho ${order.orderNumber}`}
                  >
                    <MoreHorizontal className="size-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
