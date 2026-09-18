import Link from 'next/link';
import {
  CalendarDays,
  Clock3,
  Gift,
  Megaphone,
  Plus,
  TicketPercent,
  type LucideIcon,
} from 'lucide-react';
import { Button } from '@novacommerce/ui/components/button';
import { Card, CardContent } from '@novacommerce/ui/components/card';
import { cn } from '@/lib/utils';
import {
  sellerPromotionTools,
  type SellerPromotionKind,
} from '@/lib/mock-data/seller-promotions';
import { sellerWorkspaceHref } from '@/lib/url/seller-workspace-query';

const toolIcons: Record<SellerPromotionKind, LucideIcon> = {
  vouchers: TicketPercent,
  flash_sale: Clock3,
  combo: Gift,
  campaigns: CalendarDays,
  ads: Megaphone,
};

const toolToneClass: Record<string, string> = {
  violet: 'bg-violet-50 text-violet-600',
  pink: 'bg-pink-50 text-pink-600',
  green: 'bg-emerald-50 text-emerald-600',
  orange: 'bg-orange-50 text-orange-600',
  blue: 'bg-sky-50 text-sky-600',
};

export function SellerPromotionsTools() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
      {sellerPromotionTools.map((tool) => {
        const Icon = toolIcons[tool.id];
        return (
          <Card key={tool.id} className="rounded-2xl shadow-sm">
            <CardContent className="flex h-full flex-col p-4">
              <span
                className={cn(
                  'flex size-10 items-center justify-center rounded-xl',
                  toolToneClass[tool.tone],
                )}
              >
                <Icon className="size-5" strokeWidth={1.75} aria-hidden="true" />
              </span>
              <p className="mt-3 text-sm font-semibold text-foreground">{tool.title}</p>
              <p className="mt-1 flex-1 text-caption leading-relaxed text-muted-foreground">
                {tool.description}
              </p>
              <Button
                asChild
                size="sm"
                variant="outline"
                className="mt-4 h-9 w-full gap-1.5 rounded-xl"
              >
                <Link href={sellerWorkspaceHref('promotions', { tab: tool.id })}>
                  <Plus className="size-3.5" aria-hidden="true" />
                  {tool.actionLabel}
                </Link>
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
