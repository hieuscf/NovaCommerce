import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ProductListing } from '../product-listing';
import { catalogProducts } from '@/lib/mock-data/catalog';
import { buildShopFacets, getShopPageModel } from '@/lib/catalog/get-shop-page';
import { parseShopQuery } from '@/lib/url/shop-query';
import { getShopHeader } from '@/lib/view-models/shop';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));

describe('ProductListing', () => {
  it('renders the listing chrome, filters, and product cards', () => {
    const query = parseShopQuery({}, { collection: 'smartphones' });
    const products = catalogProducts.filter((product) => product.categorySlug === 'smartphones');
    const header = getShopHeader(query);
    const facets = buildShopFacets(catalogProducts, query);

    render(
      <ProductListing
        query={query}
        header={header}
        facets={facets}
        products={products}
        total={products.length}
        page={1}
        totalPages={1}
      />,
    );

    expect(screen.getByRole('heading', { name: 'Smartphones' })).toHaveClass('sr-only');
    expect(screen.queryByText(/discover the latest smartphones/i)).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Latest Tech, Better Life' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Explore Deals' })).not.toBeInTheDocument();
    expect(screen.getByText('7 products')).toBeInTheDocument();
    expect(screen.getAllByRole('heading', { name: 'Filter' }).length).toBeGreaterThan(0);
    expect(screen.getByRole('heading', { name: 'iPhone 17 Pro' })).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: 'iPhone 17 Pro' })[0]).toHaveAttribute(
      'href',
      '/products/iphone-17-pro',
    );
    expect(screen.getAllByText(/Apple/).length).toBeGreaterThan(0);
    expect(screen.getByRole('navigation', { name: 'Breadcrumb' })).toHaveTextContent('Electronics');
    expect(screen.getByRole('link', { name: 'Electronics' })).toHaveAttribute('href', '/shop/electronics');
    expect(screen.getByText('Free Shipping')).toBeInTheDocument();
  });

  it('renders pagination for multi-page results', () => {
    const query = parseShopQuery({});
    const products = catalogProducts.slice(0, 12);
    const header = getShopHeader(query);
    const facets = buildShopFacets(catalogProducts, query);

    render(
      <ProductListing
        query={query}
        header={header}
        facets={facets}
        products={products}
        total={catalogProducts.length}
        page={1}
        totalPages={3}
      />,
    );

    expect(screen.getByRole('navigation', { name: 'Pagination' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Next' })).toHaveAttribute('href', '/shop?page=2');
    expect(screen.getByRole('heading', { name: 'Shop' })).toBeInTheDocument();
    expect(screen.getByText('26 products')).toBeInTheDocument();
  });

  it('shows the empty state when nothing matches', () => {
    const query = parseShopQuery({ brand: 'Nike' }, { collection: 'smartphones' });
    const header = getShopHeader(query);
    const facets = buildShopFacets(catalogProducts, query);

    render(
      <ProductListing
        query={query}
        header={header}
        facets={facets}
        products={[]}
        total={0}
        page={1}
        totalPages={0}
      />,
    );

    expect(screen.getByRole('heading', { name: 'No products found' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Clear all' })).toHaveAttribute('href', '/shop/smartphones');
    expect(screen.queryByRole('heading', { name: 'iPhone 17 Pro' })).not.toBeInTheDocument();
  });
});

describe('getShopPageModel', () => {
  it('loads a collection route without treating the path as a missing page', () => {
    const model = getShopPageModel({}, 'electronics');
    expect(model).not.toBeNull();
    expect(model?.query.collection).toBe('electronics');
    expect(model?.header.title).toBe('Electronics');
    expect(model?.total).toBeGreaterThan(0);
  });

  it('returns null for an unknown collection slug', () => {
    expect(getShopPageModel({}, 'not-a-collection')).toBeNull();
  });
});
