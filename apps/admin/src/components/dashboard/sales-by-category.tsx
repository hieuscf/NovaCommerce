import {
  Flower2,
  Home,
  Laptop,
  Shirt,
  Dumbbell,
  type LucideIcon,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@novacommerce/ui/components/card';
import { salesByCategory } from '@/lib/mock-data/dashboard';

const categoryIcons: Record<string, LucideIcon> = {
  electronics: Laptop,
  fashion: Shirt,
  home: Home,
  sports: Dumbbell,
  beauty: Flower2,
};

export function SalesByCategory() {
  return (
    <Card className="rounded-2xl shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Sales by Category</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 pt-0">
        {salesByCategory.map((category) => {
          const Icon = categoryIcons[category.id] ?? Laptop;

          return (
            <div key={category.id} className="space-y-2">
              <div className="flex items-center gap-2.5">
                <span
                  className="flex size-8 items-center justify-center rounded-lg"
                  style={{ backgroundColor: `${category.accent}18`, color: category.accent }}
                >
                  <Icon className="size-3.5" strokeWidth={1.75} aria-hidden="true" />
                </span>
                <span className="flex-1 text-sm font-medium text-foreground">{category.label}</span>
                <span className="text-xs font-semibold text-muted-foreground">
                  {category.percent}%
                </span>
              </div>
              <div
                className="h-2 overflow-hidden rounded-full bg-muted"
                role="progressbar"
                aria-valuenow={category.percent}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`${category.label} sales share`}
              >
                <div
                  className="h-full rounded-full transition-[width] duration-500"
                  style={{ width: `${category.percent}%`, backgroundColor: category.accent }}
                />
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
