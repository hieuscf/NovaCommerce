'use client';

import { useCallback, useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { ProductImageViewModel } from '@/lib/view-models/product-detail';
import { cn } from '@/lib/utils';

const VISIBLE_THUMBS = 4;

export interface ProductGalleryProps {
  images: readonly ProductImageViewModel[];
  activeId?: string;
  onActiveChange?: (imageId: string) => void;
  productName: string;
  badge?: string;
}

export function ProductGallery({
  images,
  activeId,
  onActiveChange,
  productName,
  badge,
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
  const thumbs = images.slice(0, VISIBLE_THUMBS);
  const overflow = Math.max(0, images.length - VISIBLE_THUMBS);

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
        {thumbs.map((image, imageIndex) => {
          const selected = image.id === current.id;
          const lastVisible = imageIndex === thumbs.length - 1 && overflow > 0;
          return (
            <li key={image.id} className="shrink-0">
              <button
                type="button"
                onClick={() => onActiveChange?.(image.id)}
                aria-label={
                  lastVisible
                    ? `Show remaining ${overflow} photos`
                    : `Show image ${imageIndex + 1} of ${images.length}`
                }
                aria-current={selected ? true : undefined}
                className={cn(
                  'relative size-16 overflow-hidden rounded-2xl border bg-surface transition-colors duration-fast focus-ring md:size-[4.35rem]',
                  selected ? 'border-primary ring-1 ring-primary' : 'border-border/80 hover:border-primary/40',
                )}
              >
                <Image src={image.url} alt="" fill sizes="72px" className="object-contain p-1" />
                {lastVisible ? (
                  <span className="absolute inset-0 grid place-items-center bg-ink/45 text-sm font-semibold text-white">
                    +{overflow}
                  </span>
                ) : null}
              </button>
            </li>
          );
        })}
      </ul>

      <div className="order-1 min-w-0 flex-1 lg:order-2">
        <div
          className="relative aspect-square overflow-hidden rounded-[1.75rem] border border-white/80 bg-surface shadow-card-soft"
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
        >
          {badge ? (
            <span className="absolute top-4 left-4 z-10 rounded-pill bg-amber-500 px-3 py-1 text-[11px] font-semibold text-white shadow-sm">
              {badge}
            </span>
          ) : null}
          <Image
            src={current.url}
            alt={current.alt || productName}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 40vw"
            className={cn(
              'object-contain p-8 transition-transform duration-300 ease-out motion-reduce:transition-none md:p-10',
              hover && 'scale-[1.04] motion-reduce:scale-100',
            )}
          />

          {showControls ? (
            <>
              <button
                type="button"
                className="absolute top-1/2 left-3 z-10 grid size-10 -translate-y-1/2 place-items-center rounded-full bg-surface text-foreground shadow-md transition-opacity duration-fast hover:bg-surface focus-ring"
                onClick={() => goTo(index - 1)}
                aria-label="Previous image"
              >
                <ChevronLeft className="size-5" aria-hidden="true" />
              </button>
              <button
                type="button"
                className="absolute top-1/2 right-3 z-10 grid size-10 -translate-y-1/2 place-items-center rounded-full bg-surface text-foreground shadow-md transition-opacity duration-fast hover:bg-surface focus-ring"
                onClick={() => goTo(index + 1)}
                aria-label="Next image"
              >
                <ChevronRight className="size-5" aria-hidden="true" />
              </button>
              <div className="absolute inset-x-0 bottom-4 z-10 flex justify-center gap-1.5">
                {images.map((image) => (
                  <button
                    key={image.id}
                    type="button"
                    onClick={() => onActiveChange?.(image.id)}
                    className="grid size-6 place-items-center focus-ring"
                    aria-label={`Show ${image.alt || productName}`}
                    aria-current={image.id === current.id ? true : undefined}
                  >
                    <span
                      className={cn(
                        'size-1.5 rounded-full transition-colors duration-fast',
                        image.id === current.id ? 'bg-primary' : 'bg-border',
                      )}
                      aria-hidden="true"
                    />
                  </button>
                ))}
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
