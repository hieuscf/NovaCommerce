import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ProductDetailPage } from '../product-detail-page';
import { QuantitySelector } from '@/components/commerce/quantity-selector';
import { getProductDetailBySlug } from '@/lib/catalog/get-product-detail';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));

vi.mock('@novacommerce/ui/components/toast', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('ProductDetailPage', () => {
  it('renders gallery, purchase info, details, reviews, and related products', () => {
    const detail = getProductDetailBySlug('iphone-17-pro');
    expect(detail).toBeDefined();

    render(<ProductDetailPage detail={detail!} />);

    expect(screen.getByRole('navigation', { name: 'Breadcrumb' })).toHaveTextContent('iPhone 17 Pro');
    expect(screen.getByRole('heading', { level: 1, name: 'iPhone 17 Pro' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Apple' })).toHaveAttribute('href', '/shop?brand=Apple');
    expect(screen.getByText(/experience powerful performance/i)).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: 'Add to Cart' }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole('button', { name: 'Add to Cart' })[0]).toBeEnabled();
    expect(screen.queryByRole('button', { name: 'Buy Now' })).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Product details' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Description' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Reviews/ })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'You Might Also Like' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Key Features' })).toBeInTheDocument();
    expect(screen.getAllByText(/Sold by NovaStore/).length).toBeGreaterThan(0);
    expect(screen.getByRole('link', { name: /4.8 out of 5/i })).toHaveAttribute('href', '#reviews');
  });

  it('changes the main image when a thumbnail is selected', async () => {
    const detail = getProductDetailBySlug('iphone-17-pro');
    render(<ProductDetailPage detail={detail!} />);

    await userEvent.click(screen.getByRole('button', { name: 'Show image 3 of 5' }));

    expect(screen.getByRole('button', { name: 'Show image 3 of 5' })).toHaveAttribute(
      'aria-current',
      'true',
    );
  });

  it('selects a color variant from the swatch group', async () => {
    const detail = getProductDetailBySlug('iphone-17-pro');
    render(<ProductDetailPage detail={detail!} />);

    const black = screen.getByRole('radio', { name: 'Black' });
    await userEvent.click(black);

    expect(black).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByRole('radio', { name: 'Natural Titanium' })).toHaveAttribute(
      'aria-checked',
      'false',
    );
  });

  it('renders the Alloy buy box for the MacBook Air fixture', () => {
    const detail = getProductDetailBySlug('macbook-air-m2');
    expect(detail).toBeDefined();

    render(<ProductDetailPage detail={detail!} />);

    expect(screen.getByRole('heading', { level: 1, name: 'MacBook Air M2 13"' })).toBeInTheDocument();
    expect(screen.getAllByText('Best Seller').length).toBeGreaterThan(0);
    expect(screen.getAllByText('M2 Chip').length).toBeGreaterThan(0);
    expect(screen.getByRole('radio', { name: 'Space Gray' })).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByRole('link', { name: 'Visit Store' })).toHaveAttribute('href', '/shop');
    expect(screen.getByRole('tab', { name: 'Shipping & Returns' })).toBeInTheDocument();
  });

  it('replaces purchase actions when the product is out of stock', () => {
    const detail = getProductDetailBySlug('galaxy-book4-pro');
    render(<ProductDetailPage detail={detail!} />);

    expect(screen.getAllByText('Out of Stock').length).toBeGreaterThan(0);
    expect(screen.getAllByRole('button', { name: 'Notify Me' }).length).toBeGreaterThan(0);
    expect(screen.queryByRole('button', { name: 'Buy Now' })).not.toBeInTheDocument();
    expect(screen.getByText(/leave a notice/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: 'Galaxy Book4 Pro' })).toBeInTheDocument();
  });
});

describe('QuantitySelector', () => {
  it('increments and decrements within bounds', async () => {
    const onChange = vi.fn();
    const { rerender } = render(<QuantitySelector value={1} onChange={onChange} />);

    expect(screen.getByRole('button', { name: 'Decrease quantity' })).toBeDisabled();
    await userEvent.click(screen.getByRole('button', { name: 'Increase quantity' }));
    expect(onChange).toHaveBeenCalledWith(2);

    rerender(<QuantitySelector value={2} onChange={onChange} />);
    await userEvent.click(screen.getByRole('button', { name: 'Decrease quantity' }));
    expect(onChange).toHaveBeenCalledWith(1);
  });
});
