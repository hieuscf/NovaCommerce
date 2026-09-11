import type { PrismaClient } from '@prisma/client';
import { Permission } from '../../domain/entities/permission';
import type { IPermissionRepository } from '../../domain/repositories/i-permission-repository';
import { PermissionKey } from '../../domain/value-objects/permission-key';

export class PrismaPermissionRepository implements IPermissionRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<Permission | null> {
    const row = await this.prisma.permission.findUnique({ where: { id } });
    return row ? this.toDomain(row) : null;
  }

  async findByKey(key: PermissionKey): Promise<Permission | null> {
    const row = await this.prisma.permission.findUnique({ where: { key: key.value } });
    return row ? this.toDomain(row) : null;
  }

  async findAll(): Promise<Permission[]> {
    const rows = await this.prisma.permission.findMany({ orderBy: { key: 'asc' } });
    return rows.map((row) => this.toDomain(row));
  }

  async save(permission: Permission): Promise<void> {
    const key = permission.getKey();
    await this.prisma.permission.upsert({
      where: { id: permission.id },
      create: {
        id: permission.id,
        key: key.value,
        resource: key.resource,
        action: key.action,
      },
      update: {
        key: key.value,
        resource: key.resource,
        action: key.action,
      },
    });
  }

  private toDomain(row: {
    id: string;
    key: string;
    createdAt: Date;
    updatedAt: Date;
  }): Permission {
    return Permission.reconstitute({
      id: row.id,
      key: PermissionKey.create(row.key),
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }
}
