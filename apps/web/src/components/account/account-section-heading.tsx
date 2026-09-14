import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export function AccountSectionHeading({
  icon: Icon,
  title,
  action,
  href,
}: {
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
  action?: string;
  href?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <h2 className="flex items-center gap-2 text-[15px] font-bold text-foreground">
        {Icon ? <Icon className="size-[18px] text-primary" aria-hidden="true" /> : null}
        {title}
      </h2>
      {action && href ? (
        <Link
          href={href}
          className={cn(
            'inline-flex items-center gap-1.5 text-[11.5px] font-medium text-muted-foreground',
            'transition-colors hover:text-foreground',
          )}
        >
          {action}
          <ArrowRight className="size-3.5" aria-hidden="true" />
        </Link>
      ) : null}
    </div>
  );
}
