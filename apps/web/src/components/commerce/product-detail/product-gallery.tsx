'use client';

import { useCallback, useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { ProductImageViewModel } from '@/lib/view-models/product-detail';
import { cn } from '@/lib/utils';

export interface ProductGalleryProps {
  images: readonly ProductImageViewModel[];
  activeId?: string;
  onActiveChange?: (imageId: string) => void;
  productName: string;
}

export function ProductGallery({
  images,
  activeId,
  onActiveChange,
  productName,
}: ProductGalleryProps) {
  const selectedIndex = images.findIndex((image) => image.id === activeId);
  const index = selectedIndex >= 0 ? selectedIndex : 0;
  const current = images[index] ?? images[0];
  const [hover, setHover] = useState(false);

  const goTo = useCallback(
    (nextIndex: number) => {
      if (images.length === 0) {
        return;
      }
      const wrapped = (nextIndex + images.length) % images.length;
      const next = images[wrapped];
      if (next) {
        onActiveChange?.(next.id);
      }
    },
    [images, onActiveChange],
  );

  if (!current) {
    return null;
  }

  const showControls = images.length > 1;

  return (
    <div
      className="flex flex-col gap-4 lg:flex-row lg:items-start lg:gap-4"
      onKeyDown={(event) => {
        if (event.key === 'ArrowRight') {
          event.preventDefault();
          goTo(index + 1);
        }
        if (event.key === 'ArrowLeft') {
          event.preventDefault();
          goTo(index - 1);
        }
      }}
    >
      <ul
        className="order-2 hidden gap-2.5 overflow-x-auto pb-1 md:flex lg:order-1 lg:flex-col lg:overflow-visible lg:pb-0"
        aria-label="Product photos"
      >
        {images.map((image, imageIndex) => {
          const selected = image.id === current.id;
          return (
            <li key={image.id} className="shrink-0">
              <button
                type="button"
                onClick={() => onActiveChange?.(image.id)}
                aria-label={`Show image ${imageIndex + 1} of ${images.length}`}
                aria-current={selected ? true : undefined}
                className={cn(
                  'relative size-16 overflow-hidden rounded-xl border bg-surface-subtle transition-colors duration-fast focus-ring md:size-[4.5rem]',
                  selected ? 'border-primary ring-1 ring-primary' : 'border-border hover:border-primary/40',
                )}
              >
                <Image
                  src={image.url}
                  alt=""
                  fill
                  sizes="72px"
                  className="object-contain p-1"
                />
              </button>
            </li>
          );
        })}
      </ul>

      <div className="order-1 min-w-0 flex-1 lg:order-2">
        <div
          className="relative aspect-square overflow-hidden rounded-2xl border border-border/70 bg-surface-subtle"
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
        >
          <Image
            src={current.url}
            alt={current.alt || productName}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 55vw"
            className={cn(
              'object-contain p-6 transition-transform duration-300 ease-out motion-reduce:transition-none',
              hover && 'scale-[1.04] motion-reduce:scale-100',
            )}
          />

          {showControls ? (
            <>
              <button
                type="button"
                className="absolute top-1/2 left-3 z-10 grid size-11 -translate-y-1/2 place-items-center rounded-full border border-border/80 bg-surface/90 text-foreground shadow-sm backdrop-blur-sm transition-opacity duration-fast hover:bg-surface focus-ring"
                onClick={() => goTo(index - 1)}
                aria-label="Previous image"
              >
                <ChevronLeft className="size-5" aria-hidden="true" />
              </button>
              <button
                type="button"
                className="absolute top-1/2 right-3 z-10 grid size-11 -translate-y-1/2 place-items-center rounded-full border border-border/80 bg-surface/90 text-foreground shadow-sm backdrop-blur-sm transition-opacity duration-fast hover:bg-surface focus-ring"
                onClick={() => goTo(index + 1)}
                aria-label="Next image"
              >
                <ChevronRight className="size-5" aria-hidden="true" />
              </button>
            </>
          ) : null}
        </div>

        {showControls ? (
          <div className="mt-3 flex justify-center gap-2 md:hidden">
            {images.map((image) => (
              <button
                key={image.id}
                type="button"
                onClick={() => onActiveChange?.(image.id)}
                className="grid size-11 place-items-center focus-ring"
                aria-label={`Show ${image.alt}`}
                aria-current={image.id === current.id ? true : undefined}
              >
                <span
                  className={cn(
                    'size-2.5 rounded-full transition-colors duration-fast',
                    image.id === current.id ? 'bg-foreground' : 'bg-border',
                  )}
                  aria-hidden="true"
                />
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
