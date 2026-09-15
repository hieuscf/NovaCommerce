import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ProductListing } from '../product-listing';
import { catalogProducts, shopFacets } from '@/lib/mock-data/catalog';
import { parseShopQuery } from '@/lib/url/shop-query';
import { getShopHeader } from '@/lib/view-models/shop';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));

describe('ProductListing', () => {
  it('renders the listing chrome, filters, and product cards', () => {
    const query = parseShopQuery({ category: 'smartphones' });
    const products = catalogProducts.filter((product) => product.categorySlug === 'smartphones');

    render(
      <ProductListing
        query={query}
        header={getShopHeader(query)}
        facets={shopFacets}
        products={products}
        total={products.length}
        page={1}
        totalPages={1}
      />,
    );

    expect(screen.getByRole('heading', { name: 'Smartphones' })).toBeInTheDocument();
    expect(screen.queryByText(/discover the latest smartphones/i)).not.toBeInTheDocument();
    expect(screen.getByText('7 results')).toBeInTheDocument();
    expect(screen.getAllByRole('heading', { name: 'Filters' }).length).toBeGreaterThan(0);
    expect(screen.getByRole('heading', { name: 'iPhone 17 Pro' })).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: 'iPhone 17 Pro' })[0]).toHaveAttribute(
      'href',
      '/products/iphone-17-pro',
    );
    expect(screen.getAllByText('Apple').length).toBeGreaterThan(0);
    expect(screen.getByRole('navigation', { name: 'Breadcrumb' })).toHaveTextContent('Electronics');
  });

  it('renders pagination for multi-page results', () => {
    const query = parseShopQuery({});
    const products = catalogProducts.slice(0, 12);

    render(
      <ProductListing
        query={query}
        header={getShopHeader(query)}
        facets={shopFacets}
        products={products}
        total={catalogProducts.length}
        page={1}
        totalPages={3}
      />,
    );

    expect(screen.getByRole('navigation', { name: 'Pagination' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Next' })).toHaveAttribute('href', '/shop?page=2');
    expect(screen.getByRole('heading', { name: 'All products' })).toBeInTheDocument();
    expect(screen.getByText('1–12 of 26')).toBeInTheDocument();
  });

  it('shows the empty state when nothing matches', () => {
    const query = parseShopQuery({ brand: 'Nike', category: 'smartphones' });

    render(
      <ProductListing
        query={query}
        header={getShopHeader(query)}
        facets={shopFacets}
        products={[]}
        total={0}
        page={1}
        totalPages={0}
      />,
    );

    expect(screen.getByRole('heading', { name: 'No products found' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Clear Filters' })).toHaveAttribute('href', '/shop');
    expect(screen.queryByRole('heading', { name: 'iPhone 17 Pro' })).not.toBeInTheDocument();
  });
});
