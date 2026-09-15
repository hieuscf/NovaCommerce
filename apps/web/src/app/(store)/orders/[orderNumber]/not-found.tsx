import Link from 'next/link';
import { SearchX } from 'lucide-react';
import { Button } from '@novacommerce/ui/components/button';
import { Container } from '@novacommerce/ui/components/container';
import { NotFoundState } from '@novacommerce/ui/components/not-found-state';

export default function OrderNotFound() {
  return (
    <Container className="flex min-h-[60vh] items-center justify-center py-16">
      <NotFoundState
        icon={<SearchX className="size-6" />}
        title="Order not found"
        description="This order is not in your history, or the link may be out of date."
        action={
          <Button asChild>
            <Link href="/orders">Back to orders</Link>
          </Button>
        }
      />
    </Container>
  );
}
