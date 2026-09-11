import { describe, expect, it, vi } from 'vitest';
import { UpdateCustomerProfileHandler } from './update-customer-profile.handler';
import { User } from '../../domain/aggregates/user';
import { UserProfile } from '../../domain/entities/user-profile';
import type { IUserRepository } from '../../domain/repositories/i-user-repository';
import { DisplayName } from '../../domain/value-objects/display-name';
import { UserId } from '../../domain/value-objects/user-id';

describe('UpdateCustomerProfileHandler', () => {
  it('returns not found when user does not exist', async () => {
    const repository: IUserRepository = {
      findById: vi.fn(),
      findByIdentityId: vi.fn().mockResolvedValue(null),
      save: vi.fn(),
    };

    const handler = new UpdateCustomerProfileHandler(repository);
    const result = await handler.execute({
      identityId: '22222222-2222-2222-2222-222222222222',
      displayName: 'Updated Name',
    });

    expect(result.isFailure).toBe(true);
    expect(result.getError().code).toBe('USER_NOT_FOUND');
  });

  it('updates profile for existing user', async () => {
    const user = User.create(
      UserId.create('11111111-1111-1111-1111-111111111111'),
      '22222222-2222-2222-2222-222222222222',
      UserProfile.create('profile-1', DisplayName.create('Jane Doe')),
    ).getValue();
    user.pullDomainEvents();

    const repository: IUserRepository = {
      findById: vi.fn(),
      findByIdentityId: vi.fn().mockResolvedValue(user),
      save: vi.fn(),
    };

    const handler = new UpdateCustomerProfileHandler(repository);
    const result = await handler.execute({
      identityId: '22222222-2222-2222-2222-222222222222',
      displayName: 'John Doe',
    });

    expect(result.isSuccess).toBe(true);
    expect(repository.save).toHaveBeenCalledOnce();
    expect(result.getValue().displayName).toBe('John Doe');
  });
});
