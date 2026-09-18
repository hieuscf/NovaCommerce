import type { IdentityAccountRecord } from '../../domain/repositories/i-identity-repository';
import type { IdentityAccountListItemDto } from '../dto/identity-account-list.dto';

export function displayNameFromEmail(email: string): string {
  const local = email.split('@')[0] ?? email;
  return local
    .replace(/[._-]+/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
    .trim();
}

export function mapIdentityAccountToListItem(
  record: IdentityAccountRecord,
): IdentityAccountListItemDto {
  return {
    id: record.id,
    email: record.email,
    displayName: displayNameFromEmail(record.email),
    status: record.status,
    disabled: record.disabled,
    roles: [...record.roleNames],
    lastLoginAt: record.lastLoginAt?.toISOString() ?? null,
    createdAt: record.createdAt.toISOString(),
  };
}
