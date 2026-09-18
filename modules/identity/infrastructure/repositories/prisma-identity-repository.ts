import { randomUUID } from 'node:crypto';
import type { DomainEvent, IOutboxStore, OutboxMessage } from '@novacommerce/building-blocks';
import type { IdentityStatus, Prisma, PrismaClient } from '@prisma/client';
import { Identity } from '../../domain/aggregates/identity';
import { Credential } from '../../domain/entities/credential';
import { ExternalIdentity } from '../../domain/entities/external-identity';
import { RefreshSession } from '../../domain/entities/refresh-session';
import type {
  IIdentityRepository,
  IdentityAccountSearchQuery,
  IdentityAccountSearchResult,
  IdentityRoleMemberRecord,
} from '../../domain/repositories/i-identity-repository';
import { ADMIN_ROLE_NAMES } from '../../domain/entities/role';
import { AccountStatus } from '../../domain/value-objects/account-status';
import { EmailAddress } from '../../domain/value-objects/email-address';
import { IdentityId } from '../../domain/value-objects/identity-id';

const blockedStatuses: IdentityStatus[] = ['LOCKED', 'SUSPENDED'];

export class PrismaIdentityRepository implements IIdentityRepository {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly outboxStore: IOutboxStore,
  ) {}

  async findById(id: IdentityId): Promise<Identity | null> {
    const row = await this.prisma.identity.findUnique({
      where: { id: id.value },
      include: this.defaultInclude(),
    });
    return row ? this.toDomain(row) : null;
  }

  async findByEmail(email: EmailAddress): Promise<Identity | null> {
    const row = await this.prisma.identity.findUnique({
      where: { email: email.value },
      include: this.defaultInclude(),
    });
    return row ? this.toDomain(row) : null;
  }

  async findMembersByRoleId(roleId: string): Promise<readonly IdentityRoleMemberRecord[]> {
    const rows = await this.prisma.identity.findMany({
      where: { roles: { some: { roleId } } },
      orderBy: { email: 'asc' },
      select: { id: true, email: true, status: true, createdAt: true },
    });

    return rows.map((row) => ({
      id: row.id,
      email: row.email,
      status: row.status,
      createdAt: row.createdAt,
    }));
  }

  async countMembersByRoleIds(roleIds: readonly string[]): Promise<ReadonlyMap<string, number>> {
    if (roleIds.length === 0) {
      return new Map();
    }

    const rows = await this.prisma.identityRole.groupBy({
      by: ['roleId'],
      where: { roleId: { in: [...roleIds] } },
      _count: { identityId: true },
    });

    return new Map(rows.map((row) => [row.roleId, row._count.identityId]));
  }

  async searchAccounts(query: IdentityAccountSearchQuery): Promise<IdentityAccountSearchResult> {
    const where = this.toAccountWhere(query);
    const skip = (query.page - 1) * query.pageSize;
    const adminRoleFilter = {
      roles: { some: { role: { name: { in: [...ADMIN_ROLE_NAMES] } } } },
    };
    const blockedFilter: Prisma.IdentityWhereInput = {
      OR: [{ disabled: true }, { status: { in: blockedStatuses } }],
    };

    const [items, total, summaryTotal, admins, blocked] = await Promise.all([
      this.prisma.identity.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: query.pageSize,
        select: {
          id: true,
          email: true,
          status: true,
          disabled: true,
          createdAt: true,
          roles: { select: { role: { select: { name: true } } } },
          refreshSessions: {
            orderBy: { createdAt: 'desc' },
            take: 1,
            select: { createdAt: true },
          },
        },
      }),
      this.prisma.identity.count({ where }),
      this.prisma.identity.count(),
      this.prisma.identity.count({ where: adminRoleFilter }),
      this.prisma.identity.count({ where: blockedFilter }),
    ]);

    return {
      items: items.map((row) => ({
        id: row.id,
        email: row.email,
        status: row.status,
        disabled: row.disabled,
        roleNames: row.roles.map((item) => item.role.name),
        lastLoginAt: row.refreshSessions[0]?.createdAt ?? null,
        createdAt: row.createdAt,
      })),
      total,
      summary: {
        total: summaryTotal,
        admins,
        customers: Math.max(0, summaryTotal - admins),
        blocked,
      },
    };
  }

  private toAccountWhere(query: IdentityAccountSearchQuery): Prisma.IdentityWhereInput {
    const clauses: Prisma.IdentityWhereInput[] = [];
    const needle = query.q?.trim();
    if (needle) {
      const emailFilter: Prisma.IdentityWhereInput = {
        email: { contains: needle, mode: 'insensitive' },
      };
      clauses.push(isUuid(needle) ? { OR: [emailFilter, { id: needle }] } : emailFilter);
    }

    if (query.role === 'admin') {
      clauses.push({ roles: { some: { role: { name: { in: [...ADMIN_ROLE_NAMES] } } } } });
    } else if (query.role === 'customer') {
      clauses.push({ roles: { none: { role: { name: { in: [...ADMIN_ROLE_NAMES] } } } } });
    }

    if (query.status === 'active') {
      clauses.push({ disabled: false, status: 'ACTIVE' satisfies IdentityStatus });
    } else if (query.status === 'inactive') {
      clauses.push({
        disabled: false,
        status: { in: ['INACTIVE', 'PENDING_VERIFICATION'] as IdentityStatus[] },
      });
    } else if (query.status === 'blocked') {
      clauses.push({
        OR: [{ disabled: true }, { status: { in: blockedStatuses } }],
      });
    }

    if (clauses.length === 0) {
      return {};
    }
    if (clauses.length === 1) {
      return clauses[0] ?? {};
    }
    return { AND: clauses };
  }

  async save(identity: Identity): Promise<void> {
    const events = identity.pullDomainEvents();
    const credential = identity.getCredentials()[0];

    await this.prisma.$transaction(async (tx) => {
      await tx.identity.upsert({
        where: { id: identity.id },
        create: {
          id: identity.id,
          email: identity.getEmail().value,
          status: identity.getStatus().value,
          disabled: identity.isDisabled(),
          credentials: credential
            ? {
                create: {
                  id: credential.id,
                  passwordHash: credential.getPasswordHash(),
                  algorithm: credential.getAlgorithm(),
                },
              }
            : undefined,
          roles: {
            create: identity.getRoleIds().map((roleId) => ({ roleId })),
          },
        },
        update: {
          email: identity.getEmail().value,
          status: identity.getStatus().value,
          disabled: identity.isDisabled(),
        },
      });

      if (credential) {
        await tx.credential.upsert({
          where: { id: credential.id },
          create: {
            id: credential.id,
            identityId: identity.id,
            passwordHash: credential.getPasswordHash(),
            algorithm: credential.getAlgorithm(),
          },
          update: {
            passwordHash: credential.getPasswordHash(),
            algorithm: credential.getAlgorithm(),
          },
        });
      }

      const existingRoles = await tx.identityRole.findMany({
        where: { identityId: identity.id },
      });
      const existingRoleIds = new Set(existingRoles.map((row) => row.roleId));
      const desiredRoleIds = new Set(identity.getRoleIds());

      for (const roleId of desiredRoleIds) {
        if (!existingRoleIds.has(roleId)) {
          await tx.identityRole.create({
            data: { identityId: identity.id, roleId },
          });
        }
      }

      for (const roleId of existingRoleIds) {
        if (!desiredRoleIds.has(roleId)) {
          await tx.identityRole.delete({
            where: {
              identityId_roleId: { identityId: identity.id, roleId },
            },
          });
        }
      }

      for (const session of identity.getRefreshSessions()) {
        await tx.refreshSession.upsert({
          where: { id: session.id },
          create: {
            id: session.id,
            identityId: identity.id,
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

      if (events.length > 0) {
        const outboxStore = new PrismaOutboxStoreInTransaction(tx);
        await outboxStore.save(events.map((event) => this.toOutboxMessage(identity.id, event)));
      }
    });
  }

  private defaultInclude() {
    return {
      credentials: true,
      externalIdentities: true,
      refreshSessions: true,
      roles: true,
    } as const;
  }

  private toDomain(row: {
    id: string;
    email: string;
    status: string;
    disabled: boolean;
    createdAt: Date;
    updatedAt: Date;
    credentials: Array<{
      id: string;
      passwordHash: string;
      algorithm: string;
      createdAt: Date;
      updatedAt: Date;
    }>;
    externalIdentities: Array<{
      id: string;
      providerName: string;
      providerExternalId: string | null;
      createdAt: Date;
      updatedAt: Date;
    }>;
    refreshSessions: Array<{
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
    }>;
    roles: Array<{ roleId: string }>;
  }): Identity {
    return Identity.reconstitute({
      id: row.id,
      email: EmailAddress.create(row.email),
      status: AccountStatus.from(row.status),
      disabled: row.disabled,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      credentials: row.credentials.map((credential) =>
        Credential.reconstitute({
          id: credential.id,
          passwordHash: credential.passwordHash,
          algorithm: credential.algorithm,
          createdAt: credential.createdAt,
          updatedAt: credential.updatedAt,
        }),
      ),
      externalIdentities: row.externalIdentities.map((external) =>
        ExternalIdentity.reconstitute({
          id: external.id,
          providerName: external.providerName,
          providerExternalId: external.providerExternalId ?? undefined,
          createdAt: external.createdAt,
          updatedAt: external.updatedAt,
        }),
      ),
      refreshSessions: row.refreshSessions.map((session) =>
        RefreshSession.reconstitute({
          id: session.id,
          tokenHash: session.tokenHash,
          expiresAt: session.expiresAt,
          revoked: session.revoked,
          revokedAt: session.revokedAt ?? undefined,
          replacedBy: session.replacedBy ?? undefined,
          userAgent: session.userAgent ?? undefined,
          ipAddress: session.ipAddress ?? undefined,
          createdAt: session.createdAt,
          updatedAt: session.updatedAt,
        }),
      ),
      roleIds: row.roles.map((role) => role.roleId),
    });
  }

  private toOutboxMessage(aggregateId: string, event: DomainEvent): OutboxMessage {
    return {
      id: randomUUID(),
      aggregateId,
      aggregateType: 'Identity',
      eventType: event.eventName,
      payload: 'payload' in event ? (event as { payload: unknown }).payload : {},
      occurredOn: event.occurredOn,
    };
  }
}

class PrismaOutboxStoreInTransaction implements IOutboxStore {
  constructor(private readonly tx: Pick<PrismaClient, 'outboxMessage'>) {}

  async save(messages: readonly OutboxMessage[]): Promise<void> {
    if (messages.length === 0) {
      return;
    }

    await this.tx.outboxMessage.createMany({
      data: messages.map((message) => ({
        id: message.id,
        aggregateId: message.aggregateId,
        aggregateType: message.aggregateType,
        eventType: message.eventType,
        payload: message.payload as object,
        createdAt: message.occurredOn,
      })),
    });
  }
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}
