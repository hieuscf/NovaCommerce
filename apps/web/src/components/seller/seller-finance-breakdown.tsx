import { Card, CardContent, CardHeader, CardTitle } from '@novacommerce/ui/components/card';
import { cn } from '@/lib/utils';
import {
  sellerFinanceMonthOptions,
  sellerRevenueBreakdown,
  sellerRevenueNetReceived,
} from '@/lib/mock-data/seller-finance';

export function SellerFinanceBreakdown({ month }: { month: string }) {
  const monthLabel =
    sellerFinanceMonthOptions.find((option) => option.value === month)?.label ?? 'Tháng 4/2025';

  return (
    <Card className="rounded-2xl shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Chi tiết doanh thu ({monthLabel})</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 pt-0">
        <ul className="space-y-3">
          {sellerRevenueBreakdown.map((item) => (
            <li key={item.id} className="flex items-start justify-between gap-3 text-sm">
              <span className="text-muted-foreground">{item.label}</span>
              <span
                className={cn(
                  'shrink-0 font-semibold',
                  item.tone === 'debit' ? 'text-rose-600' : 'text-foreground',
                )}
              >
                {item.amount}
              </span>
            </li>
          ))}
        </ul>
        <div className="rounded-2xl bg-sky-600 px-4 py-3 text-white shadow-sm shadow-sky-500/20">
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm font-medium text-sky-100">Thực nhận</span>
            <span className="text-lg font-bold tracking-tight">{sellerRevenueNetReceived}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
