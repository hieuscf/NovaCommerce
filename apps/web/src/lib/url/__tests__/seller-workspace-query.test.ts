import { describe, expect, it } from 'vitest';
import {
  parseSellerChatQuery,
  parseSellerFinanceQuery,
  parseSellerOrdersQuery,
  parseSellerProductsQuery,
  parseSellerPromotionsQuery,
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

  it('parses finance section', () => {
    expect(parseSellerWorkspaceSection({ section: 'finance' })).toBe('finance');
  });

  it('parses promotions section', () => {
    expect(parseSellerWorkspaceSection({ section: 'promotions' })).toBe('promotions');
  });

  it('parses chat section', () => {
    expect(parseSellerWorkspaceSection({ section: 'chat' })).toBe('chat');
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

describe('parseSellerFinanceQuery', () => {
  it('parses defaults', () => {
    expect(parseSellerFinanceQuery({})).toEqual({
      tab: 'wallet',
      month: '2025-04',
    });
  });

  it('parses filters', () => {
    expect(
      parseSellerFinanceQuery({
        tab: 'withdrawals',
        month: '2025-03',
      }),
    ).toEqual({
      tab: 'withdrawals',
      month: '2025-03',
    });
  });
});

describe('parseSellerPromotionsQuery', () => {
  it('parses defaults', () => {
    expect(parseSellerPromotionsQuery({})).toEqual({
      tab: 'all',
      range: '2025-04',
    });
  });

  it('parses filters', () => {
    expect(
      parseSellerPromotionsQuery({
        tab: 'vouchers',
        range: '2025-03',
      }),
    ).toEqual({
      tab: 'vouchers',
      range: '2025-03',
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

  it('serializes finance filters', () => {
    const href = sellerWorkspaceHref('finance', {
      tab: 'withdrawals',
      month: '2025-03',
    });
    expect(href.startsWith('/seller?')).toBe(true);
    const params = new URLSearchParams(href.slice('/seller?'.length));
    expect(params.get('demo')).toBe('registered');
    expect(params.get('section')).toBe('finance');
    expect(params.get('tab')).toBe('withdrawals');
    expect(params.get('month')).toBe('2025-03');
  });

  it('omits default finance wallet tab', () => {
    const href = sellerWorkspaceHref('finance', { tab: 'wallet', month: '2025-04' });
    const params = new URLSearchParams(href.slice('/seller?'.length));
    expect(params.get('section')).toBe('finance');
    expect(params.get('tab')).toBeNull();
    expect(params.get('month')).toBeNull();
  });

  it('serializes promotions filters', () => {
    const href = sellerWorkspaceHref('promotions', {
      tab: 'vouchers',
      range: '2025-03',
    });
    expect(href.startsWith('/seller?')).toBe(true);
    const params = new URLSearchParams(href.slice('/seller?'.length));
    expect(params.get('demo')).toBe('registered');
    expect(params.get('section')).toBe('promotions');
    expect(params.get('tab')).toBe('vouchers');
    expect(params.get('range')).toBe('2025-03');
  });

  it('serializes chat filters', () => {
    const href = sellerWorkspaceHref('chat', {
      tab: 'reviews',
      inbox: 'unread',
      q: 'Mai',
      thread: 'sc_mai',
    });
    expect(href.startsWith('/seller?')).toBe(true);
    const params = new URLSearchParams(href.slice('/seller?'.length));
    expect(params.get('demo')).toBe('registered');
    expect(params.get('section')).toBe('chat');
    expect(params.get('tab')).toBe('reviews');
    expect(params.get('inbox')).toBe('unread');
    expect(params.get('q')).toBe('Mai');
    expect(params.get('thread')).toBe('sc_mai');
  });
});

describe('parseSellerChatQuery', () => {
  it('parses defaults', () => {
    expect(parseSellerChatQuery({})).toEqual({
      tab: 'messages',
      inbox: 'all',
      q: undefined,
      thread: undefined,
    });
  });

  it('parses filters', () => {
    expect(
      parseSellerChatQuery({
        tab: 'reviews',
        inbox: 'unread',
        q: ' Mai ',
        thread: 'sc_mai',
      }),
    ).toEqual({
      tab: 'reviews',
      inbox: 'unread',
      q: 'Mai',
      thread: 'sc_mai',
    });
  });
});
