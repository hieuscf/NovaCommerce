/**
 * Canonical RBAC catalog for NovaCommerce.
 * Run: node prisma/seed/rbac-catalog.mjs
 * Writes prisma/seed/seed_rbac.sql (idempotent inserts).
 */

import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const CRUD = ['view', 'create', 'edit', 'delete', 'manage'];

const FEATURES = [
  ['identity', 'account'],
  ['identity', 'role'],
  ['identity', 'permission'],
  ['user', 'profile'],
  ['user', 'address'],
  ['user', 'preference'],
  ['catalog', 'product'],
  ['catalog', 'category'],
  ['catalog', 'brand'],
  ['catalog', 'attribute'],
  ['cart', 'cart'],
  ['checkout', 'session'],
  ['order', 'order'],
  ['order', 'refund'],
  ['inventory', 'stock'],
  ['inventory', 'warehouse'],
  ['payment', 'payment'],
  ['shipping', 'shipment'],
  ['shipping', 'tracking'],
  ['promotion', 'promotion'],
  ['promotion', 'coupon'],
  ['notification', 'notification'],
  ['review', 'review'],
  ['cms', 'content'],
  ['search', 'index'],
  ['analytics', 'report'],
  ['seller', 'seller'],
  ['seller', 'verification'],
  ['return', 'return'],
  ['admin', 'settings'],
  ['admin', 'audit'],
];

/** Extra keys required by Gateway guards / Identity handlers. */
const LEGACY_KEYS = [
  'identity:role:assign',
  'identity:role:revoke',
  'identity:permission:assign',
  'admin:read',
  'admin:status:read',
  'catalog:write',
  'inventory:write',
  'promotion:read',
  'payment:write',
  'shipping:read',
  'shipping:write',
  'review:write',
  'review:moderate',
  'return:write',
  'order:order:cancel',
  'inventory:stock:adjust',
];

const ROLE_IDS = {
  admin: '22222222-2222-2222-2222-222222220001',
  super_admin: '22222222-2222-2222-2222-222222220002',
  customer_support: '22222222-2222-2222-2222-222222220003',
  inventory_manager: '22222222-2222-2222-2222-222222220004',
  marketing_manager: '22222222-2222-2222-2222-222222220005',
  analyst: '22222222-2222-2222-2222-222222220006',
};

const ROLES = [
  {
    id: ROLE_IDS.super_admin,
    name: 'super_admin',
    description:
      'Full system access to all features and data. This role is intended for platform administrators.',
  },
  {
    id: ROLE_IDS.admin,
    name: 'admin',
    description: 'Manage platform operations',
  },
  {
    id: ROLE_IDS.customer_support,
    name: 'customer_support',
    description: 'Customer service and support',
  },
  {
    id: ROLE_IDS.inventory_manager,
    name: 'inventory_manager',
    description: 'Inventory and warehouse',
  },
  {
    id: ROLE_IDS.marketing_manager,
    name: 'marketing_manager',
    description: 'Promotions and campaigns',
  },
  {
    id: ROLE_IDS.analyst,
    name: 'analyst',
    description: 'Analytics and reporting',
  },
];

function splitKey(key) {
  const separatorIndex = key.indexOf(':');
  return {
    resource: key.slice(0, separatorIndex),
    action: key.slice(separatorIndex + 1),
  };
}

function permissionId(index) {
  return `11111111-1111-1111-1111-${String(index).padStart(12, '0')}`;
}

function buildPermissions() {
  const seen = new Set();
  const rows = [];

  for (const [resource, feature] of FEATURES) {
    for (const action of CRUD) {
      const key = `${resource}:${feature}:${action}`;
      if (seen.has(key)) continue;
      seen.add(key);
      rows.push({ key, resource, action: `${feature}:${action}` });
    }
  }

  for (const key of LEGACY_KEYS) {
    if (seen.has(key)) continue;
    seen.add(key);
    const parts = splitKey(key);
    rows.push({ key, resource: parts.resource, action: parts.action });
  }

  return rows.map((row, index) => ({
    id: permissionId(index + 1),
    ...row,
  }));
}

function matchesAny(key, patterns) {
  return patterns.some((pattern) => {
    if (pattern.endsWith('*')) {
      return key.startsWith(pattern.slice(0, -1));
    }
    return key === pattern;
  });
}

