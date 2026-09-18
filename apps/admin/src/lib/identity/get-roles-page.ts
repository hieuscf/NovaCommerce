import type { PermissionDto, RoleDto } from '@/lib/identity/types';
import type { RolesGrantFilter, RolesQuery } from '@/lib/url/roles-query';

export type RoleTone = 'violet' | 'blue' | 'teal' | 'orange' | 'pink' | 'cyan' | 'slate';
export type RoleIconName = 'user' | 'shield' | 'headphones' | 'box' | 'megaphone' | 'chart';
export type PermissionActionColumn = 'view' | 'create' | 'edit' | 'delete' | 'manage';

export interface RoleRowViewModel {
  readonly id: string;
  readonly name: string;
  readonly displayName: string;
  readonly description: string;
  readonly permissionCount: number;
  readonly permissionKeys: readonly string[];
  readonly isSystem: boolean;
  readonly tone: RoleTone;
  readonly icon: RoleIconName;
  readonly status: 'active';
  readonly memberCount: number;
  readonly createdAt: string | null;
  readonly updatedAt: string | null;
}

export interface PermissionCellViewModel {
  readonly column: PermissionActionColumn;
  readonly keys: readonly string[];
  readonly key: string | null;
  readonly granted: boolean;
  readonly interactive: boolean;
  readonly busyKey: string;
}

export interface PermissionFeatureViewModel {
  readonly id: string;
  readonly label: string;
  readonly cells: readonly PermissionCellViewModel[];
}

export interface PermissionModuleGroupViewModel {
  readonly id: string;
  readonly label: string;
  readonly tone: RoleTone;
  readonly features: readonly PermissionFeatureViewModel[];
}

export interface RoleDetailViewModel {
  readonly role: RoleRowViewModel;
  readonly modules: readonly PermissionModuleGroupViewModel[];
  readonly grantedCount: number;
  readonly totalCount: number;
  readonly percent: number;
}

export interface RolesPageViewModel {
  readonly roles: readonly RoleRowViewModel[];
  readonly filteredRoles: readonly RoleRowViewModel[];
  readonly selectedRole: RoleRowViewModel | null;
  readonly detail: RoleDetailViewModel | null;
  readonly totalPermissions: number;
}

export const ACTION_COLUMNS: readonly PermissionActionColumn[] = [
  'view',
  'create',
  'edit',
  'delete',
  'manage',
];

const SYSTEM_ROLE_NAMES = new Set([
  'admin',
  'administrator',
  'super_admin',
  'super-admin',
  'superadmin',
]);

const MODULE_META: Record<string, { label: string; tone: RoleTone }> = {
  identity: { label: 'Account Management', tone: 'violet' },
  user: { label: 'Customer Profiles', tone: 'violet' },
  admin: { label: 'Settings', tone: 'slate' },
  catalog: { label: 'Product Management', tone: 'blue' },
  product: { label: 'Product Management', tone: 'blue' },
  cart: { label: 'Cart', tone: 'blue' },
  checkout: { label: 'Checkout', tone: 'teal' },
  order: { label: 'Order Management', tone: 'teal' },
  inventory: { label: 'Inventory Management', tone: 'orange' },
  payment: { label: 'Payments', tone: 'teal' },
  shipping: { label: 'Shipping', tone: 'orange' },
  promotion: { label: 'Promotions', tone: 'orange' },
  notification: { label: 'Notifications', tone: 'pink' },
  review: { label: 'Reviews', tone: 'pink' },
  cms: { label: 'Content', tone: 'pink' },
  content: { label: 'Content', tone: 'pink' },
  search: { label: 'Search', tone: 'cyan' },
  analytics: { label: 'Analytics', tone: 'cyan' },
  seller: { label: 'Seller Management', tone: 'blue' },
  return: { label: 'Returns & Refunds', tone: 'orange' },
};

const TONE_CYCLE: RoleTone[] = ['violet', 'blue', 'teal', 'orange', 'pink', 'cyan', 'slate'];

export function isSystemRoleName(name: string): boolean {
  return SYSTEM_ROLE_NAMES.has(name.trim().toLowerCase());
}

