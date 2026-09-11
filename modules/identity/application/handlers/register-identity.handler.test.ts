import { describe, expect, it, vi } from 'vitest';
import { RegisterIdentityHandler } from './register-identity.handler';
import type { IAuditLogger } from '../ports/i-audit-logger';
import type { IPasswordHasher } from '../ports/i-password-hasher';
import type { IIdentityRepository } from '../../domain/repositories/i-identity-repository';

describe('RegisterIdentityHandler', () => {
  it('returns conflict when email already exists', async () => {
    const repository: IIdentityRepository = {
      findById: vi.fn(),
      findByEmail: vi.fn().mockResolvedValue({ id: 'existing' }),
      save: vi.fn(),
    };
    const passwordHasher: IPasswordHasher = {
      hash: vi.fn(),
      verify: vi.fn(),
    };
    const auditLogger: IAuditLogger = { log: vi.fn() };

    const handler = new RegisterIdentityHandler(repository, passwordHasher, auditLogger);
    const result = await handler.execute({ email: 'user@example.com', password: 'password123' });

    expect(result.isFailure).toBe(true);
    expect(result.getError().code).toBe('IDENTITY_ALREADY_EXISTS');
  });
});
