'use client';

import { useEffect, useState } from 'react';
import { formatPriceBound, SHOP_PRICE_MAX } from '@/lib/view-models/shop';

export function PriceRangeFilter({
  minPrice,
  maxPrice,
  onCommit,
}: {
  minPrice?: number;
  maxPrice?: number;
  onCommit: (next: { minPrice?: number; maxPrice?: number }) => void;
}) {
  const [min, setMin] = useState(minPrice ?? 0);
  const [max, setMax] = useState(maxPrice ?? SHOP_PRICE_MAX);

  useEffect(() => {
    setMin(minPrice ?? 0);
    setMax(maxPrice ?? SHOP_PRICE_MAX);
  }, [minPrice, maxPrice]);

  function commit(nextMin: number, nextMax: number) {
    const lo = Math.min(nextMin, nextMax);
    const hi = Math.max(nextMin, nextMax);
    onCommit({
      minPrice: lo > 0 ? lo : undefined,
      maxPrice: hi < SHOP_PRICE_MAX ? hi : undefined,
    });
  }

  const left = (Math.min(min, max) / SHOP_PRICE_MAX) * 100;
  const right = 100 - (Math.max(min, max) / SHOP_PRICE_MAX) * 100;

  return (
    <div className="space-y-3">
      <div className="relative h-6">
        <div className="absolute top-1/2 right-0 left-0 h-1.5 -translate-y-1/2 rounded-full bg-border" />
        <div
          className="absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-primary"
          style={{ left: `${left}%`, right: `${right}%` }}
        />
        <input
          type="range"
          min={0}
          max={SHOP_PRICE_MAX}
          step={50}
          value={min}
          aria-label="Minimum price"
          className="shop-range-thumb pointer-events-none absolute inset-0 w-full appearance-none bg-transparent"
          onChange={(event) => setMin(Number(event.target.value))}
          onPointerUp={() => commit(min, max)}
          onKeyUp={() => commit(min, max)}
        />
        <input
          type="range"
          min={0}
          max={SHOP_PRICE_MAX}
          step={50}
          value={max}
          aria-label="Maximum price"
          className="shop-range-thumb pointer-events-none absolute inset-0 w-full appearance-none bg-transparent"
          onChange={(event) => setMax(Number(event.target.value))}
          onPointerUp={() => commit(min, max)}
          onKeyUp={() => commit(min, max)}
        />
      </div>
      <div className="flex items-center justify-between text-sm font-medium text-copy">
        <span>{formatPriceBound(Math.min(min, max))}</span>
        <span>{formatPriceBound(Math.max(min, max))}</span>
      </div>
    </div>
  );
}
