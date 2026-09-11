import type { PrismaClient } from '@prisma/client';
import type { IAuthorizationService } from '../../application/ports/i-authorization-service';

export class PrismaAuthorizationService implements IAuthorizationService {
  constructor(private readonly prisma: PrismaClient) {}

  async getRolesForIdentity(identityId: string): Promise<string[]> {
    const rows = await this.prisma.identityRole.findMany({
      where: { identityId },
      include: { role: true },
    });
    return rows.map((row) => row.role.name);
  }

  async getPermissionsForIdentity(identityId: string): Promise<string[]> {
    const rows = await this.prisma.identityRole.findMany({
      where: { identityId },
      include: {
        role: {
          include: {
            permissions: {
              include: { permission: true },
            },
          },
        },
      },
    });

    const permissions = new Set<string>();
    for (const identityRole of rows) {
      for (const rolePermission of identityRole.role.permissions) {
        permissions.add(rolePermission.permission.key);
      }
    }
    return [...permissions];
  }

  async can(identityId: string, permission: string): Promise<boolean> {
    const permissions = await this.getPermissionsForIdentity(identityId);
    return permissions.includes(permission);
  }
}
