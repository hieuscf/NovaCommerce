'use client';

import { useState } from 'react';
import { CheckCircle2, MoreHorizontal } from 'lucide-react';
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
  sellerStatusLabel,
  type AdminSeller,
  type SellerStatus,
} from '@/lib/mock-data/sellers';

function StatusBadge({ status }: { status: SellerStatus }) {
  if (status === 'active') {
    return (
      <Badge variant="success" className="rounded-full">
        {sellerStatusLabel[status]}
      </Badge>
    );
  }
  if (status === 'pending') {
    return (
      <Badge variant="warning" className="rounded-full">
        {sellerStatusLabel[status]}
      </Badge>
    );
  }
  return (
    <Badge variant="destructive" className="rounded-full">
      {sellerStatusLabel[status]}
    </Badge>
  );
}

function VerificationBadge({ verified }: { verified: boolean }) {
  if (verified) {
    return (
      <Badge variant="success" className="gap-1 rounded-full">
        <CheckCircle2 className="size-3" aria-hidden="true" />
        Verified
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="rounded-full text-muted-foreground">
      Not Verified
    </Badge>
  );
}

export function SellersTable({ sellers }: { sellers: AdminSeller[] }) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const allSelected = sellers.length > 0 && selected.size === sellers.length;
  const someSelected = selected.size > 0 && selected.size < sellers.length;

  function toggleAll(checked: boolean) {
    setSelected(checked ? new Set(sellers.map((seller) => seller.id)) : new Set());
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
              aria-label="Select all sellers"
            />
          </TableHead>
          <TableHead>Seller</TableHead>
          <TableHead>Shop Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Verification</TableHead>
          <TableHead>Joined Date</TableHead>
          <TableHead className="text-right">Total Orders</TableHead>
          <TableHead className="text-right">Total Sales</TableHead>
          <TableHead className="w-14 text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sellers.map((seller) => {
          const isSelected = selected.has(seller.id);
          return (
            <TableRow key={seller.id} data-state={isSelected ? 'selected' : undefined}>
              <TableCell>
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={(value) => toggleOne(seller.id, value === true)}
                  aria-label={`Select ${seller.name}`}
                />
              </TableCell>
              <TableCell>
                <div className="flex min-w-0 items-center gap-3">
                  <Avatar className="size-9">
                    <AvatarFallback
                      className="text-xs font-semibold text-white"
                      style={{ backgroundColor: seller.accent }}
                    >
                      {seller.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">{seller.name}</p>
                    <p className="truncate text-caption text-muted-foreground">{seller.displayId}</p>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">{seller.shopName}</p>
                  <p className="truncate text-caption text-muted-foreground">{seller.category}</p>
                </div>
              </TableCell>
              <TableCell className="whitespace-nowrap text-muted-foreground">
                {seller.email}
              </TableCell>
              <TableCell>
                <StatusBadge status={seller.status} />
              </TableCell>
              <TableCell>
                <VerificationBadge verified={seller.verified} />
              </TableCell>
              <TableCell className="whitespace-nowrap text-muted-foreground">
                {seller.joinedAt}
              </TableCell>
              <TableCell className="text-right font-medium tabular-nums text-foreground">
                {seller.totalOrders.toLocaleString()}
              </TableCell>
              <TableCell className="text-right font-semibold tabular-nums text-foreground">
                {seller.totalSales}
              </TableCell>
              <TableCell className="text-right">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`Actions for ${seller.name}`}
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
