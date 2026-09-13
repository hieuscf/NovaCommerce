import { Card, CardContent, CardHeader } from '@novacommerce/ui/components/card';
import { cn } from '@/lib/utils';

export interface AuthCardProps {
  title: string;
  description: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

export function AuthCard({ title, description, children, footer, className }: AuthCardProps) {
  return (
    <Card
      className={cn(
        'overflow-hidden rounded-3xl border-border/80 bg-surface/95 p-0 shadow-lg backdrop-blur-sm',
        className,
      )}
    >
      <CardHeader className="space-y-2 p-7 pb-0">
        <h1 className="text-2xl font-bold tracking-tight text-foreground lg:text-3xl">{title}</h1>
        <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
      </CardHeader>
      <CardContent className="p-7">{children}</CardContent>
      {footer ? (
        <div className="border-t border-border bg-surface-subtle/50 px-7 py-4">{footer}</div>
      ) : null}
    </Card>
  );
}
