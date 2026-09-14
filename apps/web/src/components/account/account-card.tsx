import { cn } from '@/lib/utils';

export function AccountCard({
  children,
  className,
  padded = true,
}: {
  children: React.ReactNode;
  className?: string;
  padded?: boolean;
}) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-border/70 bg-surface shadow-card-soft',
        padded ? 'p-5' : '',
        className,
      )}
    >
      {children}
    </div>
  );
}
