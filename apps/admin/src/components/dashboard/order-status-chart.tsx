import { Card, CardContent, CardHeader, CardTitle } from '@novacommerce/ui/components/card';
import { orderStatusSlices, orderStatusTotal } from '@/lib/mock-data/dashboard';

const SIZE = 180;
const STROKE = 22;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function OrderStatusChart() {
  let offset = 0;

  return (
    <Card className="rounded-2xl shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Order Status</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-5 pt-0">
        <div className="relative">
          <svg
            width={SIZE}
            height={SIZE}
            viewBox={`0 0 ${SIZE} ${SIZE}`}
            role="img"
            aria-label={`Order status distribution for ${orderStatusTotal.toLocaleString()} total orders`}
          >
            <g transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}>
              {orderStatusSlices.map((slice) => {
                const length = (slice.percent / 100) * CIRCUMFERENCE;
                const dashOffset = -offset;
                offset += length;

                return (
                  <circle
                    key={slice.id}
                    cx={SIZE / 2}
                    cy={SIZE / 2}
                    r={RADIUS}
                    fill="none"
                    stroke={slice.color}
                    strokeWidth={STROKE}
                    strokeDasharray={`${length} ${CIRCUMFERENCE - length}`}
                    strokeDashoffset={dashOffset}
                    strokeLinecap="butt"
                  />
                );
              })}
            </g>
          </svg>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
            <p className="text-xl font-bold tracking-tight text-foreground">
              {orderStatusTotal.toLocaleString()}
            </p>
            <p className="text-caption text-muted-foreground">Total Orders</p>
          </div>
        </div>

        <ul className="grid w-full grid-cols-1 gap-2 sm:grid-cols-2">
          {orderStatusSlices.map((slice) => (
            <li key={slice.id} className="flex items-center gap-2 text-xs">
              <span
                className="size-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: slice.color }}
                aria-hidden="true"
              />
              <span className="flex-1 truncate text-muted-foreground">{slice.label}</span>
              <span className="font-semibold text-foreground">{slice.percent.toFixed(1)}%</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
