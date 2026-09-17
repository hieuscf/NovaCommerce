import Link from 'next/link';
import { BarChart3, PackagePlus, ShoppingCart, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@novacommerce/ui/components/card';
import { cn } from '@/lib/utils';

const actions = [
  {
    href: '/products',
    label: 'Add Product',
    icon: PackagePlus,
    tone: 'bg-primary/10 text-primary',
  },
  {
    href: '/orders',
    label: 'Manage Orders',
    icon: ShoppingCart,
    tone: 'bg-success/12 text-success-strong',
  },
  {
    href: '/accounts',
    label: 'Manage Customers',
    icon: Users,
    tone: 'bg-warning/15 text-warning-strong',
  },
  {
    href: '/analytics',
    label: 'View Reports',
    icon: BarChart3,
    tone: 'bg-info/12 text-info-strong',
  },
] as const;

export function QuickActions() {
  return (
    <Card className="rounded-2xl shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-3 pt-0">
        {actions.map(({ href, label, icon: Icon, tone }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex flex-col items-center gap-2.5 rounded-xl border border-border bg-surface-subtle/60 px-3 py-4 text-center transition-all duration-150',
              'hover:border-primary/30 hover:bg-primary/5 hover:shadow-sm',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            )}
          >
            <span className={cn('flex size-10 items-center justify-center rounded-xl', tone)}>
              <Icon className="size-4" strokeWidth={1.75} aria-hidden="true" />
            </span>
            <span className="text-xs font-semibold text-foreground">{label}</span>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}
