'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@novacommerce/ui/components/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@novacommerce/ui/components/table';
import type { ProductDetailViewModel } from '@/lib/view-models/product-detail';
import { cn } from '@/lib/utils';

const SECTIONS = [
  { id: 'description', label: 'Description' },
  { id: 'specifications', label: 'Specifications' },
  { id: 'features', label: 'Features' },
] as const;

function DescriptionBody({ text }: { text: string }) {
  return (
    <div className="max-w-[65ch] space-y-4 text-body-sm leading-relaxed text-copy">
      {text.split('\n\n').map((paragraph) => (
        <p key={paragraph.slice(0, 48)}>{paragraph}</p>
      ))}
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

function FeaturesBody({ detail }: { detail: ProductDetailViewModel }) {
  return (
    <ul className="grid gap-6 sm:grid-cols-2">
      {detail.features.map((feature) => (
        <li key={feature.title} className="border-border/80 border-l-2 pl-4">
          <h3 className="text-sm font-semibold text-foreground">{feature.title}</h3>
          <p className="mt-1.5 text-body-sm leading-relaxed text-muted-foreground">{feature.description}</p>
        </li>
      ))}
    </ul>
  );
}

function AccordionSection({
  id,
  title,
  children,
  defaultOpen = false,
}: {
  id: string;
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
}) {
  return (
    <details
      className="group border-b border-border py-1 first:pt-0"
      name="product-details"
      open={defaultOpen}
    >
      <summary
        id={`${id}-summary`}
        className={cn(
          'flex cursor-pointer list-none items-center justify-between py-4 text-sm font-semibold text-foreground',
          'focus-ring rounded-md [&::-webkit-details-marker]:hidden',
        )}
      >
        {title}
        <span className="text-muted-foreground transition-transform duration-fast group-open:rotate-45" aria-hidden="true">
          +
        </span>
      </summary>
      <div className="pb-5">{children}</div>
    </details>
  );
}

export function ProductDetails({ detail }: { detail: ProductDetailViewModel }) {
  const [desktop, setDesktop] = useState(false);

  useEffect(() => {
    const media = window.matchMedia('(min-width: 1024px)');
    const sync = () => setDesktop(media.matches);
    sync();
    media.addEventListener('change', sync);
    return () => media.removeEventListener('change', sync);
  }, []);

  return (
    <section aria-labelledby="product-details-heading" className="scroll-mt-24">
      <h2 id="product-details-heading" className="text-h3 text-ink">
        Product Details
      </h2>

      {desktop ? (
        <div className="mt-6">
          <Tabs defaultValue="description">
            <TabsList aria-label="Product details">
              {SECTIONS.map((section) => (
                <TabsTrigger key={section.id} value={section.id}>
                  {section.label}
                </TabsTrigger>
              ))}
            </TabsList>
            <TabsContent value="description" className="pt-2">
              <DescriptionBody text={detail.description} />
            </TabsContent>
            <TabsContent value="specifications" className="pt-2">
              <SpecificationsBody detail={detail} />
            </TabsContent>
            <TabsContent value="features" className="pt-2">
              <FeaturesBody detail={detail} />
            </TabsContent>
          </Tabs>
        </div>
      ) : (
        <div className="mt-2">
          <AccordionSection id="description" title="Description" defaultOpen>
            <DescriptionBody text={detail.description} />
          </AccordionSection>
          <AccordionSection id="specifications" title="Specifications">
            <SpecificationsBody detail={detail} />
          </AccordionSection>
          <AccordionSection id="features" title="Features">
            <FeaturesBody detail={detail} />
          </AccordionSection>
        </div>
      )}
    </section>
  );
}
