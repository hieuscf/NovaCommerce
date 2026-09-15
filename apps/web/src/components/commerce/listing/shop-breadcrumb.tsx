import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import type { ShopCrumb } from '@/lib/view-models/shop';

export function ShopBreadcrumb({ crumbs }: { crumbs: readonly ShopCrumb[] }) {
  return (
    <nav className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground" aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-1.5">
        {crumbs.map((crumb, index) => (
          <li key={`${crumb.href}-${crumb.label}`} className="flex items-center gap-1.5">
            {index > 0 ? <ChevronRight className="size-3.5" aria-hidden="true" /> : null}
            {crumb.current ? (
              <span className="font-medium text-foreground/80">{crumb.label}</span>
            ) : (
              <Link href={crumb.href} className="hover:text-foreground">
                {crumb.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
