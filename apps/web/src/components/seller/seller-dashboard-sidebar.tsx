'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
  BarChart3,
  ChevronDown,
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
import type { SellerWorkspaceSection } from '@/lib/url/seller-workspace-query';

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

export function SellerDashboardSidebar({
  section = 'home',
  onNavigate,
}: {
  section?: SellerWorkspaceSection;
  onNavigate?: () => void;
}) {
  const [openProducts, setOpenProducts] = useState(section === 'products');

  return (
    <aside className="flex h-full w-[260px] shrink-0 flex-col border-r border-border/80 bg-white">
      <nav className="flex-1 space-y-1 px-3 py-4" aria-label="Seller navigation">
        {sellerNavItems.map((item) => {
          const Icon = navIcons[item.icon];
          const active = item.section === section;
          const expanded = item.icon === 'products' ? openProducts || active : false;

          if (item.children?.length) {
            return (
              <div key={item.href} className="space-y-0.5">
                <button
                  type="button"
                  onClick={() => {
                    if (item.icon === 'products') setOpenProducts((prev) => !prev);
                  }}
                  className={cn(
                    'group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                    active
                      ? 'bg-sky-50 text-sky-700'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
                  )}
                  aria-expanded={expanded}
                >
                  <Icon className="size-4 shrink-0" strokeWidth={1.75} />
                  <span className="flex-1 truncate text-left">{item.label}</span>
                  <ChevronDown
                    className={cn(
                      'size-3.5 opacity-50 transition-transform',
                      expanded && 'rotate-180',
                    )}
                    aria-hidden="true"
                  />
                </button>
                {expanded ? (
                  <ul className="ml-4 space-y-0.5 border-l border-slate-200 py-1 pl-3">
                    {item.children.map((child) => {
                      const childActive =
                        child.section === section && !child.href.includes('#');
                      return (
                        <li key={child.href}>
                          <Link
                            href={child.href}
                            onClick={onNavigate}
                            aria-current={childActive ? 'page' : undefined}
                            className={cn(
                              'block rounded-lg px-3 py-2 text-sm transition-colors',
                              childActive
                                ? 'bg-sky-50 font-semibold text-sky-700'
                                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800',
                            )}
                          >
                            {child.label}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                ) : null}
              </div>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                active
                  ? 'bg-sky-50 text-sky-700'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
              )}
            >
              <Icon className="size-4 shrink-0" strokeWidth={1.75} />
              <span className="flex-1 truncate">{item.label}</span>
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
