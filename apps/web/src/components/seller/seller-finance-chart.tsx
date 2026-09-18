import { Card, CardContent, CardHeader, CardTitle } from '@novacommerce/ui/components/card';
import {
  sellerFinanceChartHighlight,
  sellerFinanceChartSeries,
} from '@/lib/mock-data/seller-finance';

const WIDTH = 640;
const HEIGHT = 280;
const PAD = { top: 24, right: 20, bottom: 40, left: 44 };

export function SellerFinanceChart() {
  const maxY = 14;
  const innerW = WIDTH - PAD.left - PAD.right;
  const innerH = HEIGHT - PAD.top - PAD.bottom;
  const barWidth = Math.min(28, innerW / sellerFinanceChartSeries.length - 12);
  const highlightIndex = sellerFinanceChartSeries.findIndex(
    (point) => point.date === sellerFinanceChartHighlight.date,
  );

  const linePoints = sellerFinanceChartSeries.map((point, index) => {
    const x = PAD.left + (index / (sellerFinanceChartSeries.length - 1)) * innerW;
    const y = PAD.top + innerH - (point.revenue / maxY) * innerH;
    return { x, y, point };
  });

  const linePath = linePoints
    .map((item, index) => `${index === 0 ? 'M' : 'L'} ${item.x.toFixed(1)} ${item.y.toFixed(1)}`)
    .join(' ');

  return (
    <Card className="rounded-2xl shadow-sm">
      <CardHeader className="flex-row flex-wrap items-center justify-between gap-3 space-y-0 pb-2">
        <CardTitle className="text-base">Doanh thu &amp; Phí theo thời gian</CardTitle>
        <div className="flex flex-wrap items-center gap-4 text-caption text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-sky-500" aria-hidden="true" />
            Doanh thu
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="size-2.5 rounded-sm bg-violet-400" aria-hidden="true" />
            Phí
          </span>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="w-full overflow-x-auto">
          <svg
            viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
            className="h-[260px] w-full min-w-[480px]"
            role="img"
            aria-label="Biểu đồ doanh thu và phí theo thời gian"
          >
            {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
              const y = PAD.top + innerH * (1 - ratio);
              return (
                <line
                  key={ratio}
                  x1={PAD.left}
                  x2={WIDTH - PAD.right}
                  y1={y}
                  y2={y}
                  stroke="#E2E8F0"
                  strokeDasharray="4 4"
                />
              );
            })}

            {sellerFinanceChartSeries.map((point, index) => {
              const x =
                PAD.left + (index / (sellerFinanceChartSeries.length - 1)) * innerW - barWidth / 2;
              const height = (point.fee / maxY) * innerH;
              const y = PAD.top + innerH - height;
              return (
                <rect
                  key={`fee-${point.date}`}
                  x={x}
                  y={y}
                  width={barWidth}
                  height={height}
                  rx="6"
                  fill="#A78BFA"
                  opacity="0.85"
                />
              );
            })}

            <path
              d={linePath}
              fill="none"
              stroke="#0EA5E9"
              strokeWidth="2.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {linePoints.map((item) => (
              <circle
                key={`dot-${item.point.date}`}
                cx={item.x}
                cy={item.y}
                r="4.5"
                fill="#0EA5E9"
                stroke="#fff"
                strokeWidth="2"
              />
            ))}

            {sellerFinanceChartSeries.map((point, index) => {
              const x = PAD.left + (index / (sellerFinanceChartSeries.length - 1)) * innerW;
              return (
                <text
                  key={`label-${point.date}`}
                  x={x}
                  y={HEIGHT - 12}
                  textAnchor="middle"
                  className="fill-slate-400 text-[10px]"
                >
                  {point.label}
                </text>
              );
            })}

            {highlightIndex >= 0 ? (
              <g>
                <rect
                  x={linePoints[highlightIndex]!.x - 72}
                  y={linePoints[highlightIndex]!.y - 58}
                  width="144"
                  height="46"
                  rx="10"
                  fill="#0F172A"
                />
                <text
                  x={linePoints[highlightIndex]!.x}
                  y={linePoints[highlightIndex]!.y - 38}
                  textAnchor="middle"
                  className="fill-white text-[10px] font-medium"
                >
                  {sellerFinanceChartSeries[highlightIndex]!.label}
                </text>
                <text
                  x={linePoints[highlightIndex]!.x}
                  y={linePoints[highlightIndex]!.y - 22}
                  textAnchor="middle"
                  className="fill-sky-200 text-[10px]"
                >
                  DT {sellerFinanceChartHighlight.revenueLabel} · Phí{' '}
                  {sellerFinanceChartHighlight.feeLabel}
                </text>
              </g>
            ) : null}
          </svg>
        </div>
      </CardContent>
    </Card>
  );
}
