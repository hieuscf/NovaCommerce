import { describe, expect, it } from 'vitest';
import { DeliveryRetryPolicy } from './delivery-retry-policy';

describe('DeliveryRetryPolicy', () => {
  it('uses exponential backoff delays', () => {
    const policy = new DeliveryRetryPolicy({ maxAttempts: 3, baseDelayMs: 100 });
    expect(policy.getMaxAttempts()).toBe(3);
    expect(policy.getDelayMs(1)).toBe(100);
    expect(policy.getDelayMs(2)).toBe(200);
    expect(policy.getDelayMs(3)).toBe(400);
  });
});
