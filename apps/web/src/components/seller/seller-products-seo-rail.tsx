import Link from 'next/link';
import { CheckCircle2, TrendingUp } from 'lucide-react';
import { Button } from '@novacommerce/ui/components/button';
import { Card, CardContent, CardHeader, CardTitle } from '@novacommerce/ui/components/card';
import { sellerSeoBenefits, sellerSeoFocusProduct } from '@/lib/mock-data/seller-products';

export function SellerProductsSeoRail() {
  return (
    <aside className="space-y-4 xl:w-[300px] xl:shrink-0">
      <Card className="rounded-2xl shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Gợi ý SEO & Tối ưu sản phẩm</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pt-0">
          <div className="rounded-2xl border border-border bg-slate-50/80 p-3.5">
            <div className="flex items-center gap-3">
              <span
                className="flex size-11 items-center justify-center rounded-xl text-xs font-bold text-white"
                style={{ backgroundColor: sellerSeoFocusProduct.accent }}
                aria-hidden="true"
              >
                {sellerSeoFocusProduct.initials}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-foreground">
                  {sellerSeoFocusProduct.name}
                </p>
                <p className="text-caption text-muted-foreground">
                  Điểm: {sellerSeoFocusProduct.score}/100
                </p>
              </div>
            </div>

            <ul className="mt-3 space-y-2.5">
              {sellerSeoFocusProduct.tips.map((tip) => (
                <li key={tip.id} className="flex gap-2 text-sm text-slate-600">
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-sky-500" aria-hidden="true" />
                  <span>
                    {tip.text}
                    {tip.meta ? (
                      <span className="mt-0.5 block text-caption text-muted-foreground">
                        {tip.meta}
                      </span>
                    ) : null}
                  </span>
                </li>
              ))}
            </ul>

            <Button
              asChild
              size="sm"
              className="mt-4 w-full rounded-xl bg-sky-600 text-white hover:bg-sky-600/90"
            >
              <Link href={`/seller?demo=registered&section=products#edit-${sellerSeoFocusProduct.id}`}>
                Chỉnh sửa ngay
              </Link>
            </Button>
          </div>

          <div>
            <p className="text-sm font-semibold text-foreground">Lợi ích tối ưu SEO</p>
            <ul className="mt-2 space-y-2">
              {sellerSeoBenefits.map((benefit) => (
                <li key={benefit} className="flex items-start gap-2 text-sm text-slate-600">
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-500" aria-hidden="true" />
                  {benefit}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-sky-100 bg-sky-50 p-3.5">
            <div className="flex items-start gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-white text-sky-600 shadow-sm">
                <TrendingUp className="size-4" aria-hidden="true" />
              </span>
              <p className="text-caption leading-relaxed text-slate-600">
                Sản phẩm có điểm SEO tốt nhận được{' '}
                <span className="font-semibold text-sky-700">gấp 3–5 lần lượt xem</span> so với sản
                phẩm thông thường.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </aside>
  );
}
