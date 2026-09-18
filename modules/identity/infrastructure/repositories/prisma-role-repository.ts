import type { PrismaClient } from '@prisma/client';
import { Role } from '../../domain/entities/role';
import type { IRoleRepository } from '../../domain/repositories/i-role-repository';
import { PermissionKey } from '../../domain/value-objects/permission-key';

export class PrismaRoleRepository implements IRoleRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<Role | null> {
    const row = await this.prisma.role.findUnique({
      where: { id },
      include: { permissions: { include: { permission: true } } },
    });
    return row ? this.toDomain(row) : null;
  }

  async findByName(name: string): Promise<Role | null> {
    const row = await this.prisma.role.findUnique({
      where: { name: name.trim().toLowerCase() },
      include: { permissions: { include: { permission: true } } },
    });
    return row ? this.toDomain(row) : null;
  }

  async findAll(): Promise<Role[]> {
    const rows = await this.prisma.role.findMany({
      include: { permissions: { include: { permission: true } } },
      orderBy: { name: 'asc' },
    });
    return rows.map((row) => this.toDomain(row));
  }

  async delete(id: string): Promise<void> {
    await this.prisma.role.delete({ where: { id } });
  }

  async save(role: Role): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      await tx.role.upsert({
        where: { id: role.id },
        create: {
          id: role.id,
          name: role.getName(),
          description: role.getDescription(),
        },
        update: {
          name: role.getName(),
          description: role.getDescription(),
          updatedAt: role.updatedAt,
        },
      });

      const permissions = await tx.permission.findMany({
        where: {
          key: { in: role.getPermissionKeys().map((key) => key.value) },
        },
      });

      await tx.rolePermission.deleteMany({ where: { roleId: role.id } });
      if (permissions.length > 0) {
        await tx.rolePermission.createMany({
          data: permissions.map((permission) => ({
            roleId: role.id,
            permissionId: permission.id,
          })),
        });
      }
    });
  }

  private toDomain(row: {
    id: string;
    name: string;
    description: string | null;
    createdAt: Date;
    updatedAt: Date;
    permissions: Array<{ permission: { key: string } }>;
  }): Role {
    return Role.reconstitute({
      id: row.id,
      name: row.name,
      description: row.description ?? undefined,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      permissionKeys: row.permissions.map((item) => PermissionKey.create(item.permission.key)),
    });
  }
}
