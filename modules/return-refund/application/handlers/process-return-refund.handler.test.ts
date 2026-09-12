import { Result } from '@novacommerce/building-blocks';
import { describe, expect, it, vi } from 'vitest';
import { ReturnRequest } from '../../domain/aggregates/return-request';
import { Money } from '../../domain/value-objects/money';
import { ProcessReturnRefundHandler } from './process-return-refund.handler';

describe('ProcessReturnRefundHandler', () => {
  it('processes refund for approved return request', async () => {
    const returnRequest = ReturnRequest.create(
      '11111111-1111-1111-1111-111111111111',
      '22222222-2222-2222-2222-222222222222',
      '33333333-3333-3333-3333-333333333333',
      '44444444-4444-4444-4444-444444444444',
      Money.create(100, 'USD'),
    ).getValue();
    returnRequest.approve();
    returnRequest.pullDomainEvents();

    const handler = new ProcessReturnRefundHandler(
      {
        findById: vi.fn().mockResolvedValue(returnRequest),
        findActiveByOrderId: vi.fn(),
        save: vi.fn(),
      },
      {
        refund: vi.fn().mockResolvedValue(
          Result.ok({
            paymentId: '44444444-4444-4444-4444-444444444444',
            amount: 100,
            currency: 'USD',
          }),
        ),
      },
    );

    const result = await handler.execute({ returnRequestId: returnRequest.id });
    expect(result.isSuccess).toBe(true);
    expect(result.getValue().status).toBe('refunded');
  });
});
