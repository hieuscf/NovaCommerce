'use client';

import { Bell, Globe, Menu, Search } from 'lucide-react';
import { Avatar, AvatarFallback } from '@novacommerce/ui/components/avatar';
import { Button } from '@novacommerce/ui/components/button';
import { Input } from '@novacommerce/ui/components/input';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@novacommerce/ui/components/sheet';
import { NovaCommerceLogo } from '@novacommerce/ui/components/nova-commerce-logo';
import { useState } from 'react';
import { sellerShopProfile } from '@/lib/mock-data/seller-dashboard';
import type { SellerWorkspaceSection } from '@/lib/url/seller-workspace-query';
import { SellerDashboardSidebar } from './seller-dashboard-sidebar';

export function SellerDashboardTopbar({
  section = 'home',
}: {
  section?: SellerWorkspaceSection;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const searchPlaceholder =
    section === 'chat'
      ? 'Tìm kiếm tin nhắn, khách hàng, sản phẩm...'
      : section === 'promotions'
        ? 'Tìm kiếm khuyến mãi, sản phẩm, chiến dịch...'
        : section === 'finance'
          ? 'Tìm kiếm giao dịch, mã rút tiền, báo cáo...'
          : section === 'orders'
            ? 'Tìm kiếm đơn hàng, khách hàng, mã vận đơn...'
            : section === 'products'
              ? 'Tìm kiếm sản phẩm, đơn hàng, khách hàng...'
              : 'Tìm kiếm đơn hàng, sản phẩm, khách hàng...';

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-3 border-b border-border/80 bg-white/95 px-4 backdrop-blur-md lg:px-6">
      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon-sm" className="lg:hidden" aria-label="Mở menu">
            <Menu className="size-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[280px] border-0 p-0 sm:max-w-[280px]">
          <SheetHeader className="sr-only">
            <SheetTitle>Seller navigation</SheetTitle>
          </SheetHeader>
          <div className="border-b border-border px-4 py-3">
            <NovaCommerceLogo size={26} />
          </div>
          <SellerDashboardSidebar
            section={section}
            onNavigate={() => setMenuOpen(false)}
          />
        </SheetContent>
      </Sheet>

      <div className="hidden shrink-0 lg:block">
        <NovaCommerceLogo size={28} />
      </div>

      <div className="min-w-0 flex-1 lg:px-8">
        <Input
          type="search"
          placeholder={searchPlaceholder}
          aria-label="Tìm kiếm seller center"
          startAdornment={<Search className="size-4 text-muted-foreground" aria-hidden="true" />}
          className="h-10"
          groupClassName="mx-auto max-w-xl rounded-full border-border/80 bg-slate-50 shadow-none"
        />
      </div>

      <div className="flex shrink-0 items-center gap-1 sm:gap-2">
        <Button
          variant="ghost"
          size="icon-sm"
          className="relative"
          aria-label="Thông báo, 3 chưa đọc"
        >
          <Bell className="size-4" strokeWidth={1.75} />
          <span className="absolute top-1 right-1 flex size-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-white">
            3
          </span>
        </Button>

        <Button variant="ghost" size="sm" className="hidden gap-1.5 rounded-xl sm:inline-flex">
          <Globe className="size-4" strokeWidth={1.75} aria-hidden="true" />
          VI
        </Button>

        <div className="ml-1 flex items-center gap-2.5 rounded-full border border-border/70 py-1 pr-3 pl-1">
          <Avatar className="size-8">
            <AvatarFallback className="bg-sky-500 text-xs font-semibold text-white">
              {sellerShopProfile.initials}
            </AvatarFallback>
          </Avatar>
          <div className="hidden min-w-0 sm:block">
            <p className="truncate text-sm font-semibold text-foreground">{sellerShopProfile.name}</p>
            <p className="truncate text-[11px] text-muted-foreground">Gian hàng của bạn</p>
          </div>
        </div>
      </div>
    </header>
  );
}
