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
import { categoryOptions } from '@/lib/mock-data/seller-approvals';
import {
  approvalsHref,
  type ApprovalsQuery,
  type ApprovalsSort,
  type ApprovalsStatusFilter,
} from '@/lib/url/approvals-query';

export function ApprovalsFilters({ query }: { query: ApprovalsQuery }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function navigate(next: Partial<ApprovalsQuery>) {
    startTransition(() => {
      router.push(approvalsHref({ ...query, page: 1, ...next, id: query.id }));
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
          defaultValue={query.q ?? ''}
          placeholder="Search by name, email, shop name, or seller ID..."
          aria-label="Search applications"
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
        onValueChange={(value) => navigate({ status: value as ApprovalsStatusFilter })}
      >
        <SelectTrigger className="h-10 w-full xl:w-44" aria-label="Filter by status">
          <SelectValue placeholder="Pending Approval" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="pending">Pending Approval</SelectItem>
          <SelectItem value="approved">Approved</SelectItem>
          <SelectItem value="rejected">Rejected</SelectItem>
          <SelectItem value="all">All Statuses</SelectItem>
        </SelectContent>
      </Select>

      <Select value={query.category} onValueChange={(value) => navigate({ category: value })}>
        <SelectTrigger className="h-10 w-full xl:w-44" aria-label="Filter by category">
          <SelectValue placeholder="All Categories" />
        </SelectTrigger>
        <SelectContent>
          {categoryOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={query.sort}
        onValueChange={(value) => navigate({ sort: value as ApprovalsSort })}
      >
        <SelectTrigger className="h-10 w-full xl:w-40" aria-label="Sort applications">
          <SelectValue placeholder="Newest First" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="newest">Newest First</SelectItem>
          <SelectItem value="oldest">Oldest First</SelectItem>
        </SelectContent>
      </Select>

      <Button
        type="button"
        variant="outline"
        size="sm"
        className="h-10 gap-1.5 rounded-xl"
        onClick={() =>
          navigate({
            q: undefined,
            status: 'pending',
            category: 'all',
            sort: 'newest',
          })
        }
      >
        <RotateCcw className="size-3.5" aria-hidden="true" />
        Reset
      </Button>
    </div>
  );
}
