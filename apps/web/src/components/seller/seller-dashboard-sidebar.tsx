'use client';

import Link from 'next/link';
import {
  BarChart3,
  ChevronRight,
  Headphones,
  Home,
  MoreHorizontal,
  Package,
  Percent,
  Settings,
  ShoppingBag,
  Store,
  Users,
  Wallet,
} from 'lucide-react';
import { Badge } from '@novacommerce/ui/components/badge';
import { Button } from '@novacommerce/ui/components/button';
import { cn } from '@/lib/utils';
import { sellerNavItems, sellerShopProfile } from '@/lib/mock-data/seller-dashboard';

const navIcons = {
  home: Home,
  products: Package,
  orders: ShoppingBag,
  customers: Users,
  promotions: Percent,
  finance: Wallet,
  reports: BarChart3,
  settings: Settings,
} as const;

export function SellerDashboardSidebar({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <aside className="flex h-full w-[260px] shrink-0 flex-col border-r border-border/80 bg-white">
      <nav className="flex-1 space-y-1 px-3 py-4" aria-label="Seller navigation">
        {sellerNavItems.map((item) => {
          const Icon = navIcons[item.icon];
          const isHome = item.icon === 'home';

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              aria-current={isHome ? 'page' : undefined}
              className={cn(
                'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                isHome
                  ? 'bg-sky-50 text-sky-700'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
              )}
            >
              <Icon className="size-4 shrink-0" strokeWidth={1.75} />
              <span className="flex-1 truncate">{item.label}</span>
              {item.expandable ? (
                <ChevronRight className="size-3.5 opacity-50" aria-hidden="true" />
              ) : null}
            </Link>
          );
        })}
      </nav>

      <div className="space-y-3 px-3 pb-4">
        <div className="rounded-2xl border border-border bg-slate-50/80 p-3.5">
          <div className="flex items-start gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-sky-500 text-white shadow-sm">
              <Store className="size-4" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-1.5">
                <p className="truncate text-sm font-semibold text-foreground">
                  {sellerShopProfile.name}
                </p>
                <Badge variant="success" className="rounded-full text-[10px]">
                  Đã xác nhận
                </Badge>
              </div>
              <p className="mt-1 text-caption text-muted-foreground">
                Shop ID: {sellerShopProfile.shopId}
              </p>
              <p className="text-caption text-muted-foreground">
                Loại hình: {sellerShopProfile.businessType}
              </p>
            </div>
          </div>
          <Button
            asChild
            type="button"
            variant="link"
            size="sm"
            className="mt-2 h-auto px-0 text-sky-600"
          >
            <Link href="/seller?demo=registered#shop">Xem thông tin gian hàng →</Link>
          </Button>
        </div>

        <div className="rounded-2xl border border-sky-100 bg-gradient-to-br from-sky-50 to-indigo-50 p-3.5">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-xl bg-white text-sky-600 shadow-sm">
              <Headphones className="size-4" aria-hidden="true" />
            </span>
            <div>
              <p className="text-sm font-semibold text-foreground">Trung tâm trợ giúp</p>
              <p className="text-caption text-muted-foreground">Hỗ trợ 24/7</p>
            </div>
          </div>
        </div>

        <button
          type="button"
          className="flex w-full items-center justify-center gap-1 text-caption text-muted-foreground"
          aria-label="More sidebar options"
        >
          <MoreHorizontal className="size-4" />
        </button>
      </div>
    </aside>
  );
}
