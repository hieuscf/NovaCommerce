import type { PrismaClient } from '@prisma/client';
import { RefreshSession } from '../../domain/entities/refresh-session';
import type { IRefreshSessionRepository } from '../../domain/repositories/i-refresh-session-repository';

export class PrismaRefreshSessionRepository implements IRefreshSessionRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<RefreshSession | null> {
    const row = await this.prisma.refreshSession.findUnique({ where: { id } });
    return row ? this.toDomain(row) : null;
  }

  async findByTokenHash(tokenHash: string): Promise<RefreshSession | null> {
    const row = await this.prisma.refreshSession.findFirst({ where: { tokenHash } });
    return row ? this.toDomain(row) : null;
  }

  async findIdentityIdBySessionId(sessionId: string): Promise<string | null> {
    const row = await this.prisma.refreshSession.findUnique({
      where: { id: sessionId },
      select: { identityId: true },
    });
    return row?.identityId ?? null;
  }

  async save(session: RefreshSession, identityId: string): Promise<void> {
    await this.prisma.refreshSession.upsert({
      where: { id: session.id },
      create: {
        id: session.id,
        identityId,
        tokenHash: session.getTokenHash(),
        expiresAt: session.getExpiresAt(),
        revoked: session.isRevoked(),
        revokedAt: session.isRevoked() ? new Date() : undefined,
        replacedBy: session.getReplacedBy(),
      },
      update: {
        tokenHash: session.getTokenHash(),
        expiresAt: session.getExpiresAt(),
        revoked: session.isRevoked(),
        revokedAt: session.isRevoked() ? new Date() : undefined,
        replacedBy: session.getReplacedBy(),
      },
    });
  }

  async revokeAllForIdentity(identityId: string): Promise<void> {
    await this.prisma.refreshSession.updateMany({
      where: { identityId, revoked: false },
      data: { revoked: true, revokedAt: new Date() },
    });
  }

  private toDomain(row: {
    id: string;
    tokenHash: string;
    expiresAt: Date;
    revoked: boolean;
    revokedAt: Date | null;
    replacedBy: string | null;
    userAgent: string | null;
    ipAddress: string | null;
    createdAt: Date;
    updatedAt: Date;
  }): RefreshSession {
    return RefreshSession.reconstitute({
      id: row.id,
      tokenHash: row.tokenHash,
      expiresAt: row.expiresAt,
      revoked: row.revoked,
      revokedAt: row.revokedAt ?? undefined,
      replacedBy: row.replacedBy ?? undefined,
      userAgent: row.userAgent ?? undefined,
      ipAddress: row.ipAddress ?? undefined,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }
}
