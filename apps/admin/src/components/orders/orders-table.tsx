'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  CheckCircle2,
  Clock3,
  MoreHorizontal,
  Package,
  Truck,
  XCircle,
} from 'lucide-react';
import { Avatar, AvatarFallback } from '@novacommerce/ui/components/avatar';
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
import {
  orderStatusLabel,
  paymentStatusLabel,
  type AdminOrder,
  type OrderStatus,
  type PaymentStatus,
} from '@/lib/mock-data/orders';

function PaymentBadge({ status }: { status: PaymentStatus }) {
  if (status === 'paid') {
    return (
      <Badge variant="success" className="gap-1 rounded-full">
        <CheckCircle2 className="size-3" aria-hidden="true" />
        {paymentStatusLabel[status]}
      </Badge>
    );
  }
  if (status === 'pending') {
    return (
      <Badge variant="info" className="gap-1 rounded-full">
        <Clock3 className="size-3" aria-hidden="true" />
        {paymentStatusLabel[status]}
      </Badge>
    );
  }
  if (status === 'refunded') {
    return (
      <Badge variant="secondary" className="gap-1 rounded-full">
        {paymentStatusLabel[status]}
      </Badge>
    );
  }
  return (
    <Badge variant="destructive" className="gap-1 rounded-full">
      <XCircle className="size-3" aria-hidden="true" />
      {paymentStatusLabel[status]}
    </Badge>
  );
}

function OrderStatusBadge({ status }: { status: OrderStatus }) {
  if (status === 'delivered') {
    return (
      <Badge variant="success" className="gap-1 rounded-full">
        <CheckCircle2 className="size-3" aria-hidden="true" />
        {orderStatusLabel[status]}
      </Badge>
    );
  }
  if (status === 'shipped') {
    return (
      <Badge variant="secondary" className="gap-1 rounded-full bg-violet-500/15 text-violet-700">
        <Truck className="size-3" aria-hidden="true" />
        {orderStatusLabel[status]}
      </Badge>
    );
  }
  if (status === 'processing') {
    return (
      <Badge variant="info" className="gap-1 rounded-full">
        <Package className="size-3" aria-hidden="true" />
        {orderStatusLabel[status]}
      </Badge>
    );
  }
  if (status === 'pending') {
    return (
      <Badge variant="warning" className="gap-1 rounded-full">
        <Clock3 className="size-3" aria-hidden="true" />
        {orderStatusLabel[status]}
      </Badge>
    );
  }
  return (
    <Badge variant="destructive" className="gap-1 rounded-full">
      <XCircle className="size-3" aria-hidden="true" />
      {orderStatusLabel[status]}
    </Badge>
  );
}

export function OrdersTable({ orders }: { orders: AdminOrder[] }) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const allSelected = orders.length > 0 && selected.size === orders.length;
  const someSelected = selected.size > 0 && selected.size < orders.length;

  function toggleAll(checked: boolean) {
    setSelected(checked ? new Set(orders.map((order) => order.id)) : new Set());
  }

  function toggleOne(id: string, checked: boolean) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  return (
    <Table density="dense" className="min-w-[1100px]">
      <TableHeader>
        <TableRow>
          <TableHead className="w-12">
            <Checkbox
              checked={allSelected ? true : someSelected ? 'indeterminate' : false}
              onCheckedChange={(value) => toggleAll(value === true)}
              aria-label="Select all orders"
            />
          </TableHead>
          <TableHead>Order #</TableHead>
          <TableHead>Customer</TableHead>
          <TableHead>Items</TableHead>
          <TableHead>Total Amount</TableHead>
          <TableHead>Payment Status</TableHead>
          <TableHead>Order Status</TableHead>
          <TableHead>Created At</TableHead>
          <TableHead className="w-14 text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {orders.map((order) => {
          const isSelected = selected.has(order.id);
          const visibleItems = order.items.slice(0, 3);
          const extraItems = Math.max(0, order.itemCount - visibleItems.length);

          return (
            <TableRow key={order.id} data-state={isSelected ? 'selected' : undefined}>
              <TableCell>
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={(value) => toggleOne(order.id, value === true)}
                  aria-label={`Select ${order.orderNumber}`}
                />
              </TableCell>
              <TableCell>
                <div className="min-w-0">
                  <Link
                    href={`/orders/${order.id}`}
                    className="text-sm font-semibold text-primary hover:underline"
                  >
                    #{order.orderNumber}
                  </Link>
                  <p className="text-caption text-muted-foreground">{order.source}</p>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex min-w-0 items-center gap-3">
                  <Avatar className="size-9">
                    <AvatarFallback
                      className="text-xs font-semibold text-white"
                      style={{ backgroundColor: order.customerAccent }}
                    >
                      {order.customerInitials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {order.customerName}
                    </p>
                    <p className="truncate text-caption text-muted-foreground">
                      {order.customerEmail}
                    </p>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {visibleItems.map((item) => (
                      <span
                        key={item.id}
                        className="flex size-8 items-center justify-center rounded-lg border-2 border-card text-[10px] font-bold text-white shadow-sm"
                        style={{ backgroundColor: item.accent }}
                        aria-hidden="true"
                      >
                        {item.initials}
                      </span>
                    ))}
                  </div>
                  <span className="whitespace-nowrap text-caption text-muted-foreground">
                    {extraItems > 0
                      ? `+ ${extraItems} item${extraItems === 1 ? '' : 's'}`
                      : `${order.itemCount} item${order.itemCount === 1 ? '' : 's'}`}
                  </span>
                </div>
              </TableCell>
              <TableCell className="whitespace-nowrap font-semibold text-foreground">
                {order.totalAmount}
              </TableCell>
              <TableCell>
                <PaymentBadge status={order.paymentStatus} />
              </TableCell>
              <TableCell>
                <OrderStatusBadge status={order.orderStatus} />
              </TableCell>
              <TableCell className="whitespace-nowrap text-muted-foreground">
                {order.createdAt}
              </TableCell>
              <TableCell className="text-right">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`Actions for ${order.orderNumber}`}
                >
                  <MoreHorizontal className="size-4" />
                </Button>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
