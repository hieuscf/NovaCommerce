import { describe, expect, it } from 'vitest';
import { parseAccountQuery } from '../account-query';

describe('parseAccountQuery', () => {
  it('defaults to overview when section is missing', () => {
    expect(parseAccountQuery({})).toEqual({ section: 'overview' });
  });

  it('reads a known account section from the URL', () => {
    expect(parseAccountQuery({ section: 'orders' })).toEqual({ section: 'orders' });
  });

  it('falls back to overview for unknown or empty values', () => {
    expect(parseAccountQuery({ section: 'drop-table' })).toEqual({ section: 'overview' });
    expect(parseAccountQuery({ section: ' ' })).toEqual({ section: 'overview' });
    expect(parseAccountQuery({ section: ['payment', 'orders'] })).toEqual({ section: 'payment' });
  });
});
