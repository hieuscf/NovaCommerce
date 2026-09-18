import Link from 'next/link';
import {
  ArrowRight,
  BarChart3,
  Headset,
  Package,
  Percent,
  type LucideIcon,
} from 'lucide-react';
import { Button } from '@novacommerce/ui/components/button';
import { Card, CardContent, CardHeader, CardTitle } from '@novacommerce/ui/components/card';
import { cn } from '@/lib/utils';
import { sellerFeatureCards, type SellerFeatureCard } from '@/lib/mock-data/seller-dashboard';

const toneStyles: Record<SellerFeatureCard['tone'], { wrap: string; icon: string }> = {
  products: { wrap: 'bg-sky-50', icon: 'text-sky-600' },
  promotions: { wrap: 'bg-violet-50', icon: 'text-violet-600' },
  revenue: { wrap: 'bg-emerald-50', icon: 'text-emerald-600' },
  support: { wrap: 'bg-amber-50', icon: 'text-amber-600' },
};

const featureIcons: Record<string, LucideIcon> = {
  products: Package,
  promotions: Percent,
  revenue: BarChart3,
  support: Headset,
};

export function SellerDashboardFeatures() {
  return (
    <Card className="rounded-2xl shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Tính năng nổi bật</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {sellerFeatureCards.map((feature) => {
            const styles = toneStyles[feature.tone];
            const Icon = featureIcons[feature.id] ?? Package;
            return (
              <Link
                key={feature.id}
                href={feature.href}
                className="rounded-2xl border border-border p-4 transition-colors hover:bg-slate-50/80"
              >
                <span
                  className={cn(
                    'mb-3 flex size-10 items-center justify-center rounded-xl',
                    styles.wrap,
                  )}
                >
                  <Icon className={cn('size-4', styles.icon)} strokeWidth={1.75} />
                </span>
                <p className="text-sm font-semibold text-foreground">{feature.title}</p>
                <p className="mt-1 text-caption text-muted-foreground">{feature.description}</p>
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

export function SellerDashboardAdsPromo() {
  return (
    <Card className="overflow-hidden rounded-2xl border-amber-100 bg-gradient-to-br from-amber-50 via-orange-50 to-white shadow-sm">
      <CardContent className="relative flex h-full min-h-[180px] flex-col justify-between p-6">
        <div>
          <span className="mb-3 inline-flex size-10 items-center justify-center rounded-xl bg-amber-400 text-white shadow-sm">
            ★
          </span>
          <p className="max-w-[220px] text-lg font-bold tracking-tight text-slate-900">
            Gia tăng doanh số với NovaCommerce Ads
          </p>
          <p className="mt-2 max-w-[240px] text-caption text-slate-600">
            Tiếp cận khách hàng tiềm năng và đẩy nhanh tăng trưởng gian hàng của bạn.
          </p>
        </div>
        <div className="mt-4 flex items-end justify-between gap-3">
          <div className="flex h-14 items-end gap-1.5" aria-hidden="true">
            <span className="w-3 rounded-t bg-sky-200" style={{ height: '40%' }} />
            <span className="w-3 rounded-t bg-sky-300" style={{ height: '62%' }} />
            <span className="w-3 rounded-t bg-sky-400" style={{ height: '86%' }} />
            <span className="w-3 rounded-t bg-sky-500" style={{ height: '100%' }} />
          </div>
          <Button
            asChild
            size="icon"
            className="size-10 rounded-full bg-sky-600 text-white hover:bg-sky-600/90"
          >
            <Link href="/seller?demo=registered#ads" aria-label="Khám phá NovaCommerce Ads">
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
