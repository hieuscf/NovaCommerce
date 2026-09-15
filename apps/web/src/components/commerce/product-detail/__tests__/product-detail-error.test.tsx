import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Button } from '@novacommerce/ui/components/button';
import ProductError from '@/app/(store)/products/[slug]/error';
import { ProductDetailErrorState } from '../product-detail-error';

describe('ProductDetailErrorState', () => {
  it('renders a recoverable PDP failure, not a missing product', () => {
    render(
      <ProductDetailErrorState
        action={
          <Button type="button" onClick={() => undefined}>
            Try again
          </Button>
        }
      />,
    );

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Could not load this product' })).toBeInTheDocument();
    expect(screen.getByText(/please try again/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Back to shop' })).toHaveAttribute('href', '/shop');
    expect(screen.queryByRole('heading', { name: 'Product not found' })).not.toBeInTheDocument();
    expect(screen.queryByText(/ECONNREFUSED|prisma|digest/i)).not.toBeInTheDocument();
  });
});

describe('ProductError', () => {
  it('retries the product page without exposing internal error details', async () => {
    const reset = vi.fn();
    const error = Object.assign(new Error('PrismaClientKnownRequestError'), {
      digest: 'pdp-digest',
    });

    render(<ProductError error={error} reset={reset} />);

    expect(screen.getByRole('heading', { name: 'Could not load this product' })).toBeInTheDocument();
    expect(screen.queryByText(/PrismaClientKnownRequestError|pdp-digest/i)).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Try again' }));

    expect(reset).toHaveBeenCalledOnce();
  });
});
