import {
  CalendarDays,
  Clock3,
  Gift,
  Megaphone,
  TicketPercent,
  type LucideIcon,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@novacommerce/ui/components/card';
import { cn } from '@/lib/utils';
import {
  sellerPromotionKindLabel,
  type SellerPromotionKind,
  type SellerTopProgram,
} from '@/lib/mock-data/seller-promotions';

const kindIcons: Record<SellerPromotionKind, LucideIcon> = {
  vouchers: TicketPercent,
  flash_sale: Clock3,
  combo: Gift,
  campaigns: CalendarDays,
  ads: Megaphone,
};

const kindToneClass: Record<SellerPromotionKind, string> = {
  vouchers: 'bg-violet-50 text-violet-600',
  flash_sale: 'bg-pink-50 text-pink-600',
  combo: 'bg-emerald-50 text-emerald-600',
  campaigns: 'bg-orange-50 text-orange-600',
  ads: 'bg-sky-50 text-sky-600',
};

export function SellerPromotionsTopPrograms({ programs }: { programs: SellerTopProgram[] }) {
  return (
    <Card className="rounded-2xl shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Top chương trình hiệu quả</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 pt-0">
        {programs.length === 0 ? (
          <p className="text-sm text-muted-foreground">Chưa có chương trình phù hợp bộ lọc.</p>
        ) : (
          programs.map((program) => {
            const Icon = kindIcons[program.kind];
            return (
              <div
                key={program.id}
                className="flex items-start gap-3 rounded-2xl border border-border bg-slate-50/60 p-3"
              >
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-sky-600 text-xs font-bold text-white">
                  {program.rank}
                </span>
                <span
                  className={cn(
                    'flex size-9 shrink-0 items-center justify-center rounded-xl',
                    kindToneClass[program.kind],
                  )}
                >
                  <Icon className="size-4" strokeWidth={1.75} aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-foreground">{program.name}</p>
                  <p className="text-caption text-muted-foreground">
                    {sellerPromotionKindLabel[program.kind]}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-caption text-muted-foreground">
                    <span>
                      Reach{' '}
                      <span className="font-semibold text-foreground">{program.reach}</span>
                    </span>
                    <span>
                      Đơn{' '}
                      <span className="font-semibold text-foreground">{program.orders}</span>
                    </span>
                    <span>
                      DT{' '}
                      <span className="font-semibold text-foreground">{program.revenue}</span>
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
