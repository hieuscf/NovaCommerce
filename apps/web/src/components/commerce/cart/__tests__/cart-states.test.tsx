import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Button } from '@novacommerce/ui/components/button';
import CartError from '@/app/(store)/cart/error';
import { CartErrorState } from '../cart-error';
import { CartEmptyState } from '../cart-empty';

describe('CartEmptyState', () => {
  it('offers a path back to the shop', () => {
    render(<CartEmptyState />);

    expect(screen.getByRole('heading', { name: 'Your cart is empty' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Continue shopping' })).toHaveAttribute('href', '/shop');
  });
});

describe('CartErrorState', () => {
  it('renders a recoverable cart failure, not an empty cart', () => {
    render(
      <CartErrorState
        action={
          <Button type="button" onClick={() => undefined}>
            Try again
          </Button>
        }
      />,
    );

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Could not load your cart' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Continue shopping' })).toHaveAttribute('href', '/shop');
    expect(screen.queryByRole('heading', { name: 'Your cart is empty' })).not.toBeInTheDocument();
  });
});

describe('CartError', () => {
  it('retries without exposing internal error details', async () => {
    const reset = vi.fn();
    const error = Object.assign(new Error('connect ECONNREFUSED 127.0.0.1:6379'), {
      digest: 'cart-digest',
    });

    render(<CartError error={error} reset={reset} />);

    expect(screen.getByRole('heading', { name: 'Could not load your cart' })).toBeInTheDocument();
    expect(screen.queryByText(/ECONNREFUSED|cart-digest/i)).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Try again' }));
    expect(reset).toHaveBeenCalledOnce();
  });
});
