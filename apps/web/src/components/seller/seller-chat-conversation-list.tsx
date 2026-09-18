'use client';

import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { Filter, Search } from 'lucide-react';
import { Button } from '@novacommerce/ui/components/button';
import { Input } from '@novacommerce/ui/components/input';
import { cn } from '@/lib/utils';
import {
  sellerChatInboxTabs,
  type SellerChatThread,
} from '@/lib/mock-data/seller-chat';
import {
  sellerWorkspaceHref,
  type SellerChatInboxFilter,
  type SellerChatQuery,
} from '@/lib/url/seller-workspace-query';

export function SellerChatConversationList({
  query,
  threads,
  selectedId,
}: {
  query: SellerChatQuery;
  threads: SellerChatThread[];
  selectedId?: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function navigate(next: Partial<SellerChatQuery>) {
    startTransition(() => {
      router.push(sellerWorkspaceHref('chat', { ...query, ...next }));
    });
  }

  return (
    <div
      className="flex h-full min-h-0 flex-col rounded-2xl border border-border bg-white shadow-sm"
      data-pending={pending || undefined}
    >
      <div className="space-y-4 border-b border-border p-4">
        <div>
          <h1 className="text-xl font-extrabold tracking-tight text-foreground">
            Tin nhắn khách hàng
          </h1>
          <p className="mt-1 text-caption text-muted-foreground">
            Phản hồi nhanh để tăng tỷ lệ chuyển đổi và giữ chân khách hàng.
          </p>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {sellerChatInboxTabs.map((tab) => {
            const active = query.inbox === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => navigate({ inbox: tab.id as SellerChatInboxFilter })}
                className={cn(
                  'rounded-full px-3 py-1.5 text-sm font-medium transition-colors',
                  active
                    ? 'bg-sky-600 text-white shadow-sm'
                    : 'bg-slate-50 text-slate-600 ring-1 ring-border hover:bg-slate-100',
                )}
              >
                {tab.label}{' '}
                <span className={cn(active ? 'text-sky-100' : 'text-muted-foreground')}>
                  ({String(tab.count).padStart(2, '0')})
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex gap-2">
          <div className="min-w-0 flex-1">
            <Input
              key={query.q ?? ''}
              type="search"
              defaultValue={query.q ?? ''}
              placeholder="Tìm kiếm theo tên..."
              aria-label="Tìm hội thoại"
              startAdornment={
                <Search className="size-4 text-muted-foreground" aria-hidden="true" />
              }
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
          <Button type="button" variant="outline" size="sm" className="h-10 gap-1.5 rounded-xl">
            <Filter className="size-3.5" aria-hidden="true" />
            Bộ lọc
          </Button>
        </div>
      </div>

      <ul className="min-h-0 flex-1 space-y-1 overflow-y-auto p-2" aria-label="Danh sách hội thoại">
        {threads.length === 0 ? (
          <li className="px-3 py-8 text-center text-sm text-muted-foreground">
            Không có hội thoại phù hợp.
          </li>
        ) : (
          threads.map((thread) => {
            const active = thread.id === selectedId;
            return (
              <li key={thread.id}>
                <button
                  type="button"
                  onClick={() => navigate({ thread: thread.id })}
                  className={cn(
                    'flex w-full items-start gap-3 rounded-xl px-3 py-3 text-left transition-colors',
                    active ? 'bg-sky-50' : 'hover:bg-slate-50',
                  )}
                >
                  <span
                    className="relative flex size-11 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                    style={{ backgroundColor: thread.accent }}
                    aria-hidden="true"
                  >
                    {thread.initials}
                    {thread.online ? (
                      <span className="absolute right-0 bottom-0 size-2.5 rounded-full border-2 border-white bg-emerald-500" />
                    ) : null}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-semibold text-foreground">
                        {thread.customerName}
                      </p>
                      {thread.unreadCount > 0 ? (
                        <span className="flex size-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
                          {thread.unreadCount}
                        </span>
                      ) : null}
                      <span className="ml-auto shrink-0 text-caption text-muted-foreground">
                        {thread.lastAt}
                      </span>
                    </div>
                    <p className="mt-0.5 truncate text-caption text-muted-foreground">
                      {thread.lastMessage}
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <span
                        className="flex size-7 items-center justify-center rounded-lg text-[10px] font-bold text-white"
                        style={{ backgroundColor: thread.product.accent }}
                        aria-hidden="true"
                      >
                        {thread.product.initials}
                      </span>
                      <span className="truncate text-caption text-slate-500">
                        {thread.product.name}
                      </span>
                    </div>
                  </div>
                </button>
              </li>
            );
          })
        )}
      </ul>
    </div>
  );
}
