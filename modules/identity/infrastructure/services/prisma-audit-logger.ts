import type { Prisma, PrismaClient } from '@prisma/client';
import type { AuditLogEntry, IAuditLogger } from '../../application/ports/i-audit-logger';

export class PrismaAuditLogger implements IAuditLogger {
  constructor(private readonly prisma: PrismaClient) {}

  async log(entry: AuditLogEntry): Promise<void> {
    await this.prisma.auditLog.create({
      data: {
        actorId: entry.actorId,
        action: entry.action,
        resource: entry.resource,
        resourceId: entry.resourceId,
        requestId: entry.requestId,
        correlationId: entry.correlationId,
        ipAddress: entry.ipAddress,
        userAgent: entry.userAgent,
        metadata: (entry.metadata ?? undefined) as Prisma.InputJsonValue | undefined,
      },
    });
  }
}
