import { describe, expect, it } from 'vitest';
import {
  parseSellerProductsQuery,
  parseSellerWorkspaceSection,
  sellerWorkspaceHref,
} from '../seller-workspace-query';

describe('parseSellerWorkspaceSection', () => {
  it('defaults to home', () => {
    expect(parseSellerWorkspaceSection({})).toBe('home');
  });

  it('parses products section', () => {
    expect(parseSellerWorkspaceSection({ section: 'products' })).toBe('products');
  });
});

describe('parseSellerProductsQuery', () => {
  it('parses defaults', () => {
    expect(parseSellerProductsQuery({})).toEqual({
      q: undefined,
      tab: 'all',
      category: 'all',
      page: 1,
    });
  });

  it('parses filters', () => {
    expect(
      parseSellerProductsQuery({
        q: ' bluetooth ',
        tab: 'pending',
        category: 'Điện tử',
        page: '2',
      }),
    ).toEqual({
      q: 'bluetooth',
      tab: 'pending',
      category: 'Điện tử',
      page: 2,
    });
  });
});

describe('sellerWorkspaceHref', () => {
  it('builds home href', () => {
    expect(sellerWorkspaceHref('home')).toBe('/seller?demo=registered');
  });

  it('serializes products filters', () => {
    const href = sellerWorkspaceHref('products', {
      q: 'bluetooth',
      tab: 'active',
      category: 'Điện tử',
      page: 2,
    });
    expect(href.startsWith('/seller?')).toBe(true);
    const params = new URLSearchParams(href.slice('/seller?'.length));
    expect(params.get('demo')).toBe('registered');
    expect(params.get('section')).toBe('products');
    expect(params.get('q')).toBe('bluetooth');
    expect(params.get('tab')).toBe('active');
    expect(params.get('category')).toBe('Điện tử');
    expect(params.get('page')).toBe('2');
  });
});
