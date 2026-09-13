import Link from 'next/link';
import { SearchX } from 'lucide-react';
import { Button } from '@novacommerce/ui/components/button';
import { NotFoundState } from '@novacommerce/ui/components/not-found-state';

export default function AdminNotFoundPage() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-6">
      <NotFoundState
        icon={<SearchX className="size-6" />}
        title="Page not found"
        description="This admin page does not exist yet."
        action={
          <Button asChild>
            <Link href="/">Back to dashboard</Link>
          </Button>
        }
      />
    </div>
  );
}
