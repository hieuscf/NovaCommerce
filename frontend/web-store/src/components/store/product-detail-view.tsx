'use client';

import { Star } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

import { ProductCard } from '@/components/store/product-card';
import { ProductGallery } from '@/components/store/product-gallery';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCartStore } from '@/lib/store/cart-store';
import { formatVnd } from '@/lib/mock/catalog';
import type { Product, ProductReview, ProductVariant } from '@/types/product';

type ProductDetailViewProps = {
  product: Product;
  reviews: ProductReview[];
  similarProducts: Product[];
};

export function ProductDetailView({
  product,
  reviews,
  similarProducts,
}: ProductDetailViewProps) {
  const [size, setSize] = useState(product.variants[0]?.size ?? '');
  const [color, setColor] = useState(product.variants[0]?.color ?? '');
  const [quantity, setQuantity] = useState(1);
  const addItem = useCartStore((state) => state.addItem);

  const selectedVariant = useMemo(() => {
    return (
      product.variants.find(
        (variant) => variant.size === size && variant.color === color,
      ) ?? product.variants[0]
    );
  }, [color, product.variants, size]);

  const sizes = Array.from(
    new Set(product.variants.map((variant) => variant.size)),
  );
  const colors = Array.from(
    new Set(
      product.variants
        .filter((variant) => variant.size === size)
        .map((variant) => variant.color),
    ),
  );

  if (!selectedVariant) {
    return null;
  }

  const inStock = selectedVariant.stock > 0;

  const addToCart = (variant: ProductVariant) => {
    if (!inStock) {
      toast.error('Bien the nay da het hang.');
      return;
    }

    addItem({
      id: `${product.id}-${variant.id}`,
      productId: product.id,
      variantId: variant.id,
      imageUrl: product.images[0],
      name: `${product.name} / ${variant.color} / ${variant.size}`,
      quantity,
      unitPrice: variant.price,
    });
    toast.success('Da them san pham vao gio hang.');
  };

  return (
    <div className="space-y-8">
      <section className="grid gap-6 lg:grid-cols-2">
        <ProductGallery images={product.images} productName={product.name} />
        <div className="space-y-4">
          <h1 className="text-2xl font-semibold">{product.name}</h1>
          <p className="text-sm text-muted-foreground">{product.description}</p>
          <div className="flex items-center gap-3">
            <p className="text-2xl font-bold">
              {formatVnd(selectedVariant.price)}
            </p>
            <div className="flex items-center gap-1 text-amber-500">
              <Star className="size-4 fill-current" />
              <span className="text-sm text-foreground">
                {product.rating.toFixed(1)} ({product.ratingCount} danh gia)
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">Kich thuoc</p>
            <div className="flex flex-wrap gap-2">
              {sizes.map((itemSize) => (
                <Button
                  key={itemSize}
                  onClick={() => {
                    setSize(itemSize);
                    const firstColor = product.variants.find(
                      (variant) => variant.size === itemSize,
                    )?.color;
                    if (firstColor) {
                      setColor(firstColor);
                    }
                  }}
                  variant={size === itemSize ? 'default' : 'outline'}
                >
                  {itemSize}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">Mau sac</p>
            <div className="flex flex-wrap gap-2">
              {colors.map((itemColor) => (
                <Button
                  key={itemColor}
                  onClick={() => setColor(itemColor)}
                  variant={color === itemColor ? 'default' : 'outline'}
                >
                  {itemColor}
                </Button>
              ))}
            </div>
          </div>

          <p className="text-sm">
            Ton kho:{' '}
            <span className={inStock ? 'text-emerald-600' : 'text-red-500'}>
              {inStock ? `${selectedVariant.stock} san pham` : 'Het hang'}
            </span>
          </p>

          <div className="flex items-center gap-2">
            <Input
              className="w-20"
              max={selectedVariant.stock}
              min={1}
              onChange={(event) => {
                const nextQuantity = Number.parseInt(event.target.value, 10);
                if (Number.isFinite(nextQuantity)) {
                  setQuantity(Math.max(1, nextQuantity));
                }
              }}
              type="number"
              value={quantity}
            />
            <Button
              className="h-9 px-4"
              disabled={!inStock}
              onClick={() => addToCart(selectedVariant)}
            >
              Add to cart
            </Button>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Reviews</h2>
        {reviews.length === 0 ? (
          <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
            Chua co danh gia nao cho san pham nay.
          </p>
        ) : (
          <div className="space-y-3">
            {reviews.map((review) => (
              <article className="rounded-lg border p-4" key={review.id}>
                <div className="mb-1 flex items-center justify-between">
                  <p className="font-medium">{review.author}</p>
                  <p className="text-xs text-muted-foreground">
                    {review.createdAt}
                  </p>
                </div>
                <p className="text-sm font-medium">{review.title}</p>
                <p className="text-sm text-muted-foreground">
                  {review.comment}
                </p>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">San pham tuong tu</h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {similarProducts.map((similarProduct) => (
            <ProductCard key={similarProduct.id} product={similarProduct} />
          ))}
        </div>
      </section>
    </div>
  );
}