function keysForRole(roleName, allKeys) {
  if (roleName === 'super_admin') return allKeys;
  if (roleName === 'admin') {
    return allKeys.filter((key) => key !== 'identity:role:delete' && key !== 'identity:account:delete');
  }
  if (roleName === 'customer_support') {
    return allKeys.filter((key) =>
      matchesAny(key, [
        'identity:account:view',
        'identity:account:edit',
        'user:profile:*',
        'user:address:view',
        'user:address:edit',
        'order:order:view',
        'order:order:edit',
        'order:order:cancel',
        'order:refund:*',
        'payment:payment:view',
        'shipping:shipment:view',
        'shipping:tracking:view',
        'review:review:view',
        'review:review:manage',
        'review:moderate',
        'return:*',
        'catalog:product:view',
        'catalog:category:view',
        'notification:notification:view',
        'notification:notification:create',
        'cart:cart:view',
        'admin:read',
      ]),
    );
  }
  if (roleName === 'inventory_manager') {
    return allKeys.filter((key) =>
      matchesAny(key, [
        'inventory:*',
        'catalog:product:view',
        'catalog:product:edit',
        'catalog:category:view',
        'order:order:view',
        'shipping:*',
      ]),
    );
  }
  if (roleName === 'marketing_manager') {
    return allKeys.filter((key) =>
      matchesAny(key, [
        'promotion:*',
        'cms:*',
        'catalog:product:view',
        'catalog:category:view',
        'notification:*',
        'analytics:report:view',
        'review:review:view',
      ]),
    );
  }
  if (roleName === 'analyst') {
    return allKeys.filter((key) =>
      matchesAny(key, [
        'analytics:*',
        'order:order:view',
        'catalog:product:view',
        'catalog:category:view',
        'promotion:promotion:view',
        'promotion:coupon:view',
        'review:review:view',
        'inventory:stock:view',
        'payment:payment:view',
        'shipping:shipment:view',
        'user:profile:view',
        'identity:account:view',
        'search:index:view',
      ]),
    );
  }
  return [];
}

function sqlString(value) {
  return `'${value.replaceAll("'", "''")}'`;
}

function buildSql(permissions) {
  const permissionValues = permissions
    .map(
      (row) =>
        `  (${sqlString(row.id)}, ${sqlString(row.key)}, ${sqlString(row.resource)}, ${sqlString(row.action)})`,
    )
    .join(',\n');

  const roleValues = ROLES.map(
    (role) =>
      `  (${sqlString(role.id)}, ${sqlString(role.name)}, ${sqlString(role.description)})`,
  ).join(',\n');

  const allKeys = permissions.map((row) => row.key);

  const rolePermissionBlocks = ROLES.map((role) => {
    const keys = keysForRole(role.name, allKeys);
    const inList = keys.map(sqlString).join(',\n    ');
    return `
INSERT INTO "role_permissions" ("role_id", "permission_id")
SELECT ${sqlString(role.id)}, p.id
FROM "permissions" p
WHERE p."key" IN (
    ${inList}
)
AND NOT EXISTS (
  SELECT 1
  FROM "role_permissions" rp
  WHERE rp.role_id = ${sqlString(role.id)}
    AND rp.permission_id = p.id
);`;
  }).join('\n');

  return `-- NovaCommerce RBAC catalog
-- Generated by prisma/seed/rbac-catalog.mjs — do not edit by hand.
-- ${permissions.length} permissions, ${ROLES.length} roles.

INSERT INTO "permissions" ("id", "key", "resource", "action", "created_at", "updated_at")
SELECT v.id::uuid, v.key, v.resource, v.action, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM (
  VALUES
${permissionValues}
) AS v(id, key, resource, action)
WHERE NOT EXISTS (SELECT 1 FROM "permissions" p WHERE p."key" = v.key);

INSERT INTO "roles" ("id", "name", "description", "created_at", "updated_at")
SELECT v.id::uuid, v.name, v.description, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM (
  VALUES
${roleValues}
) AS v(id, name, description)
WHERE NOT EXISTS (SELECT 1 FROM "roles" r WHERE r."name" = v.name);

UPDATE "roles" AS r
SET
  "description" = v.description,
  "updated_at" = CURRENT_TIMESTAMP
FROM (
  VALUES
${roleValues}
) AS v(id, name, description)
WHERE r."name" = v.name
  AND (r."description" IS DISTINCT FROM v.description);
${rolePermissionBlocks}
`;
}

const permissions = buildPermissions();
const sql = buildSql(permissions);
const here = dirname(fileURLToPath(import.meta.url));
const outFile = join(here, 'seed_rbac.sql');
writeFileSync(outFile, sql, 'utf8');

console.log(`Wrote ${permissions.length} permissions and ${ROLES.length} roles to ${outFile}`);
