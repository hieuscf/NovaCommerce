'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Check, Eye, X } from 'lucide-react';
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
  approvalStatusLabel,
  type ApprovalStatus,
  type SellerApplication,
} from '@/lib/mock-data/seller-approvals';

function StatusBadge({ status }: { status: ApprovalStatus }) {
  if (status === 'pending') {
    return (
      <Badge variant="warning" className="rounded-full">
        {approvalStatusLabel[status]}
      </Badge>
    );
  }
  if (status === 'approved') {
    return (
      <Badge variant="success" className="rounded-full">
        {approvalStatusLabel[status]}
      </Badge>
    );
  }
  return (
    <Badge variant="destructive" className="rounded-full">
      {approvalStatusLabel[status]}
    </Badge>
  );
}

function reviewHref(id: string) {
  return `/sellers/approvals/${id}`;
}

export function ApprovalsTable({ applications }: { applications: SellerApplication[] }) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const allSelected = applications.length > 0 && selected.size === applications.length;
  const someSelected = selected.size > 0 && selected.size < applications.length;

  return (
    <Table density="dense" className="min-w-[980px]">
      <TableHeader>
        <TableRow>
          <TableHead className="w-12">
            <Checkbox
              checked={allSelected ? true : someSelected ? 'indeterminate' : false}
              onCheckedChange={(value) =>
                setSelected(value === true ? new Set(applications.map((app) => app.id)) : new Set())
              }
              aria-label="Select all applications"
            />
          </TableHead>
          <TableHead>Seller</TableHead>
          <TableHead>Shop Information</TableHead>
          <TableHead>Category</TableHead>
          <TableHead>Submitted At</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {applications.map((app) => {
          const isSelected = selected.has(app.id);
          const href = reviewHref(app.id);
          return (
            <TableRow key={app.id} data-state={isSelected ? 'selected' : undefined}>
              <TableCell>
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={(value) => {
                    setSelected((prev) => {
                      const next = new Set(prev);
                      if (value === true) next.add(app.id);
                      else next.delete(app.id);
                      return next;
                    });
                  }}
                  aria-label={`Select ${app.name}`}
                />
              </TableCell>
              <TableCell>
                <Link
                  href={href}
                  className="flex min-w-0 items-center gap-3 rounded-lg outline-none hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <Avatar className="size-9">
                    <AvatarFallback
                      className="text-xs font-semibold text-white"
                      style={{ backgroundColor: app.accent }}
                    >
                      {app.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground hover:underline">
                      {app.name}
                    </p>
                    <p className="truncate text-caption text-muted-foreground">{app.email}</p>
                  </div>
                </Link>
              </TableCell>
              <TableCell>
                <Link href={href} className="block min-w-0 hover:opacity-90">
                  <p className="truncate text-sm font-medium text-foreground hover:underline">
                    {app.shopName}
                  </p>
                  <p className="truncate text-caption text-muted-foreground">{app.displayId}</p>
                </Link>
              </TableCell>
              <TableCell>
                <Badge
                  variant="outline"
                  className="rounded-full border-transparent"
                  style={{
                    backgroundColor: `${app.categoryAccent}18`,
                    color: app.categoryAccent,
                  }}
                >
                  {app.categoryLabel}
                </Badge>
              </TableCell>
              <TableCell className="whitespace-nowrap text-muted-foreground">
                {app.submittedAt}
              </TableCell>
              <TableCell>
                <StatusBadge status={app.status} />
              </TableCell>
              <TableCell>
                <div className="flex items-center justify-end gap-1">
                  <Button
                    asChild
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="text-info-strong hover:bg-info/10 hover:text-info-strong"
                  >
                    <Link href={href} aria-label={`Review ${app.name}`}>
                      <Eye className="size-4" />
                    </Link>
                  </Button>
                  <Button
                    asChild
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="text-success-strong hover:bg-success/10 hover:text-success-strong"
                  >
                    <Link href={href} aria-label={`Approve ${app.name} after review`}>
                      <Check className="size-4" />
                    </Link>
                  </Button>
                  <Button
                    asChild
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="text-destructive-strong hover:bg-destructive/10 hover:text-destructive-strong"
                  >
                    <Link href={href} aria-label={`Reject ${app.name} after review`}>
                      <X className="size-4" />
                    </Link>
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
