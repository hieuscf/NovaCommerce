'use client';

import { useState } from 'react';
import { Check, Star, ThumbsUp } from 'lucide-react';
import { Button } from '@novacommerce/ui/components/button';
import { formatReviewCount } from '@/lib/view-models/product';
import {
  ratingBarPercent,
  type ProductDetailViewModel,
  type ProductReviewViewModel,
} from '@/lib/view-models/product-detail';
import { cn } from '@/lib/utils';

function Distribution({ detail }: { detail: ProductDetailViewModel }) {
  const total = Object.values(detail.ratingDistribution).reduce((sum, count) => sum + count, 0);
  const stars = [5, 4, 3, 2, 1] as const;

  return (
    <div className="grid gap-8 rounded-2xl border border-border/80 bg-surface p-6 shadow-card-soft md:grid-cols-[200px_minmax(0,1fr)] md:items-center">
      <div className="text-center md:text-left">
        <p className="text-4xl font-extrabold tracking-tight text-ink">{detail.product.rating.toFixed(1)}</p>
        <div className="mt-2 flex justify-center gap-0.5 text-warning md:justify-start" aria-hidden="true">
          {Array.from({ length: 5 }, (_, index) => (
            <Star
              key={index}
              className={cn(
                'size-4',
                index < Math.round(detail.product.rating) ? 'fill-current' : 'fill-transparent opacity-35',
              )}
            />
          ))}
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          {formatReviewCount(detail.product.reviewCount)} reviews
        </p>
      </div>
      <ul className="space-y-2" aria-label="Rating distribution">
        {stars.map((star) => {
          const count = detail.ratingDistribution[star];
          const percent = ratingBarPercent(count, total);
          return (
            <li key={star} className="flex items-center gap-3 text-sm">
              <span className="w-8 shrink-0 text-muted-foreground">{star} ★</span>
              <span className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                <span
                  className="block h-full rounded-full bg-warning"
                  style={{ width: `${percent}%` }}
                />
              </span>
              <span className="w-10 text-right text-caption text-muted-foreground">{count}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function ReviewCard({ review }: { review: ProductReviewViewModel }) {
  const [helpful, setHelpful] = useState(review.helpfulCount ?? 0);
  const [voted, setVoted] = useState(false);

  return (
    <article className="border-b border-border py-6 last:border-b-0">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-semibold text-foreground">{review.author}</p>
        {review.verified ? (
          <span className="inline-flex items-center gap-1 text-caption font-medium text-success-strong">
            <Check className="size-3.5" aria-hidden="true" />
            Verified
          </span>
        ) : null}
      </div>
      <div className="mt-2 flex items-center gap-1 text-warning" aria-label={`${review.rating} out of 5 stars`}>
        {Array.from({ length: 5 }, (_, index) => (
          <Star
            key={index}
            className={cn(
              'size-3.5',
              index < review.rating ? 'fill-current' : 'fill-transparent opacity-35',
            )}
            aria-hidden="true"
          />
        ))}
      </div>
      <h3 className="mt-3 text-sm font-semibold text-foreground">{review.title}</h3>
      <p className="mt-2 max-w-[65ch] text-body-sm leading-relaxed text-copy">{review.content}</p>
      <div className="mt-4 flex flex-wrap items-center gap-3 text-caption text-muted-foreground">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-9 px-2 text-caption"
          aria-pressed={voted}
          onClick={() => {
            if (voted) {
              return;
            }
            setVoted(true);
            setHelpful((count) => count + 1);
          }}
        >
          <ThumbsUp className="size-3.5" aria-hidden="true" />
          Helpful{helpful > 0 ? ` (${helpful})` : ''}
        </Button>
        <span aria-hidden="true">·</span>
        <time>{review.dateLabel}</time>
      </div>
    </article>
  );
}

export function ProductReviews({ detail }: { detail: ProductDetailViewModel }) {
  return (
    <section id="reviews" aria-labelledby="reviews-heading" className="scroll-mt-24">
      <h2 id="reviews-heading" className="text-h3 text-ink">
        Customer Reviews
      </h2>
      <div className="mt-6 space-y-8">
        <Distribution detail={detail} />
        {detail.reviews.length === 0 ? (
          <p className="text-body-sm text-muted-foreground">Reviews will appear here once shoppers share them.</p>
        ) : (
          <div>
            {detail.reviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
