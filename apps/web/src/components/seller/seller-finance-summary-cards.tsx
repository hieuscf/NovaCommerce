'use client';

import { useState } from 'react';
import { ArrowRight, Eye, EyeOff, Wallet } from 'lucide-react';
import { Button } from '@novacommerce/ui/components/button';
import { Card, CardContent, CardHeader, CardTitle } from '@novacommerce/ui/components/card';
import { cn } from '@/lib/utils';
import {
  sellerFinanceWallet,
  sellerLinkedBank,
  sellerMonthlyRevenue,
} from '@/lib/mock-data/seller-finance';

export function SellerFinanceSummaryCards() {
  const [balanceVisible, setBalanceVisible] = useState(true);
  const maxBar = Math.max(...sellerMonthlyRevenue.bars);

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,0.8fr)_minmax(0,0.8fr)]">
      <Card className="overflow-hidden rounded-2xl border-0 bg-gradient-to-br from-sky-600 via-blue-600 to-indigo-600 text-white shadow-md shadow-sky-500/20">
        <CardContent className="relative p-5 sm:p-6">
          <div className="pointer-events-none absolute -right-6 -bottom-8 opacity-30" aria-hidden="true">
            <Wallet className="size-36 rotate-12 text-white" strokeWidth={1.25} />
          </div>
          <div className="relative z-10 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-sky-100">Số dư khả dụng</p>
                <button
                  type="button"
                  className="rounded-lg p-1 text-sky-100 hover:bg-white/10"
                  aria-label={balanceVisible ? 'Ẩn số dư' : 'Hiện số dư'}
                  onClick={() => setBalanceVisible((prev) => !prev)}
                >
                  {balanceVisible ? (
                    <Eye className="size-4" aria-hidden="true" />
                  ) : (
                    <EyeOff className="size-4" aria-hidden="true" />
                  )}
                </button>
              </div>
              <p className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">
                {balanceVisible ? sellerFinanceWallet.availableBalance : '••••••••₫'}
              </p>
              <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-sm text-sky-100">
                <span>
                  Tổng doanh thu:{' '}
                  <span className="font-semibold text-white">
                    {sellerFinanceWallet.totalRevenue}
                  </span>
                </span>
                <span>
                  Đang xử lý:{' '}
                  <span className="font-semibold text-white">
                    {sellerFinanceWallet.processingAmount}
                  </span>
                </span>
              </div>
            </div>
            <Button
              type="button"
              size="sm"
              className="h-10 shrink-0 gap-1.5 rounded-xl bg-white text-sky-700 hover:bg-sky-50"
            >
              Rút tiền ngay
              <ArrowRight className="size-4" aria-hidden="true" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Tài khoản ngân hàng liên kết</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pt-0">
          <div className="flex items-center gap-3">
            <span
              className="flex size-12 shrink-0 items-center justify-center rounded-2xl text-xs font-bold text-white"
              style={{ backgroundColor: sellerLinkedBank.accent }}
              aria-hidden="true"
            >
              {sellerLinkedBank.initials}
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground">{sellerLinkedBank.bankName}</p>
              <p className="text-caption text-muted-foreground">{sellerLinkedBank.accountMasked}</p>
            </div>
          </div>
          <Button type="button" variant="link" className="h-auto gap-1 px-0 text-sky-600">
            Thay đổi tài khoản
            <ArrowRight className="size-3.5" aria-hidden="true" />
          </Button>
        </CardContent>
      </Card>

      <Card className="rounded-2xl shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Doanh thu tháng này</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-2xl font-bold tracking-tight text-foreground">
            {sellerMonthlyRevenue.amount}
          </p>
          <p
            className={cn(
              'mt-1 text-sm font-semibold',
              sellerMonthlyRevenue.changeTone === 'up' ? 'text-emerald-600' : 'text-rose-600',
            )}
          >
            {sellerMonthlyRevenue.change}
          </p>
          <div className="mt-4 flex h-14 items-end gap-1.5" aria-hidden="true">
            {sellerMonthlyRevenue.bars.map((value, index) => (
              <span
                key={`bar-${index}`}
                className="flex-1 rounded-t-md bg-sky-500/80"
                style={{ height: `${Math.max(18, (value / maxBar) * 100)}%` }}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
