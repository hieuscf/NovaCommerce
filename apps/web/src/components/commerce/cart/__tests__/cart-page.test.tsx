import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { CartPage } from '../cart-page';
import { getCartPage } from '@/lib/cart/get-cart-page';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));

const toastSuccess = vi.fn();

vi.mock('@novacommerce/ui/components/toast', () => ({
  toast: {
    success: (...args: unknown[]) => toastSuccess(...args),
    error: vi.fn(),
  },
}));

describe('CartPage', () => {
  it('renders lines, summary totals, and recommendations from the fixture cart', () => {
    render(<CartPage cart={getCartPage()} />);

    expect(screen.getByRole('heading', { level: 1, name: 'Shopping Cart' })).toBeInTheDocument();
    expect(screen.queryByText(/review your items and manage your cart/i)).not.toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Breadcrumb' })).toHaveTextContent('Cart');
    expect(screen.getByRole('heading', { name: '3 items in your cart' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'MacBook Air M2 13"' })).toHaveAttribute(
      'href',
      '/products/macbook-air-m2',
    );
    expect(screen.getByText('Space Gray · 256GB · 8GB')).toBeInTheDocument();
    expect(screen.getAllByText('In Stock').length).toBe(3);
    expect(screen.getByRole('heading', { name: 'Order Summary' })).toBeInTheDocument();
    expect(screen.getByText(/subtotal \(3 items\)/i)).toBeInTheDocument();
    expect(screen.getByText('$1,986.00')).toBeInTheDocument();
    expect(screen.getByText('$158.88')).toBeInTheDocument();
    expect(screen.getByText('$2,144.88')).toBeInTheDocument();
    expect(screen.getByText('Free')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Proceed to Checkout' })).toBeEnabled();
    expect(screen.getByRole('link', { name: 'Continue Shopping' })).toHaveAttribute('href', '/shop');
    expect(screen.getByRole('heading', { name: 'You might also like' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Nike Air Force 1' })).toBeInTheDocument();
  });

  it('updates line total and order summary when quantity changes', async () => {
    render(<CartPage cart={getCartPage()} />);

    const macbook = screen.getByRole('heading', { name: 'MacBook Air M2 13"' }).closest('li');
    expect(macbook).toBeTruthy();

    await userEvent.click(within(macbook!).getByRole('button', { name: 'Increase quantity' }));

    expect(screen.getByText('$1,998.00')).toBeInTheDocument();
    expect(screen.getByText('$2,985.00')).toBeInTheDocument();
    expect(screen.getByText(/subtotal \(3 items\)/i)).toBeInTheDocument();
  });

  it('removes a line and shows the empty state when the last item is gone', async () => {
    render(<CartPage cart={getCartPage()} />);

    await userEvent.click(screen.getByRole('button', { name: 'Remove MacBook Air M2 13" from cart' }));
    await userEvent.click(screen.getByRole('button', { name: 'Remove Sony WH-1000XM5 from cart' }));
    await userEvent.click(screen.getByRole('button', { name: 'Remove Apple Watch Series 10 from cart' }));

    expect(screen.getByRole('heading', { name: 'Your cart is empty' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Order Summary' })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Continue shopping' })).toHaveAttribute('href', '/shop');
  });

  it('adds a recommendation into the cart', async () => {
    render(<CartPage cart={getCartPage()} />);

    const recs = screen.getByRole('heading', { name: 'You might also like' }).closest('section');
    expect(recs).toBeTruthy();

    await userEvent.click(within(recs!).getAllByRole('button', { name: 'Add to Cart' })[0]);

    expect(screen.getByRole('heading', { name: '4 items in your cart' })).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: 'Nike Air Force 1' }).length).toBeGreaterThan(1);
  });
});
