'use client';

import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { RotateCcw, Search } from 'lucide-react';
import { Button } from '@novacommerce/ui/components/button';
import { Input } from '@novacommerce/ui/components/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@novacommerce/ui/components/select';
import {
  accountsHref,
  type AccountsQuery,
  type AccountsRoleFilter,
  type AccountsStatusFilter,
} from '@/lib/url/accounts-query';

export function AccountsFilters({ query }: { query: AccountsQuery }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function navigate(next: Partial<AccountsQuery>) {
    startTransition(() => {
      router.push(accountsHref({ ...query, page: 1, ...next }));
    });
  }

  return (
    <div
      className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm lg:flex-row lg:items-center"
      data-pending={pending || undefined}
    >
      <div className="min-w-0 flex-1">
        <Input
          key={query.q ?? ''}
          type="search"
          name="q"
          defaultValue={query.q ?? ''}
          placeholder="Search by name, email, or user ID..."
          aria-label="Search accounts"
          startAdornment={<Search className="size-4 text-muted-foreground" aria-hidden="true" />}
          className="h-10"
          groupClassName="rounded-xl"
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              navigate({ q: event.currentTarget.value });
            }
          }}
        />
      </div>

      <Select
        value={query.role}
        onValueChange={(value) => navigate({ role: value as AccountsRoleFilter })}
      >
        <SelectTrigger className="h-10 w-full lg:w-40" aria-label="Filter by role">
          <SelectValue placeholder="All Roles" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Roles</SelectItem>
          <SelectItem value="customer">Customer</SelectItem>
          <SelectItem value="admin">Admin</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={query.status}
        onValueChange={(value) => navigate({ status: value as AccountsStatusFilter })}
      >
        <SelectTrigger className="h-10 w-full lg:w-40" aria-label="Filter by status">
          <SelectValue placeholder="All Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="active">Active</SelectItem>
          <SelectItem value="inactive">Inactive</SelectItem>
          <SelectItem value="blocked">Blocked</SelectItem>
        </SelectContent>
      </Select>

      <Button
        type="button"
        variant="outline"
        size="sm"
        className="h-10 gap-1.5 rounded-xl"
        onClick={() => navigate({ q: undefined, role: 'all', status: 'all' })}
      >
        <RotateCcw className="size-3.5" aria-hidden="true" />
        Reset
      </Button>
    </div>
  );
}
