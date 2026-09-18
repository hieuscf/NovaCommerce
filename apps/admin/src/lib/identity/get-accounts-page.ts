import { formatRoleDisplayName, formatRoleTimestamp } from '@/lib/identity/get-roles-page';
import type { IdentityAccountDto, IdentityAccountListDto } from '@/lib/identity/types';

export const ACCOUNT_PAGE_SIZE = 10;

const ACCENTS = ['#6366F1', '#8B5CF6', '#EC4899', '#0EA5E9', '#22C55E', '#F59E0B', '#14B8A6', '#64748B'];

const ADMIN_ROLE_NAMES = new Set(['admin', 'administrator', 'super_admin', 'super-admin', 'superadmin']);

export type AccountStatus = 'active' | 'inactive' | 'blocked';

export interface AccountKpiViewModel {
  readonly id: string;
  readonly label: string;
  readonly value: string;
  readonly change: string;
  readonly changeLabel: string;
  readonly tone: 'primary' | 'success' | 'warning' | 'destructive' | 'muted';
}

export interface AccountRowViewModel {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly initials: string;
  readonly accent: string;
  readonly role: string;
  readonly roleLabel: string;
  readonly isAdmin: boolean;
  readonly status: AccountStatus;
  readonly emailVerified: boolean;
  readonly lastLogin: string;
  readonly createdAt: string;
}

export interface AccountsPageViewModel {
  readonly rows: readonly AccountRowViewModel[];
  readonly total: number;
  readonly page: number;
  readonly pageSize: number;
  readonly totalPages: number;
  readonly kpis: readonly AccountKpiViewModel[];
}

export const roleLabel = (role: string): string =>
  role === 'customer' ? 'Customer' : formatRoleDisplayName(role);

export const statusLabel: Record<AccountStatus, string> = {
  active: 'Active',
  inactive: 'Inactive',
  blocked: 'Blocked',
};

export function mapAccountStatus(status: string, disabled: boolean): AccountStatus {
  if (disabled || status === 'LOCKED' || status === 'SUSPENDED') {
    return 'blocked';
  }
  if (status === 'ACTIVE') {
    return 'active';
  }
  return 'inactive';
}

export function primaryRoleName(roles: readonly string[]): string {
  const adminRole = roles.find((role) => ADMIN_ROLE_NAMES.has(role.trim().toLowerCase()));
  if (adminRole) {
    return adminRole;
  }
  return roles[0] ?? 'customer';
}

export function buildAccountsPageViewModel(list: IdentityAccountListDto): AccountsPageViewModel {
  const totalPages = list.total === 0 ? 1 : Math.ceil(list.total / list.pageSize);

  return {
    rows: list.items.map(mapAccountRow),
    total: list.total,
    page: list.page,
    pageSize: list.pageSize,
    totalPages,
    kpis: [
      {
        id: 'total',
        label: 'Total Accounts',
        value: formatCount(list.summary.total),
        change: '—',
        changeLabel: 'in database',
        tone: 'primary',
      },
      {
        id: 'customers',
        label: 'Customers',
        value: formatCount(list.summary.customers),
        change: '—',
        changeLabel: 'non-admin identities',
        tone: 'success',
      },
      {
        id: 'admins',
        label: 'Admins',
        value: formatCount(list.summary.admins),
        change: '—',
        changeLabel: 'admin roles',
        tone: 'muted',
      },
      {
        id: 'blocked',
        label: 'Blocked Accounts',
        value: formatCount(list.summary.blocked),
        change: '—',
        changeLabel: 'disabled or locked',
        tone: 'destructive',
      },
    ],
  };
}

function mapAccountRow(account: IdentityAccountDto): AccountRowViewModel {
  const role = primaryRoleName(account.roles);
  return {
    id: account.id,
    name: account.displayName,
    email: account.email,
    initials: initialsFromName(account.displayName),
    accent: accentFromId(account.id),
    role,
    roleLabel: roleLabel(role),
    isAdmin: ADMIN_ROLE_NAMES.has(role.trim().toLowerCase()),
    status: mapAccountStatus(account.status, account.disabled),
    emailVerified: account.status !== 'PENDING_VERIFICATION',
    lastLogin: formatRoleTimestamp(account.lastLoginAt),
    createdAt: formatRoleTimestamp(account.createdAt),
  };
}

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return (parts[0] ?? '?').slice(0, 2).toUpperCase();
  return `${parts[0]?.[0] ?? ''}${parts[1]?.[0] ?? ''}`.toUpperCase();
}

function accentFromId(id: string): string {
  let hash = 0;
  for (const char of id) {
    hash = (hash * 31 + char.charCodeAt(0)) % 2147483647;
  }
  return ACCENTS[Math.abs(hash) % ACCENTS.length] ?? ACCENTS[0] ?? '#6366F1';
}

function formatCount(value: number): string {
  return value.toLocaleString('en-US');
}
