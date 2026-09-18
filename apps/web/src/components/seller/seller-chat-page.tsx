import {
  filterSellerChatThreads,
  sellerChatThreads,
} from '@/lib/mock-data/seller-chat';
import type { SellerChatQuery } from '@/lib/url/seller-workspace-query';
import { SellerChatConversationList } from './seller-chat-conversation-list';
import { SellerChatThreadPanel } from './seller-chat-thread-panel';
import { SellerChatToolsRail } from './seller-chat-tools-rail';

export function SellerChatPage({ query }: { query: SellerChatQuery }) {
  if (query.tab === 'reviews') {
    return (
      <div className="rounded-2xl border border-border bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
          Đánh giá &amp; Phản hồi
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Khu vực quản lý đánh giá sản phẩm sẽ được bổ sung trong sprint tiếp theo.
        </p>
      </div>
    );
  }

  const threads = filterSellerChatThreads(sellerChatThreads, query);
  const selected =
    threads.find((thread) => thread.id === query.thread) ??
    sellerChatThreads.find((thread) => thread.id === query.thread) ??
    threads[0];

  return (
    <div className="grid h-[calc(100svh-7.5rem)] min-h-[640px] gap-4 xl:grid-cols-[300px_minmax(0,1fr)_300px]">
      <SellerChatConversationList
        query={query}
        threads={threads}
        selectedId={selected?.id}
      />
      <SellerChatThreadPanel thread={selected} />
      <div className="hidden xl:block">
        <SellerChatToolsRail thread={selected} />
      </div>
    </div>
  );
}
