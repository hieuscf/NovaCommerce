import { describe, expect, it } from 'vitest';
import { isDesignSystemRouteEnabled } from '../design-system-route';

describe('isDesignSystemRouteEnabled', () => {
  it('is enabled in development', () => {
    expect(isDesignSystemRouteEnabled({ NODE_ENV: 'development' })).toBe(true);
  });

  it('is enabled in test', () => {
    expect(isDesignSystemRouteEnabled({ NODE_ENV: 'test' })).toBe(true);
  });

  it('is disabled in production by default', () => {
    expect(isDesignSystemRouteEnabled({ NODE_ENV: 'production' })).toBe(false);
  });

  it('can be opted into in production', () => {
    expect(
      isDesignSystemRouteEnabled({
        NODE_ENV: 'production',
        NEXT_PUBLIC_ENABLE_DESIGN_SYSTEM: 'true',
      }),
    ).toBe(true);
  });

  it('ignores values other than the exact opt-in string', () => {
    expect(
      isDesignSystemRouteEnabled({
        NODE_ENV: 'production',
        NEXT_PUBLIC_ENABLE_DESIGN_SYSTEM: '1',
      }),
    ).toBe(false);
  });
});
