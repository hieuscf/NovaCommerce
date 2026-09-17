import Link from 'next/link';
import { Badge } from '@novacommerce/ui/components/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@novacommerce/ui/components/card';
import {
  orderStatusBadgeVariant,
  orderStatusLabel,
  recentOrders,
} from '@/lib/mock-data/dashboard';

export function RecentOrdersTable() {
  return (
    <Card className="rounded-2xl shadow-sm">
      <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-base">Recent Orders</CardTitle>
        <Link
          href="/orders"
          className="text-xs font-semibold text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          View all
        </Link>
      </CardHeader>
      <CardContent className="px-0 pt-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[420px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-y border-border text-caption text-muted-foreground">
                <th className="px-6 py-2.5 font-medium">Order ID</th>
                <th className="px-3 py-2.5 font-medium">Customer</th>
                <th className="px-3 py-2.5 font-medium">Amount</th>
                <th className="px-3 py-2.5 font-medium">Status</th>
                <th className="px-6 py-2.5 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order) => (
                <tr key={order.id} className="border-b border-border/70 last:border-0">
                  <td className="px-6 py-3 font-semibold text-foreground">{order.id}</td>
                  <td className="px-3 py-3 text-muted-foreground">{order.customer}</td>
                  <td className="px-3 py-3 font-medium text-foreground">{order.amount}</td>
                  <td className="px-3 py-3">
                    <Badge variant={orderStatusBadgeVariant[order.status]}>
                      {orderStatusLabel[order.status]}
                    </Badge>
                  </td>
                  <td className="px-6 py-3 text-caption text-muted-foreground">{order.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
