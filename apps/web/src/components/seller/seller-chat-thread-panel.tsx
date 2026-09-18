'use client';

import { useState } from 'react';
import {
  Image as ImageIcon,
  MessageSquareText,
  MoreHorizontal,
  Package,
  Paperclip,
  Send,
  Smile,
  TicketPercent,
  Zap,
} from 'lucide-react';
import { Button } from '@novacommerce/ui/components/button';
import { cn } from '@/lib/utils';
import type { SellerChatThread } from '@/lib/mock-data/seller-chat';

export function SellerChatThreadPanel({ thread }: { thread: SellerChatThread | undefined }) {
  const [draft, setDraft] = useState('');

  if (!thread) {
    return (
      <div className="flex h-full items-center justify-center rounded-2xl border border-border bg-white shadow-sm">
        <p className="text-sm text-muted-foreground">Chọn một hội thoại để bắt đầu trò chuyện.</p>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3">
        <div className="flex min-w-0 items-center gap-3">
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
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-foreground">{thread.customerName}</p>
            <p
              className={cn(
                'text-caption font-medium',
                thread.online ? 'text-emerald-600' : 'text-muted-foreground',
              )}
            >
              {thread.online ? '● Online' : '● Offline'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-2 rounded-xl border border-border bg-slate-50 px-2.5 py-1.5 sm:flex">
            <span
              className="flex size-8 items-center justify-center rounded-lg text-[10px] font-bold text-white"
              style={{ backgroundColor: thread.product.accent }}
              aria-hidden="true"
            >
              {thread.product.initials}
            </span>
            <div className="min-w-0">
              <p className="truncate text-caption font-semibold text-foreground">
                {thread.product.name}
              </p>
              <p className="text-[11px] text-muted-foreground">MS: {thread.product.sku}</p>
            </div>
          </div>
          <Button type="button" variant="ghost" size="icon-sm" aria-label="Thêm thao tác">
            <MoreHorizontal className="size-4" />
          </Button>
        </div>
      </div>

      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4">
        {thread.messages.map((message) => {
          const isSeller = message.role === 'seller';
          return (
            <div
              key={message.id}
              className={cn('flex flex-col gap-1', isSeller ? 'items-end' : 'items-start')}
            >
              <div
                className={cn(
                  'max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed sm:max-w-[75%]',
                  isSeller
                    ? 'rounded-br-md bg-sky-600 text-white'
                    : 'rounded-bl-md bg-slate-100 text-foreground',
                )}
              >
                {message.text ? <p>{message.text}</p> : null}
                {message.images?.length ? (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {message.images.map((image) => (
                      <span
                        key={`${message.id}-${image.label}`}
                        className="flex size-16 items-center justify-center rounded-xl border border-white/30 text-[10px] font-bold text-white shadow-sm"
                        style={{ backgroundColor: image.accent }}
                      >
                        {image.label}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>
              <span className="px-1 text-[11px] text-muted-foreground">{message.at}</span>
            </div>
          );
        })}
      </div>

      <div className="space-y-3 border-t border-border p-4">
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" size="sm" className="h-8 gap-1.5 rounded-lg">
            <TicketPercent className="size-3.5" aria-hidden="true" />
            Gửi voucher
          </Button>
          <Button type="button" variant="outline" size="sm" className="h-8 gap-1.5 rounded-lg">
            <Zap className="size-3.5" aria-hidden="true" />
            Tin nhắn tự động
          </Button>
          <Button type="button" variant="outline" size="sm" className="h-8 gap-1.5 rounded-lg">
            <MessageSquareText className="size-3.5" aria-hidden="true" />
            Mẫu tin nhắn
          </Button>
        </div>

        <div className="rounded-2xl border border-border bg-slate-50/80 p-3">
          <div className="mb-2 flex items-center gap-1">
            <Button type="button" variant="ghost" size="icon-sm" aria-label="Emoji">
              <Smile className="size-4" />
            </Button>
            <Button type="button" variant="ghost" size="icon-sm" aria-label="Đính kèm ảnh">
              <ImageIcon className="size-4" />
            </Button>
            <Button type="button" variant="ghost" size="icon-sm" aria-label="Đính kèm tệp">
              <Paperclip className="size-4" />
            </Button>
            <Button type="button" variant="ghost" size="icon-sm" aria-label="Gắn sản phẩm">
              <Package className="size-4" />
            </Button>
          </div>
          <textarea
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            rows={3}
            placeholder="Nhập tin nhắn..."
            aria-label="Nội dung tin nhắn"
            className="w-full resize-none rounded-xl border-0 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
          />
          <div className="mt-2 flex items-center justify-end gap-2">
            <Button type="button" variant="ghost" size="icon-sm" aria-label="Trả lời nhanh">
              <Zap className="size-4 text-amber-500" />
            </Button>
            <Button
              type="button"
              size="sm"
              className="h-9 gap-1.5 rounded-xl bg-sky-600 text-white hover:bg-sky-600/90"
            >
              <Send className="size-3.5" aria-hidden="true" />
              Gửi
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
