import type { PrismaClient } from '@prisma/client';
import { PasswordResetToken } from '../../domain/entities/password-reset-token';
import type { IPasswordResetTokenRepository } from '../../domain/repositories/i-password-reset-token-repository';

export class PrismaPasswordResetTokenRepository implements IPasswordResetTokenRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findByTokenHash(tokenHash: string): Promise<PasswordResetToken | null> {
    const row = await this.prisma.passwordResetToken.findFirst({ where: { tokenHash } });
    return row ? this.toDomain(row) : null;
  }

  async findIdentityIdByTokenHash(tokenHash: string): Promise<string | null> {
    const row = await this.prisma.passwordResetToken.findFirst({
      where: { tokenHash },
      select: { identityId: true },
    });
    return row?.identityId ?? null;
  }

  async save(token: PasswordResetToken, identityId: string): Promise<void> {
    await this.prisma.passwordResetToken.upsert({
      where: { id: token.id },
      create: {
        id: token.id,
        identityId,
        tokenHash: token.getTokenHash(),
        expiresAt: token.getExpiresAt(),
        usedAt: token.isUsed() ? new Date() : undefined,
      },
      update: {
        tokenHash: token.getTokenHash(),
        expiresAt: token.getExpiresAt(),
        usedAt: token.isUsed() ? new Date() : undefined,
      },
    });
  }

  async invalidateAllForIdentity(identityId: string): Promise<void> {
    await this.prisma.passwordResetToken.updateMany({
      where: { identityId, usedAt: null },
      data: { usedAt: new Date() },
    });
  }

  private toDomain(row: {
    id: string;
    tokenHash: string;
    expiresAt: Date;
    usedAt: Date | null;
    createdAt: Date;
  }): PasswordResetToken {
    return PasswordResetToken.reconstitute({
      id: row.id,
      tokenHash: row.tokenHash,
      expiresAt: row.expiresAt,
      usedAt: row.usedAt ?? undefined,
      createdAt: row.createdAt,
      updatedAt: row.createdAt,
    });
  }
}
