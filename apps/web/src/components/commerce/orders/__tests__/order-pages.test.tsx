import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { OrderListPage } from '../order-list-page';
import { OrderDetailPage } from '../order-detail-page';
import { OrderConfirmedPage } from '../order-confirmed-page';
import { OrderErrorState, OrderLoadingState } from '../order-states';
import { Button } from '@novacommerce/ui/components/button';
import { getOrderListPage } from '@/lib/orders/get-order-list';
import { getOrderDetail } from '@/lib/orders/get-order-detail';
import { getOrderConfirmed } from '@/lib/orders/get-order-confirmed';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));

describe('OrderListPage', () => {
  it('renders the Alloy order list from fixtures', () => {
    const query = { status: 'all' as const, page: 1 };
    render(<OrderListPage list={getOrderListPage(query)} query={query} />);

    expect(screen.getByRole('heading', { name: 'My Orders' })).toBeInTheDocument();
    expect(screen.getByText('#NC2026001')).toBeInTheDocument();
    expect(screen.getByText('$1,843.56')).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: 'View Details' })[0]).toHaveAttribute(
      'href',
      '/orders/NC2026001',
    );
    expect(screen.getByRole('link', { name: 'Shipped' })).toHaveAttribute(
      'href',
      '/orders?status=shipped',
    );
    expect(screen.getByRole('navigation', { name: 'Pagination' })).toBeInTheDocument();
  });

  it('shows an empty filter state', () => {
    render(
      <OrderListPage
        list={{
          crumbs: [{ href: '/', label: 'Home' }, { href: '/orders', label: 'My Orders', current: true }],
          status: 'cancelled',
          page: 1,
          totalPages: 1,
          total: 0,
          items: [],
        }}
        query={{ status: 'cancelled', page: 1 }}
      />,
    );

    expect(screen.getByRole('heading', { name: 'No orders match this filter' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'View all orders' })).toHaveAttribute('href', '/orders');
  });
});

describe('OrderDetailPage', () => {
  it('renders timeline, items, shipping, and totals', () => {
    const detail = getOrderDetail('NC2026001');
    expect(detail).toBeDefined();
    render(<OrderDetailPage detail={detail!} />);

    expect(screen.getByRole('heading', { name: 'Order #NC2026001' })).toHaveClass('sr-only');
    expect(screen.queryByText(/Order Details/i)).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Order Status' })).toBeInTheDocument();
    expect(screen.getByText('Your order is on the way')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'MacBook Air M2 13"' })).toHaveAttribute(
      'href',
      '/products/macbook-air-m2',
    );
    expect(screen.getByRole('heading', { name: 'Shipping Information' })).toBeInTheDocument();
    expect(screen.getByText('TRK946285731')).toBeInTheDocument();
    expect(screen.getByText('Alex Johnson')).toBeInTheDocument();
    expect(screen.getByText('Visa **** 4242')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Order Summary' })).toBeInTheDocument();
    expect(screen.getByText('$1,843.56')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Track Order' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Download Invoice' })).toBeInTheDocument();
  });
});

describe('OrderConfirmedPage', () => {
  it('renders the confirmation card and next steps', () => {
    render(<OrderConfirmedPage confirmation={getOrderConfirmed()} />);

    expect(screen.getByRole('heading', { name: 'Order Confirmed!' })).toBeInTheDocument();
    expect(screen.getByText('Order #NC2026001')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'View Order Details' })).toHaveAttribute(
      'href',
      '/orders/NC2026001',
    );
    expect(screen.getByRole('link', { name: 'Continue Shopping' })).toHaveAttribute('href', '/shop');
    expect(screen.getByRole('link', { name: 'View My Orders' })).toHaveAttribute('href', '/orders');
    expect(screen.getByText('Visa **** 4242')).toBeInTheDocument();
    expect(screen.getByText('Free Shipping')).toBeInTheDocument();
  });
});

describe('Order states', () => {
  it('announces loading copy without exposing internals', () => {
    render(<OrderLoadingState />);
    expect(screen.getByRole('status')).toHaveTextContent('Loading your order');
  });

  it('renders a recoverable order failure', () => {
    render(
      <OrderErrorState
        action={
          <Button type="button" onClick={() => undefined}>
            Try again
          </Button>
        }
      />,
    );

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Something went wrong' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Contact Support' })).toHaveAttribute(
      'href',
      '/account?section=help',
    );
    expect(screen.getByRole('link', { name: 'Back to Orders' })).toHaveAttribute('href', '/orders');
  });
});
