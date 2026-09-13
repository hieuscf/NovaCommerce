import { Card, CardContent, CardHeader, CardTitle } from '@novacommerce/ui/components/card';

const stats = [
  { label: 'Revenue', value: '$128,430', change: '+12.5%' },
  { label: 'Orders', value: '1,842', change: '+8.2%' },
  { label: 'Customers', value: '12,450', change: '+5.1%' },
  { label: 'Conversion', value: '3.8%', change: '+0.4%' },
];

export default function AdminHomePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Operational overview — denser, data-oriented admin experience.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="rounded-xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="mt-1 text-xs font-medium text-success">{stat.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="rounded-xl">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Admin modules will connect to the API Gateway. This shell shares the NovaCommerce design
            tokens while maintaining an operational, information-dense layout.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
