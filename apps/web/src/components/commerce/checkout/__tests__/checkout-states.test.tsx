import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Button } from '@novacommerce/ui/components/button';
import CheckoutError from '@/app/(store)/checkout/error';
import { CheckoutEmptyState } from '../checkout-empty';
import { CheckoutErrorState } from '../checkout-error';

describe('CheckoutEmptyState', () => {
  it('offers a path back to the shop', () => {
    render(<CheckoutEmptyState />);

    expect(screen.getByRole('heading', { name: 'Your checkout is empty' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Continue shopping' })).toHaveAttribute('href', '/shop');
  });
});

describe('CheckoutErrorState', () => {
  it('renders a recoverable checkout failure, not an empty checkout', () => {
    render(
      <CheckoutErrorState
        action={
          <Button type="button" onClick={() => undefined}>
            Try again
          </Button>
        }
      />,
    );

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Could not load checkout' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Back to cart' })).toHaveAttribute('href', '/cart');
    expect(screen.queryByRole('heading', { name: 'Your checkout is empty' })).not.toBeInTheDocument();
  });
});

describe('CheckoutError', () => {
  it('retries without exposing internal error details', async () => {
    const reset = vi.fn();
    const error = Object.assign(new Error('connect ECONNREFUSED 127.0.0.1:6379'), {
      digest: 'checkout-digest',
    });

    render(<CheckoutError error={error} reset={reset} />);

    expect(screen.getByRole('heading', { name: 'Could not load checkout' })).toBeInTheDocument();
    expect(screen.queryByText(/ECONNREFUSED|checkout-digest/i)).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Try again' }));
    expect(reset).toHaveBeenCalledOnce();
  });
});
