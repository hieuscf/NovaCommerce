'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Battery, Cpu, Monitor } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@novacommerce/ui/components/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@novacommerce/ui/components/table';
import { ProductReviews } from '@/components/commerce/product-detail/product-reviews';
import { formatExactReviewCount } from '@/lib/view-models/product';
import type { ProductDetailViewModel } from '@/lib/view-models/product-detail';
import { cn } from '@/lib/utils';

const TAB_TRIGGER =
  'h-11 rounded-none border-b-2 border-transparent bg-transparent px-0 text-sm font-medium text-muted-foreground shadow-none data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none';

function DescriptionBody({ detail }: { detail: ProductDetailViewModel }) {
  const highlights = detail.features.slice(0, 3);
  const icons = [Cpu, Monitor, Battery];

  return (
    <div className="grid items-center gap-8 md:grid-cols-[minmax(0,1fr)_minmax(220px,0.9fr)]">
      <div>
        <h3 className="text-xl font-bold tracking-tight text-ink">{detail.descriptionTitle}</h3>
        <div className="mt-3 space-y-4 text-body-sm leading-relaxed text-copy">
          {detail.description.split('\n\n').map((paragraph) => (
            <p key={paragraph.slice(0, 48)}>{paragraph}</p>
          ))}
        </div>
        {highlights.length > 0 ? (
          <ul className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {highlights.map((feature, index) => {
              const Icon = icons[index] ?? Cpu;
              return (
                <li key={feature.title} className="flex items-start gap-2.5">
                  <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary-tint text-primary">
                    <Icon className="size-4" strokeWidth={1.75} aria-hidden="true" />
                  </span>
                  <span>
                    <span className="block text-sm font-semibold text-ink">{feature.title}</span>
                    <span className="block text-[11px] text-muted-foreground">{feature.description}</span>
                  </span>
                </li>
              );
            })}
          </ul>
        ) : null}
      </div>
      {detail.lifestyleImage ? (
        <div className="relative aspect-[4/3] overflow-hidden rounded-[1.5rem] bg-surface-subtle">
          <Image
            src={detail.lifestyleImage.url}
            alt={detail.lifestyleImage.alt}
            fill
            sizes="(max-width: 768px) 100vw, 32vw"
            className="object-cover"
          />
        </div>
      ) : null}
    </div>
  );
}

function SpecificationsBody({ detail }: { detail: ProductDetailViewModel }) {
  return (
    <>
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[38%]">Specification</TableHead>
              <TableHead>Value</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {detail.specifications.map((spec) => (
              <TableRow key={spec.name}>
                <TableCell className="font-medium text-muted-foreground">{spec.name}</TableCell>
                <TableCell>{spec.value}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <dl className="divide-y divide-border rounded-2xl border border-border md:hidden">
        {detail.specifications.map((spec) => (
          <div key={spec.name} className="grid gap-1 px-4 py-3">
            <dt className="text-caption font-medium tracking-wide text-muted-foreground uppercase">
              {spec.name}
            </dt>
            <dd className="text-sm text-foreground">{spec.value}</dd>
          </div>
        ))}
      </dl>
    </>
  );
}

function ShippingBody({ detail }: { detail: ProductDetailViewModel }) {
  return (
    <div className="max-w-[65ch] space-y-4 text-body-sm leading-relaxed text-copy">
      <h3 className="text-lg font-semibold text-ink">{detail.shippingReturns.heading}</h3>
      {detail.shippingReturns.paragraphs.map((paragraph) => (
        <p key={paragraph.slice(0, 48)}>{paragraph}</p>
      ))}
    </div>
  );
}

export function ProductDetails({ detail }: { detail: ProductDetailViewModel }) {
  const [tab, setTab] = useState('description');

  useEffect(() => {
    const sync = () => {
      if (window.location.hash === '#reviews') {
        setTab('reviews');
      }
    };
    sync();
    window.addEventListener('hashchange', sync);
    return () => window.removeEventListener('hashchange', sync);
  }, []);

  const reviewLabel = `Reviews (${formatExactReviewCount(detail.product.reviewCount)})`;

  return (
    <section
      aria-labelledby="product-details-heading"
      className="rounded-[1.75rem] border border-border/70 bg-surface p-5 shadow-card-soft md:p-7"
    >
      <h2 id="product-details-heading" className="sr-only">
        Product details
      </h2>
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList
          aria-label="Product details"
          className="h-auto w-full justify-start gap-6 overflow-x-auto rounded-none border-b border-border bg-transparent p-0"
        >
          <TabsTrigger value="description" className={TAB_TRIGGER}>
            Description
          </TabsTrigger>
          <TabsTrigger value="specifications" className={TAB_TRIGGER}>
            Specifications
          </TabsTrigger>
          <TabsTrigger value="reviews" className={TAB_TRIGGER}>
            {reviewLabel}
          </TabsTrigger>
          <TabsTrigger value="shipping" className={TAB_TRIGGER}>
            Shipping & Returns
          </TabsTrigger>
        </TabsList>
        <TabsContent value="description" className="pt-6">
          <DescriptionBody detail={detail} />
        </TabsContent>
        <TabsContent value="specifications" className="pt-6">
          <SpecificationsBody detail={detail} />
        </TabsContent>
        <TabsContent value="reviews" id="reviews" className={cn('scroll-mt-24 pt-6')}>
          <ProductReviews detail={detail} />
        </TabsContent>
        <TabsContent value="shipping" className="pt-6">
          <ShippingBody detail={detail} />
        </TabsContent>
      </Tabs>
    </section>
  );
}
