import { describe, expect, it, vi } from 'vitest';
import { CreateCustomerProfileHandler } from './create-customer-profile.handler';
import type { IUserRepository } from '../../domain/repositories/i-user-repository';

describe('CreateCustomerProfileHandler', () => {
  it('returns conflict when profile already exists', async () => {
    const repository: IUserRepository = {
      findById: vi.fn(),
      findByIdentityId: vi.fn().mockResolvedValue({ id: 'existing' }),
      save: vi.fn(),
    };

    const handler = new CreateCustomerProfileHandler(repository);
    const result = await handler.execute({
      identityId: '22222222-2222-2222-2222-222222222222',
      displayName: 'Jane Doe',
    });

    expect(result.isFailure).toBe(true);
    expect(result.getError().code).toBe('USER_ALREADY_EXISTS');
  });

  it('creates profile for new identity', async () => {
    const repository: IUserRepository = {
      findById: vi.fn(),
      findByIdentityId: vi.fn().mockResolvedValue(null),
      save: vi.fn(),
    };

    const handler = new CreateCustomerProfileHandler(repository);
    const result = await handler.execute({
      identityId: '22222222-2222-2222-2222-222222222222',
      displayName: 'Jane Doe',
    });

    expect(result.isSuccess).toBe(true);
    expect(repository.save).toHaveBeenCalledOnce();
    expect(result.getValue().displayName).toBe('Jane Doe');
  });
});
