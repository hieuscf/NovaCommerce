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
  sellersHref,
  type SellersQuery,
  type SellersSort,
  type SellersStatusFilter,
  type SellersVerifiedFilter,
} from '@/lib/url/sellers-query';

export function SellersFilters({ query }: { query: SellersQuery }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function navigate(next: Partial<SellersQuery>) {
    startTransition(() => {
      router.push(sellersHref({ ...query, page: 1, ...next }));
    });
  }

  return (
    <div
      className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm xl:flex-row xl:items-center"
      data-pending={pending || undefined}
    >
      <div className="min-w-0 flex-1">
        <Input
          key={query.q ?? ''}
          type="search"
          name="q"
          defaultValue={query.q ?? ''}
          placeholder="Search sellers by name, email, shop name or ID..."
          aria-label="Search sellers"
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
        value={query.status}
        onValueChange={(value) => navigate({ status: value as SellersStatusFilter })}
      >
        <SelectTrigger className="h-10 w-full xl:w-40" aria-label="Filter by status">
          <SelectValue placeholder="All Statuses" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Statuses</SelectItem>
          <SelectItem value="active">Active</SelectItem>
          <SelectItem value="pending">Pending</SelectItem>
          <SelectItem value="suspended">Suspended</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={query.verified}
        onValueChange={(value) => navigate({ verified: value as SellersVerifiedFilter })}
      >
        <SelectTrigger className="h-10 w-full xl:w-48" aria-label="Filter by verification">
          <SelectValue placeholder="All Verification Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Verification Status</SelectItem>
          <SelectItem value="verified">Verified</SelectItem>
          <SelectItem value="unverified">Not Verified</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={query.sort}
        onValueChange={(value) => navigate({ sort: value as SellersSort })}
      >
        <SelectTrigger className="h-10 w-full xl:w-44" aria-label="Sort sellers">
          <SelectValue placeholder="Newest First" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="newest">Newest First</SelectItem>
          <SelectItem value="oldest">Oldest First</SelectItem>
          <SelectItem value="sales_desc">Highest Sales</SelectItem>
          <SelectItem value="orders_desc">Most Orders</SelectItem>
        </SelectContent>
      </Select>

      <Button
        type="button"
        variant="outline"
        size="sm"
        className="h-10 gap-1.5 rounded-xl"
        onClick={() =>
          navigate({ q: undefined, status: 'all', verified: 'all', sort: 'newest' })
        }
      >
        <RotateCcw className="size-3.5" aria-hidden="true" />
        Reset
      </Button>
    </div>
  );
}
