import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import type { ShopCrumb } from '@/lib/view-models/shop';

export function ShopBreadcrumb({
  crumbs,
  separator = 'slash',
}: {
  crumbs: readonly ShopCrumb[];
  separator?: 'slash' | 'chevron';
}) {
  return (
    <nav className="text-sm text-muted-foreground" aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
        {crumbs.map((crumb, index) => (
          <li key={`${crumb.href}-${crumb.label}`} className="flex items-center gap-2">
            {index > 0 ? (
              separator === 'chevron' ? (
                <ChevronRight className="size-3.5 shrink-0 opacity-60" aria-hidden="true" />
              ) : (
                <span aria-hidden="true">/</span>
              )
            ) : null}
            {crumb.current ? (
              <span className="font-medium text-foreground">{crumb.label}</span>
            ) : (
              <Link href={crumb.href} className="transition-colors hover:text-foreground">
                {crumb.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
