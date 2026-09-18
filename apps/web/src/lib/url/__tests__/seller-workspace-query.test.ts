import { describe, expect, it } from 'vitest';
import {
  parseSellerOrdersQuery,
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

  it('parses orders section', () => {
    expect(parseSellerWorkspaceSection({ section: 'orders' })).toBe('orders');
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

describe('parseSellerOrdersQuery', () => {
  it('parses defaults', () => {
    expect(parseSellerOrdersQuery({})).toEqual({
      q: undefined,
      tab: 'all',
      status: 'all',
      range: 'all',
      page: 1,
    });
  });

  it('parses filters', () => {
    expect(
      parseSellerOrdersQuery({
        q: ' NC152636 ',
        tab: 'pending_confirm',
        status: 'shipping',
        range: 'last_7_days',
        page: '3',
      }),
    ).toEqual({
      q: 'NC152636',
      tab: 'pending_confirm',
      status: 'shipping',
      range: 'last_7_days',
      page: 3,
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

  it('serializes orders filters', () => {
    const href = sellerWorkspaceHref('orders', {
      q: 'NC152636',
      tab: 'pending_confirm',
      status: 'shipping',
      range: 'last_7_days',
      page: 2,
    });
    expect(href.startsWith('/seller?')).toBe(true);
    const params = new URLSearchParams(href.slice('/seller?'.length));
    expect(params.get('demo')).toBe('registered');
    expect(params.get('section')).toBe('orders');
    expect(params.get('q')).toBe('NC152636');
    expect(params.get('tab')).toBe('pending_confirm');
    expect(params.get('status')).toBe('shipping');
    expect(params.get('range')).toBe('last_7_days');
    expect(params.get('page')).toBe('2');
  });
});
