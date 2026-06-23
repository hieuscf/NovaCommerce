'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

import { ProductCard } from '@/components/store/product-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  getAvailableBrands,
  getProductsByCategory,
  sortProducts,
} from '@/lib/mock/catalog';
import type { Product } from '@/types/product';

const BATCH_SIZE = 4;

type CategoryProductGridProps = {
  categorySlug: string;
};

export function CategoryProductGrid({
  categorySlug,
}: CategoryProductGridProps) {
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [minRating, setMinRating] = useState('0');
  const [sortBy, setSortBy] = useState('popular');
  const [visibleCount, setVisibleCount] = useState(BATCH_SIZE);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const brands = useMemo(
    () => getAvailableBrands(categorySlug),
    [categorySlug],
  );

  const filteredProducts = useMemo(() => {
    const parsedMin = Number.parseInt(minPrice, 10);
    const parsedMax = Number.parseInt(maxPrice, 10);
    const parsedRating = Number.parseFloat(minRating);
    const items = getProductsByCategory(categorySlug, {
      minPrice: Number.isFinite(parsedMin) ? parsedMin : undefined,
      maxPrice: Number.isFinite(parsedMax) ? parsedMax : undefined,
      brands: selectedBrands,
      minRating:
        Number.isFinite(parsedRating) && parsedRating > 0
          ? parsedRating
          : undefined,
    });
    return sortProducts(items, sortBy);
  }, [categorySlug, maxPrice, minPrice, minRating, selectedBrands, sortBy]);

  useEffect(() => {
    setVisibleCount(BATCH_SIZE);
  }, [filteredProducts.length, sortBy]);

  useEffect(() => {
    const target = sentinelRef.current;
    if (!target) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first?.isIntersecting) {
          setVisibleCount((current) =>
            Math.min(current + BATCH_SIZE, filteredProducts.length),
          );
        }
      },
      { rootMargin: '220px' },
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [filteredProducts.length]);

  const visibleProducts: Product[] = filteredProducts.slice(0, visibleCount);
  const hasMore = visibleCount < filteredProducts.length;

  return (
    <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
      <aside className="space-y-4 rounded-xl border p-4">
        <h2 className="text-base font-semibold">Bo loc</h2>
        <div className="space-y-2">
          <p className="text-sm font-medium">Khoang gia (VND)</p>
          <div className="grid gap-2">
            <Input
              onChange={(event) => setMinPrice(event.target.value)}
              placeholder="Tu"
              value={minPrice}
            />
            <Input
              onChange={(event) => setMaxPrice(event.target.value)}
              placeholder="Den"
              value={maxPrice}
            />
          </div>
        </div>
        <div className="space-y-2">
          <p className="text-sm font-medium">Thuong hieu</p>
          <div className="space-y-2">
            {brands.map((brand) => (
              <label className="flex items-center gap-2 text-sm" key={brand}>
                <input
                  checked={selectedBrands.includes(brand)}
                  className="size-4"
                  onChange={(event) => {
                    setSelectedBrands((current) =>
                      event.target.checked
                        ? [...current, brand]
                        : current.filter((item) => item !== brand),
                    );
                  }}
                  type="checkbox"
                />
                <span>{brand}</span>
              </label>
            ))}
          </div>
        </div>
        <div className="space-y-2">
          <p className="text-sm font-medium">Rating toi thieu</p>
          <select
            className="h-9 w-full rounded-lg border bg-background px-2 text-sm"
            onChange={(event) => setMinRating(event.target.value)}
            value={minRating}
          >
            <option value="0">Tat ca</option>
            <option value="3.5">Tu 3.5</option>
            <option value="4">Tu 4.0</option>
            <option value="4.5">Tu 4.5</option>
          </select>
        </div>
      </aside>

      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm text-muted-foreground">
            {filteredProducts.length} san pham phu hop
          </p>
          <select
            className="h-9 rounded-lg border bg-background px-2 text-sm"
            onChange={(event) => setSortBy(event.target.value)}
            value={sortBy}
          >
            <option value="popular">Pho bien</option>
            <option value="rating">Danh gia cao</option>
            <option value="price_asc">Gia tang dan</option>
            <option value="price_desc">Gia giam dan</option>
          </select>
        </div>

        {visibleProducts.length === 0 ? (
          <p className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
            Khong co san pham phu hop bo loc hien tai.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {visibleProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        <div className="flex flex-col items-center gap-3 pt-2">
          {hasMore && (
            <Button
              onClick={() => setVisibleCount((current) => current + BATCH_SIZE)}
              variant="outline"
            >
              Xem them
            </Button>
          )}
          <div className="h-4 w-full" ref={sentinelRef} />
        </div>
      </section>
    </div>
  );
}
