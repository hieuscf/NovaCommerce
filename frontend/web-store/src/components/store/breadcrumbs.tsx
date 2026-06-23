import { ChevronRight } from 'lucide-react';

import { Link } from '@/i18n/navigation';

type BreadcrumbItem = {
  label: string;
  href?: string;
};

type BreadcrumbsProps = {
  items: BreadcrumbItem[];
};

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className="mb-4">
      <ol className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li
              className="flex items-center gap-2"
              key={`${item.label}-${index}`}
            >
              {item.href && !isLast ? (
                <Link className="hover:text-foreground" href={item.href}>
                  {item.label}
                </Link>
              ) : (
                <span
                  aria-current={isLast ? 'page' : undefined}
                  className="text-foreground"
                >
                  {item.label}
                </span>
              )}
              {!isLast && <ChevronRight className="size-3" />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
