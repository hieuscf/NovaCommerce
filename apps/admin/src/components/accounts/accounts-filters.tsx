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
  type AccountsStatusFilter,
} from '@/lib/url/accounts-query';

const STATUS_OPTIONS: { value: AccountsStatusFilter; label: string }[] = [
  { value: 'all', label: 'All Status' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'blocked', label: 'Blocked' },
];

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
          className="h-11"
          groupClassName="rounded-xl"
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              navigate({ q: event.currentTarget.value });
            }
          }}
        />
      </div>

      <div className="relative w-full shrink-0 lg:w-44">
        <span className="pointer-events-none absolute top-1.5 left-4 z-10 text-[10px] leading-none font-medium text-muted-foreground">
          Status
        </span>
        <Select
          value={query.status}
          onValueChange={(value) => navigate({ status: value as AccountsStatusFilter })}
        >
          <SelectTrigger
            className="h-11 w-full items-end pt-5 pb-1.5"
            aria-label="Filter by status"
          >
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent position="popper">
            {STATUS_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button
        type="button"
        variant="outline"
        size="sm"
        className="h-11 gap-1.5 rounded-xl"
        onClick={() => navigate({ q: undefined, status: 'all' })}
      >
        <RotateCcw className="size-3.5" aria-hidden="true" />
        Reset
      </Button>
    </div>
  );
}