export function formatRoleDisplayName(name: string): string {
  return name
    .trim()
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function formatPermissionLabel(key: string): string {
  const parts = key.split(':').filter(Boolean);
  if (parts.length === 0) return key;

  const resourceParts = parts.slice(0, -1);
  const actionPart = parts[parts.length - 1] ?? key;
  const resource =
    resourceParts.length > 1
      ? resourceParts.slice(1).join(' ')
      : (resourceParts[0] ?? '');

  const action = actionPart.replace(/[_-]+/g, ' ').toLowerCase();
  const resourceLabel = resource.replace(/[_-]+/g, ' ').toLowerCase();

  const phrase = resourceLabel ? `${action} ${resourceLabel}` : action;
  return phrase.replace(/\b\w/g, (char) => char.toUpperCase());
}

export function mapActionToColumn(action: string): PermissionActionColumn {
  const normalized = action.toLowerCase();
  if (
    normalized === 'read' ||
    normalized.endsWith(':read') ||
    normalized.includes('view') ||
    normalized.includes('list') ||
    normalized.includes('get')
  ) {
    return 'view';
  }
  if (normalized.includes('create') || normalized.includes('add') || normalized.includes('write')) {
    return 'create';
  }
  if (normalized.includes('update') || normalized.includes('edit') || normalized.includes('patch')) {
    return 'edit';
  }
  if (
    normalized.includes('delete') ||
    normalized.includes('remove') ||
    normalized.includes('revoke')
  ) {
    return 'delete';
  }
  return 'manage';
}

function visualForRole(
  name: string,
  index: number,
): { tone: RoleTone; icon: RoleIconName; fallbackDescription: string } {
  const normalized = name.trim().toLowerCase().replace(/[-\s]+/g, '_');

  if (normalized.includes('super')) {
    return { tone: 'violet', icon: 'user', fallbackDescription: 'Full access to all features' };
  }
  if (normalized === 'admin' || normalized === 'administrator') {
    return { tone: 'blue', icon: 'shield', fallbackDescription: 'Manage platform operations' };
  }
  if (normalized.includes('support') || normalized.includes('customer')) {
    return {
      tone: 'pink',
      icon: 'headphones',
      fallbackDescription: 'Customer service and support',
    };
  }
  if (normalized.includes('inventory') || normalized.includes('warehouse')) {
    return { tone: 'teal', icon: 'box', fallbackDescription: 'Inventory and warehouse' };
  }
  if (normalized.includes('market') || normalized.includes('promo')) {
    return { tone: 'orange', icon: 'megaphone', fallbackDescription: 'Promotions and campaigns' };
  }
  if (normalized.includes('analyst') || normalized.includes('report')) {
    return { tone: 'cyan', icon: 'chart', fallbackDescription: 'Analytics and reporting' };
  }

  return {
    tone: TONE_CYCLE[index % TONE_CYCLE.length] ?? 'slate',
    icon: 'shield',
    fallbackDescription: 'Custom access role',
  };
}

function featureGroupFromPermissionKey(key: string): { module: string; feature: string; id: string } {
  const parts = key.split(':').filter(Boolean);
  const module = (parts[0] ?? 'other').toLowerCase();
  if (parts.length >= 3) {
    const feature = (parts[1] ?? module).toLowerCase();
    return { module, feature, id: `${module}:${feature}` };
  }

  return { module, feature: module, id: module };
}

function featureLabel(feature: string): string {
  return formatRoleDisplayName(feature);
}

export function applyPermissionCellToggle(
  permissionKeys: readonly string[],
  cell: PermissionCellViewModel,
): string[] {
  const next = new Set(permissionKeys);
  if (cell.granted) {
    for (const key of cell.keys) {
      next.delete(key);
    }
  } else {
    for (const key of cell.keys) {
      next.add(key);
    }
  }
  return [...next];
}

function actionFromPermissionKey(key: string): string {
  const parts = key.split(':');
  return parts.slice(1).join(':') || key;
}

function moduleMeta(resource: string): { label: string; tone: RoleTone } {
  return (
    MODULE_META[resource] ?? {
      label: `${formatRoleDisplayName(resource)} Management`,
      tone: 'slate',
    }
  );
}

export function buildRoleRows(roles: readonly RoleDto[]): RoleRowViewModel[] {
  return roles
    .map((role, index) => {
      const visual = visualForRole(role.name, index);
      const description = role.description?.trim();

      return {
        id: role.id,
        name: role.name,
        displayName: formatRoleDisplayName(role.name),
        description: description && description.length > 0 ? description : visual.fallbackDescription,
        permissionCount: role.permissions.length,
        permissionKeys: role.permissions,
        isSystem: isSystemRoleName(role.name),
        tone: visual.tone,
        icon: visual.icon,
        status: 'active' as const,
        memberCount: role.memberCount ?? 0,
        createdAt: role.createdAt ?? null,
        updatedAt: role.updatedAt ?? null,
      };
    })
    .sort((a, b) => roleRank(a.name) - roleRank(b.name) || a.displayName.localeCompare(b.displayName));
}

function roleRank(name: string): number {
  const normalized = name.trim().toLowerCase().replace(/[-\s]+/g, '_');
  if (normalized.includes('super')) return 0;
  if (normalized === 'admin' || normalized === 'administrator') return 1;
  if (normalized.includes('support')) return 2;
  if (normalized.includes('inventory')) return 3;
  if (normalized.includes('market')) return 4;
  if (normalized.includes('analyst')) return 5;
  return 10;
}

export function filterRoleRows(
  roles: readonly RoleRowViewModel[],
  query: RolesQuery,
): RoleRowViewModel[] {
  const needle = query.q?.trim().toLowerCase();

  return roles.filter((role) => {
    if (query.type === 'system' && !role.isSystem) return false;
    if (query.type === 'custom' && role.isSystem) return false;
    if (!needle) return true;

    const haystack = [role.name, role.displayName, role.description, ...role.permissionKeys]
      .join(' ')
      .toLowerCase();

    return haystack.includes(needle);
  });
}

export function buildPermissionMatrix(
  role: RoleRowViewModel,
  permissions: readonly PermissionDto[],
  grant: RolesGrantFilter,
  permissionQuery?: string,
): RoleDetailViewModel {
  const grantedKeys = new Set(role.permissionKeys);
  const needle = permissionQuery?.trim().toLowerCase();

  const features = new Map<
    string,
    { module: string; label: string; keysByColumn: Map<PermissionActionColumn, string[]> }
  >();

  for (const permission of permissions) {
    const group = featureGroupFromPermissionKey(permission.key);
    const column = mapActionToColumn(actionFromPermissionKey(permission.key));
    let feature = features.get(group.id);
    if (!feature) {
      feature = {
        module: group.module,
        label: featureLabel(group.feature),
        keysByColumn: new Map(ACTION_COLUMNS.map((action) => [action, [] as string[]])),
      };
      features.set(group.id, feature);
    }
    feature.keysByColumn.get(column)?.push(permission.key);
  }

  const byModule = new Map<string, PermissionFeatureViewModel[]>();

  for (const [featureId, feature] of features) {
    const cells: PermissionCellViewModel[] = ACTION_COLUMNS.map((column) => {
      const keys = feature.keysByColumn.get(column) ?? [];
      const granted = keys.some((key) => grantedKeys.has(key));
      return {
        column,
        keys,
        key: keys[0] ?? null,
        granted,
        interactive: keys.length > 0,
        busyKey: `${featureId}:${column}`,
      };
    });

    if (grant === 'granted' && !cells.some((cell) => cell.granted)) continue;
    if (grant === 'not_granted' && !cells.some((cell) => cell.interactive && !cell.granted)) {
      continue;
    }

    if (needle) {
      const haystack = [feature.label, featureId, ...cells.flatMap((cell) => cell.keys)]
        .join(' ')
        .toLowerCase();
      if (!haystack.includes(needle)) continue;
    }

    const moduleFeatures = byModule.get(feature.module) ?? [];
    moduleFeatures.push({ id: featureId, label: feature.label, cells });
    byModule.set(feature.module, moduleFeatures);
  }

  const modules: PermissionModuleGroupViewModel[] = [...byModule.entries()]
    .filter(([, groupedFeatures]) => groupedFeatures.length > 0)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([resource, groupedFeatures]) => {
      const meta = moduleMeta(resource);
      return {
        id: resource,
        label: meta.label,
        tone: meta.tone,
        features: groupedFeatures.sort((a, b) => a.label.localeCompare(b.label)),
      };
    });

  const totalCount = permissions.length;
  const grantedCount = role.permissionCount;
  const percent = totalCount === 0 ? 0 : Math.round((grantedCount / totalCount) * 100);

  return {
    role,
    modules,
    grantedCount,
    totalCount,
    percent,
  };
}

export function buildRolesPageViewModel(
  roles: readonly RoleDto[],
  permissions: readonly PermissionDto[],
  query: RolesQuery,
): RolesPageViewModel {
  const roleRows = buildRoleRows(roles);
  const filteredRoles = filterRoleRows(roleRows, query);
  const selectedRole =
    filteredRoles.find((role) => role.id === query.roleId) ?? filteredRoles[0] ?? null;
  const detail = selectedRole
    ? buildPermissionMatrix(selectedRole, permissions, query.grant, query.pq)
    : null;

  return {
    roles: roleRows,
    filteredRoles,
    selectedRole,
    detail,
    totalPermissions: permissions.length,
  };
}

export function formatRoleTimestamp(iso: string | null | undefined): string {
  if (!iso) return '—';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}
