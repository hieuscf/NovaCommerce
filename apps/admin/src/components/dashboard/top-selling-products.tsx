import { TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@novacommerce/ui/components/card';
import { topSellingProducts } from '@/lib/mock-data/dashboard';

export function TopSellingProducts() {
  return (
    <Card className="rounded-2xl shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Top Selling Products</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 pt-0">
        {topSellingProducts.map((product) => (
          <div
            key={product.rank}
            className="flex items-center gap-3 rounded-xl px-1 py-1.5 transition-colors hover:bg-muted/40"
          >
            <span className="w-5 text-center text-xs font-bold text-muted-foreground">
              {product.rank}
            </span>
            <span
              className="flex size-10 shrink-0 items-center justify-center rounded-xl text-xs font-bold text-white shadow-sm"
              style={{ backgroundColor: product.accent }}
              aria-hidden="true"
            >
              {product.name.slice(0, 1)}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-foreground">{product.name}</p>
              <p className="text-caption text-muted-foreground">{product.units} units</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-foreground">{product.revenue}</p>
              <TrendingUp className="ml-auto size-3.5 text-success" aria-label="Trending up" />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
