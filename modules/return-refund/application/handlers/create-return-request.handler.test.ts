import { Result } from '@novacommerce/building-blocks';
import { describe, expect, it, vi } from 'vitest';
import { CreateReturnRequestHandler } from './create-return-request.handler';

describe('CreateReturnRequestHandler', () => {
  it('creates return request when order validation succeeds', async () => {
    const handler = new CreateReturnRequestHandler(
      {
        validate: vi.fn().mockResolvedValue(
          Result.ok({
            orderId: '22222222-2222-2222-2222-222222222222',
            customerId: '33333333-3333-3333-3333-333333333333',
            paymentId: '44444444-4444-4444-4444-444444444444',
            refundAmount: 100,
            currency: 'USD',
          }),
        ),
      },
      {
        findActiveByOrderId: vi.fn().mockResolvedValue(null),
        save: vi.fn(),
        findById: vi.fn(),
      },
    );

    const result = await handler.execute({
      orderId: '22222222-2222-2222-2222-222222222222',
      customerId: '33333333-3333-3333-3333-333333333333',
    });

    expect(result.isSuccess).toBe(true);
    expect(result.getValue().status).toBe('requested');
    expect(result.getValue().refundAmount).toBe(100);
  });
});
