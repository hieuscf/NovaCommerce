'use client';

import { useState } from 'react';
import { ChevronRight, MapPin, Mail, Phone } from 'lucide-react';
import { Button } from '@novacommerce/ui/components/button';
import { Card, CardContent, CardHeader, CardTitle } from '@novacommerce/ui/components/card';
import {
  sellerChatAutoReplyDefault,
  sellerChatQuickVouchers,
  sellerChatTemplates,
  type SellerChatThread,
} from '@/lib/mock-data/seller-chat';

export function SellerChatToolsRail({ thread }: { thread: SellerChatThread | undefined }) {
  const [autoReplyEnabled, setAutoReplyEnabled] = useState(true);
  const [autoReply, setAutoReply] = useState(sellerChatAutoReplyDefault);

  return (
    <aside className="flex h-full min-h-0 flex-col gap-4 overflow-y-auto">
      <Card className="rounded-2xl shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Thông tin khách hàng</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 pt-0">
          {thread ? (
            <>
              <div className="flex items-center gap-3">
                <span
                  className="flex size-12 items-center justify-center rounded-full text-sm font-bold text-white"
                  style={{ backgroundColor: thread.accent }}
                  aria-hidden="true"
                >
                  {thread.initials}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-foreground">
                    {thread.customerName}
                  </p>
                  <p className="text-caption text-muted-foreground">{thread.city}</p>
                </div>
              </div>
              <div className="space-y-2 text-sm text-slate-600">
                <p className="flex items-center gap-2">
                  <Mail className="size-4 shrink-0 text-sky-600" aria-hidden="true" />
                  <span className="truncate">{thread.email}</span>
                </p>
                <p className="flex items-center gap-2">
                  <Phone className="size-4 shrink-0 text-sky-600" aria-hidden="true" />
                  {thread.phone}
                </p>
                <p className="flex items-center gap-2">
                  <MapPin className="size-4 shrink-0 text-sky-600" aria-hidden="true" />
                  {thread.city}
                </p>
              </div>
              <Button type="button" variant="outline" size="sm" className="w-full rounded-xl">
                Xem chi tiết
              </Button>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">Chưa chọn hội thoại.</p>
          )}
        </CardContent>
      </Card>

      <Card className="rounded-2xl shadow-sm">
        <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-base">Tin nhắn tự động</CardTitle>
          <button
            type="button"
            role="switch"
            aria-checked={autoReplyEnabled}
            aria-label="Bật tin nhắn tự động"
            onClick={() => setAutoReplyEnabled((prev) => !prev)}
            className={
              autoReplyEnabled
                ? 'relative h-6 w-11 rounded-full bg-sky-600 transition-colors'
                : 'relative h-6 w-11 rounded-full bg-slate-200 transition-colors'
            }
          >
            <span
              className={
                autoReplyEnabled
                  ? 'absolute top-0.5 left-[22px] size-5 rounded-full bg-white shadow transition-all'
                  : 'absolute top-0.5 left-0.5 size-5 rounded-full bg-white shadow transition-all'
              }
            />
          </button>
        </CardHeader>
        <CardContent className="space-y-3 pt-0">
          <textarea
            value={autoReply}
            onChange={(event) => setAutoReply(event.target.value)}
            rows={4}
            disabled={!autoReplyEnabled}
            aria-label="Nội dung tin nhắn tự động"
            className="w-full resize-none rounded-xl border border-border bg-slate-50 px-3 py-2 text-sm text-foreground outline-none disabled:opacity-60"
          />
          <Button
            type="button"
            size="sm"
            disabled={!autoReplyEnabled}
            className="w-full rounded-xl bg-sky-600 text-white hover:bg-sky-600/90"
          >
            Lưu thay đổi
          </Button>
        </CardContent>
      </Card>

      <Card className="rounded-2xl shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Voucher nhanh</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2.5 pt-0">
          {sellerChatQuickVouchers.map((voucher) => (
            <div
              key={voucher.id}
              className="flex items-center justify-between gap-2 rounded-xl border border-border bg-slate-50/70 px-3 py-2.5"
            >
              <div className="min-w-0">
                <p className="font-mono text-sm font-bold text-sky-700">{voucher.code}</p>
                <p className="truncate text-caption text-muted-foreground">{voucher.title}</p>
              </div>
              <Button type="button" size="sm" variant="outline" className="h-8 shrink-0 rounded-lg">
                Gửi ngay
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="rounded-2xl shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Tin nhắn mẫu</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1 pt-0">
          {sellerChatTemplates.map((template) => (
            <button
              key={template.id}
              type="button"
              className="flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-foreground transition-colors hover:bg-slate-50"
            >
              {template.label}
              <ChevronRight className="size-4 text-muted-foreground" aria-hidden="true" />
            </button>
          ))}
        </CardContent>
      </Card>
    </aside>
  );
}
