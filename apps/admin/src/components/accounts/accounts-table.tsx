'use client';

import { useState } from 'react';
import { Ban, CheckCircle2, MoreHorizontal, XCircle } from 'lucide-react';
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
  roleLabel,
  statusLabel,
  type AdminAccount,
  type AccountRole,
  type AccountStatus,
} from '@/lib/mock-data/accounts';

function RoleBadge({ role }: { role: AccountRole }) {
  return (
    <Badge variant={role === 'admin' ? 'secondary' : 'info'} className="rounded-full">
      {roleLabel[role]}
    </Badge>
  );
}

function StatusBadge({ status }: { status: AccountStatus }) {
  if (status === 'active') {
    return (
      <Badge variant="success" className="gap-1 rounded-full">
        <CheckCircle2 className="size-3" aria-hidden="true" />
        {statusLabel[status]}
      </Badge>
    );
  }
  if (status === 'blocked') {
    return (
      <Badge variant="destructive" className="gap-1 rounded-full">
        <Ban className="size-3" aria-hidden="true" />
        {statusLabel[status]}
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="rounded-full text-muted-foreground">
      {statusLabel[status]}
    </Badge>
  );
}

function VerifiedBadge({ verified }: { verified: boolean }) {
  if (verified) {
    return (
      <Badge variant="success" className="gap-1 rounded-full">
        <CheckCircle2 className="size-3" aria-hidden="true" />
        Verified
      </Badge>
    );
  }
  return (
    <Badge variant="destructive" className="gap-1 rounded-full">
      <XCircle className="size-3" aria-hidden="true" />
      Unverified
    </Badge>
  );
}

export function AccountsTable({ accounts }: { accounts: AdminAccount[] }) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const allSelected = accounts.length > 0 && selected.size === accounts.length;
  const someSelected = selected.size > 0 && selected.size < accounts.length;

  function toggleAll(checked: boolean) {
    setSelected(checked ? new Set(accounts.map((account) => account.id)) : new Set());
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
    <Table density="dense" className="min-w-[960px]">
      <TableHeader>
        <TableRow>
          <TableHead className="w-12">
            <Checkbox
              checked={allSelected ? true : someSelected ? 'indeterminate' : false}
              onCheckedChange={(value) => toggleAll(value === true)}
              aria-label="Select all accounts"
            />
          </TableHead>
          <TableHead>User</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Email Verified</TableHead>
          <TableHead>Last Login</TableHead>
          <TableHead>Created At</TableHead>
          <TableHead className="w-14 text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {accounts.map((account) => {
          const isSelected = selected.has(account.id);
          return (
            <TableRow key={account.id} data-state={isSelected ? 'selected' : undefined}>
              <TableCell>
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={(value) => toggleOne(account.id, value === true)}
                  aria-label={`Select ${account.name}`}
                />
              </TableCell>
              <TableCell>
                <div className="flex min-w-0 items-center gap-3">
                  <Avatar className="size-9">
                    <AvatarFallback
                      className="text-xs font-semibold text-white"
                      style={{ backgroundColor: account.accent }}
                    >
                      {account.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">{account.name}</p>
                    <p className="truncate text-caption text-muted-foreground">{account.email}</p>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <RoleBadge role={account.role} />
              </TableCell>
              <TableCell>
                <StatusBadge status={account.status} />
              </TableCell>
              <TableCell>
                <VerifiedBadge verified={account.emailVerified} />
              </TableCell>
              <TableCell className="whitespace-nowrap text-muted-foreground">
                {account.lastLogin}
              </TableCell>
              <TableCell className="whitespace-nowrap text-muted-foreground">
                {account.createdAt}
              </TableCell>
              <TableCell className="text-right">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`Actions for ${account.name}`}
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
