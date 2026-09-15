import Link from 'next/link';
import { SearchX } from 'lucide-react';
import { Button } from '@novacommerce/ui/components/button';
import { Container } from '@novacommerce/ui/components/container';
import { NotFoundState } from '@novacommerce/ui/components/not-found-state';

export default function ProductNotFound() {
  return (
    <Container className="flex min-h-[60vh] items-center justify-center py-16">
      <NotFoundState
        icon={<SearchX className="size-6" />}
        title="Product not found"
        description="This product is not in the catalog, or the link may be out of date."
        action={
          <Button asChild>
            <Link href="/shop">Back to shop</Link>
          </Button>
        }
      />
    </Container>
  );
}
