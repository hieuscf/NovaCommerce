import { Card, CardContent, CardHeader, CardTitle } from '@novacommerce/ui/components/card';
import { salesOverview } from '@/lib/mock-data/dashboard';

const WIDTH = 640;
const HEIGHT = 260;
const PAD = { top: 24, right: 16, bottom: 36, left: 48 };

function buildPath(values: number[], maxY: number) {
  const innerW = WIDTH - PAD.left - PAD.right;
  const innerH = HEIGHT - PAD.top - PAD.bottom;

  return values
    .map((value, index) => {
      const x = PAD.left + (index / (values.length - 1)) * innerW;
      const y = PAD.top + innerH - (value / maxY) * innerH;
      return `${index === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(' ');
}

export function SalesOverviewChart() {
  const maxY = 25000;
  const revenuePath = buildPath(
    salesOverview.map((point) => point.revenue),
    maxY,
  );
  const ordersPath = buildPath(
    salesOverview.map((point) => point.orders),
    maxY,
  );
  const yTicks = [0, 5000, 10000, 15000, 20000, 25000];
  const innerW = WIDTH - PAD.left - PAD.right;
  const innerH = HEIGHT - PAD.top - PAD.bottom;

  return (
    <Card className="rounded-2xl shadow-sm">
      <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base">Sales Overview</CardTitle>
        <div className="flex items-center gap-4 text-caption text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-indigo-500" aria-hidden="true" />
            Revenue
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-sky-400" aria-hidden="true" />
            Orders
          </span>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="w-full overflow-x-auto">
          <svg
            viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
            className="h-[240px] w-full min-w-[480px]"
            role="img"
            aria-label="Sales overview line chart comparing revenue and orders from September 16 to September 22"
          >
            {yTicks.map((tick) => {
              const y = PAD.top + innerH - (tick / maxY) * innerH;
              return (
                <g key={tick}>
                  <line
                    x1={PAD.left}
                    x2={WIDTH - PAD.right}
                    y1={y}
                    y2={y}
                    stroke="currentColor"
                    className="text-border"
                    strokeDasharray="4 4"
                  />
                  <text
                    x={PAD.left - 8}
                    y={y + 4}
                    textAnchor="end"
                    className="fill-muted-foreground text-[10px]"
                  >
                    {tick === 0 ? '$0' : `$${(tick / 1000).toFixed(0)}k`}
                  </text>
                </g>
              );
            })}

            <path d={revenuePath} fill="none" stroke="#6366F1" strokeWidth="2.5" strokeLinecap="round" />
            <path d={ordersPath} fill="none" stroke="#38BDF8" strokeWidth="2.5" strokeLinecap="round" />

            {salesOverview.map((point, index) => {
              const x = PAD.left + (index / (salesOverview.length - 1)) * innerW;
              return (
                <text
                  key={point.label}
                  x={x}
                  y={HEIGHT - 10}
                  textAnchor="middle"
                  className="fill-muted-foreground text-[10px]"
                >
                  {point.label}
                </text>
              );
            })}
          </svg>
        </div>
      </CardContent>
    </Card>
  );
}
