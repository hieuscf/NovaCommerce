import { CalendarDays } from 'lucide-react';
import { Button } from '@novacommerce/ui/components/button';
import { Card, CardContent, CardHeader, CardTitle } from '@novacommerce/ui/components/card';
import { sellerRevenueMeta, sellerRevenueSeries } from '@/lib/mock-data/seller-dashboard';

const WIDTH = 560;
const HEIGHT = 240;
const PAD = { top: 28, right: 16, bottom: 36, left: 36 };

function buildLinePath(values: number[], maxY: number) {
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

function buildAreaPath(values: number[], maxY: number) {
  const innerW = WIDTH - PAD.left - PAD.right;
  const innerH = HEIGHT - PAD.top - PAD.bottom;
  const baseline = PAD.top + innerH;
  const line = values
    .map((value, index) => {
      const x = PAD.left + (index / (values.length - 1)) * innerW;
      const y = PAD.top + innerH - (value / maxY) * innerH;
      return `${index === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(' ');
  const lastX = PAD.left + innerW;
  const firstX = PAD.left;
  return `${line} L ${lastX.toFixed(1)} ${baseline} L ${firstX.toFixed(1)} ${baseline} Z`;
}

export function SellerDashboardRevenueChart() {
  const values = sellerRevenueSeries.map((point) => point.value);
  const maxY = 45;
  const linePath = buildLinePath(values, maxY);
  const areaPath = buildAreaPath(values, maxY);
  const last = sellerRevenueSeries[sellerRevenueSeries.length - 1];
  const lastX =
    PAD.left + ((sellerRevenueSeries.length - 1) / (sellerRevenueSeries.length - 1)) * (WIDTH - PAD.left - PAD.right);
  const lastY = PAD.top + (HEIGHT - PAD.top - PAD.bottom) - ((last?.value ?? 0) / maxY) * (HEIGHT - PAD.top - PAD.bottom);

  return (
    <Card className="rounded-2xl shadow-sm">
      <CardHeader className="flex-row flex-wrap items-start justify-between gap-3 space-y-0 pb-2">
        <div>
          <CardTitle className="text-base">Doanh thu 7 ngày gần đây</CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">{sellerRevenueMeta.total}</span>{' '}
            <span className="font-semibold text-emerald-600">{sellerRevenueMeta.change}</span>
          </p>
        </div>
        <Button type="button" variant="outline" size="sm" className="gap-1.5 rounded-xl">
          <CalendarDays className="size-3.5" aria-hidden="true" />
          {sellerRevenueMeta.rangeLabel}
        </Button>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="w-full overflow-x-auto">
          <svg
            viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
            className="h-[220px] w-full min-w-[420px]"
            role="img"
            aria-label="Biểu đồ doanh thu 7 ngày gần đây"
          >
            <defs>
              <linearGradient id="sellerRevenueFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.02" />
              </linearGradient>
            </defs>
            <path d={areaPath} fill="url(#sellerRevenueFill)" />
            <path
              d={linePath}
              fill="none"
              stroke="#0ea5e9"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {sellerRevenueSeries.map((point, index) => {
              const x =
                PAD.left +
                (index / (sellerRevenueSeries.length - 1)) * (WIDTH - PAD.left - PAD.right);
              return (
                <text
                  key={point.date}
                  x={x}
                  y={HEIGHT - 10}
                  textAnchor="middle"
                  className="fill-slate-400 text-[10px]"
                >
                  {point.label}
                </text>
              );
            })}
            {last ? (
              <g>
                <circle cx={lastX} cy={lastY} r="5" fill="#0ea5e9" />
                <rect
                  x={lastX - 58}
                  y={lastY - 42}
                  width="116"
                  height="32"
                  rx="8"
                  fill="#0f172a"
                />
                <text
                  x={lastX}
                  y={lastY - 22}
                  textAnchor="middle"
                  className="fill-white text-[10px] font-medium"
                >
                  {last.label} · {last.value}Mđ
                </text>
              </g>
            ) : null}
          </svg>
        </div>
      </CardContent>
    </Card>
  );
}
