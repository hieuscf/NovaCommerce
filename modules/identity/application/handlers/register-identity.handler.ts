import { randomUUID } from 'node:crypto';
import { Result } from '@novacommerce/building-blocks';
import { IdentityApplicationError } from '../errors/identity-application.error';
import type { RegisterResponseDto } from '../dto/auth-response.dto';
import type { IAuditLogger } from '../ports/i-audit-logger';
import type { IPasswordHasher } from '../ports/i-password-hasher';
import { Identity } from '../../domain/aggregates/identity';
import { Credential } from '../../domain/entities/credential';
import type { IIdentityRepository } from '../../domain/repositories/i-identity-repository';
import { EmailAddress } from '../../domain/value-objects/email-address';
import { IdentityId } from '../../domain/value-objects/identity-id';
import { PlainPassword } from '../../domain/value-objects/plain-password';

export interface RegisterIdentityCommand {
  readonly email: string;
  readonly password: string;
  readonly requestContext?: {
    requestId?: string;
    correlationId?: string;
    ipAddress?: string;
    userAgent?: string;
  };
}

export class RegisterIdentityHandler {
  constructor(
    private readonly identityRepository: IIdentityRepository,
    private readonly passwordHasher: IPasswordHasher,
    private readonly auditLogger: IAuditLogger,
  ) {}

  async execute(command: RegisterIdentityCommand): Promise<Result<RegisterResponseDto, IdentityApplicationError>> {
    try {
      const email = EmailAddress.create(command.email);
      const password = PlainPassword.create(command.password);

      const existing = await this.identityRepository.findByEmail(email);
      if (existing) {
        return Result.fail(new IdentityApplicationError('Identity already exists', 'IDENTITY_ALREADY_EXISTS'));
      }

      const identityId = IdentityId.create(randomUUID());
      const registerResult = Identity.register(identityId, email);
      if (registerResult.isFailure) {
        return Result.fail(new IdentityApplicationError(registerResult.getError().message, registerResult.getError().code));
      }

      const identity = registerResult.getValue();
      const activateResult = identity.activate();
      if (activateResult.isFailure) {
        return Result.fail(new IdentityApplicationError(activateResult.getError().message, activateResult.getError().code));
      }

      const passwordHash = await this.passwordHasher.hash(password.value);
      identity.addCredential(Credential.create(randomUUID(), passwordHash, 'scrypt'));

      await this.identityRepository.save(identity);
      await this.auditLogger.log({
        actorId: identity.id,
        action: 'REGISTER',
        resource: 'identity',
        resourceId: identity.id,
        requestId: command.requestContext?.requestId,
        correlationId: command.requestContext?.correlationId,
        ipAddress: command.requestContext?.ipAddress,
        userAgent: command.requestContext?.userAgent,
      });

      return Result.ok({
        identityId: identity.id,
        email: identity.getEmail().value,
        status: identity.getStatus().value,
      });
    } catch (error) {
      if (error instanceof IdentityApplicationError) {
        return Result.fail(error);
      }
      const message = error instanceof Error ? error.message : 'Registration failed';
      const code = error instanceof Error && 'code' in error ? String((error as { code: string }).code) : 'REGISTRATION_FAILED';
      return Result.fail(new IdentityApplicationError(message, code));
    }
  }
}
