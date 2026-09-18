import Link from 'next/link';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { Button } from '@novacommerce/ui/components/button';
import { Card, CardContent } from '@novacommerce/ui/components/card';
import { sellerShopProfile } from '@/lib/mock-data/seller-dashboard';
import { SellerShopArt } from './seller-shop-art';

export function SellerDashboardWelcome() {
  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1.6fr)_minmax(240px,0.7fr)]">
      <Card className="overflow-hidden rounded-3xl border-sky-100 bg-gradient-to-br from-sky-50 via-indigo-50/70 to-white shadow-sm">
        <CardContent className="grid items-center gap-6 p-6 md:grid-cols-[minmax(0,1fr)_220px] md:p-7">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 md:text-[28px]">
              Xin chào, {sellerShopProfile.name}!
              <span className="mt-1 block text-xl font-bold text-sky-700 md:text-2xl">
                Chúc bạn kinh doanh hiệu quả cùng NovaCommerce!
              </span>
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate-600">
              Gian hàng của bạn đã được xác nhận. Bắt đầu đăng bán sản phẩm và quản lý đơn hàng ngay
              hôm nay!
            </p>
            <Button
              asChild
              size="sm"
              className="mt-5 gap-1.5 rounded-xl bg-sky-600 text-white hover:bg-sky-600/90"
            >
              <Link href="/seller?demo=registered#products">
                Đăng sản phẩm ngay
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </Button>
          </div>
          <div className="hidden md:block">
            <SellerShopArt />
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-3xl shadow-sm">
        <CardContent className="flex h-full flex-col justify-center p-6">
          <span className="mb-3 flex size-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
            <CheckCircle2 className="size-5" aria-hidden="true" />
          </span>
          <p className="text-base font-bold text-foreground">Gian hàng đã xác nhận</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Ngày tham gia {sellerShopProfile.joinedAt}
          </p>
          <Link
            href="/seller?demo=registered#shop"
            className="mt-4 text-sm font-semibold text-sky-600 hover:underline"
          >
            Xem chi tiết →
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
