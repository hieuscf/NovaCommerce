import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Button } from '@novacommerce/ui/components/button';
import ShopError from '@/app/(store)/shop/error';
import { ProductListingErrorState } from '../product-listing-error';

describe('ProductListingErrorState', () => {
  it('renders a recoverable catalog failure, not an empty result', () => {
    render(
      <ProductListingErrorState
        action={
          <Button type="button" onClick={() => undefined}>
            Try again
          </Button>
        }
      />,
    );

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Could not load products' })).toBeInTheDocument();
    expect(screen.getByText(/something went wrong on our side/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Back to home' })).toHaveAttribute('href', '/');
    expect(screen.queryByRole('heading', { name: 'No products found' })).not.toBeInTheDocument();
    expect(screen.queryByText(/ECONNREFUSED|prisma|digest/i)).not.toBeInTheDocument();
  });
});

describe('ShopError', () => {
  it('retries the listing without exposing internal error details', async () => {
    const reset = vi.fn();
    const error = Object.assign(new Error('connect ECONNREFUSED 127.0.0.1:5432'), {
      digest: 'shop-digest',
    });

    render(<ShopError error={error} reset={reset} />);

    expect(screen.getByRole('heading', { name: 'Could not load products' })).toBeInTheDocument();
    expect(screen.queryByText(/ECONNREFUSED|shop-digest/i)).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Try again' }));

    expect(reset).toHaveBeenCalledOnce();
  });
});
